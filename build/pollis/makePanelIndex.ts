/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Write the panel index of the Pollis Agents plugin, build/pollis/panel-index.json.
//
//   node build/pollis/makePanelIndex.ts            write it
//   node build/pollis/makePanelIndex.ts --check    exit 1 if it is out of date
//
// The plugin lives in its own repository, Trumpingtons/pollis-plugins (the default marketplace of
// chat.plugins.marketplaces). Its builder (plugins/pollis-agents/scripts/makeToolbox.mjs there)
// runs without a source checkout: it reads this index from
// https://raw.githubusercontent.com/saragga/pollis/main/build/pollis/panel-index.json
// and then only the files a toolbox needs. The index resolves every menu entry the way
// makeExtension.ts does (panelResolver.ts): per panel, its id, title, the commands that open it
// with their menu titles, its TOML, the wiki and notebook files it ships, and whether it can go in
// a data-only toolbox (and why not). It lists the panels of Pollis (src/) and those of the
// published toolboxes (toolboxes/*), and the menus a toolbox can go in.
// Run it again, and commit the result, whenever a panel, a command, a menu title, a wiki or a
// notebook is added, renamed or removed, or a toolbox changes.

import * as fs from 'fs';
import * as path from 'path';
import { parseToml, type TomlValue } from '../../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';
import { ICON, materialFolders, NOTEBOOKS_DIR, PanelError, Pollis, ROOT, TOOLBOXES_DIR, TOP_LEVEL_MENUS, WIKI_DIR } from './panelResolver.ts';

const OUT_FILE = path.join(ROOT, 'build', 'pollis', 'panel-index.json');

/** A command that opens a panel, in the index. */
interface IndexCommand {
	readonly id: string;
	/** The model toggle the command opens the panel on, when it is not the panel's default. */
	readonly model?: string;
	/** The titles of the menu items that run the command. */
	readonly menuTitles: string[];
}

/** A panel in the index. */
interface IndexPanel {
	readonly id: string;
	readonly title?: string;
	/** `pollis` (a panel of Pollis itself) or `toolbox:<extension name>`. */
	readonly source: string;
	readonly commands: IndexCommand[];
	readonly portable: boolean;
	/** Why the panel cannot go in a data-only toolbox. */
	readonly reason?: string;
	readonly defaultModel?: string;
	readonly decisionFirstColumn?: string;
	/** The TOML, relative to the repository root. */
	readonly toml?: string;
	/** The folders the wiki and notebook files are in, relative to the repository root. */
	readonly wikiRoot?: string;
	readonly notebookRoot?: string;
	/** The files, relative to their root: `<folder>/<file>`. Every file of every folder the panel uses. */
	readonly wikis?: string[];
	readonly notebooks?: string[];
	/** The Julia packages the panel lists (its Powered by line). */
	readonly packages?: string[];
}

function relative(file: string): string {
	return path.relative(ROOT, file).split(path.sep).join('/');
}

/** Every file under `root/<folder>` for each folder, as `<folder>/<file>`, sorted. */
function filesOf(root: string, folders: Iterable<string>): string[] {
	const files: string[] = [];
	for (const folder of folders) {
		const dir = path.join(root, folder);
		if (!fs.existsSync(dir)) {
			continue;
		}
		for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
			if (entry.isFile() && !entry.name.startsWith('.')) {
				files.push(relative(path.join(entry.parentPath, entry.name)).slice(relative(root).length + 1));
			}
		}
	}
	return [...new Set(files)].sort();
}

function packagesOf(toml: TomlValue): string[] {
	return ((toml.packages as TomlValue[] | undefined) ?? []).map(pkg => pkg.name as string).filter(name => typeof name === 'string');
}

/** The material of a panel whose TOML is `tomlFile`, with its wikis and notebooks under the given roots. */
function material(id: string, tomlFile: string, wikiRoot: string, notebookRoot: string, warnings: string[]): Pick<IndexPanel, 'toml' | 'wikiRoot' | 'notebookRoot' | 'wikis' | 'notebooks' | 'packages'> {
	const toml = parseToml(fs.readFileSync(tomlFile, 'utf-8'));
	// A toolbox panel may name files of Pollis itself (e.g. vcm names tvm/...), which resolve there
	const folders = materialFolders({ id }, toml, message => warnings.push(message), { wiki: [wikiRoot, WIKI_DIR], notebook: [notebookRoot, NOTEBOOKS_DIR] });
	return {
		toml: relative(tomlFile),
		wikiRoot: relative(wikiRoot),
		notebookRoot: relative(notebookRoot),
		wikis: filesOf(wikiRoot, folders.wiki),
		notebooks: filesOf(notebookRoot, folders.notebook),
		packages: packagesOf(toml),
	};
}

