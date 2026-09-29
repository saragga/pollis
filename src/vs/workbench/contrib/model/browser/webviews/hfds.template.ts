/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IHfdsMetadata } from '../common/hfds.types.js';

/** CSS for the interactive Explore pane (replaces the Illustration pane). */
function buildExploreCss(): string {
	return `	.hfds-explore-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; height: 520px; }
		.hfds-axis-list { overflow-y: auto; height: 100%; padding-right: 4px; scrollbar-width: none; }
		.hfds-axis-list::-webkit-scrollbar { display: none; }
		.hfds-group { margin-bottom: 6px; }
		.hfds-group-toggle { display: flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-weight: 600; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; width: 100%; text-align: left; user-select: none; padding-left: 17px; }
		.hfds-group-toggle:hover { text-decoration: underline; }
		.hfds-group-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; opacity: 0.7; margin-left: -17px; }
		.hfds-group.collapsed .hfds-group-chevron { transform: rotate(-90deg); }
		.hfds-group.collapsed .hfds-chip-items { display: none; }
		.hfds-chip-items { padding-left: 0; }
		.hfds-chip-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; padding-left: 17px; }
		.hfds-chip-row:hover .hfds-chip-label { text-decoration: underline; color: var(--vscode-foreground); }
		.hfds-chip-cb { appearance: none; -webkit-appearance: none; width: 11px; height: 11px; border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; background: var(--vscode-input-background); cursor: pointer; flex-shrink: 0; position: relative; margin: 0; outline: none; }
		.hfds-chip-cb:focus { outline: none; }
		.hfds-chip-cb:checked { background: var(--vscode-textLink-foreground); border-color: var(--vscode-textLink-foreground); }
		.hfds-chip-cb:checked::after { content: ''; position: absolute; left: 2px; top: 0px; width: 4px; height: 7px; border: 1.5px solid var(--vscode-editor-background, #fff); border-top: none; border-left: none; transform: rotate(45deg); }
		.hfds-chip-label { font-size: 12px; color: var(--vscode-foreground) !important; cursor: pointer; line-height: 1.4; }
		.hfds-cards-panel { display: flex; flex-direction: column; min-width: 0; height: 100%; }
		.hfds-cards-panel .right-action-grid { flex: 1; overflow-y: auto; scrollbar-width: none; }
		.hfds-cards-panel .right-action-grid::-webkit-scrollbar { display: none; }
		.hfds-browse-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
		.hfds-browse-label { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
		.hfds-browse-controls { display: flex; align-items: center; gap: 6px; }
		.hfds-sort-btn { display: flex; align-items: center; gap: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; font-size: 12px; font-family: var(--vscode-font-family); padding: 3px 8px; cursor: pointer; white-space: nowrap; position: relative; }
		.hfds-sort-btn:hover { border-color: var(--vscode-focusBorder); }
		.hfds-sort-dropdown { position: absolute; top: calc(100% + 3px); right: 0; background: var(--vscode-dropdown-background, var(--vscode-input-background)); border: 1px solid var(--vscode-widget-border); border-radius: 4px; z-index: 100; min-width: 150px; padding: 4px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
		.hfds-sort-dropdown.hidden { display: none; }
		.hfds-sort-option { display: block; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-family: var(--vscode-font-family); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
		.hfds-sort-option:hover { background: var(--vscode-list-hoverBackground); }
		.hfds-sort-option.active { color: var(--vscode-textLink-foreground); }
		.hfds-browse-btn { background: transparent; border: 1px solid var(--vscode-textLink-foreground); border-radius: 4px; color: var(--vscode-textLink-foreground); font-size: 12px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 10px; }
		.hfds-browse-btn:hover { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.hfds-empty { font-size: 12px; color: var(--vscode-descriptionForeground); font-style: italic; padding: 24px 0; text-align: center; }
		.hfds-card-tag { font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
		.hfds-card-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
		.hfds-meta-chip { font-size: 10px; color: var(--vscode-descriptionForeground); white-space: nowrap; }
		.hfds-section-sep { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 8px 0 6px; }
		.hfds-toggle-row { padding-left: 17px; margin-bottom: 2px; }
		.hfds-toggle-row .hfds-chip-label { font-weight: 600; }
`;
}

