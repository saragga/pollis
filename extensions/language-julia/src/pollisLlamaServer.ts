// POLLIS: llama.cpp's llama-server, which Pollis ships (build/pollis/llamacpp.ts), for local chat and embedding models
// in GGUF files. The command `language-julia.pollisLlamaServer`, with {model, embeddings?, thinking?, context?}, where
// model is a path or an `hf:` file downloaded first if needed (pollisModels.ts), starts a server for that model file on
// a free port of this computer, or answers with the one already running, once it is
// ready: {url, model, media}, the address of its OpenAI-compatible API, the model's name there and what it reads besides
// text, or {error} with the last lines it printed. A projector (mmproj) in the model's folder is loaded with it, so that
// the model reads the images or audio it was made for (pollisModels.ts, projectorOf). Julia asks the same
// with the request `pollis/llamaServer` (Pollis.llama_server in Pollis.jl), from the REPL or a notebook. There is one server
// per model file and way of running it; each stops when Pollis quits, or with `language-julia.pollisStopLlamaServers`;
// `language-julia.pollisStopLlamaServer`, with the request that started it, stops one, and answers once it has ended,
// its memory free: Evaluate Models runs each local model alone.
// What the servers print goes to the llama.cpp Output channel. Thinking is off unless asked for, whatever the model:
// on the short tasks of the panels it only costs time, and can use up the reply before any answer; a model that does
// not think ignores it.

import * as child_process from 'child_process'
import * as fs from 'fs'
import * as net from 'net'
import * as path from 'path'
import * as vscode from 'vscode'
import { MessageConnection, RequestType } from 'vscode-jsonrpc/node'
import { ModelMedia, projectorOf, resolveModel } from './pollisModels'

type ServerRequest = { model: string; embeddings?: boolean; thinking?: boolean; context?: number }
type ServerAnswer = { url?: string; model?: string; media?: ModelMedia[]; error?: string }
type Server = { process?: child_process.ChildProcess; readonly ready: Promise<ServerAnswer> }

/**
 * The context of a chat model, in tokens, when the request gives none: its own can be so long that its cache fills the
 * memory. An embedding model has its own, which is short (0 asks llama-server for it).
 */
const DEFAULT_CONTEXT = 8192

/** How long a model may take to load before the server is given up. */
const READY_TIMEOUT = 5 * 60 * 1000

/** The lines a server printed last, for the error when it does not start. */
const TAIL_LINES = 5

const requestTypeLlamaServer = new RequestType<ServerRequest, ServerAnswer, void>('pollis/llamaServer')

const SERVER_NAME = process.platform === 'win32' ? 'llama-server.exe' : 'llama-server'

const g_servers = new Map<string, Server>()
let g_output: vscode.OutputChannel | undefined

/** Packaged, llama-server is in the app's llama.cpp/; in a development build, `npm run gulp fetch-llama-cpp` puts it in .build/. */
function serverPath(): string | undefined {
    return [path.join(vscode.env.appRoot, 'llama.cpp', SERVER_NAME), path.join(vscode.env.appRoot, '.build', 'llama.cpp', SERVER_NAME)].find(
        (candidate) => fs.existsSync(candidate)
    )
}

/** A port of this computer that nothing listens on. */
function freePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer()
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            const address = server.address()
            server.close(() => (typeof address === 'object' && address ? resolve(address.port) : reject(new Error('no port'))))
        })
    })
}

/** Resolves when the server answers /health with 200, which it does once the model is loaded, or false if it stops first. */
async function whenHealthy(url: string, running: () => boolean): Promise<boolean> {
    const deadline = Date.now() + READY_TIMEOUT
    while (Date.now() < deadline && running()) {
        try {
            const response = await fetch(`${url}/health`)
            if (response.ok) {
                return true
            }
        } catch {
            // Not listening yet
        }
        await new Promise((resolve) => setTimeout(resolve, 250))
    }
    return false
}

/** The server of a model file and way of running it, in g_servers. */
function serverKey(request: ServerRequest): string {
    return JSON.stringify([request.model.trim(), !!request.embeddings, !!request.thinking, request.context])
}

