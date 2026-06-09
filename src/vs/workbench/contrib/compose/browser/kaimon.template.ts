/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getKaimonHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<title>Kaimon</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }

		/* Header */
		.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; }
		.header-left h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px; line-height: 1.2; }
		.header-left .subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0; }
		.btn-github { display: inline-flex; align-items: center; gap: 6px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 7px 14px; font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; flex-shrink: 0; margin-top: 6px; }
		.btn-github:hover { background: var(--vscode-button-secondaryHoverBackground); }

		/* Sections */
		.section { margin: 28px 0; }
		h2 { font-size: 16px; font-weight: 600; margin: 0 0 12px; padding-bottom: 5px; border-bottom: 1px solid var(--vscode-widget-border); }
		p { margin: 8px 0; line-height: 1.6; }
		a { color: var(--vscode-textLink-foreground); cursor: pointer; text-decoration: none; }
		a:hover { text-decoration: underline; }

		/* Code blocks */
		.code-wrap { position: relative; margin: 10px 0; }
		.code-block { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 5px; padding: 14px 16px; padding-right: 70px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; white-space: pre; overflow-x: auto; }
		.copy-btn { position: absolute; top: 7px; right: 8px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 3px; padding: 3px 9px; font-size: 11px; cursor: pointer; opacity: 0.75; }
		.copy-btn:hover { opacity: 1; }
		.code-label { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }

		/* Agent toggle */
		.agent-toggle { display: inline-flex; border: 1px solid var(--vscode-input-border); border-radius: 4px; overflow: hidden; margin-bottom: 14px; }
		.agent-btn { background: transparent; border: none; color: var(--vscode-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 18px; height: 33px; line-height: 33px; }
		.agent-btn.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.agent-btn:not(.active):hover { background: var(--vscode-list-hoverBackground); }
		.agent-config { display: none; }
		.agent-config.visible { display: block; }
		.config-note { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 6px 0 10px; }

		/* Tools table */
		table { border-collapse: collapse; width: 100%; margin: 10px 0; }
		th, td { border: 1px solid var(--vscode-widget-border); padding: 8px 12px; text-align: left; font-size: 12px; }
		th { background: var(--vscode-textCodeBlock-background); font-weight: 600; font-size: 12px; }
		td:first-child { font-weight: 500; white-space: nowrap; }
		td:nth-child(2) { color: var(--vscode-descriptionForeground); font-size: 11px; }

		/* Note box */
		.note { background: var(--vscode-textCodeBlock-background); border-left: 3px solid var(--vscode-textLink-foreground); border-radius: 0 4px 4px 0; padding: 10px 14px; margin: 20px 0; font-size: 12px; line-height: 1.6; color: var(--vscode-descriptionForeground); }
		code { background: var(--vscode-textCodeBlock-background); padding: 1px 5px; border-radius: 3px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; }

		/* Use cases */
		.use-cases { list-style: none; padding: 0; margin: 12px 0 0; }
		.use-case { display: flex; gap: 14px; margin-bottom: 16px; align-items: flex-start; }
		.use-case-num { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
		.use-case-title { font-weight: 600; font-size: 13px; margin: 0 0 3px; }
		.use-case-desc { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 0; line-height: 1.6; }
	</style>
</head>
<body>
<div class="container">

	<!-- Header -->
	<div class="header">
		<div class="header-left">
			<h1>Kaimon</h1>
			<p class="subtitle">MCP Server &mdash; Julia Runtime for AI Agents</p>
		</div>
		<button class="btn-github" id="btn-github">
			<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
				<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
			</svg>
			Open on GitHub
		</button>
	</div>

	<!-- About -->
	<div class="section">
		<p>Kaimon is an open-source MCP server that gives AI agents full access to a live Julia runtime. Connect Claude Code, Cursor, or any MCP-compatible client to an active Julia session and let the agent execute code, inspect packages, run tests, and search your codebase &mdash; rather than generating code blindly.</p>
	</div>

	<!-- Installation -->
	<div class="section">
		<h2>Installation</h2>
		<p>Add the package from the Julia REPL:</p>
		<div class="code-wrap">
			<div class="code-block" id="code-install">] add Kaimon</div>
			<button class="copy-btn" onclick="copyBlock('code-install', this)">Copy</button>
		</div>
	</div>

	<!-- Start a session -->
	<div class="section">
		<h2>Start a Session</h2>
		<p>Load and start the MCP server from any Julia session:</p>
		<div class="code-wrap">
			<div class="code-block" id="code-start">using Kaimon
Kaimon.serve()</div>
			<button class="copy-btn" onclick="copyBlock('code-start', this)">Copy</button>
		</div>
		<p>Kaimon listens on <code>stdio</code> by default, making it compatible with any MCP client that launches a subprocess.</p>
	</div>

	<!-- Connect your agent -->
	<div class="section">
		<h2>Connect Your Agent</h2>
		<p>Add Kaimon to your MCP client configuration file:</p>

		<div class="agent-toggle" id="agent-group">
			<button class="agent-btn active" data-agent="claude">Claude Code</button>
			<button class="agent-btn" data-agent="cursor">Cursor</button>
			<button class="agent-btn" data-agent="other">Other</button>
		</div>

		<div class="agent-config visible" id="config-claude">
			<p class="config-note">Add to <code>~/.claude.json</code> or your project&#39;s <code>.claude/settings.json</code>:</p>
			<div class="code-wrap">
				<div class="code-block" id="code-claude">{
  "mcpServers": {
    "kaimon": {
      "command": "julia",
      "args": ["-e", "using Kaimon; Kaimon.serve()"]
    }
  }
}</div>
				<button class="copy-btn" onclick="copyBlock('code-claude', this)">Copy</button>
			</div>
		</div>

		<div class="agent-config" id="config-cursor">
			<p class="config-note">Add to <code>~/.cursor/mcp.json</code>:</p>
			<div class="code-wrap">
				<div class="code-block" id="code-cursor">{
  "mcpServers": {
    "kaimon": {
      "command": "julia",
      "args": ["-e", "using Kaimon; Kaimon.serve()"]
    }
  }
}</div>
				<button class="copy-btn" onclick="copyBlock('code-cursor', this)">Copy</button>
			</div>
		</div>

		<div class="agent-config" id="config-other">
			<p class="config-note">Generic MCP stdio configuration:</p>
			<div class="code-wrap">
				<div class="code-block" id="code-other">{
  "mcpServers": {
    "kaimon": {
      "command": "julia",
      "args": ["-e", "using Kaimon; Kaimon.serve()"]
    }
  }
}</div>
				<button class="copy-btn" onclick="copyBlock('code-other', this)">Copy</button>
			</div>
		</div>
	</div>

	<!-- Available tools -->
	<div class="section">
		<h2>Available Tools (32+)</h2>
		<table>
			<thead>
				<tr><th>Category</th><th>Tools</th><th>What agents can do</th></tr>
			</thead>
			<tbody>
				<tr>
					<td>Code Execution</td>
					<td style="text-align:center;">~8</td>
					<td>Run expressions and scripts, capture stdout/stderr, manage session state</td>
				</tr>
				<tr>
					<td>Introspection</td>
					<td style="text-align:center;">~8</td>
					<td>Inspect types, methods, modules, docstrings, and loaded packages</td>
				</tr>
				<tr>
					<td>Debugging</td>
					<td style="text-align:center;">~6</td>
					<td>Analyse stack traces, examine variables, diagnose runtime errors</td>
				</tr>
				<tr>
					<td>Testing</td>
					<td style="text-align:center;">~4</td>
					<td>Run test suites, report failures, check coverage</td>
				</tr>
				<tr>
					<td>Semantic Search</td>
					<td style="text-align:center;">~6</td>
					<td>Search code by meaning, find definitions, navigate symbols across packages</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- Use Cases -->
	<div class="section">
		<h2>Example Use Cases</h2>
		<p>Every scenario below requires live runtime state that no language model can access on its own. MCP servers like Kaimon is what makes them possible.</p>
		<ul class="use-cases">
			<li class="use-case">
				<div class="use-case-num">1</div>
				<div>
					<p class="use-case-title">Inspect Live In-Memory Data</p>
					<p class="use-case-desc">A DataFrame is already loaded in the session. The agent calls <code>describe</code>, checks column types and missing values, and writes analysis code precisely tailored to the actual structure &mdash; without the user having to describe it.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">2</div>
				<div>
					<p class="use-case-title">Debug a MethodError</p>
					<p class="use-case-desc">The user's code throws a <code>MethodError</code>. The agent runs <code>typeof</code>, <code>methods</code>, and <code>@which</code> in the live session, pinpoints the exact dispatch failure, applies a fix, and verifies it compiles and runs.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">3</div>
				<div>
					<p class="use-case-title">Discover an Unknown Package API</p>
					<p class="use-case-desc">The user installs a niche or recently-released Julia package absent from the agent's training data. The agent introspects the live package with <code>names</code>, reads actual docstrings, and calls the correct methods &mdash; rather than hallucinating an API.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">4</div>
				<div>
					<p class="use-case-title">Fetch and Analyse Live Market Data</p>
					<p class="use-case-desc">The agent calls <code>YFinance.jl</code> or <code>AlphaVantage.jl</code> for current prices, fits a model, and evaluates it &mdash; all in one session on real, current data that no static LLM can access at inference time.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">5</div>
				<div>
					<p class="use-case-title">Read and Clean an Excel File</p>
					<p class="use-case-desc">The agent uses <code>XLSX.jl</code> to open the user's spreadsheet, inspects sheet names, column types, and missing values, then writes a cleaning pipeline fitted precisely to what it finds &mdash; not to a generic template.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">6</div>
				<div>
					<p class="use-case-title">Query a Macroeconomic Database</p>
					<p class="use-case-desc">The agent queries DBnomics, FRED, or SEC EDGAR via HTTP, inspects the returned data, selects the relevant series, and runs the analysis immediately inside the same Julia session &mdash; no copy-paste, no context switching.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">7</div>
				<div>
					<p class="use-case-title">Profile and Optimise Slow Code</p>
					<p class="use-case-desc">The agent runs <code>@benchmark</code> from BenchmarkTools.jl and <code>@profview</code> on the user's actual code, identifies the bottleneck from real measurements, proposes a fix, and confirms the speedup in the same session.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">8</div>
				<div>
					<p class="use-case-title">Query Analytical and Vector Databases</p>
					<p class="use-case-desc">Via DuckDB and LanceDB MCP servers, the agent queries analytical tables and vector stores that live entirely outside its context window &mdash; joining datasets, running aggregations, or performing semantic search against embeddings the model has never seen.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">9</div>
				<div>
					<p class="use-case-title">Scrape and Analyse Live Web Data</p>
					<p class="use-case-desc">A Playwright MCP server lets the agent navigate pages, extract tables, and capture content from sites with no public API &mdash; then pass the results directly into the Julia session for immediate analysis.</p>
				</div>
			</li>
			<li class="use-case">
				<div class="use-case-num">10</div>
				<div>
					<p class="use-case-title">Polyglot Workflows Across Julia, Python, and R</p>
					<p class="use-case-desc">Kaimon covers the Julia runtime; equivalent MCP servers exist for Python and R. A single agent can execute code in all three languages within one conversation &mdash; calling a Python ML library, passing results to Julia for simulation, and formatting output with R.</p>
				</div>
			</li>
		</ul>
	</div>

	<div class="note">
		Tool counts and startup commands may change as Kaimon evolves. Always refer to the
		<a id="link-docs" href="#">GitHub repository</a> for the latest installation and configuration instructions.
	</div>

</div>
<script>
	var vscode = acquireVsCodeApi();

	// GitHub button and docs link
	document.getElementById('btn-github').addEventListener('click', function() {
		vscode.postMessage({ command: 'openUrl', url: 'https://github.com/kahliburke/Kaimon.jl' });
	});
	document.getElementById('link-docs').addEventListener('click', function(e) {
		e.preventDefault();
		vscode.postMessage({ command: 'openUrl', url: 'https://github.com/kahliburke/Kaimon.jl' });
	});

	// Agent toggle
	var AGENTS = ['claude', 'cursor', 'other'];
	document.getElementById('agent-group').addEventListener('click', function(e) {
		var btn = e.target.closest('[data-agent]');
		if (!btn) { return; }
		var agent = btn.dataset.agent;
		document.querySelectorAll('.agent-btn').forEach(function(b) {
			b.classList.toggle('active', b.dataset.agent === agent);
		});
		AGENTS.forEach(function(a) {
			var el = document.getElementById('config-' + a);
			if (el) { el.classList.toggle('visible', a === agent); }
		});
	});

	// Copy blocks
	function copyBlock(id, btn) {
		var text = document.getElementById(id).textContent;
		navigator.clipboard.writeText(text).then(function() {
			var orig = btn.textContent;
			btn.textContent = 'Copied!';
			setTimeout(function() { btn.textContent = orig; }, 2000);
		});
	}
</script>
</body>
</html>`;
}
