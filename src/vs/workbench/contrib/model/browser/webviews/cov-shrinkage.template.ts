/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getCovShrinkageHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Regularised Covariance Estimation</title>
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
		.model-toggle { display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
		.toggle-btn { background: transparent; border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 35px; transition: background 0.15s; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-hoverBackground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 300px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		select.form-input { height: 37px; cursor: pointer; }
		.param-input { text-align: center; }
		.cs-linear-only, .cs-woodbury-only { display: none; }
		.eq-section { margin: 0 0 20px 0; }
		.eq-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.eq-toggle:hover { text-decoration: underline; }
		.eq-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.eq-section.collapsed .eq-chevron { transform: rotate(-90deg); }
		.eq-section.collapsed .eq-block { display: none; }
		.eq-block { font-size: 14px; padding: 14px 20px; background: var(--vscode-textCodeBlock-background); border-radius: 6px; border: 1px solid var(--vscode-widget-border); font-family: 'Georgia', 'Times New Roman', serif; line-height: 2; }
		.eq-row { display: flex; align-items: baseline; gap: 8px; }
		.eq-lhs { min-width: 60px; text-align: right; white-space: nowrap; }
		.eq-op  { min-width: 18px; text-align: center; white-space: nowrap; }
		.eq-body { flex: 1; white-space: nowrap; }
		.eq-comment { flex-shrink: 0; padding-left: 24px; color: #6A9955; font-style: italic; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; white-space: nowrap; }
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
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Regularised Covariance Estimation</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Linear Shrinkage &#8212; convex combination &#931;&#770; = (1&#8722;&#945;)S + &#945;T of the sample covariance S and a structured target T; &#945; chosen by Ledoit-Wolf, OAS or RBLW</li>
					<li>Analytical Nonlinear Shrinkage &#8212; oracle-optimal per-eigenvalue shrinkage via the Ledoit-Wolf (2020) closed-form formula; superior to linear shrinkage for large p/n</li>
					<li>Woodbury Estimator &#8212; low-rank plus diagonal &#931;&#770; = &#963;&#178;I + U&#923;U&#7768; suited to very high-dimensional p &#8811; n problems</li>
					<li>Biweight Midcovariance &#8212; robust estimator based on Tukey biweight; highly resistant to outliers and heavy-tailed distributions</li>
				</ul>
			</div>
		</div>

		<div class="model-toggle" id="model-group">
			<button class="toggle-btn" data-model="linear">Linear</button>
			<button class="toggle-btn" data-model="nonlinear">Nonlinear</button>
			<button class="toggle-btn" data-model="woodbury">Woodbury</button>
			<button class="toggle-btn" data-model="biweight">Biweight</button>
		</div>

		<div class="form-row" id="params-row">
			<div class="form-group cs-linear-only">
				<label class="form-label centered form-label-with-tooltip">Shrinkage method
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">:lw &#8212; Ledoit-Wolf (2004) analytical formula; :oas &#8212; Oracle Approximating Shrinkage (Chen et al. 2010), lower MSE for Gaussian data; :rblw &#8212; Rao-Blackwell LW, improved finite-sample oracle. All three produce an optimal &#945; &#8712; [0,1].</span>
				</label>
				<select id="cs-shrinkage" class="form-input">
					<option value=":lw">Ledoit-Wolf (:lw)</option>
					<option value=":oas">OAS (:oas)</option>
					<option value=":rblw">RBLW (:rblw)</option>
				</select>
			</div>
			<div class="form-group cs-linear-only">
				<label class="form-label centered form-label-with-tooltip">Target
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Structured matrix T towards which the sample covariance is shrunk. ConstantCorrelation: equal off-diagonal correlations. DiagonalCommonVariance: diagonal with equal variances. DiagonalUnequalVariance: diagonal with individual variances. PerfectPositiveCorrelation: all correlations = 1. ScaledIdentity: scaled identity matrix.</span>
				</label>
				<select id="cs-target" class="form-input">
					<option value="ConstantCorrelation()">ConstantCorrelation</option>
					<option value="DiagonalCommonVariance()">DiagonalCommonVariance</option>
					<option value="DiagonalUnequalVariance()">DiagonalUnequalVariance</option>
					<option value="PerfectPositiveCorrelation()">PerfectPositiveCorrelation</option>
					<option value="ScaledIdentity()">ScaledIdentity</option>
				</select>
			</div>
			<div class="form-group cs-woodbury-only">
				<label class="form-label centered form-label-with-tooltip">rank
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Rank of the low-rank component U&#923;U&#7768;. Choose r &#8810; p to reflect a belief that most variation lies in a low-dimensional subspace. Increasing rank captures more structure but reduces shrinkage towards &#963;&#178;I.</span>
				</label>
				<textarea id="cs-rank" class="form-input param-input" placeholder="2" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">X (n &#215; p)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Data matrix: n observations &#215; p features. CovarianceEstimation.jl uses the standard Julia convention (rows = observations), so no transposing needed.</span>
				</label>
				<textarea id="cs-X" class="form-input" placeholder="X_train" rows="1"></textarea>
			</div>
		</div>

		<div class="eq-section" id="eq-section">
			<button class="eq-toggle" id="eq-toggle"><span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Model equations</button>
			<div class="eq-block" id="eq-block"></div>
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
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.19905 2.782Z"/></svg>Interpret</button></li>
				</ul>
				<hr class="strip-divider">
				<div class="strip-title">Learn More</div>
				<ul class="column-list">
					<li><button class="list-btn has-actions" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
					<li><button class="list-btn has-actions" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>Notebook Tutorials</button></li>
					<li><button class="list-btn has-actions" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM10.712 8C10.712 8.153 10.63 8.294 10.498 8.371L6.964 10.413C6.536 10.66 6 10.351 6 9.857V6.144C6 5.649 6.536 5.34 6.964 5.588L10.498 7.63C10.631 7.707 10.712 7.847 10.712 8Z"/></svg>Multimedia Tutorials</button></li>
					<li><button class="list-btn has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>References</button></li>
				</ul>
				<div class="paper-links" id="paper-links"></div>
			</div>
			<div class="right-panel" id="right-panel"></div>
		</div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();
		var currentModel = 'linear';
		var activeBtn = null;
		var currentPanelId = null;
		var pickerJustClosed = false;

		function esc(s)      { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }
		function selVal(id)  { var el = document.getElementById(id); return el ? el.value : ''; }

		function eqRow(lhs, op, body, comment) {
			return '<div class="eq-row">'
				+ '<span class="eq-lhs">' + lhs + '</span>'
				+ '<span class="eq-op">' + op + '</span>'
				+ '<span class="eq-body">' + body + '</span>'
				+ (comment ? '<span class="eq-comment"># ' + comment + '</span>' : '')
				+ '</div>';
		}

		function updateEquations() {
			var el = document.getElementById('eq-block');
			if (!el) { return; }
			var html = '';
			if (currentModel === 'linear') {
				html += eqRow('&#931;&#770;', '=', '(1&#8722;&#945;)S + &#945;T', 'shrinkage towards structured target T');
				html += eqRow('&#945;&#770;', '=', 'arg min<sub>&#945;</sub> E[&#8214;&#931;&#770; &#8722; &#931;&#8214;&#178;]', 'optimal intensity (LW / OAS / RBLW)');
				html += eqRow('S', '=', '<sup>1</sup>&#8260;<sub>n&#8722;1</sub> X&#7768;X', 'sample covariance matrix (centred)');
			} else if (currentModel === 'nonlinear') {
				html += eqRow('&#931;&#770;', '=', 'U diag(d&#770;) U&#7768;', 'rotated shrunk eigenvalues');
				html += eqRow('d&#770;<sub>i</sub>', '=', '&#948;<sup>*</sup>(&#955;<sub>i</sub>)', 'oracle nonlinear function of sample eigenvalue &#955;<sub>i</sub>');
				html += eqRow('&#948;<sup>*</sup>', '&#8776;', '<sup>&#955;</sup>&#8260;<sub>|1 &#8722; c<sub>n</sub> + c<sub>n</sub>&#955;<sub>i</sub> m(&#955;<sub>i</sub>)|&#178;</sub>', 'closed-form Mar&#269;enko-Pastur inverse');
			} else if (currentModel === 'woodbury') {
				html += eqRow('&#931;&#770;', '=', '&#963;&#178;I + U&#923;U&#7768;', 'diagonal plus low-rank');
				html += eqRow('U', '&#8712;', '&#8477;<sup>p&#215;r</sup>', 'r leading eigenvectors of S');
				html += eqRow('&#923;', '=', 'diag(&#955;<sub>1</sub>&#8722;&#963;&#178;, &#8230;, &#955;<sub>r</sub>&#8722;&#963;&#178;)', 'deflated eigenvalues');
			} else if (currentModel === 'biweight') {
				html += eqRow('&#931;&#770;<sub>ij</sub>', '=', '<sup>&#8721;<sub>t</sub> w<sub>it</sub>w<sub>jt</sub>(x<sub>it</sub>&#8722;&#956;&#770;<sub>i</sub>)(x<sub>jt</sub>&#8722;&#956;&#770;<sub>j</sub>)</sup>&#8260;<sub>(&#8721;<sub>t</sub> w<sub>it</sub>w<sub>jt</sub>)<sup>2</sup></sub>', 'biweight midcovariance');
				html += eqRow('w<sub>it</sub>', '=', '(1 &#8722; u<sub>it</sub>&#178;)&#178; &#183; &#120794;<sub>{|u<sub>it</sub>|&lt;1}</sub>', 'Tukey bisquare weight');
				html += eqRow('u<sub>it</sub>', '=', '<sup>x<sub>it</sub>&#8722;&#956;&#770;<sub>i</sub></sup>&#8260;<sub>c &#183; MAD(x<sub>i</sub>)</sub>', 'standardised residual, c = 9');
			}
			el.innerHTML = html;
		}

		function updateCodePreview() {
			var X = val('cs-X', 'X_train');
			var c = '';
			c += line(kw('using') + ' ' + ty('CovarianceEstimation'));
			c += blank();
			if (currentModel === 'linear') {
				var target    = selVal('cs-target')    || 'ConstantCorrelation()';
				var shrinkage = selVal('cs-shrinkage') || ':lw';
				c += cline('S = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty(target) + ', ' + shrinkage + '), ' + X + ')', 'regularised sample covariance matrix');
			} else if (currentModel === 'nonlinear') {
				c += cline('S = ' + fn('cov') + '(' + ty('AnalyticalNonlinearShrinkage') + '(), ' + X + ')', 'oracle nonlinear shrinkage (Ledoit-Wolf 2020)');
			} else if (currentModel === 'woodbury') {
				var rank = val('cs-rank', '2');
				c += cline('S = ' + fn('cov') + '(' + ty('WoodburyEstimator') + '(' + rank + '), ' + X + ')', 'low-rank + diagonal structured estimator');
			} else if (currentModel === 'biweight') {
				c += cline('S = ' + fn('cov') + '(' + ty('BiweightMidcovariance') + '(), ' + X + ')', 'robust covariance via Tukey biweight');
			}
			document.getElementById('code-preview').innerHTML = c;
		}

		var MODELS = ['linear', 'nonlinear', 'woodbury', 'biweight'];

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			document.querySelectorAll('.cs-linear-only').forEach(function(el) { el.style.display = model === 'linear' ? 'flex' : 'none'; });
			document.querySelectorAll('.cs-woodbury-only').forEach(function(el) { el.style.display = model === 'woodbury' ? 'flex' : 'none'; });
			updateEquations();
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		['cs-X', 'cs-rank'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
		});
		['cs-target', 'cs-shrinkage'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('change', updateCodePreview); }
		});

		document.getElementById('eq-toggle').addEventListener('click', function() {
			document.getElementById('eq-section').classList.toggle('collapsed');
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

		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
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

		var VISUALISE_ACTIONS = [
			{
				id: 'cov-heatmap',
				label: 'Covariance Heatmap',
				desc: 'Heatmap of the shrunk covariance matrix',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('Plots'));
					c += blank();
					c += cline('S = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'shrunk covariance matrix');
					c += blank();
					c += cline(fn('heatmap') + '(S, color=:RdBu, aspect_ratio=1, title="Shrunk Covariance")', 'visualise covariance structure');
					return c;
				},
			},
			{
				id: 'eigenvalue-spectrum',
				label: 'Eigenvalue Spectrum',
				desc: 'Sample vs shrunk eigenvalue comparison',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('LinearAlgebra') + ', ' + ty('Plots'));
					c += blank();
					c += cline('S_sample  = ' + fn('cov') + '(' + X + ')',                                                         'sample covariance (raw)');
					c += cline('S_shrunk  = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'shrunk covariance');
					c += blank();
					c += cline(fn('plot') + '(' + fn('eigvals') + '(S_sample),  label="Sample",  yscale=:log10)', 'eigenvalue spectrum (log scale)');
					c += cline(fn('plot!') + '(' + fn('eigvals') + '(S_shrunk), label="Shrunk")', 'overlay shrunk eigenvalues');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'condition-number',
				label: 'Condition Number',
				desc: 'Numerical conditioning of the shrunk matrix',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('LinearAlgebra'));
					c += blank();
					c += cline('S_sample = ' + fn('cov') + '(' + X + ')',                                                         'sample covariance');
					c += cline('S_shrunk = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'shrunk estimator');
					c += blank();
					c += cline(fn('println') + '("Sample cond: ", ' + fn('cond') + '(S_sample))', 'condition number of sample covariance');
					c += cline(fn('println') + '("Shrunk cond: ", ' + fn('cond') + '(S_shrunk))', 'condition number of shrunk estimator');
					return c;
				},
			},
			{
				id: 'frobenius-distance',
				label: 'Frobenius Distance',
				desc: 'Distance between sample and shrunk matrices',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('LinearAlgebra'));
					c += blank();
					c += cline('S_sample = ' + fn('cov') + '(' + X + ')',                                                         'sample covariance');
					c += cline('S_shrunk = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'shrunk estimator');
					c += blank();
					c += cline(fn('println') + '("Frobenius: ", ' + fn('norm') + '(S_sample .- S_shrunk, :fro))', 'Frobenius distance between estimators');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'precision-matrix',
				label: 'Precision Matrix',
				desc: 'Invert the shrunk covariance to get precision',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('LinearAlgebra'));
					c += blank();
					c += cline('S   = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'shrunk covariance matrix');
					c += cline('P   = ' + fn('inv') + '(S)', 'precision matrix (inverse covariance)');
					c += blank();
					c += cline(fn('println') + '("Precision matrix size: ", ' + fn('size') + '(P))', 'confirm dimensions');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'compare-estimators',
				label: 'Compare Estimators',
				desc: 'Sample vs linear vs nonlinear shrinkage',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('LinearAlgebra'));
					c += blank();
					c += cline('S_sample   = ' + fn('cov') + '(' + X + ')',                                                             'sample covariance (no shrinkage)');
					c += cline('S_linear   = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'Ledoit-Wolf linear shrinkage');
					c += cline('S_nonlin   = ' + fn('cov') + '(' + ty('AnalyticalNonlinearShrinkage') + '(), ' + X + ')',               'analytical nonlinear shrinkage');
					c += blank();
					c += cline(fn('println') + '("cond(S_sample):  ", ' + fn('cond') + '(S_sample))',  'sample condition number');
					c += cline(fn('println') + '("cond(S_linear):  ", ' + fn('cond') + '(S_linear))',  'linear shrinkage condition number');
					c += cline(fn('println') + '("cond(S_nonlin):  ", ' + fn('cond') + '(S_nonlin))',  'nonlinear shrinkage condition number');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'shrinkage-intensity',
				label: 'Shrinkage Intensity',
				desc: 'The optimal alpha and shrinkage target',
				code: function() {
					var X = val('cs-X', 'X_train');
					var c = '';
					c += line(kw('using') + ' ' + ty('CovarianceEstimation') + ', ' + ty('LinearAlgebra'));
					c += blank();
					c += cline('S_sample = ' + fn('cov') + '(' + X + ')',                                                         'sample covariance');
					c += cline('S_lw     = ' + fn('cov') + '(' + ty('LinearShrinkage') + '(' + ty('ConstantCorrelation') + '(), :lw), ' + X + ')', 'Ledoit-Wolf shrunk estimator');
					c += blank();
					c += cline('eig_sample = ' + fn('sort') + '(' + fn('eigvals') + '(S_sample), rev=true)', 'sample eigenvalues (descending)');
					c += cline('eig_shrunk = ' + fn('sort') + '(' + fn('eigvals') + '(S_lw),     rev=true)', 'shrunk eigenvalues (descending)');
					c += blank();
					c += cline(fn('println') + '("Eigenvalue range (sample): ", ' + fn('extrema') + '(eig_sample))', 'spread of sample eigenvalues');
					c += cline(fn('println') + '("Eigenvalue range (shrunk): ", ' + fn('extrema') + '(eig_shrunk))', 'spread of shrunk eigenvalues');
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

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (pickerJustClosed) { return; }
			if (activeBtn === this) { releaseBtn(); vscode.postMessage({ command: 'cancelAction' }); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openDocs', target: 'wiki' });
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (pickerJustClosed) { return; }
			if (activeBtn === this) { releaseBtn(); vscode.postMessage({ command: 'cancelAction' }); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openNotebookList' });
		});
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
			if (msg.command === 'setModel') { setModel(msg.model); }
			if (msg.command === 'actionDone') { releaseBtn(); }
		});

		setModel('linear');
	</script>
</body>
</html>`;
}
