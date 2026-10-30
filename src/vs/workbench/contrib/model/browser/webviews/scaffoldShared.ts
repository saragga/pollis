/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Parts of the scaffold (webviewScaffold.ts) kept apart from it: the title's styles, the sections that
// open and close, Powered by, Next Steps and Learn More, with the panels Learn More opens on the right. Each is
// interpolated where the two pages need it, so nothing here depends on the rest of either.

/** The page and its title. */
export const pageBaseCss = `* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }`;

/** The sections that open and close. */
export const sectionCss = `.section { margin: 0 0 20px 0; }
		.section-toggle { display: flex; align-items: center; gap: 6px; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-size: 15px; font-weight: 500; font-family: var(--vscode-font-family); cursor: pointer; padding: 4px 0; user-select: none; }
		.section-toggle:hover { text-decoration: underline; }
		.section-toggle .illus-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; }
		.section.collapsed .section-toggle .illus-chevron { transform: rotate(-90deg); }
		/* The line a Next Step shows while it runs or sends the Code Example of its tab first. */
		.panel-run-note { margin-top: 6px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.section.collapsed .section-body { display: none; }`;

/** The Powered by line. */
export const poweredByCss = `.powered-by { margin: 4px 0 16px 0; line-height: 1.4; display: flex; align-items: baseline; flex-wrap: wrap; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.package-status { margin-left: 7px; }`;

/** The tag of what the user changed, also on a reference or a video. */
export const customTagCss = `.code-custom-tag { display: none; margin-left: 4px; font-size: 11px; font-weight: 500; line-height: 16px; color: var(--vscode-editorWarning-foreground); border: 1px solid var(--vscode-editorWarning-foreground); border-radius: 10px; padding: 0 8px; }`;

