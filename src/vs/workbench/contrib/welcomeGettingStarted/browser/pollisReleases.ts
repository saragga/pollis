/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { joinPath } from '../../../../base/common/resources.js';
import * as semver from '../../../../base/common/semver/semver.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { asJson, asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';

// The latest versions found and when they were looked up, so that GitHub is asked at most once a day.
const LATEST_VERSIONS_KEY = 'pollis.welcome.latestVersions';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000;

/**
 * A package Pollis relies on: where its latest version is published and where its releases are described.
 */
interface IPollisPackage {
	readonly name: string;
	/** A Versions.toml of the General registry, or a Project.toml on GitHub. */
	readonly versions: string;
	readonly releases: string;
}

const PACKAGES: readonly IPollisPackage[] = [
	{ name: 'DBInterface', versions: 'https://raw.githubusercontent.com/JuliaRegistries/General/master/D/DBInterface/Versions.toml', releases: 'https://github.com/JuliaDatabases/DBInterface.jl/releases' },
	{ name: 'PollisDatasets', versions: 'https://raw.githubusercontent.com/Trumpingtons/PollisDatasets.jl/main/Project.toml', releases: 'https://github.com/Trumpingtons/PollisDatasets.jl' },
	{ name: 'PollisTeX', versions: 'https://raw.githubusercontent.com/Trumpingtons/PollisTeX.jl/main/Project.toml', releases: 'https://github.com/Trumpingtons/PollisTeX.jl' },
];

const JULIA_LATEST_RELEASE = 'https://api.github.com/repos/JuliaLang/julia/releases/latest';

interface ILatestVersions {
	readonly checked: number;
	/** The latest version and its release page, by name: Julia and each package. */
	readonly versions: Record<string, { readonly version: string; readonly url: string } | undefined>;
}

/**
 * Pollis: a release newer than the one the user has, of Julia or of a package Pollis relies on.
 */
export interface IPollisRelease {
	/** Name and version, which identify the announcement when it is dismissed. */
	readonly id: string;
	readonly name: string;
	readonly version: string;
	readonly installed: string;
	readonly url: string;
}

/**
 * Pollis: finds the releases the welcome page announces. Julia counts only its stable releases (GitHub never makes
 * a beta or release candidate the latest release); a package counts only when it is installed, in the environment
 * Julia loads it from first.
 */
export class PollisReleases {

