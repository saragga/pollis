/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { disposableTimeout } from '../../../../base/common/async.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { escapeRegExpCharacters } from '../../../../base/common/strings.js';
import { hasKey } from '../../../../base/common/types.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { WRDS_METADATA } from '../../model/browser/webviews/wrds.data.js';
import { buildWebviewHtml, colorizeBracketsJs, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from '../../compose/browser/compareShared.js';
import { defaultCopyFolder } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { IDatabaseConnectionsService } from '../common/databaseConnections.js';
import { generateConnectionCode, generateSessionConnectCode, generateSessionDisconnectCode, IDatabaseConnectionProfile, isValidJuliaIdentifier, isWrdsConnection, SHOW_CONNECTIONS_COMMAND_ID, WRDS_PAGE_COMMAND_ID, WRDS_PRESET } from '../common/databaseDrivers.js';
import { generateWrdsCountCode, generateWrdsExtractCode, generateWrdsMergeCode, isValidMergeSource, IWrdsBrowseChoice, IWrdsDataset, IWrdsDatasetChoice, IWrdsMergeChoice, WRDS_DATASET_GROUPS, WRDS_DATASETS, WrdsDestination, wrdsBrowseSql, wrdsDatasetSql } from '../common/wrdsQueries.js';
import { OPEN_SCHEMA_COMMAND_ID } from './connectionsView.js';

// Wharton Research Data Services (WRDS), from Explore > Access Data Libraries (explore.contribution.ts). A page of the
// scaffold in the Time Arrow style, in four steps: 1, Connect, the WRDS connection of the Databases view, a PostgreSQL
// connection with the settings of WRDS (WRDS_PRESET), saved and connected in the Julia REPL as any connection of the view
// is; 2, Choose Data, a common dataset (wrdsQueries.ts) or a table of a library browsed, as a query that can be edited;
// 3, Extract, the query counted or run in the Julia REPL, into a variable and, if asked, a Parquet, CSV or DuckDB file;
// 4, Merge, CRSP and Compustat extracts joined on this computer with DuckDB, by an annual or a quarterly timing rule.

/** The code boxes of the page, by the id of their element: the Julia code of Connect, Extract and Merge, and the colours of the SQL box. */
type CodeBox = 'code' | 'extractCode' | 'mergeCode' | 'sqlColors';

/** How long Connect waits for the REPL to report the connection: the connection's own timeout, and a margin. */
const CONNECT_WAIT_MS = 150_000;

type WrdsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'draft'; readonly user: string; readonly pgpass: boolean }
	| { readonly command: 'connect'; readonly user: string; readonly pgpass: boolean }
	| { readonly command: 'disconnect' }
	| { readonly command: 'edit' }
	| { readonly command: 'showConnections' }
	| { readonly command: 'dataset'; readonly choice: IWrdsDatasetChoice }
	| { readonly command: 'browse'; readonly choice: IWrdsBrowseChoice }
	| { readonly command: 'library'; readonly library: string }
	| { readonly command: 'extractDraft' | 'count' | 'extract'; readonly sql: string; readonly variable: string; readonly destination: WrdsDestination; readonly file: string }
	| { readonly command: 'mergeDraft' | 'merge'; readonly choice: IWrdsMergeChoice; readonly variable: string; readonly destination: WrdsDestination; readonly file: string }
	| { readonly command: 'chooseFile'; readonly target: FileTarget; readonly variable: string; readonly destination: WrdsDestination }
	| { readonly command: 'chooseSource'; readonly target: SourceTarget };

/** The file inputs of the Extract and Merge steps. */
type FileTarget = 'file' | 'mergeFile';
/** The inputs of the Merge step that name a table to join. */
type SourceTarget = 'stocks' | 'firms';

/** The extension of the file of each destination that writes one. */
const DESTINATION_EXTENSIONS: Record<Exclude<WrdsDestination, 'variable'>, string> = { parquet: 'parquet', csv: 'csv', duckdb: 'duckdb' };

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

