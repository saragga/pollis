/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getDcmpHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Distribution Comparison Plots',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'ecdf',
		modelsLiteral: `['ecdf', 'qq', 'marginal', 'correlogram']`,
		chartW: 66,
		illusCollapsed: true,
		hiddenRowCss: '.qq-row, .marginal-row, .correlogram-row { display: none; }',
		togglesJs: `			<button class="toggle-btn active" data-model="ecdf">ECDF</button>
			<button class="toggle-btn" data-model="qq">QQ Plot</button>
			<button class="toggle-btn" data-model="marginal">Marginal Plot</button>
			<button class="toggle-btn" data-model="correlogram">Correlogram</button>`,
		bullets: `				<li><strong>Goodness of fit</strong> &#8212; compare a sample against a theoretical distribution with Empirical Cumulative Distribution Function (<span class="plot-link" data-goto="ecdf">ECDF</span>) overlays and Quantile-Quantile (<span class="plot-link" data-goto="qq">QQ</span>) plots</li>
				<li><strong>Normality checks</strong> &#8212; spot skew and heavy tails before relying on parametric methods</li>
				<li><strong>Joint and marginal views</strong> &#8212; examine relationships alongside per-variable distributions with <span class="plot-link" data-goto="marginal">marginal plots</span> and <span class="plot-link" data-goto="correlogram">correlograms</span></li>
			`,
		decisionRows: `					<tr><td>ECDF</td><td>Single numeric</td><td>Show the Empirical Cumulative Distribution Function without binning artefacts</td></tr>
					<tr><td>QQ Plot</td><td>Single numeric</td><td>Check whether a sample follows a theoretical distribution; deviations reveal shape</td></tr>
					<tr><td>Marginal Plot</td><td>Numeric x, y</td><td>Show joint scatter and per-axis marginal distributions simultaneously</td></tr>
					<tr><td>Correlogram</td><td>Multiple numeric</td><td>Visualise all pairwise relationships and marginal densities in one matrix</td></tr>
				`,
		miniChartsJs: `function miniEcdf() {
			// Staircase S-curve rising from bottom-left to top-right
			var s = '<line x1="4" y1="4" x2="4" y2="80" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
				+ '<line x1="4" y1="80" x2="62" y2="80" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			var steps = [4,80, 10,80, 10,72, 18,72, 18,62, 26,62, 26,50, 34,50, 34,36, 42,36, 42,22, 50,22, 50,12, 60,12];
			var d = 'M ' + steps[0] + ' ' + steps[1];
			for (var i = 2; i < steps.length; i += 2) { d += ' L ' + steps[i] + ' ' + steps[i + 1]; }
			s += '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2"/>';
			return s;
		}

		function miniQq() {
			// Dashed reference diagonal + points clustered around it
			var s = '<line x1="6" y1="78" x2="62" y2="8" stroke="currentColor" stroke-width="1.2" opacity="0.45" stroke-dasharray="3,2"/>';
			var pts = [[10,72],[18,63],[24,54],[30,47],[36,40],[42,32],[48,24],[54,17],[58,11]];
			pts.forEach(function(p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.5" fill="currentColor"/>'; });
			return s;
		}

		function miniMarginal() {
			// Scatter (bottom-left) with marginal histograms: x-hist along the top, y-hist down the right.
			// All coordinates stay within the 66 x 86 tile (content kept inside x:4-62, y:4-82).
			var s = '';
			// Top histogram (distribution of x): bars sit on a baseline at y=22, growing upward.
			var topH = [7, 13, 18, 16, 10, 6];
			topH.forEach(function(h, i) {
				s += '<rect x="' + (6 + i * 7) + '" y="' + (22 - h) + '" width="6" height="' + h + '" fill="currentColor" opacity="0.6"/>';
			});
			// Main scatter (positive correlation): x in [8,44], y in [40,76].
			var pts = [[8,76],[12,70],[16,71],[18,64],[22,66],[24,58],[28,59],[30,52],[34,53],[36,46],[40,47],[44,40]];
			pts.forEach(function(p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2" fill="currentColor" opacity="0.85"/>'; });
			// Right histogram (distribution of y): bars start at x=50, growing rightward (max x = 61).
			var rightL = [5, 9, 11, 10, 7, 4];
			rightL.forEach(function(L, i) {
				s += '<rect x="50" y="' + (28 + i * 9) + '" width="' + L + '" height="8" fill="currentColor" opacity="0.6"/>';
			});
			// Divider lines separating each marginal from the scatter.
			s += '<line x1="4" y1="23" x2="47" y2="23" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>';
			s += '<line x1="49" y1="24" x2="49" y2="82" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>';
			return s;
		}

		function miniCorrelogram() {
			// 2x2 pairwise grid: diagonal = histogram, off-diagonal = scatter
			var s = '';
			// Cell layout: [x1, y1, x2, y2, isDiag]
			var cells = [
				[0, 0,  30, 39, true ],
				[33, 0,  63, 39, false],
				[0, 42, 30, 81, false],
				[33, 42, 63, 81, true ]
			];
			cells.forEach(function(cell) {
				var x1 = cell[0], y1 = cell[1], x2 = cell[2], y2 = cell[3], isDiag = cell[4];
				var w = x2 - x1, h = y2 - y1;
				s += '<rect x="' + x1 + '" y="' + y1 + '" width="' + w + '" height="' + h
					+ '" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.45"/>';
				if (isDiag) {
					// Small histogram bars inside cell
					var bhs = [5, 14, 22, 18, 10, 6];
					var bw = (w - 4) / bhs.length;
					bhs.forEach(function(bh, bi) {
						var bx = x1 + 2 + bi * bw;
						var scaledH = Math.round(bh / 22 * (h - 6));
						s += '<rect x="' + Math.round(bx) + '" y="' + (y2 - 2 - scaledH) + '" width="' + Math.max(1, Math.round(bw - 1)) + '" height="' + scaledH + '" fill="currentColor" opacity="0.75"/>';
					});
				} else {
					// Scatter dots inside cell
					var pts = (cell[0] === 0)
						? [[4,70],[8,63],[14,58],[20,52],[4,78],[12,74],[22,65],[26,48]]
						: [[36,6],[40,12],[46,8],[52,18],[56,14],[38,24],[44,30],[58,22]];
					pts.forEach(function(p) {
						s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2" fill="currentColor"/>';
					});
				}
			});
			return s;
		}

		var MINI_CHARTS = [miniEcdf, miniQq, miniMarginal, miniCorrelogram];
		var MINI_LABELS = ['ECDF', 'QQ Plot', 'Marginal', 'Correlogram'];`,
		codeBranchesJs: `if (currentModel === 'ecdf') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('x = ' + fn('randn') + '(300)', 'sample');
				c += blank();
				c += cline(fn('stephist') + '(x; normalize=:cdf,', 'step histogram normalised to cumulative probability');
				c += cline('    xlabel="Value", ylabel="Cumulative probability", label="ECDF", legend=:bottomright)', 'this is the empirical CDF');

			} else if (currentModel === 'qq') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Distributions') + ', ' + ty('Random'), 'plotting, distributions, RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('x = ' + fn('randn') + '(300)', 'sample to assess');
				c += blank();
				c += cline(fn('qqplot') + '(' + ty('Normal') + '(), x;', 'sample quantiles vs Normal theoretical quantiles');
				c += cline('    xlabel="Theoretical quantiles", ylabel="Sample quantiles", legend=false)', 'points on the line means a good fit');

			} else if (currentModel === 'marginal') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('x = ' + fn('randn') + '(500)', 'first variable');
				c += cline('y = 0.7 .* x .+ 0.7 .* ' + fn('randn') + '(500)', 'correlated second variable');
				c += blank();
				c += cline(fn('marginalhist') + '(x, y;', 'joint scatter with marginal histograms on the axes');
				c += cline('    xlabel="x", ylabel="y", legend=false)', 'centre shows the relationship, margins each distribution');

			} else {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('a = ' + fn('randn') + '(300)', 'variable a');
				c += cline('b = 0.8 .* a .+ ' + fn('randn') + '(300)', 'positively correlated with a');
				c += cline('d = -0.5 .* a .+ ' + fn('randn') + '(300)', 'negatively correlated with a');
				c += blank();
				c += cline(fn('corrplot') + '(' + fn('hcat') + '(a, b, d); label=["a" "b" "d"], grid=false)', 'pairwise scatter matrix with density diagonal');
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
				id: 'dcmp-theoretical-cdf',
				label: 'Theoretical CDF',
				desc: 'Overlay the fitted normal CDF on top of the ECDF',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Distributions') + ', ' + ty('Random'), 'plotting, distributions, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v  = ' + fn('randn') + '(300)', 'sample');
					c += cline('d  = ' + fn('fit') + '(' + ty('Normal') + ', v)', 'fit a normal to the data');
					c += cline('xs = ' + fn('range') + '(' + fn('extrema') + '(v)...; length=200)', 'evaluation grid');
					c += blank();
					c += cline(fn('stephist') + '(v; normalize=:cdf, label="ECDF", lw=1.5)', 'empirical CDF');
					c += cline(fn('plot!') + '(xs, ' + fn('cdf') + '.(d, xs); label="Normal CDF", lw=2, ls=:dash)', 'overlay theoretical CDF');
					return c;
				},
			},
			{
				id: 'dcmp-regression-line',
				label: 'Regression Line',
				desc: 'Add an OLS regression line to a marginal scatter plot',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random') + ', ' + ty('Statistics'), 'plotting, RNG, statistics');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('x = ' + fn('randn') + '(400)', 'predictor');
					c += cline('y = 0.7 .* x .+ 0.7 .* ' + fn('randn') + '(400)', 'response');
					c += blank();
					c += cline(fn('marginalhist') + '(x, y; legend=false)', 'joint scatter with marginals');
					c += cline('b1 = ' + fn('cov') + '(x, y) / ' + fn('var') + '(x)', 'OLS slope');
					c += cline('b0 = ' + fn('mean') + '(y) - b1 * ' + fn('mean') + '(x)', 'OLS intercept');
					c += cline(fn('plot!') + '(x, b0 .+ b1 .* x; label="OLS", lw=2, ls=:dash)', 'overlay regression line');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'dcmp-ks-test',
				label: 'KS Test',
				desc: 'Kolmogorov-Smirnov test of a sample against a Normal',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('HypothesisTests') + ', ' + ty('Distributions') + ', ' + ty('Random'), 'testing, distributions, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v = ' + fn('randn') + '(300)', 'sample');
					c += cline('d = ' + fn('fit') + '(' + ty('Normal') + ', v)', 'fit normal for the composite test');
					c += cline('t = ' + fn('ExactOneSampleKSTest') + '(v, d)', 'Kolmogorov-Smirnov test');
					c += cline(fn('println') + '("D = ", ' + fn('round') + '(t.delta; digits=4), "  p = ", ' + fn('pvalue') + '(t))', 'p < 0.05 rejects the fit');
					return c;
				},
			},
			{
				id: 'dcmp-sw-test',
				label: 'Shapiro-Wilk',
				desc: 'Shapiro-Wilk normality test with a QQ plot',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('HypothesisTests') + ', ' + ty('StatsPlots') + ', ' + ty('Random'), 'testing, plotting, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v = ' + fn('randn') + '(300)', 'sample');
					c += cline('t = ' + fn('ShapiroWilkTest') + '(v)', 'Shapiro-Wilk normality test');
					c += cline(fn('println') + '("W = ", ' + fn('round') + '(t.W; digits=4), "  p = ", ' + fn('pvalue') + '(t))', 'p < 0.05 suggests non-normality');
					c += blank();
					c += cline(fn('qqnorm') + '(v; title="Normal QQ", legend=false)', 'visual check alongside the test');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'dcmp-fit-dist',
				label: 'Fit Distribution',
				desc: 'Fit a parametric distribution and overlay its PDF',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Distributions') + ', ' + ty('Random'), 'plotting, distributions, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v  = ' + fn('rand') + '(' + ty('Gamma') + '(2.0, 1.5), 500)', 'right-skewed sample');
					c += cline('d  = ' + fn('fit') + '(' + ty('Gamma') + ', v)', 'fit Gamma; swap for Normal, LogNormal, etc.');
					c += cline('xs = ' + fn('range') + '(' + fn('extrema') + '(v)...; length=300)', 'evaluation grid');
					c += blank();
					c += cline(fn('histogram') + '(v; normalize=:pdf, label="Data", alpha=0.5)', 'density-normalised histogram');
					c += cline(fn('plot!') + '(xs, ' + fn('pdf') + '.(d, xs); label="Fitted PDF", lw=2.5)', 'overlay fitted density');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'dcmp-two-sample-ks',
				label: 'Two-Sample KS',
				desc: 'Kolmogorov-Smirnov test for equality of two distributions',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('HypothesisTests') + ', ' + ty('Random'), 'testing and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(300)', 'first sample');
					c += cline('b = 0.4 .+ ' + fn('randn') + '(300)', 'second sample, shifted');
					c += cline('t = ' + fn('ApproximateTwoSampleKSTest') + '(a, b)', 'two-sample KS test');
					c += cline(fn('println') + '("D = ", ' + fn('round') + '(t.delta; digits=4), "  p = ", ' + fn('pvalue') + '(t))', 'p < 0.05 rejects equal distributions');
					return c;
				},
			},
			{
				id: 'dcmp-grouped-ecdf',
				label: 'Grouped ECDF',
				desc: 'Overlay two ECDFs to compare distributions',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(300)', 'group A');
					c += cline('b = 1.0 .+ ' + fn('randn') + '(300)', 'group B, shifted');
					c += blank();
					c += cline(fn('stephist') + '(a; normalize=:cdf, label="A", lw=1.5)', 'ECDF of group A');
					c += cline(fn('stephist!') + '(b; normalize=:cdf, label="B", lw=1.5)', 'overlay ECDF of group B');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'dcmp-skew-kurt',
				label: 'Skewness and Kurtosis',
				desc: 'Shape statistics that describe departure from normality',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsBase') + ', ' + ty('Random'), 'statistics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v = ' + fn('rand') + '(' + ty('Gamma') + '(2.0, 1.5), 500)', 'right-skewed sample');
					c += blank();
					c += cline(fn('println') + '("skewness: ", ' + fn('round') + '(' + fn('skewness') + '(v); digits=4))', '0 = symmetric; positive = right tail');
					c += cline(fn('println') + '("kurtosis: ", ' + fn('round') + '(' + fn('kurtosis') + '(v); digits=4))', '0 = normal; positive = heavy tails');
					return c;
				},
			},
			{
				id: 'dcmp-quantile-table',
				label: 'Quantile Table',
				desc: 'Print the five-number summary and IQR',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('Random'), 'statistics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v  = ' + fn('randn') + '(500)', 'sample');
					c += cline('qs = ' + fn('quantile') + '(v, [0.0, 0.25, 0.5, 0.75, 1.0])', 'five-number summary');
					c += blank();
					c += cline(fn('println') + '("min: ", ' + fn('round') + '(qs[1]; digits=3), "  Q1: ", ' + fn('round') + '(qs[2]; digits=3))', 'minimum and first quartile');
					c += cline(fn('println') + '("median: ", ' + fn('round') + '(qs[3]; digits=3))', 'median');
					c += cline(fn('println') + '("Q3: ", ' + fn('round') + '(qs[4]; digits=3), "  max: ", ' + fn('round') + '(qs[5]; digits=3))', 'third quartile and maximum');
					c += cline(fn('println') + '("IQR: ", ' + fn('round') + '(qs[4] - qs[2]; digits=3))', 'interquartile range');
					return c;
				},
			},
		];`,
	});
}
