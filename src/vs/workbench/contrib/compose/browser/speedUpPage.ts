/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { SPEEDUP_METADATA } from '../../model/browser/webviews/speedUp.data.js';
import { buildWebviewHtml, colorizeBracketsJs } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { SPEED_UP_WITH_AGENT_COMMAND_ID, skillFile, startAgent } from './pollisAgents.js';

// Speed Up a Function, from Compose > Profiling (compose.contribution.ts). A page of the scaffold in the Time Arrow
// style, in four steps, each running its code in the Julia REPL: 1, The Function, the call to speed up, with the
// example defined when it is the default; 2, Diagnose, its type stability (JET), its allocations (BenchmarkTools) or its
// profile (@profview); 3, Change, the faster version, the example's written out, or asked of the coding agent with
// Speed Up with Agent and the speed-up-function skill; 4, Compare, the same result first, then the times and judge.

export const SPEED_UP_COMMAND_ID = 'pollis.profiling.speedUp';

/** The function, the call and the faster version of the example. */
const EXAMPLE_FUNCTION = 'slow_var';
const EXAMPLE_ARGUMENTS = 'x';
const EXAMPLE_FASTER = 'fast_var';

/** The data and the slow function of the example, which step 1 runs and Speed Up with Agent saves to a file. */
const EXAMPLE_CODE = `using Random
x = randn(Xoshiro(1), 10_000);  # 10 000 simulated values: replace them with your own data

# The sample variance, written slowly on purpose: the mean is computed again in each pass of the loop,
# and the sum starts as the integer 0 and becomes a Float64, so its type changes in the loop
function slow_var(x)
	s = 0
	for i in eachindex(x)
		m = sum(x) / length(x)
		s += (x[i] - m)^2
	end
	return s / (length(x) - 1)
end`;

/** The faster version of the example, which step 3 runs. */
const EXAMPLE_FASTER_CODE = `# The sample variance with the two fixes: the mean computed once, before the loop,
# and the sum started as a zero of the type of the values, so its type stays the same in the loop
function fast_var(x)
	m = sum(x) / length(x)
	s = zero(eltype(x))
	for i in eachindex(x)
		s += (x[i] - m)^2
	end
	return s / (length(x) - 1)
end`;

/** Where Speed Up with Agent saves the example, for the agent to read, in ~/.pollis. */
const EXAMPLE_FOLDER = ['.pollis', 'speedup'];

type Diagnosis = 'types' | 'allocations' | 'profile';

/** The code boxes of the page, by the id of their element. */
type CodeBox = 'defineCode' | 'diagnoseCode' | 'changeCode' | 'compareCode';
const CODE_BOXES: readonly CodeBox[] = ['defineCode', 'diagnoseCode', 'changeCode', 'compareCode'];

/** The inputs of the page, as its script sends them. */
interface ISpeedUpInputs {
	readonly function: string;
	readonly arguments: string;
	readonly faster: string;
	readonly diagnosis: Diagnosis;
}

type SpeedUpMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'draft'; readonly inputs: ISpeedUpInputs }
	| { readonly command: 'run'; readonly box: CodeBox; readonly inputs: ISpeedUpInputs }
	| { readonly command: 'agent'; readonly inputs: ISpeedUpInputs };

/** A function's name, as a call writes it: a name, or names joined by dots, Module.f. */
function isFunctionName(name: string): boolean {
	return /^[A-Za-z_][A-Za-z0-9_!]*(?:\.[A-Za-z_][A-Za-z0-9_!]*)*$/.test(name);
}

