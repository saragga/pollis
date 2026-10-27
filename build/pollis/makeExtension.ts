/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Build a Pollis extension (a data-only toolbox) from a spec that names menu entries of Pollis
// and where they go.
//
//   node build/pollis/makeExtension.ts <spec.toml> [--overwrite]
//
// Writes toolboxes/<name>/: package.json (the pollisToolboxes contribution), panels/<id>.toml,
// wiki/<id>/, notebooks/<id>/, docs/<document>/, icon.png and a README.md to finish by hand (its "What it covers"
// column). Then `node build/pollis/packageToolboxes.ts` packages it with the other toolboxes.
// With mode = "copy" (the default) every panel is an independent copy: panel id <prefix>.<id>,
// command pollis.<name>.<id>, and its wiki and notebook folders <prefix>.<folder> (the TOML's
// file entries rewritten), so it has its own editor tab and ~/.pollis folders and never replaces
// Pollis' wikis and notebooks of the original panel (panelResolver.ts, renameMaterialFolders).
// Nothing in Pollis itself is changed: with mode = "move" the panels keep their command ids and
// the script prints what to remove from Pollis, which is done by hand (the Extension Agent skill,
// .agents/skills/extension-agent, does it after asking).
// The resolution of menu entries to panels is in panelResolver.ts, shared with makePanelIndex.ts
// (the panel index of the Pollis Agents plugin for users, in Trumpingtons/pollis-skills).
//
// The spec:
//   [extension]
//   name = "pollis-toolbox-finance"        folder under toolboxes/ and extension name
//   displayName = "Finance Toolbox"
//   description = "..."
//   version = "1.0.0"                      optional, default 1.0.0
//   mode = "copy"                          copy (independent copies, Pollis keeps the panels) or move
//   prefix = "finance"                     optional, copy mode: names the copies, default: the name without pollis-toolbox-
//
//   [[menu]]                               one or more: a submenu at the end of Extend (the user can move it)
//   id = "finance"
//   title = "Finance Toolbox"              the submenu's title
//   inline = false                         true: the entries go straight into Extend, no submenu
//   order = 4                              optional, the order among the toolboxes at the end of Extend
//
//   [[menu.items]]                         the entries, in the order wanted
//   command = "chiara.statistics.lm"       the origin menu entry's command, or panel = "lm"
//   title = "Linear Regression"            optional menu title, default: the origin's menu title
//   group = "1_models"                     optional, default "1_panels"
//   order = 1                              optional, default: the position in the list
//
//   [[menu.documents]]                     optional: the toolbox's documentation, in Help > Documentation > Toolboxes
//   title = "Finance Toolbox Guide"
//   description = "..."                    optional, a sentence or two
//   source = "guide/finance.tex"           the main .tex file, relative to the spec; its folder's .tex and .bib
//                                          files and its resources/ folder are copied to docs/<main file's name>/,
//                                          and Pollis compiles the document with PollisTeX when it is first opened
//
// Only scaffold panels can be packaged: a panel whose template passes its own JavaScript or CSS
// (illustrationOverrideJs, extraCss...) has code, and a data-only extension cannot hold code.

import * as fs from 'fs';
import * as path from 'path';
import { parseToml, type TomlValue } from '../../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';
import { ICON, materialFolders, NOTEBOOKS_DIR, PanelError, Pollis, renameMaterialFolders, ROOT, TOOLBOXES_DIR, WIKI_DIR, type ResolvedPanel, type SpecMenu } from './panelResolver.ts';

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

/** A package of a panel TOML's [[packages]] for the README's Powered by column: a link to its web page, when it has one. */
function packageLink(pkg: TomlValue): string {
	const url = pkg.github ?? pkg.url ?? pkg.docs;
	return typeof url === 'string' ? `[${pkg.name}](${url})` : String(pkg.name);
}

function copyFolder(from: string, to: string): number {
	if (!fs.existsSync(from)) {
		return 0;
	}
	fs.cpSync(from, to, { recursive: true });
	return fs.readdirSync(to, { recursive: true }).length;
}

/** Copies a document's sources, the folder's top-level .tex and .bib files and its resources/ folder, as compile_vignette.jl reads them. */
function copyDocument(source: string, to: string): number {
	const from = path.dirname(source);
	fs.mkdirSync(to, { recursive: true });
	let files = 0;
	for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
		if (entry.isFile() && /\.(tex|bib)$/.test(entry.name)) {
			fs.copyFileSync(path.join(from, entry.name), path.join(to, entry.name));
			files++;
		}
	}
	return files + copyFolder(path.join(from, 'resources'), path.join(to, 'resources'));
}

