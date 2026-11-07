/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import { generateTypeScriptFromToml } from './lib/toml-to-ts.ts';
import { generatePollisBib, panelCommands, readReferencesDatabase, refreshReferenceCopies, REFERENCES_FOLDER } from './lib/pollis-bib.ts';
import { faqProblems, panelFaq, panelFaqItems, parseToml, tomlToPanelData } from '../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';
import { pinnedPackageFile } from './lib/pollis-packages.ts';
import * as task from './lib/task.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** The header of the files written here, which the lint rule header/header asks of every TypeScript file of Pollis, and the lint rule they are exempt from. */
const GENERATED_HEADER = [
	'/*---------------------------------------------------------------------------------------------',
	' *  Copyright (c) 2026 Antonio Saragga Seabra',
	' *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.',
	' *--------------------------------------------------------------------------------------------*/',
	'',
	// The data are JSON, whose strings are double-quoted but never shown to the user as they are
	'/* eslint-disable local/code-no-unexternalized-strings */',
	'',
];
const repoRoot = path.join(__dirname, '..');
const tomlOutDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/webviews');
const pollisBibPath = path.join(repoRoot, REFERENCES_FOLDER, 'pollis.bib');
const referencesDumpPath = path.join(repoRoot, REFERENCES_FOLDER, 'references.json');
const rssCataloguePath = path.join(repoRoot, 'src/vs/workbench/contrib/monitor/browser/rssCatalogue.data.ts');
const panelWikisPath = path.join(repoRoot, 'src/vs/workbench/contrib/compose/browser/panelWikis.data.ts');
const wikiDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/media/wiki');
const panelFaqPath = path.join(repoRoot, 'src/vs/workbench/contrib/compose/browser/media/ask/panelFaq.json');

/** Whether an entry of a panel's wikis is a separator between their sections. */
function hasSeparator(wiki: object): wiki is { separator: true } {
	return 'separator' in wiki && !!wiki.separator;
}

