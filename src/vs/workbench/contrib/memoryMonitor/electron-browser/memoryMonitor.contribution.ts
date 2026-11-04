/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { fromNow } from '../../../../base/common/date.js';
import { escapeMarkdownSyntaxTokens, MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { IManagedHoverTooltipMarkdownString } from '../../../../base/browser/ui/hover/hover.js';
import { localize } from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { groupProcesses, IMemoryGroup, IMemoryMonitorService, IMemoryProcesses, IMemoryReading, JuliaRole, MEMORY_MONITOR_CHANNEL } from '../../../../platform/memoryMonitor/common/memoryMonitor.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, ShowTooltipCommand, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';

// Pollis: the memory used on the computer, in the status bar, read every minute. Its hover, also on a click, shows the
// apps that use the most, with the Julia processes of each Pollis, another Pollis left running, and Julia processes
// that outlived theirs, with End.

/** The command of the End link of a Julia process that outlived its app: (pid). */
const END_JULIA_COMMAND_ID = 'pollis.memory.endJulia';

/** The command of the hover's last line. */
const PROCESS_EXPLORER_COMMAND_ID = 'workbench.action.openProcessExplorer';

/** How long the processes read for the hover are shown again, as reading them takes a second or two on macOS. */
const PROCESSES_KEPT = 20_000;

/** How often the status bar reads the memory: it changes over minutes, and a reading costs a few milliseconds. */
const READING_INTERVAL = 60_000;

/** From this share of the memory used, the status bar entry shows as a warning. */
const SHORT_OF_MEMORY = 0.9;

/** How many apps the hover shows, besides this Pollis, another Pollis and the Julia processes left behind. */
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

/** A cell of a table of Markdown: its syntax escaped, and no line breaks. */
function cell(text: string): string {
	return escapeMarkdownSyntaxTokens(text.replace(/\s+/g, ' '));
}

/**
 * The hover: the memory in use and swapped, a table of the apps that use the most, largest first, with the Julia
 * processes of each Pollis under it, what to do about another Pollis or a Julia process left behind, and why the apps
 * can add up to more than the computer has.
 */
function memoryMarkdown(reading: IMemoryReading, snapshot: IMemoryProcesses): MarkdownString {
	const markdown = new MarkdownString('', { supportThemeIcons: true, isTrusted: { enabledCommands: [END_JULIA_COMMAND_ID, PROCESS_EXPLORER_COMMAND_ID] } });
	const used = localize('memory.inUse', "{0} GB of {1} GB in use", gigabytes(reading.used), gigabytes(reading.total));
	const swapped = reading.swapped ? localize('memory.swapped', "{0} GB swapped to disk", gigabytes(reading.swapped)) : undefined;
	markdown.appendMarkdown(`**${cell(localize('memory.heading', "Memory"))}**: ${cell(swapped ? `${used} \u00b7 ${swapped}` : used)}\n\n`);

	const groups = groupProcesses(snapshot);
	const self = groups.find(group => group.self);
	const anotherPollis = (group: IMemoryGroup) => !!self && !group.self && !group.orphan && group.name === self.name;
	const rows: string[] = [];
	const warnings: string[] = [];
	groups.filter((group, index) => index < MAX_APPS || group.self || group.orphan || anotherPollis(group)).forEach(group => {
		if (group.orphan) {
			const julia = group.julia[0];
			rows.push(`| $(warning) ${cell(juliaLabel(julia.role))} | ${size(julia.memory)} | ${cell(runningFor(julia.elapsed))} |`);
			const end = `[${cell(localize('memory.end', "End"))}](command:${END_JULIA_COMMAND_ID}?${encodeURIComponent(JSON.stringify([julia.pid]))})`;
			warnings.push(`$(warning) ${cell(localize('memory.orphan', "{0} is still running, though the app that started it has quit: end it to free its memory.", juliaLabel(julia.role)))} ${end}`);
			return;
		}
		const name = group.self ? localize('memory.self', "{0} (this one)", group.name) : group.name;
		rows.push(`| ${anotherPollis(group) ? '$(warning) ' : ''}${cell(name)} | ${size(group.memory)} | ${cell(runningFor(group.elapsed))} |`);
		if (anotherPollis(group)) {
			const folder = group.key.replace(/[\\/][^\\/]+$/, '');
			warnings.push(`$(warning) ${cell(isMacintosh
				? localize('memory.anotherMac', "Another {0} is running, from {1}: quit it from its icon in the Dock (\u2318Q) to free its memory.", group.name, folder)
				: localize('memory.anotherOther', "Another {0} is running, from {1}: quit it to free its memory.", group.name, folder))}`);
		}
		// The Julia processes of a Pollis, one by one: those it shows nowhere else
		if (group.self || anotherPollis(group)) {
			for (const julia of group.julia) {
				const version = julia.version ? ` \u00b7 ${cell(localize('memory.julia.version', "Julia {0}", julia.version))}` : '';
				rows.push(`| \u00a0\u00a0\u21b3 ${cell(juliaLabel(julia.role))} | ${size(julia.memory)} | ${cell(runningFor(julia.elapsed))}${version} |`);
			}
		}
	});
	markdown.appendMarkdown([
		`| ${cell(localize('memory.app', "App"))} | ${cell(localize('memory.memory', "Memory"))} | ${cell(localize('memory.running', "Running For"))} |`,
		'|---|--:|---|',
		...rows,
	].join('\n') + '\n\n');
	for (const warning of warnings) {
		markdown.appendMarkdown(`${warning}\n\n`);
	}
	// Why the apps add up to more than the memory in use
	markdown.appendMarkdown(`*${cell(snapshot.platform === 'darwin'
		? localize('memory.noteMac', "Each app is counted as Activity Monitor counts it, with what is compressed or swapped to disk, so the apps can add up to more than the computer has.")
		: localize('memory.noteOther', "Memory shared by several processes is counted in each, so the apps can add up to more than the memory in use."))}*\n\n`);
	markdown.appendMarkdown(`[${cell(localize('memory.processExplorer', "Open Process Explorer"))}](command:${PROCESS_EXPLORER_COMMAND_ID}) ${cell(localize('memory.processExplorerDescription', "for every process of this Pollis"))}`);
	return markdown;
}

/** The status bar entry: the memory used on the computer, read every minute, and its hover. */
class MemoryStatus extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisMemoryStatus';

	private readonly entry = this._register(new MutableDisposable<IStatusbarEntryAccessor>());
	private readonly service: IMemoryMonitorService;
	/** The processes last read for the hover, and when. */
	private processes: { readonly snapshot: IMemoryProcesses; readonly time: number } | undefined;
	/** One hover for every reading, so that a new reading does not close it; its content is read when it shows. */
	private readonly tooltip: IManagedHoverTooltipMarkdownString = {
		markdown: () => this.hoverMarkdown(),
		markdownNotSupportedFallback: undefined,
	};

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@IMainProcessService mainProcessService: IMainProcessService,
	) {
		super();
		this.service = memoryService(mainProcessService);
		this._register(new IntervalTimer()).cancelAndSet(() => this.update(), READING_INTERVAL);
		this.update();
	}

	private async hoverMarkdown(): Promise<MarkdownString | string> {
		try {
			const [reading, snapshot] = await Promise.all([
				this.service.reading(),
				this.processes && Date.now() - this.processes.time < PROCESSES_KEPT ? Promise.resolve(this.processes.snapshot) : this.service.processes(),
			]);
			this.processes = { snapshot, time: Date.now() };
			return memoryMarkdown(reading, snapshot);
		} catch (error) {
			return localize('memory.failed', "The memory of the computer could not be read: {0}", error instanceof Error ? error.message : String(error));
		}
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
		const properties: IStatusbarEntry = {
			name: localize('memory.name', "Memory"),
			text: `$(dashboard) ${localize('memory.text', "{0} / {1} GB", used, total)}`,
			ariaLabel: localize('memory.summary', "Memory used on this computer: {0} GB of {1} GB ({2}%)", used, total, Math.round(share * 100)),
			tooltip: this.tooltip,
			command: ShowTooltipCommand,
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

/** The End link of a Julia process that outlived its app: asks first, then ends it, only if it still is one. */
CommandsRegistry.registerCommand(END_JULIA_COMMAND_ID, async (accessor, pid: unknown) => {
	if (typeof pid !== 'number') {
		return;
	}
	const dialogService = accessor.get(IDialogService);
	const notificationService = accessor.get(INotificationService);
	const service = memoryService(accessor.get(IMainProcessService));
	const { confirmed } = await dialogService.confirm({
		message: localize('memory.endConfirm', "End this Julia process?"),
		detail: localize('memory.endDetail', "Process {0}. The app that started it has quit, so nothing uses it; what it held in memory is lost.", pid),
		primaryButton: localize({ key: 'memory.endButton', comment: ['&& denotes a mnemonic'] }, "&&End"),
	});
	if (confirmed && !await service.endJulia(pid)) {
		notificationService.warn(localize('memory.notEnded', "The Julia process {0} was not ended: it is no longer one that has outlived its app.", pid));
	}
});
