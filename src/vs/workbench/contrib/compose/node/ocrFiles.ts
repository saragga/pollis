/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// allow-any-unicode-comment-file

// The work of OCR Files and Snippets (../common/ocrFiles.ts) that the page leaves to a process of its own: downloading
// a work's source into its folder, ~/.pollis/works/<id>/source, reading the words of its pages, and checking them
// against the dictionaries of its languages.
//
// The source folder holds `source.json`, what the source is and what it gave; `printed.json`, the printed number of
// each scan page; `pages/<page>.json`, the words of each page with their boxes and confidence; `images/<page>.jpg`, the
// page images, fetched when shown or all at once; and `copies/<identifier>.txt`, the text of other copies.
//
// The dictionaries are LibreOffice's, read by ./hunspell.ts, in ~/.pollis/dictionaries: a word is in a dictionary of
// one of the work's languages, or in a list of its period's spelling, or one of the work's own words. A word of a
// period whose spelling no list holds is looked up again spelled by the rules of the reforms since.

import { createHash } from 'crypto';
import { createReadStream, promises as fs } from 'fs';
import { homedir } from 'os';
import { gunzipSync } from 'zlib';
import { Emitter } from '../../../../base/common/event.js';
import { join } from '../../../../base/common/path.js';
import { IOcrCheck, IOcrContentsEntry, IOcrCopy, IOcrDisagreement, IOcrEbookPages, IOcrExtract, IOcrFiles, IOcrFlagged, IOcrPage, IOcrProgress, IOcrScanSize, IOcrSourceInfo, IOcrWord, OcrFlag } from '../common/ocrFiles.js';
import { Hunspell } from './hunspell.js';

const ARCHIVE = 'https://archive.org';
/** The width of the page images asked of the Internet Archive, which gives the nearest it has, 1385 pixels for a book. */
const IMAGE_WIDTH = 1000;
/** A word the dictionaries know is still flagged when the OCR's confidence in it is below this. */
const LOW_CONFIDENCE = 20;
/** The characters of a page of a Gutenberg ebook, which has no pages of its own. */
const GUTENBERG_PAGE = 3000;
/** The most suggestions given for a word. */
const SUGGESTIONS = 3;
/** The page images downloaded at the same time. */
const PARALLEL_IMAGES = 4;
/** How long a request may take, in milliseconds. */
const TIMEOUT = 120_000;

const DICTIONARY_BASE = 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/';

/** LibreOffice's dictionary of each language, by its path in LibreOffice's repository, without .aff and .dic. */
const DICTIONARIES: Readonly<Record<string, string>> = {
	af: 'af_ZA/af_ZA', bg: 'bg_BG/bg_BG', br: 'br_FR/br_FR', ca: 'ca/dictionaries/ca', cs: 'cs_CZ/cs_CZ', da: 'da_DK/da_DK',
	de: 'de/de_DE_frami', el: 'el_GR/el_GR', en: 'en/en_GB', eo: 'eo/eo', es: 'es/es_ES', et: 'et_EE/et_EE', fr: 'fr_FR/dictionaries/fr',
	gd: 'gd_GB/gd_GB', gl: 'gl/gl_ES', he: 'he_IL/he_IL', hr: 'hr_HR/hr_HR', hu: 'hu_HU/hu_HU', is: 'is/is', it: 'it_IT/it_IT',
	lt: 'lt_LT/lt', lv: 'lv_LV/lv_LV', nb: 'no/nb_NO', nl: 'nl_NL/nl_NL', nn: 'no/nn_NO', oc: 'oc_FR/oc_FR', pl: 'pl_PL/pl_PL',
	pt: 'pt_PT/pt_PT', 'pt-BR': 'pt_BR/pt_BR', ro: 'ro/ro_RO', ru: 'ru_RU/ru_RU', sk: 'sk_SK/sk_SK', sl: 'sl_SI/sl_SI',
	sv: 'sv_SE/dictionaries/sv_SE', uk: 'uk_UA/uk_UA',
};

/** Word lists of a period's spelling: a language's, for works before `before`, in a .tar.gz with its .aff and .dic. */
const PERIOD_LISTS: readonly { readonly language: string; readonly before: number; readonly name: string; readonly url: string }[] = [
	// European Portuguese before the Orthographic Agreement of 1990, from the Natura project of the University of Minho
	{ language: 'pt', before: 1990, name: 'pt_PT-preao', url: 'https://natura.di.uminho.pt/download/sources/Dictionaries/hunspell/LATEST/hunspell-pt_PT-preao-latest.tar.gz' },
];

/**
 * The spelling of a period that no list holds, as rules that respell a word of it the way of today: a word not in the
 * dictionaries is looked up again respelled by each rule, and by all of them, of the reforms after its year.
 */
const PERIOD_RULES: readonly { readonly language: string; readonly before: number; readonly rules: readonly (readonly [RegExp, string])[] }[] = [
	// Dutch before the spelling of Marchant (1934) and the Spelling Act of 1947: mensch, menschen, heeten, loopen
	{ language: 'nl', before: 1947, rules: [[/(?<=\p{L})sch(?=e|$)/gu, 's'], [/ee(?=[^aeiouy\s]e)/gu, 'e'], [/oo(?=[^aeiouy\s]e)/gu, 'o'], [/ph/gu, 'f']] },
	{ language: 'nl', before: 1900, rules: [[/ae/gu, 'aa'], [/y/gu, 'ij'], [/c(?=[aou])/gu, 'k']] },
	// German before the reform of 1996: daß, Schiffahrt; and before that of 1901: Theil, thun, Cultur, Centrum, studiren
	// allow-any-unicode-next-line
	{ language: 'de', before: 1996, rules: [[/ß(?=$|[^aeiouäöüy])/gu, 'ss'], [/([flmnprt])\1(?=[aeiouäöü])/gu, '$1$1$1']] },
	// allow-any-unicode-next-line
	{ language: 'de', before: 1902, rules: [[/(?<=\p{L}|^)th/gu, 't'], [/Th/gu, 'T'], [/C(?=[aou])/gu, 'K'], [/c(?=[aou])/gu, 'k'], [/C(?=[eiä])/gu, 'Z'], [/iren$/gu, 'ieren'], [/irt$/gu, 'iert']] },
	// Portuguese before the reform of 1911: pharmacia, theatro, lyrio, commercio, christão
	{ language: 'pt', before: 1911, rules: [[/ph/gu, 'f'], [/th/gu, 't'], [/y/gu, 'i'], [/([bcdfglmnpst])\1/gu, '$1'], [/ch(?=r)/gu, 'c']] },
	// French before the Academy's dictionary of 1835: j'avois, étoit, enfans, tems
	{ language: 'fr', before: 1835, rules: [[/oi(?=s$|t$|ent$)/gu, 'ai'], [/ans$/gu, 'ants'], [/ens$/gu, 'ents'], [/^tems$/gu, 'temps']] },
];

/**
 * The OCR's common confusions, each a reading and what it may stand for: é read as 6, è as £, c as e, rn as m, li as h,
 * the accents lost, ô read as ö, ç as q, the long s as f.
 */
const CONFUSIONS: readonly (readonly [string, readonly string[]])[] = [
	// allow-any-unicode-next-line
	['6', ['é', 'è']], ['£', ['é', 'è', 'f']], ['e', ['é', 'è', 'ê', 'c']], ['c', ['e', 'ç']], ['rn', ['m']], ['m', ['rn']], ['li', ['h']], ['h', ['li', 'b']],
	// allow-any-unicode-next-line
	['a', ['à', 'â']], ['ä', ['à', 'â', 'é']], ['o', ['ô', 'e']], ['ö', ['ô', 'é', 'ê']], ['u', ['ù', 'û', 'n']], ['ü', ['û', 'ù']], ['n', ['u']], ['i', ['î', 'l']],
	// allow-any-unicode-next-line
	['l', ['i', 't']], ['1', ['l', 'i']], ['I', ['l']], ['0', ['o', 'O']], ['q', ['ç', 'g']], ['f', ['s']], ['ii', ['ü', 'u']], ['cl', ['d']], ['vv', ['w']],
	['Y', ['V']], ['y', ['v']], ['t', ['l']], ['J', ['I']], ['b', ['h']], ['tl', ['d']], ['ni', ['m']], ['in', ['m']], ['ri', ['n']],
];