	private latest: Promise<ILatestVersions> | undefined;

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
	) { }

	/**
	 * The releases newer than what the user has, for the Julia `juliaVersion` (the one the Julia REPL runs). None
	 * until that version is known, since the installed packages depend on it.
	 */
	async getReleases(juliaVersion: string | undefined): Promise<IPollisRelease[]> {
		if (!juliaVersion || !semver.valid(juliaVersion)) {
			return [];
		}
		this.latest ??= this.getLatestVersions();
		const latest = await this.latest;
		const installed = await this.getInstalledVersions(juliaVersion);
		installed.set('Julia', juliaVersion);
		const releases: IPollisRelease[] = [];
		for (const name of ['Julia', ...PACKAGES.map(p => p.name)]) {
			const newest = latest.versions[name];
			const current = installed.get(name);
			if (newest && current && semver.valid(newest.version) && semver.valid(current) && semver.lt(current, newest.version)) {
				releases.push({ id: `${name}@${newest.version}`, name, version: newest.version, installed: current, url: newest.url });
			}
		}
		return releases;
	}

	/**
	 * The latest versions, from GitHub when they were last looked up more than a day ago, stored otherwise.
	 */
	private async getLatestVersions(): Promise<ILatestVersions> {
		let stored: ILatestVersions | undefined;
		try {
			stored = JSON.parse(this.storageService.get(LATEST_VERSIONS_KEY, StorageScope.APPLICATION, 'null')) ?? undefined;
		} catch {
			stored = undefined;
		}
		if (stored && Date.now() - stored.checked < CHECK_INTERVAL) {
			return stored;
		}
		const found = await Promise.all([
			this.getLatestJulia().then(release => ['Julia', release] as const),
			...PACKAGES.map(p => this.getLatestPackage(p).then(version => [p.name, version ? { version, url: p.releases } : undefined] as const)),
		]);
		// Offline nothing is found: the versions found before are kept, and looked up again next time.
		if (found.every(([, release]) => !release)) {
			return stored ?? { checked: 0, versions: {} };
		}
		const versions: ILatestVersions['versions'] = {};
		for (const [name, release] of found) {
			versions[name] = release ?? stored?.versions[name];
		}
		const latest = { checked: Date.now(), versions };
		this.storageService.store(LATEST_VERSIONS_KEY, JSON.stringify(latest), StorageScope.APPLICATION, StorageTarget.MACHINE);
		return latest;
	}

	private async getLatestJulia(): Promise<{ version: string; url: string } | undefined> {
		try {
			const context = await this.requestService.request({ type: 'GET', url: JULIA_LATEST_RELEASE, callSite: 'pollis.welcome.juliaRelease' }, CancellationToken.None);
			if (!isSuccess(context)) {
				return undefined;
			}
			const release = await asJson<{ tag_name?: string; html_url?: string; prerelease?: boolean }>(context);
			const version = release?.tag_name?.replace(/^v/, '');
			return version && !release?.prerelease && release?.html_url ? { version, url: release.html_url } : undefined;
		} catch {
			return undefined;
		}
	}

	/**
	 * The latest version of `pkg`: the newest one not yanked in a registry's Versions.toml, or the version in a Project.toml.
	 */
	private async getLatestPackage(pkg: IPollisPackage): Promise<string | undefined> {
		try {
			const context = await this.requestService.request({ type: 'GET', url: pkg.versions, callSite: 'pollis.welcome.packageRelease' }, CancellationToken.None);
			if (!isSuccess(context)) {
				return undefined;
			}
			const text = (await asText(context)) ?? '';
			if (pkg.versions.endsWith('/Project.toml')) {
				return /^version\s*=\s*"(?<version>[^"]+)"/m.exec(text)?.groups?.version;
			}
			const versions: string[] = [];
			for (const match of text.matchAll(/^\["(?<version>[^"]+)"\]\n(?<body>(?:(?!\[).*(?:\n|$))*)/gm)) {
				const version = match.groups?.version;
				if (version && semver.valid(version) && !/^yanked\s*=\s*true/m.test(match.groups?.body ?? '')) {
					versions.push(version);
				}
			}
			return versions.sort(semver.rcompare)[0];
		} catch {
			return undefined;
		}
	}

	/**
	 * The installed versions of the packages, read from the Manifest.toml of the user's default environment and of
	 * Pollis' own, for the minor version of `juliaVersion`. The user's comes first, as in Julia's load path.
	 */
	private async getInstalledVersions(juliaVersion: string): Promise<Map<string, string>> {
		const home = this.pathService.userHome({ preferLocal: true });
		const minor = `v${semver.major(juliaVersion)}.${semver.minor(juliaVersion)}`;
		const manifests = [
			joinPath(home, '.julia', 'environments', minor, 'Manifest.toml'),
			joinPath(home, '.pollis', 'julia', 'environments', minor, 'Manifest.toml'),
		];
		const installed = new Map<string, string>();
		for (const manifest of manifests) {
			const text = await this.readFile(manifest);
			for (const pkg of PACKAGES) {
				const version = text && !installed.has(pkg.name) ? manifestVersion(text, pkg.name) : undefined;
				if (version) {
					installed.set(pkg.name, version);
				}
			}
		}
		return installed;
	}

	private async readFile(file: URI): Promise<string | undefined> {
		try {
			return (await this.fileService.readFile(file)).value.toString();
		} catch {
			return undefined;
		}
	}
}

/**
 * The version of `name` in the Manifest.toml `text`: the `version` line of its `[[deps.name]]` entry.
 */
function manifestVersion(text: string, name: string): string | undefined {
	const start = text.indexOf(`[[deps.${name}]]`);
	if (start < 0) {
		return undefined;
	}
	const next = text.indexOf('[[', start + 2);
	const entry = text.slice(start, next < 0 ? undefined : next);
	return /^version\s*=\s*"(?<version>[^"]+)"/m.exec(entry)?.groups?.version;
}