/** The inputs trimmed, with their checks: the names must be names, and the arguments fit on one line. */
function checked(inputs: ISpeedUpInputs): { readonly fn: string; readonly args: string; readonly faster: string; readonly diagnosis: Diagnosis; readonly valid: boolean; readonly fasterValid: boolean } {
	const fn = inputs.function.trim();
	const args = inputs.arguments.trim();
	const faster = inputs.faster.trim();
	const diagnosis = inputs.diagnosis === 'allocations' || inputs.diagnosis === 'profile' ? inputs.diagnosis : 'types';
	const valid = isFunctionName(fn) && !/[\r\n]/.test(args);
	return { fn, args, faster, diagnosis, valid, fasterValid: valid && isFunctionName(faster) && faster !== fn };
}

/**
 * The arguments of a call, interpolated for BenchmarkTools: `$x` for a variable, `$(expr)` for an expression, so that
 * the benchmark times the function and not the reading of globals. Keyword arguments, and arguments it cannot split,
 * are left as written.
 */
function interpolated(args: string): string {
	const parts: string[] = [];
	let depth = 0;
	let start = 0;
	let quote = '';
	for (let i = 0; i < args.length; i++) {
		const c = args[i];
		if (quote) {
			if (c === '\\') {
				i++;
			} else if (c === quote) {
				quote = '';
			}
		} else if (c === '"') {
			quote = c;
		} else if ('([{'.includes(c)) {
			depth++;
		} else if (')]}'.includes(c)) {
			depth--;
		} else if (c === ',' && depth === 0) {
			parts.push(args.slice(start, i).trim());
			start = i + 1;
		}
	}
	parts.push(args.slice(start).trim());
	if (depth !== 0 || quote || parts.some(part => !part || part.includes(';') || /^[A-Za-z_][\w!]*\s*=(?!=)/.test(part))) {
		return args;
	}
	return parts.map(part => /^[A-Za-z_][\w!]*$/.test(part) ? `$${part}` : /^[\d._eE+-]+$/.test(part) ? part : `$(${part})`).join(', ');
}

/** The code of each box, for the inputs. */
function boxCode(box: CodeBox, inputs: ISpeedUpInputs): string {
	const { fn, args, faster, diagnosis } = checked(inputs);
	const call = `${fn}(${args})`;
	const benchCall = (name: string) => `${name}(${interpolated(args)})`;
	switch (box) {
		case 'defineCode':
			return fn === EXAMPLE_FUNCTION
				? `${EXAMPLE_CODE}\n\n${call}`
				: `${call}  # the call the next steps diagnose and time: define ${fn} first`;
		case 'diagnoseCode':
			if (diagnosis === 'allocations') {
				return [
					'using BenchmarkTools',
					`allocations = @ballocations ${benchCall(fn)} samples = 1 evals = 1`,
					`bytes = @ballocated ${benchCall(fn)} samples = 1 evals = 1`,
					'println("Allocations per call: ", allocations)',
					'println("Bytes per call:       ", bytes)',
				].join('\n');
			}
			if (diagnosis === 'profile') {
				return [
					`${call};  # a first call compiles ${fn}, so that compiling is not in the profile`,
					'@profview for _ in 1:5  # the flame graph of five calls, in a tab of Pollis',
					`    ${call}`,
					'end',
				].join('\n');
			}
			return [
				'using JET',
				`@code_warntype ${call}  # the variables Julia cannot give one concrete type are in colour`,
				`@report_opt ${call}  # each call Julia can only resolve while the code runs, and where it is`,
			].join('\n');
		case 'changeCode':
			return fn === EXAMPLE_FUNCTION && faster === EXAMPLE_FASTER ? EXAMPLE_FASTER_CODE : '';
		case 'compareCode':
			return [
				'using BenchmarkTools',
				`before_result = ${call};`,
				`after_result = ${faster}(${args});`,
				'same = isequal(before_result, after_result) || (applicable(isapprox, before_result, after_result) && isapprox(before_result, after_result))',
				`println(same ? "Same result from ${fn} and ${faster}" : "Different results: compare before_result, from ${fn}, with after_result, from ${faster}, before the times")`,
				`before_times = @benchmark ${benchCall(fn)} seconds = 1;`,
				`after_times = @benchmark ${benchCall(faster)} seconds = 1;`,
				'# BenchmarkTools gives times in nanoseconds',
				`println("${fn}: ", round(minimum(before_times).time / 1e3, sigdigits = 4), " microseconds, ", before_times.allocs, " allocations per call")`,
				`println("${faster}: ", round(minimum(after_times).time / 1e3, sigdigits = 4), " microseconds, ", after_times.allocs, " allocations per call")`,
				`println("${faster} is ", round(minimum(before_times).time / minimum(after_times).time, sigdigits = 3), " times as fast as ${fn}")`,
				'judge(median(after_times), median(before_times))  # improvement, regression, or invariant when the medians are within 5% of each other',
			].join('\n');
	}
}

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