/** The left strip of Next Steps and Learn More, and the panels they open on the right. */
export const learnMoreCss = `.panel-back:disabled, .panel-close:disabled { opacity: 0.4; cursor: default; }
		/* Local Wikis / Notebook Tutorials cards: Edit / Restore Default links appear on hover; a customised one gets the amber dot. */
		.copy-item { position: relative; display: flex; }
		.copy-item .nb-card { padding-bottom: 26px; }
		.copy-actions { position: absolute; right: 10px; bottom: 7px; display: flex; gap: 12px; opacity: 0; }
		.copy-item:hover .copy-actions, .copy-item:focus-within .copy-actions { opacity: 1; }
		.copy-link { background: none; border: none; padding: 0; font-size: 11px; font-family: var(--vscode-font-family); color: var(--vscode-textLink-foreground); cursor: pointer; }
		.copy-link:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.copy-item:not(.has-custom) .copy-link[data-copy-act="restore"] { display: none; }
		/* Explore References: list (60%) + details / Add Reference form (40%). */
		.refs-container { display: flex; gap: 16px; height: 400px; }
		.refs-list-panel { flex: 0 0 60%; overflow-y: auto; padding-right: 8px; }
		.refs-actions-panel { flex: 1; min-width: 0; border-left: 1px solid var(--vscode-widget-border); padding-left: 16px; overflow-y: auto; }
		.references-list { display: flex; flex-direction: column; gap: 8px; }
		.reference-item { background: var(--vscode-list-hoverBackground); border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px; text-align: left; cursor: pointer; transition: all 0.2s; width: 100%; font-family: var(--vscode-font-family); }
		.reference-item:hover { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
		.reference-item.active { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
		.ref-title { display: block; font-weight: 500; color: var(--vscode-foreground); margin-bottom: 4px; word-break: break-word; }
		.ref-desc { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); }
		.ref-desc .code-custom-tag { display: inline-block; margin-left: 6px; line-height: 14px; font-size: 10px; }
		.action-btn { display: block; width: 100%; margin-bottom: 8px; padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer; font-size: 12px; font-family: var(--vscode-font-family); transition: background 0.2s; }
		.action-btn:hover { background: var(--vscode-button-hoverBackground); }
		/* Outlined rather than grey: secondary but visibly clickable (grey fills read as disabled in many themes). */
		.action-btn.secondary { background: transparent; color: var(--vscode-textLink-foreground); box-shadow: inset 0 0 0 1px var(--vscode-button-background); }
		.action-btn.secondary:hover { background: var(--vscode-list-hoverBackground); color: var(--vscode-textLink-activeForeground); }
		.action-btn:disabled { opacity: 0.5; cursor: default; }
		.ref-placeholder { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; padding: 20px 10px; }
		.refs-toolbar { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
		.reference-item.removed .ref-title { opacity: 0.6; text-decoration: line-through; }
		.ref-desc .ref-tag-removed { color: var(--vscode-descriptionForeground); border-color: var(--vscode-descriptionForeground); }
		.ref-details-title { font-weight: 600; margin-bottom: 16px; color: var(--vscode-foreground); word-break: break-word; }
		.ref-form label { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); margin: 8px 0 3px; }
		.ref-form input, .ref-form textarea { display: block; width: 100%; box-sizing: border-box; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; font-size: 12px; font-family: var(--vscode-font-family); }
		.ref-form textarea { min-height: 90px; resize: vertical; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; white-space: pre; }
		.ref-form input:focus, .ref-form textarea:focus { outline: 1px solid var(--vscode-focusBorder); border-color: var(--vscode-focusBorder); }
		.ref-form-or { font-size: 11px; color: var(--vscode-descriptionForeground); margin: 12px 0 0; text-align: center; }
		.ref-form-error { font-size: 11px; color: var(--vscode-errorForeground); margin: 8px 0; min-height: 0; }
		.ref-form-buttons { display: flex; gap: 8px; margin-top: 12px; }
		.video-description { font-size: 12px; color: var(--vscode-descriptionForeground); margin: -8px 0 16px; word-break: break-word; }
		.ref-form-buttons .action-btn { margin-bottom: 0; }
		.toggle-btn.has-custom::after, .action-card.has-custom .action-label::after, .copy-item.has-custom .nb-label::after { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--vscode-editorWarning-foreground); margin-left: 7px; vertical-align: 1px; }
		.bottom-layout { display: grid; grid-template-columns: 190px 1fr; gap: 24px; margin-top: 0; align-items: start; }
		.left-strip { display: flex; flex-direction: column; }
		.strip-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
		.strip-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 10px 0; }
		.column-list { list-style: none; padding: 0 0 0 22px; margin: 0; }
		.column-list li { margin: 0; }
		.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; white-space: nowrap; }
		.list-btn svg { flex-shrink: 0; }
		.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.panel-active { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.paper-links { display: none; }
		.right-panel { border-left: 1px solid var(--vscode-widget-border); padding-left: 20px; padding-top: 4px; display: none; min-width: 0; }
		/* In a narrow editor, stack the opened panel under Next Steps / Learn More. */
		@media (max-width: 600px) {
			.bottom-layout { grid-template-columns: 1fr; }
			.right-panel { border-left: none; padding-left: 22px; }
		}
		.right-panel-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--vscode-descriptionForeground); }
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
		.nb-section-title { font-size: 11px; font-weight: 600; color: var(--vscode-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin: 14px 0 6px 0; }
		.nb-section-title:first-child { margin-top: 0; }
		.nb-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 12px 0; }
		.nb-panel-scroll { overflow-y: auto; max-height: 70vh; padding-right: 4px; }
		.nb-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px 12px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; transition: background 0.1s; }
		.nb-card:hover { background: var(--vscode-list-hoverBackground); border-color: var(--vscode-textLink-foreground); }
		.nb-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); margin-bottom: 4px; }
		.nb-desc { font-size: 11px; color: var(--vscode-descriptionForeground); line-height: 1.4; }`;

/** The Next Steps section, with the items of its list. */
export function nextStepsSectionHtml(items: string): string {
	return `<div class="section collapsed" id="sec-next">
				<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Next Steps</button>
				<div class="section-body">
				<ul class="column-list">
${items}
				</ul>
				</div>
				</div>`;
}

/** The Learn More section, in its mandatory order: Local Wikis, Notebook Tutorials, Multimedia Tutorials, Explore References. */
export const learnMoreSectionHtml = `<div class="section collapsed" id="sec-learn">
				<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Learn More</button>
				<div class="section-body">
				<ul class="column-list">
					<li><button class="list-btn panel-toggle" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
					<li><button class="list-btn panel-toggle" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>Notebook Tutorials</button></li>
					<li><button class="list-btn panel-toggle has-actions" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM10.712 8C10.712 8.153 10.63 8.294 10.498 8.371L6.964 10.413C6.536 10.66 6 10.351 6 9.857V6.144C6 5.649 6.536 5.34 6.964 5.588L10.498 7.63C10.631 7.707 10.712 7.847 10.712 8Z"/></svg>Multimedia Tutorials</button></li>
					<li><button class="list-btn panel-toggle has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>Explore References</button></li>
				</ul>
				</div>
				</div>`;

/** What the right panel and Learn More keep. */
export const learnMoreStateJs = `var currentPanelId = null;
		var wikiSections = [];
		var notebookSections = [];
		var rightPanel = document.getElementById('right-panel');`;

/** Escape a string for HTML. */
export const escJs = `function esc(s)      { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }`;

