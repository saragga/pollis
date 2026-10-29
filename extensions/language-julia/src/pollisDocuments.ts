// POLLIS: once per session, when the REPL starts, compiles in a hidden process of low priority the documents of
// Help > Documentation from their LaTeX sources, the app's docs/ folder, into ~/.pollis/documents, where Help opens
// them (scripts/terminalserver/compile_documents.jl). While it compiles, the status bar says so, with how many
// documents are ready; when nothing has changed since the last compile, it quits after a second or two, unseen.
// After each compile, PollisDocuments, ~/.pollis/documents/PollisDocuments.duckdb, the passages Ask Pollis searches, is
// brought up to date the same way (scripts/terminalserver/ask_index.jl), from the documents the workbench lists
// (`pollis.askPollis.sources`), written to ~/.pollis/documents/sources.json. When passages have no embedding yet and the
// embedding model (pollis.ask.embeddingModel) is on this computer, the script asks for its llama.cpp server
// (pollisLlamaServer.ts), which stays running for the searches of Ask Pollis, and the status bar counts the passages
// embedded.
// The command `language-julia.pollisCompileDocuments`, for Help > Documentation > Compile the Documents Now, runs the
// same compile at once, or waits for the one running; it answers {total, failed}, without `total` when every document
// was up to date, or {error}.
// The command `language-julia.pollisIndexDocuments` brings PollisDocuments up to date again, for the workbench when the
// toolboxes change; and so does each vignette or toolbox document compiled, which Ask Pollis then reads. Both only once
// the documents were compiled in this session: otherwise the REPL's start indexes them.
// The package vignettes the list gives with what to compile them from, not compiled yet or changed since, are compiled
// after the index is made, one at a time, and the index is then made again with them; one that cannot be compiled is
// not tried again in this session.
// The Julia Manual is that of the Julia the index is made with, the REPL's: when the REPL starts again with another
// version of Julia, the index is made again, with that version's Manual; and when pollis.ask.juliaManual changes.
// At Pollis' first start the REPL installs DuckDB.jl while the index is made, which then cannot be: it is made again
// once the install has finished (`pollisDBInstalled`), and until then Ask Pollis is told it is installing.
// The command `language-julia.pollisAskIndexProgress` answers how far the compile and the index have come, for the
// page of Ask Pollis while it waits for its first index: {stage, done, total}, nothing when neither is running.
// The command `language-julia.pollisCompileVignette`, with {source, name, pdf}, compiles a package's vignette for
// Help > Documentation > Packages (scripts/terminalserver/compile_vignette.jl): from the vignette/ folder of an
// installed package, or from its repository on GitHub, into the file `pdf`; it answers {pdf}, or {error}. It compiles the
// documents of the installed toolboxes too, for Help > Documentation > Toolboxes, from their folders. Beside each PDF
// goes its .labels, the page of each heading (docs/ask_labels.tex), which ask_index.jl cuts it by.

import * as child_process from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaExecutable, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'
import { whenDuckDBReady } from './pollisDuckDB'
import { startServer } from './pollisLlamaServer'
import { valueFile } from './pollisModels'

let g_started = false
let g_compiling: Promise<DocumentsAnswer> | undefined
let g_indexing: Promise<void> | undefined
/** A compile has finished while the index was being made: it is made again after. */
let g_indexAgain = false
/** How far the compile, then the index, have come: of the documents compiled or read, or of the passages embedded. */
let g_progress: IndexProgress | undefined
/** The index could not be made without DuckDB.jl, which the REPL is installing; and whether the install has finished. */
let g_waitingForDuckDB = false
let g_duckDBInstalled = false
/** The version of the Julia the documents were indexed with this session: the Julia Manual is that version's. */
let g_juliaVersion: string | undefined
/** The vignettes compiling, by their PDF, so that a second request for one gets the first's answer. */
const g_vignettes = new Map<string, Promise<VignetteAnswer>>()
/** The vignettes the index could not compile in this session, by their PDF: not tried again until the next. */
const g_vignettesFailed = new Set<string>()

type IndexProgress = { stage: 'compiling' | 'installing' | 'reading' | 'embedding'; done: number; total: number }

/** The embedding model of Ask Pollis when the setting pollis.ask.embeddingModel gives none. */
const EMBEDDING_MODEL = 'hf:ggml-org/embeddinggemma-2-GGUF/embeddinggemma-2-Q8_0.gguf'
/** What a passage is given to the embedding model as, when pollis.ask.passagePrefix gives nothing: EmbeddingGemma's form for a document. */
const PASSAGE_PREFIX = 'title: {title} | text: {text}'
/** The context of the embedding server, in tokens: room for the longest passage (ask_index.jl, LONGEST). */
const EMBEDDING_CONTEXT = 2048

