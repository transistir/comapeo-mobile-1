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
| In-app logos | `src/frontend/images/CoMapeoLogo.svg`, `CoMapeoShield.svg`, `CoMapeoText.svg`, `TopoLogo.svg` | CoMapeo marks used in onboarding, about, and drawer surfaces |
| Onboarding copy | `src/frontend/screens/Onboarding/IntroToCoMapeo.tsx`, `DataPrivacy.tsx`, `MapOnYourOwnIntro.tsx` | Screens present the app as CoMapeo |

## 3. Typography

- Single custom family: **Rubik** (`@expo-google-fonts/rubik`, weight
  `Rubik_500Medium`), loaded in `src/frontend/Navigation/Stack/index.tsx:36`.
- Four call sites: navigation stack default, `HookFormTextInput`,
  `HeaderText`, audio screen shared styles.
- Everything else inherits React Native defaults.
- No typographic scale/token file exists (see gaps).

## 4. Color inventory

There is **no central theme or token file**. Colors live in two places:

1. `src/frontend/constants.ts` — the five project-card colors, chosen for the
   COIAB use case during the rebrand:

   | Name | Hex |
   |------|-----|
   | `DEFAULT_PROJECT_COLOR` | `#FFF5EB` (orange — default for new projects) |
   | | `#E5F0FF` (blue) |
   | | `#EEF6EE` (green) |
   | | `#FBE9E9` (red) |
   | | `#E5E5EB` (grey) |

2. Inline hex literals scattered across `src/frontend/**` (top offenders by
   count: `#FFF5EB` ×6, `#FFFFFF` ×4, `#FF0000` ×4, `#CCE0FF` ×4, `#CCCCD6`
   ×4, `#59A553` ×3, `#3C69F6` ×2, `#0066FF` ×2, plus ~30 more single-use
   hexes). `App.tsx` wires providers only — there is no `ThemeProvider`, no
   palette module, nothing for #19 to hook a COIAB theme into.

## 5. Gaps and proposed defaults

| # | Gap | Proposal (default if Figma unavailable) |
|---|-----|------------------------------------------|
| 1 | **Figma file URL never recorded** — the canonical design source (per #17) is unlocatable from the board; #53 tracks Figma MCP | Record the link on coiab-app#18 as soon as anyone has it. Until then, treat every visual value in this repo as provisional. |
| 2 | **No central token file** — colors/typography have no single source of truth, so #19 would have to sed-inline-hexes across ~40 files | Create `src/frontend/theme/coiab.ts` (palette, typography, spacing) as the first commit of #19; migrate call sites incrementally |
| 3 | **Visual assets are 100% upstream CoMapeo** (section 2) | Replace icon/splash/logos with COIAB art in #20. Do **not** derive COIAB colors from the current CoMapeo assets. |
| 4 | **No COIAB brand reference captured** | Public reference points: [coiab.org.br](https://coiab.org.br) (official site) and its logo in official use. Not a substitute for the approved Figma. |

## 6. Non-authoritative color starting point

For #19 to have *something* to react to, a starting palette can be taken from
the five project colors already in `constants.ts` (they were chosen for this
app, unlike the inline CoMapeo hexes). This is explicitly a placeholder until
the Figma file is linked — flag any PR that ships these as final.

## 7. What this document is not

- Not a rebrand plan (that is #19 + #20).
- Not design approval: only the Figma file (via #17's decision) is canonical.
  Items marked "proposed" above need confirmation against it.