/** The panels of Learn More. Needs esc(), vscode, rightPanel, currentPanelId, wikiSections, notebookSections and hideRightPanel(). */
export const learnMorePanelsJs = `function renderNotebookPanel() {
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Notebook Tutorials</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div><div class="nb-panel-scroll">';
			var nbRendered = 0;
			notebookSections.forEach(function(section) {
				if (!section.notebooks.length) { return; }
				if (nbRendered > 0) { html += '<hr class="nb-divider">'; }
				nbRendered++;
				html += '<div class="right-action-grid">';
				section.notebooks.forEach(function(n) {
					html += copyCardHtml('notebook', n.file, '<button class="nb-card" data-nb="' + esc(n.file) + '">'
						+ '<span class="nb-label">' + esc(n.name) + '</span>'
						+ (n.description ? '<span class="nb-desc">' + esc(n.description) + '</span>' : '')
						+ '</button>');
				});
				html += '</div>';
			});
			if (!nbRendered) { html += '<div class="ref-placeholder">No notebooks yet.</div>'; }
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-nb]').forEach(function(card) {
				card.addEventListener('click', function() { vscode.postMessage({ command: 'openNotebook', target: card.dataset.nb }); });
			});
			wireCopyLinks();
		}

		function renderWikiPanel() {
			if (!wikiSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Local Wikis</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div><div class="nb-panel-scroll">';
			var wikiRendered = 0;
			wikiSections.forEach(function(section) {
				if (!section.wikis.length) { return; }
				if (wikiRendered > 0) { html += '<hr class="nb-divider">'; }
				wikiRendered++;
				html += '<div class="right-action-grid">';
				section.wikis.forEach(function(w) {
					html += copyCardHtml('wiki', w.file, '<button class="nb-card" data-wiki="' + esc(w.file) + '">'
						+ '<span class="nb-label">' + esc(w.name) + '</span>'
						+ (w.description ? '<span class="nb-desc">' + esc(w.description) + '</span>' : '')
						+ '</button>');
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-wiki]').forEach(function(card) {
				card.addEventListener('click', function() { vscode.postMessage({ command: 'openWiki', target: card.dataset.wiki }); });
			});
			wireCopyLinks();
		}

		// ── Customisable wikis and notebooks ─────────────────────────────────
		// Customised copies live in ~/.pollis/wikis/ and ~/.pollis/notebooks/ (see createCustomCopyWiring).
		var customCopies = { wiki: [], notebook: [] };   // kind -> files with a customised copy

		// Wrap a Local Wikis / Notebook Tutorials card with its Edit / Restore Default links.
		// A notebook is edited where it opens, so it only gets Restore Default.
		function copyCardHtml(kind, file, cardHtml) {
			if (!file) { return cardHtml; }   // an external link: nothing to customise
			var noun = kind === 'wiki' ? 'wiki' : 'notebook';
			return '<div class="copy-item' + (customCopies[kind].indexOf(file) >= 0 ? ' has-custom' : '') + '" data-copy-kind="' + kind + '" data-copy-file="' + esc(file) + '">'
				+ cardHtml
				+ '<span class="copy-actions">'
				+ (kind === 'wiki' ? '<button class="copy-link" data-copy-act="edit" title="Edit this wiki and keep your version">Edit</button>' : '')
				+ '<button class="copy-link" data-copy-act="restore" title="Discard your version and bring back the original ' + noun + '">Restore Default</button>'
				+ '</span>'
				+ '</div>';
		}

		function wireCopyLinks() {
			rightPanel.querySelectorAll('.copy-link[data-copy-act]').forEach(function(link) {
				link.addEventListener('click', function() {
					var item = link.closest('.copy-item');
					var msg = { kind: item.dataset.copyKind, target: item.dataset.copyFile };
					if (link.dataset.copyAct === 'edit') {
						msg.command = 'editCopy';
						vscode.postMessage(msg);
						return;
					}
					// Two-step confirmation: the first click asks, a second click within 4 seconds restores.
					if (!link.dataset.confirming) {
						link.dataset.confirming = '1';
						link.textContent = 'Confirm Restore';
						setTimeout(function() { delete link.dataset.confirming; link.textContent = 'Restore Default'; }, 4000);
						return;
					}
					msg.command = 'restoreCopy';
					vscode.postMessage(msg);
				});
			});
		}

		// ── Explore References ───────────────────────────────────────────────
		// The panel's references (which the user can correct or hide) plus the ones the user added to it,
		// read from References (~/.pollis/references); see createReferenceWiring. Each has an id, title,
		// authors, year, openAccess, kind ('bundled' | 'customised' | 'added'), removed, url and bibtex.
		var references = [];
		var selectedRefId = null;
		var refFormOpen = false;     // the Add / Edit form is showing
		var refFormId = null;        // the reference being edited (null: adding one)
		var showRemovedRefs = false;

		function renderReferencesPanel() {
			rightPanel.innerHTML = '<div class="panel-header">'
				+ '<span class="right-panel-title">Explore References</span>'
				+ '<button class="panel-close" id="btn-refs-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="refs-container">'
				+ '<div class="refs-list-panel">'
				+ '<div class="refs-toolbar">'
				+ '<button class="copy-link" id="btn-ref-add" title="Add a reference of your own to this panel">+ Add Reference</button>'
				+ '<button class="copy-link" id="btn-ref-removed"></button>'
				+ '</div>'
				+ '<div class="references-list" id="refs-list"></div>'
				+ '</div>'
				+ '<div class="refs-actions-panel" id="refs-details"></div>'
				+ '</div>';
			document.getElementById('btn-refs-close').addEventListener('click', hideRightPanel);
			document.getElementById('btn-ref-add').addEventListener('click', function() { openReferenceForm(null); });
			document.getElementById('btn-ref-removed').addEventListener('click', function() {
				showRemovedRefs = !showRemovedRefs;
				renderReferenceList();
				if (!showRemovedRefs && !refFormOpen && references.some(function(r) { return r.id === selectedRefId && r.removed; })) {
					selectedRefId = null;
					renderReferenceDetails();
				}
			});
			renderReferenceList();
			if (refFormOpen) { renderReferenceForm(); } else { renderReferenceDetails(); }
		}

		function referenceTag(ref) {
			if (ref.removed) { return '<span class="code-custom-tag ref-tag-removed" title="A reference you removed. Select it to restore it.">Removed</span>'; }
			if (ref.kind === 'customised') { return '<span class="code-custom-tag" title="Your corrected version of this reference. Restore Default brings back the original.">Customised</span>'; }
			if (ref.kind === 'added') { return '<span class="code-custom-tag" title="A reference you added.">Added</span>'; }
			return '';
		}

		function renderReferenceList() {
			var list = document.getElementById('refs-list');
			if (!list) { return; }
			var removedCount = references.filter(function(r) { return r.removed; }).length;
			var removedLink = document.getElementById('btn-ref-removed');
			removedLink.hidden = removedCount === 0;
			removedLink.textContent = showRemovedRefs ? 'Hide Removed' : 'Show Removed (' + removedCount + ')';
			var shown = references.filter(function(r) { return showRemovedRefs || !r.removed; });
			if (!shown.length) {
				list.innerHTML = '<div class="ref-placeholder">No references yet.</div>';
				return;
			}
			list.innerHTML = shown.map(function(ref) {
				var desc = [ref.authors, ref.year, ref.openAccess ? 'Open Access' : ''].filter(Boolean).map(esc).join(' \\xb7 ');
				return '<button class="reference-item' + (ref.id === selectedRefId ? ' active' : '') + (ref.removed ? ' removed' : '') + '" data-ref-id="' + esc(ref.id) + '">'
					+ '<span class="ref-title">' + esc(ref.title) + '</span>'
					+ '<span class="ref-desc">' + desc + referenceTag(ref) + '</span>'
					+ '</button>';
			}).join('');
			list.querySelectorAll('.reference-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					selectedRefId = btn.dataset.refId;
					refFormOpen = false;
					list.querySelectorAll('.reference-item').forEach(function(b) { b.classList.toggle('active', b === btn); });
					renderReferenceDetails();
				});
			});
		}

		// A button that needs a second click within 4 seconds before it posts its message.
		function confirmButton(btn, confirmLabel, message) {
			var label = btn.textContent;
			btn.addEventListener('click', function() {
				if (!btn.dataset.confirming) {
					btn.dataset.confirming = '1';
					btn.textContent = confirmLabel;
					setTimeout(function() { delete btn.dataset.confirming; btn.textContent = label; }, 4000);
					return;
				}
				btn.disabled = true;
				vscode.postMessage(message);
			});
		}

		function renderReferenceDetails() {
			var details = document.getElementById('refs-details');
			if (!details) { return; }
			var ref = references.find(function(r) { return r.id === selectedRefId; });
			if (!ref) {
				details.innerHTML = '<div class="ref-placeholder">Select a reference to view details</div>';
				return;
			}
			var html = '<div class="ref-details-title">' + esc(ref.title) + '</div>';
			if (ref.removed) {
				html += '<button class="action-btn" id="btn-restore-ref" title="Show this reference again">Restore</button>';
			} else {
				html += (ref.url ? '<button class="action-btn" id="btn-open-ref">Open in Browser</button>' : '')
					+ '<button class="action-btn" id="btn-copy-bibtex">Copy BibTeX to Clipboard</button>'
					+ '<button class="action-btn secondary" id="btn-edit-ref" title="Correct this reference (its BibTeX), wherever it is cited">Edit</button>'
					+ (ref.kind === 'customised' ? '<button class="action-btn secondary" id="btn-restore-ref" title="Discard your correction and bring back the original reference">Restore Default</button>' : '')
					+ '<button class="action-btn secondary" id="btn-remove-ref" title="' + (ref.kind === 'added' ? 'Take this reference off this panel; it stays in your references' : 'Hide this reference; Show Removed brings it back') + '">Remove</button>';
			}
			details.innerHTML = html;
			if (ref.removed) {
				document.getElementById('btn-restore-ref').addEventListener('click', function() {
					this.disabled = true;
					vscode.postMessage({ command: 'restoreReference', id: ref.id });
				});
				return;
			}
			if (ref.url) {
				document.getElementById('btn-open-ref').addEventListener('click', function() {
					vscode.postMessage({ command: 'openReference', id: ref.id });
				});
			}
			document.getElementById('btn-copy-bibtex').addEventListener('click', function() {
				var btn = this;
				navigator.clipboard.writeText(ref.bibtex).then(function() {
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = 'Copy BibTeX to Clipboard'; }, 2000);
				});
			});
			document.getElementById('btn-edit-ref').addEventListener('click', function() { openReferenceForm(ref.id); });
			if (ref.kind === 'customised') {
				confirmButton(document.getElementById('btn-restore-ref'), 'Confirm Restore', { command: 'restoreReference', id: ref.id });
			}
			confirmButton(document.getElementById('btn-remove-ref'), 'Confirm Remove', { command: 'removeReference', id: ref.id });
		}

		// Open the Add Reference form (id null) or the Edit form of reference id.
		function openReferenceForm(id) {
			refFormOpen = true;
			refFormId = id;
			if (id === null) {
				selectedRefId = null;
				renderReferenceList();
			}
			renderReferenceForm();
		}

		function renderReferenceForm() {
			var details = document.getElementById('refs-details');
			if (!details) { return; }
			var ref = refFormId === null ? null : references.find(function(r) { return r.id === refFormId; });
			if (refFormId !== null && !ref) { refFormOpen = false; renderReferenceDetails(); return; }
			details.innerHTML = '<div class="ref-details-title">' + (ref ? 'Edit Reference' : 'Add Reference') + '</div>'
				+ '<div class="ref-form">'
				+ '<label for="ref-bibtex">' + (ref ? 'BibTeX' : 'Paste BibTeX') + '</label>'
				+ '<textarea id="ref-bibtex" spellcheck="false" placeholder="@article{key, title = {...}, ...}"></textarea>'
				+ (ref ? '' : '<div class="ref-form-or">or enter the details</div>'
					+ '<label for="ref-title">Title</label><input id="ref-title" type="text">'
					+ '<label for="ref-authors">Authors</label><input id="ref-authors" type="text" placeholder="Last, First; Last, First">'
					+ '<label for="ref-year">Year</label><input id="ref-year" type="text" inputmode="numeric" maxlength="4">'
					+ '<label for="ref-link">Link or DOI</label><input id="ref-link" type="text" placeholder="https://... or 10....">')
				+ '<div class="ref-form-error" id="ref-form-error"></div>'
				+ '<div class="ref-form-buttons">'
				+ '<button class="action-btn" id="btn-ref-save">' + (ref ? 'Save' : 'Add') + '</button>'
				+ '<button class="action-btn secondary" id="btn-ref-cancel">Cancel</button>'
				+ '</div>'
				+ '</div>';
			var textarea = document.getElementById('ref-bibtex');
			if (ref) { textarea.value = ref.bibtex; textarea.style.minHeight = '200px'; }
			textarea.focus();
			document.getElementById('btn-ref-cancel').addEventListener('click', function() {
				refFormOpen = false;
				renderReferenceDetails();
			});
			document.getElementById('btn-ref-save').addEventListener('click', function() {
				this.disabled = true;
				document.getElementById('ref-form-error').textContent = '';
				var value = function(id) { var input = document.getElementById(id); return input ? input.value : ''; };
				var message = { command: 'saveReference', bibtex: textarea.value, title: value('ref-title'), authors: value('ref-authors'), year: value('ref-year'), link: value('ref-link') };
				if (ref) { message.id = ref.id; }
				vscode.postMessage(message);
			});
		}

		// ── Multimedia Tutorials ─────────────────────────────────────────────
		// The panel's bundled videos (which the user can correct or remove) plus the ones the user added,
		// kept in ~/.pollis/videos/<panel>.json; see createVideoWiring. Each has an id, title, url,
		// description, kind ('bundled' | 'customised' | 'added') and removed.
		var videos = [];
		var selectedVideoId = null;
		var videoFormOpen = false;   // the Add / Edit form is showing
		var videoFormId = null;      // the video being edited (null: adding one)
		var showRemovedVideos = false;

		function videoHost(url) {
			var match = /^https?:\\/\\/(?:www\\.)?([^\\/?#]+)/i.exec(url || '');
			return match ? match[1] : '';
		}

		function renderVideosPanel() {
			rightPanel.innerHTML = '<div class="panel-header">'
				+ '<span class="right-panel-title">Multimedia Tutorials</span>'
				+ '<button class="panel-close" id="btn-videos-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="refs-container">'
				+ '<div class="refs-list-panel">'
				+ '<div class="refs-toolbar">'
				+ '<button class="copy-link" id="btn-video-add" title="Add a link to a video (a lecture recording, YouTube, Vimeo...) to this panel">+ Add Video</button>'
				+ '<button class="copy-link" id="btn-video-removed"></button>'
				+ '</div>'
				+ '<div class="references-list" id="videos-list"></div>'
				+ '</div>'
				+ '<div class="refs-actions-panel" id="videos-details"></div>'
				+ '</div>';
			document.getElementById('btn-videos-close').addEventListener('click', hideRightPanel);
			document.getElementById('btn-video-add').addEventListener('click', function() { openVideoForm(null); });
			document.getElementById('btn-video-removed').addEventListener('click', function() {
				showRemovedVideos = !showRemovedVideos;
				renderVideoList();
				if (!showRemovedVideos && !videoFormOpen && videos.some(function(v) { return v.id === selectedVideoId && v.removed; })) {
					selectedVideoId = null;
					renderVideoDetails();
				}
			});
			renderVideoList();
			if (videoFormOpen) { renderVideoForm(); } else { renderVideoDetails(); }
		}

		function videoTag(video) {
			if (video.removed) { return '<span class="code-custom-tag ref-tag-removed" title="A video you removed. Select it to restore it.">Removed</span>'; }
			if (video.kind === 'customised') { return '<span class="code-custom-tag" title="Your corrected version of this video. Restore Default brings back the original.">Customised</span>'; }
			if (video.kind === 'added') { return '<span class="code-custom-tag" title="A video you added.">Added</span>'; }
			return '';
		}

		function renderVideoList() {
			var list = document.getElementById('videos-list');
			if (!list) { return; }
			var removedCount = videos.filter(function(v) { return v.removed; }).length;
			var removedLink = document.getElementById('btn-video-removed');
			removedLink.hidden = removedCount === 0;
			removedLink.textContent = showRemovedVideos ? 'Hide Removed' : 'Show Removed (' + removedCount + ')';
			var shown = videos.filter(function(v) { return showRemovedVideos || !v.removed; });
			if (!shown.length) {
				list.innerHTML = '<div class="ref-placeholder">No videos yet. Use + Add Video to link a lecture recording or tutorial.</div>';
				return;
			}
			list.innerHTML = shown.map(function(video) {
				var desc = [video.description, videoHost(video.url)].filter(Boolean).map(esc).join(' \\xb7 ');
				return '<button class="reference-item' + (video.id === selectedVideoId ? ' active' : '') + (video.removed ? ' removed' : '') + '" data-video-id="' + esc(video.id) + '">'
					+ '<span class="ref-title">' + esc(video.title) + '</span>'
					+ '<span class="ref-desc">' + desc + videoTag(video) + '</span>'
					+ '</button>';
			}).join('');
			list.querySelectorAll('.reference-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					selectedVideoId = btn.dataset.videoId;
					videoFormOpen = false;
					list.querySelectorAll('.reference-item').forEach(function(b) { b.classList.toggle('active', b === btn); });
					renderVideoDetails();
				});
				btn.addEventListener('dblclick', function() {
					var video = videos.find(function(v) { return v.id === btn.dataset.videoId; });
					if (video && !video.removed) { vscode.postMessage({ command: 'openVideo', id: video.id }); }
				});
			});
		}

		function renderVideoDetails() {
			var details = document.getElementById('videos-details');
			if (!details) { return; }
			var video = videos.find(function(v) { return v.id === selectedVideoId; });
			if (!video) {
				details.innerHTML = '<div class="ref-placeholder">Select a video to view details</div>';
				return;
			}
			var html = '<div class="ref-details-title">' + esc(video.title) + '</div>'
				+ (video.description ? '<div class="video-description">' + esc(video.description) + '</div>' : '');
			if (video.removed) {
				html += '<button class="action-btn" id="btn-restore-video" title="Show this video again">Restore</button>';
			} else {
				html += '<button class="action-btn" id="btn-open-video" title="' + esc(video.url) + '">Open in Browser</button>'
					+ '<button class="action-btn" id="btn-copy-video">Copy Link</button>'
					+ '<button class="action-btn secondary" id="btn-edit-video" title="Change the title, link or description">Edit</button>'
					+ (video.kind === 'customised' ? '<button class="action-btn secondary" id="btn-restore-video" title="Discard your correction and bring back the original video">Restore Default</button>' : '')
					+ '<button class="action-btn secondary" id="btn-remove-video" title="' + (video.kind === 'added' ? 'Delete this video from your videos file' : 'Hide this video; Show Removed brings it back') + '">Remove</button>';
			}
			details.innerHTML = html;
			if (video.removed) {
				document.getElementById('btn-restore-video').addEventListener('click', function() {
					this.disabled = true;
					vscode.postMessage({ command: 'restoreVideo', id: video.id });
				});
				return;
			}
			document.getElementById('btn-open-video').addEventListener('click', function() {
				vscode.postMessage({ command: 'openVideo', id: video.id });
			});
			document.getElementById('btn-copy-video').addEventListener('click', function() {
				var btn = this;
				navigator.clipboard.writeText(video.url).then(function() {
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = 'Copy Link'; }, 2000);
				});
			});
			document.getElementById('btn-edit-video').addEventListener('click', function() { openVideoForm(video.id); });
			if (video.kind === 'customised') {
				confirmButton(document.getElementById('btn-restore-video'), 'Confirm Restore', { command: 'restoreVideo', id: video.id });
			}
			confirmButton(document.getElementById('btn-remove-video'), 'Confirm Remove', { command: 'removeVideo', id: video.id });
		}

		// Open the Add Video form (id null) or the Edit form of video id.
		function openVideoForm(id) {
			videoFormOpen = true;
			videoFormId = id;
			if (id === null) {
				selectedVideoId = null;
				renderVideoList();
			}
			renderVideoForm();
		}

		function renderVideoForm() {
			var details = document.getElementById('videos-details');
			if (!details) { return; }
			var video = videoFormId === null ? null : videos.find(function(v) { return v.id === videoFormId; });
			if (videoFormId !== null && !video) { videoFormOpen = false; renderVideoDetails(); return; }
			details.innerHTML = '<div class="ref-details-title">' + (video ? 'Edit Video' : 'Add Video') + '</div>'
				+ '<div class="ref-form">'
				+ '<label for="video-title">Title</label><input id="video-title" type="text">'
				+ '<label for="video-url">Link</label><input id="video-url" type="text" placeholder="https://...">'
				+ '<label for="video-description">Description (optional)</label><input id="video-description" type="text">'
				+ '<div class="ref-form-error" id="video-form-error"></div>'
				+ '<div class="ref-form-buttons">'
				+ '<button class="action-btn" id="btn-video-save">' + (video ? 'Save' : 'Add') + '</button>'
				+ '<button class="action-btn secondary" id="btn-video-cancel">Cancel</button>'
				+ '</div>'
				+ '</div>';
			if (video) {
				document.getElementById('video-title').value = video.title;
				document.getElementById('video-url').value = video.url;
				document.getElementById('video-description').value = video.description;
			}
			document.getElementById('video-title').focus();
			document.getElementById('btn-video-cancel').addEventListener('click', function() {
				videoFormOpen = false;
				renderVideoDetails();
			});
			document.getElementById('btn-video-save').addEventListener('click', function() {
				this.disabled = true;
				document.getElementById('video-form-error').textContent = '';
				var message = { command: 'saveVideo', title: document.getElementById('video-title').value, url: document.getElementById('video-url').value, description: document.getElementById('video-description').value };
				if (video) { message.id = video.id; }
				vscode.postMessage(message);
			});
		}`;

