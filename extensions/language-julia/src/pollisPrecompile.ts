// POLLIS: once per session, when the REPL starts, compiles in a hidden process of low priority the packages that
// Julia would otherwise compile the first time they are loaded: after an update of Julia, or of packages outside
// Pollis (scripts/terminalserver/precompile_background.jl). The process gets the project and the flags of the REPL,
// so that it makes the caches the REPL uses; the context key `julia.precompiling` is true while it compiles, for the
// Welcome page's Status. When nothing is stale, it quits after a few seconds, unseen.

import * as child_process from 'child_process'
import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { JuliaExecutable } from './executables'
import { setContext } from './utils'

let g_started = false

export function precompileInBackground(
    context: vscode.ExtensionContext,
    juliaExecutable: JuliaExecutable,
    project: string,
    args: string[],
    env: { [key: string]: string }
) {
    if (g_started) {
        return
    }
    g_started = true
    const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'precompile_background.jl')
    const julia = child_process.spawn(
        juliaExecutable.command,
        [...juliaExecutable.args, '--startup-file=no', '--history-file=no', `--project=${project}`, ...args, script],
        { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }
    )
    try {
        // Inherited by the processes that Pkg starts to compile each package.
        if (julia.pid !== undefined) {
            os.setPriority(julia.pid, os.constants.priority.PRIORITY_BELOW_NORMAL)
        }
    } catch {
        // The process has quit already, or the system does not allow it.
    }
    julia.stdout.on('data', (data: Buffer) => {
        if (data.toString().includes('precompiling')) {
            setContext('julia.precompiling', true)
        }
    })
    julia.on('error', (err) => console.error('[pollis] could not precompile in the background', err))
    julia.on('exit', () => setContext('julia.precompiling', false))
    context.subscriptions.push({ dispose: () => julia.kill() })
}
