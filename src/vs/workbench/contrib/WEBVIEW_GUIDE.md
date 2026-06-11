# Pollis Webview Creation Guide

---

## ⚠️ MANDATORY: Always use `buildWebviewHtml()` — never write raw HTML in a template

**Every new template file MUST call `buildWebviewHtml()` and supply only the webview-specific parts.** The scaffold owns all shared CSS, layout, boilerplate JS (helpers, right-panel logic, message handling, code-action buttons, Mermaid wiring, collapsible panes, etc.). A template that re-implements any of this is wrong.

### 🚀 **RECOMMENDED FOR NEW WEBVIEWS: Use `webviewScaffoldLite.ts`**

**For all new webviews (especially TOML-based ones), import from `webviewScaffoldLite.ts` instead of `webviewScaffold.ts`.** The Lite scaffold is simpler, faster, and eliminates the need for `kw()`, `fn()`, `ty()` helper functions entirely:

```typescript
import { buildWebviewHtml } from './webviewScaffoldLite.js';

export function getXxxHtml(mermaidJs?: string): string {
    return buildWebviewHtml({
        title: 'My Webview',
        mermaidJs,
        defaultModel: 'foo',
        modelsLiteral: "['foo', 'bar']",
        togglesJs: `...`,
        bullets: `...`,
        decisionRows: `...`,
        miniChartsJs: `...`,
        codeBranchesJs: `currentPlainCode = "using Foo\\n...";`,  // Plain Julia, no kw()/fn()/ty()!
        actionsJs: `...`,
    });
}
```

**Why `webviewScaffoldLite`:**
- ✅ `codeBranchesJs` contains **plain Julia code** (no HTML building)
- ✅ No `kw()`, `fn()`, `ty()` helper functions needed
- ✅ Cleaner, more readable code
- ✅ Theme-aware syntax highlighting via Monaco tokenizer (automatic)
- ✅ Perfect match for TOML-based template generation
- ✅ Shorter template files (~150–400 lines vs. ~300–500 with helpers)

**Old `webviewScaffold.ts` is still supported** for backward compatibility with existing templates that use `kw()`/`fn()`/`ty()` spans. Do **not** use it for new work.

```typescript
import { buildWebviewHtml } from './webviewScaffold.js';

export function getXxxHtml(mermaidJs?: string): string {
    return buildWebviewHtml({
        title: 'My Webview',
        mermaidJs,
        defaultModel: 'foo',
        modelsLiteral: "['foo', 'bar']",
        togglesJs: `...`,
        bullets: `...`,
        decisionRows: `...`,
        miniChartsJs: `...`,
        codeBranchesJs: `...`,
        actionsJs: `...`,
    });
}
```

A correct template file should be **~150–450 lines** — all of that content being webview-specific data (toggle buttons, bullet text, decision table rows, mini-chart SVG functions, code-branch functions, action arrays). If a template exceeds ~500 lines, it is almost certainly re-implementing scaffold boilerplate that belongs in `webviewScaffold.ts`.

**Sync rule:** This file has a mirror in memory at
`/Users/antonio/.claude/projects/-Users-antonio-vscode/memory/project_pollis_webview_guide.md`.
Whenever this file is updated, the memory file must be updated to match (and vice versa). Always keep both in sync.

**Location:** `src/vs/workbench/contrib/WEBVIEW_GUIDE.md` — applies to all Pollis menu contributions: `model/`, `explore/`, `simulate/`, `optimise/`, `compose/`.

---

## 1. Four-file architecture

Every webview is built from exactly four files, named by a short acronym (e.g. `clh`, `hare`, `lmar`):

```
common/<acronym>.types.ts      — IXxxMetadata interface + XxxWebviewMessage type
handlers/<acronym>.handler.ts  — registerXxxWebviewHandlers()
commands/<acronym>.command.ts  — XXX_METADATA constant + openXxxWebview() function
webviews/<acronym>.template.ts — getXxxHtml() returning the full HTML string
```

Then in `model.contribution.ts`:
- Import `openXxxWebview` from the command file
- Register with `CommandsRegistry.registerCommand('chiara.statistics.<group>.<name>', accessor => openXxxWebview(accessor.get(...), ...))`
- Add a menu item to the relevant submenu

---

## 2. CSS — shared boilerplate

**All webviews share the same CSS block.** Copy it verbatim from `lp.template.ts`. Key rules:

- `max-width: 900px; margin: 0 auto; padding: 24px` — the container
- `h1` — `font-size: 32px; font-weight: 300` (light, not bold)
- `.model-toggle` — `display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; flex-wrap: wrap`
- `.toggle-btn` — `background: var(--vscode-list-hoverBackground); border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 35px; transition: background 0.15s; white-space: nowrap;` **CRITICAL: Copy these three toggle rules exactly as shown — do not omit `white-space: nowrap;`, `font-size`, `font-family`, `color`, `cursor`, or `transition`. Missing any of these breaks the style match with Linear Programming.**
- `.toggle-btn.active` — `background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background)`
- `.toggle-btn:not(.active):hover` — `background: var(--vscode-list-activeSelectionBackground)`
- `.form-input` — monospace, `border: 1px solid var(--vscode-input-border)`, focus uses `var(--vscode-focusBorder)`
- `textarea.form-input` — `height: 37px`, `resize: none`, `overflow-x: auto`, no scrollbar
- `.param-input` — adds `text-align: center` for numeric parameter fields
- `.eq-block` — Georgia/Times serif font, `line-height: 2`
- `.code-line` — `white-space: pre` (critical — preserves alignment)
- `.hl-keyword / .hl-fn / .hl-type` — VS Code token colour variables
- `.code-comment` — `color: #6A9955` (green, italic)

### New layout CSS (left strip + right panel)

```css
.bottom-layout { display: grid; grid-template-columns: 160px 1fr; gap: 24px; margin-top: 20px; align-items: start; }
.left-strip { display: flex; flex-direction: column; }
.strip-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
.strip-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 10px 0; }
.column-list { list-style: none; padding: 0; margin: 0; }
.column-list li { margin: 0; }
.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; }
.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
.panel-active { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
.paper-links { display: none; }
.right-panel { border-left: 1px solid var(--vscode-widget-border); padding-left: 20px; display: none; min-width: 0; }  /* min-width: 0 is CRITICAL */
.right-panel-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--vscode-foreground); }
.right-action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 8px; }
.action-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 8px 10px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; }
.action-card:hover { background: var(--vscode-list-hoverBackground); }
.action-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); }
.action-desc { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 3px; line-height: 1.4; }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.panel-back { background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0; }
.panel-back:hover { color: var(--vscode-textLink-activeForeground); }
.panel-close { background: transparent; border: none; color: var(--vscode-descriptionForeground); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; }
.panel-close:hover { color: var(--vscode-foreground); }
.panel-code-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.panel-code-desc { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; }
```

### Notebook Tutorials and Local Wikis cards — copy verbatim from `ptp.template.ts`

These rules apply to both the Notebook Tutorials and Local Wikis right panels. **Copy them exactly — do not invent variants.**

```css
.nb-section-title { font-size: 11px; font-weight: 600; color: var(--vscode-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin: 14px 0 6px 0; }
.nb-section-title:first-child { margin-top: 0; }
.nb-panel-scroll { overflow-y: auto; max-height: 70vh; padding-right: 4px; }
.nb-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px 12px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; transition: background 0.1s; }
.nb-card:hover { background: var(--vscode-list-hoverBackground); border-color: var(--vscode-textLink-foreground); }
.nb-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); margin-bottom: 4px; }
.nb-desc { font-size: 11px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
```

Cards use `.right-action-grid` (`repeat(auto-fill, minmax(155px, 1fr))`), which fills the right panel width and naturally produces **at most 3 cards per row** given the `160px 1fr` bottom-layout grid. Do not change the grid rule or the card padding — they are calibrated together to produce the correct 3-column layout.

**Model-specific row visibility** (multi-model webviews only):
```css
.km-row, .kmed-row, .fcm-row { display: none; }
```

### Collapsible panes (Illustration, Solver Guide, etc.)

**Copy these rules exactly — do not invent variants.**

```css
.illus-section { margin: 0 0 20px 0; }
.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
.illus-toggle:hover { text-decoration: underline; }
.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
.illus-section.collapsed .illus-body { display: none; }
.illus-body { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px 20px; overflow-x: auto; }
```

Rules:
- **Color**: always `var(--vscode-textLink-foreground)` — same as all other clickable elements.
- **Hover**: `text-decoration: underline` only — no opacity tricks. The underline applies to the text label only; the SVG chevron is unaffected.
- **No opacity dimming**: full colour at all times.
- **Chevron direction**: the chevron SVG points down `∨` by default (expanded state). When collapsed, `rotate(-90deg)` rotates it to point right `>`. This matches VS Code's tree view convention.
- **Never use** `rotate(180deg)` or `:not(.collapsed)` rotation — those are non-standard variants that have been eliminated.

---

## 3. HTML structure (top to bottom)

```html
<div class="container">
  <!-- Header -->
  <h1>Model Name</h1>
  <div class="powered-by">Powered by: <span id="package-links"></span></div>
  <!-- Subtitle bullets -->
  <div class="subtitle">
    <ul class="methods-list">
      <li><strong>Method A</strong> &#8212; brief description of what it does and when to use it</li>
      <li><strong>Method B</strong> &#8212; brief description of what it does and when to use it</li>
    </ul>
  </div>

  <!-- Model toggle (omit if single variant) -->
  <div class="model-toggle" id="model-group">
    <button class="toggle-btn" data-model="xxx">Label</button>
    ...
  </div>

  <!-- Collapsible equations -->
  <div class="eq-section" id="eq-section">
    <button class="eq-toggle" id="eq-toggle">
      <span class="eq-chevron"><!-- chevron SVG --></span>Model equations
    </button>
    <div class="eq-block" id="eq-block"></div>
  </div>

  <!-- Parameter form — all inputs in a SINGLE form-row -->
  <div class="form-row">
    <div class="form-group">...</div>
    <div class="form-group">...</div>
    <div class="form-group">...</div>
  </div>

  <!-- Code preview -->
  <div class="code-preview-wrapper">
    <div class="code-preview" id="code-preview"></div>
    <button class="copy-btn" id="btn-copy">Copy</button>
  </div>

  <!-- NEW: left strip + right panel -->
  <div class="bottom-layout">
    <div class="left-strip">
      <div class="strip-title">Next Steps</div>
      <ul class="column-list">
        <li><button class="list-btn panel-toggle" id="btn-viz"><!-- SVG -->Visualise</button></li>
        <li><button class="list-btn panel-toggle" id="btn-diagnose"><!-- SVG -->Diagnose</button></li>
        <li><button class="list-btn panel-toggle" id="btn-predict"><!-- SVG -->Predict</button></li>
        <li><button class="list-btn panel-toggle" id="btn-compare"><!-- SVG -->Compare</button></li>
        <li><button class="list-btn panel-toggle" id="btn-interpret"><!-- SVG -->Interpret</button></li>
      </ul>
      <hr class="strip-divider">
      <div class="strip-title">Learn More</div>
      <ul class="column-list">
        <li><button class="list-btn panel-toggle" id="btn-wiki"><!-- SVG -->Local Wikis</button></li>
        <li><button class="list-btn panel-toggle" id="btn-notebook-tutorials"><!-- SVG -->Notebook Tutorials</button></li>
        <li><button class="list-btn has-actions" id="btn-documentation"><!-- SVG -->Multimedia Tutorials</button></li>
        <li><button class="list-btn has-actions" id="btn-paper"><!-- SVG -->Explore References</button></li>
      </ul>
      <div class="paper-links" id="paper-links"></div>
    </div>
    <div class="right-panel" id="right-panel"></div>
  </div>
</div>
```

### Subtitle: bullets (`methods-list`)

Use a `<ul class="methods-list">` in the subtitle area below "Powered by". One bullet per method or key capability — short, scannable descriptions. Bold the method name, then an em-dash `&#8212;`, then a brief description.

CSS (copy verbatim):
```css
.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; }
.methods-list { list-style: none; padding-left: 0; margin: 5px 0; }
.methods-list li { margin: 2px 0; padding-left: 20px; position: relative; }
.methods-list li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
```

**Vertical rhythm — critical design principle:** The 16px unit repeats at every major vertical break in the header: `h1` → `powered-by` (16px gap) → bullets → `model-toggle` (16px gap). This consistent rhythm is what makes the header feel intentional rather than assembled. The `.subtitle` bottom margin of `16px` is what preserves this rhythm — never set `.subtitle { margin: 0 }`, which collapses the gap before the toggles to only 5px and breaks the cadence.

**Acronym guidance:** When first introducing a method or concept with an acronym, spell out the full name at first use using the form **"Full Name (ACRONYM)"** — e.g. "Linear Quadratic Regulator (LQR)", "Unified Robot Description Format (URDF)". This is the only accepted form; "ACRONYM (Full Name)" is not used. All subsequent uses in the same webview may use the acronym alone.

### Decision Table

Some webviews include a three-column Decision Table for structured method comparison. CSS (copy verbatim):

```css
.decision-table { border-collapse: collapse; width: 100%; font-size: 12px; }
.decision-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--vscode-widget-border); color: var(--vscode-foreground); font-weight: 600; white-space: nowrap; }
.decision-table td { padding: 5px 10px; border-bottom: 1px solid var(--vscode-widget-border); color: var(--vscode-foreground); vertical-align: top; line-height: 1.4; }
.decision-table tr:last-child td { border-bottom: none; }
.decision-table td:first-child { color: var(--vscode-textLink-foreground); font-weight: 500; white-space: nowrap; }
.decision-table td:nth-child(2) { white-space: nowrap; }
```

Column 2 must always reflect the *deciding criterion* — the reason to choose the method — never a consequence of it. Keep values brief (one to four words). The column header itself should be one word, two at most.

Column choices by webview type:
- **Method + Output + Use when** — ODE Inference
- **Filter + System + Use when** — State-Space Inference
- **Model + Structure + Use when** — System Identification
- **Model + Decomposition + Use when** — Time-Series Forecasting

### Topics / Toggle buttons

The **model-toggle group** (`.model-toggle`) presents the selectable topics or methods for a multi-method webview. Each `<button class="toggle-btn" data-model="...">` represents one topic.

**Purpose of the toggle group:**
- Lets the user switch the active topic without reopening the webview.
- Drives three things simultaneously: the active button highlight, the visibility of model-specific input fields (`.xxx-row` show/hide), and the code preview content.
- Sends a `setModel` message from the handler's `setTimeout` on first load when `initialModel` is provided, so callers can deep-link to a specific topic.

**Naming and labelling rules:**
- Use concise title-case labels that match the corresponding bullet in the subtitle exactly. This gives the user a clear one-to-one mapping between the bullets and the buttons.
- Acronyms in toggle labels do **not** need expansion — the subtitle bullets already explain each method. Expanding acronyms in buttons makes them too long for the fixed-height `35px` strip.
- Keep labels ≤ 20 characters so they wrap gracefully on narrow panels (`flex-wrap: wrap` is set on `.model-toggle`).