/** Whether a bundled wiki is still a stub: its title and "Not written yet." only. */
function isStubWiki(file: string): boolean {
	const wikiPath = path.join(wikiDir, file);
	if (!fs.existsSync(wikiPath)) {
		return false;
	}
	const body = fs.readFileSync(wikiPath, 'utf-8').replace(/^#[^\n]*\n/, '').trim();
	return body === 'Not written yet.';
}

/** Write a generated file only when its text changed, so that its date says when it last did. */
function writeIfChanged(file: string, text: string): void {
	if (!fs.existsSync(file) || fs.readFileSync(file, 'utf-8') !== text) {
		fs.writeFileSync(file, text, 'utf-8');
	}
}

export const compileTomlTask = task.define('compile-toml', async () => {
	const database = await readReferencesDatabase(repoRoot);
	const tomlFiles = fs.readdirSync(tomlOutDir).filter(f => f.endsWith('.toml'));
	for (const file of tomlFiles) {
		const acronym = file.replace(/\.toml$/, '');
		const tomlPath = path.join(tomlOutDir, file);
		const outPath = path.join(tomlOutDir, `${acronym}.data.ts`);
		const ts = generateTypeScriptFromToml(tomlPath, acronym, database.references);
		fs.writeFileSync(outPath, ts, 'utf-8');
		console.log(`[toml] Generated ${acronym}.data.ts`);
	}

	// The Pollis library of references, and the references with the panels that cite them, from PollisReferences.jl
	const library = generatePollisBib(repoRoot, database);
	if (library.unknownKeys.length) {
		throw new Error(`[toml] Reference keys not in PollisReferences.jl: ${library.unknownKeys.join(', ')}`);
	}
	writeIfChanged(pollisBibPath, library.bibtex);
	writeIfChanged(referencesDumpPath, library.dump);
	console.log(`[toml] Generated pollis.bib and references.json: ${library.works} works, ${library.occurrences} references to them`);

	// The panels' wikis with the commands that open the panels, for Help > Documentation > Panels
	const commands = panelCommands(repoRoot);
	const panels = tomlFiles.sort().flatMap(file => {
		const id = file.replace(/\.toml$/, '');
		const data = parseToml(fs.readFileSync(path.join(tomlOutDir, file), 'utf-8')) as { meta?: { title?: unknown }; wikis?: Record<string, unknown>[] };
		const wikis = (data.wikis ?? []).filter(wiki => !wiki.separator).map(wiki => wiki.bundled && typeof wiki.file === 'string' && isStubWiki(wiki.file) ? { ...wiki, stub: true } : wiki);
		return wikis.length && commands.has(id) ? [{ id, title: typeof data.meta?.title === 'string' ? data.meta.title : id, commands: commands.get(id), wikis }] : [];
	});
	writeIfChanged(panelWikisPath, [
		...GENERATED_HEADER,
		'// Generated by the compile-toml build task from the panels\' TOML files; do not edit.',
		'',
		`import { IModelWiki } from '../../model/browser/common/model.types.js';`,
		'',
		'/** The panels with wikis: their ids, titles, the commands that open them, and their wikis, `stub` when still "Not written yet.". */',
		`export const PANEL_WIKIS: readonly { readonly id: string; readonly title: string; readonly commands: readonly string[]; readonly wikis: readonly (IModelWiki & { readonly stub?: true })[] }[] = ${JSON.stringify(panels, null, '\t')};`,
		'',
	].join('\n'));
	const stubs = panels.reduce((count, panel) => count + panel.wikis.filter(wiki => wiki.stub).length, 0);
	console.log(`[toml] Generated panelWikis.data.ts: ${panels.length} panels, ${stubs} wikis not written yet`);

	// The Panel FAQ test set of Evaluate Answering Models: the hidden questions of the FAQ of every panel, closed questions
	const faqItems = tomlFiles.flatMap(file => {
		const data = parseToml(fs.readFileSync(path.join(tomlOutDir, file), 'utf-8'));
		const title = typeof (data.meta as { title?: unknown } | undefined)?.title === 'string' ? (data.meta as { title: string }).title : file.replace(/\.toml$/, '');
		const panel = tomlToPanelData(data);
		const unknownWikis = panelFaq(data).filter(entry => entry.wiki && !panel.wikis.some(wiki => !hasSeparator(wiki) && wiki.name === entry.wiki));
		if (unknownWikis.length) {
			throw new Error(`[toml] ${file}: the FAQ names wikis the panel does not have: ${unknownWikis.map(entry => entry.wiki).join(', ')}`);
		}
		const problems = faqProblems(data);
		for (const warning of problems.warnings) {
			console.warn(`[toml] ${file}: ${warning}`);
		}
		if (problems.errors.length) {
			throw new Error(`[toml] ${file}: the FAQ breaks its rules:\n${problems.errors.map(error => `  - ${error}`).join('\n')}`);
		}
		return panelFaqItems(data, title);
	});
	writeIfChanged(panelFaqPath, JSON.stringify(faqItems, null, 1) + '\n');
	console.log(`[toml] Generated panelFaq.json: ${faqItems.length} closed questions`);

	// The citations the Compose notebooks and the shipped methods keep for Pollis to read
	for (const file of refreshReferenceCopies(repoRoot, database.references)) {
		console.log(`[toml] Updated the reference in ${path.relative(repoRoot, file)}`);
	}

	// The feeds offered in Explore > RSS > RSS Feeds, from PollisRSS.jl, for when its newest version is not installed
	const catalogue = JSON.parse(await pinnedPackageFile(repoRoot, { name: 'PollisRSS', file: 'feeds.json', clone: 'POLLIS_RSS' }));
	writeIfChanged(rssCataloguePath, [
		...GENERATED_HEADER,
		'// Generated by the compile-toml build task from PollisRSS.jl, at the commit in build/PollisRSS.commit; do not edit.',
		'',
		`import { IRssCatalogue } from './rssCatalogue.js';`,
		'',
		`export const SHIPPED_CATALOGUE: IRssCatalogue = ${JSON.stringify(catalogue, null, '\t')};`,
		'',
	].join('\n'));
	console.log(`[toml] Generated rssCatalogue.data.ts: ${catalogue.topics.length} topics`);
});

gulp.task(compileTomlTask);
