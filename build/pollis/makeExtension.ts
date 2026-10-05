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
// Nothing in Pollis itself is changed: with mode = "move" the panels keep their command ids and
// the script prints what to remove from Pollis, which is done by hand (the Extension Agent skill,
// .agents/skills/extension-agent, does it after asking).
// The resolution of menu entries to panels is in panelResolver.ts, shared with makePanelIndex.ts
// (the panel index of the Extension Agent plugin for users, plugins/pollis-extension-agent).
//
// The spec:
//   [extension]
//   name = "pollis-toolbox-finance"        folder under toolboxes/ and extension name
//   displayName = "Finance Toolbox"
//   description = "..."
//   version = "1.0.0"                      optional, default 1.0.0
//   mode = "copy"                          copy (new command ids, Pollis keeps the panels) or move
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
import { ICON, materialFolders, NOTEBOOKS_DIR, PanelError, Pollis, ROOT, TOOLBOXES_DIR, WIKI_DIR, type ResolvedPanel, type SpecMenu } from './panelResolver.ts';

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

			fs.mkdirSync(path.join(folder, 'panels'), { recursive: true });
			fs.writeFileSync(path.join(folder, 'panels', `${panel.id}.toml`), tomlText);
			let wikis = 0;
			let notebooks = 0;
			for (const name of material.wiki) {
				wikis += copyFolder(path.join(WIKI_DIR, name), path.join(folder, 'wiki', name));
			}
			for (const name of material.notebook) {
				notebooks += copyFolder(path.join(NOTEBOOKS_DIR, name), path.join(folder, 'notebooks', name));
			}
			console.log(`${panel.id}: ${panel.title} (${wikis} wiki files, ${notebooks} notebook files)`);

			panels.push({
				id: panel.id,
				command: mode === 'move' ? panel.command : `pollis.${name}.${panel.id}`,
				title: panel.title,
				...(panel.menuTitle ? { menuTitle: panel.menuTitle } : {}),
				group: item.group ?? '1_panels',
				order: item.order ?? index + 1,
				data: `panels/${panel.id}.toml`,
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
