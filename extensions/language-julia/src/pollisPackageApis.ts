/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: the Package APIs of Ask Pollis, the docstrings of the packages of the panels, read from the sites Documenter
// made for them (scripts/terminalserver/package_apis.json, which build/pollis/makePackageApis.ts writes). The search
// index of a site, search_index.js, says which of its pages have docstrings; the docstrings are read from the HTML of
// those pages, because that index has lost the backslashes and braces of the formulas and the fences of the code.
// A package is read at the version on this computer when its site has that version, and otherwise at the stable version,
// and at dev when it is developed in ~/.julia/dev. Each goes to a file of its own, ~/.pollis/documents/apis/NAME.json,
// which ask_index.jl reads, one passage to a docstring. A version that may change, or another version than the
// one wanted, is checked at most once a week (checked.json); a file whose content is the same is not written, so that
// its passages are not read again.

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

/** The collection of the Package APIs, as Ask Pollis names it (askPollisMain.ts, askPollisWebview.ts). */
const COLLECTION = 'Package APIs'
const FOLDER = path.join(os.homedir(), '.pollis', 'documents', 'apis')
const CHECKED = path.join(FOLDER, 'checked.json')
const WEEK = 7 * 24 * 60 * 60 * 1000
/** How many pages of a site are read at a time. */
const PAGES_AT_ONCE = 4
/** After how many sites in a row that cannot be reached the others wait for the next index. */
const FAILURES_TO_STOP = 3

/** A docstring of a package: its name, as `GLM.ftest`, its category, the address it is at, and its text with its code and formulas. */
type ApiEntry = { name: string; category: string; url: string; text: string }
/** A package's file: the version wanted (empty for stable), the one read, and its docstrings. */
type ApiFile = { package: string; wanted: string; version: string; entries: ApiEntry[] }
/** A source of ask_index.jl. */
type ApiSource = { kind: 'api'; title: string; file: string; menu: string; toolbox: string; collection: string }

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decode(text: string): string {
    return text.replace(/&(?<name>#x[0-9a-f]+|#[0-9]+|\w+);/gi, (whole, name: string) => {
        if (name.startsWith('#')) {
            const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)
            return code <= 0x10ffff ? String.fromCodePoint(code) : whole
        }
        return ENTITIES[name] ?? whole
    })
}

/** The text of HTML with no code block: code in backticks, a list's items with dashes, a table's cells with bars; a formula as Documenter wrote it. */
function proseText(html: string): string {
    const text = html
        .replace(/<code[^>]*>/g, '`')
        .replace(/<\/code>/g, '`')
        .replace(/<li[^>]*>/g, '\n- ')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/t[dh]>/g, ' | ')
        .replace(/<\/?tr[^>]*>/g, '\n')
        .replace(/<\/?(?:p|div|ul|ol|table|thead|tbody|h[1-6]|header|section|blockquote|details|summary|article)\b[^>]*>/g, '\n\n')
        .replace(/<[^>]+>/g, '')
    return decode(text)
        .replace(/[ \t]+/g, ' ')
        .replace(/ ?\n ?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
}

/** The text of a docstring's HTML: its code blocks fenced and left as they are, without the link to its source. */
function docstringText(html: string): string {
    const body = html.replace(/<a class="docs-sourcelink"[^>]*>[\s\S]*?<\/a>/g, '')
    const parts: string[] = []
    let from = 0
    for (const block of body.matchAll(/<pre[^>]*>\s*<code[^>]*>(?<code>[\s\S]*?)<\/code>\s*<\/pre>/g)) {
        parts.push(proseText(body.slice(from, block.index)))
        parts.push('\n\n```julia\n' + decode(block.groups!.code.replace(/<[^>]+>/g, '')).trimEnd() + '\n```\n\n')
        from = block.index + block[0].length
    }
    parts.push(proseText(body.slice(from)))
    return parts.join('').replace(/\n{3,}/g, '\n\n').trim()
}