**Code key (`data-model` attribute):**
- Use a short lowercase ASCII key with no spaces (e.g. `scene`, `anim`, `frame`, `urdf`). This key doubles as the CSS class prefix for row visibility: `.scene-row`, `.anim-row`, etc.
- The key must be stable — changing it breaks any external callers that pass `initialModel`.

**Row visibility pattern:**
Each model-specific input field group carries `class="form-group <key>-row"` and starts hidden (`style="display: none;"` for all non-default keys). `setModel()` sets `display: 'flex'` for the active key and `'none'` for all others.

CSS required (add to the `<style>` block):
```css
.decision-table { border-collapse: collapse; width: 100%; font-size: 12px; }
.decision-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--vscode-widget-border); color: var(--vscode-foreground); font-weight: 600; }
.decision-table td { padding: 5px 10px; border-bottom: 1px solid var(--vscode-widget-border); color: var(--vscode-foreground); vertical-align: top; line-height: 1.4; }
.decision-table tr:last-child td { border-bottom: none; }
.decision-table td:first-child { color: var(--vscode-textLink-foreground); font-weight: 500; white-space: nowrap; }
```

Add `white-space: nowrap` to specific columns when their content must stay on one line (e.g. `td:nth-child(2)` for a formula-heavy Structure column).

---

### Next Steps order — mandatory
`Visualise → Diagnose → Predict → Compare → Interpret`

All five use `class="list-btn panel-toggle"` — they all open the right panel. None use `has-actions`.

### Learn More order — mandatory
`Local Wikis → Notebook Tutorials → Multimedia Tutorials → Concept Map → Explore References`

All five must always be present. Classes differ:

| Button | Class | Behaviour |
|---|---|---|
| Local Wikis | `panel-toggle` | Opens right panel with `.nb-card` sections (same pattern as Notebook Tutorials) |
| Notebook Tutorials | `panel-toggle` | Opens right panel with `.nb-card` sections |
| Multimedia Tutorials | `has-actions` | VS Code QuickPick via `openVideoList` |
| Concept Map | `panel-toggle` | Opens right panel with an inline-SVG relationship graph (see below) |
| Explore References | `has-actions` | Two-panel right panel (list + details) via `openDocs paper` |

> ⚠️ **Multimedia Tutorials must always be included.** It is easy to omit by mistake — the button ID is `btn-documentation` and the message command is `openVideoList` (not `openMultimedia`). Add `| { command: 'openVideoList' }` to `XxxWebviewMessage` and `case 'openVideoList'` to the handler. If no videos exist yet, `openVideoList` will show an empty QuickPick — that is acceptable.

### Explore References — two-pane side-by-side layout in right panel

**NEW:** Explore References now displays references in a **right panel instead of a QuickPick**, using a true two-pane side-by-side layout:
- **Left pane (60%):** Scrollable reference list with title, authors, year, and "Open Access" badge when applicable
- **Right pane (40%):** Selected reference title (as header) with two action buttons: "Open in Browser" and "Copy BibTeX to Clipboard"
- **Placeholder:** "Select a reference to view details" when nothing is selected
- **Active state:** Selected reference item highlighted with `.active` class for clear visual feedback

This two-pane layout scales better than QuickPick for reference lists and keeps the user in the webview context without switching to external windows.

**Handler wiring** — send references to webview instead of using QuickPick:

```typescript
case 'openDocs':
    if (msg.target === 'paper') {
        const papers = data.references.filter((r): r is IModelPaper => !('separator' in r));
        webviewInput.webview.postMessage({ command: 'showReferences', references: papers });
    } else if (msg.target === 'repository') {
        // ... existing repository logic ...
    }
    break;
case 'openReference': {
    const papers = data.references.filter((r): r is IModelPaper => !('separator' in r));
    const paper = papers.find(p => p.title === msg.id);
    if (paper) {
        const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
        if (url) { await openInBrowser(url, commandService); }
    }
    break;
}
```

**Webview message types** — add to `XxxWebviewMessage`:
```typescript
| { command: 'showReferences'; references: IModelPaper[] }
| { command: 'openReference'; id: string }
```

**JS implementation** — use `extraJs` and `extraCss` in the template to avoid modifying the shared scaffold:

```typescript
extraCss: `
    .refs-container { display: flex; gap: 16px; height: 400px; }
    .refs-list-panel { flex: 0 0 60%; overflow-y: auto; padding-right: 8px; }
    .refs-actions-panel { flex: 0 0 40%; border-left: 1px solid var(--vscode-widget-border); padding-left: 16px; overflow-y: auto; }
    .references-list { display: flex; flex-direction: column; gap: 8px; }
    .reference-item { background: var(--vscode-list-hoverBackground); border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px; text-align: left; cursor: pointer; transition: all 0.2s; }
    .reference-item:hover { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
    .reference-item.active { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
    .ref-title { display: block; font-weight: 500; color: var(--vscode-foreground); margin-bottom: 4px; word-break: break-word; }
    .ref-desc { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); }
    .action-btn { display: block; width: 100%; margin-bottom: 8px; padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer; font-size: 12px; transition: background 0.2s; }
    .action-btn:hover { background: var(--vscode-button-hoverBackground); }
    .ref-placeholder { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; padding: 20px 10px; }
`,
extraJs: `
    var currentReferences = [];
    var selectedRefIdx = null;
    var rightPanel = document.getElementById('right-panel');

    window.addEventListener('message', function(event) {
        if (event.data.command === 'showReferences') {
            currentReferences = event.data.references || [];
            renderReferencesPanel();
        }
    });

    function renderReferencesList() {
        if (currentReferences.length === 0) { return; }
        var html = '<div class="panel-header">'
            + '<span class="right-panel-title">Explore References</span>'
            + '<button class="panel-close" id="btn-refs-close">&#xd7;</button>'
            + '</div>'
            + '<div class="refs-container">'
            + '<div class="refs-list-panel">'
            + '<div class="references-list">';
        currentReferences.forEach(function(ref, idx) {
            var desc = (ref.authors || '') + ' · ' + (ref.year || '');
            if (ref.openAccess) { desc += ' · Open Access'; }
            html += '<button class="reference-item" data-idx="' + idx + '">'
                + '<span class="ref-title">' + esc(ref.title || '') + '</span>'
                + '<span class="ref-desc">' + esc(desc) + '</span>'
                + '</button>';
        });
        html += '</div></div>'
            + '<div class="refs-actions-panel">'
            + '<div class="ref-placeholder">Select a reference to view details</div>'
            + '</div>'
            + '</div>';
        rightPanel.innerHTML = html;
        rightPanel.style.display = 'block';
        document.getElementById('btn-refs-close').addEventListener('click', function() {
            rightPanel.innerHTML = '';
            rightPanel.style.display = 'none';
        });
        document.querySelectorAll('.reference-item').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(btn.dataset.idx, 10);
                var ref = currentReferences[idx];
                if (ref) {
                    document.querySelectorAll('.reference-item').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    renderReferenceDetails(ref);
                }
            });
        });
    }

    function renderReferenceDetails(ref) {
        var html = '<div style="font-weight: 600; margin-bottom: 16px; color: var(--vscode-foreground); word-break: break-word;">' + esc(ref.title || '') + '</div>'
            + '<button class="action-btn" id="btn-open-ref">Open in Browser</button>'
            + '<button class="action-btn" id="btn-copy-bibtex">Copy BibTeX to Clipboard</button>';
        var actionsPanel = document.querySelector('.refs-actions-panel');
        actionsPanel.innerHTML = html;
        document.getElementById('btn-open-ref').addEventListener('click', function() {
            vscode.postMessage({ command: 'openReference', id: ref.title });
        });
        document.getElementById('btn-copy-bibtex').addEventListener('click', function() {
            var bibtex = generateBibTeX(ref);
            navigator.clipboard.writeText(bibtex).then(function() {
                var btn = document.getElementById('btn-copy-bibtex');
                var original = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(function() { btn.textContent = original; }, 2000);
            });
        });
    }

    function generateBibTeX(ref) {
        var type = ref.doi ? 'online' : 'misc';
        var key = (ref.title || 'ref').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        var bibtex = '@' + type + '{' + key + ',\\n'
            + '  title={' + (ref.title || '') + '},\\n'
            + '  author={' + (ref.authors || '') + '},\\n'
            + '  year={' + (ref.year || '') + '},\\n';
        if (ref.journal) { bibtex += '  journal={' + ref.journal + '},\\n'; }
        if (ref.doi) { bibtex += '  doi={' + ref.doi + '},\\n'; }
        if (ref.url) { bibtex += '  url={' + ref.url + '},\\n'; }
        bibtex += '}';
        return bibtex;
    }
`,
```

**Key differences from QuickPick:**
1. No modal dialog — references stay visible alongside the webview
2. True side-by-side two-pane layout: list (60%) + actions (40%)
3. Left pane has all reference details (title, authors, year, open access badge)
4. Right pane shows only selected reference's title + action buttons
5. Active reference item highlighted with `.active` class
6. BibTeX copy includes visual feedback ("Copied!" text for 2 seconds)
7. Open in Browser uses the `openInBrowser` handler from `model.handler.ts`

> **Concept Map (new-layout / scaffold webviews only).** Lives entirely in `webviewScaffold.ts` (button id `btn-concept`, `panel-toggle`). It renders a **Mermaid `flowchart`** in the right panel — a genuine concept map, not a link list: a `center` node, abstract `concept` groupings, the webview's own `topic` toggles, `related` Pollis webviews and `external` resources, joined by **labelled relationship edges**. Each node carries at most one jump target — `model` (switches a toggle in the same webview, client-side `setModel`), `command` (a Pollis command id → `openTopic` message → `commandService.executeCommand`), or `url` (external → existing `openUrl`); `concept`/`center` nodes have none. Mermaid is loaded **lazily** on first open (no cost until used). The data comes from `IConceptMap` (`center` + `nodes` + `edges`, see `model.types.ts`) on the webview metadata; the handler posts it via `{ command: 'conceptMap', map }` in its `setTimeout`. **A webview with no `conceptMap` (or no Mermaid URI) shows a "Coming soon!" stub — that is acceptable.**
>
> **Mermaid wiring (per webview that wants a live map).** Mermaid (`window.mermaid`, v11) is vendored at `vs/workbench/contrib/mermaid/dist/mermaid.min.js` with helper `getMermaidUris()` (mirrors `getKatexUris`). In the command: `const mermaid = getMermaidUris();` add `localResourceRoots: [mermaid.distRoot]` to `contentOptions`, and pass `mermaid.js` into the template (`getXxxHtml(mermaid.js)` → `buildWebviewHtml({ …, mermaidJs })`). The scaffold CSP already allows `https://*.vscode-resource.vscode-cdn.net` for `script-src`. Add `| { command: 'openTopic'; target: string }` to `XxxWebviewMessage` and a `case 'openTopic'` to the handler only when the map has `command` nodes. Reference implementation: `cviz` (command + template + handler + data). Legacy `columns-grid` webviews (e.g. the Neural Networks family) do **not** carry Concept Map.

### Button codicons — copy from existing templates, do not invent

| Button | Codicon ID |
|---|---|
| Visualise | `graph-line` |
| Diagnose | `beaker` |
| Predict | `link-external` |
| Compare | `diff-sidebyside` |
| Interpret | `lightbulb-sparkle` |
| Local Wikis | `book` |
| Notebook Tutorials | `notebook` |
| Multimedia Tutorials | `play-circle` |
| Concept Map | custom node-graph glyph (three connected circles — see `webviewScaffold.ts`) |
| Explore References | `link` |

> ⚠️ **Do not use a partial or custom SVG path for the Interpret button.** The `lightbulb-sparkle` codicon requires the full multi-segment path from the codicon library. Copying only the sparkle segment (as happened with the `M8.199 2.782…` path) renders as an invisible dot in the upper-right corner of the 16×16 viewBox.

### Learn More — always five buttons
See table above. Three use `class="list-btn panel-toggle"` (right panel): Local Wikis, Notebook Tutorials and Concept Map. Two use `class="list-btn has-actions"` (QuickPick): Multimedia Tutorials and Explore References. The `has-actions` class adds an underline on hover for QuickPick buttons. Concept Map is provided by the shared scaffold for new-layout webviews; legacy `columns-grid` webviews keep the original four.

### Form inputs
- Always put all inputs into a single `<div class="form-row">` — never separate rows unless there are many (>4) parameters.
- Use `<textarea class="form-input" rows="1">` — never `<input>`.
- Wrap labels in `<label class="form-label centered form-label-with-tooltip">` + tooltip span.
- Numeric parameters use `class="form-input param-input"` (centred text).

### HTML special characters (use entities, never literal Unicode)
- × → `&#215;` or `\\xd7` inside JS strings
- — → `&#8212;`
- ' → `&#8217;`
- ≥ → `&#8805;`
- ε, σ, etc. → `&#949;`, `&#963;`

---

## 4. JavaScript patterns

### Boilerplate helpers (copy verbatim from lp.template.ts)
```javascript
function esc(s)      { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
function line(s)     { return '<div class="code-line">' + s + '</div>'; }
function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
function blank()     { return '<div class="code-blank"></div>'; }
function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }
```

### ⚠️ CRITICAL: Code comments — use `cline()` for end-of-line comments

**NEVER do this:**
```javascript
c += line('# This is a comment by itself');
c += line(fn('function') + '(args)');
```

**ALWAYS do this:**
```javascript
c += cline(fn('function') + '(args)', 'Meaningful explanation of what this does');
```

**Rules:**
1. Use `cline(code, comment)` to attach comments to the END of code lines — the second parameter is the comment text (without `# `)
2. Use `line(code)` only for non-comment code lines
3. Never use `line('# comment')` — this creates orphan comment lines with trailing `# ` that look wrong
4. Comments must be MEANINGFUL explanations that relate to the code: describe the purpose, algorithm step, or parameter meaning
5. Avoid comments that merely repeat what the code obviously does (e.g., `cline('x = 5', 'set x to 5')`)

The `cline()` helper automatically prepends `# ` and formats it as a green comment span with proper spacing.

### eqRow helper (copy verbatim)
```javascript
function eqRow(lhs, op, body, comment) {
    return '<div class="eq-row">'
        + '<span class="eq-lhs">' + lhs + '</span>'
        + '<span class="eq-op">' + op + '</span>'
        + '<span class="eq-body">' + body + '</span>'
        + (comment ? '<span class="eq-comment"># ' + comment + '</span>' : '')
        + '</div>';
}
```

### `setModel(model)` — multi-model webviews
```javascript
var MODELS = ['km', 'kmed', 'fcm'];

function setModel(model) {
    if (!MODELS.includes(model)) { return; }
    currentModel = model;
    document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.model === model);
    });
    MODELS.forEach(function(m) {
        document.querySelectorAll('.' + m + '-row').forEach(function(el) {
            el.style.display = m === model ? 'flex' : 'none';
        });
    });
    updateEquations();
    updateCodePreview();
}

document.getElementById('model-group').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-model]');
    if (btn) { setModel(btn.dataset.model); }
});

// Last statement in <script> block:
setModel('km');
```

