/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getMdpHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Single-Agent Decision Processes</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.methods-list { list-style: none; padding-left: 0; margin: 5px 0 16px 0; }
		.methods-list li { margin: 4px 0; padding-left: 20px; position: relative; font-size: 13px; color: var(--vscode-foreground); line-height: 1.5; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 0.55em; width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.decision-table { border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 16px; }
		.decision-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--vscode-widget-border); color: var(--vscode-foreground); font-weight: 600; }
		.decision-table td { padding: 5px 10px; border-bottom: 1px solid var(--vscode-widget-border); color: var(--vscode-foreground); vertical-align: top; line-height: 1.4; }
		.decision-table tr:last-child td { border-bottom: none; }
		.decision-table td:first-child { color: var(--vscode-textLink-foreground); font-weight: 500; white-space: nowrap; }
		.model-toggle { display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 16px; flex-wrap: wrap; }
		.toggle-btn { background: var(--vscode-list-hoverBackground); border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 35px; transition: background 0.15s; }
		.toggle-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.toggle-btn:not(.active):hover { background: var(--vscode-list-activeSelectionBackground); }
		.illus-section { margin: 0 0 20px 0; }
		.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.illus-toggle:hover { text-decoration: underline; }
		.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
		.illus-section.collapsed .illus-body { display: none; }
		.illus-body { font-size: 14px; padding: 14px 20px; background: var(--vscode-textCodeBlock-background); border-radius: 6px; border: 1px solid var(--vscode-widget-border); font-family: 'Georgia', 'Times New Roman', serif; line-height: 2; }
		.eq-row { display: flex; align-items: baseline; gap: 8px; }
		.eq-lhs { min-width: 240px; text-align: right; white-space: nowrap; }
		.eq-op  { min-width: 18px; text-align: center; white-space: nowrap; }
		.eq-body { flex: 1; }
		.eq-comment { font-size: 12px; color: #6A9955; font-style: italic; padding-left: 12px; }
		.form-group { display: flex; flex-direction: column; margin-bottom: 0; }
		.form-row { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 12px; align-items: flex-end; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 260px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		.param-input { text-align: center; }
		.mdp-pomdp-row, .mdp-smdp-row { display: none; }
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-blank { margin: 4px 0; height: 1em; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-debugTokenExpression-name); }
		.hl-fn      { color: var(--vscode-debugTokenExpression-value); }
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
	</style>
</head>
<body>
	<div class="container">

		<h1>Single-Agent Decision Processes</h1>
		<div class="powered-by">Powered by: <span id="package-links"></span></div>

		<ul class="methods-list">
			<li>A Markov Decision Process (MDP) is the canonical framework for sequential decision-making under uncertainty: an agent observes its full state, selects an action, receives a reward, and transitions to a new state with known probabilities. MDPs underlie robot navigation, inventory management, game playing, energy dispatch, and autonomous control &#8212; any domain where decisions are sequential, states are fully observable, and the goal is to maximise cumulative discounted reward. Unlike the Dynamic Programming webview &#8212; which solves the Bellman equation directly on a fixed state grid &#8212; these models use POMDPs.jl&#8217;s problem-specification interface, decoupling problem definition from solver choice so any compatible algorithm (value iteration, MCTS, QMDP, SARSOP) can be swapped without changing the model.</li>
			<li>A Partially Observable MDP (POMDP) extends the MDP to settings where the true state is hidden: the agent receives only a noisy observation and must maintain a belief distribution over all possible states, planning over the continuous belief space rather than the discrete state space. POMDPs model medical diagnosis under uncertain test results, autonomous driving under sensor noise, dialogue systems, and search-and-rescue &#8212; domains where the agent must balance information-gathering actions (sensing, listening) against task-achieving ones to act optimally despite incomplete information.</li>
		</ul>

		<table class="decision-table">
			<thead><tr><th>Model</th><th>Observability</th><th>Use when</th></tr></thead>
			<tbody>
				<tr><td>MDP</td><td>Full</td><td>State fully observed at each step; single agent; Markov transitions; optimal policy via value or policy iteration</td></tr>
				<tr><td>POMDP</td><td>Partial</td><td>State hidden behind noisy observations; agent maintains a belief distribution and plans over belief space</td></tr>
				<tr><td>Semi-MDP</td><td>Full, variable timing</td><td>Decision epochs occur at irregular intervals; holding time between actions follows a state- and action-dependent distribution</td></tr>
			</tbody>
		</table>

		<div class="model-toggle" id="model-group">
			<button class="toggle-btn" data-model="mdp">MDP</button>
			<button class="toggle-btn" data-model="pomdp">POMDP</button>
			<button class="toggle-btn" data-model="smdp">Semi-MDP</button>
		</div>

		<div class="illus-section" id="illus-section">
			<button class="illus-toggle" id="illus-toggle">
				<span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>
				Model equations
			</button>
			<div class="illus-body" id="illus-body"></div>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">|S| (states)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Number of discrete states. For MDPs and Semi-MDPs this is the full state count. For POMDPs this is the number of hidden states underlying the observation model.</span>
				</label>
				<textarea id="mdp-S" class="form-input param-input" placeholder="10" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">|A| (actions)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Number of discrete actions available to the agent at each decision epoch.</span>
				</label>
				<textarea id="mdp-A" class="form-input param-input" placeholder="3" rows="1"></textarea>
			</div>
			<div class="form-group mdp-pomdp-row">
				<label class="form-label centered form-label-with-tooltip">|O| (observations)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Number of distinct observations the agent can receive. Observations are noisy signals about the hidden state, characterised by the observation function P(o | s, a).</span>
				</label>
				<textarea id="mdp-O" class="form-input param-input" placeholder="2" rows="1"></textarea>
			</div>
			<div class="form-group">
				<label class="form-label centered form-label-with-tooltip">&#947; (discount)
					<span class="tooltip-icon">?</span>
					<span class="tooltip-text">Discount factor in [0, 1). Controls the relative weight of future vs immediate rewards. For Semi-MDPs the effective per-transition discount also depends on the expected holding time.</span>
				</label>
				<textarea id="mdp-gamma" class="form-input param-input" placeholder="0.95" rows="1"></textarea>
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
					<li><button class="list-btn panel-toggle" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1zm0 1a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 7.5 2zM7 4v5h1V4H7zm0 6v1h1v-1H7z"/></svg>Interpret</button></li>
				</ul>
				<hr class="strip-divider">
				<div class="strip-title">Learn More</div>
				<ul class="column-list">
					<li><button class="list-btn panel-toggle" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
					<li><button class="list-btn panel-toggle" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75Z"/></svg>Notebook Tutorials</button></li>
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
		var currentModel = 'mdp';
		var activeBtn = null;
		var currentPanelId = null;
		var pickerJustClosed = false;
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
		function eqRow(lhs, op, body, comment) {
			return '<div class="eq-row">'
				+ '<span class="eq-lhs">' + lhs + '</span>'
				+ '<span class="eq-op">' + op + '</span>'
				+ '<span class="eq-body">' + body + '</span>'
				+ (comment ? '<span class="eq-comment"># ' + comment + '</span>' : '')
				+ '</div>';
		}

		function updateEquations() {
			var body = document.getElementById('illus-body');
			var html = '';
			if (currentModel === 'mdp') {
				html += eqRow('V<sup>*</sup>(s)', '=', 'max<sub>a</sub> { R(s, a) + &#947; &#8721;<sub>s&#8242;</sub> T(s&#8242; | s, a) V<sup>*</sup>(s&#8242;) }', 'Bellman optimality equation');
				html += eqRow('&#960;<sup>*</sup>(s)', '=', 'argmax<sub>a</sub> { R(s, a) + &#947; &#8721;<sub>s&#8242;</sub> T(s&#8242; | s, a) V<sup>*</sup>(s&#8242;) }', 'greedy optimal policy');
			} else if (currentModel === 'pomdp') {
				html += eqRow('b&#8242;(s&#8242;)', '=', '&#951; P(o | s&#8242;, a) &#8721;<sub>s</sub> T(s&#8242; | s, a) b(s)', 'Bayes belief update');
				html += eqRow('V<sup>*</sup>(b)', '=', 'max<sub>a</sub> { &#961;(b, a) + &#947; &#8721;<sub>o</sub> P(o | b, a) V<sup>*</sup>(&#964;(b, a, o)) }', 'Bellman over belief space');
				html += eqRow('V<sup>*</sup>(b)', '&#8776;', 'max<sub>&#945; &#8712; &#915;</sub> &#945;<sup>T</sup>b', 'alpha-vector (PWLC) approximation');
			} else {
				html += eqRow('V<sup>*</sup>(s)', '=', 'max<sub>a</sub> { &#732;R(s, a) + &#732;&#947;(s, a) &#8721;<sub>s&#8242;</sub> T(s&#8242; | s, a) V<sup>*</sup>(s&#8242;) }', 'Semi-MDP Bellman equation');
				html += eqRow('&#732;R(s, a)', '=', 'E<sub>H</sub>[ &#8747;<sub>0</sub><sup>H</sup> e<sup>&#8722;&#955;t</sup> r(s, a) dt ]', 'reward weighted by holding time');
				html += eqRow('&#732;&#947;(s, a)', '=', 'E<sub>H</sub>[ e<sup>&#8722;&#955;H(s,a)</sup> ]', 'effective discount over random holding time H');
			}
			body.innerHTML = html;
		}

		function updateCodePreview() {
			var S     = val('mdp-S',     '10');
			var A     = val('mdp-A',     '3');
			var O     = val('mdp-O',     '2');
			var gamma = val('mdp-gamma', '0.95');
			var c = '';

			if (currentModel === 'mdp') {
				c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools') + ', ' + ty('DiscreteValueIteration'));
				c += blank();
				c += cline(kw('struct') + ' InventoryMDP &#60;: ' + ty('MDP') + '{' + ty('Int') + ', ' + ty('Int') + '}', 'state: stock level, action: order quantity');
				c += line('    S::' + ty('Int') + '; A::' + ty('Int') + '; demand::' + ty('Int') + '; gamma::' + ty('Float64'));
				c += line(kw('end'));
				c += blank();
				c += line(ty('POMDPs') + '.' + fn('states') + '(m::' + ty('InventoryMDP') + ')   = 0:m.S');
				c += line(ty('POMDPs') + '.' + fn('actions') + '(m::' + ty('InventoryMDP') + ')  = 0:m.A');
				c += line(ty('POMDPs') + '.' + fn('discount') + '(m::' + ty('InventoryMDP') + ') = m.gamma');
				c += line(ty('POMDPs') + '.' + fn('stateindex') + '(m::' + ty('InventoryMDP') + ', s) = s + 1');
				c += line(ty('POMDPs') + '.' + fn('actionindex') + '(m::' + ty('InventoryMDP') + ', a) = a + 1');
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('transition') + '(m::' + ty('InventoryMDP') + ', s, a)', 'deterministic transition');
				c += line('    s_next = ' + fn('clamp') + '(s + a - m.demand, 0, m.S)');
				c += line('    return ' + fn('Deterministic') + '(s_next)');
				c += line(kw('end'));
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('reward') + '(m::' + ty('InventoryMDP') + ', s, a)', 'revenue minus order and holding cost');
				c += line('    return -2.0*a - 0.5*' + fn('max') + '(s+a-m.demand,0) + 8.0*' + fn('min') + '(s+a, m.demand)');
				c += line(kw('end'));
				c += blank();
				c += cline('mdp    = ' + fn('InventoryMDP') + '(' + S + ', ' + A + ', 5, ' + gamma + ')', 'S=' + S + ' states, A=' + A + ' actions, demand=5');
				c += cline('solver = ' + fn('ValueIterationSolver') + '(max_iterations=1000, belres=1e-6)', 'value iteration with tolerance 1e-6');
				c += cline('policy = ' + fn('solve') + '(solver, mdp)', 'solve for optimal policy');
				c += blank();
				c += line(fn('println') + '("V*(s=0):        ", ' + fn('round') + '(' + fn('value') + '(policy, 0); digits=4))');
				c += line(fn('println') + '("pi*(s=0): order ", ' + fn('action') + '(policy, 0), " units")');
			} else if (currentModel === 'pomdp') {
				c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools') + ', ' + ty('QMDP'));
				c += blank();
				c += cline(kw('struct') + ' TigerPOMDP &#60;: ' + ty('POMDP') + '{' + ty('Symbol') + ', ' + ty('Symbol') + ', ' + ty('Symbol') + '}', 'classic Tiger problem: locate tiger behind a door');
				c += line('    gamma::' + ty('Float64'));
				c += line(kw('end'));
				c += blank();
				c += line(ty('POMDPs') + '.' + fn('states') + '(::' + ty('TigerPOMDP') + ')       = [:tiger_left, :tiger_right]');
				c += line(ty('POMDPs') + '.' + fn('actions') + '(::' + ty('TigerPOMDP') + ')      = [:open_left, :open_right, :listen]');
				c += line(ty('POMDPs') + '.' + fn('observations') + '(::' + ty('TigerPOMDP') + ') = [:hear_left, :hear_right]');
				c += line(ty('POMDPs') + '.' + fn('discount') + '(m::' + ty('TigerPOMDP') + ')    = m.gamma');
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('transition') + '(::' + ty('TigerPOMDP') + ', s, a)', 'tiger stays put while listening; resets after opening');
				c += line('    a == :listen && return ' + fn('Deterministic') + '(s)');
				c += line('    return ' + fn('Uniform') + '([:tiger_left, :tiger_right])');
				c += line(kw('end'));
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('observation') + '(::' + ty('TigerPOMDP') + ', a, sp)', 'noisy observation of tiger location');
				c += line('    a != :listen && return ' + fn('Uniform') + '([:hear_left, :hear_right])');
				c += line('    p = 0.85');
				c += line('    sp == :tiger_left && return ' + fn('SparseCat') + '([:hear_left, :hear_right], [p, 1-p])');
				c += line('    return ' + fn('SparseCat') + '([:hear_left, :hear_right], [1-p, p])');
				c += line(kw('end'));
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('reward') + '(::' + ty('TigerPOMDP') + ', s, a)', 'large penalty for wrong door, small cost for listening');
				c += line('    a == :listen && return -1.0');
				c += line('    (a == :open_left  && s == :tiger_left)  && return -100.0');
				c += line('    (a == :open_right && s == :tiger_right) && return -100.0');
				c += line('    return 10.0');
				c += line(kw('end'));
				c += blank();
				c += cline('pomdp  = ' + fn('TigerPOMDP') + '(' + gamma + ')', 'instantiate Tiger POMDP');
				c += cline('solver = ' + fn('QMDPSolver') + '()', 'QMDP: MDP approximation over belief space');
				c += cline('policy = ' + fn('solve') + '(solver, pomdp)', 'compute alpha vectors');
				c += cline('b0     = ' + fn('initialstate') + '(pomdp)', 'uniform initial belief over states');
				c += line(fn('println') + '("Action from uniform belief: ", ' + fn('action') + '(policy, b0))');
			} else {
				c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools') + ', ' + ty('DiscreteValueIteration'));
				c += blank();
				c += cline(kw('struct') + ' MaintenanceSMDP &#60;: ' + ty('MDP') + '{' + ty('Int') + ', ' + ty('Int') + '}', 'state: machine condition 0=failed, S=perfect');
				c += line('    S::' + ty('Int') + '; lambda::' + ty('Float64') + '; gamma::' + ty('Float64'));
				c += line(kw('end'));
				c += blank();
				c += line(ty('POMDPs') + '.' + fn('states') + '(m::' + ty('MaintenanceSMDP') + ')   = 0:m.S');
				c += line(ty('POMDPs') + '.' + fn('actions') + '(m::' + ty('MaintenanceSMDP') + ')  = [0, 1, 2]');
				c += line(ty('POMDPs') + '.' + fn('discount') + '(m::' + ty('MaintenanceSMDP') + ') = m.gamma');
				c += blank();
				c += cline('hold_time(s, a) = a == 0 ? 1.0/' + fn('max') + '(0.1*s, 0.1) : a == 1 ? 2.0 : 4.0', 'mean holding time: operate/maintain/replace');
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('transition') + '(m::' + ty('MaintenanceSMDP') + ', s, a)', 'state transitions by action');
				c += line('    a == 2 && return ' + fn('Deterministic') + '(m.S)');
				c += line('    a == 1 && return ' + fn('Deterministic') + '(' + fn('min') + '(s + 2, m.S))');
				c += line('    return ' + fn('Deterministic') + '(' + fn('max') + '(s - 1, 0))');
				c += line(kw('end'));
				c += blank();
				c += cline(kw('function') + ' ' + ty('POMDPs') + '.' + fn('reward') + '(m::' + ty('MaintenanceSMDP') + ', s, a)', 'reward weighted by expected holding time');
				c += line('    h = hold_time(s, a)');
				c += line('    production = a == 0 ? s * h : 0.0');
				c += line('    cost = a == 1 ? 5.0 : a == 2 ? 20.0 : 0.0');
				c += line('    return production - cost');
				c += line(kw('end'));
				c += blank();
				c += cline('mdp    = ' + fn('MaintenanceSMDP') + '(' + S + ', 0.1, ' + gamma + ')', 'S=' + S + ' condition levels, lambda=0.1');
				c += cline('solver = ' + fn('ValueIterationSolver') + '(max_iterations=1000, belres=1e-6)', 'solve via value iteration');
				c += cline('policy = ' + fn('solve') + '(solver, mdp)', 'optimal maintenance policy');
				c += blank();
				c += line(fn('println') + '("V*(s=0, failed):   ", ' + fn('round') + '(' + fn('value') + '(policy, 0);    digits=3))');
				c += line(fn('println') + '("pi*(s=0): action   ", ' + fn('action') + '(policy, 0), " (0=operate,1=maintain,2=replace)")');
			}

			document.getElementById('code-preview').innerHTML = c;
		}

		var MODELS = ['mdp', 'pomdp', 'smdp'];

		function setModel(model) {
			if (!MODELS.includes(model)) { return; }
			currentModel = model;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			document.querySelectorAll('.mdp-pomdp-row').forEach(function(el) { el.style.display = model === 'pomdp' ? 'flex' : 'none'; });
			updateEquations();
			updateCodePreview();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		['mdp-S', 'mdp-A', 'mdp-O', 'mdp-gamma'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) { el.addEventListener('input', updateCodePreview); }
		});

		document.getElementById('illus-toggle').addEventListener('click', function() {
			document.getElementById('illus-section').classList.toggle('collapsed');
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
				id: 'value-function',
				label: 'Value Function',
				desc: 'Plot V*(s) or V*(b) across the state or belief space',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('Plots'));
					c += blank();
					c += cline('s_vals = ' + fn('collect') + '(' + fn('states') + '(mdp))', 'all states');
					c += cline('v_vals = [' + fn('value') + '(policy, s) ' + kw('for') + ' s ' + kw('in') + ' s_vals]', 'optimal value per state');
					c += line(fn('plot') + '(s_vals, v_vals, xlabel="State", ylabel="V*(s)",');
					c += line('    title="Optimal Value Function", legend=false, linewidth=2)');
					return c;
				},
			},
			{
				id: 'policy-map',
				label: 'Policy Map',
				desc: 'Plot the optimal action at each state to reveal the policy structure',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('Plots'));
					c += blank();
					c += cline('s_vals = ' + fn('collect') + '(' + fn('states') + '(mdp))', 'all states');
					c += cline('a_vals = [' + fn('action') + '(policy, s) ' + kw('for') + ' s ' + kw('in') + ' s_vals]', 'optimal action per state');
					c += line(fn('bar') + '(s_vals, a_vals, xlabel="State", ylabel="Optimal action",');
					c += line('    title="Optimal Policy", legend=false)');
					return c;
				},
			},
		];

		var DIAGNOSE_ACTIONS = [
			{
				id: 'policy-simulation',
				label: 'Policy Simulation',
				desc: 'Simulate T steps under the optimal policy and record the state-action trajectory',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools'));
					c += blank();
					c += cline('sim     = ' + fn('RolloutSimulator') + '(max_steps=20)', 'simulate up to 20 steps');
					c += cline('s0      = ' + fn('rand') + '(' + fn('initialstate') + '(mdp))', 'sample initial state');
					c += cline('history = ' + fn('simulate') + '(sim, mdp, policy, s0)', 'run rollout');
					c += blank();
					c += line(kw('for') + ' step ' + kw('in') + ' history');
					c += line('    ' + fn('println') + '("s=", step.s, "  a=", step.a, "  r=", ' + fn('round') + '(step.r; digits=2))');
					c += line(kw('end'));
					c += line(fn('println') + '("Discounted return: ", ' + fn('discounted_reward') + '(history))');
					return c;
				},
			},
			{
				id: 'belief-update',
				label: 'Belief Update (POMDP)',
				desc: 'Step through a POMDP episode and track the belief state after each observation',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools'));
					c += blank();
					c += cline('updater = ' + fn('DiscreteUpdater') + '(pomdp)', 'discrete Bayes belief updater');
					c += cline('b = ' + fn('initialize_belief') + '(updater, ' + fn('initialstate') + '(pomdp))', 'uniform initial belief');
					c += blank();
					c += cline('T_steps = 5', 'trace 5 steps of belief evolution');
					c += line(kw('for') + ' t ' + kw('in') + ' 1:T_steps');
					c += line('    a  = ' + fn('action') + '(policy, b)');
					c += line('    s  = ' + fn('rand') + '(' + fn('initialstate') + '(pomdp))');
					c += line('    sp = ' + fn('rand') + '(' + fn('transition') + '(pomdp, s, a))');
					c += line('    o  = ' + fn('rand') + '(' + fn('observation') + '(pomdp, a, sp))');
					c += line('    b  = ' + fn('update') + '(updater, b, a, o)');
					c += line('    ' + fn('println') + '("t=", t, "  a=", a, "  o=", o, "  b=", b.b)');
					c += line(kw('end'));
					return c;
				},
			},
		];

		var PREDICT_ACTIONS = [
			{
				id: 'mc-return',
				label: 'Monte Carlo Return',
				desc: 'Estimate expected discounted return by averaging over many policy rollouts',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools') + ', ' + ty('Statistics'));
					c += blank();
					c += cline('sim     = ' + fn('RolloutSimulator') + '(max_steps=50)', 'rollout simulator');
					c += cline('n_sim   = 500', 'number of Monte Carlo rollouts');
					c += cline('returns = [' + fn('discounted_reward') + '(' + fn('simulate') + '(sim, mdp, policy)) ' + kw('for') + ' _ ' + kw('in') + ' 1:n_sim]', 'discounted returns');
					c += blank();
					c += line(fn('println') + '("Mean return: ", ' + fn('round') + '(' + fn('mean') + '(returns);   digits=3))');
					c += line(fn('println') + '("Std return:  ", ' + fn('round') + '(' + fn('std') + '(returns);    digits=3))');
					c += line(fn('println') + '("95th pct:    ", ' + fn('round') + '(' + fn('quantile') + '(returns, 0.95); digits=3))');
					return c;
				},
			},
			{
				id: 'mcts-lookahead',
				label: 'MCTS Lookahead',
				desc: 'Use Monte Carlo Tree Search to plan online from the current state without solving globally',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('MCTS'));
					c += blank();
					c += cline('solver = ' + fn('MCTSSolver') + '(n_iterations=1000, depth=20, exploration_constant=5.0)', 'MCTS solver parameters');
					c += cline('policy = ' + fn('solve') + '(solver, mdp)', 'build MCTS policy');
					c += blank();
					c += cline('s0 = 0', 'query state');
					c += cline('a  = ' + fn('action') + '(policy, s0)', 'plan from state s0');
					c += line(fn('println') + '("MCTS action at s=0: ", a)');
					c += line(fn('println') + '("Tree nodes built:   ", ' + fn('n_iterations') + '(solver))');
					return c;
				},
			},
		];

		var COMPARE_ACTIONS = [
			{
				id: 'vi-vs-mcts',
				label: 'Value Iteration vs MCTS',
				desc: 'Compare value iteration global policy with MCTS online planning on the same problem',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools') + ', ' + ty('DiscreteValueIteration') + ', ' + ty('MCTS') + ', ' + ty('Statistics'));
					c += blank();
					c += cline('sim        = ' + fn('RolloutSimulator') + '(max_steps=50)', 'shared rollout simulator');
					c += cline('vi_policy  = ' + fn('solve') + '(' + fn('ValueIterationSolver') + '(), mdp)', 'global value iteration');
					c += cline('mcts_pol   = ' + fn('solve') + '(' + fn('MCTSSolver') + '(n_iterations=500), mdp)', 'online MCTS');
					c += blank();
					c += cline('n_sim = 200', '200 evaluation rollouts per solver');
					c += cline('vi_returns   = [' + fn('discounted_reward') + '(' + fn('simulate') + '(sim, mdp, vi_policy)) ' + kw('for') + ' _ ' + kw('in') + ' 1:n_sim]', 'VI returns');
					c += cline('mcts_returns = [' + fn('discounted_reward') + '(' + fn('simulate') + '(sim, mdp, mcts_pol)) ' + kw('for') + ' _ ' + kw('in') + ' 1:n_sim]', 'MCTS returns');
					c += blank();
					c += line(fn('println') + '("VI   mean return: ", ' + fn('round') + '(' + fn('mean') + '(vi_returns);   digits=3))');
					c += line(fn('println') + '("MCTS mean return: ", ' + fn('round') + '(' + fn('mean') + '(mcts_returns); digits=3))');
					return c;
				},
			},
			{
				id: 'qmdp-vs-sarsop',
				label: 'QMDP vs SARSOP',
				desc: 'Compare the QMDP approximation with the exact SARSOP point-based solver on a POMDP',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('POMDPTools') + ', ' + ty('QMDP') + ', ' + ty('SARSOP') + ', ' + ty('Statistics'));
					c += blank();
					c += cline('sim          = ' + fn('RolloutSimulator') + '(max_steps=30)', 'shared simulator');
					c += cline('qmdp_policy  = ' + fn('solve') + '(' + fn('QMDPSolver') + '(), pomdp)', 'QMDP: fast MDP approximation');
					c += cline('sarsop_pol   = ' + fn('solve') + '(' + fn('SARSOPSolver') + '(), pomdp)', 'SARSOP: anytime point-based exact');
					c += blank();
					c += cline('n_sim = 200', 'evaluation rollouts');
					c += cline('qmdp_ret   = ' + fn('mean') + '([' + fn('discounted_reward') + '(' + fn('simulate') + '(sim, pomdp, qmdp_policy)) ' + kw('for') + ' _ ' + kw('in') + ' 1:n_sim])', 'QMDP mean return');
					c += cline('sarsop_ret = ' + fn('mean') + '([' + fn('discounted_reward') + '(' + fn('simulate') + '(sim, pomdp, sarsop_pol)) ' + kw('for') + ' _ ' + kw('in') + ' 1:n_sim])', 'SARSOP mean return');
					c += blank();
					c += line(fn('println') + '("QMDP   mean return: ", ' + fn('round') + '(qmdp_ret;   digits=3))');
					c += line(fn('println') + '("SARSOP mean return: ", ' + fn('round') + '(sarsop_ret; digits=3))');
					return c;
				},
			},
		];

		var INTERPRET_ACTIONS = [
			{
				id: 'alpha-vectors',
				label: 'Alpha Vectors (POMDP)',
				desc: 'Inspect the alpha-vector representation of the POMDP value function',
				code: function() {
					var c = '';
					c += line(kw('using') + ' ' + ty('POMDPs') + ', ' + ty('QMDP') + ', ' + ty('Plots'));
					c += blank();
					c += cline('alphas = ' + fn('alphavectors') + '(policy)', 'extract alpha vectors from policy');
					c += line(fn('println') + '("Number of alpha vectors: ", length(alphas))');
					c += blank();
					c += cline('b_range = 0.0:0.01:1.0', 'belief that tiger is left');
					c += cline('V_b = [' + fn('maximum') + '(' + fn('dot') + '(a, [b, 1-b]) ' + kw('for') + ' a ' + kw('in') + ' alphas) ' + kw('for') + ' b ' + kw('in') + ' b_range]', 'PWLC value function over belief simplex');
					c += line(fn('plot') + '(b_range, V_b, xlabel="P(tiger left)", ylabel="V*(b)",');
					c += line('    title="POMDP Value Function (alpha vectors)", legend=false)');
					return c;
				},
			},
			{
				id: 'state-value',
				label: 'State Value Lookup',
				desc: 'Query V*(s) and optimal action at any state of interest',
				code: function() {
					var c = '';
					c += cline('s_query = 3', 'query state');
					c += blank();
					c += line(fn('println') + '("V*(s=3):  ", ' + fn('round') + '(' + fn('value') + '(policy, s_query); digits=4))');
					c += line(fn('println') + '("pi*(s=3): ", ' + fn('action') + '(policy, s_query))');
					c += blank();
					c += cline('advantage = ' + fn('value') + '(policy, s_query+1) - ' + fn('value') + '(policy, s_query)', 'marginal value of one unit improvement');
					c += line(fn('println') + '("Marginal value: ", ' + fn('round') + '(advantage; digits=4))');
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

		function renderWikiPanel() {
			if (!wikiSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Local Wikis</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="nb-panel-scroll">';
			wikiSections.forEach(function(section) {
				if (section.label) { html += '<div class="nb-section-title">' + esc(section.label) + '</div>'; }
				html += '<div class="right-action-grid">';
				section.wikis.forEach(function(w) {
					html += '<button class="nb-card" data-wiki="' + esc(w.file) + '">'
						+ '<span class="nb-label">' + esc(w.name) + '</span>'
						+ '</button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-wiki]').forEach(function(card) {
				card.addEventListener('click', function() {
					vscode.postMessage({ command: 'openWiki', target: card.dataset.wiki });
				});
			});
		}

		function renderNotebookPanel() {
			if (!notebookSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Notebook Tutorials</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="nb-panel-scroll">';
			notebookSections.forEach(function(section) {
				if (section.label) { html += '<div class="nb-section-title">' + esc(section.label) + '</div>'; }
				html += '<div class="right-action-grid">';
				section.notebooks.forEach(function(n) {
					html += '<button class="nb-card" data-file="' + esc(n.file) + '">'
						+ '<span class="nb-label">' + esc(n.name) + '</span>'
						+ (n.description ? '<span class="nb-desc">' + esc(n.description) + '</span>' : '')
						+ '</button>';
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-file]').forEach(function(card) {
				card.addEventListener('click', function() {
					vscode.postMessage({ command: 'openNotebook', target: card.dataset.file });
				});
			});
		}

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
			renderNotebookPanel();
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
			if (msg.command === 'wikiSections')    { wikiSections    = msg.sections || []; }
			if (msg.command === 'notebookSections') { notebookSections = msg.sections || []; }
			if (msg.command === 'setModel')         { setModel(msg.model); }
			if (msg.command === 'actionDone')       { releaseBtn(); }
		});

		setModel('mdp');
	</script>
</body>
</html>`;
}
