/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelExploreGroup } from '../common/model.types.js';

/** Options for the live model-hub Explore pane shared by the Hugging Face and Kaggle Models panels. */
export interface IModelHubExploreOptions {
	/** The Explore groups; groups sharing an `axis` are OR-ed, different axes AND-ed. */
	readonly groups: readonly IModelExploreGroup[];
	/** The sort options; the first one is the default. */
	readonly sortOptions: readonly { readonly value: string; readonly label: string }[];
	/** The axes shown in the browse label, in order. */
	readonly labelAxes: readonly string[];
	/** JS expression for the fetch message; may use `mhSort`, `mhSelected(axis)` and `mhFetchSeq`. */
	readonly fetchMessageJs: string;
	/** The commands the handler answers with, on success and on failure. */
	readonly resultCommand: string;
	readonly errorCommand: string;
	/** JS function expression `function(m) { ... }` returning `{ url, name, tag, meta }` for a model card (`meta` is HTML). */
	readonly cardJs: string;
	/** JS function expression `function() { ... }` returning the URL of the browse button. */
	readonly browseUrlJs: string;
	/** The browse button label (HTML) and the service named in the offline message. */
	readonly browseLabel: string;
	readonly serviceName: string;
}

/** CSS for the model-hub Explore pane (replaces the Illustration pane). */
export function buildModelHubExploreCss(): string {
	return `	.hfm-task-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; height: 560px; }
	.hfm-task-list { overflow-y: auto; height: 100%; padding-right: 4px; scrollbar-width: none; }
	.hfm-task-list::-webkit-scrollbar { display: none; }
	.hfm-group { margin-bottom: 6px; }
	.hfm-group-toggle { display: flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-weight: 600; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; width: 100%; text-align: left; user-select: none; padding-left: 17px; }
	.hfm-group-toggle:hover { text-decoration: underline; }
	.hfm-group-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; opacity: 0.7; margin-left: -17px; }
	.hfm-group.collapsed .hfm-group-chevron { transform: rotate(-90deg); }
	.hfm-group.collapsed .hfm-task-items { display: none; }
	.hfm-task-items { padding-left: 0; }
	.hfm-task-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; padding-left: 17px; }
	.hfm-task-row:hover .hfm-task-label { text-decoration: underline; color: var(--vscode-foreground); }
	.hfm-task-cb { appearance: none; -webkit-appearance: none; width: 11px; height: 11px; border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; background: var(--vscode-input-background); cursor: pointer; flex-shrink: 0; position: relative; margin: 0; outline: none; }
	.hfm-task-cb:focus { outline: none; }
	.hfm-task-cb:checked { background: var(--vscode-textLink-foreground); border-color: var(--vscode-textLink-foreground); }
	.hfm-task-cb:checked::after { content: ''; position: absolute; left: 2px; top: 0px; width: 4px; height: 7px; border: 1.5px solid var(--vscode-editor-background, #fff); border-top: none; border-left: none; transform: rotate(45deg); }
	.hfm-task-label { font-size: 12px; color: var(--vscode-foreground) !important; cursor: pointer; line-height: 1.4; }
	.hfm-cards-panel { display: flex; flex-direction: column; min-width: 0; height: 100%; }
	.hfm-cards-panel .right-action-grid { flex: 1; overflow-y: auto; scrollbar-width: none; }
	.hfm-cards-panel .right-action-grid::-webkit-scrollbar { display: none; }
	.hfm-browse-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
	.hfm-browse-label { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
	.hfm-browse-controls { display: flex; align-items: center; gap: 6px; }
	.hfm-sort-btn { display: flex; align-items: center; gap: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; font-size: 12px; font-family: var(--vscode-font-family); padding: 3px 8px; cursor: pointer; white-space: nowrap; position: relative; }
	.hfm-sort-btn:hover { border-color: var(--vscode-focusBorder); }
	.hfm-sort-dropdown { position: absolute; top: calc(100% + 3px); right: 0; background: var(--vscode-dropdown-background, var(--vscode-input-background)); border: 1px solid var(--vscode-widget-border); border-radius: 4px; z-index: 100; min-width: 150px; padding: 4px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
	.hfm-sort-dropdown.hidden { display: none; }
	.hfm-sort-option { display: block; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-family: var(--vscode-font-family); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
	.hfm-sort-option:hover { background: var(--vscode-list-hoverBackground); }
	.hfm-sort-option.active { color: var(--vscode-textLink-foreground); }
	.hfm-browse-btn { background: transparent; border: 1px solid var(--vscode-textLink-foreground); border-radius: 4px; color: var(--vscode-textLink-foreground); font-size: 12px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 10px; }
	.hfm-browse-btn:hover { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
	.hfm-empty { font-size: 12px; color: var(--vscode-descriptionForeground); font-style: italic; padding: 24px 0; text-align: center; }
	.hfm-task-tag { font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
	.hfm-model-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
	.hfm-meta-chip { font-size: 10px; color: var(--vscode-descriptionForeground); white-space: nowrap; }
	.hfm-section-sep { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 8px 0 6px; }
`;
}

