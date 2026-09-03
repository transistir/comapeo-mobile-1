# COIAB App Identity Inventory

Inventory of the COIAB App ("Ekanâdyby") identity as it exists in the code
today: what has been applied, what is still upstream CoMapeo, and what is
missing before the visual identity can be called COIAB. This is the ground
truth that #19 (apply theme) and #20 (splash/onboarding identity) build on.
(transistir/coiab-app#18)

The approved design source is the **Figma file** (per transistir/coiab-app#17,
Figma is canonical for design decisions). Its URL is **not yet recorded** on
the board (see transistir/coiab-app#53, Figma MCP integration). Until it is,
this document inventories the code and flags every place where a Figma value
should eventually replace a default proposed here.

## 1. Applied identity (naming and technical identifiers)

Applied by the rebrand pass; all verified in code on `develop`.

| What | Value | Where |
|------|-------|-------|
| App display name | `Ekanâdyby` | `app.config.js` (`APP_NAME_BASE`), `app.json` |
| Expo slug / scheme | `ekanadyby` | `app.json`, `src/frontend/lib/deepLinkConfig.ts` (`ekanadyby://`) |
| npm package name | `ekanadyby` | `package.json` |
| Android application ID | `org.coiab` (+ `.rc`/`.pre`/`.dev` variants) | `app.config.js` (`APP_ID_BASE`) |

The naming layer is done and consistent **in the app's runtime identifiers**.
Two exceptions remain in tooling defaults: `wdio.ios.config.js:30-32` still
targets `CoMapeoRC.app` / bundle ID `com.comapeo.rc` for iOS Appium runs,
while `app.config.js` resolves the release-candidate iOS bundle to
`org.coiab.rc` — a rebranded RC build cannot be attached by that config
until it is migrated. And the local Storybook capture defaults
`STORYBOOK_PACKAGE_ID` in `scripts/storybook-capture.sh:30` and
`scripts/storybook-capture-all.sh:39` still fall back to `com.comapeo.dev`
(builds are `org.coiab.dev`); the CI workflow overrides this, but a local
capture without the override points at a nonexistent pre-rebrand package.
The visual layer below is not done either.

## 2. Visual assets — still upstream CoMapeo

**The rebrand did not touch visual assets.** Icon, splash, and in-app logos
all still carry the upstream CoMapeo brand. Replacement is the scope of
transistir/coiab-app#20; listed here because it is the largest gap in the
identity.

| Asset | Location | Current content |
|-------|----------|-----------------|
| App icon | `assets/icon.png` (1024×1024 RGBA) | **Transparent background** (~97.5% of pixels alpha 0 — the black some image viewers show is their own composite, not artwork). "CoMapeo" wordmark — "Co" in orange (≈ `#F5A623`), "Mapeo" in white, bold sans-serif. Android composes it over the `#050F77` adaptive-icon background declared in `app.json`. |
| Splash | `assets/splash.png` (1024×1024 RGBA) | **Transparent background** (~88% of pixels alpha 0). Cobalt-blue topographic blob (≈ `#1E4FA8`); same "CoMapeo" wordmark centered. The splash background **is** already declared — `app.json`'s `expo-splash-screen` plugin config sets `backgroundColor: #050F77` (the legacy top-level `expo.splash` key is absent; the plugin key is the one in force). #20 replaces the background value there when swapping the art rather than choosing one from scratch. |
| In-app logos | `src/frontend/images/CoMapeoLogo.svg`, `CoMapeoShield.svg`, `CoMapeoText.svg`, `TopoLogo.svg` | CoMapeo marks used in onboarding (`IntroToCoMapeo` = TopoLogo + CoMapeoText, `DataPrivacy` = CoMapeoShield), `AuthScreen` (CoMapeoLogo), and `ComapeoSettings/DataAndPrivacy` (CoMapeoShield) |
| User-visible "CoMapeo" copy | **26 non-test files under `src/frontend/`** (of 37 matching "CoMapeo") | Rendered strings only — not only onboarding (`MapOnYourOwnIntro`, `DataPrivacyMessages`): the tracking notification in `hooks/useTracking.ts` ("CoMapeo is tracking your location"), `sharedComponents/CameraView.tsx`, `sharedComponents/DrawerMenu.tsx`, the `ComapeoSettings/*` screens, `Observation/Buttons.tsx` ("Sent from CoMapeo"), `PhotoPreviewModal/AttachedPhotoPreviewModal.tsx`, `hooks/server/projects.ts` (export filenames `CoMapeo_Tracks`/`CoMapeo_Obsvns`), and more. The other 11 matches are **not copy**: 8 files carry "CoMapeo" only in internal symbols, route names, or story files (`Navigation/Stack/OnboardingScreens.tsx`, `Navigation/Stack/index.tsx`, `constants.ts`, `lib/attachmentTypeChecks.ts`, `sharedTypes/navigation.ts`, `flows/{Onboarding,Sanity,Settings}.stories.tsx`) — rebranding those means identifier/route renames, a separate decision, not a copy sweep; 3 screens reference only the logo assets (`AuthScreen.tsx`, `Onboarding/DataPrivacy.tsx`, `Onboarding/IntroToCoMapeo.tsx` — covered by the logos row above). Any rebrand pass must sweep all 26 **plus the runtime copy outside `src/frontend/`** (next row), not just onboarding. |
| User-visible "CoMapeo" copy outside `src/frontend/` | `messages/<locale>/{primary,secondary}.json`, `app.json`, `expo-config-plugins/customPermissionText.js` | Three places: (1) translation sources in `messages/` — 8 locales (`en-US`, `es-419`, `pt-BR`, `id-ID`, `fr-FR`, `de-DE`, `nl-NL`, `ja-JP`), `primary.json` + `secondary.json` each, ~560 "CoMapeo" occurrences total (e.g. pt-BR: "Configurações do CoMapeo", "Sobre CoMapeo"). They compile to `translations/*.json` via `npm run build:translations` (`scripts/build-translations.mjs`) and load at runtime through `src/frontend/lib/intl.ts` — edit `messages/`, never the compiled output. The **English catalog is itself generated**: `npm run extract-messages` (`scripts/extract-messages.mjs`) rebuilds `messages/en-US/` from the `defaultMessage` values in `src/frontend`, so English copy is changed by editing `defaultMessage` in source and re-extracting — direct edits to `messages/en-US/*.json` are overwritten on the next extraction. Workflow for a copy change: edit `defaultMessage` in `src/frontend` → `npm run extract-messages` → update the other locales' catalogs in `messages/` → `npm run build:translations`. (2) `app.json` `ios.infoPlist.NSLocalNetworkUsageDescription` ("CoMapeo uses the local network to discover and sync with nearby devices in your project.") — the iOS local-network permission prompt; OS-level, outside the translation pipeline. (3) `expo-config-plugins/customPermissionText.js` (registered at `app.json` plugins) — writes the Android permission prompts during prebuild: `permission_camera_description` "Allow CoMapeo to use the camera?" and the location equivalent "Allow CoMapeo to use location?". |

## 3. Typography

- Single custom family: **Rubik** (`@expo-google-fonts/rubik`). `app.json`
  bundles three weights: `Rubik_400Regular`, `Rubik_500Medium`,
  `Rubik_600SemiBold`.
- Seven explicit call sites: `Rubik_500Medium` in
  `Navigation/Stack/index.tsx:36`, `sharedComponents/HookFormTextInput.tsx`,
  `sharedComponents/Text/HeaderText.tsx`, `screens/Audio/shared.tsx`; plain
  `'Rubik'` in `sharedComponents/DescriptionField.tsx`,
  `sharedComponents/ActionsRow/KeyboardAccessory.tsx`,
  `screens/ObservationFields/Date.tsx`.
- Everything else inherits React Native defaults.
- No typographic scale/token module exists (see gaps).

## 4. Color inventory

Colors live in four places:

1. `src/frontend/lib/styles.ts` — the central palette module: **29 named
   color constants** (`COMAPEO_BLUE`, `COMAPEO_DARK_BLUE`, `MAGENTA`,
   `MANGO`, greys, status colors, …), imported by ~157 files. This is the
   existing token entry point — but it carries the **upstream CoMapeo
   palette**, not a COIAB one.
2. `src/frontend/constants.ts` — the five project-card colors (verbatim
   upstream: identical hexes exist in `digidem/comapeo-mobile`'s
   `constants.ts`; they arrived with the fork, they were not chosen for
   COIAB). Note `LIGHT_ORANGE`/`LIGHT_GREEN` in `styles.ts` duplicate two of
   these hexes:

   | Name | Hex |
   |------|-----|
   | `DEFAULT_PROJECT_COLOR` | `#FFF5EB` (orange — default for new projects) |
   | | `#E5F0FF` (blue) |
   | | `#EEF6EE` (green) |
   | | `#FBE9E9` (red) |
   | | `#E5E5EB` (grey) |

3. Inline hex literals scattered across `src/frontend/**` **outside the two
   centralized files** (non-test, non-story `.ts`/`.tsx`, case-insensitive, shorthand
   normalized — `#FFF` counts as `#FFFFFF` — and excluding the declarations
   in `lib/styles.ts`/`constants.ts`, which belong to categories 1–2 above:
   26 distinct hexes over 61 use sites, led by `#FFFFFF` ×12 (8 of them
   `#FFF` shorthand), `#000000` ×4 (3 as `#000`), `#FFF5EB`/`#FF0000`/
   `#CCE0FF` ×4, `#F3F3F3`/`#EAEAEA`/`#CCCCD6`/`#EEEEEE` ×3 (one `#EEE`);
   brand hexes `#59A553` ×2, `#3C69F6` ×2, `#0066FF` ×1; 13 of the 26 occur
   exactly once) — these bypass `styles.ts` entirely.
4. Colors baked into the SVG assets of `src/frontend/images/**`: **63 of the
   79 non-logo SVGs** carry at least one literal hex (`CoMapeoLogo.svg` and
   `TopoLogo.svg` are excluded here — they are the logo assets of section 2,
   owned by #20): **54 distinct colors over 213 use sites** (case-insensitive,
   shorthand normalized — `#000` ×13, `#666`/`#999`/`#CCC` ×1 each), led by
   `#000000` ×26, `#333333` ×16, `#E86826` ×15, `#FFD748`/`#757575` ×11,
   `#0066FF` ×7. Examples: `OrangeExchange.svg` (`#E86826`),
   `AddProject.svg`/`DownArrow.svg`/`SendingIcon.svg`/`CheckMark.svg`
   (`#0066FF`). Overlap with the token module: 12 of the 54 also exist in
   `styles.ts` (`COMAPEO_BLUE` `#0066FF`, `DARK_ORANGE` `#E86826`,
   `DARK_GREEN` `#59A553`, `SYNC_BACKGROUND` `#2348B2`, and the shared
   greys/black/white/red); the most common **SVG-only** colors —
   `#FFD748` ×11, `#FFBC47`/`#C86F34` ×10, `#C19B66`/`#804B24` ×8,
   `#FFCB4B` ×6 — appear in no `.ts`/`.tsx` at all. These colors live
   in the artwork itself: no token module can restyle them, they change only
   when the asset files are replaced. #19 as scoped covers `styles.ts` +
   inline hexes, not SVG interiors; unless a follow-up issue takes the icon
   set, the icons keep the upstream CoMapeo palette through the rebrand.

`App.tsx` wires providers only — there is no `ThemeProvider`. The gap is not
"no token file" (one exists) but "token file is partial and pre-rebrand": no
typography/spacing tokens, 26 distinct inline hexes (61 use sites, shorthand
normalized) bypass it, another 54 distinct colors are welded into 63 SVG
assets that only asset replacement (#20-adjacent) can change, and its
palette is CoMapeo's.

## 5. Gaps and proposed defaults

| # | Gap | Proposal (default if Figma unavailable) |
|---|-----|------------------------------------------|
| 1 | **Figma file URL never recorded** — the canonical design source (per #17) is unlocatable from the board; #53 tracks Figma MCP | Record the link on coiab-app#18 as soon as anyone has it. Until then, treat every visual value in this repo as provisional. |
| 2 | **Token module is partial and pre-rebrand** — `lib/styles.ts` (29 colors, ~157 importers) carries the CoMapeo palette, has no typography/spacing tokens, and 26 distinct inline hexes bypass it | #19 should evolve `lib/styles.ts` in place (swap palette values to COIAB, add typography/spacing tokens) rather than add a parallel module — 157 importers already point there; migrate the inline hexes to it incrementally |
| 3 | **Visual assets are 100% upstream CoMapeo** (section 2) | Replace icon/splash/logos with COIAB art in #20. Do **not** derive COIAB colors from the current CoMapeo assets. |
| 4 | **No COIAB brand reference captured** | Public reference points: [coiab.org.br](https://coiab.org.br) (official site) and its logo in official use. Not a substitute for the approved Figma. |

## 6. Non-authoritative color starting point

**No in-repo palette is COIAB's.** Both `lib/styles.ts` and the
`constants.ts` project colors are upstream CoMapeo values inherited by the
fork (`git log -S '#FFF5EB'` traces them to upstream commits). Until the
Figma file is linked, #19 has no in-repo source to draw a COIAB palette
from; if a provisional palette is needed before then, keep the five project
colors only on the project surfaces that already render them — the
edit-project color picker (`ProjectSettings/EditProjectDetails.tsx`) and the
`DEFAULT_PROJECT_COLOR` fallback shown on project cards
(`hooks/useProjectRoleAndDetails.ts`, `RemovedFromProjectBottomSheet.tsx`)
— and leave every other surface untouched, flagging any PR that ships
provisional values as final.

## 7. What this document is not

- Not a rebrand plan (that is #19 + #20).
- Not design approval: only the Figma file (via #17's decision) is canonical.
  Items marked "proposed" above need confirmation against it.
