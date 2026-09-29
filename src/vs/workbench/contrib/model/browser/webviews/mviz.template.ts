/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getMvizHtml(): string {
	return buildWebviewHtml({
		title: 'Multivariate Plots',
		defaultModel: 'corner',
		modelsLiteral: `['corner', 'parallel', 'bubble', 'heatmap']`,
		chartW: 54,
		illusCollapsed: true,
		togglesJs: `			<button class="toggle-btn active" data-model="corner">Corner Plot</button>
			<button class="toggle-btn" data-model="parallel">Parallel Coordinates</button>
			<button class="toggle-btn" data-model="bubble">Bubble Chart</button>
			<button class="toggle-btn" data-model="heatmap">Heatmap</button>`,
		bullets: `				<li><strong>High-dimensional structure</strong> &#8212; survey many variables at once with <span class="plot-link" data-goto="corner">corner plots</span> and <span class="plot-link" data-goto="parallel">parallel coordinates</span></li>
				<li><strong>Extra encodings</strong> &#8212; pack a third and fourth variable into marker size and colour with <span class="plot-link" data-goto="bubble">bubble charts</span></li>
				<li><strong>Matrix views</strong> &#8212; render correlation and data matrices as colour grids with <span class="plot-link" data-goto="heatmap">heatmaps</span></li>
			`,
		decisionRows: `					<tr><td>Corner Plot</td><td>Multiple numeric</td><td>Explore all pairwise relationships and marginal distributions in one matrix view</td></tr>
					<tr><td>Parallel Coordinates</td><td>Multiple numeric</td><td>Detect clusters and high-dimensional patterns by tracing each observation as a polyline</td></tr>
					<tr><td>Bubble Chart</td><td>Numeric x, y, size</td><td>Encode a third quantitative dimension as marker size; add colour for a fourth</td></tr>
					<tr><td>Heatmap</td><td>Numeric matrix</td><td>Reveal structure and strength in a correlation or data matrix at a glance</td></tr>
				`,
		miniChartsJs: `function miniCorner() {
			// Lower-triangular pairwise matrix: diagonal = histogram, below-diagonal = scatter.
			var s = '';
			var xs = [4, 20, 36], ys = [8, 30, 52], cw = 14, ch = 18;
			for (var r = 0; r < 3; r++) {
				for (var col = 0; col <= r; col++) {
					var x = xs[col], y = ys[r];
					s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.4"/>';
					if (col === r) {
						var bh = [4, 9, 13, 8, 5], bw = (cw - 2) / bh.length;
						for (var k = 0; k < bh.length; k++) {
							var hh = Math.round(bh[k] / 13 * (ch - 4));
							s += '<rect x="' + Math.round(x + 1 + k * bw) + '" y="' + (y + ch - 1 - hh) + '" width="' + Math.max(1, Math.round(bw - 0.6)) + '" height="' + hh + '" fill="currentColor" opacity="0.75"/>';
						}
					} else {
						var sp = [[3,14],[6,11],[9,8],[5,15],[11,6],[8,12]];
						for (var p = 0; p < sp.length; p++) {
							s += '<circle cx="' + (x + sp[p][0]) + '" cy="' + (y + sp[p][1]) + '" r="1.3" fill="currentColor" opacity="0.85"/>';
						}
					}
				}
			}
			return s;
		}

		function miniParallel() {
			// Four vertical axes with one polyline per observation crossing them.
			var s = '';
			var axX = [8, 22, 36, 50], top = 10, bot = 70;
			axX.forEach(function(ax) {
				s += '<line x1="' + ax + '" y1="' + top + '" x2="' + ax + '" y2="' + bot + '" stroke="currentColor" stroke-width="0.7" opacity="0.45"/>';
			});
			var lines = [[0.2,0.6,0.3,0.8],[0.5,0.2,0.7,0.4],[0.8,0.5,0.4,0.2],[0.3,0.9,0.6,0.5],[0.6,0.3,0.9,0.7]];
			lines.forEach(function(ln) {
				var d = '';
				ln.forEach(function(f, i) { d += (i === 0 ? 'M ' : ' L ') + axX[i] + ' ' + Math.round(top + f * (bot - top)); });
				s += '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>';
			});
			return s;
		}

		function miniBubble() {
			// Scatter with area-encoded marker sizes (third variable) on x-y axes.
			var s = '<line x1="6" y1="6" x2="6" y2="74" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>'
				+ '<line x1="6" y1="74" x2="50" y2="74" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>';
			var bubbles = [[14,58,5],[24,40,8],[34,52,4],[40,28,10],[20,22,3],[44,60,6],[30,66,4]];
			bubbles.forEach(function(b) {
				s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="currentColor" opacity="0.45" stroke="currentColor" stroke-width="0.6"/>';
			});
			return s;
		}

		function miniHeatmap() {
			// 4 x 4 matrix of cells; opacity encodes magnitude (diagonal strongest).
			var s = '';
			var op = [[1.0,0.7,0.3,0.5],[0.7,1.0,0.6,0.2],[0.3,0.6,1.0,0.8],[0.5,0.2,0.8,1.0]];
			var cell = 11, ox = 5, oy = 9;
			for (var i = 0; i < 4; i++) {
				for (var j = 0; j < 4; j++) {
					s += '<rect x="' + (ox + j * cell) + '" y="' + (oy + i * cell) + '" width="' + (cell - 1) + '" height="' + (cell - 1) + '" fill="currentColor" opacity="' + op[i][j] + '"/>';
				}
			}
			return s;
		}

		var MINI_CHARTS = [miniCorner, miniParallel, miniBubble, miniHeatmap];
		var MINI_LABELS = ['Corner', 'Parallel', 'Bubble', 'Heatmap'];`,
		codeBranchesJs: `if (currentModel === 'corner') {
				c += cline(kw('using') + ' ' + ty('PairPlots') + ', ' + ty('CairoMakie') + ', ' + ty('Random'), 'corner plot, backend, RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('a = ' + fn('randn') + '(2000)', 'variable a');
				c += cline('b = 0.7 .* a .+ 0.7 .* ' + fn('randn') + '(2000)', 'correlated with a');
				c += cline('d = -0.4 .* a .+ 0.9 .* ' + fn('randn') + '(2000)', 'anti-correlated with a');
				c += blank();
				c += cline(fn('pairplot') + '((a=a, b=b, d=d))', 'pairwise scatter matrix with marginals on the diagonal');

			} else if (currentModel === 'parallel') {
				c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting, statistics, RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('X = ' + fn('hcat') + '(' + fn('randn') + '(60), ' + fn('randn') + '(60), ' + fn('randn') + '(60), ' + fn('randn') + '(60))', '60 observations x 4 variables');
				c += cline('Z = (X .- ' + fn('mean') + '(X; dims=1)) ./ ' + fn('std') + '(X; dims=1)', 'standardise each column');
				c += blank();
				c += cline(fn('plot') + '(1:4, ' + fn('transpose') + '(Z); legend=false, alpha=0.3,', 'one polyline per observation across the 4 axes');
				c += cline('    xlabel="Variable", ylabel="Standardised value")', 'standardise so no axis dominates');

			} else if (currentModel === 'bubble') {
				c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('x = ' + fn('randn') + '(60)', 'x position');
				c += cline('y = ' + fn('randn') + '(60)', 'y position');
				c += cline('sz = ' + fn('rand') + '(60) .* 100', 'third variable (size)');
				c += cline('radii = 12 .* ' + fn('sqrt') + '.(sz ./ ' + fn('maximum') + '(sz))', 'map value to AREA, not radius');
				c += blank();
				c += cline(fn('scatter') + '(x, y; markersize=radii, zcolor=(x .+ y),', 'colour encodes a fourth variable');
				c += cline('    c=:viridis, xlabel="x", ylabel="y", legend=false, colorbar=true)', 'four dimensions in one plane');

			} else {
				c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting, statistics, RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('a = ' + fn('randn') + '(300)', 'base variable');
				c += cline('X = ' + fn('hcat') + '(a, 0.8 .* a .+ ' + fn('randn') + '(300), -0.5 .* a .+ ' + fn('randn') + '(300), ' + fn('randn') + '(300))', '4 variables, mixed correlation');
				c += cline('R = ' + fn('cor') + '(X)', 'pairwise Pearson correlation matrix');
				c += blank();
				c += cline(fn('heatmap') + '(["v1" "v2" "v3" "v4"], ["v1" "v2" "v3" "v4"], R;', 'correlation heatmap');
				c += cline('    c=:RdBu, clims=(-1, 1), title="Correlation matrix")', 'diverging scale centred at zero');
			}`,
		actionsJs: `var VISUALISE_ACTIONS = [
			{
				id: 'mviz-corner-kde',
				label: 'Corner with 2D Density',
				desc: 'Corner plot using 2D density panels instead of scatter',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('PairPlots') + ', ' + ty('CairoMakie') + ', ' + ty('Random'), 'corner plot, backend, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(2000)', 'variable a');
					c += cline('b = 0.7 .* a .+ 0.7 .* ' + fn('randn') + '(2000)', 'correlated with a');
					c += blank();
					c += cline(fn('pairplot') + '((a=a, b=b), ' + ty('PairPlots') + '.' + fn('Contourf') + '())', '2D density contours instead of scatter');
					return c;
				},
			},
			{
				id: 'mviz-bubble-log',
				label: 'Log-Scale Bubble',
				desc: 'Apply a log scale to both axes for skewed data',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('x  = ' + fn('exp') + '.(' + fn('randn') + '(60))', 'positive, skewed x');
					c += cline('y  = ' + fn('exp') + '.(' + fn('randn') + '(60))', 'positive, skewed y');
					c += cline('sz = ' + fn('rand') + '(60) .* 100', 'size variable');
					c += cline('radii = 12 .* ' + fn('sqrt') + '.(sz ./ ' + fn('maximum') + '(sz))', 'area-proportional radii');
					c += blank();
					c += cline(fn('scatter') + '(x, y; markersize=radii, xscale=:log10, yscale=:log10,', 'log10 on both axes');
					c += cline('    xlabel="x", ylabel="y", legend=false)', 'tames skewed spread');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'mviz-condition-number',
				label: 'Condition Number',
				desc: 'Detect multicollinearity via the correlation matrix condition number',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('LinearAlgebra') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'linear algebra, statistics, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(300)', 'base variable');
					c += cline('X = ' + fn('hcat') + '(a, a .+ 0.01 .* ' + fn('randn') + '(300), ' + fn('randn') + '(300))', 'cols 1 and 2 nearly collinear');
					c += cline('vals  = ' + fn('eigvals') + '(' + fn('cor') + '(X))', 'eigenvalues of the correlation matrix');
					c += cline('kappa = ' + fn('maximum') + '(vals) / ' + fn('minimum') + '(vals)', 'condition number');
					c += cline(fn('println') + '("Condition number: ", ' + fn('round') + '(kappa; digits=2))', 'above 30 suggests multicollinearity');
					return c;
				},
			},
			{
				id: 'mviz-outlier-mahal',
				label: 'Mahalanobis Outliers',
				desc: 'Flag multivariate outliers using Mahalanobis distance',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('LinearAlgebra') + ', ' + ty('Random'), 'statistics, linear algebra, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('X      = ' + fn('randn') + '(200, 3)', '200 observations x 3 variables');
					c += cline('X[1, :] = [6.0, -6.0, 6.0]', 'plant one extreme observation');
					c += cline('Xc     = X .- ' + fn('mean') + '(X; dims=1)', 'mean-centre');
					c += cline('d2     = ' + fn('diag') + '(Xc * ' + fn('inv') + '(' + fn('cov') + '(X)) * ' + fn('transpose') + '(Xc))', 'squared Mahalanobis distances');
					c += cline(fn('println') + '("Top outlier indices: ", ' + fn('sortperm') + '(d2; rev=true)[1:5])', 'five most extreme observations');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'mviz-pca-biplot',
				label: 'PCA Projection',
				desc: 'Project observations onto the first two principal components',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('MultivariateStats') + ', ' + ty('Plots') + ', ' + ty('Random'), 'PCA, plotting, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(200)', 'latent factor');
					c += cline('X = ' + fn('permutedims') + '(' + fn('hcat') + '(a, 0.8 .* a .+ ' + fn('randn') + '(200), -0.6 .* a .+ ' + fn('randn') + '(200)))', 'p x n matrix (variables x observations)');
					c += cline('M    = ' + fn('fit') + '(' + ty('PCA') + ', X; maxoutdim=2)', 'fit PCA, keep 2 components');
					c += cline('proj = ' + fn('transform') + '(M, X)', '2 x n projection');
					c += blank();
					c += cline(fn('scatter') + '(proj[1, :], proj[2, :]; xlabel="PC1", ylabel="PC2", legend=false)', 'observations in principal-component space');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'mviz-grouped-parallel',
				label: 'Grouped Lines',
				desc: 'Colour parallel-coordinate lines by a categorical group',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting, statistics, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('g1 = ' + fn('hcat') + '(' + fn('randn') + '(40).+2, ' + fn('randn') + '(40), ' + fn('randn') + '(40).-1)', 'group 1 (shifted)');
					c += cline('g2 = ' + fn('hcat') + '(' + fn('randn') + '(40).-2, ' + fn('randn') + '(40).+1, ' + fn('randn') + '(40).+1)', 'group 2 (shifted)');
					c += cline('X  = ' + fn('vcat') + '(g1, g2)', 'stack observations');
					c += cline('Z  = (X .- ' + fn('mean') + '(X; dims=1)) ./ ' + fn('std') + '(X; dims=1)', 'standardise columns');
					c += cline('grp = ' + fn('vcat') + '(' + fn('fill') + '(1, 40), ' + fn('fill') + '(2, 40))', 'group index per row');
					c += blank();
					c += cline(fn('plot') + '(1:3, ' + fn('transpose') + '(Z); group=' + fn('repeat') + '(grp, inner=1), alpha=0.4,', 'colour lines by group');
					c += cline('    xlabel="Variable", ylabel="Standardised value", legend=:outertopright)', 'groups separate on axis 1');
					return c;
				},
			},
			{
				id: 'mviz-corr-heatmap',
				label: 'Annotated Heatmap',
				desc: 'Add correlation coefficients as text on the heatmap',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting, statistics, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(300)', 'base variable');
					c += cline('X = ' + fn('hcat') + '(a, 0.8 .* a .+ ' + fn('randn') + '(300), ' + fn('randn') + '(300))', '3 variables');
					c += cline('R = ' + fn('cor') + '(X)', 'correlation matrix');
					c += cline('names = ["v1" "v2" "v3"]', 'labels');
					c += cline(fn('heatmap') + '(names, names, R; c=:RdBu, clims=(-1, 1))', 'base heatmap');
					c += cline(kw('for') + ' i ' + kw('in') + ' 1:3, j ' + kw('in') + ' 1:3', 'annotate each cell');
					c += cline('    ' + fn('annotate!') + '(i, j, ' + fn('text') + '(' + fn('round') + '(R[j, i]; digits=2), 8))', 'coefficient as text');
					c += line(kw('end'));
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'mviz-pairwise-corr',
				label: 'Correlation Table',
				desc: 'Print the full pairwise Pearson correlation matrix',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('Random'), 'statistics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(300)', 'base variable');
					c += cline('X = ' + fn('hcat') + '(a, 0.8 .* a .+ ' + fn('randn') + '(300), -0.5 .* a .+ ' + fn('randn') + '(300))', '3 variables');
					c += cline('R = ' + fn('round') + '.(' + fn('cor') + '(X); digits=3)', 'Pearson correlation matrix');
					c += cline(fn('display') + '(R)', 'print the matrix');
					return c;
				},
			},
			{
				id: 'mviz-cov-matrix',
				label: 'Covariance Matrix',
				desc: 'Print the sample covariance matrix',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('Random'), 'statistics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(300)', 'base variable');
					c += cline('X = ' + fn('hcat') + '(a, 0.8 .* a .+ ' + fn('randn') + '(300), ' + fn('randn') + '(300))', '3 variables');
					c += cline('S = ' + fn('round') + '.(' + fn('cov') + '(X); digits=4)', 'sample covariance matrix');
					c += cline(fn('display') + '(S)', 'print the matrix');
					return c;
				},
			},
		];`,
	});
}
