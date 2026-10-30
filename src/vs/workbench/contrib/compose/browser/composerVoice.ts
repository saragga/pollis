/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The voice tools at the end of the first line of a chat's input box, in Ask Pollis, in the Collaboration chat and in
// the Ask Pollis of each panel (webviewScaffold.ts): the microphone, which will dictate, voice to text; Voice Mode, the
// waveform, which will ask aloud and read the answer aloud, both written down too; and \u6587A, whose menu chooses the
// language spoken, I Speak, and the one written, Write In: the same, or another into which what is said is translated, to
// be corrected before it is sent. Read Aloud, text to voice, is on each answer, not here. Voice is not implemented yet:
// only the languages are kept, for Pollis' own speech to use when it comes (accessibility.voice.speechLanguage of VS
// Code is registered only once there is a speech provider).

import { localize } from '../../../../nls.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { SPEECH_LANGUAGES } from '../../speech/common/speechService.js';

const VOICE_LANGUAGE_KEY = 'pollis.voice.language';
const VOICE_WRITE_IN_KEY = 'pollis.voice.writeIn';

/** The microphone of a chat's input box, at the end of its first line: voice is not implemented yet. */
export const composerMicSvg = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1a2 2 0 0 0-2 2v5a2 2 0 1 0 4 0V3a2 2 0 0 0-2-2zM5 7H4v1a4 4 0 0 0 3.5 3.969V14H5v1h6v-1H8.5v-2.031A4 4 0 0 0 12 8V7h-1v1a3 3 0 0 1-6 0V7z"/></svg>`;
const AUTO = 'auto';
const SAME = 'same';

/** The language spoken, I Speak in a chat's \u6587A menu, `auto` for the display language. */
export function getVoiceLanguage(storageService: IStorageService): string {
	const value = storageService.get(VOICE_LANGUAGE_KEY, StorageScope.APPLICATION, AUTO);
	return value === AUTO || Object.prototype.hasOwnProperty.call(SPEECH_LANGUAGES, value) ? value : AUTO;
}

/** Keeps the language spoken, for every chat. */
export function setVoiceLanguage(storageService: IStorageService, value: string): void {
	storageService.store(VOICE_LANGUAGE_KEY, value, StorageScope.APPLICATION, StorageTarget.USER);
}

/** The language written, Write In in a chat's \u6587A menu, `same` for the language spoken, untranslated. */
export function getVoiceWriteIn(storageService: IStorageService): string {
	const value = storageService.get(VOICE_WRITE_IN_KEY, StorageScope.APPLICATION, SAME);
	return value === SAME || Object.prototype.hasOwnProperty.call(SPEECH_LANGUAGES, value) ? value : SAME;
}

/** Keeps the language written, for every chat. */
export function setVoiceWriteIn(storageService: IStorageService, value: string): void {
	storageService.store(VOICE_WRITE_IN_KEY, value, StorageScope.APPLICATION, StorageTarget.USER);
}

/** The titles of the microphone and of Voice Mode, which say what they will do in that chat. */
export interface IComposerVoiceTitles {
	readonly dictate: string;
	readonly voiceMode: string;
}

const WAVEFORM = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 7v2M5 5v6M8 2.5v11M11 5v6M14 7v2"/></svg>';
// \u6587 and A side by side on one line, as written: translation
const TRANSLATE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.1 2.6v1.4M0.9 4.4h6.4M5.8 5.6C5.1 8.6 3.3 11 0.9 12.4M2.4 5.6C3.1 8.6 4.9 11 7.3 12.4M8.9 12.4l2.9-8.2 2.9 8.2M9.8 9.8h4"/></svg>';

/**
 * The microphone, Voice Mode and \u6587A, for the first line of a chat's input box, with the language spoken and the
 * language written kept now.
 */
