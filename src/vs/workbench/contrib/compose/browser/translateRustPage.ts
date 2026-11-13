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
import { TRANSLATERUST_METADATA } from '../../model/browser/webviews/translateRust.data.js';
import { buildWebviewHtml, colorizeBracketsJs } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { skillFile, startAgent, TRANSLATE_WITH_AGENT_COMMAND_ID } from './pollisAgents.js';
import { compareCode, isFunctionName } from './speedUpPage.js';

// Translate Julia to Rust, from Compose > Compilation Lab (compose.contribution.ts). A page of the scaffold in the Time
// Arrow style, in four steps: 1, The Function, the call to translate, with the example (the Mandelbrot set or the Julia
// set of c) defined when it is the default; 2, Translate, the example's Rust crate and the Julia function that calls it,
// written out, or asked of the coding agent with Translate with Agent and the translate-to-rust skill; 3, Build, cargo
// build of the crate and the Julia function that calls it; 4, Compare, the same result first, then the times.

export const TRANSLATE_RUST_COMMAND_ID = 'pollis.compilation.translateRust';

type Example = 'mandelbrot' | 'julia';

/** The function, the call and the Rust version of the example. */
const EXAMPLE_FUNCTION = 'fractal_counts';
const EXAMPLE_ARGUMENTS = 'x0, y0, spacing, height, width, julia_set, c, maxiter';
const EXAMPLE_RUST = 'fractal_counts_rust';

/** The data and the Julia function of the example, which step 1 runs and Translate with Agent saves to a file. */
function exampleCode(example: Example): string {
	const julia = example === 'julia';
	return `# The example: ${julia ? 'the Julia set of c' : 'the Mandelbrot set'}, on a grid of 800 pixels across
julia_set = ${julia}
c = complex(-0.8, 0.156)  # the fixed point of the Julia set; the Mandelbrot set does not use it
x0, x1, y0, y1 = ${julia ? '-1.6, 1.6, -1.0, 1.0' : '-2.2, 0.8, -1.2, 1.2'}
width = 800
height = round(Int, width * (y1 - y0) / (x1 - x0))
spacing = (x1 - x0) / (width - 1)  # the distance between two pixels, across and down
maxiter = Int32(256)

# The iterations of z^2 + c before |z| passes 2, for one pixel, written with real numbers
function escape_time(zr, zi, cr, ci, maxiter::Int32)
	k = zero(maxiter)
	while k < maxiter
		zr2 = zr * zr
		zi2 = zi * zi
		zr2 + zi2 > 4.0 && return k
		zi = 2.0 * zr * zi + ci
		zr = zr2 - zi2 + cr
		k += one(maxiter)
	end
	return maxiter
end

# The count of every pixel, as a matrix: the imaginary part down the rows, the real part across the columns
function fractal_counts(x0, y0, spacing, height, width, julia_set, c, maxiter)
	counts = Matrix{Int32}(undef, height, width)
	for j in 1:width, i in 1:height
		x = x0 + (j - 1) * spacing
		y = y0 + (i - 1) * spacing
		counts[i, j] = julia_set ? escape_time(x, y, real(c), imag(c), maxiter) : escape_time(0.0, 0.0, x, y, maxiter)
	end
	return counts
end`;
}

