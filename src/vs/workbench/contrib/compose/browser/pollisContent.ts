/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { encodeHex, streamToBuffer, VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { AppResourcePath, FileAccess } from '../../../../base/common/network.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService, IPromptChoice, Severity } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';

// New and updated Pollis content between releases: the replications and the published benchmarks.
// (Vignettes come with their packages: Help > Documentation > Vignettes, vignettesPage.ts.) The content repository holds content.toml, a list of every entry
// with the dates it was added and last updated, the Pollis version it needs and its files with their SHA-256,
// and the files, in KIND/ID/. Pollis ships the same list (media/content.toml) as it was at the release:
// an entry of the repository updated after the shipped one, or not shipped at all, is downloaded into
// ~/.pollis/content/KIND/ID/ and used instead of the shipped one, until a release ships it. Both lists are
// written by scripts/pollis-content.jl.

/** A kind of content. */
export type ContentKind = 'workflows' | 'benchmarks';

const KINDS: readonly ContentKind[] = ['workflows', 'benchmarks'];

/** An entry of content.toml. */
export interface IContentEntry {
	readonly kind: ContentKind;
	/** The entry's folder: a notebook library folder. */
	readonly id: string;
	readonly title: string;
	/** The date the entry was first published, `YYYY-MM-DD`: it never changes. */
	readonly added: string;
	/** The date its files last changed, `YYYY-MM-DD`. */
	readonly updated: string;
	/** The oldest Pollis version that can use it. */
	readonly pollis: string;
	readonly files: readonly string[];
	readonly sha256: readonly string[];
}

/** A downloaded entry newer than the shipped one, or not shipped at all. */
export interface IDownloadedEntry {
	readonly entry: IContentEntry;
	/** The folder of its files. */
	readonly folder: URI;
	/** Whether Pollis does not ship it at all. */
	readonly isNew: boolean;
}

export const IPollisContentService = createDecorator<IPollisContentService>('pollisContentService');

export interface IPollisContentService {
	readonly _serviceBrand: undefined;

	/** The downloaded entries of a kind that are newer than the shipped ones, or not shipped. */
	downloaded(kind: ContentKind): Promise<readonly IDownloadedEntry[]>;

	/** The ids of the entries of a kind downloaded and not opened yet, which the pages mark New or Updated. */
	unseen(kind: ContentKind): ReadonlySet<string>;

	/** Marks an entry opened. */
	markSeen(kind: ContentKind, id: string): void;

	/** Reads the repository's list and downloads what is new or updated: returns those entries. */
	check(): Promise<readonly IDownloadedEntry[]>;
}

const REPOSITORY_SETTING = 'pollis.content.repository';
const CHECK_SETTING = 'pollis.content.checkForUpdates';
const DEFAULT_REPOSITORY = 'https://github.com/Trumpingtons/pollis-content';
const SHIPPED_LIST: AppResourcePath = 'vs/workbench/contrib/compose/browser/media/content.toml';
const LAST_CHECK_KEY = 'pollis.content.lastCheck';
const UNSEEN_KEY = 'pollis.content.unseen';
const DAY = 24 * 60 * 60 * 1000;

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisContent',
	title: localize('pollisContent.configurationTitle', "Pollis Content"),
	type: 'object',
	properties: {
		[CHECK_SETTING]: {
			type: 'boolean',
			default: true,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('pollisContent.check', "Check once a day for new and updated replications and published benchmarks, published between Pollis releases. The check reads the list in the content repository on GitHub (`#{0}#`).", REPOSITORY_SETTING),
		},
		[REPOSITORY_SETTING]: {
			type: 'string',
			default: DEFAULT_REPOSITORY,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('pollisContent.repository', "The GitHub repository that Pollis reads new and updated content from."),
		},
	},
});

/** The entries of a content.toml: `[[workflows]]` and `[[benchmarks]]` tables. */
function contentList(text: string): IContentEntry[] {
	const toml = parseToml(text);
	const entries: IContentEntry[] = [];
	const string = (table: TomlValue, key: string) => typeof table[key] === 'string' ? table[key] as string : '';
	const strings = (table: TomlValue, key: string) => Array.isArray(table[key]) ? (table[key] as unknown[]).filter((value): value is string => typeof value === 'string') : [];
	for (const kind of KINDS) {
		const tables = toml[kind];
		if (!Array.isArray(tables)) {
			continue;
		}
		for (const table of tables as TomlValue[]) {
			const entry: IContentEntry = {
				kind,
				id: string(table, 'id'),
				title: string(table, 'title'),
				added: string(table, 'added'),
				updated: string(table, 'updated'),
				pollis: string(table, 'pollis'),
				files: strings(table, 'files'),
				sha256: strings(table, 'sha256'),
			};
			// An id or a file path that could leave its folder is refused
			const safe = (path: string) => /^[\w.-]+(\/[\w.-]+)*$/.test(path) && !path.split('/').includes('..');
			if (safe(entry.id) && entry.updated && entry.files.length && entry.files.length === entry.sha256.length && entry.files.every(safe)) {
				entries.push(entry);
			}
		}
	}
	return entries;
}

