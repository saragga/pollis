/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function getEpiUdeHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<title>Epidemic SciML Tutorials</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.header { margin-bottom: 20px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.methods-list { list-style: none; padding-left: 0; margin: 5px 0; }
		.methods-list li { margin: 2px 0; padding-left: 20px; position: relative; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.section-title { font-size: 13px; font-weight: 600; color: var(--vscode-foreground); margin: 20px 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em; }
		.tutorial-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 8px; }
		.tutorial-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px 12px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; transition: background 0.1s; }
		.tutorial-card:hover { background: var(--vscode-list-hoverBackground); border-color: var(--vscode-textLink-foreground); }
		.tutorial-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); margin-bottom: 4px; }
		.tutorial-desc { font-size: 11px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		.divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 20px 0; }
		.bottom-layout { display: grid; grid-template-columns: 160px 1fr; gap: 24px; margin-top: 4px; align-items: start; }
		.left-strip { display: flex; flex-direction: column; }
		.strip-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
		.strip-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 10px 0; }
		.column-list { list-style: none; padding: 0; margin: 0; }
		.column-list li { margin: 0; }
		.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; }
		.list-btn svg { flex-shrink: 0; }
		.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.right-panel { border-left: 1px solid var(--vscode-widget-border); padding-left: 20px; display: none; min-width: 0; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Epidemic SciML Tutorials</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				A hands-on tutorial series applying Scientific Machine Learning to epidemiology, covering:
				<ul class="methods-list">
					<li>Universal Differential Equations (UDEs) &#8212; replace unknown interaction terms with neural networks while retaining compartmental model structure</li>
					<li>Neural ODEs &#8212; fully data-driven ODE systems and their limitations in forecasting</li>
					<li>Bayesian Neural ODEs &#8212; uncertainty quantification via NUTS sampling</li>
					<li>Symbolic regression &#8212; recover interpretable equations from trained neural networks using SINDy</li>
					<li>Quarantine diagnosis &#8212; apply UDEs to real COVID-19 data and recover time-varying quarantine strength</li>
				</ul>
			</div>
		</div>

		<div class="section-title">Part 1 &#8212; Tools</div>
		<div class="tutorial-grid">
			<button class="tutorial-card" data-notebook="epi-ude/tutorial-01-neural-ode.ipynb">
				<div class="tutorial-label">Neural ODEs</div>
				<div class="tutorial-desc">Train a Neural ODE on the 5-compartment SIRHD model and see why black-box networks fail at forecasting</div>
			</button>
			<button class="tutorial-card" data-notebook="epi-ude/tutorial-02-ude.ipynb">
				<div class="tutorial-label">Universal Differential Equations</div>
				<div class="tutorial-desc">Replace interaction terms with neural networks in the SIRHD model and train the hybrid UDE</div>
			</button>
			<button class="tutorial-card" data-notebook="epi-ude/tutorial-03-7compartment.ipynb">
				<div class="tutorial-label">7-Compartment Model</div>
				<div class="tutorial-desc">Compare Neural ODE and UDE extrapolation on a 7-compartment epidemic with a time-varying contact rate</div>
			</button>
			<button class="tutorial-card" data-notebook="epi-ude/tutorial-04-bayesian-neural-ode.ipynb">
				<div class="tutorial-label">Bayesian Neural ODEs</div>
				<div class="tutorial-desc">Add uncertainty quantification to Neural ODEs via NUTS sampling with AdvancedHMC.jl and Turing.jl</div>
			</button>
			<button class="tutorial-card" data-notebook="epi-ude/tutorial-05-symbolic-recovery.ipynb">
				<div class="tutorial-label">Symbolic Recovery</div>
				<div class="tutorial-desc">Chain ADAM and BFGS optimisers for a UDE on Lotka&#8211;Volterra dynamics, then recover the symbolic equations via SINDy</div>
			</button>
		</div>

		<div class="section-title">Part 2 &#8212; Applications</div>
		<div class="tutorial-grid">
			<button class="tutorial-card" data-notebook="epi-ude/tutorial-06-qsir-italy.ipynb">
				<div class="tutorial-label">QSIR &#8212; Italy</div>
				<div class="tutorial-desc">Fit a UDE-augmented SIR model to Italian COVID-19 data and recover the data-driven quarantine strength Q(t)</div>
			</button>
		</div>

		<hr class="divider">

		<div class="bottom-layout">
			<div class="left-strip">
				<div class="strip-title">Learn More</div>
				<ul class="column-list">
					<li><button class="list-btn" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>All Tutorials</button></li>
					<li><button class="list-btn" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>References</button></li>
				</ul>
			</div>
			<div class="right-panel" id="right-panel"></div>
		</div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();

		window.addEventListener('message', function(event) {
			var msg = event.data;
			if (msg.command === 'packageLinks') {
				var span = document.getElementById('package-links');
				span.innerHTML = msg.packages.map(function(p) {
					return '<a class="package-link" href="' + p.url + '">' + p.name + '</a>';
				}).join(', ');
				span.querySelectorAll('a.package-link').forEach(function(a) {
					a.addEventListener('click', function(e) {
						e.preventDefault();
						vscode.postMessage({ command: 'openUrl', url: a.href });
					});
				});
			}
		});

		document.querySelectorAll('.tutorial-card').forEach(function(card) {
			card.addEventListener('click', function() {
				vscode.postMessage({ command: 'openNotebook', target: card.dataset.notebook });
			});
		});

		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			vscode.postMessage({ command: 'openNotebookList' });
		});

		document.getElementById('btn-paper').addEventListener('click', function() {
			vscode.postMessage({ command: 'openDocs', target: 'paper' });
		});
	</script>
</body>
</html>`;
}
