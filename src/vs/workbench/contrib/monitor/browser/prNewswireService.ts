/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IRssFeedsService } from './rssFeedsService.js';

// PR Newswire, a paid distribution service for companies' and organisations' own press releases. Its feeds list only
// their latest 20 releases, so Pollis reads them every ten minutes while they are wanted: while PR Newswire is ticked
// in Media Coverage, or while there is an event study of SEC filings, whose events take the release's time. The
// releases go to ~/.pollis/news/prnewswire/YYYY-MM.jsonl, a file a month; they are not part of Explore > RSS.

export const IPrNewswireService = createDecorator<IPrNewswireService>('prNewswireService');

/** What wants PR Newswire's releases read. */
export type PrNewswireReader = 'mediaCoverage' | 'eventStudies';

export interface IPrNewswireRelease {
	readonly id: string;
	readonly title: string;
	readonly link: string;
	/** In milliseconds since 1970. */
	readonly time: number;
	/** The start of its text, which names the company's ticker, as in (NYSE: ABC). */
	readonly summary?: string;
}

export interface IPrNewswireService {
	readonly _serviceBrand: undefined;
	/** Whether Media Coverage wants the releases: PR Newswire is ticked there. */
	readonly forMediaCoverage: boolean;
	/** Says whether `reader` wants the releases read; they are read while one does. */
	setWanted(reader: PrNewswireReader, wanted: boolean): void;
	/** The releases kept from `start` to `end`, in milliseconds since 1970. */
	search(start: number, end: number): Promise<readonly IPrNewswireRelease[]>;
}

const FEEDS_BASE = 'https://www.prnewswire.com/rss/';
const FEEDS = [
	'news-releases-list.rss',
	'financial-services-latest-news/financial-services-latest-news-list.rss',
	'financial-services-latest-news/earnings-list.rss',
	'financial-services-latest-news/dividends-list.rss',
	'financial-services-latest-news/mergers-and-acquisitions-list.rss',
].map(feed => `${FEEDS_BASE}${feed}`);

const READ_MILLISECONDS = 10 * 60 * 1000;
const MEDIA_COVERAGE_KEY = 'pollis.prNewswire.mediaCoverage';
const LEASE_KEY = 'pollis.prNewswire.lease';
// Longer than the time between reads, so that the window reading keeps it
const LEASE_MILLISECONDS = 25 * 60 * 1000;
const SUMMARY_LENGTH = 400;

/** The file of the month of `time`: 2026-10.jsonl. */
function monthFile(time: number): string {
	return `${new Date(time).toISOString().slice(0, 7)}.jsonl`;
}

export class PrNewswireService extends Disposable implements IPrNewswireService {

	declare readonly _serviceBrand: undefined;

	private readonly folder: URI;
	private readonly owner = generateUuid();
	private readonly wanted = new Set<PrNewswireReader>();
	// The releases kept, by id, as this window last read the files; undefined until it reads them
	private kept: Set<string> | undefined;
	private reading = false;

	constructor(
		@IRssFeedsService private readonly rssFeedsService: IRssFeedsService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
	) {
		super();
		this.folder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'news', 'prnewswire');
		if (this.storageService.getBoolean(MEDIA_COVERAGE_KEY, StorageScope.APPLICATION, false)) {
			this.wanted.add('mediaCoverage');
		}
		// Ticked or unticked in another window
		this._register(this.storageService.onDidChangeValue(StorageScope.APPLICATION, MEDIA_COVERAGE_KEY, this._store)(() => {
			const wanted = this.storageService.getBoolean(MEDIA_COVERAGE_KEY, StorageScope.APPLICATION, false);
			if (wanted) {
				this.wanted.add('mediaCoverage');
				this.read();
			} else {
				this.wanted.delete('mediaCoverage');
			}
		}));
		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => this.read(), READ_MILLISECONDS);
		this.read();
	}

	get forMediaCoverage(): boolean {
		return this.wanted.has('mediaCoverage');
	}

	setWanted(reader: PrNewswireReader, wanted: boolean): void {
		if (reader === 'mediaCoverage') {
			this.storageService.store(MEDIA_COVERAGE_KEY, wanted, StorageScope.APPLICATION, StorageTarget.USER);
		}
		if (wanted === this.wanted.has(reader)) {
			return;
		}
		if (wanted) {
			this.wanted.add(reader);
			this.read();
		} else {
			this.wanted.delete(reader);
		}
	}

	async search(start: number, end: number): Promise<readonly IPrNewswireRelease[]> {
		const releases: IPrNewswireRelease[] = [];
		const month = new Date(start);
		month.setUTCDate(1);
		for (; month.getTime() <= end; month.setUTCMonth(month.getUTCMonth() + 1)) {
			for (const release of await this.readMonth(monthFile(month.getTime()))) {
				if (release.time >= start && release.time <= end) {
					releases.push(release);
				}
			}
		}
		return releases;
	}

	/** Reads the feeds, when the releases are wanted and no other window reads them, and keeps the new releases. */
	private async read(): Promise<void> {
		if (this.reading || !this.wanted.size) {
			return;
		}
		if (!this.holdLease()) {
			// Another window reads them: what this one knows is stale when it reads again
			this.kept = undefined;
			return;
		}
		this.reading = true;
		try {
			if (!this.kept) {
				const now = Date.now();
				const releases = [...await this.readMonth(monthFile(now)), ...await this.readMonth(monthFile(new Date(now).setUTCDate(0)))];
				this.kept = new Set(releases.map(release => release.id));
			}
			const fresh = new Map<string, string[]>();
			for (const feed of FEEDS) {
				for (const item of await this.rssFeedsService.previewFeed(feed) ?? []) {
					if (!item.date || this.kept.has(item.id)) {
						continue;
					}
					this.kept.add(item.id);
					const release: IPrNewswireRelease = { id: item.id, title: item.title, link: item.link, time: item.date, summary: item.summary?.slice(0, SUMMARY_LENGTH) };
					const file = monthFile(item.date);
					fresh.set(file, [...fresh.get(file) ?? [], `${JSON.stringify(release)}\n`]);
				}
			}
			for (const [file, lines] of fresh) {
				await this.fileService.writeFile(joinPath(this.folder, file), VSBuffer.fromString(lines.join('')), { append: true });
			}
		} catch {
			// Read again at the next turn
			this.kept = undefined;
		} finally {
			this.reading = false;
		}
	}

	private async readMonth(file: string): Promise<IPrNewswireRelease[]> {
		try {
			const content = (await this.fileService.readFile(joinPath(this.folder, file))).value.toString();
			const releases: IPrNewswireRelease[] = [];
			for (const line of content.split('\n')) {
				try {
					if (line.trim()) {
						releases.push(JSON.parse(line));
					}
				} catch {
					// A line cut short
				}
			}
			return releases;
		} catch {
			return [];
		}
	}

	/** Takes or renews the lease when no other window holds it; whether this window holds it. */
	private holdLease(): boolean {
		let lease: { owner?: string; time?: number };
		try {
			lease = JSON.parse(this.storageService.get(LEASE_KEY, StorageScope.APPLICATION, '{}'));
		} catch {
			lease = {};
		}
		const now = Date.now();
		if (lease.owner && lease.owner !== this.owner && now - (lease.time ?? 0) < LEASE_MILLISECONDS) {
			return false;
		}
		this.storageService.store(LEASE_KEY, JSON.stringify({ owner: this.owner, time: now }), StorageScope.APPLICATION, StorageTarget.MACHINE);
		return true;
	}
}

registerSingleton(IPrNewswireService, PrNewswireService, InstantiationType.Delayed);
