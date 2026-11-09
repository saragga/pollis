/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis in the viewer of pdf.js: its options before it starts, the PDF from the extension, saving through it, the
// modes of Explore > PDF Files, and the tools sidebar, shown or hidden by Tools: Show | Hide: Select Area with the
// text, the table and the picture of an area, and the Poppler tools (poppler.js). Runs after pdf.mjs, before viewer.mjs.

import { areaCells, areaText, cellsCsv, cellsTabbed, pageWords } from './cells.js';
import { popplerTools } from './poppler.js';

const vscode = acquireVsCodeApi();
const config = JSON.parse(document.getElementById('pollis-config').textContent);
const T = config.text;

/** How many rows of a table the sidebar shows. */
const MAX_ROWS = 60;
/** The scale of the picture of an area: two pixels to a point. */
const AREA_SCALE = 2;

const post = message => vscode.postMessage(message);
const app = () => window.PDFViewerApplication;
const format = (template, ...values) => template.replace(/\{(\d+)\}/g, (_, i) => String(values[Number(i)]));
const round = value => Math.round(value * 10) / 10;

function element(tag, className, text) {
	const node = document.createElement(tag);
	if (className) {
		node.className = className;
	}
	if (text !== undefined) {
		node.textContent = text;
	}
	return node;
}

function button(label, title, onClick) {
	const node = element('button', 'pollisButton', label);
	node.type = 'button';
	if (title) {
		node.title = title;
	}
	node.addEventListener('click', onClick);
	return node;
}

// ---- The colours of the theme of Pollis: pdf.js draws in light or dark as the theme is

function applyTheme() {
	const classes = document.body.classList;
	const dark = classes.contains('vscode-dark') || (classes.contains('vscode-high-contrast') && !classes.contains('vscode-high-contrast-light'));
	document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}
new MutationObserver(applyTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
applyTheme();

// ---- The options of the viewer, before it starts

let optionsSet = false;
function setOptions(event) {
	if (optionsSet || event.detail?.source !== window) {
		return;
	}
	optionsSet = true;
	const options = window.PDFViewerApplicationOptions;
	options.set('disablePreferences', true);
	options.set('defaultUrl', '');
	options.set('disableHistory', true);
	// The scripts of forms need a sandbox that a webview does not give; the fields are filled in without them
	options.set('enableScripting', false);
	options.set('fontExtraProperties', true);
	options.set('cMapUrl', config.urls.cmaps);
	options.set('standardFontDataUrl', config.urls.standardFonts);
	options.set('wasmUrl', config.urls.wasm);
	options.set('iccUrl', config.urls.iccs);
	options.set('localeProperties', { lang: config.language });
	window.PDFViewerApplication.initializedPromise.then(onInitialized);
}
// The viewer announces itself on the document of the frame around it when it can reach it, else on its own
document.addEventListener('webviewerloaded', setOptions);
try {
	parent.document.addEventListener('webviewerloaded', setOptions);
} catch {
	// The frame around is of another origin
}

/**
 * Once the viewer has started: the box of the area follows the pages, a new document drops what was read of the one
 * before, and a mode waits for the markup tools and the outline of the document. Select Area and a markup tool of
 * pdf.js are not on together.
 */
function onInitialized() {
	const { eventBus } = app();
	for (const name of ['pagerendered', 'scalechanging', 'rotationchanging', 'pagesinit']) {
		eventBus.on(name, () => setTimeout(redrawBox));
	}
	eventBus.on('documentloaded', () => wordsCache.clear());
	eventBus.on('annotationeditoruimanager', () => {
		editorReady = true;
		setTimeout(applyMode);
	});
	eventBus.on('outlineloaded', event => {
		outlineCount = event.outlineCount ?? 0;
		setTimeout(applyMode);
	});
	eventBus.on('annotationeditormodechanged', event => {
		editorMode = event.mode;
		if (editorMode > 0 && selecting) {
			setSelecting(false);
		}
	});
}

// ---- The modes of Explore > PDF Files

/** The markup tools of pdf.js (AnnotationEditorType), by mode: Highlight, Add or Edit Text, Add or Edit Images, and Draw. */
const EDITOR_MODES = { highlight: 9, text: 3, image: 13, draw: 15 };
/** The tools of the sidebar, by mode, and for Extract Pages what it saves as: One File. */
const TOOL_MODES = { extract: ['split', 'one'], merge: ['merge'], convert: ['convert'] };
/** No markup tool (AnnotationEditorType.NONE). */
const NO_EDITOR = 0;
/** The outline in the left pane of pdf.js (SidebarView.OUTLINE). */
const OUTLINE_VIEW = 2;

/** Whether the markup tools of pdf.js are ready for the document open, and the one that is on. */
let editorReady = false;
let editorMode = NO_EDITOR;
/** The number of entries of the document's outline, once pdf.js has read it. */
let outlineCount;
/** The mode asked for, until the document is ready for it. */
let pendingMode;

function setMode(mode) {
	pendingMode = mode;
	applyMode();
}

/** Puts the viewer in the mode asked for, once the document has what the mode needs. */
function applyMode() {
	const mode = pendingMode;
	// A file that forbids changes has no markup tools: only their modes wait for them
	if (!mode || !app()?.pdfDocument || (mode in EDITOR_MODES && !editorReady) || (mode === 'read' && outlineCount === undefined)) {
		return;
	}
	pendingMode = undefined;
	const { eventBus, viewsManager } = app();
	const editor = EDITOR_MODES[mode] ?? NO_EDITOR;
	if (editorReady && editor !== editorMode) {
		eventBus.dispatch('switchannotationeditormode', { source: window, mode: editor });
	}
	setSelecting(mode === 'crop');
	if (mode === 'read') {
		setToolsShown(false, true);
		// The outline, else the thumbnails of the pages
		if (outlineCount) {
			viewsManager?.switchView(OUTLINE_VIEW, true);
		} else {
			viewsManager?.open();
		}
	} else if (TOOL_MODES[mode]) {
		setToolsShown(true, true);
		poppler.openTool(...TOOL_MODES[mode]);
	}
}

/** The worker of pdf.js, made from its text: a webview cannot start a worker from the extension's files, another origin. */
let workerPort;
async function getWorkerPort() {
	workerPort ??= (async () => {
		const code = await (await fetch(config.urls.worker)).text();
		return new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })), { type: 'module' });
	})();
	return workerPort;
}