### Right panel pattern (NEW — replaces old action panel)

The right panel is populated by clicking Next Steps buttons. Clicking the same button again collapses it.

```javascript
var currentPanelId = null;
var rightPanel = document.getElementById('right-panel');

function hideRightPanel() {
    rightPanel.innerHTML = '';
    rightPanel.style.display = 'none';
    document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
    currentPanelId = null;
}

function renderRightList(actions, title) {
    var cards = actions.map(function(a) {
        return '<button class="action-card" data-id="' + a.id + '">'
            + '<span class="action-label">' + esc(a.label) + '</span>'
            + '<span class="action-desc">' + esc(a.desc) + '</span>'
            + '</button>';
    }).join('');
    rightPanel.innerHTML =
        '<div class="panel-header">'
        + '<span class="right-panel-title">' + esc(title) + '</span>'
        + '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
        + '</div>'
        + '<div class="right-action-grid">' + cards + '</div>';
    document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
    actions.forEach(function(a) {
        var btn = rightPanel.querySelector('[data-id="' + a.id + '"]');
        if (btn) { btn.addEventListener('click', function() { renderRightCode(a, actions, title); }); }
    });
}

function renderRightCode(action, actions, title) {
    var codeHtml = action.code();
    rightPanel.innerHTML =
        '<div class="panel-header">'
        + '<button class="panel-back" id="btn-panel-back">&#x2190; ' + esc(title) + '</button>'
        + '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
        + '</div>'
        + '<div class="panel-code-title">' + esc(action.label) + '</div>'
        + '<div class="panel-code-desc">' + esc(action.desc) + '</div>'
        + '<div class="code-preview-wrapper">'
        + '<div class="code-preview" id="panel-code">' + codeHtml + '</div>'
        + '<button class="copy-btn" id="btn-panel-copy">Copy</button>'
        + '</div>';
    document.getElementById('btn-panel-back').addEventListener('click', function() { renderRightList(actions, title); });
    document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
    document.getElementById('btn-panel-copy').addEventListener('click', function() {
        var lines = document.getElementById('panel-code').querySelectorAll('.code-line, .code-blank');
        var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
        navigator.clipboard.writeText(text).then(function() {
            var btn = document.getElementById('btn-panel-copy');
            btn.textContent = 'Copied!';
            setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
        });
    });
}

function showRightPanel(actions, title, btnId) {
    if (currentPanelId === btnId) { hideRightPanel(); return; }
    currentPanelId = btnId;
    document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
    document.getElementById(btnId).classList.add('panel-active');
    renderRightList(actions, title);
    rightPanel.style.display = 'block';
}
```

Wire up each Next Steps button:
```javascript
document.getElementById('btn-viz').addEventListener('click', function() {
    showRightPanel(VISUALISE_ACTIONS, 'Visualise', 'btn-viz');
});
document.getElementById('btn-diagnose').addEventListener('click', function() {
    showRightPanel(DIAGNOSE_ACTIONS, 'Diagnose', 'btn-diagnose');
});
// ... same for predict, compare, interpret
```

### Action arrays (flat, one per Next Steps category)

Each Next Steps category has its own flat array. Standard action placement:

| Category | Standard actions |
|---|---|
| Visualise | Residual Variance Plot (and other diagnostic plots) |
| Diagnose | Statistical tests (Harvey, Glejser, White, etc.) |
| Predict | Fitted values, out-of-sample predictions |
| Compare | Compare with OLS / baseline model |
| Interpret | Parameter interpretation, variance/scaling outputs |

```javascript
var DIAGNOSE_ACTIONS = [
    {
        id: 'harvey-test',
        label: 'Harvey Test',
        desc: 'LR test: H0 = homoskedasticity (exponential variance)',
        code: function() {
            var y = val('hare-y', 'y');
            // ... build code HTML using line(), cline(), kw(), fn(), ty() ...
            return c;
        },
    },
    // ...
];
```

### `pressBtn` / `releaseBtn` — for Learn More picker buttons

Picker buttons (Multimedia Tutorials, Explore References) use underline (`panel-active`) to indicate an active QuickPick. The `pickerJustClosed` flag prevents re-opening immediately after the picker closes on focus loss.

> **Local Wikis and Notebook Tutorials are NOT picker buttons.** They use `panel-toggle` and open the right panel directly — no `pressBtn`/`releaseBtn`, no `pickerJustClosed` guard needed.

```javascript
var activeBtn = null;
var pickerJustClosed = false;

function pressBtn(btn) {
    if (activeBtn) { activeBtn.classList.remove('panel-active'); }
    activeBtn = btn;
    btn.classList.add('panel-active');
}
function releaseBtn() {
    if (activeBtn) { activeBtn.classList.remove('panel-active'); activeBtn = null; }
    pickerJustClosed = true;
    setTimeout(function() { pickerJustClosed = false; }, 300);
}

// Picker buttons only (has-actions):
document.getElementById('btn-documentation').addEventListener('click', function() {
    if (pickerJustClosed) { return; }
    if (activeBtn === this) { releaseBtn(); vscode.postMessage({ command: 'cancelAction' }); return; }
    pressBtn(this);
    vscode.postMessage({ command: 'openVideoList' });
});
document.getElementById('btn-paper').addEventListener('click', function() {
    if (pickerJustClosed) { return; }
    if (activeBtn === this) { releaseBtn(); vscode.postMessage({ command: 'cancelAction' }); return; }
    pressBtn(this);
    vscode.postMessage({ command: 'openDocs', target: 'paper' });
});
```

The `pickerJustClosed` guard is essential: when the user clicks an underlined button, the picker loses focus → VS Code fires `actionDone` → `releaseBtn()` runs → the click event then fires → without the guard the picker reopens immediately.

### `renderWikiPanel()` — Local Wikis right panel

Local Wikis uses the right panel (same as Notebook Tutorials). The handler sends sections via `wikiSections` on init; the webview stores them and renders on button click.

**JS state variable:**
```javascript
var wikiSections = [];
```

**Render function** (mirrors `renderNotebookSections`):
```javascript
function renderWikiPanel() {
    if (!wikiSections.length) { return; }
    var html = '<div class="panel-header">'
        + '<span class="right-panel-title">Local Wikis</span>'
        + '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
        + '</div>'
        + '<div class="nb-panel-scroll">';
    wikiSections.forEach(function(section) {
        if (section.label) {
            html += '<div class="nb-section-title">' + esc(section.label) + '</div>';
        }
        html += '<div class="right-action-grid">';
        section.wikis.forEach(function(w) {
            html += '<button class="nb-card" data-wiki="' + esc(w.file) + '">'
                + '<span class="nb-label">' + esc(w.name) + '</span>'
                + (w.description ? '<span class="nb-desc">' + esc(w.description) + '</span>' : '')
                + '</button>';
        });
        html += '</div>';
    });
    html += '</div>';
    rightPanel.innerHTML = html;
    document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
    rightPanel.querySelectorAll('.nb-card[data-wiki]').forEach(function(card) {
        card.addEventListener('click', function() {
            vscode.postMessage({ command: 'openWiki', target: card.dataset.wiki });
        });
    });
}
```

Wiki cards support an optional `description` field (same pattern as notebook cards). When present it is rendered in `.nb-desc` below the title. Omitting it leaves a title-only card.

**Button wiring** (panel-toggle, same as `btn-notebook-tutorials`):
```javascript
document.getElementById('btn-wiki').addEventListener('click', function() {
    if (currentPanelId === 'btn-wiki') { hideRightPanel(); return; }
    currentPanelId = 'btn-wiki';
    document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
    this.classList.add('panel-active');
    renderWikiPanel();
    rightPanel.style.display = 'block';
});
```

**Inbound message** (in `window.addEventListener('message', ...)`):
```javascript
if (msg.command === 'wikiSections') { wikiSections = msg.sections || []; }
```

### Inbound messages (`window.addEventListener('message', ...)`)

```javascript
window.addEventListener('message', function(event) {
    var msg = event.data;
    if (!msg) { return; }
    if (msg.command === 'packageLinks') {
        var container = document.getElementById('package-links');
        container.innerHTML = '';
        var pkgs = msg.packages || [];
        pkgs.forEach(function(pkg, i) {
            var a = document.createElement('a');
            a.className = 'package-link';
            a.textContent = pkg.name;
            a.title = pkg.url;
            a.addEventListener('click', function(e) { e.preventDefault(); vscode.postMessage({ command: 'openUrl', url: pkg.url }); });
            container.appendChild(a);
            if (i < pkgs.length - 1) { container.appendChild(document.createTextNode(', ')); }
        });
    }
    if (msg.command === 'paperLinks') {
        var btn = document.getElementById('btn-paper');
        if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
    }
    if (msg.command === 'setModel') { setModel(msg.model); }
    if (msg.command === 'actionDone') { releaseBtn(); }
});
```

### Tooltip pin-on-click (copy verbatim)
```javascript
document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
    icon.addEventListener('click', function(e) {
        e.stopPropagation();
        var tip = this.nextElementSibling;
        if (tip && tip.classList.contains('tooltip-text')) {
            var wasPinned = tip.classList.contains('pinned');
            tip.classList.toggle('pinned');
            this.classList.toggle('pinned');
            if (wasPinned) {
                tip.style.display = 'none';
                this.addEventListener('mouseleave', function() { tip.style.display = ''; }, { once: true });
            }
        }
    });
});
```

### Textarea key capture (prevent VS Code keybindings)
```javascript
document.querySelectorAll('textarea.form-input').forEach(function(el) {
    el.addEventListener('keydown', function(e) { e.stopPropagation(); });
});
```

### Copy button (main code preview)
```javascript
document.getElementById('btn-copy').addEventListener('click', function() {
    var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
    var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
    navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('btn-copy');
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    });
});
```
Note: `'\\n'` in the TypeScript template literal becomes the literal `'\n'` in the rendered HTML — correct.

### Code preview rendering: two paths (HTML spans vs. plain text)

The scaffold supports **two rendering paths** for code preview, controlled by how `codeBranchesJs` is written:

**Old path (existing templates):** `codeBranchesJs` builds HTML with helper functions

The template's `codeBranchesJs` constructs `c += cline(kw('using') + ' ' + ty('XLSX'), '...')` chains. The scaffold:
1. Executes `codeBranchesJs` to build HTML into variable `c` with `<span>` tags for keywords, functions, types
2. Injects `c` into the code box via `box.innerHTML = c`
3. Extracts plain text from the DOM via `extractCode()`
4. Sends plain text to handler via `vscode.postMessage({ command: 'colorize', code: plainText })`
5. Handler tokenizes with Monaco using the active theme's color map, returns theme-aware HTML
6. Theme-aware HTML replaces the temporary span-based HTML

**New path (TOML-based templates):** `codeBranchesJs` sets `currentPlainCode` directly

For templates generated from TOML with plain Julia code, `codeBranchesJs` skips HTML building and sets the plain text directly:
```javascript
currentPlainCode = `using XLSX\nmktempdir() do dir\n    ...`;
```
The scaffold:
1. Detects that `currentPlainCode` is set (not null) instead of `c` being built
2. Skips the span-building and DOM injection entirely
3. Sends plain text directly via `vscode.postMessage({ command: 'colorize', code: currentPlainCode })`
4. Handler tokenizes and returns theme-aware HTML (same as old path, step 5 above)

**How the scaffold detects which path:** If `codeBranchesJs` builds HTML into variable `c`, the old path executes. If it sets `currentPlainCode` directly without populating `c`, the new path executes. Both paths converge at the `colorize` → `colorizedCode` round-trip for theme-aware highlighting.

**Why two paths:** Existing templates are already written using the `kw()`, `fn()`, `ty()` pattern and work correctly. New TOML-based templates use plain Julia code (no helper functions) for better readability and maintainability. Both must coexist during migration.

---

## 5. IModelVideo — Multimedia Tutorials

`IModelVideo` is defined in `model.types.ts`:
```typescript
export interface IModelVideo {
    readonly title: string;
    readonly description?: string;
    readonly url: string;
}
```

It sits on `IModelPackage.videos?: IModelVideo[]`. Add videos to any package in the command file:
```typescript
{
    name: 'HARE.jl',
    github: 'https://...',
    papers: [],
    videos: [
        {
            title: 'Julia in Academia',
            description: 'Overview of Julia for academic and scientific computing',
            url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
        },
    ],
}
```

The handler calls `openVideoList` from `model.handler.ts`, which **always shows a QuickPick** even for a single video — so the user can see the description before opening the browser. Wire it in the handler's switch:
```typescript
case 'openVideoList':
    try {
        await openVideoList(hareData.packages, quickInputService, commandService);
    } finally {
        webviewInput.webview.postMessage({ command: 'actionDone' });
    }
    break;
```

Add `| { command: 'openVideoList' }` to `XxxWebviewMessage`.

---

## 6. IModelWiki separators and ordering

`IModelWiki` in `model.types.ts` supports three variants:
```typescript
export type IModelWiki =
    | { readonly name: string; readonly description?: string; readonly file: string; readonly bundled: true }
    | { readonly name: string; readonly description?: string; readonly url: string; readonly bundled: false }
    | { readonly separator: true; readonly label?: string };
```

`description` is optional. When provided it appears below the card title using the `.nb-desc` style, identical to notebook tutorial cards.

The `model.handler.ts` uses a type guard `isWikiEntry` to distinguish separators from real entries:
```typescript
type IModelWikiEntry = Extract<IModelWiki, { bundled: boolean }>;
function isWikiEntry(w: IModelWiki): w is IModelWikiEntry { return !('separator' in w); }
```
Separators are mapped to `IQuickPickSeparator` (`{ type: 'separator' as const, label }`) in the picker.

### Wiki families — choose the right template for the webview's menu group

Every webview belongs to exactly one wiki family. The family determines which 6 wiki slots to use. The slot names, their order, and their file names within that family are **mandatory — never omit, never reorder, never rename**.

---

#### Family A — Infer / Simulate / Optimise webviews

Used for all statistical, machine-learning, simulation, and optimisation webviews (the vast majority of Pollis webviews).

| # | Name | File | Content |
|---|------|------|---------|
| 1 | `Factsheet` | `<topic>/factsheet.md` | One-page reference: model equations, complexity, key hyperparameters, package versions |
| 2 | `Overview` | `<topic>/overview.md` | Intuition and motivation; when to use this model |
| 3 | `Assumptions` | `<topic>/assumptions.md` | Data requirements, distributional assumptions, when they are violated |
| 4 | `Diagnostics` | `<topic>/diagnostics.md` | Residuals, fit metrics, convergence checks; how to detect model failure |
| 5 | `Interpretation` | `<topic>/interpretation.md` | How to read model outputs, coefficient meaning, uncertainty |
| 6 | `Decision Guide` | `<topic>/decision-guide.md` | This model vs. alternatives; when to switch |

