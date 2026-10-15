/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** The style of a library page (Workflows, New Methods, Published Benchmarks, Pollis Skills): a title, an intro and a table. */
export const LIBRARY_PAGE_STYLE = `
	* { box-sizing: border-box; }
	body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
	.container { max-width: 1400px; margin: 0 auto; padding: 24px; }
	h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
	.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
	table { width: 100%; border-collapse: collapse; }
	th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
	td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
	tr:hover td { background: var(--vscode-list-hoverBackground); }
	.name { width: 34%; }
	.title { font-size: 14px; font-weight: 600; color: var(--vscode-textLink-foreground); cursor: pointer; }
	.title:hover { text-decoration: underline; }
	.file { font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-descriptionForeground); }
	.description { margin: 4px 0 0 0; color: var(--vscode-descriptionForeground); }
	.description.clamped { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
	.article { width: 22%; }
	.citation { margin: 0 0 4px 0; }
	.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
	code { font-family: var(--vscode-editor-font-family); color: var(--vscode-textPreformat-foreground); background: var(--vscode-textPreformat-background); border-radius: 3px; padding: 0 3px; }
	.nowrap { white-space: nowrap; }
	.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
	.link:hover { text-decoration: underline; }
	.links { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; }
	.package { display: inline-block; font-size: 12px; border: 1px solid var(--vscode-widget-border); border-radius: 2px; padding: 0 4px; margin: 0 4px 4px 0; }
	.source { margin: 0 0 4px 0; }
	.source-name { font-weight: 600; }
	.badge { display: inline-block; margin-left: 8px; padding: 0 6px; border-radius: 8px; font-size: 11px; font-weight: 600; vertical-align: middle; color: var(--vscode-badge-foreground); background: var(--vscode-badge-background); }`;

/** The script helpers of a library page: `element`, `link` (a text button) and `cell` (a table cell added to a row). */
export const LIBRARY_PAGE_HELPERS = `
function element(tag, className, content) {
	const node = document.createElement(tag);
	if (className) { node.className = className; }
	if (content) { node.textContent = content; }
	return node;
}

function link(label, onClick) {
	const button = element('button', 'link', label);
	button.addEventListener('click', onClick);
	return button;
}

function cell(row, className) {
	const td = element('td', className);
	row.appendChild(td);
	return td;
}`;