/** The crate of the example, which step 2 shows and Build writes to ~/.pollis/rust/fractal. */
const CRATE_FOLDER = ['.pollis', 'rust', 'fractal'];
const CARGO_TOML = `[package]
name = "fractal"
version = "0.1.0"
edition = "2024"

# A C dynamic library, which Julia opens and calls with @ccall
[lib]
crate-type = ["cdylib"]
`;
const LIB_RS = `// fractal_counts translated to Rust: the count of every pixel of the Mandelbrot set or of the Julia set of c,
// written into a matrix that Julia allocates and owns, column by column

/// The iterations of z^2 + c before |z| passes 2, for one pixel, with the operations of escape_time in Julia, in the
/// same order. Rust never fuses a multiplication and an addition unless the code calls mul_add
fn escape_time(mut zr: f64, mut zi: f64, cr: f64, ci: f64, maxiter: i32) -> i32 {
	let mut k = 0;
	while k < maxiter {
		let zr2 = zr * zr;
		let zi2 = zi * zi;
		if zr2 + zi2 > 4.0 {
			return k;
		}
		zi = 2.0 * zr * zi + ci;
		zr = zr2 - zi2 + cr;
		k += 1;
	}
	maxiter
}

/// The count of every pixel, called from Julia with @ccall. no_mangle keeps the name fill_counts in the library, and
/// extern "C" takes the arguments as C passes them; c arrives as its real and imaginary parts.
///
/// # Safety
/// counts must point at height * width values of i32 that Julia keeps alive during the call.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn fill_counts(counts: *mut i32, height: i64, width: i64, x0: f64, y0: f64, spacing: f64,
		julia_set: i32, cr: f64, ci: f64, maxiter: i32) {
	// The Julia matrix as a Rust slice, column by column: pixel (i, j), counted from 1 in Julia, is at
	// i + j * height here, counted from 0
	let counts = unsafe { std::slice::from_raw_parts_mut(counts, (height * width) as usize) };
	for j in 0..width {
		for i in 0..height {
			let x = x0 + j as f64 * spacing;
			let y = y0 + i as f64 * spacing;
			counts[(i + j * height) as usize] = if julia_set != 0 {
				escape_time(x, y, cr, ci, maxiter)
			} else {
				escape_time(0.0, 0.0, x, y, maxiter)
			};
		}
	}
}
`;

/** The Julia function that calls the example's crate, with the arguments and the result of fractal_counts. */
const EXAMPLE_WRAPPER = `using Libdl

# The library cargo built, as the system names it: libfractal.dylib on macOS, libfractal.so on Linux, fractal.dll on Windows
const fractal_library = joinpath(homedir(), ".pollis", "rust", "fractal", "target", "release", (Sys.iswindows() ? "" : "lib") * "fractal." * Libdl.dlext)

# The same arguments and the same result as fractal_counts: Julia allocates the matrix and passes its pointer, which
# @ccall keeps valid during the call; c crosses as its real and imaginary parts, julia_set as a 32-bit integer
function fractal_counts_rust(x0, y0, spacing, height, width, julia_set, c, maxiter)
	counts = Matrix{Int32}(undef, height, width)
	@ccall fractal_library.fill_counts(counts::Ptr{Int32}, height::Int64, width::Int64, x0::Float64, y0::Float64,
		spacing::Float64, julia_set::Int32, real(c)::Float64, imag(c)::Float64,
		maxiter::Int32)::Cvoid
	return counts
end`;

/** Where Translate with Agent saves the example, for the agent to read, in ~/.pollis. */
const EXAMPLE_FOLDER = ['.pollis', 'rust'];

/** The code boxes of the page, by the id of their element, with the language that colours each. */
type CodeBox = 'defineCode' | 'cargoCode' | 'rustCode' | 'wrapperCode' | 'buildCode' | 'compareCode';
const CODE_BOXES: readonly CodeBox[] = ['defineCode', 'cargoCode', 'rustCode', 'wrapperCode', 'buildCode', 'compareCode'];
const BOX_LANGUAGES: Record<CodeBox, string> = { defineCode: 'julia', cargoCode: 'ini', rustCode: 'rust', wrapperCode: 'julia', buildCode: 'julia', compareCode: 'julia' };

/** The code boxes with a Run button, whose code goes to the Julia REPL. */
type RunBox = 'defineCode' | 'buildCode' | 'compareCode';
const RUN_BOXES: readonly RunBox[] = ['defineCode', 'buildCode', 'compareCode'];

/** The inputs of the page, as its script sends them. */
interface ITranslateRustInputs {
	readonly example: Example;
	readonly function: string;
	readonly arguments: string;
	readonly rust: string;
}

type TranslateRustMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'draft'; readonly inputs: ITranslateRustInputs }
	| { readonly command: 'run'; readonly box: RunBox; readonly inputs: ITranslateRustInputs }
	| { readonly command: 'agent'; readonly inputs: ITranslateRustInputs };

