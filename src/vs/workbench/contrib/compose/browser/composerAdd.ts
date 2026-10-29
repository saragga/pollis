/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The + at the start of the last line of a chat's input box, in Ask Pollis and in the Collaboration chat: its menu,
// Image, File, Dataset and Database, and an image or a file pasted or dragged in. Each chat says what an image and a
// file become; a dataset and a database are picked by the workbench, which each chat asks with `pickDataset` and
// `pickDatabase`.

import { composerAddSvg } from '../../model/browser/webviews/webviewScaffold.js';

/** The titles of the + and of its menu's items. */
export interface IComposerAddTitles {
	readonly add: string;
	readonly image: string;
	readonly file: string;
	readonly dataset: string;
	readonly database: string;
}

/** The + and its menu, above it, with the file inputs of Image and File. */
export function composerAddHtml(titles: IComposerAddTitles): string {
	return `<div class="add">
					<div id="addMenu" role="menu">
						<button id="addImage" role="menuitem">${titles.image}</button>
						<button id="addFile" role="menuitem">${titles.file}</button>
						<button id="addDataset" role="menuitem">${titles.dataset}</button>
						<button id="addDatabase" role="menuitem">${titles.database}</button>
					</div>
					<button class="icon" id="add" title="${titles.add}" aria-label="${titles.add}" aria-haspopup="menu">${composerAddSvg}</button>
					<input type="file" id="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden>
					<input type="file" id="anyFile" hidden>
				</div>`;
}

/** The menu of the +, above it. */
export const composerAddCss = `.add { position: relative; }
		#addMenu { display: none; position: absolute; bottom: 36px; left: 0; z-index: 1; min-width: 140px; padding: 4px 0; color: var(--vscode-menu-foreground); background: var(--vscode-menu-background); border: 1px solid var(--vscode-menu-border, var(--vscode-widget-border)); border-radius: 6px; box-shadow: 0 2px 8px var(--vscode-widget-shadow); }
		#addMenu.open { display: block; }
		#addMenu button { display: block; width: 100%; text-align: left; padding: 4px 14px; border-radius: 0; color: inherit; background: none; }
		#addMenu button:not(:disabled):hover, #addMenu button:focus { color: var(--vscode-menu-selectionForeground); background: var(--vscode-menu-selectionBackground); outline: none; }
		body.dragging .composer { outline: 2px dashed var(--vscode-focusBorder); outline-offset: 2px; }`;

/**
 * Defines, in a chat's script, `composerReduceImage(file)` and `composerAdd(handlers)`. The first gives an image as a
 * data URL, reduced when it is over `maxImageBytes` or very large: its longest side to 1600 px as PNG, then as JPEG;
 * or `{ error: 'notAnImage' }` or `{ error: 'tooLarge' }`. The second opens the menu from the +, and calls
 * `handlers.image(file)` with an image chosen, pasted in the input `inputId` or dragged in, and `handlers.file(file)`
 * with any other file chosen or dragged in.
 */
export function composerAddScript(inputId: string, maxImageBytes: number): string {
	return `
	const composerImageTypes = /^image\\/(png|jpeg|gif|webp)$/;
	const composerImageBytes = dataUrl => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
	const composerReadAsDataUrl = file => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

	async function composerReduceImage(file) {
		if (!composerImageTypes.test(file.type)) {
			return { error: 'notAnImage' };
		}
		const original = await composerReadAsDataUrl(file);
		const picture = new Image();
		picture.src = original;
		await picture.decode();
		if (composerImageBytes(original) <= ${maxImageBytes} && Math.max(picture.width, picture.height) <= 2400) {
			return { dataUrl: original };
		}
		const scale = Math.min(1, 1600 / Math.max(picture.width, picture.height));
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(picture.width * scale);
		canvas.height = Math.round(picture.height * scale);
		canvas.getContext('2d').drawImage(picture, 0, 0, canvas.width, canvas.height);
		let reduced = canvas.toDataURL('image/png');
		if (composerImageBytes(reduced) > ${maxImageBytes}) {
			reduced = canvas.toDataURL('image/jpeg', 0.9);
		}
		return composerImageBytes(reduced) > ${maxImageBytes} ? { error: 'tooLarge' } : { dataUrl: reduced };
	}

	function composerAdd(handlers) {
		const byId = id => document.getElementById(id);
		const addMenu = byId('addMenu');
		const closeAddMenu = () => addMenu.classList.remove('open');
		byId('add').addEventListener('click', e => {
			e.stopPropagation();
			addMenu.classList.toggle('open');
			if (addMenu.classList.contains('open')) {
				addMenu.querySelector('button:not(:disabled)')?.focus();
			}
		});
		document.addEventListener('click', closeAddMenu);
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape' && addMenu.classList.contains('open')) {
				closeAddMenu();
				byId('add').focus();
			}
		});
		byId('addImage').addEventListener('click', () => byId('file').click());
		byId('addFile').addEventListener('click', () => byId('anyFile').click());
		byId('addDataset').addEventListener('click', () => vscode.postMessage({ command: 'pickDataset' }));
		byId('addDatabase').addEventListener('click', () => vscode.postMessage({ command: 'pickDatabase' }));
		for (const [id, handler] of [['file', handlers.image], ['anyFile', handlers.file]]) {
			byId(id).addEventListener('change', () => {
				const file = byId(id).files[0];
				byId(id).value = '';
				if (file) {
					handler(file);
				}
			});
		}
		byId('${inputId}').addEventListener('paste', e => {
			const file = [...(e.clipboardData?.files || [])].find(item => item.type.startsWith('image/'));
			if (file) {
				e.preventDefault();
				handlers.image(file);
			}
		});
		document.body.addEventListener('dragover', e => { e.preventDefault(); document.body.classList.add('dragging'); });
		document.body.addEventListener('dragleave', () => document.body.classList.remove('dragging'));
		document.body.addEventListener('drop', e => {
			e.preventDefault();
			document.body.classList.remove('dragging');
			const file = e.dataTransfer?.files?.[0];
			if (file && composerImageTypes.test(file.type)) {
				handlers.image(file);
			} else if (file) {
				handlers.file(file);
			}
		});
	}`;
}
