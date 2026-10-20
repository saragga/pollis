/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the levels and metrics of journals by ISSN, which tag the items of journal feeds on the RSS Feeds page and
// the welcome page. The open ones are in ~/.pollis/journals/scores.csv, which PollisDB.jl writes when it builds the
// PollisJournals database: the latest level of the Norwegian register and OpenAlex's indicators. The ones the user
// imported (SJR, SNIP, CiteScore, the Impact Factor) are in ~/.pollis/journals/metrics/*.jsonl, a file per import; the
// latest year of each journal in each file is kept in ~/.pollis/journals/latest, made again when the import is, as
// CWTS's file, with every year, is too large to read at each start.

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { listenStream } from '../../../../base/common/stream.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IPathService } from '../../../services/path/common/pathService.js';

/** The sources of the metrics the user imports. */
type MetricsSource = 'JCR' | 'Scopus' | 'SCImago' | 'CWTS';

/** The latest year a source has of a journal; its quartiles the best of its categories. */
export interface IJournalMetrics {
	readonly source: MetricsSource;
	readonly year: number;
	readonly category?: string;
	readonly sjr?: number;
	readonly sjrQuartile?: string;
	readonly hIndex?: number;
	readonly snip?: number;
	readonly ipp?: number;
	readonly jif?: number;
	readonly jif5Year?: number;
	readonly jifQuartile?: string;
	readonly jci?: number;
	readonly citeScore?: number;
	readonly citeScoreQuartile?: string;
}

/** What is known of a journal: its Norwegian level (0, 1, 2 or X), OpenAlex's indicators, and the metrics imported. */
export interface IJournalScores {
	readonly level?: string;
	readonly levelYear?: number;
	readonly cited?: number;
	readonly hIndex?: number;
	readonly openAccess?: boolean;
	readonly doaj?: boolean;
	readonly metrics: readonly IJournalMetrics[];
}

export const IJournalScoresService = createDecorator<IJournalScoresService>('pollisJournalScoresService');

export interface IJournalScoresService {
	readonly _serviceBrand: undefined;
	/** Fires when the scores have been read, at first and after PollisJournals is built again or metrics are imported. */
	readonly onDidChange: Event<void>;
	/** The scores of the journal with one of `issns`; undefined when none is known. */
	getScores(issns: readonly string[]): IJournalScores | undefined;
	/** The sources of the metrics imported. */
	getMetricsSources(): readonly string[];
}

/** A line of a metrics file, as the import writes it. */
interface IMetricsLine {
	readonly source: MetricsSource;
	readonly year: number | null;
	readonly issn: string | null;
	readonly eissn: string | null;
	readonly category: string | null;
	readonly jif: number | null;
	readonly jif_5year: number | null;
	readonly jif_quartile: string | null;
	readonly jci: number | null;
	readonly citescore: number | null;
	readonly citescore_quartile: string | null;
	readonly sjr: number | null;
	readonly sjr_quartile: string | null;
	readonly h_index: number | null;
	readonly snip: number | null;
	readonly ipp: number | null;
}

/** The open scores of a journal, from a row of scores.csv. */
type OpenScores = Omit<IJournalScores, 'metrics'>;

/** The better of two quartiles, Q1 being the best. */
function bestQuartile(a: string | undefined, b: string | null): string | undefined {
	return !b ? a : !a || b < a ? b : a;
}

/** The value of `line` of a metrics file, as kept, or merged into `kept` when it is of the same year: another category. */
function toMetrics(line: IMetricsLine, year: number, kept: IJournalMetrics | undefined): IJournalMetrics {
	const value = (n: number | null, previous: number | undefined) => n ?? previous;
	// A category of JCR or Scopus is a row of its own, with its quartile; SCImago's lists them all in one cell
	const category = line.category && (line.jif_quartile || line.citescore_quartile) ? `${line.category} (${line.jif_quartile ?? line.citescore_quartile})` : line.category;
	return {
		source: line.source,
		year,
		category: [kept?.category, category].filter(Boolean).join('; ') || undefined,
		sjr: value(line.sjr, kept?.sjr),
		sjrQuartile: bestQuartile(kept?.sjrQuartile, line.sjr_quartile),
		hIndex: value(line.h_index, kept?.hIndex),
		snip: value(line.snip, kept?.snip),
		ipp: value(line.ipp, kept?.ipp),
		jif: value(line.jif, kept?.jif),
		jif5Year: value(line.jif_5year, kept?.jif5Year),
		jifQuartile: bestQuartile(kept?.jifQuartile, line.jif_quartile),
		jci: value(line.jci, kept?.jci),
		citeScore: value(line.citescore, kept?.citeScore),
		citeScoreQuartile: bestQuartile(kept?.citeScoreQuartile, line.citescore_quartile),
	};
}