async function openSpeedUpPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const languageService = accessor.get(ILanguageService);
	const themeService = accessor.get(IThemeService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('speedUp.title', "Speed Up a Function");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.speedUp',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'speedUp', title, SPEEDUP_METADATA.speedUp, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The code of each box, and how many times each has been set. */
	const codes = new Map<CodeBox, string>();
	const codeVersions = new Map<CodeBox, number>();
	/** Shows `code` in a code box, coloured as Example Code colours it: the theme's tokens, then its brackets by depth. */
	const postCode = async (box: CodeBox, code: string): Promise<void> => {
		codes.set(box, code);
		// Tokenizing is async: drop a result that a newer code has already overtaken.
		const version = (codeVersions.get(box) ?? 0) + 1;
		codeVersions.set(box, version);
		const html = code ? await tokenizeToString(languageService, code, 'julia') : '';
		if (codeVersions.get(box) !== version) {
			return;
		}
		const colorMap = TokenizationRegistry.getColorMap();
		post({ command: 'colorizedCode', box, html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '' });
	};
	const postCodes = (inputs: ISpeedUpInputs) => {
		for (const box of CODE_BOXES) {
			const code = boxCode(box, inputs);
			if (code !== codes.get(box)) {
				postCode(box, code);
			}
		}
	};
	disposables.add(themeService.onDidColorThemeChange(() => {
		for (const [box, code] of codes) {
			postCode(box, code);
		}
	}));

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: SpeedUpMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			post({ command: 'state', inputs: { function: EXAMPLE_FUNCTION, arguments: EXAMPLE_ARGUMENTS, faster: EXAMPLE_FASTER, diagnosis: 'types' } });
		} else if (message.command === 'draft' && hasKey(message, { inputs: true })) {
			postCodes(message.inputs);
		} else if (message.command === 'run' && hasKey(message, { box: true, inputs: true }) && CODE_BOXES.includes(message.box)) {
			const inputs = checked(message.inputs);
			const code = boxCode(message.box, message.inputs);
			if (!inputs.valid || !code || (message.box === 'compareCode' && !inputs.fasterValid)) {
				return;
			}
			await sendToJuliaRepl(code, commandService);
			post({ command: 'sent', box: message.box });
		} else if (message.command === 'agent' && hasKey(message, { inputs: true })) {
			await commandService.executeCommand(SPEED_UP_WITH_AGENT_COMMAND_ID, message.inputs);
		}
	}));
}

/**
 * Hands the function of the page to the user's coding agent, with the speed-up-function skill: the agent finds it,
 * diagnoses it and writes the faster version in a new file beside it. The example has no file of its own, so it is
 * saved to ~/.pollis/speedup first. From elsewhere than the page, with no inputs, the page opens.
 */
