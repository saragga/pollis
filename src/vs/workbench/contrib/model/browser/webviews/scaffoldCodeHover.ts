/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The page's side of hovering a name in the code boxes of the scaffold, in its three styles: handlers/codeHover.ts
// answers it.

/** The styles of `codeHoverJs`: the colours of the editor's hover, in the theme of the user. */
export const codeHoverCss = `.code-hover { position: fixed; z-index: 10001; box-sizing: border-box; max-width: min(640px, calc(100vw - 16px)); max-height: min(360px, 45vh); overflow: auto; padding: 4px 10px; border: 1px solid var(--vscode-editorHoverWidget-border, var(--vscode-widget-border)); border-radius: 3px; background: var(--vscode-editorHoverWidget-background); color: var(--vscode-editorHoverWidget-foreground); font-family: var(--vscode-font-family); font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; box-shadow: 0 2px 8px var(--vscode-widget-shadow); }
		.code-hover[hidden] { display: none; }
		.code-hover p, .code-hover ul, .code-hover ol, .code-hover blockquote, .code-hover table { margin: 6px 0; }
		.code-hover h1, .code-hover h2, .code-hover h3, .code-hover h4 { margin: 8px 0 4px; padding: 0; border: 0; font-size: 12px; font-weight: 600; color: inherit; }
		.code-hover pre { margin: 6px 0; padding: 0; background: none; border: 0; white-space: pre-wrap; tab-size: 4; }
		.code-hover code { padding: 0; background: none; font-family: var(--vscode-editor-font-family); font-size: 12px; }
		.code-hover hr { margin: 6px 0; border: 0; border-top: 1px solid var(--vscode-editorHoverWidget-border, var(--vscode-widget-border)); }
		.code-hover blockquote { padding: 0 0 0 8px; border-left: 2px solid var(--vscode-textBlockQuote-border); background: none; }
		.code-hover a { color: inherit; text-decoration: none; pointer-events: none; }`;

/**
 * The script of the hover, which needs `vscode` and the boxes as `numberCodeLines` numbers them. When the pointer
 * rests on a character of Julia code, it sends the code of the box, the place in it and the code of the boxes before
 * it, and shows the answer while the pointer is on that name or on the hover. A box with `data-language` other than
 * julia, such as that of a query, has no hover.
 */
