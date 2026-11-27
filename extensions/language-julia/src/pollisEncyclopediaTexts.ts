// POLLIS: the texts of Britannica Through the Editions and Larousse Through the Editions, in a hidden Julia process of
// their own (scripts/terminalserver/encyclopedia_texts.jl), which finds the texts of PollisBritannica.jl or
// PollisLarousse.jl and downloads them the first time they are asked for. The commands
// `language-julia.pollisBritannicaTexts` and `language-julia.pollisLarousseTexts`, with {task: "locate"}, answer {path},
// the file of the texts, "" when they are not on this computer; with {task: "download"}, they download them, unless they
// are on this computer, and answer {path}; either answers {error} when it cannot.

import * as child_process from 'child_process'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'

type Encyclopedia = 'britannica' | 'larousse'
type TextsRequest = { task: 'locate' | 'download' }
type TextsAnswer = { path?: string; error?: string }

/** The downloads running, by encyclopedia, which a second request waits for rather than start another. */
const g_downloads = new Map<Encyclopedia, Promise<TextsAnswer>>()

/** Runs the script with `task` for `encyclopedia`, and answers the line it answered. */
async function runTask(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, task: TextsRequest['task'], encyclopedia: Encyclopedia): Promise<TextsAnswer> {
    let juliaExecutable
    try {
        juliaExecutable = await executableFeature.getExecutable()
    } catch (err) {
        return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
    }
    const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'encyclopedia_texts.jl')
    const julia = child_process.spawn(
        juliaExecutable.command,
        [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, task, encyclopedia],
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
            console.error(`[pollis] could not find the texts of ${encyclopedia}`, err)
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

function texts(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, encyclopedia: Encyclopedia, request: TextsRequest): Promise<TextsAnswer> {
    if (request?.task !== 'download') {
        return runTask(context, executableFeature, 'locate', encyclopedia)
    }
    let download = g_downloads.get(encyclopedia)
    if (!download) {
        download = runTask(context, executableFeature, 'download', encyclopedia).finally(() => g_downloads.delete(encyclopedia))
        g_downloads.set(encyclopedia, download)
    }
    return download
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisBritannicaTexts', (request: TextsRequest) => texts(context, executableFeature, 'britannica', request)),
        vscode.commands.registerCommand('language-julia.pollisLarousseTexts', (request: TextsRequest) => texts(context, executableFeature, 'larousse', request))
    )
}