```typescript
wikis: [
    { name: 'Factsheet',      file: '<topic>/factsheet.md',      bundled: true },
    { name: 'Overview',       file: '<topic>/overview.md',       bundled: true },
    { name: 'Assumptions',    file: '<topic>/assumptions.md',    bundled: true },
    { name: 'Diagnostics',    file: '<topic>/diagnostics.md',    bundled: true },
    { name: 'Interpretation', file: '<topic>/interpretation.md', bundled: true },
    { name: 'Decision Guide', file: '<topic>/decision-guide.md', bundled: true },
    // Separator + topic-specific wikis (omit if none)
    { separator: true, label: '<Topic Name>' },
    { name: 'Tokenisation', file: '<topic>/tokenisation.md', bundled: true },
    // ...
],
```

---

#### Family B — Accessing Model Repositories webviews (Explore menu)

Used for webviews that browse or interact with external model hubs (Hugging Face Models, Kaggle Models, etc.).

| # | Name | File | Content |
|---|------|------|---------|
| 1 | `Factsheet` | `<topic>/factsheet.md` | One-page reference: what the hub is, key packages, authentication requirements |
| 2 | `Overview` | `<topic>/overview.md` | Model taxonomy, pipeline tags, how Julia connects to this hub |
| 3 | `Authentication` | `<topic>/authentication.md` | Create and use API tokens/keys; gated models, rate limits, secure storage |
| 4 | `API Reference` | `<topic>/api-reference.md` | Full hub REST API: model search, metadata, file downloads, pagination, error codes |
| 5 | `Download & Load` | `<topic>/download-load.md` | Step-by-step: caching, tokens, `load_model` / `load_tokenizer` patterns |
| 6 | `Run Inference` | `<topic>/run-inference.md` | Tokenise → forward → decode; patterns per modality (text, image, audio) |
| 7 | `Choosing a Model` | `<topic>/choosing-a-model.md` | How to read model cards, benchmark scores, size vs. accuracy tradeoffs |
| 8 | `Package Guide` | `<topic>/package-guide.md` | Key API functions from both packages; common pitfalls and workarounds |

> **Naming convention:** The authentication wiki is always called `Authentication` (not "Access Tokens", "API Key", or any hub-specific name). The REST API wiki is always called `API Reference`. Both names are identical across all Family B webviews so users know where to look.

```typescript
wikis: [
    { name: 'Factsheet',        file: '<topic>/factsheet.md',        bundled: true },
    { name: 'Overview',         file: '<topic>/overview.md',         bundled: true },
    { name: 'Authentication',   file: '<topic>/authentication.md',   bundled: true },
    { name: 'API Reference',    file: '<topic>/api-reference.md',    bundled: true },
    { name: 'Download & Load',  file: '<topic>/download-load.md',    bundled: true },
    { name: 'Run Inference',    file: '<topic>/run-inference.md',    bundled: true },
    { name: 'Choosing a Model', file: '<topic>/choosing-a-model.md', bundled: true },
    { name: 'Package Guide',    file: '<topic>/package-guide.md',    bundled: true },
    // Separator + topic-specific wikis (omit if none)
    { separator: true, label: 'Packages' },
    { name: 'Transformers.jl', file: '<topic>/transformers-jl.md', bundled: true },
    // ...
],
```

---

**Every wiki must have a stub `.md` file** at the listed path under `media/wiki/<topic>/`. Stub content:
```markdown
# Wiki Title

Coming soon!
```

---

## 7. IModelReference — three-group references

References use a dedicated type and live on the webview metadata (not on `IModelPackage.papers`):

```typescript
// model.types.ts
export type IModelReference = IModelPaper | { readonly separator: true; readonly label?: string };

// hare.types.ts (or equivalent)
export interface IHareMetadata {
    readonly hare: {
        readonly packages: IModelPackage[];
        readonly notebooks: IModelNotebook[];
        readonly wikis: IModelWiki[];
        readonly references: IModelReference[];   // ← NEW
    };
}
```

`IModelPackage.papers` is kept for backward compatibility but should be set to `[]` in new webviews that use `references`.

### Three-group structure

Always divide references into three groups with separators:

```typescript
const XXX_REFERENCES: IModelReference[] = [
    { separator: true, label: 'Software' },
    {
        title: 'Julia: A Fresh Approach to Numerical Computing',
        authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
        year: 2017,
        journal: 'SIAM Review',
        doi: '10.1137/141000671',
        openAccess: false,
    },
    // ... any other software/package papers ...
    { separator: true, label: 'Textbooks' },
    {
        title: 'Econometric Analysis',
        authors: 'Greene, William H.',
        year: 2018,
        journal: 'Pearson (8th ed.)',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/econometric-analysis/P200000006119',
        openAccess: false,
    },
    { separator: true, label: 'Original Papers' },
    {
        title: 'Estimating Regression Models with Multiplicative Heteroscedasticity',
        authors: 'Harvey, Andrew C.',
        year: 1976,
        journal: 'Econometrica',
        doi: '10.2307/1913974',
        openAccess: false,
    },
    // ...
];
```

Groups:
1. **Software** — papers about programming languages, packages, and tools used in the webview (e.g. Julia language paper: Bezanson et al. 2017, doi: 10.1137/141000671)
2. **Textbooks** — general-topic books covering the webview's subject area
3. **Original Papers** — original research papers behind the specific methods and tests implemented

### Handler wiring for references

Use `openReferenceList` (from `model.handler.ts`) for the `'paper'` case. **Do not** call `openPackageItem` for papers:

```typescript
case 'openDocs':
    try {
        if (msg.target === 'paper') {
            await openReferenceList(hareData.references, quickInputService, commandService, clipboardService, notificationService);
        } else if (msg.target === 'repository') {
            await openPackageItem('repository', hareData.packages, commandService, quickInputService, clipboardService, notificationService);
        }
    } finally {
        webviewInput.webview.postMessage({ command: 'actionDone' });
    }
    break;
```

### `hasPapers` — checks references, not package papers

```typescript
const hasReferences = hareData.references.some(r => !('separator' in r));
webviewInput.webview.postMessage({ command: 'paperLinks', papers: [], hasPapers: hasReferences });
```

---

## 8. Notebook stubs

Create stub notebooks as valid JSON `.ipynb` files. **Never use XML-like or text-based formats.**

```json
{
  "nbformat": 4,
  "nbformat_minor": 5,
  "metadata": {
    "kernelspec": {
      "display_name": "Julia",
      "language": "julia",
      "name": "julia-1.10"
    },
    "language_info": {
      "name": "julia",
      "version": "1.10.0"
    }
  },
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["# Tutorial Title\n", "\n", "Coming soon!"]
    }
  ]
}
```

Place them at `media/notebooks/<topic>/tutorial-NN-<name>.ipynb`.

---

## 9. Known pitfalls

### Any `'` inside a JS single-quoted string — CRITICAL
`\'` inside a TypeScript template literal is consumed as an escaped `'`. The backslash disappears, so the `'` lands unescaped in the rendered HTML. If that `'` is inside a single-quoted JS string, it terminates the string early, producing a **JavaScript syntax error that silently prevents the entire `<script>` block from running**.

> ⚠️ **A single `\'` anywhere in the template produces a completely non-functional webview** — no buttons work, no code preview, no package links, no Next Steps panels. The failure is silent (no error in the UI). This was confirmed in production on the Portfolio Optimisation webview.

**Fix rule:** Never write `\'` inside a JS single-quoted string within a TypeScript template literal. Rephrase to avoid the apostrophe (e.g. `"asset's"` → `"per-asset"`) or use a double-quoted JS string for that value.

### No Greek letters or Unicode escapes in JS strings — CRITICAL
Never write Greek letters (α, β, μ, σ…) or `\uXXXX` escapes inside any JS string in the template.

**Rule:** Use plain ASCII identifiers in JS code strings: `mu_hat`, `sigma_hat`, `xi_hat`, etc. For HTML content (labels, equations) use HTML entities (`&#956;` for μ, `&#963;` for σ, etc.).

### `min-width: 0` on `.right-panel` — CRITICAL
CSS Grid children default to `min-width: auto`, which lets them grow beyond their allocated column. Without `min-width: 0` on `.right-panel`, long code lines overflow instead of scrolling — `overflow-x: auto` has no effect.

**Fix:** Always include `min-width: 0` on `.right-panel`.

### `pickerJustClosed` race condition
When a picker button is underlined (active) and the user clicks it to close the picker:
1. The click causes the picker to lose focus → VS Code fires `actionDone` → `releaseBtn()` runs
2. The click event then fires on the button → without the guard it would reopen the picker

**Fix:** `releaseBtn()` sets `pickerJustClosed = true` for 300 ms. Every picker button handler starts with `if (pickerJustClosed) { return; }`.

### `\\xd7` for ×
Inside a JS string in a template literal, `\xd7` would be interpreted by TypeScript. Use `\\xd7` to emit a literal `\xd7` that the browser resolves to ×.

### Matrix transpose — use `transpose()` function, not `.'` operator
Never try to escape the Julia transpose operator `.'` in code strings inside JS. The apostrophe will cause issues with string termination. Instead, use the explicit `transpose()` function:
```javascript
// Wrong — apostrophe breaks string termination:
// line('S, F, L = ' + fn('dare') + '(A' + kw(".\'") + ', C' + kw(".\'") + ', W, V)')

// Correct — use transpose() function:
line('S, F, L = ' + fn('dare') + '(' + fn('transpose') + '(A), ' + fn('transpose') + '(C), W, V)')
```

### Shell heredoc `<<'EOF'` inside a template literal — CRITICAL
A quoted heredoc marker (`<<'EOF'`) contains an apostrophe. Inside a TypeScript backtick template literal that apostrophe terminates any surrounding single-quoted JS string early, producing a **silent JS syntax error that blanks the entire webview**.

**Fix:** always use the unquoted form `<<EOF`. For inline scripts where variable expansion is irrelevant, `<<EOF` and `<<'EOF'` behave identically, so there is no downside:
```javascript
// Wrong — apostrophe in <<'EOF' breaks string:
line(kw('# ') + 'python3 - <<\'EOF\'')

// Correct:
line(kw('# ') + 'python3 - <<EOF')
```

### Python f-string `${...}` inside a template literal — CRITICAL
Python f-string placeholders use `{expr}` or `{expr:.Nf}` syntax. Inside a TypeScript backtick template literal, `${...}` is **TypeScript template interpolation** — it evaluates the expression and injects its value into the string. If the expression is undefined the result is the literal string `"undefined"`, corrupting the code preview. Even a `{x:.1f}` fragment where `x` is not defined in TypeScript scope silently injects `"undefined"`.

**Fix:** escape every `${` in Python f-string content as `\${`:
```javascript
// Wrong — TypeScript interpolates ${(time.perf_counter()-t0)*1000:.1f}:
line(kw('# ') + 'print(f"elapsed: ${(time.perf_counter()-t0)*1000:.1f} ms")')

// Correct — escaped, TypeScript leaves it alone:
line(kw('# ') + 'print(f"elapsed: \\${(time.perf_counter()-t0)*1000:.1f} ms")')
```

> These two pitfalls (`<<'EOF'` and Python `${...}`) were confirmed in production: both caused completely non-functional HFM and KGM webviews — all UI silent, no visible error.

### Model-specific row visibility: use `'flex'`, not `''`
`el.style.display = ''` removes the inline style, letting the CSS `display: none` rule win — the row stays hidden. Always use `'flex'`:
```javascript
MODELS.forEach(function(m) {
    document.querySelectorAll('.' + m + '-row').forEach(function(el) {
        el.style.display = m === model ? 'flex' : 'none';
    });
});
```

### SVG caption text clipping — CRITICAL for inline diagrams
SVG text rendered with `text-anchor="middle"` at the horizontal centre of the viewBox extends equally left and right. If the caption is long (>45 characters at `font-size="11"`) its edges will be clipped by the viewBox boundary when the webview is narrower than the natural SVG width.

**Symptom:** the caption appears truncated on both sides — e.g. `"am: adaptive per-parameter rates via 1st and 2nd moment estimat"` instead of the full string.

**Fix:** use `viewBox="-20 0 360 180"` (not `"0 0 320 175"`) and `max-width: 480px` on all inline SVG illustration diagrams. The negative x-origin adds 20 px of invisible margin on each side without moving any diagram coordinates, giving captions room to breathe.

```javascript
// Correct — all four SVG functions in a multi-model illustration pane:
'<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'

// Wrong — too narrow, captions clip:
'<svg viewBox="0 0 320 175" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">'
```

Also keep captions short — aim for ≤50 characters so they fit comfortably in the 360-unit-wide coordinate space centred at x=160.

### `setModel()` call placement
Must be the very last statement in the `<script>` block, after all event listener setup.

### Input IDs must be scoped to the webview
Prefix parameter IDs with the acronym: `hare-y`, `hare-X`, `hare-z`. Prevents collisions if the same parameter name appears across webviews.

---

## 10. Handler file pattern

```typescript
export function registerXxxWebviewHandlers(
    webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
    metadata: IXxxMetadata,
    openerService: IOpenerService,
    editorService: IEditorService,
    quickInputService: IQuickInputService,
    commandService: ICommandService,
    clipboardService: IClipboardService,
    notificationService: INotificationService,
    initialModel?: string,
): DisposableStore {
    const disposables = new DisposableStore();
    const data = metadata.xxx;

    // Always use setTimeout so the webview is ready to receive messages
    setTimeout(() => {
        const packages = data.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
        const hasReferences = data.references.some(r => !('separator' in r));
        // Build wiki sections for the right panel (same pattern as notebook sections)
        const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
        let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
        for (const w of data.wikis) {
            if ('separator' in w) {
                wikiSections.push(currentWikiSection);
                currentWikiSection = { label: w.label ?? '', wikis: [] };
            } else {
                currentWikiSection.wikis.push({ name: w.name, file: w.bundled ? w.file : '', description: w.description });
            }
        }
        if (currentWikiSection.wikis.length > 0) { wikiSections.push(currentWikiSection); }
        webviewInput.webview.postMessage({ command: 'packageLinks', packages });
        webviewInput.webview.postMessage({ command: 'paperLinks', papers: [], hasPapers: hasReferences });
        webviewInput.webview.postMessage({ command: 'wikiSections', sections: wikiSections });
        if (initialModel) {
            webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
        }
    }, 100);

    disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

    disposables.add(webviewInput.webview.onMessage(async (e: { message: XxxWebviewMessage }) => {
        const msg = e.message;
        switch (msg.command) {
            case 'openDocs':
                try {
                    if (msg.target === 'paper') {
                        await openReferenceList(data.references, quickInputService, commandService, clipboardService, notificationService);
                    } else if (msg.target === 'repository') {
                        await openPackageItem('repository', data.packages, commandService, quickInputService, clipboardService, notificationService);
                    }
                } finally {
                    webviewInput.webview.postMessage({ command: 'actionDone' });
                }
                break;
            case 'openNotebookList':
                try { await openNotebookList(data.notebooks, quickInputService, openerService, editorService); }
                finally { webviewInput.webview.postMessage({ command: 'actionDone' }); }
                break;
            case 'openNotebook': await openNotebookByFile(msg.target, data.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService); break;
            case 'openWiki':     await openWikiByFile(msg.target, data.wikis, openerService, editorService); break;
            case 'openUrl':      if (msg.url) { await openInBrowser(msg.url, commandService); } break;
            case 'openVideoList':
                try { await openVideoList(data.packages, quickInputService, commandService); }
                finally { webviewInput.webview.postMessage({ command: 'actionDone' }); }
                break;
            case 'cancelAction': await quickInputService.cancel(); break;
        }
    }));

    return disposables;
}
```