function pollisPanels(pollis: Pollis, warnings: string[]): IndexPanel[] {
	const registrations = pollis.registrations();
	const ownCode = pollis.ownCodePanels().map((panel): IndexPanel => ({
		id: panel.id,
		...(panel.title ? { title: panel.title } : {}),
		source: 'pollis',
		commands: panel.commands.map(command => ({ id: command, menuTitles: [...new Set(pollis.menuItems(command).map(item => item.title))] })),
		portable: false,
		reason: panel.reason,
	}));
	return [...ownCode, ...pollis.scaffoldPanels().map(({ constant, id }): IndexPanel => {
		const opening = registrations.filter(r => r.panel === constant);
		const commands = [...new Map(opening.map(r => [r.command, r])).values()].map(r => ({
			id: r.command,
			...(r.model ? { model: r.model } : {}),
			menuTitles: [...new Set(pollis.menuItems(r.command).map(item => item.title))],
		}));
		const base = opening.find(r => !r.model) ?? opening[0];
		if (!base) {
			return { id, source: 'pollis', commands, portable: false, reason: 'no command opens it' };
		}
		try {
			const panel = pollis.resolve({ command: base.command });
			return {
				id,
				title: panel.title,
				source: 'pollis',
				commands,
				portable: true,
				defaultModel: base.model ? undefined : panel.defaultModel,
				...(panel.decisionFirstColumn ? { decisionFirstColumn: panel.decisionFirstColumn } : {}),
				...material(id, panel.toml, WIKI_DIR, NOTEBOOKS_DIR, warnings),
			};
		} catch (error) {
			if (!(error instanceof PanelError)) {
				throw error;
			}
			return { id, source: 'pollis', commands, portable: false, reason: error.message };
		}
	})];
}

/** The panels of the published toolboxes (toolboxes/<name>/package.json). */
function toolboxPanels(warnings: string[]): IndexPanel[] {
	const panels: IndexPanel[] = [];
	for (const name of fs.readdirSync(TOOLBOXES_DIR).sort()) {
		const folder = path.join(TOOLBOXES_DIR, name);
		const manifestFile = path.join(folder, 'package.json');
		if (!fs.existsSync(manifestFile)) {
			continue;
		}
		const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
		for (const toolbox of manifest.contributes?.pollisToolboxes ?? []) {
			for (const panel of toolbox.panels ?? []) {
				panels.push({
					id: panel.id,
					title: panel.title,
					source: `toolbox:${name}`,
					commands: [{ id: panel.command, menuTitles: [panel.menuTitle ?? panel.title] }],
					portable: true,
					defaultModel: panel.defaultModel,
					...(panel.decisionFirstColumn ? { decisionFirstColumn: panel.decisionFirstColumn } : {}),
					...material(panel.id, path.join(folder, panel.data), path.join(folder, 'wiki'), path.join(folder, 'notebooks'), warnings),
				});
			}
		}
	}
	return panels;
}

function main(): void {
	const check = process.argv.includes('--check');
	const pollis = new Pollis();
	const warnings: string[] = [];
	const panels = [...pollisPanels(pollis, warnings), ...toolboxPanels(warnings)].sort((a, b) => a.id.localeCompare(b.id) || a.source.localeCompare(b.source));
	const index = {
		version: 1,
		repository: 'saragga/pollis',
		icon: relative(ICON),
		menus: {
			topLevel: ['Toolboxes', 'Explore', 'Model', 'Simulate', 'Optimise'].filter(menu => TOP_LEVEL_MENUS.has(menu.toLowerCase())),
			submenus: pollis.submenus(),
		},
		panels,
	};
	const text = JSON.stringify(index, null, '\t') + '\n';
	const portable = panels.filter(panel => panel.portable);
	const summary = `${panels.length} panels, ${portable.length} portable (${portable.filter(panel => panel.source === 'pollis').length} of Pollis, ${portable.filter(panel => panel.source !== 'pollis').length} of the toolboxes), ${index.menus.submenus.length} submenus`;
	for (const warning of warnings) {
		console.warn(`Warning: ${warning}`);
	}
	if (check) {
		if (!fs.existsSync(OUT_FILE) || fs.readFileSync(OUT_FILE, 'utf-8') !== text) {
			console.error(`${relative(OUT_FILE)} is out of date: run node build/pollis/makePanelIndex.ts`);
			process.exit(1);
		}
		console.log(`${relative(OUT_FILE)} is up to date (${summary}).`);
		return;
	}
	fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
	fs.writeFileSync(OUT_FILE, text, 'utf-8');
	console.log(`Wrote ${relative(OUT_FILE)}: ${summary}.`);
	for (const panel of panels.filter(panel => !panel.portable)) {
		console.log(`  not portable: ${panel.id} (${panel.reason})`);
	}
}

main();
