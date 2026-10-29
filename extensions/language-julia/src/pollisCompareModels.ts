// POLLIS: the evaluation of Evaluate Models (Help > Ask Pollis > Evaluate Models...), with RAGTools.jl, in a hidden Julia
// process of its own (scripts/terminalserver/ask_compare.jl): the questions of a test set made from the documents, and
// the answers judged. The command `language-julia.pollisCompareModels`, with {task, keys, local}, runs the task of the
// JSON file `task`; `keys`, the keys of the cloud providers from Secret Storage, by the variable PromptingTools reads
// them from, are given to the script on stdin, never in its environment or a file, and the keys of the environment
// are left out of it, so that only those of Pollis count. The llama-server of each model file of `local` is started
// first, its address given to the script the same way, and stopped at the end, so that its memory is free again.
// It answers once the script has ended: {lines}, every line it wrote but its progress, or {error}. One task at a time:
// `language-julia.pollisCompareProgress` answers how far it has come, {status, done, total}, nothing when none runs,
// and `language-julia.pollisCompareStop` ends it, the lines written until then kept.

import * as child_process from 'child_process'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'
import { startServer, stopServer } from './pollisLlamaServer'

type CompareRequest = { task: string; keys: { [variable: string]: string }; local: string[] }
type CompareAnswer = { lines?: object[]; error?: string }
type CompareProgress = { status: 'starting' | 'installing' | 'running'; done: number; total: number }

/** The variables of the cloud keys, which come from Pollis' Secret Storage only. */
const KEY_VARIABLES = ['ANTHROPIC_API_KEY', 'GOOGLE_API_KEY', 'OPENAI_API_KEY']

let g_running: { process?: child_process.ChildProcess; progress: CompareProgress } | undefined

async function runTask(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, request: CompareRequest): Promise<CompareAnswer> {
    if (g_running) {
        return { error: 'running' }
    }
    const running: NonNullable<typeof g_running> = { progress: { status: 'starting', done: 0, total: 0 } }
    g_running = running
    try {
        let juliaExecutable
        try {
            juliaExecutable = await executableFeature.getExecutable()
        } catch (err) {
            return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
        }
        const servers: { [file: string]: string } = {}
        for (const file of request.local) {
            const server = await startServer({ model: file })
            if (server.url) {
                servers[file] = server.url
            } else {
                console.error(`[pollis] could not start ${file} for Evaluate Models: ${server.error}`)
            }
            if (g_running !== running) {
                return { lines: [] }
            }
        }
        const env: { [key: string]: string | undefined } = { ...process.env, ...getPackageEnvironment() }
        for (const variable of KEY_VARIABLES) {
            delete env[variable]
        }
        const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'ask_compare.jl')
        const julia = child_process.spawn(
            juliaExecutable.command,
            [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, request.task],
            { env, stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true }
        )
        running.process = julia
        julia.stdin.on('error', () => {
            // The script has quit before it read the keys
        })
        julia.stdin.end(`${JSON.stringify({ keys: request.keys, servers })}\n`)
        const kill = { dispose: () => julia.kill() }
        context.subscriptions.push(kill)
        const lines: object[] = []
        let error: string | undefined
        readline.createInterface({ input: julia.stdout }).on('line', (line) => {
            let message: { [key: string]: unknown }
            try {
                message = JSON.parse(line)
            } catch {
                return
            }
            if (message.status === 'installing') {
                running.progress = { status: 'installing', done: 0, total: 0 }
            } else if (typeof message.done === 'number' && typeof message.total === 'number') {
                running.progress = { status: 'running', done: message.done, total: message.total }
            } else if (typeof message.error === 'string' && message.failed === undefined) {
                error = message.error
            } else {
                lines.push(message)
            }
        })
        await new Promise<void>((resolve) => {
            julia.on('error', (err) => {
                console.error('[pollis] could not run the evaluation of Evaluate Models', err)
                error ??= 'failed'
                resolve()
            })
            julia.on('close', () => resolve())
        })
        const index = context.subscriptions.indexOf(kill)
        if (index >= 0) {
            context.subscriptions.splice(index, 1)
        }
        return error !== undefined && !lines.length ? { error } : { lines }
    } finally {
        for (const file of request.local) {
            await stopServer({ model: file })
        }
        if (g_running === running) {
            g_running = undefined
        }
    }
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisCompareModels', (request: CompareRequest) => runTask(context, executableFeature, request)),
        vscode.commands.registerCommand('language-julia.pollisCompareProgress', (): CompareProgress | undefined => g_running?.progress),
        vscode.commands.registerCommand('language-julia.pollisCompareStop', () => {
            const running = g_running
            g_running = undefined
            running?.process?.kill()
        })
    )
}
