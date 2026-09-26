/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getGalgHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Genetic Algorithms</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.header { margin-bottom: 16px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.methods-list { list-style: none; padding-left: 0; margin: 5px 0; }
		.methods-list li { margin: 2px 0; padding-left: 20px; position: relative; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.model-toggle { display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; flex-wrap: wrap; }
		.toggle-btn { background: var(--vscode-list-hoverBackground); border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 35px; transition: background 0.15s; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-activeSelectionBackground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 0; }
		.inputs-row { display: flex; gap: 15px; flex-wrap: nowrap; margin-bottom: 12px; align-items: flex-end; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 280px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		textarea.form-input::placeholder { color: var(--vscode-input-placeholderForeground); }
		.param-input { text-align: center; }
		.illus-section { margin: 0 0 20px 0; }
		.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.illus-toggle:hover { text-decoration: underline; }
		.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
		.illus-section.collapsed .illus-body { display: none; }
		.illus-body { padding: 12px 0 4px 0; }
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-blank { margin: 8px 0; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-symbolIcon-keywordForeground); }
		.hl-fn      { color: var(--vscode-textPreformat-foreground); }
		.hl-type    { color: var(--vscode-symbolIcon-classForeground); }
		.copy-btn { position: absolute; top: 8px; right: 8px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; }
		.copy-btn:hover { opacity: 1; }
		.bottom-layout { display: grid; grid-template-columns: 160px 1fr; gap: 24px; margin-top: 20px; align-items: start; }
		.left-strip { display: flex; flex-direction: column; }
		.strip-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
		.strip-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 10px 0; }
		.column-list { list-style: none; padding: 0; margin: 0; }
		.column-list li { margin: 0; }
		.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; }
		.list-btn svg { flex-shrink: 0; }
		.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.panel-active { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.paper-links { display: none; }
		.right-panel { border-left: 1px solid var(--vscode-widget-border); padding-left: 20px; display: none; min-width: 0; }
		.right-panel-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--vscode-foreground); }
		.right-action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 8px; }
		.action-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 8px 10px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; }
		.action-card:hover { background: var(--vscode-list-hoverBackground); }
		.action-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); }
		.action-desc { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 3px; line-height: 1.4; }
		.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
		.panel-back { background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0; }
		.panel-back:hover { color: var(--vscode-textLink-activeForeground); }
		.panel-close { background: transparent; border: none; color: var(--vscode-descriptionForeground); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; }
		.panel-close:hover { color: var(--vscode-foreground); }
		.panel-code-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
		.panel-code-desc { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; }
		.nb-section-title { font-size: 11px; font-weight: 600; color: var(--vscode-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin: 14px 0 6px 0; }
		.nb-section-title:first-child { margin-top: 0; }
		.nb-panel-scroll { overflow-y: auto; max-height: 70vh; padding-right: 4px; }
		.nb-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px 12px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; transition: background 0.1s; }
		.nb-card:hover { background: var(--vscode-list-hoverBackground); border-color: var(--vscode-textLink-foreground); }
		.nb-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); margin-bottom: 4px; }
		.nb-desc { font-size: 11px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Genetic Algorithms</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Classic GA &#8212; selection, crossover, and mutation on fixed-length chromosomes</li>
					<li>Compact GA &#8212; probability vector representation with incremental updates</li>
					<li>BRKGA &#8212; biased random-key encoding with elite/non-elite crossover</li>
					<li>MCCGA &#8212; machine-coded compact GA; encodes real variables as integers using b bits; maintains a marginal-product histogram updated by pairwise competition</li>
				</ul>
			</div>
		</div>

		<div class="model-toggle" id="model-group">
			<button class="toggle-btn" data-model="ga">GA</button>
			<button class="toggle-btn" data-model="cga">Compact GA</button>
			<button class="toggle-btn" data-model="brkga">BRKGA</button>
			<button class="toggle-btn" data-model="mccga">MCCGA</button>
		</div>

		<div class="illus-section collapsed" id="illus-section">
			<button class="illus-toggle" id="illus-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Illustration</button>
			<div class="illus-body" id="illus-body"></div>
		</div>

		<div class="inputs-row">
			<div class="form-group" style="flex:3;">
				<label class="form-label form-label-with-tooltip">Objective f(x)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Julia expression for the objective function body. The variable x is a vector. Example: sum(x.^2)</span>
				</label>
				<textarea id="galg-obj" class="form-input" placeholder="sum(x.^2)" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1.5;">
				<label class="form-label form-label-with-tooltip">Lower bounds (lb)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Vector of lower bounds for each decision variable. Example: fill(-5.0, n)</span>
				</label>
				<textarea id="galg-lb" class="form-input" placeholder="fill(-5.0, n)" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1.5;">
				<label class="form-label form-label-with-tooltip">Upper bounds (ub)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Vector of upper bounds for each decision variable. Example: fill(5.0, n)</span>
				</label>
				<textarea id="galg-ub" class="form-input" placeholder="fill(5.0, n)" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1;">
				<label class="form-label centered form-label-with-tooltip">n
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Number of decision variables (dimension of x).</span>
				</label>
				<textarea id="galg-n" class="form-input param-input" placeholder="2" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1;">
				<label class="form-label centered form-label-with-tooltip">Pop
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Population size. Compact GA typically uses a small virtual population (e.g. 10). Classic GA and BRKGA work well with 50&#8211;200.</span>
				</label>
				<textarea id="galg-pop" class="form-input param-input" placeholder="50" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1;">
				<label class="form-label centered form-label-with-tooltip">Budget
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Maximum number of generations (iterations).</span>
				</label>
				<textarea id="galg-budget" class="form-input param-input" placeholder="500" rows="1"></textarea>
			</div>
		</div>

		<div class="code-preview-wrapper">
			<div class="code-preview" id="code-preview"></div>
			<button class="copy-btn" id="btn-copy">Copy</button>
		</div>

		<div class="bottom-layout">
			<div class="left-strip">
				<div class="strip-title">Next Steps</div>
				<ul class="column-list">
					<li><button class="list-btn panel-toggle" id="btn-viz"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1 11l3-4 3 2 3-6 3 4H1z" opacity=".4"/><path d="M0 12.5v1h16v-1H0zM1.5 11.9l-.9.4.8 1.2.9-.4-.8-1.2zM4 7.5L1.5 11l1 .6L4.9 8l-1-.5zm2 1.5L4.5 8.2l-.9.4L5 10l1-.5zm.5-.3l2.6-5.2.9.4-2.6 5.2-.9-.4zm3.5-5.2L7.5 9l1 .5 2.5-5.1-1-.5zm.6-.5l2.4 3.2-.8.6-2.4-3.2.8-.6zm2.9 3l-1-1.2.8-.6 1 1.2-.8.6z"/></svg>Visualise</button></li>
					<li><button class="list-btn panel-toggle" id="btn-diagnose"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M14.5 2H14V1h-1v1H9V1H8v1H3V1H2v1h-.5A1.5 1.5 0 0 0 0 3.5v10A1.5 1.5 0 0 0 1.5 15h13a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 14.5 2zM15 13.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V5h14v8.5zM15 4H1V3.5a.5.5 0 0 1 .5-.5H2v1h1V3h5v1h1V3h4v1h1V3h.5a.5.5 0 0 1 .5.5V4z"/></svg>Diagnose</button></li>
					<li><button class="list-btn panel-toggle" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 1h-1v14h1V1zm13.328 7.488l-1.983-3.967-.894.447 1.483 2.967H8.5v-4h-1v9h1V8.935h4.934l-1.483 2.967.894.447 1.983-3.967a.5.5 0 0 0 0-.894z"/></svg>Predict</button></li>
					<li><button class="list-btn panel-toggle" id="btn-compare"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M3 2h1v12H3V2zm9 0h1v12h-1V2zM0 2h1v12H0V2zm15 0h1v12h-1V2zM5 7h6v1H5V7z"/></svg>Compare</button></li>
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 1a4.75 4.75 0 0 0-1.594 9.245c.136.051.178.125.178.232V11.5a.25.25 0 0 0 .25.25h2.332a.25.25 0 0 0 .25-.25v-1.024c0-.107.042-.18.178-.232A4.75 4.75 0 0 0 8 1zM5.5 13.25v.25c0 .138.112.25.25.25h4.5a.25.25 0 0 0 .25-.25v-.25a.25.25 0 0 0-.25-.25h-4.5a.25.25 0 0 0-.25.25zm.75 1.5v.25c0 .138.112.25.25.25h3a.25.25 0 0 0 .25-.25v-.25a.25.25 0 0 0-.25-.25h-3a.25.25 0 0 0-.25.25z"/><path d="M10.936 3.39a.5.5 0 0 1 .174.686A3.75 3.75 0 0 1 8 5.75a.5.5 0 0 1 0-1 2.75 2.75 0 0 0 2.25-1.186.5.5 0 0 1 .686-.174z"/></svg>Interpret</button></li>
				</ul>
				<hr class="strip-divider">
				<div class="strip-title">Learn More</div>
				<ul class="column-list">
					<li><button class="list-btn panel-toggle" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M3 1h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm0 1v12h10V2H3zm2 2h6v1H5V4zm0 2h6v1H5V6zm0 2h4v1H5V8z"/></svg>Local Wikis</button></li>
					<li><button class="list-btn panel-toggle" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13.85 1.146L8.5 1H1v14h14V3.354l-1.15-2.208zM14 14H2V2h6.5l5.5.12V14zM5 5h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"/></svg>Notebook Tutorials</button></li>
					<li><button class="list-btn has-actions" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2zM6.5 6.5l4 2-4 2v-4z"/></svg>Multimedia Tutorials</button></li>
					<li><button class="list-btn has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z"/></svg>Explore References</button></li>
				</ul>
				<div class="paper-links" id="paper-links"></div>
			</div>
			<div class="right-panel" id="right-panel"></div>
		</div>

	</div>
	<script>
		var vscode = acquireVsCodeApi();
		var currentModel = 'ga';
		var MODELS = ['ga', 'cga', 'brkga', 'mccga'];

		function esc(s)      { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }

		function updateCodePreview() {
			var obj    = val('galg-obj',    'sum(x.^2)');
			var lb     = val('galg-lb',     'fill(-5.0, n)');
			var ub     = val('galg-ub',     'fill(5.0, n)');
			var n      = val('galg-n',      '2');
			var pop    = val('galg-pop',    '50');
			var budget = val('galg-budget', '500');
			var c = '';
			c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
			c += blank();
			c += cline(fn('obj') + '(x) = ' + obj, '');
			c += cline('n = ' + n, '');
			c += cline('lb = ' + lb, '');
			c += cline('ub = ' + ub, '');
			c += blank();
			if (currentModel === 'ga') {
				c += cline('result = ' + ty('Evolutionary') + '.' + fn('optimize') + '(', '');
				c += cline('    ' + fn('obj') + ',', '');
				c += cline('    ' + ty('BoxConstraints') + '(lb, ub),', '');
				c += cline('    ' + ty('GA') + '(', 'classic GA: selection, crossover, mutation');
				c += cline('        populationSize = ' + pop + ',', '');
				c += cline('        crossoverRate  = 0.8,', '');
				c += cline('        mutationRate   = 0.1,', '');
				c += cline('        selection      = ' + fn('tournament') + '(3),', '');
				c += cline('        crossover      = ' + fn('intermediate') + '(0.25),', '');
				c += cline('        mutation       = ' + fn('gaussian') + '(),', '');
				c += cline('    ),', '');
				c += cline('    ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations = ' + budget + '),', '');
				c += cline(')', '');
			} else if (currentModel === 'cga') {
				c += cline('result = ' + ty('Evolutionary') + '.' + fn('optimize') + '(', '');
				c += cline('    ' + fn('obj') + ',', '');
				c += cline('    ' + ty('BoxConstraints') + '(lb, ub),', '');
				c += cline('    ' + ty('GA') + '(', 'compact GA: small virtual population, probability-vector updates');
				c += cline('        populationSize = ' + pop + ',', 'keep small (e.g. 10) for compact representation');
				c += cline('        crossoverRate  = 1.0,', '');
				c += cline('        mutationRate   = 0.0,', '');
				c += cline('        selection      = ' + fn('roulette') + ',', '');
				c += cline('        crossover      = ' + fn('discrete') + ',', '');
				c += cline('    ),', '');
				c += cline('    ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations = ' + budget + '),', '');
				c += cline(')', '');
			} else if (currentModel === 'brkga') {
				c += cline('result = ' + ty('Evolutionary') + '.' + fn('optimize') + '(', '');
				c += cline('    ' + fn('obj') + ',', '');
				c += cline('    ' + ty('BoxConstraints') + '(lb, ub),', '');
				c += cline('    ' + ty('GA') + '(', 'BRKGA: biased crossover favours elite parent');
				c += cline('        populationSize = ' + pop + ',', '');
				c += cline('        crossoverRate  = 0.7,', 'elite parent wins 70% of genes');
				c += cline('        mutationRate   = 0.15,', '');
				c += cline('        selection      = ' + fn('roulette') + ',', '');
				c += cline('        crossover      = ' + fn('uniform') + ',', '');
				c += cline('    ),', '');
				c += cline('    ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations = ' + budget + '),', '');
				c += cline(')', '');
			} else {
				c += cline('result = ' + ty('Evolutionary') + '.' + fn('optimize') + '(', '');
				c += cline('    ' + fn('obj') + ',', '');
				c += cline('    ' + ty('BoxConstraints') + '(lb, ub),', '');
				c += cline('    ' + ty('MCCGA') + '(', 'MCCGA: integer-encoded compact GA with marginal-product histogram');
				c += cline('        populationSize = ' + pop + ',', 'virtual population size (typically small, e.g. 10)');
				c += cline('    ),', '');
				c += cline('    ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations = ' + budget + '),', '');
				c += cline(')', '');
			}
			c += blank();
			c += cline('x_best = ' + ty('Evolutionary') + '.' + fn('minimizer') + '(result)', '');
			c += cline('f_best = ' + ty('Evolutionary') + '.' + fn('minimum') + '(result)', '');
			document.getElementById('code-preview').innerHTML = c;
		}

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			var illusSection = document.getElementById('illus-section');
			if (!illusSection.classList.contains('collapsed')) {
				renderIllustration();
			}
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		// ── Illustration ────────────────────────────────────────────────
		var illusRendered = false;

		function renderIllustration() {
			var body = document.getElementById('illus-body');
			var svg = '';
			if (currentModel === 'ga') {
				svg = '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
					+ '<rect x="10" y="20" width="140" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>'
					+ '<text x="80" y="36" text-anchor="middle" font-size="11" fill="currentColor">Parent A: 0.2 0.8 0.5 0.1</text>'
					+ '<rect x="170" y="20" width="140" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>'
					+ '<text x="240" y="36" text-anchor="middle" font-size="11" fill="currentColor">Parent B: 0.9 0.3 0.7 0.6</text>'
					+ '<line x1="80" y1="44" x2="80" y2="68" stroke="currentColor" stroke-width="1" opacity="0.5" stroke-dasharray="3,3"/>'
					+ '<line x1="240" y1="44" x2="240" y2="68" stroke="currentColor" stroke-width="1" opacity="0.5" stroke-dasharray="3,3"/>'
					+ '<text x="160" y="65" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">single-point crossover at position 2</text>'
					+ '<rect x="10" y="80" width="140" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>'
					+ '<text x="80" y="96" text-anchor="middle" font-size="11" fill="currentColor">Child: 0.2 0.8 0.7 0.6</text>'
					+ '<text x="10" y="130" font-size="10" fill="currentColor" opacity="0.8">Selection: tournament(3)</text>'
					+ '<text x="10" y="145" font-size="10" fill="currentColor" opacity="0.8">Crossover: intermediate(0.25)</text>'
					+ '<text x="10" y="160" font-size="10" fill="currentColor" opacity="0.8">Mutation: gaussian()</text>'
					+ '</svg>'
					+ '<div class="illus-caption">Classic GA: selection picks parents, crossover recombines, mutation perturbs.</div>';
			} else if (currentModel === 'cga') {
				svg = '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
					+ '<text x="160" y="22" text-anchor="middle" font-size="11" font-weight="600" fill="currentColor">Probability Vector p</text>'
					+ '<rect x="30" y="30" width="260" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>'
					+ '<text x="160" y="48" text-anchor="middle" font-family="monospace" font-size="11" fill="currentColor">p = [0.5, 0.5, 0.5, 0.5]</text>'
					+ '<text x="160" y="78" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">sample winner and loser from p</text>'
					+ '<rect x="30" y="88" width="260" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>'
					+ '<text x="160" y="106" text-anchor="middle" font-family="monospace" font-size="11" fill="currentColor">p = [0.6, 0.4, 0.5, 0.6]</text>'
					+ '<text x="160" y="130" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">update p toward winner, away from loser</text>'
					+ '<text x="160" y="152" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.8">No explicit population &#8212; only p is stored</text>'
					+ '</svg>'
					+ '<div class="illus-caption">Compact GA: a probability vector replaces the population, updated incrementally each generation.</div>';
			} else if (currentModel === 'brkga') {
				svg = '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
					+ '<rect x="10" y="10" width="100" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>'
					+ '<text x="60" y="30" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor">Elite</text>'
					+ '<text x="60" y="46" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.8">top 20%</text>'
					+ '<rect x="210" y="10" width="100" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>'
					+ '<text x="260" y="30" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor">Non-Elite</text>'
					+ '<text x="260" y="46" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.8">random keys in [0,1]</text>'
					+ '<line x1="110" y1="35" x2="155" y2="80" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>'
					+ '<line x1="210" y1="35" x2="165" y2="80" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>'
					+ '<rect x="110" y="80" width="100" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>'
					+ '<text x="160" y="99" text-anchor="middle" font-size="10" fill="currentColor">Offspring</text>'
					+ '<text x="160" y="130" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">each gene: elite with prob 0.7</text>'
					+ '<text x="160" y="146" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">non-elite with prob 0.3</text>'
					+ '<text x="160" y="164" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.8">decoder maps random keys to solution</text>'
					+ '</svg>'
					+ '<div class="illus-caption">BRKGA: offspring inherit 70% of genes from the elite parent via biased uniform crossover.</div>';
			} else {
				svg = '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
					+ '<text x="160" y="18" text-anchor="middle" font-size="11" font-weight="600" fill="currentColor">Marginal Histogram per Variable</text>'
					+ '<text x="20" y="40" font-size="10" fill="currentColor">x[1] &#8712; [lb, ub] mapped to integer k &#8712; [0, 2&#7495;&#8722;1]</text>'
					+ '<rect x="20" y="50" width="22" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>'
					+ '<rect x="44" y="60" width="22" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>'
					+ '<rect x="68" y="44" width="22" height="46" rx="2" fill="currentColor" opacity="0.7"/>'
					+ '<rect x="92" y="68" width="22" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>'
					+ '<rect x="116" y="76" width="22" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>'
					+ '<text x="79" y="104" text-anchor="middle" font-size="9" fill="currentColor">winner k=2</text>'
					+ '<text x="160" y="125" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">histogram H shifts toward winner integer</text>'
					+ '<text x="160" y="143" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">and away from loser integer each generation</text>'
					+ '<text x="160" y="165" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.8">No population stored &#8212; only integer histograms</text>'
					+ '</svg>'
					+ '<div class="illus-caption">MCCGA: each variable encoded as an integer; pairwise competition updates a marginal histogram, not a population.</div>';
			}
			body.innerHTML = svg;
		}

		document.getElementById('illus-toggle').addEventListener('click', function() {
			var section = document.getElementById('illus-section');
			section.classList.toggle('collapsed');
			if (!section.classList.contains('collapsed') && !illusRendered) {
				illusRendered = true;
				renderIllustration();
			}
		});

		// ── Copy button ──────────────────────────────────────────────────
		document.getElementById('btn-copy').addEventListener('click', function() {
			var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
			var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				var btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

		// ── Right panel ──────────────────────────────────────────────────
		var currentPanelId = null;
		var rightPanel = document.getElementById('right-panel');

		function hideRightPanel() {
			rightPanel.innerHTML = '';
			rightPanel.style.display = 'none';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			currentPanelId = null;
		}

		function renderRightList(actions, title) {
			var cards = actions.map(function(a) {
				return '<button class="action-card" data-id="' + a.id + '">'
					+ '<span class="action-label">' + esc(a.label) + '</span>'
					+ '<span class="action-desc">' + esc(a.desc) + '</span>'
					+ '</button>';
			}).join('');
			rightPanel.innerHTML =
				'<div class="panel-header">'
				+ '<span class="right-panel-title">' + esc(title) + '</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="right-action-grid">' + cards + '</div>';
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			actions.forEach(function(a) {
				var btn = rightPanel.querySelector('[data-id="' + a.id + '"]');
				if (btn) { btn.addEventListener('click', function() { renderRightCode(a, actions, title); }); }
			});
		}

		function renderRightCode(action, actions, title) {
			var codeHtml = action.code();
			rightPanel.innerHTML =
				'<div class="panel-header">'
				+ '<button class="panel-back" id="btn-panel-back">&#x2190; ' + esc(title) + '</button>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="panel-code-title">' + esc(action.label) + '</div>'
				+ '<div class="panel-code-desc">' + esc(action.desc) + '</div>'
				+ '<div class="code-preview-wrapper">'
				+ '<div class="code-preview" id="panel-code">' + codeHtml + '</div>'
				+ '<button class="copy-btn" id="btn-panel-copy">Copy</button>'
				+ '</div>';
			document.getElementById('btn-panel-back').addEventListener('click', function() { renderRightList(actions, title); });
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			document.getElementById('btn-panel-copy').addEventListener('click', function() {
				var lines = document.getElementById('panel-code').querySelectorAll('.code-line, .code-blank');
				var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
				navigator.clipboard.writeText(text).then(function() {
					var btn = document.getElementById('btn-panel-copy');
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
				});
			});
		}

		function showRightPanel(actions, title, btnId) {
			if (currentPanelId === btnId) { hideRightPanel(); return; }
			currentPanelId = btnId;
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			document.getElementById(btnId).classList.add('panel-active');
			renderRightList(actions, title);
			rightPanel.style.display = 'block';
		}

		// ── Next Steps action arrays ──────────────────────────────────────
		var VISUALISE_ACTIONS = [
			{
				id: 'convergence-plot',
				label: 'Convergence Plot',
				desc: 'Best fitness vs generation number',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary') + ', ' + ty('Plots'), '');
					c += blank();
					c += cline('trace = result.trace', '');
					c += cline('best  = [t.value ' + kw('for') + ' t ' + kw('in') + ' trace]', '');
					c += cline(fn('plot') + '(best, xlabel="Generation", ylabel="Best f(x)",', '');
					c += cline('     title="Convergence", legend=false)', '');
					return c;
				},
			},
			{
				id: 'population-diversity',
				label: 'Population Diversity',
				desc: 'Spread of population across generations',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary') + ', ' + ty('Plots'), '');
					c += blank();
					c += cline('trace = result.trace', '');
					c += cline('diversity = [t.metadata["diver"] ' + kw('for') + ' t ' + kw('in') + ' trace]', '');
					c += cline(fn('plot') + '(diversity, xlabel="Generation", ylabel="Diversity",', '');
					c += cline('     title="Population Diversity", legend=false)', '');
					return c;
				},
			},
			{
				id: 'fitness-landscape',
				label: 'Fitness Landscape',
				desc: '2D slice of the objective through x_best',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots'), '');
					c += blank();
					c += cline('x_best = ' + ty('Evolutionary') + '.' + fn('minimizer') + '(result)', '');
					c += cline('grid = ' + fn('range') + '(-5, 5, length=100)', '');
					c += cline('slice(t) = begin x = copy(x_best); x[1] = t; ' + obj + ' end', '');
					c += cline(fn('plot') + '(grid, ' + fn('slice') + '.(grid), xlabel="x[1]", ylabel="f(x)",', '');
					c += cline('     title="Landscape Slice", legend=false)', '');
					c += cline(fn('vline!') + '([x_best[1]], linestyle=:dash)', '');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'stagnation-check',
				label: 'Stagnation Check',
				desc: 'Detect if best fitness stops improving',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline('trace = result.trace', '');
					c += cline('best  = [t.value ' + kw('for') + ' t ' + kw('in') + ' trace]', '');
					c += cline('delta = ' + fn('diff') + '(best)', '');
					c += cline('window = 20', '');
					c += cline('stagnated = ' + fn('all') + '(' + fn('abs') + '.(delta[' + kw('end') + '-window+1:' + kw('end') + ']) .< 1e-8)', '');
					c += cline(fn('println') + '("Stagnated in last ", window, " gens: ", stagnated)', '');
					return c;
				},
			},
			{
				id: 'convergence-rate',
				label: 'Convergence Rate',
				desc: 'Generations needed to reach a fitness threshold',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline('threshold = 1e-4', '');
					c += cline('trace = result.trace', '');
					c += cline('gen = ' + fn('findfirst') + '(t -> t.value < threshold, trace)', '');
					c += cline(fn('println') + '("Reached threshold at generation: ", ' + kw('isnothing') + '(gen) ? "never" : gen)', '');
					return c;
				},
			},
			{
				id: 'multi-run',
				label: 'Multi-Run Reliability',
				desc: 'Run multiple times to check consistency',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var lb  = val('galg-lb',  'fill(-5.0, n)');
					var ub  = val('galg-ub',  'fill(5.0, n)');
					var n   = val('galg-n',   '2');
					var pop = val('galg-pop', '50');
					var budget = val('galg-budget', '500');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary') + ', ' + ty('Statistics'), '');
					c += blank();
					c += cline(fn('obj') + '(x) = ' + obj, '');
					c += cline('n = ' + n + '; lb = ' + lb + '; ub = ' + ub, '');
					c += blank();
					c += cline('results = [' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub),', '');
					c += cline('    ' + ty('GA') + '(populationSize=' + pop + '), ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations=' + budget + '))', '');
					c += cline('    ' + kw('for') + ' _ ' + kw('in') + ' 1:10]', '');
					c += cline('f_vals = ' + ty('Evolutionary') + '.' + fn('minimum') + '.(' + fn('results') + ')', '');
					c += cline(fn('println') + '("mean=", ' + fn('mean') + '(f_vals), "  std=", ' + fn('std') + '(f_vals))', '');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'best-solution',
				label: 'Best Solution',
				desc: 'Extract optimal x and objective value',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline('x_best = ' + ty('Evolutionary') + '.' + fn('minimizer') + '(result)', '');
					c += cline('f_best = ' + ty('Evolutionary') + '.' + fn('minimum') + '(result)', '');
					c += cline('converged = ' + ty('Evolutionary') + '.' + fn('converged') + '(result)', '');
					c += blank();
					c += cline(fn('println') + '("x* = ", x_best)', '');
					c += cline(fn('println') + '("f* = ", f_best)', '');
					c += cline(fn('println') + '("Converged: ", converged)', '');
					return c;
				},
			},
			{
				id: 'evaluate-new',
				label: 'Evaluate New Point',
				desc: 'Compute objective at a custom point',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var n   = val('galg-n',   '2');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline(fn('obj') + '(x) = ' + obj, '');
					c += cline('x_test = ' + fn('zeros') + '(' + n + ')', '');
					c += cline('f_test = ' + fn('obj') + '(x_test)', '');
					c += cline(fn('println') + '("f(x_test) = ", f_test)', '');
					return c;
				},
			},
			{
				id: 'sensitivity',
				label: 'Sensitivity Analysis',
				desc: 'Perturb x_best to gauge local landscape',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline(fn('obj') + '(x) = ' + obj, '');
					c += cline('x_best = ' + ty('Evolutionary') + '.' + fn('minimizer') + '(result)', '');
					c += cline('eps = 0.01', '');
					c += cline(kw('for') + ' i ' + kw('in') + ' ' + fn('eachindex') + '(x_best)', '');
					c += cline('    x_p = copy(x_best); x_p[i] += eps', '');
					c += cline('    x_m = copy(x_best); x_m[i] -= eps', '');
					c += cline('    grad_i = (' + fn('obj') + '(x_p) - ' + fn('obj') + '(x_m)) / (2eps)', '');
					c += cline('    ' + fn('println') + '("df/dx[", i, "] ~ ", grad_i)', '');
					c += cline(kw('end'), '');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'compare-de',
				label: 'Compare with DE',
				desc: 'Run Differential Evolution on the same problem',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var lb  = val('galg-lb',  'fill(-5.0, n)');
					var ub  = val('galg-ub',  'fill(5.0, n)');
					var n   = val('galg-n',   '2');
					var pop = val('galg-pop', '50');
					var budget = val('galg-budget', '500');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline(fn('obj') + '(x) = ' + obj, '');
					c += cline('n = ' + n + '; lb = ' + lb + '; ub = ' + ub, '');
					c += blank();
					c += cline('res_ga = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub),', '');
					c += cline('    ' + ty('GA') + '(populationSize=' + pop + '), ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations=' + budget + '))', '');
					c += cline('res_de = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub),', '');
					c += cline('    ' + ty('DE') + '(populationSize=' + pop + '), ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations=' + budget + '))', '');
					c += blank();
					c += cline(fn('println') + '("GA  f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(res_ga))', '');
					c += cline(fn('println') + '("DE  f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(res_de))', '');
					return c;
				},
			},
			{
				id: 'compare-ga-variants',
				label: 'Compare GA Variants',
				desc: 'GA vs Compact GA vs BRKGA on same problem',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var lb  = val('galg-lb',  'fill(-5.0, n)');
					var ub  = val('galg-ub',  'fill(5.0, n)');
					var n   = val('galg-n',   '2');
					var budget = val('galg-budget', '500');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline(fn('obj') + '(x) = ' + obj, '');
					c += cline('n = ' + n + '; lb = ' + lb + '; ub = ' + ub, '');
					c += cline('opts = ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations=' + budget + ')', '');
					c += blank();
					c += cline('r1 = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub), ' + ty('GA') + '(populationSize=50), opts)', '');
					c += cline('r2 = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub), ' + ty('GA') + '(populationSize=10, crossoverRate=1.0, mutationRate=0.0, selection=' + fn('roulette') + ', crossover=' + fn('discrete') + '), opts)', '');
					c += cline('r3 = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub), ' + ty('GA') + '(populationSize=100, crossoverRate=0.7, selection=' + fn('roulette') + ', crossover=' + fn('uniform') + '), opts)', '');
					c += blank();
					c += cline(fn('println') + '("GA     f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(r1))', '');
					c += cline(fn('println') + '("CGA    f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(r2))', '');
					c += cline(fn('println') + '("BRKGA  f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(r3))', '');
					return c;
				},
			},
			{
				id: 'compare-cmaes',
				label: 'Compare with CMA-ES',
				desc: 'Run CMA-ES on the same problem',
				code: function() {
					var obj = val('galg-obj', 'sum(x.^2)');
					var lb  = val('galg-lb',  'fill(-5.0, n)');
					var ub  = val('galg-ub',  'fill(5.0, n)');
					var n   = val('galg-n',   '2');
					var pop = val('galg-pop', '50');
					var budget = val('galg-budget', '500');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline(fn('obj') + '(x) = ' + obj, '');
					c += cline('n = ' + n + '; lb = ' + lb + '; ub = ' + ub, '');
					c += blank();
					c += cline('res_ga = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub),', '');
					c += cline('    ' + ty('GA') + '(populationSize=' + pop + '), ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations=' + budget + '))', '');
					c += cline('res_es = ' + ty('Evolutionary') + '.' + fn('optimize') + '(' + fn('obj') + ', ' + ty('BoxConstraints') + '(lb, ub),', '');
					c += cline('    ' + ty('CMAES') + '(sigma0=0.3), ' + ty('Evolutionary') + '.' + ty('Options') + '(iterations=' + budget + '))', '');
					c += blank();
					c += cline(fn('println') + '("GA     f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(res_ga))', '');
					c += cline(fn('println') + '("CMA-ES f* = ", ' + ty('Evolutionary') + '.' + fn('minimum') + '(res_es))', '');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'solution-summary',
				label: 'Solution Summary',
				desc: 'Print x_best with variable indices',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline('x_best = ' + ty('Evolutionary') + '.' + fn('minimizer') + '(result)', '');
					c += cline('f_best = ' + ty('Evolutionary') + '.' + fn('minimum') + '(result)', '');
					c += blank();
					c += cline(fn('println') + '("Optimal solution:")', '');
					c += cline(kw('for') + ' (i, xi) ' + kw('in') + ' ' + fn('enumerate') + '(x_best)', '');
					c += cline('    ' + fn('println') + '("  x[", i, "] = ", xi)', '');
					c += cline(kw('end'), '');
					c += cline(fn('println') + '("f(x*) = ", f_best)', '');
					return c;
				},
			},
			{
				id: 'operator-stats',
				label: 'Operator Statistics',
				desc: 'Crossover rate, mutation rate, population info',
				code: function() {
					var pop    = val('galg-pop', '50');
					var budget = val('galg-budget', '500');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline('alg = result.method', '');
					c += cline(fn('println') + '("Algorithm:      ", alg)', '');
					c += cline(fn('println') + '("Population:     ", ' + pop + ')', '');
					c += cline(fn('println') + '("Max Iterations: ", ' + budget + ')', '');
					c += cline(fn('println') + '("Iterations run: ", result.iterations)', '');
					c += cline(fn('println') + '("Converged:      ", ' + ty('Evolutionary') + '.' + fn('converged') + '(result))', '');
					return c;
				},
			},
			{
				id: 'bounds-check',
				label: 'Bounds Feasibility',
				desc: 'Check that x_best satisfies all bounds',
				code: function() {
					var lb = val('galg-lb', 'fill(-5.0, n)');
					var ub = val('galg-ub', 'fill(5.0, n)');
					var n  = val('galg-n',  '2');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Evolutionary'), '');
					c += blank();
					c += cline('n = ' + n, '');
					c += cline('lb = ' + lb, '');
					c += cline('ub = ' + ub, '');
					c += cline('x_best = ' + ty('Evolutionary') + '.' + fn('minimizer') + '(result)', '');
					c += blank();
					c += cline('feasible = ' + fn('all') + '(lb .<= x_best .<= ub)', '');
					c += cline(fn('println') + '("Feasible: ", feasible)', '');
					c += cline(fn('println') + '("Violations: ", ' + fn('sum') + '((x_best .< lb) .| (x_best .> ub)))', '');
					return c;
				},
			},
		];

		document.getElementById('btn-viz').addEventListener('click', function() {
			showRightPanel(VISUALISE_ACTIONS, 'Visualise', 'btn-viz');
		});
		document.getElementById('btn-diagnose').addEventListener('click', function() {
			showRightPanel(DIAGNOSE_ACTIONS, 'Diagnose', 'btn-diagnose');
		});
		document.getElementById('btn-predict').addEventListener('click', function() {
			showRightPanel(PREDICT_ACTIONS, 'Predict', 'btn-predict');
		});
		document.getElementById('btn-compare').addEventListener('click', function() {
			showRightPanel(COMPARE_ACTIONS, 'Compare', 'btn-compare');
		});
		document.getElementById('btn-interpret').addEventListener('click', function() {
			showRightPanel(INTERPRET_ACTIONS, 'Interpret', 'btn-interpret');
		});

		// ── Wiki panel ───────────────────────────────────────────────────
		var wikiSections = [];

		function renderWikiPanel() {
			if (!wikiSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Local Wikis</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="nb-panel-scroll">';
			wikiSections.forEach(function(section) {
				if (section.label) {
					html += '<div class="nb-section-title">' + esc(section.label) + '</div>';
				}
				html += '<div class="right-action-grid">';
				section.wikis.forEach(function(w) {
					html += '<button class="nb-card" data-wiki="' + esc(w.file) + '">'
						+ '<span class="nb-label">' + esc(w.name) + '</span>'
						+ (w.description ? '<span class="nb-desc">' + esc(w.description) + '</span>' : '')
						+ '</button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-wiki]').forEach(function(card) {
				card.addEventListener('click', function() {
					vscode.postMessage({ command: 'openWiki', target: card.dataset.wiki });
				});
			});
		}

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (currentPanelId === 'btn-wiki') { hideRightPanel(); return; }
			currentPanelId = 'btn-wiki';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderWikiPanel();
			rightPanel.style.display = 'block';
		});

		// ── Notebook panel ───────────────────────────────────────────────
		var notebookSectionsData = [];

		function renderNotebookPanel() {
			if (!notebookSectionsData.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Notebook Tutorials</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="nb-panel-scroll">';
			notebookSectionsData.forEach(function(section) {
				if (section.label) {
					html += '<div class="nb-section-title">' + esc(section.label) + '</div>';
				}
				html += '<div class="right-action-grid">';
				section.notebooks.forEach(function(nb) {
					html += '<button class="nb-card" data-notebook="' + esc(nb.file) + '">'
						+ '<span class="nb-label">' + esc(nb.name) + '</span>'
						+ '<span class="nb-desc">' + esc(nb.description) + '</span>'
						+ '</button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-notebook]').forEach(function(card) {
				card.addEventListener('click', function() {
					vscode.postMessage({ command: 'openNotebook', target: card.dataset.notebook });
				});
			});
		}

		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (currentPanelId === 'btn-notebook-tutorials') { hideRightPanel(); return; }
			currentPanelId = 'btn-notebook-tutorials';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderNotebookPanel();
			rightPanel.style.display = 'block';
		});

		// ── Picker buttons ───────────────────────────────────────────────
		var activeBtn = null;
		var pickerJustClosed = false;

		function pressBtn(btn) {
			if (activeBtn) { activeBtn.classList.remove('panel-active'); }
			activeBtn = btn;
			btn.classList.add('panel-active');
		}
		function releaseBtn() {
			if (activeBtn) { activeBtn.classList.remove('panel-active'); activeBtn = null; }
			pickerJustClosed = true;
			setTimeout(function() { pickerJustClosed = false; }, 300);
		}

		document.getElementById('btn-documentation').addEventListener('click', function() {
			if (pickerJustClosed) { return; }
			if (activeBtn === this) { releaseBtn(); vscode.postMessage({ command: 'cancelAction' }); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openVideoList' });
		});
		document.getElementById('btn-paper').addEventListener('click', function() {
			if (pickerJustClosed) { return; }
			if (activeBtn === this) { releaseBtn(); vscode.postMessage({ command: 'cancelAction' }); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openDocs', target: 'paper' });
		});

		// ── Tooltip pin-on-click ─────────────────────────────────────────
		document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
			icon.addEventListener('click', function(e) {
				e.stopPropagation();
				var tip = this.nextElementSibling;
				if (tip && tip.classList.contains('tooltip-text')) {
					var wasPinned = tip.classList.contains('pinned');
					tip.classList.toggle('pinned');
					this.classList.toggle('pinned');
					if (wasPinned) {
						tip.style.display = 'none';
						this.addEventListener('mouseleave', function() { tip.style.display = ''; }, { once: true });
					}
				}
			});
		});

		// ── Textarea key capture ─────────────────────────────────────────
		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
			el.addEventListener('input', updateCodePreview);
		});

		// ── Inbound messages ─────────────────────────────────────────────
		window.addEventListener('message', function(event) {
			var msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'packageLinks') {
				var container = document.getElementById('package-links');
				container.innerHTML = '';
				var pkgs = msg.packages || [];
				pkgs.forEach(function(pkg, i) {
					var a = document.createElement('a');
					a.className = 'package-link';
					a.textContent = pkg.name;
					a.title = pkg.url;
					a.addEventListener('click', function(e) { e.preventDefault(); vscode.postMessage({ command: 'openUrl', url: pkg.url }); });
					container.appendChild(a);
					if (i < pkgs.length - 1) { container.appendChild(document.createTextNode(', ')); }
				});
			}
			if (msg.command === 'paperLinks') {
				var btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
			if (msg.command === 'notebookSections') { notebookSectionsData = msg.sections || []; }
			if (msg.command === 'wikiSections') { wikiSections = msg.sections || []; }
			if (msg.command === 'setModel') { setModel(msg.model); }
			if (msg.command === 'actionDone') { releaseBtn(); }
		});

		setModel('ga');
	</script>
</body>
</html>`;
}