/**
 * The interactive Explore pane, injected as the Illustration override. Generic over the
 * axes declared in TOML: each axis is a collapsible group of filter chips; checked chips
 * are OR-ed within an axis and AND-ed across axes, then queried live against the Hub.
 */
function buildExploreOverrideJs(metadata: IHfdsMetadata): string {
	const groupsJson = JSON.stringify(metadata.hfds.explore?.groups ?? []);
	return `			// renderIllustration() re-runs on every topic toggle; the Explore pane is
			// independent of the code-preview topic, so build it once and skip rebuilds
			// (this also avoids stacking duplicate message listeners and losing selections).
			if (body.dataset.hfdsBuilt) { return; }
			body.dataset.hfdsBuilt = '1';

			var HFDS_GROUPS = ${groupsJson};
			var hfdsSel = {};  // axis -> { filterToken: true } (groups sharing an axis are OR-ed)
			var hfdsSort = 'trending';
			var hfdsFetchSeq = 0;

			var HFDS_SORT_OPTIONS = [
				{ value: 'trending',      label: 'Trending' },
				{ value: 'likes',         label: 'Most Likes' },
				{ value: 'downloads',     label: 'Most Downloads' },
				{ value: 'created_at',    label: 'Recently Created' },
				{ value: 'last_modified', label: 'Recently Updated' },
			];

			function hfdsFmt(n) {
				if (n >= 1000000) { return (n / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M'; }
				if (n >= 1000) { return (n / 1000).toFixed(1).replace(/\\.0$/, '') + 'k'; }
				return String(n);
			}
			function hfdsRelTime(iso) {
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
			function hfdsAxisIds() {
				var ids = [];
				HFDS_GROUPS.forEach(function(g) { if (ids.indexOf(g.axis) < 0) { ids.push(g.axis); } });
				return ids;
			}
			function hfdsSelTokens(axisId) {
				var sel = hfdsSel[axisId] || {};
				return Object.keys(sel).filter(function(t) { return sel[t]; });
			}
			function hfdsFilterGroups() {
				return hfdsAxisIds().map(function(a) { return hfdsSelTokens(a); });
			}
			function hfdsBrowseUrl() {
				var sortMap = { trending: 'trending', likes: 'likes', downloads: 'downloads', created_at: 'createdAt', last_modified: 'lastModified' };
				return 'https://huggingface.co/datasets?sort=' + (sortMap[hfdsSort] || 'trending');
			}
			function hfdsCountSelected() {
				var n = 0;
				hfdsAxisIds().forEach(function(a) { n += hfdsSelTokens(a).length; });
				return n;
			}
			function hfdsUpdateBrowseLabel() {
				var panel = body.querySelector('.hfds-cards-panel');
				if (!panel) { return; }
				var n = hfdsCountSelected();
				panel.querySelector('.hfds-browse-label').textContent = n === 0 ? 'All datasets' : n + ' filter' + (n === 1 ? '' : 's') + ' selected';
			}
			function hfdsUpdateSortBtn() {
				var btn = body.querySelector('#hfds-sort-btn');
				if (!btn) { return; }
				var opt = HFDS_SORT_OPTIONS[0];
				for (var oi = 0; oi < HFDS_SORT_OPTIONS.length; oi++) { if (HFDS_SORT_OPTIONS[oi].value === hfdsSort) { opt = HFDS_SORT_OPTIONS[oi]; break; } }
				btn.querySelector('.hfds-sort-label').innerHTML = '&#8645; Sort: ' + esc(opt.label);
				body.querySelectorAll('.hfds-sort-option').forEach(function(el) { el.classList.toggle('active', el.dataset.value === hfdsSort); });
				var bb = body.querySelector('.hfds-browse-btn');
				if (bb) { bb.dataset.url = hfdsBrowseUrl(); }
			}
			function hfdsShowGrid(datasets) {
				var grid = body.querySelector('.right-action-grid');
				if (!grid) { return; }
				if (datasets.length === 0) {
					grid.innerHTML = '<div class="hfds-empty">No datasets found for this selection</div>';
					return;
				}
				grid.innerHTML = datasets.map(function(d) {
					return '<button class="nb-card hfds-card" data-hf-id="' + esc(d.id) + '">'
						+ '<span class="nb-label">' + esc(d.id) + '</span>'
						+ '<span class="hfds-card-meta">'
						+ '<span class="hfds-meta-chip" title="Last updated">' + pollisClockSvg + ' ' + esc(hfdsRelTime(d.lastModified)) + '</span>'
						+ '<span class="hfds-meta-chip" title="Downloads">&#8595; ' + hfdsFmt(d.downloads) + '</span>'
						+ '<span class="hfds-meta-chip" title="Likes">&#9825; ' + hfdsFmt(d.likes) + '</span>'
						+ '</span>'
						+ '</button>';
				}).join('');
				grid.querySelectorAll('[data-hf-id]').forEach(function(btn) {
					btn.addEventListener('click', function() {
						vscode.postMessage({ command: 'openUrl', url: 'https://huggingface.co/datasets/' + btn.dataset.hfId });
					});
				});
			}
			function hfdsShowSpinner() {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfds-empty">&#8987; Loading&#8230;</div>'; }
			}
			function hfdsShowOffline() {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfds-empty">&#9888; Unable to connect to Hugging Face.<br>Check your network connection and try again.</div>'; }
			}
			function hfdsFetch() {
				hfdsFetchSeq++;
				var seq = hfdsFetchSeq;
				hfdsShowSpinner();
				vscode.postMessage({ command: 'fetchHfDatasets', sort: hfdsSort, filterGroups: hfdsFilterGroups(), limit: 30, seq: seq });
			}
			var hfdsFetchTimer = null;
			function hfdsScheduleFetch() {
				if (hfdsFetchTimer) { clearTimeout(hfdsFetchTimer); }
				hfdsFetchTimer = setTimeout(function() { hfdsFetchTimer = null; hfdsFetch(); }, 150);
			}

			window.addEventListener('message', function(ev) {
				var msg = ev.data;
				if (msg.command === 'hfDatasets') {
					if (msg.seq !== undefined && msg.seq !== hfdsFetchSeq) { return; }
					hfdsShowGrid(msg.datasets || []);
				} else if (msg.command === 'hfDatasetsError') {
					if (msg.seq !== undefined && msg.seq !== hfdsFetchSeq) { return; }
					hfdsShowOffline();
				}
			});

			var chevronSvg = '<svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg>';

			var listHtml = '<div class="hfds-axis-list">';
			HFDS_GROUPS.forEach(function(group) {
				if (group.separatorBefore) { listHtml += '<hr class="hfds-section-sep">'; }
				// Single-criterion axis: render the one chip as a flat checkbox (no collapsible header).
				if (group.toggle) {
					var tchip = group.chips[0];
					var tic = tchip.tooltip ? '<span class="tooltip-icon" data-tip="' + esc(tchip.tooltip) + '">?</span>' : '';
					listHtml += '<label class="hfds-chip-row hfds-toggle-row"><input class="hfds-chip-cb" type="checkbox" data-axis="' + esc(group.axis) + '" data-token="' + esc(group.filterPrefix + tchip.value) + '"><span class="hfds-chip-label">' + esc(tchip.label) + '</span>' + tic + '</label>';
					return;
				}
				listHtml += '<div class="hfds-group collapsed" data-axis="' + esc(group.axis) + '">';
				listHtml += '<button class="hfds-group-toggle"><span class="hfds-group-chevron">' + chevronSvg + '</span>' + esc(group.label) + '</button>';
				listHtml += '<div class="hfds-chip-items">';
				group.chips.forEach(function(chip) {
					var ic = chip.tooltip ? '<span class="tooltip-icon" data-tip="' + esc(chip.tooltip) + '">?</span>' : '';
					listHtml += '<label class="hfds-chip-row"><input class="hfds-chip-cb" type="checkbox" data-axis="' + esc(group.axis) + '" data-token="' + esc(group.filterPrefix + chip.value) + '"><span class="hfds-chip-label">' + esc(chip.label) + '</span>' + ic + '</label>';
				});
				listHtml += '</div></div>';
			});
			listHtml += '</div>';

			var sortDropdownHtml = '<div class="hfds-sort-dropdown hidden" id="hfds-sort-dropdown">'
				+ HFDS_SORT_OPTIONS.map(function(o) { return '<button class="hfds-sort-option' + (o.value === 'trending' ? ' active' : '') + '" data-value="' + o.value + '">' + esc(o.label) + '</button>'; }).join('')
				+ '</div>';

			var cardsHtml = '<div class="hfds-cards-panel">'
				+ '<div class="hfds-browse-row"><span class="hfds-browse-label">All datasets</span>'
				+ '<div class="hfds-browse-controls" style="position:relative;">'
				+ '<button class="hfds-sort-btn" id="hfds-sort-btn"><span class="hfds-sort-label">&#8645; Sort: Trending</span></button>'
				+ sortDropdownHtml
				+ '<button class="hfds-browse-btn" data-url="https://huggingface.co/datasets?sort=trending">Hugging Face &#8599;</button>'
				+ '</div></div>'
				+ '<div class="right-action-grid"></div>'
				+ '</div>';

			body.innerHTML = '<div class="hfds-explore-layout">' + listHtml + cardsHtml + '</div>';

			body.querySelectorAll('.hfds-group-toggle').forEach(function(btn) {
				btn.addEventListener('click', function() { btn.closest('.hfds-group').classList.toggle('collapsed'); });
			});
			body.querySelectorAll('.hfds-chip-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					var axisId = cb.dataset.axis;
					if (!hfdsSel[axisId]) { hfdsSel[axisId] = {}; }
					if (cb.checked) { hfdsSel[axisId][cb.dataset.token] = true; } else { delete hfdsSel[axisId][cb.dataset.token]; }
					hfdsUpdateBrowseLabel();
					hfdsScheduleFetch();
				});
			});
			var sortDropdown = body.querySelector('#hfds-sort-dropdown');
			body.querySelector('#hfds-sort-btn').addEventListener('click', function(e) { e.stopPropagation(); sortDropdown.classList.toggle('hidden'); });
			sortDropdown.querySelectorAll('.hfds-sort-option').forEach(function(opt) {
				opt.addEventListener('click', function() {
					hfdsSort = opt.dataset.value;
					sortDropdown.classList.add('hidden');
					hfdsUpdateSortBtn();
					hfdsScheduleFetch();
				});
			});
			document.addEventListener('click', function() { sortDropdown.classList.add('hidden'); });
			body.querySelector('.hfds-browse-btn').addEventListener('click', function(e) { vscode.postMessage({ command: 'openUrl', url: e.currentTarget.dataset.url }); });

			hfdsUpdateSortBtn();
			hfdsFetch();
			return;
`;
}

export function getHfdsHtml(metadata: IHfdsMetadata): string {
	return buildScaffoldHtml('hfds', metadata.hfds, {
		title: 'Hugging Face Datasets',
		defaultModel: 'browse',
		decisionFirstColumn: 'Task',
		illusCollapsed: false,
		illustrationLabel: metadata.hfds.explore?.label ?? 'Illustration',
		illustrationIntro: metadata.hfds.notes?.explore?.intro,
		illustrationFootnote: metadata.hfds.notes?.explore?.footnote,
		illustrationOverrideJs: buildExploreOverrideJs(metadata),
		extraCss: buildExploreCss(),
		keyPointsIntro: metadata.hfds.notes?.keyPoints?.intro,
		keyPointsFootnote: metadata.hfds.notes?.keyPoints?.footnote,
		decisionIntro: metadata.hfds.notes?.decision?.intro,
		decisionFootnote: metadata.hfds.notes?.decision?.footnote,
	});
}
