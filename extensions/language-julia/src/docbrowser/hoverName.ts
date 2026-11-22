/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: which name of Julia code a hover looks up in the REPL, and the REPL's answer as a hover shows it. Both the
// editor and the code boxes of the panels use it. It reads the code only, and needs neither VS Code nor Julia.

/** A name to look up, such as `Base.sort!`, and where its part under the pointer is in the code. */
export interface HoveredName {
    readonly name: string
    readonly start: number
    readonly end: number
}

const NAME = String.raw`[\p{L}_](?:[\p{L}\p{N}\p{M}_]|!(?!=))*`
/** Where a name can start. */
const START = String.raw`(?<![\p{L}\p{N}\p{M}_!.@:])`
const NOT_LOOKED_UP = new Set(
    'baremodule begin break catch const continue do else elseif end export false finally for function global if import in let local macro module quote return struct true try using where while'.split(
        ' '
    )
)
/** At most this many methods of a function without a docstring are shown. */
const MAX_METHODS = 10

/** The code with its strings, characters and comments as spaces, so that every other character keeps its place. */
function withoutText(code: string): string {
    const chars = code.split('')
    const blank = (from: number, to: number) => {
        for (let i = from; i < Math.min(to, chars.length); i++) {
            if (chars[i] !== '\n') {
                chars[i] = ' '
            }
        }
    }
    const stringEnd = (from: number, interpolated: boolean): number => {
        const quote = code[from]
        const delimiter = code.startsWith(quote.repeat(3), from) ? quote.repeat(3) : quote
        let i = from + delimiter.length
        while (i < code.length) {
            if (code[i] === '\\') {
                i += 2
            } else if (code.startsWith(delimiter, i)) {
                return i + delimiter.length
            } else if (interpolated && code.startsWith('$(', i)) {
                // The interpolated code, which can hold strings of its own
                let depth = 1
                i += 2
                while (i < code.length && depth) {
                    if (code[i] === '"') {
                        i = stringEnd(i, true)
                        continue
                    }
                    depth += code[i] === '(' ? 1 : code[i] === ')' ? -1 : 0
                    i++
                }
            } else {
                i++
            }
        }
        return code.length
    }

    let i = 0
    while (i < code.length) {
        const char = code[i]
        let end = i + 1
        if (code.startsWith('#=', i)) {
            let depth = 1
            end = i + 2
            while (end < code.length && depth) {
                const step = code.startsWith('#=', end) ? 1 : code.startsWith('=#', end) ? -1 : 0
                depth += step
                end += step ? 2 : 1
            }
            blank(i, end)
        } else if (char === '#') {
            const newLine = code.indexOf('\n', i)
            end = newLine < 0 ? code.length : newLine
            blank(i, end)
        } else if (char === '"' || char === '`') {
            // A prefix, as in raw"...", makes the string literal, and letters after it are its flags
            let start = i
            while (start > 0 && /[\p{L}\p{N}_]/u.test(code[start - 1])) {
                start--
            }
            end = stringEnd(i, start === i)
            while (start < i && end < code.length && /[a-z]/i.test(code[end])) {
                end++
            }
            blank(start, end)
        } else if (char === "'" && (i === 0 || !/[\p{L}\p{N}_)\]}.'!]/u.test(code[i - 1]))) {
            // A character: after a value, the apostrophe is a transpose
            const literal = /^'(?:\\[^'\n]+|\\'|[^\\\n]{1,2})'/u.exec(code.slice(i, i + 14))
            if (literal) {
                end = i + literal[0].length
                blank(i, end)
            }
        }
        i = end
    }
    return chars.join('')
}

/** How many brackets are open at each place of `text`. */
function bracketDepths(text: string): number[] {
    const depths: number[] = []
    let depth = 0
    for (let i = 0; i < text.length; i++) {
        depths.push(depth)
        if ('([{'.includes(text[i])) {
            depth++
        } else if (')]}'.includes(text[i])) {
            depth = Math.max(0, depth - 1)
        }
    }
    depths.push(depth)
    return depths
}

/** The names that head the parts of a list such as `(a, b::Int; c = 2)`, whatever their types and defaults hold. */
function namesOfList(list: string): string[] {
    let flat = list.trim().replace(/^\((.*)\)$/s, '$1')
    let before: string
    do {
        before = flat
        flat = flat.replace(/[([{][^()[\]{}]*[)\]}]/g, '')
    } while (flat !== before)
    const head = new RegExp(`^\\s*(${NAME})`, 'u')
    return flat
        .split(/[,;]/)
        .map((part) => head.exec(part)?.[1])
        .filter((name): name is string => name !== undefined)
}

/**
 * Adds the variables of `text` to `assigned`, those the code assigns, and to `bound`, the parameters and loop
 * variables, which have the name only where they are.
 */
