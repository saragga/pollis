/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: the DuckDB Manual of Ask Pollis, the documentation of the DuckDB that Pollis carries: the Markdown pages
// duckdb.org is made from, in its repository (duckdb/duckdb-web, under the MIT licence of the DuckDB Foundation), of the
// version of that DuckDB, at a fixed commit, so that the pages are those of the DuckDB that answers. They are kept with
// that licence in ~/.pollis/documents/duckdb/VERSION, with manifest.json, the commit and each page's title, written
// last; ask_index.jl reads them, cut at their headings, each passage with the address of its section on duckdb.org.
// The other clients' APIs, the internals, the pages for developers and on building extensions, and the guides for
// Python are left out, as Julia's own developer documentation is from the Julia Manual.

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

/** The version of the DuckDB of Pollis (@duckdb/node-api and DuckDB.jl), whose documentation is read. */
const VERSION = '2.0'
/** The commit of duckdb/duckdb-web the pages are read at. */
const COMMIT = 'b421c300096722cf2be64d37a35cc5520a3ceb75'
/** The collection of the DuckDB Manual, as Ask Pollis names it (askPollisMain.ts, askPollisWebview.ts). */
const COLLECTION = 'DuckDB Manual'
/** Where the pages are kept, as ask_index.jl finds them: their paths there are their addresses on duckdb.org. */
const FOLDER = path.join(os.homedir(), '.pollis', 'documents', 'duckdb', VERSION)
const MANIFEST = path.join(FOLDER, 'manifest.json')
const RAW = `https://raw.githubusercontent.com/duckdb/duckdb-web/${COMMIT}`
/** The pages read, by their paths under docs/VERSION, and those left out of them. */
const SECTIONS = ['index.md', 'lakehouse_formats.md', 'connect/', 'configuration/', 'core_extensions/', 'data/', 'guides/', 'operations_manual/', 'quack/', 'sql/', 'clients/tertiary_clients/julia.md']
const LEFT_OUT = ['guides/python/', 'guides/odbc/', 'operations_manual/installing_duckdb/']
/** How many pages are read at a time. */
const PAGES_AT_ONCE = 8

/** The pages read: the commit, and each page's file under FOLDER and title. */
type Manifest = { commit: string; pages: { file: string; title: string }[] }
/** A source of ask_index.jl. */
type DuckDBSource = { kind: 'duckdb'; title: string; file: string; menu: string; toolbox: string; collection: string }

async function readText(url: string): Promise<string> {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000), headers: { 'User-Agent': 'Pollis' } })
    if (!response.ok) {
        throw new Error(`${response.status} for ${url}`)
    }
    return response.text()
}

async function readManifest(): Promise<Manifest | undefined> {
    try {
        return JSON.parse(await fs.promises.readFile(MANIFEST, 'utf8'))
    } catch {
        return undefined
    }
}

/** The title a page's front matter gives it, else its file's name. */
function pageTitle(markdown: string, file: string): string {
    const front = /^---\r?\n(?<front>[\s\S]*?)\r?\n---/.exec(markdown)?.groups?.front ?? ''
    const title = /^title:\s*(?<title>.+)$/m.exec(front)?.groups?.title.trim().replace(/^(['"])(?<inner>.*)\1$/, '$<inner>')
    return title || path.basename(file, '.md')
}

/** The pages of the DuckDB Manual read so far, for the list of ask_index.jl. */
export async function duckdbDocSources(): Promise<DuckDBSource[]> {
    const manifest = await readManifest()
    if (manifest?.commit !== COMMIT) {
        return []
    }
    return manifest.pages.map(page => ({ kind: 'duckdb', title: page.title, file: path.join(FOLDER, page.file), menu: `DuckDB ${VERSION}`, toolbox: '', collection: COLLECTION }))
}

/**
 * Reads the pages of the DuckDB Manual when they are not those of COMMIT yet, with `report` told how many are read;
 * whether they changed. They are read into a folder of their own, which takes the place of the last only once every page
 * is in, so that an index never reads half of them; when they cannot be read, as without a network, the next index tries.
 */
export async function updateDuckDBDocs(report: (done: number, total: number) => void): Promise<boolean> {
    if ((await readManifest())?.commit === COMMIT) {
        return false
    }
    const tree = JSON.parse(await readText(`https://api.github.com/repos/duckdb/duckdb-web/git/trees/${COMMIT}?recursive=1`)) as { tree: { path: string; type: string }[] }
    const prefix = `docs/${VERSION}/`
    const files = tree.tree.filter(entry => entry.type === 'blob' && entry.path.startsWith(prefix) && entry.path.endsWith('.md'))
        .map(entry => entry.path.slice(prefix.length))
        .filter(file => SECTIONS.some(section => file.startsWith(section)) && !LEFT_OUT.some(section => file.startsWith(section)))
    const partial = `${FOLDER}.partial`
    await fs.promises.rm(partial, { recursive: true, force: true })
    await fs.promises.mkdir(partial, { recursive: true })
    await fs.promises.writeFile(path.join(partial, 'LICENSE'), await readText(`${RAW}/LICENSE`))
    const pages: Manifest['pages'] = []
    for (let start = 0; start < files.length; start += PAGES_AT_ONCE) {
        report(start, files.length)
        await Promise.all(files.slice(start, start + PAGES_AT_ONCE).map(async file => {
            const markdown = await readText(`${RAW}/${prefix}${file}`)
            await fs.promises.mkdir(path.dirname(path.join(partial, file)), { recursive: true })
            await fs.promises.writeFile(path.join(partial, file), markdown)
            pages.push({ file, title: pageTitle(markdown, file) })
        }))
    }
    pages.sort((a, b) => a.file.localeCompare(b.file))
    await fs.promises.writeFile(path.join(partial, 'manifest.json'), JSON.stringify({ commit: COMMIT, pages } satisfies Manifest))
    await fs.promises.rm(FOLDER, { recursive: true, force: true })
    await fs.promises.rename(partial, FOLDER)
    return true
}
