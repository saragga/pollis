// POLLIS: the GGUF model files that llama-server (pollisLlamaServer.ts) runs. A panel's model field holds either the path
// of a file on this computer or `hf:owner/repo/file.gguf`, a file on Hugging Face, which is downloaded into
// ~/.pollis/models/owner/repo/ the first time it is used, so that the same code runs on another computer. The command
// `language-julia.pollisChooseModel`, with {kind, value}, for the Choose... button beside such a field, opens a picker
// of the chat or embedding models already on this computer (in ~/.pollis/models and the Hugging Face cache), of the most downloaded small ones on Hugging Face, and Add Model File...; it answers the new value, or nothing.
// The models offered from Hugging Face follow rules rather than a list, so that they change as new models come out:
// GGUF files from the publishers of the setting pollis.localModels.publishers, updated in the last year (two for
// embedding models, which change more slowly), small enough for a laptop without a GPU, and the most downloaded in the
// last month. Larger models come from Compose > Local Models. The command `language-julia.pollisInstalledModels`
// answers the models on this computer, each with its value in the settings, for Compose > Local Models > Models Installed and the
// two Evaluate pages; `language-julia.pollisModelVersions`,
// with a model's file, the other files of its repository, and `language-julia.pollisDownloadModel`, with an `hf:` value,
// downloads one, for its Other Versions; `language-julia.pollisAvailableMemory`, the memory a model can have now, for
// the warning of Evaluate Answering Models and the charts of the memory free during a run of either Evaluate page; `language-julia.pollisTotalMemory`,
// the computer's memory, the top of that chart.

import { execFile } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import * as vscode from 'vscode'

export type ModelKind = 'chat' | 'embedding'

/** What a model reads besides text, through its projector. */
export type ModelMedia = 'image' | 'audio'

export const MODELS_DIR = path.join(os.homedir(), '.pollis', 'models')

/** The most parameters of a model offered from Hugging Face: about 2.5 GB for chat at Q4_K_M, 0.6 GB for embeddings at Q8_0. */
const MAX_PARAMETERS: Record<ModelKind, number> = { chat: 4.5e9, embedding: 0.6e9 }

/** How many models from Hugging Face the picker offers. */
const HUB_MODELS = 8

/** The quantisation chosen in a repository with several: a good balance for chat, nearly lossless for embeddings (which are small). */
const QUANTS: Record<ModelKind, string[]> = {
    chat: ['Q4_K_M', 'UD-Q4_K_XL', 'Q4_K_S', 'Q4_0', 'IQ4_XS', 'Q5_K_M', 'Q6_K', 'Q8_0'],
    embedding: ['Q8_0', 'F16', 'BF16', 'Q6_K', 'Q4_K_M', 'Q4_0'],
}

/** How recently a model offered from Hugging Face must have been updated, in years. */
const MAX_AGE: Record<ModelKind, number> = { chat: 1, embedding: 2 }

/**
 * The tasks Hugging Face gives the repositories of each kind. Many embedding repositories have no task, so their name
 * or architecture says it; chat models also need a chat template.
 */
const EMBEDDING_TASKS = ['feature-extraction', 'sentence-similarity']
const CHAT_TASKS = ['text-generation', 'image-text-to-text', undefined]

/** The searches of each publisher: its most downloaded GGUF repositories, and for embeddings, which are few among them, those of the embedding tasks. */
const SEARCHES: Record<ModelKind, string[]> = {
    chat: ['limit=50'],
    embedding: ['limit=30&search=embed', 'limit=30&pipeline_tag=feature-extraction', 'limit=30&pipeline_tag=sentence-similarity'],
}

type HubModel = { id: string; downloads: number; parameters: number }
type LocalModel = { file: string; name: string; sizeLabel?: string; kind?: ModelKind }

const g_downloads = new Map<string, Promise<string>>()
const g_hubModels = new Map<ModelKind, { time: number; models: Promise<HubModel[]> }>()

/** The folders of the GGUF files on this computer: Pollis' own and the Hugging Face cache. */
function modelFolders(): string[] {
    const home = os.homedir()
    return [
        MODELS_DIR,
        process.env.HF_HUB_CACHE ?? path.join(process.env.HF_HOME ?? path.join(home, '.cache', 'huggingface'), 'hub'),
    ]
}

