/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getRvolHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Range-Based Volatility Estimation</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.methods-list { list-style: none; padding-left: 0; margin: 5px 0; }
		.methods-list li { margin: 2px 0; padding-left: 20px; position: relative; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 280px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		select.form-input { font-family: var(--vscode-font-family); cursor: pointer; height: 37px; }
		.param-input { text-align: center; }
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

		<h1>Range-Based Volatility Estimation</h1>
		<div class="powered-by">Powered by: <span id="package-links"></span></div>
		<div class="subtitle">
			<ul class="methods-list">
				<li>Close-to-Close &#8212; classical baseline; sample std of log-returns, annualised by &#8730;<i>T</i></li>
				<li>Parkinson &#8212; high-low range; ~5.2&#215; more efficient than close-to-close</li>
				<li>Garman-Klass &#8212; OHLC estimator; ~7.4&#215; more efficient; assumes zero drift and no overnight gaps</li>
				<li>Rogers-Satchell &#8212; OHLC estimator; drift-independent; ~8&#215; more efficient</li>
				<li>Garman-Klass-Yang-Zhang &#8212; extends Garman-Klass to account for overnight price gaps</li>
				<li>Yang-Zhang &#8212; minimum-variance combination of overnight, open-to-close, and Rogers-Satchell; ~14&#215; more efficient</li>
				<li>Alizadeh-Brandt-Diebold &#8212; log-range proxy log(<i>H</i>/<i>L</i>); near-Gaussian signal for latent log-volatility</li>
			</ul>
		</div>

		<div class="form-row">
			<div class="form-group" style="flex: 2; min-width: 200px;">
				<label class="form-label centered">Estimator</label>
				<select id="rvol-estimator" class="form-input">
					<option value="ctc">Close-to-Close</option>
					<option value="parkinson">Parkinson</option>
					<option value="garman_klass">Garman-Klass</option>
					<option value="rogers_satchell">Rogers-Satchell</option>
					<option value="gkyz">Garman-Klass-Yang-Zhang</option>
					<option value="yang_zhang">Yang-Zhang</option>
					<option value="abd">Alizadeh-Brandt-Diebold</option>
				</select>
			</div>
			<div class="form-group" id="grp-periods" style="flex: 1; min-width: 100px;">
				<label class="form-label centered form-label-with-tooltip">Trading Periods
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Annualisation factor: 252 for equities, 260 for FX, 365 for crypto, 1 for daily (non-annualised).</span>
				</label>
				<textarea id="rvol-periods" class="form-input param-input" placeholder="252" rows="1"></textarea>
			</div>
		</div>

		<div class="form-row">
			<div class="form-group" id="grp-close">
				<label class="form-label centered form-label-with-tooltip">Close prices (<i>C</i>)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Vector of daily closing prices (length &#8805; 2).</span>
				</label>
				<textarea id="rvol-close" class="form-input" placeholder="close" rows="1"></textarea>
			</div>
			<div class="form-group" id="grp-open">
				<label class="form-label centered form-label-with-tooltip">Open prices (<i>O</i>)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Vector of daily opening prices (same length as close).</span>
				</label>
				<textarea id="rvol-open" class="form-input" placeholder="open" rows="1"></textarea>
			</div>
			<div class="form-group" id="grp-high">
				<label class="form-label centered form-label-with-tooltip">High prices (<i>H</i>)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Vector of daily high prices (same length as close).</span>
				</label>
				<textarea id="rvol-high" class="form-input" placeholder="high" rows="1"></textarea>
			</div>
			<div class="form-group" id="grp-low">
				<label class="form-label centered form-label-with-tooltip">Low prices (<i>L</i>)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Vector of daily low prices (same length as close).</span>
				</label>
				<textarea id="rvol-low" class="form-input" placeholder="low" rows="1"></textarea>
			</div>
		</div>

		<div class="eq-section" id="eq-section">
			<button class="eq-toggle" id="eq-toggle"><span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Estimator equations</button>
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
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.37305 2.157H8.37105L8.19905 2.212C8.14005 2.233 8.08905 2.272 8.05305 2.323C8.01705 2.374 7.99705 2.435 7.99705 2.498C7.99705 2.561 8.01705 2.622 8.05305 2.672C8.08905 2.723 8.14005 2.761 8.19905 2.782ZM11.62 7.538C11.609 7.503 11.588 7.468 11.558 7.439C11.528 7.41 11.493 7.388 11.455 7.375L11.341 7.337C11.279 7.544 11.199 7.746 11.102 7.941C10.86 8.425 10.518 8.851 10.098 9.192L9.99005 9.292L9.54105 11H6.49205L6.14305 9.536L6.04305 9.436C5.18305 8.706 4.63105 7.677 4.49805 6.556C4.51205 5.607 4.88505 4.699 5.54105 4.013C5.86205 3.688 6.24505 3.432 6.66705 3.258C6.82305 3.194 6.98305 3.141 7.14505 3.101C7.05005 2.921 6.99805 2.713 6.99805 2.497C6.99805 2.358 7.02005 2.223 7.06205 2.094C6.79605 2.15 6.53505 2.23 6.28205 2.335C5.73805 2.56 5.24505 2.892 4.83105 3.31C3.99305 4.18 3.51605 5.336 3.49805 6.544V6.582C3.62305 7.911 4.24305 9.144 5.23505 10.037L5.93505 12.978L5.94305 13C6.04105 13.289 6.22805 13.54 6.47705 13.717C6.73405 13.901 7.04305 14 7.36005 14H8.76405C9.07305 13.974 9.36605 13.854 9.60405 13.655C9.84305 13.456 10.012 13.185 10.085 12.882L10.885 9.832C11.33 9.443 11.697 8.975 11.968 8.452C11.91 8.365 11.862 8.27 11.827 8.169L11.62 7.538ZM9.11605 12.628V12.641C9.09405 12.735 9.04105 12.82 8.96605 12.881C8.89105 12.947 8.79705 12.988 8.69805 13H7.35905C7.25105 12.999 7.14605 12.964 7.05905 12.9C6.98705 12.85 6.93105 12.781 6.89805 12.7L6.73105 12H9.28005L9.11605 12.628ZM14.956 5.862C14.927 5.822 14.886 5.791 14.839 5.774L14.827 5.771L14.215 5.572V5.574C14.029 5.512 13.86 5.408 13.721 5.269C13.582 5.13 13.478 4.961 13.416 4.775L13.217 4.163C13.201 4.116 13.17 4.075 13.129 4.046C13.088 4.018 13.039 4.002 12.989 4.002C12.939 4.002 12.89 4.017 12.849 4.046C12.809 4.075 12.778 4.116 12.761 4.163L12.562 4.775C12.501 4.959 12.399 5.127 12.262 5.266C12.126 5.404 11.959 5.51 11.775 5.573L11.163 5.772C11.116 5.788 11.074 5.819 11.046 5.86C11.018 5.901 11.002 5.95 11.002 6C11.002 6.05 11.017 6.099 11.046 6.14C11.075 6.18 11.116 6.211 11.163 6.228L11.746 6.417V6.42L11.77 6.428C11.957 6.49 12.126 6.594 12.265 6.733C12.403 6.872 12.508 7.042 12.57 7.228L12.77 7.84C12.786 7.887 12.817 7.928 12.858 7.957C12.898 7.985 12.945 8.001 12.994 8.001H13.001C13.051 8.001 13.1 7.986 13.141 7.957C13.182 7.928 13.212 7.887 13.229 7.84L13.428 7.228C13.49 7.042 13.594 6.873 13.733 6.734C13.872 6.595 14.041 6.491 14.227 6.429L14.839 6.23C14.886 6.214 14.928 6.183 14.956 6.142C14.984 6.101 15 6.052 15 6.002C15 5.952 14.985 5.903 14.956 5.862Z"/></svg>Interpret</button></li>
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
		var currentEstimator = 'ctc';
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

		function eqRow(lhs, op, body, comment) {
			return '<div class="eq-row">'
				+ '<span class="eq-lhs">' + lhs + '</span>'
				+ '<span class="eq-op">' + op + '</span>'
				+ '<span class="eq-body">' + body + '</span>'
				+ (comment ? '<span class="eq-comment"># ' + comment + '</span>' : '')
				+ '</div>';
		}

		var ESTIMATOR_INPUTS = {
			ctc:             { close: true,  open: false, high: false, low: false, periods: true  },
			parkinson:       { close: false, open: false, high: true,  low: true,  periods: true  },
			garman_klass:    { close: true,  open: true,  high: true,  low: true,  periods: true  },
			rogers_satchell: { close: true,  open: true,  high: true,  low: true,  periods: true  },
			gkyz:            { close: true,  open: true,  high: true,  low: true,  periods: true  },
			yang_zhang:      { close: true,  open: true,  high: true,  low: true,  periods: true  },
			abd:             { close: false, open: false, high: true,  low: true,  periods: false },
		};

		function updateFormVisibility() {
			var needs = ESTIMATOR_INPUTS[currentEstimator] || {};
			document.getElementById('grp-close').style.display   = needs.close   ? 'flex' : 'none';
			document.getElementById('grp-open').style.display    = needs.open    ? 'flex' : 'none';
			document.getElementById('grp-high').style.display    = needs.high    ? 'flex' : 'none';
			document.getElementById('grp-low').style.display     = needs.low     ? 'flex' : 'none';
			document.getElementById('grp-periods').style.display = needs.periods ? 'flex' : 'none';
		}

		function updateEquations() {
			var el = document.getElementById('eq-block');
			if (!el) { return; }
			var html = '';
			if (currentEstimator === 'ctc') {
				html += eqRow('<i>r<sub>t</sub></i>', '=', 'log(<i>C<sub>t</sub></i> / <i>C<sub>t&#8722;1</sub></i>)', 'daily log-return');
				html += eqRow('&#963;&#178;', '=', '(1/(<i>n</i>&#8722;1)) &#931; (<i>r<sub>t</sub></i> &#8722; <i>r&#772;</i>)&#178;', 'sample variance of log-returns');
				html += eqRow('&#963;', '=', 'sqrt(&#963;&#178; &#215; <i>T</i>)', 'annualised volatility');
			} else if (currentEstimator === 'parkinson') {
				html += eqRow('Var<sub>P</sub>', '=', '(1 / (4<i>n</i> log 2)) &#931; log(<i>H<sub>t</sub></i>/<i>L<sub>t</sub></i>)&#178;', 'Parkinson variance estimator');
				html += eqRow('&#963;', '=', 'sqrt(Var<sub>P</sub> &#215; <i>T</i>)', 'annualised volatility; ~5.2&#215; more efficient');
			} else if (currentEstimator === 'garman_klass') {
				html += eqRow('<i>c</i>', '=', '2 log 2 &#8722; 1', 'Garman-Klass constant');
				html += eqRow('Var<sub>GK</sub>', '=', '(1/<i>n</i>) &#931; [0.5 log(<i>H</i>/<i>L</i>)&#178; &#8722; <i>c</i> log(<i>C</i>/<i>O</i>)&#178;]', 'OHLC variance estimator');
				html += eqRow('&#963;', '=', 'sqrt(max(Var<sub>GK</sub>, 0) &#215; <i>T</i>)', 'annualised volatility; ~7.4&#215; more efficient');
			} else if (currentEstimator === 'rogers_satchell') {
				html += eqRow('Var<sub>RS</sub>', '=', '(1/<i>n</i>) &#931; [log(<i>H</i>/<i>C</i>) log(<i>H</i>/<i>O</i>) + log(<i>L</i>/<i>C</i>) log(<i>L</i>/<i>O</i>)]', 'drift-independent OHLC estimator');
				html += eqRow('&#963;', '=', 'sqrt(max(Var<sub>RS</sub>, 0) &#215; <i>T</i>)', 'annualised volatility; ~8&#215; more efficient');
			} else if (currentEstimator === 'gkyz') {
				html += eqRow('<i>c</i>', '=', '2 log 2 &#8722; 1', 'Garman-Klass constant');
				html += eqRow('Var<sub>GKYZ</sub>', '=', '(1/(<i>n</i>&#8722;1)) &#931; [log(<i>O<sub>t</sub></i>/<i>C<sub>t&#8722;1</sub></i>)&#178; + 0.5 log(<i>H</i>/<i>L</i>)&#178; &#8722; <i>c</i> log(<i>C</i>/<i>O</i>)&#178;]', 'overnight gap correction');
				html += eqRow('&#963;', '=', 'sqrt(max(Var<sub>GKYZ</sub>, 0) &#215; <i>T</i>)', 'annualised volatility');
			} else if (currentEstimator === 'yang_zhang') {
				html += eqRow('<i>k</i>', '=', '0.34 / (1.34 + (<i>m</i>+1)/(<i>m</i>&#8722;1))', 'optimal weight; <i>m</i> = <i>n</i>&#8722;1');
				html += eqRow('Var<sub>YZ</sub>', '=', 'Var<sub>o</sub> + <i>k</i> Var<sub>c</sub> + (1&#8722;<i>k</i>) Var<sub>RS</sub>', 'minimum-variance combination');
				html += eqRow('&#963;', '=', 'sqrt(max(Var<sub>YZ</sub>, 0) &#215; <i>T</i>)', 'annualised volatility; ~14&#215; more efficient');
			} else if (currentEstimator === 'abd') {
				html += eqRow('<i>x<sub>t</sub></i>', '=', 'log(<i>H<sub>t</sub></i> / <i>L<sub>t</sub></i>)', 'log-range per period');
				html += eqRow('', '', 'near-Gaussian signal for latent log-volatility under GBM', '');
				html += eqRow('', '', 'returns a vector, not an annualised scalar', '');
			}
			el.innerHTML = html;
		}

		function updateCodePreview() {
			var close   = val('rvol-close',   'close');
			var open    = val('rvol-open',    'open');
			var high    = val('rvol-high',    'high');
			var low     = val('rvol-low',     'low');
			var periods = val('rvol-periods', '252');
			var c = '';
			c += line(kw('using') + ' ' + ty('RangeVol'));
			c += blank();
			if (currentEstimator === 'ctc') {
				c += cline('sigma = ' + fn('close_to_close') + '(' + close + '; trading_periods=' + periods + ')', 'classical close-to-close baseline estimator');
			} else if (currentEstimator === 'parkinson') {
				c += cline('sigma = ' + fn('parkinson') + '(' + high + ', ' + low + '; trading_periods=' + periods + ')', 'Parkinson (1980): high-low range, ~5.2x more efficient');
			} else if (currentEstimator === 'garman_klass') {
				c += cline('sigma = ' + fn('garman_klass') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=' + periods + ')', 'Garman-Klass (1980): OHLC, ~7.4x more efficient');
			} else if (currentEstimator === 'rogers_satchell') {
				c += cline('sigma = ' + fn('rogers_satchell') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=' + periods + ')', 'Rogers-Satchell (1991): drift-independent, ~8x more efficient');
			} else if (currentEstimator === 'gkyz') {
				c += cline('sigma = ' + fn('garman_klass_yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=' + periods + ')', 'GK-Yang-Zhang: extends GK to account for overnight gaps');
			} else if (currentEstimator === 'yang_zhang') {
				c += cline('sigma = ' + fn('yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=' + periods + ')', 'Yang-Zhang (2000): minimum-variance combination, ~14x more efficient');
			} else if (currentEstimator === 'abd') {
				c += cline('x = ' + fn('alizadeh_brandt_diebold') + '(' + high + ', ' + low + ')', 'Alizadeh-Brandt-Diebold (2002): log-range proxy for log-volatility');
			}
			c += blank();
			if (currentEstimator === 'abd') {
				c += cline(fn('println') + '("Log-range values: ", x)', 'per-period log-range vector');
				c += cline(fn('println') + '("Mean log-range:   ", ' + fn('round') + '(' + fn('mean') + '(x); digits=4))', 'average log-range (requires using Statistics)');
			} else {
				c += cline(fn('println') + '("Annualised volatility: ", ' + fn('round') + '(sigma * 100; digits=2), "%")', 'annualised volatility as a percentage');
			}
			document.getElementById('code-preview').innerHTML = c;
		}

		function setEstimator(est) {
			currentEstimator = est;
			document.getElementById('rvol-estimator').value = est;
			updateFormVisibility();
			updateEquations();
			updateCodePreview();
		}

		document.getElementById('rvol-estimator').addEventListener('change', function() {
			setEstimator(this.value);
		});

		['rvol-close', 'rvol-open', 'rvol-high', 'rvol-low', 'rvol-periods'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
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
				id: 'vol-timeseries',
				label: 'Volatility Time Series',
				desc: 'Plot the estimated annualised volatility over the sample period',
				code: function() {
					var close = val('rvol-close', 'close');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol') + ', ' + ty('Plots'));
					c += blank();
					c += cline('n      = ' + fn('length') + '(' + close + ')', 'number of observations');
					c += cline('window = 30', 'rolling window size in days');
					c += line('vol = [' + fn('close_to_close') + '(' + close + '[i:i+window-1]; trading_periods=252) ' + kw('for') + ' i ' + kw('in') + ' 1:(n-window+1)]');
					c += blank();
					c += cline(fn('plot') + '(window:n, vol .* 100, xlabel="Day", ylabel="Volatility (%)", legend=false)', 'rolling 30-day annualised volatility');
					return c;
				},
			},
			{
				id: 'estimator-comparison-plot',
				label: 'Estimator Comparison Plot',
				desc: 'Plot all range-based estimates side by side',
				code: function() {
					var open  = val('rvol-open',  'open');
					var high  = val('rvol-high',  'high');
					var low   = val('rvol-low',   'low');
					var close = val('rvol-close', 'close');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol') + ', ' + ty('Plots'));
					c += blank();
					c += line('T = 252');
					c += line('estimates = [');
					c += cline('  ' + fn('close_to_close') + '(' + close + '; trading_periods=T),', 'Close-to-Close');
					c += cline('  ' + fn('parkinson') + '(' + high + ', ' + low + '; trading_periods=T),', 'Parkinson');
					c += cline('  ' + fn('garman_klass') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T),', 'Garman-Klass');
					c += cline('  ' + fn('rogers_satchell') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T),', 'Rogers-Satchell');
					c += cline('  ' + fn('yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T),', 'Yang-Zhang');
					c += line(']');
					c += blank();
					c += line('labels = ["Close-to-Close" "Parkinson" "Garman-Klass" "Rogers-Satchell" "Yang-Zhang"]');
					c += cline(fn('bar') + '(labels[1, :], estimates .* 100, legend=false, ylabel="Ann. Volatility (%)")', 'comparison bar chart');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'summary-stats',
				label: 'Summary Statistics',
				desc: 'Descriptive statistics for the price input series',
				code: function() {
					var close = val('rvol-close', 'close');
					var c = '';
					c += line(kw('using') + ' ' + ty('Statistics'));
					c += blank();
					c += cline('r = ' + fn('diff') + '(' + fn('log') + '.(' + close + '))', 'daily log-returns');
					c += cline(fn('println') + '("n:    ", ' + fn('length') + '(r))', 'number of log-returns');
					c += cline(fn('println') + '("mean: ", ' + fn('round') + '(' + fn('mean') + '(r); digits=6))', 'mean log-return');
					c += cline(fn('println') + '("std:  ", ' + fn('round') + '(' + fn('std') + '(r); digits=6))', 'daily standard deviation');
					c += cline(fn('println') + '("min:  ", ' + fn('round') + '(' + fn('minimum') + '(r); digits=6))', 'minimum log-return');
					c += cline(fn('println') + '("max:  ", ' + fn('round') + '(' + fn('maximum') + '(r); digits=6))', 'maximum log-return');
					return c;
				},
			},
			{
				id: 'volatility-clustering',
				label: 'Volatility Clustering',
				desc: 'Autocorrelation of squared log-returns',
				code: function() {
					var close = val('rvol-close', 'close');
					var c = '';
					c += line(kw('using') + ' ' + ty('StatsBase') + ', ' + ty('Plots'));
					c += blank();
					c += cline('r  = ' + fn('diff') + '(' + fn('log') + '.(' + close + '))', 'daily log-returns');
					c += cline('r2 = r .^ 2', 'squared log-returns (variance proxy)');
					c += blank();
					c += cline('ac = ' + fn('autocor') + '(r2, 1:20)', 'autocorrelation at lags 1 to 20');
					c += cline(fn('bar') + '(1:20, ac, xlabel="Lag", ylabel="ACF", legend=false)', 'significant lags indicate volatility clustering');
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'rolling-estimate',
				label: 'Rolling Estimate',
				desc: 'Compute rolling-window volatility across the sample period',
				code: function() {
					var high    = val('rvol-high',    'high');
					var low     = val('rvol-low',     'low');
					var close   = val('rvol-close',   'close');
					var open    = val('rvol-open',    'open');
					var periods = val('rvol-periods', '252');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol'));
					c += blank();
					c += cline('window = 30', 'rolling window length in days');
					c += cline('n      = ' + fn('length') + '(' + close + ')', 'total number of observations');
					c += line('vol = [' + fn('yang_zhang') + '(' + open + '[i:i+window-1], ' + high + '[i:i+window-1], ' + low + '[i:i+window-1], ' + close + '[i:i+window-1]; trading_periods=' + periods + ') ' + kw('for') + ' i ' + kw('in') + ' 1:(n-window+1)]');
					c += blank();
					c += cline(fn('println') + '("Latest estimate: ", ' + fn('round') + '(vol[end] * 100; digits=2), "%")', 'most recent rolling volatility');
					return c;
				},
			},
			{
				id: 'persistence-forecast',
				label: 'Persistence Forecast',
				desc: 'Next-period forecast using the current volatility estimate',
				code: function() {
					var open    = val('rvol-open',    'open');
					var high    = val('rvol-high',    'high');
					var low     = val('rvol-low',     'low');
					var close   = val('rvol-close',   'close');
					var periods = val('rvol-periods', '252');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol'));
					c += blank();
					c += cline('sigma_current = ' + fn('yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=' + periods + ')', 'current full-sample estimate');
					c += cline('sigma_forecast = sigma_current', 'persistence model: next period = current period');
					c += blank();
					c += cline(fn('println') + '("Forecast (annualised): ", ' + fn('round') + '(sigma_forecast * 100; digits=2), "%")', 'annualised volatility forecast');
					c += cline(fn('println') + '("Forecast (daily):      ", ' + fn('round') + '(sigma_forecast / sqrt(' + periods + ') * 100; digits=4), "%")', 'daily volatility forecast');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'compare-all',
				label: 'Compare All Estimators',
				desc: 'Run all range-based estimators on the same data',
				code: function() {
					var open  = val('rvol-open',  'open');
					var high  = val('rvol-high',  'high');
					var low   = val('rvol-low',   'low');
					var close = val('rvol-close', 'close');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol'));
					c += blank();
					c += line('T = 252');
					c += cline('ctc  = ' + fn('close_to_close') + '(' + close + '; trading_periods=T)', 'baseline');
					c += cline('park = ' + fn('parkinson') + '(' + high + ', ' + low + '; trading_periods=T)', '~5.2x efficiency');
					c += cline('gk   = ' + fn('garman_klass') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T)', '~7.4x efficiency');
					c += cline('rs   = ' + fn('rogers_satchell') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T)', '~8x efficiency');
					c += cline('gkyz = ' + fn('garman_klass_yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T)', 'overnight gap correction');
					c += cline('yz   = ' + fn('yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=T)', '~14x efficiency');
					c += blank();
					c += cline(fn('println') + '("Close-to-Close:          ", ' + fn('round') + '(ctc  * 100; digits=2), "%")', 'benchmark');
					c += cline(fn('println') + '("Parkinson:               ", ' + fn('round') + '(park * 100; digits=2), "%")', '');
					c += cline(fn('println') + '("Garman-Klass:            ", ' + fn('round') + '(gk   * 100; digits=2), "%")', '');
					c += cline(fn('println') + '("Rogers-Satchell:         ", ' + fn('round') + '(rs   * 100; digits=2), "%")', '');
					c += cline(fn('println') + '("GK-Yang-Zhang:           ", ' + fn('round') + '(gkyz * 100; digits=2), "%")', '');
					c += cline(fn('println') + '("Yang-Zhang:              ", ' + fn('round') + '(yz   * 100; digits=2), "%")', 'minimum-variance estimator');
					return c;
				},
			},
			{
				id: 'compare-garch',
				label: 'Compare with GARCH',
				desc: 'Range-based estimate vs GARCH(1,1) conditional volatility',
				code: function() {
					var open  = val('rvol-open',  'open');
					var high  = val('rvol-high',  'high');
					var low   = val('rvol-low',   'low');
					var close = val('rvol-close', 'close');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol') + ', ' + ty('ARCH'));
					c += blank();
					c += cline('r       = ' + fn('diff') + '(' + fn('log') + '.(' + close + '))', 'daily log-returns');
					c += cline('yz      = ' + fn('yang_zhang') + '(' + open + ', ' + high + ', ' + low + ', ' + close + '; trading_periods=252)', 'Yang-Zhang range estimate');
					c += cline('garch   = ' + fn('fit') + '(' + ty('GARCH') + '{1,1}, r)', 'fit GARCH(1,1) to log-returns');
					c += cline('sigma_g = ' + fn('sqrt') + '(' + fn('volatilities') + '(garch)[end] * 252)', 'annualised GARCH conditional vol');
					c += blank();
					c += cline(fn('println') + '("Yang-Zhang:  ", ' + fn('round') + '(yz      * 100; digits=2), "%")', 'range-based estimate');
					c += cline(fn('println') + '("GARCH(1,1):  ", ' + fn('round') + '(sigma_g * 100; digits=2), "%")', 'GARCH conditional estimate');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'annualisation',
				label: 'Annualisation',
				desc: 'Convert between daily and annualised volatility',
				code: function() {
					var close   = val('rvol-close',   'close');
					var periods = val('rvol-periods', '252');
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol'));
					c += blank();
					c += cline('sigma_annual = ' + fn('close_to_close') + '(' + close + '; trading_periods=' + periods + ')', 'annualised volatility');
					c += cline('sigma_daily  = ' + fn('close_to_close') + '(' + close + '; trading_periods=1)', 'daily volatility (trading_periods=1)');
					c += blank();
					c += cline(fn('println') + '("Annual: ", ' + fn('round') + '(sigma_annual * 100; digits=2), "%")', 'annualised');
					c += cline(fn('println') + '("Daily:  ", ' + fn('round') + '(sigma_daily  * 100; digits=4), "%")', 'daily');
					c += cline(fn('println') + '("Check:  ", ' + fn('round') + '(sigma_daily * ' + fn('sqrt') + '(' + periods + '); digits=6))', 'should equal sigma_annual');
					return c;
				},
			},
			{
				id: 'efficiency-gains',
				label: 'Efficiency Gains',
				desc: 'Known relative efficiency of each estimator vs close-to-close',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('RangeVol'));
					c += blank();
					c += cline('# Theoretical efficiency gains relative to close-to-close', '');
					c += cline('# (under geometric Brownian motion with zero drift)', '');
					c += blank();
					c += line(fn('println') + '("Close-to-Close:          1.0x  (baseline)")');
					c += line(fn('println') + '("Parkinson:               ~5.2x")');
					c += line(fn('println') + '("Garman-Klass:            ~7.4x")');
					c += line(fn('println') + '("Rogers-Satchell:         ~8.0x (drift-independent)")');
					c += line(fn('println') + '("Garman-Klass-Yang-Zhang: overnight gap correction")');
					c += line(fn('println') + '("Yang-Zhang:              ~14x  (minimum-variance)")');
					c += blank();
					c += cline('# Higher efficiency = lower variance for same sample size', '');
					c += cline('# Gains are reduced when assumptions (zero drift, no gaps) are violated', '');
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
			if (msg.command === 'actionDone') {
				releaseBtn();
			}
		});

		setEstimator('ctc');
	</script>
</body>
</html>`;
}
