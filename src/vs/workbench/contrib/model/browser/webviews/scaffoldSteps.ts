/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../nls.js';

/**
 * The inputs and code of the steps of a Time Arrow panel. A step's code is what the later steps need, and its actions
 * are further code of it. Each is a code box as that of Example Code, which Julia REPL, Editor, Notebook and Pluto send
 * with the code of the steps before it, as `before` (see `withStepsFirst` in model.handler.ts).
 */
export const stepCodeCss = `
		.step-pane .scaffold-inputs { border-radius: 6px; }
		.step-code { margin-top: 12px; }
		.step-code-title { font-size: 13px; font-weight: 600; margin: 0 0 4px 0; }
		.step-code-title .code-custom-tag { margin-left: 8px; }
		.step-code .code-edit { border-radius: 6px; }
		.step-code.editing .code-edit-wrap { display: block; }
		.step-code.customised .code-custom-tag { display: inline-block; }
		.step-code.editing .code-preview { display: none; }
		.step-code .code-preview-wrapper { margin-bottom: 8px; }
		.scaffold-dropdown .dropdown-item.disabled { opacity: 0.45; cursor: default; }
`;

/** The HTML of a code box of a step. `key`, `titleHtml` and `descHtml` are escaped by the caller. */
export function stepCodeBoxHtml(key: string, titleHtml: string, descHtml: string): string {
	const text = {
		customised: localize('scaffoldSteps.customised', "Customised"),
		customisedTip: localize('scaffoldSteps.customisedTip', "Your saved version of this code. Restore Default brings back the original."),
		editing: localize('scaffoldSteps.editing', "Editing"),
		edit: localize('scaffoldSteps.edit', "Edit"),
		editTip: localize('scaffoldSteps.editTip', "Edit this code and keep your version"),
		wrap: localize('scaffoldSteps.wrap', "Wrap"),
		wrapTip: localize('scaffoldSteps.wrapTip', "Wrap long lines at the width of the box"),
		restore: localize('scaffoldSteps.restore', "Restore Default"),
		restoreTip: localize('scaffoldSteps.restoreTip', "Move your version to the Trash and bring back the original code"),
		save: localize('scaffoldSteps.save', "Save"),
		cancel: localize('scaffoldSteps.cancel', "Cancel"),
		copy: localize('scaffoldSteps.copy', "Copy"),
		repl: localize('scaffoldSteps.repl', "Julia REPL"),
		replTip: localize('scaffoldSteps.replTip', "Run the code in the Julia REPL, after the steps before it that have not run there as they are now"),
		editor: localize('scaffoldSteps.editor', "Editor"),
		editorTip: localize('scaffoldSteps.editorTip', "Send the code to a new file in the editor, after that of the steps before it"),
		notebook: localize('scaffoldSteps.notebook', "Notebook"),
		notebookTip: localize('scaffoldSteps.notebookTip', "Send the code to a notebook, after that of the steps before it"),
		pluto: localize('scaffoldSteps.pluto', "Pluto"),
		plutoTip: localize('scaffoldSteps.plutoTip', "Send the code to a Pluto notebook, after that of the steps before it"),
	};
	return `<div class="step-code" data-step-code="${key}">
			<div class="step-code-title">${titleHtml}<span class="code-custom-tag" title="${text.customisedTip}">${text.customised}</span></div>${descHtml ? `\n\t\t\t<p class="hint">${descHtml}</p>` : ''}
			<div class="code-preview-wrapper">
				<div class="code-preview"></div>
				<div class="code-edit-wrap">
					<textarea class="code-edit" id="step-edit-${key}" spellcheck="false" aria-label="${text.edit}"></textarea>
					<span class="code-edit-label">${text.editing}</span>
				</div>
				<div class="code-btn-bar code-btn-bar-bottom code-btn-bar-split">
					<span class="code-btn-group">
						<button class="code-action-btn" data-step-act="edit" title="${text.editTip}">${text.edit}</button>
						<button class="code-action-btn wrap-btn" data-step-act="wrap" aria-pressed="false" title="${text.wrapTip}">${text.wrap}</button>
						<button class="code-action-btn" data-step-act="restore" title="${text.restoreTip}" hidden>${text.restore}</button>
						<button class="code-action-btn primary" data-step-act="save" hidden>${text.save}</button>
						<button class="code-action-btn" data-step-act="cancel" hidden>${text.cancel}</button>
					</span>
					<span class="code-btn-group">
						<button class="code-action-btn" data-step-act="copy">${text.copy}</button>
						<button class="code-action-btn" data-step-act="juliaRepl" title="${text.replTip}">${text.repl}</button>
						<button class="code-action-btn" data-step-act="newFile" title="${text.editorTip}">${text.editor}</button>
						<button class="code-action-btn" data-step-act="notebook" title="${text.notebookTip}">${text.notebook}</button>
						<button class="code-action-btn" data-step-act="pluto" title="${text.plutoTip}">${text.pluto}</button>
					</span>
				</div>
			</div>
			<div class="panel-run-note" hidden></div>
		</div>`;
}

