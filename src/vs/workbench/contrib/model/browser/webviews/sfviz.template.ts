/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getSfvizHtml(): string {
	return buildWebviewHtml({
		title: 'Surfaces and Fields',
		defaultModel: 'contour',
		modelsLiteral: `['contour', 'contour3d', 'surface', 'volume', 'phase', 'mesh', 'voxels']`,
		hiddenRowCss: '.bar-row, .histogram-row, .box-row, .violin-row { display: none; }',
		extraCss: `		.interact-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; font-family: var(--vscode-font-family); color: var(--vscode-textLink-foreground); cursor: pointer; user-select: none; }
		.interact-toggle:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.interact-toggle:hover input { border-color: var(--vscode-textLink-activeForeground); }
		.interact-toggle input:checked::after { content: ''; position: absolute; left: 4px; top: 1px; width: 3px; height: 7px; border: solid var(--vscode-textLink-foreground); border-width: 0 2px 2px 0; transform: rotate(45deg); }
		.interact-toggle:hover input:checked::after { border-color: var(--vscode-textLink-activeForeground); }
		.interact-toggle input { appearance: none; -webkit-appearance: none; margin: 0; width: 14px; height: 14px; flex-shrink: 0; position: relative; border: 1px solid var(--vscode-textLink-foreground); border-radius: 3px; background: transparent; cursor: pointer; }
`,
		interactiveLabelHtml: `<label class="interact-toggle" id="interact-label" title="Interactive plots open a GLMakie window. Uncheck for a static inline render (CairoMakie) where supported."><input type="checkbox" id="interact-cb" checked> Interactive</label>`,
		headScriptJs: `		var interactive = true;   // Interactive checkbox: GLMakie (true) vs CairoMakie/static (false)
`,
		setModelExtraJs: `			var is3d = model !== 'contour';   // 2D contour is always static (CairoMakie) — hide the toggle
			document.getElementById('interact-label').style.display = is3d ? 'flex' : 'none';
`,
		tailScriptJs: `		document.getElementById('interact-cb').addEventListener('change', function() {
			interactive = this.checked;
			updateCodePreview();
		});
`,
		togglesJs: `			<button class="toggle-btn active" data-model="contour">Contour</button>
			<button class="toggle-btn" data-model="contour3d">3D Contour</button>
			<button class="toggle-btn" data-model="surface">Surface</button>
			<button class="toggle-btn" data-model="volume">Volume</button>
			<button class="toggle-btn" data-model="phase">Phase Portrait</button>
			<button class="toggle-btn" data-model="mesh">Mesh</button>
			<button class="toggle-btn" data-model="voxels">Voxels</button>`,
		bullets: `				<li><strong>Isolines</strong> &#8212; trace the level curves of a 2-D field with <span class="plot-link" data-goto="contour">contour plots</span></li>
				<li><strong>Surfaces</strong> &#8212; render a field in 3-D as a height map (<span class="plot-link" data-goto="surface">surface</span>) or as lifted <span class="plot-link" data-goto="contour3d">3D contours</span></li>
				<li><strong>Volumes</strong> &#8212; reveal the interior of a 3-D field as a translucent <span class="plot-link" data-goto="volume">volume</span></li>
				<li><strong>Vector fields</strong> &#8212; trace the flow of a 2-D dynamical system with a <span class="plot-link" data-goto="phase">phase portrait</span></li>
				<li><strong>Geometry</strong> &#8212; render an explicit surface from vertices and faces as a <span class="plot-link" data-goto="mesh">mesh</span></li>
				<li><strong>Discrete volumes</strong> &#8212; draw a 3-D grid of labelled cells as <span class="plot-link" data-goto="voxels">voxels</span></li>
			`,
		decisionRows: `					<tr><td>Contour</td><td>2D scalar field</td><td>Show level curves of f(x, y) in the plane (CairoMakie, static)</td></tr>
					<tr><td>3D Contour</td><td>2D or 3D field</td><td>Lift contours onto a 3D axis, or draw isosurfaces of f(x, y, z)</td></tr>
					<tr><td>Surface</td><td>2D scalar field</td><td>Render f(x, y) as a height map you can rotate (GLMakie)</td></tr>
					<tr><td>Volume</td><td>3D scalar field</td><td>Reveal internal structure of f(x, y, z) as a cloud (GLMakie)</td></tr>
					<tr><td>Phase Portrait</td><td>2D vector field</td><td>Trace flow lines of a dynamical system dx/dt = f(x) (CairoMakie or GLMakie)</td></tr>
					<tr><td>Mesh</td><td>Vertices and faces</td><td>Render an explicit triangulated/quad surface; add a wireframe overlay (CairoMakie or GLMakie)</td></tr>
					<tr><td>Voxels</td><td>3D integer array</td><td>Draw each cell of a 3D grid as a cube, coloured by its value (GLMakie)</td></tr>
				`,
		codeBranchesJs: `function makie(canCairo) {
				if (interactive) {
					return cline(kw('using') + ' ' + ty('GLMakie'), 'interactive: window (terminal) / plot pane (REPL)')
						+ cline(ty('Makie') + '.' + fn('inline!') + '(false)', 'open a window; resets any prior inline! state');
				}
				if (canCairo) {
					return cline(kw('using') + ' ' + ty('CairoMakie'), 'static: renders inline');
				}
				return cline(kw('using') + ' ' + ty('GLMakie'), 'static inline render')
					+ cline(ty('Makie') + '.' + fn('inline!') + '(true)', 'render to an inline image, no window');
			}

			if (currentModel === 'contour') {
				c += cline(kw('using') + ' ' + ty('CairoMakie'), '2D contour renders statically');
				c += blank();
				c += cline('himmelblau(x, y) = (x^2 + y - 11)^2 + (x + y^2 - 7)^2', 'a field with four minima');
				c += cline('x = y = ' + fn('range') + '(-6, 6; length = 100)', 'shared grid');
				c += cline('z = ' + fn('himmelblau') + '.(x, ' + fn('transpose') + '(y))', 'transpose(y) broadcasts over the grid');
				c += blank();
				c += cline('levels     = 10.0 .^ ' + fn('range') + '(0.3, 3.5; length = 10)', 'logarithmic levels span the wide range');
				c += cline('colorscale = ' + fn('ReversibleScale') + '(t -> t^(1/10), t -> t^10)', 'compress the colour scale to match');
				c += blank();
				c += cline('f, ax, ct = ' + fn('contour') + '(x, y, z;', 'labelled level curves');
				c += cline('    labels = true, levels, colormap = :hsv, colorscale)', 'log levels + matching colour scale');
				c += cline(fn('display') + '(f)', 'render the figure (assignment alone does not auto-show)');

			} else if (currentModel === 'contour3d') {
				c += makie(false);  // contour3d: isosurfaces need GLMakie (Cairo cannot render them)
				c += blank();
				c += cline('r      = ' + fn('range') + '(-pi, pi; length = 41)', 'shared grid');
				c += cline('data2d = [' + fn('cos') + '(x) + ' + fn('cos') + '(y) ' + kw('for') + ' x ' + kw('in') + ' r, y ' + kw('in') + ' r]', '2D field');
				c += cline('data3d = [' + fn('cos') + '(x) + ' + fn('cos') + '(y) + ' + fn('cos') + '(z) ' + kw('for') + ' x ' + kw('in') + ' r, y ' + kw('in') + ' r, z ' + kw('in') + ' r]', '3D field');
				c += blank();
				c += cline('fig = ' + fn('Figure') + '(size = (800, 400))', 'two panels');
				c += cline('ax1 = ' + ty('Axis3') + '(fig[1, 1]; title = "isosurfaces")', 'left axis');
				c += cline(fn('contour!') + '(ax1, -pi .. pi, -pi .. pi, -pi .. pi, data3d)', 'isosurfaces of f(x, y, z)');
				c += cline('ax2 = ' + ty('Axis3') + '(fig[1, 2]; title = "lifted contours")', 'right axis');
				c += cline(fn('contour3d!') + '(ax2, r, r, data2d; levels = 10, linewidth = 3)', 'contours of f(x, y) lifted into 3D');
				c += cline(fn('display') + '(fig)', 'open the GLMakie window (works from terminal too)');

			} else if (currentModel === 'surface') {
				c += makie(true);  // surface: Cairo can do a static Axis3
				c += blank();
				c += cline('xs = ' + fn('LinRange') + '(0, 10, 100)', 'x grid');
				c += cline('ys = ' + fn('LinRange') + '(0, 15, 100)', 'y grid');
				c += cline('zs = [' + fn('cos') + '(x) * ' + fn('sin') + '(y) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'height field f(x, y)');
				c += blank();
				c += cline('fig, ax, plt = ' + fn('surface') + '(xs, ys, zs; axis = (type = ' + ty('Axis3') + ',), colormap = :viridis)', 'height map you can rotate');
				c += cline(fn('display') + '(fig)', 'open the GLMakie window');

			} else if (currentModel === 'phase') {
				c += makie(true);  // streamplot is 2D: Cairo renders it statically, GLMakie interactively
				c += blank();
				c += cline('# damped pendulum: state x = (theta, omega)', 'a 2D dynamical system');
				c += cline('field(x) = ' + ty('Point2f') + '(x[2], -' + fn('sin') + '(x[1]) - 0.2 * x[2])', 'the vector field dx/dt = f(x)');
				c += blank();
				c += cline('f, ax, pl = ' + fn('streamplot') + '(field, -2pi .. 2pi, -4 .. 4;', 'integrate flow lines through the field');
				c += cline('    colormap = :plasma, gridsize = (32, 32), arrow_size = 10)', 'seed density and arrow size');
				c += cline(fn('display') + '(f)', 'render the figure (assignment alone does not auto-show)');

			} else if (currentModel === 'mesh') {
				c += makie(true);  // a 3D mesh: Cairo renders it statically, GLMakie lets you rotate it
				c += cline(kw('using') + ' ' + ty('GeometryBasics') + ', ' + ty('LinearAlgebra'), 'vertices, faces, and normals');
				c += blank();
				c += cline('r = 0.5f0; n = 30', 'sphere radius and grid resolution');
				c += cline('theta = ' + fn('LinRange') + '(0, pi, n)', 'polar angle');
				c += cline('phi   = ' + fn('LinRange') + '(0, 2pi, 2n)', 'azimuthal angle');
				c += cline('x = [r * ' + fn('cos') + '(p) * ' + fn('sin') + '(t) ' + kw('for') + ' t ' + kw('in') + ' theta, p ' + kw('in') + ' phi]', 'vertex x');
				c += cline('y = [r * ' + fn('sin') + '(p) * ' + fn('sin') + '(t) ' + kw('for') + ' t ' + kw('in') + ' theta, p ' + kw('in') + ' phi]', 'vertex y');
				c += cline('z = [r * ' + fn('cos') + '(t)           ' + kw('for') + ' t ' + kw('in') + ' theta, p ' + kw('in') + ' phi]', 'vertex z');
				c += cline('points = ' + fn('vec') + '([' + ty('Point3f') + '(xv, yv, zv) ' + kw('for') + ' (xv, yv, zv) ' + kw('in') + ' ' + fn('zip') + '(x, y, z)])', 'flatten the grid to a vertex list');
				c += blank();
				c += cline('faces   = ' + fn('decompose') + '(' + ty('QuadFace') + '{' + ty('GLIndex') + '}, ' + fn('Tessellation') + '(' + fn('Rect') + '(0, 0, 1, 1), ' + fn('size') + '(z)))', 'connect neighbouring grid vertices into quads');
				c += cline('normals = ' + ty('Vec3f') + '.(' + fn('normalize') + '.(points))', 'normalised vertices as Vec3f (the normal field needs Vec3f)');
				c += cline('gb_mesh = ' + ty('GeometryBasics') + '.' + ty('Mesh') + '(points, faces; normal = normals)', 'assemble the mesh');
				c += blank();
				c += cline('f, ax, pl = ' + fn('mesh') + '(gb_mesh; color = [v[3] ' + kw('for') + ' v ' + kw('in') + ' points], colormap = :blues)', 'colour by height');
				c += cline(fn('wireframe!') + '(ax, gb_mesh; color = (:black, 0.2), linewidth = 1)', 'overlay the quad edges');
				c += cline(fn('display') + '(f)', 'render the figure (assignment alone does not auto-show)');

			} else if (currentModel === 'voxels') {
				c += makie(false);  // voxels need GLMakie (Cairo cannot render them)
				c += blank();
				c += cline('chunk = ' + fn('reshape') + '(' + fn('collect') + '(1:27), 3, 3, 3)', 'a 3x3x3 grid of labelled cells');
				c += blank();
				c += cline('f, ax, pl = ' + fn('voxels') + '(chunk; gap = 0.33)', 'one cube per cell; gap shrinks them to show separation');
				c += cline(fn('display') + '(f)', 'open the GLMakie window (works from terminal too)');

			} else {
				c += makie(false);  // volume: Cairo cannot render volumes
				c += blank();
				c += cline('r    = ' + fn('LinRange') + '(-1, 1, 100)', 'cubic grid');
				c += cline('cube = [x^2 + y^2 + z^2 ' + kw('for') + ' x ' + kw('in') + ' r, y ' + kw('in') + ' r, z ' + kw('in') + ' r]', '3D scalar field f(x, y, z)');
				c += blank();
				c += cline('fig, ax, plt = ' + fn('contour') + '(cube; alpha = 0.5)', 'nested isosurfaces as a translucent cloud');
				c += cline(fn('display') + '(fig)', 'open the GLMakie window');
				c += cline('# ' + fn('volume') + '(cube; algorithm = :mip)', 'alternative: direct (maximum-intensity) volume render');
			}`,
		actionsJs: `var VISUALISE_ACTIONS = [
			{
				id: 'sfviz-filled-contour',
				label: 'Filled Contour',
				desc: 'Shade the bands between contour levels instead of drawing lines',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('CairoMakie'), 'filled contour (contourf)');
					c += blank();
					c += cline('xs = ' + fn('LinRange') + '(-3, 3, 120)', 'x grid');
					c += cline('ys = ' + fn('LinRange') + '(-3, 3, 120)', 'y grid');
					c += cline('zs = [' + fn('exp') + '(-(x^2 + y^2)) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'Gaussian bump');
					c += blank();
					c += cline(fn('contourf') + '(xs, ys, zs; levels = 12, colormap = :viridis)', 'colour-filled bands between levels');
					return c;
				},
			},
			{
				id: 'sfviz-heatmap-contour',
				label: 'Heatmap + Contour',
				desc: 'Overlay contour lines on a heatmap of the same field',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('CairoMakie'), 'heatmap with contour overlay');
					c += blank();
					c += cline('xs = ys = ' + fn('LinRange') + '(-3, 3, 150)', 'shared grid');
					c += cline('zs = [' + fn('sin') + '(x) * ' + fn('cos') + '(y) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'field');
					c += blank();
					c += cline('fig, ax, hm = ' + fn('heatmap') + '(xs, ys, zs; colormap = :viridis)', 'filled background');
					c += cline(fn('contour!') + '(ax, xs, ys, zs; color = :white, levels = 8)', 'isolines on top');
					c += cline(fn('Colorbar') + '(fig[1, 2], hm)', 'colour scale');
					c += cline(fn('display') + '(fig)', 'force the window/inline render (works from terminal too)');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'sfviz-extrema',
				label: 'Find Extrema',
				desc: 'Locate the minimum and maximum of the field on the grid',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('CairoMakie'), 'plotting');
					c += blank();
					c += cline('xs = ys = ' + fn('LinRange') + '(-3, 3, 150)', 'grid');
					c += cline('zs = [' + fn('sin') + '(x) * ' + fn('cos') + '(y) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'field');
					c += blank();
					c += cline('imax = ' + fn('argmax') + '(zs); imin = ' + fn('argmin') + '(zs)', 'grid indices of the extremes');
					c += cline(fn('println') + '("max ", zs[imax], " at (", xs[imax[1]], ", ", ys[imax[2]], ")")', 'peak location');
					c += cline(fn('println') + '("min ", zs[imin], " at (", xs[imin[1]], ", ", ys[imin[2]], ")")', 'trough location');
					return c;
				},
			},
			{
				id: 'sfviz-gradient',
				label: 'Gradient Field',
				desc: 'Overlay arrows showing the gradient (steepest-ascent) direction',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('CairoMakie'), 'contour + arrows');
					c += blank();
					c += cline('f(x, y) = ' + fn('exp') + '(-(x^2 + y^2))', 'scalar field');
					c += cline('xs = ys = ' + fn('LinRange') + '(-2, 2, 100)', 'fine grid for the contour');
					c += cline('gx = ys2 = ' + fn('LinRange') + '(-2, 2, 15)', 'coarse grid for the arrows');
					c += blank();
					c += cline('fig, ax, _ = ' + fn('contour') + '(xs, ys, [f(x, y) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys])', 'isolines');
					c += cline('us = [-2x * f(x, y) ' + kw('for') + ' x ' + kw('in') + ' gx, y ' + kw('in') + ' ys2]', 'df/dx');
					c += cline('vs = [-2y * f(x, y) ' + kw('for') + ' x ' + kw('in') + ' gx, y ' + kw('in') + ' ys2]', 'df/dy');
					c += cline(fn('arrows!') + '(ax, gx, ys2, us, vs; lengthscale = 0.3, arrowsize = 8)', 'gradient vectors');
					c += cline(fn('display') + '(fig)', 'force the window/inline render (works from terminal too)');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'sfviz-interpolate',
				label: 'Interpolate Field',
				desc: 'Fit a smooth surface through scattered samples, then contour it',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('CairoMakie') + ', ' + ty('Random'), 'plotting and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible samples');
					c += cline('# scattered samples of f(x, y) = sin(x) * cos(y)', 'replace with measured data');
					c += cline('px = 6 .* ' + fn('rand') + '(60) .- 3; py = 6 .* ' + fn('rand') + '(60) .- 3', 'sample locations');
					c += cline('pz = ' + fn('sin') + '.(px) .* ' + fn('cos') + '.(py)', 'sample values');
					c += blank();
					c += cline('# evaluate an interpolant on a grid (e.g. with ScatteredInterpolation.jl),', 'then:');
					c += cline(fn('scatter') + '(px, py; color = pz, colormap = :viridis, markersize = 12)', 'show the samples coloured by value');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'sfviz-two-surfaces',
				label: 'Two Surfaces',
				desc: 'Render two fields side by side on shared 3D axes',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('GLMakie'), 'interactive 3D');
					c += blank();
					c += cline('xs = ys = ' + fn('LinRange') + '(-3, 3, 100)', 'grid');
					c += cline('z1 = [' + fn('sin') + '(x) * ' + fn('cos') + '(y) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'field A');
					c += cline('z2 = [' + fn('exp') + '(-(x^2 + y^2) / 4) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'field B');
					c += blank();
					c += cline('fig = ' + fn('Figure') + '(size = (900, 400))', 'two panels');
					c += cline(fn('surface') + '(fig[1, 1], xs, ys, z1; axis = (type = ' + ty('Axis3') + ',))', 'surface A');
					c += cline(fn('surface') + '(fig[1, 2], xs, ys, z2; axis = (type = ' + ty('Axis3') + ',))', 'surface B');
					c += cline(fn('display') + '(fig)', 'force the window/inline render (works from terminal too)');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'sfviz-field-summary',
				label: 'Field Summary',
				desc: 'Print min, max, mean, and the value range of a field',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics'), 'summary statistics');
					c += blank();
					c += cline('xs = ys = ' + fn('LinRange') + '(-3, 3, 150)', 'grid');
					c += cline('zs = [' + fn('sin') + '(x) * ' + fn('cos') + '(y) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'field');
					c += blank();
					c += cline(fn('println') + '("min:  ", ' + fn('round') + '(' + fn('minimum') + '(zs); digits = 3))', 'lowest value');
					c += cline(fn('println') + '("max:  ", ' + fn('round') + '(' + fn('maximum') + '(zs); digits = 3))', 'highest value');
					c += cline(fn('println') + '("mean: ", ' + fn('round') + '(' + fn('mean') + '(zs); digits = 3))', 'average over the grid');
					return c;
				},
			},
			{
				id: 'sfviz-level-area',
				label: 'Area Above Level',
				desc: 'Estimate the fraction of the domain where the field exceeds a level',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Statistics'), 'statistics');
					c += blank();
					c += cline('xs = ys = ' + fn('LinRange') + '(-3, 3, 200)', 'grid');
					c += cline('zs = [' + fn('exp') + '(-(x^2 + y^2)) ' + kw('for') + ' x ' + kw('in') + ' xs, y ' + kw('in') + ' ys]', 'field');
					c += cline('level = 0.5', 'threshold');
					c += cline(fn('println') + '("fraction above ", level, ": ", ' + fn('round') + '(' + fn('mean') + '(zs .> level); digits = 3))', 'share of cells exceeding the level');
					return c;
				},
			},
		];`,
	});
}
