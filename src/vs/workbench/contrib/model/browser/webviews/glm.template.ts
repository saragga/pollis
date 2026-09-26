/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getGlmHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Generalized Linear Models</title>
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
		.model-toggle { display: flex; width: fit-content; max-width: 100%; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
		.toggle-btn { background: transparent; border: none; border-right: 1px solid var(--vscode-input-border); color: var(--vscode-foreground); font-size: 12px; font-family: var(--vscode-font-family); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
		.toggle-btn:last-child { border-right: none; }
		.toggle-btn:hover { background: var(--vscode-list-hoverBackground); }
		.toggle-btn.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-row .form-group.wider { min-width: 200px; }
		.form-row .form-group.wide { min-width: 160px; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 320px; z-index: 1000; display: none; margin-bottom: 5px; }
		.form-label:not(.centered) .tooltip-text { left: 0; transform: none; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		.form-select { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: var(--vscode-font-family); outline: none; width: 100%; cursor: pointer; height: 37px; }
		.form-select:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
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
		.action-panel { margin-top: 20px; border-top: 1px solid var(--vscode-widget-border); padding-top: 16px; display: none; }
		.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
		.panel-title { font-size: 13px; font-weight: 600; }
		.panel-close { background: transparent; border: none; color: var(--vscode-descriptionForeground); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; }
		.panel-close:hover { color: var(--vscode-foreground); }
		.action-list { list-style: none; padding: 0; margin: 0; }
		.action-item { display: flex; flex-direction: column; align-items: flex-start; width: 100%; background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 8px 12px; margin-bottom: 6px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); }
		.action-item:hover { background: var(--vscode-list-hoverBackground); }
		.action-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); }
		.action-desc { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Generalized Linear Models</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Binary Response &#8212; Bernoulli and Binomial families with logit, probit, or complementary log-log links</li>
					<li>Count Data &#8212; Poisson and Negative Binomial regression for rate and overdispersed count outcomes</li>
					<li>Positive Continuous &#8212; Gamma and Inverse Gaussian for strictly positive skewed responses</li>
					<li>Robust inference: Heteroskedasticity-Consistent (HC0&#8211;HC3), Heteroskedasticity and Autocorrelation Consistent (HAC), Clustered, and Driscoll-Kraay covariance matrix estimators via CovarianceMatrices.jl</li>
				</ul>
			</div>
		</div>

		<!-- Formula -->
		<div class="form-group" style="margin-top:8px;">
			<label class="form-label form-label-with-tooltip">Formula
				<span class="tooltip-icon" id="tooltip-formula">?</span>
				<span class="tooltip-text" id="tooltip-text-formula"></span>
			</label>
			<textarea id="glm-formula" class="form-input" placeholder="y ~ x1 + x2" rows="1"></textarea>
		</div>

		<!-- Data, Family, Link -->
		<div class="form-row">
			<div class="form-group wider">
				<label class="form-label centered form-label-with-tooltip">Data
					<span class="tooltip-icon" id="tooltip-data">?</span>
					<span class="tooltip-text" id="tooltip-text-data"></span>
				</label>
				<textarea id="glm-data" class="form-input" placeholder="df" rows="1" style="text-align:center;"></textarea>
			</div>
			<div class="form-group wide">
				<label class="form-label centered form-label-with-tooltip">Family
					<span class="tooltip-icon" id="tooltip-family">?</span>
					<span class="tooltip-text" id="tooltip-text-family"></span>
				</label>
				<select id="glm-family" class="form-select">
					<option value="Bernoulli">Bernoulli</option>
					<option value="Binomial">Binomial</option>
					<option value="Poisson">Poisson</option>
					<option value="NegativeBinomial">NegativeBinomial</option>
					<option value="Geometric">Geometric</option>
					<option value="Gamma">Gamma</option>
					<option value="InverseGaussian">InverseGaussian</option>
					<option value="Normal">Normal</option>
				</select>
			</div>
			<div class="form-group wide">
				<label class="form-label centered form-label-with-tooltip">Link
					<span class="tooltip-icon" id="tooltip-link">?</span>
					<span class="tooltip-text" id="tooltip-text-link"></span>
				</label>
				<select id="glm-link" class="form-select">
					<option value="LogitLink">LogitLink (default)</option>
					<option value="ProbitLink">ProbitLink</option>
					<option value="CloglogLink">CloglogLink</option>
				</select>
			</div>
		</div>

		<!-- Inference toggle -->
		<div class="form-group" style="margin-bottom:12px;">
			<div class="form-label" style="margin-bottom:6px;">Inference</div>
			<div class="model-toggle" id="inference-group">
				<button class="toggle-btn active" data-inf="standard">Standard</button>
				<button class="toggle-btn" data-inf="hc0">HC0</button>
				<button class="toggle-btn" data-inf="hc1">HC1</button>
				<button class="toggle-btn" data-inf="hc2">HC2</button>
				<button class="toggle-btn" data-inf="hc3">HC3</button>
				<button class="toggle-btn" data-inf="hac">HAC</button>
				<button class="toggle-btn" data-inf="clustered">Clustered</button>
				<button class="toggle-btn" data-inf="driscoll-kraay">Driscoll-Kraay</button>
			</div>
		</div>

		<!-- Cluster variable -->
		<div class="form-row" id="cluster-group" style="display:none;">
			<div class="form-group wider">
				<label class="form-label centered">Cluster variable</label>
				<textarea id="glm-cluster" class="form-input" placeholder="cluster_id" rows="1" style="text-align:center;"></textarea>
			</div>
			<div class="form-group" style="flex:2; visibility:hidden;"></div>
		</div>

		<!-- Driscoll-Kraay variables -->
		<div class="form-row" id="glm-dk-group" style="display:none;">
			<div class="form-group wider">
				<label class="form-label centered">Time variable</label>
				<textarea id="glm-dk-time" class="form-input" placeholder="year" rows="1" style="text-align:center;"></textarea>
			</div>
			<div class="form-group wider">
				<label class="form-label centered">Entity variable</label>
				<textarea id="glm-dk-entity" class="form-input" placeholder="firm" rows="1" style="text-align:center;"></textarea>
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
						<li><button class="list-btn has-actions" id="btn-diagnose"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
						<li><button class="list-btn" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>Predict</button></li>
						<li><button class="list-btn" id="btn-compare"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>Compare</button></li>
						<li><button class="list-btn has-actions" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.37305 2.157H8.37105L8.19905 2.212C8.14005 2.233 8.08905 2.272 8.05305 2.323C8.01705 2.374 7.99705 2.435 7.99705 2.498C7.99705 2.561 8.01705 2.622 8.05305 2.672C8.08905 2.723 8.14005 2.761 8.19905 2.782ZM11.62 7.538C11.609 7.503 11.588 7.468 11.558 7.439C11.528 7.41 11.493 7.388 11.455 7.375L11.341 7.337C11.279 7.544 11.199 7.746 11.102 7.941C10.86 8.425 10.518 8.851 10.098 9.192L9.99005 9.292L9.54105 11H6.49205L6.14305 9.536L6.04305 9.436C5.18305 8.706 4.63105 7.677 4.49805 6.556C4.51205 5.607 4.88505 4.699 5.54105 4.013C5.86205 3.688 6.24505 3.432 6.66705 3.258C6.82305 3.194 6.98305 3.141 7.14505 3.101C7.05005 2.921 6.99805 2.713 6.99805 2.497C6.99805 2.358 7.02005 2.223 7.06205 2.094C6.79605 2.15 6.53505 2.23 6.28205 2.335C5.73805 2.56 5.24505 2.892 4.83105 3.31C3.99305 4.18 3.51605 5.336 3.49805 6.544V6.582C3.62305 7.911 4.24305 9.144 5.23505 10.037L5.93505 12.978L5.94305 13C6.04105 13.289 6.22805 13.54 6.47705 13.717C6.73405 13.901 7.04305 14 7.36005 14H8.76405C9.07305 13.974 9.36605 13.854 9.60405 13.655C9.84305 13.456 10.012 13.185 10.085 12.882L10.885 9.832C11.33 9.443 11.697 8.975 11.968 8.452C11.91 8.365 11.862 8.27 11.827 8.169L11.62 7.538ZM9.11605 12.628V12.641C9.09405 12.735 9.04105 12.82 8.96605 12.881C8.89105 12.947 8.79705 12.988 8.69805 13H7.35905C7.25105 12.999 7.14605 12.964 7.05905 12.9C6.98705 12.85 6.93105 12.781 6.89805 12.7L6.73105 12H9.28005L9.11605 12.628ZM14.956 5.862C14.927 5.822 14.886 5.791 14.839 5.774L14.827 5.771L14.215 5.572V5.574C14.029 5.512 13.86 5.408 13.721 5.269C13.582 5.13 13.478 4.961 13.416 4.775L13.217 4.163C13.201 4.116 13.17 4.075 13.129 4.046C13.088 4.018 13.039 4.002 12.989 4.002C12.939 4.002 12.89 4.017 12.849 4.046C12.809 4.075 12.778 4.116 12.761 4.163L12.562 4.775C12.501 4.959 12.399 5.127 12.262 5.266C12.126 5.404 11.959 5.51 11.775 5.573L11.163 5.772C11.116 5.788 11.074 5.819 11.046 5.86C11.018 5.901 11.002 5.95 11.002 6C11.002 6.05 11.017 6.099 11.046 6.14C11.075 6.18 11.116 6.211 11.163 6.228L11.746 6.417V6.42L11.77 6.428C11.957 6.49 12.126 6.594 12.265 6.733C12.403 6.872 12.508 7.042 12.57 7.228L12.77 7.84C12.786 7.887 12.817 7.928 12.858 7.957C12.898 7.985 12.945 8.001 12.994 8.001H13.001C13.051 8.001 13.1 7.986 13.141 7.957C13.182 7.928 13.212 7.887 13.229 7.84L13.428 7.228C13.49 7.042 13.594 6.873 13.733 6.734C13.872 6.595 14.041 6.491 14.227 6.429L14.839 6.23C14.886 6.214 14.928 6.183 14.956 6.142C14.984 6.101 15 6.052 15 6.002C15 5.952 14.985 5.903 14.956 5.862Z"/></svg>Interpret</button></li>
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
						<li><button class="list-btn has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>References</button></li>
					</ul>
					<div class="paper-links" id="paper-links"></div>
				</div>
			</div>
		</div>

		<div class="action-panel" id="action-panel"></div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();
		var activeBtn = null;
		var currentInference = 'standard';

		// ── Code helpers ────────────────────────────────────────────────────────
		function esc(s)      { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }

		var familySelect = document.getElementById('glm-family');
		var linkSelect   = document.getElementById('glm-link');

		var FAMILY_LINKS = {
			Bernoulli:        { default: 'LogitLink',            links: ['LogitLink', 'ProbitLink', 'CloglogLink', 'CauchitLink'] },
			Binomial:         { default: 'LogitLink',            links: ['LogitLink', 'ProbitLink', 'CloglogLink', 'CauchitLink', 'LogLink'] },
			Poisson:          { default: 'LogLink',              links: ['LogLink', 'IdentityLink', 'SqrtLink'] },
			NegativeBinomial: { default: 'NegativeBinomialLink', links: ['NegativeBinomialLink', 'LogLink', 'IdentityLink', 'SqrtLink'] },
			Geometric:        { default: 'LogLink',              links: ['LogLink', 'IdentityLink', 'InverseLink'] },
			Gamma:            { default: 'InverseLink',          links: ['InverseLink', 'LogLink', 'IdentityLink'] },
			InverseGaussian:  { default: 'InverseSquareLink',    links: ['InverseSquareLink', 'LogLink', 'IdentityLink'] },
			Normal:           { default: 'IdentityLink',         links: ['IdentityLink', 'LogLink', 'InverseLink'] },
		};

		function updateLinkOptions() {
			var family = familySelect.value;
			var info = FAMILY_LINKS[family] || { default: 'LogLink', links: ['LogLink'] };
			linkSelect.innerHTML = '';
			info.links.forEach(function(l) {
				var opt = document.createElement('option');
				opt.value = l;
				opt.textContent = l + (l === info.default ? ' (default)' : '');
				if (l === info.default) { opt.selected = true; }
				linkSelect.appendChild(opt);
			});
			updateCodePreview();
		}

		function isDefaultLink() {
			var family = familySelect.value;
			var info = FAMILY_LINKS[family];
			return info && linkSelect.value === info.default;
		}

		// ── Code preview ─────────────────────────────────────────────────────────
		function updateCodePreview() {
			var formula = val('glm-formula', 'y ~ x1 + x2');
			var data    = val('glm-data',    'df');
			var family  = familySelect.value;
			var link    = linkSelect.value;
			var cluster  = val('glm-cluster',    'cluster_id');
			var dkTime   = val('glm-dk-time',    'year');
			var dkEntity = val('glm-dk-entity',  'firm');

			var code = '';

			if (currentInference !== 'standard') {
				code += cline(kw('using') + ' ' + ty('GLM') + ', ' + ty('CovarianceMatrices'), 'GLM + robust standard errors');
			} else {
				code += cline(kw('using') + ' ' + ty('GLM'), 'generalized linear models');
			}
			code += blank();

			var modelCall = isDefaultLink()
				? fn('glm') + '(@formula(' + formula + '), ' + data + ', ' + ty(family) + '())'
				: fn('glm') + '(@formula(' + formula + '), ' + data + ', ' + ty(family) + '(), ' + ty(link) + '())';
			code += cline('model = ' + modelCall, family + (isDefaultLink() ? '' : ' with ' + link));
			code += blank();

			if (currentInference !== 'standard') {
				var vcov = '';
				if      (currentInference === 'hc0')       { vcov = 'V = ' + fn('vcov') + '(model, ' + ty('HC0') + '())'; }
				else if (currentInference === 'hc1')       { vcov = 'V = ' + fn('vcov') + '(model, ' + ty('HC1') + '())'; }
				else if (currentInference === 'hc2')       { vcov = 'V = ' + fn('vcov') + '(model, ' + ty('HC2') + '())'; }
				else if (currentInference === 'hc3')       { vcov = 'V = ' + fn('vcov') + '(model, ' + ty('HC3') + '())'; }
				else if (currentInference === 'hac')       { vcov = 'V = ' + fn('vcov') + '(model, ' + ty('HAC') + '(' + ty('BartlettKernel') + '(), ' + ty('NeweyWest') + '()))'; }
				else if (currentInference === 'clustered')      { vcov = 'V = ' + fn('vcov') + '(model, ' + ty('CRHC0') + '(' + data + '[:, :' + cluster + ']))'; }
				else if (currentInference === 'driscoll-kraay') { vcov = 'V = ' + fn('vcov') + '(' + ty('DriscollKraay') + '(' + ty('Bartlett') + '(5), tis=' + data + '.' + dkTime + ', iis=' + data + '.' + dkEntity + '), model)'; }
				code += cline(vcov, 'robust variance-covariance matrix');
				code += cline(fn('println') + '(' + fn('coeftable') + '(model, V))', 'coefficients with robust SEs');
			} else {
				code += cline(fn('println') + '(' + fn('coeftable') + '(model))', 'coefficient table');
			}

			code += cline(fn('println') + '("Deviance: ", ' + fn('deviance') + '(model))', 'model deviance');
			code += cline(fn('println') + '("AIC: ",     ' + fn('aic')      + '(model))', 'Akaike information criterion');

			document.getElementById('code-preview').innerHTML = code;
		}

		// ── Inference toggle ──────────────────────────────────────────────────────
		document.getElementById('inference-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-inf]');
			if (!btn) { return; }
			currentInference = btn.dataset.inf;
			document.querySelectorAll('#inference-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b === btn);
			});
			document.getElementById('cluster-group').style.display  = currentInference === 'clustered'      ? 'flex' : 'none';
			document.getElementById('glm-dk-group').style.display   = currentInference === 'driscoll-kraay' ? 'flex' : 'none';
			updateCodePreview();
		});

		familySelect.addEventListener('change', updateLinkOptions);
		linkSelect.addEventListener('change', updateCodePreview);

		// ── Input wiring ──────────────────────────────────────────────────────────
		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('input', updateCodePreview);
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
		});

		// ── Tooltip pin ───────────────────────────────────────────────────────────
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

		// ── Copy button ───────────────────────────────────────────────────────────
		document.getElementById('btn-copy').addEventListener('click', function() {
			var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
			var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				var btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

		// ── Action panel ──────────────────────────────────────────────────────────
		function pressBtn(btn) {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
			activeBtn = btn;
			btn.classList.add('was-pressed');
		}
		function releaseBtn() {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); activeBtn = null; }
		}

		function showActionList(title, items) {
			var panel = document.getElementById('action-panel');
			var list = items.map(function(item) {
				return '<li><button class="action-item" data-action="' + esc(item.action) + '">'
					+ '<span class="action-label">' + esc(item.label) + '</span>'
					+ '<span class="action-desc">' + esc(item.desc) + '</span>'
					+ '</button></li>';
			}).join('');
			panel.innerHTML = '<div class="panel-header">'
				+ '<span class="panel-title">' + esc(title) + '</span>'
				+ '<button class="panel-close" id="panel-close">&#215;</button>'
				+ '</div>'
				+ '<ul class="action-list">' + list + '</ul>';
			panel.style.display = 'block';
			document.getElementById('panel-close').addEventListener('click', function() {
				panel.style.display = 'none';
				releaseBtn();
			});
			panel.querySelectorAll('.action-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					vscode.postMessage({ command: 'openPanel', target: btn.dataset.action });
					panel.style.display = 'none';
					releaseBtn();
				});
			});
		}

		// ── Message handler ────────────────────────────────────────────────────────
		window.addEventListener('message', function(event) {
			var msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'packageLinks') {
				var container = document.getElementById('package-links');
				if (container) {
					container.innerHTML = '';
					(msg.packages || []).forEach(function(pkg, i) {
						var a = document.createElement('a');
						a.className = 'package-link';
						a.textContent = pkg.name;
						a.title = pkg.url;
						a.addEventListener('click', function(e) { e.preventDefault(); vscode.postMessage({ command: 'openUrl', url: pkg.url }); });
						container.appendChild(a);
						if (i < msg.packages.length - 1) { container.appendChild(document.createTextNode(', ')); }
					});
				}
			}
			if (msg.command === 'paperLinks') {
				var btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
			if (msg.command === 'tooltips') {
				var tips = msg.tooltips || {};
				['formula', 'data', 'family', 'link'].forEach(function(f) {
					var el = document.getElementById('tooltip-text-' + f);
					if (el && tips[f]) { el.textContent = tips[f]; }
				});
			}
			if (msg.command === 'setFamily') {
				familySelect.value = msg.family;
				updateLinkOptions();
			}
			if (msg.command === 'actionDone') { releaseBtn(); }
		});

		// ── Next Steps ────────────────────────────────────────────────────────────
		document.getElementById('btn-viz').addEventListener('click', function() {
			vscode.postMessage({ command: 'openPanel', target: 'visualization' });
		});
		document.getElementById('btn-diagnose').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.getElementById('action-panel').style.display = 'none'; return; }
			pressBtn(this);
			showActionList('Diagnose', [
				{ action: 'residual-plots',  label: 'Residual Plots',        desc: 'Deviance and Pearson residuals against fitted values and covariates' },
				{ action: 'overdispersion',  label: 'Overdispersion Test',   desc: 'Test whether the variance exceeds the mean for Poisson and Binomial families' },
				{ action: 'leverage',        label: 'Leverage & Influence',  desc: 'Hat-matrix leverage and Cook distance for outlier detection' },
			]);
		});
		document.getElementById('btn-predict').addEventListener('click', function() {
			vscode.postMessage({ command: 'openPanel', target: 'prediction' });
		});
		document.getElementById('btn-compare').addEventListener('click', function() {
			vscode.postMessage({ command: 'openPanel', target: 'model-comparison' });
		});
		document.getElementById('btn-interpret').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.getElementById('action-panel').style.display = 'none'; return; }
			pressBtn(this);
			showActionList('Interpret', [
				{ action: 'coefficients', label: 'Coefficient Interpretation', desc: 'Log-odds, rate-ratios, or marginal effects depending on the link function' },
				{ action: 'marginal',     label: 'Marginal Effects',           desc: 'Average marginal effects computed at observed covariate values' },
				{ action: 'deviance',     label: 'Deviance Analysis',          desc: 'Decompose model deviance and compare nested models with likelihood ratio tests' },
			]);
		});

		// ── Learn More ────────────────────────────────────────────────────────────
		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openDocs', target: 'wiki' });
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openNotebookList' });
		});
		document.getElementById('btn-documentation').addEventListener('click', function() {
			vscode.postMessage({ command: 'openDocs', target: 'documentation' });
		});
		document.getElementById('btn-paper').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			pressBtn(this);
			vscode.postMessage({ command: 'openDocs', target: 'paper' });
		});

		updateCodePreview();
	</script>
</body>
</html>`;
}