async function openWrdsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const databaseConnectionsService = accessor.get(IDatabaseConnectionsService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const fileDialogService = accessor.get(IFileDialogService);
	const contextService = accessor.get(IWorkspaceContextService);
	const languageService = accessor.get(ILanguageService);
	const themeService = accessor.get(IThemeService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('wrds.title', "Wharton Research Data Services (WRDS)");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.wrds',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'wrds', title, WRDS_METADATA.wrds, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The code of each code box, and how many times each has been set. */
	const codes = new Map<CodeBox, string>();
	const codeVersions = new Map<CodeBox, number>();
	/**
	 * Shows `code` in a code box, coloured as Example Code colours it: the theme's tokens, then its brackets by
	 * depth. The SQL box's colours come with the text they are of, for the page to drop them once it has changed.
	 */
	const postCode = async (box: CodeBox, code: string): Promise<void> => {
		codes.set(box, code);
		// Tokenizing is async: drop a result that a newer code has already overtaken.
		const version = (codeVersions.get(box) ?? 0) + 1;
		codeVersions.set(box, version);
		const html = await tokenizeToString(languageService, code, box === 'sqlColors' ? 'sql' : 'julia');
		if (codeVersions.get(box) !== version) {
			return;
		}
		const colorMap = TokenizationRegistry.getColorMap();
		post({ command: 'colorizedCode', box, html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '', text: code });
	};
	disposables.add(themeService.onDidColorThemeChange(() => {
		for (const [box, code] of codes) {
			postCode(box, code);
		}
	}));

	/** The saved WRDS connection: the first connection of the Databases view to the server of WRDS. */
	const savedProfile = () => databaseConnectionsService.getConnections().find(isWrdsConnection);
	/** The WRDS connection as the form has it: the saved one, or a new one, with the username and password source typed. */
	const draftProfile = (user: string, pgpass: boolean): IDatabaseConnectionProfile => {
		const saved = savedProfile();
		const base: IDatabaseConnectionProfile = saved ?? { id: generateUuid(), name: WRDS_PRESET.name ?? 'WRDS', driver: WRDS_PRESET.driver, target: 'global', variable: WRDS_PRESET.variable ?? 'wrds', options: {} };
		return { ...base, options: { ...WRDS_PRESET.options, ...base.options, user: user.trim(), promptPassword: !pgpass } };
	};
	/** Whether Connect was pressed and the REPL has not reported the connection yet. */
	const connecting = disposables.add(new MutableDisposable());
	/** The library chosen in Browse, whose tables the page shows. */
	let browsedLibrary: string | undefined;

	/** The libraries of the connection, and the tables of the library browsed, when connected. */
	const postLibraries = () => {
		const saved = savedProfile();
		const session = saved && databaseConnectionsService.getSession(saved.id);
		const schemas = session?.schemas ?? [];
		const browsed = schemas.find(schema => schema.name === browsedLibrary);
		post({
			command: 'libraries',
			connected: !!session,
			libraries: schemas.map(schema => ({ name: schema.name, tables: schema.unread ? schema.tableCount ?? 0 : schema.tables.length })),
			library: browsed?.name,
			reading: !!browsed?.unread,
			error: browsed?.error,
			tables: browsed && !browsed.unread ? browsed.tables.map(table => ({ name: table.name, kind: table.kind, columns: table.columns.map(column => ({ name: column.name, type: column.type })) })) : [],
		});
	};
	/** The WRDS connection the Extract step runs on, and whether the REPL holds it. */
	const extractProfile = () => {
		const saved = savedProfile();
		return { profile: saved ?? draftProfile('', false), connected: !!saved && !!databaseConnectionsService.getSession(saved.id) };
	};
	const extractCode = (message: { readonly command: string; readonly sql: string; readonly variable: string; readonly destination: WrdsDestination; readonly file: string }) => {
		const { profile, connected } = extractProfile();
		const variable = isValidJuliaIdentifier(message.variable) ? message.variable : 'wrds_data';
		return message.command === 'count'
			? generateWrdsCountCode(profile, connected, message.sql)
			: generateWrdsExtractCode(profile, connected, message.sql, variable, message.destination, message.file.trim() || undefined);
	};
	const mergeCode = (message: { readonly choice: IWrdsMergeChoice; readonly variable: string; readonly destination: WrdsDestination; readonly file: string }) => {
		const variable = isValidJuliaIdentifier(message.variable) ? message.variable : 'crsp_compustat';
		const source = (text: string, fallback: string) => isValidMergeSource(text) ? text : fallback;
		const choice: IWrdsMergeChoice = {
			rule: message.choice.rule === 'quarterly' ? 'quarterly' : 'annual',
			stocks: source(message.choice.stocks, 'crsp_monthly_gvkey'),
			firms: source(message.choice.firms, message.choice.rule === 'quarterly' ? 'compustat_quarterly' : 'compustat_annual'),
		};
		return generateWrdsMergeCode(choice, variable, message.destination, message.file.trim() || undefined);
	};

	const postState = (draft?: { readonly user: string; readonly pgpass: boolean }) => {
		const saved = savedProfile();
		const session = saved && databaseConnectionsService.getSession(saved.id);
		if (session) {
			connecting.clear();
		}
		const user = draft?.user ?? (typeof saved?.options['user'] === 'string' ? saved.options['user'] : '');
		const pgpass = draft?.pgpass ?? saved?.options['promptPassword'] === false;
		post({
			command: 'state',
			user,
			pgpass,
			saved: !!saved,
			connected: !!session,
			connecting: !!connecting.value,
			libraries: session?.schemas.length ?? 0,
			error: session?.error,
			variable: saved?.variable ?? WRDS_PRESET.variable,
		});
		postCode('code', generateConnectionCode(draftProfile(user, pgpass)));
	};
	disposables.add(databaseConnectionsService.onDidChangeConnections(() => {
		postState();
		postLibraries();
	}));

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: WrdsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			postState();
			postLibraries();
		} else if (message.command === 'draft' && hasKey(message, { user: true, pgpass: true })) {
			postCode('code', generateConnectionCode(draftProfile(message.user, message.pgpass)));
		} else if (message.command === 'connect' && hasKey(message, { user: true, pgpass: true }) && message.user.trim()) {
			const profile = draftProfile(message.user, message.pgpass);
			const connected = !!databaseConnectionsService.getSession(profile.id);
			databaseConnectionsService.saveConnection(profile);
			// Until the REPL reports the connection, or it has had time to fail
			connecting.value = disposableTimeout(() => {
				connecting.clear();
				postState();
			}, CONNECT_WAIT_MS);
			postState(message);
			await sendToJuliaRepl(generateSessionConnectCode(profile, connected), commandService);
		} else if (message.command === 'disconnect') {
			const saved = savedProfile();
			if (saved && databaseConnectionsService.getSession(saved.id)) {
				await sendToJuliaRepl(generateSessionDisconnectCode(saved.id), commandService);
			}
		} else if (message.command === 'edit') {
			const saved = savedProfile();
			if (saved) {
				await commandService.executeCommand('pollis.databases.editConnection', { id: saved.id });
			}
		} else if (message.command === 'showConnections') {
			await commandService.executeCommand(SHOW_CONNECTIONS_COMMAND_ID);
		} else if (message.command === 'dataset' && hasKey(message, { choice: true })) {
			post({ command: 'sql', sql: wrdsDatasetSql(message.choice) });
		} else if (message.command === 'browse' && hasKey(message, { choice: true })) {
			post({ command: 'sql', sql: message.choice.library && message.choice.table ? wrdsBrowseSql(message.choice) : '' });
		} else if (message.command === 'library' && hasKey(message, { library: true })) {
			// A library listed without its tables has them read by the REPL, which the Databases view then shows too
			browsedLibrary = message.library || undefined;
			const saved = savedProfile();
			const schema = saved && databaseConnectionsService.getSession(saved.id)?.schemas.find(s => s.name === browsedLibrary);
			if (saved && schema?.unread) {
				await commandService.executeCommand(OPEN_SCHEMA_COMMAND_ID, { id: saved.id, schema: schema.name });
			}
			postLibraries();
		} else if (message.command === 'extractDraft' && hasKey(message, { sql: true, variable: true, destination: true, file: true })) {
			postCode('extractCode', extractCode(message));
			if (message.sql !== codes.get('sqlColors')) {
				postCode('sqlColors', message.sql);
			}
		} else if ((message.command === 'count' || message.command === 'extract') && hasKey(message, { sql: true, variable: true, destination: true, file: true })) {
			if (!message.sql.trim() || (message.command === 'extract' && (!isValidJuliaIdentifier(message.variable) || (message.destination !== 'variable' && !message.file.trim())))) {
				return;
			}
			await sendToJuliaRepl(extractCode(message), commandService);
			post({ command: 'sent', action: message.command });
		} else if (message.command === 'mergeDraft' && hasKey(message, { choice: true, variable: true, destination: true, file: true })) {
			postCode('mergeCode', mergeCode(message));
		} else if (message.command === 'merge' && hasKey(message, { choice: true, variable: true, destination: true, file: true })) {
			if (!isValidMergeSource(message.choice.stocks) || !isValidMergeSource(message.choice.firms) || !isValidJuliaIdentifier(message.variable) || (message.destination !== 'variable' && !message.file.trim())) {
				return;
			}
			await sendToJuliaRepl(mergeCode(message), commandService);
			post({ command: 'sent', action: 'merge' });
		} else if (message.command === 'chooseFile' && hasKey(message, { target: true, variable: true, destination: true }) && message.destination !== 'variable') {
			const extension = DESTINATION_EXTENSIONS[message.destination];
			const folder = await defaultCopyFolder(contextService, fileService) ?? await fileDialogService.defaultFilePath();
			const name = `${isValidJuliaIdentifier(message.variable) ? message.variable : 'wrds_data'}.${extension}`;
			const file = await fileDialogService.showSaveDialog({
				title: localize('wrds.chooseFileTitle', "Save the Data from WRDS"),
				defaultUri: joinPath(folder, name),
				filters: [{ name: extension === 'duckdb' ? 'DuckDB' : extension.toUpperCase(), extensions: [extension] }],
			});
			if (file) {
				post({ command: 'file', target: message.target, file: file.fsPath });
			}
		} else if (message.command === 'chooseSource' && hasKey(message, { target: true })) {
			const folder = await defaultCopyFolder(contextService, fileService) ?? await fileDialogService.defaultFilePath();
			const files = await fileDialogService.showOpenDialog({
				title: localize('wrds.chooseSourceTitle', "Choose the Data to Merge"),
				defaultUri: folder,
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: false,
				filters: [{ name: localize('wrds.parquetOrCsv', "Parquet or CSV"), extensions: ['parquet', 'csv'] }],
			});
			if (files?.length) {
				post({ command: 'source', target: message.target, file: files[0].fsPath });
			}
		}
	}));
}

