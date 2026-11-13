// POLLIS: the DuckDB engine of Pollis, for Julia as well. Pollis ships libduckdb (with @duckdb/node-api) and the
// extensions fts, full-text search, and quack, with httpfs on which it runs, compressed (build/pollis/duckdb.ts); at install, they are copied and unpacked into ~/.pollis/duckdb/, a
// path that stays the same across updates. The extensions json and excel, for JSON files and Excel workbooks, are unpacked
// where DuckDB installs its extensions, ~/.duckdb/extensions/VERSION/PLATFORM/, so that a DuckDB of that version finds them
// installed and loads them when a query needs them: Julia's, and those of Pollis, which never download one. Julia's DuckDB.jl is Pollis' fork without DuckDB_jll
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

/** What was copied, so that it is copied again only when Pollis brings a new DuckDB or new extensions. */
const STAMP = path.join(DUCKDB_HOME, 'pollis.stamp')

/** The extensions of DuckDB that come with Pollis and are loaded by their path in ~/.pollis/duckdb/. */
const DUCKDB_EXTENSIONS = ['fts', 'quack', 'httpfs']

/** The extensions of DuckDB that come with Pollis and are unpacked where DuckDB installs its extensions. */
const INSTALLED_EXTENSIONS = ['json', 'excel']

/** DuckDB's names of the platforms, in the path of its extensions. */
const DUCKDB_PLATFORMS: Record<string, string> = {
    'darwin-arm64': 'osx_arm64',
    'darwin-x64': 'osx_amd64',
    'linux-x64': 'linux_amd64',
    'linux-arm64': 'linux_arm64',
    'win32-x64': 'windows_amd64',
    'win32-arm64': 'windows_arm64',
}

let g_ready: Promise<void> = Promise.resolve()

/**
 * Sets JULIA_DUCKDB_LIBRARY for every Julia that Pollis starts (the REPL and terminals, notebooks, the install task),
 * and copies the engine and its extensions into ~/.pollis/duckdb/ when they are missing or older than Pollis'.
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

/** Resolves once ~/.pollis/duckdb/ holds Pollis' engine and its extensions, and ~/.pollis/references/ its references (or a copy failed). */
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
    const version: string = JSON.parse(await fs.promises.readFile(path.join(folder, 'package.json'), 'utf8')).version
    // Where DuckDB installs its extensions: the version of the engine (1.5.6 of @duckdb/node-api 1.5.6-r.1) and the platform.
    const platform = DUCKDB_PLATFORMS[`${process.platform}-${process.arch}`]
    const installedFolder = platform && path.join(os.homedir(), '.duckdb', 'extensions', `v${version.replace(/-.*$/, '')}`, platform)
    // The extensions that come with Pollis: fts, full-text search, and quack, which serves the Shared Session's database,
    // with httpfs, on which quack runs; json and excel, for JSON files and Excel workbooks.
    // In a development build, `npm run gulp fetch-duckdb-extensions` fetches them.
    const extensions = [
        ...DUCKDB_EXTENSIONS.map(name => ({ name, destination: DUCKDB_HOME })),
        ...(installedFolder ? INSTALLED_EXTENSIONS.map(name => ({ name, destination: installedFolder })) : []),
    ].map(e => ({
        ...e,
        file: firstExisting([
            path.join(appRoot, 'duckdb', `${e.name}.duckdb_extension.gz`),
            path.join(appRoot, '.build', 'duckdb', `${e.name}.duckdb_extension.gz`),
        ]),
    }))
    const sizes = await Promise.all(extensions.map(async e => (e.file ? `${(await fs.promises.stat(e.file)).size}` : `no ${e.name}`)))
    const stamp = `${version}\n${sizes.join('\n')}\n`
    const installed = await fs.promises.readFile(STAMP, 'utf8').catch(() => '')
    if (installed === stamp && fs.existsSync(DUCKDB_LIBRARY)) {
        return
    }
    await fs.promises.mkdir(DUCKDB_HOME, { recursive: true })
    // Written beside and renamed over the old copy, so that a Julia that has it loaded keeps its own.
    const library = `${DUCKDB_LIBRARY}.${process.pid}.tmp`
    await fs.promises.copyFile(path.join(folder, LIBRARY_NAME), library)
    await fs.promises.rename(library, DUCKDB_LIBRARY)
    for (const { name, destination, file } of extensions) {
        if (file) {
            await fs.promises.mkdir(destination, { recursive: true })
            const target = path.join(destination, `${name}.duckdb_extension`)
            const unpacked = `${target}.${process.pid}.tmp`
            await pipeline(fs.createReadStream(file), zlib.createGunzip(), fs.createWriteStream(unpacked))
            await fs.promises.rename(unpacked, target)
        }
    }
    // The Lance extension that Pollis brought up to 0.2.10, 234 MB, which it no longer uses; on Windows, a Julia that
    // has it loaded keeps it until the next install.
    for (const name of ['lance.duckdb_extension', 'lance.duckdb_extension.loaded']) {
        await fs.promises.rm(path.join(DUCKDB_HOME, name), { force: true }).catch(() => undefined)
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
