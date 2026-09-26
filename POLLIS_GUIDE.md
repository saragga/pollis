# Pollis Fork Guide

This document records every intentional deviation from the upstream VS Code codebase that produces the Pollis application. Its primary purpose is to make future rebases onto new VS Code versions tractable: each section identifies the file(s) changed, the reason for the change, and how to re-apply it after a merge.

**Rule:** every deliberate change to upstream code must be recorded here before it is considered done.

---

## 1. Branding

### 1.1 Product identity

**File:** `product.json`

The following fields are set to Pollis-specific values:

| Field | Pollis value | Notes |
|---|---|---|
| `nameShort` | `"Pollis"` | Used in window titles, CLI |
| `nameLong` | `"Pollis"` | Used in About dialog title |
| `applicationName` | `"pollis"` | Binary/process name |
| `pollisVersion` | `"0.2.0"` | Pollis-specific version shown in About dialog |
| `date` | `"2026-05-31T00:00:00.000Z"` | Build date shown in About dialog |
| `poweredBy` | object | Runtime version strings shown in About dialog (see §1.2) |
| `licenseName` | `"AGPL-3.0-or-later"` | SPDX id; shown in About dialog, written into Linux packages |
| `sourceUrl` | `"https://github.com/Trumpingtons/pollis"` | Source link shown in About dialog (AGPL section 13) |
| `reportIssueUrl` | `"https://github.com/Trumpingtons/pollis/issues/new"` | Help > Report Issue, for Pollis itself (§3.6) |
| `requestFeatureUrl` | Pollis issues labelled `enhancement` | Help > Search Feature Requests (§3.6) |

**After a rebase:** re-apply these values; upstream will reset them to VS Code defaults.

### 1.2 `poweredBy` object

**File:** `product.json`

A custom `poweredBy` object records the versions of the runtimes bundled with Pollis:

```json
"poweredBy": {
  "julia":   "...",
  "codeoss": "..."
}
```

**File:** `src/vs/base/common/product.ts`

The `IProductConfiguration` interface is extended with:

```typescript
readonly pollisVersion?: string;
readonly poweredBy?: {
  readonly julia?: string;
  readonly codeoss?: string;
};
readonly licenseName?: string;   // next to licenseUrl
readonly sourceUrl?: string;     // next to licenseUrl
```

**After a rebase:** upstream will not have these fields; re-add both the `product.json` values and the interface extension.

### 1.3 Application icon

**File:** `resources/darwin/code.icns`

Replaced with the Pollis icon. **After a rebase:** restore the Pollis `.icns` file.

### 1.4 Welcome page

**Files:** `src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService.ts`, `…/browser/gettingStarted.ts`, `…/browser/gettingStarted.contribution.ts`

- **Excluded walkthroughs.** `POLLIS_EXCLUDED_WALKTHROUGHS` (compared lower-cased by `isPollisExcludedWalkthrough`) lists walkthroughs that are never registered: the built-in `Setup` ("Get started with VS Code"), the built-in `Beginner` ("Learn the Fundamentals", page title "Essential Features"; it has no `when` clause, so it would always be listed) and the Copilot Chat extension's `GitHub.copilot-chat#copilotWelcome`. Both registration paths skip them: `registerWalkthroughs()` for built-ins and the extension-contribution loop for extensions. `SetupAccessibility` names `Setup` as its `next`; with `Setup` gone it just shows no "Next Section" button.
- **No sign-in onboarding.** `workbench.welcomePage.experimentalOnboarding` defaults to `false` (was `true`). Upstream's new-user onboarding is a VS Code-branded modal asking to sign in to GitHub/Copilot, and it does not respect `chat.disableAIFeatures`.
- **First launch shows the welcome page.** Upstream opens a new user's first launch straight into the first registered walkthrough. That branch at the end of `buildCategoriesSlide()` is removed. `product.json` `openToWelcomeMainPage` would also skip it, but it additionally shows a "collects usage data" telemetry footer, which is wrong for Pollis.
- **"Julia is not installed" alert.** The Alerts and Announcements section (`buildAnnouncementsSection()`) shows an alert while the context key `julia.juliaInstalled` is `false`, with **Install Julia** (`language-julia.retriggerInstallation`, which asks how to install: juliaup download, a custom command or a path) and **Set Julia Path** (opens the `julia.executablePath` setting). `language-julia` sets the key when it activates, so only an explicit `false` shows the alert, and it disappears once Julia is found. Styles are the `.pollis-alert` rules in `gettingStarted.css`.
- **No "Overview" heading.** Upstream's `buildOverviewSection()` produced only an empty "Overview" heading under the walkthroughs; it was removed, so the right column shows the walkthrough list alone.

Previously these only looked absent in the dev build because they had been hidden with × in the `code-oss-dev` profile; the packaged app showed them. **After a rebase:** re-add the exclusion set and both early returns in `gettingStartedService.ts`, drop the Overview section and the first-launch walkthrough branch again in `gettingStarted.ts`, set the `workbench.welcomePage.experimentalOnboarding` default to `false` again, and re-add the Julia alert (`buildAnnouncementsSection()`, `buildJuliaNotInstalledAlert()`, the `installJulia`/`setJuliaPath` dispatch cases and the `.pollis-alert` CSS).

### 1.5 Copilot Chat not shipped; AI features off by default

**Files:** `build/gulpfile.vscode.ts`, `build/next/index.ts`, `build/buildfile.ts`, `src/vs/workbench/contrib/chat/browser/chat.contribution.ts`, `src/vs/workbench/contrib/chat/browser/chatTipCatalog.ts`, `src/vs/workbench/contrib/chat/electron-browser/chat.contribution.ts`, `src/vs/platform/windows/electron-main/windowsMainService.ts`