function main(): void {
	const [specFile, ...flags] = process.argv.slice(2);
	if (!specFile) {
		fail('usage: node build/pollis/makeExtension.ts <spec.toml> [--overwrite]');
	}
	const spec = parseToml(fs.readFileSync(specFile, 'utf-8'));
	const extension = spec.extension as TomlValue | undefined;
	const menus = (spec.menu as SpecMenu[] | undefined) ?? [];
	if (!extension?.name || !extension.displayName || !menus.length) {
		fail('the spec needs [extension] with name and displayName, and at least one [[menu]]');
	}
	const name = extension.name as string;
	if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
		fail(`the extension name ${name} must be lower case letters, digits and hyphens`);
	}
	const mode = (extension.mode as string | undefined) ?? 'copy';
	if (mode !== 'copy' && mode !== 'move') {
		fail(`mode must be copy or move, not ${mode}`);
	}
	const prefix = (extension.prefix as string | undefined) ?? name.replace(/^pollis-toolbox-/, '');
	if (!/^[a-z0-9][a-z0-9-]*$/.test(prefix)) {
		fail(`the prefix ${prefix} must be lower case letters, digits and hyphens`);
	}
	const folder = path.join(TOOLBOXES_DIR, name);
	if (fs.existsSync(folder)) {
		if (!flags.includes('--overwrite')) {
			fail(`${path.relative(ROOT, folder)} exists: pass --overwrite to write it again`);
		}
		fs.rmSync(folder, { recursive: true });
	}

	const pollis = new Pollis();
	const seen = new Set<string>();
	const toolboxes = [];
	const readmeRows: string[] = [];
	const documentRows: string[] = [];
	const documentNames = new Set<string>();
	const removals: string[] = [];
	for (const menu of menus) {
		if (!menu.id || !menu.title) {
			fail('every [[menu]] needs an id and a title');
		}
		const panels = [];
		for (const [index, item] of (menu.items ?? []).entries()) {
			let panel: ResolvedPanel;
			try {
				panel = pollis.resolve(item);
			} catch (error) {
				fail(error instanceof PanelError ? error.message : String(error));
			}
			if (seen.has(panel.id)) {
				fail(`the panel ${panel.id} is listed twice`);
			}
			seen.add(panel.id);
			const tomlText = fs.readFileSync(panel.toml, 'utf-8');
			const toml = parseToml(tomlText);
			const material = materialFolders(panel, toml);
			// Copy mode: the copy's id and the folders it ships get the prefix; move mode keeps them
			const shipped = new Set([...[...material.wiki].filter(name => fs.existsSync(path.join(WIKI_DIR, name))), ...[...material.notebook].filter(name => fs.existsSync(path.join(NOTEBOOKS_DIR, name)))]);
			const target = (name: string) => mode === 'copy' && shipped.has(name) ? `${prefix}.${name}` : name;
			const id = mode === 'copy' ? `${prefix}.${panel.id}` : panel.id;
			let panelToml = tomlText;
			if (mode === 'copy') {
				try {
					panelToml = renameMaterialFolders(tomlText, toml, shipped, prefix);
				} catch (error) {
					fail(`${panel.id}: ${error instanceof PanelError ? error.message : String(error)}`);
				}
			}

			fs.mkdirSync(path.join(folder, 'panels'), { recursive: true });
			fs.writeFileSync(path.join(folder, 'panels', `${id}.toml`), panelToml);
			let wikis = 0;
			let notebooks = 0;
			for (const name of material.wiki) {
				wikis += copyFolder(path.join(WIKI_DIR, name), path.join(folder, 'wiki', target(name)));
			}
			for (const name of material.notebook) {
				notebooks += copyFolder(path.join(NOTEBOOKS_DIR, name), path.join(folder, 'notebooks', target(name)));
			}
			console.log(`${id}: ${panel.title} (${wikis} wiki files, ${notebooks} notebook files)`);

			panels.push({
				id,
				command: mode === 'move' ? panel.command : `pollis.${name}.${panel.id}`,
				title: panel.title,
				...(panel.menuTitle ? { menuTitle: panel.menuTitle } : {}),
				group: item.group ?? '1_panels',
				order: item.order ?? index + 1,
				data: `panels/${id}.toml`,
				defaultModel: panel.defaultModel,
				...(panel.decisionFirstColumn ? { decisionFirstColumn: panel.decisionFirstColumn } : {}),
			});
			const powered = ((toml.packages as TomlValue[] | undefined) ?? []).map(packageLink).join(', ');
			readmeRows.push(`| ${panel.menuTitle ?? panel.title} | TODO | ${powered} |`);
			const materialPaths = [...[...material.wiki].map(name => path.join(WIKI_DIR, name)), ...[...material.notebook].map(name => path.join(NOTEBOOKS_DIR, name))].filter(fs.existsSync);
			removals.push(`${panel.id}:`, ...panel.origin.map(where => `  ${where}`), ...materialPaths.map(materialPath => `  ${path.relative(ROOT, materialPath)}/`));
		}
		if (!panels.length) {
			fail(`the menu ${menu.id} has no [[menu.items]]`);
		}
		const documents = [];
		for (const document of menu.documents ?? []) {
			if (!document.title || !document.source) {
				fail(`every [[menu.documents]] of ${menu.id} needs a title and a source`);
			}
			const source = path.resolve(path.dirname(specFile), document.source);
			const documentName = path.basename(source, '.tex');
			if (!/^[A-Za-z0-9_-]+\.tex$/.test(path.basename(source)) || !fs.existsSync(source)) {
				fail(`the document ${document.title} names ${document.source}, which is not a .tex file that exists`);
			}
			if (documentNames.has(documentName)) {
				fail(`two documents have the main file ${documentName}.tex`);
			}
			documentNames.add(documentName);
			const files = copyDocument(source, path.join(folder, 'docs', documentName));
			console.log(`docs/${documentName}: ${document.title} (${files} files)`);
			documents.push({
				title: document.title,
				...(document.description ? { description: document.description } : {}),
				source: `docs/${documentName}/${documentName}.tex`,
			});
			documentRows.push(`- **${document.title}**${document.description ? `: ${document.description}` : ''}`);
		}
		toolboxes.push({
			id: menu.id,
			title: menu.title,
			...(menu.inline ? { inline: true } : {}),
			...(menu.order !== undefined ? { order: menu.order } : {}),
			panels,
			...(documents.length ? { documents } : {}),
		});
	}

	const manifest = {
		name,
		displayName: extension.displayName,
		description: extension.description ?? '',
		version: extension.version ?? '1.0.0',
		publisher: 'pollis',
		author: 'Pollis',
		license: 'AGPL-3.0',
		icon: 'icon.png',
		repository: { type: 'git', url: 'https://github.com/saragga/pollis' },
		engines: { vscode: '*' },
		categories: ['Other'],
		contributes: { pollisToolboxes: toolboxes },
	};
	fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
	fs.copyFileSync(ICON, path.join(folder, 'icon.png'));

	const where = menus.map(menu => menu.inline ? 'adds its panels to the end of the **Extend** menu' : `adds the **${menu.title}** submenu to the end of the **Extend** menu`).join(', and ');
	const readme = [
		`# ${extension.displayName}`,
		'',
		(extension.description as string | undefined) ?? '',
		'',
		`Installing it ${where}; its **Edit** button in the Installed section of the Extensions pane moves it, or any of its panels, to another menu. Each panel has key points, a decision table, example code, Next Steps, wikis and notebook tutorials.`,
		'',
		'## Panels',
		'',
		'| Panel | What it covers | Powered by |',
		'|---|---|---|',
		...readmeRows,
		'',
		...(documentRows.length ? ['## Documentation', '', 'In **Help > Documentation > Toolboxes**, compiled from its LaTeX sources the first time it is opened:', '', ...documentRows, ''] : []),
		'## Requirements',
		'',
		'Julia. Each panel lists the Julia packages it uses on its Powered by line and offers to install the missing ones.',
		'',
		'## License',
		'',
		'AGPL-3.0',
		'',
	].join('\n');
	fs.writeFileSync(path.join(folder, 'README.md'), readme);

	console.log(`\nWrote ${path.relative(ROOT, folder)}/ (${seen.size} panels, mode ${mode}).`);
	console.log('Next: fill the "What it covers" column of its README.md, then run node build/pollis/packageToolboxes.ts.');
	if (mode === 'move') {
		console.log('\nThe panels keep their command ids: remove them from Pollis, or both will register them:');
		console.log(removals.join('\n'));
	}
}

main();
