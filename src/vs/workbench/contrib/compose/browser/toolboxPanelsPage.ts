/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { ICommandActionTitle } from '../../../../platform/action/common/action.js';
import { Action2, isIMenuItem, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ConfirmResult, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { CHOOSE_TOOLBOX_PANELS_COMMAND_ID, IToolboxInfo, IToolboxPanelsService, IToolboxPlacement, TOOLBOX_END_GROUP, TOOLBOX_MENU, TOOLBOX_SUBMENU_PREFIX } from '../common/toolboxPanels.js';

// The page of an installed toolbox. Left, the toolbox's menu and its panels, each with a box to
// tick for the ones the user wants; right, Explore, Model, Simulate and Optimise as a folding tree,
// every item in menu order, that previews where they go. The user selects items on the left and
// clicks a line between two items, or a menu, to put them there, and Publish puts them in the menus.

/** A message from the page. */
type ToolboxPanelsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'publish'; readonly toolboxId: string; readonly placement: IToolboxPlacement }
	| { readonly command: 'changes'; readonly changes: readonly IToolboxChange[] };

/** A toolbox whose places on the page are not published yet. */
interface IToolboxChange {
	readonly toolboxId: string;
	readonly placement: IToolboxPlacement;
}

/** The menus a toolbox's menu and panels can go in, in menu bar order. */
const PLACE_MENUS = [MenuId.MenubarExploreMenu, MenuId.MenubarModelMenu, MenuId.MenubarSimulateMenu, MenuId.MenubarOptimiseMenu];

/** An item of the menus in the page's tree, with the group and order that set its position. */
interface IPlaceNode {
	readonly id: string;
	readonly title: string;
	readonly group: string | undefined;
	readonly order: number | undefined;
	/** The items of a menu the toolbox can go in, `undefined` for a panel or another toolbox's menu. */
	readonly children?: readonly IPlaceNode[];
}

/** The open pages, by extension id, so a second request shows the same page. */
const openPages = new Map<string, { readonly page: WebviewInput; readonly postState: (reset: boolean) => void }>();

function titleOf(title: string | ICommandActionTitle): string {
	return (typeof title === 'string' ? title : title.value).replace(/&&/g, '');
}

/**
 * Explore, Model, Simulate and Optimise with every item they show, at any depth, without the
 * page's own toolboxes, which the page draws where the user puts them.
 */
function placeTree(contextKeyService: IContextKeyService, toolboxes: readonly IToolboxInfo[]): IPlaceNode[] {
	const own = new Set(toolboxes.flatMap(toolbox => [`${TOOLBOX_SUBMENU_PREFIX}${toolbox.id}`, ...toolbox.panels.map(panel => panel.command)]));
	const build = (menu: MenuId, path: ReadonlySet<string>): IPlaceNode[] => {
		const nodes: IPlaceNode[] = [];
		// An item registered twice (under different conditions) is one entry
		const ids = new Set<string>();
		for (const item of MenuRegistry.getMenuItems(menu)) {
			const id = isIMenuItem(item) ? item.command.id : item.submenu.id;
			if (ids.has(id) || own.has(id) || !contextKeyService.contextMatchesRules(item.when)) {
				continue;
			}
			ids.add(id);
			if (isIMenuItem(item)) {
				nodes.push({ id, title: titleOf(item.command.title), group: item.group, order: item.order });
			} else if (id.startsWith(TOOLBOX_SUBMENU_PREFIX)) {
				// Another toolbox's menu is shown, not offered as a place
				nodes.push({ id, title: titleOf(item.title), group: item.group, order: item.order });
			} else if (!path.has(id)) {
				const children = build(item.submenu, new Set([...path, id]));
				// An empty menu is not shown
				if (children.length) {
					nodes.push({ id, title: titleOf(item.title), group: item.group, order: item.order, children });
				}
			}
		}
		return nodes;
	};
	const titles = new Map(MenuRegistry.getMenuItems(MenuId.MenubarMainMenu).map(item => isIMenuItem(item) ? [item.command.id, ''] : [item.submenu.id, titleOf(item.title)]));
	return PLACE_MENUS.map(menu => ({ id: menu.id, title: titles.get(menu.id) || menu.id, group: undefined, order: undefined, children: build(menu, new Set([menu.id])) }));
}