type DocumentsAnswer = { total?: number; failed?: number; error?: string }
/** A document of the list of `pollis.askPollis.sources`: a vignette not compiled has what to compile it from. */
type AskSource = { file: string; compile?: { source: string; name: string } }

export function compileDocumentsInBackground(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    env: { [key: string]: string }
) {
    if (g_started) {
        // The REPL started again with another Julia: its Manual is indexed in place of the last
        if (!g_compiling && g_juliaVersion !== undefined && juliaExecutable.version !== g_juliaVersion) {
            indexDocuments(context, juliaExecutable, env)
        }
        return
    }
    g_started = true
    compileDocuments(context, juliaExecutable, env)
}

/** The status bar's item with `title`, shown at the first report, until `finish`. */
function windowProgress(title: string): { report: (message: string) => void; finish: () => void } {
    let report: ((message: string) => void) | undefined
    let finish: (() => void) | undefined
    return {
        report: (message) => {
            if (!report) {
                report = () => {}
                vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title }, (progress) => {
                    report = (message) => progress.report({ message })
                    report(message)
                    return new Promise<void>((resolve) => (finish = resolve))
                })
            }
            report(message)
        },
        finish: () => finish?.(),
    }
}

/** Runs compile_documents.jl, or answers with the run already going: how many documents it compiled and how many failed. */
function compileDocuments(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    env: { [key: string]: string }
): Promise<DocumentsAnswer> {
    g_compiling ??= new Promise<DocumentsAnswer>((resolve) => {
        const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'compile_documents.jl')
        const julia = child_process.spawn(
            juliaExecutable.command,
            [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, path.join(vscode.env.appRoot, 'docs')],
            { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }
        )
        try {
            // Inherited by Tectonic, which the script runs for each document
            if (julia.pid !== undefined) {
                os.setPriority(julia.pid, os.constants.priority.PRIORITY_BELOW_NORMAL)
            }
        } catch {
            // The process has quit already, or the system does not allow it.
        }
        const answer: DocumentsAnswer = {}
        g_progress = { stage: 'compiling', done: 0, total: 0 }
        // The status bar's item, from the first line the script writes until it quits
        const progress = windowProgress('Compiling the documentation')
        readline.createInterface({ input: julia.stdout }).on('line', (line) => {
            let message: { [key: string]: unknown }
            try {
                message = JSON.parse(line)
            } catch {
                return
            }
            if (message.status === 'installing') {
                progress.report('installing PollisTeX')
            } else if (typeof message.total === 'number') {
                answer.total = message.total
                g_progress = { stage: 'compiling', done: typeof message.done === 'number' ? message.done : 0, total: message.total }
                progress.report(`${typeof message.done === 'number' ? message.done : 0} of ${message.total}`)
            } else if (typeof message.failed === 'string') {
                answer.failed = (answer.failed ?? 0) + 1
                console.error(`[pollis] could not compile ${message.failed}; its log is in ~/.pollis/documents`)
            }
        })
        julia.on('error', (err) => {
            console.error('[pollis] could not compile the documentation', err)
            answer.error = 'failed'
        })
        julia.on('close', () => {
            progress.finish()
            g_compiling = undefined
            g_progress = undefined
            resolve(answer)
            indexDocuments(context, juliaExecutable, env)
        })
        context.subscriptions.push({ dispose: () => julia.kill() })
    })
    return g_compiling
}

/**
 * Brings PollisDocuments up to date again, for the documents listed now: at once, or after the run going; nothing before
 * the documents are compiled in this session, nor while they are, since the index follows the compile.
 */
async function reindexDocuments(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    if (!g_started || g_compiling) {
        return
    }
    try {
        indexDocuments(context, await executableFeature.getExecutable(), getPackageEnvironment())
    } catch {
        // No Julia: there is nothing to index with
    }
}

