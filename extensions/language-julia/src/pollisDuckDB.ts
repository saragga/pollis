// POLLIS: the DuckDB engine of Pollis, for Julia as well. Pollis ships libduckdb (with @duckdb/node-api) and the Lance
// extension, compressed (build/pollis/duckdb.ts); at install, they are copied and unpacked into ~/.pollis/duckdb/, a
// path that stays the same across updates. Julia's DuckDB.jl is Pollis' fork without DuckDB_jll
// (Trumpingtons/DuckDB.jl), which loads the library named by JULIA_DUCKDB_LIBRARY; the path is fixed when DuckDB.jl is
// precompiled, so it must not change.

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { pipeline } from 'stream/promises'
import * as vscode from 'vscode'
import * as zlib from 'zlib'

const DUCKDB_HOME = path.join(os.homedir(), '.pollis', 'duckdb')

const LIBRARY_NAME = process.platform === 'win32' ? 'duckdb.dll' : process.platform === 'darwin' ? 'libduckdb.dylib' : 'libduckdb.so'

/** The libduckdb that Julia loads, through JULIA_DUCKDB_LIBRARY. */
export const DUCKDB_LIBRARY = path.join(DUCKDB_HOME, LIBRARY_NAME)

/** What was copied, so that it is copied again only when Pollis brings a new DuckDB or Lance. */
const STAMP = path.join(DUCKDB_HOME, 'pollis.stamp')

let g_ready: Promise<void> = Promise.resolve()

/**
 * Sets JULIA_DUCKDB_LIBRARY for every Julia that Pollis starts (the REPL and terminals, notebooks, the install task),
 * and copies the engine and Lance into ~/.pollis/duckdb/ when they are missing or older than Pollis'.
 */
export function activate(context: vscode.ExtensionContext) {
    process.env.JULIA_DUCKDB_LIBRARY = DUCKDB_LIBRARY
    context.environmentVariableCollection.replace('JULIA_DUCKDB_LIBRARY', DUCKDB_LIBRARY)
    context.environmentVariableCollection.description = 'The DuckDB engine of Pollis, for DuckDB.jl'
    const engine = install(vscode.env.appRoot).catch((err) => {
        console.error('[pollis] DuckDB could not be installed into ~/.pollis/duckdb', err)
    })
    const references = installReferences(vscode.env.appRoot).catch((err) => {
        console.error('[pollis] The references of Pollis could not be copied into ~/.pollis/references', err)
    })
    g_ready = Promise.all([engine, references]).then(() => undefined)
}

/** Resolves once ~/.pollis/duckdb/ holds Pollis' engine and Lance, and ~/.pollis/references/ its references (or a copy failed). */
export function whenDuckDBReady(): Promise<void> {
    return g_ready
}

function firstExisting(candidates: string[]): string | undefined {
    return candidates.find((candidate) => fs.existsSync(candidate))
}

async function install(appRoot: string) {
    const bindings = `node-bindings-${process.platform}-${process.arch}`
    // Packaged, the folder is outside the asar archive; in a development build, in node_modules.
    const folder = firstExisting([
        path.join(appRoot, 'node_modules.asar.unpacked', '@duckdb', bindings),
        path.join(appRoot, 'node_modules', '@duckdb', bindings),
    ])
    if (!folder) {
        return
    }
    // Lance exists for some platforms only; in a development build, `npm run gulp fetch-duckdb-lance` fetches it.
    const lance = firstExisting([
        path.join(appRoot, 'duckdb', 'lance.duckdb_extension.gz'),
        path.join(appRoot, '.build', 'duckdb', 'lance.duckdb_extension.gz'),
    ])
    const version = JSON.parse(await fs.promises.readFile(path.join(folder, 'package.json'), 'utf8')).version
    const stamp = `${version}\n${lance ? (await fs.promises.stat(lance)).size : 'no lance'}\n`
    const installed = await fs.promises.readFile(STAMP, 'utf8').catch(() => '')
    if (installed === stamp && fs.existsSync(DUCKDB_LIBRARY)) {
        return
    }
    await fs.promises.mkdir(DUCKDB_HOME, { recursive: true })
    // Written beside and renamed over the old copy, so that a Julia that has it loaded keeps its own.
    const library = `${DUCKDB_LIBRARY}.${process.pid}.tmp`
    await fs.promises.copyFile(path.join(folder, LIBRARY_NAME), library)
    await fs.promises.rename(library, DUCKDB_LIBRARY)
    if (lance) {
        const target = path.join(DUCKDB_HOME, 'lance.duckdb_extension')
        const unpacked = `${target}.${process.pid}.tmp`
        await pipeline(fs.createReadStream(lance), zlib.createGunzip(), fs.createWriteStream(unpacked))
        await fs.promises.rename(unpacked, target)
    }
    await fs.promises.writeFile(STAMP, stamp)
}

/** The references that come with Pollis, which PollisDB.build_references() makes the pollis_ tables of PollisReferences from. */
const POLLIS_REFERENCES = path.join(os.homedir(), '.pollis', 'references', 'pollis.json')

/** Copies the references that come with this Pollis into ~/.pollis/references/pollis.json, when they differ from those there. */
async function installReferences(appRoot: string) {
    const shipped = path.join(appRoot, 'out', 'vs', 'workbench', 'contrib', 'model', 'browser', 'media', 'references', 'references.json')
    const text = await fs.promises.readFile(shipped, 'utf8').catch(() => undefined)
    if (text === undefined || text === await fs.promises.readFile(POLLIS_REFERENCES, 'utf8').catch(() => '')) {
        return
    }
    await fs.promises.mkdir(path.dirname(POLLIS_REFERENCES), { recursive: true })
    const copy = `${POLLIS_REFERENCES}.${process.pid}.tmp`
    await fs.promises.writeFile(copy, text)
    await fs.promises.rename(copy, POLLIS_REFERENCES)
}