// allow-any-unicode-next-line
/** The accents a word may have lost, tried two at a time, as in societe for société. */
// allow-any-unicode-next-line
const ACCENTS = new Set(['é', 'è', 'ê', 'à', 'â', 'ô', 'ù', 'û', 'î', 'ç']);

/** The ligatures and old letters of a scan's text, as the dictionaries spell them. */
// allow-any-unicode-next-line
const LIGATURES: readonly (readonly [string, string])[] = [['ﬁ', 'fi'], ['ﬂ', 'fl'], ['ﬀ', 'ff'], ['ﬃ', 'ffi'], ['ﬄ', 'ffl'], ['ſ', 's'], ['\u00ad', '']];

/** The codes of languages, by their MARC codes and their English names, as the Internet Archive and Gutenberg give them. */
const LANGUAGE_CODES: Readonly<Record<string, string>> = {
	eng: 'en', english: 'en', fre: 'fr', fra: 'fr', french: 'fr', dut: 'nl', nld: 'nl', dutch: 'nl', ger: 'de', deu: 'de', german: 'de',
	por: 'pt', portuguese: 'pt', spa: 'es', spanish: 'es', ita: 'it', italian: 'it', lat: 'la', latin: 'la', dan: 'da', danish: 'da',
	swe: 'sv', swedish: 'sv', nor: 'nb', nob: 'nb', norwegian: 'nb', pol: 'pl', polish: 'pl', cze: 'cs', ces: 'cs', czech: 'cs',
	rus: 'ru', russian: 'ru', gre: 'el', ell: 'el', greek: 'el', hun: 'hu', hungarian: 'hu', rum: 'ro', ron: 'ro', romanian: 'ro',
	cat: 'ca', catalan: 'ca', hrv: 'hr', croatian: 'hr', slv: 'sl', slovenian: 'sl', slo: 'sk', slk: 'sk', slovak: 'sk', ukr: 'uk',
	ukrainian: 'uk', bul: 'bg', bulgarian: 'bg', glg: 'gl', galician: 'gl', est: 'et', estonian: 'et', lav: 'lv', latvian: 'lv',
	lit: 'lt', lithuanian: 'lt', ice: 'is', isl: 'is', icelandic: 'is', afr: 'af', afrikaans: 'af', heb: 'he', hebrew: 'he',
	oci: 'oc', occitan: 'oc', bre: 'br', breton: 'br', epo: 'eo', esperanto: 'eo', gla: 'gd',
};

/** A page's words as kept in its file: short keys, for files of a few hundred kilobytes. */
interface IStoredWord {
	/** The text, the box, the confidence, the line and the paragraph. */
	readonly t: string;
	readonly b: [number, number, number, number];
	readonly c?: number;
	readonly l: number;
	readonly p: number;
}

interface IStoredPage {
	readonly width: number;
	readonly height: number;
	readonly words: IStoredWord[];
}

/** What a source folder's source.json says. */
interface ISourceRecord {
	readonly kind: 'archive' | 'gutenberg' | 'pdf';
	readonly identifier: string;
	readonly info: IOcrSourceInfo;
}

/** A word of a text, where it is, and where its first piece is on the scan. */
interface ITextWord {
	readonly start: number;
	readonly end: number;
	readonly word: string;
	readonly page: number;
	readonly box?: [number, number, number, number];
	readonly confidence?: number;
}

/** The OCR Files process: the methods of IOcrFiles, for the page (../browser/ocrFilesPage.ts). */
export class OcrFiles implements IOcrFiles {

	private readonly _onDidProgress = new Emitter<IOcrProgress>();
	readonly onDidProgress = this._onDidProgress.event;

	/** The dictionaries read, by language or by period list, each read once. */
	private readonly dictionaries = new Map<string, Promise<Hunspell | undefined>>();
	/** The downloads of whole scans running, by folder. */
	private readonly downloads = new Map<string, AbortController>();
	/** The words of the pages read, by file, the latest few kept. */
	private readonly pageCache = new Map<string, IStoredPage>();

	// ---- Opening a work

	async openArchive(identifier: string, folder: string): Promise<IOcrSourceInfo> {
		await fs.mkdir(join(folder, 'pages'), { recursive: true });
		const metadata = await json(`${ARCHIVE}/metadata/${encodeURIComponent(identifier)}`) as IArchiveMetadata;
		if (!metadata?.metadata) {
			throw new Error(`The Internet Archive has no item ${identifier}.`);
		}
		const files = (metadata.files ?? []).map(file => file.name);
		const named = (suffix: string) => files.find(name => name.endsWith(suffix));
		const hocrName = named('_hocr.html');
		if (!hocrName) {
			throw new Error(`The Internet Archive's item ${identifier} has no text read from its scan (hOCR).`);
		}
		const download = (name: string) => `${ARCHIVE}/download/${encodeURIComponent(identifier)}/${encodeURIComponent(name)}`;
		const numbersName = named('_page_numbers.json');
		const tocName = named('_toc.xml');
		const numbers = numbersName ? await json(download(numbersName)).catch(() => undefined) as IArchivePageNumbers | undefined : undefined;
		const toc = tocName ? await text(download(tocName)).catch(() => undefined) : undefined;

		// The hOCR file, tens of megabytes, kept only until its pages are written
		const hocrFile = join(folder, 'hocr.html');
		const hocrSize = Number((metadata.files ?? []).find(file => file.name === hocrName)?.size) || 0;
		await this.downloadFile(download(hocrName), hocrFile, folder, 'text', hocrSize);
		this._onDidProgress.fire({ folder, phase: 'words', done: 0, total: 1 });
		const hocrPages = splitHocr(await fs.readFile(hocrFile, 'utf8'));
		// The scan's pages are those the Internet Archive shows, its page numbers' list, without the covers and colour cards
		const leaves = numbers?.pages?.length ? numbers.pages.map(page => page.leafNum) : hocrPages.map(page => page.leaf);
		const byLeaf = new Map(hocrPages.map(page => [page.leaf, page]));
		const printed: string[] = [];
		for (let index = 0; index < leaves.length; index++) {
			const page = byLeaf.get(leaves[index]) ?? { leaf: leaves[index], width: 0, height: 0, words: [] };
			await fs.writeFile(pageFile(folder, index + 1), JSON.stringify({ width: page.width, height: page.height, words: page.words }));
			printed.push(numbers?.pages?.[index]?.pageNumber ?? '');
			if (index % 50 === 0) {
				this._onDidProgress.fire({ folder, phase: 'words', done: index, total: leaves.length });
			}
		}
		await fs.writeFile(join(folder, 'printed.json'), JSON.stringify(printed));
		await fs.rm(hocrFile, { force: true });

		const meta = metadata.metadata;
		const title = first(meta.title)?.split(/\s*[;:]\s*/)[0];
		const volume = first(meta.volume);
		const info: IOcrSourceInfo = {
			title: title && volume ? `${title}, ${volume}` : title,
			author: authorName(first(meta.creator)),
			year: yearOf(first(meta.date)),
			languages: languageCodes(list(meta.language)),
			pages: leaves.length,
			contents: toc ? tocContents(toc, leaves, printed) : [],
			volume,
			images: true,
			offset: pageOffset(printed),
			summary: first(meta.description)?.length && first(meta.description)!.length > 40 ? first(meta.description) : undefined,
			summarySource: first(meta.description)?.length && first(meta.description)!.length > 40 ? `${ARCHIVE}/details/${identifier}` : undefined,
		};
		await fs.writeFile(join(folder, 'source.json'), JSON.stringify({ kind: 'archive', identifier, info } satisfies ISourceRecord));
		this._onDidProgress.fire({ folder, phase: 'words', done: leaves.length, total: leaves.length });
		return info;
	}