/** The description of a dataset in parts, the names of its tables, libraries and columns apart, which the page colours. */
function descriptionParts(dataset: IWrdsDataset): { readonly text: string; readonly name?: boolean }[] {
	if (!dataset.names.length) {
		return [{ text: dataset.description }];
	}
	// The longest first, so that a library.table is not taken for its library; a name stands alone, not inside a longer one,
	// though a full stop may end the sentence after it
	const names = [...dataset.names].sort((a, b) => b.length - a.length).map(escapeRegExpCharacters);
	const parts: { readonly text: string; readonly name?: boolean }[] = [];
	let last = 0;
	for (const match of dataset.description.matchAll(new RegExp(`(?<![\\w.])(?:${names.join('|')})(?!\\w|\\.\\w)`, 'g'))) {
		parts.push({ text: dataset.description.slice(last, match.index) }, { text: match[0], name: true });
		last = match.index + match[0].length;
	}
	parts.push({ text: dataset.description.slice(last) });
	return parts;
}

function pageHtml(): string {
	const options = WRDS_PRESET.options ?? {};
	const text = {
		title: localize('wrds.title', "Wharton Research Data Services (WRDS)"),
		intro: localize('wrds.intro', "WRDS holds the databases of finance, accounting and economics research, such as CRSP and Compustat, on a PostgreSQL server, open to the users of a subscribing institution. Pollis connects to it as to any PostgreSQL database: the connection is in the Databases view, and the data comes into the Julia REPL with {0}.", '<span class="yellow">LibPQ.jl</span>'),
		connect: localize('wrds.connect', "Connect"),
		connectIntro: localize('wrds.connectIntro', "Your WRDS account connects you; the libraries you see are those of your institution's subscription. The connection is saved in the Databases view as {0}, and opens in the Julia REPL.", '{0}'),
		user: localize('wrds.user', "WRDS Username"),
		userPlaceholder: localize('wrds.userPlaceholder', "The username of your WRDS account"),
		password: localize('wrds.password', "Password"),
		askRepl: localize('wrds.askRepl', "Ask for It in the Julia REPL"),
		pgpass: localize('wrds.pgpass', "Read It from {0}", '<span class="yellow">~/.pgpass</span>'),
		settings: localize('wrds.settings', "Server {0}, port {1}, database {2}, SSL required.", `<span class="yellow">${options['host']}</span>`, `<span class="yellow">${options['port']}</span>`, `<span class="yellow">${options['dbname']}</span>`),
		duo: localize('wrds.duo', "Each sign-in waits for a Duo push approved on your phone. WRDS remembers the approval for 30 days, as long as you connect from the same IP address."),
		code: localize('wrds.code', "Julia Code"),
		connectButton: localize('wrds.connectButton', "Connect"),
		reconnect: localize('wrds.reconnect', "Connect Again"),
		disconnect: localize('wrds.disconnect', "Disconnect"),
		edit: localize('wrds.edit', "Edit in the Connection Form"),
		showConnections: localize('wrds.showConnections', "Show Connections"),
		needUser: localize('wrds.needUser', "Type your WRDS username."),
		connecting: localize('wrds.connecting', "Connecting in the Julia REPL: type your password there if it asks, then approve the Duo push on your phone."),
		connected: localize('wrds.connected', "Connected in the Julia REPL as {0}: {1} libraries in the Databases view.", '{0}', '{1}'),
		savedOnly: localize('wrds.savedOnly', "Saved in the Databases view, not connected."),
		headConnected: localize('wrds.headConnected', "Connected"),
		headNotConnected: localize('wrds.headNotConnected', "Not connected"),
		choose: localize('wrds.choose', "Choose Data"),
		chooseIntro: localize('wrds.chooseIntro', "The data comes as a query in SQL, which runs on WRDS in step 3: start from a common dataset, with the filters research usually applies, or from a table of a library. The query below can be edited; changing a choice above writes it again."),
		commonDatasets: localize('wrds.commonDatasets', "Common Datasets"),
		browseLibraries: localize('wrds.browseLibraries', "Browse the Libraries"),
		dataset: localize('wrds.dataset', "Dataset"),
		identifiers: {
			permno: localize('wrds.permnos', "PERMNOs"),
			gvkey: localize('wrds.gvkeys', "GVKEYs"),
			secid: localize('wrds.secids', "SECIDs"),
			ibesTicker: localize('wrds.ibesTickers', "IBES Tickers"),
			companyid: localize('wrds.companyids', "Capital IQ Company IDs"),
		},
		identifiersPlaceholder: localize('wrds.identifiersPlaceholder', "Empty for all, or a list separated by commas"),
		library: localize('wrds.library', "Library"),
		table: localize('wrds.table', "Table"),
		chooseLibrary: localize('wrds.chooseLibrary', "Choose a library"),
		chooseTable: localize('wrds.chooseTable', "Choose a table"),
		libraryTables: localize('wrds.libraryTables', "{0} ({1} tables)", '{0}', '{1}'),
		browseNeedsConnection: localize('wrds.browseNeedsConnection', "Connect in step 1 to browse the libraries of your subscription."),
		readingTables: localize('wrds.readingTables', "Reading the tables of the library in the Julia REPL..."),
		columns: localize('wrds.columns', "Columns"),
		allColumns: localize('wrds.allColumns', "All columns when none is ticked."),
		dateColumn: localize('wrds.dateColumn', "Date Column"),
		noDateColumn: localize('wrds.noDateColumn', "None"),
		from: localize('wrds.from', "From"),
		to: localize('wrds.to', "To"),
		sql: localize('wrds.sql', "SQL"),
		extract: localize('wrds.extract', "Extract"),
		extractIntro: localize('wrds.extractIntro', "The query of step 2 runs on WRDS, and only its result comes to your computer. Count Rows first: a query of daily data over many years can bring tens of millions of rows."),
		variable: localize('wrds.variable', "Julia Variable"),
		saveTo: localize('wrds.saveTo', "Also Save To"),
		destinations: {
			variable: localize('wrds.destinationVariable', "Nothing Else"),
			parquet: localize('wrds.destinationParquet', "Parquet File"),
			csv: localize('wrds.destinationCsv', "CSV File"),
			duckdb: localize('wrds.destinationDuckdb', "DuckDB Database"),
		},
		file: localize('wrds.file', "File"),
		chooseFile: localize('wrds.chooseFile', "Choose..."),
		duckdbTable: localize('wrds.duckdbTable', "The data becomes the table named as the Julia variable, replaced if it is there; add the database to the Databases view with Connect to DuckDB..."),
		count: localize('wrds.count', "Count Rows"),
		extractButton: localize('wrds.extractButton', "Extract"),
		needSql: localize('wrds.needSql', "Choose the data in step 2 first."),
		needVariable: localize('wrds.needVariable', "The variable name must start with a letter or underscore and hold only letters, digits and underscores."),
		needFile: localize('wrds.needFile', "Choose the file to save to."),
		sentCount: localize('wrds.sentCount', "Sent to the Julia REPL: the number of rows shows there."),
		sentExtract: localize('wrds.sentExtract', "Sent to the Julia REPL: the rows and columns brought over show there."),
		merge: localize('wrds.merge', "Merge"),
		mergeIntro: localize('wrds.mergeIntro', "The Merge step joins stock data from CRSP to accounting data from Compustat, both extracted in step 3, so that each stock and month has the accounting data investors could know by then. The join runs on this computer, in DuckDB, without WRDS."),
		timing: localize('wrds.timing', "Timing"),
		rules: {
			annual: localize('wrds.ruleAnnual', "Annual: Fama and French (1993)"),
			quarterly: localize('wrds.ruleQuarterly', "Quarterly: Hou, Xue and Zhang (2015)"),
		},
		ruleHints: {
			annual: localize('wrds.ruleAnnualHint', "Each month from July of year t+1 to June of year t+2 takes the Compustat Annual Fundamentals of the fiscal year that ended in calendar year t."),
			quarterly: localize('wrds.ruleQuarterlyHint', "Each month takes the Compustat Quarterly Fundamentals of the latest quarter reported (rdq) in an earlier month, as long as that fiscal quarter ended at most six months before."),
		},
		stocks: localize('wrds.stocks', "Stock Data"),
		firms: localize('wrds.firms', "Firm Data"),
		sourcesHint: localize('wrds.sourcesHint', "Each is a Julia variable of step 3, or a Parquet or CSV file it saved. The stock data needs the columns permno, gvkey and date, as CRSP Monthly with GVKEY has; the firm data needs gvkey and datadate, and rdq for the quarterly rule."),
		mergeButton: localize('wrds.mergeButton', "Merge"),
		needSources: localize('wrds.needSources', "Name the stock data and the firm data: a Julia variable, or a Parquet or CSV file."),
		sentMerge: localize('wrds.sentMerge', "Sent to the Julia REPL: the rows and columns of the merged data show there."),
	};
	const datasets = WRDS_DATASETS.map(dataset => ({ id: dataset.id, group: dataset.group, label: dataset.label, description: descriptionParts(dataset), variable: dataset.variable, identifier: dataset.identifier, dated: dataset.dated }));
	const datasetOptions = Object.entries(WRDS_DATASET_GROUPS)
		.map(([group, label]) => `<optgroup label="${label}">${datasets.filter(d => d.group === group).map(d => `<option value="${d.id}">${d.label}</option>`).join('')}</optgroup>`)
		.join('');
	const destinationRadios = (name: string) => (['variable', 'parquet', 'csv', 'duckdb'] as const)
		.map(d => `<label><input type="radio" name="${name}" value="${d}"${d === 'variable' ? ' checked' : ''}> ${text.destinations[d]}</label>`).join('');
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; min-width: 18em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		/* The fields to fill in: their border always in the blue of a focused field, as the Ask Pollis box's is */
		#user, #dataset, #identifiers, #variable, #stocks, #firms, #mergeVariable { border-color: var(--vscode-focusBorder); }
		input::placeholder { color: var(--vscode-input-placeholderForeground); }
		.wrds-code { margin: 6px 0 0; padding: 10px 12px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); white-space: pre; overflow-x: auto; tab-size: 4; max-width: 900px; }
		.choices label { margin-right: 16px; }
		/* The calendar button of From and To: drawn for a dark page in a dark theme, where it would be dark on dark */
		body.vscode-dark input[type=date], body.vscode-high-contrast:not(.vscode-high-contrast-light) input[type=date] { color-scheme: dark; }
		input[type=date]::-webkit-calendar-picker-indicator { opacity: 1; cursor: pointer; }
		input[type=date], select, textarea { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; }
		/* The SQL box: a transparent text box over its text coloured as the editor colours SQL, the two scrolled together */
		.wrds-sql-box { position: relative; max-width: 900px; }
		textarea.wrds-sql, .wrds-sql-colors { box-sizing: border-box; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); line-height: 1.4; tab-size: 4; white-space: pre; overflow-wrap: normal; padding: 3px 6px; border: 1px solid transparent; border-radius: 2px; }
		textarea.wrds-sql { position: relative; z-index: 1; display: block; width: 100%; overflow: auto; resize: vertical; color: transparent; background: transparent; caret-color: var(--vscode-input-foreground); border-color: var(--vscode-input-border, var(--vscode-panel-border)); }
		textarea.wrds-sql::selection { color: transparent; background: var(--vscode-editor-selectionBackground); }
		.wrds-sql-colors { position: absolute; inset: 0; margin: 0; overflow: hidden; pointer-events: none; color: var(--vscode-input-foreground); background: var(--vscode-input-background); }
		.wrds-sql-colors .monaco-tokenized-source { white-space: pre; }
		.wrds-columns { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 2px 16px; max-width: 900px; max-height: 240px; overflow-y: auto; margin: 4px 0 8px; }
		.wrds-columns label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.wrds-columns .type { color: var(--vscode-descriptionForeground); }
		#file, #mergeFile, #stocks, #firms { min-width: 28em; }
