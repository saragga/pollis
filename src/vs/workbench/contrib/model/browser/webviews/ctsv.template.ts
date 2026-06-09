/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getCtsvHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Continuous-Time Stochastic Volatility</title>
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
		.toggle-btn { background: transparent; border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 20px; height: 35px; line-height: 35px; transition: background 0.15s; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-hoverBackground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-row .form-group.narrow { min-width: 80px; }
		.form-row .form-group.wide { min-width: 160px; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon:hover { opacity: 0.8; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 320px; z-index: 1000; display: none; margin-bottom: 5px; }
		.form-label:not(.centered) .tooltip-text { left: 0; transform: none; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		#kappa, #theta, #xi, #rho, #v0, #T, #mu, #lambda, #muJ, #sigmaJ, #alpha, #beta, #rho-sabr, #T-sabr { text-align: center; }
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; }
		.code-blank { margin: 8px 0; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-symbolIcon-keywordForeground); }
		.hl-fn      { color: var(--vscode-textPreformat-foreground); }
		.hl-type    { color: var(--vscode-symbolIcon-classForeground); }
		.copy-btn { position: absolute; top: 8px; right: 8px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; }
		.copy-btn:hover { opacity: 1; }
		.no-impl-notice { display: none; align-items: flex-start; gap: 12px; padding: 14px 18px; background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; margin: 20px 0; color: var(--vscode-descriptionForeground); font-size: 13px; line-height: 1.6; }
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
		.eq-section { margin: 0 0 20px 0; }
		.eq-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.eq-toggle:hover { text-decoration: underline; }
		.eq-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.eq-section.collapsed .eq-chevron { transform: rotate(-90deg); }
		.eq-section.collapsed .eq-block { display: none; }
		.eq-block { font-size: 14px; padding: 14px 20px; background: var(--vscode-textCodeBlock-background); border-radius: 6px; border: 1px solid var(--vscode-widget-border); font-family: 'Georgia', 'Times New Roman', serif; line-height: 2; }
		.eq-row { display: flex; align-items: baseline; gap: 8px; }
		.eq-lhs { min-width: 120px; text-align: right; white-space: nowrap; }
		.eq-op  { min-width: 18px; text-align: center; white-space: nowrap; }
		.eq-body { flex: 1; white-space: nowrap; }
		.eq-comment { flex-shrink: 0; padding-left: 24px; color: #6A9955; font-style: italic; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; white-space: nowrap; }
		.hb-row    { display: flex; }
		.heston-row { display: flex; }
		.bates-row  { display: none; }
		.sabr-row   { display: none; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Continuous-Time Stochastic Volatility</h1>
			<div class="powered-by" id="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Heston &#8212; stochastic variance with mean-reverting CIR dynamics</li>
					<li>Bates &#8212; Heston extended with compound Poisson&#8211;log-normal jump diffusion</li>
					<li>SABR &#8212; CEV-type forward with log-normal volatility (reference only &#8212; no Julia package)</li>
				</ul>
			</div>
		</div>

		<div class="model-toggle">
			<button class="toggle-btn active" id="toggle-heston">Heston</button>
			<button class="toggle-btn" id="toggle-bates">Bates</button>
			<button class="toggle-btn" id="toggle-sabr">SABR</button>
		</div>

		<div class="eq-section" id="eq-section">
			<button class="eq-toggle" id="eq-toggle"><span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Model equations</button>
			<div class="eq-block" id="eq-block"></div>
		</div>

		<!-- Heston / Bates shared params -->
		<div class="form-row hb-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#954; (kappa)
					<span class="tooltip-icon" id="tooltip-kappa">?</span>
					<span class="tooltip-text" id="tooltip-text-kappa"></span>
				</label>
				<textarea id="kappa" class="form-input" placeholder="2" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#952; (theta)
					<span class="tooltip-icon" id="tooltip-theta">?</span>
					<span class="tooltip-text" id="tooltip-text-theta"></span>
				</label>
				<textarea id="theta" class="form-input" placeholder="0.04" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#958; (xi)
					<span class="tooltip-icon" id="tooltip-xi">?</span>
					<span class="tooltip-text" id="tooltip-text-xi"></span>
				</label>
				<textarea id="xi" class="form-input" placeholder="0.5" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#961; (rho)
					<span class="tooltip-icon" id="tooltip-rho">?</span>
					<span class="tooltip-text" id="tooltip-text-rho"></span>
				</label>
				<textarea id="rho" class="form-input" placeholder="-0.7" rows="1"></textarea>
			</div>
		</div>

		<div class="form-row hb-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					S&#8320; (price)
					<span class="tooltip-icon" id="tooltip-S0">?</span>
					<span class="tooltip-text" id="tooltip-text-S0"></span>
				</label>
				<textarea id="S0" class="form-input" placeholder="100" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					v&#8320; (variance)
					<span class="tooltip-icon" id="tooltip-v0">?</span>
					<span class="tooltip-text" id="tooltip-text-v0"></span>
				</label>
				<textarea id="v0" class="form-input" placeholder="0.04" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					T (horizon)
					<span class="tooltip-icon" id="tooltip-T">?</span>
					<span class="tooltip-text" id="tooltip-text-T"></span>
				</label>
				<textarea id="T" class="form-input" placeholder="1" rows="1"></textarea>
			</div>
		</div>

		<!-- Heston only: drift -->
		<div class="form-row heston-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#956; (drift)
					<span class="tooltip-icon" id="tooltip-mu">?</span>
					<span class="tooltip-text" id="tooltip-text-mu"></span>
				</label>
				<textarea id="mu" class="form-input" placeholder="0.05" rows="1"></textarea>
			</div>
		</div>

		<!-- Bates only: jump parameters -->
		<div class="form-row bates-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#955; (intensity)
					<span class="tooltip-icon" id="tooltip-lambda">?</span>
					<span class="tooltip-text" id="tooltip-text-lambda"></span>
				</label>
				<textarea id="lambda" class="form-input" placeholder="0.5" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#956;<sub>J</sub> (mean jump)
					<span class="tooltip-icon" id="tooltip-muJ">?</span>
					<span class="tooltip-text" id="tooltip-text-muJ"></span>
				</label>
				<textarea id="muJ" class="form-input" placeholder="-0.1" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#948;<sub>J</sub> (jump vol)
					<span class="tooltip-icon" id="tooltip-sigmaJ">?</span>
					<span class="tooltip-text" id="tooltip-text-sigmaJ"></span>
				</label>
				<textarea id="sigmaJ" class="form-input" placeholder="0.2" rows="1"></textarea>
			</div>
		</div>

		<!-- SABR only: row 1 -->
		<div class="form-row sabr-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#945; (alpha)
					<span class="tooltip-icon" id="tooltip-alpha">?</span>
					<span class="tooltip-text" id="tooltip-text-alpha"></span>
				</label>
				<textarea id="alpha" class="form-input" placeholder="0.4" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					&#946; (beta)
					<span class="tooltip-icon" id="tooltip-beta">?</span>
					<span class="tooltip-text" id="tooltip-text-beta"></span>
				</label>
				<textarea id="beta" class="form-input" placeholder="0.5" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered">&#961; (rho)</label>
				<textarea id="rho-sabr" class="form-input" placeholder="-0.3" rows="1"></textarea>
			</div>
		</div>

		<!-- SABR only: row 2 -->
		<div class="form-row sabr-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">
					F&#8320; (forward)
					<span class="tooltip-icon" id="tooltip-F0">?</span>
					<span class="tooltip-text" id="tooltip-text-F0"></span>
				</label>
				<textarea id="F0" class="form-input" placeholder="100" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered">T (expiry)</label>
				<textarea id="T-sabr" class="form-input" placeholder="1" rows="1"></textarea>
			</div>
		</div>

		<!-- Code preview (Heston / Bates) -->
		<div class="code-preview-wrapper" id="code-preview-wrapper">
			<div class="code-preview" id="code-preview"></div>
			<button class="copy-btn" id="btn-copy">Copy</button>
		</div>

		<!-- SABR notice -->
		<div class="no-impl-notice" id="sabr-notice">
			<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style="flex-shrink:0;margin-top:2px;"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM7.5 5.5H8.5V9H7.5V5.5ZM7.5 10H8.5V11H7.5V10Z"/></svg>
			<span>No Julia package is currently available for the SABR model. The dynamics above are provided for reference. SABR implied-volatility approximations are available in Python (<code style="font-family:monospace;">py-vollib</code>) and C++ (QuantLib).</span>
		</div>

		<div class="columns-grid">
			<div>
				<div class="column-inner">
					<div class="column-title">Next Steps</div>
					<ul class="column-list">
						<li><button class="list-btn" id="btn-viz"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 15H14.5C14.776 15 15 14.776 15 14.5C15 14.224 14.776 14 14.5 14H2V9.70799L5.00001 6.70798L6.64601 8.35398C6.84101 8.54898 7.15801 8.54898 7.35301 8.35398L11.499 4.20798L13.145 5.85398C13.34 6.04898 13.657 6.04898 13.852 5.85398C14.047 5.65898 14.047 5.34198 13.852 5.14698L11.852 3.14698C11.657 2.95198 11.34 2.95198 11.145 3.14698L6.99901 7.29298L5.35301 5.64698C5.15801 5.45198 4.84101 5.45198 4.64601 5.64698L2 8.29299V1.5C2 1.224 1.776 1 1.5 1C1.224 1 1 1.224 1 1.5V9.4848C0.999674 9.49525 0.999674 9.50571 1 9.51617V14.5C1 14.776 1.224 15 1.5 15Z"/></svg>Visualise</button></li>
						<li><button class="list-btn" id="btn-diagnostics"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
						<li><button class="list-btn" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>Predict</button></li>
						<li><button class="list-btn" id="btn-compare"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>Compare</button></li>
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

		const kappaInput  = document.getElementById('kappa');
		const thetaInput  = document.getElementById('theta');
		const xiInput     = document.getElementById('xi');
		const rhoInput    = document.getElementById('rho');
		const S0Input     = document.getElementById('S0');
		const v0Input     = document.getElementById('v0');
		const TInput      = document.getElementById('T');
		const muInput     = document.getElementById('mu');
		const lambdaInput = document.getElementById('lambda');
		const muJInput    = document.getElementById('muJ');
		const sigmaJInput = document.getElementById('sigmaJ');
		const codePreview = document.getElementById('code-preview');

		let modelType  = 'heston';
		let allPackages = [];

		function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)  { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)  { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)  { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s) { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, comment) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(comment) + '</span></div>'; }
		function blank() { return '<div class="code-blank"></div>'; }

		function updateCodePreview() {
			if (modelType === 'sabr') { return; }

			const kappa  = esc(kappaInput.value.trim()  || '2');
			const theta  = esc(thetaInput.value.trim()  || '0.04');
			const xi     = esc(xiInput.value.trim()     || '0.5');
			const rho    = esc(rhoInput.value.trim()    || '-0.7');
			const S0     = esc(S0Input.value.trim()     || '100');
			const v0     = esc(v0Input.value.trim()     || '0.04');
			const T      = esc(TInput.value.trim()      || '1');

			let code = '';

			if (modelType === 'heston') {
				const mu = esc(muInput.value.trim() || '0.05');
				code += line(kw('using') + ' ' + ty('DiffEqFinancial') + ', ' + ty('DifferentialEquations'));
				code += blank();
				code += cline('u0   = [' + S0 + ', ' + v0 + ']', 'initial [price, variance]');
				code += cline('prob = ' + fn('HestonProblem') + '(' + mu + ', ' + kappa + ', ' + theta + ', ' + xi + ', ' + rho + ', u0, (0.0, ' + T + '))', 'Heston SDE problem');
				code += cline('sol  = ' + fn('solve') + '(prob, ' + ty('SRIW1') + '())', 'simulate path');
			} else if (modelType === 'bates') {
				const lambda = esc(lambdaInput.value.trim() || '0.5');
				const muJ    = esc(muJInput.value.trim()    || '-0.1');
				const sigmaJ = esc(sigmaJInput.value.trim() || '0.2');
				code += line(kw('using') + ' ' + ty('QuantLib'));
				code += blank();
				code += cline('spot = ' + fn('QuoteHandle') + '(' + fn('SimpleQuote') + '(' + S0 + '))', 'spot price handle');
				code += cline('rf   = ' + fn('YieldTermStructureHandle') + '(' + fn('FlatForward') + '(today, 0.0, ' + fn('Actual365Fixed') + '()))', 'flat risk-free rate');
				code += cline('proc = ' + fn('BatesProcess') + '(rf, rf, spot, ' + v0 + ', ' + kappa + ', ' + theta + ', ' + xi + ', ' + rho + ', ' + lambda + ', ' + muJ + ', ' + sigmaJ + ')', 'Bates SDE process');
			}

			codePreview.innerHTML = code;
		}

		function eqRow(lhs, op, body, comment) {
			return '<div class="eq-row">'
				+ '<span class="eq-lhs">' + lhs + '</span>'
				+ '<span class="eq-op">' + op + '</span>'
				+ '<span class="eq-body">' + body + '</span>'
				+ (comment ? '<span class="eq-comment"># ' + comment + '</span>' : '')
				+ '</div>';
		}

		function updateEquations() {
			const el = document.getElementById('eq-block');
			if (!el) { return; }
			let html = '';

			const dW1 = 'd<i>W</i><sup>1</sup><sub><i>t</i></sub>';
			const dW2 = 'd<i>W</i><sup>2</sup><sub><i>t</i></sub>';
			const St  = '<i>S</i><sub><i>t</i></sub>';
			const vt  = '<i>v</i><sub><i>t</i></sub>';
			const dSt = 'd' + St;
			const dvt = 'd' + vt;
			const sqvt = '&#8730;' + vt + ' ';

			if (modelType === 'heston') {
				html += eqRow(dSt, '=', '&#956; ' + St + ' d<i>t</i> + ' + sqvt + St + ' ' + dW1, 'asset price');
				html += eqRow(dvt, '=', '&#954;(&#952; &#8722; ' + vt + ') d<i>t</i> + &#958; ' + sqvt + dW2, 'variance — CIR');
				html += eqRow(dW1 + ' ' + dW2, '=', '&#961; d<i>t</i>', 'Brownian correlation');
			} else if (modelType === 'bates') {
				html += eqRow(dSt, '=', '(&#956; &#8722; &#955;&#956;&#772;<sub><i>J</i></sub>) ' + St + ' d<i>t</i> + ' + sqvt + St + ' ' + dW1 + ' + <i>J</i><sub><i>t</i></sub> d<i>N</i><sub><i>t</i></sub>', 'price with jumps');
				html += eqRow(dvt, '=', '&#954;(&#952; &#8722; ' + vt + ') d<i>t</i> + &#958; ' + sqvt + dW2, 'variance — CIR');
				html += eqRow('<i>J</i><sub><i>t</i></sub>', '~', 'LogNormal(&#956;<sub><i>J</i></sub>, &#948;<sup>2</sup><sub><i>J</i></sub>),&ensp;<i>N</i><sub><i>t</i></sub> ~ Poisson(&#955;)', 'jump process');
			} else {
				const Ft  = '<i>F</i><sub><i>t</i></sub>';
				const dFt = 'd' + Ft;
				const st  = '&#963;<sub><i>t</i></sub>';
				const dst = 'd' + st;
				html += eqRow(dFt, '=', st + ' ' + Ft + '<sup>&#946;</sup> ' + dW1, 'forward price, &#946; &#8712; [0, 1]');
				html += eqRow(dst, '=', '&#945; ' + st + ' ' + dW2, 'stochastic volatility');
				html += eqRow(dW1 + ' ' + dW2, '=', '&#961; d<i>t</i>', 'Brownian correlation');
			}

			el.innerHTML = html;
		}

		function updatePackageLinks() {
			const container  = document.getElementById('package-links');
			const poweredBy  = document.getElementById('powered-by');
			if (modelType === 'sabr') {
				poweredBy.style.display = 'none';
				return;
			}
			poweredBy.style.display = '';
			const packages = modelType === 'heston'
				? allPackages.filter(function(p) { return p.name === 'DiffEqFinancial.jl'; })
				: modelType === 'bates'
					? allPackages.filter(function(p) { return p.name === 'QuantLib.jl'; })
					: allPackages;
			container.innerHTML = '';
			packages.forEach(function(pkg, i) {
				const a = document.createElement('a');
				a.className = 'package-link';
				a.textContent = pkg.name;
				a.title = pkg.url;
				a.addEventListener('click', function(e) { e.preventDefault(); vscode.postMessage({ command: 'openUrl', url: pkg.url }); });
				container.appendChild(a);
				if (i < packages.length - 1) { container.appendChild(document.createTextNode(', ')); }
			});
		}

		function setModel(type) {
			modelType = type;
			document.getElementById('toggle-heston').classList.toggle('active', type === 'heston');
			document.getElementById('toggle-bates').classList.toggle('active',  type === 'bates');
			document.getElementById('toggle-sabr').classList.toggle('active',   type === 'sabr');

			document.querySelectorAll('.hb-row').forEach(function(el)     { el.style.display = (type === 'heston' || type === 'bates') ? 'flex' : 'none'; });
			document.querySelectorAll('.heston-row').forEach(function(el)  { el.style.display = type === 'heston' ? 'flex' : 'none'; });
			document.querySelectorAll('.bates-row').forEach(function(el)   { el.style.display = type === 'bates'  ? 'flex' : 'none'; });
			document.querySelectorAll('.sabr-row').forEach(function(el)    { el.style.display = type === 'sabr'   ? 'flex' : 'none'; });

			const isSabr = type === 'sabr';
			document.getElementById('code-preview-wrapper').style.display = isSabr ? 'none' : '';
			document.getElementById('sabr-notice').style.display           = isSabr ? 'flex' : 'none';

			updatePackageLinks();
			updateEquations();
			updateCodePreview();
		}

		document.getElementById('toggle-heston').addEventListener('click', function() { setModel('heston'); });
		document.getElementById('toggle-bates').addEventListener('click',  function() { setModel('bates');  });
		document.getElementById('toggle-sabr').addEventListener('click',   function() { setModel('sabr');   });

		[kappaInput, thetaInput, xiInput, rhoInput, S0Input, v0Input, TInput, muInput, lambdaInput, muJInput, sigmaJInput].forEach(function(el) {
			if (el) { el.addEventListener('input', updateCodePreview); }
		});

		document.getElementById('eq-toggle').addEventListener('click', function() {
			document.getElementById('eq-section').classList.toggle('collapsed');
		});

		document.getElementById('btn-copy').addEventListener('click', function() {
			const lines = codePreview.querySelectorAll('.code-line, .code-blank');
			const text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				const btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
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
		window.addEventListener('message', function(event) {
			const msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'tooltips') {
				const tooltipMap = {
					'kappa': 'kappa', 'theta': 'theta', 'xi': 'xi', 'rho': 'rho',
					'mu': 'mu', 'S0': 'S0', 'v0': 'v0', 'T': 'T',
					'lambda': 'lambda', 'muJ': 'muJ', 'sigmaJ': 'sigmaJ',
					'alpha': 'alpha', 'beta': 'beta', 'F0': 'F0'
				};
				Object.keys(tooltipMap).forEach(function(id) {
					const key = tooltipMap[id];
					if (msg.tooltips && msg.tooltips[key]) {
						const el = document.getElementById('tooltip-text-' + id);
						if (el) { el.textContent = msg.tooltips[key]; }
					}
				});
			}
			if (msg.command === 'packageLinks') {
				allPackages = msg.packages || [];
				updatePackageLinks();
			}
			if (msg.command === 'paperLinks') {
				const btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
			if (msg.command === 'setModel') {
				setModel(msg.model);
			}
		});

		document.getElementById('btn-wiki').addEventListener('click',             function() { vscode.postMessage({ command: 'openDocs', target: 'wiki' }); });
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openNotebookList' }); }
		});
		document.getElementById('btn-documentation').addEventListener('click',     function() { vscode.postMessage({ command: 'openDocs', target: 'documentation' }); });
		document.getElementById('btn-paper').addEventListener('click',            function() { vscode.postMessage({ command: 'openDocs', target: 'paper' }); });
		document.getElementById('btn-viz').addEventListener('click',               function() { vscode.postMessage({ command: 'openPanel', target: 'visualization' }); });
		document.getElementById('btn-diagnostics').addEventListener('click',        function() { vscode.postMessage({ command: 'openPanel', target: 'calibration' }); });
		document.getElementById('btn-compare').addEventListener('click',          function() { vscode.postMessage({ command: 'openPanel', target: 'alternative-methods' }); });

		setModel('heston');
	</script>
</body>
</html>`;
}
