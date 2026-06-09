/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getCmpHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Complementarity Problems</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.decision-table { border-collapse: collapse; width: 100%; font-size: 12px; }
		.decision-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--vscode-widget-border); color: var(--vscode-foreground); font-weight: 600; }
		.decision-table td { padding: 5px 10px; border-bottom: 1px solid var(--vscode-widget-border); color: var(--vscode-foreground); vertical-align: top; line-height: 1.4; }
		.decision-table tr:last-child td { border-bottom: none; }
		.decision-table td:first-child { color: var(--vscode-textLink-foreground); font-weight: 500; white-space: nowrap; }
		.methods-list { list-style: none; padding-left: 0; margin: 5px 0 12px 0; }
		.methods-list li { margin: 4px 0; padding-left: 20px; position: relative; font-size: 13px; color: var(--vscode-foreground); line-height: 1.5; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 0.55em; width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.model-toggle { display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; flex-wrap: wrap; }
		.toggle-btn { background: var(--vscode-list-hoverBackground); border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 35px; transition: background 0.15s; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-activeSelectionBackground); }
.eq-section { margin: 0 0 20px 0; }
		.eq-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.eq-toggle:hover { text-decoration: underline; }
		.eq-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.eq-section.collapsed .eq-chevron { transform: rotate(-90deg); }
		.eq-section.collapsed .eq-block { display: none; }
		.eq-block { font-size: 14px; padding: 14px 20px; background: var(--vscode-textCodeBlock-background); border-radius: 6px; border: 1px solid var(--vscode-widget-border); font-family: 'Georgia', 'Times New Roman', serif; line-height: 2; }
		.eq-row { display: flex; align-items: baseline; gap: 8px; }
		.eq-lhs { min-width: 200px; text-align: right; white-space: nowrap; }
		.eq-op  { min-width: 18px; text-align: center; white-space: nowrap; }
		.eq-body { flex: 1; }
		.eq-comment { font-size: 12px; color: #6A9955; font-style: italic; padding-left: 12px; }
		.form-group { display: flex; flex-direction: column; margin-bottom: 0; }
		.form-row { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 12px; align-items: flex-end; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 260px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		.param-input { text-align: center; }
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-blank { margin: 4px 0; height: 1em; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-debugTokenExpression-name); }
		.hl-fn      { color: var(--vscode-debugTokenExpression-value); }
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

		<h1>Complementarity Problems</h1>
		<div class="powered-by">Powered by: <span id="package-links"></span></div>
		<ul class="methods-list">
			<li>A complementarity problem finds a point x and an operator F(x) that are mutually non-negative and perpendicular: each component is either zero or its counterpart is zero. The condition x &#8805; 0, F(x) &#8805; 0, x&#7488;F(x) = 0 captures equilibrium in markets, mechanical contact, and game theory.</li>
			<li>LCP and NCP are special cases of the Mixed Complementarity Problem (MCP), which adds box constraints and is the standard form solved by the PATH solver.</li>
		</ul>
		<div class="subtitle">
			<table class="decision-table">
				<thead><tr><th>Problem</th><th>Operator</th><th>Use when</th></tr></thead>
				<tbody>
					<tr><td>Linear Complementarity (LCP)</td><td>Mx + q (linear)</td><td>Quadratic programs, contact mechanics</td></tr>
					<tr><td>Nonlinear Complementarity (NCP)</td><td>F(x) nonlinear</td><td>General equilibria, optimal control</td></tr>
					<tr><td>Mixed Complementarity (MCP)</td><td>F(x), lb &#8804; x &#8804; ub</td><td>DSGE models, traffic assignment</td></tr>
				</tbody>
			</table>
		</div>

		<div class="model-toggle" id="model-group">
			<button class="toggle-btn active" data-model="lcp">Linear Complementarity</button>
			<button class="toggle-btn" data-model="ncp">Nonlinear Complementarity</button>
			<button class="toggle-btn" data-model="mcp">Mixed Complementarity</button>
		</div>


		<div class="eq-section collapsed" id="eq-section">
			<button class="eq-toggle" id="eq-toggle">
				<span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>
				Model equations
			</button>
			<div class="eq-block" id="eq-block"></div>
		</div>

		<div class="form-row">
			<div class="form-group" style="max-width:80px;">
				<label class="form-label centered">n</label>
				<textarea id="cmp-n" class="form-input param-input" rows="1">6</textarea>
			</div>
			<div class="form-group" id="cmp-lcp-mat-group">
				<label class="form-label centered">M (n&#215;n)</label>
				<textarea id="cmp-M" class="form-input param-input" rows="1">M</textarea>
			</div>
			<div class="form-group" id="cmp-lcp-vec-group">
				<label class="form-label centered">q (n&#215;1)</label>
				<textarea id="cmp-q" class="form-input param-input" rows="1">q</textarea>
			</div>
			<div class="form-group" id="cmp-f-group" style="display:none;">
				<label class="form-label centered">Operator F</label>
				<textarea id="cmp-F" class="form-input param-input" rows="1">F</textarea>
			</div>
			<div class="form-group" id="cmp-lb-group" style="display:none;">
				<label class="form-label centered">lb</label>
				<textarea id="cmp-lb" class="form-input param-input" rows="1">lb</textarea>
			</div>
			<div class="form-group" id="cmp-ub-group" style="display:none;">
				<label class="form-label centered">ub</label>
				<textarea id="cmp-ub" class="form-input param-input" rows="1">ub</textarea>
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
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1zm0 1a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 7.5 2zm.5 8.5h-1v-4h1v4zm0-5.5h-1V4h1v1z"/></svg>Interpret</button></li>
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
		var currentModel = 'lcp';
		var activeBtn = null;
		var pickerJustClosed = false;
		var currentPanelId = null;
		var notebookSections = [];
		var wikiSections = [];
		var rightPanel = document.getElementById('right-panel');

		var MODELS = ['lcp', 'ncp', 'mcp'];

		function esc(s)      { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }

		function eqRow(lhs, op, body, comment) {
			return '<div class="eq-row">'
				+ '<span class="eq-lhs">' + lhs + '</span>'
				+ '<span class="eq-op">' + op + '</span>'
				+ '<span class="eq-body">' + body + '</span>'
				+ (comment ? '<span class="eq-comment"># ' + comment + '</span>' : '')
				+ '</div>';
		}

		function buildLcpCode(n, M, q) {
			var c = '';
			c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
			c += line('m = ' + fn('MCPModel') + '()');
			c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
			c += line(kw('@mapping') + '(m, F[i=1:' + n + '], ' + fn('sum') + '(' + M + '[i,j]*x[j] ' + kw('for') + ' j ' + kw('in') + ' 1:' + n + ') + ' + q + '[i])');
			c += line(kw('@complementarity') + '(m, F, x)');
			c += line('status = ' + fn('solveMCP') + '(m; solver=:PATH)');
			c += line(kw('@show') + ' ' + fn('value') + '.(x)');
			return c;
		}

		function buildNcpCode(n, F) {
			var c = '';
			c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
			c += line('m = ' + fn('MCPModel') + '()');
			c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
			c += cline(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])', 'nonlinear operator F: R^n -> R^n');
			c += line(kw('@complementarity') + '(m, Fmap, x)');
			c += line('status = ' + fn('solveMCP') + '(m; solver=:PATH)');
			c += line(kw('@show') + ' ' + fn('value') + '.(x)');
			return c;
		}

		function buildMcpCode(n, F, lb, ub) {
			var c = '';
			c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
			c += line('m = ' + fn('MCPModel') + '()');
			c += cline(kw('@variable') + '(m, ' + lb + '[i] <= x[i=1:' + n + '] <= ' + ub + '[i])', 'box-constrained variable');
			c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
			c += line(kw('@complementarity') + '(m, Fmap, x)');
			c += line('status = ' + fn('solveMCP') + '(m; solver=:PATH)');
			c += line(kw('@show') + ' ' + fn('value') + '.(x)');
			return c;
		}

		function updateEquations() {
			var block = document.getElementById('eq-block');
			if (!block) { return; }
			var h = '';
			if (currentModel === 'lcp') {
				h += eqRow('find x &#8712; &#8477;&#8319;', '', '', '');
				h += eqRow('Mx + q', '&#8805;', '0', '');
				h += eqRow('x', '&#8805;', '0', '');
				h += eqRow('(Mx + q)&#7488;x', '=', '0', '');
			} else if (currentModel === 'ncp') {
				h += eqRow('find x &#8712; &#8477;&#8319;', '', '', '');
				h += eqRow('F(x)', '&#8805;', '0', '');
				h += eqRow('x', '&#8805;', '0', '');
				h += eqRow('F(x)&#7488;x', '=', '0', '');
			} else {
				h += eqRow('find x &#8712; &#8477;&#8319;', '', '', '');
				h += eqRow('lb &#8804; x', '&#8804;', 'ub', '');
				h += eqRow('F&#7522;(x)', '&#8805;', '0 if x&#7522; = lb&#7522;', '');
				h += eqRow('F&#7522;(x)', '=', '0 if lb&#7522; &lt; x&#7522; &lt; ub&#7522;', '');
				h += eqRow('F&#7522;(x)', '&#8804;', '0 if x&#7522; = ub&#7522;', '');
			}
			block.innerHTML = h;
		}

		function updateCodePreview() {
			var n  = val('cmp-n', '6');
			var M  = val('cmp-M', 'M');
			var q  = val('cmp-q', 'q');
			var F  = val('cmp-F', 'F');
			var lb = val('cmp-lb', 'lb');
			var ub = val('cmp-ub', 'ub');
			var c = '';
			if (currentModel === 'lcp')      { c = buildLcpCode(n, M, q); }
			else if (currentModel === 'ncp') { c = buildNcpCode(n, F); }
			else                             { c = buildMcpCode(n, F, lb, ub); }
			document.getElementById('code-preview').innerHTML = c;
		}

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			var lcpMat = document.getElementById('cmp-lcp-mat-group');
			var lcpVec = document.getElementById('cmp-lcp-vec-group');
			var fGrp   = document.getElementById('cmp-f-group');
			var lbGrp  = document.getElementById('cmp-lb-group');
			var ubGrp  = document.getElementById('cmp-ub-group');
			if (model === 'lcp') {
				if (lcpMat) { lcpMat.style.display = ''; }
				if (lcpVec) { lcpVec.style.display = ''; }
				if (fGrp)   { fGrp.style.display = 'none'; }
				if (lbGrp)  { lbGrp.style.display = 'none'; }
				if (ubGrp)  { ubGrp.style.display = 'none'; }
			} else if (model === 'ncp') {
				if (lcpMat) { lcpMat.style.display = 'none'; }
				if (lcpVec) { lcpVec.style.display = 'none'; }
				if (fGrp)   { fGrp.style.display = ''; }
				if (lbGrp)  { lbGrp.style.display = 'none'; }
				if (ubGrp)  { ubGrp.style.display = 'none'; }
			} else {
				if (lcpMat) { lcpMat.style.display = 'none'; }
				if (lcpVec) { lcpVec.style.display = 'none'; }
				if (fGrp)   { fGrp.style.display = ''; }
				if (lbGrp)  { lbGrp.style.display = ''; }
				if (ubGrp)  { ubGrp.style.display = ''; }
			}
			updateEquations();
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('input', updateCodePreview);
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
		});


		document.getElementById('eq-toggle').addEventListener('click', function() {
			document.getElementById('eq-section').classList.toggle('collapsed');
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
				id: 'plot-residual',
				label: 'Residual Plot',
				desc: 'Plot complementarity residual ||min(x, F(x))|| vs iteration',
				code: function() {
					var n  = val('cmp-n', '6');
					var M  = val('cmp-M', 'M');
					var q  = val('cmp-q', 'q');
					var F  = val('cmp-F', 'F');
					var lb = val('cmp-lb', 'lb');
					var ub = val('cmp-ub', 'ub');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver') + ', ' + ty('Plots'), 'Julia packages');
					c += line('residuals = ' + ty('Float64') + '[]');
					c += line('m = ' + fn('MCPModel') + '()');
					if (currentModel === 'lcp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + fn('sum') + '(' + M + '[i,j]*x[j] ' + kw('for') + ' j ' + kw('in') + ' 1:' + n + ') + ' + q + '[i])');
					} else if (currentModel === 'ncp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					} else {
						c += line(kw('@variable') + '(m, ' + lb + '[i] <= x[i=1:' + n + '] <= ' + ub + '[i])');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					}
					c += line(kw('@complementarity') + '(m, Fmap, x)');
					c += line('status = ' + fn('solveMCP') + '(m; solver=:PATH)');
					c += line('x_sol = ' + fn('value') + '.(x)');
					c += cline('Fx = ' + fn('value') + '.(Fmap)', 'evaluate mapping at solution');
					c += line('push!(residuals, ' + fn('norm') + '(' + fn('min') + '.(x_sol, Fx)))');
					c += blank();
					c += line(fn('plot') + '(residuals; ylabel="||min(x, F(x))||", xlabel="Iteration", title="Complementarity Residual")');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'check-compl',
				label: 'Complementarity Check',
				desc: 'Verify x >= 0, F(x) >= 0, and x^T F(x) = 0 at solution',
				code: function() {
					var n  = val('cmp-n', '6');
					var M  = val('cmp-M', 'M');
					var q  = val('cmp-q', 'q');
					var F  = val('cmp-F', 'F');
					var lb = val('cmp-lb', 'lb');
					var ub = val('cmp-ub', 'ub');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
					c += line('m = ' + fn('MCPModel') + '()');
					if (currentModel === 'lcp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + fn('sum') + '(' + M + '[i,j]*x[j] ' + kw('for') + ' j ' + kw('in') + ' 1:' + n + ') + ' + q + '[i])');
					} else if (currentModel === 'ncp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					} else {
						c += line(kw('@variable') + '(m, ' + lb + '[i] <= x[i=1:' + n + '] <= ' + ub + '[i])');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					}
					c += line(kw('@complementarity') + '(m, Fmap, x)');
					c += line(fn('solveMCP') + '(m; solver=:PATH)');
					c += line('x_sol = ' + fn('value') + '.(x)');
					c += line('Fx    = ' + fn('value') + '.(Fmap)');
					c += blank();
					c += cline(fn('println') + '("x >= 0:      ", ' + fn('all') + '(x_sol .>= -1e-8))', 'primal feasibility');
					c += cline(fn('println') + '("F(x) >= 0:   ", ' + fn('all') + '(Fx .>= -1e-8))', 'dual feasibility');
					c += cline(fn('println') + '("x^T F(x):    ", ' + fn('dot') + '(x_sol, Fx))', 'complementarity');
					return c;
				},
			},
			{
				id: 'check-status',
				label: 'Solver Status',
				desc: 'Inspect PATH solver exit code and residual norm',
				code: function() {
					var n  = val('cmp-n', '6');
					var M  = val('cmp-M', 'M');
					var q  = val('cmp-q', 'q');
					var F  = val('cmp-F', 'F');
					var lb = val('cmp-lb', 'lb');
					var ub = val('cmp-ub', 'ub');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
					c += line('m = ' + fn('MCPModel') + '()');
					if (currentModel === 'lcp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + fn('sum') + '(' + M + '[i,j]*x[j] ' + kw('for') + ' j ' + kw('in') + ' 1:' + n + ') + ' + q + '[i])');
					} else if (currentModel === 'ncp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					} else {
						c += line(kw('@variable') + '(m, ' + lb + '[i] <= x[i=1:' + n + '] <= ' + ub + '[i])');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					}
					c += line(kw('@complementarity') + '(m, Fmap, x)');
					c += line('status = ' + fn('solveMCP') + '(m; solver=:PATH)');
					c += blank();
					c += line(fn('println') + '("Solver status: ", status)');
					c += line('x_sol = ' + fn('value') + '.(x)');
					c += line('Fx    = ' + fn('value') + '.(Fmap)');
					c += cline(fn('println') + '("Residual norm: ", ' + fn('norm') + '(' + fn('min') + '.(x_sol, Fx)))', 'Fischer-Burmeister style residual');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'parametric',
				label: 'Parametric Solve',
				desc: 'Resolve MCP for a range of parameter values',
				code: function() {
					var n  = val('cmp-n', '6');
					var F  = val('cmp-F', 'F');
					var lb = val('cmp-lb', 'lb');
					var ub = val('cmp-ub', 'ub');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
					c += line(kw('for') + ' t ' + kw('in') + ' ' + fn('range') + '(0.0, 1.0; length=10)');
					c += line('    m = ' + fn('MCPModel') + '()');
					if (currentModel === 'mcp') {
						c += line('    ' + kw('@variable') + '(m, ' + lb + '[i] <= x[i=1:' + n + '] <= ' + ub + '[i])');
						c += line('    ' + kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x, t)[i])');
					} else {
						c += line('    ' + kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line('    ' + kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x, t)[i])');
					}
					c += line('    ' + kw('@complementarity') + '(m, Fmap, x)');
					c += line('    ' + fn('solveMCP') + '(m; solver=:PATH)');
					c += line('    ' + fn('println') + '("t=", t, "  x=", ' + fn('value') + '.(x))');
					c += line(kw('end'));
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'lp-relax',
				label: 'LP Relaxation',
				desc: 'Drop complementarity and solve the relaxed LP for a lower bound',
				code: function() {
					var n = val('cmp-n', '6');
					var M = val('cmp-M', 'M');
					var q = val('cmp-q', 'q');
					var c = '';
					c += cline(kw('using') + ' ' + ty('JuMP') + ', ' + ty('HiGHS'), 'Julia packages');
					c += cline('model = ' + fn('Model') + '(' + ty('HiGHS') + '.Optimizer)', 'relaxed LP -- drop complementarity');
					c += line(kw('@variable') + '(model, x[1:' + n + '] >= 0)');
					c += line(kw('@variable') + '(model, s[1:' + n + '] >= 0)');
					c += cline(kw('@constraint') + '(model, ' + M + ' * x + ' + q + ' .== s)', 'feasibility: Mx + q = s >= 0');
					c += line(kw('@objective') + '(model, Min, ' + fn('sum') + '(x + s))');
					c += line(fn('optimize!') + '(model)');
					c += blank();
					c += cline(fn('println') + '("LP lower bound: ", ' + fn('objective_value') + '(model))', 'lower bound on complementarity solution');
					c += line(fn('println') + '("x_LP = ", ' + fn('value') + '.(x))');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'dual-interp',
				label: 'Dual Interpretation',
				desc: 'Interpret active complementarity pairs as binding constraints',
				code: function() {
					var n  = val('cmp-n', '6');
					var M  = val('cmp-M', 'M');
					var q  = val('cmp-q', 'q');
					var F  = val('cmp-F', 'F');
					var lb = val('cmp-lb', 'lb');
					var ub = val('cmp-ub', 'ub');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
					c += line('m = ' + fn('MCPModel') + '()');
					if (currentModel === 'lcp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + fn('sum') + '(' + M + '[i,j]*x[j] ' + kw('for') + ' j ' + kw('in') + ' 1:' + n + ') + ' + q + '[i])');
					} else if (currentModel === 'ncp') {
						c += line(kw('@variable') + '(m, x[1:' + n + '] >= 0)');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					} else {
						c += line(kw('@variable') + '(m, ' + lb + '[i] <= x[i=1:' + n + '] <= ' + ub + '[i])');
						c += line(kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + F + '(x)[i])');
					}
					c += line(kw('@complementarity') + '(m, Fmap, x)');
					c += line(fn('solveMCP') + '(m; solver=:PATH)');
					c += line('x_sol = ' + fn('value') + '.(x)');
					c += line('Fx    = ' + fn('value') + '.(Fmap)');
					c += blank();
					c += cline(fn('println') + '("Active lower bound (x_i = 0): ", ' + fn('findall') + '(x_sol .< 1e-6))', 'x binding');
					c += cline(fn('println') + '("Active F constraint (F_i = 0): ", ' + fn('findall') + '(Fx .< 1e-6))', 'F binding');
					return c;
				},
			},
			{
				id: 'sensitivity',
				label: 'Sensitivity Analysis',
				desc: 'Compute sensitivity of solution to perturbations in F or bounds',
				code: function() {
					var n  = val('cmp-n', '6');
					var M  = val('cmp-M', 'M');
					var q  = val('cmp-q', 'q');
					var c = '';
					c += cline(kw('using') + ' ' + ty('Complementarity') + ', ' + ty('PATHSolver'), 'Julia packages');
					c += blank();
					c += cline('function solve_lcp(dq)', 'perturbed solve');
					c += line('    m = ' + fn('MCPModel') + '()');
					c += line('    ' + kw('@variable') + '(m, x[1:' + n + '] >= 0)');
					c += line('    ' + kw('@mapping') + '(m, Fmap[i=1:' + n + '], ' + fn('sum') + '(' + M + '[i,j]*x[j] ' + kw('for') + ' j ' + kw('in') + ' 1:' + n + ') + (' + q + ' + dq)[i])');
					c += line('    ' + kw('@complementarity') + '(m, Fmap, x)');
					c += line('    ' + fn('solveMCP') + '(m; solver=:PATH)');
					c += line('    ' + kw('return') + ' ' + fn('value') + '.(x)');
					c += line(kw('end'));
					c += blank();
					c += line('x0   = solve_lcp(' + fn('zeros') + '(' + n + '))');
					c += cline('x_p  = solve_lcp(0.01 * ' + fn('ones') + '(' + n + '))', 'perturb q by +0.01');
					c += cline(fn('println') + '("Sensitivity dx/dq ~ ", (x_p - x0) / 0.01)', 'finite-difference estimate');
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

		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (currentPanelId === 'btn-notebook-tutorials') { hideRightPanel(); return; }
			currentPanelId = 'btn-notebook-tutorials';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderNotebookPanel();
			rightPanel.style.display = 'block';
		});

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (currentPanelId === 'btn-wiki') { hideRightPanel(); return; }
			currentPanelId = 'btn-wiki';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderWikiPanel();
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

		// ── Copy main preview ──────────────────────────────────────────────────
		document.getElementById('btn-copy').addEventListener('click', function() {
			var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
			var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				var btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

		// ── Tooltip pin-on-click ───────────────────────────────────────────────
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

		// ── Inbound messages ───────────────────────────────────────────────────
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

		setModel('lcp');
	</script>
</body>
</html>`;
}