/** The file of an `hf:owner/repo/file.gguf` value in ~/.pollis/models, or undefined for a path. */
function hubFile(value: string): { repo: string; file: string; local: string } | undefined {
    const match = /^hf:(?<repo>[^/]+\/[^/]+)\/(?<file>.+\.gguf)$/i.exec(value.trim())
    return match?.groups ? { repo: match.groups.repo, file: match.groups.file, local: path.join(MODELS_DIR, match.groups.repo, match.groups.file) } : undefined
}

/** The path of a model file, downloaded first when it is an `hf:` value not downloaded yet. */
export async function resolveModel(value: string): Promise<string> {
    const hub = hubFile(value)
    if (!hub) {
        const file = value.trim().replace(/^~(?=$|[\\/])/, os.homedir())
        if (!fs.existsSync(file)) {
            throw new Error(`There is no model file ${file}.`)
        }
        return file
    }
    if (fs.existsSync(hub.local)) {
        return hub.local
    }
    let download = g_downloads.get(hub.local)
    if (!download) {
        download = downloadModel(hub.repo, hub.file, hub.local).finally(() => g_downloads.delete(hub.local))
        g_downloads.set(hub.local, download)
    }
    return download
}

/** Download a file of a Hugging Face repository, showing its progress, into a .part file renamed when it is complete. */
async function downloadModel(repo: string, file: string, local: string): Promise<string> {
    return vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Downloading ${path.basename(file)} from Hugging Face`, cancellable: true },
        async (progress, token) => {
            const abort = new AbortController()
            token.onCancellationRequested(() => abort.abort())
            const response = await fetch(`https://huggingface.co/${repo}/resolve/main/${file.split('/').map(encodeURIComponent).join('/')}`, { signal: abort.signal })
            if (!response.ok || !response.body) {
                throw new Error(response.status === 401 || response.status === 404
                    ? `Hugging Face has no file ${file} in ${repo}, or it is private.`
                    : `Hugging Face answered ${response.status} for ${repo}/${file}.`)
            }
            const total = Number(response.headers.get('content-length')) || 0
            let received = 0
            let reported = 0
            // Counted as it is written, so that no chunk is read before the file is open
            const count = async function* (chunks: AsyncIterable<Buffer>) {
                for await (const chunk of chunks) {
                    received += chunk.length
                    const percent = total ? Math.floor((100 * received) / total) : 0
                    if (percent > reported) {
                        progress.report({ increment: percent - reported, message: `${gigabytes(received)} of ${gigabytes(total)}` })
                        reported = percent
                    }
                    yield chunk
                }
            }
            await fs.promises.mkdir(path.dirname(local), { recursive: true })
            const part = `${local}.part`
            try {
                await pipeline(Readable.fromWeb(response.body as import('stream/web').ReadableStream), count, fs.createWriteStream(part), { signal: abort.signal })
                if ((total && received !== total) || !(await readModelInfo(part))) {
                    throw new Error(`The download of ${path.basename(file)} is not a whole GGUF file.`)
                }
                await fs.promises.rename(part, local)
            } catch (err) {
                await fs.promises.rm(part, { force: true })
                throw token.isCancellationRequested ? new Error(`The download of ${path.basename(file)} was cancelled.`) : err
            }
            return local
        }
    )
}

function gigabytes(bytes: number): string {
    return `${(bytes / 1e9).toFixed(bytes < 1e10 ? 2 : 1)} GB`
}

/**
 * The keys of a GGUF file's header: strings, booleans as 'true' or 'false', and other values empty. The keys of the
 * model come before the tokenizer's long lists, which are skipped: they are read only with `tokenizer`, for the chat
 * template that comes after them. The file is read in chunks of 1 MB as the keys need.
 */