	async openGutenberg(ebook: number, folder: string): Promise<IOcrSourceInfo> {
		await fs.mkdir(join(folder, 'pages'), { recursive: true });
		// The Gutenberg site, and its mirror when the site is down for maintenance
		const digits = String(ebook);
		const mirror = gutenbergMirror(digits);
		const addresses = [`https://www.gutenberg.org/cache/epub/${digits}/pg${digits}.txt`, `${mirror}/${digits}-0.txt`, `${mirror}/${digits}.txt`];
		let content: string | undefined;
		for (const address of addresses) {
			content = await text(address).catch(() => undefined);
			if (content && /\*\*\*\s*START OF/i.test(content)) {
				break;
			}
		}
		if (!content) {
			throw new Error(`Project Gutenberg has no ebook ${ebook}, or could not be reached.`);
		}
		const header = (key: string) => new RegExp(`^${key}:\\s*(?<value>.+)$`, 'mi').exec(content!)?.groups?.value.trim();
		const start = content.search(/^\*\*\*\s*START OF.*$/mi);
		const end = content.search(/^\*\*\*\s*END OF.*$/mi);
		const body = content.slice(start >= 0 ? content.indexOf('\n', start) + 1 : 0, end > start ? end : undefined).replace(/\r\n?/g, '\n').trim();
		// Its pages: paragraphs gathered to about GUTENBERG_PAGE characters, the headings beginning the contents
		const paragraphs = body.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
		const pages: string[][] = [[]];
		let size = 0;
		const contents: { label: string; page: number }[] = [];
		for (const paragraph of paragraphs) {
			const heading = isHeading(paragraph);
			if ((size > GUTENBERG_PAGE || (heading && size > GUTENBERG_PAGE / 3)) && pages[pages.length - 1].length) {
				pages.push([]);
				size = 0;
			}
			if (heading) {
				contents.push({ label: paragraph.replace(/\s+/g, ' ').slice(0, 160), page: pages.length });
			}
			pages[pages.length - 1].push(paragraph);
			size += paragraph.length;
		}
		const printed: string[] = [];
		for (let index = 0; index < pages.length; index++) {
			const words: IStoredWord[] = [];
			let line = 0;
			pages[index].forEach((paragraph, p) => {
				for (const textLine of paragraph.split('\n')) {
					for (const word of textLine.split(/\s+/).filter(Boolean)) {
						words.push({ t: word, b: [0, 0, 0, 0], l: line, p });
					}
					line++;
				}
			});
			await fs.writeFile(pageFile(folder, index + 1), JSON.stringify({ width: 0, height: 0, words }));
			printed.push(String(index + 1));
		}
		await fs.writeFile(join(folder, 'printed.json'), JSON.stringify(printed));
		const release = header('Release Date');
		const info: IOcrSourceInfo = {
			title: header('Title'),
			author: header('Author'),
			year: yearOf(header('Original publication')),
			languages: languageCodes((header('Language') ?? '').split(/\s*(?:,|and)\s*/)),
			pages: pages.length,
			contents: rangesOf(contents, pages.length),
			images: false,
			summarySource: release ? `https://www.gutenberg.org/ebooks/${ebook}` : undefined,
		};
		await fs.writeFile(join(folder, 'source.json'), JSON.stringify({ kind: 'gutenberg', identifier: digits, info } satisfies ISourceRecord));
		return info;
	}

	async openPdf(folder: string, pdfInfo: string): Promise<IOcrSourceInfo> {
		await fs.mkdir(join(folder, 'pages'), { recursive: true });
		const layout = await fs.readFile(join(folder, 'text.html'), 'utf8').catch(() => '');
		const pages = splitBboxLayout(layout);
		const field = (key: string) => new RegExp(`^${key}:\\s*(?<value>.+)$`, 'mi').exec(pdfInfo)?.groups?.value.trim();
		const count = Math.max(pages.length, Number(field('Pages')) || 0);
		for (let index = 0; index < count; index++) {
			const page = pages[index] ?? { width: 0, height: 0, words: [] };
			await fs.writeFile(pageFile(folder, index + 1), JSON.stringify(page));
		}
		const printed = Array.from({ length: count }, (_, index) => String(index + 1));
		await fs.writeFile(join(folder, 'printed.json'), JSON.stringify(printed));
		const outline = await fs.readFile(join(folder, 'outline.xml'), 'utf8').catch(() => '');
		const entries = [...outline.matchAll(/<item\s+page="(?<page>\d+)"[^>]*>(?<label>[^<]*)<\/item>/g)]
			.map(match => ({ label: decodeEntities(match.groups!.label).trim(), page: Number(match.groups!.page) }))
			.filter(entry => entry.label && entry.page >= 1);
		const info: IOcrSourceInfo = {
			title: field('Title'),
			author: field('Author'),
			year: yearOf(field('CreationDate')),
			languages: [],
			pages: count,
			contents: rangesOf(entries, count),
			images: true,
		};
		await fs.writeFile(join(folder, 'source.json'), JSON.stringify({ kind: 'pdf', identifier: '', info } satisfies ISourceRecord));
		await fs.rm(join(folder, 'text.html'), { force: true });
		return info;
	}

	async fingerprint(path: string): Promise<string> {
		const hash = createHash('sha256');
		for await (const chunk of createReadStream(path)) {
			hash.update(chunk);
		}
		return hash.digest('hex');
	}

	// ---- Reading

	async page(folder: string, page: number, check: IOcrCheck, fetchImage: boolean): Promise<IOcrPage> {
		const source = await sourceOf(folder);
		const stored = await this.storedPage(folder, page);
		const printed = (await this.printedPages(folder))[page - 1] || undefined;
		const words = await this.checkWords(stored.words.map(word => ({ text: word.t, confidence: word.c })), check);
		let image: string | undefined = imageFile(folder, page);
		if (!await exists(image)) {
			image = fetchImage && source.kind === 'archive' ? await this.fetchImage(source.identifier, folder, page).catch(() => undefined) : undefined;
		}
		return {
			page,
			pages: source.info.pages,
			printed,
			width: stored.width,
			height: stored.height,
			image,
			words: stored.words.map((word, index): IOcrWord => ({
				text: word.t, box: word.b, confidence: word.c, line: word.l, paragraph: word.p,
				flag: words[index].flag, suggestions: words[index].suggestions,
			})),
		};
	}

	async printedPages(folder: string): Promise<readonly string[]> {
		return JSON.parse(await fs.readFile(join(folder, 'printed.json'), 'utf8').catch(() => '[]'));
	}

	async ebookPages(folder: string): Promise<IOcrEbookPages | undefined> {
		const source = await sourceOf(folder);
		if (source.kind !== 'gutenberg') {
			return undefined;
		}
		// The HTML version, at the Gutenberg site, or at its mirror when the site is down for maintenance
		const digits = source.identifier;
		let html: string | undefined;
		for (const address of [`https://www.gutenberg.org/cache/epub/${digits}/pg${digits}-images.html`, `${gutenbergMirror(digits)}/${digits}-h/${digits}-h.htm`]) {
			if (await reachable(address)) {
				html = address;
				break;
			}
		}
		if (!html) {
			return undefined;
		}
		const texts: string[] = [];
		for (let page = 1; page <= source.info.pages; page++) {
			const stored = JSON.parse(await fs.readFile(pageFile(folder, page), 'utf8').catch(() => '{"words":[]}')) as IStoredPage;
			texts.push(fragmentWords(stored.words).map(encodeURIComponent).join('&text='));
		}
		// The page's number in the query makes each page a page of its own to the browser, which goes to the words of a text
		// fragment when it loads a page, and not always when only the fragment changes
		return { url: `${html}?page={page}#:~:text={text}`, texts };
	}

	async extract(folder: string, pages: readonly number[], check: IOcrCheck): Promise<IOcrExtract> {
		const source = await sourceOf(folder);
		const stored: { page: number; data: IStoredPage }[] = [];
		for (const page of [...new Set(pages)].sort((a, b) => a - b)) {
			if (page >= 1 && page <= source.info.pages) {
				stored.push({ page, data: await this.storedPage(folder, page) });
			}
		}
		const { text, words } = joinPages(stored, await this.printedPages(folder));
		const checked = await this.checkWords(words.map(word => ({ text: word.word, confidence: word.confidence })), check);
		const flagged: IOcrFlagged[] = [];
		words.forEach((word, index) => {
			const flag = checked[index].flag;
			if (flag) {
				flagged.push({ start: word.start, end: word.end, word: word.word, page: word.page, box: word.box, confidence: word.confidence, flag, suggestions: checked[index].suggestions ?? [] });
			}
		});
		const images = [];
		for (const { page, data } of stored) {
			const image = imageFile(folder, page);
			images.push({ page, image: await exists(image) ? image : source.kind === 'archive' ? await this.fetchImage(source.identifier, folder, page).catch(() => undefined) : undefined, width: data.width, height: data.height });
		}
		// The first word of each page: where its text starts
		const pageStarts: { page: number; start: number }[] = [];
		for (const word of words) {
			if (pageStarts[pageStarts.length - 1]?.page !== word.page) {
				pageStarts.push({ page: word.page, start: word.start });
			}
		}
		return { text, flagged, images, pageStarts };
	}

