/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IKgdsMetadata } from '../common/kgds.types.js';

/** CSS for the interactive Explore pane (replaces the Illustration pane). */
function buildExploreCss(): string {
	return `	.kgds-explore-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; height: 520px; }
		.kgds-axis-list { overflow-y: auto; height: 100%; padding-right: 4px; scrollbar-width: none; }
		.kgds-axis-list::-webkit-scrollbar { display: none; }
		.kgds-group { margin-bottom: 6px; }
		.kgds-group-toggle { display: flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-weight: 600; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; width: 100%; text-align: left; user-select: none; padding-left: 17px; }
		.kgds-group-toggle:hover { text-decoration: underline; }
		.kgds-group-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; opacity: 0.7; margin-left: -17px; }
		.kgds-group.collapsed .kgds-group-chevron { transform: rotate(-90deg); }
		.kgds-group.collapsed .kgds-chip-items { display: none; }
		.kgds-chip-items { padding-left: 0; }
		.kgds-chip-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; padding-left: 17px; }
		.kgds-chip-row:hover .kgds-chip-label { text-decoration: underline; color: var(--vscode-foreground); }
		.kgds-chip-cb { appearance: none; -webkit-appearance: none; width: 11px; height: 11px; border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; background: var(--vscode-input-background); cursor: pointer; flex-shrink: 0; position: relative; margin: 0; outline: none; }
		.kgds-chip-cb:focus { outline: none; }
		.kgds-chip-cb:checked { background: var(--vscode-textLink-foreground); border-color: var(--vscode-textLink-foreground); }
		.kgds-chip-cb:checked::after { content: ''; position: absolute; left: 2px; top: 0px; width: 4px; height: 7px; border: 1.5px solid var(--vscode-editor-background, #fff); border-top: none; border-left: none; transform: rotate(45deg); }
		.kgds-chip-label { font-size: 12px; color: var(--vscode-foreground) !important; cursor: pointer; line-height: 1.4; }
		.kgds-cards-panel { display: flex; flex-direction: column; min-width: 0; height: 100%; }
		.kgds-cards-panel .right-action-grid { flex: 1; overflow-y: auto; scrollbar-width: none; }
		.kgds-cards-panel .right-action-grid::-webkit-scrollbar { display: none; }
		.kgds-browse-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
		.kgds-browse-label { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
		.kgds-browse-controls { display: flex; align-items: center; gap: 6px; }
		.kgds-sort-btn { display: flex; align-items: center; gap: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; font-size: 12px; font-family: var(--vscode-font-family); padding: 3px 8px; cursor: pointer; white-space: nowrap; position: relative; }
		.kgds-sort-btn:hover { border-color: var(--vscode-focusBorder); }
		.kgds-sort-dropdown { position: absolute; top: calc(100% + 3px); right: 0; background: var(--vscode-dropdown-background, var(--vscode-input-background)); border: 1px solid var(--vscode-widget-border); border-radius: 4px; z-index: 100; min-width: 150px; padding: 4px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
		.kgds-sort-dropdown.hidden { display: none; }
		.kgds-sort-option { display: block; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-family: var(--vscode-font-family); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
		.kgds-sort-option:hover { background: var(--vscode-list-hoverBackground); }
		.kgds-sort-option.active { color: var(--vscode-textLink-foreground); }
		.kgds-browse-btn { background: transparent; border: 1px solid var(--vscode-textLink-foreground); border-radius: 4px; color: var(--vscode-textLink-foreground); font-size: 12px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 10px; }
		.kgds-browse-btn:hover { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.kgds-empty { font-size: 12px; color: var(--vscode-descriptionForeground); font-style: italic; padding: 24px 0; text-align: center; }
		.kgds-card-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
		.kgds-meta-chip { font-size: 10px; color: var(--vscode-descriptionForeground); white-space: nowrap; }
		.kgds-section-sep { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 8px 0 6px; }
`;
}

/**
 * The interactive Explore pane, injected as the Illustration override. Generic over the
 * groups declared in TOML: groups sharing an axis are OR-ed; different axes AND-ed. Each
 * filter token is `filterPrefix + value` (here `fileType=` / `license=`), queried live
 * against the public Kaggle datasets/list endpoint.
 */
