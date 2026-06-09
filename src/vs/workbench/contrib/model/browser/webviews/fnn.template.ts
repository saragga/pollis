/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getFnnHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Feedforward Neural Networks</title>
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
		.checks-row { display: flex; align-items: center; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; }
		.check-item { display: flex; align-items: center; gap: 8px; }
		.check-item input[type="checkbox"] { appearance: none; -webkit-appearance: none; width: 14px; height: 14px; border: 1px solid var(--vscode-input-border); border-radius: 3px; background: var(--vscode-input-background); cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.12s, border-color 0.12s; }
		.check-item input[type="checkbox"]:checked { background: var(--vscode-textLink-foreground); border-color: var(--vscode-textLink-foreground); }
		.check-item input[type="checkbox"]:checked::after { content: ''; position: absolute; left: 3px; top: 0px; width: 5px; height: 9px; border: 1.5px solid var(--vscode-editor-background); border-top: none; border-left: none; transform: rotate(45deg); }
		.check-item input[type="checkbox"]:disabled { opacity: 0.5; cursor: not-allowed; }
		.check-item label { font-size: 13px; font-weight: 500; color: var(--vscode-foreground); cursor: pointer; user-select: none; }
		.check-item label.dimmed { opacity: 0.5; cursor: not-allowed; }
		.cb-info-wrap { position: relative; display: inline-flex; align-items: center; gap: 4px; }
		.cb-info-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.cb-info-icon.pinned { background-color: var(--vscode-charts-green); }
		.cb-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 300px; z-index: 1000; display: none; margin-bottom: 5px; }
		.cb-info-wrap:hover .cb-tooltip, .cb-tooltip.pinned { display: block; }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-row .form-group.narrow { min-width: 80px; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-icon:hover { opacity: 0.8; }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 320px; z-index: 1000; display: none; margin-bottom: 5px; }
		.form-label:not(.centered) .tooltip-text { left: 0; transform: none; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		select.form-input { padding: 6px 10px; cursor: pointer; }
		#hidden-size, #num-layers, #dropout, #num-components { text-align: center; }
		.mlp-row   { display: flex; }
		.ae-vae-row { display: none; }
		.mdn-row   { display: none; }
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
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Feedforward Neural Networks</h1>
			<div class="powered-by" id="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>MLP &#8212; vanilla feedforward network; universal approximator for regression and classification</li>
					<li>Autoencoder &#8212; unsupervised encoder&#8211;decoder for compression and anomaly detection</li>
					<li>VAE &#8212; Variational Autoencoder; latent generative model trained with the ELBO</li>
				</ul>
			</div>
		</div>

		<div class="model-toggle">
			<button class="toggle-btn active" id="toggle-mlp">MLP</button>
			<button class="toggle-btn" id="toggle-ae">Autoencoder</button>
			<button class="toggle-btn" id="toggle-vae">VAE</button>
		</div>

		<div class="eq-section" id="eq-section">
			<button class="eq-toggle" id="eq-toggle"><span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Model equations</button>
			<div class="eq-block" id="eq-block"></div>
		</div>

		<!-- Options checkboxes -->
		<div class="checks-row">
			<div class="check-item">
				<input type="checkbox" id="cb-residual">
				<div class="cb-info-wrap">
					<label for="cb-residual">Residual connections</label>
					<span class="cb-info-icon" id="residual-info-icon" data-tip="residual-cb-tooltip">?</span>
					<span class="cb-tooltip" id="residual-cb-tooltip">Adds a skip connection: H<sup>(l+1)</sup> = &#963;(WH<sup>(l)</sup>) + H<sup>(l)</sup>. Eases gradient flow in deep networks and allows the layer to learn residuals rather than full transformations.</span>
				</div>
			</div>
			<div class="check-item">
				<input type="checkbox" id="cb-batchnorm">
				<div class="cb-info-wrap">
					<label for="cb-batchnorm">Batch normalisation</label>
					<span class="cb-info-icon" id="batchnorm-info-icon" data-tip="batchnorm-cb-tooltip">?</span>
					<span class="cb-tooltip" id="batchnorm-cb-tooltip">Normalises each layer&#39;s pre-activation by batch mean and variance, then rescales with learned &#947; and &#946;. Stabilises training and reduces sensitivity to weight initialisation.</span>
				</div>
			</div>
			<div class="check-item" id="mdn-check-item">
				<input type="checkbox" id="cb-mdn">
				<div class="cb-info-wrap">
					<label for="cb-mdn">MDN output</label>
					<span class="cb-info-icon" id="mdn-info-icon" data-tip="mdn-cb-tooltip">?</span>
					<span class="cb-tooltip" id="mdn-cb-tooltip">Mixture Density Network: replaces the scalar output head with K Gaussian components (&#960;, &#956;, &#963;). Enables probabilistic, multi-modal predictions.</span>
				</div>
			</div>
		</div>

		<!-- Data fields -->
		<div class="form-row">
			<div class="form-group">
				<label class="form-label">Input data</label>
				<textarea id="xvar" class="form-input" placeholder="X" rows="1"></textarea>
			</div>
			<div class="form-group mlp-row" id="yvar-group">
				<label class="form-label">Target variable</label>
				<textarea id="yvar" class="form-input" placeholder="y" rows="1"></textarea>
			</div>
		</div>

		<!-- Shared params: input_size, hidden_size, num_layers -->
		<div class="form-row">
			<div class="form-group">
				<label class="form-label form-label-with-tooltip">input_size
					<span class="tooltip-icon" id="tooltip-input-size">?</span>
					<span class="tooltip-text" id="tooltip-text-input-size"></span>
				</label>
				<textarea id="input-size" class="form-input" placeholder="10" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">hidden_size
					<span class="tooltip-icon" id="tooltip-hidden-size">?</span>
					<span class="tooltip-text" id="tooltip-text-hidden-size"></span>
				</label>
				<textarea id="hidden-size" class="form-input" placeholder="128" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">num_layers
					<span class="tooltip-icon" id="tooltip-num-layers">?</span>
					<span class="tooltip-text" id="tooltip-text-num-layers"></span>
				</label>
				<textarea id="num-layers" class="form-input" placeholder="3" rows="1"></textarea>
			</div>
		</div>

		<!-- MLP-only: output_size -->
		<div class="form-row mlp-row" id="output-size-row">
			<div class="form-group">
				<label class="form-label form-label-with-tooltip">output_size
					<span class="tooltip-icon" id="tooltip-output-size">?</span>
					<span class="tooltip-text" id="tooltip-text-output-size"></span>
				</label>
				<textarea id="output-size" class="form-input" placeholder="1" rows="1"></textarea>
			</div>
		</div>

		<!-- AE/VAE-only: latent_dim -->
		<div class="form-row ae-vae-row" id="latent-dim-row">
			<div class="form-group">
				<label class="form-label form-label-with-tooltip">latent_dim
					<span class="tooltip-icon" id="tooltip-latent-dim">?</span>
					<span class="tooltip-text" id="tooltip-text-latent-dim"></span>
				</label>
				<textarea id="latent-dim" class="form-input" placeholder="16" rows="1"></textarea>
			</div>
		</div>

		<!-- Shared: activation and dropout -->
		<div class="form-row">
			<div class="form-group">
				<label class="form-label">activation</label>
				<select id="activation" class="form-input">
					<option value="relu">relu</option>
					<option value="gelu">gelu</option>
					<option value="tanh">tanh</option>
					<option value="selu">selu</option>
					<option value="leakyrelu">leakyrelu</option>
				</select>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">dropout
					<span class="tooltip-icon" id="tooltip-dropout">?</span>
					<span class="tooltip-text" id="tooltip-text-dropout"></span>
				</label>
				<textarea id="dropout" class="form-input" placeholder="0.0" rows="1"></textarea>
			</div>
		</div>

		<!-- MDN-only: num_components -->
		<div class="form-row mdn-row" id="num-components-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">num_components
					<span class="tooltip-icon" id="tooltip-num-components">?</span>
					<span class="tooltip-text" id="tooltip-text-num-components"></span>
				</label>
				<textarea id="num-components" class="form-input" placeholder="5" rows="1"></textarea>
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
		const codePreview = document.getElementById('code-preview');
		let modelType = 'mlp';
		let activeBtn = null;

		function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)  { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function ty(s)  { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function fn(s)  { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function line(s) { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, comment) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(comment) + '</span></div>'; }
		function blank() { return '<div class="code-blank"></div>'; }
		function val(id, fallback) { const el = document.getElementById(id); return esc((el && el.value.trim()) || fallback); }
		function act() { return document.getElementById('activation').value || 'relu'; }

		function updateCodePreview() {
			const inSz      = val('input-size',  '10');
			const hidSz     = val('hidden-size', '128');
			const nLayers   = Math.max(1, parseInt(val('num-layers', '3')) || 3);
			const dropout   = parseFloat(val('dropout', '0')) || 0;
			const activation = act();
			const X         = val('xvar', 'X');
			const Y         = val('yvar', 'y');
			const useResidual  = document.getElementById('cb-residual').checked;
			const useBatchNorm = document.getElementById('cb-batchnorm').checked;
			const useMdn       = document.getElementById('cb-mdn').checked;
			const nComp        = val('num-components', '5');
			const latDim       = val('latent-dim', '16');
			const outSz        = val('output-size', '1');
			const hasDrop      = dropout > 0;

			let code = '';
			code += line(kw('using') + ' ' + ty('Flux'));
			code += blank();

			if (modelType === 'mlp') {
				const isMdn = useMdn;
				code += cline('input_size  = ' + inSz,    'input dimensionality');
				code += cline('hidden_size = ' + hidSz,   'neurons per hidden layer');
				code += cline('num_layers  = ' + nLayers, 'number of hidden layers');
				if (!isMdn) {
					code += cline('output_size = ' + outSz, 'output dimensionality');
				} else {
					code += cline('num_components = ' + nComp, 'Gaussian mixture components');
				}
				if (hasDrop) { code += cline('dropout     = ' + dropout, 'dropout probability'); }
				code += blank();

				if (useResidual) {
					code += cline(kw('struct') + ' ' + ty('ResBlock'), 'skip-connection block');
					code += line('    net::' + ty('Chain'));
					code += line(kw('end'));
					code += line(ty('Flux') + '.@functor ' + ty('ResBlock'));
					code += line(kw('function') + ' (b::' + ty('ResBlock') + ')(x)');
					code += cline('    b.net(x) .+ x', 'element-wise residual');
					code += line(kw('end'));
					code += blank();
					code += line(kw('function') + ' ' + fn('make_block') + '(in_sz, out_sz)');
					const innerLayers = [];
					if (useBatchNorm) { innerLayers.push('        ' + ty('BatchNorm') + '(in_sz)'); }
					innerLayers.push('        ' + ty('Dense') + '(in_sz => out_sz, ' + activation + ')');
					if (hasDrop) { innerLayers.push('        ' + ty('Dropout') + '(' + dropout + ')'); }
					code += line('    ' + ty('ResBlock') + '(' + ty('Chain') + '(');
					code += line(innerLayers.join(',\\n'));
					code += line('    ))');
					code += line(kw('end'));
					code += blank();
					const blocks = [];
					blocks.push('    ' + fn('make_block') + '(input_size, hidden_size)');
					for (let i = 1; i < nLayers; i++) {
						blocks.push('    ' + fn('make_block') + '(hidden_size, hidden_size)');
					}
					if (isMdn) {
						code += cline('backbone = ' + ty('Chain') + '(', 'shared feature extractor');
						code += line(blocks.join(',\\n') + ',');
						code += line(')');
						code += blank();
						code += cline('# MDN head: 3K outputs (&#960;, &#956;, &#963;) per mixture component', '');
						code += line('pi_head    = ' + ty('Dense') + '(hidden_size => num_components)');
						code += line('mu_head    = ' + ty('Dense') + '(hidden_size => num_components)');
						code += line('sigma_head = ' + ty('Dense') + '(hidden_size => num_components)');
						code += blank();
						code += line(kw('function') + ' ' + fn('mdn_forward') + '(x)');
						code += line('    h = backbone(x)');
						code += line('    &#960; = ' + ty('Flux') + '.softmax(pi_head(h))');
						code += line('    &#956; = mu_head(h)');
						code += line('    &#963; = ' + ty('Flux') + '.softplus(sigma_head(h))');
						code += cline('    &#960;, &#956;, &#963;', 'mixture weights, means, std devs');
						code += line(kw('end'));
					} else {
						code += line('model = ' + ty('Chain') + '(');
						code += line(blocks.join(',\\n') + ',');
						code += cline('    ' + ty('Dense') + '(hidden_size => output_size),', 'output head');
						code += line(')');
					}
				} else {
					const layers = [];
					if (useBatchNorm) {
						layers.push('    ' + cline(ty('BatchNorm') + '(input_size),', 'normalise inputs').replace('<div class="code-line">', '').replace('</div>', ''));
					}
					layers.push('    ' + ty('Dense') + '(input_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ''));
					if (hasDrop) { layers.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
					for (let i = 1; i < nLayers; i++) {
						if (useBatchNorm) { layers.push('    ' + ty('BatchNorm') + '(hidden_size),'); }
						layers.push('    ' + ty('Dense') + '(hidden_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : (i < nLayers - 1 ? ',' : '')));
						if (hasDrop) { layers.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
					}
					if (isMdn) {
						code += cline('backbone = ' + ty('Chain') + '(', 'shared feature extractor');
						code += line(layers.map(l => line(l)).join(''));
						code += line(')');
						code += blank();
						code += cline('# MDN head: 3K outputs (&#960;, &#956;, &#963;) per mixture component', '');
						code += line('pi_head    = ' + ty('Dense') + '(hidden_size => num_components)');
						code += line('mu_head    = ' + ty('Dense') + '(hidden_size => num_components)');
						code += line('sigma_head = ' + ty('Dense') + '(hidden_size => num_components)');
						code += blank();
						code += line(kw('function') + ' ' + fn('mdn_forward') + '(x)');
						code += line('    h = backbone(x)');
						code += line('    &#960; = ' + ty('Flux') + '.softmax(pi_head(h))');
						code += line('    &#956; = mu_head(h)');
						code += line('    &#963; = ' + ty('Flux') + '.softplus(sigma_head(h))');
						code += cline('    &#960;, &#956;, &#963;', 'mixture weights, means, std devs');
						code += line(kw('end'));
					} else {
						layers.push('    ' + ty('Dense') + '(hidden_size => output_size),');
						code += line('model = ' + ty('Chain') + '(');
						layers.forEach(function(l) { code += line(l); });
						code += line(')');
					}
				}
				code += blank();
				if (isMdn) {
					code += cline('# MDN negative log-likelihood loss', '');
					code += line(kw('function') + ' ' + fn('mdn_loss') + '(' + X + ', ' + Y + ')');
					code += line('    &#960;, &#956;, &#963; = ' + fn('mdn_forward') + '(' + X + ')');
					code += cline('    log_p = -0.5 .* ((&#8224;' + Y + ' .- &#956;) ./ &#963;).^2 .- log.(&#963;) .- 0.5 .* log(2&#960;)', 'component log-likelihoods');
					code += cline('    -' + ty('Flux') + '.mean(log(' + ty('Flux') + '.sum(&#960; .* exp.(log_p); dims=1)))', 'mixture log-likelihood');
					code += line(kw('end'));
					code += blank();
					code += line('opt  = ' + ty('Adam') + '(1f-3)');
					code += line('loss = (' + X + ', ' + Y + ') -> ' + fn('mdn_loss') + '(' + X + ', ' + Y + ')');
				} else {
					code += line('opt  = ' + ty('Adam') + '(1f-3)');
					code += line('loss = (' + X + ', ' + Y + ') -> ' + ty('Flux') + '.mse(model(' + X + '), ' + Y + ')');
				}

			} else if (modelType === 'ae') {
				code += cline('input_size  = ' + inSz,    'input dimensionality');
				code += cline('hidden_size = ' + hidSz,   'neurons per encoder/decoder layer');
				code += cline('num_layers  = ' + nLayers, 'depth of each half');
				code += cline('latent_dim  = ' + latDim,  'bottleneck size');
				if (hasDrop) { code += cline('dropout     = ' + dropout, 'dropout probability'); }
				code += blank();
				const encLayers = [];
				if (useBatchNorm) { encLayers.push('    ' + ty('BatchNorm') + '(input_size),'); }
				encLayers.push('    ' + ty('Dense') + '(input_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
				if (hasDrop) { encLayers.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				for (let i = 1; i < nLayers - 1; i++) {
					if (useBatchNorm) { encLayers.push('    ' + ty('BatchNorm') + '(hidden_size),'); }
					encLayers.push('    ' + ty('Dense') + '(hidden_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
					if (hasDrop) { encLayers.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				}
				encLayers.push('    ' + ty('Dense') + '(hidden_size => latent_dim),');
				const decLayers = [];
				decLayers.push('    ' + ty('Dense') + '(latent_dim => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
				if (hasDrop) { decLayers.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				for (let i = 1; i < nLayers - 1; i++) {
					if (useBatchNorm) { decLayers.push('    ' + ty('BatchNorm') + '(hidden_size),'); }
					decLayers.push('    ' + ty('Dense') + '(hidden_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
					if (hasDrop) { decLayers.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				}
				decLayers.push('    ' + ty('Dense') + '(hidden_size => input_size),');
				code += cline('encoder = ' + ty('Chain') + '(', 'compresses input to latent space');
				encLayers.forEach(function(l) { code += line(l); });
				code += line(')');
				code += blank();
				code += cline('decoder = ' + ty('Chain') + '(', 'reconstructs input from latent code');
				decLayers.forEach(function(l) { code += line(l); });
				code += line(')');
				code += blank();
				code += line('model = ' + ty('Chain') + '(encoder, decoder)');
				code += blank();
				code += line('opt  = ' + ty('Adam') + '(1f-3)');
				code += line('loss = (' + X + ', _) -> ' + ty('Flux') + '.mse(model(' + X + '), ' + X + ')');

			} else {
				// VAE
				code += cline('input_size  = ' + inSz,    'input dimensionality');
				code += cline('hidden_size = ' + hidSz,   'neurons per encoder/decoder layer');
				code += cline('num_layers  = ' + nLayers, 'depth of each half');
				code += cline('latent_dim  = ' + latDim,  'latent space dimension');
				if (hasDrop) { code += cline('dropout     = ' + dropout, 'dropout probability'); }
				code += blank();
				const encLayersVae = [];
				if (useBatchNorm) { encLayersVae.push('    ' + ty('BatchNorm') + '(input_size),'); }
				encLayersVae.push('    ' + ty('Dense') + '(input_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
				if (hasDrop) { encLayersVae.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				for (let i = 1; i < nLayers - 1; i++) {
					if (useBatchNorm) { encLayersVae.push('    ' + ty('BatchNorm') + '(hidden_size),'); }
					encLayersVae.push('    ' + ty('Dense') + '(hidden_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
					if (hasDrop) { encLayersVae.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				}
				const decLayersVae = [];
				decLayersVae.push('    ' + ty('Dense') + '(latent_dim => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
				if (hasDrop) { decLayersVae.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				for (let i = 1; i < nLayers - 1; i++) {
					if (useBatchNorm) { decLayersVae.push('    ' + ty('BatchNorm') + '(hidden_size),'); }
					decLayersVae.push('    ' + ty('Dense') + '(hidden_size => hidden_size, ' + activation + ')' + (hasDrop ? ',' : ','));
					if (hasDrop) { decLayersVae.push('    ' + ty('Dropout') + '(' + dropout + '),'); }
				}
				decLayersVae.push('    ' + ty('Dense') + '(hidden_size => input_size),');
				code += cline('enc_shared = ' + ty('Chain') + '(', 'shared encoder trunk');
				encLayersVae.forEach(function(l) { code += line(l); });
				code += line(')');
				code += blank();
				code += cline('mu_head    = ' + ty('Dense') + '(hidden_size => latent_dim)', 'mean of q(z|x)');
				code += cline('logvar_head = ' + ty('Dense') + '(hidden_size => latent_dim)', 'log-variance of q(z|x)');
				code += blank();
				code += cline('decoder = ' + ty('Chain') + '(', 'maps z back to data space');
				decLayersVae.forEach(function(l) { code += line(l); });
				code += line(')');
				code += blank();
				code += line(kw('function') + ' ' + fn('encode') + '(x)');
				code += line('    h = enc_shared(x)');
				code += line('    mu_head(h), logvar_head(h)');
				code += line(kw('end'));
				code += blank();
				code += line(kw('function') + ' ' + fn('reparameterise') + '(&#956;, logvar)');
				code += cline('    &#963; = exp.(0.5 .* logvar)', 'std dev from log-variance');
				code += cline('    &#956; .+ &#963; .* randn(size(&#956;)...)', 'reparameterisation trick');
				code += line(kw('end'));
				code += blank();
				code += line(kw('function') + ' ' + fn('vae_loss') + '(' + X + ')');
				code += line('    &#956;, logvar = ' + fn('encode') + '(' + X + ')');
				code += line('    z = ' + fn('reparameterise') + '(&#956;, logvar)');
				code += line('    x&#770; = decoder(z)');
				code += cline('    recon = ' + ty('Flux') + '.mse(x&#770;, ' + X + ')', 'reconstruction loss');
				code += cline('    kl    = -0.5 .* mean(1 .+ logvar .- &#956;.^2 .- exp.(logvar))', 'KL divergence');
				code += cline('    recon + kl', 'ELBO = reconstruction + KL');
				code += line(kw('end'));
				code += blank();
				code += line('opt  = ' + ty('Adam') + '(1f-3)');
				code += line('loss = ' + X + ' -> ' + fn('vae_loss') + '(' + X + ')');
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
			const useResidual  = document.getElementById('cb-residual').checked;
			const useBatchNorm = document.getElementById('cb-batchnorm').checked;
			const useMdn       = document.getElementById('cb-mdn').checked;
			let html = '';
			if (modelType === 'mlp') {
				if (useResidual) {
					html += eqRow('<i>H</i><sup>(<i>l</i>+1)</sup>', '=', '&#963;(<i>W</i><sup>(<i>l</i>)</sup><i>H</i><sup>(<i>l</i>)</sup> + <i>b</i><sup>(<i>l</i>)</sup>) + <i>H</i><sup>(<i>l</i>)</sup>', 'residual skip connection');
				} else {
					html += eqRow('<i>H</i><sup>(<i>l</i>+1)</sup>', '=', '&#963;(<i>W</i><sup>(<i>l</i>)</sup><i>H</i><sup>(<i>l</i>)</sup> + <i>b</i><sup>(<i>l</i>)</sup>)', 'affine + activation');
				}
				if (useBatchNorm) {
					html += eqRow('<i>H&#770;</i>', '=', '(<i>H</i> &#8722; &#956;<sub>B</sub>) / &#963;<sub>B</sub>', 'batch normalisation');
				}
				if (useMdn) {
					html += eqRow('<i>p</i>(<i>y</i>|<i>x</i>)', '=', '&#x2211;<sub><i>k</i></sub> &#960;<sub><i>k</i></sub>(<i>x</i>) &#183; <i>N</i>(<i>y</i>; &#956;<sub><i>k</i></sub>(<i>x</i>), &#963;<sub><i>k</i></sub>(<i>x</i>)<sup>2</sup>)', 'Gaussian mixture output');
				} else {
					html += eqRow('<i>&#375;</i>', '=', '<i>W</i><sup>(out)</sup><i>H</i><sup>(<i>L</i>)</sup> + <i>b</i><sup>(out)</sup>', 'linear readout');
				}
			} else if (modelType === 'ae') {
				html += eqRow('<i>z</i>', '=', '<i>f</i><sub>enc</sub>(<i>x</i>)', 'encoder: x &#8594; latent code z');
				html += eqRow('<i>x&#770;</i>', '=', '<i>f</i><sub>dec</sub>(<i>z</i>)', 'decoder: z &#8594; reconstruction');
				html += eqRow('&#8466;', '=', '&#8741;<i>x</i> &#8722; <i>x&#770;</i>&#8741;<sup>2</sup>', 'reconstruction MSE loss');
			} else {
				html += eqRow('<i>&#956;</i>, log <i>&#963;</i><sup>2</sup>', '=', '<i>f</i><sub>enc</sub>(<i>x</i>)', 'encoder outputs q(z|x) params');
				html += eqRow('<i>z</i>', '=', '<i>&#956;</i> + <i>&#963;</i> &#8857; <i>&#949;</i>,&nbsp; <i>&#949;</i> &#126; <i>N</i>(0, <i>I</i>)', 'reparameterisation trick');
				html += eqRow('<i>x&#770;</i>', '=', '<i>f</i><sub>dec</sub>(<i>z</i>)', 'decoder reconstruction');
				html += eqRow('ELBO', '=', '&#8741;<i>x</i> &#8722; <i>x&#770;</i>&#8741;<sup>2</sup> &#8722; <i>D</i><sub>KL</sub>(<i>q</i>(<i>z</i>|<i>x</i>) &#8741; <i>p</i>(<i>z</i>))', 'evidence lower bound');
			}
			el.innerHTML = html;
		}

		function setModel(type) {
			modelType = type;
			['mlp', 'ae', 'vae'].forEach(function(m) {
				document.getElementById('toggle-' + m).classList.toggle('active', m === type);
			});
			const isAeVae = type === 'ae' || type === 'vae';
			document.querySelectorAll('.mlp-row').forEach(function(el) { el.style.display = isAeVae ? 'none' : 'flex'; });
			document.querySelectorAll('.ae-vae-row').forEach(function(el) { el.style.display = isAeVae ? 'flex' : 'none'; });

			// MDN only makes sense for MLP
			const mdnItem  = document.getElementById('mdn-check-item');
			const mdnCb    = document.getElementById('cb-mdn');
			const mdnLabel = mdnItem.querySelector('label');
			if (isAeVae) {
				mdnCb.checked  = false;
				mdnCb.disabled = true;
				mdnLabel.classList.add('dimmed');
				document.querySelectorAll('.mdn-row').forEach(function(el) { el.style.display = 'none'; });
			} else {
				mdnCb.disabled = false;
				mdnLabel.classList.remove('dimmed');
			}
			updateEquations();
			updateCodePreview();
		}

		['mlp', 'ae', 'vae'].forEach(function(m) {
			document.getElementById('toggle-' + m).addEventListener('click', function() { setModel(m); });
		});

		['input-size', 'hidden-size', 'num-layers', 'output-size', 'latent-dim', 'dropout', 'num-components', 'xvar', 'yvar'].forEach(function(id) {
			const el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
		});

		document.getElementById('activation').addEventListener('change', updateCodePreview);

		document.getElementById('cb-residual').addEventListener('change', function() {
			updateEquations();
			updateCodePreview();
		});
		document.getElementById('cb-batchnorm').addEventListener('change', function() {
			updateEquations();
			updateCodePreview();
		});
		document.getElementById('cb-mdn').addEventListener('change', function() {
			const isMdn = this.checked;
			document.querySelectorAll('.mdn-row').forEach(function(el) { el.style.display = isMdn ? 'flex' : 'none'; });
			updateEquations();
			updateCodePreview();
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

		// Tooltip pin/unpin
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
		document.querySelectorAll('.cb-info-icon').forEach(function(icon) {
			icon.addEventListener('click', function(e) {
				e.stopPropagation();
				var tip = document.getElementById(this.dataset.tip);
				if (!tip) { return; }
				var wasPinned = tip.classList.contains('pinned');
				tip.classList.toggle('pinned');
				this.classList.toggle('pinned');
				if (wasPinned) {
					tip.style.display = 'none';
					var wrap = this.closest('.cb-info-wrap');
					if (wrap) { wrap.addEventListener('mouseleave', function() { tip.style.display = ''; }, { once: true }); }
				}
			});
		});

		// Learn More buttons with cancel-on-second-click
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
			else { pressBtn(this); vscode.postMessage({ command: 'openDocs', target: 'wiki' }); }
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openNotebookList' }); }
		});
		document.getElementById('btn-documentation').addEventListener('click', function() { vscode.postMessage({ command: 'openDocs', target: 'documentation' }); });
		document.getElementById('btn-paper').addEventListener('click', function() { vscode.postMessage({ command: 'openDocs', target: 'paper' }); });
		document.getElementById('btn-viz').addEventListener('click',      function() { vscode.postMessage({ command: 'openPanel', target: 'visualization' }); });
		document.getElementById('btn-diagnose').addEventListener('click', function() { vscode.postMessage({ command: 'openPanel', target: 'diagnostics' }); });
		document.getElementById('btn-compare').addEventListener('click',  function() { vscode.postMessage({ command: 'openPanel', target: 'alternative-methods' }); });

		window.addEventListener('message', function(event) {
			const msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'tooltips') {
				const tips = msg.tooltips || {};
				const map = {
					'input_size':     'input-size',
					'hidden_size':    'hidden-size',
					'num_layers':     'num-layers',
					'output_size':    'output-size',
					'latent_dim':     'latent-dim',
					'dropout':        'dropout',
					'num_components': 'num-components',
				};
				Object.keys(map).forEach(function(key) {
					if (tips[key]) {
						const el = document.getElementById('tooltip-text-' + map[key]);
						if (el) { el.textContent = tips[key]; }
					}
				});
			}
			if (msg.command === 'packageLinks') {
				const container = document.getElementById('package-links');
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
			if (msg.command === 'paperLinks') {
				const btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
		});

		// Initialise
		updateEquations();
		updateCodePreview();
	</script>
</body>
</html>`;
}