export const codeHoverJs = `(function() {
	var BOXES = '#code-preview, #panel-code, .step-code .code-preview';
	var pointer = null, restTimer = null, leaveTimer = null, asked = null, word = null, lastId = 0;
	var hover = document.createElement('div');
	hover.className = 'code-hover';
	hover.setAttribute('role', 'tooltip');
	hover.hidden = true;
	document.body.appendChild(hover);

	function codeOf(box) {
		return Array.from(box.querySelectorAll('.code-text'), function(el) { return el.textContent; }).join('\\n');
	}
	function rangeOf(el, start, end) {
		var range = document.createRange(), walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), at = 0, begun = false;
		for (var node; (node = walker.nextNode()); ) {
			var next = at + node.data.length;
			if (!begun && start < next) { range.setStart(node, start - at); begun = true; }
			if (begun && end <= next) { range.setEnd(node, end - at); return range; }
			at = next;
		}
		return null;
	}
	function within(rects, x, y, margin) {
		return Array.from(rects).some(function(r) { return x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin; });
	}
	// The character under the pointer: the caret of a point is between two characters, or at the line's end beyond it
	function characterAt(x, y) {
		var target = document.elementFromPoint(x, y);
		var line = target && target.closest('.code-text');
		var box = line && line.closest(BOXES);
		if (!box || (box.dataset.language && box.dataset.language !== 'julia')) { return null; }
		var caret = document.caretRangeFromPoint(x, y);
		if (!caret || !line.contains(caret.startContainer)) { return null; }
		var before = document.createRange();
		before.selectNodeContents(line);
		before.setEnd(caret.startContainer, caret.startOffset);
		var column = before.toString().length;
		var found = [column, column - 1].filter(function(c) {
			var range = c >= 0 && c < line.textContent.length ? rangeOf(line, c, c + 1) : null;
			return range && within(range.getClientRects(), x, y, 1);
		})[0];
		if (found === undefined || !line.textContent.charAt(found).trim()) { return null; }
		var start = 0, lines = box.querySelectorAll('.code-text');
		for (var i = 0; lines[i] !== line; i++) { start += lines[i].textContent.length + 1; }
		return { box: box, line: line, lineStart: start, offset: start + found };
	}
	function hide() {
		clearTimeout(restTimer);
		clearTimeout(leaveTimer);
		restTimer = leaveTimer = asked = word = null;
		hover.hidden = true;
	}
	function hideSoon() {
		if (leaveTimer || hover.hidden) { return; }
		leaveTimer = setTimeout(function() { hover.hidden = true; word = null; leaveTimer = null; }, 250);
	}
	function ask() {
		restTimer = null;
		var at = pointer && characterAt(pointer.x, pointer.y);
		if (!at) { return; }
		var boxes = Array.from(document.querySelectorAll(BOXES));
		var earlier = boxes.slice(0, boxes.indexOf(at.box)).filter(function(box) {
			return !box.dataset.language || box.dataset.language === 'julia';
		}).map(codeOf).join('\\n');
		asked = { id: ++lastId, box: at.box, code: codeOf(at.box) };
		vscode.postMessage({ command: 'codeHover', id: asked.id, code: asked.code, offset: at.offset, earlier: earlier });
	}
	function show(msg) {
		var request = asked;
		asked = null;
		if (!msg.html || !pointer) { return; }
		// The pointer may have left the name, and the box may show other code, since it was asked
		var at = characterAt(pointer.x, pointer.y);
		if (!at || at.box !== request.box || at.offset < msg.start || at.offset >= msg.end || codeOf(at.box) !== request.code) { return; }
		word = rangeOf(at.line, msg.start - at.lineStart, msg.end - at.lineStart);
		if (!word) { return; }
		clearTimeout(leaveTimer);
		leaveTimer = null;
		hover.innerHTML = msg.html;
		hover.hidden = false;
		hover.scrollTop = 0;
		hover.style.left = hover.style.top = '0';
		var name = word.getBoundingClientRect(), size = hover.getBoundingClientRect();
		var width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;
		var top = name.bottom + 2;
		if (top + size.height > height - 4 && name.top - size.height - 2 >= 4) { top = name.top - size.height - 2; }
		hover.style.top = top + 'px';
		hover.style.left = Math.max(8, Math.min(name.left, width - size.width - 8)) + 'px';
	}

	document.addEventListener('mousemove', function(event) {
		pointer = { x: event.clientX, y: event.clientY };
		clearTimeout(restTimer);
		restTimer = null;
		if (hover.contains(event.target)) {
			clearTimeout(leaveTimer);
			leaveTimer = null;
			return;
		}
		if (!hover.hidden) {
			if (word && within(word.getClientRects(), pointer.x, pointer.y, 1)) {
				clearTimeout(leaveTimer);
				leaveTimer = null;
				return;
			}
			hideSoon();
		}
		if (!event.buttons && event.target.closest && event.target.closest('.code-text')) { restTimer = setTimeout(ask, 300); }
	});
	document.addEventListener('mouseout', function(event) {
		if (!event.relatedTarget) { pointer = null; hide(); }
	});
	document.addEventListener('mousedown', function(event) {
		if (!hover.contains(event.target)) { hide(); }
	});
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape') { hide(); }
	});
	document.addEventListener('scroll', function(event) {
		if (!hover.contains(event.target)) { hide(); }
	}, true);
	window.addEventListener('message', function(event) {
		var msg = event.data;
		if (msg && msg.command === 'codeHoverDoc' && asked && msg.id === asked.id) { show(msg); }
	});
})();`;