- **Copilot Chat is not packaged.** `extensions/copilot` is already excluded from the general extension list (`excludedExtensions` in `build/lib/extensions.ts`); it only entered the app through `compileCopilotExtensionBuildTask` and `prepareBuiltInCopilotExtensionShims`. Both are removed from `gulpfile.vscode.ts` (the import, the two task series, and the shim step in `copyCopilotNativeDepsTask`), which saves ~416 MB. `copyCopilotNativeDeps` and `getCopilotExcludeFilter` stay, because core's agent host uses the `@github/copilot` SDK from the root `node_modules`. `gulpfile.reh.ts` (remote server) is untouched. The dev launcher `scripts/code.sh` already passes `--disable-extension=GitHub.copilot-chat`.
- **AI features off by default.** The `chat.disableAIFeatures` default is `true` (was `false`), which hides the chat view, the title-bar chat control and other AI entry points. Users can turn AI back on in Settings. The default is set in the setting's registration because `product.json` `configurationDefaults` is not read by anything (its `extensions.verifySignature` entry has no effect either).
- **Agents window not shipped.** Upstream's standalone Agents window (`src/vs/sessions/`, a Copilot Chat front end) is still compiled but never opened or packaged. `windowsMainService.openAgentsWindow` opens a regular window instead (this covers `--agents`, which upstream only blocks for `stable` quality, and Pollis builds as `oss`), and `isSessionsWindow` is always `false`, so the agent-sessions workspace opens as a regular window too. `OpenAgentsWindowAction` is not registered (which also hides the Agents banner) and the `tip.openAgentsWindow` chat tip is removed. `AgentHostTerminalContribution` (agent-host terminal profiles) is not registered in `terminal.contribution.ts`: it needs `IRemoteAgentHostService`, which only `sessions.desktop.main.ts` registers, so upstream logs "Unable to create workbench contribution 'workbench.contrib.agentHostTerminal'" at every startup of the regular workbench. The `vs/sessions` entry points, HTML and resources are omitted from `build/next/index.ts`, `build/buildfile.ts` and `gulpfile.vscode.ts` (including the product checksums). The embedded Agents app is not built because `product.json` has no `embedded` block.
- **No source maps in the app.** `gulpfile.vscode.ts` always strips `*.js.map` / `*.css.map` from the package (upstream does so only on CI, so local builds shipped ~195 MB of maps) and never points `sourceMappingURL` at Microsoft's CDN.

**After a rebase:** remove `compileCopilotExtensionBuildTask` and the shim preparation from `gulpfile.vscode.ts` again (new upstream Copilot build steps may appear; the packaged `Contents/Resources/app/extensions/` must not contain `copilot`), and set the `chat.disableAIFeatures` default to `true` again. Re-apply the Agents window guards and build omissions (new upstream `vs/sessions` entry points may appear; the packaged `Contents/Resources/app/out/vs/sessions/` must not exist) and the source-map settings.

### 1.6 New windows open maximized

**Files:** `src/vs/platform/windows/electron-main/windowsStateHandler.ts`, `src/vs/workbench/electron-browser/desktop.contribution.ts`

A window with no saved size (the first launch, or a new window) opens maximized, filling the screen (on macOS this is zoom, not full-screen mode). Upstream opens a fixed-size window in the centre, which users tend to resize before anything else. The `window.newWindowDimensions` default is `maximized` (was `default`). The main process only sees user settings, not registered defaults, so `windowsStateHandler.ts` treats an unset value as `maximized` too. Saved window sizes are still restored.

**After a rebase:** set the `window.newWindowDimensions` default to `maximized` again, and re-add the `?? 'maximized'` fallback in `doGetNewWindowState()`.

---

## 2. About Dialog

**File:** `src/vs/platform/dialogs/electron-browser/dialog.ts`

Upstream VS Code uses `dialog.ts` only for native dialog wrappers. Pollis replaces the About dialog content with a custom `createNativeAboutDialogDetails()` function that produces:

```
Version: <pollisVersion>
Build Date: <date formatted as "31 May 2026">
© <year> Antonio Saragga Seabra

Powered by
· Analytics: Julia <version>
· Platform: Code OSS <version>

License: <licenseName>. This program comes with ABSOLUTELY NO WARRANTY.
Source code: <sourceUrl>
```

The last two lines are the "Appropriate Legal Notices" (AGPL section 5d) and the source offer (section 13).
The web/server About dialog, `createBrowserAboutDialogDetails()` in
`src/vs/workbench/browser/parts/dialogs/dialog.ts`, appends the same two lines. That matters most there,
because section 13 covers users who reach Pollis over a network.

Key decisions:
- Copyright appears immediately below Build Date (not at the bottom).
- `pollisVersion` is shown instead of the VS Code `version` string.
- The `poweredBy` block is built from `productService.poweredBy`; each field falls back to `'Unknown'` if absent.

**After a rebase:** the upstream file will not have this function; re-add it and ensure `dialog.contribution.ts` (electron-browser) still routes the About action through the browser-side dialog (so Pollis controls its width and content).

---

## 3. Menu Bar Structure

Pollis significantly restructures the native macOS menu bar relative to upstream VS Code.

### 3.1 New `MenuId` registrations

**File:** `src/vs/platform/actions/common/actions.ts`

Four new top-level menu IDs are declared:

```typescript
static readonly MenubarExploreMenu  = new MenuId('MenubarExploreMenu');
static readonly MenubarModelMenu    = new MenuId('MenubarModelMenu');   // "Infer"
static readonly MenubarSimulateMenu = new MenuId('MenubarSimulateMenu');
static readonly MenubarOptimiseMenu = new MenuId('MenubarOptimiseMenu');
```

**After a rebase:** upstream will not have these; re-add all four.

### 3.2 Menu bar construction

**File:** `src/vs/platform/menubar/electron-main/menubar.ts`

The native menu bar is assembled in `_updateMenubar()`. Pollis makes the following changes relative to upstream:

#### Menus removed
| Upstream menu | Action |
|---|---|
| Selection | Commented out — items available via Command Palette and View menu |
| Go | Commented out — navigation via keybindings |
| Terminal | Commented out as a top-level menu (see §3.3) |

#### Menus added (in order after Run)
| Pollis menu | MenuId | Notes |
|---|---|---|
| Explore | `MenubarExploreMenu` | Data discovery, toolboxes (Economics, Robotics, etc.) |
| Infer | `MenubarModelMenu` | Statistical and ML model webviews |
| Simulate | `MenubarSimulateMenu` | Simulation methods |
| Optimise | `MenubarOptimiseMenu` | Optimisation methods |

The Run menu is upstream VS Code — no changes.

**After a rebase:** the upstream file will restore Selection, Go, and Terminal as top-level menus, and will not have the four Pollis menus. Re-apply all commented-out blocks and re-add the four new menu blocks.

### 3.3 Terminal and Tasks menus removed

**File:** `src/vs/workbench/contrib/terminal/browser/terminalMenus.ts`  
**File:** `src/vs/workbench/contrib/terminal/browser/terminal.contribution.ts`

Pollis has no Terminal top-level menu, so `MenubarTerminalMenu` (including the Tasks items that `task.contribution.ts` registers there) is not reachable from the menu bar. Tasks remain available from the Command Palette. The New Terminal, New Terminal Window and Split Terminal items are removed from `terminalMenus.ts`, and the `&&Terminal` mnemonic title is removed from the terminal view's `openCommandActionDescriptor`.

**After a rebase:** remove those three `terminalMenus.ts` items and the mnemonic title again.

### 3.4 Pollis menus registered in `menubarControl.ts`

**File:** `src/vs/workbench/browser/parts/titlebar/menubarControl.ts`

