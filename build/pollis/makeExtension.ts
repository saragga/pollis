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
// .claude/skills/extension-agent, does it after asking).
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

const ROOT = path.join(import.meta.dirname, '..', '..');
const CONTRIB_DIR = path.join(ROOT, 'src', 'vs', 'workbench', 'contrib');
const MODEL_DIR = path.join(CONTRIB_DIR, 'model', 'browser');
const WEBVIEWS_DIR = path.join(MODEL_DIR, 'webviews');
const WIKI_DIR = path.join(MODEL_DIR, 'media', 'wiki');
const NOTEBOOKS_DIR = path.join(MODEL_DIR, 'media', 'notebooks');
const ICON = path.join(CONTRIB_DIR, 'extensions', 'browser', 'media', 'pollis-toolbox-icon.png');
const TOOLBOXES_DIR = path.join(ROOT, 'toolboxes');

/** The scaffold options a data-only panel can carry (the extension point's fields). */
const PORTABLE_OPTIONS = new Set(['title', 'defaultModel', 'decisionFirstColumn']);
const TOP_LEVEL_MENUS = new Set(['toolboxes', 'explore', 'model', 'simulate', 'optimise']);

/** A menu entry of the spec. */
interface SpecItem {
	readonly command?: string;
	readonly panel?: string;
	readonly title?: string;
	readonly group?: string;
	readonly order?: number;
}

/** A destination menu of the spec. */
interface SpecMenu {
	readonly id: string;
	readonly title: string;
	readonly menu?: string;
	readonly inline?: boolean;
	readonly group?: string;
	readonly order?: number;
	readonly items: SpecItem[];
}

/** What the script found in Pollis about one menu entry. */
interface ResolvedPanel {
	readonly id: string;
	readonly command: string;
	readonly title: string;
	readonly menuTitle?: string;
	readonly defaultModel: string;
	readonly decisionFirstColumn?: string;
	readonly toml: string;
	/** Where Pollis registers the panel, for a move. */
	readonly origin: string[];
}

/** A source file of the contributions: its path and text. */
interface Source {
	readonly file: string;
	readonly text: string;
}

function listTs(folder: string): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
		const full = path.join(folder, entry.name);
		if (entry.isDirectory()) {
			files.push(...listTs(full));
		} else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.data.ts')) {
			files.push(full);
		}
	}
	return files;
}

function lineOf(source: Source, index: number): string {
	return `${path.relative(ROOT, source.file)}:${source.text.slice(0, index).split('\n').length}`;
}

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

/** A string literal's value: '...' or "..." with \ escapes. */
function unquote(literal: string): string {
	return literal.slice(1, -1).replace(/\\(.)/g, '$1');
}