	async checkText(content: string, check: IOcrCheck): Promise<readonly IOcrFlagged[]> {
		const words = [...content.matchAll(/[^\s]+/gu)].map(match => ({ start: match.index, end: match.index + match[0].length, word: match[0] }));
		const checked = await this.checkWords(words.map(word => ({ text: word.word })), check);
		return words.flatMap((word, index) => checked[index].flag ? [{ ...word, page: 0, flag: checked[index].flag!, suggestions: checked[index].suggestions ?? [] }] : []);
	}

	// ---- Other copies

	async otherCopies(identifier: string): Promise<readonly IOcrCopy[]> {
		const metadata = await json(`${ARCHIVE}/metadata/${encodeURIComponent(identifier)}/metadata`) as { result?: IArchiveMetadata['metadata'] };
		const meta = metadata?.result;
		const title = first(meta?.title)?.split(/\s*[;:]\s*/)[0];
		if (!meta || !title) {
			return [];
		}
		// The same title, and the same volume and year where the item has them
		const quoted = (value: string) => `"${value.replace(/["\\]/g, ' ')}"`;
		const query = [`title:(${quoted(title)})`, 'mediatype:texts', `NOT identifier:${quoted(identifier)}`];
		const creator = first(meta.creator)?.split(',')[0];
		if (creator) {
			query.push(`creator:(${quoted(creator)})`);
		}
		const url = `${ARCHIVE}/advancedsearch.php?q=${encodeURIComponent(query.join(' AND '))}&fl[]=identifier&fl[]=title&fl[]=volume&fl[]=date&fl[]=contributor&rows=50&output=json`;
		const found = await json(url) as { response?: { docs?: IArchiveDoc[] } };
		const volume = first(meta.volume);
		const year = yearOf(first(meta.date));
		const copies = (found?.response?.docs ?? []).map(doc => ({
			identifier: doc.identifier,
			title: first(doc.title) ?? doc.identifier,
			date: first(doc.date),
			volume: first(doc.volume),
			contributor: first(doc.contributor),
		}));
		// Only the copies of the same edition: the same volume and year, where the item has them
		return copies.filter(copy => (!volume || (!!copy.volume && normalVolume(copy.volume) === normalVolume(volume))) && (!year || !copy.date || yearOf(copy.date) === year));
	}

	async compare(folder: string, identifier: string, content: string, pages: readonly number[]): Promise<readonly IOcrDisagreement[]> {
		const copyFile = join(folder, 'copies', `${identifier.replace(/[^\w.-]/g, '_')}.txt`);
		let other = await fs.readFile(copyFile, 'utf8').catch(() => undefined);
		if (other === undefined) {
			await fs.mkdir(join(folder, 'copies'), { recursive: true });
			const metadata = await json(`${ARCHIVE}/metadata/${encodeURIComponent(identifier)}`) as IArchiveMetadata;
			const name = (metadata?.files ?? []).map(file => file.name).find(file => file.endsWith('_djvu.txt'));
			if (!name) {
				throw new Error(`The Internet Archive's item ${identifier} has no text.`);
			}
			this._onDidProgress.fire({ folder, phase: 'copy', done: 0, total: 1 });
			other = await text(`${ARCHIVE}/download/${encodeURIComponent(identifier)}/${encodeURIComponent(name)}`);
			await fs.writeFile(copyFile, other);
			this._onDidProgress.fire({ folder, phase: 'copy', done: 1, total: 1 });
		}
		const source = await sourceOf(folder);
		return disagreements(content, dehyphenate(other), pages, source.info.pages);
	}

	// ---- The scan's images

	async scanSize(folder: string): Promise<IOcrScanSize> {
		const source = await sourceOf(folder);
		const names = await fs.readdir(join(folder, 'images')).catch(() => [] as string[]);
		let bytes = 0;
		for (const name of names) {
			bytes += (await fs.stat(join(folder, 'images', name)).catch(() => undefined))?.size ?? 0;
		}
		let average = names.length ? bytes / names.length : 0;
		if (!average && source.kind === 'archive') {
			// One page fetched, the one in the middle, to know the size of the others
			const middle = Math.max(1, Math.round(source.info.pages / 2));
			const image = await this.fetchImage(source.identifier, folder, middle).catch(() => undefined);
			average = image ? (await fs.stat(image)).size : 0;
		}
		const statfs = await fs.statfs(folder).catch(() => undefined);
		return {
			pages: source.info.pages,
			fetched: names.length || (average ? 1 : 0),
			bytes: Math.round(average * source.info.pages),
			free: statfs ? statfs.bavail * statfs.bsize : undefined,
		};
	}

	async downloadScan(folder: string): Promise<IOcrScanSize> {
		const source = await sourceOf(folder);
		if (source.kind !== 'archive' || this.downloads.has(folder)) {
			return this.scanSize(folder);
		}
		const controller = new AbortController();
		this.downloads.set(folder, controller);
		try {
			const missing: number[] = [];
			for (let page = 1; page <= source.info.pages; page++) {
				if (!await exists(imageFile(folder, page))) {
					missing.push(page);
				}
			}
			let done = source.info.pages - missing.length;
			const next = async (): Promise<void> => {
				while (missing.length && !controller.signal.aborted) {
					const page = missing.shift()!;
					await this.fetchImage(source.identifier, folder, page, controller.signal).catch(() => undefined);
					this._onDidProgress.fire({ folder, phase: 'images', done: ++done, total: source.info.pages });
				}
			};
			await Promise.all(Array.from({ length: PARALLEL_IMAGES }, next));
		} finally {
			this.downloads.delete(folder);
		}
		return this.scanSize(folder);
	}

	async stopDownload(folder: string): Promise<void> {
		this.downloads.get(folder)?.abort();
	}

	private async fetchImage(identifier: string, folder: string, page: number, signal?: AbortSignal): Promise<string> {
		const file = imageFile(folder, page);
		await fs.mkdir(join(folder, 'images'), { recursive: true });
		await this.downloadFile(`${ARCHIVE}/download/${encodeURIComponent(identifier)}/page/n${page - 1}_w${IMAGE_WIDTH}.jpg`, file, undefined, 'images', 0, signal);
		return file;
	}

