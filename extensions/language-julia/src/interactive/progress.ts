import * as vscode from 'vscode'
import * as rpc from 'vscode-jsonrpc/node'

// POLLIS: the REPL's progress bars, moved here from repl.ts so the notebook kernel can show them too.

export interface Progress {
    id: { value: number }
    name: string
    fraction: number
    done: boolean
}
export const notifyTypeProgress = new rpc.NotificationType<Progress>('repl/updateProgress')

interface ProgressBar {
    progress: vscode.Progress<{ message?: string; increment?: number }>
    last_fraction: number
    started: Date
    resolve: () => void
}

/**
 * The progress bars of one Julia process, shown in the status bar from the `repl/updateProgress`
 * notifications that ProgressLogging.jl's `@withprogress` produces. Cancelling a bar calls `onCancel`.
 */
export class ProgressBars {
    private readonly bars = new Map<number, ProgressBar>()

    constructor(
        private readonly title: string,
        private readonly onCancel: () => void
    ) {}

    public update(progress: Progress) {
        const p = this.bars.get(progress.id.value)
        if (p) {
            const increment = progress.done ? 100 : (progress.fraction - p.last_fraction) * 100

            p.progress.report({
                increment: increment,
                message: progressMessage(progress, p.started),
            })
            p.last_fraction = progress.fraction

            if (progress.done) {
                p.resolve()
                this.bars.delete(progress.id.value)
            }
        } else if (!progress.done) {
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Window,
                    title: this.title,
                    cancellable: true,
                },
                (prog, token) => {
                    return new Promise<void>((resolve) => {
                        this.bars.set(progress.id.value, {
                            progress: prog,
                            last_fraction: progress.fraction,
                            started: new Date(),
                            resolve: resolve,
                        })
                        token.onCancellationRequested(() => {
                            this.onCancel()
                        })
                        prog.report({
                            message: progressMessage(progress),
                        })
                    })
                }
            )
        }
    }

    public clear() {
        for (const p of this.bars.values()) {
            p.resolve()
        }
        this.bars.clear()
    }
}

function progressMessage(prog: Progress, started: Date | null = null) {
    let message = prog.name
    const parenthezise = message.trim().length > 0
    if (isFinite(prog.fraction) && 0 <= prog.fraction && prog.fraction <= 1) {
        if (parenthezise) {
            message += ' ('
        }
        message += `${(prog.fraction * 100).toFixed(1)}%`
        if (started !== null) {
            const elapsed = (new Date().valueOf() - started.valueOf()) / 1000
            const remaining = (1 / prog.fraction - 1) * elapsed
            if (isFinite(remaining)) {
                message += ` - ${formattedTimePeriod(remaining)} remaining`
            }
        }
        if (parenthezise) {
            message += ')'
        }
    }
    return message
}

function formattedTimePeriod(t: number) {
    const seconds = Math.floor(t % 60)
    const minutes = Math.floor((t / 60) % 60)
    const hours = Math.floor(t / 60 / 60)
    let out = ''
    if (hours > 0) {
        out += `${hours}h, `
    }
    if (minutes > 0) {
        out += `${minutes}min, `
    }
    out += `${seconds}s`
    return out
}
