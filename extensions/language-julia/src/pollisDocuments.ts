// POLLIS: once per session, when the REPL starts, compiles in a hidden process of low priority the documents of
// Help > Documentation from their LaTeX sources, the app's docs/ folder, into ~/.pollis/documents, where Help opens
// them (scripts/terminalserver/compile_documents.jl). While it compiles, the status bar says so, with how many
// documents are ready; when nothing has changed since the last compile, it quits after a second or two, unseen.

import * as child_process from 'child_process'
import * as os from 'os'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { JuliaExecutable } from './executables'

let g_started = false

export function compileDocumentsInBackground(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    env: { [key: string]: string }
) {
    if (g_started) {
        return
    }
    g_started = true
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
    let report: ((message: string) => void) | undefined
    let finish: (() => void) | undefined
    // The status bar's item, from the first line the script writes until it quits
    const show = () => {
        if (!report) {
            report = () => {}
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Compiling the documentation' }, (progress) => {
                report = (message) => progress.report({ message })
                return new Promise<void>((resolve) => (finish = resolve))
            })
        }
    }
    readline.createInterface({ input: julia.stdout }).on('line', (line) => {
        let message: { [key: string]: unknown }
        try {
            message = JSON.parse(line)
        } catch {
            return
        }
        show()
        if (message.status === 'installing') {
            report?.('installing PollisTeX')
        } else if (typeof message.total === 'number') {
            report?.(`${typeof message.done === 'number' ? message.done : 0} of ${message.total}`)
        } else if (typeof message.failed === 'string') {
            console.error(`[pollis] could not compile ${message.failed}; its log is in ~/.pollis/documents`)
        }
    })
    julia.on('error', (err) => console.error('[pollis] could not compile the documentation', err))
    julia.on('exit', () => finish?.())
    context.subscriptions.push({ dispose: () => julia.kill() })
}