`,
		steps: [
			{
				id: 'step-connect',
				title: text.connect,
				headHtml: '<span class="small" id="connectHead"></span>',
				bodyHtml: `
		<p class="hint" id="connectIntro"></p>
		<div class="row"><span class="small">${text.user}</span> <input type="text" id="user" placeholder="${text.userPlaceholder}"></div>
		<div class="row choices">
			<span class="small">${text.password}</span>
			<label><input type="radio" name="password" id="askRepl"> ${text.askRepl}</label>
			<label><input type="radio" name="password" id="pgpass"> ${text.pgpass}</label>
		</div>
		<p class="hint">${text.settings}</p>
		<p class="hint">${text.duo}</p>
		<h3 class="part">${text.code}</h3>
		<pre class="wrds-code" id="code"></pre>
		<div class="settings"><span class="bar">
			<button class="action current" id="connect">${text.connectButton}</button>
			<button class="action" id="disconnect" hidden>${text.disconnect}</button>
			<button class="action" id="edit" hidden>${text.edit}</button>
			<button class="action" id="showConnections">${text.showConnections}</button>
		</span></div>
		<div class="small status" id="connectStatus"></div>
`,
			},
			{
				id: 'step-choose',
				title: text.choose,
				bodyHtml: `
		<p class="hint">${text.chooseIntro}</p>
		<div class="row choices">
			<label><input type="radio" name="source" id="sourceDataset" checked> ${text.commonDatasets}</label>
			<label><input type="radio" name="source" id="sourceBrowse"> ${text.browseLibraries}</label>
		</div>
		<div id="datasetBox">
			<div class="row"><span class="small">${text.dataset}</span> <select id="dataset">${datasetOptions}</select></div>
			<p class="hint" id="datasetDescription"></p>
			<div class="row" id="identifierRow"><span class="small" id="identifierLabel"></span> <input type="text" class="grow" id="identifiers" placeholder="${text.identifiersPlaceholder}"></div>
		</div>
		<div id="browseBox" hidden>
			<p class="hint" id="browseNeedsConnection">${text.browseNeedsConnection}</p>
			<div class="row" id="libraryRow">
				<span class="small">${text.library}</span> <select id="library"></select>
				<span class="small">${text.table}</span> <select id="table"></select>
			</div>
			<div class="small status" id="browseStatus"></div>
			<div id="columnsBox" hidden>
				<h3 class="part">${text.columns}</h3>
				<p class="hint">${text.allColumns}</p>
				<div class="wrds-columns" id="columns"></div>
				<div class="row"><span class="small">${text.dateColumn}</span> <select id="dateColumn"></select></div>
			</div>
		</div>
		<div class="row" id="dateRow">
			<span class="small">${text.from}</span> <input type="date" id="start">
			<span class="small">${text.to}</span> <input type="date" id="end">
		</div>
		<h3 class="part">${text.sql}</h3>
		<div class="wrds-sql-box">
			<pre class="wrds-sql-colors" id="sqlColors" aria-hidden="true"></pre>
			<textarea class="wrds-sql" id="sql" rows="14" spellcheck="false" wrap="off"></textarea>
		</div>