The four Pollis menus are registered into `MenubarMainMenu` with their display titles and ordering. Terminal is registered into `MenubarViewMenu` as a panel toggle (View → Terminal) rather than as a standalone top-level menu.

**After a rebase:** upstream will not have these registrations; re-add them.

### 3.5 Pollis menus open to extensions

**File:** `src/vs/workbench/services/actions/common/menusExtensionPoint.ts`

The Pollis top menus are stable (non-proposed) menu contribution points, so any extension can add items
to them from its `package.json` (`contributes.menus`):

| Contribution key | MenuId |
|---|---|
| `menuBar/explore` | `MenubarExploreMenu` |
| `menuBar/toolboxes` | `MenubarToolboxesMenu` |
| `menuBar/model` | `MenubarModelMenu` |
| `menuBar/simulate` | `MenubarSimulateMenu` |
| `menuBar/optimise` | `MenubarOptimiseMenu` |

The extension exception in `LICENSE.txt` names these contribution points as part of the Extension API.

**After a rebase:** upstream will not have these entries; re-add them.

### 3.6 Help menu

**Files:** `src/vs/workbench/browser/parts/titlebar/menubarControl.ts`, `src/vs/platform/menubar/electron-main/menubar.ts`, `src/vs/workbench/browser/actions/helpActions.ts`, `src/vs/workbench/browser/actions/windowActions.ts`, `src/vs/workbench/contrib/issue/browser/baseIssueReporterService.ts`, `…/issue/browser/issueReporterPage.ts`, `product.json`, `.github/ISSUE_TEMPLATE/`

Pollis has a Help menu on every platform, last in the menu bar. It holds:

| Group | Item | Platforms |
|---|---|---|
| `1_about` | About Pollis | Windows and Linux (`when: IsMacNativeContext.toNegated()`) |
| `2_welcome` | Welcome (`workbench.action.openWalkthrough`) | all |
| `4_feedback` | Search Feature Requests (`workbench.action.openRequestFeatureUrl`), Report Issue (`workbench.action.openIssueReporter`) | all |
| `5_legal` | View License, View Third-Party Notices | all |

On macOS, About Pollis stays in the Pollis application menu (`setMacApplicationMenu`), which otherwise holds only Preferences, Services, Hide/Show and Quit. Welcome, View License and View Third-Party Notices were moved out of it into Help.

- `menubarControl.ts` registers Help into `MenubarMainMenu` (order 11). This drives the custom title bar, and its `original: 'Help'` key is what `menubar.ts` asks for.
- `menubar.ts` draws Help after Toolboxes in `_updateMenubar()`, with `role: 'help'` (macOS adds its menu search field).
- `helpActions.ts` registers About and Welcome with `MenuRegistry.appendMenuItem`, and adds `menu` entries to `ShowLicenseAction` and `ShowThirdPartyNoticesAction`.
- `windowActions.ts`: the upstream `ShowAboutDialogAction` Help entry (group `z_about`, last) is removed so that About comes first.

**Search Feature Requests** opens `requestFeatureUrl`: the Pollis issues labelled `enhancement` (GitHub's standard label for feature requests). `helpActions.ts` gives `OpenRequestFeatureUrlAction` a menu entry (the Help menu commit had removed upstream's). **Report Issue** is upstream's, registered by `issue/common/issue.contribution.ts` in `4_feedback` (order 3) when `reportIssueUrl` is set. The issue reporter sends nothing itself: **Create on GitHub** opens a pre-filled "New issue" page (or copies the details to the clipboard when they are too long), which the user submits with their GitHub account. Where it goes depends on the "For" field:

- **Pollis** → `reportIssueUrl`, with `template=bug_report.md` added, so `.github/ISSUE_TEMPLATE/bug_report.md` must keep that name. The Pollis panels are core code, so they are reported here.
- **An extension** → the extension's `bugs.url`, else its `repository`. The bundled `language-julia` points `bugs.url` at the Pollis issues (§5.6), because its bugs are usually Pollis's changes; genuine upstream bugs are passed on to julia-vscode by hand.

The reporter's "For" options read **Pollis** (`product.nameLong`, was "Visual Studio Code"), **An extension** (was "A VS Code extension") and **Don't know** (unchanged; files on Pollis and suggests reloading with extensions disabled). Two more strings use the product name instead of "VS Code": the out-of-date acknowledgement (`issueReporterPage.ts`) and "This extension handles issues outside of Pollis" (`baseIssueReporterService.ts`). **After a rebase:** re-apply these four labels.

The `feature_request.md` template applies the `enhancement` label and `bug_report.md` the `bug` label; both are GitHub's default labels. The links only work for other people once the repository is public.

Upstream's other Help items (Documentation, Release Notes and so on) do not register, because Pollis's `product.json` has no URLs for them.

**After a rebase:** upstream has its own Help menu. Keep its registration and drawing block. Remove the About entry from `ShowAboutDialogAction`, remove Welcome, View License and View Third-Party Notices from `setMacApplicationMenu`, and re-add the `helpActions.ts` entries (including the Search Feature Requests menu entry and the `5_legal` group).

---

## 4. View Menu Additions

### 4.1 Column Selection Mode

**File:** `src/vs/workbench/contrib/codeEditor/browser/toggleColumnSelection.ts`

Upstream registers `ToggleColumnSelectionAction` only to `MenuId.MenubarSelectionMenu`. Since Pollis removes the Selection top-level menu, the item becomes unreachable. It is re-registered to `MenuId.MenubarViewMenu` as a second target:

```typescript
menu: [
  { id: MenuId.MenubarSelectionMenu, group: '4_config', order: 2 },  // upstream (kept)
  { id: MenuId.MenubarViewMenu,      group: '7_editor', order: 1 }   // Pollis addition
]
```

This places Column Selection Mode at the very bottom of the View menu, in its own group below Word Wrap.

**After a rebase:** upstream will have only the `MenubarSelectionMenu` entry; re-add the `MenubarViewMenu` entry.

### 4.2 Word Wrap — always active

**File:** `src/vs/workbench/contrib/codeEditor/browser/toggleWordWrap.ts`

Upstream registers Word Wrap in the View menu with `precondition: CAN_TOGGLE_WORD_WRAP`, which grays it out when no editor is focused. Both Word Wrap and Column Selection Mode toggle global editor configuration settings — not editor-instance-specific actions — so restricting them to require an active editor is inconsistent and unintuitive.

The `precondition` is removed from the `MenubarViewMenu` registration:

```typescript
// Upstream:
command: {
    id: TOGGLE_WORD_WRAP_ID,
    title: nls.localize(..., "&&Word Wrap"),
    toggled: EDITOR_WORD_WRAP,
    precondition: CAN_TOGGLE_WORD_WRAP  // ← removed in Pollis
}
```