export function composerVoiceHtml(titles: IComposerVoiceTitles, language: string, writeIn: string): string {
	const text = {
		languages: localize('composerVoice.languages', "Languages: the one you speak, and the one Dictate and Voice Mode write in"),
		iSpeak: localize('composerVoice.iSpeak', "I Speak"),
		writeIn: localize('composerVoice.writeIn', "Write In"),
		writeInNote: localize('composerVoice.writeInNote', "What you say is written in this language, translated if need be, for you to correct before you send it."),
		auto: localize('composerVoice.autoLanguage', "Auto (Use Display Language)"),
		same: localize('composerVoice.sameLanguage', "Same as I Speak"),
		back: localize('composerVoice.back', "Back"),
	};
	const languages = Object.entries(SPEECH_LANGUAGES).map(([value, { name }]) => ({ value, label: name })).sort((a, b) => a.label.localeCompare(b.label));
	const attribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
	return `<span class="voice-tools" data-language="${attribute(language)}" data-write-in="${attribute(writeIn)}" data-languages="${attribute(JSON.stringify(languages))}" data-text="${attribute(JSON.stringify(text))}">
				<button class="voice-button" id="voice" title="${titles.dictate}" aria-label="${titles.dictate}">${composerMicSvg}</button>
				<button class="voice-button" id="voiceMode" title="${titles.voiceMode}" aria-label="${titles.voiceMode}">${WAVEFORM}</button>
				<span class="voice-anchor">
					<button class="voice-button" id="voiceLanguages" title="${text.languages}" aria-label="${text.languages}" aria-haspopup="menu" aria-expanded="false">${TRANSLATE}</button>
					<div class="voice-menu" id="voiceMenu" role="menu" hidden></div>
				</span>
			</span>`;
}

/** The CSS of the voice tools, which overrides a page's own rules for its buttons. */
export const composerVoiceCss = `.voice-tools { display: inline-flex; align-items: center; flex: none; }
		.voice-tools button.voice-button { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; padding: 0; border: none; box-shadow: none; border-radius: 50%; opacity: 1; color: var(--vscode-descriptionForeground); background: transparent; cursor: pointer; }
		.voice-tools button.voice-button:hover, .voice-tools button.voice-button[aria-expanded="true"] { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		.voice-tools button.voice-button svg { width: 18px; height: 18px; }
		.voice-anchor { position: relative; display: inline-flex; }
		.voice-menu { position: absolute; top: 32px; right: 0; z-index: 3; min-width: min(280px, calc(100vw - 8px)); max-width: calc(100vw - 8px); max-height: 60vh; overflow-y: auto; padding: 4px; font-size: 12px; color: var(--vscode-menu-foreground); background: var(--vscode-menu-background); border: 1px solid var(--vscode-menu-border, var(--vscode-widget-border)); border-radius: 8px; box-shadow: 0 4px 16px var(--vscode-widget-shadow); }
		.voice-menu.up { top: auto; bottom: 32px; }
		.voice-menu .voice-heading { font-size: 11px; color: var(--vscode-descriptionForeground); padding: 6px 8px 2px 8px; }
		.voice-menu button.voice-item { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; font: inherit; font-size: 12px; opacity: 1; box-shadow: none; color: inherit; background: none; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
		.voice-menu button.voice-item:hover, .voice-menu button.voice-item:focus { color: var(--vscode-menu-selectionForeground); background: var(--vscode-menu-selectionBackground); outline: none; }
		.voice-menu .voice-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.voice-menu .voice-check, .voice-menu .voice-arrow { width: 12px; flex: none; }
		.voice-menu .voice-value { flex: none; max-width: 55%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--vscode-descriptionForeground); }
		.voice-menu button.voice-item:hover .voice-value, .voice-menu button.voice-item:focus .voice-value { color: inherit; }
		.voice-menu .voice-note { font-size: 11px; color: var(--vscode-descriptionForeground); padding: 2px 8px 6px 8px; }`;

/**
 * The script of the voice tools: \u6587A's menu, below it or above it when there is no room, has I Speak and Write In,
 * each opening its list of languages, with Back; a language chosen is posted as `voiceLanguage` or `voiceWriteIn`, and
 * one posted to the page so is the one kept, for a page whose HTML is made without them. The microphone and Voice Mode
 * only give the focus back to the input box `inputId`, until voice comes.
 */
