/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import { IMemoryMonitorService, IMemoryProcess, IMemoryProcesses, IMemoryReading, groupProcesses } from '../common/memoryMonitor.js';

// Pollis: reads the memory of the computer with the tools of each system: vm_stat, ps and top on macOS, /proc/meminfo
// and ps on Linux, and Windows' own counters and process list. Nothing is installed, and nothing leaves the computer.

/** The longest command line kept, in characters: enough for the script a process runs. */
const MAX_COMMAND = 1000;

/** The output of `file` run with `args`, without a shell. */
function run(file: string, args: readonly string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(file, args, { maxBuffer: 32 * 1024 * 1024, timeout: 20_000, windowsHide: true }, (error, stdout) => error ? reject(error) : resolve(stdout));
	});
}

/** Seconds from the `etime` of ps: [[dd-]hh:]mm:ss. */
function seconds(etime: string): number {
	const match = /^(?:(?<days>\d+)-)?(?:(?<hours>\d+):)?(?<minutes>\d+):(?<seconds>\d+)$/.exec(etime.trim());
	const groups = match?.groups;
	return groups ? Number(groups.days ?? 0) * 86400 + Number(groups.hours ?? 0) * 3600 + Number(groups.minutes) * 60 + Number(groups.seconds) : 0;
}

/** Bytes from top's MEM column, such as 5546M, 856K or 1.2G (with a + or - when it is changing). */
function topBytes(value: string): number {
	const match = /^(?<number>[\d.]+)(?<unit>[BKMG])/.exec(value);
	const units: Record<string, number> = { B: 1, K: 1024, M: 1024 ** 2, G: 1024 ** 3 };
	return match?.groups ? Number(match.groups.number) * units[match.groups.unit] : 0;
}

export class MemoryMonitorService implements IMemoryMonitorService {

	async reading(): Promise<IMemoryReading> {
		const total = os.totalmem();
		if (process.platform === 'darwin') {
			// Activity Monitor's Memory Used: app memory (anonymous pages that cannot be purged), wired and compressed
			const stat = await run('vm_stat', []);
			const pageSize = Number(/page size of (?<size>\d+) bytes/.exec(stat)?.groups?.size ?? 4096);
			const pages = (name: string) => Number(new RegExp(`^${name}:\\s+(?<pages>\\d+)`, 'm').exec(stat)?.groups?.pages ?? 0);
			const used = (pages('Anonymous pages') - pages('Pages purgeable') + pages('Pages wired down') + pages('Pages occupied by compressor')) * pageSize;
			return { total, used: Math.min(total, used) };
		}
		if (process.platform === 'linux') {
			const meminfo = await fs.readFile('/proc/meminfo', 'utf8');
			const available = Number(/^MemAvailable:\s+(?<kilobytes>\d+)/m.exec(meminfo)?.groups?.kilobytes);
			if (available) {
				return { total, used: total - available * 1024 };
			}
		}
		return { total, used: total - os.freemem() };
	}

	async processes(): Promise<IMemoryProcesses> {
		const list = process.platform === 'win32' ? await this.windowsProcesses() : await this.unixProcesses();
		// This Pollis by its full path: started from a terminal, as Pollis Dev is, its command line may begin with a relative one
		return { self: process.pid, platform: process.platform, processes: list.map(entry => entry.pid === process.pid ? { ...entry, command: process.execPath } : entry) };
	}

	private async unixProcesses(): Promise<IMemoryProcess[]> {
		// ps gives the parents and the command lines; on macOS, top gives the memory as Activity Monitor counts it, with
		// what is compressed, which the resident set leaves out
		const [ps, top] = await Promise.all([
			run('ps', ['-Aww', '-o', 'pid=,ppid=,rss=,etime=,args=']),
			process.platform === 'darwin' ? run('top', ['-l', '1', '-stats', 'pid,mem']).catch(() => '') : Promise.resolve(''),
		]);
		const footprints = new Map<number, number>();
		for (const line of top.split('\n')) {
			const match = /^\s*(?<pid>\d+)\s+(?<memory>[\d.]+[BKMG][+-]?)\s*$/.exec(line);
			if (match?.groups) {
				footprints.set(Number(match.groups.pid), topBytes(match.groups.memory));
			}
		}
		const processes: IMemoryProcess[] = [];
		for (const line of ps.split('\n')) {
			const match = /^\s*(?<pid>\d+)\s+(?<ppid>\d+)\s+(?<rss>\d+)\s+(?<etime>\S+)\s+(?<command>.*)$/.exec(line);
			if (match?.groups) {
				const pid = Number(match.groups.pid);
				processes.push({
					pid,
					ppid: Number(match.groups.ppid),
					memory: footprints.get(pid) ?? Number(match.groups.rss) * 1024,
					elapsed: seconds(match.groups.etime),
					command: match.groups.command.slice(0, MAX_COMMAND),
				});
			}
		}
		return processes;
	}

	private async windowsProcesses(): Promise<IMemoryProcess[]> {
		const script = [
			'[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
			'$now = Get-Date',
			'Get-CimInstance Win32_Process | ForEach-Object {',
			'  $command = $_.CommandLine; if (-not $command) { $command = $_.ExecutablePath }; if (-not $command) { $command = $_.Name }',
			'  $elapsed = 0; if ($_.CreationDate) { $elapsed = [int]($now - $_.CreationDate).TotalSeconds }',
			'  "$($_.ProcessId)`t$($_.ParentProcessId)`t$($_.WorkingSetSize)`t$elapsed`t$($command -replace "[\\r\\n]+", " ")"',
			'}',
		].join('\n');
		const output = await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script]);
		const processes: IMemoryProcess[] = [];
		for (const line of output.split(/\r?\n/)) {
			const [pid, ppid, memory, elapsed, ...command] = line.split('\t');
			if (pid && /^\d+$/.test(pid)) {
				processes.push({ pid: Number(pid), ppid: Number(ppid), memory: Number(memory) || 0, elapsed: Number(elapsed) || 0, command: command.join('\t').slice(0, MAX_COMMAND) });
			}
		}
		return processes;
	}

	async endJulia(pid: number): Promise<boolean> {
		// Read again, so that only a Julia process that has outlived its app is ended, never one reused by another program
		const orphan = groupProcesses(await this.processes()).some(group => group.orphan && group.julia.some(julia => julia.pid === pid));
		if (!orphan) {
			return false;
		}
		try {
			process.kill(pid);
			return true;
		} catch {
			return false;
		}
	}
}
