// POLLIS: the recorder of the runs of coding agents on the pages of Compose > Orchestration. Pollis starts it in the agent's
// terminal, with the Node of the extension host (ELECTRON_RUN_AS_NODE=1, `language-julia.pollisAgentRecorder` in
// pollisAgentRecorder.ts), as `agentRecorder.js <program> <arguments...>`, and with POLLIS_RECORDER, a JSON object: the agent's
// folder, the format of its events, its name and model, and the texts it writes, in the display language. It starts the
// agent, which prints its events as JSON lines (Claude Code and Antigravity CLI stream-json, Codex --json, OpenCode
// --format json, GitHub Copilot CLI --output-format json), shows them in the terminal as text, and keeps them, as they
// come, in .transcript/events.jsonl of the agent's folder, each with the milliseconds since the start. When the agent
// ends, it writes TRANSCRIPT.md beside them, readable, and .transcript/summary.json: the minutes in all, in tools and the
// rest, the tool calls and the tokens. It adds the summary to ~/.pollis/agents/runs.jsonl, the runs of all studies. It
// ends with the agent's exit code. Stop sends it SIGTERM, which it passes on to the agent before writing the transcript.

import * as child_process from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as readline from 'readline'

type Format = 'claude' | 'codex' | 'opencode' | 'copilot' | 'antigravity'

/** The texts, in the display language, given by Pollis; English when it gives none. */
const TEXT = {
    heading: 'Transcript of {0}',
    summary: '{0} min in all: {1} min thinking and writing, {2} min in {3} tool calls. Tokens: {4} in, {5} out.',
    thinking: 'Thinking',
    output: 'Output',
    failed: 'Failed',
    stopped: 'Stopped.',
    exited: 'Ended with exit code {0}.',
    saved: 'Transcript: {0}',
    started: 'Started {0}',
}

type RecorderOptions = { folder: string; format: Format; title: string; agent: string; model: string; text?: Partial<typeof TEXT> }

/** A step of a run, the same for every agent: what each reader makes of the agent's events. `at` is a time the event gives, in ms since 1970. */
type Step =
    | { kind: 'text'; text: string }
    | { kind: 'thinking'; text: string }
    | { kind: 'toolStart'; id: string; name: string; input: string; at?: number }
    | { kind: 'toolEnd'; id: string; output: string; failed: boolean; at?: number }
    | { kind: 'usage'; key?: string; input: number; output: number; cached: number }
    | { kind: 'totals'; input: number; output: number; cached: number }
    | { kind: 'model'; name: string }
    | { kind: 'error'; text: string }

/** A step with the time it came, in ms since the start. */
type TimedStep = Step & { time: number }

type JsonObject = { [key: string]: unknown }

function format(template: string, ...values: (string | number)[]): string {
    return template.replace(/\{(\d+)\}/g, (match, index) => (values[Number(index)] !== undefined ? String(values[Number(index)]) : match))
}

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(value: unknown): string {
    return typeof value === 'string' ? value : ''
}

function num(value: unknown): number {
    return typeof value === 'number' && isFinite(value) ? value : 0
}

/** What a tool was given, as one line: a command, a file or the arguments as JSON. */
function inputText(input: unknown): string {
    if (typeof input === 'string') {
        return input
    }
    if (isObject(input)) {
        for (const key of ['command', 'cmd', 'file_path', 'filePath', 'path', 'pattern', 'query', 'url', 'description']) {
            if (typeof input[key] === 'string') {
                return input[key] as string
            }
            if (Array.isArray(input[key])) {
                return (input[key] as unknown[]).map(String).join(' ')
            }
        }
    }
    return input === undefined ? '' : JSON.stringify(input)
}

/** The text of a tool's result: a string, text blocks or JSON. */
function outputText(output: unknown): string {
    if (typeof output === 'string') {
        return output
    }
    if (Array.isArray(output)) {
        return output.map((block) => (isObject(block) ? str(block.text) || str(block.content) : String(block))).join('\n')
    }
    if (isObject(output)) {
        return str(output.content) || str(output.text) || str(output.output) || str(output.detailedContent) || JSON.stringify(output)
    }
    return output === undefined || output === null ? '' : String(output)
}

