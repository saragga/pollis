/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getDcmpHtml(): string {
	return buildWebviewHtml({
		title: 'Distribution Comparison Plots',
		defaultModel: 'ecdf',
		modelsLiteral: `['ecdf', 'qq', 'marginal', 'correlogram']`,
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
