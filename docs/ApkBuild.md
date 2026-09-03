# Building the APK

The canonical way to produce a COIAB App candidate APK is the **Build APK**
GitHub workflow (`.github/workflows/build-apk.yml`). It builds on GitHub CI
with `eas build --local` — the same mechanics as the proven Storybook Flow
Capture build — so no local Android toolchain, EAS CLI login, or Expo account
is required. (transistir/coiab-app#13)

## Build an APK (one command)

```sh
gh workflow run build-apk.yml --repo transistir/comapeo-mobile-1 --ref develop
```

The command dispatches the workflow on `develop` of
`transistir/comapeo-mobile-1` (first stop for code; it reaches
`transistir/coiab-app` via the usual sync PR). Pass `--ref <branch>` to build
a specific branch, or `--repo transistir/coiab-app` once the workflow has been
synced there.

## Get the APK

`gh workflow run` does not print the run it creates, so correlate the
download with the dispatch in three steps: capture the UTC time *before*
dispatching, filter the run list to the branch you dispatched on, and take
the newest run created at or after that timestamp.

```sh
REPO=transistir/comapeo-mobile-1
REF=develop   # the --ref you will dispatch on
SINCE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
gh workflow run build-apk.yml --repo "$REPO" --ref "$REF"
RUN_ID=""   # poll until the dispatched run registers
while [ -z "$RUN_ID" ]; do
  sleep 5
  RUN_ID=$(gh run list --workflow=build-apk.yml --repo "$REPO" --branch "$REF" \
    --json databaseId,createdAt \
    --jq "map(select(.createdAt >= \"$SINCE\")) | sort_by(.createdAt) | last | .databaseId // empty")
done
echo "Run: https://github.com/$REPO/actions/runs/$RUN_ID"
gh run watch "$RUN_ID" --repo "$REPO"   # optional: follow the run
gh run download "$RUN_ID" --repo "$REPO" -n coiab-apk -D build/
```

`>=` (not `>`) matters: `createdAt` is second-precision, and a run created in
the same second as `SINCE` is the dispatched one. The `--branch` filter rules
out concurrent dispatches on other branches.

Two residual ambiguities are documented rather than automated: `gh run list`
cannot filter by the `profile` input, so two same-second dispatches on the
same branch with different profiles are indistinguishable in the list (the
echoed run URL shows the input on the run page — check it if you race
dispatches), and the GitHub CLI offers no dispatch correlation value. In
practice: dispatch one build per branch at a time and confirm the echoed URL.

The workflow uploads the APK as the `coiab-apk` artifact (30-day retention).

## Profiles

| Profile | APP variant | Package | Purpose |
|---------|-------------|---------|---------|
| `release-candidate` (default) | `releaseCandidate` | `org.coiab.rc` | Candidate APK for internal testing and QA — the MVP demo build |
| `pre-release` | `preRelease` | `org.coiab.pre` | Early internal feedback |

Select with the workflow's `profile` input:

```sh
gh workflow run build-apk.yml --repo transistir/comapeo-mobile-1 --ref develop -f profile=pre-release
```

## Requirements on the repository

The workflow consumes repository configuration (already present on
`transistir/comapeo-mobile-1`; mirror it when enabling elsewhere):

- Secret `EXPO_TOKEN` — resolves the EAS project and its `preview` environment.
- Secret `MAPBOX_ACCESS_TOKEN` — baked into the native build for the online
  basemap style.
- Variable `COMAPEO_METRICS_URL` and secret `COMAPEO_METRICS_API_KEY` —
  metrics reporting. Placeholder values (`https://metrics.invalid`) are
  acceptable for non-production builds.

## Notes

- Builds are release builds with the JS bundle embedded (no Metro dev server).
- Sentry upload is disabled (`SENTRY_DISABLE_AUTO_UPLOAD=true`, also set in
  `eas.json`).
- For the upstream release machinery (EAS cloud builds, store submission) see
  [Releases.md](./Releases.md) — this workflow does not replace it; it is the
  lightweight, always-available path to a candidate APK.
