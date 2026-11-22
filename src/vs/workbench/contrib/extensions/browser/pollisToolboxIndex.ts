/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IMeteredConnectionService } from '../../../../platform/meteredConnection/common/meteredConnection.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IHostService } from '../../../services/host/browser/host.js';

/**
 * The branch dist of Trumpingtons/pollis-toolboxes holds the toolboxes: its toolboxes.json and the .vsix
 * files it names (written by that repository's publish workflow on every push to main). Served by raw.githubusercontent.com,
 * which allows cross-origin requests; GitHub release downloads do not, so the window cannot fetch them.
 */
export const TOOLBOXES_URL = 'https://raw.githubusercontent.com/Trumpingtons/pollis-toolboxes/dist';
const TOOLBOXES_INDEX_URL = `${TOOLBOXES_URL}/toolboxes.json`;

/** How often toolboxes.json is downloaded again while Pollis is open. */
const CHECK_INTERVAL = 60 * 60 * 1000;
/** The window coming back to the front downloads toolboxes.json again when the last download began longer ago than this. */
const FOCUS_CHECK_AFTER = 15 * 60 * 1000;

/** A toolbox in the index, toolboxes.json. */
export interface IToolboxIndexEntry {
	/** The extension id, `<publisher>.<name>`. */
	readonly id: string;
	readonly name: string;
	readonly description: string;
	/** The author, shown below the description as the publisher of other extensions is. */
	readonly author?: string;
	readonly version: string;
	/** The .vsix file name, next to toolboxes.json. */
	readonly vsix: string;
	/** The README file name, next to toolboxes.json: shown when the toolbox is not installed. */
	readonly readme?: string;
	/** The icon file name, next to toolboxes.json: the icon of its .vsix, shown on its row. */
	readonly icon?: string;
	/** True for a toolbox of Simulation Games cases alone, whose description is headed as an online simulation. */
	readonly games?: boolean;
}

/** The content of toolboxes.json. */
interface IToolboxIndex {
	readonly toolboxes?: readonly IToolboxIndexEntry[];
}

/** The toolboxes of toolboxes.json that have every field a row needs. */
function toolboxesOfIndex(index: IToolboxIndex | null | undefined): IToolboxIndexEntry[] {
	return (index?.toolboxes ?? []).filter(toolbox => typeof toolbox?.id === 'string' && typeof toolbox.name === 'string' && typeof toolbox.version === 'string' && typeof toolbox.vsix === 'string');
}

export const IPollisToolboxIndexService = createDecorator<IPollisToolboxIndexService>('pollisToolboxIndexService');

/**
 * The published toolboxes, from toolboxes.json, which both the Toolboxes section of the Extensions pane and the
 * count of toolbox updates on the Extensions icon show, so the two always agree.
 */
export interface IPollisToolboxIndexService {
	readonly _serviceBrand: undefined;
	/** Fires when a download ends, with or without a new list. */
	readonly onDidChange: Event<void>;
	/** The toolboxes of the last download that succeeded; undefined until one has. */
	readonly toolboxes: readonly IToolboxIndexEntry[] | undefined;
	/** Whether a download is under way. */
	readonly loading: boolean;
	/** Why the last download failed, if it did. */
	readonly loadError: string | undefined;
	/** Downloads toolboxes.json again now, as the Refresh button of the Extensions pane asks. */
	reload(): Promise<void>;
}

/**
 * Downloads toolboxes.json when Pollis starts, every hour while it is open, except on a metered connection, when its
 * window comes back to the front after 15 minutes, and on request.
 */
class PollisToolboxIndexService extends Disposable implements IPollisToolboxIndexService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	private _toolboxes: readonly IToolboxIndexEntry[] | undefined;
	get toolboxes(): readonly IToolboxIndexEntry[] | undefined { return this._toolboxes; }

	private _loading = false;
	get loading(): boolean { return this._loading; }

	private _loadError: string | undefined;
	get loadError(): string | undefined { return this._loadError; }

	private lastCheck = 0;

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IHostService hostService: IHostService,
		@IMeteredConnectionService meteredConnectionService: IMeteredConnectionService,
	) {
		super();
		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => {
			if (!meteredConnectionService.isConnectionMetered) {
				this.reload();
			}
		}, CHECK_INTERVAL);
		this._register(hostService.onDidChangeFocus(focused => {
			if (focused && Date.now() - this.lastCheck > FOCUS_CHECK_AFTER) {
				this.reload();
			}
		}));
		this.reload();
	}

	/** The download under way, which a reload asked for meanwhile waits for. */
	private pending: Promise<void> | undefined;

	reload(): Promise<void> {
		this.pending ??= this.load().finally(() => this.pending = undefined);
		return this.pending;
	}

	private async load(): Promise<void> {
		this._loading = true;
		this._loadError = undefined;
		this.lastCheck = Date.now();
		this._onDidChange.fire();
		try {
			// Not from the HTTP cache, which may keep a list for the five minutes GitHub allows, and so name a .vsix
			// that the publish since has replaced. Not with a Cache-Control header either: GitHub refuses the
			// preflight request such a header needs, and the window then cannot download the list
			const context = await this.requestService.request({ type: 'GET', url: TOOLBOXES_INDEX_URL, disableCache: true, callSite: 'pollisToolboxIndex.reload' }, CancellationToken.None);
			if (!isSuccess(context)) {
				throw new Error(`HTTP ${context.res.statusCode}`);
			}
			this._toolboxes = toolboxesOfIndex(await asJson<IToolboxIndex>(context));
		} catch (error) {
			this._loadError = toErrorMessage(error);
		} finally {
			this._loading = false;
		}
		this._onDidChange.fire();
	}
}

registerSingleton(IPollisToolboxIndexService, PollisToolboxIndexService, InstantiationType.Delayed);
