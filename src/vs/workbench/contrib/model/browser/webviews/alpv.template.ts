/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';
import { IAlpvMetadata } from '../common/alpv.types.js';

/** Escape a string for safe embedding in a JS single-quoted string literal. */
function jsEscape(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n');
}

/** Escape HTML special characters. */
function htmlEsc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildBulletsHtml(metadata: IAlpvMetadata): string {
	const bullets = metadata.alpv.bullets;
	if (!bullets?.length) { return ''; }
	return '\n' + bullets.map(b => `\t\t\t\t\t<li><strong>${htmlEsc(b.text)}</strong> &#8212; ${b.detail}</li>`).join('\n') + '\n\t\t\t\t';
}

function buildDecisionRowsHtml(metadata: IAlpvMetadata): string {
	const rows = metadata.alpv.decisionRows;
	if (!rows?.length) { return ''; }
	return '\n' + rows.map(r => `\t\t\t\t\t<tr><td>${htmlEsc(r.task)}</td><td>${htmlEsc(r.context)}</td><td>${htmlEsc(r.purpose)}</td></tr>`).join('\n') + '\n\t\t\t\t';
}

function buildMiniChartsJs(metadata: IAlpvMetadata): string {
	const charts = metadata.alpv.miniCharts;
	const models = metadata.alpv.codeBranches?.map(b => b.model) ?? [];
	if (!charts?.length) { return `var MINI_CHARTS = []; var MINI_LABELS = [];`; }

	const fns = charts.map(c => {
		const body = c.svg.trim().split('\n').map(l => '\t\t\t\t\t' + l.trim()).join('\n');
		return `\t\t\t\tfunction mini_${c.model}() {\n${body}\n\t\t\t\t\treturn s;\n\t\t\t\t}`;
	}).join('\n');

	const chartOrder = models.length ? models : charts.map(c => c.model);
	const miniArr = chartOrder.map(m => `mini_${m}`).join(', ');
	const labelArr = chartOrder.map(m => {
		const found = charts.find(c => c.model === m);
		const label = found ? (m.charAt(0).toUpperCase() + m.slice(1)) : m;
		return `'${label}'`;
	}).join(', ');

	return `${fns}\n\t\t\t\tvar MINI_CHARTS = [${miniArr}];\n\t\t\t\tvar MINI_LABELS = [${labelArr}];`;
}

function buildCodeBranchesJs(metadata: IAlpvMetadata): string {
	const branches = metadata.alpv.codeBranches;
	if (!branches?.length) { return ''; }

	const cases = branches.map((b, i) => {
		const lines = b.code.trim().split('\n');
		const linesCalls = lines.map(l => `\t\t\t\t\tc += line('${jsEscape(l)}');`).join('\n');
		const cond = i === 0 ? `if (currentModel === '${b.model}')` : `else if (currentModel === '${b.model}')`;
		return `\t\t\t\t${cond} {\n${linesCalls}\n\t\t\t\t}`;
	}).join(' ');

	return cases;
}

function buildActionsJs(metadata: IAlpvMetadata): string {
	const groups = metadata.alpv.actionGroups;
	if (!groups?.length) { return ''; }

	return groups.map(g => {
		const varName = g.id.toUpperCase().replace(/-/g, '_') + '_ACTIONS';
		const actions = g.actions.map(a => {
			const linesCalls = a.code.trim().split('\n').map(l => `line('${jsEscape(l)}')`).join(' + ');
			return `\t\t\t\t\t{\n\t\t\t\t\t\tid: '${a.id}',\n\t\t\t\t\t\tlabel: '${jsEscape(a.label)}',\n\t\t\t\t\t\tdesc: '${jsEscape(a.desc)}',\n\t\t\t\t\t\tcode: function() { return ${linesCalls}; },\n\t\t\t\t\t}`;
		}).join(',\n');
		return `\t\t\t\tvar ${varName} = [\n${actions}\n\t\t\t\t];`;
	}).join('\n');
}

function buildNextStepsHtml(metadata: IAlpvMetadata): string {
	const groups = metadata.alpv.actionGroups;
	if (!groups?.length) { return ''; }

	return groups.map(g => {
		const btnId = `btn-alpv-${g.id}`;
		return `\t\t\t\t\t<li><button class="list-btn panel-toggle" id="${btnId}">${htmlEsc(g.label)}</button></li>`;
	}).join('\n');
}