function pageTitle(toolboxes: readonly IToolboxInfo[]): string {
	return toolboxes.length === 1
		? localize('toolboxPanels.title', "{0} Toolbox Panels", toolboxes[0].title)
		: localize('toolboxPanels.titleGeneric', "Toolbox Panels");
}

/** Opens the page of an extension's toolboxes, or shows it if it is already open. */
function openToolboxPanelsPage(accessor: ServicesAccessor, extensionId: string): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const contextKeyService = accessor.get(IContextKeyService);
	const notificationService = accessor.get(INotificationService);
	const dialogService = accessor.get(IDialogService);
	const key = extensionId.toLowerCase();

	// An open page goes back to what is in the menus now, like a new one
	const open = openPages.get(key);
	if (open && !open.page.isDisposed()) {
		webviewWorkbenchService.revealWebview(open.page, open.page.group ?? -1, false);
		open.postState(true);
		return;
	}

	const title = pageTitle(toolboxPanelsService.getToolboxes(key));
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.toolboxPanels',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());

	const disposables = new DisposableStore();
	let shown = false;
	const postState = (reset: boolean) => {
		const toolboxes = toolboxPanelsService.getToolboxes(key);
		// The page of a toolbox that is uninstalled closes
		if (shown && toolboxes.length === 0) {
			webviewInput.dispose();
			return;
		}
		shown ||= toolboxes.length > 0;
		webviewInput.setWebviewTitle(pageTitle(toolboxes));
		webviewInput.webview.postMessage({ command: 'state', reset, title: pageTitle(toolboxes), toolboxes, tree: placeTree(contextKeyService, toolboxes) });
	};
	openPages.set(key, { page: webviewInput, postState });
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(key);
		disposables.dispose();
	}));
	disposables.add(toolboxPanelsService.onDidChange(() => postState(false)));

	const publish = (toolboxId: string, placement: IToolboxPlacement) => {
		toolboxPanelsService.publish(key, toolboxId, placement);
		const count = Object.keys(placement.panels).length;
		notificationService.info(count === 0
			? localize('toolboxPanels.publishedNone', "No panels of this toolbox are in the menus now.")
			: count === 1
				? localize('toolboxPanels.publishedOne', "1 panel is in the menus now.")
				: localize('toolboxPanels.published', "{0} panels are in the menus now.", count));
	};

	// Closing the page with changes not published asks whether to publish them
	let changes: readonly IToolboxChange[] = [];
	webviewInput.closeHandler = {
		showConfirm: () => changes.length > 0,
		confirm: async () => {
			const { result } = await dialogService.prompt<ConfirmResult>({
				type: 'warning',
				message: localize('toolboxPanels.closeMessage', "Do you want to publish your changes to the menus?"),
				detail: localize('toolboxPanels.closeDetail', "Your changes are not in the menus until you publish them."),
				buttons: [
					{ label: localize({ key: 'toolboxPanels.closePublish', comment: ['&& denotes a mnemonic'] }, "&&Publish"), run: () => ConfirmResult.SAVE },
					{ label: localize({ key: 'toolboxPanels.closeDiscard', comment: ['&& denotes a mnemonic'] }, "Do&&n't Publish"), run: () => ConfirmResult.DONT_SAVE },
				],
				cancelButton: { run: () => ConfirmResult.CANCEL },
			});
			if (result === ConfirmResult.SAVE) {
				changes.forEach(change => publish(change.toolboxId, change.placement));
			}
			// Published or left: nothing to save, the page closes
			return result === ConfirmResult.CANCEL ? ConfirmResult.CANCEL : ConfirmResult.DONT_SAVE;
		},
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: ToolboxPanelsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			postState(true);
		} else if (message.command === 'publish') {
			publish(message.toolboxId, message.placement);
		} else if (message.command === 'changes') {
			changes = message.changes;
		}
	}));
}