`,
			},
			{
				id: 'step-extract',
				title: text.extract,
				bodyHtml: `
		<p class="hint">${text.extractIntro}</p>
		<div class="row"><span class="small">${text.variable}</span> <input type="text" id="variable"></div>
		<div class="row choices">
			<span class="small">${text.saveTo}</span>
			${destinationRadios('destination')}
		</div>
		<div class="row" id="fileRow" hidden>
			<span class="small">${text.file}</span> <input type="text" id="file">
			<span class="bar"><button class="action" id="chooseFile">${text.chooseFile}</button></span>
		</div>
		<p class="hint" id="duckdbHint" hidden>${text.duckdbTable}</p>
		<h3 class="part">${text.code}</h3>
		<pre class="wrds-code" id="extractCode"></pre>
		<div class="settings"><span class="bar">
			<button class="action" id="count">${text.count}</button>
			<button class="action current" id="extract">${text.extractButton}</button>
		</span></div>
		<div class="small status" id="extractStatus"></div>
`,
			},
			{
				id: 'step-merge',
				title: text.merge,
				bodyHtml: `
		<p class="hint">${text.mergeIntro}</p>
		<div class="row choices">
			<span class="small">${text.timing}</span>
			${(['annual', 'quarterly'] as const).map(r => `<label><input type="radio" name="rule" value="${r}"${r === 'annual' ? ' checked' : ''}> ${text.rules[r]}</label>`).join('')}
		</div>
		<p class="hint" id="ruleHint"></p>
		<div class="row">
			<span class="small">${text.stocks}</span> <input type="text" id="stocks" value="crsp_monthly_gvkey">
			<span class="bar"><button class="action" id="chooseStocks">${text.chooseFile}</button></span>
		</div>
		<div class="row">
			<span class="small">${text.firms}</span> <input type="text" id="firms" value="compustat_annual">
			<span class="bar"><button class="action" id="chooseFirms">${text.chooseFile}</button></span>
		</div>
		<p class="hint">${text.sourcesHint}</p>
		<div class="row"><span class="small">${text.variable}</span> <input type="text" id="mergeVariable" value="crsp_compustat"></div>
		<div class="row choices">
			<span class="small">${text.saveTo}</span>
			${destinationRadios('mergeDestination')}
		</div>
		<div class="row" id="mergeFileRow" hidden>
			<span class="small">${text.file}</span> <input type="text" id="mergeFile">
			<span class="bar"><button class="action" id="chooseMergeFile">${text.chooseFile}</button></span>
		</div>
		<p class="hint" id="mergeDuckdbHint" hidden>${text.duckdbTable}</p>
		<h3 class="part">${text.code}</h3>
		<pre class="wrds-code" id="mergeCode"></pre>
		<div class="settings"><span class="bar">
			<button class="action current" id="merge">${text.mergeButton}</button>
		</span></div>
		<div class="small status" id="mergeStatus"></div>