> **Auto-selecting the Julia kernel for Notebook Tutorials.** Passing `notebookKernelService` and `notebookEditorModelResolverService` to `openNotebookByFile` makes a bundled `.ipynb` open with the Julia kernel **already selected** — the user is never shown the "Select kernel for…" quickpick. This is the same experience as the §18 **Send to Notebook** button, and both paths share the `autoSelectJuliaKernel` helper in `model.handler.ts`. The two services are **optional trailing parameters**; omit them and the notebook opens with no kernel pre-selected (the old behaviour). To enable it, thread both services through the handler and command (see §18.6–18.7 — the exact same wiring) and forward them in this `openNotebook` case. Reference implementation: the four **Visualise** webviews (`cviz`, `dcmp`, `mviz`, `tsviz`).

---

## 11. Command file pattern

```typescript
import { IModelReference } from '../common/model.types.js';

const XXX_REFERENCES: IModelReference[] = [
    { separator: true, label: 'Software' },
    { title: 'Julia: ...', authors: 'Bezanson, Jeff; ...', year: 2017, journal: 'SIAM Review', doi: '10.1137/141000671', openAccess: false },
    { separator: true, label: 'Textbooks' },
    // ...
    { separator: true, label: 'Original Papers' },
    // ...
];

const XXX_METADATA: IXxxMetadata = {
    xxx: {
        packages: [
            {
                name: 'Pkg.jl',
                github: 'https://...',
                papers: [],          // always empty — references live in XXX_REFERENCES
                videos: [
                    { title: '...', description: '...', url: 'https://...' },
                ],
            },
        ],
        notebooks: [
            { name: 'Tutorial 1', file: '<topic>/tutorial-01-<name>.ipynb', bundled: true, description: '...' },
        ],
        wikis: [
            { name: 'Factsheet',      file: '<topic>/factsheet.md',      bundled: true },
            { name: 'Overview',       file: '<topic>/overview.md',       bundled: true },
            { name: 'Assumptions',    file: '<topic>/assumptions.md',    bundled: true },
            { name: 'Diagnostics',    file: '<topic>/diagnostics.md',    bundled: true },
            { name: 'Interpretation', file: '<topic>/interpretation.md', bundled: true },
            { name: 'Decision Guide', file: '<topic>/decision-guide.md', bundled: true },
            { separator: true, label: '<Topic Name>' },
            // model-specific wikis ...
        ],
        references: XXX_REFERENCES,
    },
};

const XXX_VIEW_TYPE = 'pollis.xxx';
const XXX_TITLE = 'Model Name';

export function openXxxWebview(
    webviewWorkbenchService: IWebviewWorkbenchService,
    openerService: IOpenerService,
    editorService: IEditorService,
    quickInputService: IQuickInputService,
    commandService: ICommandService,
    clipboardService: IClipboardService,
    notificationService: INotificationService,
    initialModel?: string,
): void {
    const webviewInput = webviewWorkbenchService.openWebview(
        { title: XXX_TITLE, options: { retainContextWhenHidden: true }, contentOptions: { allowScripts: true }, extension: undefined },
        XXX_VIEW_TYPE, XXX_TITLE, undefined,
        { group: undefined, preserveFocus: false }
    );
    webviewInput.webview.setHtml(getXxxHtml());
    registerXxxWebviewHandlers(webviewInput, XXX_METADATA, openerService, editorService, quickInputService, commandService, clipboardService, notificationService, initialModel);
}
```

---

## 12. Types file pattern

```typescript
import { IModelPackage, IModelNotebook, IModelWiki, IModelReference } from './model.types.js';

export interface IXxxMetadata {
    readonly xxx: {
        readonly packages: IModelPackage[];
        readonly notebooks: IModelNotebook[];
        readonly wikis: IModelWiki[];
        readonly references: IModelReference[];
    };
}

export type XxxWebviewMessage =
    | { command: 'openDocs'; target: 'paper' | 'repository' }
    | { command: 'openNotebookList' }
    | { command: 'openNotebook'; target: string }
    | { command: 'openWiki'; target: string }
    | { command: 'openUrl'; url: string }
    | { command: 'getPaperLinks' }
    | { command: 'openVideoList' }
    | { command: 'cancelAction' };
```

---

## 13. Checklist for a new webview

- [ ] `common/<acronym>.types.ts` — metadata interface + message type (include `references: IModelReference[]`)
- [ ] `handlers/<acronym>.handler.ts` — copy structure from `lp.handler.ts`
- [ ] `commands/<acronym>.command.ts` — fill in METADATA, VIEW_TYPE, TITLE; define `XXX_REFERENCES` with three groups
- [ ] `webviews/<acronym>.template.ts` — copy CSS verbatim from `lp.template.ts`
- [ ] HTML: left-strip layout, subtitle (`methods-list` bullets), toggle buttons, all inputs in one `form-row`
- [ ] HTML: Next Steps buttons have `class="list-btn panel-toggle"` (no `has-actions`)
- [ ] HTML: Learn More — Local Wikis and Notebook Tutorials use `class="list-btn panel-toggle"` (right panel); Multimedia Tutorials and Explore References use `class="list-btn has-actions"` (QuickPick)
- [ ] HTML: All Learn More buttons present (Local Wikis, Notebook Tutorials, Multimedia Tutorials, Explore References; + Concept Map in scaffold/new-layout webviews)
- [ ] JS: **grep the template for `\'` — any occurrence silently kills the entire webview** (see §9)
- [ ] JS: boilerplate helpers (`esc`, `kw`, `fn`, `ty`, `line`, `cline`, `blank`, `val`)
- [ ] JS: `hideRightPanel`, `renderRightList`, `renderRightCode`, `showRightPanel`
- [ ] JS: flat action arrays — `VISUALISE_ACTIONS`, `DIAGNOSE_ACTIONS`, `PREDICT_ACTIONS`, `COMPARE_ACTIONS`, `INTERPRET_ACTIONS`
- [ ] JS: `pressBtn`/`releaseBtn` use `panel-active` class (not `was-pressed`)
- [ ] JS: `wikiSections` state variable + `renderWikiPanel()` function (see §4)
- [ ] JS: `btn-wiki` wired as `panel-toggle` (NOT a picker button — no `pressBtn`/`pickerJustClosed` guard)
- [ ] JS: picker buttons (Multimedia Tutorials, Explore References) guard with `if (pickerJustClosed) { return; }`
- [ ] JS: `setModel('default')` as final statement
- [ ] Handler: `setTimeout(..., 100)` for initial postMessage calls
- [ ] Handler: `hasPapers` computed from `references` (not `packages[].papers`)
- [ ] Handler: `setTimeout` sends `wikiSections` (build from `data.wikis`, same pattern as §10)
- [ ] Handler: `'paper'` case calls `openReferenceList`, `'repository'` case calls `openPackageItem` (no `'wiki'` case in `openDocs`)
- [ ] Media: `.md` files at `media/wiki/<topic>/` (factsheet, overview, assumptions, diagnostics, interpretation, decision-guide, + model-specific)
- [ ] Media: `.ipynb` files at `media/notebooks/<topic>/` (valid JSON, Julia kernelspec, stripped outputs)
- [ ] Media: **every `file:` in the command's `wikis`/`notebooks` exists on disk** — a referenced-but-missing file makes the card fail with "file not found" (see §17). Cross-check src, then copy the new `<topic>` folders into `out/` (the watch task does not copy media)
- [ ] Contribution: import, `CommandsRegistry.registerCommand`, `MenuRegistry`
- [ ] Run `npm run compile-check-ts-native` — zero errors before declaring done
- [ ] Next Steps order: Visualise → Diagnose → Predict → Compare → Interpret

> **IMPORTANT — never create `.js` files manually.** Only create `.ts` source files. The build watch task compiles TypeScript to JavaScript in `out/` automatically.

---

## 14. Upgrade guide — old webviews to new layout

Old webviews (e.g. `clh`, `clp`) use the legacy `columns-grid` layout with a `showActionList` / `showActionCode` inline panel. To upgrade:

### CSS changes
1. Replace `.columns-grid { display: grid; ... }` and `.action-panel { ... }` with the full new layout CSS (§2).
2. Remove `.list-btn.has-actions.was-pressed svg` rule — no longer needed.
3. Add `.panel-active { text-decoration: underline; }`.

### HTML changes
1. Replace the `<div class="columns-grid">` block with the new `<div class="bottom-layout">` structure.
2. Move Next Steps buttons to the left strip with `class="list-btn panel-toggle"` (remove `has-actions`).
3. Move Learn More buttons to the left strip with `class="list-btn has-actions"`.
4. Remove the old `<div class="action-panel" id="action-panel">`.
5. Add `<div class="right-panel" id="right-panel"></div>` as the second grid column.

### JS changes
1. Remove `showActionList` and `showActionCode` functions.
2. Add `hideRightPanel`, `renderRightList`, `renderRightCode`, `showRightPanel`.
3. Replace action arrays `{ ..., has-actions panel }` wiring with `showRightPanel(DIAGNOSE_ACTIONS, 'Diagnose', 'btn-diagnose')` etc.
4. Update `pressBtn`/`releaseBtn` to use `panel-active` instead of `was-pressed`.
5. Add `pickerJustClosed = false` declaration and the 300 ms debounce in `releaseBtn`.
6. Add `if (pickerJustClosed) { return; }` at the top of each Learn More button handler.

### Types changes (IHareMetadata / IXxxMetadata)
1. Add `readonly references: IModelReference[]` to the metadata interface.
2. Import `IModelReference` from `model.types.ts`.

### Command file changes
1. Extract papers from `IModelPackage.papers` into a `XXX_REFERENCES: IModelReference[]` constant with three groups.
2. Set `papers: []` on all packages.
3. Add `references: XXX_REFERENCES` to the metadata.
4. Add `| { separator: true; readonly label?: string }` handling to `IModelWiki` entries if not already present.
5. Reorder wikis to follow the standard six-first pattern with a separator.

### Handler changes
1. Update `hasPapers` to check `data.references.some(r => !('separator' in r))`.
2. Change the `'paper'` case to call `openReferenceList(data.references, ...)`.
3. Add `openVideoList` case if the webview has videos.

---

## 15. KaTeX equations pane

Some webviews benefit from a collapsible **Key Equations** pane that renders LaTeX. KaTeX (~592 KB) is bundled under `src/vs/workbench/contrib/katex/dist/` and shared across all menus.

### Step 1 — command file
```typescript
import { getKatexUris } from '../../../katex/browser/katexHelper.js';

const katex = getKatexUris();
const webviewInput = webviewWorkbenchService.openWebview(
    { ..., contentOptions: { allowScripts: true, localResourceRoots: [katex.distRoot] }, ... },
    ...
);
webviewInput.webview.setHtml(getXxxHtml(katex.js, katex.css));
```

### Step 2 — template function signature and CSP
```typescript
export function getXxxHtml(katexJs: string, katexCss: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'none';
                   style-src 'unsafe-inline' vscode-resource:;
                   script-src 'unsafe-inline' vscode-resource:;
                   font-src vscode-resource: data:;">
    <link rel="stylesheet" href="${katexCss}">
    ...
</head>
<body>
    ...
    <script>/* your webview JS */</script>
    <script src="${katexJs}"></script>   <!-- load KaTeX last -->
</body>
</html>`;
}
```

### Step 3 — equations pane HTML + CSS + JS

CSS:
```css
.eq-section { margin: 20px 0; border: 1px solid var(--vscode-widget-border); border-radius: 6px; overflow: hidden; }
.eq-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; background: var(--vscode-textCodeBlock-background); border: none; color: var(--vscode-foreground); font-size: 13px; font-weight: 600; padding: 10px 14px; cursor: pointer; }
.eq-body { display: none; padding: 16px 20px; background: var(--vscode-editor-background); }
.eq-body.open { display: block; }
```

JS (lazy rendering — renders only on first open):
```javascript
var katexRendered = false;
document.getElementById('eq-toggle').addEventListener('click', function() {
    var body = document.getElementById('eq-body');
    var isOpen = body.classList.toggle('open');
    if (isOpen && !katexRendered) {
        katexRendered = true;
        katex.render('\\min_x f(x)', document.getElementById('eq-obj'), { throwOnError: false, displayMode: true });
    }
});
```

> **LaTeX escaping:** inside a JS template literal, backslashes must be doubled: `\\min`, `\\frac`. In regular `'...'` strings a single backslash is enough.

---

## 16. Illustration pane (generalised collapsible pane)

The **Illustration pane** is the standard collapsible pane for any supplementary visual content. It generalises the equations pane and supports four content types:

| Type | Content | Mechanism |
|---|---|---|
| `html` | Inline HTML — Unicode equations, rich text, tables | Direct `innerHTML` |
| `svg` | Inline SVG diagram — flowcharts, concept maps, comparison diagrams | Direct `innerHTML` |
| `image` | Bundled PNG/GIF — photos, animations, convergence plots | `asWebviewUri()` + `<img>` |
| `mermaid` | Mermaid diagram source | Mermaid.js (see note below) |

**Single-model webviews:** pane starts collapsed; content is rendered lazily on first open.
**Multi-model webviews:** pane starts **open** (no `collapsed` class); `renderIllustration()` is called inside `setModel()` every time the model changes, so content always reflects the active model.

### Number of panes

A webview can have **zero, one, or more** illustration panes:

- **Zero** — omit the `<div class="illus-section">` block entirely. Use this when the webview is purely interactive (no diagrams, equations, or gallery) or when visual content is deferred to a future release.
- **One** — the common case. One pane for a diagram, SVG gallery, or task explorer.
- **More than one** — place additional `illus-section` blocks in the same position (all after the model toggle, before the form inputs). Give each a **unique `id`** (`illus-section`, `illus-section-2`, etc.) and a distinct toggle label (see below).

### Overriding the pane label

The default label is **"Illustration"**. Override it per pane by setting a different text label on the toggle button. In **scaffold-based webviews** (`buildWebviewHtml`), use the `illustrationLabel` property:

```typescript
buildWebviewHtml({
    // ...
    illustrationLabel: 'Explore by Task',   // replaces "Illustration" on the toggle button
})
```

For **non-scaffold webviews** (hand-written HTML), change the text node inside the toggle button directly:

```html
<button class="illus-toggle" id="illus-toggle">
  <span class="illus-chevron"><!-- chevron SVG --></span>
  Explore by Task
</button>
```

Use a label that describes the **purpose** of the pane rather than its format — "Explore by Task", "Model Comparison", "Key Equations", "Field Panorama" are all better than the generic "Illustration".

### Placement in HTML

Place illustration panes immediately **after the model toggle buttons and before the form inputs**:

```html
<!-- Model toggle -->
<div class="model-toggle" id="model-group">...</div>