const STRING = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`;

class Pollis {
	private readonly sources: Source[];
	/** String constants by name, e.g. HT_COMMAND_ID -> chiara.statistics.ht. */
	private readonly constants = new Map<string, string>();

	constructor() {
		this.sources = listTs(CONTRIB_DIR).map(file => ({ file, text: fs.readFileSync(file, 'utf-8') }));
		for (const source of this.sources) {
			for (const match of source.text.matchAll(new RegExp(String.raw`const (?<name>[A-Z][A-Z0-9_]*)\s*(?::\s*string\s*)?=\s*(?<value>${STRING})\s*;`, 'g'))) {
				this.constants.set(match.groups!.name, unquote(match.groups!.value));
			}
		}
	}

	/** A command id written as a literal or a constant. */
	private value(expression: string): string | undefined {
		return /^['"]/.test(expression) ? unquote(expression) : this.constants.get(expression);
	}

	/**
	 * The commands that open a scaffold panel, in any of the forms Pollis uses (any spacing):
	 *   registerCommand(<command>, accessor => openScaffoldWebview(accessor, LM_PANEL[, '<model>']))
	 *   registerCommand(<command>, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, BOOT_PANEL))
	 *   const GLM_SERVICES = (accessor: ServicesAccessor, initialFamily?: string) => openScaffoldWebview(accessor, GLM_PANEL, initialFamily);
	 *   registerCommand(<command>, accessor => GLM_SERVICES(accessor[, '<model>']))  or  registerCommand(<command>, SBI_OPEN)
	 */
	private registrations(): { command: string; panel: string; model?: string; source: Source; index: number }[] {
		const result: { command: string; panel: string; model?: string; source: Source; index: number }[] = [];
		const command = String.raw`registerCommand\(\s*(?<command>${STRING}|[A-Z][A-Z0-9_]*)\s*,\s*`;
		const arrow = String.raw`(?:\(\s*accessor(?:\s*:\s*ServicesAccessor)?\s*\)|accessor)\s*=>\s*\{?\s*`;
		const model = String.raw`(?:\s*,\s*(?<model>${STRING}))?`;
		for (const source of this.sources) {
			const add = (match: RegExpMatchArray, panel: string) => {
				const id = this.value(match.groups!.command);
				if (id) {
					result.push({ command: id, panel, model: match.groups!.model && unquote(match.groups!.model), source, index: match.index! });
				}
			};
			for (const match of source.text.matchAll(new RegExp(String.raw`${command}${arrow}openScaffoldWebview\(\s*accessor\s*,\s*(?<panel>[A-Z][A-Z0-9_]*)${model}\s*\)`, 'g'))) {
				add(match, match.groups!.panel);
			}
			const helpers = /const (?<name>[A-Z][A-Z0-9_]*)\s*=\s*\(\s*accessor(?:\s*:\s*ServicesAccessor)?(?:\s*,\s*\w+\??(?:\s*:\s*string)?)?\s*\)\s*=>\s*openScaffoldWebview\(\s*accessor\s*,\s*(?<panel>[A-Z][A-Z0-9_]*)(?:\s*,\s*\w+)?\s*\)/g;
			for (const helper of source.text.matchAll(helpers)) {
				const name = helper.groups!.name;
				for (const match of source.text.matchAll(new RegExp(String.raw`${command}(?:${name}\s*\)|${arrow}${name}\(\s*accessor${model}\s*\))`, 'g'))) {
					add(match, helper.groups!.panel);
				}
			}
		}
		return result;
	}

	/** The menu items that run `command`: their titles and where they are. */
	private menuItems(command: string): { title: string; where: string }[] {
		const result = [];
		for (const source of this.sources) {
			const pattern = new RegExp(String.raw`command:\s*\{\s*id:\s*(?<id>${STRING}|[A-Z][A-Z0-9_]*),\s*title:\s*localize\(\s*(?:${STRING}|\{[^}]*\}),\s*(?<title>${STRING})`, 'g');
			for (const match of source.text.matchAll(pattern)) {
				if (this.value(match.groups!.id) === command) {
					result.push({ title: unquote(match.groups!.title), where: lineOf(source, match.index) });
				}
			}
		}
		return result;
	}

	/** Whether `id` names a menu of Pollis (a top-level menu or a `new MenuId('...')`). */
	isMenu(id: string): boolean {
		return TOP_LEVEL_MENUS.has(id.toLowerCase()) || this.sources.some(source => source.text.includes(`new MenuId('${id}')`));
	}

	resolve(item: SpecItem): ResolvedPanel {
		const registrations = this.registrations();
		let registration;
		if (item.command) {
			registration = registrations.find(r => r.command === item.command);
			if (!registration) {
				fail(`no scaffold panel opens with the command ${item.command} (galleries and panels with their own code cannot be packaged)`);
			}
		} else if (item.panel) {
			const constant = this.panelConstant(item.panel);
			registration = registrations.find(r => r.panel === constant && !r.model) ?? registrations.find(r => r.panel === constant);
			if (!registration) {
				fail(`no command opens the panel ${item.panel}`);
			}
		} else {
			fail('every [[menu.items]] needs a command or a panel');
		}

		// The panel constant: `export const LM_PANEL: IScaffoldPanel = { id: 'lm', ..., html: getLmHtml }`
		const panelSource = this.sources.find(source => source.text.includes(`export const ${registration.panel}: IScaffoldPanel`));
		if (!panelSource) {
			fail(`cannot find ${registration.panel}`);
		}
		const id = /\bid: '(?<id>[^']+)'/.exec(panelSource.text)?.groups!.id;
		const htmlImport = /import \{ (?<fn>\w+) \} from '\.\.\/webviews\/(?<file>[\w-]+)\.template\.js'/.exec(panelSource.text)?.groups;
		const dataImport = /from '\.\.\/webviews\/(?<file>[\w-]+)\.data\.js'/.exec(panelSource.text)?.groups;
		if (!id || !htmlImport || !dataImport) {
			fail(`${path.relative(ROOT, panelSource.file)} is not a plain scaffold panel`);
		}

		// The template's scaffold options, which must all be portable
		const templateFile = path.join(WEBVIEWS_DIR, `${htmlImport.file}.template.ts`);
		const template = fs.readFileSync(templateFile, 'utf-8');
		const options = /buildScaffoldHtml\([^{]*\{(?<body>[\s\S]*?)\n\t\}\);/.exec(template)?.groups!.body;
		if (!options) {
			fail(`${path.relative(ROOT, templateFile)} does not call buildScaffoldHtml`);
		}
		const keys = [...options.matchAll(/^\t\t(?<key>\w+):/gm)].map(match => match.groups!.key);
		const code = keys.filter(key => !PORTABLE_OPTIONS.has(key));
		if (code.length) {
			fail(`the panel ${id} has its own code (${code.join(', ')} in ${path.relative(ROOT, templateFile)}), so it cannot go in a data-only extension`);
		}
		const option = (key: string) => {
			const match = new RegExp(String.raw`^\t\t${key}: (?<value>${STRING}),?$`, 'm').exec(options);
			return match ? unquote(match.groups!.value) : undefined;
		};
		const title = option('title');
		const defaultModel = registration.model ?? option('defaultModel');
		if (!title || !defaultModel) {
			fail(`${path.relative(ROOT, templateFile)}: cannot read the title or the default model`);
		}

		const menuItems = this.menuItems(registration.command);
		const menuTitle = item.title ?? menuItems[0]?.title;
		// Every command that opens the panel (e.g. lm, lm.ols, lm.wls) and its menu items
		const opening = registrations.filter(r => r.panel === registration.panel).flatMap(r => [
			`${lineOf(r.source, r.index)} registerCommand('${r.command}')${r.model ? ` (model ${r.model})` : ''}`,
			...this.menuItems(r.command).map(menu => `${menu.where} menu item "${menu.title}"`),
		]);
		return {
			id,
			command: registration.command,
			title,
			menuTitle: menuTitle && menuTitle !== title ? menuTitle : undefined,
			defaultModel,
			decisionFirstColumn: option('decisionFirstColumn'),
			toml: path.join(WEBVIEWS_DIR, `${dataImport.file}.toml`),
			origin: [
				...opening,
				path.relative(ROOT, panelSource.file),
				path.relative(ROOT, templateFile),
				path.relative(ROOT, path.join(WEBVIEWS_DIR, `${dataImport.file}.toml`)),
			],
		};
	}

	private panelConstant(panel: string): string {
		for (const source of this.sources) {
			const match = new RegExp(String.raw`export const (?<name>[A-Z][A-Z0-9_]*): IScaffoldPanel = \{\s*id: '${panel}'`).exec(source.text);
			if (match) {
				return match.groups!.name;
			}
		}
		fail(`no scaffold panel has the id ${panel}`);
	}
}

/**
 * The folders of a panel's wikis and notebooks: its id and the folders its TOML names (usually the
 * id, sometimes another name, e.g. `game-theory`). Warns about a named file that does not exist.
 */
function materialFolders(panel: ResolvedPanel, toml: TomlValue): { wiki: Set<string>; notebook: Set<string> } {
	const wikis = (toml.wikis as TomlValue[] | undefined) ?? [];
	const notebooks = ((toml.notebookSections as TomlValue[] | undefined) ?? []).flatMap(section => (section.notebooks as TomlValue[] | undefined) ?? []);
	const result = { wiki: new Set([panel.id]), notebook: new Set([panel.id]) };
	for (const [kind, root, entries] of [['wiki', WIKI_DIR, wikis], ['notebook', NOTEBOOKS_DIR, notebooks]] as const) {
		for (const entry of entries) {
			const file = entry.file as string | undefined;
			if (!file || entry.bundled === false) {
				continue;
			}
			result[kind].add(file.split('/')[0]);
			if (!fs.existsSync(path.join(root, file))) {
				console.warn(`Warning: the panel ${panel.id} names the ${kind} ${file}, which does not exist`);
			}
		}
	}
	return result;
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
			const panel = pollis.resolve(item);
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
