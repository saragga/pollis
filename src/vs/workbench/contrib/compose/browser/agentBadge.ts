/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The mark Pollis pages put on what a coding agent does, since it costs tokens: a two-star sparkle, alone in a
// button (class `with-agent`) or in an outlined badge beside a name (class `agent-badge`). The menus draw the
// same sparkle (menu.ts and electron-main/menubar.ts).

/** The two-star sparkle, drawn in the text colour. */
export const AGENT_ICON = '<svg class="agent-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M7 2.5c.4 2.6 1.4 3.6 4 4-2.6.4-3.6 1.4-4 4-.4-2.6-1.4-3.6-4-4 2.6-.4 3.6-1.4 4-4z"/><path d="M12.5 10.5c.2 1.1.6 1.5 1.7 1.7-1.1.2-1.5.6-1.7 1.7-.2-1.1-.6-1.5-1.7-1.7 1.1-.2 1.5-.6 1.7-1.7z"/></svg>';

/** The styles of the icon, the badge and a button that carries the icon. */
export const AGENT_BADGE_CSS = `
		.agent-icon { width: 13px; height: 13px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
		.agent-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 400; border: 1px solid var(--vscode-foreground); border-radius: 4px; padding: 1px 6px; margin-left: 8px; vertical-align: middle; opacity: 0.85; }
		.with-agent { display: inline-flex; align-items: center; gap: 5px; }`;