/** The buttons of Learn More. */
export const learnMoreWiringJs = `document.getElementById('btn-wiki').addEventListener('click', function() {
			if (currentPanelId === 'btn-wiki') { hideRightPanel(); return; }
			currentPanelId = 'btn-wiki';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderWikiPanel();
			rightPanel.style.display = 'block';
		});

		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (currentPanelId === 'btn-notebook-tutorials') { hideRightPanel(); return; }
			currentPanelId = 'btn-notebook-tutorials';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderNotebookPanel();
			rightPanel.style.display = 'block';
		});

		document.getElementById('btn-documentation').addEventListener('click', function() {
			if (currentPanelId === 'btn-documentation') { hideRightPanel(); return; }
			currentPanelId = 'btn-documentation';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			selectedVideoId = null;
			videoFormOpen = false;
			showRemovedVideos = false;
			renderVideosPanel();
			rightPanel.style.display = 'block';
			vscode.postMessage({ command: 'listVideos' });   // pick up a hand-edited videos file
		});
		document.getElementById('btn-paper').addEventListener('click', function() {
			if (currentPanelId === 'btn-paper') { hideRightPanel(); return; }
			currentPanelId = 'btn-paper';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			selectedRefId = null;
			refFormOpen = false;
			showRemovedRefs = false;
			renderReferencesPanel();
			rightPanel.style.display = 'block';
			vscode.postMessage({ command: 'listReferences' });   // pick up a hand-edited references file
		});`;

