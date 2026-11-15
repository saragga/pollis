/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IMeteredConnectionService } from '../../../../platform/meteredConnection/common/meteredConnection.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IActivityService, NumberBadge } from '../../../services/activity/common/activity.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IExtensionsWorkbenchService, VIEWLET_ID } from '../common/extensions.js';
import { installedToolbox, IToolboxIndex, IToolboxIndexEntry, TOOLBOXES_INDEX_URL, toolboxesOfIndex, toolboxHasUpdate } from './pollisToolboxesView.js';

/** How often toolboxes.json is downloaded again while Pollis is open. */
const CHECK_INTERVAL = 60 * 60 * 1000;
/** The window coming back to the front downloads toolboxes.json again when the last download began longer ago than this. */
const FOCUS_CHECK_AFTER = 15 * 60 * 1000;

/**
 * The number of installed toolboxes that have an update, on the Extensions icon of the activity bar. The toolboxes come
 * from toolboxes.json (see pollisToolboxesView.ts), not from the gallery, so VS Code's own badge (StatusUpdater in
 * extensionsViewlet.ts) does not count them; the activity bar adds the two numbers. toolboxes.json is downloaded when
 * Pollis starts, every hour while it is open, except on a metered connection, and when its window comes back to the
 * front after 15 minutes; the toolboxes are counted again whenever the extensions change, as when one is updated.
 */
class PollisToolboxesBadge extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisToolboxesBadge';

	private readonly badge = this._register(new MutableDisposable());
	private toolboxes: readonly IToolboxIndexEntry[] = [];
	private lastCheck = 0;
	private checking = false;

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IActivityService private readonly activityService: IActivityService,
		@IExtensionsWorkbenchService private readonly extensionsWorkbenchService: IExtensionsWorkbenchService,
		@IHostService hostService: IHostService,
		@IMeteredConnectionService meteredConnectionService: IMeteredConnectionService,
	) {
		super();
		this._register(Event.debounce(extensionsWorkbenchService.onChange, () => undefined, 100, undefined, undefined, undefined, this._store)(() => this.update()));
		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => {
			if (!meteredConnectionService.isConnectionMetered) {
				this.check();
			}
		}, CHECK_INTERVAL);
		this._register(hostService.onDidChangeFocus(focused => {
			if (focused && Date.now() - this.lastCheck > FOCUS_CHECK_AFTER) {
				this.check();
			}
		}));
		this.check();
	}

	/** Downloads toolboxes.json and counts the toolboxes again; offline, the count stays as it was until the next check. */
	private async check(): Promise<void> {
		if (this.checking) {
			return;
		}
		this.checking = true;
		this.lastCheck = Date.now();
		try {
			const context = await this.requestService.request({ type: 'GET', url: TOOLBOXES_INDEX_URL, callSite: 'pollisToolboxesBadge.check' }, CancellationToken.None);
			if (isSuccess(context)) {
				this.toolboxes = toolboxesOfIndex(await asJson<IToolboxIndex>(context));
			}
		} catch {
			// Offline or not reached: the next check tries again
		} finally {
			this.checking = false;
		}
		this.update();
	}

	private update(): void {
		const count = this.toolboxes.filter(toolbox => toolboxHasUpdate(toolbox, installedToolbox(this.extensionsWorkbenchService, toolbox))).length;
		this.badge.clear();
		if (count) {
			const message = count === 1
				? localize('pollisToolboxesBadge.one', "1 toolbox update")
				: localize('pollisToolboxesBadge.many', "{0} toolbox updates", count);
			this.badge.value = this.activityService.showViewContainerActivity(VIEWLET_ID, { badge: new NumberBadge(count, () => message) });
		}
	}
}

registerWorkbenchContribution2(PollisToolboxesBadge.ID, PollisToolboxesBadge, WorkbenchPhase.Eventually);
