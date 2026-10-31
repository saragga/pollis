/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// What the + of Ask Pollis attaches to a question, the same in its pane and in the pill of a panel: the + and its menu,
// the chips above the question, and the messages they send to the workbench, which picks a dataset or a database and
// cuts a long text (ASK_POLLIS_ATTACH_COMMAND_ID, in askPollisPage.ts).

import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ASK_POLLIS_ANSWERS_IN_CLOUD_COMMAND_ID, ASK_POLLIS_ATTACH_COMMAND_ID, ASK_POLLIS_COMMAND_ID, AskPollisAttachRequest, IAskPollisAttached, IAskPollisAttachment, IAskPollisFromPanel, IAskPollisPanel } from '../common/askPollis.js';
import { MAX_FILE_BYTES, MAX_IMAGE_BYTES } from './collaboration/collaborationProtocol.js';
import { composerAddCss, composerAddHtml, composerAddScript } from './composerAdd.js';

/** The messages of the +: a text file read in the page, or a dataset or a database for the workbench to pick. */
export type AskAttachMessage =
	| { readonly command: 'attachFile'; readonly name: string; readonly content: string }
	| { readonly command: 'pickDataset' }
	| { readonly command: 'pickDatabase' };

/** The messages of a panel's Ask Pollis: its question, what the + attaches, and which model answers. */
export type PanelAskMessage =
	| AskAttachMessage
	| { readonly command: 'askPollis'; readonly question: string; readonly attachments?: readonly IAskPollisAttachment[] }
	| { readonly command: 'askPollisModel' };

/** Runs a message of the + and posts what it attached, or why not, as `attached`. */
export async function handleAskAttachMessage(message: AskAttachMessage, webview: { postMessage(message: unknown): void }, commandService: ICommandService): Promise<void> {
	let request: AskPollisAttachRequest;
	if (message.command === 'attachFile') {
		request = { kind: 'file', name: message.name, content: message.content };
	} else {
		request = { kind: message.command === 'pickDataset' ? 'dataset' : 'database' };
	}
	const attached = await commandService.executeCommand<IAskPollisAttached>(ASK_POLLIS_ATTACH_COMMAND_ID, request);
	webview.postMessage({ command: 'attached', attachment: attached?.attachment, note: attached?.note });
}

/** Runs a message of a panel's Ask Pollis, whose question is answered in the pane beside `panel`. */
export async function handlePanelAskMessage(message: PanelAskMessage, webview: { postMessage(message: unknown): void }, commandService: ICommandService, panel: IAskPollisPanel): Promise<void> {
	if (message.command === 'askPollis') {
		if (message.question.trim()) {
			await commandService.executeCommand(ASK_POLLIS_COMMAND_ID, { question: message.question.trim(), panel, attachments: message.attachments } satisfies IAskPollisFromPanel);
		}
	} else if (message.command === 'askPollisModel') {
		webview.postMessage({ command: 'askPollisModel', cloud: await commandService.executeCommand<boolean>(ASK_POLLIS_ANSWERS_IN_CLOUD_COMMAND_ID) });
	} else {
		await handleAskAttachMessage(message, webview, commandService);
	}
}

/** The + and its menu; `prefix` starts their ids, where a page may already have an `add` or a `file`. */
export function askAddHtml(prefix = ''): string {
	return composerAddHtml({
		add: localize('askPollis.add', "Add an Image, a File, a Dataset or a Database"),
		image: localize('askPollis.addImage', "Image"),
		file: localize('askPollis.addFile', "File"),
		dataset: localize('askPollis.addDataset', "Dataset"),
		database: localize('askPollis.addDatabase', "Database"),
	}, prefix);
}

/** The chips of what is attached and the note of why something is not, above the question. */
export function askAttachmentsHtml(prefix = ''): string {
	return `<div class="attachments" id="${prefix}attachments"></div>
		<div class="attach-note" id="${prefix}attachNote" hidden></div>`;
}

/** The CSS of the + and of the chips. */
export const askAttachCss = `${composerAddCss}
		.attachments { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
		.attachments:empty { display: none; }
		.chip { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; font-size: 12px; padding: 2px 4px 2px 8px; border: 1px solid var(--vscode-widget-border); border-radius: 6px; background: var(--vscode-editorWidget-background); }
		.chip .kind { color: var(--vscode-descriptionForeground); }
		.chip .name { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.chip.image { padding: 2px; }
		.chip img { display: block; max-height: 48px; max-width: 96px; border-radius: 4px; }
		.chip .remove { display: flex; align-items: center; justify-content: center; flex: none; width: 18px; height: 18px; padding: 0; border: none; border-radius: 4px; color: var(--vscode-descriptionForeground); background: transparent; cursor: pointer; }
		.chip .remove:hover { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		.chip .remove svg { width: 10px; height: 10px; }
		.attach-note { margin: 0 0 6px 0; font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; }`;

/**
 * Defines, in a page's script, what is attached to the question in the input `inputId`: an image, for a cloud model
 * only, a text file, or a dataset or a database, which the workbench picks and reads. `chip(attachment, remove)` makes
 * an attachment's chip, `setAttachCloud(cloud)` says whether a cloud model answers, `onAttached(message)` takes the
 * message `attached`, and `takeAttachments()` gives what goes with a question and clears it, or gives undefined, with a
 * note, when an image is attached and a model of this computer answers. A file is dropped on `dropSelector`.
 */
