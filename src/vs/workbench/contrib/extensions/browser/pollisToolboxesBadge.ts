/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IActivityService, NumberBadge } from '../../../services/activity/common/activity.js';
import { IExtensionsWorkbenchService, VIEWLET_ID } from '../common/extensions.js';
import { IPollisToolboxIndexService } from './pollisToolboxIndex.js';
import { installedToolbox, toolboxHasUpdate } from './pollisToolboxesView.js';

/**
 * The number of installed toolboxes that have an update, on the Extensions icon of the activity bar. The toolboxes come
 * from toolboxes.json (pollisToolboxIndex.ts), not from the gallery, so VS Code's own badge (StatusUpdater in
 * extensionsViewlet.ts) does not count them; the activity bar adds the two numbers. The toolboxes are counted again
 * whenever toolboxes.json is downloaded and whenever the extensions change, as when one is updated.
 */
class PollisToolboxesBadge extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisToolboxesBadge';

	private readonly badge = this._register(new MutableDisposable());

	constructor(
		@IActivityService private readonly activityService: IActivityService,
		@IExtensionsWorkbenchService private readonly extensionsWorkbenchService: IExtensionsWorkbenchService,
		@IPollisToolboxIndexService private readonly toolboxIndexService: IPollisToolboxIndexService,
	) {
		super();
		this._register(Event.debounce(extensionsWorkbenchService.onChange, () => undefined, 100, undefined, undefined, undefined, this._store)(() => this.update()));
		this._register(toolboxIndexService.onDidChange(() => this.update()));
		this.update();
	}

	private update(): void {
		const count = (this.toolboxIndexService.toolboxes ?? []).filter(toolbox => toolboxHasUpdate(toolbox, installedToolbox(this.extensionsWorkbenchService, toolbox))).length;
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
