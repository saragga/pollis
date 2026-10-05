/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// How a Pollis menu entry resolves to a scaffold panel: menu entry -> command -> panel constant ->
// template (whose scaffold options must all be portable) -> TOML, wikis and notebooks. Read from
// the sources (src/**/*.contribution.ts, *.command.ts, *.template.ts and the panels' .toml).
// Used by makeExtension.ts (a toolbox from a spec, in the source tree) and makePanelIndex.ts (the
// panel index the Extension Agent plugin reads, so that it works without a source checkout).

import * as fs from 'fs';
import * as path from 'path';
import { type TomlValue } from '../../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';

export const ROOT = path.join(import.meta.dirname, '..', '..');
export const CONTRIB_DIR = path.join(ROOT, 'src', 'vs', 'workbench', 'contrib');
export const MODEL_DIR = path.join(CONTRIB_DIR, 'model', 'browser');
export const WEBVIEWS_DIR = path.join(MODEL_DIR, 'webviews');
export const WIKI_DIR = path.join(MODEL_DIR, 'media', 'wiki');
export const NOTEBOOKS_DIR = path.join(MODEL_DIR, 'media', 'notebooks');
export const ICON = path.join(CONTRIB_DIR, 'extensions', 'browser', 'media', 'pollis-toolbox-icon.png');
export const TOOLBOXES_DIR = path.join(ROOT, 'toolboxes');

/** The scaffold options a data-only panel can carry (the extension point's fields). */
const PORTABLE_OPTIONS = new Set(['title', 'defaultModel', 'decisionFirstColumn']);
export const TOP_LEVEL_MENUS = new Set(['toolboxes', 'explore', 'model', 'simulate', 'optimise']);

/** A menu entry of the spec. */
export interface SpecItem {
	readonly command?: string;
	readonly panel?: string;
	readonly title?: string;
	readonly group?: string;
	readonly order?: number;
}

/** A destination menu of the spec. */
export interface SpecMenu {
	readonly id: string;
	readonly title: string;
	readonly menu?: string;
	readonly inline?: boolean;
	readonly group?: string;
	readonly order?: number;
	readonly items: SpecItem[];
}

