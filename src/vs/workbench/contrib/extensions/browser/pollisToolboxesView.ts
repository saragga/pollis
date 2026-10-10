/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/pollisToolboxesView.css';
import * as dom from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { joinPath } from '../../../../base/common/resources.js';
import * as semver from '../../../../base/common/semver/semver.js';
import Severity from '../../../../base/common/severity.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Link } from '../../../../platform/opener/browser/link.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { defaultButtonStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ExtensionRuntimeActionType, ExtensionState, IExtension, IExtensionsWorkbenchService } from '../common/extensions.js';
import { CHOOSE_TOOLBOX_PANELS_COMMAND_ID } from '../../compose/common/toolboxPanels.js';

/**
 * The branch toolboxes-dist of saragga/pollis holds the toolboxes: its toolboxes.json and the .vsix
 * files it names (written by build/pollis/packageToolboxes.ts). Served by raw.githubusercontent.com,
 * which allows cross-origin requests; GitHub release downloads do not, so the window cannot fetch them.
 */
const TOOLBOXES_URL = 'https://raw.githubusercontent.com/saragga/pollis/toolboxes-dist';
const TOOLBOXES_INDEX_URL = `${TOOLBOXES_URL}/toolboxes.json`;

/** The icon of every toolbox row: the Pollis icon, also the toolboxes' own icon. */
const TOOLBOX_ICON = FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/pollis-toolbox-icon.png').toString(true);

/** The context key the Extensions viewlet sets to the search text (ExtensionsSearchValueContext). */
const SEARCH_VALUE_CONTEXT_KEY = 'extensionsSearchValue';

/** A toolbox in the index, toolboxes.json. */
interface IToolboxIndexEntry {
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
}

/** The content of toolboxes.json. */
interface IToolboxIndex {
	readonly toolboxes?: readonly IToolboxIndexEntry[];
}

/** What the button of a toolbox's row does. */
const enum ToolboxAction {
	Install,
	Update,
	/** Installed and up to date: the toolbox is listed in the Installed section only, with its Edit button. */
	None,
}

/** The text a search filters the toolboxes with: the search without its `@` filters, lower case. */
export function toolboxesSearchText(query: string): string {
	return query.replace(/@\S+/g, ' ').trim().toLowerCase();
}

/** A toolbox's name as listed in the Toolboxes section, without the trailing "Toolbox" the section already says. */
function toolboxLabel(name: string): string {
	return name.replace(/\s+Toolbox$/, '') || name;
}

/**
 * The Toolboxes section of the Extensions pane: the Pollis toolbox extensions published on the
 * toolboxes-dist branch that are not installed, each with a button to install it, and the installed
 * ones that have an update, with a button to update them. An installed toolbox is in the Installed
 * section, with its Edit button (extensionsActions.ts), and is uninstalled from its Manage menu like
 * any extension. A click on a toolbox opens its details: the extension page when it is installed,
 * else its README. A search in
 * the Extensions search box shows only the toolboxes whose name or description contains its text;
 * `@toolboxes` shows them all.
 */
export class PollisToolboxesView extends ViewPane {

	static readonly ID = 'workbench.views.extensions.pollisToolboxes';

	private root: HTMLElement | undefined;
	private message: HTMLElement | undefined;
	private list: HTMLElement | undefined;
	/** The rows' buttons and links, replaced at each render. */
	private readonly rowDisposables = this._register(new DisposableStore());
	private toolboxes: readonly IToolboxIndexEntry[] | undefined;
	private loading = false;
	private loadError: string | undefined;
	/** The first row's button, which takes the focus. */
	private firstButton: Button | undefined;
	/** The ids of the toolboxes being installed or updated from this section. */
	private readonly busy = new Set<string>();

