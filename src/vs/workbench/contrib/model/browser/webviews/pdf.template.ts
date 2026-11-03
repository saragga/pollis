/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../nls.js';
import { PDF_METADATA } from './pdf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';
import { spinnerCss, spinnerSvg } from './webviewScaffold.js';

/** The words of the Select Area pane. */
function selectAreaText(): Record<string, string> {
	return {
		previous: localize('pdfArea.previous', "Previous Page"),
		next: localize('pdfArea.next', "Next Page"),
		pageOf: localize('pdfArea.pageOf', "Page {0} of {1}"),
		drawing: localize('pdfArea.drawing', "Drawing the page..."),
		cropping: localize('pdfArea.cropping', "Cutting the area..."),
		cropped: localize('pdfArea.cropped', "Cropped Area"),
		numbers: localize('pdfArea.numbers', "Page {0}: Left {1}, Top {2}, Width {3}, Height {4} pt"),
		send: localize('pdfArea.send', "Send to Ask Pollis"),
		text: localize('pdfArea.sendText', "Text"),
		textTitle: localize('pdfArea.sendTextTitle', "The text of the area, in its physical layout, as a file in the question beside the title"),
		table: localize('pdfArea.sendTable', "Table"),
		tableTitle: localize('pdfArea.sendTableTitle', "The cells of the area, found as in the Tables tab with its Column Gap and Row Tolerance, as a CSV file in the question beside the title"),
		image: localize('pdfArea.sendImage', "Image"),
		imageTitle: localize('pdfArea.sendImageTitle', "A picture of the area in the question beside the title, for a cloud model"),
	};
}