/** Where the element opened at `start`, of the tag `tag`, ends: after its closing tag, those of the same tag within it counted. */
function elementEnd(html: string, tag: string, start: number): number {
    const tags = new RegExp(`<(?<closing>/?)${tag}\\b`, 'g')
    tags.lastIndex = start
    let depth = 0
    for (let match = tags.exec(html); match; match = tags.exec(html)) {
        depth += match.groups!.closing ? -1 : 1
        if (!depth) {
            const end = html.indexOf('>', match.index)
            return end < 0 ? html.length : end + 1
        }
    }
    return html.length
}

/**
 * The docstrings of a page of Documenter at `url`: an `article`, a `details` in its later versions or a `section` in
 * its earliest, with the name in `docstring-binding`, then the category and the text.
 */
export function pageDocstrings(html: string, url: string): ApiEntry[] {
    const entries: ApiEntry[] = []
    const opening = /<(?<tag>article|details|section) class="docstring"[^>]*>/g
    for (let match = opening.exec(html); match; match = opening.exec(html)) {
        const end = elementEnd(html, match.groups!.tag, match.index)
        const block = html.slice(match.index + match[0].length, end)
        opening.lastIndex = end
        const binding = /<a class="docstring-binding"[^>]*href="#(?<anchor>[^"]*)"[^>]*>(?<name>[\s\S]*?)<\/a>/.exec(block)
        const category = /<span class="docstring-category">(?<category>[^<]*)<\/span>[^<]*(?:<\/(?:header|summary|div)>)?/.exec(block)
        if (binding && category) {
            entries.push({
                name: decode(binding.groups!.name.replace(/<[^>]+>/g, '')).trim(),
                category: category.groups!.category,
                url: `${url}#${binding.groups!.anchor}`,
                text: docstringText(block.slice(category.index + category[0].length)),
            })
        }
    }
    return entries
}

/** A page's text; nothing when the server does not have it; an exception when it cannot be reached. */
async function readPage(url: string): Promise<string | undefined> {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
    return response.ok ? response.text() : undefined
}

/** The version of the documentation at `site`, as its siteinfo.js has it, like `v1.9.5`. */
async function siteVersion(site: string): Promise<string> {
    const info = await readPage(`${site}/siteinfo.js`)
    return /DOCUMENTER_CURRENT_VERSION = "(?<version>[^"]*)"/.exec(info ?? '')?.groups?.version ?? ''
}

/** The docstrings at `site`, a page at a time; nothing when it has no search index. */
export async function siteDocstrings(site: string): Promise<ApiEntry[] | undefined> {
    const index = await readPage(`${site}/search_index.js`)
    if (!index) {
        return undefined
    }
    const { docs } = JSON.parse(index.slice(index.indexOf('{')).trim().replace(/;$/, '')) as { docs: { location: string; category?: string }[] }
    const pages = [...new Set(docs.filter((entry) => entry.category !== 'page' && entry.category !== 'section').map((entry) => entry.location.split('#')[0]))]
    const entries: ApiEntry[] = []
    while (pages.length) {
        const read = await Promise.all(pages.splice(0, PAGES_AT_ONCE).map(async (page) => {
            const url = `${site}/${page}`
            const html = await readPage(url)
            return html ? pageDocstrings(html, url) : []
        }))
        entries.push(...read.flat())
    }
    return entries
}

/** The address of `version` of the site whose stable version is at `stable`: `v1.9.5` on a package's own site, `1.9.5` on JuliaHub, which has no dev. */
function versionSite(stable: string, version: string): string | undefined {
    const juliaHub = stable.startsWith('https://docs.juliahub.com/')
    if (version === 'dev') {
        return juliaHub ? undefined : stable.replace(/[^/]+$/, 'dev')
    }
    return stable.replace(/[^/]+$/, juliaHub ? version : `v${version}`)
}

function isNewer(version: string, than: string): boolean {
    const numbers = (text: string) => text.split('.').map((part) => parseInt(part, 10) || 0)
    const [a, b] = [numbers(version), numbers(than)]
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] ?? 0) !== (b[i] ?? 0)) {
            return (a[i] ?? 0) > (b[i] ?? 0)
        }
    }
    return false
}