	constructor(
		options: IViewPaneOptions,
		@IRequestService private readonly requestService: IRequestService,
		@IExtensionsWorkbenchService private readonly extensionsWorkbenchService: IExtensionsWorkbenchService,
		@IFileService private readonly fileService: IFileService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
		@INotificationService private readonly notificationService: INotificationService,
		@IProgressService private readonly progressService: IProgressService,
		@IHostService private readonly hostService: IHostService,
		@ICommandService private readonly commandService: ICommandService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
		this._register(this.extensionsWorkbenchService.onChange(() => this.refresh()));
		const searchKeys = new Set([SEARCH_VALUE_CONTEXT_KEY]);
		this._register(this.contextKeyService.onDidChangeContext(e => {
			if (e.affectsSome(searchKeys)) {
				this.refresh();
			}
		}));
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		this.root = dom.append(container, dom.$('.pollis-toolboxes'));
		this.message = dom.append(this.root, dom.$('.pollis-toolboxes-message'));
		this.list = dom.append(this.root, dom.$('.pollis-toolboxes-list'));
		this.loadIndex();
	}

	/** Downloads toolboxes.json again, for the Refresh button of the Extensions pane. */
	reload(): Promise<void> {
		return this.loadIndex();
	}

	/** Downloads toolboxes.json. A failure (offline, say) shows in the section with a Retry link. */
	private async loadIndex(): Promise<void> {
		if (this.loading) {
			return;
		}
		this.loading = true;
		this.loadError = undefined;
		this.refresh();
		try {
			const context = await this.requestService.request({ type: 'GET', url: TOOLBOXES_INDEX_URL, callSite: 'pollisToolboxesView.loadIndex' }, CancellationToken.None);
			const index = await asJson<IToolboxIndex>(context);
			this.toolboxes = (index?.toolboxes ?? []).filter(toolbox => typeof toolbox?.id === 'string' && typeof toolbox.name === 'string' && typeof toolbox.version === 'string' && typeof toolbox.vsix === 'string');
		} catch (error) {
			this.loadError = toErrorMessage(error);
		} finally {
			this.loading = false;
		}
		this.refresh();
	}

	/** The installed copy of a toolbox, if any. */
	private getInstalled(toolbox: IToolboxIndexEntry): IExtension | undefined {
		return this.extensionsWorkbenchService.local.find(extension => areSameExtensions(extension.identifier, { id: toolbox.id }));
	}

	private getAction(toolbox: IToolboxIndexEntry, installed: IExtension | undefined): ToolboxAction {
		if (!installed || installed.state === ExtensionState.Uninstalled) {
			return ToolboxAction.Install;
		}
		if (semver.valid(installed.version) && semver.valid(toolbox.version) && semver.lt(installed.version, toolbox.version)) {
			return ToolboxAction.Update;
		}
		return ToolboxAction.None;
	}

	private refresh(): void {
		if (!this.root || !this.message || !this.list) {
			return;
		}
		this.rowDisposables.clear();
		this.firstButton = undefined;
		dom.clearNode(this.message);
		dom.clearNode(this.list);

		if (this.loading && !this.toolboxes) {
			this.message.textContent = localize('pollisToolboxes.loading', "Loading the toolboxes...");
			return;
		}
		if (this.loadError !== undefined && !this.toolboxes) {
			dom.append(this.message, dom.$('span', undefined, localize('pollisToolboxes.offline', "Could not load the list of toolboxes. Check the internet connection.")));
			this.message.append(' ');
			this.rowDisposables.add(this.instantiationService.createInstance(Link, this.message, {
				label: localize('pollisToolboxes.retry', "Retry"),
				href: '',
				title: this.loadError,
			}, { opener: () => this.loadIndex() }));
			return;
		}

		const text = toolboxesSearchText(this.contextKeyService.getContextKeyValue<string>(SEARCH_VALUE_CONTEXT_KEY) ?? '');
		// An installed toolbox that is up to date is in the Installed section only
		const available = (this.toolboxes ?? []).filter(toolbox => this.busy.has(toolbox.id) || this.getAction(toolbox, this.getInstalled(toolbox)) !== ToolboxAction.None);
		const toolboxes = available.filter(toolbox => !text || toolbox.name.toLowerCase().includes(text) || (toolbox.description ?? '').toLowerCase().includes(text));
		if (!toolboxes.length) {
			this.message.textContent = available.length
				? localize('pollisToolboxes.noMatch', "No toolbox matches the search.")
				: this.toolboxes?.length
					? localize('pollisToolboxes.allInstalled', "Every toolbox is installed: they are in the Installed section.")
					: localize('pollisToolboxes.none', "No toolboxes are published yet.");
			return;
		}
		for (const toolbox of toolboxes) {
			this.renderRow(this.list, toolbox);
		}
	}

