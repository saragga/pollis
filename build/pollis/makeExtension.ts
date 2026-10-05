/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Build a Pollis extension (a data-only toolbox) from a spec that names menu entries of Pollis
// and where they go.
//
//   node build/pollis/makeExtension.ts <spec.toml> [--overwrite]
//
// Writes toolboxes/<name>/: package.json (the pollisToolboxes contribution), panels/<id>.toml,
// wiki/<id>/, notebooks/<id>/, icon.png and a README.md to finish by hand (its "What it covers"
// column). Then `node build/pollis/packageToolboxes.ts` packages it with the other toolboxes.
// With mode = "copy" (the default) every panel is an independent copy: panel id <prefix>.<id>,
// command pollis.<name>.<id>, and its wiki and notebook folders <prefix>.<folder> (the TOML's
// file entries rewritten), so it has its own editor tab and ~/.pollis folders and never replaces
// Pollis' wikis and notebooks of the original panel (panelResolver.ts, renameMaterialFolders).
// Nothing in Pollis itself is changed: with mode = "move" the panels keep their command ids and
// the script prints what to remove from Pollis, which is done by hand (the Extension Agent skill,
// .agents/skills/extension-agent, does it after asking).
// The resolution of menu entries to panels is in panelResolver.ts, shared with makePanelIndex.ts
// (the panel index of the Pollis Agents plugin for users, in Trumpingtons/pollis-plugins).
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
//   [[menu]]                               one or more: where the entries go
//   id = "finance"
//   title = "Finance Toolbox"              the submenu's title
//   menu = "Toolboxes"                     Toolboxes, Explore, Model, Simulate, Optimise or a submenu id
//   inline = false                         true: the entries go straight into that menu, no submenu
//   group = "2_toolboxes"                  optional, the group and order of the submenu in that menu
//   order = 4
//
//   [[menu.items]]                         the entries, in the order wanted
//   command = "chiara.statistics.lm"       the origin menu entry's command, or panel = "lm"
//   title = "Linear Regression"            optional menu title, default: the origin's menu title
//   group = "1_models"                     optional, default "1_panels"
//   order = 1                              optional, default: the position in the list
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

function copyFolder(from: string, to: string): number {
	if (!fs.existsSync(from)) {
		return 0;
	}
	fs.cpSync(from, to, { recursive: true });
	return fs.readdirSync(to, { recursive: true }).length;
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
	const removals: string[] = [];
	for (const menu of menus) {
		if (!menu.id || !menu.title) {
			fail('every [[menu]] needs an id and a title');
		}
		if (menu.menu && !pollis.isMenu(menu.menu)) {
			fail(`the menu ${menu.menu} does not exist (use Toolboxes, Explore, Model, Simulate, Optimise or a submenu id)`);
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
			const powered = ((toml.packages as TomlValue[] | undefined) ?? []).map(pkg => pkg.name as string).join(', ');
			readmeRows.push(`| ${panel.menuTitle ?? panel.title} | TODO | ${powered} |`);
			const materialPaths = [...[...material.wiki].map(name => path.join(WIKI_DIR, name)), ...[...material.notebook].map(name => path.join(NOTEBOOKS_DIR, name))].filter(fs.existsSync);
			removals.push(`${panel.id}:`, ...panel.origin.map(where => `  ${where}`), ...materialPaths.map(materialPath => `  ${path.relative(ROOT, materialPath)}/`));
		}
		if (!panels.length) {
			fail(`the menu ${menu.id} has no [[menu.items]]`);
		}
		toolboxes.push({
			id: menu.id,
			title: menu.title,
			...(menu.menu ? { menu: menu.menu } : {}),
			...(menu.inline ? { inline: true } : {}),
			...(menu.group ? { group: menu.group } : {}),
			...(menu.order !== undefined ? { order: menu.order } : {}),
			panels,
		});
	}

	const manifest = {
		name,
		displayName: extension.displayName,
		description: extension.description ?? '',
		version: extension.version ?? '1.0.0',
		publisher: 'pollis',
		license: 'AGPL-3.0-or-later',
		icon: 'icon.png',
		repository: { type: 'git', url: 'https://github.com/saragga/pollis' },
		engines: { vscode: '*' },
		categories: ['Other'],
		contributes: { pollisToolboxes: toolboxes },
	};
	fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
	fs.copyFileSync(ICON, path.join(folder, 'icon.png'));

	const where = menus.map(menu => {
		const parent = menu.menu ?? 'Toolboxes';
		return menu.inline ? `adds its panels to the **${parent}** menu` : `adds the **${menu.title}** submenu to the **${parent}** menu`;
	}).join(', and ');
	const readme = [
		`# ${extension.displayName}`,
		'',
		(extension.description as string | undefined) ?? '',
		'',
		`Installing it ${where}. Each panel has key points, a decision table, example code, Next Steps, wikis and notebook tutorials.`,
		'',
		'## Panels',
		'',
		'| Panel | What it covers | Powered by |',
		'|---|---|---|',
		...readmeRows,
		'',
		'## Requirements',
		'',
		'Julia. Each panel lists the Julia packages it uses on its Powered by line and offers to install the missing ones.',
		'',
		'## License',
		'',
		'AGPL-3.0-or-later.',
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