/** Claude Code's stream-json, which Antigravity CLI's follows: system, assistant and user messages, and the result. */
function readClaude(event: JsonObject): Step[] {
    const steps: Step[] = []
    if (event.type === 'system' && typeof event.model === 'string') {
        steps.push({ kind: 'model', name: event.model })
    } else if ((event.type === 'assistant' || event.type === 'user') && isObject(event.message)) {
        const message = event.message
        for (const block of Array.isArray(message.content) ? message.content : []) {
            if (!isObject(block)) {
                continue
            }
            if (block.type === 'text' && str(block.text).trim()) {
                steps.push({ kind: 'text', text: str(block.text) })
            } else if (block.type === 'thinking' && str(block.thinking).trim()) {
                steps.push({ kind: 'thinking', text: str(block.thinking) })
            } else if (block.type === 'tool_use') {
                steps.push({ kind: 'toolStart', id: str(block.id), name: str(block.name), input: inputText(block.input) })
            } else if (block.type === 'tool_result') {
                steps.push({ kind: 'toolEnd', id: str(block.tool_use_id), output: outputText(block.content), failed: block.is_error === true })
            }
        }
        if (typeof message.content === 'string' && message.content.trim() && event.type === 'assistant') {
            steps.push({ kind: 'text', text: message.content })
        }
        // Each block of a message comes as an event with the message's usage so far: the last one counts
        if (event.type === 'assistant' && isObject(message.usage)) {
            const usage = message.usage
            steps.push({ kind: 'usage', key: str(message.id), input: num(usage.input_tokens) + num(usage.cache_read_input_tokens) + num(usage.cache_creation_input_tokens), output: num(usage.output_tokens), cached: num(usage.cache_read_input_tokens) })
        }
    } else if (event.type === 'result') {
        if (isObject(event.usage)) {
            const usage = event.usage
            steps.push({ kind: 'totals', input: num(usage.input_tokens) + num(usage.cache_read_input_tokens) + num(usage.cache_creation_input_tokens), output: num(usage.output_tokens), cached: num(usage.cache_read_input_tokens) })
        }
        if (event.is_error === true) {
            steps.push({ kind: 'error', text: str(event.result) || str(event.subtype) })
        }
    }
    return steps
}

/** Codex's --json: items started and completed, and the usage of each turn. */
function readCodex(event: JsonObject): Step[] {
    const item = isObject(event.item) ? event.item : undefined
    const id = str(item?.id)
    if (event.type === 'item.started' && item?.type === 'command_execution') {
        return [{ kind: 'toolStart', id, name: 'shell', input: inputText(item.command) }]
    }
    if (event.type === 'item.completed' && item) {
        switch (item.type) {
            case 'agent_message':
                return str(item.text).trim() ? [{ kind: 'text', text: str(item.text) }] : []
            case 'reasoning':
                return str(item.text).trim() ? [{ kind: 'thinking', text: str(item.text) }] : []
            case 'command_execution':
                return [{ kind: 'toolEnd', id, output: str(item.aggregated_output), failed: typeof item.exit_code === 'number' && item.exit_code !== 0 }]
            case 'file_change': {
                const files = (Array.isArray(item.changes) ? item.changes : []).map((change) => (isObject(change) ? str(change.path) : '')).filter((file) => file)
                return [{ kind: 'toolStart', id, name: 'edit', input: files.join(' ') }, { kind: 'toolEnd', id, output: '', failed: item.status === 'failed' }]
            }
            case 'mcp_tool_call':
                return [{ kind: 'toolStart', id, name: `${str(item.server)}.${str(item.tool)}`, input: inputText(item.arguments) }, { kind: 'toolEnd', id, output: outputText(item.result), failed: item.status === 'failed' }]
            case 'web_search':
                return [{ kind: 'toolStart', id, name: 'web search', input: str(item.query) }, { kind: 'toolEnd', id, output: '', failed: false }]
            case 'error':
                return [{ kind: 'error', text: str(item.message) }]
        }
        return []
    }
    if (event.type === 'turn.completed' && isObject(event.usage)) {
        return [{ kind: 'usage', input: num(event.usage.input_tokens), output: num(event.usage.output_tokens), cached: num(event.usage.cached_input_tokens) }]
    }
    if (event.type === 'turn.failed' && isObject(event.error)) {
        return [{ kind: 'error', text: str(event.error.message) }]
    }
    if (event.type === 'error') {
        return [{ kind: 'error', text: str(event.message) }]
    }
    return []
}

