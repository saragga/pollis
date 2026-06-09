/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getCrnHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<title>Interaction Network Models</title>
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
		.param-input { text-align: center; }
		.eq-section { margin: 0 0 20px 0; border: 1px solid var(--vscode-widget-border); border-radius: 6px; overflow: hidden; }
		.eq-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; background: var(--vscode-textCodeBlock-background); border: none; color: var(--vscode-textLink-foreground); font-family: var(--vscode-font-family); font-size: 13px; font-weight: 600; padding: 10px 14px; cursor: pointer; text-align: left; }
		.eq-toggle:hover { text-decoration: underline; }
		.eq-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.eq-body { display: none; padding: 16px 20px; background: var(--vscode-editor-background); color: var(--vscode-descriptionForeground); font-style: italic; }
		.eq-body.open { display: block; }
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
			<h1>Interaction Network Models</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Chemical &#8212; enzyme kinetics such as Michaelis&#8211;Menten, where substrate, enzyme&#8211;substrate complex, and product interconvert through mass-action reactions</li>
					<li>Genetic &#8212; gene regulatory circuits such as the repressilator, a three-gene transcriptional oscillator where each protein represses the next gene in a cycle</li>
					<li>Ecological &#8212; species interaction networks such as Lotka&#8211;Volterra predator&#8211;prey, where prey reproduction and predation are expressed as birth and consumption reactions</li>
					<li>Epidemic &#8212; disease spread expressed as a reaction network, with susceptible&#8211;infectious contact and infectious&#8211;recovered transitions as probabilistic events</li>
				</ul>
			</div>
		</div>

		<div class="model-toggle" id="model-group">
			<button class="toggle-btn" data-model="chemical">Chemical</button>
			<button class="toggle-btn" data-model="genetic">Genetic</button>
			<button class="toggle-btn" data-model="ecological">Ecological</button>
			<button class="toggle-btn" data-model="epidemic">Epidemic</button>
		</div>

		<div class="eq-section">
			<button class="eq-toggle" id="eq-toggle">
				<span>Reaction network</span>
				<span class="eq-chevron" id="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>
			</button>
			<div class="eq-body" id="eq-body">Coming soon!</div>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">T (time)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Simulation time span. For ODE solutions this is the integration horizon; for Gillespie stochastic simulation it is the maximum event time.</span>
				</label>
				<textarea id="crn-T" class="form-input param-input" placeholder="100" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">k1 (forward rate)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Primary forward reaction rate. For Chemical: substrate binding rate k1. For Genetic: transcription rate alpha. For Ecological: prey growth rate a. For Epidemic: transmission rate beta.</span>
				</label>
				<textarea id="crn-k1" class="form-input param-input" placeholder="1.0" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">k2 (reverse/decay rate)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Secondary rate. For Chemical: unbinding rate k2. For Genetic: protein degradation rate gamma. For Ecological: predator death rate c. For Epidemic: recovery rate gamma.</span>
				</label>
				<textarea id="crn-k2" class="form-input param-input" placeholder="0.1" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">u0 (initial amount)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Initial copy number or concentration of the primary species. For Chemical: initial substrate S0. For Genetic: initial mRNA level. For Ecological: initial prey population. For Epidemic: initial susceptibles.</span>
				</label>
				<textarea id="crn-u0" class="form-input param-input" placeholder="100" rows="1"></textarea>
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
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.19905 2.782ZM11.62 7.538C11.455 7.503 11.29 7.388 11.175 7.375L11.062 7.337C11.0 7.544 10.92 7.746 10.823 7.941C10.581 8.425 10.239 8.851 9.819 9.192L9.71105 9.292L9.26205 11H6.21305L5.86405 9.536L5.76405 9.436C4.90405 8.706 4.35205 7.677 4.21905 6.556C4.23305 5.607 4.60605 4.699 5.26205 4.013C5.58305 3.688 5.96605 3.432 6.38805 3.258C6.54405 3.194 6.70405 3.141 6.86605 3.101C6.77105 2.921 6.71905 2.713 6.71905 2.497C6.71905 2.358 6.74105 2.223 6.78305 2.094C6.51705 2.15 6.25605 2.23 6.00305 2.335C5.45905 2.56 4.96605 2.892 4.55205 3.31C3.71405 4.18 3.23705 5.336 3.21905 6.544V6.582C3.34405 7.911 3.96405 9.144 4.95605 10.037L5.65605 12.978L5.66405 13C5.76205 13.289 5.94905 13.54 6.19805 13.717C6.45505 13.901 6.76405 14 7.08105 14H8.48505C8.79405 13.974 9.08705 13.854 9.32505 13.655C9.56405 13.456 9.73305 13.185 9.80605 12.882L10.606 9.832C11.051 9.443 11.418 8.975 11.689 8.452C11.631 8.365 11.583 8.27 11.548 8.169L11.62 7.538Z"/></svg>Interpret</button></li>
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
		var currentModel = 'chemical';
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

		document.getElementById('eq-toggle').addEventListener('click', function() {
			var body = document.getElementById('eq-body');
			var chevron = document.getElementById('eq-chevron');
			var isOpen = body.classList.toggle('open');
			chevron.style.transform = isOpen ? '' : 'rotate(-90deg)';
		});

		function updateCodePreview() {
			var T  = val('crn-T',  '100');
			var k1 = val('crn-k1', '1.0');
			var k2 = val('crn-k2', '0.1');
			var u0 = val('crn-u0', '100');
			var c = '';

			if (currentModel === 'chemical') {
				c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('Plots'));
				c += blank();
				c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Michaelis-Menten enzyme kinetics');
				c += cline('    ' + k1 + ', S + E --> SE', 'binding: substrate + enzyme form complex');
				c += cline('    ' + k2 + ', SE --> S + E', 'unbinding: complex dissociates');
				c += cline('    0.5, SE --> P + E',        'catalysis: product release, rate kcat=0.5');
				c += line(kw('end'));
				c += blank();
				c += cline('u0  = [:S => ' + u0 + '.0, :E => 10.0, :SE => 0.0, :P => 0.0]', 'initial conditions');
				c += cline('p   = []', 'rates embedded in network definition above');
				c += cline('tspan = (0.0, ' + T + '.0)', 'time span');
				c += line('prob = ' + fn('ODEProblem') + '(rn, u0, tspan, p)');
				c += line('sol  = ' + fn('solve') + '(prob, ' + fn('Tsit5') + '())');
				c += blank();
				c += cline(fn('plot') + '(sol, xlabel="Time", ylabel="Amount", title="Michaelis-Menten Kinetics")', 'plot species trajectories');
			} else if (currentModel === 'genetic') {
				c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('Plots'));
				c += blank();
				c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Repressilator: 3-gene transcriptional oscillator');
				c += cline('    ' + fn('hillr') + '(Pz, ' + k1 + ', 1.0, 2), --> Px', 'Pz represses Px transcription');
				c += cline('    ' + fn('hillr') + '(Px, ' + k1 + ', 1.0, 2), --> Py', 'Px represses Py transcription');
				c += cline('    ' + fn('hillr') + '(Py, ' + k1 + ', 1.0, 2), --> Pz', 'Py represses Pz transcription');
				c += cline('    ' + k2 + ', Px --> 0', 'protein Px degradation');
				c += cline('    ' + k2 + ', Py --> 0', 'protein Py degradation');
				c += cline('    ' + k2 + ', Pz --> 0', 'protein Pz degradation');
				c += line(kw('end'));
				c += blank();
				c += cline('u0    = [:Px => ' + u0 + '.0, :Py => 0.0, :Pz => 0.0]', 'asymmetric initial conditions trigger oscillation');
				c += cline('tspan = (0.0, ' + T + '.0)', 'time span');
				c += line('prob  = ' + fn('ODEProblem') + '(rn, u0, tspan, [])');
				c += line('sol   = ' + fn('solve') + '(prob, ' + fn('Tsit5') + '())');
				c += blank();
				c += cline(fn('plot') + '(sol, xlabel="Time", ylabel="Protein level", title="Repressilator Oscillator")', 'sustained oscillations if parameters are in limit-cycle regime');
			} else if (currentModel === 'ecological') {
				c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('Plots'));
				c += blank();
				c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Lotka-Volterra predator-prey');
				c += cline('    ' + k1 + ', X --> 2X',     'prey reproduction at rate a=' + k1);
				c += cline('    0.05, X + Y --> 2Y',        'predation and predator reproduction');
				c += cline('    ' + k2 + ', Y --> 0',       'predator death at rate c=' + k2);
				c += line(kw('end'));
				c += blank();
				c += cline('u0    = [:X => ' + u0 + '.0, :Y => 10.0]', 'initial prey and predator populations');
				c += cline('tspan = (0.0, ' + T + '.0)', 'time span');
				c += line('prob  = ' + fn('ODEProblem') + '(rn, u0, tspan, [])');
				c += line('sol   = ' + fn('solve') + '(prob, ' + fn('Tsit5') + '())');
				c += blank();
				c += cline(fn('plot') + '(sol, xlabel="Time", ylabel="Population", title="Lotka-Volterra Predator-Prey")', 'cyclic oscillations in prey and predator');
			} else {
				c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('Plots'));
				c += blank();
				c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'SIR epidemic as a reaction network');
				c += cline('    ' + k1 + '/' + u0 + ', S + I --> 2I', 'transmission: susceptible contacts infectious');
				c += cline('    ' + k2 + ', I --> R',                   'recovery: infectious becomes recovered');
				c += line(kw('end'));
				c += blank();
				c += cline('N     = ' + u0, 'total population');
				c += cline('u0    = [:S => N - 1.0, :I => 1.0, :R => 0.0]', 'initial conditions: one seed case');
				c += cline('tspan = (0.0, ' + T + '.0)', 'time span in days');
				c += line('prob  = ' + fn('ODEProblem') + '(rn, u0, tspan, [])');
				c += line('sol   = ' + fn('solve') + '(prob, ' + fn('Tsit5') + '())');
				c += blank();
				c += cline('R0 = ' + k1 + ' / ' + k2, 'basic reproduction number');
				c += cline(fn('println') + '("R0 = ", ' + fn('round') + '(R0; digits=2))', 'epidemic threshold check');
				c += cline(fn('plot') + '(sol, xlabel="Days", ylabel="People", title="SIR as Reaction Network")', 'epidemic curve');
			}
			document.getElementById('code-preview').innerHTML = c;
		}

		var MODELS = ['chemical', 'genetic', 'ecological', 'epidemic'];

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		['crn-T', 'crn-k1', 'crn-k2', 'crn-u0'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
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
				id: 'species-trajectories',
				label: 'Species Trajectories',
				desc: 'Plot all species concentrations over time for the selected reaction network',
				code: function() {
					var T = val('crn-T', '100'); var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1'); var u0 = val('crn-u0', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('GLMakie'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Lotka-Volterra as example');
					c += cline('    ' + k1 + ', X --> 2X', 'prey growth');
					c += cline('    0.05, X + Y --> 2Y', 'predation');
					c += cline('    ' + k2 + ', Y --> 0', 'predator death');
					c += line(kw('end'));
					c += blank();
					c += line('sol = ' + fn('solve') + '(' + fn('ODEProblem') + '(rn, [:X=>' + u0 + '.0,:Y=>10.0], (0.0,' + T + '.0), []), ' + fn('Tsit5') + '())');
					c += blank();
					c += line('fig,ax=' + fn('Figure') + '(),' + fn('Axis') + '(fig[1,1],xlabel="Time",ylabel="Population",title="Reaction Network Trajectories")');
					c += line(fn('lines!') + '(ax,sol.t,sol[:X,:],label="Prey X",color=:blue)');
					c += line(fn('lines!') + '(ax,sol.t,sol[:Y,:],label="Predator Y",color=:red)');
					c += line(fn('axislegend') + '(ax); ' + fn('display') + '(fig)');
					return c;
				},
			},
			{
				id: 'phase-portrait',
				label: 'Phase Portrait',
				desc: 'Plot the phase plane of two key species to reveal limit cycles, fixed points, and nullclines',
				code: function() {
					var T = val('crn-T', '100'); var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1'); var u0 = val('crn-u0', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('GLMakie'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Lotka-Volterra');
					c += cline('    ' + k1 + ', X --> 2X', 'prey growth');
					c += cline('    0.05, X + Y --> 2Y', 'predation');
					c += cline('    ' + k2 + ', Y --> 0', 'predator death');
					c += line(kw('end'));
					c += blank();
					c += line('sol = ' + fn('solve') + '(' + fn('ODEProblem') + '(rn, [:X=>' + u0 + '.0,:Y=>10.0], (0.0,' + T + '.0), []), ' + fn('Tsit5') + '())');
					c += blank();
					c += line('fig,ax=' + fn('Figure') + '(),' + fn('Axis') + '(fig[1,1],xlabel="Prey X",ylabel="Predator Y",title="Phase Portrait")');
					c += line(fn('lines!') + '(ax,sol[:X,:],sol[:Y,:],color=:purple)');
					c += cline(fn('scatter!') + '(ax,[sol[:X,1]],[sol[:Y,1]],color=:blue,markersize=10)', 'initial state');
					c += line(fn('display') + '(fig)');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'steady-states',
				label: 'Steady States',
				desc: 'Compute all steady states of the reaction network using HomotopyContinuation.jl via Catalyst',
				code: function() {
					var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('HomotopyContinuation'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Michaelis-Menten example');
					c += cline('    ' + k1 + ', S + E --> SE', 'binding');
					c += cline('    ' + k2 + ', SE --> S + E', 'unbinding');
					c += cline('    0.5, SE --> P + E', 'catalysis');
					c += line(kw('end'));
					c += blank();
					c += cline('ss = ' + fn('steady_states') + '(rn, [])', 'find all steady states (polynomial system solver)');
					c += line(fn('println') + '("Number of steady states: ", ' + fn('length') + '(ss))');
					c += line(kw('for') + ' s ' + kw('in') + ' ss');
					c += line('    ' + fn('println') + '(s)');
					c += line(kw('end'));
					return c;
				},
			},
			{
				id: 'conservation-laws',
				label: 'Conservation Laws',
				desc: 'Find conserved moieties in the network — quantities that remain constant under all reactions',
				code: function() {
					var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Michaelis-Menten');
					c += cline('    ' + k1 + ', S + E --> SE', 'binding');
					c += cline('    ' + k2 + ', SE --> S + E', 'unbinding');
					c += cline('    0.5, SE --> P + E', 'catalysis');
					c += line(kw('end'));
					c += blank();
					c += cline('cl = ' + fn('conservationlaws') + '(rn)', 'stoichiometry-based conservation law matrix');
					c += line(fn('println') + '("Conservation law matrix:")');
					c += line(fn('println') + '(cl)');
					c += cline(fn('println') + '("Species: ", ' + fn('species') + '(rn))', 'E + SE = const  and  S + SE + P = const');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'rate-sweep',
				label: 'Rate Sweep',
				desc: 'Sweep the forward rate k1 and record the final state or oscillation amplitude across values',
				code: function() {
					var T = val('crn-T', '100'); var k2 = val('crn-k2', '0.1'); var u0 = val('crn-u0', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('GLMakie'));
					c += blank();
					c += cline('k2 = ' + k2, 'fixed predator death rate');
					c += cline('k1_vals = 0.2:0.2:2.0', 'sweep prey growth rate');
					c += cline('max_Y   = ' + ty('Float64') + '[]', 'record peak predator population');
					c += line(kw('for') + ' k1 ' + kw('in') + ' k1_vals');
					c += line('    rn = ' + kw('@reaction_network') + ' ' + kw('begin'));
					c += line('        k1, X --> 2X; 0.05, X + Y --> 2Y; k2, Y --> 0');
					c += line('    ' + kw('end'));
					c += line('    sol = ' + fn('solve') + '(' + fn('ODEProblem') + '(rn, [:X=>' + u0 + '.0,:Y=>10.0], (0.0,' + T + '.0), []), ' + fn('Tsit5') + '())');
					c += line('    ' + fn('push!') + '(max_Y, ' + fn('maximum') + '(sol[:Y,:]))');
					c += line(kw('end'));
					c += blank();
					c += line('fig,ax=' + fn('Figure') + '(),' + fn('Axis') + '(fig[1,1],xlabel="k1 (prey growth)",ylabel="Peak predator Y",title="Rate Sweep")');
					c += line(fn('lines!') + '(ax,' + fn('collect') + '(k1_vals),max_Y,color=:red)');
					c += line(fn('display') + '(fig)');
					return c;
				},
			},
			{
				id: 'gillespie',
				label: 'Stochastic Simulation',
				desc: 'Run the Gillespie exact stochastic simulation algorithm for small copy-number systems',
				code: function() {
					var T = val('crn-T', '100'); var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1'); var u0 = val('crn-u0', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('JumpProcesses') + ', ' + ty('GLMakie'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'SIR as reaction network (integer copy numbers)');
					c += cline('    ' + k1 + '/' + u0 + ', S + I --> 2I', 'transmission');
					c += cline('    ' + k2 + ', I --> R', 'recovery');
					c += line(kw('end'));
					c += blank();
					c += cline('u0    = [:S => ' + u0 + ' - 1, :I => 1, :R => 0]', 'integer initial conditions for Gillespie');
					c += cline('tspan = (0.0, ' + T + '.0)', 'time span');
					c += line('jprob = ' + fn('JumpProblem') + '(rn, ' + fn('DiscreteProblem') + '(rn, u0, tspan, []), ' + fn('Direct') + '())');
					c += line('sol   = ' + fn('solve') + '(jprob, ' + fn('SSAStepper') + '())');
					c += blank();
					c += line('fig,ax=' + fn('Figure') + '(),' + fn('Axis') + '(fig[1,1],xlabel="Days",ylabel="Count",title="Gillespie SIR Simulation")');
					c += line(fn('stairs!') + '(ax,sol.t,sol[:S,:],label="S",color=:blue)');
					c += line(fn('stairs!') + '(ax,sol.t,sol[:I,:],label="I",color=:red)');
					c += line(fn('stairs!') + '(ax,sol.t,sol[:R,:],label="R",color=:green)');
					c += line(fn('axislegend') + '(ax); ' + fn('display') + '(fig)');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'ode-vs-gillespie',
				label: 'ODE vs Gillespie',
				desc: 'Overlay the deterministic ODE solution and a stochastic Gillespie trajectory on the same axes',
				code: function() {
					var T = val('crn-T', '100'); var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1'); var u0 = val('crn-u0', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('JumpProcesses') + ', ' + ty('GLMakie'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'SIR reaction network');
					c += cline('    ' + k1 + '/' + u0 + ', S + I --> 2I', 'transmission');
					c += cline('    ' + k2 + ', I --> R', 'recovery');
					c += line(kw('end'));
					c += blank();
					c += cline('u0_ode = [:S=>' + u0 + '-1.0, :I=>1.0, :R=>0.0]', 'ODE: continuous');
					c += line('sol_ode = ' + fn('solve') + '(' + fn('ODEProblem') + '(rn, u0_ode, (0.0,' + T + '.0), []), ' + fn('Tsit5') + '())');
					c += blank();
					c += cline('u0_ssa = [:S=>' + u0 + '-1, :I=>1, :R=>0]', 'Gillespie: integer');
					c += line('jprob  = ' + fn('JumpProblem') + '(rn, ' + fn('DiscreteProblem') + '(rn, u0_ssa, (0.0,' + T + '.0), []), ' + fn('Direct') + '())');
					c += line('sol_ssa = ' + fn('solve') + '(jprob, ' + fn('SSAStepper') + '())');
					c += blank();
					c += line('fig,ax=' + fn('Figure') + '(),' + fn('Axis') + '(fig[1,1],xlabel="Days",ylabel="Infectious",title="ODE vs Gillespie")');
					c += line(fn('lines!') + '(ax,sol_ode.t,sol_ode[:I,:],color=:red,label="ODE")');
					c += line(fn('stairs!') + '(ax,sol_ssa.t,sol_ssa[:I,:],color=:orange,linestyle=:dash,label="Gillespie")');
					c += line(fn('axislegend') + '(ax); ' + fn('display') + '(fig)');
					return c;
				},
			},
			{
				id: 'network-domains',
				label: 'Cross-Domain Comparison',
				desc: 'Run Lotka-Volterra, repressilator, and SIR and compare their oscillation periods',
				code: function() {
					var T = val('crn-T', '100'); var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1'); var u0 = val('crn-u0', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst') + ', ' + ty('DifferentialEquations') + ', ' + ty('Statistics'));
					c += blank();
					c += cline('lv = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Lotka-Volterra');
					c += line('    ' + k1 + ', X --> 2X; 0.05, X + Y --> 2Y; ' + k2 + ', Y --> 0');
					c += line(kw('end'));
					c += cline('rep = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Repressilator');
					c += line('    ' + fn('hillr') + '(Pz,' + k1 + ',1.0,2),-->Px; ' + fn('hillr') + '(Px,' + k1 + ',1.0,2),-->Py; ' + fn('hillr') + '(Py,' + k1 + ',1.0,2),-->Pz');
					c += line('    ' + k2 + ',Px-->0; ' + k2 + ',Py-->0; ' + k2 + ',Pz-->0');
					c += line(kw('end'));
					c += blank();
					c += line('sol_lv  = ' + fn('solve') + '(' + fn('ODEProblem') + '(lv,  [:X=>' + u0 + '.0,:Y=>10.0],          (0.0,' + T + '.0),[]),' + fn('Tsit5') + '())');
					c += line('sol_rep = ' + fn('solve') + '(' + fn('ODEProblem') + '(rep, [:Px=>' + u0 + '.0,:Py=>0.0,:Pz=>0.0], (0.0,' + T + '.0),[]),' + fn('Tsit5') + '())');
					c += blank();
					c += cline(fn('println') + '("LV   peak X amplitude: ", ' + fn('round') + '(' + fn('maximum') + '(sol_lv[:X,:]) - ' + fn('minimum') + '(sol_lv[:X,:]); digits=1))', 'prey oscillation range');
					c += cline(fn('println') + '("Rep  peak Px amplitude: ", ' + fn('round') + '(' + fn('maximum') + '(sol_rep[:Px,:]) - ' + fn('minimum') + '(sol_rep[:Px,:]); digits=1))', 'repressilator amplitude');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'stoichiometry-matrix',
				label: 'Stoichiometry Matrix',
				desc: 'Print the stoichiometry matrix and species/reaction lists to understand network structure',
				code: function() {
					var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Michaelis-Menten enzyme kinetics');
					c += cline('    ' + k1 + ', S + E --> SE', 'binding');
					c += cline('    ' + k2 + ', SE --> S + E', 'unbinding');
					c += cline('    0.5, SE --> P + E', 'catalysis');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('println') + '("Species: ", ' + fn('species') + '(rn))', 'list all species');
					c += cline(fn('println') + '("Reactions: ", ' + fn('reactions') + '(rn))', 'list all reactions');
					c += cline('N = ' + fn('netstoichmat') + '(rn)', 'net stoichiometry matrix (species x reactions)');
					c += line(fn('println') + '("Stoichiometry matrix:")');
					c += line(fn('println') + '(N)');
					return c;
				},
			},
			{
				id: 'network-summary',
				label: 'Network Summary',
				desc: 'Print structural properties: number of species, reactions, complexes, and deficiency index',
				code: function() {
					var k1 = val('crn-k1', '1.0'); var k2 = val('crn-k2', '0.1');
					var c = '';
					c += line(kw('using') + ' ' + ty('Catalyst'));
					c += blank();
					c += cline('rn = ' + kw('@reaction_network') + ' ' + kw('begin'), 'Lotka-Volterra predator-prey');
					c += cline('    ' + k1 + ', X --> 2X', 'prey growth');
					c += cline('    0.05, X + Y --> 2Y', 'predation');
					c += cline('    ' + k2 + ', Y --> 0', 'predator death');
					c += line(kw('end'));
					c += blank();
					c += cline(fn('println') + '("Species:   ", ' + fn('numspecies') + '(rn))', 'number of distinct species');
					c += cline(fn('println') + '("Reactions: ", ' + fn('numreactions') + '(rn))', 'number of reactions');
					c += cline(fn('println') + '("Complexes: ", ' + fn('numcomplexes') + '(rn))', 'number of reaction complexes');
					c += cline(fn('println') + '("Deficiency (delta): ", ' + fn('deficiency') + '(rn))', 'delta = n - l - s; 0 means well-behaved dynamics');
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

		setModel('chemical');
	</script>
</body>
</html>`;
}
