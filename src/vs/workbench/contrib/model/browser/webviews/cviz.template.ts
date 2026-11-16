/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getCvizHtml(): string {
	return buildWebviewHtml({
		title: 'Core Statistical Plots',
		defaultModel: 'scatter',
		modelsLiteral: `['scatter', 'regression', 'bar', 'histogram', 'box', 'violin', 'pie', 'line']`,
		hiddenRowCss: '.bar-row, .histogram-row, .box-row, .violin-row { display: none; }',
		togglesJs: `			<button class="toggle-btn active" data-model="scatter">Scatter</button>
			<button class="toggle-btn" data-model="regression">Regression</button>
			<button class="toggle-btn" data-model="bar">Bar Chart</button>
			<button class="toggle-btn" data-model="histogram">Histogram</button>
			<button class="toggle-btn" data-model="box">Box Plot</button>
			<button class="toggle-btn" data-model="violin">Violin Plot</button>
			<button class="toggle-btn" data-model="pie">Pie Chart</button>
			<button class="toggle-btn" data-model="line">Line Plot</button>`,
		bullets: `				<li><strong>Distributions</strong> &#8212; inspect shape, spread, and modality with <span class="plot-link" data-goto="histogram">histograms</span>, <span class="plot-link" data-goto="box">box plots</span>, and <span class="plot-link" data-goto="violin">violin plots</span></li>
				<li><strong>Relationships</strong> &#8212; reveal correlation and trend between two variables with <span class="plot-link" data-goto="scatter">scatter plots</span>, a fitted <span class="plot-link" data-goto="regression">regression curve</span>, and a <span class="plot-link" data-goto="line">line plot</span></li>
				<li><strong>Group comparison</strong> &#8212; contrast categories with <span class="plot-link" data-goto="bar">bar charts</span> and side-by-side <span class="plot-link" data-goto="box">box</span> and <span class="plot-link" data-goto="violin">violin plots</span></li>
				<li><strong>Part-to-whole</strong> &#8212; show how a few categories sum to a whole with a <span class="plot-link" data-goto="pie">pie chart</span></li>
			`,
		decisionRows: `					<tr><td>Scatter</td><td>Numeric x, y</td><td>Explore correlation or trend between two continuous variables</td></tr>
		<tr><td>Regression</td><td>Numeric x, y</td><td>Overlay a fitted trend curve (e.g. a polynomial) on a scatter to summarise the relationship</td></tr>
					<tr><td>Bar Chart</td><td>Categorical x</td><td>Compare a single value across discrete categories</td></tr>
					<tr><td>Histogram</td><td>Single numeric</td><td>Understand the frequency distribution of one continuous variable</td></tr>
					<tr><td>Box Plot</td><td>Numeric by group</td><td>Compare medians, spread, and outliers across groups at a glance</td></tr>
					<tr><td>Violin Plot</td><td>Numeric by group</td><td>Show full distribution shape per group; richer than Box Plot when shape matters</td></tr>
					<tr><td>Pie Chart</td><td>Categorical parts</td><td>Show how a handful of categories make up a whole; use sparingly and only for few slices</td></tr>
					<tr><td>Line Plot</td><td>Ordered x, y</td><td>Connect points in order to show a trend, time path, or a fitted curve / regression line</td></tr>
				`,
		codeBranchesJs: `if (currentModel === 'scatter') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('n = 200', 'number of points');
				c += cline('x = ' + fn('randn') + '(n)', 'predictor');
				c += cline('y = 2 .* x .+ ' + fn('randn') + '(n)', 'response with noise');
				c += blank();
				c += cline(fn('scatter') + '(x, y;', 'each point is one observation');
				c += cline('    xlabel="x", ylabel="y", label="Observations", alpha=0.6)', 'semi-transparent markers');

			} else if (currentModel === 'regression') {
				c += cline(kw('using') + ' ' + ty('Random') + ', ' + ty('Polynomials') + ', ' + ty('Plots'), 'fitting and plotting');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(123)', 'reproducible');
				c += cline('n = 100', 'number of points');
				c += cline('x = ' + fn('sort') + '(10 .* ' + fn('rand') + '(n))', 'predictor, sorted for a clean curve');
				c += cline('y = 1 .+ 2 .* x .- 0.5 .* x.^2 .+ 0.05 .* x.^3 .+ 5 .* ' + fn('randn') + '(n)', 'true cubic relationship plus noise');
				c += blank();
				c += cline('p = ' + fn('fit') + '(x, y, 3)', 'fit a cubic polynomial');
				c += cline('xfit = ' + fn('range') + '(' + fn('minimum') + '(x), ' + fn('maximum') + '(x), length=500)', 'smooth grid for the fitted curve');
				c += cline('yfit = p.(xfit)', 'evaluate the fit on the grid');
				c += blank();
				c += cline(fn('scatter') + '(x, y; label="Data", xlabel="x", ylabel="y", legend=:topleft)', 'raw observations');
				c += cline(fn('plot!') + '(xfit, yfit; linewidth=3, label="Cubic fit")', 'overlay the fitted curve');

			} else if (currentModel === 'bar') {
				c += cline(kw('using') + ' ' + ty('StatsPlots'), 'statistical plotting');
				c += blank();
				c += cline('categories = ["A", "B", "C", "D", "E"]', 'category labels');
				c += cline('values     = [23, 41, 18, 35, 29]', 'one value per category');
				c += blank();
				c += cline(fn('bar') + '(categories, values;', 'one bar per category');
				c += cline('    xlabel="Category", ylabel="Value", legend=false)', 'anchor axis at zero');

			} else if (currentModel === 'histogram') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('x = ' + fn('randn') + '(1000)', 'sample to bin');
				c += blank();
				c += cline(fn('histogram') + '(x;', 'one bar per bin');
				c += cline('    bins=30, normalize=:pdf, label="Histogram",', 'normalise so a density overlays cleanly');
				c += line('    xlabel="Value", ylabel="Density")');
				c += cline(fn('density!') + '(x; lw=2, label="KDE")', 'smooth density overlay');

			} else if (currentModel === 'box') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('groups = ' + fn('repeat') + '(["A", "B", "C"], inner=100)', 'group labels');
				c += cline('values = [' + fn('randn') + '(100); 1.5 .+ ' + fn('randn') + '(100); -1 .+ 0.5 .* ' + fn('randn') + '(100)]', 'three groups, different location and spread');
				c += blank();
				c += cline(fn('boxplot') + '(groups, values;', 'one box per group');
				c += cline('    xlabel="Group", ylabel="Value", legend=false, outliers=true)', 'show outliers as points');

			} else if (currentModel === 'line') {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting, statistics, RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('x = ' + fn('sort') + '(' + fn('randn') + '(80))', 'predictor, sorted so the line is clean');
				c += cline('y = 2 .* x .+ 1 .+ ' + fn('randn') + '(80)', 'linear signal plus noise');
				c += blank();
				c += cline('b1 = ' + fn('cov') + '(x, y) / ' + fn('var') + '(x)', 'OLS slope');
				c += cline('b0 = ' + fn('mean') + '(y) - b1 * ' + fn('mean') + '(x)', 'OLS intercept');
				c += blank();
				c += cline(fn('scatter') + '(x, y; label="Observations", alpha=0.5)', 'raw data');
				c += cline(fn('plot!') + '(x, b0 .+ b1 .* x; label="Fitted line", lw=2)', 'connect the fitted values with a line');

			} else if (currentModel === 'pie') {
				c += cline(kw('using') + ' ' + ty('StatsPlots'), 'statistical plotting');
				c += blank();
				c += cline('labels = ["Yellow", "Orange", "Red", "Blue", "Purple", "Green"]', 'one label per slice');
				c += cline('data   = [36, 12, 68, 5, 42, 27]', 'one value per slice');
				c += cline('colors = [:yellow, :orange, :red, :blue, :purple, :green]', 'slice colours');
				c += blank();
				c += cline(fn('pie') + '(labels, data;', 'slice angles proportional to the values');
				c += cline('    color=colors, linecolor=:white, linewidth=3,', 'white gaps between slices');
				c += cline('    aspect_ratio=:equal, legend=:outerright)', 'keep the slices circular');

			} else {
				c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
				c += cline('groups = ' + fn('repeat') + '(["A", "B", "C"], inner=100)', 'group labels');
				c += cline('values = [' + fn('randn') + '(100); 1.5 .+ ' + fn('randn') + '(100); -1 .+ 0.5 .* ' + fn('randn') + '(100)]', 'three groups, different location and spread');
				c += blank();
				c += cline(fn('violin') + '(groups, values; xlabel="Group", ylabel="Value", legend=false)', 'full distribution shape per group');
				c += cline(fn('boxplot!') + '(groups, values; fillalpha=0.0, lw=2, legend=false)', 'overlay a slim box inside each violin');
			}`,
		actionsJs: `var VISUALISE_ACTIONS = [
			{
				id: 'cviz-overlay-density',
				label: 'Density Overlay',
				desc: 'Add a smooth KDE curve on top of a histogram',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('x = ' + fn('randn') + '(1000)', 'sample');
					c += blank();
					c += cline(fn('histogram') + '(x; normalize=:pdf, label="Histogram")', 'normalise to PDF so the density overlays correctly');
					c += cline(fn('density!') + '(x; label="KDE", lw=2)', 'overlay kernel density estimate');
					return c;
				},
			},
			{
				id: 'cviz-trend-line',
				label: 'Trend Line',
				desc: 'Add a least-squares regression line to a scatter plot',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('x = ' + fn('randn') + '(200)', 'predictor');
					c += cline('y = 2 .* x .+ ' + fn('randn') + '(200)', 'response with noise');
					c += blank();
					c += cline(fn('scatter') + '(x, y; label="Data", alpha=0.5)', 'scatter plot');
					c += cline('b1 = (' + fn('cov') + '(x, y) / ' + fn('var') + '(x))', 'OLS slope');
					c += cline('b0 = ' + fn('mean') + '(y) - b1 * ' + fn('mean') + '(x)', 'OLS intercept');
					c += cline(fn('plot!') + '(x, b0 .+ b1 .* x; label="OLS trend", lw=2)', 'overlay regression line');
					return c;
				},
			},
			{
				id: 'cviz-group-scatter',
				label: 'Grouped Scatter',
				desc: 'Colour scatter points by a categorical group',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('x     = ' + fn('randn') + '(200)', 'predictor');
					c += cline('y     = x .+ ' + fn('randn') + '(200)', 'response');
					c += cline('group = ' + fn('rand') + '(["A", "B"], 200)', 'categorical group');
					c += blank();
					c += cline(fn('scatter') + '(x, y; group=group,', 'one colour per group level');
					c += cline('    xlabel="x", ylabel="y", legend=:outertopright)', 'legend outside the axes');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'cviz-outlier-check',
				label: 'Outlier Check',
				desc: 'Flag points more than 1.5 IQR beyond the box plot fences',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('Random'), 'statistics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v      = [' + fn('randn') + '(200); 8.0; -7.0]', 'sample with two planted outliers');
					c += cline('q1, q3 = ' + fn('quantile') + '(v, [0.25, 0.75])', 'first and third quartiles');
					c += cline('iqr    = q3 - q1', 'interquartile range');
					c += cline('lo, hi = q1 - 1.5iqr, q3 + 1.5iqr', 'Tukey fences');
					c += cline('out    = v[(v .< lo) .| (v .> hi)]', 'values beyond the fences');
					c += cline(fn('println') + '("Outliers: ", out)', 'report outlier values');
					return c;
				},
			},
			{
				id: 'cviz-normality',
				label: 'Normality Check',
				desc: 'Shapiro-Wilk test and QQ plot to assess normality',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('HypothesisTests') + ', ' + ty('StatsPlots') + ', ' + ty('Random'), 'testing, plotting, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v    = ' + fn('randn') + '(300)', 'sample to test');
					c += cline('test = ' + fn('ShapiroWilkTest') + '(v)', 'Shapiro-Wilk normality test');
					c += cline(fn('println') + '("W=", ' + fn('round') + '(test.W; digits=4), "  p=", ' + fn('pvalue') + '(test))', 'p < 0.05 suggests non-normality');
					c += blank();
					c += cline(fn('qqnorm') + '(v; label="QQ", title="Normal QQ")', 'QQ plot against the normal');
					c += cline(fn('qqline!') + '(v; label="Reference")', 'reference line through Q1 and Q3');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'cviz-smooth',
				label: 'Smoothed Curve',
				desc: 'Add a LOESS smooth to a scatter plot',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Loess') + ', ' + ty('Random'), 'plotting, smoothing, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('x = ' + fn('sort') + '(' + fn('rand') + '(200) .* 10)', 'predictor on [0, 10]');
					c += cline('y = ' + fn('sin') + '.(x) .+ 0.3 .* ' + fn('randn') + '(200)', 'nonlinear signal with noise');
					c += blank();
					c += cline(fn('scatter') + '(x, y; label="Data", alpha=0.5)', 'scatter with transparency');
					c += cline('model = ' + fn('loess') + '(x, y; span=0.5)', 'LOESS smoother; span controls bandwidth');
					c += cline('xs    = ' + fn('range') + '(' + fn('extrema') + '(x)...; length=200)', 'fine evaluation grid');
					c += cline(fn('plot!') + '(xs, ' + fn('predict') + '(model, xs); label="LOESS", lw=2.5)', 'overlay smooth curve');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'cviz-box-violin',
				label: 'Box + Violin',
				desc: 'Overlay a box plot inside a violin for each group',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('groups = ' + fn('repeat') + '(["A", "B", "C"], inner=100)', 'group labels');
					c += cline('values = [' + fn('randn') + '(100); 1.5 .+ ' + fn('randn') + '(100); -1 .+ ' + fn('randn') + '(100)]', 'three groups');
					c += blank();
					c += cline(fn('violin') + '(groups, values; xlabel="Group", ylabel="Value", legend=false)', 'full violin shape per group');
					c += cline(fn('boxplot!') + '(groups, values; fillalpha=0.0, lw=2, legend=false)', 'box plot overlay inside the violin');
					return c;
				},
			},
			{
				id: 'cviz-multi-hist',
				label: 'Overlaid Histograms',
				desc: 'Plot histograms for two groups on the same axes',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('a = ' + fn('randn') + '(500)', 'group A');
					c += cline('b = 1.5 .+ ' + fn('randn') + '(500)', 'group B, shifted');
					c += blank();
					c += cline(fn('histogram') + '(a; normalize=:density, alpha=0.5, label="Group A")', 'base histogram');
					c += cline(fn('histogram!') + '(b; normalize=:density, alpha=0.5, label="Group B")', 'overlay second group');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'cviz-summary-stats',
				label: 'Summary Statistics',
				desc: 'Print mean, median, std, IQR, min, and max of a sample',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics') + ', ' + ty('StatsBase') + ', ' + ty('Random'), 'statistics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v = ' + fn('randn') + '(500)', 'sample');
					c += blank();
					c += cline(fn('println') + '("n:      ", ' + fn('length') + '(v))', 'sample size');
					c += cline(fn('println') + '("mean:   ", ' + fn('round') + '(' + fn('mean') + '(v);   digits=4))', 'arithmetic mean');
					c += cline(fn('println') + '("median: ", ' + fn('round') + '(' + fn('median') + '(v); digits=4))', 'median');
					c += cline(fn('println') + '("std:    ", ' + fn('round') + '(' + fn('std') + '(v);    digits=4))', 'standard deviation');
					c += cline(fn('println') + '("IQR:    ", ' + fn('round') + '(' + fn('iqr') + '(v);    digits=4))', 'interquartile range');
					c += cline(fn('println') + '("min: ", ' + fn('minimum') + '(v), "  max: ", ' + fn('maximum') + '(v))', 'range extremes');
					return c;
				},
			},
			{
				id: 'cviz-annotate',
				label: 'Annotations',
				desc: 'Add mean and median reference lines to a histogram',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('StatsPlots') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'plotting, statistics, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('v = ' + fn('randn') + '(1000) .^ 2', 'right-skewed sample');
					c += blank();
					c += cline(fn('histogram') + '(v; normalize=:density, legend=:topright, label="Data")', 'base histogram');
					c += cline(fn('vline!') + '([' + fn('mean') + '(v)];   label="Mean",   lw=2, ls=:dash)', 'vertical line at the mean');
					c += cline(fn('vline!') + '([' + fn('median') + '(v)]; label="Median", lw=2, ls=:dot)', 'vertical line at the median');
					return c;
				},
			},
		];`,
	});
}