/** A pane of the Time Arrow style: anything can go in it, and its number comes from its place among the panes. */
export interface IScaffoldStep {
	/** The id of the pane, by which the page can open it. */
	readonly id: string;
	readonly title: string;
	/** What stays beside the title when the pane is closed, such as a count. */
	readonly headHtml?: string;
	readonly bodyHtml: string;
}

/** The panes of the Time Arrow style: they open and close as the sections do, numbered 1, 2, 3... from the top. */
export function stepsHtml(steps: readonly IScaffoldStep[]): string {
	return steps.map((step, index) => `<div class="section step-pane" id="${step.id}">
			<div class="step-head">
				<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span><span class="step-number">${index + 1}</span><span class="step-title">${step.title}</span></button>${step.headHtml ?? ''}
			</div>
			<div class="section-body">${step.bodyHtml}</div>
		</div>`).join('\n\t\t');
}

/** The styles of the panes of the Time Arrow style: the number on our yellow. */
export const stepsCss = `.step-head { display: flex; align-items: center; gap: 16px; }
		.step-head .section-toggle { width: auto; }
		.step-pane .section-toggle:hover { text-decoration: none; }
		.step-pane .section-toggle:hover .step-title { text-decoration: underline; }
		.step-number { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; flex-shrink: 0; margin-right: 4px; border-radius: 50%; font-size: 12px; font-weight: 600; color: var(--vscode-editor-background); background: #e8a33d; }
		body.vscode-light .step-number { background: #a8650d; }
		.step-pane .section-body { padding-left: 22px; }`;