export function askAttachScript(inputId: string, prefix = '', dropSelector?: string): string {
	const text = {
		kinds: {
			image: localize('askPollis.addImage', "Image"),
			file: localize('askPollis.addFile', "File"),
			dataset: localize('askPollis.addDataset', "Dataset"),
			database: localize('askPollis.addDatabase', "Database"),
		},
		remove: localize('askPollis.remove', "Remove"),
		imageLocal: localize('askPollis.imageLocal', "The models on this computer do not see images yet: choose a cloud model in the status bar to ask about an image."),
		notAnImage: localize('askPollis.notAnImage', "Only PNG, JPEG, GIF and WebP images can be attached."),
		imageTooLarge: localize('askPollis.imageTooLarge', "This image is too large, even reduced (the limit is {0} MB).", MAX_IMAGE_BYTES / 1024 / 1024),
		fileTooLarge: localize('askPollis.fileTooLarge', "{0} is too large to attach (the limit is {1} MB).", '{0}', MAX_FILE_BYTES / 1024 / 1024),
		notText: localize('askPollis.notText', "{0} is not a text file in UTF-8, so it was not attached: attach a CSV file as a Dataset and a DuckDB file as a Database.", '{0}'),
	};
	return `${composerAddScript(inputId, MAX_IMAGE_BYTES, prefix, dropSelector)}
	const ATTACH_TEXT = ${JSON.stringify(text)};
	const REMOVE_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
	const attachInput = document.getElementById('${inputId}');
	const attachmentsBox = document.getElementById('${prefix}attachments');
	const attachNote = document.getElementById('${prefix}attachNote');
	const addImage = document.getElementById('${prefix}addImage');
	let attachments = [];
	let attachCloud = false;
	function note(text) {
		attachNote.textContent = text || '';
		attachNote.hidden = !text;
	}
	function setAttachCloud(cloud) {
		attachCloud = cloud;
		addImage.disabled = !cloud;
		addImage.title = cloud ? '' : ATTACH_TEXT.imageLocal;
	}
	/** An attachment's chip: an image's thumbnail, else its kind and name; with \`remove\`, a button that removes it. */
	function chip(attachment, remove) {
		const box = document.createElement('span');
		box.className = attachment.image ? 'chip image' : 'chip';
		box.title = attachment.name;
		if (attachment.image) {
			const img = document.createElement('img');
			img.src = attachment.image;
			img.alt = attachment.name;
			box.appendChild(img);
		} else {
			const kind = document.createElement('span');
			kind.className = 'kind';
			kind.textContent = ATTACH_TEXT.kinds[attachment.kind];
			const name = document.createElement('span');
			name.className = 'name';
			name.textContent = attachment.name;
			box.append(kind, name);
		}
		if (remove) {
			const button = document.createElement('button');
			button.className = 'remove';
			button.innerHTML = REMOVE_SVG;
			button.title = ATTACH_TEXT.remove;
			button.setAttribute('aria-label', ATTACH_TEXT.remove + ' ' + attachment.name);
			button.addEventListener('click', event => {
				event.stopPropagation();
				remove();
			});
			box.appendChild(button);
		}
		return box;
	}
	function renderAttachments() {
		attachmentsBox.textContent = '';
		attachments.forEach((attachment, i) => attachmentsBox.appendChild(chip({ ...attachment, image: attachment.kind === 'image' ? attachment.content : undefined }, () => {
			attachments.splice(i, 1);
			renderAttachments();
			attachInput.focus();
		})));
	}
	function attach(attachment) {
		attachments.push(attachment);
		renderAttachments();
		attachInput.focus();
	}
	function onAttached(message) {
		note(message.note);
		if (message.attachment) {
			attach(message.attachment);
		}
	}
	function takeAttachments() {
		if (!attachCloud && attachments.some(attachment => attachment.kind === 'image')) {
			note(ATTACH_TEXT.imageLocal);
			return undefined;
		}
		const taken = attachments;
		attachments = [];
		renderAttachments();
		note('');
		return taken;
	}
	async function attachImage(file) {
		if (!attachCloud) {
			note(ATTACH_TEXT.imageLocal);
			return;
		}
		const image = await composerReduceImage(file);
		if (image.dataUrl) {
			note('');
			attach({ kind: 'image', name: file.name || 'image', content: image.dataUrl });
		} else {
			note(image.error === 'notAnImage' ? ATTACH_TEXT.notAnImage : ATTACH_TEXT.imageTooLarge);
		}
	}
	async function attachFile(file) {
		if (file.size > ${MAX_FILE_BYTES}) {
			note(ATTACH_TEXT.fileTooLarge.replace('{0}', file.name));
			return;
		}
		let content;
		try {
			content = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
		} catch {
			content = undefined;
		}
		if (content === undefined || content.includes('\\u0000')) {
			note(ATTACH_TEXT.notText.replace('{0}', file.name));
			return;
		}
		// The workbench cuts a long text, and says so
		vscode.postMessage({ command: 'attachFile', name: file.name, content });
	}
	composerAdd({ image: attachImage, file: attachFile });`;
}