async function speedUpWithAgent(accessor: ServicesAccessor, inputs?: ISpeedUpInputs): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const instantiationService = accessor.get(IInstantiationService);
	const commandService = accessor.get(ICommandService);
	const input = inputs && hasKey(inputs, { function: true, arguments: true, faster: true }) ? checked(inputs) : undefined;
	if (!input) {
		await commandService.executeCommand(SPEED_UP_COMMAND_ID);
		return;
	}
	if (!input.fasterValid) {
		throw new Error(localize('speedUp.agent.names', "Name the function in step 1 and its faster version in step 3, each a Julia name, the two different."));
	}
	const skill = await instantiationService.invokeFunction(skillFile, 'speed-up-function');
	if (!skill) {
		return;
	}
	const call = `${input.fn}(${input.args})`;
	let folder: URI | undefined;
	let prompt: string;
	if (input.fn === EXAMPLE_FUNCTION) {
		folder = joinPath(await pathService.userHome({ preferLocal: true }), ...EXAMPLE_FOLDER);
		const file = joinPath(folder, `${EXAMPLE_FUNCTION}.jl`);
		await fileService.writeFile(file, VSBuffer.fromString(`${EXAMPLE_CODE}\n`));
		prompt = localize('speedUp.agent.examplePrompt', "Read the skill {0} and follow its instructions to speed up the Julia function {1} with me, defined in {2}. It is called as {3}, and its faster version is to be named {4}.", skill.fsPath, input.fn, file.fsPath, call, input.faster);
	} else {
		prompt = localize('speedUp.agent.prompt', "Read the skill {0} and follow its instructions to speed up the Julia function {1} with me. It is called as {2}, and its faster version is to be named {3}.", skill.fsPath, input.fn, call, input.faster);
	}
	await instantiationService.invokeFunction(startAgent, localize('speedUp.agent.terminal', "Speed Up {0}", input.fn), prompt, folder, 'speedUp');
}

