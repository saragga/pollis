/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getTransformerHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Transformers</title>
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
		.opt-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
		.opt-row input[type="checkbox"] { appearance: none; -webkit-appearance: none; width: 14px; height: 14px; border: 1px solid var(--vscode-input-border); border-radius: 3px; background: var(--vscode-input-background); cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.12s, border-color 0.12s; }
		.opt-row input[type="checkbox"]:checked { background: var(--vscode-textLink-foreground); border-color: var(--vscode-textLink-foreground); }
		.opt-row input[type="checkbox"]:checked::after { content: ''; position: absolute; left: 3px; top: 0px; width: 5px; height: 9px; border: 1.5px solid var(--vscode-editor-background); border-top: none; border-left: none; transform: rotate(45deg); }
		.opt-item { display: flex; align-items: center; gap: 6px; }
		.opt-row label { font-size: 13px; font-weight: 500; color: var(--vscode-foreground); cursor: pointer; user-select: none; }
		.cb-info-wrap { position: relative; display: inline-flex; align-items: center; }
		.cb-info-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: pointer; flex-shrink: 0; transition: background-color 0.12s; user-select: none; }
		.cb-info-wrap:hover .cb-info-icon, .cb-info-icon.pinned { background-color: var(--vscode-terminal-ansiBrightGreen); opacity: 1; }
		.cb-tooltip { position: absolute; bottom: calc(100% + 6px); left: 0; background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.5; white-space: normal; width: 300px; z-index: 1000; display: none; }
		.cb-info-wrap:hover .cb-tooltip, .cb-tooltip.pinned { display: block; }
		.cb-wiki-link { color: var(--vscode-textLink-foreground); cursor: pointer; }
		.cb-wiki-link:hover { text-decoration: underline; }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-row .form-group.narrow { min-width: 80px; }
		.form-row .form-group.wide { min-width: 160px; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: pointer; flex-shrink: 0; transition: background-color 0.12s; }
		.tooltip-icon:hover, .tooltip-icon.pinned { background-color: var(--vscode-terminal-ansiBrightGreen); opacity: 1; }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 320px; z-index: 1000; display: none; margin-bottom: 5px; }
		.form-label:not(.centered) .tooltip-text { left: 0; transform: none; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		select.form-input { font-family: var(--vscode-font-family); font-size: 13px; height: 37px; }
		#num-layers, #dropout { text-align: center; }
		#num-heads, #seq-len, #tgt-len, #pred-len, #patch-size, #vocab-size, #d-num { text-align: center; }
		.tgt-row        { display: none; }
		.ts-row         { display: none; }
		.cm-row         { display: none; }
		.non-ts-cm-row  { display: flex; }
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
		.eq-lhs { min-width: 220px; text-align: right; white-space: nowrap; }
		.eq-op  { min-width: 18px; text-align: center; white-space: nowrap; }
		.eq-body { flex: 1; white-space: nowrap; }
		.eq-comment { flex-shrink: 0; padding-left: 24px; color: #6A9955; font-style: italic; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; white-space: nowrap; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Transformers</h1>
			<div class="powered-by" id="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Encoder &#8212; BERT-style bidirectional encoder; classification and sequence labelling</li>
					<li>Decoder &#8212; GPT-style causal decoder; autoregressive language modelling</li>
					<li>Encoder-Decoder &#8212; full seq2seq architecture with cross-attention; translation and summarisation</li>
					<li>Time Series &#8212; PatchTST; patch tokenisation of time series for multivariate forecasting</li>
					<li>Cross-Modal &#8212; text and numerical feature fusion; financial earnings and sentiment models</li>
				</ul>
			</div>
		</div>

		<div class="model-toggle">
			<button class="toggle-btn active" id="toggle-encoder">Encoder</button>
			<button class="toggle-btn" id="toggle-decoder">Decoder</button>
			<button class="toggle-btn" id="toggle-encdec">Encoder-Decoder</button>
			<button class="toggle-btn" id="toggle-timeseries">Time Series</button>
			<button class="toggle-btn" id="toggle-crossmodal">Cross-Modal</button>
		</div>

		<div class="eq-section" id="eq-section">
			<button class="eq-toggle" id="eq-toggle"><span class="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Model equations</button>
			<div class="eq-block" id="eq-block"></div>
		</div>

		<!-- Options: Efficient Attention + Positional Encoding -->
		<div class="opt-row">
			<div class="opt-item">
				<input type="checkbox" id="efficient-attn">
				<label for="efficient-attn">Efficient Attention</label>
				<div class="cb-info-wrap">
					<span class="cb-info-icon" data-tip="tip-efficient-attn">?</span>
					<div class="cb-tooltip" id="tip-efficient-attn">Reduces attention memory from O(N&sup2;) to O(N). Use when seq_len &gt; 512 or GPU memory is tight. FlashAttention gives the exact same result with no approximation. <span class="cb-wiki-link" data-wiki="transformer/efficient-attention.md">Open wiki &#8594;</span></div>
				</div>
			</div>
			<div class="opt-item">
				<input type="checkbox" id="learned-pe">
				<label for="learned-pe">Learned Positional Encoding</label>
				<div class="cb-info-wrap">
					<span class="cb-info-icon" data-tip="tip-learned-pe">?</span>
					<div class="cb-tooltip" id="tip-learned-pe">Replaces fixed sinusoidal vectors with a trained Embedding table. Best when seq_len is fixed and training data is plentiful. Does not generalise beyond the training length at inference time. <span class="cb-wiki-link" data-wiki="transformer/positional-encoding.md">Open wiki &#8594;</span></div>
				</div>
			</div>
		</div>

		<!-- Common parameters: d_model, num_heads, d_ff -->
		<div class="form-row">
			<div class="form-group">
				<label class="form-label form-label-with-tooltip">d_model
					<span class="tooltip-icon" id="tooltip-d-model">?</span>
					<span class="tooltip-text" id="tooltip-text-d-model"></span>
				</label>
				<textarea id="d-model" class="form-input" placeholder="256" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label form-label-with-tooltip">d_ff
					<span class="tooltip-icon" id="tooltip-d-ff">?</span>
					<span class="tooltip-text" id="tooltip-text-d-ff"></span>
				</label>
				<textarea id="d-ff" class="form-input" placeholder="512" rows="1"></textarea>
			</div>
		</div>

		<!-- num_layers, num_heads, dropout -->
		<div class="form-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">num_heads
					<span class="tooltip-icon" id="tooltip-num-heads">?</span>
					<span class="tooltip-text" id="tooltip-text-num-heads"></span>
				</label>
				<textarea id="num-heads" class="form-input" placeholder="8" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">num_layers
					<span class="tooltip-icon" id="tooltip-num-layers">?</span>
					<span class="tooltip-text" id="tooltip-text-num-layers"></span>
				</label>
				<textarea id="num-layers" class="form-input" placeholder="4" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">dropout
					<span class="tooltip-icon" id="tooltip-dropout">?</span>
					<span class="tooltip-text" id="tooltip-text-dropout"></span>
				</label>
				<textarea id="dropout" class="form-input" placeholder="0.1" rows="1"></textarea>
			</div>
		</div>

		<!-- seq_len + vocab_size: encoder / decoder / encdec only -->
		<div class="form-row non-ts-cm-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">seq_len
					<span class="tooltip-icon" id="tooltip-seq-len">?</span>
					<span class="tooltip-text" id="tooltip-text-seq-len"></span>
				</label>
				<textarea id="seq-len" class="form-input" placeholder="128" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">vocab_size
					<span class="tooltip-icon" id="tooltip-vocab-size">?</span>
					<span class="tooltip-text" id="tooltip-text-vocab-size"></span>
				</label>
				<textarea id="vocab-size" class="form-input" placeholder="10000" rows="1"></textarea>
			</div>
		</div>

		<!-- tgt_len: decoder + encdec only -->
		<div class="form-row tgt-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">tgt_len
					<span class="tooltip-icon" id="tooltip-tgt-len">?</span>
					<span class="tooltip-text" id="tooltip-text-tgt-len"></span>
				</label>
				<textarea id="tgt-len" class="form-input" placeholder="64" rows="1"></textarea>
			</div>
		</div>

		<!-- ts-row: time series (PatchTST) only -->
		<div class="form-row ts-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">seq_len
					<span class="tooltip-icon" id="tooltip-ts-seq-len">?</span>
					<span class="tooltip-text" id="tooltip-text-ts-seq-len"></span>
				</label>
				<textarea id="ts-seq-len" class="form-input" placeholder="336" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">pred_len
					<span class="tooltip-icon" id="tooltip-pred-len">?</span>
					<span class="tooltip-text" id="tooltip-text-pred-len"></span>
				</label>
				<textarea id="pred-len" class="form-input" placeholder="96" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">patch_size
					<span class="tooltip-icon" id="tooltip-patch-size">?</span>
					<span class="tooltip-text" id="tooltip-text-patch-size"></span>
				</label>
				<textarea id="patch-size" class="form-input" placeholder="16" rows="1"></textarea>
			</div>
		</div>

		<!-- cm-row: cross-modal only -->
		<div class="form-row cm-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">seq_len
					<span class="tooltip-icon" id="tooltip-cm-seq-len">?</span>
					<span class="tooltip-text" id="tooltip-text-cm-seq-len"></span>
				</label>
				<textarea id="cm-seq-len" class="form-input" placeholder="128" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">vocab_size
					<span class="tooltip-icon" id="tooltip-cm-vocab-size">?</span>
					<span class="tooltip-text" id="tooltip-text-cm-vocab-size"></span>
				</label>
				<textarea id="cm-vocab-size" class="form-input" placeholder="10000" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">d_num
					<span class="tooltip-icon" id="tooltip-d-num">?</span>
					<span class="tooltip-text" id="tooltip-text-d-num"></span>
				</label>
				<textarea id="d-num" class="form-input" placeholder="32" rows="1"></textarea>
			</div>
		</div>

		<!-- Data variable names -->
		<div class="form-row">
			<div class="form-group">
				<label class="form-label">Input variable</label>
				<textarea id="xvar" class="form-input" placeholder="x" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label">Target variable</label>
				<textarea id="yvar" class="form-input" placeholder="y" rows="1"></textarea>
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
		let tfModel = 'encoder';

		function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
		function kw(s)  { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)  { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)  { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s) { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + (c ? '<span class="code-comment">  # ' + esc(c) + '</span>' : '') + '</div>'; }
		function blank() { return '<div class="code-blank"></div>'; }
		function val(id, fb) { const el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }
		function numVal(id, fb) { const el = document.getElementById(id); return Math.max(1, parseInt((el && el.value.trim()) || fb) || fb); }

		// ── Shared helpers ────────────────────────────────────────────────────────
		function peExpr(d, isLearned, seqId, seqFb) {
			if (isLearned) {
				const sl = val(seqId, seqFb);
				return ty('Embedding') + '(' + sl + ' => ' + d + ')';
			}
			return ty('SinusoidalPositionEmbedding') + '(' + d + ')';
		}

		// Build a pre-LN encoder block call (as code lines)
		function encoderBlockLines(indent, d, h, ff, drop, isEfficient) {
			const attnCall = isEfficient
				? ty('MultiHeadAttention') + '(' + d + '; nheads=' + h + ', attn_dropout_prob=' + esc(String(drop.toFixed(1))) + ')  ' + '<span class="code-comment"># linear / flash attention</span>'
				: ty('MultiHeadAttention') + '(' + d + '; nheads=' + h + ')';
			let code = '';
			code += line(indent + ty('SkipConnection') + '(');
			code += cline(indent + '    ' + ty('Chain') + '(' + ty('LayerNorm') + '(' + d + '), ' + attnCall + ', ' + kw('x') + ' -> ' + kw('x') + '[1], ' + ty('Dropout') + '(' + esc(String(drop.toFixed(1))) + ')), +)', 'self-attention + residual');
			code += line(indent + ty('SkipConnection') + '(');
			code += cline(indent + '    ' + ty('Chain') + '(' + ty('LayerNorm') + '(' + d + '), ' + ty('Dense') + '(' + d + ' => ' + ff + ', gelu), ' + ty('Dense') + '(' + ff + ' => ' + d + '), ' + ty('Dropout') + '(' + esc(String(drop.toFixed(1))) + ')), +)', 'FFN + residual');
			return code;
		}

		// ── Encoder (BERT-style) ─────────────────────────────────────────────────
		function genEncoder(d, h, ff, nL, drop, sl, vs, outCh, xv, yv, isEfficient, isLearned) {
			let code = '';
			code += line(kw('using') + ' ' + ty('Flux') + ', ' + ty('Transformers') + ', ' + ty('Transformers') + '.' + ty('Layers'));
			code += blank();
			code += cline('d_model    = ' + d,    'embedding dimension');
			code += cline('num_heads  = ' + h,    'attention heads');
			code += cline('d_ff       = ' + ff,   'feed-forward dimension');
			code += cline('num_layers = ' + nL,   'encoder layers');
			code += cline('seq_len    = ' + sl,   'max token sequence length');
			code += cline('vocab_size = ' + vs,   'vocabulary size');
			code += blank();
			code += cline('pe = ' + peExpr(d, isLearned, 'seq-len', '128'), isLearned ? 'learned position embedding' : 'sinusoidal position encoding');
			code += blank();
			code += cline(kw('function') + ' ' + fn('encoder_block') + '(d, h, ff)', 'pre-LN Transformer encoder block');
			code += encoderBlockLines('    ', d, h, ff, drop, isEfficient);
			code += line(kw('end'));
			code += blank();
			code += cline('model = ' + ty('Chain') + '(', 'encoder-only model (BERT-style)');
			code += cline('    ' + ty('Embedding') + '(vocab_size => d_model),', 'token embedding');
			code += cline('    ' + kw('x') + ' -> ' + kw('x') + ' .+ pe(' + kw('x') + '),', 'add positional encoding');
			code += cline('    [encoder_block(d_model, num_heads, d_ff) ' + kw('for') + ' _ ' + kw('in') + ' 1:num_layers]...,', 'L encoder blocks');
			code += cline('    ' + ty('LayerNorm') + '(d_model),', 'final layer norm');
			code += cline('    ' + kw('x') + ' -> ' + kw('x') + '[:, 1, :],', '[CLS] token → (d_model, batch)');
			code += line('    ' + ty('Dense') + '(d_model => ' + outCh + ')');
			code += line(')');
			code += blank();
			code += cline('loss = (' + xv + ', ' + yv + ') -> ' + ty('Flux') + '.' + fn('logitcrossentropy') + '(model(' + xv + '), ' + yv + ')', 'classification loss');
			code += line('opt  = ' + ty('Flux') + '.' + fn('setup') + '(' + ty('Adam') + '(1f-4), model)');
			code += line(ty('Flux') + '.' + fn('train!') + '(loss, model, [(' + xv + ', ' + yv + ')], opt)');
			return code;
		}

		// ── Decoder (GPT-style) ──────────────────────────────────────────────────
		function genDecoder(d, h, ff, nL, drop, sl, tl, vs, outCh, xv, yv, isEfficient, isLearned) {
			let code = '';
			code += line(kw('using') + ' ' + ty('Flux') + ', ' + ty('Transformers') + ', ' + ty('Transformers') + '.' + ty('Layers'));
			code += blank();
			code += cline('d_model    = ' + d,   'embedding dimension');
			code += cline('num_heads  = ' + h,   'attention heads');
			code += cline('d_ff       = ' + ff,  'feed-forward dimension');
			code += cline('num_layers = ' + nL,  'decoder layers');
			code += cline('seq_len    = ' + sl,  'context window length');
			code += cline('vocab_size = ' + vs,  'vocabulary size');
			code += blank();
			code += cline('causal_mask = ' + fn('make_causal_mask') + '(' + ty('ones') + '(' + ty('Float32') + ', seq_len, seq_len))', 'upper-triangular mask for causal attention');
			code += cline('pe = ' + peExpr(d, isLearned, 'seq-len', '512'), isLearned ? 'learned position embedding' : 'sinusoidal position encoding');
			code += blank();
			code += cline(kw('function') + ' ' + fn('decoder_block') + '(d, h, ff)', 'pre-LN causal decoder block');
			const attnCall = isEfficient
				? ty('MultiHeadAttention') + '(' + d + '; nheads=' + h + ')  <span class="code-comment"># linear / flash attention</span>'
				: ty('MultiHeadAttention') + '(' + d + '; nheads=' + h + ')';
			code += line('    attn = ' + attnCall);
			code += line('    ' + ty('SkipConnection') + '(');
			code += cline('        ' + ty('Chain') + '(' + ty('LayerNorm') + '(d), ' + kw('x') + ' -> attn(' + kw('x') + '; mask=causal_mask)[1], ' + ty('Dropout') + '(' + esc(String(drop.toFixed(1))) + ')), +)', 'masked self-attention + residual');
			code += line('    ' + ty('SkipConnection') + '(');
			code += cline('        ' + ty('Chain') + '(' + ty('LayerNorm') + '(d), ' + ty('Dense') + '(d => ff, gelu), ' + ty('Dense') + '(ff => d), ' + ty('Dropout') + '(' + esc(String(drop.toFixed(1))) + ')), +)', 'FFN + residual');
			code += line(kw('end'));
			code += blank();
			code += cline('model = ' + ty('Chain') + '(', 'decoder-only model (GPT-style)');
			code += cline('    ' + ty('Embedding') + '(vocab_size => d_model),', 'token embedding');
			code += cline('    ' + kw('x') + ' -> ' + kw('x') + ' .+ pe(' + kw('x') + '),', 'add positional encoding');
			code += cline('    [decoder_block(d_model, num_heads, d_ff) ' + kw('for') + ' _ ' + kw('in') + ' 1:num_layers]...,', 'L causal decoder blocks');
			code += line('    ' + ty('LayerNorm') + '(d_model),');
			code += cline('    ' + ty('Dense') + '(d_model => vocab_size)', 'logits over vocabulary');
			code += line(')');
			code += blank();
			code += cline('loss = (' + xv + ', ' + yv + ') -> ' + ty('Flux') + '.' + fn('logitcrossentropy') + '(model(' + xv + '), ' + yv + ')', 'next-token prediction');
			code += line('opt  = ' + ty('Flux') + '.' + fn('setup') + '(' + ty('Adam') + '(1f-4), model)');
			code += line(ty('Flux') + '.' + fn('train!') + '(loss, model, [(' + xv + ', ' + yv + ')], opt)');
			return code;
		}

		// ── Encoder-Decoder (seq2seq) ────────────────────────────────────────────
		function genEncDec(d, h, ff, nL, drop, sl, tl, vs, outCh, xv, yv, isEfficient, isLearned) {
			let code = '';
			code += line(kw('using') + ' ' + ty('Flux') + ', ' + ty('Transformers') + ', ' + ty('Transformers') + '.' + ty('Layers'));
			code += blank();
			code += cline('d_model    = ' + d,   'embedding dimension');
			code += cline('num_heads  = ' + h,   'attention heads');
			code += cline('d_ff       = ' + ff,  'feed-forward dimension');
			code += cline('num_layers = ' + nL,  'encoder and decoder layers each');
			code += cline('seq_len    = ' + sl,  'source sequence length');
			code += cline('tgt_len    = ' + tl,  'target sequence length');
			code += cline('vocab_size = ' + vs,  'shared vocabulary size');
			code += blank();
			code += cline('pe = ' + peExpr(d, isLearned, 'seq-len', '128'), isLearned ? 'learned position embedding' : 'sinusoidal position encoding');
			code += blank();
			const attnArgs = isEfficient ? 'd_model; nheads=num_heads  <span class="code-comment"># linear / flash</span>' : 'd_model; nheads=num_heads';
			code += cline(kw('function') + ' ' + fn('encoder_block') + '(d, h, ff)', 'pre-LN encoder block');
			code += encoderBlockLines('    ', d, h, ff, drop, isEfficient);
			code += line(kw('end'));
			code += blank();
			code += cline(kw('struct') + ' ' + ty('DecoderBlock'), 'decoder block with cross-attention');
			code += line('    self_attn::' + ty('MultiHeadAttention'));
			code += line('    cross_attn::' + ty('MultiHeadAttention'));
			code += line('    ff::' + ty('Chain'));
			code += line('    ln1::' + ty('LayerNorm') + '; ln2::' + ty('LayerNorm') + '; ln3::' + ty('LayerNorm'));
			code += line('    drop::' + ty('Dropout'));
			code += line(kw('end'));
			code += blank();
			code += cline(kw('function') + ' (b::' + ty('DecoderBlock') + ')(tgt, memory)', 'tgt: target tokens; memory: encoder output');
			code += cline('    x = tgt + b.drop(b.self_attn(b.ln1(tgt))[1])', 'masked self-attention');
			code += cline('    x = x   + b.drop(b.cross_attn(b.ln2(x), memory, memory)[1])', 'cross-attention over encoder memory');
			code += cline('    x + b.drop(b.ff(b.ln3(x)))', 'FFN');
			code += line(kw('end'));
			code += blank();
			code += line('embed = ' + ty('Embedding') + '(vocab_size => d_model)');
			code += cline('encoder = ' + ty('Chain') + '(embed, ' + kw('x') + ' -> ' + kw('x') + ' .+ pe(' + kw('x') + '), [encoder_block(d_model, num_heads, d_ff) ' + kw('for') + ' _ ' + kw('in') + ' 1:num_layers]..., ' + ty('LayerNorm') + '(d_model))', 'encode source');
			code += blank();
			code += cline('memory = encoder(' + xv + ')', 'encoder output: (d_model, seq_len, batch)');
			code += cline(kw('function') + ' ' + fn('decode') + '(tgt, memory)', 'decode one step');
			code += line('    tgt = embed(tgt) .+ pe(tgt)');
			code += line('    ' + ty('foldl') + '((t, b) -> b(t, memory), decoder_blocks; init=tgt)');
			code += line(kw('end'));
			code += line('output = ' + ty('Dense') + '(d_model => vocab_size)(' + fn('decode') + '(' + yv + ', memory))');
			code += blank();
			code += cline('loss = (' + xv + ', ' + yv + ') -> ' + ty('Flux') + '.' + fn('logitcrossentropy') + '(output, ' + yv + ')', 'token-level cross-entropy');
			return code;
		}

		// ── Time Series — PatchTST ────────────────────────────────────────────────
		function genTimeSeries(d, h, ff, nL, drop, seqL, predL, patchSz, outCh, xv, yv, isEfficient, isLearned) {
			let code = '';
			const numPatches = 'seq_len &#247; patch_size';
			code += line(kw('using') + ' ' + ty('Flux') + ', ' + ty('Transformers') + ', ' + ty('Transformers') + '.' + ty('Layers'));
			code += blank();
			code += cline('d_model    = ' + d,        'patch embedding dimension');
			code += cline('num_heads  = ' + h,        'attention heads');
			code += cline('d_ff       = ' + ff,       'feed-forward dimension');
			code += cline('num_layers = ' + nL,       'encoder layers');
			code += cline('seq_len    = ' + seqL,     'lookback window (time steps)');
			code += cline('pred_len   = ' + predL,    'forecast horizon (time steps)');
			code += cline('patch_size = ' + patchSz,  'steps per patch token');
			code += cline('num_patches = seq_len &#247; patch_size', 'number of patch tokens');
			code += blank();
			code += cline('# PatchTST: partition the series into non-overlapping patches, embed each', '');
			code += cline('patch_embed = ' + ty('Dense') + '(patch_size => d_model)', 'linear patch projection');
			code += cline('pe = ' + peExpr(d, isLearned, 'ts-seq-len', '336'), isLearned ? 'learned position embedding' : 'sinusoidal position encoding');
			code += blank();
			code += cline(kw('function') + ' ' + fn('ts_block') + '(d, h, ff)', 'pre-LN Transformer block for patches');
			code += encoderBlockLines('    ', d, h, ff, drop, isEfficient);
			code += line(kw('end'));
			code += blank();
			code += cline('model = ' + ty('Chain') + '(', 'PatchTST model');
			code += cline('    patch_embed,', 'embed each patch: (patch_size, N, B) → (d_model, N, B)');
			code += cline('    ' + kw('x') + ' -> ' + kw('x') + ' .+ pe(' + kw('x') + '),', 'patch positional encoding');
			code += cline('    [ts_block(d_model, num_heads, d_ff) ' + kw('for') + ' _ ' + kw('in') + ' 1:num_layers]...,', 'L encoder blocks');
			code += cline('    ' + ty('LayerNorm') + '(d_model),', 'final norm');
			code += cline('    ' + kw('x') + ' -> ' + fn('reshape') + '(' + kw('x') + ', :, ' + fn('size') + '(' + kw('x') + ', 3)),', 'flatten patches: (d_model × num_patches, batch)');
			code += cline('    ' + ty('Dense') + '(d_model * num_patches => pred_len)', 'linear head → forecast');
			code += line(')');
			code += blank();
			code += cline(kw('function') + ' ' + fn('patchify') + '(' + xv + ', patch_size)', 'split (seq_len, batch) → (patch_size, num_patches, batch)');
			code += line('    ' + fn('stack') + '([' + xv + '[i:i+patch_size-1, :] ' + kw('for') + ' i ' + kw('in') + ' 1:patch_size:seq_len])');
			code += line(kw('end'));
			code += blank();
			code += cline('loss = (' + xv + ', ' + yv + ') -> ' + ty('Flux') + '.' + fn('mse') + '(model(' + fn('patchify') + '(' + xv + ', patch_size)), ' + yv + ')', 'MSE on forecast');
			code += line('opt  = ' + ty('Flux') + '.' + fn('setup') + '(' + ty('Adam') + '(1f-4), model)');
			code += line(ty('Flux') + '.' + fn('train!') + '(loss, model, [(' + xv + ', ' + yv + ')], opt)');
			return code;
		}

		// ── Cross-Modal (text + numerical) ────────────────────────────────────────
		function genCrossModal(d, h, ff, nL, drop, sl, vs, dNum, outCh, xv, yv, isEfficient, isLearned) {
			let code = '';
			code += line(kw('using') + ' ' + ty('Flux') + ', ' + ty('Transformers') + ', ' + ty('Transformers') + '.' + ty('Layers'));
			code += blank();
			code += cline('d_model    = ' + d,    'embedding dimension');
			code += cline('num_heads  = ' + h,    'attention heads');
			code += cline('d_ff       = ' + ff,   'feed-forward dimension');
			code += cline('num_layers = ' + nL,   'encoder layers');
			code += cline('seq_len    = ' + sl,   'text sequence length');
			code += cline('vocab_size = ' + vs,   'vocabulary size');
			code += cline('d_num      = ' + dNum, 'number of numerical features');
			code += blank();
			code += cline('pe = ' + peExpr(d, isLearned, 'cm-seq-len', '128'), isLearned ? 'learned position embedding' : 'sinusoidal position encoding');
			code += blank();
			code += cline(kw('function') + ' ' + fn('encoder_block') + '(d, h, ff)', 'pre-LN encoder block');
			code += encoderBlockLines('    ', d, h, ff, drop, isEfficient);
			code += line(kw('end'));
			code += blank();
			code += cline('text_encoder = ' + ty('Chain') + '(', 'text branch: tokens → CLS embedding');
			code += cline('    ' + ty('Embedding') + '(vocab_size => d_model),', 'token embedding');
			code += cline('    ' + kw('x') + ' -> ' + kw('x') + ' .+ pe(' + kw('x') + '),', 'positional encoding');
			code += cline('    [encoder_block(d_model, num_heads, d_ff) ' + kw('for') + ' _ ' + kw('in') + ' 1:num_layers]...,', 'L encoder blocks');
			code += line('    ' + ty('LayerNorm') + '(d_model),');
			code += cline('    ' + kw('x') + ' -> ' + kw('x') + '[:, 1, :]', '[CLS] pooling → (d_model, batch)');
			code += line(')');
			code += blank();
			code += cline('num_proj = ' + ty('Dense') + '(d_num => d_model)', 'numerical branch: project to d_model');
			code += blank();
			code += cline(kw('function') + ' ' + fn('forward') + '(x_text, x_num)', 'fuse text and numerical representations');
			code += cline('    text_feat = text_encoder(x_text)', '(d_model, batch)');
			code += cline('    num_feat  = num_proj(x_num)', '(d_model, batch)');
			code += cline('    fused     = text_feat + num_feat', 'element-wise residual fusion');
			code += line('    ' + ty('Dense') + '(d_model => ' + outCh + ')(fused)');
			code += line(kw('end'));
			code += blank();
			code += cline('loss = ((x_text, x_num), ' + yv + ') -> ' + ty('Flux') + '.' + fn('mse') + '(' + fn('forward') + '(x_text, x_num), ' + yv + ')', 'regression loss');
			code += line('opt  = ' + ty('Flux') + '.' + fn('setup') + '(' + ty('Adam') + '(1f-4), (text_encoder, num_proj))');
			code += line(ty('Flux') + '.' + fn('train!') + '(loss, (text_encoder, num_proj), [((x_text, x_num), ' + yv + ')], opt)');
			return code;
		}

		// ── Main update ─────────────────────────────────────────────────────────
		function updateCodePreview() {
			const m          = tfModel;
			const isEfficient = document.getElementById('efficient-attn').checked;
			const isLearned  = document.getElementById('learned-pe').checked;
			const d          = val('d-model', '256');
			const h          = val('num-heads', '8');
			const ff         = val('d-ff', '512');
			const nL         = numVal('num-layers', 4);
			const dropRaw    = parseFloat((document.getElementById('dropout').value || '').trim()) || 0.1;
			const sl         = val('seq-len', '128');
			const tl         = val('tgt-len', '64');
			const vs         = val('vocab-size', '10000');
			const xv         = val('xvar', 'x');
			const yv         = val('yvar', 'y');
			const outCh      = '1';

			let code = '';
			if (m === 'encoder') {
				code = genEncoder(d, h, ff, nL, dropRaw, sl, vs, outCh, xv, yv, isEfficient, isLearned);
			} else if (m === 'decoder') {
				code = genDecoder(d, h, ff, nL, dropRaw, sl, tl, vs, outCh, xv, yv, isEfficient, isLearned);
			} else if (m === 'encdec') {
				code = genEncDec(d, h, ff, nL, dropRaw, sl, tl, vs, outCh, xv, yv, isEfficient, isLearned);
			} else if (m === 'timeseries') {
				const seqL    = val('ts-seq-len', '336');
				const predL   = val('pred-len', '96');
				const patchSz = val('patch-size', '16');
				code = genTimeSeries(d, h, ff, nL, dropRaw, seqL, predL, patchSz, outCh, xv, yv, isEfficient, isLearned);
			} else {
				const cmSl   = val('cm-seq-len', '128');
				const cmVs   = val('cm-vocab-size', '10000');
				const dNum   = val('d-num', '32');
				code = genCrossModal(d, h, ff, nL, dropRaw, cmSl, cmVs, dNum, outCh, xv, yv, isEfficient, isLearned);
			}
			codePreview.innerHTML = code;
		}

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
			const el = document.getElementById('eq-block');
			if (!el) { return; }
			let html = '';
			if (tfModel === 'encoder') {
				html += eqRow('Attention(<i>Q</i>, <i>K</i>, <i>V</i>)', '=', 'softmax(<i>QK</i><sup>T</sup> / &radic;<i>d</i><sub>k</sub>) <i>V</i>', 'scaled dot-product attention');
				html += eqRow('<i>MultiHead</i>(<i>Q</i>,<i>K</i>,<i>V</i>)', '=', 'Concat(head<sub>1</sub>, ..., head<sub>h</sub>) <i>W</i><sup>O</sup>', 'h parallel attention heads');
				html += eqRow('<i>FFN</i>(<i>x</i>)', '=', 'max(0, <i>xW</i><sub>1</sub> + <i>b</i><sub>1</sub>)<i>W</i><sub>2</sub> + <i>b</i><sub>2</sub>', 'position-wise feed-forward');
			} else if (tfModel === 'decoder') {
				html += eqRow('MaskedAttn(<i>Q</i>,<i>K</i>,<i>V</i>)', '=', 'softmax(<i>QK</i><sup>T</sup> / &radic;<i>d</i><sub>k</sub> + <i>M</i>) <i>V</i>', '<i>M</i> = &minus;&infin; above diagonal');
				html += eqRow('<i>p</i>(<i>x</i><sub>t</sub> | <i>x</i><sub>&lt;t</sub>)', '=', 'softmax(<i>W</i> <i>h</i><sub>t</sub>)', 'next-token probability');
			} else if (tfModel === 'encdec') {
				html += eqRow('CrossAttn(<i>Q</i>,<i>K</i>,<i>V</i>)', '=', 'softmax(<i>Q</i><sub>tgt</sub><i>K</i><sub>enc</sub><sup>T</sup> / &radic;<i>d</i><sub>k</sub>) <i>V</i><sub>enc</sub>', 'decoder queries attend to encoder');
				html += eqRow('<i>h</i><sub>enc</sub>', '=', 'Encoder(<i>x</i><sub>src</sub>)', 'contextualised source representation');
				html += eqRow('<i>h</i><sub>dec</sub>', '=', 'Decoder(<i>y</i><sub>&lt;t</sub>, <i>h</i><sub>enc</sub>)', 'target prefix + encoder memory');
			} else if (tfModel === 'timeseries') {
				html += eqRow('<i>p</i><sub><i>i</i></sub>', '=', '<i>x</i>[(<i>i</i>&minus;1)&middot;<i>P</i> : <i>i</i>&middot;<i>P</i>]', 'patch <i>i</i> of length <i>P</i>');
				html += eqRow('<i>z</i><sub><i>i</i></sub>', '=', '<i>W</i><sub>patch</sub> <i>p</i><sub><i>i</i></sub> + <i>b</i>', 'linear patch projection to d_model');
				html += eqRow('&#375;', '=', 'Linear(Encoder([<i>z</i><sub>1</sub>, ..., <i>z</i><sub>N</sub>]))', 'flat forecast from patch sequence');
			} else {
				html += eqRow('<i>h</i><sub>text</sub>', '=', 'Encoder(<i>x</i><sub>text</sub>)[:, 1, :]', '[CLS] embedding from text encoder');
				html += eqRow('<i>h</i><sub>num</sub>', '=', '<i>W</i><sub>num</sub> <i>x</i><sub>num</sub> + <i>b</i>', 'projected numerical features');
				html += eqRow('&#375;', '=', '<i>W</i><sub>out</sub>(<i>h</i><sub>text</sub> + <i>h</i><sub>num</sub>)', 'residual fusion + linear head');
			}
			el.innerHTML = html;
		}

		// ── Model switcher ───────────────────────────────────────────────────────
		function setModel(type) {
			tfModel = type;
			['encoder', 'decoder', 'encdec', 'timeseries', 'crossmodal'].forEach(function(m) {
				document.getElementById('toggle-' + m).classList.toggle('active', m === type);
			});

			const isTs = (type === 'timeseries');
			const isCm = (type === 'crossmodal');
			const isTgtRow = (type === 'decoder' || type === 'encdec');

			document.querySelectorAll('.non-ts-cm-row').forEach(function(el) {
				el.style.display = (!isTs && !isCm) ? 'flex' : 'none';
			});
			document.querySelectorAll('.tgt-row').forEach(function(el) {
				el.style.display = isTgtRow ? 'flex' : 'none';
			});
			document.querySelectorAll('.ts-row').forEach(function(el) {
				el.style.display = isTs ? 'flex' : 'none';
			});
			document.querySelectorAll('.cm-row').forEach(function(el) {
				el.style.display = isCm ? 'flex' : 'none';
			});

			updateEquations();
			updateCodePreview();
		}

		// ── Tooltip icons — hover to peek, click to pin/unpin (all tooltips) ────
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
		document.querySelectorAll('.cb-wiki-link').forEach(function(link) {
			link.addEventListener('click', function(e) {
				e.stopPropagation();
				vscode.postMessage({ command: 'openWiki', target: this.dataset.wiki });
			});
		});

		// ── Event wiring ─────────────────────────────────────────────────────────
		['encoder', 'decoder', 'encdec', 'timeseries', 'crossmodal'].forEach(function(m) {
			document.getElementById('toggle-' + m).addEventListener('click', function() { setModel(m); });
		});

		['efficient-attn', 'learned-pe'].forEach(function(id) {
			document.getElementById(id).addEventListener('change', updateCodePreview);
		});

		['d-model', 'd-ff', 'num-heads', 'num-layers', 'dropout',
		 'seq-len', 'vocab-size', 'tgt-len',
		 'ts-seq-len', 'pred-len', 'patch-size',
		 'cm-seq-len', 'cm-vocab-size', 'd-num',
		 'xvar', 'yvar'].forEach(function(id) {
			const el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
		});

		document.getElementById('eq-toggle').addEventListener('click', function() {
			document.getElementById('eq-section').classList.toggle('collapsed');
		});

		document.getElementById('btn-copy').addEventListener('click', function() {
			const text = codePreview.innerText || codePreview.textContent;
			navigator.clipboard.writeText(text).catch(function() {
				vscode.postMessage({ command: 'openUrl', url: '' });
			});
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

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openDocs', target: 'wiki' }); }
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn === this) { releaseBtn(); document.body.click(); return; }
			else { pressBtn(this); vscode.postMessage({ command: 'openNotebookList' }); }
		});
		document.getElementById('btn-paper').addEventListener('click', function() {
			vscode.postMessage({ command: 'openDocs', target: 'repository' });
		});
		document.getElementById('btn-viz').addEventListener('click', function() {});
		document.getElementById('btn-diagnose').addEventListener('click', function() {});
		document.getElementById('btn-compare').addEventListener('click', function() {});
		document.getElementById('btn-documentation').addEventListener('click', function() {
			vscode.postMessage({ command: 'openDocs', target: 'documentation' });
		});

		// ── VS Code message handler ──────────────────────────────────────────────
		window.addEventListener('message', function(event) {
			const msg = event.data;
			if (msg.command === 'packageLinks') {
				const span = document.getElementById('package-links');
				if (span) {
					span.innerHTML = msg.packages.map(function(p) {
						return '<a class="package-link" href="#" data-url="' + p.url + '">' + p.name + '</a>';
					}).join(', ');
					span.querySelectorAll('.package-link').forEach(function(a) {
						a.addEventListener('click', function(e) {
							e.preventDefault();
							vscode.postMessage({ command: 'openUrl', url: this.dataset.url });
						});
					});
				}
			} else if (msg.command === 'paperLinks') {
				const el = document.getElementById('paper-links');
				if (el && msg.hasPapers) {
					el.style.display = 'block';
					el.innerHTML = msg.papers.map(function(p) {
						return '<a class="package-link" href="#" data-url="' + p.url + '">' + p.name + '</a>';
					}).join('<br>');
					el.querySelectorAll('.package-link').forEach(function(a) {
						a.addEventListener('click', function(e) {
							e.preventDefault();
							vscode.postMessage({ command: 'openUrl', url: this.dataset.url });
						});
					});
				}
			} else if (msg.command === 'tooltips') {
				const tips = msg.tooltips;
				const map = {
					'd_model':    ['d-model'],
					'num_heads':  ['num-heads'],
					'num_layers': ['num-layers'],
					'd_ff':       ['d-ff'],
					'dropout':    ['dropout'],
					'seq_len':    ['seq-len', 'cm-seq-len'],
					'tgt_len':    ['tgt-len'],
					'pred_len':   ['pred-len'],
					'patch_size': ['patch-size'],
					'vocab_size': ['vocab-size', 'cm-vocab-size'],
					'd_num':      ['d-num'],
				};
				Object.keys(map).forEach(function(key) {
					if (tips[key]) {
						map[key].forEach(function(id) {
							const el = document.getElementById('tooltip-text-' + id);
							if (el) { el.textContent = tips[key]; }
						});
					}
				});
			} else if (msg.command === 'setModel') {
				setModel(msg.model);
			}
		});

		// ── Init ─────────────────────────────────────────────────────────────────
		updateEquations();
		updateCodePreview();
	</script>
</body>
</html>`;
}
