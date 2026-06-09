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

**After a rebase:** re-apply these values; upstream will reset them to VS Code defaults.

### 1.2 `poweredBy` object

**File:** `product.json`

A custom `poweredBy` object records the versions of the runtimes bundled with Pollis:

```json
"poweredBy": {
  "gemma":   "...",
  "julia":   "...",
  "duckdb":  "...",
  "lancedb": "...",
  "codeoss": "..."
}
```

**File:** `src/vs/base/common/product.ts`

The `IProductConfiguration` interface is extended with:

```typescript
readonly pollisVersion?: string;
readonly poweredBy?: {
  readonly gemma?: string;
  readonly julia?: string;
  readonly duckdb?: string;
  readonly lancedb?: string;
  readonly codeoss?: string;
};
```

**After a rebase:** upstream will not have these fields; re-add both the `product.json` values and the interface extension.

### 1.3 Application icon

**File:** `resources/darwin/code.icns`

Replaced with the Pollis icon. **After a rebase:** restore the Pollis `.icns` file.

---

## 2. About Dialog

**File:** `src/vs/platform/dialogs/electron-browser/dialog.ts`

Upstream VS Code uses `dialog.ts` only for native dialog wrappers. Pollis replaces the About dialog content with a custom `createNativeAboutDialogDetails()` function that produces:

```
Version: <pollisVersion>
Build Date: <date formatted as "31 May 2026">
© <year> Antonio Saragga Seabra

Powered by
· AI: Gemma <version>
· Analytics: Julia <version>
· Databases: DuckDB <version>, LanceDB <version>
· Platform: Code OSS <version>
```

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

Five new top-level menu IDs are declared:

```typescript
static readonly MenubarExploreMenu  = new MenuId('MenubarExploreMenu');
static readonly MenubarModelMenu    = new MenuId('MenubarModelMenu');   // "Infer"
static readonly MenubarSimulateMenu = new MenuId('MenubarSimulateMenu');
static readonly MenubarOptimiseMenu = new MenuId('MenubarOptimiseMenu');
static readonly MenubarComposeMenu  = new MenuId('MenubarComposeMenu');
```

**After a rebase:** upstream will not have these; re-add all five.

### 3.2 Menu bar construction

**File:** `src/vs/platform/menubar/electron-main/menubar.ts`

The native menu bar is assembled in `_updateMenubar()`. Pollis makes the following changes relative to upstream:

#### Menus removed
| Upstream menu | Action |
|---|---|
| Selection | Commented out — items available via Command Palette and View menu |
| Go | Commented out — navigation via keybindings |
| Terminal | Commented out as a top-level menu — items redistributed (see §3.3) |

#### Menus added (in order after Run)
| Pollis menu | MenuId | Notes |
|---|---|---|
| Explore | `MenubarExploreMenu` | Data discovery, toolboxes (Economics, Robotics, etc.) |
| Infer | `MenubarModelMenu` | Statistical and ML model webviews |
| Simulate | `MenubarSimulateMenu` | Simulation methods |
| Optimise | `MenubarOptimiseMenu` | Optimisation methods |
| Compose | `MenubarComposeMenu` | Workflow composition + Tasks (moved from Terminal) |

The Run menu is upstream VS Code — no changes.

**After a rebase:** the upstream file will restore Selection, Go, and Terminal as top-level menus, and will not have the five Pollis menus. Re-apply all commented-out blocks and re-add the five new menu blocks.

### 3.3 Tasks moved from Terminal to Compose

**File:** `src/vs/workbench/contrib/terminal/browser/terminalMenus.ts`  
**File:** `src/vs/workbench/contrib/terminal/browser/terminal.contribution.ts`

All task-related menu items that upstream registers under `MenubarTerminalMenu` are re-registered under `MenubarComposeMenu` in Pollis. Terminal-specific items (new terminal, split, kill, etc.) remain in the terminal contribution but are no longer exposed at the top-level menu since the Terminal top-level menu is removed.

**After a rebase:** upstream will re-add terminal items to `MenubarTerminalMenu`; re-move task items to `MenubarComposeMenu`.

### 3.4 Pollis menus registered in `menubarControl.ts`

**File:** `src/vs/workbench/browser/parts/titlebar/menubarControl.ts`

The five Pollis menus are registered into `MenubarMainMenu` with their display titles and ordering. Terminal is registered into `MenubarViewMenu` as a panel toggle (View → Terminal) rather than as a standalone top-level menu.

**After a rebase:** upstream will not have these registrations; re-add them.

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
  compose/    — Workflow composition (Compose menu)
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

Two Markdown files are bundled with every Pollis release so that "Show Release Notes" and "View License" in the Pollis app menu open locally without requiring an internet connection.

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

**After a rebase:** re-apply these three field values.

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
- **`startREPLOnStartup`** — added: if `julia.startREPLOnStartup` is `true`, the REPL is started automatically on extension activation

**After a rebase:** re-apply all removals, the commented-out `startServer()`, and the `startREPLOnStartup` block.

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
- [ ] **Product interface** — re-add `pollisVersion` and `poweredBy` to `IProductConfiguration` (§1.2)
- [ ] **About dialog** — re-add `createNativeAboutDialogDetails` to `dialog.ts` (§2)
- [ ] **MenuId registrations** — re-add five `MenubarXxxMenu` IDs to `actions.ts` (§3.1)
- [ ] **Menu bar construction** — re-comment Selection/Go/Terminal; re-add five Pollis menu blocks in `menubar.ts` (§3.2)
- [ ] **Tasks → Compose** — re-move task items from `MenubarTerminalMenu` to `MenubarComposeMenu` (§3.3)
- [ ] **`menubarControl.ts`** — re-add Pollis menu registrations to `MenubarMainMenu` (§3.4)
- [ ] **Column Selection Mode** — re-add `MenubarViewMenu` entry to `toggleColumnSelection.ts` (§4.1)
- [ ] **Word Wrap** — remove `precondition: CAN_TOGGLE_WORD_WRAP` from View menu registration in `toggleWordWrap.ts` (§4.2)
- [ ] **`workbench.common.main.ts`** — verify all Pollis contribution imports are intact (§5.2)
- [ ] **App document build pipeline** — re-add `pollis-*.md` glob to both `build/next/index.ts` (`desktopResourcePatterns`) and `build/gulpfile.vscode.ts` (§5.4)
- [ ] **Bundled libraries** — verify `contrib/katex/dist/` and `contrib/mermaid/dist/` are intact; check for security updates (§5.5)
- [ ] **Forked extensions** — re-apply all Pollis patches to `extensions/language-julia`: rebranding, telemetry shim, `lmtool.ts`, `extension.ts` removals, `repl.ts` additions, `documentation.ts` rework, `plots.ts` table removal, `workspace.ts`/`notebookFeature.ts` kernel display name, `smallcommands.ts` linter removal, and all deleted upstream files (§5.6)
- [ ] **Notebook blank-on-revisit patch — DROP if base > 2026-04-23** — Pollis reverses the `notebookEditorWidget.ts` hunks of `618c5ea3667`. Upstream fixed this properly by ~Apr 23 2026, so on any newer base **do not re-apply**; instead leave `notebookEditorWidget.ts` pristine and run the two-notebook test to confirm upstream's fix. Only re-apply if rebasing onto a base in the Apr 14–22 2026 window (§6.1)
- [ ] **Compile** — run `npm run compile-check-ts-native`, zero errors before declaring done