/** OpenCode's --format json: the parts of each step, a tool once it has ended, with its times, and each step's tokens. */
function readOpenCode(event: JsonObject): Step[] {
    const part = isObject(event.part) ? event.part : undefined
    if ((event.type === 'text' || event.type === 'reasoning') && part && str(part.text).trim()) {
        return [{ kind: event.type === 'text' ? 'text' : 'thinking', text: str(part.text) }]
    }
    if (event.type === 'tool_use' && part) {
        const state = isObject(part.state) ? part.state : {}
        const time = isObject(state.time) ? state.time : {}
        const id = str(part.callID) || str(part.id)
        return [
            { kind: 'toolStart', id, name: str(part.tool), input: inputText(state.input), at: num(time.start) || undefined },
            { kind: 'toolEnd', id, output: state.status === 'error' ? str(state.error) : outputText(state.output), failed: state.status === 'error', at: num(time.end) || undefined },
        ]
    }
    if (event.type === 'step_finish' && part && isObject(part.tokens)) {
        const tokens = part.tokens
        const cache = isObject(tokens.cache) ? tokens.cache : {}
        return [{ kind: 'usage', input: num(tokens.input) + num(cache.read) + num(cache.write), output: num(tokens.output) + num(tokens.reasoning), cached: num(cache.read) }]
    }
    if (event.type === 'error') {
        const error = isObject(event.error) ? event.error : {}
        return [{ kind: 'error', text: str(isObject(error.data) ? error.data.message : undefined) || str(error.message) || str(error.name) || JSON.stringify(event.error) }]
    }
    return []
}

/** GitHub Copilot CLI's --output-format json, the events of its sessions: messages, tool executions and the usage of each request. */
function readCopilot(event: JsonObject): Step[] {
    const data = isObject(event.data) ? event.data : {}
    const at = typeof event.timestamp === 'string' ? Date.parse(event.timestamp) || undefined : undefined
    switch (event.type) {
        case 'session.start':
            return str(data.selectedModel) ? [{ kind: 'model', name: str(data.selectedModel) }] : []
        case 'assistant.reasoning':
            return str(data.content).trim() ? [{ kind: 'thinking', text: str(data.content) }] : []
        case 'assistant.message':
            return str(data.content).trim() ? [{ kind: 'text', text: str(data.content) }] : []
        case 'tool.execution_start':
            return [{ kind: 'toolStart', id: str(data.toolCallId), name: str(data.toolName), input: inputText(data.arguments), at }]
        case 'tool.execution_complete':
            return [{ kind: 'toolEnd', id: str(data.toolCallId), output: outputText(data.result ?? data.error), failed: data.success === false, at }]
        case 'session.usage_record':
        case 'assistant.usage': {
            const usage = isObject(data.usage) ? data.usage : data
            return [{ kind: 'usage', input: num(usage.inputTokens), output: num(usage.outputTokens), cached: num(usage.cacheReadTokens) }]
        }
        case 'session.error':
            return [{ kind: 'error', text: str(data.message) || JSON.stringify(data) }]
    }
    return []
}

const READERS: Record<Format, (event: JsonObject) => Step[]> = {
    claude: readClaude,
    codex: readCodex,
    opencode: readOpenCode,
    copilot: readCopilot,
    antigravity: readClaude,
}

// The look of the steps in the terminal
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const RED = '\x1b[31m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

