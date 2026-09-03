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

```sh
gh run watch --repo transistir/comapeo-mobile-1   # optional: follow the run
gh run download --repo transistir/comapeo-mobile-1 -n coiab-apk -D build/
```

The workflow uploads the APK as the `coiab-apk` artifact (30-day retention).
The run page URL is printed by `gh run view` and should be cited as evidence
when posting build results on an issue.

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