/** Brings PollisDocuments up to date with ask_index.jl, once the run going, if any, has finished. */
function indexDocuments(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    env: { [key: string]: string }
) {
    if (g_indexing) {
        g_indexAgain = true
        return
    }
    g_progress = { stage: 'reading', done: 0, total: 0 }
    g_juliaVersion = juliaExecutable.version
    let noDuckDB = false
    let compiled = false
    g_indexing = (async () => {
        const sources = path.join(os.homedir(), '.pollis', 'documents', 'sources.json')
        let vignettes: AskSource[] = []
        try {
            const list = await vscode.commands.executeCommand<AskSource[]>('pollis.askPollis.sources')
            vignettes = list.filter((source) => source.compile && !g_vignettesFailed.has(source.file))
            await fs.promises.mkdir(path.dirname(sources), { recursive: true })
            await fs.promises.writeFile(sources, JSON.stringify(list.map((source) => ({ ...source, compile: undefined }))))
        } catch (err) {
            console.error('[pollis] could not list the documents for Ask Pollis', err)
            return
        }
        // ask_index.jl loads the DuckDB engine and fts of Pollis
        await whenDuckDBReady()
        const settings = vscode.workspace.getConfiguration('pollis.ask')
        const model = settings.get<string>('embeddingModel')?.trim() || EMBEDDING_MODEL
        const prefix = settings.get<string>('passagePrefix')?.trim() || PASSAGE_PREFIX
        // Not downloaded here: Ask Pollis offers it at first use
        const available = fs.existsSync(valueFile(model)) ? '1' : '0'
        const juliaManual = settings.get<boolean>('juliaManual') === false ? '0' : '1'
        const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'ask_index.jl')
        const julia = child_process.spawn(
            juliaExecutable.command,
            [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, sources, model, prefix, available, juliaManual],
            { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true }
        )
        julia.stdin.on('error', () => {
            // The script has quit before it read the address
        })
        try {
            if (julia.pid !== undefined) {
                os.setPriority(julia.pid, os.constants.priority.PRIORITY_BELOW_NORMAL)
            }
        } catch {
            // The process has quit already, or the system does not allow it.
        }
        const kill = { dispose: () => julia.kill() }
        context.subscriptions.push(kill)
        // The status bar's item, from the first line the script writes until it quits
        const progress = windowProgress('Indexing the documentation for Ask Pollis')
        readline.createInterface({ input: julia.stdout }).on('line', (line) => {
            let message: { [key: string]: unknown }
            try {
                message = JSON.parse(line)
            } catch {
                return
            }
            if (message.status === 'installing') {
                progress.report('installing Poppler')
            } else if (typeof message.embed === 'number') {
                g_progress = { stage: 'embedding', done: 0, total: message.embed }
                progress.report(`embedding 0 of ${message.embed}`)
                // The address of the embedding server, or an empty line when it does not start
                startServer({ model, embeddings: true, context: EMBEDDING_CONTEXT }).then(
                    (server) => {
                        if (server.error) {
                            console.error(`[pollis] could not start the embedding model for Ask Pollis: ${server.error}`)
                        }
                        julia.stdin.end(`${server.url ?? ''}\n`)
                    },
                    () => julia.stdin.end('\n')
                )
            } else if (typeof message.embedding === 'number' && typeof message.total === 'number') {
                g_progress = { stage: 'embedding', done: message.embedding, total: message.total }
                progress.report(`embedding ${message.embedding} of ${message.total}`)
            } else if (typeof message.total === 'number') {
                g_progress = { stage: 'reading', done: typeof message.done === 'number' ? message.done : 0, total: message.total }
                progress.report(`${typeof message.done === 'number' ? message.done : 0} of ${message.total}`)
            } else if (message.error === 'noDuckDB') {
                noDuckDB = true
            } else if (typeof message.error === 'string') {
                console.error(`[pollis] could not index the documentation for Ask Pollis: ${message.error}`)
            }
        })
        await new Promise<void>((resolve) => {
            julia.on('error', (err) => {
                console.error('[pollis] could not index the documentation for Ask Pollis', err)
                resolve()
            })
            julia.on('close', () => resolve())
        })
        progress.finish()
        const index = context.subscriptions.indexOf(kill)
        if (index >= 0) {
            context.subscriptions.splice(index, 1)
        }
        compiled = await compileVignettes(context, juliaExecutable, vignettes)
    })().finally(() => {
        g_indexing = undefined
        g_progress = undefined
        if (compiled && !noDuckDB) {
            // The vignettes compiled after the index, read in the next
            g_indexAgain = true
        }
        if (noDuckDB && g_duckDBInstalled) {
            // Installed while the index was being made
            g_indexAgain = true
        } else if (noDuckDB) {
            g_waitingForDuckDB = true
            g_progress = { stage: 'installing', done: 0, total: 0 }
        }
        if (g_indexAgain) {
            g_indexAgain = false
            indexDocuments(context, juliaExecutable, env)
        }
    })
}

type VignetteRequest = { source: string; name: string; pdf: string }
type VignetteAnswer = { pdf?: string; error?: string }

