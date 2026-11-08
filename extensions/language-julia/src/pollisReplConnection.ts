// POLLIS: the connection of the Pollis REPL terminal to the Julia REPL of its window. PollisDB (serve_terminal in
// PollisDB.jl) listens on a socket only the user can reach, and writes it with a token to
// ~/.pollis/duckdb/served/pollis.<window>.json. Requests are a line, `<kind> ...`, and the text they carry; answers
// are a line, `<kind> <bytes>`, and their text.

import * as fs from 'fs'
import * as net from 'net'
import * as os from 'os'
import * as path from 'path'

/** The file by which the Julia REPL of the window `window` says where the Pollis REPL terminal reaches it. */
export function pollisReplFile(window: string): string {
    return path.join(os.homedir(), '.pollis', 'duckdb', 'served', `pollis.${window}.json`)
}

interface IServed {
    readonly socket: string
    readonly token: string
    readonly pid: number
}

/** An answer of Julia: `ok` and the table drawn, `error` and the error, `complete` or `incomplete`, `ready`. */
export interface IPollisAnswer {
    readonly kind: string
    readonly text: string
}

/** What `file` says, if the Julia that wrote it still runs. */
export function readServed(file: string): IServed | undefined {
    try {
        const served = JSON.parse(fs.readFileSync(file, 'utf8')) as IServed
        process.kill(served.pid, 0)
        return typeof served.socket === 'string' && typeof served.token === 'string' ? served : undefined
    } catch {
        return undefined
    }
}

export class PollisReplConnection {
    private buffer = Buffer.alloc(0)
    private readonly waiting: { resolve: (answer: IPollisAnswer) => void; reject: (error: Error) => void }[] = []
    private isClosed = false

    private constructor(private readonly socket: net.Socket, private readonly onClose: () => void) {
        socket.on('data', data => this.read(data))
        socket.on('close', () => this.closed())
        socket.on('error', () => this.closed())
    }

    /** Connects to the Julia that `served` names, and waits until it has opened the Shared Session. */
    static async connect(served: IServed, onClose: () => void): Promise<PollisReplConnection> {
        const socket = await new Promise<net.Socket>((resolve, reject) => {
            const opened = net.connect(served.socket, () => resolve(opened))
            opened.once('error', reject)
        })
        const connection = new PollisReplConnection(socket, onClose)
        const ready = connection.answer()
        socket.write(`token ${served.token}\n`)
        if ((await ready).kind !== 'ready') {
            connection.close()
            throw new Error('The Julia REPL did not take the connection')
        }
        return connection
    }

    /** Whether the connection is still open: the Julia REPL runs. */
    get open(): boolean {
        return !this.isClosed
    }

    /** Whether `text` is a whole query, ended by a semicolon outside quotes and comments, as Julia reads it. */
    async complete(text: string): Promise<boolean> {
        const data = Buffer.from(text, 'utf8')
        const answer = this.answer()
        this.socket.write(Buffer.concat([Buffer.from(`complete ${data.length}\n`), data]))
        return (await answer).kind === 'complete'
    }

    /** Runs `text` as the pollis> mode does; the answer holds the result drawn in `width` characters, or the error. */
    async query(text: string, width: number): Promise<IPollisAnswer> {
        const data = Buffer.from(text, 'utf8')
        const answer = this.answer()
        this.socket.write(Buffer.concat([Buffer.from(`query ${width} ${data.length}\n`), data]))
        return answer
    }

    /** Opens the table `name` of the Shared Session in the Table Viewer; the answer is `ok`, or `error` and the error. */
    async browse(name: string): Promise<IPollisAnswer> {
        const data = Buffer.from(name, 'utf8')
        const answer = this.answer()
        this.socket.write(Buffer.concat([Buffer.from(`browse ${data.length}\n`), data]))
        return answer
    }

    /** What the window's DuckDB clients have attached to the Shared Session: `ok` and a JSON list, or `error`. */
    async attached(): Promise<IPollisAnswer> {
        const answer = this.answer()
        this.socket.write('attached\n')
        return answer
    }

    /** Stops the query running. */
    interrupt(): void {
        if (!this.isClosed) {
            this.socket.write('interrupt\n')
        }
    }

    close(): void {
        this.socket.destroy()
        this.closed()
    }

    private answer(): Promise<IPollisAnswer> {
        if (this.isClosed) {
            return Promise.reject(new Error('The Julia REPL has stopped'))
        }
        return new Promise((resolve, reject) => this.waiting.push({ resolve, reject }))
    }

    private read(data: Buffer): void {
        this.buffer = Buffer.concat([this.buffer, data])
        for (; ;) {
            const end = this.buffer.indexOf(10)
            if (end < 0) {
                return
            }
            const [kind, size] = this.buffer.subarray(0, end).toString('utf8').split(' ')
            const length = Number(size)
            if (this.buffer.length < end + 1 + length) {
                return
            }
            const text = this.buffer.subarray(end + 1, end + 1 + length).toString('utf8')
            this.buffer = this.buffer.subarray(end + 1 + length)
            this.waiting.shift()?.resolve({ kind, text })
        }
    }

    private closed(): void {
        if (this.isClosed) {
            return
        }
        this.isClosed = true
        for (const waiter of this.waiting.splice(0)) {
            waiter.reject(new Error('The Julia REPL has stopped'))
        }
        this.onClose()
    }
}
