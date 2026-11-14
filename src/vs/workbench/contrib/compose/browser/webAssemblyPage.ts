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
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { folderUri } from '../../model/browser/handlers/scaffold.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { WEBASSEMBLY_METADATA } from '../../model/browser/webviews/webAssembly.data.js';
import { buildWebviewHtml, colorizeBracketsJs, nextStepIcon, openPageStepJs } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { findPollisWorkspace, pollisWorkspaceFolderPath } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { ESCAPE_TIME_JULIA, FRACTAL_REGIONS, FractalExample, fractalExampleCode } from './fractalExample.js';

// Compile Julia to WebAssembly, from Compose > Compilation Lab (compose.contribution.ts). A page of the scaffold in the
// Time Arrow style, in four steps: 1, The Function, the example (the Mandelbrot set or the Julia set of c) and its
// counts in Julia; 2, Compile, the function of one pixel compiled to a WebAssembly module through Rust (cargo, target
// wasm32-unknown-unknown), through C (clang and wasm-ld of the Julia packages Clang_jll and LLD_jll) or with
// WebAssemblyCompiler.jl (in a Julia 1.10 started through juliaup, as the package does not install on Julia 1.12 or
// later); 3, Check, the page runs the module on the example and Julia compares every count with step 1's; 4, Live View,
// the page draws the set with the module, zoomed with the mouse wheel and moved by dragging. Next Steps: The Same in
// JavaScript, the function written in JavaScript and timed beside the modules, and Compare the Ways, the three modules
// side by side, both in the page.

export const WEB_ASSEMBLY_COMMAND_ID = 'pollis.compilation.webAssembly';

/** The three ways to a module, each also the name of its folder in the folder of Compile. */
type Way = 'rust' | 'c' | 'webassemblycompiler';
const WAYS: readonly Way[] = ['rust', 'c', 'webassemblycompiler'];

/** The module of each way is fractal.wasm in its folder; the counts of Check go beside it. */
const MODULE_FILE = 'fractal.wasm';
const COUNTS_FILE = 'counts.bin';
const CRATE_NAME = 'fractal';

/** The crate of the Rust way, which Compile writes to rust/fractal of the folder of Compile. */
const CARGO_TOML = `[package]
name = "fractal"
version = "0.1.0"
edition = "2024"

# A library of C functions which, built for WebAssembly, is a module whose exported functions the page calls
[lib]
crate-type = ["cdylib"]

# No unwinding code, and the whole crate optimised as one: a smaller module
[profile.release]
panic = "abort"
lto = true
`;
const LIB_RS = `// The function of one pixel and the loop over the pixels of a picture, compiled to WebAssembly for the page Compile
// Julia to WebAssembly, which runs the module in the page

/// The iterations of z^2 + c before |z| passes 2, with the operations of escape_time in Julia, in the same order.
/// WebAssembly has no fused multiply-add for single numbers, so the counts agree with Julia's to the last bit
fn iterate(mut zr: f64, mut zi: f64, cr: f64, ci: f64, maxiter: i32) -> i32 {
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

/// escape_time of Julia for one pixel. no_mangle keeps the name in the module's exports
#[unsafe(no_mangle)]
pub extern "C" fn escape_time(zr: f64, zi: f64, cr: f64, ci: f64, maxiter: i32) -> i32 {
	iterate(zr, zi, cr, ci, maxiter)
}

/// Room for n counts in the module's memory, which the page reads through the export memory; kept until free_counts
#[unsafe(no_mangle)]
pub extern "C" fn alloc_counts(n: usize) -> *mut i32 {
	let mut counts = vec![0i32; n];
	let pointer = counts.as_mut_ptr();
	std::mem::forget(counts);
	pointer
}

/// Gives back the room of alloc_counts.
///
/// # Safety
/// counts and n must come from one call of alloc_counts, not given back yet.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn free_counts(counts: *mut i32, n: usize) {
	drop(unsafe { Vec::from_raw_parts(counts, n, n) });
}

/// The count of every pixel, row after row from the bottom of the picture: pixel (i, j), counted from 0, is at
/// i * width + j. c arrives as its real and imaginary parts, julia_set as 1 for the Julia set and 0 for the Mandelbrot set.
///
/// # Safety
/// counts must point at height * width counts of alloc_counts.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn fill_counts(counts: *mut i32, height: i32, width: i32, x0: f64, y0: f64, spacing: f64,
		julia_set: i32, cr: f64, ci: f64, maxiter: i32) {
	let counts = unsafe { std::slice::from_raw_parts_mut(counts, (height * width) as usize) };
	for i in 0..height {
		for j in 0..width {
			let x = x0 + j as f64 * spacing;
			let y = y0 + i as f64 * spacing;
			counts[(i * width + j) as usize] = if julia_set != 0 {
				iterate(x, y, cr, ci, maxiter)
			} else {
				iterate(0.0, 0.0, x, y, maxiter)
			};
		}
	}
}
`;

/** The source of the C way, which Compile writes to c of the folder of Compile, with the same exports as the crate's. */
const FRACTAL_C = `// The function of one pixel and the loop over the pixels of a picture, compiled to WebAssembly for the page Compile
// Julia to WebAssembly, which runs the module in the page. There is no C library in the module, only what is here

// The iterations of z^2 + c before |z| passes 2, with the operations of escape_time in Julia, in the same order.
// WebAssembly has no fused multiply-add for single numbers, so the counts agree with Julia's to the last bit
static int iterate(double zr, double zi, double cr, double ci, int maxiter) {
	int k = 0;
	while (k < maxiter) {
		double zr2 = zr * zr;
		double zi2 = zi * zi;
		if (zr2 + zi2 > 4.0) {
			return k;
		}
		zi = 2.0 * zr * zi + ci;
		zr = zr2 - zi2 + cr;
		k += 1;
	}
	return maxiter;
}

// escape_time of Julia for one pixel. export_name puts the function in the module's exports under that name
__attribute__((export_name("escape_time")))
int escape_time(double zr, double zi, double cr, double ci, int maxiter) {
	return iterate(zr, zi, cr, ci, maxiter);
}

// Where the module's own data ends, which the linker gives, and the end of the memory in use after it
extern unsigned char __heap_base;
static unsigned long heap_end = 0;

// Room for n counts at the end of the memory in use, which the page reads through the export memory; the memory grows
// by pages of 64 KiB when it is too small. Kept until free_counts
__attribute__((export_name("alloc_counts")))
int *alloc_counts(int n) {
	if (heap_end == 0) {
		heap_end = (unsigned long)&__heap_base;
	}
	unsigned long start = (heap_end + 15) & ~15ul;
	unsigned long end = start + 4ul * (unsigned long)n;
	unsigned long size = __builtin_wasm_memory_size(0) * 65536ul;
	if (end > size && __builtin_wasm_memory_grow(0, (end - size + 65535) / 65536) == (unsigned long)-1) {
		return 0;
	}
	heap_end = end;
	return (int *)start;
}

// Gives back the room of alloc_counts, when it is the last room taken, as the page gives back each before the next
__attribute__((export_name("free_counts")))
void free_counts(int *counts, int n) {
	if ((unsigned long)(counts + n) == heap_end) {
		heap_end = (unsigned long)counts;
	}
}

// The count of every pixel, row after row from the bottom of the picture: pixel (i, j), counted from 0, is at
// i * width + j. c arrives as its real and imaginary parts, julia_set as 1 for the Julia set and 0 for the Mandelbrot set
__attribute__((export_name("fill_counts")))
void fill_counts(int *counts, int height, int width, double x0, double y0, double spacing, int julia_set, double cr,
		double ci, int maxiter) {
	for (int i = 0; i < height; i++) {
		for (int j = 0; j < width; j++) {
			double x = x0 + j * spacing;
			double y = y0 + i * spacing;
			counts[i * width + j] = julia_set != 0 ? iterate(x, y, cr, ci, maxiter) : iterate(0.0, 0.0, x, y, maxiter);
		}
	}
}
`;