function addVariables(text: string, depths: number[], assigned: Set<string>, bound: Set<string>) {
    const assignment = new RegExp(`${START}(${NAME})(?:::[^\\s=(),;]+)?[ \\t]*(?:[-+*/^%|&]|\\|\\||&&)?=(?![=>])`, 'gu')
    for (const match of text.matchAll(assignment)) {
        // Within brackets it is a keyword argument
        if (depths[match.index] === 0) {
            assigned.add(match[1])
        }
    }
    const several = new RegExp(
        `(?:^|;|\\b(?:local|global|const)[ \\t])[ \\t]*(\\((?:[ \\t]*;)?[^()\\n=]+\\)|${NAME}(?:[ \\t]*,[ \\t]*${NAME})+)[ \\t]*=(?![=>])`,
        'gmu'
    )
    for (const match of text.matchAll(several)) {
        if (depths[match.index] === 0) {
            namesOfList(match[1]).forEach((name) => assigned.add(name))
        }
    }

    const binders = [
        `\\bfor\\s+(\\([^)\\n]*\\)|${NAME})\\s*(?:=|\\bin\\b|∈)`,
        `,\\s*(\\([^)\\n]*\\)|${NAME})\\s+in\\s`,
        `(\\([^()\\n]*\\)|${START}${NAME})\\s*->`,
        `\\bdo[ \\t]+([^\\n;]+)`,
        `\\bcatch[ \\t]+(${NAME})`,
    ]
    for (const binder of binders) {
        for (const match of text.matchAll(new RegExp(binder, 'gu'))) {
            namesOfList(match[1]).forEach((name) => bound.add(name))
        }
    }

    const signature = new RegExp(`(?:\\bfunction\\s+[^\\s(]*|(?:^|;)[ \\t]*${NAME}(?:\\.${NAME})*)\\(`, 'gmu')
    for (const match of text.matchAll(signature)) {
        const open = match.index + match[0].length - 1
        let close = open + 1
        while (close < text.length && depths[close + 1] > depths[open]) {
            close++
        }
        const defines =
            match[0].trimStart().startsWith('function') ||
            /^\)(?:::[^\s=]+)?(?:[ \t]+where[ \t][^=\n]+)?[ \t]*=(?![=>])/.test(text.slice(close, close + 200))
        if (defines) {
            namesOfList(text.slice(open + 1, close)).forEach((name) => bound.add(name))
        }
    }
}

/**
 * The name to look up at `offset` of `code`, whose `earlier` code ran, or will run, before it. A part of a qualified
 * name is looked up with what qualifies it. Nothing in strings and comments, nor for symbols, fields, keyword
 * arguments and the variables of the code: the documentation of another thing of the same name would mislead.
 */
export function nameAt(code: string, offset: number, earlier = ''): HoveredName | undefined {
    const text = withoutText(code)
    for (const match of text.matchAll(new RegExp(`@?${NAME}(?:\\.@?${NAME})*`, 'gu'))) {
        const first = match.index
        if (first > offset) {
            return undefined
        }
        if (offset >= first + match[0].length || text[offset] === '.') {
            continue
        }
        const start = Math.max(first, text.lastIndexOf('.', offset) + 1)
        const dot = match[0].indexOf('.', offset - first)
        const end = first + (dot < 0 ? match[0].length : dot)
        const name = text.slice(first, end)
        const root = name.split('.')[0]

        const before = text[first - 1] ?? ''
        const twoBefore = text[first - 2] ?? ''
        // The end of a number such as 2pi, or a field of a value such as f(x).field
        if (/\p{N}/u.test(before) || (before === '.' && twoBefore !== '.')) {
            return undefined
        }
        if (before === ':' && !/[\p{L}\p{N}_)\]}:!']/u.test(twoBefore)) {
            return undefined
        }
        if (NOT_LOOKED_UP.has(name)) {
            return undefined
        }

        const depths = bracketDepths(text)
        const after = text.slice(end, end + 200)
        if (depths[first] > 0 && /^(?:::[^\s=(),;]+)?[ \t]*=(?![=>])/.test(after)) {
            return undefined
        }

        const assigned = new Set<string>()
        const bound = new Set<string>()
        addVariables(text, depths, assigned, bound)
        if (earlier) {
            const earlierText = withoutText(earlier)
            // Only what earlier code assigns is still there: its parameters and loop variables are gone
            addVariables(earlierText, bracketDepths(earlierText), assigned, new Set<string>())
        }
        // A parameter named as a function, such as step, doesn't hide the calls of that function
        const called = name === root && /^\.?\(/.test(after)
        if (assigned.has(root) || (bound.has(root) && !called)) {
            return undefined
        }
        return { name, start, end }
    }
    return undefined
}

/**
 * The REPL's answer to a lookup as the Markdown of a hover: the docstring, or for a function or a type without one its
 * methods or its declaration. Nothing for a name Julia doesn't know and for the value of a variable.
 */
export function hoverMarkdown(answer: string): string | undefined {
    const doc = answer.trim()
    if (!doc) {
        return undefined
    }
    if (/^No documentation found/m.test(doc)) {
        if (/^`[^`\n]+` is a (?:`Function`|macro)\./m.test(doc)) {
            const methods = [...doc.matchAll(/^\s*\[\d+\]\s+(.+)$/gm)].map((match) => match[1])
            if (!methods.length) {
                return undefined
            }
            const shown = methods.slice(0, MAX_METHODS)
            if (methods.length > MAX_METHODS) {
                shown.push(`# + ${methods.length - MAX_METHODS} more`)
            }
            return '```julia\n' + shown.join('\n') + '\n```'
        }
        const declaration = /^# Summary\s+```\w*\n([\s\S]*?)\n```/m.exec(doc)?.[1]
        return declaration && !/^`[^`\n]+` is of type /m.test(doc) ? '```julia\n' + declaration + '\n```' : undefined
    }
    return (
        doc
            // A package's README can show images from the web, which a hover must not fetch
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[\s*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]+)\]\(@(?:ext)?ref[^)]*\)/g, '$1')
            // Julia's admonitions, which Markdown would show as code
            .replace(
                /^!!! +(\w+)(?: +"([^"\n]*)")?[ \t]*\n((?:(?: {4}.*|[ \t]*)(?:\n|$))*)/gm,
                (_all, kind: string, title: string | undefined, body: string) =>
                    [`> **${title ?? kind}**`, '', ...body.trimEnd().split('\n')]
                        .map((line, i) => (i ? `> ${line.replace(/^ {4}/, '')}`.trimEnd() : line))
                        .join('\n') + '\n\n'
            )
            .replace(/^```(?:jldoctest|julia-repl|@example|@repl).*$/gm, '```julia')
            .trim()
    )
}