/** The inputs trimmed, with their checks: the names must be names, different, and the arguments fit on one line. */
function checked(inputs: ITranslateRustInputs): { readonly example: Example; readonly fn: string; readonly args: string; readonly rust: string; readonly valid: boolean; readonly rustValid: boolean; readonly isExample: boolean } {
	const fn = inputs.function.trim();
	const args = inputs.arguments.trim();
	const rust = inputs.rust.trim();
	const example = inputs.example === 'julia' ? 'julia' : 'mandelbrot';
	const valid = isFunctionName(fn) && !/[\r\n]/.test(args);
	return { example, fn, args, rust, valid, rustValid: valid && isFunctionName(rust) && rust !== fn, isExample: fn === EXAMPLE_FUNCTION && rust === EXAMPLE_RUST };
}

/** The code of each box, for the inputs. */
function boxCode(box: CodeBox, inputs: ITranslateRustInputs): string {
	const { example, fn, args, rust, isExample } = checked(inputs);
	const call = `${fn}(${args})`;
	switch (box) {
		case 'defineCode':
			return fn === EXAMPLE_FUNCTION
				? `${exampleCode(example)}\n\ncounts = ${call}`
				: `${call}  # the call the next steps translate and time: define ${fn} first`;
		case 'cargoCode':
			return isExample ? CARGO_TOML : '';
		case 'rustCode':
			return isExample ? LIB_RS : '';
		case 'wrapperCode':
			return isExample ? EXAMPLE_WRAPPER : '';
		case 'buildCode':
			return isExample ? [
				'# The crate of step 2, which Pollis has written to ~/.pollis/rust/fractal: Cargo.toml and src/lib.rs',
				'crate = joinpath(homedir(), ".pollis", "rust", "fractal")',
				'',
				'# cargo, from the path, else where rustup installs it',
				'cargo = something(Sys.which("cargo"), joinpath(homedir(), ".cargo", "bin", Sys.iswindows() ? "cargo.exe" : "cargo"))',
				'isfile(cargo) || error("cargo not found: install Rust with rustup, from rustup.rs, and run Build again")',
				'',
				'# Compiled with optimisations, to target/release. A library this Julia session has already opened stays as it was',
				'# when opened: after a change to src/lib.rs, start a new Julia session to call the new build',
				'run(Cmd(`$cargo build --release`, dir = crate))',
				'',
				EXAMPLE_WRAPPER,
			].join('\n') : `include("${rust}.jl")  # the Julia function the agent wrote beside ${fn}'s file, which builds its crate when the library is missing; its path from the folder of the Julia REPL`;
		case 'compareCode':
			return compareCode(fn, args, rust);
	}
}

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

