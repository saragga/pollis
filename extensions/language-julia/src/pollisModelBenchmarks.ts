// POLLIS: the runs of Model Benchmarks (Compose > Knowledge for Models > Model Benchmarks...), in a hidden Julia process
// of their own (scripts/terminalserver/model_benchmarks.jl), which a notebook loads too (Pollis.model_benchmarks()).
// The command `language-julia.pollisModelBenchmarks`, with {job, models?}, runs the task `job` of the script: "download"
// a benchmark, or "start" a run, which draws its sample; with `models`, each is then run on that run, one after the
// other and alone in memory: the memory free measured, its llama-server started, the script's task "model" run with the
// server's address and that memory on stdin, and the server stopped. It answers once all have ended: {lines}, the
// lines the script answered for each task ({info}, {run}, {figures}), and {errors}, what went wrong for each model that
// gave nothing, or {error} when the task could not be done. One run at a time: `language-julia.pollisModelBenchmarksProgress`
// answers how far it has come, {status, done, total, model, models, tokens}, `model` the number of the model running
// from 1, and `language-julia.pollisModelBenchmarksStop` ends it, the answers written until then kept in the run.

import * as child_process from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaExecutable, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'
import { startServer, stopServer } from './pollisLlamaServer'
import { availableMemory } from './pollisModels'

type BenchmarkModel = { value: string; label: string; size?: string }
type BenchmarkRequest = { job: { task: 'download' | 'start'; settings?: { thinking?: boolean } } & { [key: string]: unknown }; models?: BenchmarkModel[] }
type BenchmarkAnswer = { lines?: object[]; errors?: { [model: string]: string }; error?: string }
type BenchmarkProgress = { status: 'starting' | 'installing' | 'loading' | 'running'; done: number; total: number; model: number; models: number; tokens?: [number, number] }

let g_running: { process?: child_process.ChildProcess; stopped: boolean; progress: BenchmarkProgress } | undefined

/** Runs the script's task `job`, with `input` on stdin; answers the lines it answered and its error, if any. */
async function runScript(context: vscode.ExtensionContext, juliaExecutable: JuliaExecutable, running: NonNullable<typeof g_running>, job: object, input?: object): Promise<{ lines: object[]; error?: string }> {
    const task = path.join(os.tmpdir(), `pollis-benchmark-${process.pid}-${Date.now()}.json`)
    await fs.promises.writeFile(task, JSON.stringify(job))
    const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'model_benchmarks.jl')
    const julia = child_process.spawn(
        juliaExecutable.command,
        [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, task],
        { env: { ...process.env, ...getPackageEnvironment() }, stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true }
    )
    running.process = julia
    julia.stdin.on('error', () => {
        // The script has quit before it read its input
    })
    julia.stdin.end(input ? `${JSON.stringify(input)}\n` : '')
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
            running.progress = { ...running.progress, status: 'installing' }
        } else if (typeof message.done === 'number' && typeof message.total === 'number') {
            const tokens = Array.isArray(message.tokens) && message.tokens.length === 2 && message.tokens.every((count) => typeof count === 'number') ? message.tokens as [number, number] : undefined
            running.progress = { ...running.progress, status: 'running', done: message.done, total: message.total, tokens }
        } else if (typeof message.error === 'string') {
            error = message.error
        } else {
            lines.push(message)
        }
    })
    await new Promise<void>((resolve) => {
        julia.on('error', (err) => {
            console.error('[pollis] could not run Model Benchmarks', err)
            error ??= 'failed'
            resolve()
        })
        julia.on('close', () => resolve())
    })
    const index = context.subscriptions.indexOf(kill)
    if (index >= 0) {
        context.subscriptions.splice(index, 1)
    }
    await fs.promises.rm(task, { force: true })
    return { lines, error }
}

async function runTask(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, request: BenchmarkRequest): Promise<BenchmarkAnswer> {
    if (g_running) {
        return { error: 'running' }
    }
    const models = request.models ?? []
    const running: NonNullable<typeof g_running> = { stopped: false, progress: { status: 'starting', done: 0, total: 0, model: 0, models: models.length } }
    g_running = running
    try {
        let juliaExecutable
        try {
            juliaExecutable = await executableFeature.getExecutable()
        } catch (err) {
            return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
        }
        const first = await runScript(context, juliaExecutable, running, request.job)
        if (first.error !== undefined || running.stopped) {
            return first.error !== undefined ? { error: first.error, lines: first.lines } : { lines: first.lines }
        }
        const lines = [...first.lines]
        const run = (first.lines.find((line) => 'run' in line) as { run?: string } | undefined)?.run
        const errors: { [model: string]: string } = {}
        const thinking = !!request.job.settings?.thinking
        for (const [index, model] of models.entries()) {
            if (!run || running.stopped) {
                break
            }
            running.progress = { status: 'loading', done: 0, total: 0, model: index + 1, models: models.length }
            const freeBefore = await availableMemory().catch(() => undefined)
            const server = await startServer({ model: model.value, thinking })
            if (!server.url) {
                errors[model.value] = server.error ?? 'did not start'
                continue
            }
            try {
                if (running.stopped) {
                    break
                }
                const answered = await runScript(context, juliaExecutable, running, { task: 'model', run, model }, { url: server.url, freeBefore })
                lines.push(...answered.lines)
                if (answered.error !== undefined && !running.stopped) {
                    errors[model.value] = answered.error
                }
            } finally {
                await stopServer({ model: model.value, thinking })
            }
        }
        return { lines, errors }
    } finally {
        if (g_running === running) {
            g_running = undefined
        }
    }
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisModelBenchmarks', (request: BenchmarkRequest) => runTask(context, executableFeature, request)),
        vscode.commands.registerCommand('language-julia.pollisModelBenchmarksProgress', (): BenchmarkProgress | undefined => g_running?.progress),
        vscode.commands.registerCommand('language-julia.pollisModelBenchmarksStop', () => {
            const running = g_running
            if (running) {
                running.stopped = true
                running.process?.kill()
            }
        })
    )
}
