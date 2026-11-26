/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* eslint-disable no-restricted-globals */

/**
 * Preload script for pages loaded in Integrated Browser
 *
 * It runs in an isolated context that Electron calls an "isolated world".
 * Specifically the isolated world with worldId 999, which shows in DevTools as "Electron Isolated Context".
 * Despite being isolated, it still runs on the same page as the JS from the actual loaded website
 * which runs on the so-called "main world" (worldId 0. In DevTools as "top").
 *
 * Learn more: see Electron docs for Security, contextBridge, and Context Isolation.
 */
(function () {

	const { contextBridge, ipcRenderer } = require('electron');

	// #######################################################################
	// ###                                                                 ###
	// ###       !!! DO NOT USE GET/SET PROPERTIES ANYWHERE HERE !!!       ###
	// ###       !!!  UNLESS THE ACCESS IS WITHOUT SIDE EFFECTS  !!!       ###
	// ###       (https://github.com/electron/electron/issues/25516)       ###
	// ###                                                                 ###
	// #######################################################################

	// Ctrl/Cmd keybindings that correspond to native editing shortcuts and should be handled by the browser / OS and not forwarded to the workbench.
	const nativeCtrlCmdKeybindings = {
		mac: {
			always: new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'backspace', 'delete']),
			noShift: new Set(['a', 'c', 'v', 'x', 'z']),
			withShift: new Set(['v', 'z']),
		},
		nonMac: {
			always: new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'home', 'end', 'backspace', 'delete']),
			noShift: new Set(['a', 'c', 'v', 'x', 'z', 'y']),
			withShift: new Set(['v', 'z']),
		}
	};

	// Listen for keydown events that the page did not handle and forward them for shortcut handling.
	window.addEventListener('keydown', (event) => {
		// Require that the event is trusted -- i.e. user-initiated.
		// eslint-disable-next-line no-restricted-syntax
		if (!(event instanceof KeyboardEvent) || !event.isTrusted) {
			return;
		}

		// If the event was already handled by the page, do not forward it.
		if (event.defaultPrevented) {
			return;
		}

		const isNonEditingKey =
			event.key === 'Escape' ||
			/^F\d+$/.test(event.key) ||
			event.key.startsWith('Audio') || event.key.startsWith('Media') || event.key.startsWith('Browser');

		// Only forward if there's a command modifier or it's a non-editing key
		// (most plain key events should just be handled natively by the browser and not forwarded)
		if (!(event.ctrlKey || event.altKey || event.metaKey) && !isNonEditingKey) {
			return;
		}

		// Never handle plain modifier key presses as keybindings
		if (event.key === 'Control' || event.key === 'Shift' || event.key === 'Alt' || event.key === 'Meta') {
			return;
		}

		const isMac = navigator.platform.indexOf('Mac') >= 0;

		// Alt+Key special character handling (Alt + Numpad keys on Windows/Linux, Alt + any key on Mac)
		if (event.altKey && !event.ctrlKey && !event.metaKey) {
			if (isMac || /^Numpad\d+$/.test(event.code)) {
				return;
			}
		}

		// Allow native shortcuts to be handled by the browser
		const ctrlCmd = isMac ? event.metaKey : event.ctrlKey;
		if (ctrlCmd && !event.altKey) {
			const key = event.key.toLowerCase();
			const keySetsToCheck = [
				nativeCtrlCmdKeybindings[isMac ? 'mac' : 'nonMac'].always,
				nativeCtrlCmdKeybindings[isMac ? 'mac' : 'nonMac'][event.shiftKey ? 'withShift' : 'noShift'],
			];
			if (keySetsToCheck.some(set => set.has(key))) {
				return;
			}

			// Emoji picker on Mac
			if (isMac && event.ctrlKey && !event.shiftKey && key === ' ') {
				return;
			}
		}

		// Everything else should be forwarded to the workbench for potential shortcut handling.
		event.preventDefault();
		event.stopPropagation();
		ipcRenderer.send('vscode:browserView:keydown', {
			key: event.key,
			keyCode: event.keyCode,
			code: event.code,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			repeat: event.repeat
		});
	});

	// POLLIS: where the pages of the tab begin in the page loaded, such as the pages of OCR Files and Snippets in a Gutenberg
	// ebook, and which is in view as it is scrolled
	interface IPageStart {
		readonly range: Range;
	}
	let pageStarts: (IPageStart | undefined)[] = [];
	let pageInView: number | undefined;
	let quietUntil = 0;
	let scrollPending = false;
	/** The style of the highlight of a page's first words, once in the page. */
	let highlightStyle: HTMLStyleElement | undefined;

	/** The text of the page, its text nodes and where each begins in it. */
	function pageText(): { text: string; nodes: Text[]; offsets: number[] } {
		const nodes: Text[] = [];
		const offsets: number[] = [];
		let text = '';
		const walker = window.document.createTreeWalker(window.document.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const parent = node.parentElement?.tagName;
			if (parent === 'SCRIPT' || parent === 'STYLE') {
				continue;
			}
			nodes.push(node as Text);
			offsets.push(text.length);
			text += (node as Text).data;
		}
		return { text, nodes, offsets };
	}

	/** The text node, and the offset in it, of an offset in the text of the page. */
	function nodeAt(nodes: Text[], offsets: number[], offset: number): [Text, number] {
		let low = 0;
		let high = offsets.length - 1;
		while (low < high) {
			const middle = (low + high + 1) >> 1;
			if (offsets[middle] <= offset) {
				low = middle;
			} else {
				high = middle - 1;
			}
		}
		return [nodes[low], offset - offsets[low]];
	}

	/** The page whose start is the last above the middle of the view, or the first page when none is. */
	function computePageInView(): number | undefined {
		const middle = window.innerHeight / 2;
		let found: number | undefined;
		for (let index = 0; index < pageStarts.length; index++) {
			const start = pageStarts[index];
			if (!start) {
				continue;
			}
			found ??= index;
			if (start.range.getBoundingClientRect().top <= middle + 1) {
				found = index;
			} else {
				break;
			}
		}
		return found;
	}

	function onScroll(): void {
		if (scrollPending) {
			return;
		}
		scrollPending = true;
		requestAnimationFrame(() => {
			scrollPending = false;
			// The scroll of showPageStart puts its page in view, whatever page is above the middle
			if (performance.now() < quietUntil) {
				return;
			}
			const index = computePageInView();
			if (index !== undefined && index !== pageInView) {
				pageInView = index;
				ipcRenderer.send('vscode:browserView:pageInView', index);
			}
		});
	}

	/**
	 * Finds where each page given begins, the earliest of its runs of words found after the start of the page before, and
	 * from then on tells which page is in view as the page is scrolled.
	 */
	function watchPageStarts(starts: readonly (readonly string[])[]): void {
		window.removeEventListener('scroll', onScroll);
		pageStarts = [];
		pageInView = undefined;
		if (!starts.length || !window.document.body) {
			return;
		}
		try {
			const { text, nodes, offsets } = pageText();
			let cursor = 0;
			pageStarts = starts.map(runs => {
				let best: { index: number; length: number } | undefined;
				for (const run of runs) {
					const words = run.split(/\s+/).filter(Boolean).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
					if (!words.length) {
						continue;
					}
					const pattern = new RegExp(`(?<![\\p{L}])${words.join('\\s+')}(?![\\p{L}])`, 'giu');
					pattern.lastIndex = cursor;
					const match = pattern.exec(text);
					if (match && (!best || match.index < best.index)) {
						best = { index: match.index, length: match[0].length };
					}
				}
				if (!best) {
					return undefined;
				}
				cursor = best.index;
				const range = window.document.createRange();
				range.setStart(...nodeAt(nodes, offsets, best.index));
				range.setEnd(...nodeAt(nodes, offsets, best.index + best.length));
				return { range };
			});
			window.addEventListener('scroll', onScroll, { passive: true });
		} catch {
			pageStarts = [];
		}
	}

	/**
	 * Scrolls to the start of a page given to watchPageStarts, in the middle of the view, and highlights its first words;
	 * false when the start of the page is not known.
	 */
	function showPageStart(index: number): boolean {
		const start = pageStarts[index];
		if (!start) {
			return false;
		}
		try {
			const top = start.range.getBoundingClientRect().top;
			window.scrollBy({ top: top - window.innerHeight / 2, behavior: 'instant' });
			quietUntil = performance.now() + 300;
			pageInView = index;
			if (typeof Highlight === 'function' && CSS.highlights) {
				CSS.highlights.set('pollis-page-start', new Highlight(start.range));
				if (!highlightStyle?.isConnected) {
					highlightStyle = window.document.createElement('style');
					highlightStyle.textContent = '::highlight(pollis-page-start) { background-color: rgba(255, 213, 79, 0.6); }';
					window.document.head.appendChild(highlightStyle);
				}
			}
			return true;
		} catch {
			return false;
		}
	}

	// The starts of the pages are the tab's, kept by the main process: each page loaded asks for them once its text is
	// there, without waiting for its pictures, and the main process sends them again when the tab gives new ones
	ipcRenderer.on('vscode:browserView:pageStarts', (_event: unknown, starts: readonly (readonly string[])[]) => {
		if (window.document.readyState !== 'loading') {
			watchPageStarts(starts);
		}
	});
	ipcRenderer.on('vscode:browserView:showPageStart', (_event: unknown, request: number, index: number) => {
		ipcRenderer.send('vscode:browserView:pageStartShown', request, showPageStart(index));
	});
	window.document.addEventListener('DOMContentLoaded', async () => {
		try {
			const starts = await ipcRenderer.invoke('vscode:browserView:pageStarts');
			if (Array.isArray(starts)) {
				watchPageStarts(starts);
			}
		} catch {
			// No starts for this page
		}
	});

	const globals = {
		/**
		 * Get the currently selected text in the page.
		 */
		getSelectedText(): string {
			try {
				// Even if the page has overridden window.getSelection, our call here will still reach the original
				// implementation. That's because Electron proxies functions, such as getSelectedText here, that are
				// exposed to a different context via exposeInIsolatedWorld or exposeInMainWorld.
				return window.getSelection()?.toString() ?? '';
			} catch {
				return '';
			}
		}
	};

	try {
		// Use `contextBridge` APIs to expose globals to the same isolated world where this preload script runs (worldId 999).
		// The globals object will be recursively frozen (and for functions also proxied) by Electron to prevent
		// modification within the given context.
		contextBridge.exposeInIsolatedWorld(999, 'browserViewAPI', globals);
	} catch (error) {
		console.error(error);
	}
}());