function pageHtml(): string {
	const text = {
		title: localize('speedUp.title', "Speed Up a Function"),
		intro: localize('speedUp.intro', "Speed Up a Function takes a Julia function from slow to fast in four steps: the call to speed up, a diagnosis of where its time goes, a faster version of it, and a comparison of the two, which checks first that they give the same result. Each step runs its code in the Julia REPL. The example is a sample variance written slowly on purpose; set your own function and its call in step 1."),
		function: localize('speedUp.function', "The Function"),
		functionName: localize('speedUp.functionName', "Function"),
		arguments: localize('speedUp.arguments', "Arguments"),
		argumentsPlaceholder: localize('speedUp.argumentsPlaceholder', "As written in the call, such as x, 100"),
		exampleHint: localize('speedUp.exampleHint', "The example defines x, 10 000 simulated values, and {0}, their sample variance computed slowly. Run it before the next steps.", `<code>${EXAMPLE_FUNCTION}</code>`),
		ownHint: localize('speedUp.ownHint', "Define your function in the Julia REPL first, or run the file that defines it: the next steps call it as written here, with arguments the REPL has."),
		code: localize('speedUp.code', "Julia Code"),
		run: localize('speedUp.run', "Run"),
		sent: localize('speedUp.sent', "Sent to the Julia REPL: the results show there."),
		sentProfile: localize('speedUp.sentProfile', "Sent to the Julia REPL: the flame graph opens in a tab of Pollis."),
		needFunction: localize('speedUp.needFunction', "The function must be a Julia name, such as {0} or {1}, and the arguments fit on one line.", '<code>f</code>', '<code>MyModule.f</code>'),
		needFaster: localize('speedUp.needFaster', "The faster version must be a Julia name, other than the function's."),
		diagnose: localize('speedUp.diagnose', "Diagnose"),
		diagnoseIntro: localize('speedUp.diagnoseIntro', "Before changing any code, find out where its time goes: a guess at the cause is often wrong. Each diagnosis below looks at one cause."),
		diagnoses: {
			types: localize('speedUp.types', "Type Stability"),
			allocations: localize('speedUp.allocations', "Allocations"),
			profile: localize('speedUp.profile', "Profile"),
		},
		diagnosisHints: {
			types: localize('speedUp.typesHint', "{0} prints the type Julia infers for each variable, in colour where it cannot settle on one concrete type, a Union or Any. {1}, of JET, lists each call that Julia can only resolve while the code runs. Both point at code whose types change, which costs time on every pass.", '<code>@code_warntype</code>', '<code>@report_opt</code>'),
			allocations: localize('speedUp.allocationsHint', "How many times one call allocates memory on the heap, and how many bytes. A function that allocates in a loop spends time making objects and collecting them as garbage; no allocations at all say that the time goes elsewhere."),
			profile: localize('speedUp.profileHint', "The flame graph of five calls, in a tab of Pollis: the widest frames at the top edge are where the time goes. Reading a Flame Graph, in Learn More of Find Where the Time Goes, says how to read it."),
		},
		change: localize('speedUp.change', "Change"),
		faster: localize('speedUp.faster', "Faster Version"),
		changeIntro: localize('speedUp.changeIntro', "Write the faster version, a changed version of the function that keeps its result, in a file or in the Julia REPL, and run it. The usual changes, each explained in Common Ways to Speed Up Julia Code, in Learn More:"),
		fixes: [
			localize('speedUp.fix.zero', "Start a sum at a zero of the type of the values, {0}, not at the integer 0, so that its type stays the same.", '<code>zero(eltype(x))</code>'),
			localize('speedUp.fix.globals', "Pass data to the function as arguments, or declare a global {0}, rather than read a global variable inside it.", '<code>const</code>'),
			localize('speedUp.fix.hoist', "Move out of a loop the work whose result does not change from one pass to the next."),
			localize('speedUp.fix.preallocate', "Allocate an array once, before the loop, and fill it in place, with the functions whose names end in {0}.", '<code>!</code>'),
			localize('speedUp.fix.views', "Take a slice of an array with {0}, which reads it without copying it.", '<code>@views</code>'),
			localize('speedUp.fix.order', "Loop over the first index of a matrix in the innermost loop: Julia stores a matrix column by column."),
			localize('speedUp.fix.inbounds', "Mark a loop {0} and {1} once its indices are known to be valid.", '<code>@inbounds</code>', '<code>@simd</code>'),
		],
		exampleChange: localize('speedUp.exampleChange', "The example's faster version, below, makes the first and third changes."),
		ownChange: localize('speedUp.ownChange', "Write the faster version yourself, or ask your coding agent for it with Speed Up with Agent."),
		agentHint: localize('speedUp.agentHint', "Speed Up with Agent asks your coding agent to find the function and diagnose it, then explain its plan: each change it proposes, with what in the diagnosis calls for it. Once you agree, it writes the faster version in a new file beside the function's, with the reason for each change in a comment, and checks that it gives the same result; the function's own file is not changed. Step 4 then compares the two."),
		agentExampleHint: localize('speedUp.agentExampleHint', "For the example, Pollis first saves it to {0}, for the agent to read.", '<span class="yellow">~/.pollis/speedup/slow_var.jl</span>'),
		agent: localize('speedUp.agent', "Speed Up with Agent"),
		compare: localize('speedUp.compare', "Compare"),
		compareIntro: localize('speedUp.compareIntro', "Compare checks first that the two versions give the same result, to rounding: a faster function that gives another answer is not a speed-up. BenchmarkTools then times each for a second, and gives the minimum time and the allocations of a call, how many times as fast the change made it, and the verdict of judge on the medians: improvement, regression, or invariant when they are within 5% of each other."),
	};
	const diagnosisRadios = (['types', 'allocations', 'profile'] as const)
		.map(d => `<label><input type="radio" name="diagnosis" value="${d}"${d === 'types' ? ' checked' : ''}> ${text.diagnoses[d]}</label>`).join('');
	const codeBlock = (box: CodeBox, buttons: string) => `
		<h3 class="part" id="${box}Title">${text.code}</h3>
		<pre class="speed-code" id="${box}"></pre>
		<div class="settings"><span class="bar">${buttons}</span></div>
		<div class="small status" id="${box}Status"></div>`;
	const runButton = (box: CodeBox) => `<button class="action current" id="${box}Run">${text.run}</button>`;
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		omitPoweredBy: !SPEEDUP_METADATA.speedUp.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; min-width: 18em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		/* The fields to fill in: their border always in the blue of a focused field, as the Ask Pollis box's is */
		#function, #arguments, #faster { border-color: var(--vscode-focusBorder); }
		input::placeholder { color: var(--vscode-input-placeholderForeground); }
		.speed-code { margin: 6px 0 0; padding: 10px 12px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); white-space: pre; overflow-x: auto; tab-size: 4; max-width: 900px; }
		.choices label { margin-right: 16px; }
		.fixes { margin: 4px 0 8px; padding-left: 20px; max-width: 900px; }
		.fixes li { margin: 2px 0; }