class JournalScoresService extends Disposable implements IJournalScoresService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	private readonly scoresFile: URI;
	private readonly metricsFolder: URI;
	private readonly latestFolder: URI;
	private scores = new Map<string, OpenScores>();
	private metrics = new Map<string, IJournalMetrics[]>();
	private sources: string[] = [];
	private readonly loader = this._register(new RunOnceScheduler(() => this.load(), 1000));

	constructor(
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
	) {
		super();
		// Julia writes them on this machine, so they are in the local home folder
		const home = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'journals');
		this.scoresFile = joinPath(home, 'scores.csv');
		this.metricsFolder = joinPath(home, 'metrics');
		this.latestFolder = joinPath(home, 'latest');
		this._register(this.fileService.createWatcher(home, { recursive: false, excludes: [] }).onDidChange(e => {
			if (e.affects(this.scoresFile)) {
				this.loader.schedule();
			}
		}));
		this._register(this.fileService.createWatcher(this.metricsFolder, { recursive: false, excludes: [] }).onDidChange(() => this.loader.schedule()));
		this.load();
	}

	getScores(issns: readonly string[]): IJournalScores | undefined {
		const open = issns.map(issn => this.scores.get(issn)).find(Boolean);
		const metrics = new Map<string, IJournalMetrics>();
		for (const issn of issns) {
			for (const value of this.metrics.get(issn) ?? []) {
				if (!metrics.has(value.source) || metrics.get(value.source)!.year < value.year) {
					metrics.set(value.source, value);
				}
			}
		}
		return open || metrics.size ? { ...open, metrics: [...metrics.values()] } : undefined;
	}

	getMetricsSources(): readonly string[] {
		return this.sources;
	}

	private async load(): Promise<void> {
		this.scores = await this.readScores();
		const metrics = new Map<string, IJournalMetrics[]>();
		const sources = new Set<string>();
		let files: URI[] = [];
		try {
			files = ((await this.fileService.resolve(this.metricsFolder)).children ?? []).filter(child => child.isFile && child.name.endsWith('.jsonl') && !child.name.startsWith('.')).map(child => child.resource);
		} catch {
			// Nothing imported
		}
		for (const file of files) {
			const latest = await this.readLatest(file);
			for (const [issn, value] of Object.entries(latest)) {
				sources.add(value.source);
				const list = metrics.get(issn);
				if (list) {
					list.push(value);
				} else {
					metrics.set(issn, [value]);
				}
			}
		}
		this.metrics = metrics;
		this.sources = [...sources];
		this._onDidChange.fire();
	}

	/** The rows of scores.csv by each of their ISSNs; empty before PollisJournals is built. */
	private async readScores(): Promise<Map<string, OpenScores>> {
		const scores = new Map<string, OpenScores>();
		let text: string;
		try {
			text = (await this.fileService.readFile(this.scoresFile)).value.toString();
		} catch {
			return scores;
		}
		const number = (value: string) => value ? Number(value) : undefined;
		for (const line of text.split('\n').slice(1)) {
			const [issns, level, levelYear, cited, hIndex, openAccess, doaj] = line.split(',');
			if (!issns) {
				continue;
			}
			const row: OpenScores = { level: level || undefined, levelYear: number(levelYear), cited: number(cited), hIndex: number(hIndex), openAccess: openAccess === '1', doaj: doaj === '1' };
			for (const issn of issns.split(' ')) {
				scores.set(issn, row);
			}
		}
		return scores;
	}

	/** The latest year of each journal in the metrics file `file`, by ISSN: kept in ~/.pollis/journals/latest, made again when the file is newer. */
	private async readLatest(file: URI): Promise<Record<string, IJournalMetrics>> {
		const cache = joinPath(this.latestFolder, basename(file).replace(/\.jsonl$/, '.json'));
		try {
			const [source, kept] = await Promise.all([this.fileService.stat(file), this.fileService.stat(cache)]);
			if (kept.mtime >= source.mtime) {
				return JSON.parse((await this.fileService.readFile(cache)).value.toString());
			}
		} catch {
			// Not kept yet, or unreadable: made again
		}
		const latest: Record<string, IJournalMetrics> = {};
		try {
			await this.readLines(file, text => {
				const line: IMetricsLine = JSON.parse(text);
				if (line.year === null) {
					return;
				}
				for (const issn of [line.issn, line.eissn]) {
					const kept = issn ? latest[issn] : undefined;
					if (issn && (!kept || kept.year <= line.year)) {
						latest[issn] = toMetrics(line, line.year, kept?.year === line.year ? kept : undefined);
					}
				}
			});
			await this.fileService.writeFile(cache, VSBuffer.fromString(JSON.stringify(latest)));
		} catch {
			// A file being written, or a line cut short: read again at its next change
		}
		return latest;
	}

	/** Calls `onLine` with each line of `file`, read as a stream. */
	private async readLines(file: URI, onLine: (line: string) => void): Promise<void> {
		const stream = (await this.fileService.readFileStream(file)).value;
		const decoder = new TextDecoder();
		let rest = '';
		const take = (text: string) => {
			const lines = (rest + text).split('\n');
			rest = lines.pop() ?? '';
			for (const line of lines) {
				if (line) {
					onLine(line);
				}
			}
		};
		await new Promise<void>((resolve, reject) => listenStream(stream, {
			onData: data => take(decoder.decode(data.buffer, { stream: true })),
			onError: reject,
			onEnd: () => {
				take(decoder.decode() + '\n');
				resolve();
			},
		}));
	}
}