	/** Downloads `url` into `file`, through a temporary file, so that a file is either whole or not there. */
	private async downloadFile(url: string, file: string, folder: string | undefined, phase: IOcrProgress['phase'], size: number, signal?: AbortSignal): Promise<void> {
		const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT * 5)]) : AbortSignal.timeout(TIMEOUT * 5), redirect: 'follow' });
		if (!response.ok || !response.body) {
			throw new Error(`${url}: ${response.status} ${response.statusText}`);
		}
		const total = Number(response.headers.get('content-length')) || size;
		let done = 0;
		let reported = 0;
		const partial = `${file}.part`;
		const handle = await fs.open(partial, 'w');
		try {
			const reader = response.body.getReader();
			while (true) {
				const { done: ended, value } = await reader.read();
				if (ended) {
					break;
				}
				await handle.write(value);
				done += value.length;
				if (folder && done - reported > 1_000_000) {
					reported = done;
					this._onDidProgress.fire({ folder, phase, done, total });
				}
			}
		} catch (error) {
			await handle.close();
			await fs.rm(partial, { force: true });
			throw error;
		}
		await handle.close();
		await fs.rename(partial, file);
	}

	private async storedPage(folder: string, page: number): Promise<IStoredPage> {
		const file = pageFile(folder, page);
		const cached = this.pageCache.get(file);
		if (cached) {
			return cached;
		}
		const stored = JSON.parse(await fs.readFile(file, 'utf8').catch(() => '{"width":0,"height":0,"words":[]}')) as IStoredPage;
		this.pageCache.set(file, stored);
		if (this.pageCache.size > 40) {
			this.pageCache.delete(this.pageCache.keys().next().value!);
		}
		return stored;
	}

	// ---- The checks

	/** The flag and the suggestions of each word, by the work's dictionaries, period, own words and the OCR's confidence. */
	private async checkWords(words: readonly { readonly text: string; readonly confidence?: number }[], check: IOcrCheck): Promise<{ flag?: OcrFlag; suggestions?: string[] }[]> {
		const dictionaries = (await Promise.all(check.languages.map(language => this.dictionary(language)))).filter((dictionary): dictionary is Hunspell => !!dictionary);
		const periodLists = (await Promise.all(PERIOD_LISTS.filter(list => check.languages.includes(list.language) && check.year !== undefined && check.year < list.before).map(list => this.periodList(list.name, list.url))))
			.filter((dictionary): dictionary is Hunspell => !!dictionary);
		const rules = PERIOD_RULES.filter(period => check.languages.includes(period.language) && check.year !== undefined && check.year < period.before).flatMap(period => period.rules);
		const own = new Set(check.words.map(word => word.toLocaleLowerCase()));
		const known = new Map<string, boolean>();
		const isKnown = (word: string): boolean => {
			let result = known.get(word);
			if (result === undefined) {
				result = own.has(word.toLocaleLowerCase()) || dictionaries.some(dictionary => dictionary.correct(word)) || periodLists.some(dictionary => dictionary.correct(word));
				known.set(word, result);
			}
			return result;
		};
		const accepted = (word: string): boolean => isKnown(word)
			// A word with hyphens, each part known: peut-être, As-tu
			|| (word.includes('-') && word.split('-').every(part => !part || isKnown(part)))
			|| (rules.length > 0 && respellings(word, rules).some(isKnown));
		const results = new Map<string, { flag?: OcrFlag; suggestions?: string[] }>();
		return words.map(({ text, confidence }) => {
			const word = checkable(text);
			if (!word) {
				return {};
			}
			// A language without a dictionary: only the OCR's confidence
			if (!dictionaries.length) {
				return confidence !== undefined && confidence < LOW_CONFIDENCE ? { flag: 'confidence' } : {};
			}
			const key = `${word}\u0000${confidence !== undefined && confidence < LOW_CONFIDENCE ? 'low' : ''}`;
			let result = results.get(key);
			if (!result) {
				if (accepted(word)) {
					result = confidence !== undefined && confidence < LOW_CONFIDENCE ? { flag: 'confidence' } : {};
				} else {
					result = { flag: 'dictionary', suggestions: suggestions(word, accepted) };
				}
				results.set(key, result);
			}
			return result;
		});
	}

	/** The dictionary of `language`, downloaded into ~/.pollis/dictionaries the first time; none for a language without one. */
	private dictionary(language: string): Promise<Hunspell | undefined> {
		const path = DICTIONARIES[language] ?? DICTIONARIES[language.split('-')[0]];
		if (!path) {
			return Promise.resolve(undefined);
		}
		let dictionary = this.dictionaries.get(path);
		if (!dictionary) {
			dictionary = (async () => {
				const folder = join(homedir(), '.pollis', 'dictionaries');
				const name = path.split('/').pop()!;
				const aff = join(folder, `${name}.aff`);
				const dic = join(folder, `${name}.dic`);
				if (!await exists(aff) || !await exists(dic)) {
					await fs.mkdir(folder, { recursive: true });
					this._onDidProgress.fire({ folder, phase: 'dictionary', done: 0, total: 1 });
					await this.downloadFile(`${DICTIONARY_BASE}${path}.aff`, aff, undefined, 'dictionary', 0);
					await this.downloadFile(`${DICTIONARY_BASE}${path}.dic`, dic, undefined, 'dictionary', 0);
					this._onDidProgress.fire({ folder, phase: 'dictionary', done: 1, total: 1 });
				}
				return readDictionary(await fs.readFile(aff), await fs.readFile(dic));
			})().catch(() => {
				this.dictionaries.delete(path);
				return undefined;
			});
			this.dictionaries.set(path, dictionary);
		}
		return dictionary;
	}

	/** A list of a period's spelling, downloaded and taken out of its .tar.gz the first time. */
	private periodList(name: string, url: string): Promise<Hunspell | undefined> {
		let dictionary = this.dictionaries.get(name);
		if (!dictionary) {
			dictionary = (async () => {
				const folder = join(homedir(), '.pollis', 'dictionaries');
				const aff = join(folder, `${name}.aff`);
				const dic = join(folder, `${name}.dic`);
				if (!await exists(aff) || !await exists(dic)) {
					await fs.mkdir(folder, { recursive: true });
					const archive = join(folder, `${name}.tar.gz`);
					await this.downloadFile(url, archive, undefined, 'dictionary', 0);
					const entries = untar(gunzipSync(await fs.readFile(archive)));
					const affEntry = entries.find(entry => entry.name.endsWith(`${name}.aff`));
					const dicEntry = entries.find(entry => entry.name.endsWith(`${name}.dic`));
					if (!affEntry || !dicEntry) {
						throw new Error(`${url} has no ${name}.aff and ${name}.dic`);
					}
					await fs.writeFile(aff, affEntry.data);
					await fs.writeFile(dic, dicEntry.data);
					await fs.rm(archive, { force: true });
				}
				return readDictionary(await fs.readFile(aff), await fs.readFile(dic));
			})().catch(() => {
				this.dictionaries.delete(name);
				return undefined;
			});
			this.dictionaries.set(name, dictionary);
		}
		return dictionary;
	}
}

// ---- Sources

interface IArchiveMetadata {
	readonly metadata?: {
		readonly title?: string | string[];
		readonly creator?: string | string[];
		readonly date?: string | string[];
		readonly language?: string | string[];
		readonly volume?: string | string[];
		readonly description?: string | string[];
	};
	readonly files?: readonly { readonly name: string; readonly size?: string }[];
}

interface IArchivePageNumbers {
	readonly pages?: readonly { readonly leafNum: number; readonly pageNumber: string; readonly pageProb: number | null }[];
}

interface IArchiveDoc {
	readonly identifier: string;
	readonly title?: string | string[];
	readonly date?: string | string[];
	readonly volume?: string | string[];
	readonly contributor?: string | string[];
}

async function sourceOf(folder: string): Promise<ISourceRecord> {
	const record = await fs.readFile(join(folder, 'source.json'), 'utf8').catch(() => undefined);
	if (!record) {
		throw new Error('The work\'s source is not on this computer: open the work again.');
	}
	return JSON.parse(record) as ISourceRecord;
}

function pageFile(folder: string, page: number): string {
	return join(folder, 'pages', `${String(page).padStart(4, '0')}.json`);
}

function imageFile(folder: string, page: number): string {
	return join(folder, 'images', `${String(page).padStart(4, '0')}.jpg`);
}

async function exists(path: string): Promise<boolean> {
	return fs.access(path).then(() => true, () => false);
}

/** Where the mirror of Project Gutenberg keeps an ebook's files: gutenberg.pglaf.org/1/3/4/1342 for ebook 1342. */
function gutenbergMirror(digits: string): string {
	return `https://gutenberg.pglaf.org/${digits.length > 1 ? digits.slice(0, -1).split('').join('/') : '0'}/${digits}`;
}

/** Whether there is a file at `url`. */
async function reachable(url: string): Promise<boolean> {
	try {
		return (await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30_000), redirect: 'follow' })).ok;
	} catch {
		return false;
	}
}

/**
 * Words that begin a page, as a text fragment finds them in the HTML version of an ebook: of the first three runs of six to
 * ten words of one paragraph that are letters only, from its second word on, the two longest, the longer first. Without
 * punctuation, the quotes and underscores of the plain text, which the HTML version writes otherwise, are not in them, nor,
 * without a paragraph's first word, the first letter of a chapter, which an illustrated edition draws as a picture. The
 * browser goes to the first it finds: the longer, as the less likely to be found earlier in the ebook, and the other for a
 * page whose first is broken in the HTML version by a printed page's number. A page without such a run has its longest run
 * of three words or more, and a page without that has none.
 */
function fragmentWords(words: readonly IStoredWord[]): string[] {
	const runs: string[] = [];
	let run: string[] = [];
	let longest: string[] = [];
	let paragraph: number | undefined;
	const end = () => {
		if (run.length >= 6) {
			runs.push(run.join(' '));
		} else if (run.length > longest.length) {
			longest = run;
		}
		run = [];
	};
	for (const word of words) {
		const clean = /^\p{L}+$/u.test(word.t);
		if (!clean || word.p !== paragraph) {
			end();
			if (runs.length === 3) {
				break;
			}
			if (word.p !== paragraph) {
				paragraph = word.p;
				continue;
			}
		}
		if (clean) {
			run.push(word.t);
			if (run.length === 10) {
				end();
				if (runs.length === 3) {
					break;
				}
			}
		}
	}
	end();
	if (!runs.length) {
		return longest.length >= 3 ? [longest.join(' ')] : [];
	}
	// The longest first, and of two as long, the one nearer the page's start
	return runs.slice(0, 3).map((text, index) => ({ text, index, length: text.split(' ').length })).sort((x, y) => y.length - x.length || x.index - y.index).slice(0, 2).map(entry => entry.text);
}