`,
		steps: [
			{
				id: 'step-function',
				title: text.function,
				bodyHtml: `
		<div class="row">
			<span class="small">${text.functionName}</span> <input type="text" id="function" spellcheck="false">
			<span class="small">${text.arguments}</span> <input type="text" id="arguments" spellcheck="false" placeholder="${text.argumentsPlaceholder}">
		</div>
		<p class="hint" id="functionHint"></p>
		${codeBlock('defineCode', runButton('defineCode'))}
`,
			},
			{
				id: 'step-diagnose',
				title: text.diagnose,
				bodyHtml: `
		<p class="hint">${text.diagnoseIntro}</p>
		<div class="row choices">${diagnosisRadios}</div>
		<p class="hint" id="diagnosisHint"></p>
		${codeBlock('diagnoseCode', runButton('diagnoseCode'))}
`,
			},
			{
				id: 'step-change',
				title: text.change,
				bodyHtml: `
		<p class="hint">${text.changeIntro}</p>
		<ul class="fixes hint">${text.fixes.map(fix => `<li>${fix}</li>`).join('')}</ul>
		<div class="row"><span class="small">${text.faster}</span> <input type="text" id="faster" spellcheck="false"></div>
		<p class="hint" id="changeHint"></p>
		<p class="hint">${text.agentHint} <span id="agentExampleHint">${text.agentExampleHint}</span></p>
		${codeBlock('changeCode', `${runButton('changeCode')}<button class="action" id="agent">${text.agent}</button>`)}
`,
			},
			{
				id: 'step-compare',
				title: text.compare,
				bodyHtml: `
		<p class="hint">${text.compareIntro}</p>
		${codeBlock('compareCode', runButton('compareCode'))}