async function openTranslateRustPage(accessor: ServicesAccessor): Promise<void> {
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
	const title = localize('translateRust.title', "Translate Julia to Rust");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.translateRust',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'translateRust', title, TRANSLATERUST_METADATA.translateRust, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The code of each box, and how many times each has been set. */
	const codes = new Map<CodeBox, string>();
	const codeVersions = new Map<CodeBox, number>();
	/** Shows `code` in a code box, coloured in its language as Example Code colours Julia, then its brackets by depth. */
	const postCode = async (box: CodeBox, code: string): Promise<void> => {
		codes.set(box, code);
		// Tokenizing is async: drop a result that a newer code has already overtaken.
		const version = (codeVersions.get(box) ?? 0) + 1;
		codeVersions.set(box, version);
		const html = code ? await tokenizeToString(languageService, code, BOX_LANGUAGES[box]) : '';
		if (codeVersions.get(box) !== version) {
			return;
		}
		const colorMap = TokenizationRegistry.getColorMap();
		post({ command: 'colorizedCode', box, html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '' });
	};
	const postCodes = (inputs: ITranslateRustInputs) => {
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
	disposables.add(webviewInput.webview.onMessage(async (e: { message: TranslateRustMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			post({ command: 'state', inputs: { example: 'mandelbrot', function: EXAMPLE_FUNCTION, arguments: EXAMPLE_ARGUMENTS, rust: EXAMPLE_RUST } });
		} else if (message.command === 'draft' && hasKey(message, { inputs: true })) {
			postCodes(message.inputs);
		} else if (message.command === 'run' && hasKey(message, { box: true, inputs: true }) && RUN_BOXES.includes(message.box)) {
			const inputs = checked(message.inputs);
			const code = boxCode(message.box, message.inputs);
			if (!inputs.valid || !code || (message.box !== 'defineCode' && !inputs.rustValid)) {
				return;
			}
			if (message.box === 'buildCode' && inputs.isExample) {
				// The crate of step 2, written before cargo builds it
				const crate = joinPath(await pathService.userHome({ preferLocal: true }), ...CRATE_FOLDER);
				await fileService.writeFile(joinPath(crate, 'Cargo.toml'), VSBuffer.fromString(CARGO_TOML));
				await fileService.writeFile(joinPath(crate, 'src', 'lib.rs'), VSBuffer.fromString(LIB_RS));
			}
			await sendToJuliaRepl(code, commandService);
			post({ command: 'sent', box: message.box });
		} else if (message.command === 'agent' && hasKey(message, { inputs: true })) {
			await commandService.executeCommand(TRANSLATE_WITH_AGENT_COMMAND_ID, message.inputs);
		}
	}));
}

/**
 * Hands the function of the page to the user's coding agent, with the translate-to-rust skill: the agent finds it,
 * proposes how to translate it and, once the user agrees, writes a Rust crate and the Julia function that calls it
 * beside the function's file. The example has no file of its own, so it is saved to ~/.pollis/rust first. From
 * elsewhere than the page, with no inputs, the page opens.
 */
async function translateWithAgent(accessor: ServicesAccessor, inputs?: ITranslateRustInputs): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const instantiationService = accessor.get(IInstantiationService);
	const commandService = accessor.get(ICommandService);
	const input = inputs && hasKey(inputs, { example: true, function: true, arguments: true, rust: true }) ? checked(inputs) : undefined;
	if (!input) {
		await commandService.executeCommand(TRANSLATE_RUST_COMMAND_ID);
		return;
	}
	if (!input.rustValid) {
		throw new Error(localize('translateRust.agent.names', "Name the function in step 1 and its Rust version in step 2, each a Julia name, the two different."));
	}
	const skill = await instantiationService.invokeFunction(skillFile, 'translate-to-rust');
	if (!skill) {
		return;
	}
	const call = `${input.fn}(${input.args})`;
	let folder: URI | undefined;
	let prompt: string;
	if (input.fn === EXAMPLE_FUNCTION) {
		folder = joinPath(await pathService.userHome({ preferLocal: true }), ...EXAMPLE_FOLDER);
		const file = joinPath(folder, `${EXAMPLE_FUNCTION}.jl`);
		await fileService.writeFile(file, VSBuffer.fromString(`${exampleCode(input.example)}\n`));
		prompt = localize('translateRust.agent.examplePrompt', "Read the skill {0} and follow its instructions to translate the Julia function {1} to Rust with me, defined in {2}. It is called as {3}, and the Julia function that calls its Rust version is to be named {4}.", skill.fsPath, input.fn, file.fsPath, call, input.rust);
	} else {
		prompt = localize('translateRust.agent.prompt', "Read the skill {0} and follow its instructions to translate the Julia function {1} to Rust with me. It is called as {2}, and the Julia function that calls its Rust version is to be named {3}.", skill.fsPath, input.fn, call, input.rust);
	}
	await instantiationService.invokeFunction(startAgent, localize('translateRust.agent.terminal', "Translate {0}", input.fn), prompt, folder, 'translateRust');
}