/** The version of a package wanted: `dev` when it is developed here, the newest on this computer, or empty for the stable one. */
async function wantedVersion(name: string): Promise<string> {
    const short = name.replace(/\.jl$/, '')
    const julia = path.join(os.homedir(), '.julia')
    if (fs.existsSync(path.join(julia, 'dev', short))) {
        return 'dev'
    }
    const folder = path.join(julia, 'packages', short)
    const slugs = await fs.promises.readdir(folder).catch(() => [] as string[])
    let newest = ''
    for (const slug of slugs) {
        const project = await fs.promises.readFile(path.join(folder, slug, 'Project.toml'), 'utf8').catch(() => '')
        const version = /^version\s*=\s*"(?<version>[^"]+)"/m.exec(project)?.groups?.version
        if (version && (!newest || isNewer(version, newest))) {
            newest = version
        }
    }
    return newest
}

function readSites(extensionPath: string): Record<string, string> {
    return JSON.parse(fs.readFileSync(path.join(extensionPath, 'scripts', 'terminalserver', 'package_apis.json'), 'utf8'))
}

async function readFile(file: string): Promise<ApiFile | undefined> {
    try {
        return JSON.parse(await fs.promises.readFile(file, 'utf8'))
    } catch {
        return undefined
    }
}

/** The Package APIs read so far, for the list of ask_index.jl, each with the version read to say which it is. */
export async function packageApiSources(extensionPath: string): Promise<ApiSource[]> {
    const sources: ApiSource[] = []
    for (const name of Object.keys(readSites(extensionPath))) {
        const file = path.join(FOLDER, `${name}.json`)
        const read = await readFile(file)
        if (read?.entries.length) {
            sources.push({ kind: 'api', title: name, file, menu: read.version, toolbox: '', collection: COLLECTION })
        }
    }
    return sources
}

/**
 * Brings the files of the Package APIs up to date, one package at a time, with `report` told how many were looked at;
 * whether any changed. A site that cannot be reached is tried at the next index; so are the rest after several in a row,
 * as without a network.
 */
export async function updatePackageApis(extensionPath: string, report: (done: number, total: number) => void): Promise<boolean> {
    const sites = Object.entries(readSites(extensionPath))
    await fs.promises.mkdir(FOLDER, { recursive: true })
    const checked: Record<string, number> = JSON.parse(await fs.promises.readFile(CHECKED, 'utf8').catch(() => '{}'))
    let changed = false
    let failures = 0
    for (const [done, [name, stable]] of sites.entries()) {
        try {
            const file = path.join(FOLDER, `${name}.json`)
            const wanted = await wantedVersion(name)
            const cached = await readFile(file)
            const plain = (version: string) => version.replace(/^v/, '')
            const exact = !!cached && !!wanted && wanted !== 'dev' && cached.wanted === wanted && plain(cached.version) === wanted
            if (exact || (cached?.wanted === wanted && Date.now() - (checked[name] ?? 0) < WEEK)) {
                continue
            }
            report(done, sites.length)
            // The version wanted, if the site has it, else the stable one
            const own = wanted ? versionSite(stable, wanted) : undefined
            const ownVersion = own ? await siteVersion(own) : ''
            const site = ownVersion ? own! : stable
            const version = ownVersion || (await siteVersion(stable))
            if (!cached || cached.wanted !== wanted || !version || plain(cached.version) !== plain(version)) {
                const entries = await siteDocstrings(site)
                if (entries) {
                    const content = JSON.stringify({ package: name, wanted, version, entries } satisfies ApiFile)
                    if (content !== await fs.promises.readFile(file, 'utf8').catch(() => '')) {
                        await fs.promises.writeFile(file, content)
                        changed = true
                    }
                }
            }
            checked[name] = Date.now()
            await fs.promises.writeFile(CHECKED, JSON.stringify(checked))
            failures = 0
        } catch (err) {
            console.error(`[pollis] could not read the API of ${name}`, err)
            if (++failures === FAILURES_TO_STOP) {
                break
            }
        }
    }
    return changed
}
