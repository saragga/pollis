// POLLIS: the Pollis REPL terminal, pollis> in a terminal of its own beside the Julia REPL, on the same Julia: its
// queries run there as those of the pollis> mode do, on the Shared Session, and `name := SELECT ...` binds the Julia
// variable `name`. The terminal edits lines itself, with Node's readline, and sends each whole query to the Julia REPL
// (PollisReplConnection); the Pollis REPL item of the status bar is filled while it is open.

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as readline from 'readline'
import { PassThrough, Writable } from 'stream'
import * as vscode from 'vscode'
import { IPollisAnswer, PollisReplConnection, pollisReplFile, readServed } from '../pollisReplConnection'
import { POLLIS_WINDOW } from '../pollisWindow'

/** Bold green, as julia> and duckdb> are. */
const green = (text: string) => `\x1b[1;32m${text}\x1b[0m`
const red = (text: string) => `\x1b[31m${text}\x1b[0m`
const dim = (text: string) => `\x1b[2m${text}\x1b[0m`
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`
const PROMPT = `${green('pollis>')} `
const CONTINUATION = `${green('    ...>')} `
const HISTORY = path.join(os.homedir(), '.pollis', 'duckdb', 'pollis_history')
const HISTORY_SIZE = 1000
/** How long the Julia REPL has to start and serve the terminal. */
const START_SECONDS = 180

function readHistory(): string[] {
    try {
        return fs.readFileSync(HISTORY, 'utf8').split('\n').filter(Boolean).reverse().slice(0, HISTORY_SIZE)
    } catch {
        return []
    }
}

function writeHistory(history: readonly string[]): void {
    try {
        fs.mkdirSync(path.dirname(HISTORY), { recursive: true })
        fs.writeFileSync(HISTORY, [...history].reverse().join('\n') + '\n')
    } catch {
        // The history is a convenience.
    }
}

/** Text for the terminal, each line break a carriage return and a line feed. */
function terminalText(text: string): string {
    return text.replace(/\r?\n/g, '\r\n')
}

class PollisPty implements vscode.Pseudoterminal {
    private readonly writeEmitter = new vscode.EventEmitter<string>()
    readonly onDidWrite = this.writeEmitter.event
    private readonly closeEmitter = new vscode.EventEmitter<void>()
    readonly onDidClose = this.closeEmitter.event

    private readonly input = new PassThrough()
    private readonly output: Writable & { columns: number; rows: number }
    private rl: readline.Interface | undefined
    private connection: PollisReplConnection | undefined
    private connecting: Promise<PollisReplConnection | undefined> | undefined
    private lines: string[] = []
    private running = false

    constructor(private readonly startRepl: () => Promise<unknown>) {
        const write = (chunk: Buffer | string, _encoding: BufferEncoding, done: () => void) => {
            this.writeEmitter.fire(terminalText(chunk.toString()))
            done()
        }
        this.output = Object.assign(new Writable({ write }), { columns: 80, rows: 24 })
    }

    open(dimensions: vscode.TerminalDimensions | undefined): void {
        if (dimensions) {
            this.output.columns = dimensions.columns
            this.output.rows = dimensions.rows
        }
        const rl = this.rl = readline.createInterface({
            input: this.input,
            output: this.output,
            terminal: true,
            prompt: PROMPT,
            history: readHistory(),
            historySize: HISTORY_SIZE,
        })
        rl.on('history', history => writeHistory(history))
        rl.on('line', line => void this.line(line))
        rl.on('SIGINT', () => {
            // Ctrl+C at the prompt drops what is typed, as in duckdb>
            this.lines = []
            this.write('^C\n')
            rl.setPrompt(PROMPT)
            rl.prompt()
        })
        rl.on('close', () => this.closeEmitter.fire())
        // In the terminal theme's colours: the example in cyan, as code, the keys in bold, the rest dim
        this.write([
            `${bold('Pollis REPL')}${dim(': SQL on the Shared Session, the database of the Julia REPL.')}`,
            `  ${cyan('feeds := SELECT * FROM PollisRSS.feeds;')}   ${dim('keeps the result as the DuckDB table')} ${cyan('feeds')}${dim(',')}`,
            `  ${' '.repeat('feeds := SELECT * FROM PollisRSS.feeds;'.length)}   ${dim('and as the Julia variable')} ${cyan('feeds')}${dim(', a Tables.jl table.')}`,
            `${dim('End a query with')} ${bold(';')}   ${bold('Ctrl+C')} ${dim('stops a query')}   ${bold('Ctrl+D')} ${dim('closes')}`,
            '',
        ].join('\n') + '\n')
        void this.connect().then(() => rl.prompt())
    }

    handleInput(data: string): void {
        if (this.running) {
            // While a query runs, Ctrl+C stops it, and the rest is dropped
            if (data.includes('\x03')) {
                this.connection?.interrupt()
            }
            return
        }
        this.input.write(data)
    }

    setDimensions(dimensions: vscode.TerminalDimensions): void {
        this.output.columns = dimensions.columns
        this.output.rows = dimensions.rows
        this.output.emit('resize')
    }

    close(): void {
        this.rl?.close()
        this.connection?.close()
    }

    private write(text: string): void {
        this.writeEmitter.fire(terminalText(text))
    }

    /** The connection to the Julia REPL, which is started first when it does not run. */
    private connect(): Promise<PollisReplConnection | undefined> {
        if (this.connection?.open) {
            return Promise.resolve(this.connection)
        }
        this.connecting ??= this.reach().finally(() => (this.connecting = undefined))
        return this.connecting
    }

    private async reach(): Promise<PollisReplConnection | undefined> {
        const file = pollisReplFile(POLLIS_WINDOW)
        let served = readServed(file)
        if (!served) {
            this.write(dim('Starting the Julia REPL...\n'))
            await this.startRepl()
            for (let waited = 0; !served && waited < START_SECONDS * 4; waited++) {
                await new Promise(resolve => setTimeout(resolve, 250))
                served = readServed(file)
            }
        }
        if (!served) {
            this.write(red('The Julia REPL did not start: start it with Julia REPL, in the status bar, then run the query again.\n'))
            return undefined
        }
        try {
            this.connection = await PollisReplConnection.connect(served, () => this.lost())
            return this.connection
        } catch (err) {
            this.write(red(`The Julia REPL could not be reached: ${(err as Error).message}\n`))
            return undefined
        }
    }

    /** The Julia REPL has stopped: said once, and the next query starts it again. */
    private lost(): void {
        this.connection = undefined
        if (!this.running && this.rl) {
            this.write(dim('\nThe Julia REPL has stopped; the next query starts it again.\n'))
            this.rl.prompt(true)
        }
    }

    private async line(line: string): Promise<void> {
        const rl = this.rl!
        this.lines.push(line)
        const text = this.lines.join('\n')
        if (!text.trim()) {
            this.lines = []
            rl.prompt()
            return
        }
        this.running = true
        try {
            const connection = await this.connect()
            if (!connection) {
                this.lines = []
                return
            }
            if (!(await connection.complete(text))) {
                rl.setPrompt(CONTINUATION)
                return
            }
            this.lines = []
            const answer = await connection.query(text, this.output.columns)
            this.write(answer.kind === 'ok' ? `${answer.text}\n\n` : `${red(answer.text)}\n\n`)
        } catch (err) {
            this.lines = []
            this.write(red(`${(err as Error).message}\n`))
        } finally {
            this.running = false
            if (!this.lines.length) {
                rl.setPrompt(PROMPT)
            }
            rl.prompt()
        }
    }
}

let g_terminal: vscode.Terminal | undefined
let g_item: vscode.StatusBarItem | undefined

function updateItem(): void {
    if (!g_item) {
        return
    }
    g_item.text = g_terminal ? '$(circle-filled) Pollis REPL' : '$(circle-outline) Pollis REPL'
    g_item.tooltip = (g_terminal
        ? 'Pollis REPL open, on the Shared Session — click to show it'
        : 'Open Pollis REPL: SQL on the Shared Session of the Julia REPL, which it starts if need be')
        + '\nIn the Julia REPL, > at the start of a line goes to its own pollis> mode; Backspace on an empty line comes back.'
}

/** The line under a table that `name :=` keeps (PollisDB.jl, Kept), whose last words open it in the Table Viewer. */
const BROWSE_LINE = /^Browse (?<name>[A-Za-z_][A-Za-z0-9_]*): (?<link>Open in Table Viewer)\s*$/

interface IBrowseLink extends vscode.TerminalLink {
    readonly table: string
}

/**
 * Asks the Julia REPL of this window, through its own socket, on a connection of the request's own: `undefined` when no
 * REPL runs. A failure to reach it is thrown.
 */
async function askJulia(request: (connection: PollisReplConnection) => Promise<IPollisAnswer>): Promise<IPollisAnswer | undefined> {
    const served = readServed(pollisReplFile(POLLIS_WINDOW))
    if (!served) {
        return undefined
    }
    const connection = await PollisReplConnection.connect(served, () => undefined)
    try {
        return await request(connection)
    } finally {
        connection.close()
    }
}

/** Opens the table `name` of the Shared Session in the Table Viewer. */
async function browseTable(name: string): Promise<void> {
    try {
        const answer = await askJulia(connection => connection.browse(name))
        if (!answer) {
            void vscode.window.showErrorMessage(`The Julia REPL has stopped: ${name} is gone with its Shared Session.`)
        } else if (answer.kind !== 'ok') {
            void vscode.window.showErrorMessage(answer.text)
        }
    } catch (err) {
        void vscode.window.showErrorMessage(`The Julia REPL could not be reached: ${(err as Error).message}`)
    }
}

/** A client attached to the Shared Session, the duckdb> terminal or a notebook: its last query, and since when. */
interface IAttachedClient {
    readonly query: string
    readonly running: boolean
    readonly seconds: number
}

/**
 * What the window's DuckDB clients have attached to the Shared Session, for its hover in the Databases view
 * (connectionsView.ts): `undefined` when the Julia REPL does not run or does not answer.
 */
async function sharedSessionAttached(): Promise<IAttachedClient[] | undefined> {
    try {
        const answer = await askJulia(connection => connection.attached())
        return answer?.kind === 'ok' ? JSON.parse(answer.text) as IAttachedClient[] : undefined
    } catch {
        return undefined
    }
}

/** The link "Open in Table Viewer", in the Pollis REPL terminal and the Julia REPL's pollis> mode. */
const browseLinks: vscode.TerminalLinkProvider<IBrowseLink> = {
    provideTerminalLinks: context => {
        if (context.terminal !== g_terminal && !context.terminal.name.startsWith('Julia REPL')) {
            return []
        }
        const match = BROWSE_LINE.exec(context.line)
        if (!match?.groups) {
            return []
        }
        const { name, link } = match.groups
        return [{ startIndex: `Browse ${name}: `.length, length: link.length, tooltip: `Open ${name} in the Table Viewer`, table: name }]
    },
    handleTerminalLink: link => browseTable(link.table),
}

/** Opens the Pollis REPL terminal, or shows it; `startRepl` starts the Julia REPL, which it runs on. */
function openPollisRepl(startRepl: () => Promise<unknown>): void {
    if (g_terminal) {
        g_terminal.show(false)
        return
    }
    g_terminal = vscode.window.createTerminal({ name: 'Pollis REPL', pty: new PollisPty(startRepl), iconPath: new vscode.ThemeIcon('terminal') })
    g_terminal.show(false)
    updateItem()
}

/**
 * The Pollis REPL item of the status bar, between Julia REPL and Pollis' DuckDB REPL, and its command, which the
 * terminal's + menu also offers.
 */
export function activatePollisRepl(context: vscode.ExtensionContext, startRepl: () => Promise<unknown>): void {
    g_item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -0.5)
    g_item.command = 'language-julia.startPollisREPL'
    updateItem()
    g_item.show()
    context.subscriptions.push(
        g_item,
        vscode.commands.registerCommand('language-julia.startPollisREPL', () => openPollisRepl(startRepl)),
        vscode.window.registerTerminalLinkProvider(browseLinks),
        vscode.commands.registerCommand('language-julia.sharedSessionAttached', sharedSessionAttached),
        vscode.window.onDidCloseTerminal(terminal => {
            if (terminal === g_terminal) {
                g_terminal = undefined
                updateItem()
            }
        })
    )
}
