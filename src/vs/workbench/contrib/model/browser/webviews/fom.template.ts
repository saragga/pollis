/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getFomHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>First-Order Methods</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
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
		textarea.form-input::placeholder { color: var(--vscode-input-placeholderForeground); opacity: 1; }
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
		.illus-section { margin: 0 0 20px 0; }
		.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.illus-toggle:hover { text-decoration: underline; }
		.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
		.illus-body { padding: 8px 0 4px 0; }
		.illus-section.collapsed .illus-body { display: none; }
	</style>
</head>
<body>
	<div class="container">

		<h1>First-Order Methods</h1>
		<div class="powered-by">Powered by: <span id="package-links"></span></div>
		<div class="subtitle">
			<ul class="methods-list">
				<li>Stochastic gradient descent - simple, noisy updates scaled by a fixed learning rate</li>
				<li>Adam &#8212; adaptive moment estimation; per-parameter rates via first and second gradient moments</li>
				<li>AdaMax &#8212; Adam variant with L&#8734; norm update; robust for embeddings and sparse gradients</li>
				<li>AdaGrad - Adaptively adjusts learning rates per parameter, but its continuously shrinking learning rate can cause premature convergence. Modern deep learning therefore often prefers RMSProp or Adam.</li>
				<li>Momentum &#8212; SGD with velocity accumulation; smooths oscillations and accelerates convergence</li>
				<li>Nesterov &#8212; momentum SGD with look-ahead gradient; corrects overshoot before it happens</li>
				<li>RMSProp &#8212; normalises by exponential moving avg of squared gradients; fixes AdaGrad decay</li>
				<li>AdamW &#8212; Adam with decoupled weight decay; prevents L2 regularisation coupling to adaptive rates</li>
			</ul>
		</div>

		<div class="model-toggle" id="mode-group">
			<button class="toggle-btn" data-model="sgd">SGD</button>
			<button class="toggle-btn" data-model="adam">Adam</button>
			<button class="toggle-btn" data-model="adamax">AdaMax</button>
			<button class="toggle-btn" data-model="adagrad">AdaGrad</button>
			<button class="toggle-btn" data-model="momentum">Momentum</button>
			<button class="toggle-btn" data-model="nesterov">Nesterov</button>
			<button class="toggle-btn" data-model="rmsprop">RMSProp</button>
			<button class="toggle-btn" data-model="adamw">AdamW</button>
		</div>

		<div class="illus-section" id="illus-section">
			<button class="illus-toggle" id="illus-toggle">
				<svg class="illus-chevron" width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.357-4.357-.62.618L7.976 11.31l4.977-4.976-.62-.618-4.357 4.356z"/></svg>
				Illustration
			</button>
			<div class="illus-body" id="illus-body"></div>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">Objective <i>f(x)</i>
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Julia expression for the scalar objective or loss function. Use x[1], x[2], ... to index components.</span>
				</label>
				<textarea id="sg-f" class="form-input" placeholder="x[1]^2 + x[2]^2" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">x0
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Starting parameter vector as a Julia array. Example: [1.0, 1.0].</span>
				</label>
				<textarea id="sg-x0" class="form-input" placeholder="[1.0, 1.0]" rows="1"></textarea>
			</div>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">Learning rate <i>lr</i>
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Step size scaling factor. SGD and momentum methods work well at 0.01. Adam, AdamW and RMSProp typically use 0.001.</span>
				</label>
				<textarea id="sg-lr" class="form-input" placeholder="0.01" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">Iterations
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Number of gradient update steps.</span>
				</label>
				<textarea id="sg-iters" class="form-input" placeholder="100" rows="1"></textarea>
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
		var currentModel = 'sgd';
		var activeBtn = null;
		var currentPanelId = null;
		var wikiSections = [];
		var notebookSections = [];

		function esc(s)      { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }

		function isOptimizationModel() {
			return ['momentum', 'nesterov', 'rmsprop', 'adamw'].includes(currentModel);
		}

		function getAlgoName() {
			if (currentModel === 'adam')     { return 'Adam'; }
			if (currentModel === 'adamax')   { return 'AdaMax'; }
			if (currentModel === 'adagrad')  { return 'AdaGrad'; }
			if (currentModel === 'momentum') { return 'Momentum'; }
			if (currentModel === 'nesterov') { return 'Nesterov'; }
			if (currentModel === 'rmsprop')  { return 'RMSProp'; }
			if (currentModel === 'adamw')    { return 'AdamW'; }
			return 'Descent';
		}

		function getAlgoDesc() {
			if (currentModel === 'adam')     { return 'Adam: adaptive moment estimation (beta1=0.9, beta2=0.999)'; }
			if (currentModel === 'adamax')   { return 'AdaMax: L-inf norm variant of Adam (beta1=0.9, beta2=0.999)'; }
			if (currentModel === 'adagrad')  { return 'AdaGrad: accumulated squared gradients per parameter'; }
			if (currentModel === 'momentum') { return 'Momentum SGD: velocity accumulation (rho=0.9)'; }
			if (currentModel === 'nesterov') { return 'Nesterov: look-ahead gradient at projected point (rho=0.9)'; }
			if (currentModel === 'rmsprop')  { return 'RMSProp: exponential moving avg of squared gradients'; }
			if (currentModel === 'adamw')    { return 'AdamW: Adam with decoupled weight decay'; }
			return 'SGD: plain gradient descent with fixed learning rate';
		}

		function getDefaultLr() {
			if (currentModel === 'adam')     { return '0.001'; }
			if (currentModel === 'adamax')   { return '0.002'; }
			if (currentModel === 'adagrad')  { return '0.01'; }
			if (currentModel === 'momentum') { return '0.01'; }
			if (currentModel === 'nesterov') { return '0.01'; }
			if (currentModel === 'rmsprop')  { return '0.001'; }
			if (currentModel === 'adamw')    { return '0.001'; }
			return '0.01';
		}

		function getAlgoExtra() {
			if (currentModel === 'momentum' || currentModel === 'nesterov') { return ', 0.9'; }
			return '';
		}

		// ---- SVG illustrations ----

		function svgSGD() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<polyline points="35,35 55,55 70,42 88,62 100,50 112,68 122,58 132,72 140,63 146,74 151,68 154,78 156,72 158,80 159,82 160,85" fill="none" stroke="currentColor" stroke-width="1.8" opacity="0.7"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.75"/>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">SGD: noisy updates; lr decay helps convergence</text>'
				+ '</svg>';
		}

		function svgAdam() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.8"/>'
				+ '<line x1="35" y1="35" x2="83" y2="65" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr)"/>'
				+ '<line x1="86" y1="67" x2="122" y2="78" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr)"/>'
				+ '<line x1="125" y1="79" x2="150" y2="83" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr)"/>'
				+ '<line x1="153" y1="83.5" x2="159" y2="85" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr)"/>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">Adam: adaptive per-parameter lr via 1st and 2nd moments</text>'
				+ '</svg>';
		}

		function svgAdaMax() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.8"/>'
				+ '<line x1="35" y1="35" x2="80" y2="63" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr2)"/>'
				+ '<line x1="83" y1="65" x2="122" y2="77" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr2)"/>'
				+ '<line x1="125" y1="78" x2="151" y2="83.5" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr2)"/>'
				+ '<line x1="154" y1="84" x2="159" y2="85" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-arr2)"/>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">AdaMax: L-inf norm update; robust for sparse grads</text>'
				+ '</svg>';
		}

		function svgAdaGrad() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-arr3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.8"/>'
				+ '<line x1="35" y1="35" x2="96" y2="72" stroke="currentColor" stroke-width="2.5" opacity="0.72" marker-end="url(#fom-arr3)"/>'
				+ '<line x1="99" y1="73.5" x2="136" y2="81" stroke="currentColor" stroke-width="1.8" opacity="0.72" marker-end="url(#fom-arr3)"/>'
				+ '<line x1="139" y1="81.8" x2="154" y2="84" stroke="currentColor" stroke-width="1.2" opacity="0.72" marker-end="url(#fom-arr3)"/>'
				+ '<line x1="157" y1="84.5" x2="159.5" y2="85" stroke="currentColor" stroke-width="0.8" opacity="0.72" marker-end="url(#fom-arr3)"/>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">AdaGrad: accumulated sq. grads reduce lr per param</text>'
				+ '</svg>';
		}

		function svgMomentum() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-mom" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<path d="M35,35 Q80,55 110,65 Q135,72 152,80 Q158,83 160,85" fill="none" stroke="currentColor" stroke-width="2" opacity="0.7"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.75"/>'
				+ '<circle cx="80" cy="56" r="2.5" fill="currentColor" opacity="0.6"/>'
				+ '<line x1="80" y1="56" x2="96" y2="52" stroke="currentColor" stroke-width="1.5" opacity="0.5" marker-end="url(#fom-mom)"/>'
				+ '<text x="99" y="50" font-size="8" fill="currentColor" opacity="0.55" font-family="sans-serif">v_t</text>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<rect x="196" y="28" width="108" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>'
				+ '<text x="250" y="41" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.7" font-family="sans-serif">v_t = rho*v + lr*g</text>'
				+ '<text x="250" y="52" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.55" font-family="sans-serif">smooth, accelerated</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">Momentum: velocity accumulates; oscillations damped</text>'
				+ '</svg>';
		}

		function svgNesterov() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-nes" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker>'
				+ '<marker id="fom-nes2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.45"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<path d="M35,35 Q80,55 110,65 Q135,72 152,80 Q158,83 160,85" fill="none" stroke="currentColor" stroke-width="2" opacity="0.7"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.75"/>'
				+ '<circle cx="80" cy="56" r="2.5" fill="currentColor" opacity="0.6"/>'
				+ '<line x1="80" y1="56" x2="104" y2="63" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.45" marker-end="url(#fom-nes2)"/>'
				+ '<circle cx="107" cy="64" r="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>'
				+ '<text x="110" y="60" font-size="8" fill="currentColor" opacity="0.55" font-family="sans-serif">look-ahead</text>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<rect x="196" y="28" width="108" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>'
				+ '<text x="250" y="41" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.7" font-family="sans-serif">grad at x + rho*v</text>'
				+ '<text x="250" y="52" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.55" font-family="sans-serif">corrects overshoot</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">Nesterov: gradient at look-ahead; overshoots corrected</text>'
				+ '</svg>';
		}

		function svgRMSProp() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-rms" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="18" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="13" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<circle cx="35" cy="75" r="3.5" fill="currentColor" opacity="0.75"/>'
				+ '<line x1="35" y1="75" x2="80" y2="80" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-rms)"/>'
				+ '<line x1="83" y1="81" x2="120" y2="83" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-rms)"/>'
				+ '<line x1="123" y1="83.5" x2="150" y2="84.5" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-rms)"/>'
				+ '<line x1="153" y1="84.8" x2="158" y2="85" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-rms)"/>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<rect x="196" y="28" width="118" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>'
				+ '<text x="255" y="41" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.7" font-family="sans-serif">E[g^2]: exp. moving avg</text>'
				+ '<text x="255" y="52" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.55" font-family="sans-serif">normalises step size</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">RMSProp: normalises by moving avg of squared grads</text>'
				+ '</svg>';
		}

		function svgAdamW() {
			return '<svg viewBox="-20 0 360 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;">'
				+ '<defs><marker id="fom-adw" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.8"/></marker>'
				+ '<marker id="fom-wd" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="currentColor" opacity="0.4"/></marker></defs>'
				+ '<ellipse cx="160" cy="85" rx="148" ry="62" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>'
				+ '<ellipse cx="160" cy="85" rx="115" ry="48" fill="none" stroke="currentColor" stroke-width="1" opacity="0.18"/>'
				+ '<ellipse cx="160" cy="85" rx="80" ry="34" fill="none" stroke="currentColor" stroke-width="1" opacity="0.27"/>'
				+ '<ellipse cx="160" cy="85" rx="48" ry="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>'
				+ '<ellipse cx="160" cy="85" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.58"/>'
				+ '<circle cx="35" cy="35" r="3.5" fill="currentColor" opacity="0.8"/>'
				+ '<line x1="35" y1="35" x2="83" y2="65" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-adw)"/>'
				+ '<line x1="83" y1="65" x2="77" y2="67" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" opacity="0.4" marker-end="url(#fom-wd)"/>'
				+ '<line x1="86" y1="67" x2="122" y2="78" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-adw)"/>'
				+ '<line x1="122" y1="78" x2="117" y2="79" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" opacity="0.4" marker-end="url(#fom-wd)"/>'
				+ '<line x1="125" y1="79" x2="150" y2="83" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-adw)"/>'
				+ '<line x1="153" y1="83.5" x2="159" y2="85" stroke="currentColor" stroke-width="2" opacity="0.72" marker-end="url(#fom-adw)"/>'
				+ '<circle cx="160" cy="85" r="5" fill="currentColor" opacity="0.9"/>'
				+ '<text x="168" y="82" font-size="9" fill="currentColor" opacity="0.65" font-family="sans-serif">x*</text>'
				+ '<rect x="196" y="28" width="110" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>'
				+ '<text x="251" y="41" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.7" font-family="sans-serif">Adam update</text>'
				+ '<text x="251" y="52" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.55" font-family="sans-serif">+ weight decay toward 0</text>'
				+ '<text x="160" y="174" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">AdamW: Adam + decoupled weight decay toward zero</text>'
				+ '</svg>';
		}

		function renderIllustration() {
			var body = document.getElementById('illus-body');
			if (currentModel === 'adam')     { body.innerHTML = svgAdam(); }
			else if (currentModel === 'adamax')   { body.innerHTML = svgAdaMax(); }
			else if (currentModel === 'adagrad')  { body.innerHTML = svgAdaGrad(); }
			else if (currentModel === 'momentum') { body.innerHTML = svgMomentum(); }
			else if (currentModel === 'nesterov') { body.innerHTML = svgNesterov(); }
			else if (currentModel === 'rmsprop')  { body.innerHTML = svgRMSProp(); }
			else if (currentModel === 'adamw')    { body.innerHTML = svgAdamW(); }
			else { body.innerHTML = svgSGD(); }
		}

		var MODELS = ['sgd', 'adam', 'adamax', 'adagrad', 'momentum', 'nesterov', 'rmsprop', 'adamw'];

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#mode-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			var lrEl = document.getElementById('sg-lr');
			if (lrEl && !lrEl.value.trim()) { lrEl.placeholder = getDefaultLr(); }
			if (!document.getElementById('illus-section').classList.contains('collapsed')) {
				renderIllustration();
			}
			updateCodePreview();
		}

		document.getElementById('mode-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		['sg-f', 'sg-x0', 'sg-lr', 'sg-iters'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
		});

		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
		});

		document.getElementById('illus-toggle').addEventListener('click', function() {
			var sec = document.getElementById('illus-section');
			sec.classList.toggle('collapsed');
			localStorage.setItem('fom-illus-collapsed', sec.classList.contains('collapsed') ? 'true' : 'false');
			if (!sec.classList.contains('collapsed')) { renderIllustration(); }
		});

		function updateCodePreview() {
			var f     = val('sg-f', 'x[1]^2 + x[2]^2');
			var x0    = val('sg-x0', '[1.0, 1.0]');
			var lr    = val('sg-lr', getDefaultLr());
			var iters = val('sg-iters', '100');
			var algo  = getAlgoName();
			var desc  = getAlgoDesc();
			var code  = '';

			if (!isOptimizationModel()) {
				code += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote'));
				code += blank();
				code += line(fn('f') + '(x) = ' + f);
				code += blank();
				code += cline('x0        = ' + x0, 'initial params');
				code += cline('lr        = ' + lr, 'learning rate');
				code += cline('opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(lr), x0)', desc);
				code += line('x         = copy(x0)');
				code += blank();
				code += cline(kw('for') + ' i ' + kw('in') + ' 1:' + iters, 'training loop');
				code += line('    g = ' + fn('gradient') + '(f, x)[1]');
				code += line('    opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
				code += line(kw('end'));
				code += blank();
				code += cline(fn('println') + '("Minimizer: ", x)', 'optimal params');
				code += cline(fn('println') + '("Minimum:   ", f(x))', 'optimal f(x)');
			} else {
				var extra = getAlgoExtra();
				code += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers'));
				code += blank();
				code += cline(fn('_f') + '(x) = ' + f, 'objective');
				code += cline(fn('f') + '(u, p) = ' + fn('_f') + '(u)', 'Optimization.jl signature');
				code += blank();
				code += cline('x0   = ' + x0, 'initial params');
				code += cline('prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, x0, [])', 'define problem');
				code += cline('sol  = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(' + lr + extra + '), maxiters = ' + iters + ')', desc);
				code += blank();
				code += cline(fn('println') + '("Minimizer: ", sol.u)', 'optimal params');
				code += cline(fn('println') + '("Minimum:   ", sol.objective)', 'optimal f(x)');
			}

			document.getElementById('code-preview').innerHTML = code;
		}

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

		var pickerJustClosed = false;
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

		function renderWikiPanel() {
			if (!wikiSections.length) { return; }
			var html = '<div class="panel-header"><span class="right-panel-title">Local Wikis</span><button class="panel-close" id="btn-panel-close">&#xd7;</button></div><div class="nb-panel-scroll">';
			wikiSections.forEach(function(section) {
				if (section.label) { html += '<div class="nb-section-title">' + esc(section.label) + '</div>'; }
				html += '<div class="right-action-grid">';
				section.wikis.forEach(function(w) {
					html += '<button class="nb-card" data-wiki="' + esc(w.file) + '"><span class="nb-label">' + esc(w.name) + '</span></button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-wiki]').forEach(function(card) {
				card.addEventListener('click', function() { vscode.postMessage({ command: 'openWiki', target: card.dataset.wiki }); });
			});
		}

		function renderNotebookSections() {
			if (!notebookSections.length) { return; }
			var html = '<div class="panel-header"><span class="right-panel-title">Notebook Tutorials</span><button class="panel-close" id="btn-panel-close">&#xd7;</button></div><div class="nb-panel-scroll">';
			notebookSections.forEach(function(section) {
				if (section.label) { html += '<div class="nb-section-title">' + esc(section.label) + '</div>'; }
				html += '<div class="right-action-grid">';
				section.notebooks.forEach(function(nb) {
					html += '<button class="nb-card" data-notebook="' + esc(nb.file) + '"><span class="nb-label">' + esc(nb.name) + '</span>' + (nb.description ? '<span class="nb-desc">' + esc(nb.description) + '</span>' : '') + '</button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-notebook]').forEach(function(card) {
				card.addEventListener('click', function() { vscode.postMessage({ command: 'openNotebook', target: card.dataset.notebook }); });
			});
		}

		var VISUALISE_ACTIONS = [
			{
				id: 'loss-curve',
				label: 'Loss Curve',
				desc: 'Plot objective value vs. iteration',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var lr = val('sg-lr', getDefaultLr());
					var iters = val('sg-iters', '100');
					var algo = getAlgoName();
					var c = '';
					if (!isOptimizationModel()) {
						c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote') + ', ' + ty('Plots'));
						c += blank();
						c += line(fn('f') + '(x) = ' + f);
						c += blank();
						c += line('x0        = ' + x0);
						c += line('opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(' + lr + '), x0)');
						c += line('x         = copy(x0)');
						c += line('losses    = Float64[]');
						c += blank();
						c += line(kw('for') + ' i ' + kw('in') + ' 1:' + iters);
						c += line('    g = ' + fn('gradient') + '(f, x)[1]');
						c += line('    opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
						c += line('    ' + fn('push!') + '(losses, f(x))');
						c += line(kw('end'));
					} else {
						var extra = getAlgoExtra();
						c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers') + ', ' + ty('Plots'));
						c += blank();
						c += line(fn('_f') + '(x) = ' + f);
						c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
						c += blank();
						c += line('losses = Float64[]');
						c += cline(fn('cb') + '(state, loss) = (' + fn('push!') + '(losses, loss); false)', 'collect loss at each step');
						c += blank();
						c += line('prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
						c += line('sol  = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(' + lr + extra + '), maxiters = ' + iters + ', callback = cb)');
					}
					c += blank();
					c += cline(fn('plot') + '(losses, xlabel = "Iteration", ylabel = "f(x)", title = "' + algo + ' Loss", lw = 2)', 'loss vs. iteration');
					return c;
				},
			},
			{
				id: 'param-trajectory',
				label: 'Param Trajectory',
				desc: 'Parameter path on contour plot (2D only)',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var lr = val('sg-lr', getDefaultLr());
					var iters = val('sg-iters', '100');
					var algo = getAlgoName();
					var c = '';
					if (!isOptimizationModel()) {
						c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote') + ', ' + ty('Plots'));
						c += blank();
						c += line(fn('f') + '(x) = ' + f);
						c += blank();
						c += line('x0        = ' + x0);
						c += line('opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(' + lr + '), x0)');
						c += line('x         = copy(x0)');
						c += line('path      = [copy(x)]');
						c += blank();
						c += line(kw('for') + ' i ' + kw('in') + ' 1:' + iters);
						c += line('    g = ' + fn('gradient') + '(f, x)[1]');
						c += line('    opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
						c += line('    ' + fn('push!') + '(path, copy(x))');
						c += line(kw('end'));
					} else {
						var extra = getAlgoExtra();
						c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers') + ', ' + ty('Plots'));
						c += blank();
						c += line(fn('_f') + '(x) = ' + f);
						c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
						c += blank();
						c += line('path = [[' + x0.replace('[','').replace(']','') + ']]');
						c += cline(fn('cb') + '(state, loss) = (' + fn('push!') + '(path, copy(state.u)); false)', 'collect iterates');
						c += blank();
						c += line('prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
						c += line('sol  = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(' + lr + extra + '), maxiters = ' + iters + ', callback = cb)');
					}
					c += blank();
					c += line('xs = range(-1.5, 1.5, 80); ys = range(-1.5, 1.5, 80)');
					c += cline(fn('contour') + '(xs, ys, (a, b) -> f([a, b]), fill = true, alpha = 0.4)', 'contour background');
					c += cline(fn('plot!') + '([p[1] for p in path], [p[2] for p in path], lw = 2, marker = :dot, label = "' + algo + '")', 'parameter trajectory');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'lr-sensitivity',
				label: 'LR Sensitivity',
				desc: 'Compare final loss for multiple learning rates',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var iters = val('sg-iters', '100');
					var algo = getAlgoName();
					var c = '';
					if (!isOptimizationModel()) {
						c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote') + ', ' + ty('Printf'));
						c += blank();
						c += line(fn('f') + '(x) = ' + f);
						c += blank();
						c += line(kw('for') + ' lr ' + kw('in') + ' [1e-3, 1e-2, 5e-2, 0.1]');
						c += line('    x0        = copy(' + x0 + ')');
						c += line('    opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(lr), x0)');
						c += line('    x         = copy(x0)');
						c += line('    ' + kw('for') + ' i ' + kw('in') + ' 1:' + iters);
						c += line('        g = ' + fn('gradient') + '(f, x)[1]');
						c += line('        opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
						c += line('    ' + kw('end'));
						c += cline('    ' + fn('@printf') + '("lr=%-8g  f(x)=%12.8f\\n", lr, f(x))', 'print result');
						c += line(kw('end'));
					} else {
						var extra = getAlgoExtra();
						c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers') + ', ' + ty('Printf'));
						c += blank();
						c += line(fn('_f') + '(x) = ' + f);
						c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
						c += blank();
						c += line(kw('for') + ' lr ' + kw('in') + ' [1e-3, 1e-2, 5e-2, 0.1]');
						c += line('    prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
						c += line('    sol  = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(lr' + extra + '), maxiters = ' + iters + ')');
						c += cline('    ' + fn('@printf') + '("lr=%-8g  f=%12.8f\\n", lr, sol.objective)', 'print result');
						c += line(kw('end'));
					}
					return c;
				},
			},
			{
				id: 'convergence-check',
				label: 'Convergence Check',
				desc: 'Final value, gradient norm, and iteration count',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var lr = val('sg-lr', getDefaultLr());
					var iters = val('sg-iters', '100');
					var algo = getAlgoName();
					var c = '';
					if (!isOptimizationModel()) {
						c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote') + ', ' + ty('LinearAlgebra'));
						c += blank();
						c += line(fn('f') + '(x) = ' + f);
						c += blank();
						c += line('x0        = ' + x0);
						c += line('opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(' + lr + '), x0)');
						c += line('x         = copy(x0)');
						c += blank();
						c += line(kw('for') + ' i ' + kw('in') + ' 1:' + iters);
						c += line('    g = ' + fn('gradient') + '(f, x)[1]');
						c += line('    opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
						c += line(kw('end'));
						c += blank();
						c += line('g_final = ' + fn('gradient') + '(f, x)[1]');
						c += cline(fn('println') + '("Minimizer:  ", x)', 'final params');
						c += cline(fn('println') + '("f(x):       ", f(x))', 'final loss');
						c += cline(fn('println') + '("grad norm:  ", ' + fn('norm') + '(g_final))', 'near zero if converged');
					} else {
						var extra = getAlgoExtra();
						c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers'));
						c += blank();
						c += line(fn('_f') + '(x) = ' + f);
						c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
						c += blank();
						c += line('prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
						c += line('sol  = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(' + lr + extra + '), maxiters = ' + iters + ')');
						c += blank();
						c += cline(fn('println') + '("Minimizer:  ", sol.u)', 'final params');
						c += cline(fn('println') + '("f(x):       ", sol.objective)', 'final loss');
						c += cline(fn('println') + '("Return code: ", sol.retcode)', 'convergence status');
					}
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'evaluate-new',
				label: 'Evaluate at New Point',
				desc: 'Compute f at a perturbed point after training',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var lr = val('sg-lr', getDefaultLr());
					var iters = val('sg-iters', '100');
					var algo = getAlgoName();
					var c = '';
					if (!isOptimizationModel()) {
						c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote'));
						c += blank();
						c += line(fn('f') + '(x) = ' + f);
						c += blank();
						c += line('x0        = ' + x0);
						c += line('opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(' + lr + '), x0)');
						c += line('x         = copy(x0)');
						c += blank();
						c += line(kw('for') + ' i ' + kw('in') + ' 1:' + iters);
						c += line('    g = ' + fn('gradient') + '(f, x)[1]');
						c += line('    opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
						c += line(kw('end'));
						c += blank();
						c += cline('x_opt = copy(x)', 'trained params');
					} else {
						var extra = getAlgoExtra();
						c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers'));
						c += blank();
						c += line(fn('_f') + '(x) = ' + f);
						c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
						c += blank();
						c += line('prob  = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
						c += line('sol   = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(' + lr + extra + '), maxiters = ' + iters + ')');
						c += cline('x_opt = sol.u', 'trained params');
					}
					c += blank();
					c += cline('x_new = x_opt .+ 0.1', 'perturbed point');
					c += blank();
					c += cline(fn('println') + '("f(x_opt) = ", _f(x_opt))', 'trained value');
					c += cline(fn('println') + '("f(x_new) = ", _f(x_new))', 'value at nearby point');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'compare-optimisers-methods',
				label: 'Compare Optimisers.jl',
				desc: 'SGD vs Adam vs AdaMax vs AdaGrad; final loss',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var iters = val('sg-iters', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote') + ', ' + ty('Printf'));
					c += blank();
					c += line(fn('f') + '(x) = ' + f);
					c += blank();
					c += cline(kw('for') + ' (name, opt) ' + kw('in') + ' [("SGD", ' + fn('Descent') + '(0.01)), ("Adam", ' + fn('Adam') + '(0.001)), ("AdaMax", ' + fn('AdaMax') + '(0.002)), ("AdaGrad", ' + fn('AdaGrad') + '(0.01))]', 'sweep optimisers');
					c += line('    x0        = copy(' + x0 + ')');
					c += line('    opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(opt, x0)');
					c += line('    x         = copy(x0)');
					c += line('    ' + kw('for') + ' i ' + kw('in') + ' 1:' + iters);
					c += line('        g = ' + fn('gradient') + '(f, x)[1]');
					c += line('        opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
					c += line('    ' + kw('end'));
					c += cline('    ' + fn('@printf') + '("%-10s  f=%12.8f\\n", name, f(x))', 'print row');
					c += line(kw('end'));
					return c;
				},
			},
			{
				id: 'compare-optimization-methods',
				label: 'Compare Optimization.jl',
				desc: 'Momentum vs Nesterov vs RMSProp vs AdamW; final loss',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var iters = val('sg-iters', '100');
					var c = '';
					c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers') + ', ' + ty('Printf'));
					c += blank();
					c += line(fn('_f') + '(x) = ' + f);
					c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
					c += blank();
					c += cline(kw('for') + ' (name, opt) ' + kw('in') + ' [("Momentum", ' + ty('Optimisers') + '.' + fn('Momentum') + '(0.01, 0.9)), ("Nesterov", ' + ty('Optimisers') + '.' + fn('Nesterov') + '(0.01, 0.9)), ("RMSProp", ' + ty('Optimisers') + '.' + fn('RMSProp') + '(0.001)), ("AdamW", ' + ty('Optimisers') + '.' + fn('AdamW') + '(0.001))]', 'sweep optimisers');
					c += line('    prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
					c += line('    sol  = ' + fn('solve') + '(prob, opt, maxiters = ' + iters + ')');
					c += cline('    ' + fn('@printf') + '("%-10s  f=%12.8f\\n", name, sol.objective)', 'print row');
					c += line(kw('end'));
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'solution-summary',
				label: 'Solution Summary',
				desc: 'Final params, loss, and gradient norm',
				code: function() {
					var f = val('sg-f', 'x[1]^2 + x[2]^2');
					var x0 = val('sg-x0', '[1.0, 1.0]');
					var lr = val('sg-lr', getDefaultLr());
					var iters = val('sg-iters', '100');
					var algo = getAlgoName();
					var c = '';
					if (!isOptimizationModel()) {
						c += line(kw('using') + ' ' + ty('Optimisers') + ', ' + ty('Zygote') + ', ' + ty('LinearAlgebra'));
						c += blank();
						c += line(fn('f') + '(x) = ' + f);
						c += blank();
						c += line('x0        = ' + x0);
						c += line('opt_state = ' + ty('Optimisers') + '.' + fn('setup') + '(' + fn(algo) + '(' + lr + '), x0)');
						c += line('x         = copy(x0)');
						c += blank();
						c += line(kw('for') + ' i ' + kw('in') + ' 1:' + iters);
						c += line('    g = ' + fn('gradient') + '(f, x)[1]');
						c += line('    opt_state, x = ' + ty('Optimisers') + '.' + fn('update') + '(opt_state, x, g)');
						c += line(kw('end'));
						c += blank();
						c += line('g_final = ' + fn('gradient') + '(f, x)[1]');
						c += cline(fn('println') + '("Optimizer:  " * "' + algo + ' (lr = " * string(' + lr + ') * ")")', 'method and rate');
						c += cline(fn('println') + '("Iterations: ' + iters + '")', 'total steps');
						c += cline(fn('println') + '("Minimizer:  ", x)', 'final params');
						c += cline(fn('println') + '("Minimum:    ", f(x))', 'final loss');
						c += cline(fn('println') + '("Grad norm:  ", ' + fn('norm') + '(g_final))', 'gradient residual');
					} else {
						var extra = getAlgoExtra();
						c += line(kw('using') + ' ' + ty('Optimization') + ', ' + ty('OptimizationOptimisers'));
						c += blank();
						c += line(fn('_f') + '(x) = ' + f);
						c += line(fn('f') + '(u, p) = ' + fn('_f') + '(u)');
						c += blank();
						c += line('prob = ' + ty('Optimization') + '.' + fn('OptimizationProblem') + '(f, ' + x0 + ', [])');
						c += line('sol  = ' + fn('solve') + '(prob, ' + ty('Optimisers') + '.' + fn(algo) + '(' + lr + extra + '), maxiters = ' + iters + ')');
						c += blank();
						c += cline(fn('println') + '("Optimizer:  ' + algo + '")', 'method');
						c += cline(fn('println') + '("Minimizer:  ", sol.u)', 'final params');
						c += cline(fn('println') + '("Minimum:    ", sol.objective)', 'final loss');
						c += cline(fn('println') + '("Return code: ", sol.retcode)', 'convergence status');
					}
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
			renderNotebookSections();
			rightPanel.style.display = 'block';
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
			if (msg.command === 'wikiSections') { wikiSections = msg.sections || []; }
			if (msg.command === 'notebookSections') { notebookSections = msg.sections || []; }
		});

		setModel('sgd');
		if (localStorage.getItem('fom-illus-collapsed') !== 'true') {
			renderIllustration();
		} else {
			document.getElementById('illus-section').classList.add('collapsed');
		}
	</script>
</body>
</html>`;
}