/** The script of the C way, which Compile writes to c of the folder of Compile beside fractal.c. */
const BUILD_JL = `# Run by Julia in the project of this folder, as Compile starts it: clang compiles fractal.c to WebAssembly and wasm-ld
# links it into a module, both from the Julia packages Clang_jll and LLD_jll, so that nothing else is installed
using Clang_jll, LLD_jll

source = joinpath(@__DIR__, "fractal.c")
object = joinpath(@__DIR__, "fractal.o")

# WebAssembly with no operating system around it and no C library; -ffp-contract=off keeps each multiplication and
# addition apart, as Julia does
run(\`$(clang()) --target=wasm32-unknown-unknown -O3 -ffreestanding -nostdlib -ffp-contract=off -c $source -o $object\`)

# The module ${MODULE_FILE}: no entry point, as the page calls the functions it exports, and no names of the functions
# inside it, which the exports do not need. lld is wasm-ld with -flavor wasm
run(\`$(lld()) -flavor wasm --no-entry --strip-all $object -o $(joinpath(@__DIR__, "${MODULE_FILE}"))\`)
`;

/** The script of the WebAssemblyCompiler.jl way, which Compile writes to webassemblycompiler of the folder of Compile. */
const COMPILE_JL = `# Run by Julia 1.10 in the project of this folder, as Compile starts it: WebAssemblyCompiler.jl compiles the function
# of one pixel to a WebAssembly module
using WebAssemblyCompiler

${ESCAPE_TIME_JULIA}

# The module ${MODULE_FILE}, which exports escape_time for arguments of these types; beside it ${MODULE_FILE}.wat, the same
# module as text, and ${MODULE_FILE}.js, the imports of a module that calls JavaScript, which this one does not
compile((escape_time, Float64, Float64, Float64, Float64, Int32); filepath = joinpath(@__DIR__, "${MODULE_FILE}"))
`;

/**
 * The function of one pixel and the loop over the pixels in JavaScript, with the operations of escape_time in Julia in
 * the same order, which The Same in JavaScript shows and runs in the page, as written here.
 */
const JAVASCRIPT_CODE = `// The iterations of z^2 + c before |z| passes 2, for one pixel, as escape_time in Julia
function escapeTime(zr, zi, cr, ci, maxiter) {
	let k = 0;
	while (k < maxiter) {
		const zr2 = zr * zr;
		const zi2 = zi * zi;
		if (zr2 + zi2 > 4.0) {
			return k;
		}
		zi = 2.0 * zr * zi + ci;
		zr = zr2 - zi2 + cr;
		k += 1;
	}
	return maxiter;
}

// The count of every pixel, row after row from the bottom of the picture, as the modules write them
function fillCounts(counts, height, width, x0, y0, spacing, juliaSet, cr, ci, maxiter) {
	for (let i = 0; i < height; i++) {
		const y = y0 + i * spacing;
		for (let j = 0; j < width; j++) {
			const x = x0 + j * spacing;
			counts[i * width + j] = juliaSet ? escapeTime(x, y, cr, ci, maxiter) : escapeTime(0.0, 0.0, x, y, maxiter);
		}
	}
}`;

/**
 * The folder of Compile by default: programs/webassembly of the open Pollis Workspace, otherwise
 * ~/.pollis/programs/webassembly. Each way builds in its own folder there.
 */
async function defaultFolder(contextService: IWorkspaceContextService, fileService: IFileService, pathService: IPathService): Promise<URI> {
	const workspace = await findPollisWorkspace(contextService, fileService);
	return workspace
		? joinPath(await pollisWorkspaceFolderPath(fileService, workspace, 'programs'), 'webassembly')
		: joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'programs', 'webassembly');
}

/** The code boxes of the page, by the id of their element, with the language that colours each. */
type CodeBox = 'defineCode' | 'cargoCode' | 'rustCode' | 'cCode' | 'buildCode' | 'scriptCode' | 'compileCode' | 'checkCode' | 'javascriptCode';
const CODE_BOXES: readonly CodeBox[] = ['defineCode', 'cargoCode', 'rustCode', 'cCode', 'buildCode', 'scriptCode', 'compileCode', 'checkCode', 'javascriptCode'];
const BOX_LANGUAGES: Record<CodeBox, string> = { defineCode: 'julia', cargoCode: 'ini', rustCode: 'rust', cCode: 'c', buildCode: 'julia', scriptCode: 'julia', compileCode: 'julia', checkCode: 'julia', javascriptCode: 'javascript' };

/** The code boxes with a Run button, whose code goes to the Julia REPL. Check's code goes once the page has its counts. */
type RunBox = 'defineCode' | 'compileCode';
const RUN_BOXES: readonly RunBox[] = ['defineCode', 'compileCode'];

/** The inputs of the page, as its script sends them. */
interface IWebAssemblyInputs {
	readonly example: FractalExample;
	readonly width: string;
	readonly maxiter: string;
	readonly cre: string;
	readonly cim: string;
	readonly way: Way;
	/** The folder of Compile. */
	readonly folder: string;
}

type WebAssemblyMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'draft'; readonly inputs: IWebAssemblyInputs }
	| { readonly command: 'run'; readonly box: RunBox; readonly inputs: IWebAssemblyInputs }
	| { readonly command: 'load'; readonly way: Way; readonly folder: string; readonly purpose: 'check' | 'live' | 'timing' }
	| { readonly command: 'counts'; readonly inputs: IWebAssemblyInputs; readonly bytes: Uint8Array }
	| { readonly command: 'chooseFolder'; readonly value: string };

/** A decimal number as Julia and JavaScript both read it, to the same Float64. */
const DECIMAL = /^-?\d+(\.\d+)?$/;

/**
 * The inputs trimmed, with their checks: the pixels across from 16 to 4000, the iterations from 1 to 100000, c as two
 * decimal numbers; the folder, which the Julia code writes as a raw string, on one line with no quotation mark.
 */