async function text(url: string): Promise<string> {
	const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT), redirect: 'follow' });
	if (!response.ok) {
		throw new Error(`${url}: ${response.status} ${response.statusText}`);
	}
	return response.text();
}

async function json(url: string): Promise<unknown> {
	return JSON.parse(await text(url));
}

function first(value: string | readonly string[] | undefined): string | undefined {
	return (Array.isArray(value) ? value[0] : value as string | undefined)?.trim() || undefined;
}

function list(value: string | readonly string[] | undefined): string[] {
	return Array.isArray(value) ? [...value] : typeof value === 'string' ? value.split(/[;,]/) : [];
}

/** `Gogh, Vincent van, 1853-1890` as Vincent van Gogh. */
function authorName(creator: string | undefined): string | undefined {
	if (!creator) {
		return undefined;
	}
	const parts = creator.split(',').map(part => part.trim()).filter(part => part && !/\d{3,4}/.test(part));
	return parts.length === 2 ? `${parts[1]} ${parts[0]}` : parts.join(', ') || undefined;
}

function yearOf(date: string | undefined): number | undefined {
	const year = /\b(?<year>1[0-9]{3}|20[0-9]{2})\b/.exec(date ?? '')?.groups?.year;
	return year ? Number(year) : undefined;
}

function languageCodes(names: readonly string[]): string[] {
	const codes = names.map(name => {
		const key = name.trim().toLowerCase();
		return LANGUAGE_CODES[key] ?? (/^[a-z]{2}(-[A-Z]{2})?$/.test(name.trim()) ? name.trim() : undefined);
	}).filter((code): code is string => !!code);
	return [...new Set(codes)];
}

function normalVolume(volume: string): string {
	return volume.toLowerCase().replace(/[^0-9]/g, '');
}

/** The usual difference between a scan page and its printed number, by the pages whose number is known. */
function pageOffset(printed: readonly string[]): number | undefined {
	const differences = printed.map((label, index) => /^\d+$/.test(label) ? index + 1 - Number(label) : undefined).filter((difference): difference is number => difference !== undefined).sort((a, b) => a - b);
	return differences.length ? differences[Math.floor(differences.length / 2)] : undefined;
}

/** A heading of a Gutenberg ebook: a short paragraph in capitals, or one that names a chapter, a letter or a part. */
function isHeading(paragraph: string): boolean {
	const line = paragraph.replace(/\s+/g, ' ').trim();
	if (line.length > 120 || paragraph.includes('\n\n')) {
		return false;
	}
	// allow-any-unicode-next-line
	if (/^(chapter|chapitre|capítulo|capitolo|kapitel|hoofdstuk|book|livre|livro|libro|buch|part|partie|parte|teil|letter|lettre|carta|lettera|brief|canto|act|acte|scene|scène)\b/i.test(line)) {
		return true;
	}
	const letters = line.replace(/[^\p{L}]/gu, '');
	return letters.length >= 3 && letters === letters.toLocaleUpperCase() && letters !== letters.toLocaleLowerCase();
}

/** Contents entries from headings and their pages: each from its page to the page before the next. */
function rangesOf(entries: readonly { label: string; page: number }[], pages: number): IOcrContentsEntry[] {
	return entries.map((entry, index) => {
		const next = entries[index + 1]?.page;
		const last = next === undefined ? pages : Math.max(entry.page, next - 1);
		return { label: entry.label, pages: last === entry.page ? String(entry.page) : `${entry.page}-${last}` };
	});
}

/** The word for a page of a contents page, before its number: `Pag.`, `S.`, `Blz.`. */
// allow-any-unicode-next-line
const PAGE_WORD = /^(?:Pag|Page|Pág|Blz|Seite|S|p|pp)\.?$/i;

/**
 * The contents of the Internet Archive's _toc.xml, the OCR of the book's contents page, as entries with printed pages.
 * An entry keeps the page the Internet Archive found for it, its leaf a page of that printed number. An entry it did not
 * find points at the contents page itself, its number often a letter's; its page is then the number that heads the next
 * entry, where the OCR of a contents page often runs it, kept only when the scan has a page of that number in the order
 * of the entries around it. An entry of only a dash and a number ends the range of letters of the entry before it.
 */
function tocContents(toc: string, leaves: readonly number[], printed: readonly string[]): IOcrContentsEntry[] {
	const offset = pageOffset(printed) ?? 0;
	const scanOf = (label: string) => {
		const index = printed.indexOf(label);
		return index >= 0 ? index + 1 : undefined;
	};
	type Entry = { label: string; scan?: number; found: boolean; lead?: string };
	const entries: Entry[] = [];
	for (const match of toc.matchAll(/<entry>(?<entry>[\s\S]*?)<\/entry>/g)) {
		const entry = match.groups!.entry;
		const page = leaves.indexOf(Number(/<leaf>(?<leaf>\d+)<\/leaf>/.exec(entry)?.groups?.leaf)) + 1;
		const name = /<name>(?<name>[^<]*)<\/name>/.exec(entry)?.groups?.name.trim() ?? '';
		const words = [...entry.matchAll(/<text>(?<text>[^<]*)<\/text>/g)].map(word => decodeEntities(word.groups!.text).trim()).filter(Boolean).join(' ').split(/\s+/).filter(Boolean);
		const found = page > 0 && !!name && (printed[page - 1] === name || (!printed[page - 1] && String(page - offset) === name));
		// The words before the label: dots, quotes and dashes, and the page of the entry before, run into this line
		const first = words.findIndex(word => /\p{L}/u.test(word) && !PAGE_WORD.test(word));
		const lead = (first < 0 ? words : words.slice(0, first)).filter(word => /^\d+$/.test(word)).pop();
		if (first < 0) {
			// A dash and a number alone: the end of the range of letters of the entry before
			const previous = entries[entries.length - 1];
			if (previous && !found && /^\d+$/.test(name) && /\d$/.test(previous.label)) {
				previous.label = `${previous.label}—${name}`;
			}
			continue;
		}
		// The heading of the contents page in capitals, the dots, quotes and dashes of its lines, and its `Pag.`
		let label = words.slice(first).join(' ')
			.replace(/^(?:[\p{Lu}\d]{2,}\s+){2,}/u, '')
			// allow-any-unicode-next-line
			.replace(/\s+(?:Pag|Page|Pág|S|Seite|Blz|p)\.?$/u, '')
			// allow-any-unicode-next-line
			.replace(/^[\s,.„"“”'—–-]+|[\s,.„"“”'—–-]+$/gu, '')
			.replace(/\s{2,}/g, ' ');
		if (!found && name) {
			label = `${label} ${name}`.trim();
		}
		if (label) {
			entries.push({ label: label.slice(0, 200), scan: found ? page : undefined, found, lead });
		}
	}
	// The pages of the entries not found, from the number heading the next entry, in the order of the entries
	let before = 0;
	entries.forEach((entry, index) => {
		if (entry.scan === undefined) {
			const candidate = entries[index + 1]?.lead;
			const scan = candidate !== undefined ? scanOf(candidate) : undefined;
			const after = entries.slice(index + 1).find(item => item.found)?.scan ?? Number.MAX_SAFE_INTEGER;
			if (scan !== undefined && scan >= before && scan <= after) {
				entry.scan = scan;
			}
		}
		before = entry.scan ?? before;
	});
	// The letters, or other numbered units, of an entry: the range or the number its label ends with
	const unitsOf = (label: string): [number, number] | undefined => {
		// allow-any-unicode-next-line
		const range = /(?<from>\d+)\s*[—–-]\s*(?<to>\d+)\D*$/.exec(label)?.groups;
		if (range && Number(range.to) > Number(range.from)) {
			return [Number(range.from), Number(range.to)];
		}
		const single = /(?<unit>\d+)\D*$/.exec(label)?.groups?.unit;
		return single ? [Number(single), Number(single)] : undefined;
	};
	const lastPrinted = printed.reduce((last, label, index) => /^\d+$/.test(label) ? index + 1 : last, printed.length);
	return entries.map((entry, index) => {
		if (entry.scan === undefined) {
			return { label: entry.label, pages: '' };
		}
		// An entry that names a range of letters holds the entries of the letters in it, and ends where the first other begins
		const units = unitsOf(entry.label);
		const holds = (other: Entry) => {
			const inner = unitsOf(other.label);
			return !!units && units[1] > units[0] && !!inner && inner[0] >= units[0] && inner[1] <= units[1];
		};
		const next = entries.slice(index + 1).find(other => !holds(other));
		const from = printed[entry.scan - 1] || String(entry.scan - offset);
		if (next && next.scan === undefined) {
			return { label: entry.label, pages: `${from}-` };
		}
		const last = next ? Math.max(entry.scan, next.scan! - 1) : Math.max(entry.scan, lastPrinted);
		const to = printed[last - 1] || String(last - offset);
		return { label: entry.label, pages: last === entry.scan ? from : `${from}-${to}` };
	});
}

/** The pages of an hOCR file: each with its leaf, its size, and its words with their boxes, confidence, line and paragraph. */
function splitHocr(hocr: string): { leaf: number; width: number; height: number; words: IStoredWord[] }[] {
	const pages: { leaf: number; width: number; height: number; words: IStoredWord[] }[] = [];
	let current: { leaf: number; width: number; height: number; words: IStoredWord[] } | undefined;
	let line = -1;
	let paragraph = -1;
	const pattern = /<(?:div|p|span)\s+class="(?<kind>ocr_page|ocr_par|ocr_line|ocrx_word)"[^>]*?title="(?<title>[^"]*)"[^>]*>(?<rest>[^<]*)/g;
	for (const match of hocr.matchAll(pattern)) {
		const { kind, title, rest } = match.groups!;
		if (kind === 'ocr_page') {
			const box = boxOf(title);
			const leaf = Number(/ppageno (?<leaf>\d+)/.exec(title)?.groups?.leaf ?? pages.length);
			current = { leaf, width: box?.[2] ?? 0, height: box?.[3] ?? 0, words: [] };
			pages.push(current);
			line = -1;
			paragraph = -1;
		} else if (kind === 'ocr_par') {
			paragraph++;
		} else if (kind === 'ocr_line') {
			line++;
		} else if (current) {
			const word = decodeEntities(rest).trim();
			const box = boxOf(title);
			const confidence = /x_wconf (?<confidence>\d+)/.exec(title)?.groups?.confidence;
			if (word && box) {
				current.words.push({ t: word, b: box, c: confidence === undefined ? undefined : Number(confidence), l: Math.max(0, line), p: Math.max(0, paragraph) });
			}
		}
	}
	return pages;
}