async function readHeaderKeys(file: string, tokenizer = false): Promise<Map<string, string> | undefined> {
    const handle = await fs.promises.open(file, 'r')
    // The chunk read, and where in the file it starts
    let buffer = Buffer.alloc(0)
    let start = 0
    let at = 0
    const need = async (size: number) => {
        if (at + size > start + buffer.length) {
            const chunk = Buffer.alloc(Math.max(size, 1024 * 1024))
            const bytesRead = (await handle.read(chunk, 0, chunk.length, at)).bytesRead
            if (bytesRead < size) {
                throw new Error('The header goes on past the end of the file.')
            }
            buffer = chunk.subarray(0, bytesRead)
            start = at
        }
    }
    const readNumber = async (size: 4 | 8) => {
        await need(size)
        const value = size === 4 ? buffer.readUInt32LE(at - start) : Number(buffer.readBigUInt64LE(at - start))
        at += size
        return value
    }
    const readString = async () => {
        const size = await readNumber(8)
        await need(size)
        at += size
        return buffer.toString('utf8', at - start - size, at - start)
    }
    // Sizes of the value types of GGUF that are numbers or booleans
    const SIZES: Record<number, number> = { 0: 1, 1: 1, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4, 7: 1, 10: 8, 11: 8, 12: 8 }
    const keys = new Map<string, string>()
    try {
        await need(24)
        if (buffer.toString('latin1', 0, 4) !== 'GGUF') {
            return undefined
        }
        at = 16
        for (let count = await readNumber(8); count > 0; count--) {
            const key = await readString()
            if (key.startsWith('tokenizer.') && !tokenizer) {
                break
            }
            const type = await readNumber(4)
            if (type === 8) {
                keys.set(key, await readString())
            } else if (type === 9) {
                const itemType = await readNumber(4)
                const items = await readNumber(8)
                if (itemType === 8) {
                    for (let item = 0; item < items; item++) {
                        const size = await readNumber(8)
                        at += size
                    }
                } else {
                    at += items * SIZES[itemType]
                }
            } else {
                await need(SIZES[type])
                keys.set(key, type === 7 ? String(buffer.readUInt8(at - start) !== 0) : '')
                at += SIZES[type]
            }
        }
    } catch {
        // A header cut short, as in a download not finished: the keys read so far are enough
    } finally {
        await handle.close()
    }
    return keys
}

/**
 * Whether a chat model can call tools, as an agent needs: its chat template (or one of its named templates, as
 * tokenizer.chat_template.tool_use) uses the tools it is given.
 */
async function callsTools(file: string): Promise<boolean> {
    const keys = await readHeaderKeys(file, true)
    return [...keys?.entries() ?? []].some(([key, value]) => key.startsWith('tokenizer.chat_template') && /\btools\b/.test(value))
}

/** The name, size label and kind of a GGUF file, from the keys of its header; an embedding model has a pooling type. */
async function readModelInfo(file: string): Promise<LocalModel | undefined> {
    const keys = await readHeaderKeys(file)
    if (!keys) {
        return undefined
    }
    const architecture = keys.get('general.architecture')
    return {
        file,
        // The file's name, unless it is as plain as model.gguf
        name: path.basename(file, path.extname(file)).toLowerCase() === 'model' ? keys.get('general.name') || path.basename(path.dirname(file)) : path.basename(file, path.extname(file)),
        sizeLabel: keys.get('general.size_label') || undefined,
        kind: architecture === undefined ? undefined : keys.has(`${architecture}.pooling_type`) ? 'embedding' : 'chat',
    }
}

/** Whether a GGUF file is a projector (mmproj), named mmproj-….gguf or ….mmproj-….gguf, which lets a model read images or audio. */
function isProjector(name: string): boolean {
    return /(^|[./_-])mmproj[._-]/i.test(name)
}

/** The quantisations of projectors, the first found chosen: nearly lossless, and smaller than the others. */
const PROJECTOR_QUANTS = ['q8_0', 'f16', 'bf16', 'f32']

/**
 * The projector beside a model file, which llama-server loads with it, and what it lets the model read besides text,
 * from its header; undefined when there is none. A repository has one model, so any projector in its folder is its own.
 */
export async function projectorOf(file: string): Promise<{ file: string; media: ModelMedia[] } | undefined> {
    const folder = path.dirname(file)
    const names = (await fs.promises.readdir(folder).catch(() => [] as string[])).filter((name) => isProjector(name) && /\.gguf$/i.test(name))
    const rank = (name: string) => {
        const found = PROJECTOR_QUANTS.findIndex((quant) => new RegExp(`[._-]${quant}\\.gguf$`, 'i').test(name))
        return found < 0 ? PROJECTOR_QUANTS.length : found
    }
    for (const name of names.sort((a, b) => rank(a) - rank(b))) {
        const keys = await readHeaderKeys(path.join(folder, name)).catch(() => undefined)
        if (keys?.get('general.architecture') === 'clip') {
            const media: ModelMedia[] = [...(keys.get('clip.has_vision_encoder') === 'true' ? ['image' as const] : []), ...(keys.get('clip.has_audio_encoder') === 'true' ? ['audio' as const] : [])]
            return { file: path.join(folder, name), media }
        }
    }
    return undefined
}