function pageHtml(): string {
	const text = {
		title: localize('translateRust.title', "Translate Julia to Rust"),
		intro: localize('translateRust.intro', "Translate Julia to Rust takes a Julia function to Rust in four steps: the call to translate, the Rust version with the Julia function that calls it, the build of the Rust code with cargo, and a comparison of the two versions, which checks first that they give the same result. The example counts the pixels of the Mandelbrot set or of the Julia set of c; set your own function and its call in step 1."),
		function: localize('translateRust.function', "The Function"),
		example: localize('translateRust.example', "Example"),
		examples: {
			mandelbrot: localize('translateRust.mandelbrot', "Mandelbrot Set"),
			julia: localize('translateRust.julia', "Julia Set"),
		},
		functionName: localize('translateRust.functionName', "Function"),
		arguments: localize('translateRust.arguments', "Arguments"),
		argumentsPlaceholder: localize('translateRust.argumentsPlaceholder', "As written in the call, such as x, 100"),
		exampleHint: localize('translateRust.exampleHint', "The example defines the region, the size of the picture and the most iterations, then {0}, which returns the count of every pixel as a matrix. Run it before the next steps.", `<code>${EXAMPLE_FUNCTION}</code>`),
		ownHint: localize('translateRust.ownHint', "Define your function in the Julia REPL first, or run the file that defines it: the next steps call it as written here, with arguments the REPL has."),
		code: localize('translateRust.code', "Julia Code"),
		cargo: localize('translateRust.cargo', "Cargo.toml"),
		rustSource: localize('translateRust.rustSource', "src/lib.rs"),
		wrapper: localize('translateRust.wrapper', "The Julia Function That Calls Rust"),
		run: localize('translateRust.run', "Run"),
		sent: localize('translateRust.sent', "Sent to the Julia REPL: the results show there."),
		needFunction: localize('translateRust.needFunction', "The function must be a Julia name, such as {0} or {1}, and the arguments fit on one line.", '<code>f</code>', '<code>MyModule.f</code>'),
		needRust: localize('translateRust.needRust', "The Rust version must be a Julia name, other than the function's."),
		translate: localize('translateRust.translate', "Translate"),
		rustName: localize('translateRust.rustName', "Rust Version"),
		translateIntro: localize('translateRust.translateIntro', "A Rust version that Julia can call has two parts: a Rust crate built as a C dynamic library, whose function takes only numbers and pointers, and a Julia function with the arguments and the result of the original, which prepares the memory and calls the library with {0}. The usual steps, each explained in From Julia to Rust and Calling Rust from Julia, in Learn More:", '<code>@ccall</code>'),
		rules: [
			localize('translateRust.rule.types', "Give each argument a type of fixed size on both sides: {0} and {1}, {2} and {3}; a complex number crosses as its two parts.", '<code>Float64</code>', '<code>f64</code>', '<code>Int32</code>', '<code>i32</code>'),
			localize('translateRust.rule.memory', "Let Julia allocate the arrays and pass their pointers; Rust reads them as slices and writes into them."),
			localize('translateRust.rule.index', "Count from 0 in Rust and keep Julia's column order: element (i, j) of a matrix is at {0} there.", '<code>(i - 1) + (j - 1) * height</code>'),
			localize('translateRust.rule.order', "Keep the operations in the same order, so that the results agree to the last bit."),
		],
		exampleTranslate: localize('translateRust.exampleTranslate', "The example's Rust version, below: the crate, then the Julia function that calls it."),
		ownTranslate: localize('translateRust.ownTranslate', "Write the Rust version yourself, or ask your coding agent for it with Translate with Agent."),
		agentHint: localize('translateRust.agentHint', "Translate with Agent asks your coding agent to find the function and explain its plan: the type each argument takes in Rust, the memory Julia keeps, and what does not translate as it is. Once you agree, it writes a Rust crate and the Julia function that calls it in new files beside the function's, builds the crate, and checks that the two give the same result; the function's own file is not changed. Steps 3 and 4 then build and compare."),
		agentExampleHint: localize('translateRust.agentExampleHint', "For the example, Pollis first saves it to {0}, for the agent to read.", '<span class="yellow">~/.pollis/rust/fractal_counts.jl</span>'),
		agent: localize('translateRust.agent', "Translate with Agent"),
		build: localize('translateRust.build', "Build"),
		buildExample: localize('translateRust.buildExample', "Build writes the crate of step 2 to {0}, compiles it with {1}, and defines the Julia function that calls it. It needs Rust 1.85 or later, installed with rustup.", '<span class="yellow">~/.pollis/rust/fractal</span>', '<code>cargo build --release</code>'),
		buildOwn: localize('translateRust.buildOwn', "Build includes the Julia function that calls your Rust version, from the file the agent wrote beside your function's, which builds its crate with cargo when the library is missing."),
		compare: localize('translateRust.compare', "Compare"),
		compareIntro: localize('translateRust.compareIntro', "Compare checks first that the two versions give the same result: for the example, the same count at every pixel. BenchmarkTools then times each for a second, and gives the minimum time and the allocations of a call, how many times as fast the Rust version is, and the verdict of judge on the medians: improvement, regression, or invariant when they are within 5% of each other."),
	};
	const exampleRadios = (['mandelbrot', 'julia'] as const)
		.map(e => `<label><input type="radio" name="example" value="${e}"${e === 'mandelbrot' ? ' checked' : ''}> ${text.examples[e]}</label>`).join('');
	const codeBlock = (box: CodeBox, label: string, buttons: string) => `
		<h3 class="part" id="${box}Title">${label}</h3>
		<pre class="rust-code" id="${box}"></pre>
		${buttons ? `<div class="settings"><span class="bar">${buttons}</span></div>` : ''}
		<div class="small status" id="${box}Status"></div>`;
	const runButton = (box: RunBox) => `<button class="action current" id="${box}Run">${text.run}</button>`;
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		omitPoweredBy: !TRANSLATERUST_METADATA.translateRust.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; min-width: 18em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		/* The fields to fill in: their border always in the blue of a focused field, as the Ask Pollis box's is */
		#function, #arguments, #rust { border-color: var(--vscode-focusBorder); }
		input::placeholder { color: var(--vscode-input-placeholderForeground); }
		.rust-code { margin: 6px 0 0; padding: 10px 12px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); white-space: pre; overflow-x: auto; tab-size: 4; max-width: 900px; }
		.choices label { margin-right: 16px; }
		.rules { margin: 4px 0 8px; padding-left: 20px; max-width: 900px; }
		.rules li { margin: 2px 0; }
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
		<div class="row choices" id="exampleChoice"><span class="small">${text.example}</span> ${exampleRadios}</div>
		<p class="hint" id="functionHint"></p>
		${codeBlock('defineCode', text.code, runButton('defineCode'))}
