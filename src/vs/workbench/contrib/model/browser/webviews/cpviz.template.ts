/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getCpvizHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Categorical and Proportional Plots',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'mosaic',
		modelsLiteral: "['mosaic', 'nightingale', 'waterfall', 'treemap', 'sankey']",
		chartW: 54,
		hiddenRowCss: '.bar-row, .histogram-row, .box-row, .violin-row { display: none; }',
		togglesJs: `			<button class="toggle-btn active" data-model="mosaic">Mosaic Plot</button>
			<button class="toggle-btn" data-model="nightingale">Nightingale Rose</button>
			<button class="toggle-btn" data-model="waterfall">Waterfall</button>
			<button class="toggle-btn" data-model="treemap">Treemap</button>
			<button class="toggle-btn" data-model="sankey">Sankey Diagram</button>`,
		bullets: `				<li><strong>Part-to-whole</strong> &#8212; break a total into its category shares with <span class="plot-link" data-goto="treemap">treemaps</span> and <span class="plot-link" data-goto="mosaic">mosaic plots</span></li>
				<li><strong>Flow and change</strong> &#8212; trace a running total with <span class="plot-link" data-goto="waterfall">waterfall plots</span> and quantities moving between stages with <span class="plot-link" data-goto="sankey">Sankey diagrams</span></li>
				<li><strong>Cyclic comparison</strong> &#8212; compare magnitudes around a cycle with <span class="plot-link" data-goto="nightingale">nightingale rose charts</span></li>
			`,
		decisionRows: `					<tr><td>Mosaic Plot</td><td>Two categoricals</td><td>Show the association between two categorical variables through tile areas</td></tr>
					<tr><td>Nightingale Rose</td><td>Cyclic categories</td><td>Compare magnitudes around a cyclic axis (e.g. months) using sector area</td></tr>
					<tr><td>Waterfall</td><td>Sequential deltas</td><td>Trace how a starting value reaches an end value through additions and subtractions</td></tr>
					<tr><td>Treemap</td><td>Hierarchical parts</td><td>Show nested part-to-whole composition as proportional area</td></tr>
					<tr><td>Sankey Diagram</td><td>Flows between nodes</td><td>Trace quantities flowing between stages, sources, and sinks</td></tr>
				`,
		miniChartsJs: `function miniMosaic() {
			// two columns of differing width, each split into stacked tiles
			var s = '';
			s += '<rect x="4"  y="6"  width="24" height="26" fill="currentColor" fill-opacity="0.30" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="4"  y="32" width="24" height="48" fill="currentColor" fill-opacity="0.60" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="30" y="6"  width="22" height="44" fill="currentColor" fill-opacity="0.45" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="30" y="50" width="22" height="30" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="0.8"/>';
			return s;
		}

		function miniNightingale() {
			// rose chart: equal-angle sectors with varying radius
			var cx = 27, cy = 44;
			var radii = [24, 16, 26, 13, 21, 18];
			var n = radii.length;
			var s = '';
			for (var i = 0; i < n; i++) {
				var a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
				var a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
				var r = radii[i];
				var x0 = (cx + r * Math.cos(a0)).toFixed(1), y0 = (cy + r * Math.sin(a0)).toFixed(1);
				var x1 = (cx + r * Math.cos(a1)).toFixed(1), y1 = (cy + r * Math.sin(a1)).toFixed(1);
				var op = (0.25 + 0.12 * (i % 3)).toFixed(2);
				s += '<path d="M ' + cx + ' ' + cy + ' L ' + x0 + ' ' + y0 + ' A ' + r + ' ' + r + ' 0 0 1 ' + x1 + ' ' + y1 + ' Z" fill="currentColor" fill-opacity="' + op + '" stroke="currentColor" stroke-width="0.6"/>';
			}
			return s;
		}

		function miniWaterfall() {
			// floating bars showing a running total
			var bars = [[5, 50, 80], [15, 38, 50], [24, 44, 38], [34, 20, 44], [43, 20, 80]];
			var s = '<line x1="4" y1="80" x2="52" y2="80" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			bars.forEach(function(b) {
				var top = Math.min(b[1], b[2]), h = Math.abs(b[2] - b[1]);
				s += '<rect x="' + b[0] + '" y="' + top + '" width="8" height="' + h + '" fill="currentColor" opacity="0.7"/>';
			});
			return s;
		}

		function miniTreemap() {
			// nested rectangles partitioning the area
			var s = '';
			s += '<rect x="4"  y="6"  width="28" height="46" fill="currentColor" fill-opacity="0.50" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="4"  y="52" width="28" height="28" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="32" y="6"  width="20" height="26" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="32" y="32" width="20" height="22" fill="currentColor" fill-opacity="0.60" stroke="currentColor" stroke-width="0.8"/>';
			s += '<rect x="32" y="54" width="20" height="26" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="0.8"/>';
			return s;
		}

		function miniSankey() {
			// two columns of nodes with curved flow bands
			var s = '';
			s += '<path d="M 11 18 C 28 18, 28 14, 45 14 L 45 22 C 28 26, 28 30, 11 30 Z" fill="currentColor" fill-opacity="0.20"/>';
			s += '<path d="M 11 50 C 28 50, 28 44, 45 44 L 45 60 C 28 64, 28 62, 11 64 Z" fill="currentColor" fill-opacity="0.28"/>';
			s += '<rect x="6"  y="14" width="5" height="24" fill="currentColor" opacity="0.85"/>';
			s += '<rect x="6"  y="46" width="5" height="22" fill="currentColor" opacity="0.85"/>';
			s += '<rect x="45" y="10" width="5" height="20" fill="currentColor" opacity="0.85"/>';
			s += '<rect x="45" y="40" width="5" height="30" fill="currentColor" opacity="0.85"/>';
			return s;
		}

		var MINI_CHARTS = [miniMosaic, miniNightingale, miniWaterfall, miniTreemap, miniSankey];
		var MINI_LABELS = ['Mosaic', 'Nightingale', 'Waterfall', 'Treemap', 'Sankey'];`,
		codeBranchesJs: `if (currentModel === 'mosaic') {
				c += cline(kw('using') + ' ' + ty('Plots'), 'mosaic via shaded rectangles');
				c += blank();
				c += cline('counts = [40 25; 18 30; 12 20]', 'contingency table: rows = X levels, cols = Y levels');
				c += cline('coltot = ' + fn('sum') + '(counts; dims=1)', 'column totals set tile widths');
				c += cline('xedges = [0; ' + fn('cumsum') + '(' + fn('vec') + '(coltot ./ ' + fn('sum') + '(coltot)))]', 'column boundaries on [0, 1]');
				c += blank();
				c += cline('plt = ' + fn('plot') + '(; legend=false, xlims=(0, 1), ylims=(0, 1), title="Mosaic")', 'empty canvas');
				c += cline(kw('for') + ' j ' + kw('in') + ' 1:' + fn('size') + '(counts, 2)', 'one column per Y level');
				c += cline('    yfrac = counts[:, j] ./ ' + fn('sum') + '(counts[:, j])', 'row split within the column');
				c += cline('    yedges = [0; ' + fn('cumsum') + '(yfrac)]', 'stacked tile boundaries');
				c += cline('    ' + kw('for') + ' i ' + kw('in') + ' 1:' + fn('size') + '(counts, 1)', 'one tile per X level');
				c += cline('        ' + fn('plot!') + '(plt, ' + ty('Shape') + '([xedges[j], xedges[j+1], xedges[j+1], xedges[j]],', 'rectangle for cell (i, j)');
				c += line('            [yedges[i], yedges[i], yedges[i+1], yedges[i+1]]); fillalpha=0.3 + 0.2i, c=i)');
				c += line('    ' + kw('end'));
				c += line(kw('end'));
				c += cline('plt', 'tile area is proportional to cell frequency');

			} else if (currentModel === 'nightingale') {
				c += cline(kw('using') + ' ' + ty('Plots'), 'rose chart via wedge sectors');
				c += blank();
				c += cline('labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]', 'cyclic categories');
				c += cline('values = [12, 19, 9, 25, 17, 22]', 'magnitude per category');
				c += cline('n      = ' + fn('length') + '(values)', 'number of sectors');
				c += blank();
				c += cline('plt = ' + fn('plot') + '(; aspect_ratio=:equal, legend=false, framestyle=:none, title="Nightingale Rose")', 'equal-aspect canvas');
				c += cline(kw('for') + ' i ' + kw('in') + ' 1:n', 'one wedge per category');
				c += cline('    a0, a1 = 2pi * (i - 1) / n, 2pi * i / n', 'equal angular slice');
				c += cline('    ts = ' + fn('range') + '(a0, a1; length=24)', 'arc sampling');
				c += cline('    xs = [0.0; values[i] .* ' + fn('cos') + '.(ts); 0.0]', 'wedge x: centre, arc, centre');
				c += cline('    ys = [0.0; values[i] .* ' + fn('sin') + '.(ts); 0.0]', 'radius encodes magnitude');
				c += cline('    ' + fn('plot!') + '(plt, ' + ty('Shape') + '(xs, ys); c=i, fillalpha=0.7, linecolor=:white)', 'filled sector');
				c += line('    amid = (a0 + a1) / 2');
				c += cline('    ' + fn('annotate!') + '(plt, (values[i] + 2) * ' + fn('cos') + '(amid), (values[i] + 2) * ' + fn('sin') + '(amid), ' + fn('text') + '(labels[i], 7))', 'label outside each sector');
				c += line(kw('end'));
				c += cline('plt', 'sector radius (and area) encodes each value');

			} else if (currentModel === 'waterfall') {
				c += cline(kw('using') + ' ' + ty('Plots'), 'waterfall via floating bars');
				c += blank();
				c += cline('labels = ["Start", "+Sales", "-Costs", "+Other", "End"]', 'Start and End anchor to zero');
				c += cline('deltas = [100, 45, -30, 20]', 'signed change at each step');
				c += cline('cum    = ' + fn('cumsum') + '(deltas)', 'running total after each step');
				c += cline('tops    = [cum; cum[end]]', 'top of each bar (End = final total)');
				c += cline('bottoms = [0; cum[1:end-1]; 0]', 'base of each bar');
				c += blank();
				c += cline(fn('bar') + '(labels, tops; fillto=bottoms, legend=false,', 'each bar spans bottoms[i] to tops[i]');
				c += cline('    title="Waterfall", ylabel="Value", xrotation=20)', 'bars float to show the running total');

			} else if (currentModel === 'treemap') {
				c += cline(kw('using') + ' ' + ty('Plots'), 'squarified treemap via Shape tiles');
				c += blank();
				c += cline('labels = ["A", "B", "C", "D", "E"]', 'category labels');
				c += cline('values = [50, 25, 15, 7, 3]', 'part-to-whole sizes (any order)');
				c += blank();
				c += cline('# squarified layout: place tiles in the shorter side of the free rectangle', 'keeps tiles near-square');
				c += cline('order = ' + fn('sortperm') + '(values; rev=true)', 'largest first');
				c += cline('areas = values[order] ./ ' + fn('sum') + '(values)', 'normalised areas (total = 1)');
				c += cline('x, y, w, h = 0.0, 0.0, 1.0, 1.0', 'free rectangle');
				c += cline('plt = ' + fn('plot') + '(; legend=false, xlims=(0,1), ylims=(0,1), framestyle=:box, title="Treemap")', 'canvas');
				c += cline(kw('for') + ' (k, idx) ' + kw('in') + ' ' + fn('enumerate') + '(order)', 'one tile per category');
				c += cline('    frac = areas[k] / (w * h)', 'share of the remaining free area');
				c += cline('    ' + kw('if') + ' w >= h', 'split off a column or a row, whichever keeps squares');
				c += cline('        tw = w * frac; ' + ty('rect') + ' = (x, y, tw, h); x += tw; w -= tw', 'vertical slice');
				c += cline('    ' + kw('else'));
				c += cline('        th = h * frac; ' + ty('rect') + ' = (x, y, w, th); y += th; h -= th', 'horizontal slice');
				c += line('    ' + kw('end'));
				c += cline('    rx, ry, rw, rh = ' + ty('rect'), 'tile geometry');
				c += cline('    ' + fn('plot!') + '(plt, ' + ty('Shape') + '([rx, rx+rw, rx+rw, rx], [ry, ry, ry+rh, ry+rh]); c=k, fillalpha=0.6)', 'draw the tile');
				c += cline('    ' + fn('annotate!') + '(plt, rx + rw/2, ry + rh/2, ' + fn('text') + '(labels[idx], 9))', 'label at the tile centre');
				c += line(kw('end'));
				c += cline('plt', 'tile area is proportional to value, tiles kept near-square');

			} else {
				c += cline(kw('using') + ' ' + ty('SankeyMakie') + ', ' + ty('CairoMakie'), 'Sankey diagram with the Makie backend');
				c += blank();
				c += cline('# edges as (source, target) => weight; node indices are 1-based', 'define the flow network');
				c += cline('connections = [(1, 3, 8.0), (2, 3, 4.0), (3, 4, 7.0), (3, 5, 5.0)]', 'source, target, flow');
				c += cline('names = ["Coal", "Gas", "Grid", "Homes", "Industry"]', 'node labels');
				c += blank();
				c += cline(fn('sankey') + '(connections; nodelabels=names)', 'band width is proportional to flow');

			}`,
		extraCss: `
			.refs-container { display: flex; gap: 16px; height: 400px; }
			.refs-list-panel { flex: 0 0 45%; overflow-y: auto; padding-right: 8px; }
			.refs-actions-panel { flex: 0 0 55%; border-left: 1px solid var(--vscode-widget-border); padding-left: 16px; overflow-y: auto; }
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
				+ '<div class="refs-list-panel"><div class="references-list">';
			currentReferences.forEach(function(ref, idx) {
				var desc = (ref.authors || '') + ' \xb7 ' + (ref.year || '');
				if (ref.openAccess) { desc += ' \xb7 Open Access'; }
				html += '<button class="reference-item" data-idx="' + idx + '">'
					+ '<span class="ref-title">' + esc(ref.title || '') + '</span>'
					+ '<span class="ref-desc">' + esc(desc) + '</span>'
					+ '</button>';
			});
			html += '</div></div>'
				+ '<div class="refs-actions-panel"><div class="ref-placeholder">Select a reference to view details</div></div>'
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
					document.querySelectorAll('.reference-item').forEach(function(b) { b.classList.remove('active'); });
					btn.classList.add('active');
					renderReferenceDetails(currentReferences[idx]);
				});
			});
		}

		function renderReferenceDetails(ref) {
			var html = '<div style="font-weight:600;margin-bottom:16px;color:var(--vscode-foreground);word-break:break-word;">' + esc(ref.title || '') + '</div>'
				+ '<button class="action-btn" id="btn-open-ref">Open in Browser</button>'
				+ '<button class="action-btn" id="btn-copy-bibtex">Copy BibTeX to Clipboard</button>';
			document.querySelector('.refs-actions-panel').innerHTML = html;
			document.getElementById('btn-open-ref').addEventListener('click', function() {
				vscode.postMessage({ command: 'openReference', id: ref.title });
			});
			document.getElementById('btn-copy-bibtex').addEventListener('click', function() {
				var bibtex = generateBibTeX(ref);
				navigator.clipboard.writeText(bibtex).then(function() {
					var btn = document.getElementById('btn-copy-bibtex');
					var orig = btn.textContent;
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = orig; }, 2000);
				});
			});
		}

		function generateBibTeX(ref) {
			var type = ref.doi ? 'online' : 'misc';
			var key = (ref.title || 'ref').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
			var bib = '@' + type + '{' + key + ',\\n'
				+ '  title={' + (ref.title || '') + '},\\n'
				+ '  author={' + (ref.authors || '') + '},\\n'
				+ '  year={' + (ref.year || '') + '},\\n';
			if (ref.journal) { bib += '  journal={' + ref.journal + '},\\n'; }
			if (ref.doi) { bib += '  doi={' + ref.doi + '},\\n'; }
			if (ref.url) { bib += '  url={' + ref.url + '},\\n'; }
			bib += '}';
			return bib;
		}

		function esc(s) { return (s || '').replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
		`,
		actionsJs: `var VISUALISE_ACTIONS = [
			{
				id: 'cpviz-stacked-bar',
				label: 'Stacked Bar',
				desc: 'Show part-to-whole composition across categories as stacked bars',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots'), 'statistical plotting');
					c += blank();
					c += cline('groups = ["Q1", "Q2", "Q3"]', 'x categories');
					c += cline('parts  = [40 30 30; 25 45 30; 35 25 40]', 'rows = group, cols = component');
					c += blank();
					c += cline(fn('groupedbar') + '(groups, parts; bar_position=:stack,', 'stack components within each bar');
					c += cline('    label=["A" "B" "C"], legend=:outertopright)', 'each colour is one component');
					return c;
				},
			},
			{
				id: 'cpviz-normalised-bar',
				label: 'Percent Bar',
				desc: 'Normalise stacked bars to 100 percent to compare proportions',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots'), 'statistical plotting');
					c += blank();
					c += cline('groups = ["Q1", "Q2", "Q3"]', 'x categories');
					c += cline('parts  = [40 30 30; 25 45 30; 35 25 40]', 'component counts');
					c += cline('pct    = parts ./ ' + fn('sum') + '(parts; dims=2) .* 100', 'row-normalise to percentages');
					c += blank();
					c += cline(fn('groupedbar') + '(groups, pct; bar_position=:stack,', 'each bar sums to 100');
					c += cline('    label=["A" "B" "C"], ylabel="Percent", legend=:outertopright)', 'compare shares, not totals');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'cpviz-chisq',
				label: 'Chi-Squared Test',
				desc: 'Test association between two categorical variables behind a mosaic',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('HypothesisTests'), 'hypothesis testing');
					c += blank();
					c += cline('counts = [40 25; 18 30; 12 20]', 'contingency table');
					c += cline('t = ' + fn('ChisqTest') + '(counts)', 'Pearson chi-squared test of independence');
					c += cline(fn('println') + '("chi2 = ", ' + fn('round') + '(t.stat; digits=3), "  p = ", ' + fn('pvalue') + '(t))', 'p < 0.05 suggests the variables are associated');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'cpviz-expected',
				label: 'Expected Counts',
				desc: 'Compute the expected cell counts under independence',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('LinearAlgebra'), 'outer product');
					c += blank();
					c += cline('counts = [40 25; 18 30; 12 20]', 'observed contingency table');
					c += cline('rowt   = ' + fn('sum') + '(counts; dims=2)', 'row totals');
					c += cline('colt   = ' + fn('sum') + '(counts; dims=1)', 'column totals');
					c += cline('expected = (rowt * colt) ./ ' + fn('sum') + '(counts)', 'expected counts under independence');
					c += cline(fn('display') + '(' + fn('round') + '.(expected; digits=2))', 'compare with observed to read deviations');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'cpviz-grouped-bar',
				label: 'Grouped Bar',
				desc: 'Place category components side by side instead of stacked',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots'), 'statistical plotting');
					c += blank();
					c += cline('groups = ["Q1", "Q2", "Q3"]', 'x categories');
					c += cline('parts  = [40 30 30; 25 45 30; 35 25 40]', 'rows = group, cols = component');
					c += blank();
					c += cline(fn('groupedbar') + '(groups, parts; bar_position=:dodge,', 'dodge places bars side by side');
					c += cline('    label=["A" "B" "C"], legend=:outertopright)', 'easier to compare individual components');
					return c;
				},
			},
			{
				id: 'cpviz-pie',
				label: 'Pie Chart',
				desc: 'Compare a single set of proportions as a pie',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots'), 'plotting');
					c += blank();
					c += cline('labels = ["A", "B", "C", "D"]', 'categories');
					c += cline('values = [50, 25, 15, 10]', 'proportions');
					c += blank();
					c += cline(fn('pie') + '(labels, values; title="Composition")', 'angle encodes share of the whole');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'cpviz-proportions',
				label: 'Proportion Table',
				desc: 'Print each category share of the total',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Printf'), 'formatted output');
					c += blank();
					c += cline('labels = ["A", "B", "C", "D"]', 'categories');
					c += cline('values = [50, 25, 15, 10]', 'counts');
					c += cline('total  = ' + fn('sum') + '(values)', 'grand total');
					c += cline(kw('for') + ' (l, v) ' + kw('in') + ' ' + fn('zip') + '(labels, values)', 'one row per category');
					c += cline('    ' + fn('@printf') + '("%-3s %5d  %5.1f%%\\n", l, v, 100v / total)', 'share as a percentage');
					c += line(kw('end'));
					return c;
				},
			},
			{
				id: 'cpviz-entropy',
				label: 'Diversity (Entropy)',
				desc: 'Measure how evenly a total is spread across categories',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsBase'), 'entropy utilities');
					c += blank();
					c += cline('values = [50, 25, 15, 10]', 'category counts');
					c += cline('p = values ./ ' + fn('sum') + '(values)', 'proportions');
					c += cline(fn('println') + '("Shannon entropy: ", ' + fn('round') + '(' + fn('entropy') + '(p, 2); digits=3), " bits")', 'higher = more evenly spread');
					return c;
				},
			},
		];`,
	});
}