/** What a Next Step of such a panel sends with its code, in place of Example Code: the code of every step. */
export const stepSetupJs = `before: stepsBefore(Infinity), box: 'panel', name: 'this Next Step'`;

/**
 * The script of the code boxes, inside that of the scaffold, whose functions it uses. It needs `STEP_CODE`, one entry a
 * box in the order of the page: `key`, `step` (its number), `own` (the step's own code, not an action), `group` (the
 * row of a Minimal panel whose steps it is among, or empty for those of the panel), `name` (what
 * Julia calls it), `when` and `code`, a function that gives its lines as the scaffold's `codeLine` does.
 */
export function stepCodeJs(): string {
	// `</` cannot end the script element from inside a JSON text
	const text = JSON.stringify({
		copy: localize('scaffoldSteps.copy', "Copy"),
		copied: localize('scaffoldSteps.copied', "Copied!"),
		restore: localize('scaffoldSteps.restore', "Restore Default"),
		confirm: localize('scaffoldSteps.confirm', "Confirm Restore"),
		oneRuns: localize('scaffoldSteps.oneRuns', "Running Step {0} first, so that this code can use its results."),
		manyRun: localize('scaffoldSteps.manyRun', "Running Steps {0} to {1} first, so that this code can use their results."),
		oneFirst: localize('scaffoldSteps.oneFirst', "Step {0} comes first, so that this code can use its results."),
		manyFirst: localize('scaffoldSteps.manyFirst', "Steps {0} to {1} come first, so that this code can use their results."),
	}).replace(/</g, '\\u003c');
	return `
		var STEP_TEXT = ${text};
		var stepBoxes = STEP_CODE.map(function(entry) {
			return { entry: entry, root: document.querySelector('.step-code[data-step-code="' + entry.key + '"]'), shown: null, original: '', editing: false, timer: null };
		});
		function plainCode(html) {
			var holder = document.createElement('div');
			holder.innerHTML = html;
			return Array.from(holder.querySelectorAll('.code-line, .code-blank')).map(function(l) { return l.textContent || ''; }).join('\\n');
		}
		function currentStepCode(entry) {
			var custom = customSteps[entry.key];
			return typeof custom === 'string' ? custom : plainCode(entry.code());
		}
		// The code of the steps before step number step, in their order: those of the panel, or of a row of a Minimal panel
		function stepsBefore(step, group) {
			return STEP_CODE.filter(function(entry) { return entry.own && entry.step < step && (entry.group || '') === (group || ''); }).map(function(entry) {
				return { step: entry.step, code: currentStepCode(entry) };
			});
		}
		function stepButton(box, act) { return box.root.querySelector('[data-step-act="' + act + '"]'); }
		function showStepState(box) {
			var custom = typeof customSteps[box.entry.key] === 'string';
			box.root.classList.toggle('customised', custom);
			box.root.classList.toggle('editing', box.editing);
			['edit', 'wrap'].forEach(function(act) { stepButton(box, act).hidden = box.editing; });
			['save', 'cancel'].forEach(function(act) { stepButton(box, act).hidden = !box.editing; });
			stepButton(box, 'restore').hidden = box.editing || !custom;
			['copy', 'juliaRepl', 'newFile', 'notebook', 'pluto'].forEach(function(act) { stepButton(box, act).disabled = box.editing; });
		}
		// Only the boxes whose code changed are drawn and coloured again
		function refreshStepCode() {
			stepBoxes.forEach(function(box) {
				if (box.editing) { return; }
				box.root.hidden = !whenHolds({ dataset: { when: box.entry.when } });
				box.original = plainCode(box.entry.code());
				var code = currentStepCode(box.entry);
				showStepState(box);
				if (code === box.shown) { return; }
				box.shown = code;
				box.root.querySelector('.code-preview').innerHTML = code.split('\\n').map(function(l) { return l ? line(esc(l)) : blank(); }).join('');
				vscode.postMessage({ command: 'colorize', code: code, target: 'step:' + box.entry.key });
			});
		}
		function resetStepRestore(box) {
			clearTimeout(box.timer);
			box.timer = null;
			stepButton(box, 'restore').textContent = STEP_TEXT.restore;
		}
		function editStep(box, on) {
			box.editing = on;
			resetStepRestore(box);
			showStepState(box);
			if (on) { openCodeEdit(box.root.querySelector('.code-edit'), box.shown); } else { refreshStepCode(); }
		}
		function saveStep(box) {
			var key = box.entry.key;
			var code = box.root.querySelector('.code-edit').value.replace(/\\s+$/, '');
			// Saving the original (or nothing) is the same as restoring the default
			if (!code || code === box.original.replace(/\\s+$/, '')) {
				delete customSteps[key];
				vscode.postMessage({ command: 'restoreExample', step: key });
			} else {
				customSteps[key] = code;
				vscode.postMessage({ command: 'saveExample', step: key, code: code });
			}
			editStep(box, false);
		}
		function restoreStep(box) {
			var button = stepButton(box, 'restore');
			if (!box.timer) {
				button.textContent = STEP_TEXT.confirm;
				box.timer = setTimeout(function() { resetStepRestore(box); }, 4000);
				return;
			}
			resetStepRestore(box);
			delete customSteps[box.entry.key];
			vscode.postMessage({ command: 'restoreExample', step: box.entry.key });
			refreshStepCode();
		}
		stepBoxes.forEach(function(box) {
			wireCodeEdit(box.root.querySelector('.code-edit'));
			box.root.addEventListener('click', function(event) {
				var button = event.target.closest('[data-step-act]');
				if (!button || button.disabled) { return; }
				var act = button.dataset.stepAct;
				if (act === 'edit' || act === 'cancel') {
					editStep(box, act === 'edit');
				} else if (act === 'save') {
					saveStep(box);
				} else if (act === 'restore') {
					restoreStep(box);
				} else if (act === 'wrap') {
					setCodeWrap(!wrapCode, true);
				} else if (act === 'copy') {
					navigator.clipboard.writeText(box.shown).then(function() {
						button.textContent = STEP_TEXT.copied;
						setTimeout(function() { button.textContent = STEP_TEXT.copy; }, 2000);
					});
				} else {
					vscode.postMessage({
						command: 'runCode', target: act, code: box.shown, box: box.entry.key, stepCode: box.entry.own,
						// An action uses the code of its own step too
						before: stepsBefore(box.entry.own ? box.entry.step : box.entry.step + 1, box.entry.group), name: box.entry.name,
					});
				}
			});
		});
		function showStepsNote(msg) {
			var box = stepBoxes.find(function(b) { return b.entry.key === msg.box; });
			var note = msg.box === 'panel' ? document.getElementById('panel-run-note') : box && box.root.querySelector('.panel-run-note');
			if (!note) { return; }
			var one = msg.from === msg.to;
			var runs = msg.target === 'juliaRepl';
			var template = runs ? (one ? STEP_TEXT.oneRuns : STEP_TEXT.manyRun) : (one ? STEP_TEXT.oneFirst : STEP_TEXT.manyFirst);
			note.textContent = template.replace('{0}', msg.from).replace('{1}', msg.to);
			note.hidden = false;
			clearTimeout(note.hideTimer);
			note.hideTimer = setTimeout(function() { note.hidden = true; }, 6000);
		}
		// A table's link to a step (Pollis.step_links): the field takes the value, and the step's code runs in the Julia
		// REPL as its button runs it, after the steps before it that have not run
		function runStepWith(input, value) {
			var field = document.getElementById('in-' + input);
			var box = null;
			for (var node = field && field.parentElement; node && !box; node = node.parentElement) {
				var root = node.querySelector('.step-code');
				box = root ? stepBoxes.find(function(b) { return b.root === root; }) || null : null;
			}
			if (!box || box.editing) { return; }
			field.value = value;
			onInputsChanged();
			stepButton(box, 'juliaRepl').click();
		}
		// After the scaffold's own listener, which takes the user's versions into customSteps
		window.addEventListener('message', function(event) {
			var msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'runStepWith' && typeof msg.input === 'string' && typeof msg.value === 'string') { runStepWith(msg.input, msg.value); }
			if (msg.command === 'customExamples') { refreshStepCode(); }
			if (msg.command === 'stepsFirst') { showStepsNote(msg); }
			if (msg.command === 'colorizedCode' && typeof msg.target === 'string' && msg.target.indexOf('step:') === 0) {
				var box = stepBoxes.find(function(b) { return 'step:' + b.entry.key === msg.target; });
				var preview = box && box.root.querySelector('.code-preview');
				if (preview) {
					preview.innerHTML = msg.html || '';
					colorizeBrackets(preview);
					numberCodeLines(preview);
				}
			}
		});
		applyInputsForModel();
		refreshStepCode();
`;
}