/** The Select Area pane: drag on the page for an area, which fills the area inputs, flashes green and is shown cut out. */
function selectAreaScript(): string {
	return `
		var PDFSEL_TEXT = ${JSON.stringify(selectAreaText())};
		var PDFSEL_SPINNER = ${JSON.stringify(spinnerSvg)};
		var PDFSEL_AREA_TABS = ['text', 'tables', 'render', 'convert'];
		// The page shown, its size in points, the area on it in points, and the request each answer must match
		var pdfSel = { built: false, file: null, page: 0, pages: 0, width: 0, height: 0, area: null, drag: null, pageSeq: 0, cropSeq: 0, retry: null };
		function pdfSelEl(id) { return document.getElementById('pdfsel-' + id); }
		function pdfSelFormat(template, values) { return template.replace(/[{](\\d)[}]/g, function(_, i) { return String(values[+i]); }); }
		// The input that holds the page: Page on Tables, First Page on the other tabs
		function pdfSelStartPage() {
			var page = parseInt(inputRaw(currentModel === 'tables' ? 'page' : 'first'), 10);
			return page > 0 ? page : 1;
		}
		function pdfSelOpen() { var section = document.getElementById('illus-section'); return !!section && !section.classList.contains('collapsed'); }
		function pdfSelStatus(text, busy) {
			var status = pdfSelEl('status');
			status.innerHTML = '';
			if (busy) { status.insertAdjacentHTML('beforeend', PDFSEL_SPINNER); }
			status.appendChild(document.createTextNode(text || ''));
			status.hidden = !text;
		}
		function pdfSelBuild(body) {
			body.innerHTML = '<div class="pdfsel">'
				+ '<div class="pdfsel-bar">'
				+ '<button class="pdfsel-nav" id="pdfsel-prev" title="' + PDFSEL_TEXT.previous + '" aria-label="' + PDFSEL_TEXT.previous + '">&#8249;</button>'
				+ '<span id="pdfsel-where"></span>'
				+ '<button class="pdfsel-nav" id="pdfsel-next" title="' + PDFSEL_TEXT.next + '" aria-label="' + PDFSEL_TEXT.next + '">&#8250;</button>'
				+ '</div>'
				+ '<div class="pdfsel-row">'
				+ '<div class="pdfsel-stage" id="pdfsel-stage"><img id="pdfsel-img" alt="" draggable="false" hidden><div class="pdfsel-box" id="pdfsel-box" hidden></div><div class="pdfsel-status" id="pdfsel-status" hidden></div></div>'
				+ '<div class="pdfsel-side" id="pdfsel-side" hidden>'
				+ '<div class="pdfsel-side-title">' + PDFSEL_TEXT.cropped + '</div>'
				+ '<div class="pdfsel-preview" id="pdfsel-preview"></div>'
				+ '<div class="pdfsel-numbers" id="pdfsel-numbers"></div>'
				+ '<div class="pdfsel-side-title">' + PDFSEL_TEXT.send + '</div>'
				+ '<div class="pdfsel-send">'
				+ '<button class="code-action-btn" data-kind="text" title="' + PDFSEL_TEXT.textTitle + '">' + PDFSEL_TEXT.text + '</button>'
				+ '<button class="code-action-btn" data-kind="table" title="' + PDFSEL_TEXT.tableTitle + '">' + PDFSEL_TEXT.table + '</button>'
				+ '<button class="code-action-btn" data-kind="image" title="' + PDFSEL_TEXT.imageTitle + '">' + PDFSEL_TEXT.image + '</button>'
				+ '</div></div></div></div>';
			pdfSel.built = true;
			var stage = pdfSelEl('stage');
			var img = pdfSelEl('img');
			pdfSelEl('prev').addEventListener('click', function() { if (pdfSel.page > 1) { pdfSelLoad(pdfSel.page - 1); } });
			pdfSelEl('next').addEventListener('click', function() { if (pdfSel.page < pdfSel.pages) { pdfSelLoad(pdfSel.page + 1); } });
			img.addEventListener('load', pdfSelDrawBox);
			new ResizeObserver(pdfSelDrawBox).observe(img);
			// Drag for an area: its corners are where the pointer went down and where it came up
			function at(e) {
				var r = img.getBoundingClientRect();
				return { x: Math.min(Math.max(e.clientX - r.left, 0), r.width), y: Math.min(Math.max(e.clientY - r.top, 0), r.height) };
			}
			stage.addEventListener('pointerdown', function(e) {
				if (e.button !== 0 || img.hidden || !pdfSel.width) { return; }
				pdfSel.drag = { start: at(e), end: at(e) };
				stage.setPointerCapture(e.pointerId);
				e.preventDefault();
			});
			stage.addEventListener('pointermove', function(e) {
				if (!pdfSel.drag) { return; }
				pdfSel.drag.end = at(e);
				var a = pdfSel.drag.start, b = pdfSel.drag.end;
				pdfSelPlaceBox(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y));
			});
			function finish(e) {
				if (!pdfSel.drag) { return; }
				var a = pdfSel.drag.start, b = pdfSel.drag.end;
				pdfSel.drag = null;
				if (stage.hasPointerCapture(e.pointerId)) { stage.releasePointerCapture(e.pointerId); }
				var w = Math.abs(a.x - b.x), h = Math.abs(a.y - b.y);
				// A click, or a slip of the pointer, keeps the area there was
				if (w < 4 || h < 4) { pdfSelDrawBox(); return; }
				var k = pdfSel.width / img.getBoundingClientRect().width;   // points per pixel on the screen
				pdfSelApply({ x: Math.round(Math.min(a.x, b.x) * k), y: Math.round(Math.min(a.y, b.y) * k), W: Math.round(w * k), H: Math.round(h * k) });
			}
			stage.addEventListener('pointerup', finish);
			stage.addEventListener('pointercancel', function() { pdfSel.drag = null; pdfSelDrawBox(); });
			document.querySelectorAll('.pdfsel-send button').forEach(function(button) {
				button.addEventListener('click', function() {
					if (!pdfSel.area || button.classList.contains('busy')) { return; }
					button.classList.add('busy');
					button.insertAdjacentHTML('afterbegin', PDFSEL_SPINNER);
					vscode.postMessage({ command: 'pdfSend', kind: button.dataset.kind, file: pdfSel.file, page: pdfSel.page, area: pdfSel.area,
						gap: parseFloat(inputRaw('gap')) || 8, rowtol: parseFloat(inputRaw('rowtol')) || 3 });
				});
			});
		}
		function pdfSelPlaceBox(x, y, w, h) {
			var box = pdfSelEl('box');
			box.style.left = x + 'px';
			box.style.top = y + 'px';
			box.style.width = w + 'px';
			box.style.height = h + 'px';
			box.hidden = false;
		}
		// The area in points, drawn on the page as it is shown
		function pdfSelDrawBox() {
			var img = pdfSelEl('img');
			if (!img || pdfSel.drag) { return; }
			if (!pdfSel.area || img.hidden || !pdfSel.width) { pdfSelEl('box').hidden = true; return; }
			var k = img.getBoundingClientRect().width / pdfSel.width;
			pdfSelPlaceBox(pdfSel.area.x * k, pdfSel.area.y * k, pdfSel.area.W * k, pdfSel.area.H * k);
		}
		// The area of the inputs, when the tab works on an area and on the page shown
		function pdfSelAreaFromInputs() {
			if (inputRaw('region') !== 'area' || (PDFSEL_AREA_TABS.indexOf(currentModel) >= 0 && pdfSelStartPage() !== pdfSel.page)) { return null; }
			var area = { x: parseFloat(inputRaw('left')), y: parseFloat(inputRaw('top')), W: parseFloat(inputRaw('width')), H: parseFloat(inputRaw('height')) };
			return [area.x, area.y, area.W, area.H].every(function(v) { return isFinite(v); }) && area.W > 0 && area.H > 0 ? area : null;
		}
		function pdfSelSetInput(id, value) { var field = document.getElementById('in-' + id); if (field) { field.value = String(value); } }
		// The area dragged: into the inputs, with Region set to Area and the page as the page range; a green flash; the area cut out
		function pdfSelApply(area) {
			pdfSel.area = area;
			pdfSelSetInput('left', area.x);
			pdfSelSetInput('top', area.y);
			pdfSelSetInput('width', area.W);
			pdfSelSetInput('height', area.H);
			pdfSelSetInput('region', 'area');
			// The tabs that work on an area take its page; the others keep their page range
			if (currentModel === 'tables') {
				pdfSelSetInput('page', pdfSel.page);
			} else if (PDFSEL_AREA_TABS.indexOf(currentModel) >= 0) {
				pdfSelSetInput('first', pdfSel.page);
				pdfSelSetInput('last', pdfSel.page);
			}
			onInputsChanged();
			pdfSelDrawBox();
			var box = pdfSelEl('box');
			box.classList.remove('flash');
			void box.offsetWidth;   // restarts the flash
			box.classList.add('flash');
			pdfSelCrop();
		}
		function pdfSelCrop() {
			var side = pdfSelEl('side');
			if (!pdfSel.area) { side.hidden = true; return; }
			side.hidden = false;
			pdfSelEl('numbers').textContent = pdfSelFormat(PDFSEL_TEXT.numbers, [pdfSel.page, pdfSel.area.x, pdfSel.area.y, pdfSel.area.W, pdfSel.area.H]);
			var preview = pdfSelEl('preview');
			preview.innerHTML = PDFSEL_SPINNER;
			preview.appendChild(document.createTextNode(PDFSEL_TEXT.cropping));
			vscode.postMessage({ command: 'pdfCrop', seq: ++pdfSel.cropSeq, file: pdfSel.file, page: pdfSel.page, area: pdfSel.area });
		}
		function pdfSelLoad(page) {
			if (pdfSel.retry) { clearTimeout(pdfSel.retry); pdfSel.retry = null; }
			pdfSel.file = inputRaw('path');
			pdfSelStatus(PDFSEL_TEXT.drawing, true);
			vscode.postMessage({ command: 'pdfPage', seq: ++pdfSel.pageSeq, file: pdfSel.file, page: page });
		}
		// The page of the inputs, once the pane is open, and again when File changes
		function pdfSelRefresh() {
			if (!pdfSel.built || !pdfSelOpen()) { return; }
			if (pdfSel.file !== inputRaw('path')) { pdfSel.page = 0; pdfSel.area = null; pdfSelLoad(pdfSelStartPage()); return; }
			if (pdfSel.drag || !pdfSel.width) { return; }
			// Typing in Left, Top, Width, Height or Region moves the area, and the cut follows it
			var area = pdfSelAreaFromInputs();
			if (JSON.stringify(area) !== JSON.stringify(pdfSel.area)) { pdfSel.area = area; pdfSelDrawBox(); pdfSelCrop(); }
		}
		window.addEventListener('message', function(event) {
			var msg = event.data;
			if (!msg || !pdfSel.built) { return; }
			if (msg.command === 'pdfPage' && msg.seq === pdfSel.pageSeq) {
				if (!msg.png) {
					pdfSelStatus(msg.problem, !!msg.retry);
					if (msg.retry) { pdfSel.retry = setTimeout(function() { pdfSelLoad(pdfSelStartPage()); }, 15000); }
					return;
				}
				pdfSelStatus('');
				pdfSel.page = msg.page;
				pdfSel.pages = msg.pages;
				pdfSel.width = msg.width;
				pdfSel.height = msg.height;
				pdfSelEl('where').textContent = pdfSelFormat(PDFSEL_TEXT.pageOf, [msg.page, msg.pages]);
				pdfSelEl('prev').disabled = msg.page <= 1;
				pdfSelEl('next').disabled = msg.page >= msg.pages;
				var img = pdfSelEl('img');
				img.src = msg.png;
				img.hidden = false;
				pdfSel.area = pdfSelAreaFromInputs();
				pdfSelDrawBox();
				pdfSelCrop();
			} else if (msg.command === 'pdfCrop' && msg.seq === pdfSel.cropSeq) {
				var preview = pdfSelEl('preview');
				preview.textContent = '';
				if (msg.png) {
					var cut = document.createElement('img');
					cut.src = msg.png;
					cut.alt = PDFSEL_TEXT.cropped;
					preview.appendChild(cut);
				} else {
					preview.textContent = msg.problem || '';
				}
			} else if (msg.command === 'attached') {
				// The panel's Ask Pollis has taken what was sent, or said why not
				document.querySelectorAll('.pdfsel-send button.busy').forEach(function(button) {
					button.classList.remove('busy');
					var spin = button.querySelector('.spin');
					if (spin) { spin.remove(); }
				});
			}
		});`;
}