/** The GGUF files in a folder and the folders in it, but not the projectors (mmproj) or the second parts of split models. */
async function findModelFiles(folder: string, depth = 6): Promise<string[]> {
    let entries: fs.Dirent[]
    try {
        entries = await fs.promises.readdir(folder, { withFileTypes: true })
    } catch {
        return []
    }
    const found = await Promise.all(entries.map(async (entry) => {
        const file = path.join(folder, entry.name)
        if (entry.isDirectory() && depth > 0 && !entry.name.startsWith('.')) {
            return findModelFiles(file, depth - 1)
        }
        // The Hugging Face cache keeps its files as links to blobs
        const isFile = entry.isFile() || (entry.isSymbolicLink() && (await fs.promises.stat(file).catch(() => undefined))?.isFile())
        const model = isFile && /\.gguf$/i.test(entry.name) && !isProjector(entry.name) && !/-0000[2-9]-of-\d+\.gguf$/i.test(entry.name)
        return model ? [file] : []
    }))
    return found.flat()
}

/** The models on this computer, except the files that cannot be read. */
async function computerModels(): Promise<LocalModel[]> {
    const files = [...new Set((await Promise.all(modelFolders().map((folder) => findModelFiles(folder)))).flat())]
    const models = await Promise.all(files.map((file) => readModelInfo(file).catch(() => undefined)))
    return models.filter((model): model is LocalModel => !!model)
}

/** The models of a kind on this computer; a file whose kind cannot be read is offered for both. */
async function localModels(kind: ModelKind): Promise<LocalModel[]> {
    return (await computerModels()).filter((model) => (model.kind ?? kind) === kind)
}

/** The file a model field's value is on this computer: an `hf:` file in ~/.pollis/models, or the path itself. */
export function valueFile(value: string): string {
    return hubFile(value)?.local ?? value.trim().replace(/^~(?=$|[\\/])/, os.homedir())
}

/**
 * The models on this computer for Compose > Local Models > Models Installed, by name: each with its size in bytes,
 * whether Pollis downloaded it or it is in the Hugging Face cache, what it reads besides text, and the tiers of
 * Model Tasks and Routing that run on it.
 */
async function installedModels(): Promise<(LocalModel & { value: string; bytes: number; pollis: boolean; repository?: string; media: ModelMedia[]; tools?: boolean; tiers: string[] })[]> {
    const tierCells = vscode.workspace.getConfiguration('pollis.agents').get<Record<string, { model?: string }>>('tierCells', {})
    const tierFiles = Object.entries(tierCells).filter(([, cell]) => typeof cell?.model === 'string' && cell.model.startsWith('local:') && cell.model.length > 'local:'.length)
        .map(([tier, cell]) => ({ tier, file: path.resolve(valueFile(cell.model!.slice('local:'.length))) }))
    const models = await Promise.all((await computerModels()).map(async (model) => ({
        ...model,
        value: localValue(model.file),
        bytes: (await fs.promises.stat(model.file).catch(() => undefined))?.size ?? 0,
        pollis: model.file.startsWith(MODELS_DIR + path.sep),
        repository: repositoryOf(model.file),
        media: (await projectorOf(model.file))?.media ?? [],
        tools: model.kind === 'chat' ? await callsTools(model.file).catch(() => false) : undefined,
        tiers: tierFiles.filter((tier) => tier.file === path.resolve(model.file)).map((tier) => tier.tier),
    })))
    return models.sort((a, b) => a.name.localeCompare(b.name))
}

/** The Hugging Face repository of a model file, from its folder in ~/.pollis/models or in the Hugging Face cache. */
function repositoryOf(file: string): string | undefined {
    const parts = path.relative(MODELS_DIR, file).split(path.sep)
    if (parts[0] !== '..' && !path.isAbsolute(parts[0]) && parts.length >= 3) {
        return `${parts[0]}/${parts[1]}`
    }
    const match = /[\\/]models--(?<owner>[^\\/]+?)--(?<name>[^\\/]+)[\\/]snapshots[\\/]/.exec(file)
    return match?.groups ? `${match.groups.owner}/${match.groups.name}` : undefined
}