/** The first `count` lines of a text, each cut to `width` characters, and an ellipsis when there is more. */
function firstLines(text: string, count: number, width: number): string[] {
    const lines = text.replace(/\r/g, '').split('\n').filter((line) => line.trim())
    const shown = lines.slice(0, count).map((line) => (line.length > width ? line.slice(0, width - 1) + '…' : line))
    if (lines.length > count) {
        shown.push('…')
    }
    return shown
}

function seconds(ms: number): string {
    return ms < 60000 ? `${(ms / 1000).toFixed(1)} s` : `${(ms / 60000).toFixed(1)} min`
}

function minutes(ms: number): string {
    return (ms / 60000).toFixed(1)
}

function tokens(count: number): string {
    return count >= 1e6 ? `${(count / 1e6).toFixed(2)}M` : count >= 1e3 ? `${Math.round(count / 1e3)}k` : String(count)
}

class Recorder {
    private readonly start = Date.now()
    private readonly steps: TimedStep[] = []
    private readonly toolStarts = new Map<string, TimedStep & { kind: 'toolStart' }>()
    private readonly events: fs.WriteStream
    private readonly read: (event: JsonObject) => Step[]
    readonly text: typeof TEXT

    constructor(readonly options: RecorderOptions) {
        this.text = { ...TEXT, ...options.text }
        fs.mkdirSync(path.join(options.folder, '.transcript'), { recursive: true })
        this.events = fs.createWriteStream(path.join(options.folder, '.transcript', 'events.jsonl'))
        this.read = READERS[options.format] ?? readClaude
    }

    /** The milliseconds since the start of a time an event gives, else of now. */
    private elapsed(at?: number): number {
        return at && at >= this.start - 60000 ? Math.max(0, at - this.start) : Date.now() - this.start
    }

    /** A line the agent printed: an event, read and shown, or text, shown as it is. */
    line(line: string): void {
        const time = Date.now() - this.start
        let event: unknown
        try {
            event = line.trim().startsWith('{') ? JSON.parse(line) : undefined
        } catch {
            event = undefined
        }
        if (!isObject(event)) {
            this.events.write(JSON.stringify({ t: time, line }) + '\n')
            if (line.trim()) {
                this.add({ kind: 'text', text: line })
            }
            return
        }
        this.events.write(JSON.stringify({ t: time, event }) + '\n')
        let steps: Step[]
        try {
            steps = this.read(event)
        } catch {
            steps = []
        }
        for (const step of steps) {
            this.add(step)
        }
    }

    /** What the agent wrote to its error output, shown and kept. */
    stderr(text: string): void {
        process.stderr.write(text)
        this.events.write(JSON.stringify({ t: Date.now() - this.start, stderr: text }) + '\n')
    }

    private add(step: Step): void {
        const time = this.elapsed('at' in step ? step.at : undefined)
        const timed = { ...step, time } as TimedStep
        this.steps.push(timed)
        switch (timed.kind) {
            case 'text':
                process.stdout.write(timed.text.replace(/\n*$/, '\n\n'))
                break
            case 'thinking':
                process.stdout.write(`${DIM}${this.text.thinking}: ${firstLines(timed.text, 6, 160).join('\n')}${RESET}\n\n`)
                break
            case 'toolStart':
                this.toolStarts.set(timed.id, timed)
                process.stdout.write(`${CYAN}● ${timed.name}${RESET} ${firstLines(timed.input, 1, 160)[0] ?? ''}\n`)
                break
            case 'toolEnd': {
                const started = this.toolStarts.get(timed.id)
                const took = started ? ` (${seconds(timed.time - started.time)})` : ''
                const lines = firstLines(timed.output, 4, 160)
                const color = timed.failed ? RED : DIM
                process.stdout.write(`${color}  ⎿ ${timed.failed ? this.text.failed + took + (lines.length ? ': ' : '') : took.trim() + (lines.length ? ' ' : '')}${lines.join('\n    ')}${RESET}\n\n`)
                break
            }
            case 'error':
                process.stdout.write(`${RED}${timed.text}${RESET}\n\n`)
                break
        }
    }