function buildExploreOverrideJs(metadata: IKgdsMetadata): string {
	const groupsJson = JSON.stringify(metadata.kgds.explore?.groups ?? []);
	return `			// renderIllustration() re-runs on every topic toggle; the Explore pane is
			// independent of the code-preview topic, so build it once and skip rebuilds
			// (this also avoids stacking duplicate message listeners and losing selections).
			if (body.dataset.kgdsBuilt) { return; }
			body.dataset.kgdsBuilt = '1';

			var KGDS_GROUPS = ${groupsJson};
			var kgdsSel = {};  // axis -> { filterToken: true } (groups sharing an axis are OR-ed)
			var kgdsSort = 'hottest';
			var kgdsFetchSeq = 0;

			var KGDS_SORT_OPTIONS = [
				{ value: 'hottest',   label: 'Hottest' },
				{ value: 'votes',     label: 'Most Votes' },
				{ value: 'updated',   label: 'Recently Updated' },
				{ value: 'published', label: 'Recently Published' },
			];

			function kgdsFmt(n) {
				if (n >= 1000000) { return (n / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M'; }
				if (n >= 1000) { return (n / 1000).toFixed(1).replace(/\\.0$/, '') + 'k'; }
				return String(n);
			}
			function kgdsRelTime(iso) {
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
			function kgdsAxisIds() {
				var ids = [];
				KGDS_GROUPS.forEach(function(g) { if (ids.indexOf(g.axis) < 0) { ids.push(g.axis); } });
				return ids;
			}
			function kgdsSelTokens(axisId) {
				var sel = kgdsSel[axisId] || {};
				return Object.keys(sel).filter(function(t) { return sel[t]; });
			}
			function kgdsFilterGroups() {
				return kgdsAxisIds().map(function(a) { return kgdsSelTokens(a); });
			}
			function kgdsBrowseUrl() {
				return 'https://www.kaggle.com/datasets?sort=' + kgdsSort;
			}
			function kgdsCountSelected() {
				var n = 0;
				kgdsAxisIds().forEach(function(a) { n += kgdsSelTokens(a).length; });
				return n;
			}
			function kgdsUpdateBrowseLabel() {
				var panel = body.querySelector('.kgds-cards-panel');
				if (!panel) { return; }
				var n = kgdsCountSelected();
				panel.querySelector('.kgds-browse-label').textContent = n === 0 ? 'All datasets' : n + ' filter' + (n === 1 ? '' : 's') + ' selected';
			}
			function kgdsUpdateSortBtn() {
				var btn = body.querySelector('#kgds-sort-btn');
				if (!btn) { return; }
				var opt = KGDS_SORT_OPTIONS[0];
				for (var oi = 0; oi < KGDS_SORT_OPTIONS.length; oi++) { if (KGDS_SORT_OPTIONS[oi].value === kgdsSort) { opt = KGDS_SORT_OPTIONS[oi]; break; } }
				btn.querySelector('.kgds-sort-label').innerHTML = '&#8645; Sort: ' + esc(opt.label);
				body.querySelectorAll('.kgds-sort-option').forEach(function(el) { el.classList.toggle('active', el.dataset.value === kgdsSort); });
				var bb = body.querySelector('.kgds-browse-btn');
				if (bb) { bb.dataset.url = kgdsBrowseUrl(); }
			}
			function kgdsShowGrid(datasets) {
				var grid = body.querySelector('.right-action-grid');
				if (!grid) { return; }
				if (datasets.length === 0) {
					grid.innerHTML = '<div class="kgds-empty">No datasets found for this selection</div>';
					return;
				}
				grid.innerHTML = datasets.map(function(d) {
					return '<button class="nb-card kgds-card" data-kg-id="' + esc(d.id) + '">'
						+ '<span class="nb-label">' + esc(d.id) + '</span>'
						+ '<span class="kgds-card-meta">'
						+ '<span class="kgds-meta-chip" title="Last updated">' + pollisClockSvg + ' ' + esc(kgdsRelTime(d.lastModified)) + '</span>'
						+ '<span class="kgds-meta-chip" title="Downloads">&#8595; ' + kgdsFmt(d.downloads) + '</span>'
						+ '<span class="kgds-meta-chip" title="Votes">&#9825; ' + kgdsFmt(d.votes) + '</span>'
						+ '</span>'
						+ '</button>';
				}).join('');
				grid.querySelectorAll('[data-kg-id]').forEach(function(btn) {
					btn.addEventListener('click', function() {
						vscode.postMessage({ command: 'openUrl', url: 'https://www.kaggle.com/datasets/' + btn.dataset.kgId });
					});
				});
			}
			function kgdsShowSpinner() {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="kgds-empty">&#8987; Loading&#8230;</div>'; }
			}
			function kgdsShowOffline() {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="kgds-empty">&#9888; Unable to connect to Kaggle.<br>Check your network connection and try again.</div>'; }
			}
			function kgdsFetch() {
				kgdsFetchSeq++;
				var seq = kgdsFetchSeq;
				kgdsShowSpinner();
				vscode.postMessage({ command: 'fetchKgdsDatasets', sort: kgdsSort, filterGroups: kgdsFilterGroups(), limit: 30, seq: seq });
			}
			var kgdsFetchTimer = null;
			function kgdsScheduleFetch() {
				if (kgdsFetchTimer) { clearTimeout(kgdsFetchTimer); }
				kgdsFetchTimer = setTimeout(function() { kgdsFetchTimer = null; kgdsFetch(); }, 150);
			}

			window.addEventListener('message', function(ev) {
				var msg = ev.data;
				if (msg.command === 'kgdsDatasets') {
					if (msg.seq !== undefined && msg.seq !== kgdsFetchSeq) { return; }
					kgdsShowGrid(msg.datasets || []);
				} else if (msg.command === 'kgdsDatasetsError') {
					if (msg.seq !== undefined && msg.seq !== kgdsFetchSeq) { return; }
					kgdsShowOffline();
				}
			});

			var chevronSvg = '<svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg>';

			var listHtml = '<div class="kgds-axis-list">';
			KGDS_GROUPS.forEach(function(group) {
				if (group.separatorBefore) { listHtml += '<hr class="kgds-section-sep">'; }
				listHtml += '<div class="kgds-group collapsed" data-axis="' + esc(group.axis) + '">';
				listHtml += '<button class="kgds-group-toggle"><span class="kgds-group-chevron">' + chevronSvg + '</span>' + esc(group.label) + '</button>';
				listHtml += '<div class="kgds-chip-items">';
				group.chips.forEach(function(chip) {
					var ic = chip.tooltip ? '<span class="tooltip-icon" data-tip="' + esc(chip.tooltip) + '">?</span>' : '';
					listHtml += '<label class="kgds-chip-row"><input class="kgds-chip-cb" type="checkbox" data-axis="' + esc(group.axis) + '" data-token="' + esc(group.filterPrefix + chip.value) + '"><span class="kgds-chip-label">' + esc(chip.label) + '</span>' + ic + '</label>';
				});
				listHtml += '</div></div>';
			});
			listHtml += '</div>';

			var sortDropdownHtml = '<div class="kgds-sort-dropdown hidden" id="kgds-sort-dropdown">'
				+ KGDS_SORT_OPTIONS.map(function(o) { return '<button class="kgds-sort-option' + (o.value === 'hottest' ? ' active' : '') + '" data-value="' + o.value + '">' + esc(o.label) + '</button>'; }).join('')
				+ '</div>';

			var cardsHtml = '<div class="kgds-cards-panel">'
				+ '<div class="kgds-browse-row"><span class="kgds-browse-label">All datasets</span>'
				+ '<div class="kgds-browse-controls" style="position:relative;">'
				+ '<button class="kgds-sort-btn" id="kgds-sort-btn"><span class="kgds-sort-label">&#8645; Sort: Hottest</span></button>'
				+ sortDropdownHtml
				+ '<button class="kgds-browse-btn" data-url="https://www.kaggle.com/datasets?sort=hottest">Kaggle &#8599;</button>'
				+ '</div></div>'
				+ '<div class="right-action-grid"></div>'
				+ '</div>';

			body.innerHTML = '<div class="kgds-explore-layout">' + listHtml + cardsHtml + '</div>';

			body.querySelectorAll('.kgds-group-toggle').forEach(function(btn) {
				btn.addEventListener('click', function() { btn.closest('.kgds-group').classList.toggle('collapsed'); });
			});
			body.querySelectorAll('.kgds-chip-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					var axisId = cb.dataset.axis;
					if (!kgdsSel[axisId]) { kgdsSel[axisId] = {}; }
					if (cb.checked) { kgdsSel[axisId][cb.dataset.token] = true; } else { delete kgdsSel[axisId][cb.dataset.token]; }
					kgdsUpdateBrowseLabel();
					kgdsScheduleFetch();
				});
			});
			var sortDropdown = body.querySelector('#kgds-sort-dropdown');
			body.querySelector('#kgds-sort-btn').addEventListener('click', function(e) { e.stopPropagation(); sortDropdown.classList.toggle('hidden'); });
			sortDropdown.querySelectorAll('.kgds-sort-option').forEach(function(opt) {
				opt.addEventListener('click', function() {
					kgdsSort = opt.dataset.value;
					sortDropdown.classList.add('hidden');
					kgdsUpdateSortBtn();
					kgdsScheduleFetch();
				});
			});
			document.addEventListener('click', function() { sortDropdown.classList.add('hidden'); });
			body.querySelector('.kgds-browse-btn').addEventListener('click', function(e) { vscode.postMessage({ command: 'openUrl', url: e.currentTarget.dataset.url }); });

			kgdsUpdateSortBtn();
			kgdsFetch();
			return;
`;
}

export function getKgdsHtml(metadata: IKgdsMetadata): string {
	return buildScaffoldHtml('kgds', metadata.kgds, {
		title: 'Kaggle Datasets',
		defaultModel: 'browse',
		decisionFirstColumn: 'Task',
		illusCollapsed: false,
		illustrationLabel: metadata.kgds.explore?.label ?? 'Illustration',
		illustrationIntro: metadata.kgds.notes?.explore?.intro,
		illustrationFootnote: metadata.kgds.notes?.explore?.footnote,
		illustrationOverrideJs: buildExploreOverrideJs(metadata),
		extraCss: buildExploreCss(),
		keyPointsIntro: metadata.kgds.notes?.keyPoints?.intro,
		keyPointsFootnote: metadata.kgds.notes?.keyPoints?.footnote,
		decisionIntro: metadata.kgds.notes?.decision?.intro,
		decisionFootnote: metadata.kgds.notes?.decision?.footnote,
	});
}