	private renderRow(container: HTMLElement, toolbox: IToolboxIndexEntry): void {
		const installed = this.getInstalled(toolbox);
		const action = this.getAction(toolbox, installed);
		const row = dom.append(container, dom.$('.pollis-toolbox'));
		row.tabIndex = 0;
		row.title = action === ToolboxAction.Update && installed
			? localize('pollisToolboxes.showDetailsUpdate', "{0} {1} (installed: {2}): show its details", toolbox.name, toolbox.version, installed.version)
			: localize('pollisToolboxes.showDetailsVersion', "{0} {1}: show its details", toolbox.name, toolbox.version);
		dom.append(row, dom.$('img.icon', { src: TOOLBOX_ICON, alt: '' }));
		const details = dom.append(row, dom.$('.details'));
		const header = dom.append(details, dom.$('.header'));
		dom.append(header, dom.$('span.name', undefined, toolboxLabel(toolbox.name)));
		const description = dom.append(details, dom.$('.description', undefined, toolbox.description ?? ''));
		description.title = toolbox.description ?? '';
		dom.append(details, dom.$('.author', undefined, toolbox.author || installed?.publisherDisplayName || toolbox.id.split('.')[0]));

		const actionContainer = dom.append(row, dom.$('.action'));
		this.rowDisposables.add(dom.addDisposableListener(row, dom.EventType.CLICK, e => {
			if (!actionContainer.contains(e.target as Node)) {
				this.showDetails(toolbox, installed);
			}
		}));
		this.rowDisposables.add(dom.addStandardDisposableListener(row, dom.EventType.KEY_DOWN, e => {
			if (e.target === row && (e.keyCode === KeyCode.Enter || e.keyCode === KeyCode.Space)) {
				e.preventDefault();
				this.showDetails(toolbox, installed);
			}
		}));

		const button = this.rowDisposables.add(new Button(actionContainer, { ...defaultButtonStyles }));
		this.firstButton ??= button;
		const busy = this.busy.has(toolbox.id) || installed?.state === ExtensionState.Installing;
		if (busy) {
			button.label = localize('pollisToolboxes.installing', "Installing...");
			button.enabled = false;
			return;
		}
		switch (action) {
			case ToolboxAction.Install:
				button.label = localize('pollisToolboxes.install', "Install");
				break;
			case ToolboxAction.Update:
				button.label = localize('pollisToolboxes.update', "Update");
				break;
		}
		this.rowDisposables.add(button.onDidClick(() => this.install(toolbox, action === ToolboxAction.Update)));
	}

	/**
	 * Opens the extension page of an installed toolbox. A toolbox that is not installed has no
	 * extension to show (it is in no gallery), so its README is downloaded and previewed instead.
	 */
	private async showDetails(toolbox: IToolboxIndexEntry, installed: IExtension | undefined): Promise<void> {
		if (installed && installed.state === ExtensionState.Installed) {
			await this.extensionsWorkbenchService.open(installed);
			return;
		}
		if (!toolbox.readme) {
			this.notificationService.info(localize('pollisToolboxes.noReadme', "The {0} has no description yet. Install it to see its details.", toolbox.name));
			return;
		}
		try {
			const readme = joinPath(this.environmentService.cacheHome, 'pollisToolboxes', 'readme', `${toolbox.name}.md`);
			await this.download(`${TOOLBOXES_URL}/${encodeURIComponent(toolbox.readme)}`, readme);
			await this.commandService.executeCommand('markdown.showPreview', readme);
		} catch (error) {
			this.notificationService.error(localize('pollisToolboxes.readmeFailed', "Could not show the details of the {0}: {1}", toolbox.name, toErrorMessage(error)));
		}
	}