/** The name of the file without .pdf, for the names of what is saved from it. */
let fileName = config.name;
const stem = () => fileName.replace(/\.pdf$/i, '');

/** Opens the bytes of the PDF; when it is written again, keeps the page and the zoom. */
async function openDocument(message) {
	const viewer = app();
	await viewer.initializedPromise;
	takeOverSaving(viewer);
	window.PDFViewerApplicationOptions.set('workerPort', await getWorkerPort());
	fileName = message.name;
	// The markup tools and the outline are the new document's
	editorReady = false;
	outlineCount = undefined;
	if (message.mode) {
		pendingMode = message.mode;
	}
	const keep = message.reload && viewer.pdfDocument ? { page: viewer.page, scale: viewer.pdfViewer.currentScaleValue, top: viewer.pdfViewer.container.scrollTop } : undefined;
	if (keep) {
		viewer.eventBus.on('pagesinit', () => {
			viewer.pdfViewer.currentScaleValue = keep.scale;
			viewer.page = Math.min(keep.page, viewer.pagesCount);
			viewer.pdfViewer.container.scrollTop = keep.top;
		}, { once: true });
	}
	if (message.page) {
		viewer.eventBus.on('pagesinit', () => showPage(message.page), { once: true });
	}
	try {
		await viewer.open({ data: message.data, filename: message.name, isEvalSupported: false, useWorkerFetch: false });
	} catch (error) {
		post({ command: 'warn', text: format(T.openFailed, message.name, error?.message ?? String(error)) });
		return;
	}
	poppler.documentOpened();
	applyMode();
	if (area && area.page > viewer.pagesCount) {
		clearArea();
	} else if (area) {
		await computeArea();
	}
}

/** Goes to page `page` (from 1), or to the last one; once the pages are laid out, when the document is still opening. */
function showPage(page) {
	const viewer = app();
	if (viewer.pagesCount) {
		viewer.page = Math.min(Math.max(1, page), viewer.pagesCount);
	} else {
		viewer.eventBus.on('pagesinit', () => showPage(page), { once: true });
	}
}

/**
 * Save, and the files of the viewer's attachments, go to a dialog of Pollis: a webview cannot download. An attachment
 * of a kind the tools show, such as a CSV file, is shown in the tools sidebar, with Save... beside it.
 */
