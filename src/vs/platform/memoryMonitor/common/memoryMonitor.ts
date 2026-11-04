/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the memory of the computer, shown in the status bar, and the apps that use the most of it, grouped as
// Activity Monitor groups them, with the Julia processes that Pollis starts named one by one. The main process reads
// them (../node/memoryMonitorService.ts); the workbench shows them (contrib/memoryMonitor).

export const MEMORY_MONITOR_CHANNEL = 'memoryMonitor';

/** How much memory the computer has and uses, in bytes; used as Activity Monitor counts it on macOS. */
export interface IMemoryReading {
	readonly total: number;
	readonly used: number;
	/** How much is swapped out to the disk, where the system reports it (macOS and Linux). */
	readonly swapped?: number;
}

/** A process of the computer. */
export interface IMemoryProcess {
	readonly pid: number;
	readonly ppid: number;
	/** The memory it uses, in bytes: on macOS its footprint, as Activity Monitor shows it; elsewhere its resident set. */
	readonly memory: number;
	/** How long it has been running, in seconds. */
	readonly elapsed: number;
	/** Its executable and arguments. */
	readonly command: string;
}

/** The processes of the computer, and the main process of the Pollis that read them. */
export interface IMemoryProcesses {
	readonly self: number;
	readonly platform: string;
	readonly processes: readonly IMemoryProcess[];
}

export interface IMemoryMonitorService {
	reading(): Promise<IMemoryReading>;
	processes(): Promise<IMemoryProcesses>;
	/** Ends the process `pid`, only when it is a Julia process that no Pollis holds any more. Resolves whether it was ended. */
	endJulia(pid: number): Promise<boolean>;
}

/** What a Julia process started by Pollis or the Julia extension is for, from the script it runs. */
export type JuliaRole = 'repl' | 'notebook' | 'languageServer' | 'testItems' | 'debugger' | 'pdf' | 'eventStudies' | 'askIndex' | 'askCompare' | 'documents' | 'vignette' | 'precompile' | 'alerts' | 'install' | 'pluto' | 'julia';

const JULIA_ROLES: readonly [RegExp, JuliaRole][] = [
	[/terminalserver[\\/]terminalserver\.jl/, 'repl'],
	[/notebook[\\/]notebook\.jl/, 'notebook'],
	[/languageserver/i, 'languageServer'],
	[/testitemcontroller/i, 'testItems'],
	[/run_debugger\.jl/, 'debugger'],
	[/pdf_tools\.jl/, 'pdf'],
	[/event_studies\.jl/, 'eventStudies'],
	[/ask_index\.jl/, 'askIndex'],
	[/ask_compare\.jl/, 'askCompare'],
	[/compile_documents\.jl/, 'documents'],
	[/compile_vignette\.jl/, 'vignette'],
	[/precompile_background\.jl/, 'precompile'],
	[/alert_stats\.jl/, 'alerts'],
	[/install_\w+\.jl/, 'install'],
	[/Pluto/, 'pluto'],
];

/** Whether `command` runs Julia. */
export function isJulia(command: string): boolean {
	return /^"?[^"]*?[\\/]julia(?:\.exe)?"?(?:\s|$)/i.test(command) || /^julia(?:\.exe)?(?:\s|$)/i.test(command);
}

/** What the Julia process of `command` is for. */
export function juliaRole(command: string): JuliaRole {
	return JULIA_ROLES.find(([pattern]) => pattern.test(command))?.[1] ?? 'julia';
}

/** The version of Julia that `command` runs, when its path names it, as juliaup's do. */
export function juliaVersion(command: string): string | undefined {
	return /julia-(?<version>\d+\.\d+\.\d+)/.exec(command)?.groups?.version;
}

/** A Julia process, in the app that started it. */
export interface IMemoryJulia {
	readonly pid: number;
	readonly role: JuliaRole;
	readonly version: string | undefined;
	readonly memory: number;
	readonly elapsed: number;
}

/** An app and the processes it started, with their memory. */
export interface IMemoryGroup {
	/** The path of the app, or of its executable, so that two copies of one app are told apart. */
	readonly key: string;
	readonly name: string;
	readonly memory: number;
	/** How long its oldest process has been running, in seconds. */
	readonly elapsed: number;
	/** Whether it holds the main process of this Pollis. */
	readonly self: boolean;
	/** A Julia process whose app has quit: it is alone in the group. */
	readonly orphan: boolean;
	readonly julia: readonly IMemoryJulia[];
}

