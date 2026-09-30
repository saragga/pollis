/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { IDatabaseConnectionsService } from '../common/databaseConnections.js';
import { DATABASE_DRIVERS, DatabaseDriverId, generateConnectionCode, generateSessionConnectCode, getDatabaseDriver, IDatabaseConnectionProfile, validateConnectionProfile } from '../common/databaseDrivers.js';

/** Messages the connection form sends. Each carries the profile as currently filled in. */
type ConnectionEditorMessage =
	| { command: 'update' | 'save' | 'saveConnect'; profile: IDatabaseConnectionProfile }
	| { command: 'chooseFile'; field: string };

/** A new, empty profile for `driver`. */
function newProfile(driver: DatabaseDriverId): IDatabaseConnectionProfile {
	const options: Record<string, string | boolean> = {};
	for (const field of getDatabaseDriver(driver).fields) {
		options[field.id] = field.defaultValue;
	}
	return { id: generateUuid(), name: '', driver, target: 'global', variable: 'con', options };
}

/**
 * Open the connection form in an editor tab: a driver list on the left and, on the right, the
 * driver's fields with the Julia code they generate. The profile can be saved for the Connections
 * view, or saved and connected in the Julia REPL. Passing `profile` edits an existing one; a new
 * one starts with `driver` selected.
 */
export function openConnectionEditor(accessor: ServicesAccessor, profile?: IDatabaseConnectionProfile, driver: DatabaseDriverId = 'duckdb'): void {
	const databaseConnectionsService = accessor.get(IDatabaseConnectionsService);
	const commandService = accessor.get(ICommandService);
	const fileDialogService = accessor.get(IFileDialogService);
	const languageService = accessor.get(ILanguageService);
	const notificationService = accessor.get(INotificationService);
	const themeService = accessor.get(IThemeService);

	const title = profile
		? localize('editConnection.title', "Connection - {0}", profile.name)
		: localize('newConnection.title', "Connection - New Connection");
	const webviewInput = accessor.get(IWebviewWorkbenchService).openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.databases.connection',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	const webview = webviewInput.webview;
	webview.setHtml(connectionEditorHtml());

	const disposables = new DisposableStore();
	disposables.add(webview.onDidDispose(() => disposables.dispose()));

	let lastProfile = profile ?? newProfile(driver);
	let codeVersion = 0;
	const postCode = async (): Promise<void> => {
		// Tokenizing is async: drop a result that a newer edit has already overtaken.
		const version = ++codeVersion;
		const html = await tokenizeToString(languageService, generateConnectionCode(lastProfile), 'julia');
		if (version !== codeVersion) {
			return;
		}
		const colorMap = TokenizationRegistry.getColorMap();
		const css = colorMap ? generateTokensCSSForColorMap(colorMap) : '';
		webview.postMessage({ command: 'code', html, css, problems: validateConnectionProfile(lastProfile) });
	};
	disposables.add(themeService.onDidColorThemeChange(() => postCode()));

	disposables.add(webview.onMessage(async (e: { message: ConnectionEditorMessage | { command: 'ready' } }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'ready': {
				const drivers = DATABASE_DRIVERS.map(d => ({ ...d, blank: newProfile(d.id).options }));
				webview.postMessage({ command: 'init', drivers, profile: lastProfile, editing: !!profile });
				await postCode();
				break;
			}
			case 'update':
				lastProfile = msg.profile;
				await postCode();
				break;
			case 'save':
			case 'saveConnect': {
				const problems = validateConnectionProfile(msg.profile);
				if (problems.length) {
					notificationService.warn(problems.join(' '));
					break;
				}
				const saved = { ...msg.profile, name: msg.profile.name.trim() };
				databaseConnectionsService.saveConnection(saved);
				webviewInput.dispose();
				if (msg.command === 'saveConnect') {
					await sendToJuliaRepl(generateSessionConnectCode(saved, !!databaseConnectionsService.getSession(saved.id)), commandService);
				}
				break;
			}
			case 'chooseFile': {
				const uris = await fileDialogService.showOpenDialog({
					title: localize('chooseFile.title', "Choose Database File"),
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
				});
				if (uris?.length) {
					webview.postMessage({ command: 'setField', field: msg.field, value: uris[0].fsPath });
				}
				break;
			}
		}
	}));
}

