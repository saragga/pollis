/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The mark Pollis pages put on what a coding agent does, since it costs tokens: a robot's head, alone in a
// button (class `with-agent`) or in an outlined badge beside a name (class `agent-badge`).

/** The robot's head, drawn in the text colour. */
export const AGENT_ICON = '<svg class="agent-icon" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="5" width="11" height="8.5" rx="2"/><path d="M8 5V2.5M6 9v1M10 9v1M1 8.5v2M15 8.5v2"/><circle cx="8" cy="2" r="0.6"/></svg>';

/** The styles of the icon, the badge and a button that carries the icon. */
export const AGENT_BADGE_CSS = `
		.agent-icon { width: 13px; height: 13px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
		.agent-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 400; border: 1px solid var(--vscode-foreground); border-radius: 4px; padding: 1px 6px; margin-left: 8px; vertical-align: middle; opacity: 0.85; }
		.with-agent { display: inline-flex; align-items: center; gap: 5px; }`;