export function startServer(request: ServerRequest): Promise<ServerAnswer> {
    const executable = serverPath()
    if (!executable) {
        return Promise.resolve({ error: 'llama-server is not part of this build of Pollis.' })
    }
    const key = serverKey(request)
    const running = g_servers.get(key)
    if (running) {
        return running.ready
    }
    g_output ??= vscode.window.createOutputChannel('llama.cpp')
    const output = g_output
    const name = path.basename(request.model.trim(), '.gguf')
    const ready = (async (): Promise<ServerAnswer> => {
        let model: string
        try {
            model = await resolveModel(request.model)
        } catch (err) {
            g_servers.delete(key)
            return { error: err instanceof Error ? err.message : String(err) }
        }
        const projector = await projectorOf(model)
        const port = await freePort()
        const url = `http://127.0.0.1:${port}`
        const args = [
            '--model', model,
            ...(projector ? ['--mmproj', projector.file] : []),
            '--host', '127.0.0.1',
            '--port', String(port),
            '--alias', name,
            '--ctx-size', String(request.context ?? (request.embeddings ? 0 : DEFAULT_CONTEXT)),
            // An embedding model reads each text in one batch: with a context, a text as long as it fits
            ...(request.embeddings && request.context ? ['--batch-size', String(request.context), '--ubatch-size', String(request.context)] : []),
            ...(request.embeddings ? ['--embeddings'] : ['--reasoning', request.thinking ? 'on' : 'off']),
        ]
        output.appendLine(`[${name}] ${executable} ${args.join(' ')}`)
        const server = child_process.spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
        const entry = g_servers.get(key)
        if (entry?.ready !== ready) {
            // Stopped while the port was found
            server.kill()
            return { error: `llama-server was stopped before ${name} was ready.` }
        }
        entry.process = server
        let running = true
        const tail: string[] = []
        const print = (chunk: Buffer) => {
            for (const line of chunk.toString().split(/\r?\n/)) {
                if (line) {
                    output.appendLine(`[${name}] ${line}`)
                    tail.push(line)
                    if (tail.length > TAIL_LINES) {
                        tail.shift()
                    }
                }
            }
        }
        server.stdout?.on('data', print)
        server.stderr?.on('data', print)
        const stopped = () => {
            running = false
            if (g_servers.get(key)?.process === server) {
                g_servers.delete(key)
            }
        }
        server.on('error', (err) => {
            output.appendLine(`[${name}] ${err.message}`)
            tail.push(err.message)
            stopped()
        })
        server.on('exit', (code) => {
            output.appendLine(`[${name}] stopped${code === null ? '' : ` (exit code ${code})`}`)
            stopped()
        })
        if (await whenHealthy(url, () => running)) {
            output.appendLine(`[${name}] ready at ${url}/v1`)
            return { url: `${url}/v1`, model: name, media: projector?.media ?? [] }
        }
        server.kill()
        return { error: `llama-server did not start ${name}: ${tail.join(' ')}` }
    })()
    // Until the process exists, a second request waits on the same start
    g_servers.set(key, { ready })
    return ready
}

/** Lets the Julia of a REPL or notebook connected through `connection` ask for a server (Pollis.llama_server). */
export function answerLlamaServerRequests(connection: MessageConnection) {
    connection.onRequest(requestTypeLlamaServer, (request) => startServer(request))
}

/** Stops the server that `request` started, if it runs, and resolves once its process has ended. */
export function stopServer(request: ServerRequest): Promise<void> {
    const key = serverKey(request)
    const server = g_servers.get(key)
    g_servers.delete(key)
    const child = server?.process
    if (!child || child.exitCode !== null || child.signalCode !== null) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        child.once('exit', () => resolve())
        child.kill()
    })
}

function stopServers() {
    for (const server of g_servers.values()) {
        server.process?.kill()
    }
    g_servers.clear()
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisLlamaServer', (request: ServerRequest) => startServer(request)),
        vscode.commands.registerCommand('language-julia.pollisStopLlamaServer', (request: ServerRequest) => stopServer(request)),
        vscode.commands.registerCommand('language-julia.pollisStopLlamaServers', () => stopServers()),
        { dispose: () => stopServers() },
        { dispose: () => g_output?.dispose() }
    )
}
