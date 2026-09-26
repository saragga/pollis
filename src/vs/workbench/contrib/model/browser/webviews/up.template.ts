/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getUpHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Uncertainty Propagation</title>
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
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; align-items: flex-end; }
		.form-row .form-group { margin-bottom: 0; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		select.form-input { font-family: var(--vscode-font-family); font-size: 13px; height: 37px; }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
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
		.columns-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; margin-top: 20px; }
		.columns-grid > div { display: flex; justify-content: center; }
		.column-inner { display: flex; flex-direction: column; }
		.column-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
		.column-list { list-style: none; padding: 0; margin: 0; }
		.column-list li { margin: 0; }
		.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; }
		.list-btn svg { flex-shrink: 0; }
		.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
			.list-btn.has-actions.was-pressed svg { color: var(--vscode-terminal-ansiBrightGreen); }
		.paper-links { display: none; }
		/* UP-specific */
		.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
		.section-label { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
		.vars-note { font-size: 11px; color: var(--vscode-descriptionForeground); margin: 3px 0 8px 0; }
		.inline-link { background: transparent; border: none; color: var(--vscode-textLink-foreground); cursor: pointer; font-size: 11px; font-family: var(--vscode-font-family); padding: 0; }
		.inline-link:hover { text-decoration: underline; }
		.add-var-btn { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--vscode-descriptionForeground); cursor: pointer; padding: 0; font-size: 12px; font-family: var(--vscode-font-family); }
		.add-var-btn:hover { color: var(--vscode-gitDecoration-addedResourceForeground); }
		.var-row { display: flex; align-items: center; gap: 5px; margin-bottom: 6px; flex-wrap: wrap; }
		.var-name { width: 55px; text-align: center; flex: 0 0 auto; }
		.var-sep { color: var(--vscode-descriptionForeground); flex: 0 0 auto; padding: 0 1px; }
		.var-dist { flex: 0 0 auto; min-width: 115px; }
		.var-params { display: flex; align-items: center; gap: 4px; }
		.var-param { width: 60px; text-align: center; flex: 0 0 auto; }
		.var-remove-btn { display: inline-flex; align-items: center; gap: 4px; background: transparent; border: none; color: var(--vscode-descriptionForeground); cursor: pointer; padding: 0 4px; font-size: 12px; font-family: var(--vscode-font-family); flex: 0 0 auto; margin-left: 4px; }
		.var-remove-btn:hover { color: var(--vscode-errorForeground); }
		.expr-textarea { white-space: pre-wrap !important; overflow-y: auto !important; height: 60px !important; resize: vertical !important; }
		#seed, #n-particles, #ci-level { text-align: center; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Uncertainty Propagation</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Particles (n) &#8212; Monte Carlo representation of uncertain quantities using n random samples from each input distribution</li>
					<li>Uncertain Inputs — define uncertain variables as probability distributions (Normal, Uniform, Beta, and more)</li>
					<li>Statistics — mean, standard deviation, and confidence intervals (CI) of the propagated output</li>
				</ul>
			</div>
		</div>

		<div class="section-header">
			<div class="section-label">Uncertain Inputs</div>
			<button class="add-var-btn" id="btn-add-var"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2z"/><path d="M5 7.5h6v1H5zM7.5 5v6h1V5z"/></svg>Add Variable</button>
		</div>
		<div id="vars-container"></div>
		<div class="vars-note">Inputs are treated as independent. For correlated variables, see <button class="inline-link" id="btn-correlated">Correlated Inputs</button> in Notebook Tutorials.</div>

		<div class="form-group" style="margin-top:4px;">
			<label class="form-label">Expression</label>
			<textarea id="expression" class="form-input expr-textarea" placeholder="x + y" rows="2"></textarea>
		</div>

		<div class="form-row">
			<div class="form-group" style="flex:0 0 auto;">
				<label class="form-label centered">Particles (n)</label>
				<select id="n-particles" class="form-input" style="width:110px;">
					<option value="100">100</option>
					<option value="500">500</option>
					<option value="1000" selected>1000</option>
					<option value="2000">2000</option>
					<option value="5000">5000</option>
					<option value="10000">10000</option>
				</select>
			</div>
			<div class="form-group" style="flex:0 0 auto;">
				<label class="form-label centered">Seed (optional)</label>
				<textarea id="seed" class="form-input" placeholder="e.g. 42" rows="1" style="width:130px;"></textarea>
			</div>
			<div class="form-group" style="flex:0 0 auto;">
				<label class="form-label centered">CI Level</label>
				<select id="ci-level" class="form-input" style="width:90px;">
					<option value="90">90%</option>
					<option value="95" selected>95%</option>
					<option value="99">99%</option>
				</select>
			</div>
		</div>

		<div class="code-preview-wrapper">
			<div class="code-preview" id="code-preview"></div>
			<button class="copy-btn" id="btn-copy">Copy</button>
		</div>

		<div class="columns-grid">
			<div>
				<div class="column-inner">
					<div class="column-title">Next Steps</div>
					<ul class="column-list">
						<li><button class="list-btn" id="btn-viz"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 15H14.5C14.776 15 15 14.776 15 14.5C15 14.224 14.776 14 14.5 14H2V9.70799L5.00001 6.70798L6.64601 8.35398C6.84101 8.54898 7.15801 8.54898 7.35301 8.35398L11.499 4.20798L13.145 5.85398C13.34 6.04898 13.657 6.04898 13.852 5.85398C14.047 5.65898 14.047 5.34198 13.852 5.14698L11.852 3.14698C11.657 2.95198 11.34 2.95198 11.145 3.14698L6.99901 7.29298L5.35301 5.64698C5.15801 5.45198 4.84101 5.45198 4.64601 5.64698L2 8.29299V1.5C2 1.224 1.776 1 1.5 1C1.224 1 1 1.224 1 1.5V9.4848C0.999674 9.49525 0.999674 9.50571 1 9.51617V14.5C1 14.776 1.224 15 1.5 15Z"/></svg>Visualise</button></li>
						<li><button class="list-btn" id="btn-diagnostics"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
						<li><button class="list-btn" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>Predict</button></li>
						<li><button class="list-btn" id="btn-alternative"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>Compare</button></li>
					</ul>
				</div>
			</div>
			<div>
				<div class="column-inner">
					<div class="column-title">Learn More</div>
					<ul class="column-list">
						<li><button class="list-btn has-actions" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
						<li><button class="list-btn has-actions" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>Notebook Tutorials</button></li>
						<li><button class="list-btn" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM10.712 8C10.712 8.153 10.63 8.294 10.498 8.371L6.964 10.413C6.536 10.66 6 10.351 6 9.857V6.144C6 5.649 6.536 5.34 6.964 5.588L10.498 7.63C10.631 7.707 10.712 7.847 10.712 8Z"/></svg>Multimedia Tutorials</button></li>
						<li><button class="list-btn" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>References</button></li>
					</ul>
					<div class="paper-links" id="paper-links"></div>
				</div>
			</div>
		</div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();

		const DISTS = {
			'Normal':         { label: 'Normal',      params: [{n:'\\u03bc', l:'\\u03bc (mean)',    d:'0.0'}, {n:'\\u03c3', l:'\\u03c3 (std)',     d:'1.0'}] },
			'Uniform':        { label: 'Uniform',     params: [{n:'a',       l:'a (lower)',          d:'0.0'}, {n:'b',       l:'b (upper)',          d:'1.0'}] },
			'LogNormal':      { label: 'LogNormal',   params: [{n:'\\u03bc', l:'\\u03bc (log-mean)', d:'0.0'}, {n:'\\u03c3', l:'\\u03c3 (log-std)',  d:'1.0'}] },
			'TriangularDist': { label: 'Triangular',  params: [{n:'a',       l:'a (lower)',          d:'0.0'}, {n:'b',       l:'b (upper)',          d:'1.0'}, {n:'c', l:'c (mode)', d:'0.5'}] },
			'Exponential':    { label: 'Exponential', params: [{n:'\\u03b8', l:'\\u03b8 (scale)',    d:'1.0'}] },
			'Beta':           { label: 'Beta',        params: [{n:'\\u03b1', l:'\\u03b1 (alpha)',    d:'2.0'}, {n:'\\u03b2', l:'\\u03b2 (beta)',     d:'5.0'}] },
			'Gamma':          { label: 'Gamma',       params: [{n:'\\u03b1', l:'\\u03b1 (shape)',    d:'2.0'}, {n:'\\u03b8', l:'\\u03b8 (scale)',    d:'1.0'}] },
			'TDist':          { label: 'TDist',       params: [{n:'\\u03bd', l:'\\u03bd (df)',       d:'5'}] },
		};

		const CI_ALPHA = {
			'90': [0.05,  0.95],
			'95': [0.025, 0.975],
			'99': [0.005, 0.995],
		};

		let nextVarId = 1;

		function esc(s)  { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)   { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function ty(s)   { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function fn(s)   { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function line(s) { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, comment) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(comment) + '</span></div>'; }
		function blank() { return '<div class="code-blank"></div>'; }

		function renderParamsInner(dist, presetValues) {
			const d = DISTS[dist];
			if (!d || d.params.length === 0) { return ''; }
			const parts = d.params.map((p, i) => {
				const val = (presetValues && presetValues[i] !== undefined) ? presetValues[i] : p.d;
				return '<textarea class="form-input var-param" data-idx="' + i + '" title="' + p.l + '" placeholder="' + p.d + '" rows="1">' + esc(val) + '</textarea>';
			});
			return '<span class="var-sep">(</span>' + parts.join('<span class="var-sep">, </span>') + '<span class="var-sep">)</span>';
		}

		function renderVarRowHtml(varId, nameVal, dist, presetValues) {
			const distOpts = Object.entries(DISTS).map(([k, v]) =>
				'<option value="' + k + '"' + (k === dist ? ' selected' : '') + '>' + v.label + '</option>'
			).join('');
			return '<div class="var-row" data-id="' + varId + '">' +
				'<textarea class="form-input var-name" placeholder="x" rows="1">' + esc(nameVal) + '</textarea>' +
				'<span class="var-sep">~</span>' +
				'<select class="form-input var-dist">' + distOpts + '</select>' +
				'<div class="var-params">' + renderParamsInner(dist, presetValues) + '</div>' +
				'<button class="var-remove-btn"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2z"/><path d="M5 7.5h6v1H5z"/></svg>Remove Variable</button>' +
				'</div>';
		}

		function addVar(nameVal, dist, presetValues) {
			const varId = nextVarId++;
			const container = document.getElementById('vars-container');
			const div = document.createElement('div');
			div.innerHTML = renderVarRowHtml(varId, nameVal || 'x', dist || 'Normal', presetValues || null);
			container.appendChild(div.firstChild);
			updateCodePreview();
		}

		function updateDistParams(varRow, dist) {
			const paramsDiv = varRow.querySelector('.var-params');
			if (paramsDiv) {
				paramsDiv.innerHTML = renderParamsInner(dist, null);
			}
			updateCodePreview();
		}

		function updateCodePreview() {
			const N = document.getElementById('n-particles').value;
			const seed = document.getElementById('seed').value.trim();
			const ciLevel = document.getElementById('ci-level').value;
			const expr = document.getElementById('expression').value.trim() || 'x + y';
			const [loQ, hiQ] = CI_ALPHA[ciLevel] || [0.025, 0.975];

			const html = [];

			html.push(line(kw('using') + ' ' + ty('MonteCarloMeasurements') + ', ' + ty('Distributions')));
			if (seed) { html.push(line(kw('using') + ' ' + ty('Random'))); }
			if (seed) { html.push(cline(fn('Random.seed!') + '(' + esc(seed) + ')', 'for reproducibility')); }
			html.push(blank());
			html.push(cline('n = ' + esc(N), 'number of particles'));

			const varRows = document.querySelectorAll('#vars-container .var-row');
			varRows.forEach(varRow => {
				const nameEl = varRow.querySelector('.var-name');
				const distSel = varRow.querySelector('.var-dist');
				const paramEls = varRow.querySelectorAll('.var-param');

				const varName = (nameEl && nameEl.value.trim()) || 'x';
				const dist = distSel ? distSel.value : 'Normal';
				const d = DISTS[dist];
				if (!d) { return; }

				const paramVals = Array.from(paramEls).map((el, i) => el.value.trim() || d.params[i].d);
				const commentParams = d.params.map((p, i) => p.n + '=' + paramVals[i]).join(', ');
				const comment = varName + ' ~ ' + d.label + '(' + commentParams + ')';

				html.push(cline(esc(varName) + ' = ' + ty('Particles') + '(n, ' + ty(dist) + '(' + paramVals.map(esc).join(', ') + '))', comment));
			});

			html.push(blank());
			html.push(cline('result = ' + esc(expr), 'propagated output'));
			html.push(blank());
			html.push(line(fn('println') + '("Mean:  ", ' + fn('mean') + '(result))'));
			html.push(line(fn('println') + '("Std:   ", ' + fn('std') + '(result))'));
			html.push(cline(
				fn('println') + '("' + esc(ciLevel) + '% CI: [", ' + fn('quantile') + '(result, ' + loQ + '), ", ", ' + fn('quantile') + '(result, ' + hiQ + '), "]")',
				ciLevel + '% confidence interval'
			));

			document.getElementById('code-preview').innerHTML = html.join('');
		}

		const varsContainer = document.getElementById('vars-container');

		varsContainer.addEventListener('input', () => updateCodePreview());

		varsContainer.addEventListener('change', e => {
			const distSel = e.target.closest('.var-dist');
			if (distSel) {
				const varRow = distSel.closest('.var-row');
				if (varRow) { updateDistParams(varRow, distSel.value); }
			}
		});

		varsContainer.addEventListener('click', e => {
			const removeBtn = e.target.closest('.var-remove-btn');
			if (removeBtn) {
				const varRow = removeBtn.closest('.var-row');
				if (varRow) {
					const rows = varsContainer.querySelectorAll('.var-row');
					if (rows.length > 1) { varRow.remove(); updateCodePreview(); }
				}
			}
		});

		document.getElementById('btn-add-var').addEventListener('click', () => {
			const rows = varsContainer.querySelectorAll('.var-row');
			const nextName = String.fromCharCode(120 + rows.length); // x, y, z, {, |, ...
			addVar(nextName, 'Normal', null);
		});

		['n-particles', 'ci-level'].forEach(id => {
			document.getElementById(id).addEventListener('change', updateCodePreview);
		});

		document.getElementById('seed').addEventListener('input', updateCodePreview);
		document.getElementById('expression').addEventListener('input', updateCodePreview);

		document.getElementById('btn-copy').addEventListener('click', () => {
			const lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
			const text = Array.from(lines).map(l => l.textContent || '').join('\\n');
			navigator.clipboard.writeText(text).then(() => {
				const btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
			});
		});

		var activeBtn = null;
		function pressBtn(btn) {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
			activeBtn = btn;
			btn.classList.add('was-pressed');
		}
		function releaseBtn() {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); activeBtn = null; }
		}

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
		window.addEventListener('message', event => {
			const msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'packageLinks') {
				const container = document.getElementById('package-links');
				if (container) {
					container.innerHTML = '';
					(msg.packages || []).forEach((pkg, i) => {
						const a = document.createElement('a');
						a.className = 'package-link';
						a.textContent = pkg.name;
						a.title = pkg.url;
						a.addEventListener('click', e => { e.preventDefault(); vscode.postMessage({ command: 'openUrl', url: pkg.url }); });
						container.appendChild(a);
						if (i < msg.packages.length - 1) { container.appendChild(document.createTextNode(', ')); }
					});
				}
			}
			if (msg.command === 'paperLinks') {
				const btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
		});

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openDocs', target: 'wiki' }); }
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openNotebookList' }); }
		});
		document.getElementById('btn-documentation').addEventListener('click', () => vscode.postMessage({ command: 'openDocs', target: 'documentation' }));
		document.getElementById('btn-paper').addEventListener('click', () => vscode.postMessage({ command: 'openDocs', target: 'paper' }));
		document.getElementById('btn-viz').addEventListener('click', () => vscode.postMessage({ command: 'openPanel', target: 'visualization' }));
		document.getElementById('btn-diagnostics').addEventListener('click', () => vscode.postMessage({ command: 'openPanel', target: 'sensitivity' }));
		document.getElementById('btn-alternative').addEventListener('click', () => vscode.postMessage({ command: 'openPanel', target: 'alternative-methods' }));
		document.getElementById('btn-correlated').addEventListener('click', () => vscode.postMessage({ command: 'openNotebook', target: 'up/tutorial-05-correlated-inputs.ipynb' }));

		// Init
		addVar('x', 'Normal', ['0.0', '1.0']);
		addVar('y', 'Uniform', ['0.0', '1.0']);
	</script>
</body>
</html>`;
}