let savingTaken = false;
function takeOverSaving(viewer) {
	if (savingTaken || !viewer.downloadManager) {
		return;
	}
	savingTaken = true;
	viewer.downloadManager.download = (data, _url, filename) => post({ command: 'saveAs', kind: 'pdf', name: filename || fileName, data });
	viewer.downloadManager.openOrDownloadData = (data, filename) => {
		if (poppler.shows(filename)) {
			setToolsShown(true, false);
			poppler.showAttachment(filename, data);
			return false;
		}
		post({ command: 'saveAs', kind: /\.pdf$/i.test(filename) ? 'pdf' : 'other', name: filename, data });
		return false;
	};
}

window.addEventListener('message', event => {
	const message = event.data;
	if (message?.command === 'open') {
		openDocument(message);
	} else if (message?.command === 'page') {
		showPage(message.page);
	} else if (message?.command === 'mode') {
		setMode(message.mode);
	} else if (['popplerResult', 'popplerStatus', 'fileRead', 'colorized'].includes(message?.command)) {
		poppler.received(message);
	} else if (message?.command === 'themeChanged') {
		poppler.recolor();
	} else if (message?.command === 'menuChoice') {
		menuChosen(message);
	}
});

// ---- The menus of pdf.js (the >> menu and the menus of the Pages pane) as Pollis' menus: native on macOS, with check
// marks for what is on and greyed-out items for what cannot be done. Each item is pdf.js' own button, clicked when chosen

let menuToken = 0;
let openMenu;

/** Whether an element is shown: pdf.js hides what does not apply with display none, the hidden class or attribute. */
const isShown = element => !element.hidden && !element.classList.contains('hidden') && getComputedStyle(element).display !== 'none';

/** The items of a pdf.js menu: its buttons, also those inside its groups (tools, scrolling, spreads), with lines between the groups. */
function menuItems(container) {
	const items = [];
	addMenuItems(container, items);
	while (items.length && items[items.length - 1].separator) {
		items.pop();
	}
	return items;
}

function addMenuItems(container, items) {
	for (const child of container.children) {
		if (!isShown(child)) {
			continue;
		}
		if (child.classList.contains('horizontalToolbarSeparator')) {
			if (items.length && !items[items.length - 1].separator) {
				items.push({ separator: true });
			}
		} else if (child.tagName === 'BUTTON' && child.id) {
			const label = child.textContent.trim() || child.title;
			if (label) {
				const checked = child.classList.contains('toggled') || child.getAttribute('aria-checked') === 'true' || child.getAttribute('aria-selected') === 'true';
				items.push({ id: child.id, label, checked, enabled: !child.disabled });
			}
		} else if (child.tagName === 'DIV') {
			addMenuItems(child, items);
		}
	}
}

function showMenu(trigger, container) {
	postMenu(trigger, menuItems(container));
}

/** Shows `items` below `trigger`; the chosen item's id goes to `choose`, else its pdf.js button of that id is clicked. */
function postMenu(trigger, items, choose) {
	if (!items.length) {
		return;
	}
	const bounds = trigger.getBoundingClientRect();
	// aria-expanded stays false: pdf.js shows its own menu where it is true
	openMenu = { token: ++menuToken, trigger, choose };
	post({ command: 'menu', token: openMenu.token, menu: { items, anchor: { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height } } });
}

function menuChosen(message) {
	if (!openMenu || message.token !== openMenu.token) {
		return;
	}
	const { trigger, choose } = openMenu;
	openMenu = undefined;
	if (choose && message.id) {
		choose(message.id);
		return;
	}
	const button = !choose && message.id && document.getElementById(message.id);
	if (button && !button.disabled) {
		button.click();
	} else {
		trigger.focus({ preventScroll: true });
	}
}

/** The menu a click or a key opens: the >> menu, or a menu of the Pages pane. */
function menuOf(target) {
	const trigger = target.closest?.('#secondaryToolbarToggleButton, button.hasPopupMenu');
	if (!trigger) {
		return undefined;
	}
	const container = trigger.id === 'secondaryToolbarToggleButton'
		? document.getElementById('secondaryToolbarButtonContainer')
		: document.getElementById(trigger.getAttribute('aria-controls'));
	return container ? { trigger, container } : undefined;
}

