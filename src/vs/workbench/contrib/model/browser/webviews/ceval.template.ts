/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getCevalHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Copula Evaluation</title>
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
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 5px; width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; align-items: flex-end; }
		.form-row .form-group { margin-bottom: 0; }
		.form-row .form-group.narrow { flex: 0 0 auto; min-width: 80px; }
		.form-row .form-group.wide { flex: 2; min-width: 160px; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		.form-input:disabled { opacity: 0.5; cursor: not-allowed; }
		select.form-input { font-family: var(--vscode-font-family); font-size: 13px; height: 37px; padding: 6px 10px; cursor: pointer; }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		.section-label { font-size: 12px; font-weight: 600; margin: 16px 0 8px 0; color: var(--vscode-foreground); }
		.marg-header { display: flex; align-items: flex-end; gap: 6px; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px solid var(--vscode-widget-border); }
		.marg-hdr-name   { flex: 0 0 55px; font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.marg-hdr-tilde  { flex: 0 0 auto; visibility: hidden; padding: 0 4px; }
		.marg-hdr-dist   { flex: 0 0 145px; text-align: center; font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.marg-hdr-params { flex: 0 0 240px; padding-left: 12px; font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.marg-hdr-eval   { flex: 0 0 100px; text-align: center; white-space: nowrap; font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.marg-row { display: flex; align-items: center; gap: 6px; margin-bottom: 7px; }
		.marg-tilde { color: var(--vscode-descriptionForeground); flex: 0 0 auto; padding: 0 4px; }
		.marg-sep { color: var(--vscode-descriptionForeground); flex: 0 0 auto; padding: 0 2px; }
		.marg-name { flex: 0 0 55px; width: 55px; text-align: center; }
		.marg-dist { flex: 0 0 145px; width: 145px; }
		.marg-params { display: flex; align-items: center; gap: 4px; flex: 0 0 240px; width: 240px; overflow: hidden; }
		.marg-param { width: 60px; text-align: center; flex: 0 0 auto; }
		.marg-eval { flex: 0 0 100px; width: 100px; text-align: center; }
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
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Copula Evaluation</h1>
			<div class="powered-by" id="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Construction of a <i>d</i>-dimensional multivariate distribution through specification of the copula, marginal distributions, and associated parameters</li>
					<li>Evaluation of the copula's PDF <i>c</i>(<b>u</b>) and CDF <i>C</i>(<b>u</b>) at a specific point <b>u</b> &#8712; [0,1]<sup><i>d</i></sup></li>
					<li>Evaluation of the Sklar distribution's PDF <i>f</i>(<b>x</b>) and CDF <i>F</i>(<b>x</b>) with the chosen marginals at a specific point <b>x</b> &#8712; &#8477;<sup><i>d</i></sup></li>
				</ul>
			</div>
		</div>

		<!-- Row 1: Copula, Dimension, Dependence -->
		<div class="form-row">
			<div class="form-group wide">
				<label class="form-label centered">Copula</label>
				<select id="copula-select" class="form-input">
					<optgroup label="— Elliptical —">
						<option value="gaussian">Gaussian</option>
						<option value="studentt">Student's t</option>
					</optgroup>
					<optgroup label="— Archimedean —">
						<option value="gumbel">Gumbel</option>
						<option value="clayton">Clayton</option>
						<option value="frank">Frank</option>
						<option value="joe">Joe</option>
						<option value="amh">AMH</option>
						<option value="bb1">BB1</option>
					</optgroup>
					<optgroup label="— Extreme Value —">
						<option value="galambos">Galambos</option>
						<option value="husler">H\xfcsler–Reiss</option>
						<option value="tev">tEV</option>
						<option value="mo">Marshall–Olkin</option>
					</optgroup>
					<optgroup label="— Empirical —">
						<option value="empirical">Unsmoothed Empirical</option>
						<option value="beta-emp">Beta Smoothed</option>
						<option value="bernstein">Bernstein</option>
						<option value="checkerboard">Checkerboard</option>
						<option value="empirical-ev">Empirical EV</option>
					</optgroup>
					<optgroup label="— Reference —">
						<option value="upper-frechet">M — Upper Fr\xe9chet</option>
						<option value="independence">Π — Independence</option>
						<option value="lower-frechet">W — Lower Fr\xe9chet</option>
					</optgroup>
				</select>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered">Dimension (<i>d</i>)</label>
				<textarea id="dim" class="form-input" placeholder="2" rows="1"></textarea>
			</div>
			<div class="form-group" id="dep-group">
				<label class="form-label centered" id="dep-label">Dependence (&theta;)</label>
				<textarea id="dep" class="form-input" placeholder="2.0" rows="1"></textarea>
			</div>
			<div class="form-group narrow" id="nu-group" style="display:none">
				<label class="form-label centered">Deg. of Freedom (&nu;)</label>
				<textarea id="nu" class="form-input" placeholder="4" rows="1"></textarea>
			</div>
			<div class="form-group" id="data-group" style="display:none">
				<label class="form-label centered">Data</label>
				<textarea id="data" class="form-input" placeholder="data" rows="1"></textarea>
			</div>
		</div>

		<!-- BB1 extra param -->
		<div class="form-row" id="bb1-row" style="display:none">
			<div class="form-group narrow">
				<label class="form-label centered">&delta; (shape)</label>
				<textarea id="delta" class="form-input" placeholder="2.0" rows="1"></textarea>
			</div>
		</div>

		<!-- Marshall-Olkin params -->
		<div class="form-row" id="mo-row" style="display:none">
			<div class="form-group narrow">
				<label class="form-label centered">&lambda;<sub>1</sub></label>
				<textarea id="lambda1" class="form-input" placeholder="1.0" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered">&lambda;<sub>2</sub></label>
				<textarea id="lambda2" class="form-input" placeholder="1.0" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered">&lambda;<sub>12</sub></label>
				<textarea id="lambda12" class="form-input" placeholder="0.5" rows="1"></textarea>
			</div>
		</div>

		<!-- Marginals -->
		<div id="marg-container"></div>

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
						<li><button class="list-btn" id="btn-diagnose"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
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
		let activeBtn = null;

		// ── Marginal distributions (same style as Uncertainty Propagation) ──
		var MARG_DISTS = [
			{ key: 'Normal',      label: 'Normal',        params: [{n:'μ',l:'μ (mean)',d:'0.0'},{n:'σ',l:'σ (std)',d:'1.0'}] },
			{ key: 'Uniform',     label: 'Uniform',       params: [{n:'a',l:'a (lower)',d:'0.0'},{n:'b',l:'b (upper)',d:'1.0'}] },
			{ key: 'LogNormal',   label: 'LogNormal',     params: [{n:'μ',l:'μ (log-mean)',d:'0.0'},{n:'σ',l:'σ (log-std)',d:'1.0'}] },
			{ key: 'Exponential', label: 'Exponential',   params: [{n:'θ',l:'θ (scale)',d:'1.0'}] },
			{ key: 'Beta',        label: 'Beta',          params: [{n:'α',l:'α (shape1)',d:'2.0'},{n:'β',l:'β (shape2)',d:'5.0'}] },
			{ key: 'Gamma',       label: 'Gamma',         params: [{n:'α',l:'α (shape)',d:'2.0'},{n:'θ',l:'θ (scale)',d:'1.0'}] },
			{ key: 'Weibull',     label: 'Weibull',       params: [{n:'α',l:'α (shape)',d:'1.0'},{n:'θ',l:'θ (scale)',d:'1.0'}] },
			{ key: 'Pareto',      label: 'Pareto',        params: [{n:'α',l:'α (shape)',d:'2.0'},{n:'θ',l:'θ (scale)',d:'1.0'}] },
			{ key: 'TDist',       label: 'TDist',         params: [{n:'ν',l:'ν (df)',d:'5'}] },
			{ key: 'Cauchy',      label: 'Cauchy',        params: [{n:'μ',l:'μ (loc)',d:'0.0'},{n:'σ',l:'σ (scale)',d:'1.0'}] },
			{ key: 'Laplace',     label: 'Laplace',       params: [{n:'μ',l:'μ (loc)',d:'0.0'},{n:'b',l:'b (scale)',d:'1.0'}] },
			{ key: 'Gumbel',      label: 'Gumbel',        params: [{n:'μ',l:'μ (loc)',d:'0.0'},{n:'β',l:'β (scale)',d:'1.0'}] },
			{ key: 'Frechet',     label: 'Fréchet',  params: [{n:'α',l:'α (shape)',d:'2.0'},{n:'θ',l:'θ (scale)',d:'1.0'}] },
			{ key: 'GeneralizedExtremeValue', label: 'GEV', params: [{n:'μ',l:'μ (loc)',d:'0.0'},{n:'σ',l:'σ (scale)',d:'1.0'},{n:'ξ',l:'ξ (shape)',d:'0.1'}] },
			{ key: 'Poisson',     label: 'Poisson',       params: [{n:'λ',l:'λ (rate)',d:'1.0'}] },
			{ key: 'NegativeBinomial', label: 'Neg. Binomial', params: [{n:'r',l:'r (failures)',d:'5'},{n:'p',l:'p (prob)',d:'0.5'}] },
		];

		var BIVARIATE_ONLY = ['galambos','husler','tev','mo','lower-frechet'];
		var EMPIRICAL_FAMILIES = ['empirical','beta-emp','bernstein','checkerboard','empirical-ev'];
		var REFERENCE_FAMILIES = ['upper-frechet','independence','lower-frechet'];

		function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
		function kw(s)  { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function ty(s)  { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function fn(s)  { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function line(s) { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, comment) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(comment) + '</span></div>'; }
		function blank() { return '<div class="code-blank"></div>'; }

		function getFamily() { return document.getElementById('copula-select').value; }
		function getDim() { return Math.max(2, parseInt(document.getElementById('dim').value.trim()) || 2); }
		function isEmp() { return EMPIRICAL_FAMILIES.indexOf(getFamily()) !== -1; }
		function isRef() { return REFERENCE_FAMILIES.indexOf(getFamily()) !== -1; }

		// ── Subscript helper ──
		var SUBS = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
		function sub(i) {
			var s = String(i + 1);
			var r = '';
			for (var k = 0; k < s.length; k++) { r += SUBS[parseInt(s[k])]; }
			return r;
		}

		// ── Param fields (adapted from UP) ──
		function renderMargParams(distKey, presetValues) {
			var d = null;
			for (var i = 0; i < MARG_DISTS.length; i++) { if (MARG_DISTS[i].key === distKey) { d = MARG_DISTS[i]; break; } }
			if (!d || d.params.length === 0) { return ''; }
			var parts = d.params.map(function(p, i) {
				var val = (presetValues && presetValues[i] !== undefined) ? presetValues[i] : p.d;
				return '<textarea class="form-input marg-param" title="' + p.l + '" placeholder="' + p.d + '" rows="1">' + esc(val) + '</textarea>';
			});
			return '<span class="marg-sep">(</span>' + parts.join('<span class="marg-sep">, </span>') + '<span class="marg-sep">)</span>';
		}

		function distOptions(selected) {
			return MARG_DISTS.map(function(d) {
				return '<option value="' + d.key + '"' + (d.key === selected ? ' selected' : '') + '>' + d.label + '</option>';
			}).join('');
		}

		function buildMargRow(i, isEmpRow, nameVal, distKey, presetVals, evalVal) {
			var defaultName = 'X' + (i + 1);
			var nm = nameVal || defaultName;
			if (isEmpRow) {
				return '<div class="marg-row">'
					+ '<textarea class="form-input marg-name" rows="1" title="variable name">' + esc(nm) + '</textarea>'
					+ '<span class="marg-tilde">=</span>'
					+ '<textarea class="form-input marg-eval" placeholder="0.5" rows="1" title="u ∈ [0,1]">' + esc(evalVal || '0.5') + '</textarea>'
					+ '</div>';
			}
			var dk = distKey || 'Normal';
			return '<div class="marg-row">'
				+ '<textarea class="form-input marg-name" rows="1" title="variable name">' + esc(nm) + '</textarea>'
				+ '<span class="marg-tilde">~</span>'
				+ '<select class="form-input marg-dist">' + distOptions(dk) + '</select>'
				+ '<div class="marg-params">' + renderMargParams(dk, presetVals) + '</div>'
				+ '<textarea class="form-input marg-eval" placeholder="0.0" rows="1">' + esc(evalVal || '0.0') + '</textarea>'
				+ '</div>';
		}

		function rebuildMargRows() {
			var container = document.getElementById('marg-container');
			var d = getDim();
			var emp = isEmp();

			// Preserve existing name/dist/param/eval values per row index
			var existing = container.querySelectorAll('.marg-row');
			var saved = [];
			existing.forEach(function(row, i) {
				var nameEl  = row.querySelector('.marg-name');
				var distSel = row.querySelector('.marg-dist');
				var paramEls = row.querySelectorAll('.marg-param');
				var evalEl  = row.querySelector('.marg-eval');
				saved[i] = {
					name:   nameEl  ? nameEl.value  : ('X' + (i + 1)),
					dist:   distSel ? distSel.value : 'Normal',
					params: Array.from(paramEls).map(function(el) { return el.value; }),
					eval:   evalEl  ? evalEl.value  : '',
				};
			});

			container.innerHTML = '';

			// Header row — marg-hdr-tilde is visibility:hidden to reserve the same space as the real tilde
			var headerHtml = emp
				? '<div class="marg-header"><span class="marg-hdr-name"></span><span class="marg-hdr-tilde">~</span><span class="marg-hdr-eval">Evaluation Point u ∈ [0,1]ᵈ</span></div>'
				: '<div class="marg-header"><span class="marg-hdr-name"></span><span class="marg-hdr-tilde">~</span><span class="marg-hdr-dist">Marginal Distributions</span><span class="marg-hdr-params">Parameters</span><span class="marg-hdr-eval">Evaluation Point</span></div>';
			var hdrDiv = document.createElement('div');
			hdrDiv.innerHTML = headerHtml;
			container.appendChild(hdrDiv.firstChild);

			for (var i = 0; i < d; i++) {
				var prev = saved[i] || {};
				var html = buildMargRow(i, emp, prev.name, prev.dist, prev.params, prev.eval);
				var div = document.createElement('div');
				div.innerHTML = html;
				container.appendChild(div.firstChild);
			}

			// Re-attach dist change listeners
			container.querySelectorAll('.marg-dist').forEach(function(sel) {
				sel.addEventListener('change', function() {
					var row = this.closest('.marg-row');
					var paramsDiv = row.querySelector('.marg-params');
					if (paramsDiv) { paramsDiv.innerHTML = renderMargParams(this.value, null); }
					updateCodePreview();
				});
			});

			updateCodePreview();
		}

		function updateParamVisibility() {
			var family = getFamily();
			var isEllip = family === 'gaussian' || family === 'studentt';
			var emp = isEmp();
			var isMO = family === 'mo';
			var isBB1 = family === 'bb1';
			var isTEV = family === 'tev';
			var noDepParam = emp || isRef() || isMO || isBB1;

			// Dimension: fixed for bivariate-only
			var dimEl = document.getElementById('dim');
			if (BIVARIATE_ONLY.indexOf(family) !== -1) {
				dimEl.value = '2';
				dimEl.disabled = true;
			} else {
				dimEl.disabled = false;
			}

			// Dependence / Correlation label
			var depGrp = document.getElementById('dep-group');
			var depLbl = document.getElementById('dep-label');
			if (isEllip || isTEV) {
				depGrp.style.display = '';
				if (depLbl) { depLbl.textContent = 'Correlation (ρ)'; }
				document.getElementById('dep').placeholder = '0.5';
			} else if (noDepParam) {
				depGrp.style.display = 'none';
			} else {
				depGrp.style.display = '';
				if (depLbl) { depLbl.textContent = 'Dependence (θ)'; }
				document.getElementById('dep').placeholder = '2.0';
			}

			// nu (degrees of freedom): Student-t and tEV
			document.getElementById('nu-group').style.display = (family === 'studentt' || isTEV) ? '' : 'none';

			// Data: empirical only
			document.getElementById('data-group').style.display = emp ? '' : 'none';

			// BB1 delta
			document.getElementById('bb1-row').style.display = isBB1 ? 'flex' : 'none';

			// MO lambdas
			document.getElementById('mo-row').style.display = isMO ? 'flex' : 'none';

			rebuildMargRows();
		}

		function getCopulaCtorCode(family, d) {
			var dep  = (document.getElementById('dep')  ? document.getElementById('dep').value.trim()  : '') || (family === 'gaussian' || family === 'studentt' || family === 'tev' ? '0.5' : '2.0');
			var nu   = (document.getElementById('nu')   ? document.getElementById('nu').value.trim()   : '') || '4';
			var dlt  = (document.getElementById('delta')? document.getElementById('delta').value.trim(): '') || '2.0';
			var la1  = (document.getElementById('lambda1')  ? document.getElementById('lambda1').value.trim()  : '') || '1.0';
			var la2  = (document.getElementById('lambda2')  ? document.getElementById('lambda2').value.trim()  : '') || '1.0';
			var la12 = (document.getElementById('lambda12') ? document.getElementById('lambda12').value.trim() : '') || '0.5';
			var dat  = (document.getElementById('data')  ? document.getElementById('data').value.trim()  : '') || 'data';

			var ctors = {
				'gaussian':      { c: ty('GaussianCopula') + '(' + d + ', Σ)',       comment: 'Gaussian copula' },
				'studentt':      { c: ty('TCopula') + '(' + nu + ', Σ)',              comment: "Student's t copula" },
				'gumbel':        { c: ty('GumbelCopula') + '(' + d + ', ' + dep + ')',    comment: 'Gumbel copula (θ ≥ 1)' },
				'clayton':       { c: ty('ClaytonCopula') + '(' + d + ', ' + dep + ')',   comment: 'Clayton copula (θ > 0)' },
				'frank':         { c: ty('FrankCopula') + '(' + d + ', ' + dep + ')',     comment: 'Frank copula (θ ≠ 0)' },
				'joe':           { c: ty('JoeCopula') + '(' + d + ', ' + dep + ')',       comment: 'Joe copula (θ ≥ 1)' },
				'amh':           { c: ty('AMHCopula') + '(' + d + ', ' + dep + ')',       comment: 'AMH copula (θ ∈ [−1, 1))' },
				'bb1':           { c: ty('BB1Copula') + '(' + d + ', ' + dep + ', ' + dlt + ')', comment: 'BB1 copula (θ > 0, δ ≥ 1)' },
				'galambos':      { c: ty('GalambosCopula') + '(' + dep + ')',             comment: 'Galambos copula (θ > 0), bivariate' },
				'husler':        { c: ty('HuslerReissCopula') + '(' + dep + ')',          comment: 'H\xfcsler–Reiss copula, bivariate' },
				'tev':           { c: ty('TEVCopula') + '(' + nu + ', ' + dep + ')',      comment: 'extreme-t copula, bivariate' },
				'mo':            { c: ty('MarshallOlkinCopula') + '(2, [' + la1 + ', ' + la2 + ', ' + la12 + '])', comment: 'Marshall–Olkin copula, bivariate' },
				'empirical':     { c: ty('EmpiricalCopula') + '(' + dat + ')',            comment: 'unsmoothed empirical copula' },
				'beta-emp':      { c: ty('BetaCopula') + '(' + dat + ')',                 comment: 'beta-smoothed empirical copula' },
				'bernstein':     { c: ty('BernsteinCopula') + '(' + dat + ')',            comment: 'Bernstein polynomial copula' },
				'checkerboard':  { c: ty('CheckerboardCopula') + '(' + dat + ')',         comment: 'checkerboard copula' },
				'empirical-ev':  { c: ty('EmpiricalEVCopula') + '(' + dat + ')',          comment: 'empirical extreme-value copula' },
				'upper-frechet': { c: ty('MCopula') + '(' + d + ')',                      comment: 'upper Fr\xe9chet bound (comonotonicity)' },
				'independence':  { c: ty('IndependenceCopula') + '(' + d + ')',           comment: 'independence copula Π' },
				'lower-frechet': { c: ty('WCopula') + '()',                               comment: 'lower Fr\xe9chet bound, d = 2 only' },
			};
			return ctors[family] || { c: ty('GaussianCopula') + '(' + d + ', Σ)', comment: 'copula' };
		}

		function updateCodePreview() {
			var cp = document.getElementById('code-preview');
			var family = getFamily();
			var d = getDim();
			var emp = isEmp();
			var isEllip = family === 'gaussian' || family === 'studentt';
			var dep  = (document.getElementById('dep')  ? document.getElementById('dep').value.trim()  : '') || (isEllip || family === 'tev' ? '0.5' : '2.0');
			var code = '';

			// using line
			if (emp) {
				code += line(kw('using') + ' ' + ty('Copulas'));
			} else if (isEllip) {
				code += line(kw('using') + ' ' + ty('Copulas') + ', ' + ty('Distributions') + ', ' + ty('LinearAlgebra'));
			} else {
				code += line(kw('using') + ' ' + ty('Copulas') + ', ' + ty('Distributions'));
			}
			code += blank();

			// Correlation matrix for elliptical
			if (isEllip) {
				if (d === 2) {
					code += cline('Σ = [1.0 ' + dep + '; ' + dep + ' 1.0]', 'correlation matrix');
				} else {
					code += cline('Σ = ' + dep + ' .* ' + fn('ones') + '(' + d + ', ' + d + ') + (1 − ' + dep + ') .* ' + ty('I') + '(' + d + ')', 'equicorrelation matrix');
				}
				code += blank();
			}

			// Copula constructor
			var ctor = getCopulaCtorCode(family, d);
			code += cline('C = ' + ctor.c, ctor.comment);
			code += blank();

			var margRows = document.querySelectorAll('.marg-row');

			if (emp) {
				// Empirical: just eval at u
				var uVals = [];
				margRows.forEach(function(row, i) {
					var evalEl = row.querySelector('.marg-eval');
					uVals.push(evalEl ? (evalEl.value.trim() || '0.5') : '0.5');
				});
				code += cline('u = [' + uVals.join(', ') + ']', 'evaluation point u ∈ [0,1]ᵈ');
				code += blank();
				code += line(fn('println') + '("Copula PDF  c(u) = ", ' + fn('pdf') + '(C, u))');
				code += line(fn('println') + '("Copula CDF  C(u) = ", ' + fn('cdf') + '(C, u))');
			} else {
				// Build marginal lines
				var varNames = [];
				var evalPts  = [];

				// Collect per-row values
				margRows.forEach(function(row, i) {
					var nameEl  = row.querySelector('.marg-name');
					var distSel = row.querySelector('.marg-dist');
					var paramEls = row.querySelectorAll('.marg-param');
					var evalEl  = row.querySelector('.marg-eval');
					var varName = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : ('X' + (i + 1));
					var distKey = distSel ? distSel.value : 'Normal';
					var distDef = null;
					for (var k = 0; k < MARG_DISTS.length; k++) { if (MARG_DISTS[k].key === distKey) { distDef = MARG_DISTS[k]; break; } }
					if (!distDef) { distDef = MARG_DISTS[0]; }
					var params = Array.from(paramEls).map(function(el, j) { return el.value.trim() || distDef.params[j].d; });
					var evalVal = evalEl ? (evalEl.value.trim() || '0.0') : '0.0';
					varNames.push(varName);
					evalPts.push(evalVal);
					code += cline(
						varName + ' = ' + ty(distKey) + '(' + params.join(', ') + ')',
						'marginal distribution ' + (i + 1)
					);
				});

				// SklarDist
				code += cline(
					'D  = ' + fn('SklarDist') + '(C, (' + varNames.join(', ') + '))',
					'multivariate Sklar distribution'
				);
				code += blank();

				// Evaluation point
				code += cline('point = [' + evalPts.join(', ') + ']', 'evaluation point x ∈ ℝᵈ');
				var uParts = varNames.map(function(v, i) { return fn('cdf') + '(' + v + ', ' + evalPts[i] + ')'; });
				code += cline('u     = [' + uParts.join(', ') + ']', 'probability integral transform u ∈ [0,1]ᵈ');
				code += blank();

				code += line(fn('println') + '("Copula PDF  c(u) = ", ' + fn('pdf') + '(C, u))');
				code += line(fn('println') + '("Copula CDF  C(u) = ", ' + fn('cdf') + '(C, u))');
				code += line(fn('println') + '("Joint  PDF  f(x) = ", ' + fn('pdf') + '(D, point))');
				code += line(fn('println') + '("Joint  CDF  F(x) = ", ' + fn('cdf') + '(D, point))');
			}

			cp.innerHTML = code;
		}

		// ── Event listeners ──
		document.getElementById('copula-select').addEventListener('change', updateParamVisibility);

		document.getElementById('dim').addEventListener('input', function() {
			rebuildMargRows();
		});

		['dep','nu','delta','lambda1','lambda2','lambda12','data'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
		});

		document.getElementById('marg-container').addEventListener('input', updateCodePreview);

		document.querySelectorAll('textarea.form-input').forEach(function(el) {
			el.addEventListener('keydown', function(e) { e.stopPropagation(); });
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

		function pressBtn(btn) {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
			activeBtn = btn;
			btn.classList.add('was-pressed');
		}
		function releaseBtn() {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); activeBtn = null; }
		}

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			pressBtn(this); vscode.postMessage({ command: 'openDocs', target: 'wiki' });
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			pressBtn(this); vscode.postMessage({ command: 'openNotebookList' });
		});
		document.getElementById('btn-documentation').addEventListener('click', function() { vscode.postMessage({ command: 'openDocs', target: 'documentation' }); });
		document.getElementById('btn-paper').addEventListener('click', function() { vscode.postMessage({ command: 'openDocs', target: 'paper' }); });
		document.getElementById('btn-viz').addEventListener('click',     function() { vscode.postMessage({ command: 'openPanel', target: 'visualization' }); });
		document.getElementById('btn-diagnose').addEventListener('click',function() { vscode.postMessage({ command: 'openPanel', target: 'diagnostics' }); });
		document.getElementById('btn-predict').addEventListener('click', function() { vscode.postMessage({ command: 'openPanel', target: 'prediction' }); });
		document.getElementById('btn-compare').addEventListener('click', function() { vscode.postMessage({ command: 'openPanel', target: 'alternative-methods' }); });

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
		});

		// ── Initialise ──
		updateParamVisibility();
	</script>
</body>
</html>`;
}
