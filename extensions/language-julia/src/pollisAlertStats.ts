// POLLIS: the statistics of Pollis' alerts on statistical conditions, computed by OnlineStats.jl in a hidden Julia
// process (scripts/terminalserver/alert_stats.jl) with its own environment, ~/.pollis/alerts/julia/vX.Y. The alerts
// of the workbench reach it through the command `language-julia.pollisAlertStatistics`, with a request such as
// {op: 'update', key, spec, value, history?}, and get its answer. The process starts with the first request and quits
// after ten minutes without one; its trackers are then forgotten, and the next update asks for history again.

import * as child_process from 'child_process'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'

const IDLE_MILLISECONDS = 10 * 60_000

type Answer = { [key: string]: unknown }

interface Process {
    readonly julia: child_process.ChildProcess
    /** Resolves with the first status the script writes: 'installing' or 'ready'; 'failed' if it quits before. */
    readonly started: Promise<'installing' | 'ready' | 'failed'>
    status: 'installing' | 'ready' | 'failed'
    readonly pending: Map<number, (answer: Answer) => void>
}

let g_process: Process | undefined
let g_nextId = 1
let g_idle: NodeJS.Timeout | undefined

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisAlertStatistics', (request: Answer) =>
            answer(context, executableFeature, request)
        ),
        { dispose: () => stop() }
    )
}

/** The script's answer to `request`; {error: 'noJulia'} without Julia, 'installing' while it installs OnlineStats. */
async function answer(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, request: Answer): Promise<Answer> {
    if (!g_process || g_process.status === 'failed') {
        try {
            g_process = await start(context, executableFeature)
        } catch (err) {
            return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
        }
    }
    const running = g_process
    const status = await running.started
    if (running.status !== 'ready') {
        return { error: status === 'failed' ? 'failed' : 'installing' }
    }
    if (g_idle) {
        clearTimeout(g_idle)
    }
    g_idle = setTimeout(() => stop(), IDLE_MILLISECONDS)
    const id = g_nextId++
    return new Promise<Answer>((resolve) => {
        running.pending.set(id, resolve)
        running.julia.stdin.write(JSON.stringify({ ...request, id }) + '\n')
    })
}

async function start(context: vscode.ExtensionContext, executableFeature: ExecutableFeature): Promise<Process> {
    const juliaExecutable = await executableFeature.getExecutable()
    const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'alert_stats.jl')
    const julia = child_process.spawn(
        juliaExecutable.command,
        [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script],
        { env: { ...process.env, ...getPackageEnvironment() }, stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true }
    )
    const pending = new Map<number, (answer: Answer) => void>()
    let started: (status: 'installing' | 'ready' | 'failed') => void
    const result: Process = {
        julia,
        pending,
        status: 'failed',
        started: new Promise((resolve) => (started = resolve)),
    }
    readline.createInterface({ input: julia.stdout }).on('line', (line) => {
        let message: Answer
        try {
            message = JSON.parse(line)
        } catch {
            return
        }
        if (message.status === 'installing' || message.status === 'ready') {
            result.status = message.status
            started(message.status)
        } else if (typeof message.id === 'number') {
            pending.get(message.id)?.(message)
            pending.delete(message.id)
        }
    })
    const failed = () => {
        result.status = 'failed'
        started('failed')
        for (const resolve of pending.values()) {
            resolve({ error: 'failed' })
        }
        pending.clear()
        if (g_process === result) {
            g_process = undefined
        }
    }
    julia.on('error', (err) => {
        console.error('[pollis] the statistics of the alerts could not start', err)
        failed()
    })
    julia.on('exit', failed)
    return result
}

function stop() {
    if (g_idle) {
        clearTimeout(g_idle)
        g_idle = undefined
    }
    g_process?.julia.kill()
    g_process = undefined
}
