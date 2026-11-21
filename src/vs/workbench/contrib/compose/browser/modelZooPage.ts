/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IModelPaper } from '../../model/browser/common/model.types.js';
import { ReferenceLibrary, referencePaper } from '../../model/browser/common/referenceLibrary.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { openInBrowser } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { MODELZOO_METADATA } from '../../model/browser/webviews/modelZoo.data.js';
import { FEWEST_ROWS, rowsChoiceCss, rowsChoiceScript, sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss, stickyHeadScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { POLLIS_COMPETITIONS_DATASETS_PATH } from './forecastingCatalogue.js';
import { juliaPackageFolder, projectVersion } from './juliaPackages.js';

// Compose > Prediction Challenges > Model Zoo, in the Minimal style of the scaffold: the Model Catalog of
// PollisCompetitions.jl, a row for each model that a benchmark or competition of the package scored, with the
// benchmarks and competitions that scored it and on how many datasets, the package and language it was run in, and
// where it is in Julia: the registered package that has its estimator, and whether that package was checked to give
// the published scores. The page reads the files of the installed package, metadata/models.toml, benchmarks.toml and
// datasets.toml, each time it loads.

/** The command that opens the Model Zoo. */
export const MODEL_ZOO_COMMAND_ID = 'pollis.competitions.modelZoo';

/** The name of the page for the rows the user chose (webviewPager.ts). */
const ROWS_PAGE = 'modelZoo';

const MODELS_PATH = 'metadata/models.toml';
const BENCHMARKS_PATH = 'metadata/benchmarks.toml';

type ModelZooMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'link'; readonly url: string };

/** A paper of a model, by its key in PollisReferences, and its role: Methodology, Software or Other. */
interface IModelReference {
	readonly key: string;
	readonly role: string;
}

/** A model of the Model Catalog, as the page shows it. */
interface IZooModel {
	readonly id: string;
	readonly name: string;
	readonly family: string;
	readonly method: string;
	readonly package?: string;
	readonly language?: string;
	/** The registered Julia package that has its estimator, without `.jl`; none when no package has it. */
	readonly julia?: string;
	/** Whether that package, run on the benchmark's splits, gives the published scores. */
	readonly checked?: boolean;
	readonly references: readonly IModelReference[];
	/** The benchmarks and competitions that scored it, as the split protocols of its runs name them. */
	readonly scoredIn: readonly string[];
	/** The ids of the datasets it was scored on. */
	readonly datasets: readonly string[];
}

function text(value: unknown): string | undefined {
	return typeof value === 'string' && value ? value : undefined;
}

/** The tables of an array of tables of a TOML file, none when it has none. */
function tables(value: unknown): TomlValue[] {
	return Array.isArray(value) ? value.filter((item): item is TomlValue => typeof item === 'object' && item !== null && !Array.isArray(item)) : [];
}

/**
 * The model, dataset and split protocol of each run of benchmarks.toml. The file is long, written by the package
 * with one key to a line, so its lines are read in place of the whole TOML.
 */
function readRuns(content: string): { model: string; dataset: string; protocol: string }[] {
	const runs: { model: string; dataset: string; protocol: string }[] = [];
	let run: { model?: string; dataset?: string; protocol?: string } | undefined;
	const close = () => {
		if (run?.model && run.dataset && run.protocol) {
			runs.push({ model: run.model, dataset: run.dataset, protocol: run.protocol });
		}
	};
	for (const line of content.split('\n')) {
		if (line.startsWith('[[runs]]')) {
			close();
			run = {};
			continue;
		}
		const match = /^(?<key>model_id|dataset_id|split_protocol) = (?<value>"(?:[^"\\]|\\.)*")\s*$/.exec(line);
		if (run && match?.groups) {
			const value: unknown = JSON.parse(match.groups.value);
			if (typeof value === 'string') {
				if (match.groups.key === 'model_id') {
					run.model = value;
				} else if (match.groups.key === 'dataset_id') {
					run.dataset = value;
				} else {
					run.protocol = value;
				}
			}
		}
	}
	close();
	return runs;
}

/** The benchmark or competition a split protocol names, before its colon. */
function scoredIn(protocol: string): string {
	const colon = protocol.indexOf(':');
	return (colon < 0 ? protocol : protocol.slice(0, colon)).trim();
}