/** Compiles the vignettes of `sources` for Ask Pollis, one at a time, with the status bar counting them; whether any was. */
async function compileVignettes(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    sources: AskSource[]
): Promise<boolean> {
    let compiled = false
    const progress = windowProgress('Compiling the package vignettes for Ask Pollis')
    for (const [done, source] of sources.entries()) {
        g_progress = { stage: 'compiling', done, total: sources.length }
        progress.report(`${done} of ${sources.length}`)
        const answer = await runVignette(context, juliaExecutable, { ...source.compile!, pdf: source.file })
        if (answer.pdf) {
            compiled = true
        } else {
            g_vignettesFailed.add(source.file)
            console.error(`[pollis] could not compile the vignette ${source.file}: ${answer.error}`)
        }
    }
    progress.finish()
    return compiled
}

/** Compiles a vignette, for Help > Documentation, and then has Ask Pollis read it. */
async function compileVignette(
    context: vscode.ExtensionContext,
    executableFeature: ExecutableFeature,
    request: VignetteRequest
): Promise<VignetteAnswer> {
    let juliaExecutable: JuliaExecutable
    try {
        juliaExecutable = await executableFeature.getExecutable()
    } catch (err) {
        return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
    }
    const answer = await runVignette(context, juliaExecutable, request)
    if (answer.pdf) {
        // A vignette or a toolbox document more for Ask Pollis
        reindexDocuments(context, executableFeature)
    }
    return answer
}

/** Compiles a vignette in a hidden process of low priority; a second request for the same PDF gets the first's answer. */
function runVignette(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    request: VignetteRequest
): Promise<VignetteAnswer> {
    const running = g_vignettes.get(request.pdf)
    if (running) {
        return running
    }
    const answer = (async (): Promise<VignetteAnswer> => {
        const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'compile_vignette.jl')
        const labels = path.join(vscode.env.appRoot, 'docs', 'ask_labels.tex')
        const julia = child_process.spawn(
            juliaExecutable.command,
            [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, request.source, request.name, request.pdf, labels],
            { env: { ...process.env, ...getPackageEnvironment() }, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }
        )
        try {
            if (julia.pid !== undefined) {
                os.setPriority(julia.pid, os.constants.priority.PRIORITY_BELOW_NORMAL)
            }
        } catch {
            // The process has quit already, or the system does not allow it.
        }
        const kill = { dispose: () => julia.kill() }
        context.subscriptions.push(kill)
        return new Promise<VignetteAnswer>((resolve) => {
            let result: VignetteAnswer = { error: 'failed' }
            readline.createInterface({ input: julia.stdout }).on('line', (line) => {
                try {
                    const message = JSON.parse(line)
                    if (typeof message.pdf === 'string' || typeof message.error === 'string') {
                        result = message
                    }
                } catch {
                    // Not one of the script's lines
                }
            })
            julia.on('error', (err) => console.error('[pollis] could not compile the vignette', err))
            julia.on('close', () => {
                const index = context.subscriptions.indexOf(kill)
                if (index >= 0) {
                    context.subscriptions.splice(index, 1)
                }
                resolve(result)
            })
        })
    })()
    g_vignettes.set(request.pdf, answer)
    answer.finally(() => g_vignettes.delete(request.pdf))
    return answer
}

/** The REPL has installed the packages of the built-in databases, or failed to: the index waiting for them is made now. */
export function pollisDBInstalled(context: vscode.ExtensionContext, juliaExecutable: JuliaExecutable, installed: boolean) {
    g_duckDBInstalled = installed
    if (!g_waitingForDuckDB) {
        return
    }
    g_waitingForDuckDB = false
    if (installed) {
        indexDocuments(context, juliaExecutable, getPackageEnvironment())
    } else if (g_progress?.stage === 'installing') {
        g_progress = undefined
    }
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisCompileDocuments', async (): Promise<DocumentsAnswer> => {
            let juliaExecutable: JuliaExecutable
            try {
                juliaExecutable = await executableFeature.getExecutable()
            } catch (err) {
                return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
            }
            // Compiled now, so not again when the REPL starts
            g_started = true
            return compileDocuments(context, juliaExecutable, getPackageEnvironment())
        }),
        vscode.commands.registerCommand('language-julia.pollisIndexDocuments', () => reindexDocuments(context, executableFeature)),
        vscode.commands.registerCommand('language-julia.pollisAskIndexProgress', (): IndexProgress | undefined => g_progress),
        vscode.commands.registerCommand('language-julia.pollisCompileVignette', (request: VignetteRequest) =>
            compileVignette(context, executableFeature, request)
        ),
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('pollis.ask.juliaManual')) {
                reindexDocuments(context, executableFeature)
            }
        })
    )
}
