/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AlertSource, IAlertArticle } from './alertsMailbox.js';

// The articles in an alert email. Google Scholar's are read from its own layout; the other sources' from the links
// to their articles, else from the links whose text is a title. The source is told by the sender or, for a
// forwarded alert, by the links the email holds. Only Google Scholar's reader was written from real emails: the
// others are refined as their emails are seen.

/** Each source's senders and the addresses of its articles. */
const SOURCES: readonly { readonly source: AlertSource; readonly sender: RegExp; readonly article: RegExp }[] = [
	{ source: 'scholar', sender: /@(?:[\w-]+\.)*google\.com$/, article: /^https?:\/\/scholar\.google\.[a-z.]+\/scholar_url\?/ },
	{ source: 'jstor', sender: /[@.]jstor\.org$/, article: /^https?:\/\/(?:www\.)?jstor\.org\/stable\// },
	{ source: 'heinonline', sender: /[@.](?:heinonline\.org|wshein\.com)$/, article: /^https?:\/\/(?:www\.)?heinonline\.org\/HOL\// },
	{ source: 'nexisuni', sender: /[@.](?:lexisnexis\.com|nexisuni\.com|lexis\.com)$/, article: /^https?:\/\/(?:advance\.lexis\.com|(?:www\.)?nexisuni\.com)\// },
	{ source: 'ssrn', sender: /[@.]ssrn\.com$/, article: /^https?:\/\/(?:papers\.)?ssrn\.com\/(?:sol3\/papers\.cfm\?abstract_id=|abstract=)/ },
	{ source: 'semanticscholar', sender: /[@.]semanticscholar\.org$/, article: /^https?:\/\/(?:www\.)?semanticscholar\.org\/paper\// },
	{ source: 'webofscience', sender: /[@.](?:clarivate\.com|webofscience\.com|webofknowledge\.com)$/, article: /^https?:\/\/(?:[\w-]+\.)*(?:webofscience\.com\/wos\/|webofknowledge\.com\/)/ },
	{ source: 'scopus', sender: /[@.]scopus\.com$/, article: /^https?:\/\/(?:www\.)?scopus\.com\/(?:record\/display|inward\/record)/ },
	{ source: 'westlaw', sender: /[@.](?:westlaw\.com|thomsonreuters\.com)$/, article: /^https?:\/\/(?:[\w-]+\.)*westlaw\.com\/(?:Document|Link\/Document)\// },
	{ source: 'factiva', sender: /[@.](?:factiva\.com|dowjones\.com)$/, article: /^https?:\/\/(?:[\w-]+\.)*factiva\.com\// },
];

/** The source of an alert email, from its sender or, for a forwarded one, its links; undefined for any other email. */
export function alertSourceOf(from: string, html: string): AlertSource | undefined {
	const sender = (/<(?<address>[^>]+)>/.exec(from)?.groups?.address ?? from).trim().toLowerCase();
	const links = anchors(html).map(anchor => anchor.link);
	return (SOURCES.find(({ sender: pattern }) => pattern.test(sender)) ?? SOURCES.find(({ article }) => links.some(link => article.test(link))))?.source;
}

/** The articles of an alert email of `source`. */
export function parseAlertEmail(source: AlertSource, html: string): IAlertArticle[] {
	if (source === 'scholar') {
		return parseScholar(html);
	}
	const article = SOURCES.find(entry => entry.source === source)!.article;
	const found = parseLinks(html, link => article.test(link));
	// The links of an email may all pass through the sender's click counter: then those whose text is a title
	return found.length ? found : parseLinks(html, link => /^https?:\/\//.test(link));
}

/**
 * The alert an email belongs to: its name, from the subject without the words every alert of the source shares and
 * without counts and dates, and its id, the source and the name in lower case with hyphens.
 */
export function alertOf(source: AlertSource, subject: string): { readonly id: string; readonly name: string } {
	let name = subject.replace(/^(?:\s*(?:re|fwd?|fw)\s*:\s*)+/i, '').trim();
	if (source === 'scholar') {
		name = name.replace(/^new results for\s+/i, '').replace(/^new citations to\s+/i, 'Citations to ').replace(/^new articles (?:by|from|in)\s+/i, 'Articles by ');
	}
	name = name
		.replace(/\s*[-\u2013:]?\s*\(?\b\d+\s+new\s+(?:results?|articles?|papers?|documents?|items?|citations?|records?)\)?/gi, '')
		.replace(/\s*[-\u2013:]?\s*\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/.]\d{1,2}[/.]\d{2,4})\b/g, '')
		.replace(/^["\u201c](?<inner>.*)["\u201d]$/, '$<inner>')
		.trim() || 'Alert';
	const slug = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
	return { id: `${source}-${slug || 'alert'}`, name };
}

/** The links of an HTML text, each with its text and where it is. */
function anchors(html: string): { readonly link: string; readonly html: string; readonly start: number; readonly end: number }[] {
	return Array.from(html.matchAll(/<a\b[^>]*href\s*=\s*["'](?<href>[^"']*)["'][^>]*>(?<text>[\s\S]*?)<\/a>/gi), anchor => ({
		link: decodeEntities(anchor.groups!.href).trim(),
		html: anchor.groups!.text,
		start: anchor.index!,
		end: anchor.index! + anchor[0].length,
	}));
}

/**
 * Google Scholar: each article is a link to scholar_url?url=<the article>, followed by a line of authors and journal
 * and a snippet. The snippet is Google's text, so only the authors' line is kept.
 */
function parseScholar(html: string): IAlertArticle[] {
	const found = anchors(html);
	return unique(found.flatMap((anchor, index): IAlertArticle[] => {
		let link: string | null = null;
		try {
			link = /scholar_url\?/.test(anchor.link) ? new URL(anchor.link).searchParams.get('url') : null;
		} catch {
			// Not an address
		}
		const title = text(anchor.html).replace(/^\[(?:PDF|HTML)\]\s*/i, '');
		if (!link || !title) {
			return [];
		}
		// The text between this article's link and the next one: the authors' line, then the snippet
		const after = html.slice(anchor.end, found[index + 1]?.start ?? html.length).split(/<\/div>/i).map(text).filter(Boolean);
		return [{ title, link, summary: after[0] ?? '' }];
	}));
}

/**
 * The links `isArticle` takes whose text is a title, not a button. The summary is the first line of text after the
 * link (journal, volume, year), not a description.
 */
function parseLinks(html: string, isArticle: (link: string) => boolean): IAlertArticle[] {
	const found = anchors(html);
	return unique(found.flatMap((anchor, index): IAlertArticle[] => {
		const title = text(anchor.html);
		if (!isArticle(anchor.link) || title.length < 12 || /^(?:view|read|download|access|see|more|unsubscribe|manage|edit|modify|cancel|delete|privacy|terms|help|contact|log ?in|sign ?in|click)\b/i.test(title) || /unsubscribe|preferences|privacy/i.test(anchor.link)) {
			return [];
		}
		const summary = html.slice(anchor.end, found[index + 1]?.start ?? html.length).split(/<br\s*\/?>|<\/(?:p|div|td|li|h\d)>/i).map(text).find(Boolean) ?? '';
		return [{ title, link: anchor.link, summary: summary.length > 200 ? summary.slice(0, 200).replace(/\s+\S*$/, '') + '…' : summary }];
	}));
}

function unique(articles: IAlertArticle[]): IAlertArticle[] {
	const seen = new Set<string>();
	return articles.filter(article => !seen.has(article.link) && !!seen.add(article.link));
}

/** The text of an HTML fragment: tags removed, entities decoded, spaces collapsed. */
function text(html: string): string {
	return decodeEntities(html.replace(/<(?:style|script)[\s\S]*?<\/(?:style|script)>/gi, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/**
 * `text` with its XML and HTML character references replaced by the characters.
 */
export function decodeEntities(text: string): string {
	const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: '\u00a0', hellip: '\u2026', mdash: '\u2014', ndash: '\u2013' };
	return text.replace(/&(?:#x(?<hex>[0-9a-f]+)|#(?<decimal>[0-9]+)|(?<name>[a-z]+));/gi, (entity, ...args) => {
		const { hex, decimal, name } = args[args.length - 1] as { hex?: string; decimal?: string; name?: string };
		const code = hex ? parseInt(hex, 16) : decimal ? parseInt(decimal, 10) : undefined;
		return code !== undefined ? String.fromCodePoint(code) : named[name!.toLowerCase()] ?? entity;
	});
}