export function composerVoiceScript(inputId: string): string {
	return `(() => {
		const tools = document.querySelector('.voice-tools');
		const LANGUAGES = JSON.parse(tools.dataset.languages);
		const VOICE_TEXT = JSON.parse(tools.dataset.text);
		const chosen = { voiceLanguage: tools.dataset.language, voiceWriteIn: tools.dataset.writeIn };
		const lists = {
			voiceLanguage: { title: VOICE_TEXT.iSpeak, entries: [{ value: '${AUTO}', label: VOICE_TEXT.auto }, ...LANGUAGES] },
			voiceWriteIn: { title: VOICE_TEXT.writeIn, note: VOICE_TEXT.writeInNote, entries: [{ value: '${SAME}', label: VOICE_TEXT.same }, ...LANGUAGES] },
		};
		const input = document.getElementById(${JSON.stringify(inputId)});
		const opener = document.getElementById('voiceLanguages');
		const box = document.getElementById('voiceMenu');
		const make = (tag, className, text) => {
			const node = document.createElement(tag);
			if (className) { node.className = className; }
			if (text !== undefined) { node.textContent = text; }
			return node;
		};
		const item = (role, parts, onClick) => {
			const button = make('button', 'voice-item');
			button.setAttribute('role', role);
			button.append(...parts);
			button.addEventListener('click', event => { event.stopPropagation(); onClick(); });
			box.appendChild(button);
			return button;
		};
		const labelOf = command => lists[command].entries.find(entry => entry.value === chosen[command])?.label ?? '';
		// The menu moves sideways to stay within the window, a narrow pane's too
		const fit = () => {
			box.style.right = '';
			const rect = box.getBoundingClientRect();
			const shift = Math.max(4 - rect.left, Math.min(0, window.innerWidth - 4 - rect.right));
			if (shift) { box.style.right = (parseFloat(getComputedStyle(box).right) - shift) + 'px'; }
		};
		const close = () => {
			box.hidden = true;
			opener.setAttribute('aria-expanded', 'false');
		};
		const showMain = focus => {
			box.textContent = '';
			for (const command of ['voiceLanguage', 'voiceWriteIn']) {
				const button = item('menuitem', [make('span', 'voice-label', lists[command].title), make('span', 'voice-value', labelOf(command)), make('span', 'voice-arrow', '\\u203a')], () => showList(command));
				button.setAttribute('aria-haspopup', 'menu');
				if (command === focus) { button.focus(); }
			}
			if (!focus) { box.querySelector('button')?.focus(); }
			fit();
		};
		const showList = command => {
			box.textContent = '';
			item('menuitem', [make('span', 'voice-arrow', '\\u2039'), make('span', 'voice-label', VOICE_TEXT.back)], () => showMain(command));
			box.appendChild(make('div', 'voice-heading', lists[command].title));
			if (lists[command].note) { box.appendChild(make('div', 'voice-note', lists[command].note)); }
			for (const entry of lists[command].entries) {
				const checked = entry.value === chosen[command];
				const button = item('menuitemradio', [make('span', 'voice-check', checked ? '\\u2713' : ''), make('span', 'voice-label', entry.label)], () => {
					chosen[command] = entry.value;
					vscode.postMessage({ command, value: entry.value });
					showMain(command);
				});
				button.setAttribute('aria-checked', String(checked));
				if (checked) { button.focus(); }
			}
			fit();
		};
		opener.addEventListener('click', () => {
			if (!box.hidden) { close(); return; }
			box.hidden = false;
			box.classList.remove('up');
			showMain();
			box.classList.toggle('up', window.innerHeight - opener.getBoundingClientRect().bottom < box.offsetHeight + 8);
			opener.setAttribute('aria-expanded', 'true');
		});
		document.addEventListener('pointerdown', event => {
			if (!box.hidden && !event.target.closest('.voice-anchor')) { close(); }
		}, true);
		document.addEventListener('keydown', event => {
			if (event.key === 'Escape' && !box.hidden) { close(); opener.focus(); }
		});
		window.addEventListener('message', event => {
			if (event.data?.command in chosen) { chosen[event.data.command] = event.data.value; }
		});
		document.getElementById('voice').addEventListener('click', () => input.focus());
		document.getElementById('voiceMode').addEventListener('click', () => input.focus());
	})();`;
}