	/** Downloads the toolbox's .vsix to a temporary folder, installs it and deletes the folder. */
	private async install(toolbox: IToolboxIndexEntry, update: boolean): Promise<void> {
		this.busy.add(toolbox.id);
		this.refresh();
		const folder = joinPath(this.environmentService.cacheHome, 'pollisToolboxes', generateUuid());
		try {
			const extension = await this.progressService.withProgress({
				location: ProgressLocation.Notification,
				title: update
					? localize('pollisToolboxes.updating', "Updating the {0}...", toolbox.name)
					: localize('pollisToolboxes.installingNamed', "Installing the {0}...", toolbox.name),
			}, async () => {
				const vsix = joinPath(folder, toolbox.vsix);
				await this.download(`${TOOLBOXES_URL}/${encodeURIComponent(toolbox.vsix)}`, vsix);
				return this.extensionsWorkbenchService.install(vsix, { installGivenVersion: true });
			});
			this.promptRuntimeAction(toolbox, extension, update);
			if (!update) {
				// Installing changes no menus: the user chooses the panels to add, and where, on this page
				this.commandService.executeCommand(CHOOSE_TOOLBOX_PANELS_COMMAND_ID, extension.identifier.id);
			}
		} catch (error) {
			if (!isCancellationError(error)) {
				this.notificationService.error(update
					? localize('pollisToolboxes.updateFailed', "Could not update the {0}: {1}", toolbox.name, toErrorMessage(error))
					: localize('pollisToolboxes.installFailed', "Could not install the {0}: {1}", toolbox.name, toErrorMessage(error)));
			}
		} finally {
			try {
				await this.fileService.del(folder, { recursive: true });
			} catch {
				// The folder was not created (the download failed first), or is already gone
			}
			this.busy.delete(toolbox.id);
			this.refresh();
		}
	}

	private async download(url: string, target: URI): Promise<void> {
		const context = await this.requestService.request({ type: 'GET', url, callSite: 'pollisToolboxesView.download' }, CancellationToken.None);
		if (!isSuccess(context)) {
			throw new Error(localize('pollisToolboxes.downloadFailed', "The download of {0} failed (server returned {1}).", url, context.res.statusCode ?? '?'));
		}
		await this.fileService.writeFile(target, context.stream);
	}

	/** Asks to reload the window or restart the extensions when the installed toolbox needs it to load. */
	private promptRuntimeAction(toolbox: IToolboxIndexEntry, extension: IExtension, update: boolean): void {
		const done = update
			? localize('pollisToolboxes.updated', "The {0} was updated.", toolbox.name)
			: localize('pollisToolboxes.installed', "The {0} was installed.", toolbox.name);
		switch (extension.runtimeState?.action) {
			case ExtensionRuntimeActionType.ReloadWindow:
				this.notificationService.prompt(Severity.Info, localize('pollisToolboxes.reload', "{0} Reload the window to use it.", done), [{
					label: localize('pollisToolboxes.reloadNow', "Reload Now"),
					run: () => this.hostService.reload(),
				}]);
				break;
			case ExtensionRuntimeActionType.RestartExtensions:
				this.notificationService.prompt(Severity.Info, localize('pollisToolboxes.restart', "{0} Restart the extensions to use it.", done), [{
					label: localize('pollisToolboxes.restartExtensions', "Restart Extensions"),
					run: () => this.extensionsWorkbenchService.updateRunningExtensions(),
				}]);
				break;
			default:
				this.notificationService.info(done);
		}
	}

	override focus(): void {
		super.focus();
		this.firstButton?.focus();
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.root) {
			this.root.style.height = `${height}px`;
		}
	}
}