/** The page: its texts come from here, its toolboxes and menus from the `state` message. */
function pageHtml(): string {
	const text = {
		intro: localize('toolboxPanels.intro', "Installing a toolbox does not change your menus. Tick the panels you want, choose where each one goes, or display the author's suggestion, and press Publish. You can come back here at any time with the Edit button of the toolbox in the Extensions pane."),
		toolbox: localize('toolboxPanels.toolbox', "Toolbox"),
		menus: localize('toolboxPanels.menus', "Your Menus (Preview)"),
		hint: localize('toolboxPanels.hint', "Click a blue line to put the ticked items there. A ticked toolbox menu moves with its panels inside: untick it to move panels out of it."),
		putHere: localize('toolboxPanels.putHere', "Put here"),
		tickFirst: localize('toolboxPanels.tickFirst', "Tick items on the left first"),
		tickPanelsFirst: localize('toolboxPanels.tickPanelsFirst', "Tick panels on the left first"),
		menuTag: localize('toolboxPanels.menuTag', "menu"),
		inMenu: localize('toolboxPanels.inMenu', "in {0}"),
		notPlaced: localize('toolboxPanels.notPlaced', "not placed yet"),
		empty: localize('toolboxPanels.empty', "empty: it shows once a panel is in it"),
		selectAll: localize('toolboxPanels.selectAll', "Select All"),
		selectNone: localize('toolboxPanels.selectNone', "Select None"),
		suggestion: localize('toolboxPanels.suggestion', "Display Author's Suggestion"),
		publish: localize('toolboxPanels.publish', "Publish"),
		publishTip: localize('toolboxPanels.publishTip', "Press Publish to add the ticked items."),
		changed: localize('toolboxPanels.changed', "Changes not published yet."),
		published: localize('toolboxPanels.inMenus', "In your menus as shown."),
		loading: localize('toolboxPanels.loading', "The toolbox's panels show here once it has loaded. If Pollis asked you to reload the window or restart the extensions, do that first."),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1000px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 15px; font-weight: 500; margin: 24px 0 8px 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; }
		.columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start; }
		@media (max-width: 700px) { .columns { grid-template-columns: minmax(0, 1fr); } }
		.column-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; }
		.box { border: 1px solid var(--vscode-widget-border); border-radius: 2px; padding: 4px 0; }
		.row { display: flex; align-items: center; gap: 6px; padding: 3px 8px; min-height: 24px; user-select: none; }
		.row.clickable { cursor: pointer; }
		.row.clickable:hover { background: var(--vscode-list-hoverBackground); }
		.row .name { flex: 0 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.row .where { flex: 1 1 auto; text-align: right; font-size: 12px; color: var(--vscode-descriptionForeground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.row.off .name { color: var(--vscode-disabledForeground); }
		.row.item .name { color: var(--vscode-descriptionForeground); }
		.tag { font-size: 11px; color: var(--vscode-descriptionForeground); border: 1px solid var(--vscode-widget-border); border-radius: 2px; padding: 0 4px; }
		.indent { padding-left: 30px; }
		.hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; }
		.tree .row { padding-left: calc(8px + var(--depth) * 16px); }
		.gap { position: relative; height: 12px; }
		.gap.can-put { cursor: pointer; }
		.gap::before { content: ''; position: absolute; left: calc(30px + var(--depth) * 16px); right: 8px; top: 5px; border-top: 1px solid var(--vscode-textLink-foreground); opacity: 0.35; }
		.gap:hover::before { border-top-width: 2px; opacity: 1; }
		.gap:hover::after { content: attr(data-label); position: absolute; right: 8px; top: -4px; font-size: 11px; line-height: 20px; padding: 0 6px; color: var(--vscode-textLink-foreground); background: var(--vscode-editor-background); }
		.chevron { width: 16px; height: 16px; flex: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s; }
		.chevron.collapsed { transform: rotate(-90deg); }
		.chevron svg { width: 10px; height: 10px; fill: currentColor; }
		.leaf { width: 16px; flex: none; }
		.mine { color: var(--vscode-textLink-foreground); font-weight: 600; }
		.mine-bar { box-shadow: inset 2px 0 0 var(--vscode-textLink-foreground); }
		.row.action { color: var(--vscode-textLink-foreground); border-top: 1px solid var(--vscode-widget-border); margin-top: 4px; padding-top: 6px; }
		.row.action:hover .name { text-decoration: underline; }
		.links { margin: 6px 0 0 0; font-size: 12px; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.footer { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 12px 0 0 0; }
		.status { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; padding: 6px 14px; font-family: var(--vscode-font-family); font-size: 13px; cursor: pointer; }
		.button:hover { background: var(--vscode-button-hoverBackground); }
		.button.quiet { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
		.button.quiet:hover { background: var(--vscode-button-secondaryHoverBackground); }
		.loading { color: var(--vscode-descriptionForeground); font-style: italic; }
	</style>
</head>
<body>
<div class="container">
	<h1 id="title"></h1>
	<p class="subtitle">${text.intro}</p>
	<div id="toolboxes"></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const TOOLBOX_MENU = ${JSON.stringify(TOOLBOX_MENU)};
	const END_GROUP = ${JSON.stringify(TOOLBOX_END_GROUP)};
	/** The group of the first panel put in an empty toolbox menu. */
	const FIRST_GROUP = '1_toolbox';
	/** The toolbox's own menu, among the items on the left and the folds of the tree. */
	const MENU_ITEM = '#menu';
	const CHEVRON = '<svg viewBox="0 0 16 16"><path d="M3.2 5.6 8 10.4l4.8-4.8.9.9L8 12.2 2.3 6.5z"/></svg>';
	const root = document.getElementById('toolboxes');
	let tree = [];
	let toolboxes = [];
	/** The page's state of each toolbox, by toolbox id, kept across refreshes until the toolbox is published. */
	const states = new Map();

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	/** Menu order, as Pollis sorts menus: by group (none last), then order, then title. */
	function compare(a, b) {
		if (a.group !== b.group) {
			if (!a.group) { return 1; }
			if (!b.group) { return -1; }
			if (a.group === 'navigation') { return -1; }
			if (b.group === 'navigation') { return 1; }
			const value = a.group.localeCompare(b.group);
			if (value) { return value; }
		}
		const order = (a.order || 0) - (b.order || 0);
		return order ? Math.sign(order) : a.title.localeCompare(b.title);
	}

	// allow-any-unicode-next-line
	/** The path of every menu of the tree by id, e.g. "Model › Time Series", and its ancestors. */
	function indexTree() {
		const labels = new Map();
		const ancestors = new Map();
		const walk = (nodes, label, path) => {
			for (const node of nodes) {
				if (!node.children) { continue; }
				// allow-any-unicode-next-line
				const nodeLabel = label ? label + ' › ' + node.title : node.title;
				if (!labels.has(node.id)) {
					labels.set(node.id, nodeLabel);
					ancestors.set(node.id, path);
				}
				walk(node.children, nodeLabel, [...path, node.id]);
			}
		};
		walk(tree, '', []);
		return { labels, ancestors };
	}

	/**
	 * The page's state of a toolbox: its published places, the author's when asked for, else
	 * nothing ticked, the toolbox's menu not placed and the panels in it.
	 */
	function stateOf(toolbox, suggestion) {
		const placement = suggestion ? toolbox.suggested : toolbox.published;
		const panels = {};
		toolbox.panels.forEach((panel, index) => {
			const place = placement?.panels[panel.id];
			panels[panel.id] = { on: !!place, place: place ?? { menu: TOOLBOX_MENU, group: FIRST_GROUP, order: index + 1 } };
		});
		return { menuOn: !!placement?.menu, menu: placement?.menu, panels, expanded: new Set(), published: toolbox.published };
	}

	/** Whether the toolbox's menu is ticked and has a place. */
	function menuShown(state) {
		return state.menuOn && !!state.menu;
	}

	function placementOf(state) {
		const panels = {};
		for (const [id, panel] of Object.entries(state.panels)) {
			if (panel.on && (panel.place.menu !== TOOLBOX_MENU || menuShown(state))) {
				panels[id] = panel.place;
			}
		}
		return { menu: menuShown(state) ? state.menu : undefined, panels };
	}

	function samePlace(a, b) {
		return a === b || (!!a && !!b && a.menu === b.menu && a.group === b.group && a.order === b.order);
	}

	function samePlacement(a, b) {
		if (!a || !b) { return a === b; }
		if (!samePlace(a.menu, b.menu)) { return false; }
		const ids = Object.keys(a.panels);
		return ids.length === Object.keys(b.panels).length && ids.every(id => samePlace(a.panels[id], b.panels[id]));
	}

	/** The menus that hold the toolbox's menu or panels, with every menu above them. */
	function holders(state, ancestors) {
		const menus = new Set();
		const add = id => {
			if (id) {
				menus.add(id);
				for (const ancestor of ancestors.get(id) ?? []) { menus.add(ancestor); }
			}
		};
		if (menuShown(state)) { add(state.menu.menu); }
		for (const panel of Object.values(state.panels)) {
			if (panel.on) { add(panel.place.menu === TOOLBOX_MENU ? (menuShown(state) ? state.menu.menu : undefined) : panel.place.menu); }
		}
		return menus;
	}

	/** Opens the folds down to the places of the toolbox's menu and panels. */
	function expandPlaces(state, ancestors) {
		for (const id of holders(state, ancestors)) { state.expanded.add(id); }
		state.expanded.add(MENU_ITEM);
	}

	function toggle(set, id) {
		if (set.has(id)) { set.delete(id); } else { set.add(id); }
	}

	function render() {
		root.textContent = '';
		if (toolboxes.length === 0) {
			root.appendChild(element('p', 'loading', TEXT.loading));
			return;
		}
		const index = indexTree();
		for (const toolbox of toolboxes) {
			if (!states.has(toolbox.id)) {
				const state = stateOf(toolbox);
				expandPlaces(state, index.ancestors);
				states.set(toolbox.id, state);
			}
			renderToolbox(toolbox, states.get(toolbox.id), index);
		}
		// The toolboxes with changes not published, for the question on closing the page
		vscode.postMessage({ command: 'changes', changes: toolboxes.filter(toolbox => isChanged(states.get(toolbox.id))).map(toolbox => ({ toolboxId: toolbox.id, placement: placementOf(states.get(toolbox.id)) })) });
	}

	/** Whether the page differs from the menus: before the first Publish, whether anything is ticked. */
	function isChanged(state) {
		const placement = placementOf(state);
		return state.published ? !samePlacement(placement, state.published) : !!placement.menu || Object.keys(placement.panels).length > 0;
	}

	function renderToolbox(toolbox, state, index) {
		const where = place => !place ? TEXT.notPlaced : place.menu === TOOLBOX_MENU ? TEXT.inMenu.replace('{0}', toolbox.title) : (index.labels.get(place.menu) ?? place.menu);
		if (toolboxes.length > 1) {
			root.appendChild(element('h2', '', toolbox.title));
		}
		const columns = element('div', 'columns');

		// Left: the toolbox's menu and its panels
		const left = element('div');
		left.appendChild(element('p', 'column-title', TEXT.toolbox));
		const list = element('div', 'box');
		// Only its box shows or hides an item: moving it keeps it ticked or not
		const tick = (id, on) => {
			if (id === MENU_ITEM) {
				state.menuOn = on;
			} else {
				state.panels[id].on = on;
			}
		};
		const item = (id, on, name, place, indent, tag) => {
			const line = element('div', 'row clickable' + (indent ? ' indent' : '') + (on ? '' : ' off'));
			const box = element('input');
			box.type = 'checkbox';
			box.checked = on;
			box.addEventListener('click', event => event.stopPropagation());
			box.addEventListener('change', () => {
				tick(id, box.checked);
				expandPlaces(state, index.ancestors);
				render();
			});
			line.append(box, element('span', 'name', name));
			if (tag) { line.appendChild(element('span', 'tag', tag)); }
			line.appendChild(element('span', 'where', where(place)));
			line.addEventListener('click', () => {
				tick(id, !on);
				expandPlaces(state, index.ancestors);
				render();
			});
			list.appendChild(line);
		};
		item(MENU_ITEM, state.menuOn, toolbox.title, state.menu, false, TEXT.menuTag);
		for (const panel of toolbox.panels) {
			item(panel.id, state.panels[panel.id].on, panel.title, state.panels[panel.id].place, true);
		}
		left.appendChild(list);
		const links = element('p', 'links');
		const link = (label, action) => {
			const button = element('button', 'link', label);
			button.addEventListener('click', () => { action(); render(); });
			return button;
		};
		links.append(
			link(TEXT.selectAll, () => {
				[MENU_ITEM, ...toolbox.panels.map(panel => panel.id)].forEach(id => tick(id, true));
				expandPlaces(state, index.ancestors);
			}),
			document.createTextNode(' · '),
			link(TEXT.selectNone, () => [MENU_ITEM, ...toolbox.panels.map(panel => panel.id)].forEach(id => tick(id, false))),
		);
		left.appendChild(links);

		// Publish, and whether the menus already look like this
		const footer = element('div', 'footer');
		// Publish stands out while there are changes to publish
		const publish = element('button', isChanged(state) ? 'button' : 'button quiet', TEXT.publish);
		publish.addEventListener('click', () => vscode.postMessage({ command: 'publish', toolboxId: toolbox.id, placement: placementOf(state) }));
		publish.title = TEXT.publishTip;
		footer.appendChild(publish);
		if (state.published) {
			footer.appendChild(element('span', 'status', samePlacement(placementOf(state), state.published) ? TEXT.published : TEXT.changed));
		}
		left.appendChild(footer);

		// Right: the menus, with the toolbox's menu and panels where they go
		const right = element('div');
		right.appendChild(element('p', 'column-title', TEXT.menus));
		right.appendChild(element('p', 'hint', TEXT.hint));
		const treeBox = element('div', 'box tree');
		const held = holders(state, index.ancestors);
		/**
		 * The ticked items a line of a menu moves, in the order of the list on the left: in the
		 * toolbox's menu its ticked panels; elsewhere the toolbox's menu if ticked, with the panels
		 * in it, and the ticked panels outside it (all of them when the menu is not ticked).
		 */
		const movingTo = target => {
			const panels = toolbox.panels.map(panel => panel.id).filter(id => state.panels[id].on);
			if (target === TOOLBOX_MENU) {
				return panels;
			}
			return state.menuOn ? [MENU_ITEM, ...panels.filter(id => state.panels[id].place.menu !== TOOLBOX_MENU)] : panels;
		};

		/** Puts the items a line moves in a menu, between two of its items (either may be missing). */
		const put = (target, before, after) => {
			const items = movingTo(target);
			items.forEach((id, k) => {
				let group;
				let order;
				if (before && after && before.group === after.group) {
					const low = before.order || 0;
					const high = after.order || 0;
					group = before.group;
					order = high > low ? low + (high - low) * (k + 1) / (items.length + 1) : low;
				} else if (before) {
					group = before.group;
					order = (before.order || 0) + k + 1;
				} else if (after) {
					group = after.group;
					order = (after.order || 0) - items.length + k;
				} else {
					group = target === TOOLBOX_MENU ? FIRST_GROUP : END_GROUP;
					order = k + 1;
				}
				const place = { menu: target, group: group || END_GROUP, order };
				if (id === MENU_ITEM) {
					state.menu = place;
				} else {
					state.panels[id].place = place;
				}
			});
			expandPlaces(state, index.ancestors);
			render();
		};

		const row = (depth, title, options) => {
			const clickable = options.fold !== undefined;
			const line = element('div', 'row' + (clickable ? ' clickable' : ' item') + (options.mine ? ' mine-bar' : ''));
			line.style.setProperty('--depth', String(depth));
			if (options.fold !== undefined) {
				const chevron = element('span', 'chevron' + (state.expanded.has(options.fold) ? '' : ' collapsed'));
				chevron.innerHTML = CHEVRON;
				chevron.addEventListener('click', event => {
					event.stopPropagation();
					toggle(state.expanded, options.fold);
					render();
				});
				line.appendChild(chevron);
			} else {
				line.appendChild(element('span', 'leaf'));
			}
			line.appendChild(element('span', 'name' + (options.mine ? ' mine' : ''), title));
			if (options.tag) { line.appendChild(element('span', 'tag', options.tag)); }
			if (options.note) { line.appendChild(element('span', 'where', options.note)); }
			if (clickable) {
				line.addEventListener('click', () => {
					toggle(state.expanded, options.fold);
					render();
				});
			}
			treeBox.appendChild(line);
		};
		/** A line between two items of a menu: it puts the ticked items there, or says to tick some first. */
		const gap = (menuId, depth, action) => {
			const canPut = movingTo(menuId).length > 0;
			const line = element('div', 'gap' + (canPut ? ' can-put' : ''));
			line.style.setProperty('--depth', String(depth));
			line.dataset.label = canPut ? TEXT.putHere : menuId === TOOLBOX_MENU ? TEXT.tickPanelsFirst : TEXT.tickFirst;
			if (canPut) { line.addEventListener('click', action); }
			treeBox.appendChild(line);
		};

		/** The items of a menu in menu order: its own, and the toolbox's ticked menu and panels put there. */
		const itemsOf = (menuId, children) => {
			const items = children.map(node => ({ kind: 'node', id: node.id, node, title: node.title, group: node.group, order: node.order }));
			if (menuShown(state) && state.menu.menu === menuId) {
				items.push({ kind: 'menu', id: MENU_ITEM, title: toolbox.title, group: state.menu.group, order: state.menu.order });
			}
			for (const panel of toolbox.panels) {
				const { on, place } = state.panels[panel.id];
				if (on && place.menu === menuId) {
					items.push({ kind: 'panel', id: panel.id, title: panel.title, group: place.group, order: place.order });
				}
			}
			return items.sort(compare);
		};

		/** Draws a menu's items, with a line to put the ticked items between any two of them. */
		const drawItems = (menuId, items, depth) => {
			// The place of a line is set by the items around it that stay where they are
			const moving = new Set(movingTo(menuId));
			const staying = items.filter(entry => !moving.has(entry.id));
			const line = position => {
				const before = staying[position - 1];
				const after = staying[position];
				// Between two groups, the line puts the items at the end of the one above
				gap(menuId, depth, () => before && after && before.group !== after.group ? put(menuId, before, undefined) : put(menuId, before, after));
			};
			// No line next to the items that move: it would put them where they are
			let position = 0;
			let previousMoves = false;
			for (const entry of items) {
				const moves = moving.has(entry.id);
				if (!moves && !previousMoves) {
					line(position);
				}
				drawEntry(entry, depth);
				if (!moves) {
					position++;
				}
				previousMoves = moves;
			}
			if (!previousMoves) {
				line(position);
			}
		};

		const drawEntry = (entry, depth) => {
			if (entry.kind === 'panel') {
				row(depth, entry.title, { mine: true });
			} else if (entry.kind === 'menu') {
				const inMenu = itemsOf(TOOLBOX_MENU, []);
				row(depth, toolbox.title, { fold: MENU_ITEM, mine: true, tag: TEXT.menuTag, note: inMenu.length ? '' : TEXT.empty });
				if (state.expanded.has(MENU_ITEM)) {
					drawItems(TOOLBOX_MENU, inMenu, depth + 1);
				}
			} else if (entry.node.children) {
				drawMenu(entry.node, depth);
			} else {
				row(depth, entry.title, {});
			}
		};

		const drawMenu = (node, depth) => {
			const open = state.expanded.has(node.id);
			const items = itemsOf(node.id, node.children);
			// A dot on a folded menu that holds the toolbox's menu or panels
			row(depth, node.title, { fold: node.id, note: held.has(node.id) && !open ? '●' : '' });
			if (open) {
				drawItems(node.id, items, depth + 1);
			}
		};
		for (const node of tree) { drawMenu(node, 0); }
		// The author's places for every item, all ticked
		const suggestion = element('div', 'row clickable action');
		suggestion.style.setProperty('--depth', '0');
		suggestion.append(element('span', 'leaf'), element('span', 'name', TEXT.suggestion));
		suggestion.addEventListener('click', () => {
			const suggested = stateOf(toolbox, true);
			suggested.expanded = state.expanded;
			expandPlaces(suggested, index.ancestors);
			states.set(toolbox.id, suggested);
			render();
		});
		treeBox.appendChild(suggestion);
		right.appendChild(treeBox);
		columns.append(left, right);
		root.appendChild(columns);
	}

	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			document.getElementById('title').textContent = event.data.title;
			tree = event.data.tree;
			toolboxes = event.data.toolboxes;
			// Opening the page, or publishing since, shows what is in the menus now
			if (event.data.reset) {
				states.clear();
			}
			for (const toolbox of toolboxes) {
				const state = states.get(toolbox.id);
				if (state && !samePlacement(toolbox.published, state.published)) {
					states.delete(toolbox.id);
				}
			}
			render();
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CHOOSE_TOOLBOX_PANELS_COMMAND_ID,
			title: localize2('toolboxPanels.command', "Toolbox Panels..."),
			category: localize2('toolboxPanels.category', "Compose"),
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor, extensionId?: string): Promise<void> {
		if (typeof extensionId === 'string') {
			openToolboxPanelsPage(accessor, extensionId);
			return;
		}
		const toolboxPanelsService = accessor.get(IToolboxPanelsService);
		const quickInputService = accessor.get(IQuickInputService);
		const notificationService = accessor.get(INotificationService);
		const instantiationService = accessor.get(IInstantiationService);
		const toolboxes = toolboxPanelsService.getToolboxes();
		if (toolboxes.length === 0) {
			notificationService.info(localize('toolboxPanels.none', "No toolboxes are installed. Install one from the Toolboxes section of the Extensions pane."));
			return;
		}
		const picked = toolboxes.length === 1 ? toolboxes[0] : (await quickInputService.pick(
			toolboxes.map(toolbox => ({ label: toolbox.title, toolbox })),
			{ placeHolder: localize('toolboxPanels.pick', "Choose the toolbox whose panels to add to the menus") }
		))?.toolbox;
		// The accessor is no longer valid after the pick
		if (picked) {
			instantiationService.invokeFunction(openToolboxPanelsPage, picked.extensionId);
		}
	}
});
