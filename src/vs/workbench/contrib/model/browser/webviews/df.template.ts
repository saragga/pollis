/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getDfHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Distribution Factories</title>
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
		.model-toggle { display: inline-flex; flex-wrap: wrap; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
		.toggle-btn { background: transparent; border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 20px; height: 35px; line-height: 35px; transition: background 0.15s; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-hoverBackground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; align-items: flex-end; }
		.form-row .form-group { margin-bottom: 0; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		select.form-input { font-family: var(--vscode-font-family); font-size: 13px; height: 37px; }
		select.form-input option:disabled { opacity: 0.4; }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		/* Moments rows */
		.param-row { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-end; }
		.param-row-label { font-size: 11px; color: var(--vscode-descriptionForeground); padding-bottom: 10px; white-space: nowrap; min-width: 72px; }
		.k0-note { font-size: 12px; color: var(--vscode-descriptionForeground); padding: 6px 0 12px; }
		.support-row { display: flex; gap: 12px; margin-top: 2px; margin-bottom: 12px; align-items: flex-end; }
		.support-label { font-size: 11px; color: var(--vscode-descriptionForeground); padding-bottom: 10px; white-space: nowrap; min-width: 72px; }
		/* Discover rows */
		.discover-row { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-end; }
		.discover-val-wrap { display: flex; gap: 6px; flex: 1.5; min-width: 160px; }
		.remove-row-btn { background: transparent; border: none; color: var(--vscode-descriptionForeground); cursor: pointer; font-size: 18px; line-height: 37px; padding: 0 2px; flex-shrink: 0; opacity: 0.6; }
		.remove-row-btn:hover { opacity: 1; color: var(--vscode-errorForeground); }
		.remove-row-btn-placeholder { width: 22px; flex-shrink: 0; }
		.add-constraint-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 4px 0; margin-top: 2px; margin-bottom: 4px; }
		.add-constraint-btn:hover { color: var(--vscode-textLink-activeForeground); }
		/* Code preview */
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-symbolIcon-keywordForeground); }
		.hl-fn      { color: var(--vscode-textPreformat-foreground); }
		.hl-type    { color: var(--vscode-symbolIcon-classForeground); }
		.hl-number  { color: var(--vscode-debugTokenExpression-number); }
		.hl-string  { color: var(--vscode-debugTokenExpression-string); }
		.copy-btn { position: absolute; top: 8px; right: 8px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; }
		.copy-btn:hover { opacity: 1; }
		/* Bottom columns */
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
			<h1>Distribution Factories</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Moments — construct any of 27 distributions from statistical moments or quantiles via <code>make_dist</code></li>
					<li>Discover — find all feasible distribution families for any combination of constraints via <code>available_distributions</code></li>
				</ul>
			</div>
		</div>

		<!-- Main toggle -->
		<div class="model-toggle">
			<button class="toggle-btn active" data-method="moments">Moments</button>
			<button class="toggle-btn" data-method="discover">Discover</button>
		</div>

		<!-- ===== MOMENTS section ===== -->
		<div id="moments-section">
			<div class="form-row">
				<div class="form-group" style="flex:2; min-width:180px;">
					<label class="form-label">Distribution Family</label>
					<select id="dist-select" class="form-input"></select>
				</div>
			</div>
			<div id="param-rows"></div>
			<div class="support-row">
				<span class="support-label">support (opt.)</span>
				<div class="form-group" style="flex:1; min-width:120px; margin-bottom:0;">
					<textarea id="m-support" class="form-input" rows="1" placeholder="e.g. 0..Inf  or  2..7  or  0:20"></textarea>
				</div>
			</div>
		</div>

		<!-- ===== DISCOVER section ===== -->
		<div id="discover-section" style="display:none;">
			<div id="discover-rows"></div>
			<button class="add-constraint-btn" id="btn-add-constraint">
				<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
					<path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2zm0 2.5a.5.5 0 0 0-.5.5v2.5H5a.5.5 0 0 0 0 1h2.5V11a.5.5 0 0 0 1 0V8.5H11a.5.5 0 0 0 0-1H8.5V5a.5.5 0 0 0-.5-.5z"/>
				</svg>
				Additional Constraint
			</button>
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
						<li><button class="list-btn" id="btn-diagnostics"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
						<li><button class="list-btn" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>Predict</button></li>
						<li><button class="list-btn" id="btn-alternative"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>Compare</button></li>
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

		// ── Distribution data ────────────────────────────────────────────────
		const DISTS = [
			{ label: 'Normal',            type: 'Normal',           k: 2, family: 'real' },
			{ label: 'TDist',             type: 'TDist',            k: 3, family: 'real' },
			{ label: 'Laplace',           type: 'Laplace',          k: 2, family: 'real' },
			{ label: 'Logistic',          type: 'Logistic',         k: 2, family: 'real' },
			{ label: 'Gumbel',            type: 'Gumbel',           k: 2, family: 'real' },
			{ label: 'Cauchy (quantile only)', type: 'Cauchy',      k: 2, family: 'real', qOnly: true },
			{ label: 'Gamma',             type: 'Gamma',            k: 2, family: 'pos'  },
			{ label: 'Erlang',            type: 'Erlang',           k: 2, family: 'pos'  },
			{ label: 'LogNormal',         type: 'LogNormal',        k: 2, family: 'pos'  },
			{ label: 'Weibull',           type: 'Weibull',          k: 2, family: 'pos'  },
			{ label: 'Frechet',           type: 'Frechet',          k: 2, family: 'pos'  },
			{ label: 'FDist',             type: 'FDist',            k: 2, family: 'pos'  },
			{ label: 'InverseGamma',      type: 'InverseGamma',     k: 2, family: 'pos'  },
			{ label: 'Exponential',       type: 'Exponential',      k: 1, family: 'pos'  },
			{ label: 'Chisq',             type: 'Chisq',            k: 1, family: 'pos'  },
			{ label: 'FoldedNormal',      type: 'FoldedNormal',     k: 1, family: 'pos'  },
			{ label: 'Pareto',            type: 'Pareto',           k: 1, family: 'pos'  },
			{ label: 'Chi',               type: 'Chi',              k: 1, family: 'pos'  },
			{ label: 'Rayleigh',          type: 'Rayleigh',         k: 1, family: 'pos'  },
			{ label: 'Beta',              type: 'Beta',             k: 2, family: 'unit' },
			{ label: 'Uniform',           type: 'Uniform',          k: 0, family: 'unit' },
			{ label: 'SymTriangularDist', type: 'SymTriangularDist',k: 0, family: 'unit' },
			{ label: 'Binomial',          type: 'Binomial',         k: 1, family: 'disc' },
			{ label: 'NegativeBinomial',  type: 'NegativeBinomial', k: 2, family: 'disc' },
			{ label: 'Geometric',         type: 'Geometric',        k: 1, family: 'disc' },
			{ label: 'Poisson',           type: 'Poisson',          k: 1, family: 'disc' },
			{ label: 'DiscreteUniform',   type: 'DiscreteUniform',  k: 0, family: 'disc' },
		];

		// 12 moment/quantile parameters (no support — handled separately in Discover)
		const ALL_PARAMS = [
			{ key: 'mean',          label: 'mean',                               placeholder: '5.0' },
			{ key: 'var',           label: 'variance',                           placeholder: '2.0' },
			{ key: 'std',           label: 'standard deviation',                 placeholder: '1.5' },
			{ key: 'cv',            label: 'coefficient of variation',            placeholder: '0.30' },
			{ key: 'scv',           label: 'squared coefficient of variation',    placeholder: '0.09' },
			{ key: 'second_moment', label: 'second moment E[X²]',           placeholder: '30.0' },
			{ key: 'mode',          label: 'mode',                               placeholder: '4.0' },
			{ key: 'median',        label: 'median',                             placeholder: '5.0' },
			{ key: 'q1',            label: 'first quartile (0.25 quantile)',      placeholder: '2.0' },
			{ key: 'q3',            label: 'third quartile (0.75 quantile)',      placeholder: '8.0' },
			{ key: 'iqr',           label: 'interquartile range',                placeholder: '6.0' },
			{ key: 'quantiles',     label: 'quantiles as vector of (p, q)',       placeholder: '[(0.10, 1.0), (0.90, 10.0)]' },
		];

		// All 13 Discover parameters (includes support)
		const DISCOVER_PARAMS = ALL_PARAMS.concat([{ key: 'support', label: 'support interval (a..b, a..Inf, a:b)', placeholder: '' }]);

		const QUANTILE_ONLY_KEYS = new Set(['q1', 'q3', 'median', 'iqr', 'quantiles']);

		const SUPPORT_OPTIONS = [
			{ value: '0..Inf',     label: 'Positive (0..Inf)' },
			{ value: '0..1',       label: 'Unit interval (0..1)' },
			{ value: '-Inf..Inf',  label: 'Real line (-Inf..Inf)' },
			{ value: '0:Inf',      label: 'Non-negative integers (0:Inf)' },
			{ value: 'custom',     label: 'Custom…' },
		];

		let selectedMethod = 'moments';
		let discoverRowCounter = 0;

		// ── Helpers ──────────────────────────────────────────────────────────
		function getCurrentDist() {
			const val = document.getElementById('dist-select').value;
			return DISTS.find(function(d) { return d.type === val; }) || null;
		}

		function getPlaceholder(key) {
			const p = ALL_PARAMS.find(function(p) { return p.key === key; });
			return p ? p.placeholder : '1.0';
		}

		function getVal(id, def) {
			const el = document.getElementById(id);
			return el ? (el.value.trim() || def) : def;
		}

		function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

		function tokenize(s) {
			const KEYWORDS  = new Set(['using', 'if', 'end', 'for', 'function', 'return', 'begin', 'let', 'in', 'true', 'false']);
			const FUNCTIONS = new Set(['make_dist', 'available_distributions', 'dist_exists', 'println', 'mean', 'var', 'std', 'median', 'quantile', 'minimum', 'maximum']);
			const tokens = [];
			let i = 0;
			while (i < s.length) {
				const ch = s[i];
				// String literal
				if (ch === '"') {
					let j = i + 1;
					while (j < s.length && s[j] !== '"') { j++; }
					tokens.push({ type: 'string', text: s.slice(i, j + 1) });
					i = j + 1;
					continue;
				}
				// Number (stops before the .. interval operator)
				if (/\d/.test(ch)) {
					let j = i, hasDot = false;
					while (j < s.length) {
						if (/\d/.test(s[j])) { j++; }
						else if (s[j] === '.' && !hasDot && s[j + 1] !== '.') { hasDot = true; j++; }
						else { break; }
					}
					tokens.push({ type: 'number', text: s.slice(i, j) });
					i = j;
					continue;
				}
				// Identifier
				if (/[a-zA-Z_]/.test(ch)) {
					let j = i;
					while (j < s.length && /[a-zA-Z0-9_!]/.test(s[j])) { j++; }
					const word = s.slice(i, j);
					// Peek past whitespace to determine context
					let k = j;
					while (k < s.length && s[k] === ' ') { k++; }
					const followedByParen  = s[k] === '(';
					const followedByEquals = s[k] === '=' && s[k + 1] !== '=';
					let type = 'plain';
					if (KEYWORDS.has(word)) {
						type = 'keyword';
					} else if (FUNCTIONS.has(word) && followedByParen) {
						type = 'fn';
					} else if (/^[A-Z]/.test(word) && !followedByEquals) {
						type = 'type';
					}
					tokens.push({ type, text: word });
					i = j;
					continue;
				}
				tokens.push({ type: 'plain', text: ch });
				i++;
			}
			return tokens;
		}

		function renderTokens(tokens) {
			return tokens.map(function(t) {
				const e = esc(t.text);
				if (t.type === 'string')  { return '<span class="hl-string">'  + e + '</span>'; }
				if (t.type === 'number')  { return '<span class="hl-number">'  + e + '</span>'; }
				if (t.type === 'keyword') { return '<span class="hl-keyword">' + e + '</span>'; }
				if (t.type === 'fn')      { return '<span class="hl-fn">'      + e + '</span>'; }
				if (t.type === 'type')    { return '<span class="hl-type">'    + e + '</span>'; }
				return e;
			}).join('');
		}

		function highlight(s) { return renderTokens(tokenize(s)); }
		function line(s) { return '<div class="code-line">' + highlight(s) + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + highlight(s) + '  <span class="code-comment"># ' + esc(c) + '</span></div>'; }
		function emptyLine() { return '<div class="code-line">&nbsp;</div>'; }

		// ── Moments ──────────────────────────────────────────────────────────
		function renderParamRows() {
			const dist = getCurrentDist();
			const container = document.getElementById('param-rows');
			container.innerHTML = '';
			if (!dist) { return; }

			if (dist.k === 0) {
				const note = document.createElement('div');
				note.className = 'k0-note';
				note.textContent = 'No free parameters — support fully determines this distribution.';
				container.appendChild(note);
				updateCodePreview();
				return;
			}

			const available = dist.qOnly
				? ALL_PARAMS.filter(function(p) { return QUANTILE_ONLY_KEYS.has(p.key); })
				: ALL_PARAMS;

			for (let i = 0; i < dist.k; i++) {
				const row = document.createElement('div');
				row.className = 'param-row';

				const lbl = document.createElement('span');
				lbl.className = 'param-row-label';
				lbl.textContent = 'Parameter ' + (i + 1);
				row.appendChild(lbl);

				const typeGroup = document.createElement('div');
				typeGroup.className = 'form-group';
				typeGroup.style.cssText = 'flex:1.5; min-width:130px; margin-bottom:0;';
				const sel = document.createElement('select');
				sel.className = 'form-input';
				sel.id = 'param-type-' + i;
				available.forEach(function(p) {
					const opt = document.createElement('option');
					opt.value = p.key;
					opt.textContent = p.label;
					sel.appendChild(opt);
				});
				sel.value = available[Math.min(i, available.length - 1)].key;
				sel.addEventListener('change', function() { refreshMomentsDropdowns(); updateCodePreview(); });
				typeGroup.appendChild(sel);
				row.appendChild(typeGroup);

				const valGroup = document.createElement('div');
				valGroup.className = 'form-group';
				valGroup.style.cssText = 'flex:1; min-width:80px; margin-bottom:0;';
				const ta = document.createElement('textarea');
				ta.className = 'form-input';
				ta.id = 'param-val-' + i;
				ta.rows = 1;
				ta.placeholder = getPlaceholder(sel.value);
				ta.addEventListener('input', updateCodePreview);
				valGroup.appendChild(ta);
				row.appendChild(valGroup);

				container.appendChild(row);
			}

			refreshMomentsDropdowns();
			updateCodePreview();
		}

		function refreshMomentsDropdowns() {
			const dist = getCurrentDist();
			if (!dist || dist.k === 0) { return; }
			const selected = [];
			for (let i = 0; i < dist.k; i++) {
				const s = document.getElementById('param-type-' + i);
				if (s) { selected.push(s.value); }
			}
			for (let i = 0; i < dist.k; i++) {
				const s = document.getElementById('param-type-' + i);
				if (!s) { continue; }
				Array.from(s.options).forEach(function(opt) {
					opt.disabled = selected.some(function(v, j) { return j !== i && v === opt.value; });
				});
				const ta = document.getElementById('param-val-' + i);
				if (ta) { ta.placeholder = getPlaceholder(s.value); }
			}
		}

		function buildMomentsCode() {
			const dist = getCurrentDist();
			if (!dist) { return ''; }
			const type = dist.type;

			if (dist.k === 0) {
				return [
					line('using DistributionsFactories, Distributions'),
					line('d = make_dist(' + type + ')'),
					line('println("support: [", minimum(d), ", ", maximum(d), "]")'),
				].join('');
			}

			const args = [];
			for (let i = 0; i < dist.k; i++) {
				const sel = document.getElementById('param-type-' + i);
				const ta  = document.getElementById('param-val-'  + i);
				if (!sel) { continue; }
				const key = sel.value;
				const val = ta ? (ta.value.trim() || getPlaceholder(key)) : getPlaceholder(key);
				args.push(key + '=' + val);
			}

			const supportVal = getVal('m-support', '');
			if (supportVal) { args.push('support=' + supportVal); }

			const argsStr = args.join(', ');
			const isCauchy = type === 'Cauchy';
			const verifyStr = isCauchy
				? '    println("q25: ", quantile(d, 0.25), "  q75: ", quantile(d, 0.75))'
				: '    println("mean: ", mean(d), "  var: ", var(d), "  median: ", median(d))';

			return [
				line('using DistributionsFactories, Distributions'),
				cline('if dist_exists(' + type + ', ' + argsStr + ')', 'feasibility check'),
				line('    d = make_dist(' + type + ', ' + argsStr + ')'),
				line(verifyStr),
				line('end'),
			].join('');
		}

		// ── Discover ─────────────────────────────────────────────────────────
		function createDiscoverRow(idx, defaultKey) {
			const row = document.createElement('div');
			row.className = 'discover-row';
			row.dataset.idx = String(idx);

			// Parameter type dropdown
			const typeGroup = document.createElement('div');
			typeGroup.className = 'form-group';
			typeGroup.style.cssText = 'flex:1.5; min-width:130px; margin-bottom:0;';
			const sel = document.createElement('select');
			sel.className = 'form-input';
			sel.id = 'discover-type-' + idx;
			DISCOVER_PARAMS.forEach(function(p) {
				const opt = document.createElement('option');
				opt.value = p.key;
				opt.textContent = p.label;
				sel.appendChild(opt);
			});
			sel.value = defaultKey || 'mean';
			sel.addEventListener('change', function() {
				updateDiscoverValueField(idx);
				refreshDiscoverDropdowns();
				updateCodePreview();
			});
			typeGroup.appendChild(sel);
			row.appendChild(typeGroup);

			// Value field wrapper
			const valWrap = document.createElement('div');
			valWrap.className = 'discover-val-wrap';
			valWrap.id = 'discover-val-wrap-' + idx;
			row.appendChild(valWrap);

			// Remove button (only for rows beyond the first)
			if (idx > 0) {
				const removeBtn = document.createElement('button');
				removeBtn.className = 'remove-row-btn';
				removeBtn.title = 'Remove constraint';
				removeBtn.textContent = '×';
				removeBtn.addEventListener('click', function() {
					row.remove();
					refreshDiscoverDropdowns();
					updateCodePreview();
				});
				row.appendChild(removeBtn);
			} else {
				const spacer = document.createElement('div');
				spacer.className = 'remove-row-btn-placeholder';
				row.appendChild(spacer);
			}

			return row;
		}

		function updateDiscoverValueField(idx) {
			const sel = document.getElementById('discover-type-' + idx);
			const wrap = document.getElementById('discover-val-wrap-' + idx);
			if (!sel || !wrap) { return; }
			wrap.innerHTML = '';

			if (sel.value === 'support') {
				// Support preset dropdown
				const supportSel = document.createElement('select');
				supportSel.className = 'form-input';
				supportSel.id = 'discover-val-' + idx;
				SUPPORT_OPTIONS.forEach(function(o) {
					const opt = document.createElement('option');
					opt.value = o.value;
					opt.textContent = o.label;
					supportSel.appendChild(opt);
				});
				supportSel.addEventListener('change', function() {
					const customTa = document.getElementById('discover-custom-' + idx);
					if (customTa) { customTa.style.display = supportSel.value === 'custom' ? '' : 'none'; }
					updateCodePreview();
				});
				wrap.appendChild(supportSel);

				// Custom text input, hidden by default
				const customTa = document.createElement('textarea');
				customTa.className = 'form-input';
				customTa.id = 'discover-custom-' + idx;
				customTa.rows = 1;
				customTa.placeholder = 'e.g. 3..Inf';
				customTa.style.display = 'none';
				customTa.addEventListener('input', updateCodePreview);
				wrap.appendChild(customTa);
			} else {
				const p = DISCOVER_PARAMS.find(function(p) { return p.key === sel.value; });
				const ta = document.createElement('textarea');
				ta.className = 'form-input';
				ta.id = 'discover-val-' + idx;
				ta.rows = 1;
				ta.placeholder = p ? p.placeholder : '1.0';
				ta.addEventListener('input', updateCodePreview);
				wrap.appendChild(ta);
			}
		}

		function refreshDiscoverDropdowns() {
			const rows = document.querySelectorAll('#discover-rows .discover-row');
			const selected = [];
			rows.forEach(function(row) {
				const idx = row.dataset.idx;
				const s = document.getElementById('discover-type-' + idx);
				if (s) { selected.push({ idx: idx, key: s.value }); }
			});
			rows.forEach(function(row) {
				const myIdx = row.dataset.idx;
				const mySel = document.getElementById('discover-type-' + myIdx);
				if (!mySel) { return; }
				Array.from(mySel.options).forEach(function(opt) {
					opt.disabled = selected.some(function(s) { return s.idx !== myIdx && s.key === opt.value; });
				});
			});
		}

		function addDiscoverRow() {
			const container = document.getElementById('discover-rows');
			const existingRows = container.querySelectorAll('.discover-row');
			const usedKeys = [];
			existingRows.forEach(function(r) {
				const s = document.getElementById('discover-type-' + r.dataset.idx);
				if (s) { usedKeys.push(s.value); }
			});
			const nextParam = DISCOVER_PARAMS.find(function(p) { return !usedKeys.includes(p.key); });
			const newIdx = ++discoverRowCounter;
			const row = createDiscoverRow(newIdx, nextParam ? nextParam.key : DISCOVER_PARAMS[0].key);
			container.appendChild(row);
			updateDiscoverValueField(newIdx);
			refreshDiscoverDropdowns();
			updateCodePreview();
		}

		function buildDiscoverCode() {
			const rows = document.querySelectorAll('#discover-rows .discover-row');
			const args = [];
			rows.forEach(function(row) {
				const idx = row.dataset.idx;
				const sel = document.getElementById('discover-type-' + idx);
				if (!sel) { return; }
				const key = sel.value;
				if (key === 'support') {
					const supportSel = document.getElementById('discover-val-' + idx);
					if (!supportSel) { return; }
					let val = supportSel.value;
					if (val === 'custom') {
						const customTa = document.getElementById('discover-custom-' + idx);
						val = customTa ? (customTa.value.trim() || '0..Inf') : '0..Inf';
					}
					args.push('support=' + val);
				} else {
					const p = DISCOVER_PARAMS.find(function(p) { return p.key === key; });
					const ta = document.getElementById('discover-val-' + idx);
					const val = ta ? (ta.value.trim() || (p ? p.placeholder : '1.0')) : '1.0';
					args.push(key + '=' + val);
				}
			});
			return [
				line('using DistributionsFactories, Distributions'),
				cline('available_distributions(' + args.join(', ') + ')', 'returns all feasible families'),
			].join('');
		}

		// ── Code preview ─────────────────────────────────────────────────────
		function updateCodePreview() {
			const preview = document.getElementById('code-preview');
			preview.innerHTML = selectedMethod === 'moments' ? buildMomentsCode() : buildDiscoverCode();
		}

		// ── Tab switching ────────────────────────────────────────────────────
		function setMethod(m) {
			selectedMethod = m;
			document.querySelectorAll('[data-method]').forEach(function(b) {
				b.classList.toggle('active', b.dataset.method === m);
			});
			document.getElementById('moments-section').style.display  = m === 'moments'  ? '' : 'none';
			document.getElementById('discover-section').style.display = m === 'discover' ? '' : 'none';
			updateCodePreview();
		}

		// ── Init ─────────────────────────────────────────────────────────────
		function populateDistSelect() {
			const sel = document.getElementById('dist-select');
			const groups = [
				{ label: 'Real line (−∞, ∞)', family: 'real' },
				{ label: 'Positive (0, ∞)',             family: 'pos'  },
				{ label: 'Unit interval [0, 1]',             family: 'unit' },
				{ label: 'Discrete',                         family: 'disc' },
			];
			groups.forEach(function(g) {
				const grp = document.createElement('optgroup');
				grp.label = g.label;
				DISTS.filter(function(d) { return d.family === g.family; }).forEach(function(d) {
					const opt = document.createElement('option');
					opt.value = d.type;
					opt.textContent = d.label;
					grp.appendChild(opt);
				});
				sel.appendChild(grp);
			});
		}

		function initDiscover() {
			discoverRowCounter = 0;
			const container = document.getElementById('discover-rows');
			container.innerHTML = '';
			const row = createDiscoverRow(0, 'mean');
			container.appendChild(row);
			updateDiscoverValueField(0);
		}

		// Wire events
		document.getElementById('dist-select').addEventListener('change', renderParamRows);
		document.getElementById('m-support').addEventListener('input', updateCodePreview);
		document.getElementById('btn-add-constraint').addEventListener('click', addDiscoverRow);
		document.querySelectorAll('[data-method]').forEach(function(b) {
			b.addEventListener('click', function() { setMethod(b.dataset.method); });
		});

		// Copy button
		document.getElementById('btn-copy').addEventListener('click', function() {
			const lines = document.getElementById('code-preview').querySelectorAll('.code-line');
			const text = Array.from(lines).map(function(l) { return l.textContent || ''; }).filter(function(t) { return t.trim(); }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				const btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

		// Message handler
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
			if (msg.command === 'packageLinks') {
				const container = document.getElementById('package-links');
				if (container) {
					container.innerHTML = '';
					(msg.packages || []).forEach(function(pkg, i) {
						const a = document.createElement('a');
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
				const btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
			if (msg.command === 'actionDone') { releaseBtn(); }
		});

		// Learn More
		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openDocs', target: 'wiki' }); }
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openNotebookList' }); }
		});
		document.getElementById('btn-documentation').addEventListener('click', function() { vscode.postMessage({ command: 'openDocs', target: 'documentation' }); });
		document.getElementById('btn-paper').addEventListener('click', function() { vscode.postMessage({ command: 'openDocs', target: 'paper' }); });

		// Next Steps
		document.getElementById('btn-viz').addEventListener('click', function() { vscode.postMessage({ command: 'openPanel', target: 'visualization' }); });
		document.getElementById('btn-diagnostics').addEventListener('click', function() { vscode.postMessage({ command: 'openPanel', target: 'diagnostics' }); });
		document.getElementById('btn-alternative').addEventListener('click', function() { vscode.postMessage({ command: 'openPanel', target: 'alternative-methods' }); });

		// Start
		populateDistSelect();
		renderParamRows();
		initDiscover();
		setMethod('moments');
	</script>
</body>
</html>`;
}