/** The pages of pdftotext -bbox-layout: blocks as paragraphs, their lines and words, in the PDF's points. */
function splitBboxLayout(layout: string): IStoredPage[] {
	const pages: IStoredPage[] = [];
	for (const pageMatch of layout.matchAll(/<page\s+width="(?<width>[\d.]+)"\s+height="(?<height>[\d.]+)">(?<body>[\s\S]*?)<\/page>/g)) {
		const words: IStoredWord[] = [];
		let line = -1;
		let paragraph = -1;
		for (const match of pageMatch.groups!.body.matchAll(/<(?<kind>block|line|word)\b(?<attributes>[^>]*)>(?<rest>[^<]*)/g)) {
			const { kind, attributes, rest } = match.groups!;
			if (kind === 'block') {
				paragraph++;
			} else if (kind === 'line') {
				line++;
			} else {
				const value = (name: string) => Number(new RegExp(`${name}="(?<value>[\\d.]+)"`).exec(attributes)?.groups?.value ?? 0);
				const word = decodeEntities(rest).trim();
				if (word) {
					words.push({ t: word, b: [value('xMin'), value('yMin'), value('xMax'), value('yMax')], l: Math.max(0, line), p: Math.max(0, paragraph) });
				}
			}
		}
		pages.push({ width: Number(pageMatch.groups!.width), height: Number(pageMatch.groups!.height), words });
	}
	return pages;
}

function boxOf(title: string): [number, number, number, number] | undefined {
	const match = /bbox (?<x0>\d+) (?<y0>\d+) (?<x1>\d+) (?<y1>\d+)/.exec(title);
	return match?.groups ? [Number(match.groups.x0), Number(match.groups.y0), Number(match.groups.x1), Number(match.groups.y1)] : undefined;
}


/** The named entities of the hOCR and contents files. */
const NAMED_ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ' };

function decodeEntities(value: string): string {
	return value.replace(/&(?:#(?<decimal>\d+)|#x(?<hex>[0-9a-f]+)|(?<name>amp|lt|gt|quot|apos|nbsp));/gi, (whole, ...args) => {
		const groups = args[args.length - 1] as { decimal?: string; hex?: string; name?: string };
		if (groups.decimal) {
			return String.fromCodePoint(Number(groups.decimal));
		}
		if (groups.hex) {
			return String.fromCodePoint(parseInt(groups.hex, 16));
		}
		return NAMED_ENTITIES[groups.name!.toLowerCase()] ?? whole;
	});
}

/** The files of a tar archive, its 512-byte headers each followed by the file. */
function untar(archive: Buffer): { name: string; data: Buffer }[] {
	const files: { name: string; data: Buffer }[] = [];
	let offset = 0;
	while (offset + 512 <= archive.length) {
		const header = archive.subarray(offset, offset + 512);
		const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/s, '');
		if (!name) {
			break;
		}
		const size = parseInt(header.subarray(124, 136).toString('utf8').replace(/\0.*$/s, '').trim() || '0', 8);
		const type = String.fromCharCode(header[156]);
		const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/s, '');
		if (type === '0' || type === '\0') {
			files.push({ name: prefix ? `${prefix}/${name}` : name, data: archive.subarray(offset + 512, offset + 512 + size) });
		}
		offset += 512 + Math.ceil(size / 512) * 512;
	}
	return files;
}

function readDictionary(aff: Buffer, dic: Buffer): Hunspell {
	const decoder = new TextDecoder(Hunspell.encoding(aff.subarray(0, 4000).toString('latin1')));
	return new Hunspell(decoder.decode(aff), decoder.decode(dic));
}

// ---- Text

/**
 * The text of pages: their paragraphs, with the lines of each joined and a word broken at a line's end by a hyphen made
 * whole; a paragraph that runs on to the next page joined to it; the lines that are only a page's number left out.
 */
