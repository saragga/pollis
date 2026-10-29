/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The voice tools at the end of the first line of a chat's input box, in Ask Pollis, in the Collaboration chat and in
// the Ask Pollis of each panel (webviewScaffold.ts): the
// microphone, which will dictate; its menu, with the microphone used and the language of dictation; and Voice Mode,
// which will ask aloud and read the answer aloud, both written down too. Voice is not implemented yet: only the
// language is kept, for Pollis' own speech to use when it comes (accessibility.voice.speechLanguage of VS Code is
// registered only once there is a speech provider).

import { localize } from '../../../../nls.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { SPEECH_LANGUAGES } from '../../speech/common/speechService.js';

const VOICE_LANGUAGE_KEY = 'pollis.voice.language';

/** The microphone of a chat's input box, at the end of its first line: voice is not implemented yet. */
export const composerMicSvg = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1a2 2 0 0 0-2 2v5a2 2 0 1 0 4 0V3a2 2 0 0 0-2-2zM5 7H4v1a4 4 0 0 0 3.5 3.969V14H5v1h6v-1H8.5v-2.031A4 4 0 0 0 12 8V7h-1v1a3 3 0 0 1-6 0V7z"/></svg>`;
const AUTO = 'auto';

/** The language of dictation chosen in a chat's microphone menu, `auto` for the display language. */
export function getVoiceLanguage(storageService: IStorageService): string {
	const value = storageService.get(VOICE_LANGUAGE_KEY, StorageScope.APPLICATION, AUTO);
	return value === AUTO || Object.prototype.hasOwnProperty.call(SPEECH_LANGUAGES, value) ? value : AUTO;
}

/** Keeps the language chosen in a chat's microphone menu, for every chat. */
export function setVoiceLanguage(storageService: IStorageService, value: string): void {
	storageService.store(VOICE_LANGUAGE_KEY, value, StorageScope.APPLICATION, StorageTarget.USER);
}

/** The titles of the microphone and of Voice Mode, which say what they will do in that chat. */
export interface IComposerVoiceTitles {
	readonly dictate: string;
	readonly voiceMode: string;
}

const CHEVRON_DOWN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';
const CHEVRON_RIGHT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>';
const CHEVRON_LEFT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4 6 8l4 4"/></svg>';
const WAVEFORM = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 7v2M5 5v6M8 2.5v11M11 5v6M14 7v2"/></svg>';

/** The microphone, its menu and Voice Mode, for the first line of a chat's input box, with the language kept now. */
export function composerVoiceHtml(titles: IComposerVoiceTitles, language: string): string {
	const text = {
		more: localize('composerVoice.more', "Microphone and Language"),
		defaultMicrophone: localize('composerVoice.defaultMicrophone', "Default Microphone"),
		settings: localize('composerVoice.settings', "Dictation Settings"),
		language: localize('composerVoice.language', "Language"),
		auto: localize('composerVoice.auto', "Auto"),
		back: localize('composerVoice.back', "Back"),
	};
	const languages = [
		{ value: AUTO, label: localize('composerVoice.autoLanguage', "Auto (Use Display Language)"), short: text.auto },
		...Object.entries(SPEECH_LANGUAGES).map(([value, { name }]) => ({ value, label: name, short: name })).sort((a, b) => a.label.localeCompare(b.label)),
	];
	const attribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
	return `<span class="voice-tools" data-language="${attribute(language)}" data-languages="${attribute(JSON.stringify(languages))}" data-text="${attribute(JSON.stringify(text))}">
				<button class="voice-button" id="voice" title="${titles.dictate}" aria-label="${titles.dictate}">${composerMicSvg}</button>
				<span class="voice-anchor">
					<button class="voice-button voice-more" id="voiceMore" title="${text.more}" aria-label="${text.more}" aria-haspopup="menu" aria-expanded="false">${CHEVRON_DOWN}</button>
					<div class="voice-menu" id="voiceMenu" role="menu" hidden></div>
				</span>
				<button class="voice-button" id="voiceMode" title="${titles.voiceMode}" aria-label="${titles.voiceMode}">${WAVEFORM}</button>
			</span>`;
}

/** The CSS of the voice tools, which overrides a page's own rules for its buttons. */
export const composerVoiceCss = `.voice-tools { display: inline-flex; align-items: center; flex: none; }
		.voice-tools button.voice-button { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; padding: 0; border: none; box-shadow: none; border-radius: 50%; opacity: 1; color: var(--vscode-descriptionForeground); background: transparent; cursor: pointer; }
		.voice-tools button.voice-button:hover, .voice-tools button.voice-button[aria-expanded="true"] { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		.voice-tools button.voice-button svg { width: 18px; height: 18px; }
		.voice-tools button.voice-more { width: 16px; border-radius: 6px; margin-left: -4px; }
		.voice-tools button.voice-more svg { width: 10px; height: 10px; }
		.voice-anchor { position: relative; display: inline-flex; }
		.voice-menu { position: absolute; top: 32px; right: -34px; z-index: 3; min-width: min(280px, calc(100vw - 8px)); max-width: calc(100vw - 8px); max-height: 60vh; overflow-y: auto; padding: 4px; font-size: 12px; color: var(--vscode-menu-foreground); background: var(--vscode-menu-background); border: 1px solid var(--vscode-menu-border, var(--vscode-widget-border)); border-radius: 8px; box-shadow: 0 4px 16px var(--vscode-widget-shadow); }
		.voice-menu.up { top: auto; bottom: 32px; }
		.voice-menu .voice-level { display: flex; align-items: center; gap: 8px; padding: 6px 8px; color: var(--vscode-descriptionForeground); }
		.voice-menu .voice-level svg { width: 14px; height: 14px; flex: none; }
		.voice-menu .voice-level span { flex: 1; height: 4px; border-radius: 2px; background: var(--vscode-widget-border); position: relative; }
		.voice-menu .voice-level span::before { content: ''; position: absolute; left: 0; top: 0; width: 8px; height: 4px; border-radius: 2px; background: var(--vscode-focusBorder); }
		.voice-menu .voice-heading { font-size: 11px; color: var(--vscode-descriptionForeground); padding: 6px 8px 2px 8px; }
		.voice-menu button.voice-item { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; font: inherit; font-size: 12px; opacity: 1; box-shadow: none; color: inherit; background: none; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
		.voice-menu button.voice-item:hover, .voice-menu button.voice-item:focus { color: var(--vscode-menu-selectionForeground); background: var(--vscode-menu-selectionBackground); outline: none; }
		.voice-menu .voice-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.voice-menu .voice-detail { opacity: 0.7; white-space: nowrap; }
		.voice-menu .voice-check { width: 12px; flex: none; }
		.voice-menu button.voice-item svg { width: 10px; height: 10px; flex: none; }
		.voice-menu hr { border: none; border-top: 1px solid var(--vscode-menu-separatorBackground, var(--vscode-widget-border)); margin: 4px 0; }`;

