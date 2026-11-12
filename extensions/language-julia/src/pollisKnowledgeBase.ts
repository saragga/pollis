// POLLIS: the texts of the Knowledge Base page (Compose > Knowledge for AI Models > Knowledge Base), in a hidden Julia
// process of their own (scripts/terminalserver/knowledge_base.jl), which runs PollisKnowledge.jl, the package a notebook
// calls too. The command `language-julia.pollisKnowledgeBase`, with {task: "texts"}, answers {texts}, the catalogue with
// what is on this computer; with {task: "download", id}, it downloads that text, unless it is on this computer, and
// answers {documents}; either answers {error} when it cannot. `language-julia.pollisKnowledgeBaseDownloading` answers
// the ids of the texts downloading.

import * as child_process from 'child_process'
import * as path from 'path'
import * as readline from 'readline'
import * as vscode from 'vscode'
import { ExecutableFeature, JuliaNotFoundError } from './executables'
import { getPackageEnvironment } from './interactive/repl'

type KnowledgeRequest = { task: 'texts' } | { task: 'download'; id: string }
type KnowledgeAnswer = { texts?: object[]; documents?: object[]; error?: string }

/** The texts downloading, by id. */
const g_downloading = new Set<string>()

/** Runs the script with `request`, and answers the line it answered. */
async function runTask(context: vscode.ExtensionContext, executableFeature: ExecutableFeature, request: KnowledgeRequest): Promise<KnowledgeAnswer> {
    if (request.task === 'download' && !/^[a-z0-9_]+$/.test(request.id)) {
        return { error: 'no text' }
    }
    let juliaExecutable
    try {
        juliaExecutable = await executableFeature.getExecutable()
    } catch (err) {
        return { error: err instanceof JuliaNotFoundError ? 'noJulia' : 'failed' }
    }
    const script = path.join(context.extensionPath, 'scripts', 'terminalserver', 'knowledge_base.jl')
    if (request.task === 'download') {
        g_downloading.add(request.id)
    }
    try {
        const julia = child_process.spawn(
            juliaExecutable.command,
            [...juliaExecutable.args, '--startup-file=no', '--history-file=no', script, JSON.stringify(request)],
            { env: { ...process.env, ...getPackageEnvironment() }, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }
        )
        const kill = { dispose: () => julia.kill() }
        context.subscriptions.push(kill)
        let answer: KnowledgeAnswer | undefined
        readline.createInterface({ input: julia.stdout }).on('line', (line) => {
            try {
                answer = JSON.parse(line)
            } catch {
                // Not the answer: something a package printed
            }
        })
        await new Promise<void>((resolve) => {
            julia.on('error', (err) => {
                console.error('[pollis] could not run the Knowledge Base page', err)
                resolve()
            })
            julia.on('close', () => resolve())
        })
        const index = context.subscriptions.indexOf(kill)
        if (index >= 0) {
            context.subscriptions.splice(index, 1)
        }
        return answer ?? { error: 'failed' }
    } finally {
        if (request.task === 'download') {
            g_downloading.delete(request.id)
        }
    }
}

export function activate(context: vscode.ExtensionContext, executableFeature: ExecutableFeature) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisKnowledgeBase', (request: KnowledgeRequest) => runTask(context, executableFeature, request)),
        vscode.commands.registerCommand('language-julia.pollisKnowledgeBaseDownloading', (): string[] => [...g_downloading])
    )
}
