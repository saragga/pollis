/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AGENT_BADGE_CSS, AGENT_ICON } from './agentBadge.js';
import { EXPORT_NOTEBOOK_LATEX_COMMAND_ID, MAKE_NOTEBOOK_SLIDES_COMMAND_ID, POLISH_REPORT_COMMAND_ID } from './reports.js';

// Compose > Workflows > Browse Operational Workflows: the workflows that do a job on the user's own work
// (a notebook made into a report, say), where an analytical workflow replicates an analysis. Each one is
// a Pollis command; the page says what it does and runs it.

export const BROWSE_OPERATIONAL_WORKFLOWS_COMMAND_ID = 'pollis.workflows.browseOperational';

/** An operational workflow: a command, what it works on and what it gives. */
interface IOperationalWorkflow {
	readonly command: string;
	readonly title: string;
	readonly description: string;
	readonly input: string;
	readonly output: string;
	/** Whether a coding agent does it, which costs tokens. */
	readonly agent?: boolean;
}

const OPERATIONAL_WORKFLOWS: readonly IOperationalWorkflow[] = [
	{
		command: EXPORT_NOTEBOOK_LATEX_COMMAND_ID,
		title: localize('operationalWorkflows.latex', "Export Notebook as LaTeX"),
		description: localize('operationalWorkflows.latexDescription', "Runs the notebook in the Julia REPL and writes a LaTeX report of its text, printed outputs and figures, or the workflow's own report when it has a LaTeX template, then compiles it. Exporting again refreshes the numbers and keeps your edits."),
		input: localize('operationalWorkflows.notebook', "The notebook in the editor, or one you choose"),
		output: localize('operationalWorkflows.latexOutput', "reports/NAME/report.tex and its PDF, in the Pollis Workspace"),
	},
	{
		command: MAKE_NOTEBOOK_SLIDES_COMMAND_ID,
		title: localize('operationalWorkflows.slides', "Make Slides from a Notebook"),
		description: localize('operationalWorkflows.slidesDescription', "The same as Export Notebook as LaTeX, as beamer slides: a frame for each heading's text, and one for each output and each figure."),
		input: localize('operationalWorkflows.notebook', "The notebook in the editor, or one you choose"),
		output: localize('operationalWorkflows.slidesOutput', "reports/NAME/slides.tex and its PDF, in the Pollis Workspace"),
	},
	{
		command: POLISH_REPORT_COMMAND_ID,
		title: localize('operationalWorkflows.polish', "Polish with Agent"),
		description: localize('operationalWorkflows.polishDescription', "Hands a report or slides that Pollis wrote to your coding agent, to turn the draft into a finished document: sections, tables, captions and citations, from the numbers already computed. A cheaper model can be set for it in Compose > Orchestration > Model Routing."),
		input: localize('operationalWorkflows.tex', "The .tex in the editor"),
		output: localize('operationalWorkflows.polishOutput', "The same .tex, rewritten and compiled"),
		agent: true,
	},
];

type OperationalMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'run'; readonly id: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the page of the operational workflows, or shows it again when it is open. */
function openOperationalWorkflowsPage(accessor: ServicesAccessor): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('operationalWorkflows.title', "Operational Workflows");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.operationalWorkflows',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage((e: { message: OperationalMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			webviewInput.webview.postMessage({ command: 'workflows', workflows: OPERATIONAL_WORKFLOWS });
		} else if (message.command === 'run' && OPERATIONAL_WORKFLOWS.some(workflow => workflow.command === message.id)) {
			commandService.executeCommand(message.id);
		}
	}));
}

/** The page: its texts come from here, the workflows from the `workflows` message. */
function pageHtml(): string {
	const text = {
		title: localize('operationalWorkflows.title', "Operational Workflows"),
		intro: localize('operationalWorkflows.intro', "Each workflow does a job on your own work, where an analytical workflow replicates a published analysis. Those marked Agent are done by your coding agent and cost tokens; the others run in Pollis's Julia REPL."),
		workflow: localize('operationalWorkflows.workflow', "Workflow"),
		input: localize('operationalWorkflows.input', "Works On"),
		output: localize('operationalWorkflows.output', "Gives"),
		agent: localize('operationalWorkflows.agent', "Agent"),
		run: localize('operationalWorkflows.run', "Run"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1400px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { width: 45%; }
		.title { font-size: 14px; font-weight: 600; color: var(--vscode-textLink-foreground); cursor: pointer; }
		.title:hover { text-decoration: underline; }
		.description { margin: 4px 0 0 0; color: var(--vscode-descriptionForeground); }
${AGENT_BADGE_CSS}
		.right { text-align: right; white-space: nowrap; }
		button.action { font: inherit; padding: 3px 12px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.action:hover { background: var(--vscode-button-hoverBackground); }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<table>
		<thead><tr><th>${text.workflow}</th><th>${text.input}</th><th>${text.output}</th><th></th></tr></thead>
		<tbody id="workflows"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const body = document.getElementById('workflows');
	const AGENT_ICON = ${JSON.stringify(AGENT_ICON)};

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function render(workflows) {
		body.textContent = '';
		for (const workflow of workflows) {
			const row = element('tr');
			const name = element('td', 'name');
			const heading = element('div');
			const title = element('span', 'title', workflow.title);
			title.addEventListener('click', () => vscode.postMessage({ command: 'run', id: workflow.command }));
			heading.appendChild(title);
			if (workflow.agent) {
				const badge = element('span', 'agent-badge');
				badge.innerHTML = AGENT_ICON;
				badge.appendChild(document.createTextNode(TEXT.agent));
				heading.appendChild(badge);
			}
			name.appendChild(heading);
			name.appendChild(element('p', 'description', workflow.description));
			row.appendChild(name);
			row.appendChild(element('td', '', workflow.input));
			row.appendChild(element('td', '', workflow.output));
			const action = element('td', 'right');
			const run = element('button', 'action', TEXT.run);
			run.addEventListener('click', () => vscode.postMessage({ command: 'run', id: workflow.command }));
			action.appendChild(run);
			row.appendChild(action);
			body.appendChild(row);
		}
	}

	window.addEventListener('message', event => {
		if (event.data.command === 'workflows') {
			render(event.data.workflows);
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: BROWSE_OPERATIONAL_WORKFLOWS_COMMAND_ID,
			title: localize2('operationalWorkflows.open', "Browse Operational Workflows..."),
			category: localize2('workflows.category', "Workflows"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): void {
		openOperationalWorkflowsPage(accessor);
	}
});