`,
			},
			{
				id: 'step-translate',
				title: text.translate,
				bodyHtml: `
		<p class="hint">${text.translateIntro}</p>
		<ul class="rules hint">${text.rules.map(rule => `<li>${rule}</li>`).join('')}</ul>
		<div class="row"><span class="small">${text.rustName}</span> <input type="text" id="rust" spellcheck="false"></div>
		<p class="hint" id="translateHint"></p>
		<p class="hint">${text.agentHint} <span id="agentExampleHint">${text.agentExampleHint}</span></p>
		<div class="settings"><span class="bar"><button class="action" id="agent">${text.agent}</button></span></div>
		<div id="exampleTranslation">
			${codeBlock('cargoCode', text.cargo, '')}
			${codeBlock('rustCode', text.rustSource, '')}
			${codeBlock('wrapperCode', text.wrapper, '')}
		</div>
`,
			},
			{
				id: 'step-build',
				title: text.build,
				bodyHtml: `
		<p class="hint" id="buildHint"></p>
		${codeBlock('buildCode', text.code, runButton('buildCode'))}
`,
			},
			{
				id: 'step-compare',
				title: text.compare,
				bodyHtml: `
		<p class="hint">${text.compareIntro}</p>
		${codeBlock('compareCode', text.code, runButton('compareCode'))}
