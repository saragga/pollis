/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getTsvizHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Time Series Plots',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'tsplot',
		modelsLiteral: `['tsplot', 'ribbon', 'stacked', 'ohlc']`,
		chartW: 54,
		illusCollapsed: true,
		togglesJs: `			<button class="toggle-btn active" data-model="tsplot">Time Series Plot</button>
			<button class="toggle-btn" data-model="ribbon">Ribbon Plot</button>
			<button class="toggle-btn" data-model="stacked">Stacked Area</button>
			<button class="toggle-btn" data-model="ohlc">OHLC</button>`,
		bullets: `				<li><strong>Line plots</strong> &#8212; trace one or many series over an ordered time axis to expose trend, seasonality, and structural breaks</li>
				<li><strong>Uncertainty bands</strong> &#8212; pair a forecast or fitted estimate with a shaded confidence interval using <span class="plot-link" data-goto="ribbon">ribbons</span></li>
				<li><strong>Multi-series overlays</strong> &#8212; compare co-movement and lead-lag relationships across series on shared axes</li>
				<li><strong>Composition over time</strong> &#8212; show how non-negative components sum to a total with a <span class="plot-link" data-goto="stacked">stacked area chart</span></li>
				<li><strong>Financial bars</strong> &#8212; show per-period open, high, low, and close with an <span class="plot-link" data-goto="ohlc">OHLC chart</span></li>
			`,
		decisionRows: `					<tr><td>Time Series Plot</td><td>Ordered numeric</td><td>Visualise how a variable evolves over time; detect trends, cycles, and structural breaks</td></tr>
					<tr><td>Ribbon Plot</td><td>Ordered numeric + bounds</td><td>Show a central estimate alongside a confidence or forecast uncertainty band</td></tr>
					<tr><td>Stacked Area</td><td>Ordered numeric components</td><td>Show how several non-negative series compose a total over time</td></tr>
					<tr><td>OHLC</td><td>Open, high, low, close</td><td>Show per-period price range, open, and close for a financial time series</td></tr>
				`,
		miniChartsJs: `function miniTsplot() {
			// Single series traced over an ordered time axis.
			var s = '<line x1="5" y1="6" x2="5" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
				+ '<line x1="5" y1="72" x2="50" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			var ys = [50, 40, 46, 30, 36, 22, 28, 16];
			var x0 = 8, step = (48 - 8) / (ys.length - 1);
			var d = '';
			ys.forEach(function(v, i) { d += (i === 0 ? 'M ' : ' L ') + Math.round(x0 + i * step) + ' ' + v; });
			s += '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.5"/>';
			return s;
		}

		function miniRibbon() {
			// Central estimate with a shaded uncertainty band.
			var s = '<line x1="5" y1="6" x2="5" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
				+ '<line x1="5" y1="72" x2="50" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			var mid = [48, 42, 38, 30, 26, 20], x0 = 9, step = (47 - 9) / (mid.length - 1), band = 7;
			var pts = mid.map(function(v, i) { return [Math.round(x0 + i * step), v]; });
			var top = 'M ' + pts.map(function(p) { return p[0] + ' ' + (p[1] - band); }).join(' L ');
			var bot = ' L ' + pts.slice().reverse().map(function(p) { return p[0] + ' ' + (p[1] + band); }).join(' L ') + ' Z';
			s += '<path d="' + top + bot + '" fill="currentColor" opacity="0.2" stroke="none"/>';
			var dl = '';
			pts.forEach(function(p, i) { dl += (i === 0 ? 'M ' : ' L ') + p[0] + ' ' + p[1]; });
			s += '<path d="' + dl + '" fill="none" stroke="currentColor" stroke-width="1.5"/>';
			return s;
		}

		function miniStacked() {
			// Non-negative components summed into a total over time.
			var s = '<line x1="5" y1="6" x2="5" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
				+ '<line x1="5" y1="72" x2="50" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			var base = 72, x0 = 8, x1 = 48, n = 6;
			var layers = [[10, 14, 12, 16, 13, 18], [8, 10, 14, 11, 16, 12], [6, 7, 9, 8, 10, 9]];
			var xs = [];
			for (var i = 0; i < n; i++) { xs.push(Math.round(x0 + i * (x1 - x0) / (n - 1))); }
			var cum = xs.map(function() { return base; });
			layers.forEach(function(layer, li) {
				var topEdge = xs.map(function(x, i) { return [x, cum[i] - layer[i]]; });
				var d = 'M ' + topEdge.map(function(p) { return p[0] + ' ' + p[1]; }).join(' L ');
				d += ' L ' + xs.slice().reverse().map(function(x, i) { return x + ' ' + cum[n - 1 - i]; }).join(' L ') + ' Z';
				s += '<path d="' + d + '" fill="currentColor" opacity="' + (0.55 - li * 0.15) + '" stroke="currentColor" stroke-width="0.5"/>';
				for (var i2 = 0; i2 < n; i2++) { cum[i2] = topEdge[i2][1]; }
			});
			return s;
		}

		function miniOhlc() {
			// Per-period open-high-low-close bars (open tick left, close tick right).
			var s = '<line x1="5" y1="6" x2="5" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
				+ '<line x1="5" y1="72" x2="50" y2="72" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			var bars = [[12, 20, 50, 44, 28], [21, 16, 46, 30, 40], [30, 24, 54, 50, 34], [39, 14, 40, 36, 22]];
			bars.forEach(function(b) {
				var x = b[0], hi = b[1], lo = b[2], op = b[3], cl = b[4];
				s += '<line x1="' + x + '" y1="' + hi + '" x2="' + x + '" y2="' + lo + '" stroke="currentColor" stroke-width="1.2"/>';
				s += '<line x1="' + (x - 4) + '" y1="' + op + '" x2="' + x + '" y2="' + op + '" stroke="currentColor" stroke-width="1.2"/>';
				s += '<line x1="' + x + '" y1="' + cl + '" x2="' + (x + 4) + '" y2="' + cl + '" stroke="currentColor" stroke-width="1.2"/>';
			});
			return s;
		}

		var MINI_CHARTS = [miniTsplot, miniRibbon, miniStacked, miniOhlc];
		var MINI_LABELS = ['Series', 'Ribbon', 'Stacked', 'OHLC'];`,
		codeBranchesJs: `if (currentModel === 'tsplot') {
				c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'time series plotting');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'fix seed for reproducibility');
				c += cline('n = 200', 'number of observations');
				c += cline('t = 1:n', 'time index');
				c += cline('y = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'simulated random walk');
				c += blank();
				c += cline(fn('plot') + '(t, y;', 'line plot over time');
				c += line('    xlabel="Time", ylabel="Value",');
				c += cline('    label="Random walk", lw=1.5, title="Time Series Plot")', 'title and line style');

			} else if (currentModel === 'ribbon') {
				c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'ribbon plot with uncertainty band');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'fix seed for reproducibility');
				c += cline('n    = 100', 'number of observations');
				c += cline('t    = 1:n', 'time index');
				c += cline('y    = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'central signal (e.g. a forecast)');
				c += cline('band = ' + fn('fill') + '(1.5, n)', 'constant half-width of the uncertainty band');
				c += blank();
				c += cline(fn('plot') + '(t, y;', 'ribbon wraps the central line symmetrically');
				c += line('    ribbon=band, fillalpha=0.3, lw=2,');
				c += line('    xlabel="Time", ylabel="Value",');
				c += cline('    label="Signal", title="Ribbon Plot")', 'band represents a 1.5-unit forecast interval');

			} else if (currentModel === 'stacked') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'stacked area chart');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'fix seed for reproducibility');
				c += cline('n = 40', 'number of periods');
				c += cline('t = 1:n', 'time index');
				c += cline('Y = ' + fn('ones') + '(n, 3) .+ ' + fn('cumsum') + '(' + fn('rand') + '(n, 3) .* 0.6; dims=1)', 'three non-negative component series');
				c += blank();
				c += cline(fn('areaplot') + '(t, Y;', 'areaplot stacks the columns by default');
				c += line('    fillalpha=0.6, lw=1,');
				c += line('    xlabel="Time", ylabel="Value",');
				c += cline('    label=["A" "B" "C"], title="Stacked Area")', 'each band is one component; the top is the total');

			} else {
				c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'OHLC chart (built into Plots)');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'fix seed for reproducibility');
				c += cline('n = 30', 'number of trading days');
				c += cline('close = 100 .+ ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'closing price as a random walk');
				c += cline('open  = close .+ 0.5 .* ' + fn('randn') + '(n)', 'open near the previous close');
				c += cline('high  = ' + fn('max') + '.(open, close) .+ ' + fn('rand') + '(n)', 'high sits above the bar');
				c += cline('low   = ' + fn('min') + '.(open, close) .- ' + fn('rand') + '(n)', 'low sits below the bar');
				c += blank();
				c += cline('bars = ' + ty('OHLC') + '[(open[i], high[i], low[i], close[i]) ' + kw('for') + ' i ' + kw('in') + ' 1:n]', 'one OHLC value per day (open, high, low, close)');
				c += cline(fn('ohlc') + '(bars;', 'low-high bar; left tick = open, right tick = close');
				c += line('    xlabel="Day", ylabel="Price", legend=false, title="OHLC Chart")');
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
				id: 'tsviz-fan-chart',
				label: 'Fan Chart',
				desc: 'Forecast with nested confidence bands that fan out with the horizon',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n = 40', 'observed history length');
					c += cline('t = 1:n', 'time index');
					c += cline('y = ' + fn('cumsum') + '(' + fn('randn') + '(n)) .+ 50', 'observed series');
					c += blank();
					c += cline('h      = 20', 'forecast horizon');
					c += cline('ft     = n:(n + h)', 'forecast index (starts at the last observation)');
					c += cline('center = y[end] .+ ' + fn('cumsum') + '([0.0; 0.15 .* ' + fn('randn') + '(h)])', 'central forecast path');
					c += cline('spread = ' + fn('sqrt') + '.(0:h)', 'uncertainty grows with the square root of the horizon');
					c += blank();
					c += cline(fn('plot') + '(t, y; color=:black, lw=2.5, label="Observed",', 'observed history');
					c += line('    xlabel="Time", ylabel="Value", legend=:topleft)');
					c += blank();
					c += cline(kw('for') + ' lev ' + kw('in') + ' 0.15:0.15:1.0', 'nested bands build up the fan');
					c += cline('    ' + fn('plot!') + '(ft, center; ribbon = lev .* spread,', 'wider band = higher confidence level');
					c += cline('        fillcolor=:firebrick, fillalpha=0.12, linewidth=0, label="")', 'overlapping alpha darkens the centre');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('plot!') + '(ft, center; color=:firebrick, lw=2.5, label="Forecast")', 'central forecast line on top');
					return c;
				},
			},
			{
				id: 'tsviz-multi-series',
				label: 'Multiple Series',
				desc: 'Overlay several simulated time series on one set of axes',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n  = 200', 'series length');
					c += cline('t  = 1:n', 'time index');
					c += cline('y1 = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'first random walk');
					c += cline('y2 = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'second random walk');
					c += cline('y3 = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'third random walk');
					c += blank();
					c += cline(fn('plot') + '(t, [y1 y2 y3];', 'matrix columns = separate series');
					c += line('    label=["Series 1" "Series 2" "Series 3"],');
					c += cline('    xlabel="Time", ylabel="Value", lw=1.5)', 'row-vector of labels');
					return c;
				},
			},
			{
				id: 'tsviz-dual-axis',
				label: 'Dual-Axis Overlay',
				desc: 'Plot two series on their own left and right Y axes (use with care)',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n  = 200', 'series length');
					c += cline('t  = 1:n', 'time index');
					c += cline('a  = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'series on its own scale');
					c += cline('b  = 1000 .+ 50 .* ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'much larger magnitude');
					c += blank();
					c += cline(fn('plot') + '(t, a; label="A (left)", ylabel="Series A", legend=:topleft, lw=2)', 'left axis');
					c += cline(fn('plot!') + '(' + fn('twinx') + '(), t, b; label="B (right)", ylabel="Series B",', 'twinx() adds a right axis');
					c += cline('    legend=:topright, color=:red, lw=2, linestyle=:dash)', 'crossings depend on axis scaling, so read with care');
					return c;
				},
			},
			{
				id: 'tsviz-area-chart',
				label: 'Filled Area',
				desc: 'Shade the area under a time series curve',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n = 200', 'series length');
					c += cline('t = 1:n', 'time index');
					c += cline('y = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'random walk');
					c += blank();
					c += cline(fn('plot') + '(t, y; fillrange=0, fillalpha=0.3, lw=1.5,', 'fill between y and y=0');
					c += cline('    label="Area", xlabel="Time", ylabel="Value")', 'shaded area chart');
					return c;
				},
			},
			{
				id: 'tsviz-recession-bands',
				label: 'Event Bands',
				desc: 'Shade particular event periods as vertical bands behind the series',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n          = 400', 'series length (e.g. 400 months)');
					c += cline('t          = 1:n', 'time index');
					c += cline('spread     = ' + fn('cumsum') + '(' + fn('randn') + '(n) .* 0.3) .- 0.004 .* t .+ 2.0', 'simulated yield spread');
					c += blank();
					c += cline('recessions = [(40, 80), (180, 220), (300, 360)]', 'list of (start, end) index pairs');
					c += blank();
					c += cline(fn('plot') + '(t, spread; color=:teal, lw=1.5,', 'base time series');
					c += line('    xlabel="Time", ylabel="Percentage points",');
					c += line('    label="10Y - 3M spread", legend=:topright)');
					c += blank();
					c += cline(kw('for') + ' (s, e) ' + kw('in') + ' recessions', 'shade each recession window');
					c += cline('    ' + fn('vspan!') + '([s, e]; fillcolor=:steelblue, fillalpha=0.45, linewidth=0, label="")', 'vspan! draws a vertical shaded rectangle');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('hline!') + '([0]; color=:red, lw=1, linestyle=:solid, label="Zero")', 'zero line highlights inversions');
					c += blank();
					c += cline('# For real NBER recession dates, pull USREC from FRED:', 'FredData.jl usage below');
					c += line('# ' + kw('using') + ' ' + ty('FredData'));
					c += line('# f   = ' + fn('Fred') + '()                    # requires FRED_API_KEY env variable');
					c += line('# rec = ' + fn('get_data') + '(f, "USREC").data  # monthly 0/1 indicator back to 1854');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'tsviz-rolling-stats',
				label: 'Rolling Statistics',
				desc: 'Overlay a rolling mean and rolling standard deviation band',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting and statistics');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n = 200', 'series length');
					c += cline('t = 1:n', 'time index');
					c += cline('y = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'random walk');
					c += cline('k = 20', 'rolling window size');
					c += blank();
					c += cline('rmean = [' + fn('mean') + '(y[' + fn('max') + '(1,i-k+1):i]) ' + kw('for') + ' i ' + kw('in') + ' 1:n]', 'rolling mean');
					c += cline('rstd  = [' + fn('std') + '(y[' + fn('max') + '(1,i-k+1):i])  ' + kw('for') + ' i ' + kw('in') + ' 1:n]', 'rolling std (starts stable after k observations)');
					c += blank();
					c += cline(fn('plot') + '(t, y; label="Series", lw=1, alpha=0.5)', 'raw series');
					c += cline(fn('plot!') + '(t, rmean; label="Rolling mean (k=20)", lw=2)', 'overlay rolling mean');
					c += cline(fn('plot!') + '(t, rmean .+ rstd; lw=1, ls=:dash, label="Mean +/- Std")', 'upper band');
					c += cline(fn('plot!') + '(t, rmean .- rstd; lw=1, ls=:dash, label="")', 'lower band');
					return c;
				},
			},
			{
				id: 'tsviz-adf-test',
				label: 'ADF Test',
				desc: 'Augmented Dickey-Fuller test for a unit root (stationarity)',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('HypothesisTests') + ', ' + ty('Random'), 'hypothesis testing');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n = 150', 'series length');
					c += cline('y = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'unit-root process (non-stationary by construction)');
					c += blank();
					c += cline('t = ' + fn('ADFTest') + '(y, :constant, 4)', 'ADF test: constant trend, 4 lagged differences');
					c += cline(fn('println') + '("ADF statistic: ", ' + fn('round') + '(t.stat; digits=4))', 'more negative = stronger evidence against unit root');
					c += cline(fn('println') + '("p-value:       ", ' + fn('round') + '(' + fn('pvalue') + '(t); digits=4))', 'p < 0.05 rejects the unit root (series is stationary)');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'tsviz-ema',
				label: 'Exponential Smoothing',
				desc: 'Apply simple exponential smoothing and extend as a flat forecast',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n     = 100', 'series length');
					c += cline('t     = 1:n', 'time index');
					c += cline('y     = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'simulated series');
					c += cline('alpha = 0.2', 'smoothing parameter: 0 = heavy smoothing, 1 = no smoothing');
					c += blank();
					c += cline('ema    = ' + fn('similar') + '(y)', 'pre-allocate output');
					c += cline('ema[1] = y[1]', 'initialise with first observation');
					c += line(kw('for') + ' i ' + kw('in') + ' 2:n');
					c += cline('    ema[i] = alpha * y[i] + (1 - alpha) * ema[i-1]', 'exponentially weighted average');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('plot') + '(t, y;    label="Series",            lw=1, alpha=0.5)', 'raw series');
					c += cline(fn('plot!') + '(t, ema; label="EMA (alpha=0.2)", lw=2)', 'smoothed overlay');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'tsviz-first-diff',
				label: 'First Difference',
				desc: 'Remove a stochastic trend by taking the first difference',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n  = 200', 'series length');
					c += cline('t  = 1:n', 'time index');
					c += cline('y  = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'non-stationary random walk');
					c += cline('dy = ' + fn('diff') + '(y)', 'first difference: removes unit root, gives stationary series');
					c += blank();
					c += cline('p1 = ' + fn('plot') + '(t, y;    xlabel="Time", title="Original",    lw=1.5, legend=false)', 'original series');
					c += cline('p2 = ' + fn('plot') + '(2:n, dy; xlabel="Time", title="Differenced", lw=1.5, legend=false)', 'differenced series (length n-1)');
					c += cline(fn('plot') + '(p1, p2; layout=(1, 2), size=(800, 300))', 'side-by-side comparison');
					return c;
				},
			},
			{
				id: 'tsviz-two-ribbon',
				label: 'Two Ribbons',
				desc: 'Compare two series with asymmetric uncertainty bands',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n  = 100', 'series length');
					c += cline('t  = 1:n', 'time index');
					c += cline('y1 = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'first forecast');
					c += cline('y2 = ' + fn('cumsum') + '(' + fn('randn') + '(n)) .* 0.8', 'second forecast (lower variance)');
					c += blank();
					c += cline(fn('plot') + '(t, y1; ribbon=1.5, fillalpha=0.25, lw=2, label="Forecast A")', 'first ribbon');
					c += cline(fn('plot!') + '(t, y2; ribbon=1.0, fillalpha=0.25, lw=2, label="Forecast B")', 'second ribbon, narrower band');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'tsviz-summary-stats',
				label: 'Summary Statistics',
				desc: 'Print mean, std, min, max, and range for the simulated series',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('Random'), 'statistics');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n = 200', 'series length');
					c += cline('y = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'simulated series');
					c += blank();
					c += cline(fn('println') + '("n:     ", ' + fn('length') + '(y))', 'sample size');
					c += cline(fn('println') + '("mean:  ", ' + fn('round') + '(' + fn('mean') + '(y);    digits=4))', 'arithmetic mean');
					c += cline(fn('println') + '("std:   ", ' + fn('round') + '(' + fn('std') + '(y);     digits=4))', 'sample standard deviation');
					c += cline(fn('println') + '("min:   ", ' + fn('round') + '(' + fn('minimum') + '(y); digits=4))', 'minimum value');
					c += cline(fn('println') + '("max:   ", ' + fn('round') + '(' + fn('maximum') + '(y); digits=4))', 'maximum value');
					c += cline(fn('println') + '("range: ", ' + fn('round') + '(' + fn('maximum') + '(y) - ' + fn('minimum') + '(y); digits=4))', 'peak-to-trough range');
					return c;
				},
			},
			{
				id: 'tsviz-periodogram',
				label: 'Periodogram',
				desc: 'Estimate the power spectral density via the discrete Fourier transform',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('FFTW') + ', ' + ty('Random'), 'plotting and FFT');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('n    = 200', 'series length');
					c += cline('y    = ' + fn('cumsum') + '(' + fn('randn') + '(n))', 'simulated series');
					c += blank();
					c += cline('freq  = (0:' + fn('div') + '(n, 2)) ./ n', 'normalised frequencies in [0, 0.5]');
					c += cline('power = ' + fn('abs2') + '.(' + fn('fft') + '(y)[1:' + fn('div') + '(n, 2)+1]) ./ n', 'one-sided power spectrum');
					c += blank();
					c += cline(fn('plot') + '(freq[2:end], power[2:end];', 'skip DC component at frequency 0');
					c += line('    xlabel="Frequency", ylabel="Power",');
					c += cline('    title="Periodogram", legend=false, lw=1)', 'peaks reveal dominant periodicities');
					return c;
				},
			},
		];`,
	});
}