window.addEventListener('click', event => {
	const menu = menuOf(event.target);
	if (menu) {
		event.preventDefault();
		event.stopImmediatePropagation();
		showMenu(menu.trigger, menu.container);
	}
}, true);

window.addEventListener('keydown', event => {
	if (!['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
		return;
	}
	const menu = menuOf(event.target);
	if (menu) {
		event.preventDefault();
		event.stopImmediatePropagation();
		showMenu(menu.trigger, menu.container);
	}
}, true);

// ---- The toolbar: Select Area, Tools: Show | Hide for the tools sidebar, and the More menu (>>)

const outer = document.getElementById('outerContainer');
const viewerContainer = document.getElementById('viewerContainer');
const toolbarRight = document.getElementById('toolbarViewerRight');

const selectButton = element('button', 'toolbarButton pollisSelectArea');
selectButton.type = 'button';
selectButton.title = T.selectAreaTitle;
selectButton.setAttribute('aria-pressed', 'false');
selectButton.appendChild(element('span', '', T.selectArea));

// Tools: Show | Hide, the switch of the Welcome page: the side chosen in the foreground colour, the knob beside it
const toolsSwitch = element('div', 'pollisToolsSwitch');
toolsSwitch.title = T.toolsTitle;
const showSide = element('button', 'pollisSwitchSide', T.show);
const knob = element('button', 'pollisSwitchKnob');
const hideSide = element('button', 'pollisSwitchSide', T.hide);
for (const side of [showSide, knob, hideSide]) {
	side.type = 'button';
}
toolsSwitch.append(element('span', 'pollisSwitchLabel', T.tools), showSide, knob, hideSide);
showSide.addEventListener('click', () => setToolsShown(true, true));
hideSide.addEventListener('click', () => setToolsShown(false, true));
knob.addEventListener('click', () => setToolsShown(tools.hidden, true));

// Select Area beside the markup tools of pdf.js, as it too works on the page; the switch at the right end, above
// the sidebar it opens, after the More menu (>>)
toolbarRight.insertBefore(selectButton, document.getElementById('editorModeButtons'));
toolbarRight.append(element('div', 'verticalToolbarSeparator'), toolsSwitch);

// The menu of >> is More: pdf.js calls it Tools, the name of the switch. Without its l10n ids, pdf.js leaves it as it is
const moreButton = document.getElementById('secondaryToolbarToggleButton');
moreButton.removeAttribute('data-l10n-id');
moreButton.title = T.more;
const moreLabel = moreButton.querySelector('span');
moreLabel.removeAttribute('data-l10n-id');
moreLabel.textContent = T.more;

/** The sidebar at the right of the pages: the Area of Select Area, and the tools. */
const tools = element('aside', 'pollisTools');
tools.id = 'pollisTools';
tools.hidden = true;
document.getElementById('mainContainer').appendChild(tools);
const popplerPage = element('div', 'pollisPage');

/** Shows or hides the sidebar; `remember` keeps the choice for the next PDF. */
function setToolsShown(shown, remember) {
	tools.hidden = !shown;
	outer.classList.toggle('pollisToolsOpen', shown);
	showSide.classList.toggle('active', shown);
	hideSide.classList.toggle('active', !shown);
	showSide.setAttribute('aria-pressed', String(shown));
	hideSide.setAttribute('aria-pressed', String(!shown));
	knob.classList.toggle('right', !shown);
	knob.setAttribute('aria-label', shown ? T.hideTools : T.showTools);
	if (remember) {
		post({ command: 'toolsShown', shown });
	}
	// The pages fit the narrower view
	window.dispatchEvent(new Event('resize'));
}

/**
 * The Area section: the area once drawn; else, while Select Area is off, how to draw one. While Select Area is on and
 * no area is drawn, it would only repeat what the button says.
 */
function showAreaSection() {
	areaSection.hidden = selecting && !area;
}

/** Select Area: dragging on a page draws an area, shown in the sidebar once drawn. A markup tool of pdf.js goes off. */
let selecting = false;
function setSelecting(on) {
	selecting = on;
	viewerContainer.classList.toggle('pollisSelecting', on);
	selectButton.classList.toggle('toggled', on);
	selectButton.setAttribute('aria-pressed', String(on));
	if (on && editorMode > 0 && editorReady) {
		app().eventBus.dispatch('switchannotationeditormode', { source: window, mode: NO_EDITOR });
	}
	showAreaSection();
}
selectButton.addEventListener('click', () => setSelecting(!selecting));
// Escape clears the area, and then switches Select Area off
document.addEventListener('keydown', event => {
	if (event.key !== 'Escape' || drag) {
		return;
	}
	if (area) {
		clearArea();
	} else if (selecting) {
		setSelecting(false);
	}
});

// ---- The sections of the sidebar

function section(title, parent = tools) {
	const box = element('section', 'pollisSection');
	box.appendChild(element('h2', '', title));
	parent.appendChild(box);
	return box;
}

// The area
const areaSection = section(T.area);
// The hint, with the icon of Select Area in place of {0}
const areaHint = element('p', 'pollisHint');
for (const [i, part] of T.areaHint.split('{0}').entries()) {
	if (i) {
		const icon = element('span', 'pollisInlineIcon pollisSelectAreaIcon');
		icon.setAttribute('aria-hidden', 'true');
		areaHint.appendChild(icon);
	}
	areaHint.append(part);
}
const areaBody = element('div', 'pollisAreaBody');
areaBody.hidden = true;
areaSection.append(areaHint, areaBody);

const areaHeader = element('div', 'pollisAreaHeader');
const areaNumbers = element('span', 'pollisNumbers');
const clearButton = element('button', 'pollisIconButton', '×');
clearButton.type = 'button';
clearButton.title = T.clearArea;
clearButton.setAttribute('aria-label', T.clearArea);
clearButton.addEventListener('click', () => clearArea());
areaHeader.append(areaNumbers, clearButton);

const areaPicture = element('div', 'pollisPicture');
const tableBox = element('div', 'pollisTableBox');
const tableNote = element('p', 'pollisHint');

const settings = element('div', 'pollisSettings');
function numberInput(label, title, value) {
	const wrapper = element('label', 'pollisField');
	wrapper.title = title;
	wrapper.appendChild(element('span', '', label));
	const input = element('input');
	input.type = 'number';
	input.min = '0';
	input.step = '0.5';
	input.value = String(value);
	input.addEventListener('change', () => showTable());
	wrapper.appendChild(input);
	settings.appendChild(wrapper);
	return input;
}
const gapInput = numberInput(T.gap, T.gapTitle, 8);
const rowToleranceInput = numberInput(T.rowTolerance, T.rowToleranceTitle, 3);

const areaActions = element('div', 'pollisButtons');
areaActions.append(
	button(T.copyText, undefined, () => post({ command: 'copy', text: result.text })),
	button(T.copyTable, T.copyTableTitle, () => post({ command: 'copy', text: cellsTabbed(result.cells) })),
	button(T.saveCsv, undefined, () => post({ command: 'saveAs', kind: 'csv', name: `${areaName()} table.csv`, data: new TextEncoder().encode(cellsCsv(result.cells) + '\n') })),
	button(T.savePng, undefined, async () => post({ command: 'saveAs', kind: 'png', name: `${areaName()} area.png`, data: await pngBytes(result.picture) })),
);
const askTitle = element('h3', '', T.sendToAsk);
const askActions = element('div', 'pollisButtons');
askActions.append(
	button(T.sendText, T.sendTextTitle, () => post({ command: 'ask', kind: 'file', name: `${areaName()} area.txt`, content: result.text })),
	button(T.sendTable, T.sendTableTitle, () => post({ command: 'ask', kind: 'file', name: `${areaName()} table.csv`, content: cellsCsv(result.cells) })),
	button(T.sendImage, T.sendImageTitle, () => post({ command: 'ask', kind: 'image', name: `${areaName()} area.png`, content: result.picture.toDataURL('image/png') })),
);
areaBody.append(areaHeader, areaPicture, tableBox, tableNote, settings, areaActions, askTitle, askActions);

// ---- Select Area: a box dragged on a page, in points from the top left corner of the page

/** The area: its page and its box in points; and what was taken from it. */
let area;
let result = { text: '', cells: [], picture: undefined };
let drag;
const areaBox = element('div', 'pollisAreaBox');

const areaName = () => `${stem()} p${area.page}`;

// The Poppler tools, the other page of the sidebar
tools.appendChild(popplerPage);
const poppler = popplerTools(popplerPage, { T, config, post, app, element, button, format, table, stem, getArea: () => area });
showAreaSection();
setToolsShown(!!config.toolsShown, false);

/** The page view of pdf.js of page `n`, from 1. */
const pageView = n => app().pdfViewer.getPageView(n - 1);

/** A point of the page's box on the screen, in points from the top left corner of the page. */
function toPoints(view, x, y) {
	const [px, py] = view.viewport.convertToPdfPoint(x, y);
	const box = view.pdfPage.view;
	return [px - box[0], box[3] - py];
}

/** The box of an area in the pixels of `viewport`, from two opposite corners, which a rotated page swaps. */
function viewportRectangle(viewport, pageBox, taken) {
	const [x1, y1] = viewport.convertToViewportPoint(pageBox[0] + taken.x, pageBox[3] - taken.y);
	const [x2, y2] = viewport.convertToViewportPoint(pageBox[0] + taken.x + taken.W, pageBox[3] - taken.y - taken.H);
	return { left: Math.min(x1, x2), top: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
}

/** The box of the area on the page, in pixels of the page's box on the screen. */
function areaRectangle(view) {
	return viewportRectangle(view.viewport, view.pdfPage.view, area);
}

function placeBox(view, rectangle) {
	if (areaBox.parentElement !== view.div) {
		view.div.appendChild(areaBox);
	}
	Object.assign(areaBox.style, { left: `${rectangle.left}px`, top: `${rectangle.top}px`, width: `${rectangle.width}px`, height: `${rectangle.height}px` });
}

/** The box again where pdf.js has drawn the page anew, at another zoom or rotation. */
function redrawBox() {
	if (!area || drag) {
		return;
	}
	const view = pageView(area.page);
	if (view?.pdfPage) {
		placeBox(view, areaRectangle(view));
	}
}

/** The pixels of a pointer event in the page's box on the screen, which starts inside the page's border. */
function inPage(div, event) {
	const bounds = div.getBoundingClientRect();
	return [event.clientX - bounds.left - div.clientLeft, event.clientY - bounds.top - div.clientTop];
}

viewerContainer.addEventListener('pointerdown', event => {
	if (!selecting || event.button !== 0) {
		return;
	}
	const div = event.target.closest('.page');
	if (!div) {
		return;
	}
	event.preventDefault();
	event.stopPropagation();
	// Without the default of the press the pages take no focus, which Escape needs to reach this page
	viewerContainer.focus({ preventScroll: true });
	const page = Number(div.dataset.pageNumber);
	const [x, y] = inPage(div, event);
	drag = { div, page, x, y };
	viewerContainer.setPointerCapture(event.pointerId);
	const view = pageView(page);
	placeBox(view, { left: x, top: y, width: 0, height: 0 });
	areaBox.classList.remove('flash');
}, true);

viewerContainer.addEventListener('pointermove', event => {
	if (!drag) {
		return;
	}
	const [x, y] = inPage(drag.div, event);
	const width = drag.div.clientWidth;
	const height = drag.div.clientHeight;
	const cx = Math.max(0, Math.min(width, x));
	const cy = Math.max(0, Math.min(height, y));
	placeBox(pageView(drag.page), { left: Math.min(drag.x, cx), top: Math.min(drag.y, cy), width: Math.abs(cx - drag.x), height: Math.abs(cy - drag.y) });
}, true);

viewerContainer.addEventListener('pointerup', async event => {
	if (!drag) {
		return;
	}
	const started = drag;
	drag = undefined;
	viewerContainer.releasePointerCapture(event.pointerId);
	const [x, y] = inPage(started.div, event);
	const cx = Math.max(0, Math.min(started.div.clientWidth, x));
	const cy = Math.max(0, Math.min(started.div.clientHeight, y));
	if (Math.abs(cx - started.x) < 4 || Math.abs(cy - started.y) < 4) {
		// A click, not a drag, clears the area
		clearArea();
		return;
	}
	const view = pageView(started.page);
	const [ax, ay] = toPoints(view, started.x, started.y);
	const [bx, by] = toPoints(view, cx, cy);
	area = { page: started.page, x: round(Math.min(ax, bx)), y: round(Math.min(ay, by)), W: round(Math.abs(bx - ax)), H: round(Math.abs(by - ay)) };
	redrawBox();
	areaBox.classList.add('flash');
	poppler.areaChanged(area);
	// The area's text, table and picture are in the sidebar, which shows them once the area is drawn
	showAreaSection();
	setToolsShown(true, false);
	await computeArea();
}, true);

function clearArea() {
	area = undefined;
	result = { text: '', cells: [], picture: undefined };
	areaBox.remove();
	areaBody.hidden = true;
	areaHint.hidden = false;
	poppler.areaChanged(undefined);
	showAreaSection();
}

/** The words of page `n`, kept while the document is open. */
const wordsCache = new Map();
async function wordsOf(n) {
	const documentProxy = app().pdfDocument;
	const key = `${documentProxy.fingerprints[0]}:${n}`;
	if (!wordsCache.has(key)) {
		const page = await documentProxy.getPage(n);
		wordsCache.set(key, pageWords((await page.getTextContent()).items, page.view));
	}
	return wordsCache.get(key);
}

/** The text, the cells and the picture of the area, shown in the sidebar. */
async function computeArea() {
	const taken = area;
	areaHint.hidden = true;
	areaBody.hidden = false;
	areaNumbers.textContent = format(T.areaNumbers, taken.page, taken.x, taken.y, taken.W, taken.H);
	areaPicture.textContent = T.working;
	const words = await wordsOf(taken.page);
	const picture = await areaPictureOf(taken);
	if (taken !== area) {
		return;
	}
	result = { words, text: areaText(words, taken, Number(rowToleranceInput.value) || 0), cells: [], picture };
	areaPicture.textContent = '';
	const shown = element('img');
	shown.src = picture.toDataURL('image/png');
	shown.alt = T.area;
	areaPicture.appendChild(shown);
	showTable();
}

/** The table of the area, with the gap and the tolerance given. */
function showTable() {
	if (!area || !result.words) {
		return;
	}
	const rowTolerance = Number(rowToleranceInput.value) || 0;
	result.text = areaText(result.words, area, rowTolerance);
	result.cells = areaCells(result.words, area, Number(gapInput.value) || 0, rowTolerance);
	tableBox.textContent = '';
	if (!result.cells.length) {
		tableNote.textContent = T.noText;
		return;
	}
	const table = element('table', 'pollisTable');
	for (const row of result.cells.slice(0, MAX_ROWS)) {
		const tr = element('tr');
		for (const cell of row) {
			tr.appendChild(element('td', '', cell));
		}
		table.appendChild(tr);
	}
	tableBox.appendChild(table);
	const size = format(T.tableSize, result.cells.length, result.cells[0].length);
	tableNote.textContent = result.cells.length > MAX_ROWS ? `${size}. ${format(T.tableShown, MAX_ROWS)}` : size;
}

/** The picture of an area, drawn by pdf.js at two pixels to a point. */
async function areaPictureOf(taken) {
	const page = await app().pdfDocument.getPage(taken.page);
	const viewport = page.getViewport({ scale: AREA_SCALE });
	const rectangle = viewportRectangle(viewport, page.view, taken);
	const left = Math.floor(rectangle.left);
	const top = Math.floor(rectangle.top);
	const width = Math.max(1, Math.ceil(rectangle.width));
	const height = Math.max(1, Math.ceil(rectangle.height));
	const canvas = element('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	context.fillStyle = '#ffffff';
	context.fillRect(0, 0, width, height);
	// Only the area is drawn: the page moves so that the area's corner is at the canvas' origin
	await page.render({ canvas, canvasContext: context, viewport, transform: [1, 0, 0, 1, -left, -top] }).promise;
	return canvas;
}

async function pngBytes(canvas) {
	const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
	return new Uint8Array(await blob.arrayBuffer());
}

/** A table that scrolls sideways when it is wider than the sidebar; with `wrap`, its long values wrap instead. */
function table(rows, header, wrap = false) {
	const scroll = element('div', 'pollisTableScroll');
	const node = element('table', wrap ? 'pollisTable pollisList' : 'pollisTable');
	scroll.appendChild(node);
	if (header) {
		const tr = element('tr');
		for (const cell of header) {
			tr.appendChild(element('th', '', cell));
		}
		node.appendChild(tr);
	}
	for (const row of rows) {
		const tr = element('tr');
		for (const cell of row) {
			tr.appendChild(cell instanceof Node ? (() => { const td = element('td'); td.appendChild(cell); return td; })() : element('td', '', cell));
		}
		node.appendChild(tr);
	}
	return scroll;
}

post({ command: 'ready' });
