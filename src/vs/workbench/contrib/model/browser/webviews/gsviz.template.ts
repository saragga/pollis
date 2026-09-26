/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getGsvizHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Graph and Spatial Plots',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'network',
		modelsLiteral: "['network', 'tree', 'choropleth', 'voronoi']",
		chartW: 54,
		hiddenRowCss: '.bar-row, .histogram-row, .box-row, .violin-row { display: none; }',
		togglesJs: `			<button class="toggle-btn active" data-model="network">Network Diagram</button>
			<button class="toggle-btn" data-model="tree">Tree Diagram</button>
			<button class="toggle-btn" data-model="choropleth">Choropleth</button>
			<button class="toggle-btn" data-model="voronoi">Voronoi</button>`,
		bullets: `				<li><strong>Networks</strong> &#8212; show entities and their connections with <span class="plot-link" data-goto="network">network diagrams</span></li>
				<li><strong>Hierarchies</strong> &#8212; lay out parent-child structure with <span class="plot-link" data-goto="tree">tree diagrams</span></li>
				<li><strong>Geography</strong> &#8212; shade regions by value on a map with <span class="plot-link" data-goto="choropleth">choropleths</span></li>
				<li><strong>Tessellation</strong> &#8212; partition the plane around a set of sites with a <span class="plot-link" data-goto="voronoi">Voronoi diagram</span></li>
			`,
		decisionRows: `					<tr><td>Network Diagram</td><td>Graph (nodes, edges)</td><td>Reveal connectivity, clusters, hubs, and paths between entities</td></tr>
					<tr><td>Tree Diagram</td><td>Hierarchy / DAG</td><td>Show parent-child structure with a clean top-down layered layout</td></tr>
					<tr><td>Choropleth</td><td>Region + value</td><td>Map a quantity onto geographic areas using a colour scale</td></tr>
					<tr><td>Voronoi</td><td>Point sites</td><td>Partition the plane into the region nearest each site (nearest-neighbour cells)</td></tr>
				`,
		miniChartsJs: `function miniNetwork() {
			// nodes connected by edges (a small graph glyph)
			var nodes = [[14, 22], [42, 16], [46, 48], [22, 60], [10, 44], [34, 70]];
			var edges = [[0, 1], [0, 2], [0, 4], [1, 2], [2, 3], [3, 4], [3, 5], [2, 5]];
			var s = '';
			edges.forEach(function(e) {
				s += '<line x1="' + nodes[e[0]][0] + '" y1="' + nodes[e[0]][1] + '" x2="' + nodes[e[1]][0] + '" y2="' + nodes[e[1]][1] + '" stroke="currentColor" stroke-width="0.8" opacity="0.55"/>';
			});
			nodes.forEach(function(p, i) {
				var r = i === 0 ? 4.5 : 3;   // node 0 is a hub
				s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="currentColor"/>';
			});
			return s;
		}

		function miniTree() {
			// top-down layered tree
			var nodes = [[28, 12], [14, 40], [42, 40], [7, 70], [21, 70], [35, 70], [49, 70]];
			var edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
			var s = '';
			edges.forEach(function(e) {
				s += '<line x1="' + nodes[e[0]][0] + '" y1="' + nodes[e[0]][1] + '" x2="' + nodes[e[1]][0] + '" y2="' + nodes[e[1]][1] + '" stroke="currentColor" stroke-width="0.8" opacity="0.55"/>';
			});
			nodes.forEach(function(p) {
				s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="currentColor"/>';
			});
			return s;
		}

		function miniChoropleth() {
			// abstract map: irregular regions with varying fill (a colour-by-value glyph)
			var s = '';
			s += '<path d="M 6 10 L 26 8 L 30 30 L 10 34 Z" fill="currentColor" fill-opacity="0.55" stroke="currentColor" stroke-width="0.7"/>';
			s += '<path d="M 26 8 L 50 14 L 46 34 L 30 30 Z" fill="currentColor" fill-opacity="0.20" stroke="currentColor" stroke-width="0.7"/>';
			s += '<path d="M 10 34 L 30 30 L 28 56 L 8 54 Z" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="0.7"/>';
			s += '<path d="M 30 30 L 46 34 L 48 60 L 28 56 Z" fill="currentColor" fill-opacity="0.70" stroke="currentColor" stroke-width="0.7"/>';
			s += '<path d="M 8 54 L 28 56 L 24 78 L 12 76 Z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="0.7"/>';
			return s;
		}

		function miniVoronoi() {
			// cell boundaries meeting at vertices, with a site dot inside each cell
			var s = '';
			var edges = [
				[20, 40, 36, 46], // shared internal edge
				[20, 40, 5, 14],
				[20, 40, 3, 58],
				[36, 46, 51, 16],
				[36, 46, 46, 78],
				[5, 14, 51, 16],  // upper boundary
				[3, 58, 46, 78]   // lower boundary
			];
			edges.forEach(function(e) {
				s += '<line x1="' + e[0] + '" y1="' + e[1] + '" x2="' + e[2] + '" y2="' + e[3] + '" stroke="currentColor" stroke-width="0.9" opacity="0.6"/>';
			});
			[[28, 14], [10, 40], [45, 44], [25, 66]].forEach(function(p) {
				s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="currentColor"/>';
			});
			return s;
		}

		var MINI_CHARTS = [miniNetwork, miniTree, miniChoropleth, miniVoronoi];
		var MINI_LABELS = ['Network', 'Tree', 'Choropleth', 'Voronoi'];`,
		codeBranchesJs: `if (currentModel === 'network') {
				c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('GraphMakie') + ', ' + ty('CairoMakie') + ', ' + ty('Random'), 'graphs, graph plotting, backend, RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible layout');
				c += cline('g = ' + fn('erdos_renyi') + '(14, 0.18)', 'random graph: 14 nodes, edge prob 0.18');
				c += cline('deg = ' + fn('degree') + '(g)', 'node degree = number of connections');
				c += blank();
				c += cline(fn('graphplot') + '(g;', 'force-directed layout by default');
				c += cline('    node_size = 8 .+ 2 .* deg,', 'size each node by its degree (hubs stand out)');
				c += cline('    node_color = deg, nlabels = ' + fn('string') + '.(1:' + fn('nv') + '(g)))', 'colour by degree; label nodes');

			} else if (currentModel === 'tree') {
				c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('GraphMakie') + ', ' + ty('NetworkLayout') + ', ' + ty('CairoMakie'), 'graphs, plotting, layouts');
				c += blank();
				c += cline('ug = ' + fn('binary_tree') + '(4)', 'undirected complete binary tree, depth 4');
				c += cline('g  = ' + fn('bfs_tree') + '(ug, 1)', 'direct edges away from root 1 -> a rooted tree');
				c += blank();
				c += cline(fn('graphplot') + '(g;', 'top-down hierarchical layout');
				c += cline('    layout = ' + fn('Buchheim') + '(),', 'Buchheim needs a rooted (directed) tree');
				c += cline('    nlabels = ' + fn('string') + '.(1:' + fn('nv') + '(g)), node_size = 12)', 'label each node');

			} else if (currentModel === 'voronoi') {
				c += cline(kw('using') + ' ' + ty('CairoMakie') + ', ' + ty('DelaunayTriangulation') + ', ' + ty('Random'), 'tessellation and RNG');
				c += blank();
				c += cline(fn('Random') + '.' + fn('seed!') + '(1234)', 'reproducible sites');
				c += cline('points = ' + fn('rand') + '(2, 50)', '50 random sites (a 2 x n matrix)');
				c += blank();
				c += cline('tri  = ' + fn('triangulate') + '(points)', 'Delaunay triangulation of the sites');
				c += cline('vorn = ' + fn('voronoi') + '(tri)', 'its dual: the Voronoi tessellation');
				c += blank();
				c += cline('f, ax, tr = ' + fn('voronoiplot') + '(vorn)', 'draw the region nearest each site');
				c += cline(fn('display') + '(f)', 'render the figure (assignment alone does not auto-show)');

			} else {
				c += cline(kw('using') + ' ' + ty('GeoMakie') + ', ' + ty('CairoMakie') + ', ' + ty('NaturalEarth'), 'geographic plotting and base maps');
				c += blank();
				c += cline('countries = ' + fn('naturalearth') + '("admin_0_countries", 110)', 'low-res country polygons (a GeoTable)');
				c += cline('values = ' + fn('rand') + '(' + fn('length') + '(countries.geometry))', 'one value per region (replace with your data)');
				c += blank();
				c += cline('fig = ' + fn('Figure') + '()', 'figure');
				c += cline('ga  = ' + fn('GeoAxis') + '(fig[1, 1])', 'axis with a map projection');
				c += cline(fn('poly!') + '(ga, countries.geometry; color = values, colormap = :viridis, strokewidth = 0.25)', 'shade each region by value');
				c += cline(fn('Colorbar') + '(fig[1, 2]; colormap = :viridis, label = "Value")', 'legend for the colour scale');
				c += cline('fig');
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
				id: 'gsviz-directed',
				label: 'Directed Graph',
				desc: 'Draw arrows on edges to show direction of flow or dependency',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('GraphMakie') + ', ' + ty('CairoMakie'), 'directed graph plotting');
					c += blank();
					c += cline('g = ' + fn('SimpleDiGraph') + '(5)', 'directed graph with 5 nodes');
					c += cline(fn('add_edge!') + '.(' + fn('Ref') + '(g), [1, 1, 2, 3, 4], [2, 3, 4, 4, 5])', 'add directed edges (source -> target)');
					c += blank();
					c += cline(fn('graphplot') + '(g; arrow_show = true, nlabels = ' + fn('string') + '.(1:5))', 'arrowheads mark edge direction');
					return c;
				},
			},
			{
				id: 'gsviz-bubble-map',
				label: 'Bubble Map',
				desc: 'Place sized markers at geographic coordinates instead of shading regions',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('GeoMakie') + ', ' + ty('CairoMakie'), 'geographic scatter');
					c += blank();
					c += cline('lons = [-0.1, 2.35, -74.0, 139.7, 151.2]', 'longitudes (London, Paris, NYC, Tokyo, Sydney)');
					c += cline('lats = [51.5, 48.85, 40.7, 35.7, -33.9]', 'latitudes');
					c += cline('pop  = [9.0, 2.1, 8.3, 14.0, 5.3]', 'value -> marker area');
					c += blank();
					c += cline('fig = ' + fn('Figure') + '(); ga = ' + fn('GeoAxis') + '(fig[1, 1])', 'map axis');
					c += cline(fn('lines!') + '(ga, ' + ty('GeoMakie') + '.coastlines())', 'coastline reference');
					c += cline(fn('scatter!') + '(ga, lons, lats; markersize = 6 .* ' + fn('sqrt') + '.(pop))', 'area-proportional bubbles');
					c += line('fig');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'gsviz-centrality',
				label: 'Centrality',
				desc: 'Rank nodes by betweenness centrality to find bridges and hubs',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('Random'), 'graph metrics and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('g = ' + fn('erdos_renyi') + '(14, 0.18)', 'random graph');
					c += cline('bc = ' + fn('betweenness_centrality') + '(g)', 'fraction of shortest paths through each node');
					c += cline(fn('println') + '("Top hubs: ", ' + fn('sortperm') + '(bc; rev = true)[1:3])', 'three most central nodes');
					return c;
				},
			},
			{
				id: 'gsviz-components',
				label: 'Connectivity',
				desc: 'Check whether the graph is connected and list its components',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('Random'), 'graph algorithms and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(7)', 'reproducible');
					c += cline('g = ' + fn('erdos_renyi') + '(14, 0.10)', 'sparser graph (likely disconnected)');
					c += cline(fn('println') + '("Connected: ", ' + fn('is_connected') + '(g))', 'single component?');
					c += cline('comps = ' + fn('connected_components') + '(g)', 'list of components');
					c += cline(fn('println') + '("Components: ", ' + fn('length') + '(comps), "  sizes: ", ' + fn('length') + '.(comps))', 'count and sizes');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'gsviz-shortest-path',
				label: 'Shortest Path',
				desc: 'Find and highlight the shortest path between two nodes',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('Random'), 'shortest paths and RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('g = ' + fn('erdos_renyi') + '(14, 0.18)', 'random graph');
					c += cline('ds = ' + fn('dijkstra_shortest_paths') + '(g, 1)', 'shortest paths from node 1');
					c += cline('path = ' + fn('enumerate_paths') + '(ds, 10)', 'reconstruct path 1 -> 10');
					c += cline(fn('println') + '("Path 1 -> 10: ", path)', 'sequence of nodes');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'gsviz-layouts',
				label: 'Compare Layouts',
				desc: 'Lay out the same graph with different algorithms side by side',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('GraphMakie') + ', ' + ty('NetworkLayout') + ', ' + ty('CairoMakie'), 'plotting and layouts');
					c += blank();
					c += cline('g = ' + fn('erdos_renyi') + '(14, 0.18)', 'graph to lay out');
					c += cline('fig = ' + fn('Figure') + '()', 'figure for two panels');
					c += cline(fn('graphplot') + '(fig[1, 1], g; layout = ' + fn('Spring') + '(), nlabels = ' + fn('string') + '.(1:' + fn('nv') + '(g)))', 'force-directed');
					c += cline(fn('graphplot') + '(fig[1, 2], g; layout = ' + fn('Stress') + '())', 'stress-majorisation layout');
					c += line('fig');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'gsviz-graph-stats',
				label: 'Graph Summary',
				desc: 'Print order, size, density, and degree summary of a graph',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Graphs') + ', ' + ty('Statistics') + ', ' + ty('Random'), 'graph metrics, stats, RNG');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('g = ' + fn('erdos_renyi') + '(14, 0.18)', 'random graph');
					c += cline(fn('println') + '("nodes: ", ' + fn('nv') + '(g), "  edges: ", ' + fn('ne') + '(g))', 'order and size');
					c += cline(fn('println') + '("density: ", ' + fn('round') + '(' + fn('density') + '(g); digits = 3))', 'fraction of possible edges present');
					c += cline(fn('println') + '("mean degree: ", ' + fn('round') + '(' + fn('mean') + '(' + fn('degree') + '(g)); digits = 2))', 'average connections per node');
					return c;
				},
			},
			{
				id: 'gsviz-region-table',
				label: 'Top Regions',
				desc: 'Print the regions with the highest mapped values',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Random'), 'RNG for the example values');
					c += blank();
					c += cline(fn('Random') + '.' + fn('seed!') + '(42)', 'reproducible');
					c += cline('regions = ["North", "South", "East", "West", "Central"]', 'region names');
					c += cline('values  = ' + fn('rand') + '(5)', 'value per region (replace with your data)');
					c += cline('order   = ' + fn('sortperm') + '(values; rev = true)', 'rank descending');
					c += cline(kw('for') + ' i ' + kw('in') + ' order', 'highest first');
					c += cline('    ' + fn('println') + '(regions[i], ": ", ' + fn('round') + '(values[i]; digits = 3))', 'region and value');
					c += line(kw('end'));
					return c;
				},
			},
		];`,
	});
}