function checked(inputs: IWebAssemblyInputs) {
	const example: FractalExample = inputs.example === 'julia' ? 'julia' : 'mandelbrot';
	const way: Way = WAYS.includes(inputs.way) ? inputs.way : 'rust';
	const width = (inputs.width ?? '').trim();
	const maxiter = (inputs.maxiter ?? '').trim();
	const cre = (inputs.cre ?? '').trim();
	const cim = (inputs.cim ?? '').trim();
	const folder = (inputs.folder ?? '').trim();
	const whole = (value: string, low: number, high: number) => /^\d+$/.test(value) && Number(value) >= low && Number(value) <= high;
	const valid = whole(width, 16, 4000) && whole(maxiter, 1, 100000) && DECIMAL.test(cre) && DECIMAL.test(cim);
	return { example, way, width, maxiter, cre, cim, folder, valid, folderValid: !!folder && !/["\r\n]/.test(folder) };
}

/** The name of a way, as the page and the code's comments write it. */
function wayName(way: Way): string {
	return way === 'rust' ? 'Rust' : way === 'c' ? 'C' : 'WebAssemblyCompiler.jl';
}

/** The Julia code of Compile for the way of the inputs. */
function compileCode(way: Way, folder: string): string {
	if (way === 'rust') {
		return `# The crate above, which Pollis has written to rust/${CRATE_NAME} of the folder above: Cargo.toml and src/lib.rs
crate = joinpath(expanduser(raw"${folder}"), "rust", "${CRATE_NAME}")

# cargo and rustup, from the path, else where rustup installs them
cargo = something(Sys.which("cargo"), joinpath(homedir(), ".cargo", "bin", Sys.iswindows() ? "cargo.exe" : "cargo"))
rustup = something(Sys.which("rustup"), joinpath(homedir(), ".cargo", "bin", Sys.iswindows() ? "rustup.exe" : "rustup"))
isfile(cargo) && isfile(rustup) || error("cargo or rustup not found: install Rust with rustup, from rustup.rs, and run Compile again")

# WebAssembly with no operating system around it, a target that Rust adds once
target = "wasm32-unknown-unknown"
if !(target in split(read(\`$rustup target list --installed\`, String)))
	println("Adding the Rust target $target, once")
	run(\`$rustup target add $target\`)
end

# Compiled with optimisations; cargo builds again only when the crate has changed
seconds = @elapsed run(Cmd(\`$cargo build --release --target $target\`, dir = crate))

# The module, copied to rust/${MODULE_FILE}, where Check and Live View read it
wasm = joinpath(dirname(crate), "${MODULE_FILE}")
cp(joinpath(crate, "target", target, "release", "${MODULE_FILE}"), wasm, force = true)
println("Built in ", round(seconds, digits = 1), " s: ", wasm, ", ", filesize(wasm), " bytes")`;
	}
	if (way === 'c') {
		return `# The project of the C way, with fractal.c and build.jl above, which Pollis has written there
project = joinpath(expanduser(raw"${folder}"), "c")
wasm = joinpath(project, "${MODULE_FILE}")

# Clang_jll and LLD_jll in that project, installed once: clang and wasm-ld as Julia packages, for this Julia
julia = Base.julia_cmd()
if !isfile(joinpath(project, "Manifest.toml"))
	println("Installing Clang_jll and LLD_jll, once")
	run(\`$julia --project=$project -e 'import Pkg; Pkg.add(["Clang_jll", "LLD_jll"])'\`)
end

# Compiled and linked by build.jl, in a Julia of its own with that project, in a second or two
seconds = @elapsed run(\`$julia --project=$project $(joinpath(project, "build.jl"))\`)
println("Built in ", round(seconds, digits = 1), " s: ", wasm, ", ", filesize(wasm), " bytes")`;
	}
	return `# The project of WebAssemblyCompiler.jl, with compile.jl above, which Pollis has written there
project = joinpath(expanduser(raw"${folder}"), "webassemblycompiler")
script = joinpath(project, "compile.jl")
wasm = joinpath(project, "${MODULE_FILE}")

# WebAssemblyCompiler.jl does not install on Julia 1.12 or later: a Julia 1.10 beside this session, started by the
# launcher of juliaup
launcher = let installed = joinpath(homedir(), ".juliaup", "bin", Sys.iswindows() ? "julialauncher.exe" : "julialauncher")
	isfile(installed) ? installed : something(Sys.which("julialauncher"), Sys.which("julia"), "julia")
end
julia_110 = \`$launcher +1.10\`
success(pipeline(\`$julia_110 --version\`, stdin = devnull, stdout = devnull, stderr = devnull)) ||
	error("Julia 1.10 not found: add it with juliaup add 1.10, in a terminal, and run Compile again")

# WebAssemblyCompiler.jl in that project, installed once. Julia cannot precompile it and says so with errors at each
# start, which go to a log
if !isfile(joinpath(project, "Manifest.toml"))
	println("Installing WebAssemblyCompiler.jl for Julia 1.10, once")
	install_log = joinpath(project, "install.log")
	success(pipeline(\`$julia_110 --project=$project -e 'import Pkg; Pkg.add("WebAssemblyCompiler")'\`, stdin = devnull, stderr = install_log)) ||
		(print(read(install_log, String)); error("WebAssemblyCompiler.jl could not be installed: the messages are above, and in $install_log"))
end

# Compiled again only when compile.jl has changed since the module was made, as built_from.txt records
built_from = joinpath(project, "built_from.txt")
source = read(script, String)
if isfile(wasm) && isfile(built_from) && read(built_from, String) == source
	println("The module is up to date: ", wasm, ", ", filesize(wasm), " bytes")
else
	compile_log = joinpath(project, "compile.log")
	seconds = @elapsed compiled = success(pipeline(\`$julia_110 --project=$project $script\`, stdin = devnull, stderr = compile_log))
	compiled || (print(read(compile_log, String)); error("WebAssemblyCompiler.jl failed: the messages are above, and in $compile_log"))
	write(built_from, source)
	println("Compiled in ", round(seconds, digits = 1), " s: ", wasm, ", ", filesize(wasm), " bytes")
end`;
}

/** The Julia code of Check, which reads the counts the page saved and compares them with step 1's. */
function checkCode(way: Way, folder: string): string {
	return `# The counts the page computed with the module of ${wayName(way)}, which Pollis has saved: row after row from the
# bottom of the picture, each a 32-bit integer
wasm_values = reinterpret(Int32, read(joinpath(expanduser(raw"${folder}"), "${way}", "${COUNTS_FILE}")))
length(wasm_values) == length(counts) || error("The page computed $(length(wasm_values)) pixels and step 1 $(length(counts)): run step 1 again")
wasm_counts = permutedims(reshape(wasm_values, width, height))

# Compared with the counts of Julia, from step 1, pixel by pixel: the same count everywhere
println("Pixels that differ: ", count(wasm_counts .!= counts), " of ", length(counts))
println("Pixels inside the set: ", count(==(maxiter), wasm_counts), " in WebAssembly, ", count(==(maxiter), counts), " in Julia")`;
}

/** The code of each box, for the inputs. */
function boxCode(box: CodeBox, inputs: IWebAssemblyInputs): string {
	const { example, way, width, maxiter, cre, cim, folder } = checked(inputs);
	switch (box) {
		case 'defineCode':
			return `${fractalExampleCode(example, width, maxiter, cre, cim)}\n\ncounts = fractal_counts(x0, y0, spacing, height, width, julia_set, c, maxiter)`;
		case 'cargoCode':
			return way === 'rust' ? CARGO_TOML : '';
		case 'rustCode':
			return way === 'rust' ? LIB_RS : '';
		case 'cCode':
			return way === 'c' ? FRACTAL_C : '';
		case 'buildCode':
			return way === 'c' ? BUILD_JL : '';
		case 'scriptCode':
			return way === 'webassemblycompiler' ? COMPILE_JL : '';
		case 'compileCode':
			return compileCode(way, folder);
		case 'checkCode':
			return checkCode(way, folder);
		case 'javascriptCode':
			return JAVASCRIPT_CODE;
	}
}

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

async function openWebAssemblyPage(accessor: ServicesAccessor): Promise<void> {
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
	const contextService = accessor.get(IWorkspaceContextService);
	const fileDialogService = accessor.get(IFileDialogService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('webAssembly.title', "Compile Julia to WebAssembly");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.webAssembly',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'webAssembly', title, WEBASSEMBLY_METADATA.webAssembly, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The folder of a way in the folder of Compile. */
	const wayFolder = async (folder: string, way: Way): Promise<URI> => joinPath(folderUri(folder, await pathService.userHome({ preferLocal: true })), way);

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
	const postCodes = (inputs: IWebAssemblyInputs) => {
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
	disposables.add(webviewInput.webview.onMessage(async (e: { message: WebAssemblyMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			const folder = (await defaultFolder(contextService, fileService, pathService)).fsPath;
			post({ command: 'state', inputs: { example: 'mandelbrot', width: '800', maxiter: '256', cre: '-0.8', cim: '0.156', way: 'rust', folder } });
		} else if (message.command === 'draft' && hasKey(message, { inputs: true })) {
			postCodes(message.inputs);
		} else if (message.command === 'run' && hasKey(message, { box: true, inputs: true }) && RUN_BOXES.includes(message.box)) {
			const inputs = checked(message.inputs);
			if (!inputs.valid || (message.box === 'compileCode' && !inputs.folderValid)) {
				return;
			}
			if (message.box === 'compileCode') {
				// The sources of the way, written before the code compiles them
				const folder = await wayFolder(inputs.folder, inputs.way);
				if (inputs.way === 'rust') {
					await fileService.writeFile(joinPath(folder, CRATE_NAME, 'Cargo.toml'), VSBuffer.fromString(CARGO_TOML));
					await fileService.writeFile(joinPath(folder, CRATE_NAME, 'src', 'lib.rs'), VSBuffer.fromString(LIB_RS));
				} else if (inputs.way === 'c') {
					await fileService.writeFile(joinPath(folder, 'fractal.c'), VSBuffer.fromString(FRACTAL_C));
					await fileService.writeFile(joinPath(folder, 'build.jl'), VSBuffer.fromString(BUILD_JL));
				} else {
					await fileService.writeFile(joinPath(folder, 'compile.jl'), VSBuffer.fromString(COMPILE_JL));
				}
			}
			await sendToJuliaRepl(boxCode(message.box, message.inputs), commandService);
			post({ command: 'sent', box: message.box });
		} else if (message.command === 'load' && hasKey(message, { way: true, folder: true, purpose: true }) && WAYS.includes(message.way)) {
			// The module as the way last built it, read again each time, so that a new build is the one that runs
			const file = joinPath(await wayFolder(message.folder, message.way), MODULE_FILE);
			if (await fileService.exists(file)) {
				const content = await fileService.readFile(file);
				post({ command: 'module', way: message.way, purpose: message.purpose, bytes: content.value.buffer });
			} else {
				post({ command: 'noModule', way: message.way, purpose: message.purpose, path: file.fsPath });
			}
		} else if (message.command === 'counts' && hasKey(message, { inputs: true, bytes: true }) && message.bytes instanceof Uint8Array) {
			const inputs = checked(message.inputs);
			if (!inputs.valid || !inputs.folderValid) {
				return;
			}
			await fileService.writeFile(joinPath(await wayFolder(inputs.folder, inputs.way), COUNTS_FILE), VSBuffer.wrap(message.bytes));
			await sendToJuliaRepl(checkCode(inputs.way, inputs.folder), commandService);
			post({ command: 'sent', box: 'checkCode' });
		} else if (message.command === 'chooseFolder' && hasKey(message, { value: true })) {
			// Opened at the folder of the field when it exists, otherwise at the home folder
			const home = await pathService.userHome({ preferLocal: true });
			const current = folderUri(message.value, home);
			const picked = await fileDialogService.showOpenDialog({
				title: localize('webAssembly.chooseFolder', "Choose the Folder"),
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				defaultUri: await fileService.exists(current) ? current : home,
			});
			if (picked?.[0]) {
				post({ command: 'folder', value: picked[0].fsPath });
			}
		}
	}));
}

function pageHtml(): string {
	const text = {
		title: localize('webAssembly.title', "Compile Julia to WebAssembly"),
		intro: localize('webAssembly.intro', "Compile Julia to WebAssembly takes the function of one pixel of the Mandelbrot set or of the Julia set of c to WebAssembly, the code a web page runs, in three ways: through Rust, built by cargo; through C, built by clang and wasm-ld of Julia packages; or with WebAssemblyCompiler.jl, which compiles the Julia function itself. The page then runs the module: it checks the count of every pixel against Julia's, and draws the set live, to zoom into with the mouse wheel and move by dragging."),
		function: localize('webAssembly.function', "The Function"),
		example: localize('webAssembly.example', "Example"),
		examples: {
			mandelbrot: localize('webAssembly.mandelbrot', "Mandelbrot Set"),
			julia: localize('webAssembly.julia', "Julia Set"),
		},
		width: localize('webAssembly.width', "Pixels Across"),
		maxiter: localize('webAssembly.maxiter', "Iterations"),
		cre: localize('webAssembly.cre', "Real Part of c"),
		cim: localize('webAssembly.cim', "Imaginary Part of c"),
		functionHint: localize('webAssembly.functionHint', "The example defines the region, the size of the picture, the most iterations and c, then {0}, the function the next steps compile, and {1}, which returns the count of every pixel as a matrix. Run it before Check, and again after changing these inputs.", '<code>escape_time</code>', '<code>fractal_counts</code>'),
		needInputs: localize('webAssembly.needInputs', "Pixels Across must be a whole number from 16 to 4000, Iterations one from 1 to 100000, and each part of c a decimal number, such as {0}.", '<code>-0.8</code>'),
		code: localize('webAssembly.code', "Julia Code"),
		run: localize('webAssembly.run', "Run"),
		sent: localize('webAssembly.sent', "Sent to the Julia REPL: the results show there."),
		compile: localize('webAssembly.compile', "Compile"),
		way: localize('webAssembly.way', "Way"),
		ways: {
			rust: localize('webAssembly.way.rust', "Through Rust"),
			c: localize('webAssembly.way.c', "Through C"),
			webassemblycompiler: localize('webAssembly.way.webassemblycompiler', "With WebAssemblyCompiler.jl"),
		},
		rustHint: localize('webAssembly.rustHint', "The function translated to Rust, with the loop over the pixels of a picture, built by {0} for the target {1}, which the code adds to Rust the first time. It needs Rust 1.85 or later, installed with rustup.", '<code>cargo</code>', '<code>wasm32-unknown-unknown</code>'),
		cHint: localize('webAssembly.cHint', "The function translated to C, with the loop over the pixels of a picture and room for its counts, compiled by clang for the target {0} and linked by wasm-ld, both from the Julia packages {1} and {2}, which the code installs the first time in a project of its folder. Nothing else needs installing: the module has no C library.", '<code>wasm32-unknown-unknown</code>', '<code>Clang_jll</code>', '<code>LLD_jll</code>'),
		compilerHint: localize('webAssembly.compilerHint', "WebAssemblyCompiler.jl compiles the Julia function of step 1 itself. It does not install on Julia 1.12 or later, so the code starts a Julia 1.10 beside this session through juliaup, with a project of its own where it installs the package the first time. Add Julia 1.10 with {0} if it is missing.", '<code>juliaup add 1.10</code>'),
		folder: localize('webAssembly.folder', "Folder"),
		folderTooltip: localize('webAssembly.folderTooltip', "programs/webassembly of the open Pollis Workspace, otherwise in Pollis's own folder"),
		choose: localize('webAssembly.choose', "Choose..."),
		needFolder: localize('webAssembly.needFolder', "The folder must be a path on one line, with no quotation mark."),
		cargo: localize('webAssembly.cargo', "Cargo.toml"),
		rustSource: localize('webAssembly.rustSource', "src/lib.rs"),
		script: localize('webAssembly.script', "compile.jl"),
		cSource: localize('webAssembly.cSource', "fractal.c"),
		buildScript: localize('webAssembly.buildScript', "build.jl"),
		check: localize('webAssembly.check', "Check"),
		checkIntro: localize('webAssembly.checkIntro', "Check runs the module of the way chosen in step 2 in this page, on the example of step 1, and saves its counts; the Julia code below then compares them with the counts of step 1, pixel by pixel. The two must agree at every pixel."),
		checkRun: localize('webAssembly.checkRun', "Run in the Page and Check"),
		computed: localize('webAssembly.computed', "Computed in the page in {0} ms, with {1}."),
		oneCall: localize('webAssembly.oneCall', "one call of fill_counts for the whole picture"),
		perPixel: localize('webAssembly.perPixel', "one call of escape_time for each pixel"),
		noModule: localize('webAssembly.noModule', "No module yet at {0}: run Compile, in step 2, first."),
		failed: localize('webAssembly.failed', "The module could not run in the page: {0}"),
		live: localize('webAssembly.live', "Live View"),
		liveIntro: localize('webAssembly.liveIntro', "Live View draws the example of step 1 with the module of the chosen way, computed in the page at each change: turn the mouse wheel over the picture to zoom in or out where the pointer is, and drag it to move. Draw reads the module again, after a new build."),
		draw: localize('webAssembly.draw', "Draw"),
		reset: localize('webAssembly.reset', "Reset View"),
		frame: localize('webAssembly.frame', "{0} ms for {1} pixels, with {2}."),
		view: localize('webAssembly.view', "Centre {0}, {1} across."),
		javascript: localize('webAssembly.javascript', "The Same in JavaScript"),
		javascriptIntro: localize('webAssembly.javascriptIntro', "escape_time written in JavaScript, with the same operations in the same order, and the loop over the pixels, run in this page on the example of step 1 and timed beside each module that Compile has built. Each runs once to warm up, then five times, and the fastest time is kept. JavaScript numbers are 64-bit floating-point numbers too, so the counts must agree at every pixel."),
		javascriptRun: localize('webAssembly.javascriptRun', "Run and Time"),
		timing: localize('webAssembly.timing', "Timing, which takes a few seconds..."),
		timed: localize('webAssembly.timed', "The fastest of five runs on the example of step 1, {0} pixels."),
		contender: localize('webAssembly.contender', "Code"),
		fastest: localize('webAssembly.fastest', "Fastest"),
		calls: localize('webAssembly.calls', "Calls"),
		speedUp: localize('webAssembly.speedUp', "Speed-Up over JavaScript"),
		differ: localize('webAssembly.differ', "Pixels That Differ from JavaScript"),
		plainJavaScript: localize('webAssembly.plainJavaScript', "JavaScript"),
		noCalls: localize('webAssembly.noCalls', "none: JavaScript throughout"),
		notBuilt: localize('webAssembly.notBuilt', "not built yet: run Compile, in step 2"),
		ways3: localize('webAssembly.ways3', "Compare the Ways"),
		waysIntro: localize('webAssembly.waysIntro', "The modules of the three ways that Compile has built, side by side, each run in this page on the example of step 1: how the function reached WebAssembly, what the way needs, the size of the module, the fastest of five runs after one to warm up, the calls into WebAssembly, and the pixels where its counts differ from those of the same loop in JavaScript, expected to be none."),
		waysRun: localize('webAssembly.waysRun', "Run and Compare"),
		way3: localize('webAssembly.way3', "Way"),
		writtenIn: localize('webAssembly.writtenIn', "Written In"),
		needs: localize('webAssembly.needs', "What It Needs"),
		size: localize('webAssembly.size', "Module Size"),
		bytes: localize('webAssembly.bytes', "{0} bytes"),
		written: {
			rust: localize('webAssembly.written.rust', "Rust, translated by hand"),
			c: localize('webAssembly.written.c', "C, translated by hand"),
			webassemblycompiler: localize('webAssembly.written.webassemblycompiler', "Julia, the function of step 1"),
		},
		needed: {
			rust: localize('webAssembly.needed.rust', "Rust, with rustup and cargo"),
			c: localize('webAssembly.needed.c', "The Julia packages Clang_jll and LLD_jll"),
			webassemblycompiler: localize('webAssembly.needed.webassemblycompiler', "Julia 1.10 and WebAssemblyCompiler.jl"),
		},
	};
	const radios = <T extends string>(name: string, values: readonly T[], labels: Record<T, string>) => values
		.map((value, index) => `<label><input type="radio" name="${name}" value="${value}"${index === 0 ? ' checked' : ''}> ${labels[value]}</label>`).join('');
	const codeBlock = (box: CodeBox, label: string, buttons: string) => `
		<h3 class="part" id="${box}Title">${label}</h3>
		<pre class="wasm-code" id="${box}"></pre>
		${buttons ? `<div class="settings"><span class="bar">${buttons}</span></div>` : ''}
		<div class="small status" id="${box}Status"></div>`;
	const runButton = (box: RunBox) => `<button class="action current" id="${box}Run">${text.run}</button>`;
	// The regions as numbers, for the page's script, which computes the same grid as Julia
	const regions = Object.fromEntries(Object.entries(FRACTAL_REGIONS).map(([example, region]) => [example, { x0: Number(region.x0), x1: Number(region.x1), y0: Number(region.y0), y1: Number(region.y1) }]));
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		omitPoweredBy: !WEBASSEMBLY_METADATA.webAssembly.packages.length,
		allowWebAssembly: true,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; width: 7em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		#folder { width: 32em; }
		.wasm-code { margin: 6px 0 0; padding: 10px 12px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); white-space: pre; overflow-x: auto; tab-size: 4; max-width: 900px; }
		.choices label { margin-right: 16px; }
		#liveCanvas { display: block; margin: 8px 0 4px; max-width: 100%; border-radius: 3px; background: var(--vscode-textCodeBlock-background); cursor: grab; }
		#liveCanvas.dragging { cursor: grabbing; }
		#javascriptStep, #waysStep { padding: 0 12px 12px; }
		#javascriptStep .wasm-code { max-width: none; }
		.timing-table { border-collapse: collapse; margin-top: 8px; }
		.timing-table th, .timing-table td { text-align: left; padding: 3px 12px 3px 0; border-bottom: 1px solid var(--vscode-panel-border); vertical-align: top; }
		.timing-table td.number { text-align: right; font-variant-numeric: tabular-nums; }
`,
		steps: [
			{
				id: 'step-function',
				title: text.function,
				bodyHtml: `
		<div class="row choices"><span class="small">${text.example}</span> ${radios('example', ['mandelbrot', 'julia'] as const, text.examples)}</div>
		<div class="row">
			<span class="small">${text.width}</span> <input type="text" id="width" spellcheck="false">
			<span class="small">${text.maxiter}</span> <input type="text" id="maxiter" spellcheck="false">
			<span id="cFields"><span class="small">${text.cre}</span> <input type="text" id="cre" spellcheck="false">
			<span class="small">${text.cim}</span> <input type="text" id="cim" spellcheck="false"></span>
		</div>
		<p class="hint">${text.functionHint}</p>
		${codeBlock('defineCode', text.code, runButton('defineCode'))}
`,
			},
			{
				id: 'step-compile',
				title: text.compile,
				bodyHtml: `
		<div class="row choices"><span class="small">${text.way}</span> ${radios('way', WAYS, text.ways)}</div>
		<p class="hint" id="compileHint"></p>
		<div class="row"><span class="small" title="${text.folderTooltip}">${text.folder}</span> <input type="text" id="folder" spellcheck="false"> <button class="action" id="chooseFolder">${text.choose}</button></div>
		<div id="rustSources">
			${codeBlock('cargoCode', text.cargo, '')}
			${codeBlock('rustCode', text.rustSource, '')}
		</div>
		<div id="cSources">
			${codeBlock('cCode', text.cSource, '')}
			${codeBlock('buildCode', text.buildScript, '')}
		</div>
		<div id="compilerSources">
			${codeBlock('scriptCode', text.script, '')}
		</div>
		${codeBlock('compileCode', text.code, runButton('compileCode'))}
`,
			},
			{
				id: 'step-check',
				title: text.check,
				bodyHtml: `
		<p class="hint">${text.checkIntro}</p>
		${codeBlock('checkCode', text.code, `<button class="action current" id="checkRun">${text.checkRun}</button>`)}
		<div class="small status" id="checkPageStatus"></div>
`,
			},
			{
				id: 'step-live',
				title: text.live,
				bodyHtml: `
		<p class="hint">${text.liveIntro}</p>
		<div class="row choices"><span class="small">${text.way}</span> ${radios('liveWay', WAYS, text.ways)}</div>
		<div class="settings"><span class="bar"><button class="action current" id="draw">${text.draw}</button> <button class="action" id="resetView">${text.reset}</button></span></div>
		<canvas id="liveCanvas" width="800" height="640" hidden></canvas>
		<div class="small status" id="liveStatus"></div>
		<div class="small" id="liveView"></div>
`,
			},
		],
		nextStepsHtml: `					<li><button class="list-btn panel-toggle" id="btn-javascript">${nextStepIcon('compare')}${text.javascript}</button></li>
					<li><button class="list-btn panel-toggle" id="btn-ways">${nextStepIcon('compare')}${text.ways3}</button></li>`,
		// The panels on the right, opened as the scaffold opens its own, which the page's script then fills
		nextStepsWiringJs: `${openPageStepJs}
		document.getElementById('btn-javascript').addEventListener('click', function() {
			openPageStep(this, 'javascriptStep', ${JSON.stringify(text.javascript)}, 'pollis-javascript-step');
		});
		document.getElementById('btn-ways').addEventListener('click', function() {
			openPageStep(this, 'waysStep', ${JSON.stringify(text.ways3)}, 'pollis-ways-step');
		});`,
		pageScriptJs: `
	${colorizeBracketsJs}
	const TEXT = ${JSON.stringify(text)};
	const REGIONS = ${JSON.stringify(regions)};
	const BOXES = ${JSON.stringify(CODE_BOXES)};
	const RUN_BOXES = ${JSON.stringify(RUN_BOXES)};
	const widthInput = document.getElementById('width');
	const maxiterInput = document.getElementById('maxiter');
	const creInput = document.getElementById('cre');
	const cimInput = document.getElementById('cim');
	const folderInput = document.getElementById('folder');
	const DECIMAL = /^-?\\d+(\\.\\d+)?$/;
	const WHOLE = /^\\d+$/;

	function checkedValue(name, fallback) {
		const radio = document.querySelector('input[name=' + name + ']:checked');
		return radio ? radio.value : fallback;
	}
	function inputs() {
		return { example: checkedValue('example', 'mandelbrot'), width: widthInput.value.trim(), maxiter: maxiterInput.value.trim(), cre: creInput.value.trim(), cim: cimInput.value.trim(), way: checkedValue('way', 'rust'), folder: folderInput.value.trim() || folderInput.placeholder };
	}
	function validity() {
		const v = inputs();
		const whole = (value, low, high) => WHOLE.test(value) && Number(value) >= low && Number(value) <= high;
		return { valid: whole(v.width, 16, 4000) && whole(v.maxiter, 1, 100000) && DECIMAL.test(v.cre) && DECIMAL.test(v.cim), folderValid: !!v.folder && !/["\\r\\n]/.test(v.folder) };
	}
	// Julia's round, to the nearest whole number with halves to the even one, so that the page's height is Julia's
	function roundEven(value) {
		const rounded = Math.round(value);
		return Math.abs(value - Math.trunc(value)) === 0.5 && rounded % 2 !== 0 ? rounded - 1 : rounded;
	}
	// The grid of step 1, computed with the same operations as in Julia: the pixels, the corner at the bottom left, the
	// distance between two pixels, c and the most iterations
	function grid() {
		const v = inputs();
		const region = REGIONS[v.example];
		const width = Number(v.width);
		return { julia: v.example === 'julia', width, height: roundEven(width * (region.y1 - region.y0) / (region.x1 - region.x0)), x0: region.x0, y0: region.y0, spacing: (region.x1 - region.x0) / (width - 1), cr: Number(v.cre), ci: Number(v.cim), maxiter: Number(v.maxiter) };
	}
	function setStatus(element, html, missing) {
		element.innerHTML = html;
		element.classList.toggle('missing', !!missing);
	}
	// A message that something is missing or failed, as text, since it carries a path or an error
	function setStatusText(element, message) {
		element.textContent = message;
		element.classList.add('missing');
	}
	function render() {
		const { valid, folderValid } = validity();
		const way = checkedValue('way', 'rust');
		document.getElementById('cFields').hidden = checkedValue('example', 'mandelbrot') !== 'julia';
		document.getElementById('compileHint').innerHTML = way === 'rust' ? TEXT.rustHint : way === 'c' ? TEXT.cHint : TEXT.compilerHint;
		document.getElementById('rustSources').hidden = way !== 'rust';
		document.getElementById('cSources').hidden = way !== 'c';
		document.getElementById('compilerSources').hidden = way !== 'webassemblycompiler';
		document.getElementById('defineCodeRun').disabled = !valid;
		document.getElementById('compileCodeRun').disabled = !folderValid;
		document.getElementById('checkRun').disabled = !valid || !folderValid;
		document.getElementById('draw').disabled = !valid || !folderValid;
		const defineStatus = document.getElementById('defineCodeStatus');
		if (!valid) {
			setStatus(defineStatus, TEXT.needInputs, true);
		} else if (defineStatus.classList.contains('missing')) {
			setStatus(defineStatus, '', false);
		}
		const compileStatus = document.getElementById('compileCodeStatus');
		if (!folderValid) {
			setStatus(compileStatus, TEXT.needFolder, true);
		} else if (compileStatus.classList.contains('missing')) {
			setStatus(compileStatus, '', false);
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
	// The way of step 2 and of Live View are one choice, shown in both places
	function setWay(way) {
		for (const radio of document.querySelectorAll('input[name=way], input[name=liveWay]')) {
			radio.checked = radio.value === way;
		}
	}
	for (const input of [widthInput, maxiterInput, creInput, cimInput, folderInput]) {
		input.addEventListener('input', sendDraft);
	}
	for (const radio of document.querySelectorAll('input[name=example]')) {
		radio.addEventListener('change', sendDraft);
	}
	for (const radio of document.querySelectorAll('input[name=way], input[name=liveWay]')) {
		radio.addEventListener('change', () => {
			setWay(radio.value);
			sendDraft();
			// A picture already drawn is drawn again with the module of the new way
			if (liveWay) {
				load('live');
			}
		});
	}
	for (const box of RUN_BOXES) {
		document.getElementById(box + 'Run').addEventListener('click', () => vscode.postMessage({ command: 'run', box, inputs: inputs() }));
	}
	document.getElementById('chooseFolder').addEventListener('click', () => vscode.postMessage({ command: 'chooseFolder', value: inputs().folder }));

	// The modules the page has loaded, by way: the exports, and the room for counts in the module's memory
	const modules = {};
	function load(purpose) {
		vscode.postMessage({ command: 'load', way: checkedValue('way', 'rust'), folder: inputs().folder, purpose });
	}
	// The counts of a grid into out, row after row from the bottom: with one call of fill_counts when the module has it
	// (the Rust and C ways), otherwise with one call of escape_time for each pixel (WebAssemblyCompiler.jl)
	function compute(module, g, out) {
		const e = module.exports;
		const n = g.width * g.height;
		if (e.fill_counts && e.alloc_counts && e.free_counts && e.memory) {
			if (module.size !== n) {
				if (module.size) {
					e.free_counts(module.pointer, module.size);
				}
				module.pointer = e.alloc_counts(n);
				module.size = n;
			}
			e.fill_counts(module.pointer, g.height, g.width, g.x0, g.y0, g.spacing, g.julia ? 1 : 0, g.cr, g.ci, g.maxiter);
			// A view made after the call: the memory may have grown, which replaces its buffer
			out.set(new Int32Array(e.memory.buffer, module.pointer, n));
			return TEXT.oneCall;
		}
		const escape = e.escape_time;
		for (let i = 0; i < g.height; i++) {
			const y = g.y0 + i * g.spacing;
			for (let j = 0; j < g.width; j++) {
				const x = g.x0 + j * g.spacing;
				out[i * g.width + j] = g.julia ? escape(x, y, g.cr, g.ci, g.maxiter) : escape(0.0, 0.0, x, y, g.maxiter);
			}
		}
		return TEXT.perPixel;
	}

	// Check: the counts of step 1's grid, sent to be saved and compared in Julia
	const checkStatus = document.getElementById('checkPageStatus');
	function runCheck(way) {
		const g = grid();
		const out = new Int32Array(g.width * g.height);
		const start = performance.now();
		const how = compute(modules[way], g, out);
		const ms = performance.now() - start;
		setStatus(checkStatus, TEXT.computed.replace('{0}', ms.toFixed(1)).replace('{1}', how), false);
		vscode.postMessage({ command: 'counts', inputs: inputs(), bytes: new Uint8Array(out.buffer) });
	}
	document.getElementById('checkRun').addEventListener('click', () => {
		setStatus(checkStatus, '', false);
		load('check');
	});

	// Live View: the view, its corner at the bottom left and the distance between two pixels, changed by the wheel and by
	// dragging; the colours of the counts as in the pictures of Compile Julia to an Executable
	const canvas = document.getElementById('liveCanvas');
	const context = canvas.getContext('2d');
	const liveStatus = document.getElementById('liveStatus');
	const liveView = document.getElementById('liveView');
	let liveWay;
	let view;
	let viewKey;
	let palette;
	let paletteIterations;
	let pending = false;
	function colours(maxiter) {
		const table = new Uint8ClampedArray(3 * (maxiter + 1));
		for (let k = 0; k < maxiter; k++) {
			const s = k / (k + 8.0);
			const t = 1.0 - s;
			table[3 * k] = Math.trunc(255.0 * 9.0 * t * s * s * s);
			table[3 * k + 1] = Math.trunc(255.0 * 15.0 * t * t * s * s);
			table[3 * k + 2] = Math.trunc(255.0 * 8.5 * t * t * t * s);
		}
		return table;
	}
	function resetView() {
		const g = grid();
		view = { x0: g.x0, y0: g.y0, spacing: g.spacing };
	}
	function draw() {
		pending = false;
		const module = modules[liveWay];
		if (!module || !validity().valid) {
			return;
		}
		const g = grid();
		const key = [g.julia, g.width].join(' ');
		if (!view || viewKey !== key) {
			viewKey = key;
			resetView();
		}
		if (canvas.width !== g.width || canvas.height !== g.height) {
			canvas.width = g.width;
			canvas.height = g.height;
		}
		if (paletteIterations !== g.maxiter) {
			palette = colours(g.maxiter);
			paletteIterations = g.maxiter;
		}
		const shown = Object.assign({}, g, view);
		const counts = new Int32Array(g.width * g.height);
		const start = performance.now();
		const how = compute(module, shown, counts);
		const ms = performance.now() - start;
		const image = context.createImageData(g.width, g.height);
		const pixels = image.data;
		for (let i = 0; i < g.height; i++) {
			// Row i counts from the bottom of the picture, the canvas from the top
			const row = (g.height - 1 - i) * g.width;
			for (let j = 0; j < g.width; j++) {
				const k = counts[i * g.width + j];
				const p = 4 * (row + j);
				if (k < g.maxiter) {
					pixels[p] = palette[3 * k];
					pixels[p + 1] = palette[3 * k + 1];
					pixels[p + 2] = palette[3 * k + 2];
				}
				pixels[p + 3] = 255;
			}
		}
		context.putImageData(image, 0, 0);
		canvas.hidden = false;
		setStatus(liveStatus, TEXT.frame.replace('{0}', ms.toFixed(1)).replace('{1}', (g.width * g.height).toLocaleString()).replace('{2}', how), false);
		const across = view.spacing * (g.width - 1);
		const cx = view.x0 + across / 2;
		const cy = view.y0 + view.spacing * (g.height - 1) / 2;
		liveView.textContent = TEXT.view.replace('{0}', cx.toPrecision(10) + (cy < 0 ? ' - ' : ' + ') + Math.abs(cy).toPrecision(10) + 'i').replace('{1}', across.toPrecision(4));
	}
	function schedule() {
		if (!pending) {
			pending = true;
			requestAnimationFrame(draw);
		}
	}
	// The pixel under the pointer, in the canvas's own pixels, which its style may scale
	function pointer(event) {
		const box = canvas.getBoundingClientRect();
		return { j: (event.clientX - box.left) * canvas.width / box.width, r: (event.clientY - box.top) * canvas.height / box.height };
	}
	canvas.addEventListener('wheel', event => {
		if (!view) {
			return;
		}
		event.preventDefault();
		const { j, r } = pointer(event);
		const i = canvas.height - 1 - r;
		const x = view.x0 + j * view.spacing;
		const y = view.y0 + i * view.spacing;
		view.spacing *= event.deltaY < 0 ? 0.8 : 1.25;
		view.x0 = x - j * view.spacing;
		view.y0 = y - i * view.spacing;
		schedule();
	}, { passive: false });
	let drag;
	canvas.addEventListener('mousedown', event => {
		drag = pointer(event);
		canvas.classList.add('dragging');
	});
	window.addEventListener('mousemove', event => {
		if (!drag || !view) {
			return;
		}
		const now = pointer(event);
		view.x0 -= (now.j - drag.j) * view.spacing;
		view.y0 += (now.r - drag.r) * view.spacing;
		drag = now;
		schedule();
	});
	window.addEventListener('mouseup', () => {
		drag = undefined;
		canvas.classList.remove('dragging');
	});
	document.getElementById('draw').addEventListener('click', () => load('live'));
	document.getElementById('resetView').addEventListener('click', () => {
		resetView();
		schedule();
	});

	// The Same in JavaScript and Compare the Ways: the function in JavaScript, run here, and the modules of the three
	// ways, each timed on step 1's grid
	${JAVASCRIPT_CODE}
	const codeHtml = {};
	const WAYS = ${JSON.stringify(WAYS)};
	const WAY_NAMES = ${JSON.stringify(text.ways)};
	// The modules being read for a timing, by way, and the timing they are for: 'javascript' or 'ways'
	let timingModules;
	let timingKind;
	// The step in the panel on the right: its text, the code in JavaScript for The Same in JavaScript, a button, a status
	// line and the results
	function fillStep(step, intro, withCode, label, kind) {
		step.innerHTML = '<div class="panel-code-desc"></div>' + (withCode ? '<pre class="wasm-code" id="javascriptCode"></pre>' : '')
			+ '<div class="settings"><span class="bar"><button class="action current" id="timingRun"></button></span></div>'
			+ '<div class="small status" id="timingStatus"></div><div id="timingResults"></div>';
		step.querySelector('.panel-code-desc').textContent = intro;
		if (withCode) {
			const box = document.getElementById('javascriptCode');
			box.innerHTML = codeHtml.javascriptCode || '';
			colorizeBrackets(box, '#');
		}
		const run = document.getElementById('timingRun');
		run.textContent = label;
		run.disabled = !validity().valid || !validity().folderValid;
		run.addEventListener('click', () => {
			run.disabled = true;
			document.getElementById('timingResults').innerHTML = '';
			setStatus(document.getElementById('timingStatus'), '', false);
			document.getElementById('timingStatus').textContent = TEXT.timing;
			// The modules of all the ways, read again: each arrives, or is missing, before the timing starts
			timingKind = kind;
			timingModules = {};
			for (const way of WAYS) {
				vscode.postMessage({ command: 'load', way, folder: inputs().folder, purpose: 'timing' });
			}
		});
	}
	window.addEventListener('pollis-javascript-step', () => fillStep(document.getElementById('javascriptStep'), TEXT.javascriptIntro, true, TEXT.javascriptRun, 'javascript'));
	window.addEventListener('pollis-ways-step', () => fillStep(document.getElementById('waysStep'), TEXT.waysIntro, false, TEXT.waysRun, 'ways'));
	function timingModuleArrived(way, bytes) {
		if (!timingModules) {
			return;
		}
		const done = instance => {
			timingModules[way] = instance ? { exports: instance.exports, pointer: 0, size: 0, bytes: bytes.byteLength } : null;
			if (Object.keys(timingModules).length === WAYS.length) {
				// A moment for the page to show that timing has started
				setTimeout(timingKind === 'ways' ? compareWays : timeAll, 20);
			}
		};
		if (bytes) {
			WebAssembly.instantiate(bytes, { js: {} }).then(result => done(result.instance), () => done(undefined));
		} else {
			done(undefined);
		}
	}
	// The fastest of five runs, after one to warm up, with the counts of the last
	function fastest(fill, n) {
		const counts = new Int32Array(n);
		let how = fill(counts);
		let best = Infinity;
		for (let run = 0; run < 5; run++) {
			const start = performance.now();
			how = fill(counts);
			best = Math.min(best, performance.now() - start);
		}
		return { ms: best, how, counts };
	}
	// The pixels where two sets of counts differ
	function differing(a, b) {
		let differ = 0;
		for (let p = 0; p < a.length; p++) {
			differ += a[p] !== b[p] ? 1 : 0;
		}
		return differ;
	}
	// A table of the results, under the step's status line, with the columns of numbers aligned to the right
	function showResults(labels, rows, numberColumns, n) {
		const table = document.createElement('table');
		table.className = 'timing-table';
		const head = table.insertRow();
		for (const label of labels) {
			const cell = document.createElement('th');
			cell.textContent = label;
			head.appendChild(cell);
		}
		for (const values of rows) {
			const row = table.insertRow();
			values.forEach((value, index) => {
				const cell = row.insertCell();
				cell.textContent = value;
				if (numberColumns.includes(index)) {
					cell.className = 'number';
				}
			});
		}
		const results = document.getElementById('timingResults');
		if (results) {
			results.appendChild(table);
			document.getElementById('timingStatus').textContent = TEXT.timed.replace('{0}', n.toLocaleString());
			document.getElementById('timingRun').disabled = false;
		}
		timingModules = undefined;
	}
	// The Same in JavaScript: JavaScript first, then each module, with its speed-up over JavaScript
	function timeAll() {
		const g = grid();
		const n = g.width * g.height;
		const plain = fastest(counts => {
			fillCounts(counts, g.height, g.width, g.x0, g.y0, g.spacing, g.julia, g.cr, g.ci, g.maxiter);
			return TEXT.noCalls;
		}, n);
		const rows = [[TEXT.plainJavaScript, plain.ms.toFixed(1) + ' ms', TEXT.noCalls, '1.00×', '']];
		for (const way of WAYS) {
			const module = timingModules[way];
			const name = 'WebAssembly, ' + WAY_NAMES[way];
			if (!module) {
				rows.push([name, '', TEXT.notBuilt, '', '']);
				continue;
			}
			const timed = fastest(counts => compute(module, g, counts), n);
			rows.push([name, timed.ms.toFixed(1) + ' ms', timed.how, (plain.ms / timed.ms).toFixed(2) + '×', differing(timed.counts, plain.counts).toLocaleString()]);
		}
		showResults([TEXT.contender, TEXT.fastest, TEXT.calls, TEXT.speedUp, TEXT.differ], rows, [1, 3, 4], n);
	}
	// Compare the Ways: each module with how its function reached WebAssembly, what the way needs and its size, its
	// counts against those of the loop in JavaScript
	function compareWays() {
		const g = grid();
		const n = g.width * g.height;
		const plain = new Int32Array(n);
		fillCounts(plain, g.height, g.width, g.x0, g.y0, g.spacing, g.julia, g.cr, g.ci, g.maxiter);
		const rows = WAYS.map(way => {
			const module = timingModules[way];
			if (!module) {
				return [WAY_NAMES[way], TEXT.written[way], TEXT.needed[way], '', '', TEXT.notBuilt, ''];
			}
			const timed = fastest(counts => compute(module, g, counts), n);
			return [WAY_NAMES[way], TEXT.written[way], TEXT.needed[way], TEXT.bytes.replace('{0}', module.bytes.toLocaleString()), timed.ms.toFixed(1) + ' ms', timed.how, differing(timed.counts, plain).toLocaleString()];
		});
		showResults([TEXT.way3, TEXT.writtenIn, TEXT.needs, TEXT.size, TEXT.fastest, TEXT.calls, TEXT.differ], rows, [3, 4, 6], n);
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			widthInput.value = message.inputs.width;
			maxiterInput.value = message.inputs.maxiter;
			creInput.value = message.inputs.cre;
			cimInput.value = message.inputs.cim;
			folderInput.value = '';
			folderInput.placeholder = message.inputs.folder;
			for (const radio of document.querySelectorAll('input[name=example]')) {
				radio.checked = radio.value === message.inputs.example;
			}
			setWay(message.inputs.way);
			sendDraft();
		} else if (message.command === 'colorizedCode') {
			document.getElementById('mtk-theme').textContent = message.css;
			codeHtml[message.box] = message.html;
			const box = document.getElementById(message.box);
			if (box) {
				box.innerHTML = message.html;
				colorizeBrackets(box, '#');
			}
		} else if (message.command === 'folder') {
			folderInput.value = message.value;
			sendDraft();
		} else if (message.command === 'sent') {
			const status = document.getElementById(message.box + 'Status');
			setStatus(status, TEXT.sent, false);
		} else if (message.command === 'module') {
			const status = message.purpose === 'check' ? checkStatus : liveStatus;
			if (message.purpose === 'timing') {
				timingModuleArrived(message.way, message.bytes);
				return;
			}
			WebAssembly.instantiate(message.bytes, { js: {} }).then(result => {
				modules[message.way] = { exports: result.instance.exports, pointer: 0, size: 0 };
				if (message.purpose === 'check') {
					runCheck(message.way);
				} else {
					liveWay = message.way;
					draw();
				}
			}, error => setStatusText(status, TEXT.failed.replace('{0}', String(error))));
		} else if (message.command === 'noModule' && message.purpose === 'timing') {
			timingModuleArrived(message.way, undefined);
		} else if (message.command === 'noModule') {
			setStatusText(message.purpose === 'check' ? checkStatus : liveStatus, TEXT.noModule.replace('{0}', message.path));
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: WEB_ASSEMBLY_COMMAND_ID, title: localize2('webAssembly.action', "Compile Julia to WebAssembly..."), category: localize2('compilationLab.category', "Compilation Lab"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openWebAssemblyPage(accessor);
	}
});
