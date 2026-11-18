/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { DisposableMap, DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import Severity from '../../../../base/common/severity.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IModelPaper } from '../../model/browser/common/model.types.js';
import { openInBrowser, sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { FORECASTINGCATALOGUE_METADATA } from '../../model/browser/webviews/forecastingCatalogue.data.js';
import { FEWEST_ROWS, rowsChoiceCss, rowsChoiceScript, sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss, stickyHeadScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { buildWebviewHtml, ONE_BLUE_BUTTON_JS } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { findPollisWorkspace, NEW_POLLIS_WORKSPACE_COMMAND_ID, OPEN_POLLIS_WORKSPACE_COMMAND_ID, pollisWorkspaceFolder } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { IToolboxPanelsService } from '../common/toolboxPanels.js';
import { COLLECTION_TYPE, FORECASTING_CATALOGUE_FILE, ICatalogueContribution, ICatalogueEntry, ICatalogueRead, POLLIS_COMPETITIONS_DATASETS_FILE, POLLIS_COMPETITIONS_DATASETS_PATH, POLLIS_COMPETITIONS_SOURCE, readForecastingCatalogue } from './forecastingCatalogue.js';
import { juliaPackageFolder } from './juliaPackages.js';
import { COMPETITIONS, downloadCode, FORECASTING_COMPETITIONS_COMMAND_ID } from './forecastingCompetitionsPage.js';
import { activeDatasets, FORECASTING_CATALOGUE_COMMAND_ID, IActiveDatasets, setActiveDatasets } from './forecastingActive.js';
import { addedDatasetFiles, forecastingFolder, IAddedDataset, readAddedDataset, recordSaved, savedStatuses, saveDataset, WORKSPACE_SOURCE, writeAddedDataset, writeCatalogueSnapshot } from './forecastingWorkspace.js';
import { IForecastingDatasetsService, IForecastingProblem } from '../common/forecastingDatasets.js';

// Manage Competition Datasets, from Compose > Forecasting Competitions (compose.contribution.ts): the forecasting
// catalogue (forecastingCatalogue.ts) in two tabs, Datasets and Curated Collections, in the Minimal style of the
// scaffold. A view of the file chooses the columns, those of one group of fields; the rows are filtered by the values of
// the controlled fields, one field at a time in Filter by, and by a tag clicked in a cell, and sorted by any column; the
// Expand button of a row opens under it the details of its entry, every field it has, group by group, its papers from
// the References of the page and the facts still to check. Any dataset can be made active (forecastingActive.ts);
// Score Forecasting Models lists the active ones it scores. The datasets Pollis downloads can be saved into the user's
// Pollis Workspace, in data/forecasting/<id>/, downloaded first in the Julia REPL when they are not on this computer,
// and the column Workspace says whether each is saved there, and changed since (forecastingWorkspace.ts); beside them the page writes the whole catalogue, for Julia. A
// dataset of the user's own, a long table, is added there with a form, converted into the files of
// PollisCompetitions.jl by a DuckDB process (../common/forecastingDatasets.ts), and joins the catalogue.


/** The name of the page for the rows the user chose (webviewPager.ts). */
const ROWS_PAGE = 'forecastingCatalogue';

type CatalogueMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'link'; readonly url: string }
	| { readonly command: 'competition'; readonly id: string }
	| { readonly command: 'active'; readonly ids: readonly string[] }
	| { readonly command: 'score'; readonly ids: readonly string[] }
	| { readonly command: 'save'; readonly ids: readonly string[] }
	| { readonly command: 'add' }
	| { readonly command: 'chooseFile' }
	| { readonly command: 'edit'; readonly id: string }
	| { readonly command: 'convert'; readonly form: IDatasetForm };

/** The form of a dataset the user adds, or whose facts they edit: its file, its columns and its facts. */
interface IDatasetForm {
	readonly mode: 'add' | 'edit';
	readonly file: string;
	readonly id: string;
	readonly name: string;
	readonly domain: string;
	readonly seriesColumn: string;
	readonly timeColumn: string;
	readonly valueColumn: string;
	readonly frequency: string;
	readonly period: number;
	readonly horizon: number;
	readonly licence: string;
	readonly notes: string;
}

/** The form as the page sent it, or undefined when a field is missing or of another type. */
function datasetForm(value: unknown): IDatasetForm | undefined {
	if (typeof value !== 'object' || !value) {
		return undefined;
	}
	const form = value as { readonly [key: string]: unknown };
	const texts = ['file', 'id', 'name', 'domain', 'seriesColumn', 'timeColumn', 'valueColumn', 'frequency', 'licence', 'notes'];
	if ((form.mode !== 'add' && form.mode !== 'edit') || texts.some(key => typeof form[key] !== 'string') || typeof form.period !== 'number' || typeof form.horizon !== 'number') {
		return undefined;
	}
	return form as unknown as IDatasetForm;
}

/** A problem of the user's file, as the form shows it. */
function problemText(problem: IForecastingProblem, horizon: number): string {
	const examples = problem.examples.join(', ');
	switch (problem.kind) {
		case 'empty': return localize('forecastingCatalogue.problemEmpty', "The file has no rows.");
		case 'noSeries': return localize('forecastingCatalogue.problemNoSeries', "{0} rows have no series.", problem.count);
		case 'noTime': return localize('forecastingCatalogue.problemNoTime', "{0} rows have no time, in series such as {1}.", problem.count, examples);
		case 'noValue': return localize('forecastingCatalogue.problemNoValue', "{0} rows have no number as their value, in series such as {1}.", problem.count, examples);
		case 'repeatedTime': return localize('forecastingCatalogue.problemRepeatedTime', "{0} series give the same time twice, such as {1}.", problem.count, examples);
		case 'short': return localize('forecastingCatalogue.problemShort', "{0} series have no more values than the horizon, {1}, so none would be left to forecast from, such as {2}.", problem.count, horizon, examples);
		case 'long': return localize('forecastingCatalogue.problemLong', "{0} series have more than 32767 values, such as {1}.", problem.count, examples);
	}
}

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

/** The ids of the competitions that Score Forecasting Models runs, which an implemented entry may name. */
function competitionIds(): string[] {
	return COMPETITIONS.map(competition => competition.id);
}

/** The papers of the page's References, by their keys in PollisReferences. */
function pagePapers(): Map<string, IModelPaper> {
	const papers = FORECASTINGCATALOGUE_METADATA.forecastingCatalogue.references.filter((reference): reference is IModelPaper => 'title' in reference && !!reference.key);
	return new Map(papers.map(paper => [paper.key!, paper]));
}

/** The competition of Score Forecasting Models that an entry is, when it is an implemented entry of PollisCompetitions. */
function competitionOf(entry: ICatalogueEntry | undefined): string | undefined {
	const competition = entry?.package === 'PollisCompetitions' && entry.status === 'implemented' ? entry.package_id : undefined;
	return typeof competition === 'string' && competitionIds().includes(competition) ? competition : undefined;
}

/** The id by which Score Forecasting Models knows an entry: its competition, or, for a dataset the user added, its id. */
function scoredAs(entry: ICatalogueEntry | undefined): string | undefined {
	return entry?.source === WORKSPACE_SOURCE ? entry.id : competitionOf(entry);
}

/** The active datasets of `entries`: their ids, and the ids Score Forecasting Models knows those it scores by. */
function activeOf(entries: readonly ICatalogueEntry[]): IActiveDatasets {
	return { entries: entries.map(entry => entry.id), scored: entries.map(scoredAs).filter((id): id is string => !!id) };
}

/**
 * The contributors' files of entries: that of PollisCompetitions.jl on this computer, else the copy Pollis ships, then
 * those of the installed toolboxes that name one, by their names, then the datasets the user added in the forecasting
 * folder `added` of the workspace. A toolbox's file that cannot be read is a problem.
 */
async function readContributions(fileService: IFileService, pathService: IPathService, toolboxPanelsService: IToolboxPanelsService, added: URI | undefined, problems: string[]): Promise<ICatalogueContribution[]> {
	const read = async (uri: URI) => (await fileService.readFile(uri)).value.toString();
	const folder = await juliaPackageFolder(fileService, pathService, 'PollisCompetitions');
	const installed = folder ? await read(joinPath(folder, POLLIS_COMPETITIONS_DATASETS_PATH)).catch(() => undefined) : undefined;
	const contributions: ICatalogueContribution[] = [{ source: POLLIS_COMPETITIONS_SOURCE, content: installed ?? await read(FileAccess.asFileUri(POLLIS_COMPETITIONS_DATASETS_FILE)) }];
	for (const toolbox of toolboxPanelsService.getToolboxes()) {
		if (toolbox.forecastingDatasets) {
			try {
				contributions.push({ source: toolbox.extensionName, content: await read(toolbox.forecastingDatasets) });
			} catch (error) {
				problems.push(`${toolbox.extensionName}: its forecasting datasets file could not be read: ${toErrorMessage(error)}`);
			}
		}
	}
	for (const file of added ? await addedDatasetFiles(fileService, added) : []) {
		contributions.push({ source: WORKSPACE_SOURCE, content: file.content });
	}
	return contributions;
}

/** Reads the schema Pollis ships and the contributors' entries, checked against the competitions of Score Forecasting Models and the References of the page. */
async function readCatalogue(fileService: IFileService, pathService: IPathService, toolboxPanelsService: IToolboxPanelsService, added: URI | undefined): Promise<ICatalogueRead> {
	const schema = (await fileService.readFile(FileAccess.asFileUri(FORECASTING_CATALOGUE_FILE))).value.toString();
	const unread: string[] = [];
	const contributions = await readContributions(fileService, pathService, toolboxPanelsService, added, unread);
	const read = readForecastingCatalogue(schema, contributions, { packageIds: { PollisCompetitions: competitionIds() }, paperKeys: [...pagePapers().keys()] });
	return { catalogue: read.catalogue, problems: [...unread, ...read.problems] };
}

/** Opens the Manage Competition Datasets page, or shows it when it is open, on the entry `entryId` when one is given. */
async function openForecastingCataloguePage(accessor: ServicesAccessor, entryId?: string): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const contextService = accessor.get(IWorkspaceContextService);
	const dialogService = accessor.get(IDialogService);
	const fileDialogService = accessor.get(IFileDialogService);
	const forecastingDatasetsService = accessor.get(IForecastingDatasetsService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		if (entryId) {
			openPage.webview.postMessage({ command: 'reveal', id: entryId });
		}
		return;
	}
	const title = localize('forecastingCatalogue.title', "Manage Competition Datasets");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.forecastingCatalogue',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, ROWS_PAGE, 40)));
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'forecastingCatalogue', title, FORECASTINGCATALOGUE_METADATA.forecastingCatalogue, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The catalogue as last read, for the competition an entry opens. */
	let read: ICatalogueRead | undefined;
	/** Where PollisCompetitions.jl keeps the competitions it downloads, a folder each, with info.toml once done. */
	const competitionsFolder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'competitions');
	const downloadedFolder = async (competition: string) => {
		const folder = joinPath(competitionsFolder, competition);
		return await fileService.exists(joinPath(folder, 'info.toml')) ? folder : undefined;
	};
	/** The datasets to save once the Julia REPL has downloaded them, by their ids. */
	const pending = new Set<string>();
	/**
	 * The folders watched, each on its own: that of the competitions and each competition's, where a download ends; the
	 * forecasting folder of the workspace and each dataset's there, where a copy saved changes.
	 */
	const watchers = disposables.add(new DisposableMap<string, DisposableStore>());
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	const watch = async (folders: readonly URI[]) => {
		const existing: URI[] = [];
		for (const folder of folders) {
			if (await fileService.exists(folder)) {
				existing.push(folder);
			}
		}
		const keys = new Set(existing.map(folder => folder.toString()));
		for (const key of [...watchers.keys()].filter(key => !keys.has(key))) {
			watchers.deleteAndDispose(key);
		}
		for (const folder of existing.filter(folder => !watchers.has(folder.toString()))) {
			const store = new DisposableStore();
			store.add(store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] })).onDidChange(() => refresh.schedule()));
			watchers.set(folder.toString(), store);
		}
	};

	const sendState = async () => {
		const workspace = await findPollisWorkspace(contextService, fileService);
		const folder = workspace && await forecastingFolder(fileService, workspace);
		try {
			read = await readCatalogue(fileService, pathService, toolboxPanelsService, folder);
		} catch (error) {
			post({ command: 'state', error: toErrorMessage(error) });
			return;
		}
		const downloaded: Record<string, boolean> = {};
		for (const entry of read.catalogue.entries) {
			const competition = competitionOf(entry);
			if (competition) {
				downloaded[entry.id] = !!await downloadedFolder(competition);
			}
		}
		if (workspace && folder) {
			// The datasets whose download has ended, saved as the user asked
			for (const id of [...pending].filter(id => downloaded[id])) {
				pending.delete(id);
				await saveEntry(folder, id);
			}
			await pollisWorkspaceFolder(fileService, workspace, 'data');
			await writeCatalogueSnapshot(fileService, folder, read.catalogue);
		}
		const saved = folder ? await savedStatuses(fileService, folder) : {};
		const competitions = [...new Set(read.catalogue.entries.map(competitionOf).filter((competition): competition is string => !!competition))];
		await watch([
			competitionsFolder,
			...competitions.map(competition => joinPath(competitionsFolder, competition)),
			...(folder ? [folder, ...Object.keys(saved).map(id => joinPath(folder, id))] : []),
		]);
		// The active datasets of the catalogue as it is now, the ids that Score Forecasting Models knows them by kept with them
		const stored = activeDatasets(storageService);
		const active = activeOf(read.catalogue.entries.filter(entry => stored.entries.includes(entry.id)));
		if (JSON.stringify(active) !== JSON.stringify(stored)) {
			setActiveDatasets(storageService, active);
		}
		const papers = Object.fromEntries([...pagePapers()].map(([key, paper]) => [key, { authors: paper.authors, year: paper.year, title: paper.title, journal: paper.journal, doi: paper.doi, url: paper.url }]));
		post({ command: 'state', catalogue: read.catalogue, problems: read.problems, papers, competitions: competitionIds(), active: active.entries, workspace: !!workspace, saved, downloaded, pending: [...pending] });
	};

	/** Saves the downloaded files of the entry `id` into `folder`, the forecasting folder of the workspace. */
	const saveEntry = async (folder: URI, id: string) => {
		const entry = read?.catalogue.entries.find(candidate => candidate.id === id);
		const competition = competitionOf(entry);
		const source = competition && await downloadedFolder(competition);
		if (entry && source) {
			await saveDataset(fileService, folder, id, source, `${entry.source} (${competition})`);
		}
	};

	/** With no Pollis Workspace open, offers to create one or open one, in this window. */
	const offerWorkspace = async () => {
		const { result } = await dialogService.prompt<string>({
			type: Severity.Info,
			message: localize('forecastingCatalogue.noWorkspace', "Save to Workspace needs a Pollis Workspace"),
			detail: localize('forecastingCatalogue.noWorkspaceDetail', "The datasets are saved in data/forecasting of a Pollis Workspace, a folder of your own work. Pollis opens the workspace in this window; then save the datasets again."),
			buttons: [
				{ label: localize({ key: 'forecastingCatalogue.createWorkspace', comment: ['&& denotes a mnemonic'] }, "&&Create a Pollis Workspace..."), run: () => NEW_POLLIS_WORKSPACE_COMMAND_ID },
				{ label: localize({ key: 'forecastingCatalogue.openWorkspace', comment: ['&& denotes a mnemonic'] }, "&&Open a Pollis Workspace..."), run: () => OPEN_POLLIS_WORKSPACE_COMMAND_ID },
			],
			cancelButton: true,
		});
		if (result) {
			await commandService.executeCommand(result);
		}
	};

	/**
	 * Saves the entries `ids` that Pollis downloads into the workspace, after asking before a copy changed since it was
	 * saved is replaced; an entry not on this computer yet is downloaded first in the Julia REPL, and saved once it is.
	 * Returns what was done with each entry, for the page to show, with the folders it names, or nothing when no
	 * workspace is open or the user kept the copies that changed.
	 */
	const saveEntries = async (ids: readonly string[]): Promise<{ readonly text: string; readonly paths: readonly string[] } | undefined> => {
		const workspace = await findPollisWorkspace(contextService, fileService);
		if (!workspace) {
			await offerWorkspace();
			return undefined;
		}
		const folder = await forecastingFolder(fileService, workspace);
		const asked = ids.map(id => read?.catalogue.entries.find(candidate => candidate.id === id)).filter((entry): entry is ICatalogueEntry => !!entry);
		const entries = asked.filter(entry => !!competitionOf(entry));
		const statuses = await savedStatuses(fileService, folder);
		const changed = entries.filter(entry => statuses[entry.id] === 'changed');
		if (changed.length) {
			const { confirmed } = await dialogService.confirm({
				message: localize('forecastingCatalogue.replaceChanged', "Replace the copies that changed since they were saved?"),
				detail: localize('forecastingCatalogue.replaceChangedDetail', "{0} changed in the workspace since it was saved. Saving again moves the copy to the Trash and saves the dataset as Pollis downloaded it.", changed.map(entry => entry.name).join(', ')),
				primaryButton: localize({ key: 'forecastingCatalogue.replace', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
			});
			if (!confirmed) {
				return undefined;
			}
		}
		await pollisWorkspaceFolder(fileService, workspace, 'data');
		const downloads = new Set<string>();
		const savedNow: ICatalogueEntry[] = [];
		const downloading: ICatalogueEntry[] = [];
		for (const entry of entries) {
			const competition = competitionOf(entry)!;
			if (await downloadedFolder(competition)) {
				await saveEntry(folder, entry.id);
				savedNow.push(entry);
			} else {
				pending.add(entry.id);
				downloads.add(competition);
				downloading.push(entry);
			}
		}
		for (const competition of downloads) {
			await sendToJuliaRepl(downloadCode(competition), commandService);
		}
		await sendState();
		const added = asked.filter(entry => entry.source === WORKSPACE_SOURCE);
		const notDownloaded = asked.filter(entry => !competitionOf(entry) && entry.source !== WORKSPACE_SOURCE).map(entry => entry.name);
		// Each dataset named with its folder in the workspace, which the page shows in yellow
		const paths: string[] = [];
		const located = (list: readonly ICatalogueEntry[]) => list.map(entry => {
			const path = `data/forecasting/${entry.id}`;
			paths.push(path);
			return localize('forecastingCatalogue.datasetIn', "{0} in {1}", entry.name, path);
		}).join(', ');
		const text = [
			savedNow.length ? localize('forecastingCatalogue.savedNotice', "Saved in the Pollis Workspace: {0}.", located(savedNow)) : '',
			downloading.length ? localize('forecastingCatalogue.downloadingNotice', "Downloading in the Julia REPL, then saved in the Pollis Workspace: {0}.", located(downloading)) : '',
			added.length ? localize('forecastingCatalogue.addedNotice', "In the Pollis Workspace already, where you added them: {0}.", located(added)) : '',
			notDownloaded.length ? localize('forecastingCatalogue.notDownloadedNotice', "Not saved, as Pollis does not download them yet: {0}.", notDownloaded.join(', ')) : '',
		].filter(part => part).join(' ');
		return { text, paths };
	};

	/** Shows the form for the file `file`, with its columns and first rows, filled with `values` when facts are edited. */
	const showForm = async (mode: IDatasetForm['mode'], file: URI, values?: Partial<IDatasetForm>) => {
		const columns = await forecastingDatasetsService.columns(file.fsPath);
		post({ command: 'form', mode, file: file.fsPath, fileName: basename(file), ...columns, values: values ?? {} });
	};

	/** Shows the empty form of a dataset of the user's own, whose Choose File... asks for its file. */
	const addDataset = async () => {
		const workspace = await findPollisWorkspace(contextService, fileService);
		if (!workspace) {
			await offerWorkspace();
			return;
		}
		post({ command: 'form', mode: 'add', file: '', fileName: '', columns: [], rows: 0, preview: [], values: {} });
	};

	/** Asks for the file of the dataset being added, a long table, and sends the form its columns and first rows. */
	const chooseFile = async () => {
		const [file] = await fileDialogService.showOpenDialog({
			title: localize('forecastingCatalogue.addTitle', "Add a Dataset: a Table With a Row for Each Observation"),
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: [{ name: localize('forecastingCatalogue.tables', "Tables"), extensions: ['csv', 'tsv', 'txt', 'parquet'] }],
		}) ?? [];
		if (!file) {
			return;
		}
		try {
			const columns = await forecastingDatasetsService.columns(file.fsPath);
			post({ command: 'formFile', file: file.fsPath, fileName: basename(file), ...columns });
		} catch (error) {
			post({ command: 'formProblems', problems: [localize('forecastingCatalogue.fileUnreadable', "{0} could not be read: {1}", basename(file), toErrorMessage(error))] });
		}
	};

	/** Shows the form of the dataset the user added as `id`, filled with its facts, for its file converted again. */
	const editDataset = async (id: string) => {
		const workspace = await findPollisWorkspace(contextService, fileService);
		const folder = workspace && await forecastingFolder(fileService, workspace);
		const dataset = folder && await readAddedDataset(fileService, folder, id);
		if (!dataset) {
			notificationService.error(localize('forecastingCatalogue.noDatasetToml', "The facts of the dataset {0} could not be read from its dataset.toml in the Pollis Workspace.", id));
			return;
		}
		const file = URI.file(dataset.conversion.file);
		if (!await fileService.exists(file)) {
			notificationService.error(localize('forecastingCatalogue.noFile', "The file the dataset {0} was made from, {1}, is no longer there: add the dataset again from where the file is now.", id, dataset.conversion.file));
			return;
		}
		const { entry, conversion } = dataset;
		const text = (value: unknown) => typeof value === 'string' ? value : '';
		await showForm('edit', file, {
			id, name: text(entry.name), domain: text(entry.domain), frequency: Array.isArray(entry.frequency) ? entry.frequency[0] : '',
			seriesColumn: conversion.seriesColumn, timeColumn: conversion.timeColumn, valueColumn: conversion.valueColumn,
			period: conversion.period, horizon: conversion.horizon, licence: text(entry.licence), notes: text(entry.notes),
		});
	};

	/**
	 * Converts the file of the form into data/forecasting/<id>/ of the workspace and writes its dataset.toml and
	 * saved.toml; the problems of the form, or of the file, are sent back to the form, and nothing is written.
	 */
	const convertDataset = async (form: IDatasetForm) => {
		const workspace = await findPollisWorkspace(contextService, fileService);
		if (!workspace) {
			await offerWorkspace();
			return;
		}
		const folder = await forecastingFolder(fileService, workspace);
		const target = joinPath(folder, form.id);
		const problems: string[] = [];
		if (!form.file) {
			problems.push(localize('forecastingCatalogue.chooseFirst', "Choose the file of the dataset."));
		}
		if (!/^[a-z][a-z0-9_]*$/.test(form.id)) {
			problems.push(localize('forecastingCatalogue.badId', "The id is lower-case letters, digits and underscores, starting with a letter."));
		} else if (form.mode === 'add' && (read?.catalogue.entries.some(entry => entry.id === form.id) || await fileService.exists(target))) {
			problems.push(localize('forecastingCatalogue.takenId', "The id {0} is taken: choose another.", form.id));
		}
		if (!form.name.trim()) {
			problems.push(localize('forecastingCatalogue.noName', "The dataset needs a name."));
		}
		if (new Set([form.seriesColumn, form.timeColumn, form.valueColumn]).size < 3) {
			problems.push(localize('forecastingCatalogue.sameColumns', "The series, the time and the value are three different columns."));
		}
		if (!Number.isInteger(form.period) || form.period < 1 || !Number.isInteger(form.horizon) || form.horizon < 1) {
			problems.push(localize('forecastingCatalogue.badNumbers', "The seasonal period and the horizon are whole numbers from 1."));
		}
		if (problems.length) {
			post({ command: 'formProblems', problems });
			return;
		}
		post({ command: 'formBusy' });
		const converted = await forecastingDatasetsService.convert({
			file: form.file, seriesColumn: form.seriesColumn, timeColumn: form.timeColumn, valueColumn: form.valueColumn,
			id: form.id, frequency: form.frequency, period: form.period, horizon: form.horizon, domain: form.domain, target: target.fsPath,
		});
		if (converted.problems.length) {
			post({ command: 'formProblems', problems: converted.problems.map(problem => problemText(problem, form.horizon)) });
			return;
		}
		// The fields the conversion knows, over those the user may have added to the entry by hand
		const earlier = form.mode === 'edit' ? (await readAddedDataset(fileService, folder, form.id))?.entry : undefined;
		const dataset: IAddedDataset = {
			conversion: { file: form.file, seriesColumn: form.seriesColumn, timeColumn: form.timeColumn, valueColumn: form.valueColumn, period: form.period, horizon: form.horizon },
			entry: {
				...earlier,
				id: form.id,
				name: form.name.trim(),
				type: 'dataset',
				domain: form.domain,
				n_series: converted.series,
				length_min: converted.lengthMin,
				length_median: converted.lengthMedian,
				length_max: converted.lengthMax,
				frequency: [form.frequency],
				structure: ['univariate_collection'],
				horizon: String(form.horizon),
				forecast_type: ['point'],
				split_protocol: 'single_holdout',
				...(form.licence.trim() ? { licence: form.licence.trim() } : {}),
				...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
			},
		};
		await pollisWorkspaceFolder(fileService, workspace, 'data');
		await writeAddedDataset(fileService, folder, form.id, dataset);
		await recordSaved(fileService, target, `the files converted from ${form.file}`);
		post({ command: 'formDone', id: form.id });
		await sendState();
	};

	// A toolbox installed, updated or removed changes the entries
	disposables.add(toolboxPanelsService.onDidChange(() => sendState()));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: CatalogueMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				await sendState();
				// The entry the page was opened on, once the catalogue is there
				if (entryId) {
					post({ command: 'reveal', id: entryId });
				}
			} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
				storeRows(storageService, ROWS_PAGE, message.rows);
			} else if (message.command === 'link' && hasKey(message, { url: true }) && typeof message.url === 'string' && /^https?:\/\//.test(message.url)) {
				await openInBrowser(message.url, commandService);
			} else if (message.command === 'competition' && hasKey(message, { id: true })) {
				// An implemented entry of PollisCompetitions, whose package_id is a competition of Score Forecasting Models, or a
				// dataset the user added: made active, so that Score Forecasting Models lists it
				const entry = read?.catalogue.entries.find(candidate => candidate.id === message.id);
				if (entry && scoredAs(entry)) {
					const entries = activeDatasets(storageService).entries;
					if (!entries.includes(entry.id)) {
						setActiveDatasets(storageService, activeOf(read!.catalogue.entries.filter(candidate => candidate.id === entry.id || entries.includes(candidate.id))));
						await sendState();
					}
					await commandService.executeCommand(FORECASTING_COMPETITIONS_COMMAND_ID);
				}
			} else if ((message.command === 'active' || message.command === 'score') && hasKey(message, { ids: true }) && Array.isArray(message.ids)) {
				// Any dataset of the catalogue can be active; Score Forecasting Models lists those it scores, and Score Competition Models opens it
				const entries = message.ids.map(id => read?.catalogue.entries.find(candidate => candidate.id === id)).filter((entry): entry is ICatalogueEntry => !!entry);
				setActiveDatasets(storageService, activeOf(entries));
				if (message.command === 'score') {
					const scored = entries.filter(entry => scoredAs(entry));
					const left = entries.filter(entry => !scoredAs(entry)).map(entry => entry.name).join(', ');
					if (!scored.length) {
						post({ command: 'notice', text: localize('forecastingCatalogue.scoreNone', "Score Forecasting Models does not score any of the active datasets yet: it scores the competitions that PollisCompetitions.jl implements and the datasets you add.") });
						return;
					}
					await commandService.executeCommand(FORECASTING_COMPETITIONS_COMMAND_ID);
					post({ command: 'notice', text: left ? localize('forecastingCatalogue.scoreSome', "Score Forecasting Models lists {0}. It does not score these yet: {1}.", scored.map(entry => entry.name).join(', '), left) : localize('forecastingCatalogue.scoreAll', "Score Forecasting Models lists {0}.", scored.map(entry => entry.name).join(', ')) });
				}
			} else if (message.command === 'save' && hasKey(message, { ids: true }) && Array.isArray(message.ids)) {
				const notice = await saveEntries(message.ids.filter((id): id is string => typeof id === 'string'));
				if (notice) {
					post({ command: 'notice', text: notice.text, paths: notice.paths });
				}
			} else if (message.command === 'add') {
				await addDataset();
			} else if (message.command === 'chooseFile') {
				await chooseFile();
			} else if (message.command === 'edit' && hasKey(message, { id: true }) && typeof message.id === 'string') {
				await editDataset(message.id);
			} else if (message.command === 'convert' && hasKey(message, { form: true })) {
				const form = datasetForm(message.form);
				if (form) {
					await convertDataset(form).catch(error => post({ command: 'formProblems', problems: [toErrorMessage(error)] }));
				}
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

/** The page, showing `rows` rows at a time at first: its texts come from here, the catalogue from the `state` message. */
function pageHtml(rows: number): string {
	const text = {
		intro: localize('forecastingCatalogue.intro', "Manage Competition Datasets describes the forecasting datasets and competitions, and the curated collections that gather them: what each holds, how it is evaluated, where its data come from and what it teaches. View shows one group of fields as columns; Filter by shows the values of a field, to tick those to keep, a value in a cell filters by it when clicked, and a column heading sorts the rows. Expand, under the tick of a row, shows everything its entry records, and Restore Size closes it again. Tick the datasets you are working with in the column Active: Score Competition Models opens Score Forecasting Models, which lists those it scores, to run a forecasting method of your own on their series, and Save Active Datasets to Workspace saves those that Pollis downloads. Save to Workspace copies a dataset into data/forecasting of your Pollis Workspace, downloading it first when it is not on this computer, and the column Workspace says whether it is saved there and changed since. Add a Dataset adds a dataset of your own, from a table with a row for each observation."),
		datasets: localize('forecastingCatalogue.datasets', "Datasets"),
		collections: localize('forecastingCatalogue.collections', "Curated Collections"),
		filterBy: localize('forecastingCatalogue.filterBy', "Filter by:"),
		active: localize('forecastingCatalogue.active', "Active"),
		activeHint: localize('forecastingCatalogue.activeHint', "The datasets you are working with: Score Forecasting Models lists those it scores, and Save Active Datasets to Workspace saves those that Pollis downloads"),
		notScored: localize('forecastingCatalogue.notScored', "Active or not: Score Forecasting Models does not score this dataset yet, so Score Competition Models leaves it out"),
		scoreActive: localize('forecastingCatalogue.scoreActive', "Score Competition Models"),
		activeCount: localize('forecastingCatalogue.activeCount', "{0} active, {1} of them scored by Score Forecasting Models"),
		noneActive: localize('forecastingCatalogue.noneActive', "None active: tick the datasets you are working with in the column Active"),
		expand: localize('forecastingCatalogue.expand', "Expand"),
		restore: localize('forecastingCatalogue.restore', "Restore Size"),
		none: localize('forecastingCatalogue.none', "None"),
		inCollection: localize('forecastingCatalogue.inCollection', "Datasets in This Collection"),
		workspace: localize('forecastingCatalogue.workspace', "Workspace"),
		workspaceHint: localize('forecastingCatalogue.workspaceHint', "Whether the dataset is saved in data/forecasting of your Pollis Workspace"),
		noWorkspace: localize('forecastingCatalogue.noWorkspaceStatus', "No Workspace"),
		noWorkspaceHint: localize('forecastingCatalogue.noWorkspaceHint', "No Pollis Workspace is open: Save to Workspace offers to create one or open one"),
		notSaved: localize('forecastingCatalogue.notSaved', "Not Saved"),
		notSavedHint: localize('forecastingCatalogue.notSavedHint', "Not in the workspace: Save to Workspace copies it there"),
		notDownloadedHint: localize('forecastingCatalogue.notDownloadedHint', "Not in the workspace, nor on this computer: Save to Workspace downloads it in the Julia REPL, then copies it there"),
		saved: localize('forecastingCatalogue.saved', "Saved"),
		savedHint: localize('forecastingCatalogue.savedHint', "In the workspace as it was saved"),
		changed: localize('forecastingCatalogue.changed', "Saved and Changed"),
		changedHint: localize('forecastingCatalogue.changedHint', "In the workspace, and changed since it was saved: a file changed, added or removed"),
		downloading: localize('forecastingCatalogue.downloading', "Downloading"),
		downloadingHint: localize('forecastingCatalogue.downloadingHint', "Downloading in the Julia REPL: saved in the workspace once the download ends"),
		saveToWorkspace: localize('forecastingCatalogue.saveToWorkspace', "Save to Workspace"),
		saveActive: localize('forecastingCatalogue.saveActive', "Save Active Datasets to Workspace"),
		addDataset: localize('forecastingCatalogue.addDataset', "Add a Dataset..."),
		addHeading: localize('forecastingCatalogue.addHeading', "Add a Dataset"),
		editHeading: localize('forecastingCatalogue.editHeading', "Edit Facts"),
		formNeeds: localize('forecastingCatalogue.formNeeds', "The file is a table with a row for each observation: a column naming its series, one giving its time and one its value. CSV, TSV, TXT or Parquet."),
		formChoose: localize('forecastingCatalogue.formChoose', "Choose File..."),
		formNoFile: localize('forecastingCatalogue.formNoFile', "No file chosen"),
		formFile: localize('forecastingCatalogue.formFile', "{0}, {1} rows. The first rows:"),
		formName: localize('forecastingCatalogue.formName', "Name"),
		formId: localize('forecastingCatalogue.formId', "Id"),
		formIdHint: localize('forecastingCatalogue.formIdHint', "The key of the dataset in the catalogue and its folder in data/forecasting: lower-case letters, digits and underscores"),
		formSeries: localize('forecastingCatalogue.formSeries', "Series Column"),
		formSeriesHint: localize('forecastingCatalogue.formSeriesHint', "The column naming the series of each row"),
		formTime: localize('forecastingCatalogue.formTime', "Time Column"),
		formTimeHint: localize('forecastingCatalogue.formTimeHint', "The column giving the time of each row, which orders the values of a series"),
		formValue: localize('forecastingCatalogue.formValue', "Value Column"),
		formValueHint: localize('forecastingCatalogue.formValueHint', "The column giving the value to forecast"),
		formFrequency: localize('forecastingCatalogue.formFrequency', "Frequency"),
		formPeriod: localize('forecastingCatalogue.formPeriod', "Seasonal Period"),
		formPeriodHint: localize('forecastingCatalogue.formPeriodHint', "The number of values in a season: 12 for monthly data with a yearly season, 1 for none"),
		formHorizon: localize('forecastingCatalogue.formHorizon', "Horizon"),
		formHorizonHint: localize('forecastingCatalogue.formHorizonHint', "The number of values to forecast: the last values of each series, held back to score the forecasts"),
		formDomain: localize('forecastingCatalogue.formDomain', "Domain"),
		formLicence: localize('forecastingCatalogue.formLicence', "Licence"),
		formLicenceHint: localize('forecastingCatalogue.formLicenceHint', "Optional: the terms under which the data may be used"),
		formNotes: localize('forecastingCatalogue.formNotes', "Notes"),
		formNotesHint: localize('forecastingCatalogue.formNotesHint', "Optional"),
		addToWorkspace: localize('forecastingCatalogue.addToWorkspace', "Add to Workspace"),
		convertAgain: localize('forecastingCatalogue.convertAgain', "Convert Again"),
		cancel: localize('forecastingCatalogue.cancel', "Cancel"),
		converting: localize('forecastingCatalogue.converting', "Converting the file..."),
		editFacts: localize('forecastingCatalogue.editFacts', "Edit Facts"),
		view: localize('forecastingCatalogue.view', "View:"),
		clearFilters: localize('forecastingCatalogue.clearFilters', "Clear Filters"),
		count: localize('forecastingCatalogue.count', "{0} of {1} entries"),
		missing: localize('forecastingCatalogue.missing', "Missing Fields"),
		missingHint: localize('forecastingCatalogue.missingHint', "The fields of the schema the entry does not have yet; hover over a number to see them"),
		yes: localize('forecastingCatalogue.yes', "Yes"),
		no: localize('forecastingCatalogue.no', "No"),
		toCheck: localize('forecastingCatalogue.toCheck', "To Check"),
		toCheckHint: localize('forecastingCatalogue.toCheckHint', "Facts of this entry still to be checked against their primary source."),
		addFilter: localize('forecastingCatalogue.addFilter', "Show only the entries with this value"),
		removeFilter: localize('forecastingCatalogue.removeFilter', "Remove this filter"),
		openCompetition: localize('forecastingCatalogue.openCompetition', "Open in Score Forecasting Models"),
		noMatch: localize('forecastingCatalogue.noMatch', "No entry matches the filters."),
		problems: localize('forecastingCatalogue.problems', "The catalogue file has problems, shown here as they are found; its entries are shown all the same:"),
		unreadable: localize('forecastingCatalogue.unreadable', "The catalogue could not be read: {0}"),
		previous: localize('forecastingCatalogue.previous', "Previous"),
		next: localize('forecastingCatalogue.next', "Next"),
		page: localize('forecastingCatalogue.page', "Page {0} of {1}"),
		sortHint: sortHint(),
	};
	return buildWebviewHtml({
		title: localize('forecastingCatalogue.title', "Manage Competition Datasets"),
		omitPoweredBy: !FORECASTINGCATALOGUE_METADATA.forecastingCatalogue.packages.length,
		omitNextSteps: true,
		introHtml: text.intro,
		extraCss: `${compareCss}
${rowsChoiceCss}
${stickyHeadCss}
${sortHeadingsCss}
		.container { max-width: 1300px; }
		.catalogue button.link, .pager button.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.catalogue button.link:hover, .pager button.link:hover { text-decoration: underline; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager button.link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		.catalogue .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
		.catalogue .controls .count { margin-left: auto; color: var(--vscode-descriptionForeground); font-size: 12px; }
		.catalogue input, .catalogue select { font-family: var(--vscode-font-family); font-size: 12px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		.catalogue select { color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border-color: var(--vscode-dropdown-border, var(--vscode-widget-border)); }
		.catalogue .controls label { font-size: 12px; white-space: nowrap; }
		.catalogue .model-toggle { margin-bottom: 10px; }
		/* The values of the field chosen in Filter by, each a tick with the number of entries of the tab that have it */
		.catalogue .filterValues { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 8px; padding: 6px 8px; border: 1px solid var(--vscode-widget-border); border-radius: 3px; }
		.catalogue .filterValues label { display: flex; align-items: center; gap: 6px; font-size: 12px; white-space: nowrap; cursor: pointer; }
		.catalogue .filterValues .number { color: var(--vscode-descriptionForeground); }
		.catalogue .scoreRow { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 8px; }
		.catalogue .scoreRow .hint { margin: 0; }
		.catalogue .scoreRow .notice { flex-basis: 100%; font-size: 12px; }
		.catalogue .scoreRow .notice:empty { display: none; }
		.catalogue td.activeCell, .catalogue th.activeCell { width: 1%; text-align: center; }
		/* Expand and Restore Size, under the tick of a row */
		.catalogue button.expand { display: block; margin: 2px auto 0 auto; padding: 2px; line-height: 0; cursor: pointer; background: none; border: none; border-radius: 3px; color: var(--vscode-icon-foreground, var(--vscode-foreground)); }
		.catalogue button.expand:hover { background: var(--vscode-toolbar-hoverBackground); }
		.catalogue button.expand svg { width: 14px; height: 14px; }
		.catalogue td.workspaceCell { white-space: nowrap; }
		.catalogue td.workspaceCell.changed { color: var(--vscode-editorWarning-foreground); }
		.catalogue td.workspaceCell.none, .catalogue td.workspaceCell.downloading { color: var(--vscode-descriptionForeground); }
		.catalogue .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
		.catalogue .chips:empty { display: none; }
		.catalogue button.chip { font: inherit; font-size: 11px; cursor: pointer; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--vscode-focusBorder); background: none; color: var(--vscode-foreground); }
		.catalogue .problems { margin: 8px 0; padding: 8px 12px; border-left: 3px solid var(--vscode-editorWarning-foreground); font-size: 12px; }
		.catalogue .problems ul { margin: 4px 0 0 0; padding-left: 18px; max-height: 160px; overflow-y: auto; }
		.catalogue table { width: 100%; border-collapse: collapse; margin-top: 4px; }
		.catalogue th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; vertical-align: bottom; }
		.catalogue td { vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; font-size: 12px; }
		.catalogue tr.entryRow:hover td, .catalogue tr.entryRow.opened td { background: var(--vscode-list-hoverBackground); }
		.catalogue td.nameCell { min-width: 220px; }
		.catalogue td.nameCell .name { font-size: 13px; font-weight: 600; }
		.catalogue td.number, .catalogue th.number { text-align: right; }
		/* Long text in a cell: two lines, the whole text in the row's details */
		.catalogue .long { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 360px; }
		.catalogue button.tag { font: inherit; font-size: 11px; cursor: pointer; margin: 0 4px 2px 0; padding: 0 6px; border-radius: 3px; background: none; color: var(--vscode-descriptionForeground); border: 1px solid var(--vscode-widget-border); }
		.catalogue button.tag:hover { border-color: var(--vscode-focusBorder); color: var(--vscode-foreground); }
		.catalogue .pinnedTags { margin-top: 2px; }
		/* The details of the row selected, under it */
		.catalogue tr.detailsRow > td { padding: 4px 16px 16px 16px; background: var(--vscode-editor-background); }
		.catalogue .details h3 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 14px 0 4px 0; }
		.catalogue .details dl { display: grid; grid-template-columns: minmax(140px, max-content) 1fr; gap: 3px 16px; margin: 0; }
		.catalogue .details dt { color: var(--vscode-descriptionForeground); }
		.catalogue .details dd { margin: 0; }
		.catalogue .details .paper { margin-bottom: 4px; }
		.catalogue .details .toCheck li { margin: 2px 0; }
		.catalogue .details .bar { margin-top: 10px; }
		/* The form of a dataset of the user's own, above the tabs */
		.catalogue .addForm { margin: 8px 0 14px 0; padding: 10px 14px; border: 1px solid var(--vscode-widget-border); border-radius: 3px; }
		.catalogue .addForm h3 { font-size: 13px; font-weight: 600; margin: 0 0 6px 0; }
		.catalogue .addForm .fileRow { display: flex; align-items: center; gap: 10px; margin: 6px 0 10px 0; font-size: 12px; }
		.catalogue .addForm .fileRow .none { color: var(--vscode-descriptionForeground); }
		.catalogue .addForm table.preview { width: auto; margin: 6px 0 10px 0; }
		.catalogue .addForm table.preview td, .catalogue .addForm table.preview th { padding: 2px 8px; }
		.catalogue .addForm .formGrid { display: grid; grid-template-columns: max-content minmax(160px, 320px); gap: 6px 12px; align-items: center; }
		.catalogue .addForm .formGrid label { font-size: 12px; }
		.catalogue .addForm .formProblems { margin: 8px 0 0 0; padding-left: 18px; color: var(--vscode-errorForeground); font-size: 12px; }
		.catalogue .addForm .bar { margin-top: 10px; }
`,
		bodyHtml: `
<div class="catalogue">
	<div class="problems" id="problems" hidden></div>
	<div class="addForm" id="addForm" hidden></div>
	<div class="model-toggle" id="tabs">
		<button class="toggle-btn active" data-tab="datasets">${text.datasets}</button>
		<button class="toggle-btn" data-tab="collections">${text.collections}</button>
	</div>
	<div class="stickyBand" id="band">
		<div class="controls">
			<label>${text.view} <select id="view"></select></label>
			<label>${text.filterBy} <select id="filterField"></select></label>
			<button class="link" id="clearFilters" hidden>${text.clearFilters}</button>
			<span class="count" id="count"></span>
		</div>
		<div class="filterValues" id="filterValues" hidden></div>
		<div class="chips" id="chips"></div>
		<div class="scoreRow" id="scoreRow">
			<div class="bar"><button class="action current" id="score" disabled>${text.scoreActive}</button><button class="action" id="saveActive" disabled>${text.saveActive}</button><button class="action" id="addDataset">${text.addDataset}</button></div>
			<span class="hint" id="activeCount"></span>
			<div class="notice" id="notice" role="status"></div>
		</div>
	</div>
	<table class="stickyHead" id="table">
		<thead><tr id="head"></tr></thead>
		<tbody id="rows"></tbody>
	</table>
	<p class="hint" id="note" hidden></p>
	<div class="pager" id="pager" hidden></div>
</div>
`,
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	// The type of the entries shown in the tab Curated Collections; the others are in the tab Datasets
	const COLLECTION = ${JSON.stringify(COLLECTION_TYPE)};
	// The contributor of the datasets the user added, which have Edit Facts
	const WORKSPACE_SOURCE = ${JSON.stringify(WORKSPACE_SOURCE)};
	// The seasonal period and the horizon a frequency starts with, those of the M4 Competition where it has them
	const PERIODS = { 'sub-hourly': 1, hourly: 24, daily: 7, weekly: 52, monthly: 12, quarterly: 4, yearly: 1 };
	const HORIZONS = { 'sub-hourly': 48, hourly: 48, daily: 14, weekly: 13, monthly: 18, quarterly: 8, yearly: 6 };
	${ONE_BLUE_BUTTON_JS}
	${rowsChoiceScript()}
	${stickyHeadScript()}
	${sortHeadingsScript()}
	// The fields with a menu of values in the filters, those of them the schema declares
	const FILTER_FIELDS = ['type', 'domain', 'era', 'frequency', 'forecast_type', 'package', 'delivery', 'status', 'course_level', 'size_class'];
	// Text too long for a cell: two lines of it there, all of it in the details
	const LONG_FIELDS = ['reference', 'teaches', 'pitfalls', 'notes'];
	// The column of the Curation view that counts the fields an entry does not have
	const MISSING = '#missing';
	const CURATION = 'curation';
	// The first column of the tab Datasets, the tick that makes a dataset active, and the column after it, whether the
	// dataset is saved in the workspace
	const ACTIVE = '#active';
	const WORKSPACE = '#workspace';

	let catalogue;
	let papers = {};
	let competitions = [];
	let viewId = '';
	let filters = {};
	let sortField = 'name';
	let sortDescending = false;
	let userSorted = false;
	let page = 0;
	let rows = ${rows};
	let opened = '';
	let tab = 'datasets';
	let active = new Set();
	// Whether a Pollis Workspace is open; the status of each dataset saved there, by id; whether each dataset is on
	// this computer, by id; and the datasets being downloaded to be saved
	let workspace = false;
	let saved = {};
	let downloaded = {};
	let pending = [];
	// Whether the band of controls stays above the table already
	let stuck = false;
	// The form shown, as the page sent it: its mode, add or edit, its file, columns and first rows, and its values
	let form;
	// The field chosen in Filter by, whose values are shown to tick, or '' for None
	let filterField = '';

	const viewSelect = document.getElementById('view');
	const filterSelect = document.getElementById('filterField');
	// Expand and Restore Size: corners pointing out, and in
	const EXPAND_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>';
	const RESTORE_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5"/></svg>';

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = String(content); }
		return node;
	}
	function format(template, ...values) {
		return values.reduce((result, value, index) => result.split('{' + index + '}').join(String(value)), template);
	}
	function field(name) {
		return catalogue.fields.find(candidate => candidate.name === name);
	}
	function view() {
		return catalogue.views.find(candidate => candidate.id === viewId) || catalogue.views[0];
	}
	// A value of a controlled field as the page shows it, its underscores as spaces
	function shownValue(name, value) {
		const declared = field(name);
		return declared && declared.values.length ? String(value).split('_').join(' ') : String(value);
	}
	function valuesOf(entry, name) {
		const value = entry[name];
		return value === undefined ? [] : Array.isArray(value) ? value : [String(value)];
	}
	function missingOf(entry) {
		return catalogue.fields.filter(candidate => entry[candidate.name] === undefined);
	}
	function entryName(id) {
		const entry = catalogue.entries.find(candidate => candidate.id === id);
		return entry ? entry.name : id;
	}
	// Whether Score Forecasting Models scores the entry: a competition it downloads, or a dataset the user added
	function canScore(entry) {
		return canOpen(entry) || entry.source === WORKSPACE_SOURCE;
	}
	function canOpen(entry) {
		return entry.package === 'PollisCompetitions' && entry.status === 'implemented' && competitions.includes(entry.package_id);
	}
	function inTab(entry) {
		return (entry.type === COLLECTION) === (tab === 'collections');
	}

	function matches(entry) {
		if (!inTab(entry)) {
			return false;
		}
		return Object.entries(filters).every(([name, chosen]) => !chosen.length || valuesOf(entry, name).some(value => chosen.includes(value)));
	}
	function sortValue(entry, name) {
		if (name === MISSING) {
			return missingOf(entry).length;
		}
		const value = entry[name];
		if (value === undefined) {
			return undefined;
		}
		if (Array.isArray(value)) {
			return value.join(', ').toLowerCase();
		}
		if (typeof value === 'boolean') {
			return value ? 1 : 0;
		}
		return typeof value === 'string' ? value.toLowerCase() : value;
	}
	// The entries without the value come last, in either order
	function compare(a, b) {
		const x = sortValue(a, sortField);
		const y = sortValue(b, sortField);
		if (x === undefined || y === undefined) {
			return x === y ? a.name.localeCompare(b.name) : x === undefined ? 1 : -1;
		}
		const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
		return (sortDescending ? -order : order) || a.name.localeCompare(b.name);
	}

	function tag(name, value) {
		const button = element('button', 'tag', shownValue(name, value));
		button.dataset.field = name;
		button.dataset.value = value;
		button.title = TEXT.addFilter;
		return button;
	}
	function link(url, label) {
		const button = element('button', 'link', label);
		button.dataset.url = url;
		button.title = url;
		return button;
	}
	function hostOf(url) {
		try {
			return new URL(url).hostname.replace(/^www[.]/, '');
		} catch {
			return url;
		}
	}
	// A value in a cell or in the details: links, tags, entries' names, Yes or No, numbers or text; an absent value leaves it empty
	function fill(node, entry, name, inCell) {
		const value = entry[name];
		const declared = field(name);
		if (value === undefined || !declared) {
			return;
		}
		if (name === 'url') {
			node.appendChild(link(value, inCell ? hostOf(value) : value));
		} else if (name === 'doi') {
			node.appendChild(link('https://doi.org/' + value, value));
		} else if (name === 'parent' || name === 'related' || name === 'collections') {
			node.textContent = valuesOf(entry, name).map(entryName).join(', ');
		} else if (name === 'papers' && !inCell) {
			for (const key of value) {
				const paper = papers[key];
				const line = node.appendChild(element('div', 'paper', paper ? paper.authors + ' (' + paper.year + '). ' + paper.title + (paper.journal ? '. ' + paper.journal : '') + '. ' : key));
				if (paper && (paper.doi || paper.url)) {
					line.appendChild(link(paper.doi ? 'https://doi.org/' + paper.doi : paper.url, paper.doi || hostOf(paper.url)));
				}
			}
		} else if (Array.isArray(value)) {
			for (const item of value) {
				node.appendChild(tag(name, item));
			}
		} else if (declared.values.length) {
			node.appendChild(tag(name, value));
		} else if (typeof value === 'boolean') {
			node.textContent = value ? TEXT.yes : TEXT.no;
		} else if (typeof value === 'number') {
			// A year as it is written, other numbers with their thousands grouped
			node.textContent = /_year$/.test(name) ? String(value) : value.toLocaleString();
		} else if (inCell && LONG_FIELDS.includes(name)) {
			const span = node.appendChild(element('span', 'long', value));
			span.title = value;
		} else {
			node.textContent = value;
		}
	}

	function columns() {
		const current = view();
		return [ACTIVE, ...(tab === 'datasets' ? [WORKSPACE] : []), current.pinned[0] || 'name', ...current.columns.filter(name => !current.pinned.includes(name)), ...(current.id === CURATION ? [MISSING] : [])];
	}
	function drawHead() {
		const head = document.getElementById('head');
		head.textContent = '';
		for (const name of columns()) {
			if (name === ACTIVE) {
				// In the tab Curated Collections, the column holds Expand only, under no heading
				const heading = head.appendChild(element('th', 'activeCell', tab === 'datasets' ? TEXT.active : ''));
				heading.title = tab === 'datasets' ? TEXT.activeHint : '';
				continue;
			}
			if (name === WORKSPACE) {
				head.appendChild(element('th', '', TEXT.workspace)).title = TEXT.workspaceHint;
				continue;
			}
			const heading = element('th', 'sortable' + (name === MISSING || (field(name) && field(name).type === 'integer') ? ' number' : ''));
			heading.dataset.sort = name;
			heading.dataset.label = name === MISSING ? TEXT.missing : field(name).label;
			heading.title = name === MISSING ? TEXT.missingHint : field(name).description + '. ' + TEXT.sortHint;
			setSortArrow(heading, heading.dataset.label, name === sortField, sortDescending);
			head.appendChild(heading);
		}
	}
	function entryRow(entry, names) {
		const row = element('tr', 'entryRow' + (entry.id === opened ? ' opened' : ''));
		row.dataset.id = entry.id;
		const first = names.find(name => name !== ACTIVE && name !== WORKSPACE);
		for (const name of names) {
			const cell = element('td');
			if (name === ACTIVE) {
				// The tick of any dataset, and under it Expand, or Restore Size when the row is expanded
				cell.className = 'activeCell';
				if (tab === 'datasets') {
					const tick = cell.appendChild(element('input', 'activeTick'));
					tick.type = 'checkbox';
					tick.dataset.id = entry.id;
					tick.checked = active.has(entry.id);
					tick.title = canScore(entry) ? TEXT.activeHint : TEXT.notScored;
				}
				const expand = cell.appendChild(element('button', 'expand'));
				expand.dataset.expand = entry.id;
				expand.innerHTML = entry.id === opened ? RESTORE_ICON : EXPAND_ICON;
				expand.title = entry.id === opened ? TEXT.restore : TEXT.expand;
				expand.setAttribute('aria-label', expand.title);
				expand.setAttribute('aria-expanded', String(entry.id === opened));
			} else if (name === WORKSPACE) {
				drawWorkspace(cell, entry);
			} else if (name === first) {
				// The pinned fields: the first as the row's name, the others as tags under it
				cell.className = 'nameCell';
				cell.appendChild(element('div', 'name', entry[name] === undefined ? '' : entry[name]));
				const pinned = cell.appendChild(element('div', 'pinnedTags'));
				for (const other of view().pinned.slice(1)) {
					fill(pinned, entry, other, true);
				}
			} else if (name === MISSING) {
				const missing = missingOf(entry);
				cell.className = 'number';
				cell.textContent = missing.length;
				cell.title = missing.map(candidate => candidate.label).join(', ');
			} else {
				if (field(name).type === 'integer') {
					cell.className = 'number';
				}
				fill(cell, entry, name, true);
			}
			row.appendChild(cell);
		}
		return row;
	}
	// Whether the dataset is saved in the workspace; nothing for one Pollis cannot download
	function drawWorkspace(cell, entry) {
		const [status, label, hint] = !canOpen(entry) && entry.source !== WORKSPACE_SOURCE ? ['', '', '']
			: !workspace ? ['none', TEXT.noWorkspace, TEXT.noWorkspaceHint]
				: pending.includes(entry.id) ? ['downloading', TEXT.downloading, TEXT.downloadingHint]
					: saved[entry.id] === 'saved' ? ['saved', TEXT.saved, TEXT.savedHint]
						: saved[entry.id] === 'changed' ? ['changed', TEXT.changed, TEXT.changedHint]
							: ['none', TEXT.notSaved, downloaded[entry.id] ? TEXT.notSavedHint : TEXT.notDownloadedHint];
		cell.className = 'workspaceCell' + (status ? ' ' + status : '');
		cell.textContent = label;
		cell.title = hint;
	}
	// Every field the entry has, group by group in the order of the schema, each group under the label of its view
	function detailsRow(entry, span) {
		const row = element('tr', 'detailsRow');
		const cell = row.appendChild(element('td'));
		cell.colSpan = span;
		const details = cell.appendChild(element('div', 'details'));
		if (canOpen(entry)) {
			const bar = details.appendChild(element('div', 'bar'));
			const save = bar.appendChild(element('button', 'action current', TEXT.saveToWorkspace));
			save.dataset.save = entry.id;
			save.disabled = pending.includes(entry.id);
			const open = bar.appendChild(element('button', 'action', TEXT.openCompetition));
			open.dataset.competition = entry.id;
		} else if (entry.source === WORKSPACE_SOURCE) {
			const bar = details.appendChild(element('div', 'bar'));
			bar.appendChild(element('button', 'action current', TEXT.editFacts)).dataset.edit = entry.id;
			bar.appendChild(element('button', 'action', TEXT.openCompetition)).dataset.competition = entry.id;
		}
		if (entry.type === COLLECTION) {
			const held = catalogue.entries.filter(other => valuesOf(other, 'collections').includes(entry.id));
			if (held.length) {
				details.appendChild(element('h3', '', TEXT.inCollection));
				details.appendChild(element('div', '', held.map(other => other.name).join(', ')));
			}
		}
		const groups = [...new Set(catalogue.fields.map(candidate => candidate.group))];
		for (const group of groups) {
			const shown = catalogue.fields.filter(candidate => candidate.group === group && candidate.name !== 'verify' && entry[candidate.name] !== undefined);
			if (!shown.length) {
				continue;
			}
			const groupView = catalogue.views.find(candidate => candidate.id === group);
			details.appendChild(element('h3', '', groupView ? groupView.label : group));
			const list = details.appendChild(element('dl'));
			for (const declared of shown) {
				list.appendChild(element('dt', '', declared.label));
				fill(list.appendChild(element('dd')), entry, declared.name, false);
			}
		}
		const toCheck = valuesOf(entry, 'verify');
		if (toCheck.length) {
			details.appendChild(element('h3', '', TEXT.toCheck));
			details.appendChild(element('div', 'hint', TEXT.toCheckHint));
			const list = details.appendChild(element('ul', 'toCheck'));
			for (const fact of toCheck) {
				const declared = field(fact);
				list.appendChild(element('li', '', declared ? declared.label : fact.split('_').join(' ')));
			}
		}
		return row;
	}

	// Filter by: None, a separator, then each controlled field, made when the catalogue comes
	function buildFilters() {
		filterSelect.textContent = '';
		filterSelect.appendChild(element('option', '', TEXT.none)).value = '';
		filterSelect.appendChild(element('hr'));
		for (const name of FILTER_FIELDS) {
			const declared = field(name);
			if (declared && declared.values.length) {
				const option = filterSelect.appendChild(element('option', '', declared.label));
				option.value = name;
				option.title = declared.description;
			}
		}
		if (!field(filterField)) {
			filterField = '';
		}
		filterSelect.value = filterField;
	}
	// The fields of Filter by with the number of their values ticked, and the values of the field chosen, each with
	// the number of entries of the tab that have it; then a chip for each value ticked, of any field
	function drawFilters() {
		for (const option of filterSelect.options) {
			if (option.value) {
				const chosen = filters[option.value] || [];
				option.textContent = field(option.value).label + (chosen.length ? ' (' + chosen.length + ')' : '');
			}
		}
		const values = document.getElementById('filterValues');
		values.textContent = '';
		values.hidden = !filterField;
		if (filterField) {
			const chosen = filters[filterField] || [];
			for (const value of field(filterField).values) {
				const count = catalogue.entries.filter(entry => inTab(entry) && valuesOf(entry, filterField).includes(value)).length;
				const option = values.appendChild(element('label'));
				const tick = option.appendChild(element('input'));
				tick.type = 'checkbox';
				tick.dataset.field = filterField;
				tick.dataset.value = value;
				tick.checked = chosen.includes(value);
				option.append(shownValue(filterField, value));
				option.appendChild(element('span', 'number', count));
			}
		}
		const chips = document.getElementById('chips');
		chips.textContent = '';
		for (const [name, chosen] of Object.entries(filters)) {
			for (const value of chosen) {
				const chip = chips.appendChild(element('button', 'chip', field(name).label + ': ' + shownValue(name, value) + ' \\u00d7'));
				chip.dataset.field = name;
				chip.dataset.value = value;
				chip.title = TEXT.removeFilter;
			}
		}
		document.getElementById('clearFilters').hidden = !Object.keys(filters).length;
	}
	function setFilter(name, value, on) {
		const chosen = (filters[name] || []).filter(other => other !== value);
		if (on) {
			chosen.push(value);
		}
		if (chosen.length) {
			filters[name] = chosen;
		} else {
			delete filters[name];
		}
		page = 0;
		render();
	}

	function fillPager(shown, pages) {
		const pager = document.getElementById('pager');
		pager.textContent = '';
		pager.hidden = shown <= ${FEWEST_ROWS};
		if (pages > 1) {
			const turn = (label, to) => {
				const button = element('button', 'link', label);
				button.disabled = to < 0 || to >= pages;
				button.addEventListener('click', () => { page = to; render(); });
				return button;
			};
			pager.append(turn(TEXT.previous, page - 1), element('span', '', format(TEXT.page, page + 1, pages)), turn(TEXT.next, page + 1));
		}
		pager.append(rowsChoice(rows, chosen => {
			page = firstPageAfter(page, rows, chosen);
			rows = chosen;
			vscode.postMessage({ command: 'rows', rows });
			render();
		}));
	}

	// Shows the entry \`id\` with its details open, in its tab, on its page, with no filter hiding it
	function reveal(id) {
		const entry = catalogue && catalogue.entries.find(candidate => candidate.id === id);
		if (!entry || !view()) {
			return;
		}
		tab = entry.type === COLLECTION ? 'collections' : 'datasets';
		for (const button of document.querySelectorAll('#tabs > button.toggle-btn')) {
			button.classList.toggle('active', button.dataset.tab === tab);
		}
		filters = {};
		const shown = catalogue.entries.filter(matches).sort(compare);
		page = Math.max(0, Math.floor(shown.indexOf(entry) / rowsPerPage(rows, shown.length)));
		opened = id;
		render();
		const button = document.querySelector('button[data-expand="' + CSS.escape(id) + '"]');
		if (button) {
			button.scrollIntoView({ block: 'center' });
		}
	}

	function render() {
		// A catalogue with no view has nothing to show but its problems
		if (!catalogue || !view()) {
			return;
		}
		drawHead();
		drawFilters();
		const shown = catalogue.entries.filter(matches).sort(compare);
		const size = rowsPerPage(rows, shown.length);
		const pages = Math.max(1, Math.ceil(shown.length / size));
		page = Math.min(page, pages - 1);
		const names = columns();
		const body = document.getElementById('rows');
		body.textContent = '';
		for (const entry of shown.slice(page * size, (page + 1) * size)) {
			body.appendChild(entryRow(entry, names));
			if (entry.id === opened) {
				body.appendChild(detailsRow(entry, names.length));
			}
		}
		fillPager(shown.length, pages);
		document.getElementById('count').textContent = format(TEXT.count, shown.length, catalogue.entries.filter(inTab).length);
		drawActive();
		document.getElementById('table').hidden = !shown.length;
		const note = document.getElementById('note');
		note.hidden = !!shown.length;
		note.textContent = TEXT.noMatch;
	}

	// The row of Score Active Datasets, in the tab Datasets only: the button, and how many datasets are active
	function drawActive() {
		document.getElementById('scoreRow').hidden = tab !== 'datasets';
		document.getElementById('score').disabled = !active.size;
		document.getElementById('saveActive').disabled = !active.size;
		const scored = catalogue.entries.filter(entry => active.has(entry.id) && canScore(entry)).length;
		document.getElementById('activeCount').textContent = active.size ? format(TEXT.activeCount, active.size, scored) : TEXT.noneActive;
	}

	// The column of the file whose name matches the pattern, or else whose type matches the types, not one already taken
	function guessColumn(pattern, types, taken) {
		const free = form.columns.filter(column => !taken.includes(column.name));
		const found = free.find(column => pattern.test(column.name)) || free.find(column => types.test(column.type)) || free[0];
		return found ? found.name : '';
	}
	function idOf(name) {
		const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
		return /^[a-z]/.test(id) ? id : 'dataset_' + id;
	}
	// The form of a dataset of the user's own: its file and first rows, then its columns and facts
	function drawForm() {
		const box = document.getElementById('addForm');
		box.textContent = '';
		box.hidden = !form;
		if (!form) {
			return;
		}
		const values = form.values || {};
		box.appendChild(element('h3', '', form.mode === 'add' ? TEXT.addHeading : TEXT.editHeading));
		// A dataset being added starts with no file: Choose File... asks for it, and its columns and first rows come back
		if (form.mode === 'add') {
			box.appendChild(element('div', 'hint', TEXT.formNeeds));
			const fileRow = box.appendChild(element('div', 'fileRow'));
			fileRow.appendChild(element('button', 'action', TEXT.formChoose)).id = 'formChoose';
			fileRow.appendChild(element('span', form.file ? '' : 'none', form.file ? form.fileName : TEXT.formNoFile));
		}
		if (form.file) {
			box.appendChild(element('div', 'hint', format(TEXT.formFile, form.fileName, form.rows)));
			const preview = box.appendChild(element('table', 'preview'));
			const headRow = preview.appendChild(element('tr'));
			for (const column of form.columns) {
				headRow.appendChild(element('th', '', column.name)).title = column.type;
			}
			for (const row of form.preview) {
				const line = preview.appendChild(element('tr'));
				for (const column of form.columns) {
					line.appendChild(element('td', '', row[column.name] === null || row[column.name] === undefined ? '' : String(row[column.name])));
				}
			}
		}
		const grid = box.appendChild(element('div', 'formGrid'));
		const add = (label, control, hint) => {
			const heading = grid.appendChild(element('label', '', label));
			if (hint) {
				heading.title = hint;
				control.title = hint;
			}
			grid.appendChild(control);
			return control;
		};
		const input = (id, value, type) => {
			const control = element('input');
			control.id = id;
			control.type = type || 'text';
			control.value = value === undefined ? '' : value;
			control.spellcheck = false;
			return control;
		};
		const select = (id, options, value) => {
			const control = element('select');
			control.id = id;
			for (const option of options) {
				control.appendChild(element('option', '', option)).value = option;
			}
			control.value = value;
			return control;
		};
		const name = add(TEXT.formName, input('formName', values.name));
		const id = add(TEXT.formId, input('formId', values.id), TEXT.formIdHint);
		id.readOnly = form.mode === 'edit';
		// The id follows the name until it is edited
		let idEdited = form.mode === 'edit' || (!!values.id && values.id !== idOf(values.name || ''));
		id.addEventListener('input', () => { idEdited = true; });
		name.addEventListener('input', () => {
			if (!idEdited) {
				id.value = idOf(name.value);
			}
		});
		const names = form.columns.map(column => column.name);
		const seriesColumn = values.seriesColumn || guessColumn(/series|unique_id|^id$|item|store|key|name/i, /VARCHAR/, []);
		const timeColumn = values.timeColumn || guessColumn(/date|time|^ds$|period|^t$|year|month/i, /DATE|TIME/, [seriesColumn]);
		const valueColumn = values.valueColumn || guessColumn(/value|^y$|sales|demand|target|count/i, /DOUBLE|FLOAT|INT|DECIMAL/, [seriesColumn, timeColumn]);
		for (const [label, id, value, hint] of [[TEXT.formSeries, 'formSeries', seriesColumn, TEXT.formSeriesHint], [TEXT.formTime, 'formTime', timeColumn, TEXT.formTimeHint], [TEXT.formValue, 'formValue', valueColumn, TEXT.formValueHint]]) {
			// Empty until the file is chosen
			add(label, select(id, names, value), hint).disabled = !names.length;
		}
		const frequencies = field('frequency') ? field('frequency').values : [];
		const frequency = add(TEXT.formFrequency, select('formFrequency', frequencies, values.frequency || 'monthly'), field('frequency') ? field('frequency').description : '');
		const period = add(TEXT.formPeriod, input('formPeriod', values.period || PERIODS[frequency.value] || 1, 'number'), TEXT.formPeriodHint);
		const horizon = add(TEXT.formHorizon, input('formHorizon', values.horizon || HORIZONS[frequency.value] || 1, 'number'), TEXT.formHorizonHint);
		period.min = 1;
		horizon.min = 1;
		frequency.addEventListener('change', () => {
			period.value = PERIODS[frequency.value] || 1;
			horizon.value = HORIZONS[frequency.value] || 1;
		});
		const domains = field('domain') ? field('domain').values : [];
		add(TEXT.formDomain, select('formDomain', domains, values.domain || 'general'), field('domain') ? field('domain').description : '');
		add(TEXT.formLicence, input('formLicence', values.licence), TEXT.formLicenceHint);
		add(TEXT.formNotes, input('formNotes', values.notes), TEXT.formNotesHint);
		box.appendChild(element('ul', 'formProblems')).id = 'formProblems';
		const bar = box.appendChild(element('div', 'bar'));
		const submit = bar.appendChild(element('button', 'action current', form.mode === 'add' ? TEXT.addToWorkspace : TEXT.convertAgain));
		submit.id = 'formSubmit';
		submit.disabled = !form.file;
		bar.appendChild(element('button', 'action', TEXT.cancel)).id = 'formCancel';
		box.appendChild(element('div', 'hint', '')).id = 'formStatus';
	}
	function formValue(id) {
		return document.getElementById(id).value;
	}
	// The facts typed so far, kept when the form is drawn again for the file chosen; the columns are those of the new file
	function typedValues() {
		return {
			name: formValue('formName'), id: formValue('formId'), frequency: formValue('formFrequency'), period: Number(formValue('formPeriod')),
			horizon: Number(formValue('formHorizon')), domain: formValue('formDomain'), licence: formValue('formLicence'), notes: formValue('formNotes'),
		};
	}
	function showFormProblems(problems) {
		const list = document.getElementById('formProblems');
		if (!list) {
			return;
		}
		list.textContent = '';
		for (const problem of problems) {
			list.appendChild(element('li', '', problem));
		}
		document.getElementById('formSubmit').disabled = !form.file;
		document.getElementById('formStatus').textContent = '';
	}

	function showProblems(problems, error) {
		const box = document.getElementById('problems');
		box.textContent = '';
		box.hidden = !error && !problems.length;
		if (error) {
			box.textContent = format(TEXT.unreadable, error);
			return;
		}
		box.appendChild(element('div', '', TEXT.problems));
		const list = box.appendChild(element('ul'));
		for (const problem of problems) {
			list.appendChild(element('li', '', problem));
		}
	}

	viewSelect.addEventListener('change', () => {
		viewId = viewSelect.value;
		// The Curation view sorts by the fields missing, unless the rows were sorted by a column of the user's choice
		if (!userSorted) {
			sortField = viewId === CURATION ? MISSING : 'name';
			sortDescending = viewId === CURATION;
		} else if (sortField === MISSING && viewId !== CURATION) {
			sortField = 'name';
			sortDescending = false;
		}
		render();
	});
	filterSelect.addEventListener('change', () => {
		filterField = filterSelect.value;
		render();
	});
	document.getElementById('filterValues').addEventListener('change', event => {
		const box = event.target;
		if (box.dataset && box.dataset.field) {
			setFilter(box.dataset.field, box.dataset.value, box.checked);
		}
	});
	document.getElementById('rows').addEventListener('change', event => {
		const tick = event.target;
		if (tick.classList && tick.classList.contains('activeTick')) {
			if (tick.checked) {
				active.add(tick.dataset.id);
			} else {
				active.delete(tick.dataset.id);
			}
			vscode.postMessage({ command: 'active', ids: [...active] });
			drawActive();
		}
	});
	// What Score Competition Models or a save did, under the buttons until the next of them; the folders it names in yellow
	function showNotice(text, paths) {
		const box = document.getElementById('notice');
		box.textContent = '';
		let rest = text || '';
		while (rest) {
			// The first folder named in what is left, the longest when two start there (m1 and m10)
			let at = -1;
			let found = '';
			for (const path of paths || []) {
				const index = rest.indexOf(path);
				if (index >= 0 && (at < 0 || index < at || (index === at && path.length > found.length))) {
					at = index;
					found = path;
				}
			}
			if (at < 0) {
				box.appendChild(document.createTextNode(rest));
				break;
			}
			box.appendChild(document.createTextNode(rest.slice(0, at)));
			box.appendChild(element('span', 'yellow', found));
			rest = rest.slice(at + found.length);
		}
	}
	document.getElementById('score').addEventListener('click', () => {
		showNotice('');
		vscode.postMessage({ command: 'score', ids: [...active] });
	});
	document.getElementById('saveActive').addEventListener('click', () => {
		showNotice('');
		vscode.postMessage({ command: 'save', ids: [...active] });
	});
	document.getElementById('addDataset').addEventListener('click', () => {
		vscode.postMessage({ command: 'add' });
	});
	document.getElementById('addForm').addEventListener('click', event => {
		if (event.target.id === 'formCancel') {
			form = undefined;
			drawForm();
		} else if (event.target.id === 'formChoose') {
			vscode.postMessage({ command: 'chooseFile' });
		} else if (event.target.id === 'formSubmit') {
			showFormProblems([]);
			vscode.postMessage({ command: 'convert', form: {
				mode: form.mode, file: form.file, id: formValue('formId').trim(), name: formValue('formName'), domain: formValue('formDomain'),
				seriesColumn: formValue('formSeries'), timeColumn: formValue('formTime'), valueColumn: formValue('formValue'),
				frequency: formValue('formFrequency'), period: Number(formValue('formPeriod')), horizon: Number(formValue('formHorizon')),
				licence: formValue('formLicence'), notes: formValue('formNotes'),
			} });
		}
	});
	document.getElementById('tabs').addEventListener('click', event => {
		const button = event.target.closest('button.toggle-btn');
		if (!button || button.dataset.tab === tab) {
			return;
		}
		tab = button.dataset.tab;
		for (const other of document.querySelectorAll('#tabs > button.toggle-btn')) {
			other.classList.toggle('active', other === button);
		}
		page = 0;
		opened = '';
		render();
	});
	document.getElementById('head').addEventListener('click', event => {
		const heading = event.target.closest('th.sortable');
		if (!heading) {
			return;
		}
		if (heading.dataset.sort === sortField) {
			sortDescending = !sortDescending;
		} else {
			sortField = heading.dataset.sort;
			sortDescending = sortField === MISSING;
		}
		userSorted = true;
		render();
	});
	document.addEventListener('click', event => {
		const target = event.target;
		// Expand and Restore Size alone open and close the details of a row
		const expand = target.closest('button[data-expand]');
		if (expand) {
			opened = opened === expand.dataset.expand ? '' : expand.dataset.expand;
			render();
			return;
		}
		const tagButton = target.closest('button.tag');
		const chip = target.closest('button.chip');
		const linkButton = target.closest('button[data-url]');
		const open = target.closest('button[data-competition]');
		const save = target.closest('button[data-save]');
		const edit = target.closest('button[data-edit]');
		if (tagButton) {
			setFilter(tagButton.dataset.field, tagButton.dataset.value, true);
		} else if (chip) {
			setFilter(chip.dataset.field, chip.dataset.value, false);
		} else if (linkButton) {
			vscode.postMessage({ command: 'link', url: linkButton.dataset.url });
		} else if (open) {
			vscode.postMessage({ command: 'competition', id: open.dataset.competition });
		} else if (save) {
			showNotice('');
			vscode.postMessage({ command: 'save', ids: [save.dataset.save] });
		} else if (edit) {
			vscode.postMessage({ command: 'edit', id: edit.dataset.edit });
		} else if (target.id === 'clearFilters') {
			filters = {};
			page = 0;
			render();
		}
	});
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'form') {
			form = message;
			drawForm();
			window.scrollTo(0, 0);
			return;
		}
		if (message.command === 'formFile' && form) {
			form = { ...form, file: message.file, fileName: message.fileName, columns: message.columns, rows: message.rows, preview: message.preview, values: typedValues() };
			drawForm();
			return;
		}
		if (message.command === 'formProblems') {
			showFormProblems(message.problems);
			return;
		}
		if (message.command === 'formBusy' && form) {
			document.getElementById('formSubmit').disabled = true;
			document.getElementById('formStatus').textContent = TEXT.converting;
			return;
		}
		if (message.command === 'notice') {
			showNotice(message.text, message.paths);
			return;
		}
		if (message.command === 'formDone') {
			// The dataset added, or converted again, opened in the table once the state comes
			form = undefined;
			drawForm();
			opened = message.id;
			return;
		}
		if (message.command === 'reveal') {
			reveal(message.id);
			return;
		}
		if (message.command !== 'state') {
			return;
		}
		if (message.error) {
			showProblems([], message.error);
			return;
		}
		catalogue = message.catalogue;
		papers = message.papers;
		competitions = message.competitions;
		active = new Set(message.active || []);
		workspace = !!message.workspace;
		saved = message.saved || {};
		downloaded = message.downloaded || {};
		pending = message.pending || [];
		showProblems(message.problems);
		viewSelect.textContent = '';
		for (const candidate of catalogue.views) {
			const option = viewSelect.appendChild(element('option', '', candidate.label));
			option.value = candidate.id;
		}
		viewId = view() ? view().id : '';
		viewSelect.value = viewId;
		// The state comes again whenever a dataset is downloaded or saved: Filter by keeps the field chosen
		buildFilters();
		render();
		if (!stuck) {
			stuck = true;
			stickBand(document.getElementById('band'), document.getElementById('table'));
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: FORECASTING_CATALOGUE_COMMAND_ID, title: localize2('forecastingCatalogue.action', "Manage Competition Datasets..."), category: localize2('forecastingCatalogue.category', "Competitions"), f1: true });
	}
	run(accessor: ServicesAccessor, entryId?: unknown): Promise<void> {
		return openForecastingCataloguePage(accessor, typeof entryId === 'string' ? entryId : undefined);
	}
});