const selectAreaCss = `
		${spinnerCss}
		.pdfsel-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pdfsel-nav { width: 24px; height: 22px; padding: 0; font-size: 14px; line-height: 1; color: var(--vscode-foreground); background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; cursor: pointer; }
		.pdfsel-nav:disabled { opacity: 0.4; cursor: default; }
		.pdfsel-row { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; }
		.pdfsel-stage { position: relative; flex: 0 1 auto; max-width: 100%; min-width: 200px; min-height: 120px; cursor: crosshair; user-select: none; touch-action: none; }
		.pdfsel-stage img { display: block; max-width: 100%; max-height: 70vh; background: #fff; box-shadow: 0 0 0 1px var(--vscode-widget-border); }
		.pdfsel-box { position: absolute; box-sizing: border-box; pointer-events: none; border: 2px solid var(--vscode-focusBorder); background: color-mix(in srgb, var(--vscode-focusBorder) 12%, transparent); }
		.pdfsel-box.flash { animation: pdfsel-flash 0.8s ease-out; }
		@keyframes pdfsel-flash {
			0%, 45% { border-color: var(--vscode-charts-green); background: color-mix(in srgb, var(--vscode-charts-green) 30%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vscode-charts-green) 45%, transparent); }
			100% { box-shadow: 0 0 0 0 transparent; }
		}
		.pdfsel-status { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 12px; text-align: center; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pdfsel-status[hidden] { display: none; }
		.pdfsel-side { flex: 1 1 220px; min-width: 200px; max-width: 440px; }
		.pdfsel-side-title { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
		.pdfsel-preview { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pdfsel-preview img { display: block; max-width: 100%; max-height: 40vh; background: #fff; box-shadow: 0 0 0 1px var(--vscode-widget-border); }
		.pdfsel-numbers { margin: 6px 0 14px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pdfsel-send { display: flex; gap: 6px; }
		.pdfsel-send button.busy { cursor: default; }`;