/** Compares two versions `MAJOR.MINOR.PATCH` by their numbers. */
function compareVersions(a: string, b: string): number {
	const x = a.split('.').map(Number);
	const y = b.split('.').map(Number);
	for (let i = 0; i < Math.max(x.length, y.length); i++) {
		const difference = (x[i] || 0) - (y[i] || 0);
		if (difference) {
			return difference;
		}
	}
	return 0;
}

const key = (entry: { kind: ContentKind; id: string }) => `${entry.kind}/${entry.id}`;

class PollisContentService extends Disposable implements IPollisContentService {
	declare readonly _serviceBrand: undefined;

	private shippedList: Promise<Map<string, IContentEntry>> | undefined;

	constructor(
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@IRequestService private readonly requestService: IRequestService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IProductService private readonly productService: IProductService,
		@IStorageService private readonly storageService: IStorageService,
	) {
		super();
	}

	/** The list Pollis ships, by kind/id. */
	private shipped(): Promise<Map<string, IContentEntry>> {
		this.shippedList ??= (async () => {
			try {
				const text = (await this.fileService.readFile(FileAccess.asFileUri(SHIPPED_LIST))).value.toString();
				return new Map(contentList(text).map(entry => [key(entry), entry]));
			} catch {
				return new Map();
			}
		})();
		return this.shippedList;
	}

	private async root(): Promise<URI> {
		return joinPath(await this.pathService.userHome({ preferLocal: true }), '.pollis', 'content');
	}

	/** The entries downloaded, as recorded in ~/.pollis/content/content.json. */
	private async local(): Promise<IContentEntry[]> {
		try {
			return JSON.parse((await this.fileService.readFile(joinPath(await this.root(), 'content.json'))).value.toString());
		} catch {
			return [];
		}
	}

	/** Whether an entry is newer than the shipped one, or not shipped, and this Pollis can use it. */
	private usable(entry: IContentEntry, shipped: Map<string, IContentEntry>): boolean {
		const version = this.productService.pollisVersion ?? '0';
		const original = shipped.get(key(entry));
		return (!entry.pollis || compareVersions(entry.pollis, version) <= 0) && (!original || entry.updated > original.updated);
	}

	async downloaded(kind: ContentKind): Promise<readonly IDownloadedEntry[]> {
		const shipped = await this.shipped();
		const root = await this.root();
		return (await this.local())
			.filter(entry => entry.kind === kind && this.usable(entry, shipped))
			.map(entry => ({ entry, folder: joinPath(root, entry.kind, entry.id), isNew: !shipped.has(key(entry)) }));
	}

	unseen(kind: ContentKind): ReadonlySet<string> {
		const all: string[] = JSON.parse(this.storageService.get(UNSEEN_KEY, StorageScope.APPLICATION, '[]'));
		return new Set(all.filter(id => id.startsWith(`${kind}/`)).map(id => id.slice(kind.length + 1)));
	}

	markSeen(kind: ContentKind, id: string): void {
		const all: string[] = JSON.parse(this.storageService.get(UNSEEN_KEY, StorageScope.APPLICATION, '[]'));
		this.storageService.store(UNSEEN_KEY, JSON.stringify(all.filter(other => other !== `${kind}/${id}`)), StorageScope.APPLICATION, StorageTarget.MACHINE);
	}