/**
 * The script of the voice tools: the menu, below the chevron or above it when there is no room, shows the microphone
 * and Dictation Settings, and Language shows the languages; a language chosen is posted as `voiceLanguage`, and one
 * posted to the page as `voiceLanguage` is the one kept, for a page whose HTML is made without it. The microphone and
 * Voice Mode only give the focus back to the input box `inputId`, until voice comes.
 */
export function composerVoiceScript(inputId: string): string {
	return `(() => {
		const tools = document.querySelector('.voice-tools');
		const LANGUAGES = JSON.parse(tools.dataset.languages);
		const VOICE_TEXT = JSON.parse(tools.dataset.text);
		let language = tools.dataset.language;
		const input = document.getElementById(${JSON.stringify(inputId)});
		const more = document.getElementById('voiceMore');
		const box = document.getElementById('voiceMenu');
		const MIC = ${JSON.stringify(composerMicSvg)};
		const RIGHT = ${JSON.stringify(CHEVRON_RIGHT)};
		const LEFT = ${JSON.stringify(CHEVRON_LEFT)};
		const make = (tag, className, text) => {
			const node = document.createElement(tag);
			if (className) { node.className = className; }
			if (text !== undefined) { node.textContent = text; }
			return node;
		};
		const item = (label, options, onClick) => {
			const button = make('button', 'voice-item');
			button.setAttribute('role', 'menuitem');
			if (options.icon === 'left') { button.insertAdjacentHTML('beforeend', LEFT); }
			if (options.check !== undefined) { button.appendChild(make('span', 'voice-check', options.check ? '\\u2713' : '')); }
			button.appendChild(make('span', 'voice-label', label));
			if (options.detail) { button.appendChild(make('span', 'voice-detail', options.detail)); }
			if (options.icon === 'right') { button.insertAdjacentHTML('beforeend', RIGHT); }
			button.addEventListener('click', onClick);
			box.appendChild(button);
			return button;
		};
		// The menu moves sideways to stay within the window, a narrow pane's too
		const fit = () => {
			box.style.right = '';
			const rect = box.getBoundingClientRect();
			const shift = Math.max(4 - rect.left, Math.min(0, window.innerWidth - 4 - rect.right));
			if (shift) { box.style.right = (parseFloat(getComputedStyle(box).right) - shift) + 'px'; }
		};
		const close = () => {
			box.hidden = true;
			more.setAttribute('aria-expanded', 'false');
		};
		const showMain = () => {
			box.textContent = '';
			const level = make('div', 'voice-level');
			level.setAttribute('aria-hidden', 'true');
			level.insertAdjacentHTML('beforeend', MIC);
			level.appendChild(make('span'));
			box.appendChild(level);
			item(VOICE_TEXT.defaultMicrophone, { check: true }, close).focus();
			box.appendChild(make('hr'));
			box.appendChild(make('div', 'voice-heading', VOICE_TEXT.settings));
			item(VOICE_TEXT.language, { detail: LANGUAGES.find(entry => entry.value === language)?.short, icon: 'right' }, showLanguages);
			fit();
		};
		const showLanguages = () => {
			box.textContent = '';
			item(VOICE_TEXT.back, { icon: 'left' }, showMain);
			box.appendChild(make('hr'));
			for (const entry of LANGUAGES) {
				const button = item(entry.label, { check: entry.value === language }, () => {
					language = entry.value;
					vscode.postMessage({ command: 'voiceLanguage', value: language });
					showMain();
				});
				if (entry.value === language) { button.focus(); }
			}
			fit();
		};
		more.addEventListener('click', () => {
			if (!box.hidden) { close(); return; }
			box.hidden = false;
			showMain();
			box.classList.toggle('up', window.innerHeight - more.getBoundingClientRect().bottom < box.offsetHeight + 8);
			more.setAttribute('aria-expanded', 'true');
		});
		document.addEventListener('pointerdown', event => {
			if (!box.hidden && !event.target.closest('.voice-anchor')) { close(); }
		}, true);
		document.addEventListener('keydown', event => {
			if (event.key === 'Escape' && !box.hidden) { close(); more.focus(); }
		});
		window.addEventListener('message', event => {
			if (event.data?.command === 'voiceLanguage') { language = event.data.value; }
		});
		document.getElementById('voice').addEventListener('click', () => input.focus());
		document.getElementById('voiceMode').addEventListener('click', () => input.focus());
	})();`;
}