`,
			},
		],
		pageScriptJs: `
	${colorizeBracketsJs}
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = ${JSON.stringify(spinnerSvg)};
	const userInput = document.getElementById('user');
	const askRepl = document.getElementById('askRepl');
	const pgpass = document.getElementById('pgpass');
	const connectButton = document.getElementById('connect');
	const status = document.getElementById('connectStatus');
	let state;

	function draft() {
		return { user: userInput.value, pgpass: pgpass.checked };
	}
	function updateConnect() {
		connectButton.disabled = !userInput.value.trim() || (state && state.connecting);
	}
	function sendDraft() {
		updateConnect();
		vscode.postMessage(Object.assign({ command: 'draft' }, draft()));
	}
	userInput.addEventListener('input', sendDraft);
	askRepl.addEventListener('change', sendDraft);
	pgpass.addEventListener('change', sendDraft);
	connectButton.addEventListener('click', () => vscode.postMessage(Object.assign({ command: 'connect' }, draft())));
	for (const command of ['disconnect', 'edit', 'showConnections']) {
		document.getElementById(command).addEventListener('click', () => vscode.postMessage({ command }));
	}

	function render(message) {
		state = message;
		if (document.activeElement !== userInput) {
			userInput.value = message.user;
		}
		askRepl.checked = !message.pgpass;
		pgpass.checked = message.pgpass;
		document.getElementById('connectIntro').innerHTML = TEXT.connectIntro.replace('{0}', '<code>' + message.variable + '</code>');
		connectButton.textContent = message.connected ? TEXT.reconnect : TEXT.connectButton;
		document.getElementById('disconnect').hidden = !message.connected;
		document.getElementById('edit').hidden = !message.saved;
		document.getElementById('connectHead').textContent = message.connected ? TEXT.headConnected : TEXT.headNotConnected;
		status.classList.toggle('missing', !!message.error);
		if (message.error) {
			status.textContent = message.error;
		} else if (message.connecting) {
			status.innerHTML = SPINNER + ' ';
			status.appendChild(document.createTextNode(TEXT.connecting));
		} else if (message.connected) {
			status.textContent = TEXT.connected.replace('{0}', message.variable).replace('{1}', String(message.libraries));
		} else {
			status.textContent = message.saved ? TEXT.savedOnly : (userInput.value.trim() ? '' : TEXT.needUser);
		}
		updateConnect();
	}

	// Step 2: Choose Data
	const DATASETS = ${JSON.stringify(datasets)};
	const sourceDataset = document.getElementById('sourceDataset');
	const sourceBrowse = document.getElementById('sourceBrowse');
	const datasetSelect = document.getElementById('dataset');
	const identifiers = document.getElementById('identifiers');
	const librarySelect = document.getElementById('library');
	const tableSelect = document.getElementById('table');
	const dateColumnSelect = document.getElementById('dateColumn');
	const startInput = document.getElementById('start');
	const endInput = document.getElementById('end');
	const sqlArea = document.getElementById('sql');
	let libraries = { connected: false, libraries: [], tables: [] };

	function option(value, label, selected) {
		const o = document.createElement('option');
		o.value = value;
		o.textContent = label;
		o.selected = !!selected;
		return o;
	}
	function chosenDataset() {
		return DATASETS.find(d => d.id === datasetSelect.value);
	}
	function chosenTable() {
		return libraries.tables.find(t => t.name === tableSelect.value);
	}
	function checkedColumns() {
		return Array.from(document.querySelectorAll('#columns input:checked')).map(input => input.value);
	}
	/** Ask for the query of the choices, which comes back as an sql message. */
	function compose() {
		if (sourceDataset.checked) {
			vscode.postMessage({ command: 'dataset', choice: { dataset: datasetSelect.value, start: startInput.value, end: endInput.value, identifiers: identifiers.value } });
		} else {
			vscode.postMessage({ command: 'browse', choice: { library: librarySelect.value, table: tableSelect.value, columns: checkedColumns(), dateColumn: dateColumnSelect.value || undefined, start: startInput.value, end: endInput.value } });
		}
	}
	function renderSource() {
		const dataset = chosenDataset();
		const browsing = sourceBrowse.checked;
		document.getElementById('datasetBox').hidden = browsing;
		document.getElementById('browseBox').hidden = !browsing;
		const description = document.getElementById('datasetDescription');
		description.textContent = '';
		for (const part of dataset.description) {
			if (part.name) {
				const name = document.createElement('span');
				name.className = 'yellow';
				name.textContent = part.text;
				description.append(name);
			} else {
				description.append(part.text);
			}
		}
		document.getElementById('identifierRow').hidden = !dataset.identifier;
		document.getElementById('identifierLabel').textContent = dataset.identifier ? TEXT.identifiers[dataset.identifier] : '';
		document.getElementById('dateRow').hidden = browsing ? !dateColumnSelect.value : !dataset.dated;
		suggestVariable();
	}
	function renderLibraries(message) {
		libraries = message;
		document.getElementById('browseNeedsConnection').hidden = message.connected;
		document.getElementById('libraryRow').hidden = !message.connected;
		const chosenLibrary = message.library || librarySelect.value;
		librarySelect.textContent = '';
		librarySelect.appendChild(option('', TEXT.chooseLibrary));
		message.libraries.forEach(l => librarySelect.appendChild(option(l.name, TEXT.libraryTables.replace('{0}', l.name).replace('{1}', String(l.tables)), l.name === chosenLibrary)));
		const chosenTableName = tableSelect.value;
		tableSelect.textContent = '';
		tableSelect.appendChild(option('', TEXT.chooseTable));
		message.tables.forEach(t => tableSelect.appendChild(option(t.name, t.name, t.name === chosenTableName)));
		const browseStatus = document.getElementById('browseStatus');
		browseStatus.classList.toggle('missing', !!message.error);
		browseStatus.innerHTML = message.reading ? SPINNER + ' ' : '';
		browseStatus.appendChild(document.createTextNode(message.error || (message.reading ? TEXT.readingTables : '')));
		renderColumns();
	}
	function renderColumns() {
		const table = chosenTable();
		const kept = new Set(checkedColumns());
		const box = document.getElementById('columns');
		box.textContent = '';
		document.getElementById('columnsBox').hidden = !table;
		const dateColumn = dateColumnSelect.value;
		dateColumnSelect.textContent = '';
		dateColumnSelect.appendChild(option('', TEXT.noDateColumn));
		for (const column of table ? table.columns : []) {
			const input = document.createElement('input');
			input.type = 'checkbox';
			input.value = column.name;
			input.checked = kept.has(column.name);
			input.addEventListener('change', compose);
			const label = document.createElement('label');
			label.title = column.name + ' (' + column.type + ')';
			label.append(input, ' ' + column.name + ' ');
			const type = document.createElement('span');
			type.className = 'type';
			type.textContent = column.type;
			label.appendChild(type);
			box.appendChild(label);
			if (/date|time/i.test(column.type)) {
				dateColumnSelect.appendChild(option(column.name, column.name, column.name === dateColumn));
			}
		}
		renderSource();
	}
	sourceDataset.addEventListener('change', () => { renderSource(); compose(); });
	sourceBrowse.addEventListener('change', () => { renderSource(); compose(); });
	datasetSelect.addEventListener('change', () => { renderSource(); compose(); });
	for (const input of [identifiers, startInput, endInput]) {
		input.addEventListener('input', compose);
	}
	librarySelect.addEventListener('change', () => {
		tableSelect.value = '';
		vscode.postMessage({ command: 'library', library: librarySelect.value });
		compose();
	});
	tableSelect.addEventListener('change', () => {
		document.getElementById('columns').textContent = '';
		renderColumns();
		compose();
	});
	dateColumnSelect.addEventListener('change', () => { renderSource(); compose(); });
	const sqlColors = document.getElementById('sqlColors');
	/** The SQL box's text, uncoloured, until its colours come: what is typed shows at once. */
	function showSqlText() {
		sqlColors.textContent = sqlArea.value + '\\n';
		syncSqlScroll();
	}
	function syncSqlScroll() {
		sqlColors.scrollTop = sqlArea.scrollTop;
		sqlColors.scrollLeft = sqlArea.scrollLeft;
	}
	sqlArea.addEventListener('scroll', syncSqlScroll);
	sqlArea.addEventListener('input', () => {
		showSqlText();
		sendExtractDraft();
	});

	// Step 3: Extract
	const variableInput = document.getElementById('variable');
	const fileInput = document.getElementById('file');
	const extractStatus = document.getElementById('extractStatus');
	let variableTyped = false;

	function destination() {
		return document.querySelector('input[name=destination]:checked').value;
	}
	/** The variable named after the dataset or table chosen, until one is typed. */
	function suggestVariable() {
		if (variableTyped) { return; }
		const name = sourceBrowse.checked ? (tableSelect.value || 'wrds_data') : chosenDataset().variable;
		variableInput.value = name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^(?=[0-9])/, '_');
	}
	function extractMessage(command) {
		return { command, sql: sqlArea.value, variable: variableInput.value.trim(), destination: destination(), file: fileInput.value };
	}
	function problem() {
		if (!sqlArea.value.trim()) { return TEXT.needSql; }
		if (!/^[A-Za-z_][A-Za-z0-9_!]*$/.test(variableInput.value.trim())) { return TEXT.needVariable; }
		if (destination() !== 'variable' && !fileInput.value.trim()) { return TEXT.needFile; }
		return '';
	}
	function sendExtractDraft() {
		const d = destination();
		document.getElementById('fileRow').hidden = d === 'variable';
		document.getElementById('duckdbHint').hidden = d !== 'duckdb';
		const why = problem();
		document.getElementById('extract').disabled = !!why;
		document.getElementById('count').disabled = !sqlArea.value.trim();
		extractStatus.textContent = why;
		vscode.postMessage(extractMessage('extractDraft'));
	}
	variableInput.addEventListener('input', () => { variableTyped = true; sendExtractDraft(); });
	fileInput.addEventListener('input', sendExtractDraft);
	document.querySelectorAll('input[name=destination]').forEach(radio => radio.addEventListener('change', () => {
		// A file of another kind keeps its name and takes the extension of the new one
		const d = destination();
		if (d !== 'variable' && fileInput.value) {
			fileInput.value = fileInput.value.replace(/\\.(parquet|csv|duckdb)$/i, '') + '.' + d;
		}
		sendExtractDraft();
	}));
	document.getElementById('chooseFile').addEventListener('click', () => vscode.postMessage({ command: 'chooseFile', target: 'file', variable: variableInput.value.trim(), destination: destination() }));
	document.getElementById('count').addEventListener('click', () => vscode.postMessage(extractMessage('count')));
	document.getElementById('extract').addEventListener('click', () => vscode.postMessage(extractMessage('extract')));

	// Step 4: Merge
	const stocksInput = document.getElementById('stocks');
	const firmsInput = document.getElementById('firms');
	const mergeVariableInput = document.getElementById('mergeVariable');
	const mergeFileInput = document.getElementById('mergeFile');
	const mergeStatus = document.getElementById('mergeStatus');
	const FIRMS = { annual: 'compustat_annual', quarterly: 'compustat_quarterly' };
	let firmsTyped = false;

	function rule() {
		return document.querySelector('input[name=rule]:checked').value;
	}
	function mergeDestination() {
		return document.querySelector('input[name=mergeDestination]:checked').value;
	}
	function isSource(text) {
		const value = text.trim();
		return /^[A-Za-z_][A-Za-z0-9_!]*$/.test(value) || /\\.(parquet|csv)$/i.test(value);
	}
	function mergeMessage(command) {
		return { command, choice: { rule: rule(), stocks: stocksInput.value.trim(), firms: firmsInput.value.trim() }, variable: mergeVariableInput.value.trim(), destination: mergeDestination(), file: mergeFileInput.value };
	}
	function mergeProblem() {
		if (!isSource(stocksInput.value) || !isSource(firmsInput.value)) { return TEXT.needSources; }
		if (!/^[A-Za-z_][A-Za-z0-9_!]*$/.test(mergeVariableInput.value.trim())) { return TEXT.needVariable; }
		if (mergeDestination() !== 'variable' && !mergeFileInput.value.trim()) { return TEXT.needFile; }
		return '';
	}
	function sendMergeDraft() {
		const r = rule();
		if (!firmsTyped) {
			firmsInput.value = FIRMS[r];
		}
		document.getElementById('ruleHint').textContent = TEXT.ruleHints[r];
		const d = mergeDestination();
		document.getElementById('mergeFileRow').hidden = d === 'variable';
		document.getElementById('mergeDuckdbHint').hidden = d !== 'duckdb';
		const why = mergeProblem();
		document.getElementById('merge').disabled = !!why;
		mergeStatus.textContent = why;
		vscode.postMessage(mergeMessage('mergeDraft'));
	}
	document.querySelectorAll('input[name=rule]').forEach(radio => radio.addEventListener('change', sendMergeDraft));
	stocksInput.addEventListener('input', sendMergeDraft);
	firmsInput.addEventListener('input', () => { firmsTyped = true; sendMergeDraft(); });
	mergeVariableInput.addEventListener('input', sendMergeDraft);
	mergeFileInput.addEventListener('input', sendMergeDraft);
	document.querySelectorAll('input[name=mergeDestination]').forEach(radio => radio.addEventListener('change', () => {
		const d = mergeDestination();
		if (d !== 'variable' && mergeFileInput.value) {
			mergeFileInput.value = mergeFileInput.value.replace(/\\.(parquet|csv|duckdb)$/i, '') + '.' + d;
		}
		sendMergeDraft();
	}));
	document.getElementById('chooseStocks').addEventListener('click', () => vscode.postMessage({ command: 'chooseSource', target: 'stocks' }));
	document.getElementById('chooseFirms').addEventListener('click', () => vscode.postMessage({ command: 'chooseSource', target: 'firms' }));
	document.getElementById('chooseMergeFile').addEventListener('click', () => vscode.postMessage({ command: 'chooseFile', target: 'mergeFile', variable: mergeVariableInput.value.trim(), destination: mergeDestination() }));
	document.getElementById('merge').addEventListener('click', () => vscode.postMessage(mergeMessage('merge')));

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			render(message);
		} else if (message.command === 'colorizedCode') {
			if (message.box === 'sqlColors' && message.text !== sqlArea.value) {
				return;
			}
			document.getElementById('mtk-theme').textContent = message.css;
			const box = document.getElementById(message.box);
			box.innerHTML = message.html;
			colorizeBrackets(box, message.box === 'sqlColors' ? '--' : '#');
			if (message.box === 'sqlColors') {
				// A last empty line, as the text box has, so the two scroll alike
				box.append(document.createElement('br'));
				syncSqlScroll();
			}
		} else if (message.command === 'libraries') {
			renderLibraries(message);
		} else if (message.command === 'sql') {
			sqlArea.value = message.sql;
			showSqlText();
			suggestVariable();
			sendExtractDraft();
		} else if (message.command === 'file') {
			if (message.target === 'mergeFile') {
				mergeFileInput.value = message.file;
				sendMergeDraft();
			} else {
				fileInput.value = message.file;
				sendExtractDraft();
			}
		} else if (message.command === 'source') {
			if (message.target === 'firms') {
				firmsTyped = true;
				firmsInput.value = message.file;
			} else {
				stocksInput.value = message.file;
			}
			sendMergeDraft();
		} else if (message.command === 'sent') {
			if (message.action === 'merge') {
				mergeStatus.textContent = TEXT.sentMerge;
			} else {
				extractStatus.textContent = message.action === 'count' ? TEXT.sentCount : TEXT.sentExtract;
			}
		}
	});
	renderSource();
	compose();
	sendMergeDraft();
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: WRDS_PAGE_COMMAND_ID,
			title: localize2('wrds.action', "Wharton Research Data Services (WRDS)"),
			category: localize2('databases.category', "Databases"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openWrdsPage(accessor);
	}
});