Word Wrap now behaves consistently with Column Selection Mode: always active in the menu regardless of editor focus. The `EDITOR_WORD_WRAP` toggled indicator is preserved, so the checkmark still reflects the current state correctly when an editor is open.

**After a rebase:** upstream will restore `precondition: CAN_TOGGLE_WORD_WRAP`; remove it.

---

## 5. Pollis-Specific Contributions

These are entirely new directories with no upstream equivalent. They do not conflict with upstream code and should survive a rebase without changes, provided the `workbench.common.main.ts` imports are preserved.

### 5.1 Directory structure

```
src/vs/workbench/contrib/
  model/      — Statistical / ML model webviews (Infer menu)
  explore/    — Data discovery and toolbox webviews (Explore menu)
  simulate/   — Simulation method webviews (Simulate menu)
  optimise/   — Optimisation method webviews (Optimise menu)
  katex/      — Bundled KaTeX for equation rendering in webviews
  mermaid/    — Bundled Mermaid for diagram rendering in Pollis webviews
```

Each contribution follows the four-file architecture documented in:
`src/vs/workbench/contrib/WEBVIEW_GUIDE.md`

### 5.2 `workbench.common.main.ts` imports

**File:** `src/vs/workbench/workbench.common.main.ts`

Each Pollis contribution is imported here. **After a rebase:** check that these imports survive; upstream may reorder or compact this file.

### 5.3 Media assets

Notebook tutorials and wiki stubs live under:
```
src/vs/workbench/contrib/model/browser/media/notebooks/
src/vs/workbench/contrib/model/browser/media/wiki/
```

These are entirely Pollis-owned and will not conflict with upstream.

### 5.4 Pollis app documents — build pipeline

**Files:** `src/vs/workbench/browser/media/pollis-release-notes.md`, `src/vs/workbench/browser/media/pollis-license.md`

Two Markdown files are bundled with every Pollis release so that "Show Release Notes" and "View License" (Help menu) open locally without requiring an internet connection.

Getting these files into the production build requires changes in **two separate places**. Omitting either one causes a "cannot be found" error at runtime:

| Step | File | Role |
|---|---|---|
| 1 | `build/next/index.ts` | Copies files from `src/` → `out-build/` (compile step) |
| 2 | `build/gulpfile.vscode.ts` | Packages files from `out-build/` → final app bundle |

Both files use the glob `vs/workbench/browser/media/pollis-*.md` (step 1, in `desktopResourcePatterns`) and `out-build/vs/workbench/browser/media/pollis-*.md` (step 2). The `pollis-*` prefix means any future Pollis app document added to that folder is automatically included without further build changes.

**After a rebase:** upstream will not have these glob entries; re-add them to both files.

### 5.5 Bundled third-party libraries in `contrib/`

Two third-party JS/CSS libraries are vendored directly into `src/vs/workbench/contrib/` so that Pollis webviews can load them as local resources without any npm dependency or network request. Both are used exclusively via their respective `*Helper.ts` files; nothing outside those helpers should reference the `dist/` folders directly.

| Library | Location | Helper | Purpose |
|---|---|---|---|
| **KaTeX** v0.16 | `contrib/katex/dist/` | `contrib/katex/browser/katexHelper.ts` | Equation rendering (`$…$`, `$$…$$`) in Pollis webviews |
| **Mermaid** v11 | `contrib/mermaid/dist/` | `contrib/mermaid/browser/mermaidHelper.ts` | Diagram rendering (` ```mermaid ``` ` blocks) in Pollis webviews |

`getMermaidUris()` and the KaTeX equivalent return webview-safe URIs; callers must add `distRoot` to `localResourceRoots` in the webview content options.

**After a rebase:** these folders are entirely Pollis-owned and will not be touched by upstream. However, verify the Mermaid and KaTeX versions against the npm packages used by any upstream extension that also bundles them, and upgrade `dist/` if a significant security patch has been released.

### 5.6 Forked built-in extensions

Pollis ships a modified version of the following upstream built-in extension:

**`extensions/language-julia`** — fork of [julia-vscode](https://github.com/julia-vscode/julia-vscode) (MIT).

The following changes have been made relative to upstream:

#### Rebranding (`package.json`)

| Field | Upstream value | Pollis value |
|---|---|---|
| `displayName` | `"Julia"` | `"Julia (Pollis)"` |
| `description` | upstream description | `"Julia Language Support (Pollis built-in fork of julia-vscode)"` |
| `publisher` | `"julialang"` | `"pollis"` |
| `bugs.url` | julia-vscode issues | `"https://github.com/Trumpingtons/pollis/issues"` (Help > Report Issue, §3.6) |

**After a rebase:** re-apply these four field values.

#### Telemetry removed (`src/telemetry.ts`)

Upstream ships Application Insights with hardcoded Azure instrumentation keys that transmit usage data and crash reports to the julia-vscode team. The entire `telemetry.ts` module has been replaced with a **no-op shim** that:
- Keeps every exported function signature intact (all call sites compile unchanged)
- Sends nothing anywhere
- Retains a listening pipe server (`startLsCrashServer`) so the Julia child process has a valid endpoint to connect to — reports received are silently dropped

**After a rebase:** upstream will restore the Application Insights client; replace `telemetry.ts` with the Pollis no-op shim.

#### LM tools added (`src/lmtool.ts`)

A new file `src/lmtool.ts` registers five VS Code language model tools that allow AI agents (e.g. Claude Code) to control the Julia REPL:

| Tool name | Action |
|---|---|
| `run-julia-code` | Execute a code string in the Julia REPL |
| `restart-julia-repl` | Restart the REPL process |
| `stop-julia-repl` | Stop the REPL process |
| `interrupt-julia-execution` | Send an interrupt signal to a running evaluation |
| `change-julia-environment` | Switch the active Julia package environment |

`LmToolFeature` is instantiated in `src/extension.ts` during activation.

**After a rebase:** upstream will not have `lmtool.ts`; re-add the file and re-add the `LmToolFeature` instantiation in `extension.ts`.

#### `extension.ts` — features removed and startup changed

Several upstream features are not activated in Pollis:

- **`ProfilerFeature`** — removed (import and instantiation deleted)
- **`WeaveFeature`** — removed (import and instantiation deleted)
- **`JuliaPackageDevFeature`** — removed (import and instantiation deleted)
- **`TestFeature`** — removed (import and instantiation deleted)
- **`tasks.activate()`** — removed (Julia Tasks feature not used in Pollis)
- **`completions.activate()`** — removed from `repl.activate` call chain
- **`languageClientFeature.startServer()`** — commented out; LanguageServer.jl is not started (JETLS.jl will replace it; the huge SymbolServer cache and crashing libpython indexing path are avoided)
- **`repl.activate()` signature** — no longer receives `profilerFeature` argument
- **`documentation.activate()` signature** — no longer receives `languageClientFeature` argument (see below)
- **Symbol-cache-download prompt** — removed (the `julia.symbolCacheDownload` config prompt is gone)
- **Telemetry-consent prompt** — removed (the `enableTelemetry` opt-in dialog is gone)
- **`startREPLOnStartup`** — added: if `julia.startREPLOnStartup` is `true`, the REPL is started automatically on extension activation (the block is in `repl.ts` `activate()`). It first looks for Julia with `getExecutable(false)`, which never offers to install, and skips the REPL silently when Julia is missing, so the modal "Automatically install Julia?" dialog does not open at every launch. The welcome page alert (§1.4) offers the installation instead. The setting itself is left alone, so the REPL starts on the next launch after Julia is installed
- **`startREPL` returns whether a REPL is running** — `startREPL()` and the `language-julia.startREPL` command resolve `true` when a REPL is running and `false` when Julia is not installed. The Pollis panels' `sendToJuliaRepl()` (`model.handler.ts`, also used by `installJuliaPackages` and Pluto) sends code only on `true`, so it never runs in another terminal
- **`getExecutable()` reports a missing juliaup** (`executables.ts`) — when neither Julia nor juliaup is found, it still sets `julia.juliaInstalled` to `false` and shows the "Julia: Not Installed" status bar item. Upstream lets the juliaup error escape before those lines, so the welcome page alert (§1.4) never appeared
- **`skipLibCheck`** (`tsconfig.json`) — the npm `@vscode/debugprotocol` typings use `declare module` for a namespace, which the newer TypeScript in the build rejects (TS1540)
- **`language-julia.retriggerInstallation`** (`executables.ts`) — installs Julia and then looks for it again, and nothing more. Upstream also installs the language server's channel (`getLsExecutable(true)`) and restarts the language server, which Pollis does not start

**After a rebase:** re-apply all removals, the commented-out `startServer()`, the `startREPLOnStartup` block (with its Julia check), the boolean `startREPL` result, the `retriggerInstallation` and `getExecutable()` changes, and `skipLibCheck`.

#### `src/interactive/repl.ts` — REPL status bar + doc lookup + startup setting

Three additions:

1. **`isConnected()` exported** — made `export` so `documentation.ts` can check REPL state.

2. **`getDocFromWord(word)` added** — new exported async function that sends a `repl/getdocfromword` request to the live REPL to retrieve documentation as Markdown. If no REPL is running, it starts one automatically. Used by the reworked documentation browser.

3. **REPL status-bar item** — a `vscode.StatusBarItem` (`$(circle-filled) Julia REPL` / `$(circle-outline) Julia REPL`) is created and shown in the left status bar. Clicking it:
   - Starts the REPL if not running
   - Shows a Quick Pick with **Show REPL / Restart REPL / Stop REPL** if running
   Updates on `onInit` and `onExit` REPL events. Command id: `language-julia.showREPLActions`.

4. **Profiler notifications removed** — `notifyTypeShowProfilerResult` handler deleted (profiler feature removed).

**After a rebase:** re-apply the `export` on `isConnected`, add `getDocFromWord`, add the status-bar block, remove the profiler notification handler.

#### `src/docbrowser/documentation.ts` — doc browser reworked to use REPL

Upstream fetches documentation via the Language Server (`julia/getDocAt`, `julia/getDocFromWord` LSP requests). Since Pollis does not start LanguageServer.jl, the doc browser is reworked to use the live REPL instead:

- **`activate()` signature** — `languageClientFeature` argument removed; no longer depends on the LSP client
- **`getDocumentationFromWord()`** — now calls `repl.getDocFromWord()` instead of an LSP request; returns `undefined` (no REPL available) instead of `''`
- **`getDocumentation()`** — replaced by `getWordAtCursor()` which uses a Julia-aware regex (`@?[A-Za-z_][\w!]*(?:\.[A-Za-z_][\w!]*)*`) to extract the symbol under the cursor
- **`showDocumentationForSelection()`** — now shows "Starting the Julia REPL…" feedback while the REPL connects, and "place the cursor on a symbol" guidance when no word is found
- **`setTransientHTML()`** — new private helper to display status messages without polluting browse history
- **Empty-doc handling** — renders `"No documentation found for \`word\`."` instead of blank when the REPL returns an empty string
- **Webview CSS** — additional rules added to prevent horizontal overflow: `pre-wrap`, `word-break: break-word`, `overflow-x: hidden` on code blocks; `display: block; overflow-x: auto` on tables; `max-width: 100%` on body

**After a rebase:** re-apply the full reworked `documentation.ts` (the changes are extensive — keep the Pollis file verbatim).

#### `src/interactive/plots.ts` — tabular grid viewer removed

Upstream renders `application/vnd.dataresource+json` and `application/vnd.dataresource+lazy` MIME types via `displayTable()` (a separate `tables.ts` module). Pollis removes this:
- Import of `displayTable` from `./tables` deleted
- Both `dataresource` MIME type branches replaced with `return // POLLIS: tabular grid viewer removed`

**After a rebase:** `tables.ts` will be present upstream; re-apply the two-line removal.

#### `src/interactive/workspace.ts` — test nodes removed; kernel display name improved

- **`TestControllerNode` and `TestProcessNode` classes** — deleted (test feature removed from Pollis)
- **Import of `JuliaTestController`, `JuliaTestProcess`** — deleted
- **Kernel display name** — changed from `"Julia <ver>"` / `"Julia <channel> channel"` to `"Julia <major>.<minor>.<patch>"` / `"Julia <channel> channel (<major>.<minor>.<patch>)"` for clarity in the notebook kernel selector

**After a rebase:** re-apply the two node class deletions and the display-name format change.

#### `src/notebook/notebookFeature.ts` — kernel display name improved

Same display-name fix as `workspace.ts`: `updateNotebookWithSelectedKernel` now accepts an optional `channel` parameter and formats the display name as `"Julia <channel> channel (<ver>)"` or `"Julia <ver>"` with explicit `major.minor.patch` components.

**After a rebase:** re-apply the signature change and display-name logic.

#### `src/notebook/notebookKernel.ts` — Pollis credentials injected into the kernel env

The kernel is spawned with `env = { ...process.env, ...getCustomEnvironmentVariables() }` — the **extension host's** environment, which does **not** inherit VS Code's terminal env-var collection. So a notebook kernel would not see the credentials Pollis injects into terminals (EDGAR's `SEC_USER_AGENT` and the FRED / Alpha Vantage / Hugging Face / Kaggle keys; see §5.7). The kernel-spawn `env` now also merges the result of the Pollis core command `pollis.credentialEnv`:

```ts
const credentialEnv = await vscode.commands
    .executeCommand<Record<string, string>>('pollis.credentialEnv')
    .then(e => e ?? {}, () => ({} as Record<string, string>))
const env = { ...process.env, ...getCustomEnvironmentVariables(), ...credentialEnv }
```

Falls back to `{}` when the command is absent (plain VS Code). This is what makes EDGAR / FRED / Kaggle / HF notebooks authenticate — including **hand-created** notebooks, not just webview-generated ones — without writing the secret into a cell or file. The core side (the `pollis.credentialEnv` command, the registry, the terminal injection) is §5.7.

**After a rebase:** re-apply the `pollis.credentialEnv` fetch and the `...credentialEnv` merge in `notebookKernel.ts`.

#### `src/smallcommands.ts` — linter toggle removed

- `toggleLinter()` function deleted
- `language-julia.toggleLinter` command registration deleted

**After a rebase:** re-apply these two removals.

#### Files removed entirely (present in upstream, absent in Pollis)

| Upstream file | Reason removed |
|---|---|
| `src/interactive/completions.ts` | Completion feature not used |
| `src/interactive/profiler.ts` | Profiler feature not used |
| `src/interactive/tables.ts` | Tabular grid viewer not used |
| `src/packagedevtools.ts` | Package dev tools feature not used |
| `src/tasks.ts` | Julia Tasks feature not used |
| `src/testing/` (directory) | Test runner feature not used |
| `src/weave.ts` | Weave feature not used |

**After a rebase:** ensure none of these files are imported or activated. Their imports have been removed from `extension.ts`.

### 5.7 Credential environment injection

Provider credentials (FRED / Alpha Vantage / Hugging Face / Kaggle API keys, stored masked) and EDGAR's non-secret SEC contact live in VS Code **Secret Storage**. Pollis mirrors them into the **process environment** so any Julia REPL, editor-run, terminal command, or notebook kernel picks them up — without opening a webview and without the values ever landing in a file. New and Pollis-owned; documented for webview authors in `WEBVIEW_GUIDE.md` §24.6.

**Files (Pollis-owned, no upstream conflict):**

| File | Role |
|---|---|
| `model/browser/common/credentials.ts` | Single source of truth: `CREDENTIALS` (named) + `POLLIS_CREDENTIAL_FIELDS` — every `secretKey → envVar` pair. The per-webview handlers spread these into their `createApiKeyWiring` fields. |
| `model/browser/credentialEnvironment.contribution.ts` | Workbench contribution (`AfterRestored`): reads the secrets, registers a **non-persistent** `IEnvironmentVariableService` collection (`Replace` + `applyAtProcessCreation`) so every terminal / REPL / editor-run gets the env vars; re-applies on `onDidChangeSecret`. Also registers the `pollis.credentialEnv` command (returns `{ envVar: value }`) consumed by the Julia notebook kernel (§5.6). |

Imported from `model/browser/model.contribution.ts` (alongside `juliaNotebookKernel.contribution.js`).

- **Off-disk:** the collection is registered **without** the `persistent` flag, so secret values are never serialized to workspace storage — kept in memory, re-read each session.
- **Notebook kernels** are a separate process that don't inherit the terminal collection; they are covered via the `pollis.credentialEnv` command + the `notebookKernel.ts` merge (§5.6).
- **Build wiring:** `extensions/language-julia` is bundled by its own esbuild and is **not** part of the default `watch-extensions` gulp task. The root `package.json` `watch` script therefore adds a **`watch-julia`** entry (mirroring `watch-copilot`) so the bundle rebuilds on change; otherwise edits to `notebookKernel.ts` (and any other `language-julia` change) silently won't take effect until a manual `node esbuild.mts`.

**After a rebase:** these files are Pollis-owned (no upstream equivalent) — verify the `model.contribution.ts` import survives, and re-add the `watch-julia` entry to the root `package.json` `watch` script.

### 5.8 Continuous integration and commit checks (`.github/`, `.githooks/`)

Upstream's 15 workflows were **removed** — they encode Microsoft's engineering process (API proposal checks, telemetry metadata, Monaco packaging, component screenshots, the multi-platform `pr.yml` matrix calling `pr-{darwin,linux,win32}-test.yml`, Copilot cache checks) and either fail or burn CI minutes on infrastructure Pollis does not have. `check-clean-git-state.sh` was **kept**: it is not a workflow and is still referenced by `build/azure-pipelines/dependencies-check.yml`.

The rest of Microsoft's `.github/` infrastructure was removed too: `CODEOWNERS`, `CODENOTIFY`, `ISSUE_TEMPLATE/` (Pollis has its own now, §3.6), `pull_request_template.md`, `dependabot.yml`, the triage-bot files (`classifier.json`, `commands.json`, `commands/`, `similarity.yml`, `insiders.yml`, `endgame/`), `hooks/`, `agents/`, and the AI guidance tied to Microsoft's process (Kusto/telemetry, Azure Pipelines, issue triage, CI screenshots, policies, Copilot chat, the Agents window). The generic engineering guidance is **kept**: 7 files in `instructions/` (plus `resources/`), 7 in `prompts/`, 7 in `skills/`. `copilot-instructions.md` **must stay** — `build/npm/postinstall.ts` links `.claude/CLAUDE.md` to it and `AGENTS.md` points to it.

**Pollis-owned files:**

| File | Role |
|---|---|
| `.github/workflows/pollis-build.yml` | Fast checks. `push`/`pull_request` on `main` plus `workflow_dispatch`, **self-hosted macOS runner**, 45 min timeout, cancels superseded runs. Steps: build-script typecheck → `compile-check-ts-native` → `valid-layers-check` → `eslint` → `test-node`. |
| `.github/workflows/pollis-package.yml` | Full minified build, **manual trigger only** (`workflow_dispatch`, 180 min timeout). Optionally runs the fast type and layer checks first (`run_checks`, default on), then `npm run gulp vscode-min`, which assembles the app into `../VSCode-darwin-arm64`, and reports the output sizes. The only job that proves Pollis actually ships; too slow for every push. |
| `.github/actions/pollis-setup/action.yml` | Composite action shared by both workflows: Node from `.nvmrc`, clean leftovers, cached `npm ci`. Input `install-binaries` (default `false`) — `true` for packaging, which needs the real Electron. |
| `.githooks/pre-commit` | Runs `npm run precommit` (`build/hygiene.ts` over the staged files): tabs, copyright header, unicode allowlist (which is what rejects accented and Greek characters in sources), TypeScript formatting, stylelint. |

Why each fast check is there (the full build does not cover them all):

- **`compile-check-ts-native`** — the packaged build type-checks too, so this adds no coverage; it just fails in seconds instead of minutes.
- **`valid-layers-check`** — type-checks against the restricted lib sets (browser / worker / node / electron-*). The build uses one permissive config, so a browser-layer file importing a node built-in compiles and bundles, then fails at runtime.
- **`eslint`** — unexternalized strings, disposable leaks, DI patterns: all type-correct and invisible to the compiler.
- **`test-node`** — behaviour rather than compilation; mainly a rebase safety net.

**Hygiene runs as a git hook, not in CI**, because indentation, formatting and headers have no runtime effect. The hook is not active until each clone enables it once:

```sh
git config core.hooksPath .githooks
```

Bypass it for a single commit with `git commit --no-verify`. To check files outside a commit, pass them to `node build/hygiene.ts` (use `xargs -0` for long lists; zsh does not word-split a variable).

Details that matter and are easy to lose:

- **`clean: false` on `actions/checkout`.** A default checkout runs `git clean -ffdx`, which deletes `node_modules` and `.build` and forces a full `npm ci` every run — by far the slowest step. With `clean: false` they persist between runs; the setup action's `git clean -fd` removes everything else except `node_modules`, `.build`, `out`, `out-build` and `out-vscode-min`.
- **Cached `npm ci`.** The setup action stores `<sha256 of package-lock.json> <variant>` in `.build/npm-ci-stamp` and skips the install when it matches. The variant (`full` or `skip-binaries`) is part of the stamp because the two produce different trees — so alternating between the two workflows re-runs `npm ci`. Installs are retried up to three times.
- **Binary downloads.** Without `install-binaries`, `ELECTRON_SKIP_BINARY_DOWNLOAD` and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` are set to `1`; with it they are set to empty, not `'0'`, because they are tested for presence and `'0'` is truthy. `pollis-build.yml` therefore covers type checking, linting and node unit tests but **not** Electron or browser integration tests — those stay local via `scripts/test.sh`.
- **`ELECTRON_RUN_AS_NODE: ''`** in both workflows. It is inherited from the Electron process tree when the runner is started from an editor terminal, and it breaks the build. Set to empty rather than unset so `if (process.env.ELECTRON_RUN_AS_NODE)` checks stay falsy.

**Upstream files modified for the Pollis header.** Pollis-authored files (847) carry:

```
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
```

Upstream checks Microsoft's header by exact match in two places, so both accept a second form. In each, the year is matched as `\d{4}(?:-\d{4})?`, so adding a file in a later year needs no change.

- **`build/hygiene.ts`** — `copyrightHeaderLines` is kept unchanged; `pollisCopyrightHeaderPatterns` (four regexes) and `hasValidCopyrightHeader(lines)` (Microsoft exact match **or** Pollis patterns) were added, and the `copyrights` stream calls it instead of the inline loop.
- **`eslint.config.js`** — in the `header/header` rule, the Microsoft copyright and licence lines were replaced with `{ pattern: … }` entries that accept either the Microsoft or the Pollis wording. Microsoft files keep their MIT line; Pollis files must use the AGPL line.
- **`build/lib/toml-to-ts.ts`** — emits the Pollis header into generated `*.data.ts` files.

**After a rebase:** re-apply the `build/hygiene.ts` and `eslint.config.js` changes (upstream will restore the exact-match checks). Re-delete any upstream workflows or other Microsoft `.github/` files that reappear, but keep `copilot-instructions.md`. `pollis-build.yml`, `pollis-package.yml`, `pollis-setup` and `.githooks/` are Pollis-owned and will not conflict.

---

## 6. Upstream Bug Patches (carry-forward)

Unlike §1–§5, which are **intentional Pollis customizations**, this section lists **bugs in upstream Code OSS** that Pollis patches locally. These are *not* Pollis features — on every rebase, re-check whether upstream has fixed them and **drop the patch once it has**. Until then, the patch must be re-applied or the bug returns.

### 6.1 Notebook editor renders blank after switching away and back

**Symptom.** Open any `.ipynb` (from a webview's *Notebook Tutorials* panel, or directly from the File Explorer) and run a cell — it renders fine. Switch to another editor/tab and switch back → the notebook is **completely blank**: no cells, no outputs, and the top toolbar (Generate / + Code / + Markdown / Run All / …) is missing. **Resizing the window does not restore it**, and **no error appears in the DevTools console** (it is a pure visibility/layout bug, not a crash).

**Scope.** All notebooks, **build-wide** — not specific to Pollis webviews (it reproduces with a plain `.ipynb` opened from the Explorer). It only manifests on a Chromium new enough to support **CSS anchor positioning** (the `supportsAnchorPositioning` path in `src/vs/base/browser/overlayLayoutElement.ts`), which this Electron build uses — which is why it surfaced here.

**Root cause.** Upstream commit **`618c5ea3667`** (Matt Bierner, 2026‑04‑14, *"Re-use anchor layout logic for notebooks too"*) refactored the notebook overlay onto the shared `OverlayLayoutElement`, which positions the overlay with **CSS anchor positioning** (`content.style.left = 'anchor(left)'`, `top: anchor(top)`, etc.). But `onWillHide()` still hides the overlay the **old** way — by both hiding it *and* parking it off-screen:

```ts
// notebookEditorWidget.ts — onWillHide()
this._overlayContainer.style.visibility = 'hidden';
this._overlayContainer.style.left = '-50000px';   // legacy off-screen hide
```

Before the refactor, the re-show path (`layoutContainerOverShadowElement`) wrote `style.top/left/width/height` directly every layout, which **reset** that `-50000px`. After the refactor the re-show path delegates to `OverlayLayoutElement.layoutOverAnchorElement`, which in the anchor branch **never touches `content.style.left`** (it relies on the CSS `left: anchor(left)`). So the inline `left: -50000px` set by `onWillHide()` is never cleared, and the refactor *also* dropped the symmetric `visibility = 'visible'`. Result: after the **first** hide (any tab switch), the overlay stays both `visibility: hidden` **and** parked at `left: -50000px` — the notebook renders blank on every return. No exception is thrown (pure layout state), which is why the console is clean. Only manifests on the anchor-positioning path.

**Status: FIXED locally (confirmed working with multiple notebooks).** The fix is to **reverse exactly the `notebookEditorWidget.ts` hunks of upstream commit `618c5ea3667`**, restoring the proven pre-refactor overlay logic (direct `top/left/width/height` + `visibility/display` written every layout, no `OverlayLayoutElement`/anchor positioning for the notebook overlay). `overlayLayoutElement.ts` and `overlayWebview.ts` are left untouched.

Apply with:
```bash
git show 618c5ea3667 -- src/vs/workbench/contrib/notebook/browser/notebookEditorWidget.ts > /tmp/nb.patch
git apply -R /tmp/nb.patch     # reverse-applies cleanly on the a8ce2be8dbe base
```
Then `npm run compile-check-ts-native` (zero errors) and reload the window.

**Verify** (the single-notebook case hides the bug — you MUST test two): open two notebooks via *New File → Jupyter Notebook*, run a cell in each, switch back and forth — each shows its own content with a working toolbar, no overlap. Confirmed good.

**A naive partial patch does NOT work — do not attempt it.** Restoring just `visibility = 'visible'` in `layoutNotebook()` and/or deleting the `left = '-50000px'` from `onWillHide()` regresses multi-notebook layouts (cells scattered, overlays overlapping), because `layoutNotebook()` also runs for non-active editors and the anchor re-show path never resets the off-screen `left`. Reverse the **whole** commit hunk, not pieces.

**Upstream has since FIXED this (your base just predates it).** Base `a8ce2be8dbe` is 2026-04-15; the regression (`618c5ea3667`) landed 2026-04-14, and the fixes landed days later: *"Make sure we clear notebook styles"* (Apr 17), *"Fix notebook style resets"* (Apr 19), *"Remove fallback for anchor positioning"* (Apr 23). Current `main`'s `onWillHide()` still parks at `-50000px`, but the show path now re-asserts the styles:
```ts
// layoutContainerOverShadowElement() on current main
this._overlayContainer.style.visibility = 'visible';
this._overlayLayout.setAnchorElement(anchorElement, { clippingContainer });
this._overlayLayout.reapplyLayoutStyles();   // re-applies anchor styles, clearing the -50000px
```

**On rebase: DROP this patch.** Any base newer than ~2026-04-23 already contains upstream's proper fix; keeping the reverse-patch would pin the notebook overlay to stale pre-anchor-positioning code. After rebasing, just re-run the two-notebook test to confirm upstream's fix is present, then remove this entry.

> This is **unrelated** to how Pollis *opens* notebooks (`model.handler.ts` — the transient-reference + kernel auto-select logic). That is a separate Pollis concern documented in `WEBVIEW_GUIDE.md` §18.10.

> This is **unrelated** to how Pollis *opens* notebooks (`model.handler.ts` — the transient-reference + kernel auto-select logic). That is a separate Pollis concern documented in `WEBVIEW_GUIDE.md` §18.10.

---

## 7. Rebase Checklist

When pulling a new upstream VS Code version, work through this list in order:

- [ ] **Branding** — restore `product.json` fields (§1.1, §1.2), restore Pollis icon (§1.3)
- [ ] **Welcome page** — re-add the excluded walkthroughs (`Setup`, `Beginner`, Copilot welcome), remove the empty Overview heading and the first-launch walkthrough branch, default `experimentalOnboarding` to `false`, and re-add the "Julia is not installed" alert (§1.4)
- [ ] **New windows maximized** — `window.newWindowDimensions` default `maximized` and the fallback in `windowsStateHandler.ts` (§1.6)
- [ ] **Copilot and AI** — keep Copilot Chat out of the packaged app in `build/gulpfile.vscode.ts` and default `chat.disableAIFeatures` to `true` in `chat.contribution.ts`; re-apply the Agents window guards, the `vs/sessions` build omissions and the source-map settings (§1.5)
- [ ] **Product interface** — re-add `pollisVersion`, `poweredBy`, `licenseName` and `sourceUrl` to `IProductConfiguration` (§1.2)
- [ ] **About dialog** — re-add `createNativeAboutDialogDetails` to `dialog.ts`, and the licence + source lines to `createBrowserAboutDialogDetails` (§2)
- [ ] **Menus open to extensions** — re-add the `menuBar/*` Pollis entries to `menusExtensionPoint.ts` (§3.5)
- [ ] **MenuId registrations** — re-add four `MenubarXxxMenu` IDs to `actions.ts` (§3.1)
- [ ] **Menu bar construction** — re-comment Selection/Go/Terminal; re-add four Pollis menu blocks in `menubar.ts` (§3.2)
- [ ] **Terminal menu items** — remove New Terminal / New Terminal Window / Split Terminal from `terminalMenus.ts` and the `&&Terminal` mnemonic title (§3.3)
- [ ] **`menubarControl.ts`** — re-add Pollis menu registrations to `MenubarMainMenu` (§3.4)
- [ ] **Help menu** — About first (non-mac), Welcome, Search Feature Requests, Report Issue, View License, View Third-Party Notices on all platforms; macOS app menu keeps only About; `reportIssueUrl` and `requestFeatureUrl` in `product.json`; the issue reporter's Pollis labels (§3.6)
- [ ] **Column Selection Mode** — re-add `MenubarViewMenu` entry to `toggleColumnSelection.ts` (§4.1)
- [ ] **Word Wrap** — remove `precondition: CAN_TOGGLE_WORD_WRAP` from View menu registration in `toggleWordWrap.ts` (§4.2)
- [ ] **`workbench.common.main.ts`** — verify all Pollis contribution imports are intact (§5.2)
- [ ] **Credential environment injection** — verify the `credentialEnvironment.contribution.js` import in `model/browser/model.contribution.ts`; re-add the `watch-julia` entry to the root `package.json` `watch` script (§5.7)
- [ ] **App document build pipeline** — re-add `pollis-*.md` glob to both `build/next/index.ts` (`desktopResourcePatterns`) and `build/gulpfile.vscode.ts` (§5.4)
- [ ] **Bundled libraries** — verify `contrib/katex/dist/` and `contrib/mermaid/dist/` are intact; check for security updates (§5.5)
- [ ] **Forked extensions** — re-apply all Pollis patches to `extensions/language-julia`: rebranding, telemetry shim, `lmtool.ts`, `extension.ts` removals, `repl.ts` additions, `documentation.ts` rework, `plots.ts` table removal, `workspace.ts`/`notebookFeature.ts` kernel display name, `notebookKernel.ts` credential env merge, `smallcommands.ts` linter removal, and all deleted upstream files (§5.6)
- [ ] **Notebook blank-on-revisit patch — DROP if base > 2026-04-23** — Pollis reverses the `notebookEditorWidget.ts` hunks of `618c5ea3667`. Upstream fixed this properly by ~Apr 23 2026, so on any newer base **do not re-apply**; instead leave `notebookEditorWidget.ts` pristine and run the two-notebook test to confirm upstream's fix. Only re-apply if rebasing onto a base in the Apr 14–22 2026 window (§6.1)
- [ ] **CI and headers** — re-apply the Pollis header patterns in `build/hygiene.ts` and `eslint.config.js`; re-delete upstream workflows and Microsoft `.github/` files that reappear, keeping `copilot-instructions.md` (§5.8)
- [ ] **Compile** — run `npm run compile-check-ts-native`, zero errors before declaring done