/**
 * The other GGUF files of a model's repository on Hugging Face, for Other Versions of Models Installed: each as an
 * `hf:` value with its size, whether it is a projector and whether it is on this computer already. Split models and
 * the drafts of multi-token prediction (mtp-) are left out.
 */
async function modelVersions(file: string): Promise<{ value: string; name: string; bytes: number; projector: boolean; installed: boolean }[] | { error: string }> {
    const repository = repositoryOf(file)
    if (!repository) {
        return { error: `${path.basename(file)} is not from a repository of Hugging Face.` }
    }
    const response = await fetch(`https://huggingface.co/api/models/${repository}/tree/main?recursive=true`).catch(() => undefined)
    if (!response?.ok) {
        return { error: response ? `Hugging Face answered ${response.status} for ${repository}.` : 'Hugging Face cannot be reached.' }
    }
    const entries = (await response.json()) as { type: string; path: string; size?: number; lfs?: { size?: number } }[]
    return entries
        .filter((entry) => entry.type === 'file' && /\.gguf$/i.test(entry.path) && !/-\d{5}-of-\d+\.gguf$/i.test(entry.path) && !/^mtp-/i.test(path.posix.basename(entry.path)))
        .map((entry) => {
            const name = path.posix.basename(entry.path)
            return {
                value: `hf:${repository}/${entry.path}`,
                name: name.replace(/\.gguf$/i, ''),
                bytes: entry.lfs?.size ?? entry.size ?? 0,
                projector: isProjector(name),
                installed: fs.existsSync(path.join(MODELS_DIR, ...repository.split('/'), ...entry.path.split('/'))) || fs.existsSync(path.join(path.dirname(file), name)),
            }
        })
        .sort((a, b) => Number(a.projector) - Number(b.projector) || a.bytes - b.bytes)
}

/** Downloads an `hf:` file into ~/.pollis/models, for Other Versions of Models Installed; true once it is there. */
async function downloadVersion(value: string): Promise<boolean> {
    try {
        await resolveModel(value)
        return true
    } catch (err) {
        vscode.window.showErrorMessage(err instanceof Error ? err.message : String(err))
        return false
    }
}

/** The models of a kind offered from Hugging Face, by the rules at the top of this file; looked up again after an hour. */
function hubModels(kind: ModelKind): Promise<HubModel[]> {
    const cached = g_hubModels.get(kind)
    if (cached && Date.now() - cached.time < 60 * 60 * 1000) {
        return cached.models
    }
    const models = searchHub(kind)
    models.catch(() => g_hubModels.delete(kind))
    g_hubModels.set(kind, { time: Date.now(), models })
    return models
}

async function searchHub(kind: ModelKind): Promise<HubModel[]> {
    type HubAnswer = { id: string; downloads?: number; lastModified?: string; pipeline_tag?: string; gguf?: { total?: number; architecture?: string; chat_template?: string } }
    const publishers = vscode.workspace.getConfiguration('pollis.localModels').get<string[]>('publishers', [])
    const oldest = Date.now() - MAX_AGE[kind] * 365 * 24 * 60 * 60 * 1000
    const answers = await Promise.all(publishers.flatMap((publisher) => SEARCHES[kind].map(async (search) => {
        const query = `author=${encodeURIComponent(publisher)}&filter=gguf&sort=downloads&direction=-1&${search}&expand[]=downloads&expand[]=lastModified&expand[]=pipeline_tag&expand[]=gguf`
        const response = await fetch(`https://huggingface.co/api/models?${query}`)
        return response.ok ? ((await response.json()) as HubAnswer[]) : []
    })))
    const isEmbedding = (model: HubAnswer) => EMBEDDING_TASKS.includes(model.pipeline_tag ?? '')
        || (!model.pipeline_tag && /embed|bert/i.test(`${model.id} ${model.gguf?.architecture ?? ''}`))
    const models = [...new Map(answers.flat().map((model) => [model.id, model])).values()].filter((model) => {
        const parameters = model.gguf?.total ?? 0
        const isKind = kind === 'embedding'
            ? isEmbedding(model)
            : !isEmbedding(model) && CHAT_TASKS.includes(model.pipeline_tag) && !!model.gguf?.chat_template
        return isKind && parameters > 0 && parameters <= MAX_PARAMETERS[kind] && Date.parse(model.lastModified ?? '') > oldest
    }).sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    // The same model converted by several publishers is offered once, from the one most downloaded
    const seen = new Set<string>()
    const offered: HubModel[] = []
    for (const model of models) {
        const base = model.id.split('/')[1].toLowerCase().replace(/^[^_]+_/, '').replace(/[-_.]?gguf$/, '')
        if (!seen.has(base) && offered.length < HUB_MODELS) {
            seen.add(base)
            offered.push({ id: model.id, downloads: model.downloads ?? 0, parameters: model.gguf?.total ?? 0 })
        }
    }
    return offered
}