/** The models of the Model Catalog of the package in `folder`, with the runs that scored them, and the names of the datasets. */
async function readZoo(fileService: IFileService, folder: URI): Promise<{ models: IZooModel[]; datasetNames: Record<string, string> }> {
	const read = async (path: string) => (await fileService.readFile(joinPath(folder, path))).value.toString();
	const [modelsToml, benchmarksToml, datasetsToml] = await Promise.all([read(MODELS_PATH), read(BENCHMARKS_PATH), read(POLLIS_COMPETITIONS_DATASETS_PATH)]);

	const datasetNames: Record<string, string> = {};
	for (const dataset of tables(parseToml(datasetsToml).datasets)) {
		const id = text(dataset.dataset_id);
		if (id) {
			datasetNames[id] = text(dataset.dataset_name) ?? id;
		}
	}

	const scored = new Map<string, { scoredIn: Set<string>; datasets: Set<string> }>();
	for (const run of readRuns(benchmarksToml)) {
		let entry = scored.get(run.model);
		if (!entry) {
			entry = { scoredIn: new Set(), datasets: new Set() };
			scored.set(run.model, entry);
		}
		entry.scoredIn.add(scoredIn(run.protocol));
		entry.datasets.add(run.dataset);
	}

	const models: IZooModel[] = [];
	for (const entry of tables(parseToml(modelsToml).models)) {
		const id = text(entry.model_id);
		if (!id) {
			continue;
		}
		const references = tables(entry.references).flatMap(reference => {
			const key = text(reference.bibtex_key);
			return key ? [{ key, role: text(reference.role) ?? '' }] : [];
		});
		const runs = scored.get(id);
		models.push({
			id,
			name: text(entry.model_name) ?? id,
			family: text(entry.estimator_family) ?? '',
			method: text(entry.estimator_method) ?? '',
			package: text(entry.package),
			language: text(entry.language),
			julia: text(entry.julia_package),
			checked: typeof entry.julia_checked === 'boolean' ? entry.julia_checked : undefined,
			references,
			scoredIn: runs ? [...runs.scoredIn].sort() : [],
			datasets: runs ? [...runs.datasets].sort() : [],
		});
	}
	return { models, datasetNames };
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Model Zoo, or shows it again when it is open. */
async function openModelZooPage(accessor: ServicesAccessor): Promise<void> {
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

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('modelZoo.title', "Model Zoo");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.modelZoo',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, ROWS_PAGE, 40)));
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'modelZoo', title, MODELZOO_METADATA.modelZoo, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	/** The works of PollisReferences, as a panel lists them, by their keys. */
	const library = new ReferenceLibrary(fileService, pathService.userHome({ preferLocal: true }));

	const sendState = async () => {
		const folder = await juliaPackageFolder(fileService, pathService, 'PollisCompetitions');
		if (!folder) {
			post({ command: 'state', error: localize('modelZoo.noPackage', "PollisCompetitions.jl is not on this computer. Score Models installs it when it runs a method; open this page again once it is installed.") });
			return;
		}
		const [{ models, datasetNames }, version, { references }] = await Promise.all([readZoo(fileService, folder), projectVersion(fileService, folder), library.pollis()]);
		const keys = new Set(models.flatMap(model => model.references.map(reference => reference.key)));
		const papers: Record<string, IModelPaper> = {};
		for (const reference of references.filter(candidate => keys.has(candidate.key))) {
			papers[reference.key] = referencePaper(reference);
		}
		post({ command: 'state', models, datasetNames, papers, version });
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ModelZooMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				await sendState().catch(error => post({ command: 'state', error: toErrorMessage(error) }));
			} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
				storeRows(storageService, ROWS_PAGE, message.rows);
			} else if (message.command === 'link' && hasKey(message, { url: true }) && typeof message.url === 'string' && /^https?:\/\//.test(message.url)) {
				await openInBrowser(message.url, commandService);
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

/** The page, showing `rows` rows at a time at first: its texts come from here, the models from the `state` message. */
function pageHtml(rows: number): string {
	const text = {
		intro: localize('modelZoo.intro', "Model Zoo lists the models that the benchmarks and competitions of PollisCompetitions.jl scored, from its Model Catalog: each model's family and method, the benchmarks and competitions that scored it, the number of datasets it was scored on, and the package and language it was run in. In Julia names the registered Julia package that has the model's estimator, in Julia or bound to the library the original runs, and Checked says whether that package, run on the benchmark's splits, gives the published scores. Search finds a model by its name; Filter by shows the values of a column, to tick those to keep, and a value in a cell filters by it when clicked; a column heading sorts the rows. Expand shows the model's papers and the datasets it was scored on."),
		search: localize('modelZoo.search', "Search:"),
		searchHint: localize('modelZoo.searchHint', "The models whose name holds these words"),
		filterBy: localize('modelZoo.filterBy', "Filter by:"),
		none: localize('modelZoo.none', "None"),
		clearFilters: localize('modelZoo.clearFilters', "Clear Filters"),
		count: localize('modelZoo.count', "{0} of {1} models"),
		inPackage: localize('modelZoo.inPackage', "{0} of them in a Julia package, {1} checked against the published scores"),
		version: localize('modelZoo.version', "PollisCompetitions.jl {0}"),
		model: localize('modelZoo.model', "Model"),
		modelHint: localize('modelZoo.modelHint', "The model's name, with its configuration when the benchmark scored several: default, tuned, or tuned and ensembled"),
		family: localize('modelZoo.family', "Family"),
		familyHint: localize('modelZoo.familyHint', "The family of the model's estimator"),
		method: localize('modelZoo.method', "Method"),
		methodHint: localize('modelZoo.methodHint', "The method the model estimates with; that of a Hybrid model names the methods it combines"),
		scoredIn: localize('modelZoo.scoredIn', "Scored In"),
		scoredInHint: localize('modelZoo.scoredInHint', "The benchmarks and competitions that scored the model"),
		datasets: localize('modelZoo.datasets', "Datasets"),
		datasetsHint: localize('modelZoo.datasetsHint', "The number of datasets of PollisCompetitions.jl the model was scored on"),
		original: localize('modelZoo.original', "Original"),
		originalHint: localize('modelZoo.originalHint', "The package the benchmark ran the model with, else the code its paper published, and its language"),
		julia: localize('modelZoo.julia', "In Julia"),
		juliaHint: localize('modelZoo.juliaHint', "The registered Julia package that has the model's estimator, in Julia or bound to the library the original runs; Not Yet when no package has it"),
		notYet: localize('modelZoo.notYet', "Not Yet"),
		checked: localize('modelZoo.checked', "Checked"),
		checkedHint: localize('modelZoo.checkedHint', "Yes when the Julia package, run on the benchmark's splits, gives the published scores; No when it has the same estimator but has not been checked against them"),
		yes: localize('modelZoo.yes', "Yes"),
		no: localize('modelZoo.no', "No"),
		language: localize('modelZoo.language', "Language"),
		languageHint: localize('modelZoo.languageHint', "The language of the package the benchmark ran the model with"),
		expand: localize('modelZoo.expand', "Expand"),
		restore: localize('modelZoo.restore', "Restore Size"),
		papers: localize('modelZoo.papers', "Papers"),
		scoredOn: localize('modelZoo.scoredOn', "Datasets It Was Scored On"),
		methodology: localize('modelZoo.methodology', "Methodology"),
		software: localize('modelZoo.software', "Software"),
		other: localize('modelZoo.other', "Other"),
		addFilter: localize('modelZoo.addFilter', "Show only the models with this value"),
		removeFilter: localize('modelZoo.removeFilter', "Remove this filter"),
		noMatch: localize('modelZoo.noMatch', "No model matches the search and the filters."),
		loading: localize('modelZoo.loading', "Reading the Model Catalog of PollisCompetitions.jl..."),
		unreadable: localize('modelZoo.unreadable', "The Model Catalog could not be read: {0}"),
		previous: localize('modelZoo.previous', "Previous"),
		next: localize('modelZoo.next', "Next"),
		page: localize('modelZoo.page', "Page {0} of {1}"),
		sortHint: sortHint(),
	};
	return buildWebviewHtml({
		title: localize('modelZoo.title', "Model Zoo"),
		omitPoweredBy: !MODELZOO_METADATA.modelZoo.packages.length,
		omitNextSteps: true,
		introHtml: text.intro,
		extraCss: `${compareCss}
${rowsChoiceCss}
${stickyHeadCss}
${sortHeadingsCss}
		.container { max-width: 1300px; }
		.zoo button.link, .pager button.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.zoo button.link:hover, .pager button.link:hover { text-decoration: underline; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager button.link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		.zoo .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
		.zoo .controls .count { margin-left: auto; color: var(--vscode-descriptionForeground); font-size: 12px; text-align: right; }
		.zoo input, .zoo select { font-family: var(--vscode-font-family); font-size: 12px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		.zoo select { color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border-color: var(--vscode-dropdown-border, var(--vscode-widget-border)); }
		.zoo input#search { width: 200px; }
		.zoo .controls label { font-size: 12px; white-space: nowrap; }
		/* The values of the column chosen in Filter by, each a tick with the number of models that have it */
		.zoo .filterValues { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 8px; padding: 6px 8px; border: 1px solid var(--vscode-widget-border); border-radius: 3px; }
		.zoo .filterValues label { display: flex; align-items: center; gap: 6px; font-size: 12px; white-space: nowrap; cursor: pointer; }
		.zoo .filterValues .number { color: var(--vscode-descriptionForeground); }
		.zoo .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
		.zoo .chips:empty { display: none; }
		.zoo button.chip { font: inherit; font-size: 11px; cursor: pointer; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--vscode-focusBorder); background: none; color: var(--vscode-foreground); }
		.zoo .problems { margin: 8px 0; padding: 8px 12px; border-left: 3px solid var(--vscode-editorWarning-foreground); font-size: 12px; }
		.zoo table { width: 100%; border-collapse: collapse; margin-top: 4px; }
		.zoo th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; vertical-align: bottom; }
		.zoo td { vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; font-size: 12px; }
		.zoo tr.modelRow:hover td, .zoo tr.modelRow.opened td { background: var(--vscode-list-hoverBackground); }
		.zoo td.expandCell, .zoo th.expandCell { width: 1%; text-align: center; }
		.zoo td.nameCell { min-width: 200px; font-size: 13px; font-weight: 600; }
		.zoo td.number, .zoo th.number { text-align: right; }
		.zoo td.none { color: var(--vscode-descriptionForeground); }
		/* Expand and Restore Size, in the first column of a row */
		.zoo button.expand { display: block; margin: 0 auto; padding: 2px; line-height: 0; cursor: pointer; background: none; border: none; border-radius: 3px; color: var(--vscode-icon-foreground, var(--vscode-foreground)); }
		.zoo button.expand:hover { background: var(--vscode-toolbar-hoverBackground); }
		.zoo button.expand svg { width: 14px; height: 14px; }
		.zoo button.tag { font: inherit; font-size: 11px; cursor: pointer; margin: 0 4px 2px 0; padding: 0 6px; border-radius: 3px; background: none; color: var(--vscode-descriptionForeground); border: 1px solid var(--vscode-widget-border); }
		.zoo button.tag:hover { border-color: var(--vscode-focusBorder); color: var(--vscode-foreground); }
		.zoo button.tag.yellow { color: #e8a33d; }
		body.vscode-light .zoo button.tag.yellow { color: #a8650d; }
		/* The details of the row expanded, under it */
		.zoo tr.detailsRow > td { padding: 4px 16px 16px 16px; background: var(--vscode-editor-background); }
		.zoo .details h3 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 14px 0 4px 0; }
		.zoo .details .paper { margin-bottom: 4px; }
		.zoo .details .role { color: var(--vscode-descriptionForeground); }
`,
		bodyHtml: `
<div class="zoo">
	<div class="problems" id="problems" hidden></div>
	<div class="stickyBand" id="band">
		<div class="controls">
			<label>${text.search} <input type="search" id="search" title="${text.searchHint}"></label>
			<label>${text.filterBy} <select id="filterField"></select></label>
			<button class="link" id="clearFilters" hidden>${text.clearFilters}</button>
			<span class="count" id="count">${text.loading}</span>
		</div>
		<div class="filterValues" id="filterValues" hidden></div>
		<div class="chips" id="chips"></div>
	</div>
	<table class="stickyHead" id="table" hidden>
		<thead><tr id="head"></tr></thead>
		<tbody id="rows"></tbody>
	</table>
	<p class="hint" id="note" hidden></p>
	<div class="pager" id="pager" hidden></div>
</div>
`,
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	${rowsChoiceScript()}
	${stickyHeadScript()}
	${sortHeadingsScript()}
	// The columns, in order, after Expand: the label, the hover, whether a number, and whether Filter by offers it
	const COLUMNS = [
		{ name: 'name', label: TEXT.model, hint: TEXT.modelHint },
		{ name: 'family', label: TEXT.family, hint: TEXT.familyHint, filter: true },
		{ name: 'method', label: TEXT.method, hint: TEXT.methodHint, filter: true },
		{ name: 'scoredIn', label: TEXT.scoredIn, hint: TEXT.scoredInHint, filter: true },
		{ name: 'datasets', label: TEXT.datasets, hint: TEXT.datasetsHint, number: true },
		{ name: 'original', label: TEXT.original, hint: TEXT.originalHint },
		{ name: 'julia', label: TEXT.julia, hint: TEXT.juliaHint, filter: true },
		{ name: 'checked', label: TEXT.checked, hint: TEXT.checkedHint, filter: true },
	];
	// Filter by also offers the language, which the column Original shows
	const FILTERS = [...COLUMNS.filter(column => column.filter), { name: 'language', label: TEXT.language, hint: TEXT.languageHint }];
	// Expand and Restore Size: corners pointing out, and in
	const EXPAND_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>';
	const RESTORE_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5"/></svg>';

	let models;
	let datasetNames = {};
	let papers = {};
	let filters = {};
	let filterField = '';
	let search = '';
	let sortField = 'name';
	let sortDescending = false;
	let page = 0;
	let rows = ${rows};
	let opened = '';
	let stuck = false;
	const filterSelect = document.getElementById('filterField');

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = String(content); }
		return node;
	}
	function format(template, ...values) {
		return values.reduce((result, value, index) => result.split('{' + index + '}').join(String(value)), template);
	}
	function column(name) {
		return FILTERS.find(candidate => candidate.name === name);
	}
	function juliaName(model) {
		return model.julia ? model.julia + '.jl' : TEXT.notYet;
	}
	function checkedName(model) {
		return model.checked === undefined ? '' : model.checked ? TEXT.yes : TEXT.no;
	}
	// The values of a model that Filter by and the tags of a cell know it by
	function valuesOf(model, name) {
		if (name === 'scoredIn') {
			return model.scoredIn;
		}
		if (name === 'julia') {
			return [juliaName(model)];
		}
		if (name === 'checked') {
			return model.checked === undefined ? [] : [checkedName(model)];
		}
		const value = model[name];
		return value ? [value] : [];
	}
	// Each value of a column, sorted, Not Yet last
	function valuesOfColumn(name) {
		const values = [...new Set(models.flatMap(model => valuesOf(model, name)))].sort((a, b) => a.localeCompare(b));
		return name === 'julia' ? [...values.filter(value => value !== TEXT.notYet), ...values.filter(value => value === TEXT.notYet)] : values;
	}
	function matches(model) {
		if (search && !search.split(' ').filter(word => word).every(word => model.name.toLowerCase().includes(word))) {
			return false;
		}
		return Object.entries(filters).every(([name, chosen]) => !chosen.length || valuesOf(model, name).some(value => chosen.includes(value)));
	}
	function sortValue(model, name) {
		if (name === 'datasets') {
			return model.datasets.length;
		}
		if (name === 'original') {
			return model.package ? (model.package + ' ' + (model.language || '')).toLowerCase() : undefined;
		}
		if (name === 'julia') {
			return model.julia ? model.julia.toLowerCase() : undefined;
		}
		if (name === 'checked') {
			return model.checked === undefined ? undefined : model.checked ? 0 : 1;
		}
		if (name === 'scoredIn') {
			return model.scoredIn.length ? model.scoredIn.join(', ').toLowerCase() : undefined;
		}
		return model[name] ? model[name].toLowerCase() : undefined;
	}
	// The models without the value come last, in either order
	function compare(a, b) {
		const x = sortValue(a, sortField);
		const y = sortValue(b, sortField);
		if (x === undefined || y === undefined) {
			return x === y ? a.name.localeCompare(b.name) : x === undefined ? 1 : -1;
		}
		const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
		return (sortDescending ? -order : order) || a.name.localeCompare(b.name);
	}

	function tag(name, value, className) {
		const button = element('button', 'tag' + (className ? ' ' + className : ''), value);
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
	// A paper as the details list it: its role, authors, year, title and venue, and its link, or its key when PollisReferences lacks it
	function appendPaper(node, reference) {
		const paper = papers[reference.key];
		const line = node.appendChild(element('div', 'paper'));
		const role = reference.role === 'Methodology' ? TEXT.methodology : reference.role === 'Software' ? TEXT.software : reference.role ? TEXT.other : '';
		if (role) {
			line.appendChild(element('span', 'role', role + ': '));
		}
		line.append(paper ? paper.authors + ' (' + paper.year + '). ' + paper.title + (paper.journal ? '. ' + paper.journal : '') + '. ' : reference.key);
		if (paper && (paper.doi || paper.url)) {
			line.appendChild(link(paper.doi ? 'https://doi.org/' + paper.doi : paper.url, paper.doi || paper.url));
		}
	}

	function drawHead() {
		const head = document.getElementById('head');
		head.textContent = '';
		head.appendChild(element('th', 'expandCell'));
		for (const declared of COLUMNS) {
			const heading = element('th', 'sortable' + (declared.number ? ' number' : ''));
			heading.dataset.sort = declared.name;
			heading.title = declared.hint + '. ' + TEXT.sortHint;
			setSortArrow(heading, declared.label, declared.name === sortField, sortDescending);
			head.appendChild(heading);
		}
	}
	function expandButton(id) {
		const expand = element('button', 'expand');
		expand.dataset.expand = id;
		expand.innerHTML = id === opened ? RESTORE_ICON : EXPAND_ICON;
		expand.title = id === opened ? TEXT.restore : TEXT.expand;
		expand.setAttribute('aria-label', expand.title);
		expand.setAttribute('aria-expanded', String(id === opened));
		return expand;
	}
	function modelRow(model) {
		const row = element('tr', 'modelRow' + (model.id === opened ? ' opened' : ''));
		row.appendChild(element('td', 'expandCell')).appendChild(expandButton(model.id));
		row.appendChild(element('td', 'nameCell', model.name));
		for (const name of ['family', 'method']) {
			const cell = row.appendChild(element('td'));
			if (model[name]) {
				cell.appendChild(tag(name, model[name]));
			}
		}
		const scored = row.appendChild(element('td'));
		for (const value of model.scoredIn) {
			scored.appendChild(tag('scoredIn', value));
		}
		row.appendChild(element('td', 'number', model.datasets.length));
		const original = row.appendChild(element('td'));
		if (model.package) {
			original.appendChild(element('span', 'yellow', model.package));
		}
		if (model.language) {
			original.append(model.package ? ' (' : '');
			original.appendChild(tag('language', model.language));
			original.append(model.package ? ')' : '');
		}
		const julia = row.appendChild(element('td', model.julia ? '' : 'none'));
		julia.appendChild(model.julia ? tag('julia', juliaName(model), 'yellow') : document.createTextNode(TEXT.notYet));
		const checked = row.appendChild(element('td', model.checked ? '' : 'none', checkedName(model)));
		checked.title = model.checked === undefined ? '' : TEXT.checkedHint;
		return row;
	}
	// The model's papers and the datasets it was scored on, under its row
	function detailsRow(model, span) {
		const row = element('tr', 'detailsRow');
		const cell = row.appendChild(element('td'));
		cell.colSpan = span;
		const details = cell.appendChild(element('div', 'details'));
		if (model.references.length) {
			details.appendChild(element('h3', '', TEXT.papers));
			for (const reference of model.references) {
				appendPaper(details, reference);
			}
		}
		if (model.datasets.length) {
			details.appendChild(element('h3', '', TEXT.scoredOn + ' (' + model.datasets.length + ')'));
			details.appendChild(element('div', '', model.datasets.map(id => datasetNames[id] || id).sort((a, b) => a.localeCompare(b)).join(', ')));
		}
		return row;
	}

	// Filter by: None, a separator, then each column it offers, made when the models come
	function buildFilters() {
		filterSelect.textContent = '';
		filterSelect.appendChild(element('option', '', TEXT.none)).value = '';
		filterSelect.appendChild(element('hr'));
		for (const declared of FILTERS) {
			const option = filterSelect.appendChild(element('option', '', declared.label));
			option.value = declared.name;
			option.title = declared.hint;
		}
		filterSelect.value = filterField;
	}
	// The columns of Filter by with the number of their values ticked, and the values of the column chosen, each with
	// the number of models that have it; then a chip for each value ticked, of any column
	function drawFilters() {
		for (const option of filterSelect.options) {
			if (option.value) {
				const chosen = filters[option.value] || [];
				option.textContent = column(option.value).label + (chosen.length ? ' (' + chosen.length + ')' : '');
			}
		}
		const values = document.getElementById('filterValues');
		values.textContent = '';
		values.hidden = !filterField;
		if (filterField) {
			const chosen = filters[filterField] || [];
			for (const value of valuesOfColumn(filterField)) {
				const count = models.filter(model => valuesOf(model, filterField).includes(value)).length;
				const option = values.appendChild(element('label'));
				const tick = option.appendChild(element('input'));
				tick.type = 'checkbox';
				tick.dataset.field = filterField;
				tick.dataset.value = value;
				tick.checked = chosen.includes(value);
				option.append(value);
				option.appendChild(element('span', 'number', count));
			}
		}
		const chips = document.getElementById('chips');
		chips.textContent = '';
		for (const [name, chosen] of Object.entries(filters)) {
			for (const value of chosen) {
				const chip = chips.appendChild(element('button', 'chip', column(name).label + ': ' + value + ' \\u00d7'));
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

	function render() {
		if (!models) {
			return;
		}
		drawHead();
		drawFilters();
		const shown = models.filter(matches).sort(compare);
		const size = rowsPerPage(rows, shown.length);
		const pages = Math.max(1, Math.ceil(shown.length / size));
		page = Math.min(page, pages - 1);
		const body = document.getElementById('rows');
		body.textContent = '';
		for (const model of shown.slice(page * size, (page + 1) * size)) {
			body.appendChild(modelRow(model));
			if (model.id === opened) {
				body.appendChild(detailsRow(model, COLUMNS.length + 1));
			}
		}
		fillPager(shown.length, pages);
		const inJulia = models.filter(model => model.julia);
		document.getElementById('count').textContent = format(TEXT.count, shown.length, models.length) + ' \\u00b7 ' + format(TEXT.inPackage, inJulia.length, inJulia.filter(model => model.checked).length);
		document.getElementById('table').hidden = !shown.length;
		const note = document.getElementById('note');
		note.hidden = !!shown.length;
		note.textContent = TEXT.noMatch;
	}

	filterSelect.addEventListener('change', () => {
		filterField = filterSelect.value;
		render();
	});
	document.getElementById('search').addEventListener('input', event => {
		search = event.target.value.trim().toLowerCase();
		page = 0;
		render();
	});
	document.getElementById('filterValues').addEventListener('change', event => {
		const box = event.target;
		if (box.dataset && box.dataset.field) {
			setFilter(box.dataset.field, box.dataset.value, box.checked);
		}
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
			sortDescending = false;
		}
		render();
	});
	document.addEventListener('click', event => {
		const target = event.target;
		const expand = target.closest('button[data-expand]');
		if (expand) {
			opened = opened === expand.dataset.expand ? '' : expand.dataset.expand;
			render();
			return;
		}
		const tagButton = target.closest('button.tag');
		const chip = target.closest('button.chip');
		const linkButton = target.closest('button[data-url]');
		if (tagButton) {
			setFilter(tagButton.dataset.field, tagButton.dataset.value, true);
		} else if (chip) {
			setFilter(chip.dataset.field, chip.dataset.value, false);
		} else if (linkButton) {
			vscode.postMessage({ command: 'link', url: linkButton.dataset.url });
		} else if (target.id === 'clearFilters') {
			filters = {};
			page = 0;
			render();
		}
	});
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command !== 'state') {
			return;
		}
		const problems = document.getElementById('problems');
		problems.hidden = !message.error;
		if (message.error) {
			problems.textContent = format(TEXT.unreadable, message.error);
			document.getElementById('count').textContent = '';
			return;
		}
		models = message.models;
		datasetNames = message.datasetNames || {};
		papers = message.papers || {};
		document.getElementById('count').title = message.version ? format(TEXT.version, message.version) : '';
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
		super({ id: MODEL_ZOO_COMMAND_ID, title: localize2('modelZoo.action', "Model Zoo..."), category: localize2('modelZoo.category', "Challenges"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openModelZooPage(accessor);
	}
});