<!-- Illustration pane (one or more, each with a unique id and descriptive label) -->
<div class="illus-section" id="illus-section">
  <button class="illus-toggle" id="illus-toggle">
    <span class="illus-chevron"><!-- chevron SVG --></span>
    Explore by Task
  </button>
  <div class="illus-body" id="illus-body"></div>
</div>

<!-- Optional second pane -->
<div class="illus-section collapsed" id="illus-section-2">
  <button class="illus-toggle" id="illus-toggle-2">
    <span class="illus-chevron"><!-- chevron SVG --></span>
    Model Comparison
  </button>
  <div class="illus-body" id="illus-body-2"></div>
</div>

<!-- Parameter form -->
<div class="form-row">...</div>

<!-- Code preview -->
<div class="code-preview-wrapper">...</div>
```

> ⚠️ **CRITICAL — position rule:** Illustration panes MUST appear between the model toggle buttons and the input fields. They must NEVER be placed below the input fields. This rule was confirmed explicitly and is non-negotiable.

### CSS (add to the shared block)

```css
.illus-section { margin: 0 0 20px 0; }
.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
.illus-toggle:hover { opacity: 0.8; }
.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; }
.illus-section.collapsed .illus-chevron { transform: rotate(180deg); }
.illus-section.collapsed .illus-body { display: none; }
.illus-body { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px 20px; overflow-x: auto; }
.illus-image { max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 4px; }
.illus-caption { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; margin-top: 10px; font-style: italic; line-height: 1.5; }
```

Use the same **up-chevron SVG** as the equation toggle (copy from `lp.template.ts`).

### JS — toggle handler

**Single-model** (lazy render, starts collapsed):
```javascript
var illusRendered = false;

function renderIllustration() {
    var body = document.getElementById('illus-body');
    body.innerHTML = '<div style="text-align:center">'
        + '<!-- paste inline SVG or HTML here -->'
        + '</div>'
        + '<div class="illus-caption">Caption text here.</div>';
}

document.getElementById('illus-toggle').addEventListener('click', function() {
    var section = document.getElementById('illus-section');
    section.classList.toggle('collapsed');
    if (!section.classList.contains('collapsed') && !illusRendered) {
        illusRendered = true;
        renderIllustration();
    }
});
```

**Multi-model** (open by default, re-renders on model switch):
```javascript
// renderIllustration uses currentModel to pick content
function renderIllustration() {
    var body = document.getElementById('illus-body');
    if (currentModel === 'evo') {
        body.innerHTML = '<!-- SVG for evolutionary model -->';
    } else {
        // equations HTML for other models using eqRow()
        var html = '<div class="eq-block">';
        // ... eqRow(...) calls ...
        html += '</div>';
        body.innerHTML = html;
    }
}

// Call renderIllustration() inside setModel() — not lazily
function setModel(model) {
    // ... toggle buttons, field visibility ...
    renderIllustration();   // ← always re-render when model changes
    updateCodePreview();
}

// Simple toggle — no lazy guard needed
document.getElementById('illus-toggle').addEventListener('click', function() {
    document.getElementById('illus-section').classList.toggle('collapsed');
});
```

### Type: inline SVG (preferred for diagrams)

Inline SVG requires no URI mapping and no CSP changes — SVG markup is embedded directly in the HTML string. This is the preferred approach for:
- Side-by-side algorithm comparison diagrams (e.g. Momentum vs Nesterov)
- Convergence path illustrations
- Concept maps and flowcharts drawn in SVG

```html
<div class="illus-body" id="illus-body">
  <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
    <!-- SVG content -->
  </svg>
  <div class="illus-caption">Caption describing the diagram.</div>
</div>
```

> **Colour rule:** Use `currentColor` for strokes and fills so diagrams adapt to light and dark themes. Avoid hardcoded hex colours.

### Type: bundled image (PNG / GIF)

Bundled media files require `asWebviewUri()` to produce a `vscode-resource:` URI. Follow the KaTeX pattern (§15):

**Command file:**
```typescript
import { Uri } from '../../../../base/common/uri.js';

