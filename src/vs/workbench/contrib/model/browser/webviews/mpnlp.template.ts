/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getMpnlpHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Nonlinear Programming</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.header { margin-bottom: 16px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; }
		.decision-table { border-collapse: collapse; width: 100%; font-size: 12px; }
		.decision-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--vscode-widget-border); color: var(--vscode-foreground); font-weight: 600; }
		.decision-table td { padding: 5px 10px; border-bottom: 1px solid var(--vscode-widget-border); color: var(--vscode-foreground); vertical-align: top; line-height: 1.4; }
		.decision-table tr:last-child td { border-bottom: none; }
		.decision-table td:first-child { color: var(--vscode-textLink-foreground); font-weight: 500; white-space: nowrap; }
		.decision-table td:nth-child(2) { white-space: nowrap; }
		.decision-table td:nth-child(3) { white-space: nowrap; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.model-toggle { display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; flex-wrap: wrap; }
		.toggle-btn { background: var(--vscode-list-hoverBackground); border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 35px; transition: background 0.15s; white-space: nowrap; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-activeSelectionBackground); }
		.illus-section { margin: 0 0 20px 0; }
		.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.illus-toggle:hover { text-decoration: underline; }
		.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
		.illus-section.collapsed .illus-body { display: none; }
		.illus-body { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px 20px; overflow-x: auto; }
		.illus-caption { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; margin-top: 10px; font-style: italic; line-height: 1.5; }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon:hover { opacity: 0.8; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 300px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		select.form-input { height: 37px; cursor: pointer; }
		.param-input { text-align: center; }
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-blank { margin: 8px 0; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-symbolIcon-keywordForeground); }
		.hl-fn      { color: var(--vscode-textPreformat-foreground); }
		.hl-type    { color: var(--vscode-symbolIcon-classForeground); }
		.hl-number  { color: var(--vscode-debugTokenExpression-number); }
		.hl-string  { color: var(--vscode-debugTokenExpression-string); }
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
			<h1>Nonlinear Programming</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<table class="decision-table">
					<thead>
						<tr><th>Method</th><th>Constraints</th><th>Solvers</th><th>Use when</th></tr>
					</thead>
					<tbody>
						<tr>
							<td>NLP</td>
							<td>Nonlinear (smooth)</td>
							<td>Ipopt, SCIP</td>
							<td>Smooth objective and constraints; MLE, ODE fitting, trajectory optimisation</td>
						</tr>
						<tr>
							<td>MINLP</td>
							<td>Nonlinear + integer</td>
							<td>SCIP</td>
							<td>Robust general-purpose MINLP; handles non-smooth constraints; unit commitment, network design</td>
						</tr>
						<tr>
							<td>MINLP</td>
							<td>Smooth nonlinear + integer</td>
							<td>Ipopt + Juniper</td>
							<td>Twice-differentiable NLP; Ipopt solves each Branch and Bound node relaxation; process design, power flow</td>
						</tr>
						<tr>
							<td>Global NLP</td>
							<td>Nonconvex nonlinear (small–medium)</td>
							<td>EAGO</td>
							<td>Pure Julia; zero binary deps; prototyping, parameter estimation, chemical equilibrium</td>
						</tr>
						<tr>
							<td>Global NLP</td>
							<td>Nonconvex nonlinear (large-scale)</td>
							<td>Couenne</td>
							<td>Mature spatial Branch and Bound; scales to harder instances; pooling problems, process design</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div class="model-toggle" id="model-group">
			<button class="toggle-btn active" data-model="nlp">Nonlinear Programming (NLP)</button>
			<button class="toggle-btn" data-model="minlp">Mixed-Integer NLP (MINLP)</button>
			<button class="toggle-btn" data-model="gnlp">Global NLP</button>
		</div>

		<div class="illus-section collapsed" id="illus-section">
			<button class="illus-toggle" id="illus-toggle">
				<svg class="illus-chevron" width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.357-4.357-.62.618L7.976 11.31l4.977-4.976-.62-.618-4.357 4.356z"/></svg>
				Illustration
			</button>
			<div class="illus-body" id="illus-body">
				<div style="text-align:center;color:var(--vscode-descriptionForeground);font-style:italic;padding:12px 0;">Coming soon!</div>
			</div>
		</div>

		<div class="form-row">
			<div class="form-group" style="flex:1;min-width:0;">
				<label class="form-label centered form-label-with-tooltip">variables
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Name of the decision variable vector, e.g. x. Used as @variable(model, x[1:n])</span>
				</label>
				<textarea id="mpnlp-vars" class="form-input param-input" placeholder="x" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1;min-width:0;">
				<label class="form-label centered form-label-with-tooltip">n
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Number of decision variables; dimension of the vector x</span>
				</label>
				<textarea id="mpnlp-n" class="form-input param-input" placeholder="5" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:2;min-width:0;">
				<label class="form-label centered form-label-with-tooltip">objective
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Nonlinear objective expression in terms of the variable, e.g. sum(x.^2) or (x[1]-1)^2 + (x[2]-2)^2. Registered nonlinear functions must be added via @operator</span>
				</label>
				<textarea id="mpnlp-obj" class="form-input param-input" placeholder="sum(x.^2)" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:1;min-width:0;">
				<label class="form-label centered form-label-with-tooltip">sense
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Direction of optimisation: Minimise or Maximise</span>
				</label>
				<select id="mpnlp-sense" class="form-input">
					<option value="Min">Minimise</option>
					<option value="Max">Maximise</option>
				</select>
			</div>
			<div class="form-group" style="flex:1;min-width:0;">
				<label class="form-label centered form-label-with-tooltip">solver
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Backend solver. Ipopt uses interior-point methods and is the standard choice for smooth nonlinear problems; SCIP handles non-convex and mixed-integer nonlinear programmes. See the solver guide above</span>
				</label>
				<select id="mpnlp-solver" class="form-input">
					<option value="Ipopt">Ipopt</option>
					<option value="SCIP">SCIP</option>
				</select>
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
					<li><button class="list-btn panel-toggle" id="btn-viz"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 15H14.5C14.776 15 15 14.776 15 14.5C15 14.224 14.776 14 14.5 14H2V9.70799L5.00001 6.70798L6.64601 8.35398C6.84101 8.54898 7.15801 8.54898 7.35301 8.35398L11.499 4.20798L13.145 5.85398C13.34 6.04898 13.657 6.04898 13.852 5.85398C14.047 5.65898 14.047 5.34198 13.852 5.14698L11.852 3.14698C11.657 2.95198 11.34 2.95198 11.145 3.14698L6.99901 7.29298L5.35301 5.64698C5.15801 5.45198 4.84101 5.45198 4.64601 5.64698L2 8.29299V1.5C2 1.224 1.776 1 1.5 1C1.224 1 1 1.224 1 1.5V9.4848C0.999674 9.49525 0.999674 9.50571 1 9.51617V14.5C1 14.776 1.224 15 1.5 15Z"/></svg>Visualise</button></li>
					<li><button class="list-btn panel-toggle" id="btn-diagnose"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
					<li><button class="list-btn panel-toggle" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>Predict</button></li>
					<li><button class="list-btn panel-toggle" id="btn-compare"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>Compare</button></li>
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.37305 2.157H8.37105L8.19905 2.212C8.14005 2.233 8.08905 2.272 8.05305 2.323C8.01705 2.374 7.99705 2.435 7.99705 2.498C7.99705 2.561 8.01705 2.622 8.05305 2.672C8.08905 2.723 8.14005 2.761 8.19905 2.782ZM11.62 7.538C11.609 7.503 11.588 7.468 11.558 7.439C11.528 7.41 11.493 7.388 11.455 7.375L11.341 7.337C11.279 7.544 11.199 7.746 11.102 7.941C10.86 8.425 10.518 8.851 10.098 9.192L9.99005 9.292L9.54105 11H6.49205L6.14305 9.536L6.04305 9.436C5.18305 8.706 4.63105 7.677 4.49805 6.556C4.51205 5.607 4.88505 4.699 5.54105 4.013C5.86205 3.688 6.24505 3.432 6.66705 3.258C6.82305 3.194 6.98305 3.141 7.14505 3.101C7.05005 2.921 6.99805 2.713 6.99805 2.497C6.99805 2.358 7.02005 2.223 7.06205 2.094C6.79605 2.15 6.53505 2.23 6.28205 2.335C5.73805 2.56 5.24505 2.892 4.83105 3.31C3.99305 4.18 3.51605 5.336 3.49805 6.544V6.582C3.62305 7.911 4.24305 9.144 5.23505 10.037L5.93505 12.978L5.94305 13C6.04105 13.289 6.22805 13.54 6.47705 13.717C6.73405 13.901 7.04305 14 7.36005 14H8.76405C9.07305 13.974 9.36605 13.854 9.60405 13.655C9.84305 13.456 10.012 13.185 10.085 12.882L10.885 9.832C11.33 9.443 11.697 8.975 11.968 8.452C11.91 8.365 11.862 8.27 11.827 8.169L11.62 7.538ZM9.11605 12.628V12.641C9.09405 12.735 9.04105 12.82 8.96605 12.881C8.89105 12.947 8.79705 12.988 8.69805 13H7.35905C7.25105 12.999 7.14605 12.964 7.05905 12.9C6.98705 12.85 6.93105 12.781 6.89805 12.7L6.73105 12H9.28005L9.11605 12.628ZM14.956 5.862C14.927 5.822 14.886 5.791 14.839 5.774L14.827 5.771L14.215 5.572V5.574C14.029 5.512 13.86 5.408 13.721 5.269C13.582 5.13 13.478 4.961 13.416 4.775L13.217 4.163C13.201 4.116 13.17 4.075 13.129 4.046C13.088 4.018 13.039 4.002 12.989 4.002C12.939 4.002 12.89 4.017 12.849 4.046C12.809 4.075 12.778 4.116 12.761 4.163L12.562 4.775C12.501 4.959 12.399 5.127 12.262 5.266C12.126 5.404 11.959 5.51 11.775 5.573L11.163 5.772C11.116 5.788 11.074 5.819 11.046 5.86C11.018 5.901 11.002 5.95 11.002 6C11.002 6.05 11.017 6.099 11.046 6.14C11.075 6.18 11.116 6.211 11.163 6.228L11.746 6.417V6.42L11.77 6.428C11.957 6.49 12.126 6.594 12.265 6.733C12.403 6.872 12.508 7.042 12.57 7.228L12.77 7.84C12.786 7.887 12.817 7.928 12.858 7.957C12.898 7.985 12.945 8.001 12.994 8.001H13.001C13.051 8.001 13.1 7.986 13.141 7.957C13.182 7.928 13.212 7.887 13.229 7.84L13.428 7.228C13.49 7.042 13.594 6.873 13.733 6.734C13.872 6.595 14.041 6.491 14.227 6.429L14.839 6.23C14.886 6.214 14.928 6.183 14.956 6.142C14.984 6.101 15 6.052 15 6.002C15 5.952 14.985 5.903 14.956 5.862Z"/></svg>Interpret</button></li>
				</ul>
				<hr class="strip-divider">
				<div class="strip-title">Learn More</div>
				<ul class="column-list">
					<li><button class="list-btn panel-toggle" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
					<li><button class="list-btn panel-toggle" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>Notebook Tutorials</button></li>
					<li><button class="list-btn has-actions" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM10.712 8C10.712 8.153 10.63 8.294 10.498 8.371L6.964 10.413C6.536 10.66 6 10.351 6 9.857V6.144C6 5.649 6.536 5.34 6.964 5.588L10.498 7.63C10.631 7.707 10.712 7.847 10.712 8Z"/></svg>Multimedia Tutorials</button></li>
					<li><button class="list-btn has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>Explore References</button></li>
				</ul>
				<div class="paper-links" id="paper-links"></div>
			</div>
			<div class="right-panel" id="right-panel"></div>
		</div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();
		var currentModel = 'nlp';
		var activeBtn = null;
		var pickerJustClosed = false;
		var currentPanelId = null;
		var notebookSections = [];
		var wikiSections = [];
		var rightPanel = document.getElementById('right-panel');

		var MODELS = ['nlp', 'minlp', 'gnlp'];
			var NLP_SOLVER_OPTIONS   = [{value:'Ipopt',label:'Ipopt'},{value:'SCIP',label:'SCIP'}];
			var MINLP_SOLVER_OPTIONS = [{value:'SCIP',label:'SCIP'},{value:'Juniper+Ipopt',label:'Ipopt + Juniper'}];
			var GNLP_SOLVER_OPTIONS  = [{value:'EAGO',label:'EAGO'},{value:'Couenne',label:'Couenne'}];

		function esc(s)      { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }
		function sel(id, fb) { var el = document.getElementById(id); return esc((el && el.value) || fb); }

		function isJuniper(s)    { return s.indexOf('Juniper') === 0; }
		function isCouenne(s)    { return s === 'Couenne'; }
		function jNlp(s)         { return 'Ipopt'; }
		function solverImport(s) {
			if (isJuniper(s)) { return ty('JuMP') + ', ' + ty('Juniper') + ', ' + ty(jNlp(s)); }
			if (isCouenne(s)) { return ty('JuMP') + ', ' + ty('CouenneNL'); }
			return ty('JuMP') + ', ' + ty(s);
		}
		function solverModel(s) {
			if (isJuniper(s)) { return fn('Model') + '(' + fn('optimizer_with_attributes') + '(' + ty('Juniper') + '.Optimizer, "nl_solver" => ' + ty(jNlp(s)) + '.Optimizer))'; }
			if (isCouenne(s)) { return fn('Model') + '(' + ty('CouenneNL') + '.Optimizer)'; }
			return fn('Model') + '(' + ty(s) + '.Optimizer)';
		}

		function getEffectiveSolver() {
			var fb = currentModel === 'minlp' ? 'SCIP' : currentModel === 'gnlp' ? 'EAGO' : 'Ipopt';
			return sel('mpnlp-solver', fb);
		}

		function updateSolverOptions() {
			var selEl = document.getElementById('mpnlp-solver');
			var opts = currentModel === 'minlp' ? MINLP_SOLVER_OPTIONS : currentModel === 'gnlp' ? GNLP_SOLVER_OPTIONS : NLP_SOLVER_OPTIONS;
			selEl.innerHTML = '';
			opts.forEach(function(o) {
				var opt = document.createElement('option');
				opt.value = o.value;
				opt.textContent = o.label;
				selEl.appendChild(opt);
			});
		}

		function updateCodePreview() {
			var xvar   = val('mpnlp-vars', 'x');
			var n      = val('mpnlp-n', '5');
			var obj    = val('mpnlp-obj', 'sum(' + xvar + '.^2)');
			var sense  = sel('mpnlp-sense', 'Min');
			var solver = getEffectiveSolver();
			var senseLabel = sense === 'Min' ? 'minimise' : 'maximise';
			var c = '';

			if (currentModel === 'minlp') {
				var minlpComment = isJuniper(solver) ? jNlp(solver) + ' + Juniper outer Branch and Bound; ' + jNlp(solver) + ' solves each NLP node' : 'SCIP handles MINLP internally';
				c += cline(kw('using') + ' ' + solverImport(solver), minlpComment);
			} else if (currentModel === 'gnlp') {
				var gnlpComment = isCouenne(solver) ? 'global NLP via CouenneNL (spatial Branch and Bound)' : 'global NLP; Branch and Bound with convex relaxations';
				c += cline(kw('using') + ' ' + solverImport(solver), gnlpComment);
			} else {
				c += cline(kw('using') + ' ' + solverImport(solver), 'nonlinear programming (NLP)');
			}
			c += blank();
			var modelComment = currentModel === 'gnlp' ? 'global optimiser — certifies global optimum' : 'initialise model';
			c += cline('model = ' + solverModel(solver), modelComment);
			c += cline(fn('@variable') + '(model, ' + xvar + '[1:' + n + '])', 'decision variables (free)');

			if (currentModel === 'minlp') {
				c += cline(fn('@variable') + '(model, y[1:' + n + '], ' + ty('Bin') + ')', 'binary selection indicators');
			}

			c += cline(fn('@objective') + '(model, ' + ty(sense) + ', ' + obj + ')', senseLabel + ' nonlinear objective');
			c += cline(fn('@constraint') + '(model, ' + fn('sum') + '(' + xvar + ') == 1)', 'equality constraint');
			c += cline(fn('@constraint') + '(model, ' + fn('sum') + '(' + xvar + ' .^ 2) &lt;= r)', 'nonlinear inequality constraint');

			if (currentModel === 'minlp') {
				c += cline(fn('@constraint') + '(model, [i=1:' + n + '], ' + xvar + '[i] &lt;= y[i])', 'link continuous to binary');
				c += cline(fn('@constraint') + '(model, ' + fn('sum') + '(y) &lt;= k)', 'at most k selected');
			}

			c += cline(fn('optimize!') + '(model)', 'solve');
			c += blank();
			if (currentModel === 'gnlp') {
				c += cline(fn('println') + '("Status: ", ' + fn('termination_status') + '(model))', 'OPTIMAL certifies global optimum');
				c += cline(fn('println') + '("Global optimal value: ", ' + fn('objective_value') + '(model))', 'certified global minimum/maximum');
			} else {
				c += cline(fn('println') + '("Status: ", ' + fn('termination_status') + '(model))', 'OPTIMAL if feasible and smooth');
				c += cline(fn('println') + '("Optimal value: ", ' + fn('objective_value') + '(model))', 'objective at optimum');
			}
			c += cline(fn('println') + '("Solution: ", ' + fn('value') + '.(' + xvar + '))', 'optimal variable values');

			document.getElementById('code-preview').innerHTML = c;
		}

		document.getElementById('illus-toggle').addEventListener('click', function() {
			document.getElementById('illus-section').classList.toggle('collapsed');
		});

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			updateSolverOptions();
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		['mpnlp-vars', 'mpnlp-n', 'mpnlp-obj'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) {
				el.addEventListener('input', updateCodePreview);
				el.addEventListener('keydown', function(e) { e.stopPropagation(); });
			}
		});
		['mpnlp-sense', 'mpnlp-solver'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('change', updateCodePreview); }
		});

		// ── Right panel ────────────────────────────────────────────────────────
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

		// ── Notebook and wiki panels ───────────────────────────────────────────
		function renderNotebookPanel() {
			if (!notebookSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Notebook Tutorials</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="nb-panel-scroll">';
			notebookSections.forEach(function(section) {
				if (section.label) { html += '<div class="nb-section-title">' + esc(section.label) + '</div>'; }
				html += '<div class="right-action-grid">';
				section.notebooks.forEach(function(n) {
					html += '<button class="nb-card" data-nb="' + esc(n.file) + '">'
						+ '<span class="nb-label">' + esc(n.name) + '</span>'
						+ (n.description ? '<span class="nb-desc">' + esc(n.description) + '</span>' : '')
						+ '</button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-nb]').forEach(function(card) {
				card.addEventListener('click', function() {
					vscode.postMessage({ command: 'openNotebook', target: card.dataset.nb });
				});
			});
		}

		function renderWikiPanel() {
			if (!wikiSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Local Wikis</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="nb-panel-scroll">';
			wikiSections.forEach(function(section) {
				if (section.label) { html += '<div class="nb-section-title">' + esc(section.label) + '</div>'; }
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

		// ── Action arrays ──────────────────────────────────────────────────────
		var VISUALISE_ACTIONS = [
			{
				id: 'mpnlp-objective-surface',
				label: 'Objective Surface',
				desc: 'Plot f(x1, x2) as a surface for 2-variable problems',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('Plots'), 'surface plot');
					c += blank();
					c += cline('x1 = range(-2, 2; length=40)', 'grid axis 1');
					c += cline('x2 = range(-2, 2; length=40)', 'grid axis 2');
					c += cline('z = [f(a, b) for b in x2, a in x1]', 'evaluate objective on grid');
					c += cline(fn('surface') + '(x1, x2, z; xlabel="x1", ylabel="x2", zlabel="f", title="Objective Surface")', 'plot');
					return c;
				},
			},
			{
				id: 'mpnlp-convergence',
				label: 'Convergence History',
				desc: 'Plot objective value vs iteration using Ipopt callback',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('Ipopt') + ', ' + ty('Plots'), 'NLP + plotting');
					c += blank();
					c += cline('obj_history = Float64[]', 'collect objective per iteration');
					c += blank();
					c += cline(kw('function') + ' iter_callback(alg_mod, iter_count, obj_value, inf_pr, inf_du, mu, d_norm, regularization_size, alpha_du, alpha_pr, ls_trials)', 'Ipopt callback');
					c += line('    ' + fn('push!') + '(obj_history, obj_value)');
					c += line('    ' + kw('return') + ' true');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('set_optimizer_attribute') + '(model, "intermediate_callback", iter_callback)', 'register callback');
					c += cline(fn('optimize!') + '(model)', 'solve');
					c += blank();
					c += cline(fn('plot') + '(obj_history; xlabel="Iteration", ylabel="Objective", title="Convergence")', 'plot convergence');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'mpnlp-feasibility',
				label: 'Feasibility Check',
				desc: 'Inspect termination status and constraint violations',
				code: function() {
					var solver = getEffectiveSolver();
					var c = '';
					c += cline(kw('using') + ' ' + solverImport(solver), currentModel === 'minlp' ? 'MINLP framework' : 'NLP framework');
					c += blank();
					c += cline(fn('optimize!') + '(model)', 'solve');
					c += cline(kw('if') + ' ' + fn('termination_status') + '(model) == ' + ty('MOI') + '.OPTIMAL', 'check status');
					c += line('    ' + fn('println') + '("Optimal solution found")');
					c += cline(kw('elseif') + ' ' + fn('termination_status') + '(model) == ' + ty('MOI') + '.LOCALLY_SOLVED', 'local optimum');
					c += line('    ' + fn('println') + '("Locally optimal (nonconvex problem)")');
					c += cline(kw('elseif') + ' ' + fn('termination_status') + '(model) == ' + ty('MOI') + '.INFEASIBLE', 'no feasible point');
					c += line('    ' + fn('println') + '("Problem is infeasible")');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('println') + '("Primal status: ", ' + fn('primal_status') + '(model))', 'feasibility detail');
					return c;
				},
			},
			{
				id: 'mpnlp-gradient-check',
				label: 'Gradient Check',
				desc: 'Finite-difference verification of analytic gradients',
				code: function() {
					var xvar = val('mpnlp-vars', 'x');
					var c = '';
					c += cline(kw('using') + ' ' + ty('FiniteDiff') + ', ' + ty('LinearAlgebra'), 'finite-difference tools');
					c += blank();
					c += cline('x0 = ' + fn('ones') + '(5)', 'evaluation point');
					c += cline('grad_analytic = ' + fn('gradient') + '(f, x0)', 'analytic gradient');
					c += cline('grad_fd = FiniteDiff.' + fn('finite_difference_gradient') + '(f, x0)', 'finite-difference gradient');
					c += blank();
					c += cline(fn('println') + '("Max gradient error: ", ' + fn('norm') + '(grad_analytic .- grad_fd, Inf))', 'should be small');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'mpnlp-sensitivity',
				label: 'Sensitivity Analysis',
				desc: 'Dual variables: marginal cost of relaxing each constraint',
				code: function() {
					var solver = getEffectiveSolver();
					var c = '';
					c += cline(kw('using') + ' ' + solverImport(solver), currentModel === 'minlp' ? 'MINLP framework' : 'NLP framework');
					c += blank();
					c += cline(fn('optimize!') + '(model)', 'solve first');
					c += blank();
					c += cline('cons = ' + fn('all_constraints') + '(model; include_variable_in_set_constraints=false)', 'all constraints');
					c += cline(kw('for') + ' (i, con) ' + kw('in') + ' ' + fn('enumerate') + '(cons)', 'dual variables');
					c += line('    ' + fn('println') + '("Constraint ", i, ": dual = ", ' + fn('dual') + '(con))');
					c += line(kw('end'));
					return c;
				},
			},
			{
				id: 'mpnlp-parametric',
				label: 'Parametric Sweep',
				desc: 'Vary a problem parameter and track how the optimal value changes',
				code: function() {
					var solver = getEffectiveSolver();
					var sense  = sel('mpnlp-sense', 'Min');
					var xvar   = val('mpnlp-vars', 'x');
					var n      = val('mpnlp-n', '5');
					var c = '';
					c += cline(kw('using') + ' ' + solverImport(solver) + ', ' + ty('Plots'), currentModel === 'minlp' ? 'MINLP + plotting' : 'NLP + plotting');
					c += blank();
					c += cline('param_vals = range(0.5, 3.0; length=20)', 'sweep parameter grid');
					c += cline('obj_vals = Float64[]', 'collect optimal values');
					c += cline(kw('for') + ' r_val ' + kw('in') + ' param_vals', 'parametric loop');
					c += line('    m = ' + solverModel(solver));
					c += line('    ' + fn('@variable') + '(m, ' + xvar + '[1:' + n + '])');
					c += line('    ' + fn('@objective') + '(m, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))');
					c += line('    ' + fn('@constraint') + '(m, ' + fn('sum') + '(' + xvar + ') == 1)');
					c += line('    ' + fn('@constraint') + '(m, ' + fn('sum') + '(' + xvar + ' .^ 2) <= r_val)');
					c += line('    ' + fn('optimize!') + '(m)');
					c += line('    ' + fn('push!') + '(obj_vals, ' + fn('objective_value') + '(m))');
					c += line(kw('end'));
					c += cline(fn('plot') + '(param_vals, obj_vals; xlabel="parameter r", ylabel="optimal value")', 'plot');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'mpnlp-solver-compare',
				label: 'Solver Comparison',
				desc: 'Ipopt vs SCIP (NLP), SCIP vs Ipopt+Juniper (MINLP), or EAGO vs Couenne (Global NLP)',
				code: function() {
					var sense = sel('mpnlp-sense', 'Min');
					var xvar  = val('mpnlp-vars', 'x');
					var n     = val('mpnlp-n', '5');
					var c = '';
					if (currentModel === 'minlp') {
						c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('SCIP') + ', ' + ty('Juniper') + ', ' + ty('Ipopt'), 'SCIP (monolithic) vs Ipopt + Juniper (Branch and Bound)');
						c += blank();
						c += cline('scip = ' + fn('Model') + '(SCIP.Optimizer)', 'SCIP model');
						c += cline(fn('@variable') + '(scip, ' + xvar + '[1:' + n + ']); ' + fn('@variable') + '(scip, y[1:' + n + '], ' + ty('Bin') + ')', 'variables');
						c += cline(fn('@objective') + '(scip, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))', 'objective');
						c += cline(fn('@constraint') + '(scip, ' + fn('sum') + '(' + xvar + ') == 1); ' + fn('@constraint') + '(scip, [i=1:' + n + '], ' + xvar + '[i] &lt;= y[i])', 'constraints');
						c += cline('t1 = @elapsed ' + fn('optimize!') + '(scip)', 'solve with SCIP');
						c += cline(fn('println') + '("SCIP:          obj=", ' + fn('objective_value') + '(scip), " t=", round(t1; digits=4), "s")', 'result');
						c += blank();
						c += cline('jun = ' + fn('Model') + '(' + fn('optimizer_with_attributes') + '(' + ty('Juniper') + '.Optimizer, "nl_solver" => ' + ty('Ipopt') + '.Optimizer))', 'Juniper+Ipopt model');
						c += cline(fn('@variable') + '(jun, ' + xvar + '[1:' + n + ']); ' + fn('@variable') + '(jun, y[1:' + n + '], ' + ty('Bin') + ')', 'variables');
						c += cline(fn('@objective') + '(jun, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))', 'objective');
						c += cline(fn('@constraint') + '(jun, ' + fn('sum') + '(' + xvar + ') == 1); ' + fn('@constraint') + '(jun, [i=1:' + n + '], ' + xvar + '[i] &lt;= y[i])', 'constraints');
						c += cline('t2 = @elapsed ' + fn('optimize!') + '(jun)', 'solve with Juniper');
						c += cline(fn('println') + '("Ipopt+Juniper:  obj=", ' + fn('objective_value') + '(jun), " t=", round(t2; digits=4), "s")', 'result');
					} else if (currentModel === 'gnlp') {
						c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('EAGO') + ', ' + ty('CouenneNL'), 'EAGO vs CouenneNL — both JuMP-native global solvers');
						c += blank();
						c += cline('eago = ' + fn('Model') + '(EAGO.Optimizer)', 'EAGO: Branch and Bound + McCormick relaxations');
						c += cline(fn('@variable') + '(eago, ' + xvar + '[1:' + n + '])');
						c += cline(fn('@objective') + '(eago, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))');
						c += cline(fn('@constraint') + '(eago, ' + fn('sum') + '(' + xvar + ') == 1)');
						c += cline('t1 = @elapsed ' + fn('optimize!') + '(eago)', 'solve with EAGO');
						c += cline(fn('println') + '("EAGO:    obj=", ' + fn('objective_value') + '(eago), " t=", round(t1; digits=4), "s")', 'result');
						c += blank();
						c += cline('couenne = ' + fn('Model') + '(' + ty('CouenneNL') + '.Optimizer)', 'CouenneNL: spatial Branch and Bound');
						c += cline(fn('@variable') + '(couenne, ' + xvar + '[1:' + n + '])');
						c += cline(fn('@objective') + '(couenne, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))');
						c += cline(fn('@constraint') + '(couenne, ' + fn('sum') + '(' + xvar + ') == 1)');
						c += cline('t2 = @elapsed ' + fn('optimize!') + '(couenne)', 'solve with Couenne');
						c += cline(fn('println') + '("Couenne: obj=", ' + fn('objective_value') + '(couenne), " t=", round(t2; digits=4), "s")', 'result');
					} else {
						c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('Ipopt') + ', ' + ty('SCIP'), 'Ipopt (interior point) vs SCIP (branch-and-bound)');
						c += blank();
						c += cline(kw('for') + ' (name, Solver) ' + kw('in') + ' [("Ipopt", Ipopt), ("SCIP", SCIP)]', 'compare NLP solvers');
						c += line('    m = ' + fn('Model') + '(Solver.Optimizer)');
						c += line('    ' + fn('@variable') + '(m, ' + xvar + '[1:' + n + '])');
						c += line('    ' + fn('@objective') + '(m, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))');
						c += line('    ' + fn('@constraint') + '(m, ' + fn('sum') + '(' + xvar + ') == 1)');
						c += line('    t = @elapsed ' + fn('optimize!') + '(m)');
						c += line('    ' + fn('println') + '(name, ": obj=", ' + fn('objective_value') + '(m), " t=", round(t; digits=4), "s")');
						c += line(kw('end'));
					}
					return c;
				},
			},
			{
				id: 'mpnlp-local-vs-global',
				label: 'Local vs Global',
				desc: 'Ipopt (local optimum) vs EAGO (certified global optimum) on the same nonconvex problem',
				code: function() {
					var sense = sel('mpnlp-sense', 'Min');
					var xvar  = val('mpnlp-vars', 'x');
					var n     = val('mpnlp-n', '5');
					var obj   = val('mpnlp-obj', 'sum(' + xvar + '.^2)');
					var c = '';
					c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('Ipopt') + ', ' + ty('EAGO'), 'local vs global solver on same problem');
					c += blank();
					c += cline('local_m = ' + fn('Model') + '(Ipopt.Optimizer)', 'Ipopt: interior point, finds a LOCAL optimum');
					c += cline(fn('@variable') + '(local_m, ' + xvar + '[1:' + n + '])');
					c += cline(fn('@objective') + '(local_m, ' + ty(sense) + ', ' + obj + ')');
					c += cline(fn('@constraint') + '(local_m, ' + fn('sum') + '(' + xvar + ') == 1)');
					c += cline(fn('@constraint') + '(local_m, ' + fn('sum') + '(' + xvar + ' .^ 2) &lt;= r)');
					c += cline(fn('optimize!') + '(local_m)', 'solve');
					c += cline(fn('println') + '("Ipopt (local):  ", ' + fn('objective_value') + '(local_m))', 'may be a local minimum only');
					c += blank();
					c += cline('global_m = ' + fn('Model') + '(EAGO.Optimizer)', 'EAGO: Branch and Bound, certifies GLOBAL optimum');
					c += cline(fn('@variable') + '(global_m, ' + xvar + '[1:' + n + '])');
					c += cline(fn('@objective') + '(global_m, ' + ty(sense) + ', ' + obj + ')');
					c += cline(fn('@constraint') + '(global_m, ' + fn('sum') + '(' + xvar + ') == 1)');
					c += cline(fn('@constraint') + '(global_m, ' + fn('sum') + '(' + xvar + ' .^ 2) &lt;= r)');
					c += cline(fn('optimize!') + '(global_m)', 'solve');
					c += cline(fn('println') + '("EAGO (global): ", ' + fn('objective_value') + '(global_m))', 'certified global minimum/maximum');
					return c;
				},
			},
			{
				id: 'mpnlp-minlp-relaxation',
				label: 'MINLP Relaxation',
				desc: 'Compare MINLP optimal to its continuous NLP relaxation bound',
				code: function() {
					var sense = sel('mpnlp-sense', 'Min');
					var xvar  = val('mpnlp-vars', 'x');
					var n     = val('mpnlp-n', '5');
					var c = '';
					c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('SCIP') + ', ' + ty('Ipopt'), 'MINLP and NLP relaxation');
					c += blank();
					c += cline('minlp = ' + fn('Model') + '(SCIP.Optimizer)', 'MINLP model');
					c += cline(fn('@variable') + '(minlp, ' + xvar + '[1:' + n + '])', 'continuous variables');
					c += cline(fn('@variable') + '(minlp, y[1:' + n + '], ' + ty('Bin') + ')', 'binary indicators');
					c += cline(fn('@objective') + '(minlp, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))', 'MINLP objective');
					c += cline(fn('@constraint') + '(minlp, ' + fn('sum') + '(' + xvar + ') == 1)', 'equality');
					c += cline(fn('@constraint') + '(minlp, [i=1:' + n + '], ' + xvar + '[i] &lt;= y[i])', 'link');
					c += blank();
					c += cline('relax = ' + fn('Model') + '(Ipopt.Optimizer)', 'NLP relaxation (no integrality)');
					c += cline(fn('@variable') + '(relax, ' + xvar + '[1:' + n + '])', 'continuous only');
					c += cline(fn('@objective') + '(relax, ' + ty(sense) + ', ' + fn('sum') + '(' + xvar + ' .^ 2))', 'same objective');
					c += cline(fn('@constraint') + '(relax, ' + fn('sum') + '(' + xvar + ') == 1)', 'equality');
					c += blank();
					c += cline(fn('optimize!') + '(minlp); ' + fn('optimize!') + '(relax)', 'solve both');
					c += cline(fn('println') + '("MINLP: ", ' + fn('objective_value') + '(minlp), "  NLP bound: ", ' + fn('objective_value') + '(relax))', 'integrality gap');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'mpnlp-kkt',
				label: 'KKT Conditions',
				desc: 'Check first-order KKT conditions at the optimal solution',
				code: function() {
					var xvar = val('mpnlp-vars', 'x');
					var c = '';
					c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('LinearAlgebra'), 'NLP + linear algebra');
					c += blank();
					c += cline(fn('optimize!') + '(model)', 'solve first');
					c += cline('x_opt = ' + fn('value') + '.(' + xvar + ')', 'optimal primal');
					c += blank();
					c += cline('cons = ' + fn('all_constraints') + '(model; include_variable_in_set_constraints=false)', 'all constraints');
					c += cline('duals = ' + fn('dual') + '.(cons)', 'optimal dual variables');
					c += blank();
					c += cline(fn('println') + '("Primal feasibility: check constraints hold at x_opt")', 'primal KKT');
					c += cline(fn('println') + '("Dual feasibility: duals = ", duals)', 'dual KKT');
					c += cline(fn('println') + '("Complementary slackness: duals .* constraint_values should be ~0")', 'CS KKT');
					return c;
				},
			},
			{
				id: 'mpnlp-constraint-activity',
				label: 'Constraint Activity',
				desc: 'Identify which constraints are active (binding) at the optimum',
				code: function() {
					var c = '';
					c += cline(kw('using') + ' ' + ty('JuMP'), 'NLP framework');
					c += blank();
					c += cline(fn('optimize!') + '(model)', 'solve first');
					c += blank();
					c += cline('cons = ' + fn('all_constraints') + '(model; include_variable_in_set_constraints=false)', 'all constraints');
					c += cline(kw('for') + ' (i, con) ' + kw('in') + ' ' + fn('enumerate') + '(cons)', 'check activity');
					c += line('    d = abs(' + fn('dual') + '(con))');
					c += line('    active = d > 1e-6 ? "ACTIVE" : "inactive"');
					c += line('    ' + fn('println') + '("Con ", i, ": dual=", round(d; digits=6), "  (", active, ")")');
					c += line(kw('end'));
					return c;
				},
			},
		];

		// ── Button wiring ──────────────────────────────────────────────────────
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

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (currentPanelId === 'btn-wiki') { hideRightPanel(); return; }
			currentPanelId = 'btn-wiki';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderWikiPanel();
			rightPanel.style.display = 'block';
		});

		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (currentPanelId === 'btn-notebook-tutorials') { hideRightPanel(); return; }
			currentPanelId = 'btn-notebook-tutorials';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderNotebookPanel();
			rightPanel.style.display = 'block';
		});

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

		document.getElementById('btn-copy').addEventListener('click', function() {
			var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
			var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				var btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

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
			if (msg.command === 'notebookSections') { notebookSections = msg.sections || []; }
			if (msg.command === 'wikiSections') { wikiSections = msg.sections || []; }
			if (msg.command === 'setModel') { setModel(msg.model); }
			if (msg.command === 'actionDone') { releaseBtn(); }
		});

		setModel('nlp');
	</script>
</body>
</html>`;
}