/** The file of a Hugging Face repository to download for a kind: the first quantisation of QUANTS it has, else its smallest file. */
async function chooseHubFile(repo: string, kind: ModelKind): Promise<string> {
    const response = await fetch(`https://huggingface.co/api/models/${repo}/tree/main?recursive=true`)
    if (!response.ok) {
        throw new Error(`Hugging Face answered ${response.status} for ${repo}.`)
    }
    const files = ((await response.json()) as { type: string; path: string; size?: number }[])
        .filter((entry) => entry.type === 'file' && /\.gguf$/i.test(entry.path) && !isProjector(path.posix.basename(entry.path)) && !/-0000[2-9]-of-\d+\.gguf$/i.test(entry.path))
    for (const quant of QUANTS[kind]) {
        const file = files.find((entry) => new RegExp(`[-_.]${quant}(-0+1-of-\\d+)?\\.gguf$`, 'i').test(entry.path))
        if (file) {
            return file.path
        }
    }
    const smallest = files.sort((a, b) => (a.size ?? 0) - (b.size ?? 0))[0]
    if (!smallest) {
        throw new Error(`${repo} has no GGUF file.`)
    }
    return smallest.path
}

function shortCount(count: number): string {
    return count >= 1e6 ? `${(count / 1e6).toFixed(1)}M` : count >= 1e3 ? `${Math.round(count / 1e3)}k` : String(count)
}

function shortParameters(count: number): string {
    return count >= 1e9 ? `${(count / 1e9).toFixed(1).replace(/\.0$/, '')}B` : `${Math.round(count / 1e6)}M`
}

/** The value of a file on this computer: `hf:` for one downloaded into ~/.pollis/models, so that the code runs elsewhere, else its path. */
function localValue(file: string): string {
    const relative = path.relative(MODELS_DIR, file)
    const parts = relative.split(path.sep)
    return !relative.startsWith('..') && !path.isAbsolute(relative) && parts.length >= 3 ? `hf:${parts.join('/')}` : file
}

type PickerItem = vscode.QuickPickItem & { value?: string; repo?: string; addFile?: true }

