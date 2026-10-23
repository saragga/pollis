// POLLIS: hidden Julia processes that compute for the workbench, each a script in scripts/terminalserver with its own
// environment under ~/.pollis, made the first time; the user's environments are never touched.
// - The statistics of Pollis' alerts on statistical conditions, by OnlineStats.jl (alert_stats.jl,
//   ~/.pollis/alerts/julia/vX.Y), through the command `language-julia.pollisAlertStatistics`, with a request such as
//   {op: 'update', key, spec, value, history?}. Its trackers are forgotten when it quits, and the next update asks for
//   history again.
// - The results of the event studies, by PollisEventStudies.jl (event_studies.jl, ~/.pollis/event-studies/julia/vX.Y),
//   through the command `language-julia.pollisEventStudies`, with a request such as {op: 'analyse', folder}.
// The workbench gets the script's answer. A process starts with the first request and quits after ten minutes without one.

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

/** A script run in a hidden process, a request at a time over its stdin, each answered on its stdout. */
class HiddenJulia {
    private process: Process | undefined
    private nextId = 1
    private idle: NodeJS.Timeout | undefined

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly executableFeature: ExecutableFeature,
        private readonly script: string,
        private readonly description: string
    ) {}

    /** The script's answer to `request`; {error: 'noJulia'} without Julia, 'installing' while it installs its packages. */
    async answer(request: Answer): Promise<Answer> {
        if (!this.process || this.process.status === 'failed') {
            try {
                this.process = await this.start()
            } catch (err) {
                return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
            }
        }
        const running = this.process
        const status = await running.started
        if (running.status !== 'ready') {
            return { error: status === 'failed' ? 'failed' : 'installing' }
        }
        if (this.idle) {
            clearTimeout(this.idle)
        }
        this.idle = setTimeout(() => this.stop(), IDLE_MILLISECONDS)
        const id = this.nextId++
        return new Promise<Answer>((resolve) => {
            running.pending.set(id, resolve)
            running.julia.stdin.write(JSON.stringify({ ...request, id }) + '\n')
        })
    }

    private async start(): Promise<Process> {
        const juliaExecutable = await this.executableFeature.getExecutable()
        const script = path.join(this.context.extensionPath, 'scripts', 'terminalserver', this.script)
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
            if (this.process === result) {
                this.process = undefined
            }
        }
        julia.on('error', (err) => {
            console.error(`[pollis] ${this.description} could not start`, err)
            failed()
        })
        julia.on('exit', failed)
        return result
    }

    stop() {
        if (this.idle) {
            clearTimeout(this.idle)
            this.idle = undefined
        }
        this.process?.julia.kill()
        this.process = undefined
    }
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    const alertStatistics = new HiddenJulia(context, executableFeature, 'alert_stats.jl', 'the statistics of the alerts')
    const eventStudies = new HiddenJulia(context, executableFeature, 'event_studies.jl', 'the event studies')
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisAlertStatistics', (request: Answer) => alertStatistics.answer(request)),
        vscode.commands.registerCommand('language-julia.pollisEventStudies', (request: Answer) => eventStudies.answer(request)),
        { dispose: () => { alertStatistics.stop(); eventStudies.stop() } }
    )
}
