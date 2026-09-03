---
name: comapeo-storybook-capture-gate
description: Run the Storybook capture workflow for a PR, review every captured frame with vision, fix what it finds, and post the verdict plus an artifact download link on the PR. Use when a PR adds or changes Storybook stories, the capture manifest, or the capture scripts.
---

# Storybook capture gate for a PR

Advisory, not blocking. The capture workflow is `workflow_dispatch` only and
is deliberately not a required check — a run costs 30-50 minutes and the
emulator infrastructure produces spurious failures. This skill is the
procedure that makes it a real gate anyway: an agent runs it, *looks* at the
frames, fixes what it finds, and leaves the evidence on the PR.

For the capture pipeline's own mechanics and CI gotchas, see the
`comapeo-storybook-capture` skill
([`../comapeo-storybook-capture/SKILL.md`](../comapeo-storybook-capture/SKILL.md)).
This skill is the PR-cycle wrapper around it.

**Remote safety:** never write to `digidem/*` (fetch/diff/read only — see
AGENTS.md). Workflow dispatches and PR comments go to the repo that **owns
the branch**: implementation PR branches live in
`transistir/comapeo-mobile-1`, so that is where captures dispatch. Only a
branch that actually exists in `transistir/coiab-app` (a sync branch) can be
captured there — `gh workflow run --ref` resolves the ref in the `-R` repo.
Note: coiab-app's own dispatch currently fails at Setup EAS until the
`EXPO_TOKEN` secret is set there.

## Why the vision pass is the point

The capture pipeline's readiness checks assert that a story's marker and its
route/testID marker are present in the Android view hierarchy. They cannot
see occlusion. A run has reported 38/38 frames captured successfully while a
stuck soft keyboard covered ~45% of 20 consecutive frames. Every automated
gate was green. The only thing that caught it was opening the images.

Treat a green run as "the pipeline worked", never as "the screenshots are
good".

## 1. Preflight — seconds, before burning a run

```sh
npm run lint

# Every manifest story id must resolve against the source story index.
node -e "const {buildIndex}=require('@storybook/react-native/node');const fs=require('fs');const ids=fs.readFileSync('.rnstorybook/capture-manifest.tsv','utf8').trim().split('\n').map(l=>l.split('\t')[1]);buildIndex({configPath:'.rnstorybook'}).then(i=>{const m=ids.filter(id=>!(id in i.entries));console.log(m.length?'MISSING: '+m.join(', '):'ALL '+ids.length+' IDS PRESENT')})"

# Manifest shape: 5 tab-separated columns, unique ids, valid targets/delays.
awk -F'\t' 'NF!=5{print "BAD COLS line "NR; bad=1} {if(seen[$2]++){print "DUP id "$2; bad=1} if($3 !~ /^(route:[A-Za-z][A-Za-z0-9]*|testID:[A-Za-z0-9][A-Za-z0-9._:-]*)$/){print "BAD target "NR": "$3; bad=1} if($4 !~ /^[0-9]+([.][0-9]+)?$/){print "BAD delay "NR; bad=1}} END{if(!bad) print "MANIFEST OK ("NR" rows)"}' .rnstorybook/capture-manifest.tsv
```

Also confirm every route name used in an `initialState` is really registered
in `Navigation/Stack/AppScreens.tsx`. `RootStackParamsList` declares at least
one key (`Settings`) that is never registered and is not navigable.

## 2. Trigger and wait

```sh
# SET REPO TO THE REPO THAT OWNS THE BRANCH — every command below uses it.
# `gh workflow run --ref` resolves the ref IN the -R repo, so the dispatch
# must go where the branch actually exists:
#   implementation PR branch (lives in comapeo-mobile-1):
REPO=transistir/comapeo-mobile-1
#   coiab-app sync branch (exists only in coiab-app — dispatch there, and
#   only after coiab-app's EXPO_TOKEN secret is set, or the run fails at
#   Setup EAS):
# REPO=transistir/coiab-app
gh workflow run storybook-capture.yml -R $REPO --ref <branch>
# Bind RUN to THIS dispatch. Two hazards: an unfiltered --limit 1 can grab
# a prior or concurrent run from ANOTHER branch (every later step — wait,
# download, vision verdict — would certify the wrong artifact); and the
# retry paths in §3/§5 re-dispatch on the SAME branch, where a fixed sleep
# is not enough — if the new run takes longer than the sleep to register,
# --limit 1 returns the PREVIOUS, possibly already-completed run and the
# gate certifies its stale artifacts. So record the dispatch time and poll
# until a run created after it appears. The timestamp is taken 30 s in the
# past to tolerate clock skew between the local clock and GitHub's.
DISPATCH_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ -d '30 seconds ago')
RUN=""
for ATTEMPT in $(seq 1 15); do
  RUN=$(gh run list -R $REPO --workflow storybook-capture.yml --branch <branch> --event workflow_dispatch --limit 5 --json databaseId,createdAt -q ".[] | select(.createdAt > \"$DISPATCH_TS\") | .databaseId" | head -1)
  [ -n "$RUN" ] && break
  sleep 10
done
# Bounded like §3's retry budget: a dispatch that never registers a run
# (rejected ref, expired token) must fail loudly, not poll forever.
[ -n "$RUN" ] || { echo "no run registered within 150s of the dispatch"; exit 1; }
```

