/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { fromNow } from '../../../../base/common/date.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { groupProcesses, IMemoryGroup, IMemoryJulia, IMemoryMonitorService, IMemoryProcesses, IMemoryReading, JuliaRole, MEMORY_MONITOR_CHANNEL } from '../../../../platform/memoryMonitor/common/memoryMonitor.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';

// Pollis: the memory used on the computer, in the status bar, read every minute; a click lists the apps that use the
// most, with the Julia processes of each Pollis, another Pollis left running, and Julia processes that outlived theirs.

const SHOW_MEMORY_COMMAND_ID = 'pollis.memory.show';

/** How often the status bar reads the memory: it changes over minutes, and a reading costs a few milliseconds. */
const READING_INTERVAL = 60_000;

/** From this share of the memory used, the status bar entry shows as a warning. */
const SHORT_OF_MEMORY = 0.9;

/** How many apps the list shows, besides this Pollis, another Pollis and the Julia processes left behind. */
const MAX_APPS = 12;

function memoryService(mainProcessService: IMainProcessService): IMemoryMonitorService {
	return ProxyChannel.toService<IMemoryMonitorService>(mainProcessService.getChannel(MEMORY_MONITOR_CHANNEL));
}

/** `bytes` in gigabytes, with one decimal unless it is whole, such as 11.2 or 16. */
function gigabytes(bytes: number): string {
	return String(Number((bytes / 1024 ** 3).toFixed(1)));
}

/** `bytes` as 1.4 GB or 254 MB. */
function size(bytes: number): string {
	return bytes >= 1024 ** 3
		? localize('memory.gigabytes', "{0} GB", (bytes / 1024 ** 3).toFixed(1))
		: localize('memory.megabytes', "{0} MB", Math.round(bytes / 1024 ** 2));
}

/** How long a process has run, such as 4 days. */
function runningFor(elapsed: number): string {
	return fromNow(Date.now() - elapsed * 1000, false, true);
}

function juliaLabel(role: JuliaRole): string {
	switch (role) {
		case 'repl': return localize('memory.julia.repl', "Julia REPL");
		case 'notebook': return localize('memory.julia.notebook', "Notebook Kernel");
		case 'languageServer': return localize('memory.julia.languageServer', "Julia Language Server");
		case 'testItems': return localize('memory.julia.testItems', "Julia Test Items");
		case 'debugger': return localize('memory.julia.debugger', "Julia Debugger");
		case 'pdf': return localize('memory.julia.pdf', "PDF Viewer: Poppler Tools");
		case 'eventStudies': return localize('memory.julia.eventStudies', "Event Studies");
		case 'askIndex': return localize('memory.julia.askIndex', "Ask Pollis: Index");
		case 'askCompare': return localize('memory.julia.askCompare', "Ask Pollis: Compare Models");
		case 'documents': return localize('memory.julia.documents', "Documents: Compile");
		case 'vignette': return localize('memory.julia.vignette', "Vignette: Compile");
		case 'precompile': return localize('memory.julia.precompile', "Precompiling Packages");
		case 'alerts': return localize('memory.julia.alerts', "Alerts: Statistics");
		case 'install': return localize('memory.julia.install', "Installing Packages");
		case 'pluto': return localize('memory.julia.pluto', "Pluto");
		case 'julia': return localize('memory.julia.julia', "Julia");
	}
}

/** The size, the version of Julia and how long it has run, of a Julia process. */
function juliaDescription(julia: IMemoryJulia): string {
	return [size(julia.memory), julia.version ? localize('memory.julia.version', "Julia {0}", julia.version) : undefined, runningFor(julia.elapsed)].filter(part => part).join(' \u00b7 ');
}

/** A line of the list: an app, a Julia process of a Pollis, or a command. */
interface IMemoryItem extends IQuickPickItem {
	/** A Julia process that outlived the app that started it, which the item's button ends. */
	readonly orphan?: number;
	readonly command?: string;
}

/** The lines of the list. */
function memoryItems(snapshot: IMemoryProcesses): (IMemoryItem | IQuickPickSeparator)[] {
	const groups = groupProcesses(snapshot);
	const self = groups.find(group => group.self);
	const anotherPollis = (group: IMemoryGroup) => !!self && !group.self && !group.orphan && group.name === self.name;
	const items: (IMemoryItem | IQuickPickSeparator)[] = [];
	const endButton = { iconClass: ThemeIcon.asClassName(Codicon.close), tooltip: localize('memory.end', "End") };
	groups.filter((group, index) => index < MAX_APPS || group.self || group.orphan || anotherPollis(group)).forEach(group => {
		if (group.orphan) {
			const julia = group.julia[0];
			items.push({
				label: `$(warning) ${juliaLabel(julia.role)}`,
				description: juliaDescription(julia),
				detail: localize('memory.orphan', "The app that started it has quit, but it is still running. End it to free its memory."),
				orphan: julia.pid,
				buttons: [endButton],
			});
			return;
		}
		if (anotherPollis(group)) {
			const folder = group.key.replace(/[\\/][^\\/]+$/, '');
			items.push({
				label: `$(warning) ${localize('memory.another', "{0} ({1})", group.name, folder)}`,
				description: size(group.memory),
				detail: isMacintosh
					? localize('memory.anotherMac', "Another {0}, running for {1}. Quit it from its icon in the Dock (\u2318Q) to free its memory.", group.name, runningFor(group.elapsed))
					: localize('memory.anotherOther', "Another {0}, running for {1}. Quit it to free its memory.", group.name, runningFor(group.elapsed)),
			});
		} else {
			items.push({ label: group.self ? localize('memory.self', "{0} (this one)", group.name) : group.name, description: size(group.memory) });
		}
		// The Julia processes of a Pollis, one by one: those it shows nowhere else
		if (group.self || anotherPollis(group)) {
			for (const julia of group.julia) {
				items.push({ label: `\u21b3 ${juliaLabel(julia.role)}`, description: juliaDescription(julia) });
			}
		}
	});
	items.push({ type: 'separator' }, {
		label: localize('memory.processExplorer', "Open Process Explorer"),
		description: localize('memory.processExplorerDescription', "Every process of this Pollis"),
		command: 'workbench.action.openProcessExplorer',
	});
	return items;
}

