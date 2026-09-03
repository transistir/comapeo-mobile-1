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

Naming layer is done and consistent. The visual layer below is not.

## 2. Visual assets — still upstream CoMapeo

**The rebrand did not touch visual assets.** Icon, splash, and in-app logos
all still carry the upstream CoMapeo brand. Replacement is the scope of
transistir/coiab-app#20; listed here because it is the largest gap in the
identity.

| Asset | Location | Current content |
|-------|----------|-----------------|
| App icon | `assets/icon.png` (1024×1024 RGBA) | Solid black background; "CoMapeo" wordmark — "Co" in orange (≈ `#F5A623`), "Mapeo" in white, bold sans-serif |
| Splash | `assets/splash.png` (1024×1024 RGBA) | Solid black background; cobalt-blue topographic blob (≈ `#1E4FA8`); same "CoMapeo" wordmark centered |
| In-app logos | `src/frontend/images/CoMapeoLogo.svg`, `CoMapeoShield.svg`, `CoMapeoText.svg`, `TopoLogo.svg` | CoMapeo marks used in onboarding (`IntroToCoMapeo` = TopoLogo + CoMapeoText, `DataPrivacy` = CoMapeoShield), `AuthScreen` (CoMapeoLogo), and `ComapeoSettings/DataAndPrivacy` (CoMapeoShield) |
| User-visible "CoMapeo" copy | 34 non-test files under `src/frontend/` | Not only onboarding (`IntroToCoMapeo`, `DataPrivacy`, `MapOnYourOwnIntro`): the tracking notification in `hooks/useTracking.ts` ("CoMapeo is tracking your location"), `AuthScreen.tsx`, `CameraView.tsx`, `DrawerMenu.tsx`, the `ComapeoSettings/*` screens, `Observation/Buttons.tsx`, `PhotoPreviewModal/AttachedPhotoPreviewModal.tsx`, and more. Any rebrand pass must sweep all 34, not just onboarding. |

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

Colors live in three places:

1. `src/frontend/lib/styles.ts` — the central palette module: **29 named
   color constants** (`COMAPEO_BLUE`, `COMAPEO_DARK_BLUE`, `MAGENTA`,
   `MANGO`, greys, status colors, …), imported by ~157 files. This is the
   existing token entry point — but it carries the **upstream CoMapeo
   palette**, not a COIAB one.
2. `src/frontend/constants.ts` — the five project-card colors (verbatim
   upstream: identical hexes exist in `digidem/comapeo-mobile`'
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

3. Inline hex literals scattered across `src/frontend/**` (top offenders by
   case-insensitive count: `#FFF5EB` ×7, `#FFFFFF` ×5, `#FF0000` ×4,
   `#CCE0FF` ×4, `#CCCCD6` ×4, `#59A553` ×3, `#3C69F6` ×2, `#0066FF` ×2,
   plus ~30 more single-use hexes) — these bypass `styles.ts` entirely.

`App.tsx` wires providers only — there is no `ThemeProvider`. The gap is not
"no token file" (one exists) but "token file is partial and pre-rebrand": no
typography/spacing tokens, ~40 inline hexes bypass it, and its palette is
CoMapeo's.

## 5. Gaps and proposed defaults

| # | Gap | Proposal (default if Figma unavailable) |
|---|-----|------------------------------------------|
| 1 | **Figma file URL never recorded** — the canonical design source (per #17) is unlocatable from the board; #53 tracks Figma MCP | Record the link on coiab-app#18 as soon as anyone has it. Until then, treat every visual value in this repo as provisional. |
| 2 | **Token module is partial and pre-rebrand** — `lib/styles.ts` (29 colors, ~157 importers) carries the CoMapeo palette, has no typography/spacing tokens, and ~40 inline hexes bypass it | #19 should evolve `lib/styles.ts` in place (swap palette values to COIAB, add typography/spacing tokens) rather than add a parallel module — 157 importers already point there; migrate the inline hexes to it incrementally |
| 3 | **Visual assets are 100% upstream CoMapeo** (section 2) | Replace icon/splash/logos with COIAB art in #20. Do **not** derive COIAB colors from the current CoMapeo assets. |
| 4 | **No COIAB brand reference captured** | Public reference points: [coiab.org.br](https://coiab.org.br) (official site) and its logo in official use. Not a substitute for the approved Figma. |

## 6. Non-authoritative color starting point

**No in-repo palette is COIAB's.** Both `lib/styles.ts` and the
`constants.ts` project colors are upstream CoMapeo values inherited by the
fork (`git log -S '#FFF5EB'` traces them to upstream commits). Until the
Figma file is linked, #19 has no in-repo source to draw a COIAB palette
from; if a provisional palette is needed before then, keep the five project
colors for project-picker cards only (they are already in that UI) and leave
every other surface untouched — and flag any PR that ships provisional
values as final.

## 7. What this document is not

- Not a rebrand plan (that is #19 + #20).
- Not design approval: only the Figma file (via #17's decision) is canonical.
  Items marked "proposed" above need confirmation against it.