Wait in the background rather than blocking a foreground call for the whole
run:

```sh
until [ "$(gh run view $RUN -R $REPO --json status -q .status)" = "completed" ]; do sleep 120; done
gh run view $RUN -R $REPO --json conclusion -q .conclusion
```

## 3. If the run fails, classify before re-running

Do not blindly retry, and do not assume a failure means the code is wrong.
Download the partial artifact and look:

```sh
gh run download $RUN -R $REPO -D ./caps
gh run view $RUN -R $REPO --log-failed | grep -iE "storybook-capture" | tail -25
```

- **The last captured frame is correct but the run failed on the identity
  check** — a logcat line was evicted, not a real defect. Re-run. Look for
  the retained `*.failure-reactnative-logcat.txt` next to the frame.
- **Repeated ANR dialogs in the log** — emulator resource pressure. Re-run.
- **A frame shows `FlowStatePlaceholder`, the wrong screen, or a readiness
  timeout** — a real defect in the story or its flow state. Fix it.

Retry budget: 2. If three runs fail the same way at the same position, stop
and report rather than burning more cycles.

## 4. Vision review — every frame, not a sample

```sh
gh run download $RUN -R $REPO -D ./caps
D=$(find ./caps -name captures.tsv | head -1 | xargs dirname)
find "$D" -name '*.png' | wc -l          # must equal the manifest row count
find "$D" -name '*failure*'              # must be empty
awk -F'\t' 'NR>1{print $1, $3, $6}' "$D/captures.tsv"
```

Read every PNG. Reject a frame for any of:

- **Occlusion** — soft keyboard, a system dialog, an ANR window, a bottom
  sheet that should not be open.
- **`FlowStatePlaceholder`** instead of a real screen.
- **Blank or near-blank** frames where content was expected.
- **Wrong screen for the label** — the Storybook footer in each frame prints
  the story title; check it matches the manifest label.
- **Content cut off** at the bottom, which is usually occlusion by another
  name.

Byte-size triage from `captures.tsv` narrows where to look first: a sharp,
sustained change partway through the run, or an unexpectedly large frame for
a screen you know is mostly empty.

Some frames are legitimately not byte-stable between runs — compare those by
eye, never by size: any screen showing native device-info values (About) or
live location (the coordinate-format examples).

## 5. Fix, then re-run

Fix defects at the right layer. A defect that affects one story belongs in
that story; a defect that affects every frame after some point belongs in
`scripts/storybook-capture.sh`. The stuck-keyboard defect was the second
kind — fixing it per story would have left the next contributor to rediscover
it.

Re-run from step 2 and re-review. Do not comment a pass verdict on a run you
have not actually looked at.

## 6. Comment on the PR

Only after the frames pass review. Include the artifact download link —
`https://github.com/$REPO/actions/runs/<RUN>/artifacts/<ARTIFACT_ID>`:

```sh
ART=$(gh api repos/$REPO/actions/runs/$RUN/artifacts -q '.artifacts[0].id')
NAME=$(gh api repos/$REPO/actions/runs/$RUN/artifacts -q '.artifacts[0].name')
gh pr comment <PR> -R $REPO --body "..."
```

The comment must state:

- The run id and conclusion, and that the frames were reviewed by eye rather
  than trusted from the exit code.
- The direct artifact download link and the frame count.
- Anything reviewed and deliberately accepted — frames that are not
  byte-stable, rows that certify a route but not which branch rendered,
  states that are not covered and why.
- If earlier runs failed, what they were and why they were not regressions.

A verdict with no stated limits is a weaker signal than one that names them.