/** The status bar entry: the memory used on the computer, read every minute. */
class MemoryStatus extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisMemoryStatus';

	private readonly entry = this._register(new MutableDisposable<IStatusbarEntryAccessor>());
	private readonly service: IMemoryMonitorService;

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@IMainProcessService mainProcessService: IMainProcessService,
	) {
		super();
		this.service = memoryService(mainProcessService);
		this._register(new IntervalTimer()).cancelAndSet(() => this.update(), READING_INTERVAL);
		this.update();
	}

	private async update(): Promise<void> {
		let reading: IMemoryReading;
		try {
			reading = await this.service.reading();
		} catch {
			return;
		}
		if (this._store.isDisposed) {
			return;
		}
		const share = reading.used / reading.total;
		const used = gigabytes(reading.used);
		const total = gigabytes(reading.total);
		const summary = localize('memory.summary', "Memory used on this computer: {0} GB of {1} GB ({2}%)", used, total, Math.round(share * 100));
		const properties: IStatusbarEntry = {
			name: localize('memory.name', "Memory"),
			text: `$(dashboard) ${localize('memory.text', "{0} / {1} GB", used, total)}`,
			ariaLabel: summary,
			tooltip: `${summary}\n${localize('memory.click', "Click for the apps that use the most.")}`,
			command: SHOW_MEMORY_COMMAND_ID,
			kind: share >= SHORT_OF_MEMORY ? 'warning' : undefined,
		};
		if (this.entry.value) {
			this.entry.value.update(properties);
		} else {
			// Left of Pollis AI+, which is flush right
			this.entry.value = this.statusbarService.addEntry(properties, 'status.pollis.memory', StatusbarAlignment.RIGHT, -999999);
		}
	}
}

registerWorkbenchContribution2(MemoryStatus.ID, MemoryStatus, WorkbenchPhase.Eventually);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_MEMORY_COMMAND_ID,
			title: localize2('memory.show', "Show Memory Use"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const commandService = accessor.get(ICommandService);
		const dialogService = accessor.get(IDialogService);
		const notificationService = accessor.get(INotificationService);
		const quickInputService = accessor.get(IQuickInputService);
		const service = memoryService(accessor.get(IMainProcessService));
		const store = new DisposableStore();
		const picker = store.add(quickInputService.createQuickPick<IMemoryItem>({ useSeparators: true }));
		picker.title = localize('memory.title', "Memory");
		picker.placeholder = localize('memory.placeholder', "The apps that use the most memory, largest first");
		picker.matchOnDescription = true;
		picker.matchOnDetail = true;
		// The dialog that confirms an End must not close the list
		picker.ignoreFocusOut = true;
		store.add(picker.onDidHide(() => store.dispose()));
		const load = async () => {
			picker.busy = true;
			try {
				const [reading, snapshot] = await Promise.all([service.reading(), service.processes()]);
				picker.title = localize('memory.titleUsed', "Memory: {0} GB of {1} GB Used", gigabytes(reading.used), gigabytes(reading.total));
				picker.items = memoryItems(snapshot);
			} catch (error) {
				notificationService.error(localize('memory.failed', "The memory of the computer could not be read: {0}", error instanceof Error ? error.message : String(error)));
				picker.hide();
			} finally {
				picker.busy = false;
			}
		};
		store.add(picker.onDidTriggerItemButton(async ({ item }) => {
			if (item.orphan === undefined) {
				return;
			}
			const { confirmed } = await dialogService.confirm({
				message: localize('memory.endConfirm', "End this Julia process?"),
				detail: localize('memory.endDetail', "{0}, process {1}. The app that started it has quit, so nothing uses it; what it held in memory is lost.", item.label.replace(/^\$\(warning\) /, ''), item.orphan),
				primaryButton: localize({ key: 'memory.endButton', comment: ['&& denotes a mnemonic'] }, "&&End"),
			});
			if (confirmed) {
				if (!await service.endJulia(item.orphan)) {
					notificationService.warn(localize('memory.notEnded', "The Julia process {0} was not ended: it is no longer one that has outlived its app.", item.orphan));
				}
				await load();
			}
		}));
		store.add(picker.onDidAccept(() => {
			const command = picker.selectedItems[0]?.command;
			picker.hide();
			if (command) {
				commandService.executeCommand(command);
			}
		}));
		picker.show();
		await load();
	}
});