/** Whether `process` is the root of the processes: launchd, systemd or init, or the system on Windows. */
function isRoot(process: IMemoryProcess): boolean {
	return process.pid <= 4 || /^(?:\S*\/)?(?:launchd|systemd|init)(?:\s|$)/.test(process.command);
}

/** The executable of `command`: its first word, or its quoted path. */
function executableOf(command: string): string {
	return /^"(?<quoted>[^"]+)"/.exec(command)?.groups?.quoted ?? command.split(/\s/)[0];
}

/** The app of `command`: on macOS the outermost .app of its path; elsewhere its executable. */
function appOf(command: string, platform: string): { readonly key: string; readonly name: string } | undefined {
	if (platform === 'darwin') {
		// The first .app of the path is the outermost: a helper's .app sits inside its app's
		const bundle = /^(?<path>\/.*?\/(?<name>[^/]+?)\.app)(?=\/|\s|$)/.exec(command)?.groups;
		return bundle ? { key: bundle.path, name: bundle.name } : undefined;
	}
	const executable = executableOf(command);
	return executable ? { key: executable, name: executable.replace(/^.*[\\/]/, '').replace(/\.exe$/i, '') } : undefined;
}

/** Whether `command` is a shell or a login, which Julia's place is looked for above. */
function isShell(command: string): boolean {
	return /^(?:\S*[\\/])?-?(?:ba|z|fi|k|tc|c|da)?sh(?:\.exe)?(?:\s|$)/i.test(command) || /^(?:\S*[\\/])?(?:login|powershell|pwsh|cmd)(?:\.exe)?(?:\s|$)/i.test(command);
}

/**
 * The processes grouped by app, largest first: on macOS by the outermost .app of their path, as Activity Monitor
 * groups an app's helpers, and otherwise by their program. A Julia process belongs to the app that started it, found
 * above it past shells and other Julia processes: the Julia REPL of a Pollis is part of that Pollis. A Julia process
 * whose app has quit is a group of its own.
 */
export function groupProcesses(snapshot: IMemoryProcesses): IMemoryGroup[] {
	const byPid = new Map(snapshot.processes.map(process => [process.pid, process]));
	const parentOf = (process: IMemoryProcess) => process.ppid !== process.pid ? byPid.get(process.ppid) : undefined;
	const keys = new Map<number, { readonly key: string; readonly name: string; readonly orphan: boolean }>();
	const resolve = (process: IMemoryProcess): { readonly key: string; readonly name: string; readonly orphan: boolean } => {
		const known = keys.get(process.pid);
		if (known) {
			return known;
		}
		let result: { readonly key: string; readonly name: string; readonly orphan: boolean };
		if (isJulia(process.command)) {
			let ancestor = parentOf(process);
			for (let depth = 0; ancestor && !isRoot(ancestor) && depth < 64 && (isJulia(ancestor.command) || isShell(ancestor.command) || (snapshot.platform === 'darwin' && !appOf(ancestor.command, snapshot.platform))); depth++) {
				ancestor = parentOf(ancestor);
			}
			result = ancestor && !isRoot(ancestor) ? resolve(ancestor) : { key: `julia:${process.pid}`, name: 'Julia', orphan: true };
		} else {
			const executable = executableOf(process.command);
			result = { ...appOf(process.command, snapshot.platform) ?? { key: executable, name: executable.replace(/^.*[\\/]/, '').replace(/^-/, '').replace(/\.exe$/i, '') }, orphan: false };
		}
		keys.set(process.pid, result);
		return result;
	};
	const groups = new Map<string, { key: string; name: string; memory: number; elapsed: number; self: boolean; orphan: boolean; julia: IMemoryJulia[] }>();
	for (const process of snapshot.processes) {
		const { key, name, orphan } = resolve(process);
		let group = groups.get(key);
		if (!group) {
			group = { key, name, memory: 0, elapsed: 0, self: false, orphan, julia: [] };
			groups.set(key, group);
		}
		group.memory += process.memory;
		group.elapsed = Math.max(group.elapsed, process.elapsed);
		group.self ||= process.pid === snapshot.self;
		if (isJulia(process.command)) {
			group.julia.push({ pid: process.pid, role: juliaRole(process.command), version: juliaVersion(process.command), memory: process.memory, elapsed: process.elapsed });
		}
	}
	return [...groups.values()]
		.map(group => ({ ...group, julia: group.julia.sort((a, b) => b.memory - a.memory) }))
		.sort((a, b) => b.memory - a.memory);
}