/** The meaning of a level of the Norwegian register. */
function levelMeaning(level: string): string {
	switch (level) {
		case '0': return localize('journal.level0', "not academic");
		case '1': return localize('journal.level1', "academic");
		case '2': return localize('journal.level2', "leading");
		default: return localize('journal.levelX', "under review");
	}
}

/** A number with at most `digits` decimals, as written in this language. */
function formatNumber(value: number, digits = 2): string {
	return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/**
 * The tag of a journal item, short: its Norwegian level, OpenAlex's 2-year mean citedness and the quartile of SJR, or
 * else of the Impact Factor, with its year; and its tooltip, every value known, a line per source with its year.
 */
export function describeJournal(scores: IJournalScores): { readonly tag: string; readonly details: string } {
	const tag: string[] = [];
	const details: string[] = [];
	if (scores.level) {
		tag.push(localize('journal.levelTag', "Level {0}", scores.level));
		details.push(localize('journal.levelDetail', "Norwegian register {0}: level {1}, {2}", scores.levelYear ?? '', scores.level, levelMeaning(scores.level)));
	}
	if (scores.cited !== undefined) {
		tag.push(localize('journal.citedTag', "Cited {0}", formatNumber(scores.cited, 1)));
		const openAlex = [localize('journal.cited', "2-year mean citedness {0}", formatNumber(scores.cited))];
		if (scores.hIndex !== undefined) {
			openAlex.push(localize('journal.hIndex', "h-index {0}", scores.hIndex));
		}
		if (scores.openAccess) {
			openAlex.push(localize('journal.openAccess', "open access"));
		}
		if (scores.doaj) {
			openAlex.push(localize('journal.doaj', "in DOAJ"));
		}
		details.push(localize('journal.openAlexDetail', "OpenAlex: {0}", openAlex.join(', ')));
	}
	const quartile = scores.metrics.find(value => value.sjrQuartile) ?? scores.metrics.find(value => value.jifQuartile);
	if (quartile) {
		tag.push(`${quartile.sjrQuartile ? 'SJR' : 'JIF'} ${quartile.sjrQuartile ?? quartile.jifQuartile} ${quartile.year}`);
	}
	for (const value of scores.metrics) {
		const parts: string[] = [];
		const add = (name: string, metric: number | undefined, metricQuartile?: string) => {
			if (metric !== undefined) {
				parts.push(`${name} ${formatNumber(metric, 3)}${metricQuartile ? ` (${metricQuartile})` : ''}`);
			}
		};
		add('SJR', value.sjr, value.sjrQuartile);
		add('JIF', value.jif, value.jifQuartile);
		add(localize('journal.jif5Year', "5-year JIF"), value.jif5Year);
		add('JCI', value.jci);
		add('CiteScore', value.citeScore, value.citeScoreQuartile);
		add('SNIP', value.snip);
		add('IPP', value.ipp);
		if (value.hIndex !== undefined) {
			parts.push(localize('journal.hIndex', "h-index {0}", value.hIndex));
		}
		if (value.category) {
			parts.push(value.category);
		}
		details.push(localize('journal.sourceDetail', "{0} {1}: {2}", value.source, value.year, parts.join(', ')));
	}
	return { tag: tag.join(' · '), details: details.join('\n') };
}

registerSingleton(IJournalScoresService, JournalScoresService, InstantiationType.Delayed);
