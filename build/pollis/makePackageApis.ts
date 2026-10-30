/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Write the list of the sites Ask Pollis reads the Package APIs from,
// extensions/language-julia/scripts/terminalserver/package_apis.json: for each package in a panel's [[packages]] whose
// documentation Documenter made, with at least one docstring, the address of its stable version.
//
//   node build/pollis/makePackageApis.ts
//
// A package's site is looked for where it usually is: <owner>.github.io/<repository>, docs.sciml.ai for SciML, a link
// in its README; else its copy on JuliaHub, which builds the documentation of the packages in General. Its search
// index, search_index.js, tells that it is Documenter's and which entries are docstrings. A package's docstrings
// are read from the site itself when Pollis runs (pollisPackageApis.ts).
// Run it again, and commit the result, when a panel adds a package.

import * as fs from 'fs';
import * as path from 'path';
import { parseToml } from '../../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';

const ROOT = path.join(import.meta.dirname, '..', '..');
const WEBVIEWS = path.join(ROOT, 'src', 'vs', 'workbench', 'contrib', 'model', 'browser', 'webviews');
const OUT_FILE = path.join(ROOT, 'extensions', 'language-julia', 'scripts', 'terminalserver', 'package_apis.json');
/** How many packages are looked for at a time. */
const AT_ONCE = 14;
/** The sites that are not where a package's are looked for, or where a link in its README would mislead: that of HiGHS is of the solver, not of the Julia package; the panel of NetworkDynamics gives its site in place of its repository. */
const KNOWN_SITES: Record<string, string> = {
	'Catalyst.jl': 'https://docs.sciml.ai/Catalyst/stable',
	'DifferentialEquations.jl': 'https://docs.sciml.ai/DiffEqDocs/stable',
	'HiGHS.jl': 'https://docs.juliahub.com/General/HiGHS/stable',
	'NetworkDynamics.jl': 'https://juliadynamics.github.io/NetworkDynamics.jl/stable',
};

/** The packages of the panels, each with its repository. */
function packages(): Map<string, string> {
	const found = new Map<string, string>();
	for (const file of fs.readdirSync(WEBVIEWS).filter(file => file.endsWith('.toml'))) {
		const listed = parseToml(fs.readFileSync(path.join(WEBVIEWS, file), 'utf8')).packages;
		for (const entry of Array.isArray(listed) ? listed : []) {
			if (typeof entry.name === 'string' && typeof entry.github === 'string' && !found.has(entry.name)) {
				found.set(entry.name, entry.github.replace(/\/$/, ''));
			}
		}
	}
	return found;
}

async function read(url: string): Promise<{ readonly text: string; readonly url: string } | undefined> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
		return response.ok ? { text: await response.text(), url: response.url } : undefined;
	} catch {
		return undefined;
	}
}

/** The site at `base`, if it is Documenter's with a docstring: the address it ends up at, without the file. */
async function documenterSite(base: string): Promise<{ readonly site: string; readonly docstrings: number } | undefined> {
	const index = await read(`${base}/search_index.js`);
	if (!index?.text.slice(0, 400).includes('documenterSearchIndex')) {
		return undefined;
	}
	try {
		const { docs } = JSON.parse(index.text.slice(index.text.indexOf('{')).trim().replace(/;$/, '')) as { docs: { category?: string }[] };
		const docstrings = docs.filter(entry => entry.category !== 'page' && entry.category !== 'section').length;
		return docstrings ? { site: index.url.replace(/\/search_index\.js$/, ''), docstrings } : undefined;
	} catch {
		return undefined;
	}
}

/** The addresses in a package's README that may be its documentation. */
function readmeLinks(readme: string, name: string): string[] {
	const links = readme.match(/https?:\/\/[^\s)\]"'<>]+/g) ?? [];
	return links
		.filter(link => link.toLowerCase().includes(name.toLowerCase()) && /github\.io|docs\.|readthedocs|\.org|\.ai|\.dev/.test(link) && !/badge|shields|svg|png|doi\.org|arxiv|github\.com|codecov|zenodo|pkgs\.|juliaci|juliahub\.com\/ui/.test(link))
		.slice(0, 4)
		.map(link => link.split('#')[0].replace(/\/(?<version>stable|dev|latest)(?:\/.*)?$/, '/$<version>').replace(/\/$/, ''));
}

/** The site of the package `name`, with its repository at `github`. */
async function findSite(name: string, github: string): Promise<{ readonly site: string; readonly docstrings: number } | undefined> {
	if (KNOWN_SITES[name]) {
		return documenterSite(KNOWN_SITES[name]);
	}
	const short = name.replace(/\.jl$/, '');
	const match = /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repository>[^/]+)/.exec(github);
	const candidates: string[] = [];
	if (match?.groups) {
		const { owner, repository } = match.groups;
		const folder = repository.replace(/\.git$/, '');
		if (owner === 'SciML') {
			candidates.push(`https://docs.sciml.ai/${short}/stable`);
		}
		candidates.push(...['stable', 'dev', 'latest'].map(version => `https://${owner.toLowerCase()}.github.io/${folder}/${version}`));
		const readme = await read(`https://raw.githubusercontent.com/${owner}/${folder}/HEAD/README.md`);
		candidates.push(...readmeLinks(readme?.text ?? '', short));
	}
	candidates.push(`https://docs.juliahub.com/General/${short}/stable`);
	for (const candidate of candidates) {
		const site = await documenterSite(candidate);
		if (site) {
			return site;
		}
	}
	return undefined;
}

async function main(): Promise<void> {
	const pending = [...packages()].sort(([a], [b]) => a.localeCompare(b));
	const total = pending.length;
	const sites: Record<string, string> = {};
	const left = [...pending];
	await Promise.all(Array.from({ length: AT_ONCE }, async () => {
		for (let next = left.shift(); next; next = left.shift()) {
			const found = await findSite(...next);
			if (found) {
				sites[next[0]] = found.site;
			}
			console.log(`${next[0]}: ${found ? `${found.docstrings} docstrings, ${found.site}` : 'none'}`);
		}
	}));
	const sorted = Object.fromEntries(Object.entries(sites).sort(([a], [b]) => a.localeCompare(b)));
	fs.writeFileSync(OUT_FILE, `${JSON.stringify(sorted, null, '\t')}\n`);
	console.log(`${Object.keys(sorted).length} of ${total} packages`);
}

main();
