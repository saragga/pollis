/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IPathService } from '../../../services/path/common/pathService.js';

// The Julia packages on this computer, read without Julia: those developed, in ~/.julia/dev/NAME, and those installed
// in the Julia depot, ~/.julia/packages/NAME/SLUG, one folder for each version. The Package Vignettes page reads their
// vignettes, Manage Challenge Datasets the forecasting datasets of PollisCompetitions.jl.

/** Compares versions such as 0.10.1 and 0.9.0 by their numbers. */
export function compareVersions(a: string, b: string): number {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const difference = (pa[i] || 0) - (pb[i] || 0);
		if (difference) {
			return difference;
		}
	}
	return 0;
}

/** The folders inside `folder`, none when it does not exist. */
export async function subfolders(fileService: IFileService, folder: URI): Promise<URI[]> {
	try {
		return ((await fileService.resolve(folder)).children ?? []).filter(child => child.isDirectory).map(child => child.resource);
	} catch {
		return [];
	}
}

/**
 * The packages that the environments in Julia's log of the manifests it has used (~/.julia/logs/manifest_usage.toml)
 * hold, as NAME@VERSION; undefined without the log. A copy in the depot that none of them holds is left over from an
 * update or a removal, until Julia's garbage collection deletes it.
 */
export async function packagesInUse(fileService: IFileService, julia: URI): Promise<Set<string> | undefined> {
	let log: string;
	try {
		log = (await fileService.readFile(joinPath(julia, 'logs', 'manifest_usage.toml'))).value.toString();
	} catch {
		return undefined;
	}
	const manifests = [...log.matchAll(/^\[\["(?<path>.+)"\]\]$/gm)].map(match => (match.groups?.path ?? '').replace(/\\\\/g, '\\'));
	const used = new Set<string>();
	await Promise.all(manifests.map(async manifest => {
		try {
			const text = (await fileService.readFile(URI.file(manifest))).value.toString();
			for (const entry of text.split(/^\[\[deps\./m).slice(1)) {
				used.add(`${entry.slice(0, entry.indexOf(']]'))}@${/^version\s*=\s*"(?<version>[^"]+)"/m.exec(entry)?.groups?.version ?? ''}`);
			}
		} catch {
			// An environment since deleted
		}
	}));
	return used;
}

/** The version in the Project.toml of the package in `root`. */
export async function projectVersion(fileService: IFileService, root: URI): Promise<string> {
	try {
		return /^version\s*=\s*"(?<version>[^"]+)"/m.exec((await fileService.readFile(joinPath(root, 'Project.toml'))).value.toString())?.groups?.version ?? '';
	} catch {
		return '';
	}
}

/**
 * The folder of the Julia package `name` on this computer: developed (~/.julia/dev/NAME), else installed in the depot,
 * of the versions that an environment holds the newest; undefined when it is not on this computer.
 */
export async function juliaPackageFolder(fileService: IFileService, pathService: IPathService, name: string): Promise<URI | undefined> {
	const julia = joinPath(pathService.userHome({ preferLocal: true }), '.julia');
	const developed = joinPath(julia, 'dev', name);
	if (await fileService.exists(joinPath(developed, 'Project.toml'))) {
		return developed;
	}
	const versions = await subfolders(fileService, joinPath(julia, 'packages', name));
	const used = await packagesInUse(fileService, julia);
	const known = await Promise.all(versions.map(async folder => ({ folder, version: await projectVersion(fileService, folder) })));
	const inUse = used ? known.filter(({ version }) => used.has(`${name}@${version}`)) : known;
	return inUse.sort((a, b) => compareVersions(b.version, a.version))[0]?.folder;
}