    /** The summary of the run, from its steps: the time in tools is that of the union of the tools' runs. */
    summary(exitCode: number | null, stopped: boolean) {
        const total = Date.now() - this.start
        const intervals: [number, number][] = []
        const ends = new Map<string, number>()
        for (const step of this.steps) {
            if (step.kind === 'toolEnd') {
                ends.set(step.id, step.time)
            }
        }
        let toolCalls = 0
        for (const step of this.steps) {
            if (step.kind === 'toolStart') {
                toolCalls++
                intervals.push([step.time, Math.max(step.time, ends.get(step.id) ?? total)])
            }
        }
        intervals.sort((a, b) => a[0] - b[0])
        let inTools = 0
        let reach = 0
        for (const [from, to] of intervals) {
            const start = Math.max(from, reach)
            if (to > start) {
                inTools += to - start
            }
            reach = Math.max(reach, to)
        }
        const usages = new Map<string, Step & { kind: 'usage' }>()
        let index = 0
        for (const step of this.steps) {
            if (step.kind === 'usage') {
                usages.set(step.key || `#${index++}`, step)
            }
        }
        const totals = [...this.steps].reverse().find((step): step is TimedStep & { kind: 'totals' } => step.kind === 'totals')
        const sum = (key: 'input' | 'output' | 'cached') => (totals ? totals[key] : [...usages.values()].reduce((all, usage) => all + usage[key], 0))
        return {
            agent: this.options.agent,
            model: this.options.model,
            title: this.options.title,
            folder: this.options.folder,
            started: new Date(this.start).toISOString(),
            ended: new Date(this.start + total).toISOString(),
            minutes: total / 60000,
            toolMinutes: inTools / 60000,
            thinkingMinutes: (total - inTools) / 60000,
            toolCalls,
            tokens: { input: sum('input'), output: sum('output'), cached: sum('cached') },
            models: [...new Set(this.steps.filter((step) => step.kind === 'model').map((step) => (step as Step & { kind: 'model' }).name))],
            exitCode,
            stopped,
        }
    }