function joinPages(pages: readonly { page: number; data: IStoredPage }[], printed: readonly string[]): { text: string; words: ITextWord[] } {
	type Piece = { word: string; page: number; box?: [number, number, number, number]; confidence?: number };
	const paragraphs: Piece[][] = [];
	// The first part of a word broken by a hyphen at the end of a line, or of a page, which the next line ends
	let carry: Piece | undefined;
	for (const { page, data } of pages) {
		const lines = new Map<number, IStoredWord[]>();
		for (const word of data.words) {
			const lineWords = lines.get(word.l) ?? [];
			lineWords.push(word);
			lines.set(word.l, lineWords);
		}
		const pageNumber = printed[page - 1];
		const all = [...lines.keys()].sort((a, b) => a - b);
		// The first or last line when it is the page's number, or a running head of a few words in capitals
		const kept = all.filter((number, index) => {
			if (index !== 0 && index !== all.length - 1) {
				return true;
			}
			const lineText = lines.get(number)!.map(word => word.t).join(' ').trim();
			const bare = lineText.replace(/[^\p{L}\p{N}]/gu, '');
			return !(/^\d{1,4}$/.test(bare) || (pageNumber && bare === pageNumber) || (index === 0 && all.length > 3 && isRunningHead(lineText, pageNumber)));
		});
		let paragraph: number | undefined;
		kept.forEach((number, index) => {
			const lineWords = lines.get(number)!;
			if (lineWords[0].p !== paragraph) {
				paragraph = lineWords[0].p;
				const previous = paragraphs[paragraphs.length - 1];
				const last = previous?.[previous.length - 1];
				// A page's first paragraph, in lower case after one that did not end a sentence, goes on from it
				// allow-any-unicode-next-line
				const runsOn = index === 0 && !!last && !/[.!?:;»”"')]$/.test(last.word) && /^\p{Ll}/u.test(lineWords[0].t);
				if (!carry && !runsOn) {
					paragraphs.push([]);
				}
			}
			if (!paragraphs.length) {
				paragraphs.push([]);
			}
			const target = paragraphs[paragraphs.length - 1];
			lineWords.forEach((word, position) => {
				let piece: Piece = { word: word.t, page, box: word.b, confidence: word.c };
				if (carry) {
					piece = { ...carry, word: carry.word + word.t, confidence: Math.min(carry.confidence ?? 100, word.c ?? 100) };
					carry = undefined;
				}
				// A word broken at the line's end, not one in capitals with a hyphen of its own
				// allow-any-unicode-next-line
				if (position === lineWords.length - 1 && /\p{L}[-¬]$/u.test(piece.word) && !/^\p{Lu}+[-¬]$/u.test(piece.word)) {
					carry = { ...piece, word: piece.word.slice(0, -1) };
					return;
				}
				target.push(piece);
			});
		});
	}
	if (carry) {
		// The last word of the last page, its hyphen given back
		paragraphs[paragraphs.length - 1]?.push({ ...carry, word: `${carry.word}-` });
	}
	let text = '';
	const words: ITextWord[] = [];
	for (const paragraph of paragraphs.filter(item => item.length)) {
		if (text) {
			text += '\n\n';
		}
		paragraph.forEach((word, index) => {
			if (index) {
				text += ' ';
			}
			words.push({ start: text.length, end: text.length + word.word.length, word: word.word, page: word.page, box: word.box, confidence: word.confidence });
			text += word.word;
		});
	}
	return { text, words };
}

function isRunningHead(line: string, pageNumber: string | undefined): boolean {
	const words = line.split(/\s+/).filter(Boolean);
	const letters = line.replace(/[^\p{L}]/gu, '');
	return words.length <= 6 && letters.length >= 3 && letters === letters.toLocaleUpperCase() && (!!pageNumber && line.includes(pageNumber) || /\d/.test(line) || words.length <= 4);
}

/** A text's words broken at a line's end by a hyphen made whole, as the Internet Archive's plain text has them. */
function dehyphenate(content: string): string {
	// allow-any-unicode-next-line
	return content.replace(/(?<=\p{L})[-¬]\s*\n\s*(?=\p{Ll})/gu, '');
}

/** The word as the dictionaries take it: without the punctuation around it, the ligatures spelled out; none when it has no letters. */
function checkable(word: string): string | undefined {
	let result = word;
	for (const [from, to] of LIGATURES) {
		result = result.split(from).join(to);
	}
	result = result.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
	// The quotes and brackets of a word and a following punctuation, as in „Het or zijn,
	if (!/\p{L}/u.test(result) || /^\p{N}+([.,]\p{N}+)*$/u.test(result)) {
		return undefined;
	}
	// A roman numeral, an abbreviation of one letter
	if (/^[IVXLCDM]+$/.test(result) || result.length === 1) {
		return undefined;
	}
	// allow-any-unicode-next-line
	return result.replace(/'/g, '’').normalize('NFC');
}

/** A word respelled by each of the rules, and by all of them. */
function respellings(word: string, rules: readonly (readonly [RegExp, string])[]): string[] {
	const results = new Set<string>();
	let all = word;
	for (const [pattern, replacement] of rules) {
		const one = word.replace(pattern, replacement);
		if (one !== word) {
			results.add(one);
		}
		all = all.replace(pattern, replacement);
	}
	if (all !== word) {
		results.add(all);
	}
	return [...results];
}

/**
 * The corrections of a word the dictionaries do not know: one of the OCR's confusions, then two of them (the accents
 * lost, two at a time), then the word as two (`Auversest`, Auvers est), each kept when the dictionaries know it.
 */
function suggestions(word: string, accepted: (word: string) => boolean): string[] {
	const found: string[] = [];
	const add = (candidate: string) => {
		if (candidate !== word && !found.includes(candidate) && accepted(candidate)) {
			found.push(candidate);
		}
	};
	const once = (from: string, test: (to: string) => boolean): string[] => {
		const results: string[] = [];
		for (const [reading, meanings] of CONFUSIONS) {
			let at = from.indexOf(reading);
			while (at >= 0) {
				for (const meaning of meanings) {
					if (test(meaning)) {
						results.push(from.slice(0, at) + meaning + from.slice(at + reading.length));
					}
				}
				at = from.indexOf(reading, at + 1);
			}
		}
		return results;
	};
	const single = once(word, () => true);
	single.forEach(add);
	if (!found.length) {
		// Two confusions, the second an accent lost, at most a few hundred words looked up
		for (const candidate of single.slice(0, 40)) {
			once(candidate, meaning => ACCENTS.has(meaning)).slice(0, 10).forEach(add);
			if (found.length >= SUGGESTIONS) {
				break;
			}
		}
	}
	// The word as two, only when no confusion explains it
	if (!found.length && word.length >= 5) {
		for (let at = 2; at <= word.length - 2; at++) {
			const left = word.slice(0, at);
			const right = word.slice(at);
			if (accepted(left) && accepted(right)) {
				found.push(`${left} ${right}`);
			}
		}
	}
	return found.slice(0, SUGGESTIONS);
}

// ---- A second scan

/** A word as compared between two scans: in lower case, without punctuation. */
function normal(word: string): string {
	return word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * The words of `content` that `other`, the text of another copy, reads otherwise: the part of the other text where most
 * of `content`'s runs of three words are, aligned with it word by word, and the words of one put in place of a like
 * word of the other.
 */
function disagreements(content: string, other: string, pages: readonly number[], pageCount: number): IOcrDisagreement[] {
	const ours = [...content.matchAll(/[^\s]+/gu)].map(match => ({ start: match.index, end: match.index + match[0].length, word: match[0], key: normal(match[0]) })).filter(word => word.key);
	const theirs = [...other.matchAll(/[^\s]+/gu)].map(match => ({ word: match[0], key: normal(match[0]) })).filter(word => word.key);
	if (!ours.length || !theirs.length) {
		return [];
	}
	// Where the runs of three words of ours are in theirs, near where the pages would put them
	const runs = new Map<string, number[]>();
	for (let index = 0; index + 2 < theirs.length; index++) {
		const key = `${theirs[index].key} ${theirs[index + 1].key} ${theirs[index + 2].key}`;
		const at = runs.get(key);
		if (at) {
			at.push(index);
		} else {
			runs.set(key, [index]);
		}
	}
	const expected = pages.length && pageCount ? Math.round(theirs.length * (Math.min(...pages) - 1) / pageCount) : 0;
	const starts: number[] = [];
	for (let index = 0; index + 2 < ours.length; index++) {
		const at = runs.get(`${ours[index].key} ${ours[index + 1].key} ${ours[index + 2].key}`);
		if (at && at.length <= 3) {
			starts.push(at.reduce((best, position) => Math.abs(position - index - expected) < Math.abs(best - index - expected) ? position : best) - index);
		}
	}
	if (!starts.length) {
		return [];
	}
	starts.sort((a, b) => a - b);
	const shift = starts[Math.floor(starts.length / 2)];
	const from = Math.max(0, shift - 50);
	const window = theirs.slice(from, Math.min(theirs.length, shift + ours.length + 50));
	// The alignment, by the longest common sequence of words
	const n = ours.length;
	const m = window.length;
	const table = new Uint16Array((n + 1) * (m + 1));
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			table[i * (m + 1) + j] = ours[i].key === window[j].key ? table[(i + 1) * (m + 1) + j + 1] + 1 : Math.max(table[(i + 1) * (m + 1) + j], table[i * (m + 1) + j + 1]);
		}
	}
	const result: IOcrDisagreement[] = [];
	let i = 0;
	let j = 0;
	while (i < n && j < m) {
		if (ours[i].key === window[j].key) {
			i++;
			j++;
			continue;
		}
		// A word of ours and one of theirs in each other's place, both between words the two agree on
		const down = table[(i + 1) * (m + 1) + j];
		const right = table[i * (m + 1) + j + 1];
		const diagonal = table[(i + 1) * (m + 1) + j + 1];
		if (diagonal >= down && diagonal >= right) {
			if (like(ours[i].key, window[j].key)) {
				result.push({ start: ours[i].start, end: ours[i].end, word: ours[i].word, other: window[j].word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '') });
			}
			i++;
			j++;
		} else if (down >= right) {
			i++;
		} else {
			j++;
		}
	}
	return result;
}

/** Whether two readings are of the same word: at most a third of their letters, and three, differ. */
function like(a: string, b: string): boolean {
	const limit = Math.min(3, Math.ceil(Math.max(a.length, b.length) / 3));
	if (Math.abs(a.length - b.length) > limit) {
		return false;
	}
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			current.push(Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)));
		}
		previous = current;
	}
	return previous[b.length] <= limit;
}