function buildNextStepsWiringJs(metadata: IAlpvMetadata): string {
	const groups = metadata.alpv.actionGroups;
	if (!groups?.length) { return ''; }

	return groups.map(g => {
		const btnId = `btn-alpv-${g.id}`;
		const varName = g.id.toUpperCase().replace(/-/g, '_') + '_ACTIONS';
		const label = jsEscape(g.label);
		return `\t\t\tdocument.getElementById('${btnId}').addEventListener('click', function() {\n\t\t\t\tshowRightPanel(${varName}, '${label}', '${btnId}');\n\t\t\t});`;
	}).join('\n');
}

function buildTogglesJs(metadata: IAlpvMetadata): string {
	const branches = metadata.alpv.codeBranches;
	if (!branches?.length) { return ''; }
	return branches.map((b, i) => {
		const label = b.model.charAt(0).toUpperCase() + b.model.slice(1);
		const active = i === 0 ? ' active' : '';
		return `\t\t\t\t<button class="toggle-btn${active}" data-model="${b.model}">${label}</button>`;
	}).join('\n');
}

export function getAlpvHtml(mermaidJs: string | undefined, metadata: IAlpvMetadata): string {
	return buildWebviewHtml({
		title: 'Alpha Vantage',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'equity',
		modelsLiteral: `['equity', 'forex', 'crypto', 'indicators', 'economic']`,
		chartW: 54,
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Download market and economic data from Alpha Vantage into Julia: equities, forex, crypto, indicators, and macro series.</div>';
			return;`,
		extraCss: `
			.refs-container { display: flex; gap: 16px; height: 400px; }
			.refs-list-panel { flex: 0 0 60%; overflow-y: auto; padding-right: 8px; }
			.refs-actions-panel { flex: 1; min-width: 0; border-left: 1px solid var(--vscode-widget-border); padding-left: 16px; overflow-y: auto; }
			.references-list { display: flex; flex-direction: column; gap: 8px; }
			.reference-item { background: var(--vscode-list-hoverBackground); border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px; text-align: left; cursor: pointer; transition: all 0.2s; width: 100%; font-family: var(--vscode-font-family); }
			.reference-item:hover { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
			.reference-item.active { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
			.ref-title { display: block; font-weight: 500; color: var(--vscode-foreground); margin-bottom: 4px; word-break: break-word; }
			.ref-desc { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); }
			.action-btn { display: block; width: 100%; margin-bottom: 8px; padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer; font-size: 12px; font-family: var(--vscode-font-family); transition: background 0.2s; }
			.action-btn:hover { background: var(--vscode-button-hoverBackground); }
			.ref-placeholder { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; padding: 20px 10px; }
		`,
		togglesJs: buildTogglesJs(metadata),
		bullets: buildBulletsHtml(metadata),
		decisionRows: buildDecisionRowsHtml(metadata),
		decisionFirstColumn: 'Task',
		miniChartsJs: buildMiniChartsJs(metadata),
		codeBranchesJs: buildCodeBranchesJs(metadata),
		actionsJs: buildActionsJs(metadata),
		nextStepsHtml: buildNextStepsHtml(metadata),
		nextStepsWiringJs: buildNextStepsWiringJs(metadata),
		extraJs: `
		var currentReferences = [];
		var selectedRefIdx = null;
		var rightPanel = document.getElementById('right-panel');

		window.addEventListener('message', function(event) {
			if (event.data.command === 'showReferences') {
				currentReferences = event.data.references || [];
				renderReferencesList();
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
			placePanel('sec-learn');
			rightPanel.style.display = 'block';
			document.getElementById('btn-refs-close').addEventListener('click', function() {
				rightPanel.innerHTML = '';
				rightPanel.style.display = 'none';
			});
			document.querySelectorAll('.reference-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					var idx = parseInt(btn.dataset.idx, 10);
					selectedRefIdx = idx;
					document.querySelectorAll('.reference-item').forEach(function(b) { b.classList.remove('active'); });
					btn.classList.add('active');
					renderReferenceDetails(currentReferences[idx]);
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

		function esc(s) { return (s || '').replace(/[&<>"']/g, function(c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
		`,
	});
}