const mediaRoot = Uri.joinPath(extensionUri, 'media', 'illustrations');
const imageUri = webviewInput.webview.asWebviewUri(Uri.joinPath(mediaRoot, 'optim-path.gif'));
webviewInput.webview.setHtml(getXxxHtml(imageUri.toString()));
```

**Template function signature:**
```typescript
export function getXxxHtml(imageUri: string): string {
```

**CSP** — add `img-src vscode-resource: data:;` to the Content-Security-Policy meta tag:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';
               img-src vscode-resource: data:; font-src data:;">
```

**Image tag:**
```html
<img class="illus-image" src="${imageUri}" alt="Optimisation path">
```

Place media files at `media/illustrations/<topic>/<filename>.<ext>`.

Animated GIFs play automatically in the webview — no video controls or JS needed.

### Type: Mermaid diagrams

**Available now.** Mermaid v11 is vendored at `vs/workbench/contrib/mermaid/dist/mermaid.min.js` (a self-contained classic script that assigns `window.mermaid`) with helper `getMermaidUris()` in `vs/workbench/contrib/mermaid/browser/mermaidHelper.ts` — same pattern as KaTeX (§15). Load it via `localResourceRoots: [getMermaidUris().distRoot]` and a `<script src>` (the scaffold loads it lazily). `mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: <dark?'dark':'default'> })` then `await mermaid.render(id, def)`; call `out.bindFunctions(container)` after injecting `out.svg` so `click … call fn()` directives work. The **Concept Map** Learn More panel is the reference use (see §"Learn More order"). The build copies the dist via the `out-build/vs/workbench/contrib/mermaid/dist/**` glob in `build/gulpfile.vscode.ts`; during dev the watch does not copy it, so `cp` it into `out/` once (like media). The markdown preview's own copy under `extensions/mermaid-chat-features/node_modules/mermaid/dist/` is the extension's, not for workbench use — keep the vendored workbench copy independent.

### Checklist additions (append to §13)

- [ ] Illustration pane(s): decide count — zero, one, or more; give each a unique `id` and descriptive label
- [ ] Use `illustrationLabel` on `buildWebviewHtml` (or change the text node directly) — never leave "Illustration" unless it genuinely describes the pane's purpose
- [ ] Choose content type per pane (svg / image / mermaid)
- [ ] If SVG: use `currentColor` for all strokes and fills
- [ ] If SVG: use `viewBox="-20 0 360 180"` and `max-width:480px` — prevents caption clipping (see §9)
- [ ] If image: add `img-src vscode-resource: data:;` to CSP; pass URI via `getXxxHtml(imageUri)` parameter; place file under `media/illustrations/`
- [ ] **Position:** all panes placed after model toggle buttons, before form inputs — NEVER below the input fields
- [ ] Single-model: `illusRendered` flag + lazy render on first open; pane has `class="illus-section collapsed"`

---

## 17. Bundling notebooks — strip outputs first

**Rule: always strip cell outputs before bundling any `.ipynb` file.**

Outputs (plots, printed arrays, base64-encoded images) are the only thing that makes notebooks large. Source-only notebooks are tiny — the entire 47-notebook RxInfer collection is 1.18 MB stripped vs 101.6 MB with outputs (99% reduction). Outputs are regenerated when the user runs the notebook, so there is no loss.

**Expected density:** ~25 KB per notebook on average. At that rate:
- 200 notebooks → ~5 MB
- 500 notebooks → ~12 MB
- 1000 notebooks → ~25 MB

All are acceptable bundle sizes even without compression.

**How to strip a batch:**
```python
import json, pathlib

for p in pathlib.Path('path/to/notebooks').rglob('*.ipynb'):
    nb = json.loads(p.read_text(encoding='utf-8'))
    for cell in nb.get('cells', []):
        cell['outputs'] = []
        cell['execution_count'] = None
    p.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding='utf-8')
```

**Reusable notebook sections:** Define notebook groups as an exported `IModelNotebookSection[]` constant (e.g. `RXINFER_NOTEBOOK_SECTIONS`) in the command file. The metadata `notebooks` field derives from it via `.flatMap(s => s.notebooks)`. This allows other parts of Pollis to import and reuse the same grouped list without duplication.

**Do not bundle stubs.** A "Coming soon!" stub next to real notebooks degrades the experience. Only bundle notebooks with real content; leave the section out entirely until the notebooks are ready.

**Organisation:** The 4-section pattern (e.g. Basic / Advanced / Problem Specific / Experimental) works well up to ~100 notebooks. Beyond that, consider a search/filter in the notebook panel rather than more sections.

### Known bug: literal newlines in notebook JSON → "editor could not be opened"

**Symptom:** Clicking a notebook card shows "The editor could not be opened due to an unexpected error." No other visible indication of what went wrong.

**Root cause:** The `.ipynb` format is JSON. If a notebook is created or edited by hand with literal newline characters inside string values (e.g. `"source":["# Title","\n","text"]` written with a real line break instead of `\n`), the file is invalid JSON. VS Code's notebook editor silently fails to parse it and shows this generic error.

**How to detect:** Run `python3 -c "import json, pathlib; [json.loads(p.read_text()) or print('ok') for p in pathlib.Path('notebooks').rglob('*.ipynb')]"` — any file with invalid JSON will raise a `JSONDecodeError`.

**Fix:** Replace literal unescaped newlines inside JSON strings with `\n`:
```python
import json, pathlib, re

for p in pathlib.Path('path/to/notebooks').rglob('*.ipynb'):
    raw = p.read_text(encoding='utf-8')
    try:
        json.loads(raw)
        continue  # already valid
    except json.JSONDecodeError:
        pass
    fixed = re.sub(r'"([^"\\]*(?:\\.[^"\\]*)*)"',
        lambda m: '"' + m.group(1).replace('\n', '\\n').replace('\r', '\\r') + '"',
        raw, flags=re.DOTALL)
    json.loads(fixed)  # verify before writing
    p.write_text(fixed, encoding='utf-8')
```

**When it surfaces:** Most likely when stub notebooks are created by hand rather than via `jupyter nbconvert` or a proper notebook tool. Always validate JSON after manual edits to `.ipynb` files.

### Known bug (upstream): notebook renders blank after switching away and back

If a Notebook Tutorial opens and runs fine but goes **completely blank** when you switch editors and return (resize doesn't help, no console error), that is **not** a webview/`model.handler.ts` problem — it is an upstream Code OSS regression in the notebook editor's overlay hide/show that landed in the fork's base. It is **fixed** in Pollis by reversing the `notebookEditorWidget.ts` hunks of commit `618c5ea3667` (upstream fixed it independently a few days later; drop the patch on the next rebase). Don't try to fix it from the webview layer. See **`POLLIS_GUIDE.md` §6.1**.

### Known bug: missing media directory → "file not found" on every wiki/notebook card

**Symptom:** Clicking *any* Notebook Tutorial or Local Wiki card fails with a file-not-found error. The webview, buttons, and code preview all work — only the bundled `.ipynb`/`.md` files won't open.

**Root cause:** The command file lists `wikis`/`notebooks` with `file: '<topic>/…'` and `bundled: true`, but the `media/wiki/<topic>/` and `media/notebooks/<topic>/` **directories were never created**. `openWikiByFile`/`openNotebookByFile` resolve the path via `FileAccess.asFileUri(WIKI_BASE + file)` and hand it to `editorService.openEditor`, which fails because the file genuinely does not exist. This is a *content* gap, not a code bug — the metadata references files nobody authored. It bit all four **Visualise** webviews (`cviz`, `dcmp`, `mviz`, `tsviz`): the menu entries shipped before their media folders existed.

**How to detect** — cross-check every `file:` reference against the filesystem:
```python
import re, os
cmd = open('commands/<acronym>.command.ts').read()
NB = 'media/notebooks/'; WK = 'media/wiki/'
for path in re.findall(r"file:\s*'([^']+\.(?:ipynb|md))'", cmd):
    base = WK if path.endswith('.md') else NB
    if not os.path.exists(base + path):
        print('MISSING:', path)
```

**Fix:** author the referenced files (do **not** leave "Coming soon!" stubs in a shipping menu — see §17 *Do not bundle stubs*). The standard wiki set is 6 pages (factsheet, overview, assumptions, diagnostics, interpretation, decision-guide) plus one page per method/plot type; notebooks follow `tutorial-NN-<name>.ipynb` with stripped outputs and the Julia kernelspec.

> ⚠️ **The build watch task does NOT copy `.md`/`.ipynb` media into `out/`.** It only compiles `.ts → .js`. A full `gulp` build copies media (via the globs in `build/gulpfile.vscode.ts`, which also feed the packaged app), but during day-to-day development newly added media must be **copied into `out/` manually** or the running dev app still reports file-not-found even though the files exist in `src/`:
> ```bash
> cp -R src/vs/workbench/contrib/model/browser/media/{wiki,notebooks}/<topic> \
>       out/vs/workbench/contrib/model/browser/media/{wiki,notebooks}/
> ```
> Verify both trees: every referenced file must exist in **`src/` and `out/`**.

- [ ] Multi-model: no `collapsed` class (open by default); `renderIllustration()` called inside `setModel()`; toggle handler just toggles collapsed class with no render guard

---

## 18. Code-action buttons (Copy / Send to Terminal / Julia REPL / Send to Editor / Send to Notebook)

A row of action buttons placed **below** the code-preview box lets the user take the generated Julia code somewhere useful. Reference implementation: `tsviz` (Time Series Plots). There are five buttons; **Send to Notebook is by far the most complex** because it must build a real Jupyter notebook with the code in a code cell.

> **Placement — bottom row, not top.** The bar goes *below* the code box, in both the main preview and every Next Steps panel code box. Reasons: (1) the panel boxes already carry a **title + subtitle** above the code, and a top button row would compete with that header; the main box is expected to gain a title/subtitle too, so bottom keeps them uniform. (2) Reading order is then **title → subtitle → code → actions** (you see what it is, read the code, then act). Use the `code-btn-bar-bottom` modifier (margin *above* the bar) so the gap mirrors the main box rather than stacking on the wrapper's bottom margin. All four Visualise webviews follow this.

### 18.1 What each button does

| Button | Mechanism | Requires |
|---|---|---|
| **Copy** | Client-side `navigator.clipboard.writeText()` in the webview — no message to the host at all | nothing |
| **Send to Editor** | Host opens an untitled `.jl` editor via `IEditorService.openEditor({ resource: undefined, contents, languageId: 'julia' })` | nothing |
| **Send to Terminal** | Host runs `workbench.action.terminal.sendSequence` with `{ text: code + '\n' }` | an open terminal |
| **Send to Notebook** | Host resolves an **untitled Jupyter notebook**, inserts the code as one `julia` **code cell**, opens it, then **auto-selects the Julia kernel** | Julia VS Code extension only — it supplies the kernel directly; **no IJulia / Jupyter install needed** |
| **Send to Pluto** | Host writes the code as a fresh one-cell **Pluto `.jl` notebook**, ensures a Pluto server is running (auto-`Pkg.add("Pluto")` on first use), then opens it in the **internal browser** | Julia + Pluto.jl (installed automatically) |
| **Julia REPL** | Host runs `language-julia.startREPL`, then `terminal.sendSequence` | Julia VS Code extension |

All four host-side actions are carried by a single `runCode` message discriminated by a `target` field. Copy never reaches the host.

### 18.2 CSS (template `<style>`)

The buttons reuse the original secondary-button look (do **not** restyle them as toggle pills — that implies selection, and the user rejected that). The bar is flushed right and sits **below** the code box; the `-bottom` modifier swaps the `margin-bottom` for a `margin-top` so the gap above the bar matches the spacing elsewhere:

```css
.code-btn-bar { display: flex; justify-content: flex-end; gap: 4px; margin-bottom: 6px; }
.code-btn-bar-bottom { margin-bottom: 0; margin-top: 6px; }
.code-action-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; white-space: nowrap; }
.code-action-btn:hover { opacity: 1; }
```

The `.code-preview` rule must **not** carry the old `padding-right: 50px` (that was for an overlaid copy button; the bar is now a sibling, not an overlay).

### 18.3 HTML — button bar below the code box

The bar must be **inside** `.code-preview-wrapper`, *after* the `.code-preview` div — not after the wrapper closes, or the wrapper's own `margin-bottom` adds to the gap.

```html
<div class="code-preview-wrapper">
    <div class="code-preview" id="code-preview"></div>
    <div class="code-btn-bar code-btn-bar-bottom">
        <button class="code-action-btn" id="btn-copy">Copy</button>
        <button class="code-action-btn" id="btn-terminal">Send to Terminal</button>
        <button class="code-action-btn" id="btn-julia-repl">Julia REPL</button>
        <button class="code-action-btn" id="btn-new-file">Send to Editor</button>
        <button class="code-action-btn" id="btn-notebook">Send to Notebook</button>
    </div>
</div>
```

> **Order convention (all webviews).** The buttons go **Copy → Send to Terminal → Julia REPL → Send to Editor → Send to Notebook** — grouped by destination: clipboard first, then the two terminal targets, then the two file/document targets. Keep this order identical in the main bottom bar **and** the panel `renderRightCode` bar of every webview.

The Next Steps **panel** code boxes use the identical bottom bar, built dynamically in `renderRightCode` with `data-act` attributes and one delegated click listener (`extractCode('panel-code')` reads that box). See `tsviz` for the reference.

### 18.4 JavaScript (template `<script>`)

Extract the code once, then wire each button. The code lives in `.code-line` / `.code-blank` divs — read `textContent` and join with newlines (note the doubled backslash: `'\\n'` in the TS string becomes `'\n'` in the emitted JS):

```javascript
function extractCode() {
    var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
    return Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
}

document.getElementById('btn-copy').addEventListener('click', function() {
    navigator.clipboard.writeText(extractCode()).then(function() {
        var btn = document.getElementById('btn-copy');
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    });
});
document.getElementById('btn-new-file').addEventListener('click', function() {
    vscode.postMessage({ command: 'runCode', target: 'newFile', code: extractCode() });
});
document.getElementById('btn-terminal').addEventListener('click', function() {
    vscode.postMessage({ command: 'runCode', target: 'terminal', code: extractCode() });
});
document.getElementById('btn-notebook').addEventListener('click', function() {
    vscode.postMessage({ command: 'runCode', target: 'notebook', code: extractCode() });
});
document.getElementById('btn-julia-repl').addEventListener('click', function() {
    vscode.postMessage({ command: 'runCode', target: 'juliaRepl', code: extractCode() });
});
```

### 18.5 Message type (`common/<acronym>.types.ts`)

Add one discriminated member to the `XxxWebviewMessage` union:

```typescript
| { command: 'runCode'; target: 'newFile' | 'terminal' | 'juliaRepl' | 'notebook'; code: string }
```

### 18.6 Handler (`handlers/<acronym>.handler.ts`)

**Imports** (mind the relative depth — a handler sits at `…/<group>/browser/handlers/`):

```typescript
import { Event } from '../../../../../base/common/event.js';                                 // base = 5 up
import { disposableTimeout } from '../../../../../base/common/async.js';                      // base = 5 up
import { IUntitledTextResourceEditorInput } from '../../../../common/editor.js';             // workbench/common = 4 up
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js'; // contrib = 3 up
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { CellEditType, CellKind } from '../../../notebook/common/notebookCommon.js';
```

> ⚠️ **Depth gotcha:** `workbench/common/editor.ts` is **four** levels up (`../../../../common/editor.js`), not three. Three levels lands in `contrib/common`, which does not exist, and `tsgo` reports `TS2307: Cannot find module`. This bit us once.

**New service parameters** — handlers are plain functions, not DI classes, so **both** notebook services must be threaded in as parameters (placed before the optional `initialModel`):

```typescript
notebookEditorModelResolverService: INotebookEditorModelResolverService,
notebookKernelService: INotebookKernelService,
initialModel?: string,
```

**The `runCode` case** inside the `onMessage` switch:

```typescript
case 'runCode': {
    const code = msg.code;
    if (msg.target === 'newFile') {
        const input: IUntitledTextResourceEditorInput = { resource: undefined, contents: code, languageId: 'julia' };
        await editorService.openEditor(input);
    } else if (msg.target === 'terminal') {
        await commandService.executeCommand('workbench.action.terminal.sendSequence', { text: code + '\n' });
    } else if (msg.target === 'juliaRepl') {
        await commandService.executeCommand('language-julia.startREPL');
        await commandService.executeCommand('workbench.action.terminal.sendSequence', { text: code + '\n' });
    } else if (msg.target === 'notebook') {
        const ref = await notebookEditorModelResolverService.resolve({ untitledResource: undefined }, 'jupyter-notebook');
        const notebook = ref.object.notebook;
        notebook.applyEdits([{
            editType: CellEditType.Replace,
            index: 0,
            count: notebook.cells.length,        // replace any default empty cell → exactly one cell
            cells: [{
                cellKind: CellKind.Code,
                source: code,
                language: 'julia',
                mime: undefined,
                outputs: [],
                metadata: {},
            }],
        }], true, undefined, () => undefined, undefined, false);
        // Tie the model reference lifetime to the notebook so it is released when the editor closes.
        Event.once(notebook.onWillDispose)(() => ref.dispose());
        await editorService.openEditor({ resource: notebook.uri, options: { override: 'jupyter-notebook' } });

        // Auto-select the Julia kernel so the user is never shown the kernel quickpick.
        autoSelectJuliaKernel(notebook, notebookKernelService);
    }
    break;
}
```

**The `autoSelectJuliaKernel` helper** lives in `model.handler.ts` and is the single source of truth for kernel selection — both **Send to Notebook** (above) and **Notebook Tutorials** (§10, `openNotebookByFile`) call it. The Julia extension registers its kernels asynchronously once it activates (triggered by opening the notebook), so the helper tries immediately and otherwise waits for a kernel to appear via `onDidAddKernel`, with a 10 s safety timeout:

```typescript
export function autoSelectJuliaKernel(notebook: INotebookTextModelLike, notebookKernelService: INotebookKernelService): void {
    const selectJuliaKernel = (): boolean => {
        const match = notebookKernelService.getMatchingKernel(notebook);
        if (match.selected) { return true; }
        const julia =
            match.all.find(k => k.supportedLanguages.includes('julia') && /release channel/i.test(k.label))
            ?? match.all.find(k => k.supportedLanguages.includes('julia'))
            ?? match.all.find(k => /julia/i.test(k.label));
        if (julia) { notebookKernelService.selectKernelForNotebook(julia, notebook); return true; }
        return false;
    };
    if (!selectJuliaKernel()) {
        const kernelStore = new DisposableStore();
        kernelStore.add(notebookKernelService.onDidAddKernel(() => { if (selectJuliaKernel()) { kernelStore.dispose(); } }));
        kernelStore.add(disposableTimeout(() => kernelStore.dispose(), 10000));
    }
}
```

**Why each piece of the notebook branch matters:**
- `resolve({ untitledResource: undefined }, 'jupyter-notebook')` — passing the **object literal** (not a `URI`) picks the untitled overload and auto-generates an `Untitled-N` resource. `'jupyter-notebook'` is the view-type registered by the bundled `ipynb` extension.
- `count: notebook.cells.length` (not `0`) — a freshly resolved notebook may already contain one empty code cell; replacing all cells guarantees exactly one cell holding the code rather than a stray blank one underneath.
- `applyEdits(edits, true, undefined, () => undefined, undefined, false)` — the six args are `(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo)`. `computeUndoRedo: false` because there is no prior state worth undoing on a brand-new notebook.
- `Event.once(notebook.onWillDispose)(() => ref.dispose())` — `resolve()` returns a **ref-counted** `IReference`. Releasing it on the notebook's dispose prevents a model leak without tearing the model down while the editor still needs it. Do **not** dispose the ref into the webview's `DisposableStore` — that store dies when the webview closes and would kill a notebook the user is still using.
- `openEditor({ resource, options: { override: 'jupyter-notebook' } })` — `override` routes the untitled resource to the notebook editor for that view type.

### 18.7 Command (`commands/<acronym>.command.ts`)

Import **both** services, add the parameters (before optional `initialModel`), and forward them. `INotebookKernelService` is needed for the Julia-kernel auto-selection (Send to Notebook **and** Notebook Tutorials — see §10):

```typescript
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';

export function openXxxWebview(
    /* …existing service params… */
    notificationService: INotificationService,
    notebookEditorModelResolverService: INotebookEditorModelResolverService,
    notebookKernelService: INotebookKernelService,
    initialModel?: string,
): void {
    /* …openWebview + setHtml… */
    registerXxxWebviewHandlers(
        /* …existing args… */
        notificationService,
        notebookEditorModelResolverService,
        notebookKernelService,
        initialModel,
    );
}
```

### 18.8 Contribution wiring (`<group>.contribution.ts`)

Import the decorators and pass `accessor.get(...)` in **every** `CommandsRegistry.registerCommand` that opens this webview (one per deep-link `initialModel`):

```typescript
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js'; // contrib = 2 up from explore/browser
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';

openXxxWebview(
    /* …existing accessor.get(...) args… */
    accessor.get(INotificationService),
    accessor.get(INotebookEditorModelResolverService),
    accessor.get(INotebookKernelService),
    'tsplot', // the initialModel for this entry
);
```

### 18.9 Sequential TODO list (do in this order)

1. [ ] **types** — add `| { command: 'runCode'; target: 'newFile' | 'terminal' | 'juliaRepl' | 'notebook'; code: string }` to `XxxWebviewMessage`.
2. [ ] **handler imports** — add `Event`, `IUntitledTextResourceEditorInput` (4 levels up!), `INotebookEditorModelResolverService`, `INotebookKernelService`, `CellEditType, CellKind`, and `autoSelectJuliaKernel` from `model.handler.js`.
3. [ ] **handler signature** — add `notebookEditorModelResolverService` and `notebookKernelService` just before `initialModel?`.
4. [ ] **handler switch** — add the `case 'runCode'` block (all four host targets) exactly as in §18.6, and forward both services in the `case 'openNotebook'` call (§10) so Notebook Tutorials also auto-select the kernel.
5. [ ] **command imports** — add `INotebookEditorModelResolverService` and `INotebookKernelService`.
6. [ ] **command signature** — add the same two parameters before `initialModel?`.
7. [ ] **command call** — forward both services to `registerXxxWebviewHandlers(...)`.
8. [ ] **contribution import** — add `INotebookEditorModelResolverService` and `INotebookKernelService` (2 levels up from `<group>/browser/`).
9. [ ] **contribution calls** — add `accessor.get(INotebookEditorModelResolverService)` and `accessor.get(INotebookKernelService)` to **each** registration that opens this webview.
10. [ ] **template CSS** — add `.code-btn-bar`, `.code-btn-bar-bottom`, `.code-action-btn` (+ remove any `padding-right: 50px` from `.code-preview`).
11. [ ] **template HTML** — add the five-button `.code-btn-bar code-btn-bar-bottom` **below** `#code-preview`, inside the wrapper (and the same bottom bar in `renderRightCode`).
12. [ ] **template JS** — add `extractCode()` and the five click handlers.
13. [ ] **type-check** — `npm run compile-check-ts-native` → zero errors (watch for the `TS2307` editor.js depth bug).
14. [ ] **layers** — `npm run valid-layers-check` → passes (inter-contrib imports such as model/explore → notebook are allowed; the checker only enforces base→platform→editor→workbench).
15. [ ] **grep `\'`** in the template — a stray escaped apostrophe silently kills the whole webview (see §9).

### 18.10 Pitfalls specific to these buttons

- **`editor.js` import depth** — `../../../../common/editor.js` (four up). Three up = `TS2307`.
- **Ref lifecycle differs by notebook kind — get this right or the editor renders blank.**
  - **Untitled notebook (Send to Notebook):** you created the model, so you own it — keep the `IReference` alive and release it on `notebook.onWillDispose` (never via the webview `DisposableStore`, which dies when the webview closes and would kill a notebook the user is still using).
  - **File-backed notebook (Notebook Tutorials, `openNotebookItem`):** the **notebook editor owns the model**. Do **not** hold a long-lived reference. Open it plainly with `editorService.openEditor({ resource })`, then — only if auto-selecting the kernel — resolve a **transient** ref, call `autoSelectJuliaKernel`, and `dispose()` it immediately in a `finally`. The editor keeps its own ref, so the model and the pending async kernel selection stay valid. Holding a second long-lived ref (e.g. tied to `onWillDispose`) **fights the editor's lifecycle: navigate away and back and the model is disposed, so the notebook shows up blank.** Also do not pass `options: { override: 'jupyter-notebook' }` for a file-backed `.ipynb` — the notebook editor is already its default editor.
- **Stray empty cell** — use `count: notebook.cells.length`, not `0`.
- **Execution needs a kernel** — *opening* the notebook works with no Julia kernel; *running* the cell needs IJulia installed and selected. This is expected; it is the main thing to compare against the Julia REPL path when deciding which button works best under which circumstances.
- **`runCode` is per-webview** — the message type, handler case, and service threading are duplicated into each webview that wants the buttons. There is no shared helper yet; copy the `tsviz` implementation verbatim.
- **Button style** — keep the secondary-button look; do **not** convert to `.toggle-btn` pills (pills imply mutually-exclusive selection, which these are not).

### 18.11 Send to Pluto

Unlike the other code-action targets (whose logic is duplicated per handler), **Send to Pluto** lives in **one shared command** so the per-webview cost stays tiny:

- **Commands:** `commands/pluto.command.ts` registers (via `registerPlutoCommands()` from `model.contribution.ts`) both `pollis.action.sendToPluto` — writes a fresh one-cell Pluto `.jl` under `IEnvironmentService.cacheHome/pollis-pluto/` (unique `pollis-pluto-<ts>.jl` — **never overwrites**) and opens it in the **internal browser** (`workbench.action.browser.open` → `<base>/open?path=<encoded fsPath>`) — and `pollis.action.newPlutoNotebook` — a **New File: Pluto Notebook** entry (`MenuRegistry.appendMenuItem(MenuId.NewFile, …)`) that opens a brand-new empty notebook (`<base>/new`). Both share `ensurePlutoServer()` (reuse-or-start). Separately, `juliaNotebookKernel.contribution.ts` makes **Julia the default kernel** for any opened Jupyter notebook with no kernel selected (reuses `autoSelectJuliaKernel`).
- **Server start = file handshake, not network.** Fixed ports clash (`EADDRINUSE`) and the renderer **can't `fetch` localhost (CSP)**. So we write a `launch.jl` that: ensures Pluto (`Pkg.add` fallback), grabs a **free OS port** (`listen(localhost, 0)`), builds a `Pluto.ServerSession()` (so we can read its `.secret`), writes `port.txt` + `secret.txt`, starts the server with `Pluto.run(_session)` (**secret kept on** — no "dangerous setting" warning), and (on an `@async` task) writes `ready.txt` once the port accepts a connection. The cell body is wrapped in `begin … end` (Pluto allows one expression per cell). The command `include(raw"…launch.jl")`s it in the Julia REPL, then **polls those files via `IFileService`** (not the network) for port + secret + readiness, and opens `…/open?path=<enc fsPath>&secret=<enc secret>` in the internal browser. Base URL + secret are cached in module variables so **repeat clicks reuse the same server**.
- **Per webview:** add `'pluto'` to the `runCode` target union (types), one `else if (msg.target === 'pluto') { await commandService.executeCommand('pollis.action.sendToPluto', code); }` branch in the handler, and the **Send to Pluto** button (after Send to Notebook) in the scaffold's main bar + `renderRightCode` panel bar. (The scaffold already does all of this for the Visualise webviews.)
- **Layer note:** use `IEnvironmentService` (common, browser-safe), **not** `INativeEnvironmentService` — the latter trips the browser-layer checker. `cacheHome` is a real on-disk folder Pluto can read.
- **Status, not a toast.** The "Starting Pluto…" wait is shown via `IProgressService` `ProgressLocation.Window` (status bar), **not** `notificationService.info` — a notification **toast overlapping the internal browser** makes `browserView` show a "Paused due to Notification" overlay (see `overlayManager.ts` watching `notification-toast-container`). Any toast over the browser pauses it, so feature code near the browser should prefer window/status progress.
- **Caveats:** Pluto opens the file in *safe preview* (code not run until the user clicks **Run notebook code** — matches "run later"); the Julia REPL shows "Evaluating…" forever because `Pluto.run` blocks it (that REPL *is* the server — expected); session reuse breaks if the user kills the REPL (reload the window to reset the cached base/secret); first run installs/precompiles Pluto (slow → 10-minute file-poll timeout).

---

## 19. Backend toggle for Makie 3D plots (interactive vs static, per target)

Makie has three display backends, and **no single one is right for every Send-to target**. A webview whose code uses 3D Makie (surface, 3D contour, volume) should let the user choose, and should pick the best backend per target. Reference implementation: `sfviz` (Surfaces and Fields).

| Backend | What it does | Best target |
|---|---|---|
| **GLMakie** | Native OpenGL window (interactive) | **All four Send targets** — window in the terminal, VS Code plot pane for REPL / Editor, and the notebook (window). The default everywhere. |
| **CairoMakie** | Static vector image, renders **inline** | The `Interactive` checkbox's *static* path, for 2D plots and static `Axis3` surfaces. **Cannot render 3D isosurfaces or `volume`.** |
| ~~**WGLMakie**~~ | Interactive WebGL **inline** in a notebook | **Avoided.** Its inline rendering does **not** work in this VS Code notebook environment (Bonito spins up an HTTP server but no plot renders — confirmed with a bare `scatter`). Do not use it. |

### 19.1 The `Interactive` checkbox (in the code-action bar)

Add a checkbox at the **far left** of the bottom `.code-btn-bar`, with the five action buttons grouped on the right. Use a `code-btn-bar-split` modifier (`justify-content: space-between`) and wrap the buttons in a `.code-btn-group` span so they stay clustered:

```html
<div class="code-btn-bar code-btn-bar-bottom code-btn-bar-split">
    <label class="interact-toggle"><input type="checkbox" id="interact-cb" checked> Interactive</label>
    <span class="code-btn-group"><!-- the 5 code-action-btn buttons --></span>
</div>
```
```css
.code-btn-bar-split { justify-content: space-between; }
.code-btn-group { display: flex; gap: 4px; }
.interact-toggle { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--vscode-foreground); cursor: pointer; user-select: none; opacity: 0.85; }
```
Far-left placement reads as *option on the left, actions on the right* — it must not look like one of the action buttons.

### 19.2 Backend in `updateCodePreview()`

A `var interactive = true;` flag (toggled by the checkbox, which then calls `updateCodePreview()`) drives the `using` line. **CairoMakie cannot render `volume`** — that plot's static path must use `GLMakie` + `Makie.inline!(true)` instead. A helper keeps it tidy:

```javascript
function makie(canCairo) {
    if (interactive) {
        return cline(kw('using') + ' ' + ty('GLMakie'), 'interactive: window / plot pane')
            // MUST reset the GLOBAL inline! state, or after a static run the REPL keeps rendering
            // inline and never reopens a window.
            + cline(ty('Makie') + '.' + fn('inline!') + '(false)', 'open a window; reset prior inline! state');
    }
    if (canCairo) { return cline(kw('using') + ' ' + ty('CairoMakie'), 'static: renders inline'); }
    // Cairo can't do it → GLMakie renders a static inline screenshot
    return cline(kw('using') + ' ' + ty('GLMakie'), 'static inline render')
        + cline(ty('Makie') + '.' + fn('inline!') + '(true)', 'inline image, no window');
}
// surface: makie(true) (Cairo can do a static Axis3 surface)
// 3D contour AND volume: makie(false) — CairoMakie CANNOT render 3D isosurfaces or volumes,
//   so their static path must be GLMakie+inline!(true), not Cairo.
// 2D contour: always CairoMakie (never offer the checkbox — hide it for always-static plots).
```

Two gotchas this encodes:
- **`canCairo` is about what Cairo can *render*, not 2D-vs-3D.** Cairo does a static `Axis3` *surface* and *lifted contours* fine, but **cannot draw 3D isosurfaces or volumes** — so 3D-contour (whose left panel is isosurfaces) and volume both need `makie(false)`.
- **`Makie.inline!()` is global REPL state.** Emit it in *both* modes (`false` interactive, `true` static) so toggling the checkbox always resets it; otherwise a static run leaves `inline!(true)` set and the next interactive run never opens a window.

### 19.3 Send to Notebook gets the **same** code as every other target (no swap)

The notebook branch of `runCode` inserts the code box's text **verbatim** — no backend rewrite. All four Send targets therefore behave identically: GLMakie opens a window (or CairoMakie renders inline when the checkbox is unchecked, for plots Cairo can draw).

```typescript
// target === 'notebook': no transform — same `code` as Terminal / REPL / Editor.
cells: [{ cellKind: CellKind.Code, source: code, language: 'julia', /* … */ }],
```

This replaced an earlier attempt that swapped GLMakie → WGLMakie on the notebook branch to get *interactive inline* plots. **WGLMakie inline does not render in this VS Code notebook environment** (Bonito starts an HTTP server, nothing draws — confirmed with a bare `scatter`). Rather than maintain a per-target backend that silently shows nothing, the rule is **GLMakie everywhere (window)**, with the `Interactive` checkbox toggling static (CairoMakie / `inline!`) only where Cairo can actually render. So the checkbox governs **all** targets uniformly; the handler does no notebook-specific transform.

**Display gotcha — `display(fig)` vs bare `fig`:** the **code box** must end with `display(fig)` / `display(f)`. A bare `fig` is not reliably auto-displayed when a block is pasted into the **terminal**, and a trailing **assignment** (`f, ax, ct = contour(...)`) does **not** auto-render in a notebook either — so always wrap the final figure in `display(...)`.

## 20. Wiki card descriptions

Every `IModelWiki` entry (non-separator) accepts an optional `description` string. When present it is rendered in `.nb-desc` below the card title, matching the notebook tutorial card style exactly.

### 20.1 How to add descriptions

In the command file (`commands/<acronym>.command.ts`), add `description:` to each wiki entry:

```typescript
wikis: [
    { name: 'Factsheet',      description: 'Quick-reference: plot types, packages, and when to use each', file: '<topic>/factsheet.md',      bundled: true },
    { name: 'Overview',       description: 'Motivation and guidance for choosing this plot family',        file: '<topic>/overview.md',       bundled: true },
    { name: 'Assumptions',    description: 'Data requirements and conditions for valid plots',             file: '<topic>/assumptions.md',    bundled: true },
    { name: 'Diagnostics',    description: 'How to detect misleading charts and data quality issues',      file: '<topic>/diagnostics.md',    bundled: true },
    { name: 'Interpretation', description: 'How to read and communicate the plot correctly',               file: '<topic>/interpretation.md', bundled: true },
    { name: 'Decision Guide', description: 'Which plot to use given your data type and question',          file: '<topic>/decision-guide.md', bundled: true },
    { separator: true, label: 'Plot Types' },
    { name: 'My Plot',        description: 'One sentence saying what this plot shows',                     file: '<topic>/myplot.md',         bundled: true },
],
```

Keep descriptions short — one clause, no full stop. The card is narrow; two lines is the maximum before it looks cluttered.

### 20.2 How the description reaches the webview

The handler builds `wikiSections` and must forward `description`:

```typescript
currentWikiSection.wikis.push({ name: w.name, file: w.bundled ? w.file : '', description: w.description });
```

The type annotation for `wikiSections` must include `description?`:

```typescript
const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
```

The scaffold's `renderWikiPanel()` already renders it:

```javascript
html += '<button class="nb-card" data-wiki="' + esc(w.file) + '">'
    + '<span class="nb-label">' + esc(w.name) + '</span>'
    + (w.description ? '<span class="nb-desc">' + esc(w.description) + '</span>' : '')
    + '</button>';
```

### 20.3 The `out/` compiled files must be patched manually when the build watch is not running

The app loads from `out/`, not `src/`. If the build watch task (`VS Code - Build`) is not running, edits to `src/` TS files are **not** reflected in `out/` JS files and the change will be invisible at runtime.

**Symptom:** descriptions added to `src/` command and handler files do not appear in the running webview even after reload.

**Fix:** directly patch the corresponding `out/` JS file:

```bash
# Patch the handler to forward description (run once per handler you changed)
perl -i -pe \
  "s|currentWikiSection\.wikis\.push\(\{ name: w\.name, file: w\.bundled \? w\.file : \"\" \}\);|currentWikiSection.wikis.push({ name: w.name, file: w.bundled ? w.file : \"\", description: w.description });|g" \
  out/vs/workbench/contrib/model/browser/handlers/<acronym>.handler.js
```

The permanent fix is to have the build watch task running. The `out/` patch is a workaround for interactive development sessions only; it will be overwritten the next time the watch task compiles the file.

## 21. Julia package policy — no DataFrames.jl

**Never reference `DataFrames.jl` in any webview** — not in example code, notebooks, wiki pages, concept maps, package lists, or references. Use the **Tables.jl** interface instead:

- Row iteration: `XLSX.eachtablerow(ws)` (or equivalent Tables.jl-compatible iterator)
- Collecting rows: `[NamedTuple(row) for row in iterator]`
- Tabular interop: `Tables.rows(...)`, `Tables.columns(...)`

DataFrames.jl is a heavy dependency that users may not have installed and is not needed for the data-access patterns Pollis demonstrates. Tables.jl is lightweight, composable, and already a transitive dependency of most Julia data packages.

## 22. TOML-driven webview architecture

Pollis webviews can be fully declared in a `.toml` file. The build pipeline auto-generates a typed TypeScript data file from it — no manual editing of generated files.

### 22.1 How it works

```
xlsx.toml  →  [compile-toml]  →  xlsx.data.ts  →  [compile-client]  →  out/
```

1. `xlsx.toml` (in `src/.../webviews/`, alongside template/handler/types) is the **single source of truth** for all webview metadata.
2. `npm run gulp compile-toml` runs `build/lib/toml-to-ts.ts` — a hand-written TOML parser (no third-party library, only Node built-ins `fs` and `path`) — and writes `src/.../webviews/xlsx.data.ts`.
3. `compile-toml` is the **first step** of `compile-client`, so it runs automatically on every build.
4. `*.data.ts` files are gitignored — only the `.toml` source is committed.

### 22.2 What TOML drives

Every field visible in the webview is declared in the TOML:

| TOML section | Interface type | Webview area |
|---|---|---|
| `[[packages]]` | `IModelPackage` | Learn More → Repository |
| `[[notebookSections]]` / `[[notebookSections.notebooks]]` | `IModelNotebookSection` | Learn More → Notebooks |
| `[[wikis]]` | `IModelWiki` | Learn More → Local Wikis |
| `[[references]]` | `IModelReference` | Learn More → Explore References |
| `[conceptMap]` + `[[conceptMap.nodes]]` + `[[conceptMap.edges]]` | `IConceptMap` | Learn More → Concept Map |
| `[[bullets]]` | `IModelBullet` | Subtitle bullet list |
| `[[decisionRows]]` | `IModelDecisionRow` | Decision table |
| `[miniCharts.modelName]` | `IModelMiniChart` | Illustration mini-charts |
| `[[codeBranches]]` | `IModelCodeBranch` | Code preview per model toggle |
| `[[actionGroups]]` / `[[actionGroups.actions]]` | `IModelActionGroup` | Next Steps right panel |

### 22.3 Development workflow

```bash
# One-time: generate xlsx.data.ts
npm run gulp compile-toml

# During development (watch compiles TS automatically):
# 1. Edit xlsx.toml
# 2. npm run gulp compile-toml   (~2 ms)
# 3. Reload VS Code window (Ctrl+R)
```

`npm run watch` does NOT watch `.toml` files — step 2 is always manual.

### 22.4 Key files

| File | Purpose |
|---|---|
| `src/.../webviews/xlsx.toml` | Declarative source (edit this) |
| `build/lib/toml-to-ts.ts` | Hand-written TOML parser + TS generator |
| `build/gulpfile.toml.ts` | Gulp task wiring (`compile-toml`) |
| `src/.../webviews/xlsx.data.ts` | Generated — never edit |
| `src/.../webviews/xlsx.template.ts` | Calls `buildWebviewHtml()` using metadata from `xlsx.data.ts` |
| `src/.../commands/xlsx.command.ts` | Imports `XLSX_METADATA` from `xlsx.data.ts` |
| `TOML_MIGRATION.md` | Full TOML syntax reference and field guide |

### 22.5 TOML parser notes

The parser (`build/lib/toml-to-ts.ts`) supports the subset of TOML used by Pollis:

- `[section]` and `[[array-of-tables]]`
- Nested array-of-tables: `[[notebookSections.notebooks]]`, `[[actionGroups.actions]]`, `[[conceptMap.nodes]]`
- Multiline strings: triple single-quotes `'''` (literal, no escapes)
- Inline arrays: `models = ["write", "read"]`
- Booleans, integers, floats, single- and double-quoted strings

**No third-party TOML library is used.** The parser depends only on Node built-ins.