export function getPdfHtml(): string {
	return buildScaffoldHtml('pdf', PDF_METADATA.pdf, {
		title: 'PDF Files',
		defaultModel: 'text',
		decisionFirstColumn: 'Tab',
		illustrationLabel: localize('pdfArea.label', "Select Area"),
		illustrationIntro: localize('pdfArea.intro', "Drag on the page to select an area: Left, Top, Width and Height fill in, Region becomes Area, and on Extract Text, Tables, Render Pages and Convert the page becomes the page range. Text, Table and Image send the area to Ask Pollis beside the title."),
		headScriptJs: selectAreaScript(),
		// The pane, made once and kept across the tabs, in place of a gallery
		illustrationOverrideJs: `			if (!pdfSel.built) { pdfSelBuild(body); }
			pdfSelRefresh();
			return;
`,
		extraCss: selectAreaCss,
		tailScriptJs: `		// The page is drawn when the pane opens, and follows File and the area inputs
		document.getElementById('illus-toggle').addEventListener('click', function() { pdfSelRefresh(); });
		var pdfSelTimer = null;
		document.getElementById('scaffold-inputs').addEventListener('input', function() {
			clearTimeout(pdfSelTimer);
			pdfSelTimer = setTimeout(pdfSelRefresh, 500);
		});`,
	});
}