	/** The raw link of a file of the repository, when it is on GitHub. */
	private raw(path: string): string {
		const repository = this.configurationService.getValue<string>(REPOSITORY_SETTING) || DEFAULT_REPOSITORY;
		const github = /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repository>[^/]+?)(?:\.git)?\/?$/.exec(repository)?.groups;
		if (!github) {
			throw new Error(localize('pollisContent.notGitHub', "The content repository {0} is not on GitHub.", repository));
		}
		return `https://raw.githubusercontent.com/${github.owner}/${github.repository}/HEAD/${path}`;
	}

	/** A file of the repository, or undefined when there is none. */
	private async fetch(path: string): Promise<VSBuffer | undefined> {
		const context = await this.requestService.request({ type: 'GET', url: this.raw(path), callSite: 'pollisContent.check' }, CancellationToken.None);
		if (context.res.statusCode === 404) {
			return undefined;
		}
		if (!isSuccess(context)) {
			throw new Error(localize('pollisContent.status', "The server returned {0} for {1}.", context.res.statusCode ?? '?', path));
		}
		return streamToBuffer(context.stream);
	}

	async check(): Promise<readonly IDownloadedEntry[]> {
		// No content.toml yet, or no repository yet: nothing published
		const list = await this.fetch('content.toml');
		const remote = list ? contentList(list.toString()) : [];
		const shipped = await this.shipped();
		const root = await this.root();
		const local = new Map((await this.local()).map(entry => [key(entry), entry]));
		const kept: IContentEntry[] = [];
		const changed: IDownloadedEntry[] = [];
		for (const entry of remote) {
			const folder = joinPath(root, entry.kind, entry.id);
			const previous = local.get(key(entry));
			if (!this.usable(entry, shipped)) {
				continue;
			}
			if (previous && previous.updated >= entry.updated) {
				kept.push(previous);
				continue;
			}
			// All the files, checked against their SHA-256, before the entry's folder is replaced
			const files: VSBuffer[] = [];
			for (const [i, file] of entry.files.entries()) {
				const path = `${entry.kind}/${entry.id}/${file}`;
				const bytes = await this.fetch(path);
				if (!bytes) {
					throw new Error(localize('pollisContent.missing', "{0} is listed but missing.", path));
				}
				const digest = encodeHex(VSBuffer.wrap(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes.buffer))));
				if (digest !== entry.sha256[i].toLowerCase()) {
					throw new Error(localize('pollisContent.hash', "{0} does not match its SHA-256 in the content list.", path));
				}
				files.push(bytes);
			}
			await this.fileService.del(folder, { recursive: true }).catch(() => undefined);
			for (const [i, file] of entry.files.entries()) {
				await this.fileService.writeFile(joinPath(folder, file), files[i]);
			}
			kept.push(entry);
			changed.push({ entry, folder, isNew: !shipped.has(key(entry)) });
		}
		// Entries the repository no longer lists, or that a release now ships as new, are removed
		for (const previous of local.values()) {
			if (!kept.some(entry => key(entry) === key(previous))) {
				await this.fileService.del(joinPath(root, previous.kind, previous.id), { recursive: true }).catch(() => undefined);
			}
		}
		await this.fileService.writeFile(joinPath(root, 'content.json'), VSBuffer.fromString(JSON.stringify(kept, undefined, '\t')));
		if (changed.length) {
			const all: string[] = JSON.parse(this.storageService.get(UNSEEN_KEY, StorageScope.APPLICATION, '[]'));
			const unseen = new Set([...all, ...changed.map(({ entry }) => key(entry))]);
			this.storageService.store(UNSEEN_KEY, JSON.stringify([...unseen]), StorageScope.APPLICATION, StorageTarget.MACHINE);
		}
		return changed;
	}
}

registerSingleton(IPollisContentService, PollisContentService, InstantiationType.Delayed);

/** The commands that open the page of each kind, registered by workflowLibrary.ts, which imports this file. */
const PAGE_COMMANDS: Record<ContentKind, string> = {
	workflows: 'chiara.statistics.wfl_sl',
	benchmarks: 'pollis.correctness.publishedBenchmarks',
};

/** Tells the user what a check downloaded, in one notification, with a button for each page that has something. */
function announce(notificationService: INotificationService, commandService: ICommandService, changed: readonly IDownloadedEntry[]): void {
	const titles = changed.map(({ entry, isNew }) => isNew
		? localize('pollisContent.newTitle', "{0} (new)", entry.title)
		: localize('pollisContent.updatedTitle', "{0} (updated)", entry.title));
	const labels: Record<ContentKind, string> = {
		workflows: localize('pollisContent.showWorkflows', "Show Replications"),
		benchmarks: localize('pollisContent.showBenchmarks', "Show Benchmarks"),
	};
	const choices: IPromptChoice[] = KINDS.filter(kind => changed.some(({ entry }) => entry.kind === kind))
		.map(kind => ({ label: labels[kind], run: () => commandService.executeCommand(PAGE_COMMANDS[kind]) }));
	notificationService.prompt(Severity.Info, localize('pollisContent.announce', "New and updated in Pollis: {0}.", titles.join(', ')), choices);
}

/** The daily check, after startup, when the setting allows it. */
class PollisContentCheck extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.pollisContentCheck';

	constructor(
		@IPollisContentService contentService: IPollisContentService,
		@IConfigurationService configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@INotificationService notificationService: INotificationService,
		@ICommandService commandService: ICommandService,
		@ILogService logService: ILogService,
	) {
		super();
		const last = storageService.getNumber(LAST_CHECK_KEY, StorageScope.APPLICATION, 0);
		if (!configurationService.getValue<boolean>(CHECK_SETTING) || Date.now() - last < DAY) {
			return;
		}
		storageService.store(LAST_CHECK_KEY, Date.now(), StorageScope.APPLICATION, StorageTarget.MACHINE);
		contentService.check().then(
			changed => changed.length && announce(notificationService, commandService, changed),
			error => logService.info(`Pollis content check: ${toErrorMessage(error)}`));
	}
}

registerWorkbenchContribution2(PollisContentCheck.ID, PollisContentCheck, WorkbenchPhase.Eventually);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.content.check',
			title: localize2('pollisContent.checkNow', "Check for New Replications and Benchmarks"),
			category: Categories.Help,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const contentService = accessor.get(IPollisContentService);
		const notificationService = accessor.get(INotificationService);
		const commandService = accessor.get(ICommandService);
		try {
			const changed = await contentService.check();
			if (changed.length) {
				announce(notificationService, commandService, changed);
			} else {
				notificationService.info(localize('pollisContent.none', "No new or updated replications or benchmarks."));
			}
		} catch (error) {
			notificationService.error(localize('pollisContent.failed', "Could not check for new content: {0}", toErrorMessage(error)));
		}
	}
});