    /** TRANSCRIPT.md: the summary, then the steps in order, each tool with its input and output. */
    private markdown(summary: ReturnType<Recorder['summary']>): string {
        const fence = (text: string) => {
            const longest = Math.max(2, ...(text.match(/`+/g) ?? []).map((ticks) => ticks.length))
            const ticks = '`'.repeat(longest + 1)
            return `${ticks}\n${text.replace(/\n*$/, '')}\n${ticks}`
        }
        const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
        const out = [
            `# ${format(this.text.heading, this.options.title)}`,
            '',
            format(this.text.started, summary.started),
            '',
            format(this.text.summary, minutes(summary.minutes * 60000), minutes(summary.thinkingMinutes * 60000), minutes(summary.toolMinutes * 60000), summary.toolCalls, tokens(summary.tokens.input), tokens(summary.tokens.output)),
            '',
        ]
        const ends = new Map<string, TimedStep & { kind: 'toolEnd' }>()
        for (const step of this.steps) {
            if (step.kind === 'toolEnd') {
                ends.set(step.id, step)
            }
        }
        for (const step of this.steps) {
            switch (step.kind) {
                case 'text':
                    out.push(step.text.trim(), '')
                    break
                case 'thinking':
                    out.push(...step.text.trim().split('\n').map((line) => `> ${line}`), '')
                    break
                case 'toolStart': {
                    const end = ends.get(step.id)
                    const took = end ? `, ${seconds(end.time - step.time)}` : ''
                    out.push(`**${step.name}** (${clock(step.time)}${took}${end?.failed ? `, ${this.text.failed}` : ''})`, '', fence(step.input), '')
                    if (end?.output.trim()) {
                        const lines = end.output.replace(/\r/g, '').split('\n')
                        const kept = lines.length > 60 ? [...lines.slice(0, 60), '…'] : lines
                        out.push(`<details><summary>${this.text.output}</summary>`, '', fence(kept.join('\n')), '', '</details>', '')
                    }
                    break
                }
                case 'error':
                    out.push(`**${step.text.trim()}**`, '')
                    break
            }
        }
        out.push(summary.stopped ? this.text.stopped : format(this.text.exited, summary.exitCode ?? '?'), '')
        return out.join('\n')
    }

    /** Writes the transcript, the summary and the line of runs.jsonl, and shows where they are. */
    finish(exitCode: number | null, stopped: boolean): void {
        const summary = this.summary(exitCode, stopped)
        this.events.end()
        const transcript = path.join(this.options.folder, 'TRANSCRIPT.md')
        try {
            fs.writeFileSync(transcript, this.markdown(summary))
            fs.writeFileSync(path.join(this.options.folder, '.transcript', 'summary.json'), JSON.stringify(summary, undefined, 2))
            const runs = path.join(os.homedir(), '.pollis', 'agents')
            fs.mkdirSync(runs, { recursive: true })
            fs.appendFileSync(path.join(runs, 'runs.jsonl'), JSON.stringify(summary) + '\n')
        } catch (error) {
            process.stderr.write(`${RED}${String(error)}${RESET}\n`)
        }
        process.stdout.write(`${BOLD}${format(this.text.summary, minutes(summary.minutes * 60000), minutes(summary.thinkingMinutes * 60000), minutes(summary.toolMinutes * 60000), summary.toolCalls, tokens(summary.tokens.input), tokens(summary.tokens.output))}${RESET}\n`)
        process.stdout.write(`${DIM}${format(this.text.saved, transcript)}${RESET}\n`)
    }
}

/** An argument for the command line of cmd.exe, which runs a Windows batch file: in double quotes, its own doubled. */
function cmdArgument(arg: string): string {
    return `"${arg.replace(/"/g, '""')}"`
}

function main(): void {
    const [program, ...args] = process.argv.slice(2)
    let options: RecorderOptions
    try {
        options = JSON.parse(process.env.POLLIS_RECORDER ?? '')
    } catch {
        process.stderr.write('POLLIS_RECORDER is not set.\n')
        process.exit(2)
    }
    if (!program || !options?.folder) {
        process.stderr.write('Usage: agentRecorder.js <program> <arguments...>, with POLLIS_RECORDER set.\n')
        process.exit(2)
    }
    const recorder = new Recorder(options)

    // The agent gets the terminal's environment, without what made this Node
    const env = { ...process.env }
    delete env.ELECTRON_RUN_AS_NODE
    delete env.POLLIS_RECORDER
    const batch = process.platform === 'win32' && /\.(cmd|bat)$/i.test(program)
    const child = batch
        ? child_process.spawn(env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', `"${[program, ...args].map(cmdArgument).join(' ')}"`], { env, stdio: ['inherit', 'pipe', 'pipe'], windowsVerbatimArguments: true })
        : child_process.spawn(program, args, { env, stdio: ['inherit', 'pipe', 'pipe'] })

    let stopped = false
    let done = false
    const finish = (code: number | null) => {
        if (done) {
            return
        }
        done = true
        recorder.finish(code, stopped)
        process.exit(code ?? 1)
    }
    child.on('error', (error) => {
        recorder.stderr(`${error.message}\n`)
        finish(127)
    })
    readline.createInterface({ input: child.stdout }).on('line', (line) => recorder.line(line))
    child.stderr.on('data', (data: Buffer) => recorder.stderr(data.toString()))
    child.on('close', (code, signal) => finish(code ?? (signal ? 128 + (os.constants.signals[signal] ?? 0) : null)))

    // Stop: the agent gets the signal, and ends; Ctrl+C in the terminal reaches both, and the recorder waits for the agent
    const stop = (signal: NodeJS.Signals) => {
        stopped = true
        if (child.exitCode === null && child.signalCode === null) {
            child.kill(signal)
            setTimeout(() => child.kill('SIGKILL'), 5000).unref()
        }
    }
    process.on('SIGTERM', () => stop('SIGTERM'))
    process.on('SIGINT', () => {
        stopped = true
    })
    process.on('SIGHUP', () => stop('SIGHUP'))
}

main()