async function chooseModel(kind: ModelKind, value: string): Promise<string | undefined> {
    const picker = vscode.window.createQuickPick<PickerItem>()
    picker.title = kind === 'chat' ? 'Choose a Chat Model' : 'Choose an Embedding Model'
    picker.placeholder = 'A model on this computer, a small one from Hugging Face (downloaded when chosen), or a GGUF file'
    picker.matchOnDescription = true
    picker.busy = true
    const addFile: PickerItem = { label: '$(file-add) Add Model File...', detail: 'A GGUF file on this computer, used where it is', addFile: true, alwaysShow: true }
    const current = value.trim()
    let local: PickerItem[] = []
    let hub: PickerItem[] = [{ label: 'Looking on Hugging Face...', alwaysShow: true }]
    // The repositories already downloaded into ~/.pollis/models, offered on this computer only
    const downloaded = new Set<string>()
    const show = () => {
        const sections: PickerItem[] = [
            { label: 'On This Computer', kind: vscode.QuickPickItemKind.Separator },
            ...local,
            { label: 'Hugging Face', kind: vscode.QuickPickItemKind.Separator },
            ...hub.filter((item) => !item.repo || !downloaded.has(item.repo)),
            { label: '', kind: vscode.QuickPickItemKind.Separator },
            addFile,
        ]
        picker.items = sections
        picker.activeItems = sections.filter((item) => item.value === current).slice(0, 1)
    }
    const lookups = [
        localModels(kind).then((models) => {
            local = models.map((model) => {
                const modelValue = localValue(model.file)
                if (modelValue.startsWith('hf:')) {
                    downloaded.add(modelValue.slice(3).split('/').slice(0, 2).join('/'))
                }
                return {
                    label: model.name,
                    description: [model.sizeLabel, model.kind ? undefined : 'kind unknown', modelValue === current ? 'current' : undefined].filter(Boolean).join(' · '),
                    value: modelValue,
                }
            })
            if (!local.length) {
                local = [{ label: 'No models yet', description: 'Choose one below', alwaysShow: true }]
            }
            show()
        }),
        hubModels(kind).then((models) => {
            hub = models.map((model) => ({
                label: model.id.split('/')[1],
                description: `${model.id.split('/')[0]} · ${shortParameters(model.parameters)} parameters · ${shortCount(model.downloads)} downloads last month`,
                repo: model.id,
            }))
            show()
        }, () => {
            hub = [{ label: 'Hugging Face could not be reached', description: 'Models on this computer and Add Model File... still work', alwaysShow: true }]
            show()
        }),
    ]
    show()
    void Promise.allSettled(lookups).then(() => { picker.busy = false })

    const chosen = await new Promise<PickerItem | undefined>((resolve) => {
        picker.onDidAccept(() => resolve(picker.selectedItems[0]))
        picker.onDidHide(() => resolve(undefined))
        picker.show()
    })
    picker.dispose()
    if (chosen?.addFile) {
        const files = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { 'GGUF model': ['gguf'] }, title: 'Add Model File' })
        return files?.[0]?.fsPath
    }
    if (chosen?.repo) {
        let file: string
        try {
            file = await chooseHubFile(chosen.repo, kind)
        } catch (err) {
            vscode.window.showErrorMessage(err instanceof Error ? err.message : String(err))
            return undefined
        }
        const hubValue = `hf:${chosen.repo}/${file}`
        // Downloaded now, while the code is written; if it is cancelled, the first run downloads it
        resolveModel(hubValue).catch((err) => vscode.window.showWarningMessage(`${err instanceof Error ? err.message : err} It is downloaded when the model is first used.`))
        return hubValue
    }
    return chosen?.value
}

/**
 * The memory a model can have now, in bytes: the free memory and the memory holding files, which the system gives back,
 * as each system counts it: on macOS what vm_stat does not count as used (app memory, wired and compressed), as Activity
 * Monitor does, os.freemem() counting only the free pages there; on Linux MemAvailable of /proc/meminfo; on Windows
 * os.freemem(), the available physical memory, standby pages included, as Task Manager shows it.
 */
export async function availableMemory(): Promise<number> {
    if (process.platform === 'darwin') {
        const stats = await new Promise<string>((resolve) => execFile('vm_stat', (err, stdout) => resolve(err ? '' : stdout)))
        const pageSize = Number(/page size of (?<bytes>\d+) bytes/.exec(stats)?.groups?.bytes)
        const pages = (name: string) => Number(new RegExp(`${name}:\\s+(?<pages>\\d+)`).exec(stats)?.groups?.pages)
        const used = pages('Anonymous pages') - pages('Pages purgeable') + pages('Pages wired down') + pages('Pages occupied by compressor')
        return Number.isFinite(used) && pageSize ? Math.max(0, os.totalmem() - used * pageSize) : os.freemem()
    }
    if (process.platform === 'linux') {
        const meminfo = await fs.promises.readFile('/proc/meminfo', 'utf8').catch(() => '')
        const kilobytes = Number(/^MemAvailable:\s+(?<kilobytes>\d+) kB/m.exec(meminfo)?.groups?.kilobytes)
        return Number.isFinite(kilobytes) ? kilobytes * 1024 : os.freemem()
    }
    return os.freemem()
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisChooseModel', (request: { kind: ModelKind; value?: string }) => chooseModel(request.kind, request.value ?? '')),
        vscode.commands.registerCommand('language-julia.pollisInstalledModels', () => installedModels()),
        vscode.commands.registerCommand('language-julia.pollisModelVersions', (file: string) => modelVersions(file)),
        vscode.commands.registerCommand('language-julia.pollisDownloadModel', (value: string) => downloadVersion(value)),
        vscode.commands.registerCommand('language-julia.pollisAvailableMemory', () => availableMemory()),
        vscode.commands.registerCommand('language-julia.pollisTotalMemory', () => os.totalmem())
    )
}