`,
			},
		],
		pageScriptJs: `
	${colorizeBracketsJs}
	const TEXT = ${JSON.stringify(text)};
	const EXAMPLE_FUNCTION = ${JSON.stringify(EXAMPLE_FUNCTION)};
	const EXAMPLE_RUST = ${JSON.stringify(EXAMPLE_RUST)};
	const BOXES = ${JSON.stringify(CODE_BOXES)};
	const RUN_BOXES = ${JSON.stringify(RUN_BOXES)};
	const functionInput = document.getElementById('function');
	const argumentsInput = document.getElementById('arguments');
	const rustInput = document.getElementById('rust');
	const NAME = /^[A-Za-z_][A-Za-z0-9_!]*(?:\\.[A-Za-z_][A-Za-z0-9_!]*)*$/;

	function inputs() {
		const checkedRadio = document.querySelector('input[name=example]:checked');
		return { example: checkedRadio ? checkedRadio.value : 'mandelbrot', function: functionInput.value, arguments: argumentsInput.value, rust: rustInput.value };
	}
	function validity() {
		const fn = functionInput.value.trim();
		const rust = rustInput.value.trim();
		const valid = NAME.test(fn) && !/[\\r\\n]/.test(argumentsInput.value);
		return { fn, rust, valid, rustValid: valid && NAME.test(rust) && rust !== fn };
	}
	function render() {
		const { fn, rust, valid, rustValid } = validity();
		const example = fn === EXAMPLE_FUNCTION;
		const exampleTranslation = example && rust === EXAMPLE_RUST;
		document.getElementById('exampleChoice').hidden = !example;
		document.getElementById('functionHint').innerHTML = example ? TEXT.exampleHint : TEXT.ownHint;
		document.getElementById('translateHint').textContent = exampleTranslation ? TEXT.exampleTranslate : TEXT.ownTranslate;
		document.getElementById('agentExampleHint').hidden = !example;
		document.getElementById('exampleTranslation').hidden = !exampleTranslation;
		document.getElementById('buildHint').innerHTML = exampleTranslation ? TEXT.buildExample : TEXT.buildOwn;
		document.getElementById('defineCodeRun').disabled = !valid;
		document.getElementById('buildCodeRun').disabled = !rustValid;
		document.getElementById('compareCodeRun').disabled = !rustValid;
		document.getElementById('agent').disabled = !rustValid;
		const defineStatus = document.getElementById('defineCodeStatus');
		if (!valid) {
			defineStatus.innerHTML = TEXT.needFunction;
			defineStatus.classList.add('missing');
		} else if (defineStatus.classList.contains('missing')) {
			defineStatus.textContent = '';
			defineStatus.classList.remove('missing');
		}
		const compareStatus = document.getElementById('compareCodeStatus');
		if (valid && !rustValid) {
			compareStatus.textContent = TEXT.needRust;
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
	for (const input of [functionInput, argumentsInput, rustInput]) {
		input.addEventListener('input', sendDraft);
	}
	for (const radio of document.querySelectorAll('input[name=example]')) {
		radio.addEventListener('change', sendDraft);
	}
	for (const box of RUN_BOXES) {
		document.getElementById(box + 'Run').addEventListener('click', () => vscode.postMessage({ command: 'run', box, inputs: inputs() }));
	}
	document.getElementById('agent').addEventListener('click', () => vscode.postMessage({ command: 'agent', inputs: inputs() }));

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			functionInput.value = message.inputs.function;
			argumentsInput.value = message.inputs.arguments;
			rustInput.value = message.inputs.rust;
			for (const radio of document.querySelectorAll('input[name=example]')) {
				radio.checked = radio.value === message.inputs.example;
			}
			sendDraft();
		} else if (message.command === 'colorizedCode') {
			document.getElementById('mtk-theme').textContent = message.css;
			const box = document.getElementById(message.box);
			box.innerHTML = message.html;
			colorizeBrackets(box, '#');
		} else if (message.command === 'sent') {
			const status = document.getElementById(message.box + 'Status');
			status.classList.remove('missing');
			status.textContent = TEXT.sent;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: TRANSLATE_RUST_COMMAND_ID, title: localize2('translateRust.action', "Translate Julia to Rust..."), category: localize2('compilationLab.category', "Compilation Lab"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openTranslateRustPage(accessor);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: TRANSLATE_WITH_AGENT_COMMAND_ID, title: localize2('translateRust.agentAction', "Translate with Agent..."), category: localize2('compilationLab.category', "Compilation Lab"), f1: true });
	}
	run(accessor: ServicesAccessor, inputs?: ITranslateRustInputs): Promise<void> {
		return translateWithAgent(accessor, inputs);
	}
});