/**
 * JS for the model-hub Explore pane: a collapsible checkbox list of the Explore groups beside a
 * grid of model cards fetched live by the panel handler, with a sort dropdown and a browse link.
 */
export function buildModelHubExploreJs(options: IModelHubExploreOptions): string {
	return `			// renderIllustration() re-runs on every topic toggle; the Explore pane is independent
			// of the code-preview topic, so build it once and skip rebuilds (this also avoids stacking
			// duplicate message listeners and losing the user's filter selections).
			if (body.dataset.mhBuilt) { return; }
			body.dataset.mhBuilt = '1';

			var MH_GROUPS = ${JSON.stringify(options.groups)};
			var MH_SORT_OPTIONS = ${JSON.stringify(options.sortOptions)};
			var MH_LABEL_AXES = ${JSON.stringify(options.labelAxes)};
			var mhSel = {};  // axis -> { value: true }
			var mhSort = MH_SORT_OPTIONS[0].value;
			var mhFetchSeq = 0;  // incremented on each fetch; stale responses are discarded
			var mhCard = ${options.cardJs};
			var mhBrowseUrl = ${options.browseUrlJs};

			function mhSelected(axis) {
				var sel = mhSel[axis] || {};
				return Object.keys(sel).filter(function(v) { return sel[v]; });
			}
			// The label of a chip on an axis, or the value itself when it has none.
			function mhChipLabel(axis, value) {
				for (var gi = 0; gi < MH_GROUPS.length; gi++) {
					if (MH_GROUPS[gi].axis !== axis) { continue; }
					for (var ci = 0; ci < MH_GROUPS[gi].chips.length; ci++) {
						if (MH_GROUPS[gi].chips[ci].value === value) { return MH_GROUPS[gi].chips[ci].label; }
					}
				}
				return value;
			}

			function mhFmt(n) {
				if (n >= 1000000) { return (n / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M'; }
				if (n >= 1000) { return (n / 1000).toFixed(1).replace(/\\.0$/, '') + 'k'; }
				return String(n);
			}

			function mhRelTime(iso) {
				if (!iso) { return ''; }
				var ms = Date.now() - new Date(iso).getTime();
				var sec = Math.floor(ms / 1000);
				if (sec < 60) { return 'just now'; }
				var min = Math.floor(sec / 60);
				if (min < 60) { return min + ' min ago'; }
				var hr = Math.floor(min / 60);
				if (hr < 24) { return hr + ' hr ago'; }
				var d = Math.floor(hr / 24);
				if (d < 30) { return d + ' day' + (d === 1 ? '' : 's') + ' ago'; }
				var mo = Math.floor(d / 30);
				if (mo < 12) { return mo + ' mo ago'; }
				return Math.floor(mo / 12) + ' yr ago';
			}

			function mhUpdateSortBtn() {
				var opt = MH_SORT_OPTIONS[0];
				for (var oi = 0; oi < MH_SORT_OPTIONS.length; oi++) { if (MH_SORT_OPTIONS[oi].value === mhSort) { opt = MH_SORT_OPTIONS[oi]; break; } }
				body.querySelector('.hfm-sort-label').innerHTML = '&#8645; Sort: ' + esc(opt.label);
				body.querySelectorAll('.hfm-sort-option').forEach(function(el) { el.classList.toggle('active', el.dataset.value === mhSort); });
				body.querySelector('.hfm-browse-btn').dataset.url = mhBrowseUrl();
			}

			// "All models", or one part per axis with a selection: the chip label, or "N <axis>s".
			function mhUpdateBrowseLabel() {
				var parts = MH_LABEL_AXES.map(function(axis) {
					var sel = mhSelected(axis);
					return sel.length === 0 ? '' : sel.length === 1 ? mhChipLabel(axis, sel[0]) : sel.length + ' ' + axis + 's';
				}).filter(Boolean);
				body.querySelector('.hfm-browse-label').textContent = parts.length ? parts.join(' · ') : 'All models';
			}

			function mhShowGrid(models) {
				var grid = body.querySelector('.right-action-grid');
				if (!grid) { return; }
				if (models.length === 0) {
					grid.innerHTML = '<div class="hfm-empty">No models found for this selection</div>';
					return;
				}
				grid.innerHTML = models.map(function(m) {
					var card = mhCard(m);
					return '<button class="nb-card hfm-model-card" data-url="' + esc(card.url) + '">'
						+ '<span class="nb-label">' + esc(card.name) + '</span>'
						+ '<span class="nb-desc hfm-task-tag">' + esc(card.tag) + '</span>'
						+ '<span class="hfm-model-meta">' + card.meta + '</span>'
						+ '</button>';
				}).join('');
				grid.querySelectorAll('[data-url]').forEach(function(btn) {
					btn.addEventListener('click', function() { vscode.postMessage({ command: 'openUrl', url: btn.dataset.url }); });
				});
			}

			function mhShowMessage(html) {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfm-empty">' + html + '</div>'; }
			}

			function mhFetch() {
				mhFetchSeq++;
				mhShowMessage('&#8987; Loading&#8230;');
				vscode.postMessage(${options.fetchMessageJs});
			}

			var mhFetchTimer = null;
			function mhScheduleFetch() {
				if (mhFetchTimer) { clearTimeout(mhFetchTimer); }
				mhFetchTimer = setTimeout(function() { mhFetchTimer = null; mhFetch(); }, 150);
			}

			window.addEventListener('message', function(ev) {
				var msg = ev.data;
				if (msg.command === '${options.resultCommand}') {
					if (msg.seq !== undefined && msg.seq !== mhFetchSeq) { return; }  // stale
					mhShowGrid(msg.models || []);
				} else if (msg.command === '${options.errorCommand}') {
					if (msg.seq !== undefined && msg.seq !== mhFetchSeq) { return; }  // stale
					mhShowMessage('&#9888; Unable to connect to ${options.serviceName}.<br>Check your network connection and try again.');
				}
			});

			var chevronSvg = '<svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg>';

			var listHtml = '<div class="hfm-task-list">';
			MH_GROUPS.forEach(function(g) {
				if (g.separatorBefore) { listHtml += '<hr class="hfm-section-sep">'; }
				listHtml += '<div class="hfm-group collapsed">';
				listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>' + esc(g.label) + '</button>';
				listHtml += '<div class="hfm-task-items">';
				g.chips.forEach(function(c) {
					listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb" type="checkbox" data-axis="' + esc(g.axis) + '" data-value="' + esc(g.filterPrefix + c.value) + '"><span class="hfm-task-label">' + esc(c.label) + '</span></label>';
				});
				listHtml += '</div></div>';
			});
			listHtml += '</div>';

			var sortDropdownHtml = '<div class="hfm-sort-dropdown hidden">'
				+ MH_SORT_OPTIONS.map(function(o) { return '<button class="hfm-sort-option" data-value="' + o.value + '">' + esc(o.label) + '</button>'; }).join('')
				+ '</div>';

			var cardsHtml = '<div class="hfm-cards-panel">'
				+ '<div class="hfm-browse-row"><span class="hfm-browse-label">All models</span>'
				+ '<div class="hfm-browse-controls" style="position:relative;">'
				+ '<button class="hfm-sort-btn"><span class="hfm-sort-label"></span></button>'
				+ sortDropdownHtml
				+ '<button class="hfm-browse-btn">${options.browseLabel}</button>'
				+ '</div></div>'
				+ '<div class="right-action-grid"></div>'
				+ '</div>';

			body.innerHTML = '<div class="hfm-task-layout">' + listHtml + cardsHtml + '</div>';

			body.querySelectorAll('.hfm-group-toggle').forEach(function(btn) {
				btn.addEventListener('click', function() { btn.closest('.hfm-group').classList.toggle('collapsed'); });
			});
			// a checkbox change re-fetches (debounced so rapid ticks coalesce)
			body.querySelectorAll('.hfm-task-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					var axis = cb.dataset.axis;
					if (!mhSel[axis]) { mhSel[axis] = {}; }
					if (cb.checked) { mhSel[axis][cb.dataset.value] = true; } else { delete mhSel[axis][cb.dataset.value]; }
					mhUpdateBrowseLabel();
					mhUpdateSortBtn();
					mhScheduleFetch();
				});
			});
			var sortDropdown = body.querySelector('.hfm-sort-dropdown');
			body.querySelector('.hfm-sort-btn').addEventListener('click', function(e) { e.stopPropagation(); sortDropdown.classList.toggle('hidden'); });
			sortDropdown.querySelectorAll('.hfm-sort-option').forEach(function(opt) {
				opt.addEventListener('click', function() {
					mhSort = opt.dataset.value;
					sortDropdown.classList.add('hidden');
					mhUpdateSortBtn();
					mhScheduleFetch();
				});
			});
			document.addEventListener('click', function() { sortDropdown.classList.add('hidden'); });
			body.querySelector('.hfm-browse-btn').addEventListener('click', function(e) { vscode.postMessage({ command: 'openUrl', url: e.currentTarget.dataset.url }); });

			mhUpdateSortBtn();
			mhFetch();
			return;
`;
}