`,
			},
		],
		pageScriptJs: `
	${colorizeBracketsJs}
	const TEXT = ${JSON.stringify(text)};
	const EXAMPLE_FUNCTION = ${JSON.stringify(EXAMPLE_FUNCTION)};
	const EXAMPLE_FASTER = ${JSON.stringify(EXAMPLE_FASTER)};
	const BOXES = ${JSON.stringify(CODE_BOXES)};
	const functionInput = document.getElementById('function');
	const argumentsInput = document.getElementById('arguments');
	const fasterInput = document.getElementById('faster');
	const NAME = /^[A-Za-z_][A-Za-z0-9_!]*(?:\\.[A-Za-z_][A-Za-z0-9_!]*)*$/;

	function inputs() {
		const checkedRadio = document.querySelector('input[name=diagnosis]:checked');
		return { function: functionInput.value, arguments: argumentsInput.value, faster: fasterInput.value, diagnosis: checkedRadio ? checkedRadio.value : 'types' };
	}
	function validity() {
		const fn = functionInput.value.trim();
		const faster = fasterInput.value.trim();
		const valid = NAME.test(fn) && !/[\\r\\n]/.test(argumentsInput.value);
		return { fn, faster, valid, fasterValid: valid && NAME.test(faster) && faster !== fn };
	}
	function render() {
		const { fn, faster, valid, fasterValid } = validity();
		const example = fn === EXAMPLE_FUNCTION;
		const exampleChange = example && faster === EXAMPLE_FASTER;
		document.getElementById('functionHint').innerHTML = example ? TEXT.exampleHint : TEXT.ownHint;
		const diagnosis = inputs().diagnosis;
		document.getElementById('diagnosisHint').innerHTML = TEXT.diagnosisHints[diagnosis];
		document.getElementById('changeHint').textContent = exampleChange ? TEXT.exampleChange : TEXT.ownChange;
		document.getElementById('agentExampleHint').hidden = !example;
		for (const id of ['changeCode', 'changeCodeTitle', 'changeCodeRun']) {
			document.getElementById(id).hidden = !exampleChange;
		}
		for (const box of ['defineCode', 'diagnoseCode']) {
			document.getElementById(box + 'Run').disabled = !valid;
		}
		document.getElementById('changeCodeRun').disabled = !fasterValid;
		document.getElementById('compareCodeRun').disabled = !fasterValid;
		document.getElementById('agent').disabled = !fasterValid;
		const defineStatus = document.getElementById('defineCodeStatus');
		if (!valid) {
			defineStatus.innerHTML = TEXT.needFunction;
			defineStatus.classList.add('missing');
		} else if (defineStatus.classList.contains('missing')) {
			defineStatus.textContent = '';
			defineStatus.classList.remove('missing');
		}
		const compareStatus = document.getElementById('compareCodeStatus');
		if (valid && !fasterValid) {
			compareStatus.textContent = TEXT.needFaster;
			compareStatus.classList.add('missing');
		} else if (compareStatus.classList.contains('missing')) {
			compareStatus.textContent = '';
			compareStatus.classList.remove('missing');
		}
	}
	function sendDraft() {
		render();
		for (const box of BOXES) {
			const status = document.getElementById(box + 'Status');
			if (!status.classList.contains('missing')) {
				status.textContent = '';
			}
		}
		vscode.postMessage({ command: 'draft', inputs: inputs() });
	}
	for (const input of [functionInput, argumentsInput, fasterInput]) {
		input.addEventListener('input', sendDraft);
	}
	for (const radio of document.querySelectorAll('input[name=diagnosis]')) {
		radio.addEventListener('change', sendDraft);
	}
	for (const box of BOXES) {
		document.getElementById(box + 'Run').addEventListener('click', () => vscode.postMessage({ command: 'run', box, inputs: inputs() }));
	}
	document.getElementById('agent').addEventListener('click', () => vscode.postMessage({ command: 'agent', inputs: inputs() }));

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			functionInput.value = message.inputs.function;
			argumentsInput.value = message.inputs.arguments;
			fasterInput.value = message.inputs.faster;
			sendDraft();
		} else if (message.command === 'colorizedCode') {
			document.getElementById('mtk-theme').textContent = message.css;
			const box = document.getElementById(message.box);
			box.innerHTML = message.html;
			colorizeBrackets(box, '#');
		} else if (message.command === 'sent') {
			const status = document.getElementById(message.box + 'Status');
			status.classList.remove('missing');
			status.textContent = message.box === 'diagnoseCode' && inputs().diagnosis === 'profile' ? TEXT.sentProfile : TEXT.sent;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: SPEED_UP_COMMAND_ID, title: localize2('speedUp.action', "Speed Up a Function..."), category: localize2('profiling.category', "Profiling"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openSpeedUpPage(accessor);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: SPEED_UP_WITH_AGENT_COMMAND_ID, title: localize2('speedUp.agentAction', "Speed Up with Agent..."), category: localize2('profiling.category', "Profiling"), f1: true });
	}
	run(accessor: ServicesAccessor, inputs?: ISpeedUpInputs): Promise<void> {
		return speedUpWithAgent(accessor, inputs);
	}
});