/** What the script found in Pollis about one menu entry. */
export interface ResolvedPanel {
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

/** A command that opens a scaffold panel, and where it is registered. */
export interface Registration {
	readonly command: string;
	/** The panel constant, e.g. `LM_PANEL`. */
	readonly panel: string;
	/** The model toggle the command opens the panel on. */
	readonly model?: string;
	readonly source: Source;
	readonly index: number;
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

/** Why a menu entry or a panel cannot be resolved or packaged. */
export class PanelError extends Error { }

/** A string literal's value: '...' or "..." with \ escapes. */
export function unquote(literal: string): string {
	return literal.slice(1, -1).replace(/\\(.)/g, '$1');
}

const STRING = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`;

export class Pollis {
	private readonly sources: Source[];
	/** String constants by name, e.g. HT_COMMAND_ID -> chiara.statistics.ht. */
	private readonly constants = new Map<string, string>();
	private cachedRegistrations: Registration[] | undefined;

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
	registrations(): Registration[] {
		if (this.cachedRegistrations) {
			return this.cachedRegistrations;
		}
		const result: Registration[] = [];
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
		this.cachedRegistrations = result;
		return result;
	}

	/** The menu items that run `command`: their titles and where they are. */
	menuItems(command: string): { title: string; where: string }[] {
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

	/** The scaffold panels Pollis defines: their constant (e.g. `LM_PANEL`) and panel id. */
	scaffoldPanels(): { constant: string; id: string }[] {
		return this.sources.flatMap(source => [...source.text.matchAll(/export const (?<constant>[A-Z][A-Z0-9_]*): IScaffoldPanel = \{\s*id: '(?<id>[^']+)'/g)]
			.map(match => ({ constant: match.groups!.constant, id: match.groups!.id })));
	}

	/**
	 * The panels built on the scaffold that open their own webview, because their template passes
	 * its own code (illustrationOverrideJs, extraCss...): they cannot go in a data-only toolbox.
	 */
	ownCodePanels(): { id: string; title?: string; reason: string; commands: string[] }[] {
		const scaffoldIds = new Set(this.scaffoldPanels().map(panel => panel.id));
		const result = [];
		for (const file of fs.readdirSync(WEBVIEWS_DIR).filter(name => name.endsWith('.template.ts')).sort()) {
			const template = fs.readFileSync(path.join(WEBVIEWS_DIR, file), 'utf-8');
			const id = /buildScaffoldHtml\(\s*'(?<id>[^']+)'/.exec(template)?.groups!.id;
			const options = /buildScaffoldHtml\([^{]*\{(?<body>[\s\S]*?)\n\t\}\);/.exec(template)?.groups!.body;
			if (!id || !options || scaffoldIds.has(id)) {
				continue;
			}
			const code = [...options.matchAll(/^\t\t(?<key>\w+):/gm)].map(match => match.groups!.key).filter(key => !PORTABLE_OPTIONS.has(key));
			const title = new RegExp(String.raw`^\t\ttitle: (?<value>${STRING}),?$`, 'm').exec(options)?.groups!.value;
			// The command file that renders the template, its open...Webview function and the commands that call it
			const html = /export function (?<fn>\w+)\(/.exec(template)?.groups!.fn;
			const commandFile = html && this.sources.find(source => source.text.includes(`import { ${html} } from '../webviews/${file.replace(/\.ts$/, '.js')}'`));
			const open = commandFile && /export function (?<open>open\w+)\(/.exec(commandFile.text)?.groups!.open;
			const commands = open ? this.sources.flatMap(source => [...source.text.matchAll(new RegExp(String.raw`registerCommand\(\s*(?<command>${STRING}|[A-Z][A-Z0-9_]*)\s*,\s*(?:\([^)]*\)|\w+)\s*=>\s*\{?\s*${open}\(`, 'g'))]
				.map(match => this.value(match.groups!.command)).filter((command): command is string => !!command)) : [];
			result.push({
				id,
				title: title && unquote(title),
				reason: `the panel ${id} has its own code (${code.join(', ')} in ${path.relative(ROOT, path.join(WEBVIEWS_DIR, file))}), so it cannot go in a data-only extension`,
				commands,
			});
		}
		return result;
	}

	/** The ids of the submenus Pollis defines (`new MenuId('...')`). */
	submenus(): string[] {
		return [...new Set(this.sources.flatMap(source => [...source.text.matchAll(/new MenuId\('(?<id>[^']+)'\)/g)].map(match => match.groups!.id)))].sort();
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
				throw new PanelError(`no scaffold panel opens with the command ${item.command} (galleries and panels with their own code cannot be packaged)`);
			}
		} else if (item.panel) {
			const constant = this.panelConstant(item.panel);
			registration = registrations.find(r => r.panel === constant && !r.model) ?? registrations.find(r => r.panel === constant);
			if (!registration) {
				throw new PanelError(`no command opens the panel ${item.panel}`);
			}
		} else {
			throw new PanelError('every [[menu.items]] needs a command or a panel');
		}

		// The panel constant: `export const LM_PANEL: IScaffoldPanel = { id: 'lm', ..., html: getLmHtml }`
		const panelSource = this.sources.find(source => source.text.includes(`export const ${registration.panel}: IScaffoldPanel`));
		if (!panelSource) {
			throw new PanelError(`cannot find ${registration.panel}`);
		}
		const id = /\bid: '(?<id>[^']+)'/.exec(panelSource.text)?.groups!.id;
		const htmlImport = /import \{ (?<fn>\w+) \} from '\.\.\/webviews\/(?<file>[\w-]+)\.template\.js'/.exec(panelSource.text)?.groups;
		const dataImport = /from '\.\.\/webviews\/(?<file>[\w-]+)\.data\.js'/.exec(panelSource.text)?.groups;
		if (!id || !htmlImport || !dataImport) {
			throw new PanelError(`${path.relative(ROOT, panelSource.file)} is not a plain scaffold panel`);
		}

		// The template's scaffold options, which must all be portable
		const templateFile = path.join(WEBVIEWS_DIR, `${htmlImport.file}.template.ts`);
		const template = fs.readFileSync(templateFile, 'utf-8');
		const options = /buildScaffoldHtml\([^{]*\{(?<body>[\s\S]*?)\n\t\}\);/.exec(template)?.groups!.body;
		if (!options) {
			throw new PanelError(`${path.relative(ROOT, templateFile)} does not call buildScaffoldHtml`);
		}
		const keys = [...options.matchAll(/^\t\t(?<key>\w+):/gm)].map(match => match.groups!.key);
		const code = keys.filter(key => !PORTABLE_OPTIONS.has(key));
		if (code.length) {
			throw new PanelError(`the panel ${id} has its own code (${code.join(', ')} in ${path.relative(ROOT, templateFile)}), so it cannot go in a data-only extension`);
		}
		const option = (key: string) => {
			const match = new RegExp(String.raw`^\t\t${key}: (?<value>${STRING}),?$`, 'm').exec(options);
			return match ? unquote(match.groups!.value) : undefined;
		};
		const title = option('title');
		const defaultModel = registration.model ?? option('defaultModel');
		if (!title || !defaultModel) {
			throw new PanelError(`${path.relative(ROOT, templateFile)}: cannot read the title or the default model`);
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
		throw new PanelError(`no scaffold panel has the id ${panel}`);
	}
}

/**
 * The folders of a panel's wikis and notebooks: its id and the folders its TOML names (usually the
 * id, sometimes another name, e.g. `game-theory`). Warns about a named file that does not exist.
 */
export function materialFolders(panel: Pick<ResolvedPanel, 'id'>, toml: TomlValue, warn: (message: string) => void = message => console.warn(`Warning: ${message}`), roots = { wiki: WIKI_DIR, notebook: NOTEBOOKS_DIR }): { wiki: Set<string>; notebook: Set<string> } {
	const wikis = (toml.wikis as TomlValue[] | undefined) ?? [];
	const notebooks = ((toml.notebookSections as TomlValue[] | undefined) ?? []).flatMap(section => (section.notebooks as TomlValue[] | undefined) ?? []);
	const result = { wiki: new Set([panel.id]), notebook: new Set([panel.id]) };
	for (const [kind, root, entries] of [['wiki', roots.wiki, wikis], ['notebook', roots.notebook, notebooks]] as const) {
		for (const entry of entries) {
			const file = entry.file as string | undefined;
			if (!file || entry.bundled === false) {
				continue;
			}
			result[kind].add(file.split('/')[0]);
			if (!fs.existsSync(path.join(root, file))) {
				warn(`the panel ${panel.id} names the ${kind} ${file}, which does not exist`);
			}
		}
	}
	return result;
}