/** The sections that open and close. */
export const sectionToggleJs = `document.querySelectorAll('.section-toggle').forEach(function(t) {
			t.addEventListener('click', function() {
				var section = t.closest('.section');
				section.classList.toggle('collapsed');
			});
		});`;

/** The message with the links of Powered by, for the listener of the page: `msg` is the message. */
export const packageLinksMessageJs = `if (msg.command === 'packageLinks') {
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
			}`;

/** The messages of Learn More, for the listener of the page: `msg` is the message. */
export const learnMoreMessagesJs = `if (msg.command === 'paperLinks') {
				var btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
			if (msg.command === 'notebookSections') { notebookSections = msg.sections || []; }
			if (msg.command === 'wikiSections') { wikiSections = msg.sections || []; }
			if (msg.command === 'references') {
				references = msg.references || [];
				if (selectedRefId && !references.some(function(r) { return r.id === selectedRefId && (showRemovedRefs || !r.removed); })) { selectedRefId = null; }
				if (currentPanelId === 'btn-paper') {
					renderReferenceList();
					if (!refFormOpen) { renderReferenceDetails(); }
				}
			}
			if (msg.command === 'referenceSaved') {
				refFormOpen = false;
				selectedRefId = msg.id;
				if (currentPanelId === 'btn-paper') { renderReferenceList(); renderReferenceDetails(); }
			}
			if (msg.command === 'referenceSaveFailed') {
				var refError = document.getElementById('ref-form-error');
				var refSave = document.getElementById('btn-ref-save');
				if (refError) { refError.textContent = msg.message || ''; }
				if (refSave) { refSave.disabled = false; }
			}
			if (msg.command === 'videos') {
				videos = msg.videos || [];
				if (selectedVideoId && !videos.some(function(v) { return v.id === selectedVideoId && (showRemovedVideos || !v.removed); })) { selectedVideoId = null; }
				if (currentPanelId === 'btn-documentation') {
					renderVideoList();
					if (!videoFormOpen) { renderVideoDetails(); }
				}
			}
			if (msg.command === 'videoSaved') {
				videoFormOpen = false;
				selectedVideoId = msg.id;
				if (currentPanelId === 'btn-documentation') { renderVideoList(); renderVideoDetails(); }
			}
			if (msg.command === 'videoSaveFailed') {
				var videoError = document.getElementById('video-form-error');
				var videoSave = document.getElementById('btn-video-save');
				if (videoError) { videoError.textContent = msg.message || ''; }
				if (videoSave) { videoSave.disabled = false; }
			}
			if (msg.command === 'customCopies') {
				customCopies = { wiki: msg.wikis || [], notebook: msg.notebooks || [] };
				rightPanel.querySelectorAll('.copy-item[data-copy-kind]').forEach(function(item) {
					item.classList.toggle('has-custom', customCopies[item.dataset.copyKind].indexOf(item.dataset.copyFile) >= 0);
				});
			}`;