/** The form's user-facing strings, handed to the webview script. */
function connectionEditorStrings() {
	return {
		connectionType: localize('form.connectionType', "Connection Type"),
		name: localize('form.name', "Connection Name"),
		namePlaceholder: localize('form.namePlaceholder', "e.g. Sales Warehouse"),
		variable: localize('form.variable', "Julia Variable"),
		target: localize('form.target', "Connection Target"),
		global: localize('form.global', "Global"),
		workspace: localize('form.workspace', "Current Workspace"),
		packages: localize('form.packages', "Packages"),
		chooseFile: localize('form.chooseFile', "Choose File"),
		code: localize('form.code', "Generated Code"),
		save: localize('form.save', "Save Connection"),
		connect: localize('form.connect', "Connect"),
	};
}

function connectionEditorHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.layout { display: flex; min-height: 100vh; }
		.drivers { width: 200px; flex-shrink: 0; border-right: 1px solid var(--vscode-widget-border); padding: 16px 0; }
		.drivers h2, .form h2 { font-size: 11px; font-weight: 600; text-transform: uppercase; margin: 0 16px 8px; color: var(--vscode-descriptionForeground); }
		.driver { display: block; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-family: inherit; font-size: 13px; padding: 6px 16px; cursor: pointer; }
		.driver:hover { background: var(--vscode-list-hoverBackground); }
		.driver.active { background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
		.driver:disabled { opacity: 0.5; cursor: default; }
		.form { flex: 1; min-width: 0; padding: 16px 24px; max-width: 720px; }
		.form h1 { font-size: 24px; font-weight: 300; margin: 0 0 4px; }
		.description { color: var(--vscode-descriptionForeground); margin: 0 0 20px; line-height: 1.4; }
		.row { display: flex; gap: 16px; margin-bottom: 14px; }
		.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
		.field label { font-weight: 600; }
		.field .hint { font-size: 12px; color: var(--vscode-descriptionForeground); }
		input[type=text], select { font-family: inherit; font-size: 13px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); border-radius: 2px; }
		input[type=text]:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.file-row { display: flex; gap: 6px; }
		.file-row input { flex: 1; }
		.checkbox { flex-direction: row; align-items: center; gap: 6px; }
		.checkbox label { font-weight: normal; }
		.radio-group { display: flex; gap: 16px; padding: 4px 0; }
		.radio-group label { font-weight: normal; display: inline-flex; align-items: center; gap: 4px; }
		.code-box { margin-top: 20px; }
		pre { margin: 6px 0 0; padding: 10px 12px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); white-space: pre; overflow-x: auto; tab-size: 4; }
		.problems { color: var(--vscode-errorForeground); margin: 10px 0 0; padding-left: 18px; }
		.buttons { display: flex; gap: 8px; margin-top: 16px; }
		button.action { font-family: inherit; font-size: 13px; padding: 4px 12px; border: 1px solid var(--vscode-button-border, transparent); border-radius: 2px; cursor: pointer; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		button.action:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button.action:disabled { opacity: 0.5; cursor: default; }
	</style>
	<style id="token-css"></style>
</head>
<body>
	<div class="layout">
		<nav class="drivers"><h2 id="drivers-title"></h2><div id="driver-list"></div></nav>
		<main class="form">
			<h1 id="driver-title"></h1>
			<p class="description" id="driver-description"></p>
			<div id="common-fields"></div>
			<div id="driver-fields"></div>
			<div class="code-box">
				<h2 id="code-title" style="margin-left: 0"></h2>
				<pre id="code"></pre>
				<ul class="problems" id="problems"></ul>
			</div>
			<div class="buttons">
				<button class="action" id="btn-save"></button>
				<button class="action primary" id="btn-connect"></button>
			</div>
		</main>
	</div>
	<script>
		const vscode = acquireVsCodeApi();
		const S = ${JSON.stringify(connectionEditorStrings())};
		let drivers = [];
		let profile;
		let editing = false;

		function el(tag, props, children) {
			const e = document.createElement(tag);
			Object.assign(e, props || {});
			(children || []).forEach(c => e.appendChild(c));
			return e;
		}

		function post(command) {
			vscode.postMessage({ command, profile });
		}

		function textField(id, label, value, placeholder, onInput) {
			const input = el('input', { type: 'text', id: 'f-' + id, value: value || '', placeholder: placeholder || '' });
			input.addEventListener('input', () => onInput(input.value));
			return el('div', { className: 'field' }, [el('label', { textContent: label, htmlFor: input.id }), input]);
		}

		function renderCommon() {
			const box = document.getElementById('common-fields');
			box.textContent = '';
			const target = el('div', { className: 'radio-group' });
			[['global', S.global], ['workspace', S.workspace]].forEach(([value, label]) => {
				const radio = el('input', { type: 'radio', name: 'target', value, checked: profile.target === value });
				radio.addEventListener('change', () => { profile.target = value; post('update'); });
				target.appendChild(el('label', {}, [radio, document.createTextNode(label)]));
			});
			box.appendChild(el('div', { className: 'row' }, [
				textField('name', S.name, profile.name, S.namePlaceholder, v => { profile.name = v; post('update'); }),
				textField('variable', S.variable, profile.variable, 'con', v => { profile.variable = v.trim(); post('update'); }),
			]));
			box.appendChild(el('div', { className: 'row' }, [
				el('div', { className: 'field' }, [el('label', { textContent: S.target }), target]),
			]));
		}

		function renderDriverFields() {
			const driver = drivers.find(d => d.id === profile.driver);
			document.getElementById('driver-title').textContent = driver.label;
			document.getElementById('driver-description').textContent = driver.description + ' ' + S.packages + ': ' + driver.packages.map(p => p + '.jl').join(', ');
			document.querySelectorAll('.driver').forEach(b => b.classList.toggle('active', b.dataset.driver === driver.id));
			const box = document.getElementById('driver-fields');
			box.textContent = '';
			driver.fields.forEach(f => {
				const set = v => { profile.options[f.id] = v; post('update'); };
				let field;
				if (f.kind === 'checkbox') {
					const input = el('input', { type: 'checkbox', id: 'f-' + f.id, checked: profile.options[f.id] === true });
					input.addEventListener('change', () => set(input.checked));
					field = el('div', { className: 'field checkbox' }, [input, el('label', { textContent: f.label, htmlFor: input.id })]);
				} else if (f.kind === 'select') {
					const select = el('select', { id: 'f-' + f.id }, f.options.map(o => el('option', { value: o, textContent: o, selected: profile.options[f.id] === o })));
					select.addEventListener('change', () => set(select.value));
					field = el('div', { className: 'field' }, [el('label', { textContent: f.label, htmlFor: select.id }), select]);
				} else {
					field = textField(f.id, f.label, profile.options[f.id], f.placeholder, set);
					if (f.kind === 'file') {
						const input = field.querySelector('input');
						const choose = el('button', { className: 'action', textContent: S.chooseFile });
						choose.addEventListener('click', () => vscode.postMessage({ command: 'chooseFile', field: f.id }));
						// Swap the row in first: building it around the input would detach the input from the field.
						const row = el('div', { className: 'file-row' });
						field.replaceChild(row, input);
						row.append(input, choose);
					}
				}
				if (f.description) {
					field.appendChild(el('span', { className: 'hint', textContent: f.description }));
				}
				box.appendChild(el('div', { className: 'row' }, [field]));
			});
		}

		function selectDriver(id) {
			if (profile.driver === id) { return; }
			const driver = drivers.find(d => d.id === id);
			profile.driver = id;
			profile.options = Object.assign({}, driver.blank);
			renderDriverFields();
			post('update');
		}

		window.addEventListener('message', e => {
			const msg = e.data;
			if (msg.command === 'init') {
				drivers = msg.drivers;
				profile = msg.profile;
				editing = msg.editing;
				const list = document.getElementById('driver-list');
				drivers.forEach(d => {
					const b = el('button', { className: 'driver', textContent: d.label, disabled: editing && d.id !== profile.driver });
					b.dataset.driver = d.id;
					b.addEventListener('click', () => selectDriver(d.id));
					list.appendChild(b);
				});
				renderCommon();
				renderDriverFields();
				document.getElementById('f-name').focus();
			} else if (msg.command === 'code') {
				document.getElementById('token-css').textContent = msg.css;
				document.getElementById('code').innerHTML = msg.html;
				const problems = document.getElementById('problems');
				problems.textContent = '';
				msg.problems.forEach(p => problems.appendChild(el('li', { textContent: p })));
				document.getElementById('btn-save').disabled = msg.problems.length > 0;
				document.getElementById('btn-connect').disabled = msg.problems.length > 0;
			} else if (msg.command === 'setField') {
				profile.options[msg.field] = msg.value;
				document.getElementById('f-' + msg.field).value = msg.value;
				post('update');
			}
		});

		document.getElementById('drivers-title').textContent = S.connectionType;
		document.getElementById('code-title').textContent = S.code;
		document.getElementById('btn-save').textContent = S.save;
		document.getElementById('btn-connect').textContent = S.connect;
		document.getElementById('btn-save').addEventListener('click', () => post('save'));
		// Connect saves the profile too, so the Connections view lists and follows it.
		document.getElementById('btn-connect').addEventListener('click', () => post('saveConnect'));
		vscode.postMessage({ command: 'ready' });
	</script>
</body>
</html>`;
}
