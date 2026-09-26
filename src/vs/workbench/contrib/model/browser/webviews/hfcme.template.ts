/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getHfcmeHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>High-Frequency Covariance Matrix Estimation</title>
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
		.model-toggle { display: flex; width: fit-content; max-width: 100%; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
		.toggle-btn { background: transparent; border: none; border-right: 1px solid var(--vscode-input-border); color: var(--vscode-foreground); font-size: 12px; font-family: var(--vscode-font-family); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
		.toggle-btn:last-child { border-right: none; }
		.toggle-btn:hover { background: var(--vscode-list-hoverBackground); }
		.toggle-btn.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
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
		.pav-row  { display: none; }
		.tsrc-row { display: none; }
		.eq-section { margin: 0 0 20px 0; }
		.eq-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.eq-toggle:hover { text-decoration: underline; }
		.eq-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.eq-section.collapsed .eq-chevron { transform: rotate(-90deg); }
		.eq-section.collapsed .eq-block { display: none; }
		.eq-block { font-size: 14px; padding: 14px 20px; background: var(--vscode-textCodeBlock-background); border-radius: 6px; border: 1px solid var(--vscode-widget-border); font-family: 'Georgia', 'Times New Roman', serif; line-height: 2; }
		.eq-row { display: flex; align-items: baseline; gap: 8px; }
		.eq-lhs { min-width: 220px; text-align: right; white-space: nowrap; }
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
		.panel-back { background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0; }
		.panel-back:hover { color: var(--vscode-textLink-activeForeground); }
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
			<h1>High-Frequency Covariance Matrix Estimation</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Realized Covariance &#8212; synchronises asynchronous tick data by refresh-time sampling, then sums outer products of log-returns; fast and consistent under idealised conditions</li>
					<li>Pre-averaged &#8212; smooths tick log-returns over an H-tick window before forming outer products, reducing the influence of additive microstructure noise</li>
					<li>Two-Scales &#8212; combines a slow-scale (K sub-sampled grids) and a fast-scale (all ticks) realized covariance to cancel the noise bias; generalises Zhang, Mykland &amp; A&#239;t-Sahalia (2005) to the multivariate setting</li>
					<li>Realized Kernel &#8212; applies a Parzen kernel to the autocovariance matrices of tick returns up to lag L, yielding a positive semi-definite estimate robust to both noise and non-synchronicity</li>
				</ul>
			</div>
		</div>

		<!-- Estimator toggle -->
		<div class="model-toggle" id="model-group">
			<button class="toggle-btn" data-model="rc">Realized</button>
			<button class="toggle-btn" data-model="pav">Pre-averaged</button>
			<button class="toggle-btn" data-model="tsrc">Two-Scales</button>
			<button class="toggle-btn" data-model="rk">Realized Kernel</button>
		</div>

		<!-- Collapsible equations -->
		<div class="eq-section collapsed" id="eq-section">
			<button class="eq-toggle" id="eq-toggle"><span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Estimator equations</button>
			<div class="eq-block" id="eq-block"></div>
		</div>

		<!-- Row 1: Data inputs (always visible) -->
		<div class="form-row">
			<div class="form-group" style="flex:2; min-width:160px;">
				<label class="form-label centered form-label-with-tooltip">Tick price data (p)
					<span class="tooltip-icon" id="tip-p">?</span>
					<span class="tooltip-text" id="tip-p-text"></span>
				</label>
				<textarea id="hfcme-p" class="form-input" placeholder="p" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:2; min-width:160px;">
				<label class="form-label centered form-label-with-tooltip">Assets
					<span class="tooltip-icon" id="tip-assets">?</span>
					<span class="tooltip-text" id="tip-assets-text"></span>
				</label>
				<textarea id="hfcme-assets" class="form-input" placeholder="assets" rows="1"></textarea>
			</div>
		</div>

		<!-- Row 2 (pav): Pre-averaging bandwidth -->
		<div class="form-row pav-row">
			<div class="form-group" style="flex:1; min-width:80px;">
				<label class="form-label centered form-label-with-tooltip">Bandwidth (H)
					<span class="tooltip-icon" id="tip-H">?</span>
					<span class="tooltip-text" id="tip-H-text"></span>
				</label>
				<textarea id="hfcme-H" class="form-input param-input" placeholder="5" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:2; min-width:120px; visibility:hidden;"></div>
		</div>

		<!-- Row 3 (tsrc): Sub-sampling grids -->
		<div class="form-row tsrc-row">
			<div class="form-group" style="flex:1; min-width:80px;">
				<label class="form-label centered form-label-with-tooltip">Sub-grids (K)
					<span class="tooltip-icon" id="tip-K">?</span>
					<span class="tooltip-text" id="tip-K-text"></span>
				</label>
				<textarea id="hfcme-K" class="form-input param-input" placeholder="5" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:2; min-width:120px; visibility:hidden;"></div>
		</div>

		<!-- Row 4 (rk): Kernel bandwidth -->
		<div class="form-row rk-row">
			<div class="form-group" style="flex:1; min-width:80px;">
				<label class="form-label centered form-label-with-tooltip">Bandwidth (L)
					<span class="tooltip-icon" id="tip-L">?</span>
					<span class="tooltip-text">Number of autocovariance lags used in the kernel sum. Larger L captures more lead-lag structure but increases variance. Leave blank to use the package default.</span>
				</label>
				<textarea id="hfcme-L" class="form-input param-input" placeholder="auto" rows="1"></textarea>
			</div>
			<div class="form-group" style="flex:2; min-width:120px; visibility:hidden;"></div>
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
						<li><button class="list-btn has-actions" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="m8.2 2.782.766.249.083.03.007.003a1.552 1.552 0 0 1 .528.349c.154.153.274.337.352.539l.029.081.249.765A.304.304 0 0 0 10.5 5h.004c.061 0 .121-.02.171-.056a.313.313 0 0 0 .111-.146l.249-.765a1.57 1.57 0 0 1 .999-.998l.765-.249a.302.302 0 0 0 0-.569l-.015-.004-.765-.249a1.588 1.588 0 0 1-.618-.381 1.577 1.577 0 0 1-.381-.617l-.249-.765a.304.304 0 0 0-.27-.201h-.015a.303.303 0 0 0-.285.201l-.249.765a1.571 1.571 0 0 1-.984.998l-.595.193h-.002l-.172.055a.304.304 0 0 0-.146.46.302.302 0 0 0 .146.11Zm3.42 4.756a.24.24 0 0 0-.062-.099.278.278 0 0 0-.103-.064l-.114-.038a3.8 3.8 0 0 1-1.243 1.855l-.108.1L9.541 11H6.492l-.349-1.464-.1-.1a4.468 4.468 0 0 1-1.545-2.88 3.76 3.76 0 0 1 1.043-2.543 3.406 3.406 0 0 1 1.604-.912 1.296 1.296 0 0 1-.083-1.007A4.395 4.395 0 0 0 4.831 3.31a4.765 4.765 0 0 0-1.333 3.234v.038a5.318 5.318 0 0 0 1.737 3.455l.7 2.941.008.022c.098.289.285.54.534.717.257.184.566.283.883.283h1.404c.31-.026.602-.146.84-.345.24-.199.408-.47.481-.773l.8-3.05a4.712 4.712 0 0 0 1.083-1.38 1.247 1.247 0 0 1-.141-.283l-.207-.631Zm-2.504 5.09v.013a.496.496 0 0 1-.418.359H7.359a.514.514 0 0 1-.461-.3l-.167-.7H9.28l-.164.628Zm5.84-6.766a.25.25 0 0 0-.117-.088l-.012-.003-.612-.199v.002a1.262 1.262 0 0 1-.799-.799l-.199-.612a.238.238 0 0 0-.228-.161.242.242 0 0 0-.228.161l-.199.612a1.266 1.266 0 0 1-.787.798l-.612.199a.233.233 0 0 0-.117.088.242.242 0 0 0 .117.368l.583.189v.003l.024.008a1.259 1.259 0 0 1 .8.8l.2.612a.238.238 0 0 0 .224.161h.007a.242.242 0 0 0 .228-.161l.199-.612a1.262 1.262 0 0 1 .799-.799l.612-.199a.233.233 0 0 0 .117-.088.242.242 0 0 0 0-.28Z"/></svg>Interpret</button></li>
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
		var currentModel = 'rc';
		var MODELS = ['rc', 'pav', 'tsrc', 'rk'];

		// ── Code helpers ────────────────────────────────────────────────────────
		function esc(s)      { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }

		// ── Equations ────────────────────────────────────────────────────────────
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
			if (currentModel === 'rc') {
				html += eqRow('r<sub>j</sub>', '=', 'log p<sub>j</sub> &minus; log p<sub>j&minus;1</sub>', 'synchronised log-return at refresh time j');
				html += eqRow('&#931;&#770;<sub>RC</sub>', '=', '(1/M) &sum;<sub>j=1</sub><sup>M</sup> r<sub>j</sub> r<sub>j</sub>&#8242;', 'realized covariance: average outer product of returns');
			} else if (currentModel === 'pav') {
				html += eqRow('r<sub>j</sub>', '=', 'log p<sub>j</sub> &minus; log p<sub>j&minus;1</sub>', 'tick log-return at observation j');
				html += eqRow('r&#772;<sub>j</sub>', '=', '(1/H) &sum;<sub>i=1</sub><sup>H</sup> r<sub>j&minus;i+1</sub>', 'pre-averaged return over H-tick window');
				html += eqRow('&#931;&#770;<sub>PAV</sub>', '=', '(&psi;<sub>H</sub>)<sup>&minus;1</sup> &sum;<sub>j=H</sub><sup>M</sup> r&#772;<sub>j</sub> r&#772;<sub>j</sub>&#8242;', 'pre-averaged covariance (noise-robust)');
				html += eqRow('&psi;<sub>H</sub>', '=', '&sum;<sub>i=1</sub><sup>H</sup> (1 &minus; i/H)<sup>2</sup>', 'normalisation constant for pre-averaging kernel');
			} else if (currentModel === 'tsrc') {
				html += eqRow('&#931;&#770;<sub>fast</sub>', '=', '(1/M) &sum;<sub>j</sub> r<sub>j</sub> r<sub>j</sub>&#8242;', 'fast-scale realized covariance (all ticks)');
				html += eqRow('&#931;&#770;<sub>slow</sub>', '=', '(1/K) &sum;<sub>k=1</sub><sup>K</sup> &#931;&#770;<sub>RC</sub><sup>(k)</sup>', 'slow-scale average over K sub-sampled grids');
				html += eqRow('&#931;&#770;<sub>TS</sub>', '=', '&#931;&#770;<sub>slow</sub> &minus; (K&#772;/M) &#931;&#770;<sub>fast</sub>', 'two-scales estimator: bias correction for noise');
				html += eqRow('K&#772;', '=', '(M &minus; K + 1) / K', 'effective slow-scale observation count');
			} else {
				html += eqRow('&#915;<sub>h</sub>', '=', '(1/n) &sum;<sub>j</sub> r<sub>j</sub> r<sub>j&minus;h</sub>&#8242;', 'h-th realized autocovariance matrix');
				html += eqRow('k(x)', '=', 'Parzen kernel: (1&minus;6x<sup>2</sup>+6|x|<sup>3</sup>) or 2(1&minus;|x|)<sup>3</sup>', 'kernel weight at lag fraction x = h/L');
				html += eqRow('&#931;&#770;<sub>RK</sub>', '=', '&#931;<sub>h=&minus;L</sub><sup>L</sup> k(h/L) &#915;<sub>h</sub>', 'realized kernel: kernel-weighted sum of autocovariances');
			}
			el.innerHTML = html;
		}

		// ── Code preview ─────────────────────────────────────────────────────────
		function updateCodePreview() {
			var p      = val('hfcme-p',      'p');
			var assets = val('hfcme-assets', 'assets');
			var code   = '';

			code += cline(kw('using') + ' ' + ty('HighFrequencyCovariance') + ', ' + ty('LinearAlgebra'), 'high-frequency covariance + linear algebra');
			code += blank();

			if (currentModel === 'rc') {
				code += cline('result = ' + fn('estimate_covariance') + '(' + p + ', ' + assets + ';', 'realized covariance from synchronised tick data');
				code += line( '    method = ' + fn('Simple') + '())');
			} else if (currentModel === 'pav') {
				var H = val('hfcme-H', '5');
				code += cline('result = ' + fn('estimate_covariance') + '(' + p + ', ' + assets + ';', 'pre-averaged realized covariance');
				code += line( '    method = ' + fn('PreAveraged') + '(H = ' + H + '))');
			} else if (currentModel === 'tsrc') {
				var K = val('hfcme-K', '5');
				code += cline('result = ' + fn('estimate_covariance') + '(' + p + ', ' + assets + ';', 'two-scales realized covariance');
				code += line( '    method = ' + fn('TwoScales') + '(K = ' + K + '))');
			} else {
				var Lraw = val('hfcme-L', '');
				var rkMethod = Lraw ? fn('RealizedKernel') + '(L = ' + Lraw + ')' : fn('RealizedKernel') + '()';
				code += cline('result = ' + fn('estimate_covariance') + '(' + p + ', ' + assets + ';', 'realized kernel covariance (Parzen kernel)');
				code += line( '    method = ' + rkMethod + ')');
			}

			code += blank();
			code += cline('&#931; = result.covariance',                                              'estimated N&#215;N covariance matrix');
			code += cline('&#961; = ' + fn('cov2cor') + '(&#931;)',                                  'derived N&#215;N correlation matrix');
			code += cline('&#963; = ' + fn('sqrt') + '.(' + fn('diag') + '(&#931;))',               'per-asset annualised volatilities');
			code += blank();
			code += cline(fn('println') + '("Covariance matrix: ", ' + fn('round') + '.(&#931;, digits=6))', 'print covariance matrix');
			code += cline(fn('println') + '("Correlation matrix: ", ' + fn('round') + '.(&#961;, digits=4))', 'print correlation matrix');

			document.getElementById('code-preview').innerHTML = code;
		}

		// ── Model toggle ──────────────────────────────────────────────────────────
		function setModel(model) {
			if (MODELS.indexOf(model) < 0) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			MODELS.forEach(function(m) {
				document.querySelectorAll('.' + m + '-row').forEach(function(el) {
					el.style.display = m === model ? 'flex' : 'none';
				});
			});
			updateEquations();
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		// ── Equation toggle ───────────────────────────────────────────────────────
		document.getElementById('eq-toggle').addEventListener('click', function() {
			document.getElementById('eq-section').classList.toggle('collapsed');
		});

		// ── Tooltip wiring ────────────────────────────────────────────────────────
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

		// ── Input wiring ──────────────────────────────────────────────────────────
		['hfcme-p', 'hfcme-assets', 'hfcme-H', 'hfcme-K'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) {
				el.addEventListener('input', updateCodePreview);
				el.addEventListener('keydown', function(e) { e.stopPropagation(); });
			}
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
				var map = {
					'tip-p-text':      tips.p,
					'tip-assets-text': tips.assets,
					'tip-H-text':      tips.H,
					'tip-K-text':      tips.K,
				};
				Object.keys(map).forEach(function(id) {
					var el = document.getElementById(id);
					if (el && map[id]) { el.innerHTML = map[id]; }
				});
			}
			if (msg.command === 'setModel') { setModel(msg.model); }
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
				{ action: 'epps-effect',    label: 'Epps Effect Check',        desc: 'Plot how correlation estimates change as sampling frequency decreases' },
				{ action: 'noise-level',    label: 'Noise Level Estimation',   desc: 'Estimate microstructure noise variance from ultra-high-frequency returns' },
				{ action: 'psd-check',      label: 'Positive Semi-Definiteness', desc: 'Verify eigenvalues of the estimated covariance matrix are non-negative' },
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
				{ action: 'covariance',       label: 'Covariance Structure',     desc: 'Pairwise co-movement magnitudes and economic interpretation' },
				{ action: 'correlation',      label: 'Correlation Matrix',        desc: 'Normalized pairwise co-movement; compare across estimators' },
				{ action: 'portfolio',        label: 'Portfolio Construction',    desc: 'Using the estimated covariance in mean-variance optimization' },
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

		// ── Init ──────────────────────────────────────────────────────────────────
		setModel('rc');
	</script>
</body>
</html>`;
}
