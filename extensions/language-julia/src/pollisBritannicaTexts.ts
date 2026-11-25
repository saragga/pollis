// POLLIS: the texts of Britannica Through the Editions, in a hidden Julia process of their own
// (scripts/terminalserver/britannica_texts.jl), which finds the texts of PollisBritannica.jl and downloads them the
// first time they are asked for. The command `language-julia.pollisBritannicaTexts`, with {task: "locate"}, answers
// {path}, the file of the texts, "" when they are not on this computer; with {task: "download"}, it downloads them,
// unless they are on this computer, and answers {path}; either answers {error} when it cannot.

import * as child_process from 'child_process'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'

type TextsRequest = { task: 'locate' | 'download' }
type TextsAnswer = { path?: string; error?: string }

/** The download running, which a second request waits for rather than start another. */
let g_download: Promise<TextsAnswer> | undefined

/** Runs the script with `task`, and answers the line it answered. */
async function runTask(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, task: TextsRequest['task']): Promise<TextsAnswer> {
    let juliaExecutable
    try {
        juliaExecutable = await executableFeature.getExecutable()
    } catch (err) {
        return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
    }
    const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'britannica_texts.jl')
    const julia = child_process.spawn(
        juliaExecutable.command,
        [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, task],
        { env: { ...process.env, ...getPackageEnvironment() }, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }
    )
    const kill = { dispose: () => julia.kill() }
    context.subscriptions.push(kill)
    let answer: TextsAnswer | undefined
    readline.createInterface({ input: julia.stdout }).on('line', (line) => {
        try {
            answer = JSON.parse(line)
        } catch {
            // Not the answer: something a package printed
        }
    })
    await new Promise<void>((resolve) => {
        julia.on('error', (err) => {
            console.error('[pollis] could not find the texts of the Britannica', err)
            resolve()
        })
        julia.on('close', () => resolve())
    })
    const index = context.subscriptions.indexOf(kill)
    if (index >= 0) {
        context.subscriptions.splice(index, 1)
    }
    return answer ?? { error: 'failed' }
}

function texts(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, request: TextsRequest): Promise<TextsAnswer> {
    if (request?.task !== 'download') {
        return runTask(context, executableFeature, 'locate')
    }
    g_download ??= runTask(context, executableFeature, 'download').finally(() => g_download = undefined)
    return g_download
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisBritannicaTexts', (request: TextsRequest) => texts(context, executableFeature, request))
    )
}
