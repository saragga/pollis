/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
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
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { FORECASTINGCOMPETITIONS_METADATA } from '../../model/browser/webviews/forecastingCompetitions.data.js';
import { sortHeadingsCss, sortHeadingsScript, sortHint } from '../../model/browser/webviews/webviewPager.js';
import { buildWebviewHtml, codeEditorCss, codeEditorHtml, codeEditorJs, colorizeBracketsJs, ONE_BLUE_BUTTON_JS, pageNextSteps } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { findPollisWorkspace } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { activeDatasets, FORECASTING_CATALOGUE_COMMAND_ID, onDidChangeActiveDatasets } from './forecastingActive.js';
import { POLLIS_COMPETITIONS_DATASETS_PATH } from './forecastingCatalogue.js';
import { addedDatasetFiles, forecastingFolder, readAddedDataset } from './forecastingWorkspace.js';
import { juliaPackageFolder } from './juliaPackages.js';

// Score Models, from Compose > Prediction Challenges > Score Models (compose.contribution.ts): a method of the user's own,
// run on challenge datasets of one kind and scored as each dataset's competition or benchmark scored its models. On
// series (forecasting datasets), a function forecast(y, h, period), scored by sMAPE, MASE and OWA beside the eight
// statistical benchmarks computed on the same series. On tabular and survival datasets, a function predict, fitted on
// the training rows of each published split and predicting its test rows, scored by PollisCompetitions.jl by the
// measures of the dataset's Response Type, beside the published runs on the same splits. A page of the scaffold in the
// Time Arrow style, in four steps: 1, Datasets (the kind, then a frequency and a sample of series, or the splits to run);
// 2, Your Method; 3, Run, in the Julia REPL; 4, Scores. A run is a folder of ~/.pollis/competitions/runs: run.toml (the
// choices of step 1), method.jl, run.jl (which the page writes and the REPL runs), progress.json while it runs, then
// forecasts.csv, or scores.csv and published.tsv, and results.json, which step 4 draws. Step 1 lists the datasets
// active in Manage Challenge Datasets (forecastingActive.ts) that the page scores: those of PollisCompetitions.jl whose
// data are on this computer and whose info.toml readScoredDataset reads, and those the user added to the Pollis
// Workspace. A run scores them all: several make a folder whose run.toml names them, with a run of each in the
// subfolder named by its id, run in turn, and step 4 shows their scores side by side.

export const FORECASTING_COMPETITIONS_COMMAND_ID = 'pollis.competitions.forecastingCompetitions';

const RUN_FILE = 'run.toml';
const METHOD_FILE = 'method.jl';
const SCRIPT_FILE = 'run.jl';
const PROGRESS_FILE = 'progress.json';
const RESULTS_FILE = 'results.json';
const FORECASTS_FILE = 'forecasts.csv';
/** Of a run on a tabular or survival dataset: the scores of each split, and the published runs on the dataset. */
const SCORES_FILE = 'scores.csv';
const PUBLISHED_FILE = 'published.tsv';

/**
 * A frequency of a dataset that Score Models scores models on, as the [[frequencies]] of its info.toml give it: its
 * name, none for the series that have none, its number of series, and the shortest and the longest of their horizons.
 */
export interface IFrequency {
	readonly name?: string;
	readonly series: number;
	readonly shortest: number;
	readonly longest: number;
}

/**
 * What a dataset is, and so what a method is given and how it is scored: series (a forecast of each series), tabular
 * (a prediction of the target of each test row, of Response Type Continuous, Count, Binary or Multiclass) or survival
 * (the survival curve of each test row).
 */
export type ScoredKind = 'series' | 'tabular' | 'survival';
const SCORED_KINDS: readonly ScoredKind[] = ['series', 'tabular', 'survival'];

/** The measure of each Response Type of a tabular dataset, as PollisCompetitions.jl scores it (its TABULAR_MEASURES). */
const TABULAR_MEASURES: Readonly<Record<string, string>> = { Continuous: 'rmse', Count: 'rmse', Binary: 'roc_auc', Multiclass: 'log_loss' };
/** The measures of a survival dataset, as PollisCompetitions.jl scores it (its SURVIVAL_MEASURES). */
const SURVIVAL_MEASURES = ['harrell_c', 'uno_c', 'isbs', 'isbs_erv', 'isll', 'isll_erv', 'dcalib', 'alpha_calib'];

/** A dataset that Score Models scores models on, with the facts step 1 shows. */
export interface IScoredDataset {
	readonly id: string;
	readonly name: string;
	readonly kind: ScoredKind;
	/** The frequencies of a dataset of series; none for the other kinds. */
	readonly frequencies: readonly IFrequency[];
	/** Of a tabular or survival dataset: its Response Type, its number of rows, and the repeats and folds of its outer splits. */
	readonly responseType?: string;
	readonly rows?: number;
	readonly repeats?: number;
	readonly folds?: number;
	/** For a dataset of the user's own, its folder in the Pollis Workspace, which PollisCompetitions.jl reads in place of an id. */
	readonly folder?: string;
}

/** The measures a dataset is scored by. */
export function scoredMeasures(dataset: IScoredDataset): readonly string[] {
	switch (dataset.kind) {
		case 'series': return ['sMAPE', 'MASE', 'OWA'];
		case 'tabular': return [TABULAR_MEASURES[dataset.responseType ?? '']];
		case 'survival': return SURVIVAL_MEASURES;
	}
}

/**
 * The dataset of the data folder `folder`, under the id `id`, when Score Models scores models on it; undefined
 * otherwise. Its name is that of info.toml, else `id`. Its info.toml gives either the format "monash" (series and
 * observations, the last values of each series held out from the forecasters) and its frequencies, or the format
 * "tabular" (data and its outer splits), its target, its repeats and folds, and the number of rows of its data; a
 * tabular dataset is scored when `responseType`, its Response Type in the Dataset Catalog, has a measure, and a
 * survival one when its info.toml also names its event.
 */
export async function readScoredDataset(fileService: IFileService, folder: URI, id: string, responseType?: string): Promise<IScoredDataset | undefined> {
	try {
		const { name, format, frequencies, target, event, repeats, folds, tables } = parseToml((await fileService.readFile(joinPath(folder, 'info.toml'))).value.toString());
		const shown = typeof name === 'string' ? name : id;
		if (format === 'tabular') {
			const { data: rows } = typeof tables === 'object' && tables !== null && !Array.isArray(tables) ? tables as { readonly data?: unknown } : {};
			const kind: ScoredKind | undefined = responseType === 'Survival' ? (typeof event === 'string' ? 'survival' : undefined) : responseType && Object.hasOwn(TABULAR_MEASURES, responseType) ? 'tabular' : undefined;
			return kind && typeof target === 'string' && typeof repeats === 'number' && typeof folds === 'number' && typeof rows === 'number'
				? { id, name: shown, kind, frequencies: [], responseType, rows, repeats, folds }
				: undefined;
		}
		const read = (Array.isArray(frequencies) ? frequencies : []).flatMap(frequency => {
			const { name: frequencyName, series, shortest_horizon: shortest, longest_horizon: longest } = typeof frequency === 'object' && frequency !== null && !Array.isArray(frequency) ? frequency : {};
			return typeof series === 'number' && typeof shortest === 'number' && typeof longest === 'number'
				? [{ ...(typeof frequencyName === 'string' ? { name: frequencyName } : {}), series, shortest, longest }]
				: [];
		});
		return format === 'monash' && read.length ? { id, name: shown, kind: 'series', frequencies: read } : undefined;
	} catch {
		return undefined;
	}
}

/** The ids of the Dataset Catalog of PollisCompetitions.jl, in its order, each with its Response Type. */
async function catalogueResponseTypes(fileService: IFileService, packageFolder: URI | undefined): Promise<Map<string, string | undefined>> {
	if (!packageFolder) {
		return new Map();
	}
	try {
		const { datasets } = parseToml((await fileService.readFile(joinPath(packageFolder, POLLIS_COMPETITIONS_DATASETS_PATH))).value.toString());
		return new Map((Array.isArray(datasets) ? datasets : []).flatMap(dataset => typeof dataset === 'object' && dataset !== null && !Array.isArray(dataset) && typeof dataset.dataset_id === 'string'
			? [[dataset.dataset_id, typeof dataset.response_type === 'string' ? dataset.response_type : undefined] as const]
			: []));
	} catch {
		return new Map();
	}
}

/**
 * The datasets of PollisCompetitions.jl among `ids` that Score Models scores models on, in the order of `ids`: those
 * whose data folder is on this computer (competitionDataFolder) and is one readScoredDataset reads.
 */
export async function packageScoredDatasets(fileService: IFileService, pathService: IPathService, ids: readonly string[]): Promise<IScoredDataset[]> {
	const home = await pathService.userHome({ preferLocal: true });
	const packageFolder = await juliaPackageFolder(fileService, pathService, 'PollisCompetitions');
	const responseTypes = await catalogueResponseTypes(fileService, packageFolder);
	const found = await Promise.all(ids.map(async id => {
		const folder = await competitionDataFolder(fileService, home, packageFolder, id);
		return folder && await readScoredDataset(fileService, folder, id, responseTypes.get(id));
	}));
	return found.filter((dataset): dataset is IScoredDataset => !!dataset);
}

/** Every dataset of PollisCompetitions.jl that Score Models scores models on, in the order of its Dataset Catalog. */
export async function allPackageScoredDatasets(fileService: IFileService, pathService: IPathService): Promise<IScoredDataset[]> {
	const packageFolder = await juliaPackageFolder(fileService, pathService, 'PollisCompetitions');
	return packageScoredDatasets(fileService, pathService, [...(await catalogueResponseTypes(fileService, packageFolder)).keys()]);
}

/** Which splits of a tabular or survival dataset a run fits on: all its published splits, or those of its first repeat. */
type SplitsToRun = 'all' | 'first';

/** The choices of step 1 and the method of step 2, as the page sends them. */
interface IRunInputs {
	/** The kind of the datasets listed, which are all of it. */
	readonly kind: ScoredKind;
	/** The datasets listed, by their ids: datasets of PollisCompetitions.jl or of the user's own. */
	readonly datasets: readonly string[];
	/** Of series: a frequency of the only dataset listed, or '' for all of them. */
	readonly frequency: string;
	/** Of series: the number of series of the sample, or 0 for all the series chosen. */
	readonly sample: number;
	readonly seed: number;
	/** Of tabular and survival datasets: the splits to fit on. */
	readonly splits: SplitsToRun;
	readonly code: string;
}

type CompetitionsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'run'; readonly inputs: IRunInputs }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newRun' }
	| { readonly command: 'open'; readonly what: 'method' | 'forecasts' | 'scores' | 'script' }
	| { readonly command: 'nextStep'; readonly step: string; readonly series?: unknown; readonly position?: unknown }
	| { readonly command: 'compareWith'; readonly name: string }
	| { readonly command: 'diffMethods' }
	| { readonly command: 'codeDraft'; readonly text: string }
	| { readonly command: 'member'; readonly id: string }
	| { readonly command: 'manage' };

/** The choices of a run of one dataset, as its run.toml records them: `competition` is the id of the dataset. */
interface IRunChoices {
	readonly kind: ScoredKind;
	readonly competition: string;
	readonly frequency: string;
	readonly sample: number;
	readonly seed: number;
	readonly splits: SplitsToRun;
	/** The folder of a dataset of the user's own, which the run reads in place of the id. */
	readonly folder?: string;
}

/** The choices of a run of several datasets, as its run.toml records them: the datasets, each a subfolder of the run. */
interface IBatchChoices {
	readonly kind: ScoredKind;
	readonly datasets: readonly string[];
	readonly sample: number;
	readonly seed: number;
	readonly splits: SplitsToRun;
	readonly started: string;
}

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

/** The example of step 2 of each kind of dataset; for series, the benchmark Theta, written out from the functions of PollisCompetitions.Benchmarks. */
const EXAMPLE_METHODS: Readonly<Record<ScoredKind, string>> = {
	series: `# Your method: a function forecast(y, h, period) that returns h forecasts of the series y (its values in order),
# whose seasonal period is period (1 for none). Here, the benchmark Theta, written out from the functions
# of PollisCompetitions.jl: change it, or write a method of your own, with any package you have installed.
using PollisCompetitions.Benchmarks: is_seasonal, seasonal_index, theta

function forecast(y, h, period)
	if is_seasonal(y, period)
		# Seasonally adjusted, then multiplied back by the last period of the seasonal index
		index = seasonal_index(y, period)
		n = length(y)
		ahead = [index[n - period + 1 + mod(step - 1, period)] for step in 1:h]
		return theta(y ./ index, h) .* ahead
	end
	theta(y, h)
end
`,
	tabular: `# Your method: a function predict(train, test, target, response_type, classes) that predicts the target of each
# row of test. train holds the training rows, with every column, the target among them; test holds the test rows,
# without the target. Both are tables of columns (a NamedTuple of vectors), with text as strings and missing
# values as missing. classes are the target's classes, sorted (none for Continuous and Count). Return:
# - Continuous or Count: a vector, a number for each test row;
# - Binary: a vector, the probability of classes[2] for each test row;
# - Multiclass: a matrix, a row for each test row and a column for each class, each row summing to 1.
# Here, the mean of the training targets, or the share of each class in the training rows: change it, or write a
# method of your own, with any package you have installed, such as a gradient-boosted tree package.
function predict(train, test, target, response_type, classes)
	y = train[Symbol(target)]
	n = length(first(test))
	if response_type in ("Continuous", "Count")
		return fill(sum(y) / length(y), n)
	end
	shares = [count(==(class), y) / length(y) for class in classes]
	response_type == "Binary" && return fill(shares[2], n)
	repeat(permutedims(shares), n)
end
`,
	survival: `# Your method: a function predict(train, test, time, event, times) that gives each row of test its probability of
# surviving past each of times. train holds the training rows, with every column, among them the time and the event
# indicator (1 for an event, 0 for a censored time), whose names are time and event; test holds the test rows,
# without them. Both are tables of columns (a NamedTuple of vectors). times are the distinct times of the training
# rows, increasing. Return a matrix, a row for each test row and a column for each of times, no row increasing.
# Here, the Kaplan-Meier estimate of the training rows, the same curve for every test row: change it, or write a
# method of your own, with any package you have installed, such as Survival.jl.
function predict(train, test, time, event, times)
	t, d = Float64.(train[Symbol(time)]), train[Symbol(event)] .== 1
	order = sortperm(t)
	survival, s, k = ones(length(times)), 1.0, 1
	for (j, u) in enumerate(times)
		at_risk = length(t) - k + 1
		events = 0
		while k <= length(t) && t[order[k]] == u
			events += d[order[k]]
			k += 1
		end
		s *= 1 - events / at_risk
		survival[j] = s
	end
	repeat(permutedims(survival), length(first(test)))
end
`,
};

/** The function a method of each kind defines, which run.jl calls. */
const METHOD_FUNCTIONS: Readonly<Record<ScoredKind, string>> = { series: 'forecast', tabular: 'predict', survival: 'predict' };

/** The inputs of a run as the page sent them, checked against the datasets `known`; undefined when they are not well formed. */
function checkedInputs(value: unknown, known: readonly IScoredDataset[]): (Omit<IRunInputs, 'datasets'> & { readonly datasets: readonly IScoredDataset[] }) | undefined {
	if (typeof value !== 'object' || value === null) {
		return undefined;
	}
	const { kind, datasets, frequency, sample, seed, splits, code }: { readonly [K in keyof IRunInputs]?: unknown } = value;
	const ids = Array.isArray(datasets) ? datasets : [];
	const chosenKind = SCORED_KINDS.find(k => k === kind);
	const chosen = known.filter(c => ids.includes(c.id));
	const only = chosen.length === 1 ? chosen[0] : undefined;
	const chosenSplits = splits === 'all' || splits === 'first' ? splits : undefined;
	if (!chosenKind || !chosenSplits || !chosen.length || chosen.length !== ids.length || chosen.some(c => c.kind !== chosenKind)
		|| typeof frequency !== 'string' || (frequency !== '' && !only?.frequencies.some(f => f.name === frequency))
		|| typeof sample !== 'number' || !Number.isInteger(sample) || sample < 0 || typeof seed !== 'number' || !Number.isInteger(seed) || typeof code !== 'string') {
		return undefined;
	}
	return { kind: chosenKind, datasets: chosen, frequency, sample, seed, splits: chosenSplits, code };
}

/** run.toml of a run of one dataset: the choices of step 1. */
function runToml(choices: IRunChoices, started: string): string {
	return [
		choices.kind === 'series'
			? '# A run of Compose > Prediction Challenges > Score Models: the method of method.jl on these series'
			: '# A run of Compose > Prediction Challenges > Score Models: the method of method.jl on these splits of the dataset',
		`kind = "${choices.kind}"`,
		`competition = "${choices.competition}"`,
		...(choices.folder ? [`folder = ${JSON.stringify(choices.folder)}`] : []),
		`frequency = "${choices.frequency}"`,
		`sample = ${choices.sample}`,
		`seed = ${choices.seed}`,
		`splits = "${choices.splits}"`,
		`started = "${started}"`,
		'',
	].join('\n');
}

/** run.toml of a run of several datasets: the datasets, each run in the subfolder named by its id, with the same choices. */
function batchToml(choices: IBatchChoices): string {
	return [
		'# A run of Compose > Prediction Challenges > Score Models on several datasets in turn: the method of',
		'# method.jl on each, in the subfolder named by its id, a run of its own',
		`kind = "${choices.kind}"`,
		`datasets = [${choices.datasets.map(id => JSON.stringify(id)).join(', ')}]`,
		`sample = ${choices.sample}`,
		`seed = ${choices.seed}`,
		`splits = "${choices.splits}"`,
		`started = "${choices.started}"`,
		'',
	].join('\n');
}

/** The kind of a run as its run.toml records it; series for a run that records none. */
function kindOf(value: unknown): ScoredKind {
	return SCORED_KINDS.find(kind => kind === value) ?? 'series';
}

/** The splits of a run as its run.toml records them; all for a run that records none. */
function splitsOf(value: unknown): SplitsToRun {
	return value === 'first' ? 'first' : 'all';
}

/** A run's choices, as its run.toml records them; undefined when it is not the run of one dataset. */
async function readRun(fileService: IFileService, folder: URI): Promise<(IRunChoices & { readonly started: string }) | undefined> {
	try {
		const data = parseToml((await fileService.readFile(joinPath(folder, RUN_FILE))).value.toString());
		const { kind, competition, frequency, sample, seed, splits, started, folder: datasetFolder } = data;
		if (typeof competition !== 'string' || typeof frequency !== 'string' || typeof sample !== 'number' || typeof seed !== 'number') {
			return undefined;
		}
		return { kind: kindOf(kind), competition, frequency, sample, seed, splits: splitsOf(splits), started: typeof started === 'string' ? started : '', ...(typeof datasetFolder === 'string' ? { folder: datasetFolder } : {}) };
	} catch {
		return undefined;
	}
}

/** The choices of a run of several datasets; undefined when the run is not one. */
async function readBatch(fileService: IFileService, folder: URI): Promise<IBatchChoices | undefined> {
	try {
		const { kind, datasets, sample, seed, splits, started } = parseToml((await fileService.readFile(joinPath(folder, RUN_FILE))).value.toString());
		if (!Array.isArray(datasets) || !datasets.length || !datasets.every(id => typeof id === 'string' && /^[a-z0-9_]+$/.test(id)) || typeof sample !== 'number' || typeof seed !== 'number') {
			return undefined;
		}
		return { kind: kindOf(kind), datasets: datasets as string[], sample, seed, splits: splitsOf(splits), started: typeof started === 'string' ? started : '' };
	} catch {
		return undefined;
	}
}

/**
 * What the table of a run of several datasets shows of a dataset's results.json: its scores, or why it stopped; of a
 * tabular or survival dataset also its ranks and the published runs, from which the page ranks the method across the
 * datasets.
 */
function briefResults(results: unknown): object | undefined {
	if (typeof results !== 'object' || results === null) {
		return undefined;
	}
	const { error, series, splits, measures, method, finished, kind, ranks, published, best } = results as { readonly [key: string]: unknown };
	return { error, series, splits, measures, method, finished, kind, ranks, published, best };
}

/**
 * run.jl of a run of several datasets: the run.jl of each, in turn. Of tabular and survival datasets, the published
 * runs on them all are read first, at once, into the published.tsv of each, which its run.jl reads.
 */
function batchScript(folder: URI, datasets: readonly string[], kind: ScoredKind): string {
	const ids = `[${datasets.map(id => JSON.stringify(id)).join(', ')}]`;
	const published = kind === 'series' ? '' : String.raw`
# The published runs on the datasets, read at once: the published.tsv of each dataset's run
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC
if isdefined(PC, :published_scores)
	let found = PC.published_scores(${ids})
		for dataset in ${ids}
			open(joinpath(raw"${folder.fsPath}", dataset, "${PUBLISHED_FILE}"), "w") do io
				for k in findall(==(dataset), found.dataset_id)
					println(io, found.model_id[k], '\t', replace(found.model_name[k], '\t' => ' '), '\t', found.metric[k], '\t', repr(Float64(found.score[k])))
				end
			end
		end
	end
end
`;
	return String.raw`# Score Models: the method of method.jl on each dataset of run.toml in turn, each a run of its own in the
# subfolder named by its id, which writes its progress.json and results.json there
${published}for dataset in ${ids}
	println("Scoring ", dataset)
	include(joinpath(raw"${folder.fsPath}", dataset, "${SCRIPT_FILE}"))
end`;
}

/** A JSON file of a run, parsed; undefined when it is not there or not JSON. */
async function readJson(fileService: IFileService, file: URI): Promise<unknown> {
	try {
		return JSON.parse((await fileService.readFile(file)).value.toString());
	} catch {
		return undefined;
	}
}

/**
 * The folder of the data of the dataset `id` of PollisCompetitions.jl on this computer, as the package finds it: built
 * in, in data/builtin/<id> of the package in `packageFolder`, else downloaded, in ~/.pollis/competitions/<id> of
 * `home`; undefined when its info.toml is not there.
 */
export async function competitionDataFolder(fileService: IFileService, home: URI, packageFolder: URI | undefined, id: string): Promise<URI | undefined> {
	const builtin = packageFolder && joinPath(packageFolder, 'data', 'builtin', id);
	const folder = builtin && await fileService.exists(builtin) ? builtin : joinPath(home, '.pollis', 'competitions', id);
	return await fileService.exists(joinPath(folder, 'info.toml')) ? folder : undefined;
}

/** The Julia of every script of a run, inside its `let run = ...`: to_json, and write_json, which writes a JSON file of the run's folder. */
const JULIA_JSON = String.raw`	escaped(s) = join(c == '"' ? "\\\"" : c == '\\' ? "\\\\" : c < ' ' ? "\\u" * string(UInt16(c), base = 16, pad = 4) : string(c) for c in s)
	function to_json(x)
		(x === nothing || x === missing) && return "null"
		x isa Bool && return string(x)
		x isa Integer && return string(x)
		x isa Real && return isfinite(x) ? repr(Float64(x)) : "null"
		x isa AbstractString && return "\"" * escaped(x) * "\""
		x isa AbstractDict && return "{" * join([to_json(string(k)) * ":" * to_json(v) for (k, v) in x], ",") * "}"
		x isa AbstractVector && return "[" * join(map(to_json, x), ",") * "]"
		return to_json(string(x))
	end
	write_json(name, x) = write(joinpath(run, name), to_json(x))`;

/**
 * The Next Steps of a finished run. Each is a Julia script of the run's folder, `<step>.jl`, which the page writes
 * and the Julia REPL runs, and which writes `<step>.json`, from which the page draws the step's panel.
 */
const NEXT_STEPS = ['horizon', 'series', 'fails'] as const;
type NextStep = typeof NEXT_STEPS[number];

/** What Browse the Series is asked for: the series named as its source names it, or the one at a place among the run's series, from 1. */
interface INextStepRequest {
	readonly name?: string;
	readonly position?: number;
}

/** What a message asks of a Next Step, checked: a name of letters, digits and . _ : -, or a place from 1. */
function checkedRequest(message: { readonly series?: unknown; readonly position?: unknown }): INextStepRequest {
	if (typeof message.series === 'string' && /^[\w .:-]{1,100}$/.test(message.series)) {
		return { name: message.series };
	}
	return { position: typeof message.position === 'number' && Number.isInteger(message.position) && message.position >= 1 ? message.position : 1 };
}

/** The Julia of every Next Steps script, inside its `let run = ...`, after JULIA_JSON. */
const JULIA_NEXT = String.raw`	settings = TOML.parsefile(joinpath(run, "${RUN_FILE}"))
	# A dataset of the user's own is read from its folder, which PollisCompetitions.jl takes in place of an id
	id = get(settings, "folder", settings["competition"])
	# The forecasts of the run, from forecasts.csv: series, h and value
	function read_forecasts()
		fields = [split(line, ',') for line in Iterators.drop(eachline(joinpath(run, "${FORECASTS_FILE}")), 1)]
		(; series = [parse(Int, f[1]) for f in fields], h = [parse(Int, f[2]) for f in fields], value = [parse(Float64, f[3]) for f in fields])
	end
	# The forecasts of Naive2 of the series numbers, computed on this computer
	function naive2_forecasts(numbers)
		chosen = Set(numbers)
		known = PC.series(id)
		period, horizon = Dict(zip(known.series, known.period)), Dict(zip(known.series, known.horizon))
		seen = PC.observations(id; series = collect(numbers), split = "train")
		forecasts = (; series = Int[], h = Int[], value = Float64[])
		for s in sort(collect(chosen))
			rows = searchsorted(seen.series, s)
			f = PC.naive2(Float64.(seen.value[rows]), period[s], horizon[s])
			append!(forecasts.series, fill(s, length(f))); append!(forecasts.h, eachindex(f)); append!(forecasts.value, f)
		end
		forecasts
	end
	# The sMAPE and the MASE of each series, the means over its horizon of the errors of PollisCompetitions.step_errors
	function series_means(errors)
		sums = Dict{Int, Vector{Float64}}()
		for (s, smape, mase) in zip(errors.series, errors.smape, errors.mase)
			total = get!(sums, Int(s), zeros(3))
			total[1] += smape; total[2] += mase; total[3] += 1
		end
		Dict(s => (smape = t[1] / t[3], mase = t[2] / t[3]) for (s, t) in sums)
	end
	# A measure of the method over another's on a series: infinite when the other's is 0 and the method's is not
	relative(a, b) = b > 0 ? a / b : a > 0 ? Inf : 1.0`;

/** The start of the Next Steps script `step` of the run in `folder`, up to the `try` of its own code. */
function nextStepStart(step: NextStep, folder: URI, comment: string): string {
	return String.raw`# Score Models > Next Steps: ${comment}; writes ${step}.json
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC, TOML
let run = raw"${folder.fsPath}"
${JULIA_JSON}
${JULIA_NEXT}
	try
		isdefined(PC, :BENCHMARK_METHODS) || error("This step needs a newer PollisCompetitions.jl: update it with Pkg.update(\"PollisCompetitions\").")`;
}

/** The end of a Next Steps script: an error is written to `<step>.json`, for the step's panel to show. */
function nextStepEnd(step: NextStep): string {
	return String.raw`
		println("Written: ", joinpath(run, "${step}.json"))
	catch err
		write_json("${step}.json", Dict("error" => sprint(showerror, err)))
		println("The step stopped: ", sprint(showerror, err))
	end
end`;
}

/**
 * horizon.jl: the sMAPE and the MASE of the method and of Naive2 at each step ahead, means over the series of each
 * frequency forecast at that step, from the errors of PollisCompetitions.step_errors.
 */
function horizonScript(folder: URI): string {
	return nextStepStart('horizon', folder, 'Errors by Horizon, the sMAPE and the MASE of the method and of Naive2 at each step ahead') + String.raw`
		mine = read_forecasts()
		numbers = unique(mine.series)
		known = PC.series(id)
		frequency_of = Dict(zip(known.series, known.frequency))
		# The sums of the errors at each frequency and step: sMAPE, MASE and the number of series
		function by_step(errors)
			sums = Dict{Tuple{String, Int}, Vector{Float64}}()
			for (s, h, smape, mase) in zip(errors.series, errors.h, errors.smape, errors.mase)
				total = get!(sums, (frequency_of[s], Int(h)), zeros(3))
				total[1] += smape; total[2] += mase; total[3] += 1
			end
			sums
		end
		println("Errors of the method and of Naive2 at each step")
		method, naive2 = by_step(PC.step_errors(id, mine)), by_step(PC.step_errors(id, naive2_forecasts(numbers)))
		means(sums, f, steps, k) = [haskey(sums, (f, h)) ? sums[(f, h)][k] / sums[(f, h)][3] : nothing for h in steps]
		frequencies = Dict{String, Any}[]
		for f in unique(known.frequency)
			steps = sort([h for (g, h) in keys(method) if g == f])
			isempty(steps) && continue
			push!(frequencies, Dict("name" => f, "series" => count(s -> frequency_of[s] == f, numbers), "h" => steps,
				"method" => Dict("sMAPE" => means(method, f, steps, 1), "MASE" => means(method, f, steps, 2)),
				"naive2" => Dict("sMAPE" => means(naive2, f, steps, 1), "MASE" => means(naive2, f, steps, 2))))
		end
		write_json("horizon.json", Dict("frequencies" => frequencies))` + nextStepEnd('horizon');
}

/**
 * series.jl: one series of the run, the one named or at the place of `request`: the values the forecasters saw, those
 * it was scored on, the method's forecast, and the eight statistical benchmarks computed on it.
 */
function seriesScript(folder: URI, request: INextStepRequest): string {
	const find = request.name !== undefined
		? String.raw`
		wanted = raw"${request.name}"
		k = findfirst(==(wanted), known.name)
		k === nothing && error(string(wanted, " is not a series of this dataset."))
		position = findfirst(==(known.series[k]), numbers)
		position === nothing && error(string(wanted, " is not among the series of this run."))`
		: String.raw`
		position = clamp(${request.position ?? 1}, 1, length(numbers))`;
	return nextStepStart('series', folder, 'Browse the Series, one series of the run with its forecasts') + String.raw`
		mine = read_forecasts()
		numbers = unique(mine.series)
		known = PC.series(id)
		row_of = Dict(s => k for (k, s) in enumerate(known.series))` + find + String.raw`
		s = numbers[position]
		k = row_of[s]
		h, period = Int(known.horizon[k]), Int(known.period[k])
		past = Float64.(PC.observations(id; series = s, split = "train").value)
		rows = findall(==(s), mine.series)
		forecast = mine.value[rows][sortperm(mine.h[rows])]
		# The benchmarks on this series, as PollisCompetitions.Benchmarks computes them, each that the series is long enough for
		benchmarks = Dict{String, Any}()
		for m in PC.BENCHMARK_METHODS
			try
				benchmarks[m] = getproperty(PC.Benchmarks.benchmarks(past; period, horizon = h, methods = (Symbol(m),)), Symbol(m))
			catch
			end
		end
		write_json("series.json", Dict("position" => position, "count" => length(numbers), "name" => known.name[k], "frequency" => known.frequency[k],
			"horizon" => h, "past" => past[max(1, end - 4999):end], "actual" => PC.observations(id; series = s, split = "test").value,
			"forecast" => forecast, "benchmarks" => benchmarks))` + nextStepEnd('series');
}

/**
 * fails.jl: the sMAPE and the MASE over the horizon of each series of the run, of the method and of Naive2, and each
 * relative to Naive2's; how many series the method forecasts better than Naive2, by frequency; and the 100 series
 * where the method does worst by each of the four, which the page's table holds.
 */
function failsScript(folder: URI): string {
	return nextStepStart('fails', folder, 'Where It Fails, the series where the method does worst against Naive2') + String.raw`
		mine = read_forecasts()
		numbers = unique(mine.series)
		known = PC.series(id)
		row_of = Dict(s => k for (k, s) in enumerate(known.series))
		println("Errors of the method and of Naive2 on each series")
		method, naive2 = series_means(PC.step_errors(id, mine)), series_means(PC.step_errors(id, naive2_forecasts(numbers)))
		rows = [Dict{String, Any}("name" => known.name[row_of[s]], "frequency" => known.frequency[row_of[s]],
			"smape" => method[s].smape, "naive2_smape" => naive2[s].smape, "relative_smape" => relative(method[s].smape, naive2[s].smape),
			"mase" => method[s].mase, "naive2_mase" => naive2[s].mase, "relative_mase" => relative(method[s].mase, naive2[s].mase)) for s in numbers]
		# How many series the method forecasts better and worse than Naive2, by frequency and in total
		function tally(name, chosen)
			Dict("name" => name, "series" => length(chosen),
				"better_smape" => count(r -> r["smape"] < r["naive2_smape"], chosen), "worse_smape" => count(r -> r["smape"] > r["naive2_smape"], chosen),
				"better_mase" => count(r -> r["mase"] < r["naive2_mase"], chosen), "worse_mase" => count(r -> r["mase"] > r["naive2_mase"], chosen))
		end
		frequencies = [tally(f, filter(r -> r["frequency"] == f, rows)) for f in unique(known.frequency) if any(r -> r["frequency"] == f, rows)]
		length(frequencies) > 1 && push!(frequencies, tally("Total", rows))
		worst = Set{Int}()
		for key in ("relative_mase", "relative_smape", "mase", "smape")
			union!(worst, partialsortperm([r[key] for r in rows], 1:min(100, length(rows)); rev = true))
		end
		write_json("fails.json", Dict("series" => length(rows), "frequencies" => frequencies, "rows" => rows[sort(collect(worst))]))` + nextStepEnd('fails');
}

/** The Julia script of a Next Step of the run in `folder`; `request` says what Browse the Series shows. */
function nextStepScript(step: NextStep, folder: URI, request: INextStepRequest): string {
	switch (step) {
		case 'horizon': return horizonScript(folder);
		case 'series': return seriesScript(folder, request);
		case 'fails': return failsScript(folder);
	}
}

/**
 * run.jl of a run: runs forecast of method.jl on each series chosen, over Julia's threads, writes the forecasts and
 * scores them with PollisCompetitions.jl by sMAPE, MASE and OWA, beside the eight statistical benchmarks computed on
 * the same series; then writes results.json, which step 4 draws.
 */
function runScript(folder: URI): string {
	return String.raw`# Score Models: the method of method.jl on the series of run.toml, scored by sMAPE, MASE and OWA beside
# the benchmarks; progress.json while it runs, then forecasts.csv and results.json
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC, Random, TOML
let run = raw"${folder.fsPath}"
${JULIA_JSON}
	settings = TOML.parsefile(joinpath(run, "${RUN_FILE}"))
	# A dataset of the user's own is read from its folder, which PollisCompetitions.jl takes in place of an id
	id, frequency, sample, seed = get(settings, "folder", settings["competition"]), settings["frequency"], settings["sample"], settings["seed"]
	measures = ["sMAPE", "MASE", "OWA"]
	level = isempty(frequency) ? "Total" : frequency
	try
		isdefined(PC, :BENCHMARK_METHODS) || error("Score Models needs a newer PollisCompetitions.jl: update it with Pkg.update(\"PollisCompetitions\").")
		method = Module(:Method)
		Base.include(method, joinpath(run, "${METHOD_FILE}"))
		isdefined(method, :forecast) || error("method.jl defines no function forecast(y, h, period).")
		forecast = getfield(method, :forecast)
		known = PC.series(id; frequency = isempty(frequency) ? nothing : frequency)
		numbers = collect(known.series)
		whole = sample <= 0 || sample >= length(numbers)
		whole || (numbers = sort(Random.shuffle(Random.Xoshiro(seed), numbers)[1:sample]))
		period, horizon, name = Dict(zip(known.series, known.period)), Dict(zip(known.series, known.horizon)), Dict(zip(known.series, known.name))
		# The values the forecasters saw, of the series chosen, in order
		seen = PC.observations(id; series = whole ? nothing : numbers, frequency = whole && !isempty(frequency) ? frequency : nothing, split = "train")
		n = length(numbers)
		starts = [searchsortedfirst(seen.series, number) for number in numbers]
		stops = [k == n ? length(seen.series) : starts[k + 1] - 1 for k in 1:n]
		forecasts = Vector{Vector{Float64}}(undef, n)
		failed = fill("", n)
		started = time()
		chunk = max(1, cld(n, 100))
		for from in 1:chunk:n
			to = min(n, from + chunk - 1)
			Threads.@threads for k in from:to
				h = horizon[numbers[k]]
				try
					f = Float64.(collect(Base.invokelatest(forecast, Float64.(seen.value[starts[k]:stops[k]]), h, period[numbers[k]])))
					length(f) == h || error("forecast gave $(length(f)) values, not $(h).")
					all(isfinite, f) || error("forecast gave values that are not finite.")
					forecasts[k] = f
				catch err
					failed[k] = sprint(showerror, err)
				end
			end
			write_json("${PROGRESS_FILE}", Dict("done" => to, "total" => n, "seconds" => time() - started, "failed" => count(!isempty, failed)))
			print("\rForecast ", to, " of ", n, " series")
		end
		println()
		bad = findall(!isempty, failed)
		isempty(bad) || error(string(length(bad), " series were not forecast, the first ", name[numbers[bad[1]]], ": ", failed[bad[1]]))
		table = (; series = reduce(vcat, [fill(numbers[k], length(forecasts[k])) for k in 1:n]), h = reduce(vcat, [collect(eachindex(f)) for f in forecasts]), value = reduce(vcat, forecasts))
		open(joinpath(run, "${FORECASTS_FILE}"), "w") do io
			println(io, "series,h,value")
			for (s, h, v) in zip(table.series, table.h, table.value)
				println(io, s, ",", h, ",", repr(v))
			end
		end
		println("Scoring the forecasts")
		pick(scores) = Dict(m => only(scores.value[(scores.measure .== m) .& (scores.breakdown .== "frequency") .& (scores.level .== level)]) for m in measures)
		mine = pick(PC.score(id, table))
		# The benchmarks computed on the same series, with PollisCompetitions.Benchmarks: each that every series of the run is long enough for
		println("Computing the benchmarks on the same series")
		benchmarks = Dict{String, Any}[]
		for m in PC.BENCHMARK_METHODS
			computed = try
				PC.benchmarks(id; methods = [m], series = numbers)
			catch
				nothing
			end
			computed === nothing || push!(benchmarks, Dict("name" => m, "scores" => pick(PC.score(id, computed))))
		end
		# A series to plot: the first chosen
		s = numbers[1]
		past = Float64.(seen.value[starts[1]:stops[1]])
		past = past[max(1, end - 3 * horizon[s] + 1):end]
		plot = Dict("series" => name[s], "past" => past, "actual" => PC.observations(id; series = s, split = "test").value, "forecast" => forecasts[1])
		write_json("${RESULTS_FILE}", Dict("finished" => Libc.strftime("%Y-%m-%d %H:%M", time()), "series" => n, "whole" => whole, "level" => level,
			"measures" => measures, "method" => mine, "benchmarks" => benchmarks, "plot" => plot, "seconds" => time() - started))
		println("Results in ", joinpath(run, "${RESULTS_FILE}"))
	catch err
		write_json("${RESULTS_FILE}", Dict("error" => sprint(showerror, err)))
		println("The run stopped: ", sprint(showerror, err))
	end
end`;
}

/**
 * run.jl of a run on a tabular or survival dataset: runs predict of method.jl on each split chosen, one after another,
 * checks its predictions and scores them on the test rows with PollisCompetitions.jl, by the measure of the dataset's
 * Response Type or the survival measures; then ranks the mean over the splits among the published runs on the
 * dataset (published.tsv, read from the package unless the run of several datasets wrote it) and writes scores.csv
 * and results.json, which step 4 draws.
 */
function scoredRunScript(folder: URI): string {
	return String.raw`# Score Models: the method of method.jl on the splits of run.toml's dataset, scored by the measures of its
# benchmark beside the published runs; progress.json while it runs, then scores.csv and results.json
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC, TOML
let run = raw"${folder.fsPath}"
${JULIA_JSON}
	settings = TOML.parsefile(joinpath(run, "${RUN_FILE}"))
	id, kind, first_repeat = settings["competition"], settings["kind"], settings["splits"] == "first"
	try
		isdefined(PC, :outer_splits) || error("Score Models needs a newer PollisCompetitions.jl: update it with Pkg.update(\"PollisCompetitions\").")
		method = Module(:Method)
		Base.include(method, joinpath(run, "${METHOD_FILE}"))
		isdefined(method, :predict) || error("method.jl defines no function predict.")
		predict = getfield(method, :predict)
		fields = PC.info(id)
		response_type = PC.competition(id)["response_type"]
		data = PC.query("SELECT * FROM $(PC.table_sql(id, "data.parquet"))")
		splits = PC.outer_splits(id)
		all_splits = length(splits)
		first_repeat && filter!(s -> s.repeat == 1, splits)
		# The rows of the data, without the columns named in drop, as a table of columns
		rows_of(rows, drop) = (; (name => getproperty(data, name)[rows] for name in keys(data) if !(String(name) in drop))...)
		measures = kind == "survival" ? collect(PC.SURVIVAL_MEASURES) : [PC.TABULAR_MEASURES[response_type]]
		if kind == "survival"
			time_name, event_name = fields["target"], fields["event"]
			survival_time, survival_event = Float64.(getproperty(data, Symbol(time_name))), Int.(getproperty(data, Symbol(event_name)))
		else
			target = fields["target"]
			y = getproperty(data, Symbol(target))
			classes = response_type in ("Binary", "Multiclass") ? sort(unique(y)) : eltype(y)[]
		end
		# The scores of the method's predictions on the test rows of split s, once checked
		function split_scores(s)
			if kind == "survival"
				times = sort(unique(survival_time[s.train]))
				p = Base.invokelatest(predict, rows_of(s.train, ()), rows_of(s.test, (time_name, event_name)), time_name, event_name, times)
				p isa AbstractMatrix && size(p) == (length(s.test), length(times)) || error(string("predict gave ", summary(p), ", not a matrix of ", length(s.test), " rows and ", length(times), " columns."))
				curves = Float64.(p)
				all(v -> 0 <= v <= 1, curves) || error("predict gave survival probabilities that are not in [0, 1].")
				all(r -> all(<=(1e-12), diff(view(curves, r, :))), axes(curves, 1)) || error("predict gave a survival curve that increases.")
				return PC.survival_scores(survival_time[s.train], survival_event[s.train], survival_time[s.test], survival_event[s.test], times, curves)
			end
			p = Base.invokelatest(predict, rows_of(s.train, ()), rows_of(s.test, (target,)), target, response_type, classes)
			truth = y[s.test]
			if response_type == "Multiclass"
				p isa AbstractMatrix && size(p) == (length(s.test), length(classes)) || error(string("predict gave ", summary(p), ", not a matrix of ", length(s.test), " rows and ", length(classes), " columns."))
				probabilities = Float64.(p)
				all(v -> 0 <= v <= 1, probabilities) || error("predict gave probabilities that are not in [0, 1].")
				all(r -> abs(sum(view(probabilities, r, :)) - 1) <= 1e-6, axes(probabilities, 1)) || error("predict gave a row of probabilities that does not sum to 1.")
				return PC.tabular_scores(response_type, [findfirst(==(v), classes) for v in truth], probabilities)
			end
			p isa AbstractVector && length(p) == length(s.test) || error(string("predict gave ", summary(p), ", not a vector of ", length(s.test), " values."))
			predicted = Float64.(p)
			all(isfinite, predicted) || error("predict gave values that are not finite.")
			if response_type == "Binary"
				all(v -> 0 <= v <= 1, predicted) || error("predict gave probabilities that are not in [0, 1].")
				return PC.tabular_scores(response_type, truth .== classes[2], predicted)
			end
			PC.tabular_scores(response_type, Float64.(truth), predicted)
		end
		per_split = Dict{String, Any}[]
		started = Base.time()
		for (k, s) in enumerate(splits)
			scores = nothing
			seconds = @elapsed try
				scores = split_scores(s)
			catch err
				error(string("Split ", k, " (repeat ", s.repeat, ", fold ", s.fold, "): ", sprint(showerror, err)))
			end
			push!(per_split, Dict{String, Any}("repeat" => s.repeat, "fold" => s.fold, "scores" => scores, "seconds" => seconds))
			write_json("${PROGRESS_FILE}", Dict("done" => k, "total" => length(splits), "seconds" => Base.time() - started, "failed" => 0))
			println("Split ", k, " of ", length(splits), ": ", join([string(m, " ", round(scores[m]; digits = 4)) for m in measures], ", "))
		end
		mine = Dict(m => sum(r["scores"][m] for r in per_split) / length(per_split) for m in measures)
		open(joinpath(run, "${SCORES_FILE}"), "w") do io
			println(io, join(["repeat"; "fold"; measures; "seconds"], ","))
			for r in per_split
				println(io, join([string(r["repeat"]); string(r["fold"]); [repr(Float64(r["scores"][m])) for m in measures]; repr(r["seconds"])], ","))
			end
		end
		# The published runs on the dataset, by model, with their scores on the measures of the run
		file = joinpath(run, "${PUBLISHED_FILE}")
		if !isfile(file)
			println("Reading the published runs")
			found = PC.published_scores(id)
			open(file, "w") do io
				for k in eachindex(found.model_id)
					println(io, found.model_id[k], '\t', replace(found.model_name[k], '\t' => ' '), '\t', found.metric[k], '\t', repr(Float64(found.score[k])))
				end
			end
		end
		published = Dict{String, Dict{String, Any}}()
		for line in eachline(file)
			model, name, metric, score = split(line, '\t')
			metric in measures || continue
			entry = get!(published, model, Dict{String, Any}("model" => model, "name" => name, "scores" => Dict{String, Float64}()))
			entry["scores"][metric] = parse(Float64, score)
		end
		# The method's place among the published runs on each measure: 1 and one more for each run that does better
		loss(m, v) = PC.measure_loss(m, v)
		ranks = Dict(m => Dict("rank" => 1 + count(e -> haskey(e["scores"], m) && loss(m, e["scores"][m]) < loss(m, mine[m]), values(published)),
			"of" => 1 + count(e -> haskey(e["scores"], m), values(published))) for m in measures)
		write_json("${RESULTS_FILE}", Dict("finished" => Libc.strftime("%Y-%m-%d %H:%M", Base.time()), "kind" => kind, "response_type" => response_type,
			"splits" => length(splits), "all_splits" => all_splits, "first_repeat" => first_repeat, "measures" => measures,
			"best" => Dict(m => PC.MEASURE_BEST[m] for m in measures), "method" => mine, "per_split" => per_split,
			"published" => collect(values(published)), "ranks" => ranks, "seconds" => Base.time() - started))
		println("Results in ", joinpath(run, "${RESULTS_FILE}"))
	catch err
		write_json("${RESULTS_FILE}", Dict("error" => sprint(showerror, err)))
		println("The run stopped: ", sprint(showerror, err))
	end
end`;
}

/** Opens the Score Models page, or shows it when it is open. */
async function openForecastingCompetitionsPage(accessor: ServicesAccessor): Promise<void> {
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
	const languageService = accessor.get(ILanguageService);
	const themeService = accessor.get(IThemeService);
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('competitions.title', "Score Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.forecastingCompetitions',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'forecastingCompetitions', title, FORECASTINGCOMPETITIONS_METADATA.forecastingCompetitions, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The method's code as the page last sent it, and how many times it has been coloured. */
	let lastCode: string | undefined;
	let codeVersion = 0;
	/** Colours the method's code as the editor colours Julia, for the code box of step 2, and its brackets by depth. */
	const postCode = async (text: string): Promise<void> => {
		lastCode = text;
		// Tokenizing is async: drop a result that a newer code has already overtaken
		const version = ++codeVersion;
		const html = await tokenizeToString(languageService, text, 'julia');
		if (version !== codeVersion) {
			return;
		}
		const colorMap = TokenizationRegistry.getColorMap();
		post({ command: 'colorizedCode', box: 'codeColors', html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '', text });
	};
	disposables.add(themeService.onDidColorThemeChange(() => {
		if (lastCode !== undefined) {
			postCode(lastCode);
		}
	}));

	const home = await pathService.userHome({ preferLocal: true });
	const competitionsFolder = joinPath(home, '.pollis', 'competitions');
	const runsFolder = joinPath(competitionsFolder, 'runs');
	await fileService.createFolder(runsFolder);

	/** The run of one dataset shown in steps 3 and 4, once started or opened: in a run of several, the dataset chosen. */
	let current: URI | undefined;
	/** The run of several datasets shown, whose subfolders are the runs of its datasets, `current` one of them. */
	let batch: URI | undefined;
	/** The run Compare Two Runs sets beside the current one, if any. */
	let other: URI | undefined;
	/** The datasets step 1 can list: those of PollisCompetitions.jl, then the datasets of the user's own, as last read. */
	let known: readonly IScoredDataset[] = [];
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	// The folder of the competitions, for the data that come into it, and the folders of the run shown, for the files they write
	const competitionsWatcher = disposables.add(fileService.createWatcher(competitionsFolder, { recursive: false, excludes: [] }));
	disposables.add(competitionsWatcher.onDidChange(() => refresh.schedule()));
	// The datasets ticked in Manage Challenge Datasets, which step 1 lists
	disposables.add(onDidChangeActiveDatasets(storageService, () => refresh.schedule()));
	const runWatcher = disposables.add(new MutableDisposable<DisposableStore>());
	/** Shows the run in `folder`, or none; of a run of several datasets, that of `member`, else the first. */
	const show = async (folder: URI | undefined, member?: string) => {
		other = undefined;
		const choices = folder && await readBatch(fileService, folder);
		batch = choices ? folder : undefined;
		current = choices && folder ? joinPath(folder, member && choices.datasets.includes(member) ? member : choices.datasets[0]) : folder;
		const watched = choices && folder ? [folder, ...choices.datasets.map(id => joinPath(folder, id))] : folder ? [folder] : [];
		const store = new DisposableStore();
		for (const watchedFolder of watched) {
			store.add(store.add(fileService.createWatcher(watchedFolder, { recursive: false, excludes: [] })).onDidChange(() => refresh.schedule()));
		}
		runWatcher.value = store;
	};

	/** The datasets the user added to the Pollis Workspace that are converted, as step 1 lists them, but those whose ids are in `taken`. */
	const userDatasets = async (taken: ReadonlySet<string>): Promise<IScoredDataset[]> => {
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		if (!workspace) {
			return [];
		}
		const folder = await forecastingFolder(fileService, workspace);
		const found: IScoredDataset[] = [];
		for (const { id } of await addedDatasetFiles(fileService, folder)) {
			const dataset = await readAddedDataset(fileService, folder, id);
			const files = joinPath(folder, id);
			if (!dataset || taken.has(id) || !await fileService.exists(joinPath(files, 'series.parquet'))) {
				continue;
			}
			const { conversion } = dataset;
			found.push({
				id, name: typeof dataset.dataset.dataset_name === 'string' ? dataset.dataset.dataset_name : id, kind: 'series',
				frequencies: [{ name: conversion.frequency, series: conversion.series, shortest: conversion.horizon, longest: conversion.horizon }],
				folder: files.fsPath,
			});
		}
		return found;
	};

	const runNames = async (): Promise<string[]> => {
		const stat = await fileService.resolve(runsFolder, { resolveMetadata: true });
		const found = [];
		for (const child of stat.children ?? []) {
			if (child.isDirectory && await fileService.exists(joinPath(child.resource, RUN_FILE))) {
				found.push(child);
			}
		}
		return found.sort((a, b) => b.mtime - a.mtime).map(child => child.name);
	};

	const sendState = async () => {
		const run = current && await readRun(fileService, current);
		const batchChoices = batch && await readBatch(fileService, batch);
		// The datasets of PollisCompetitions.jl that are active or of the run shown, then those of the user's own
		const stored = activeDatasets(storageService).scored;
		const packaged = await packageScoredDatasets(fileService, pathService, [...new Set([...stored, ...(batchChoices ? batchChoices.datasets : run ? [run.competition] : [])])]);
		known = [...packaged, ...await userDatasets(new Set(packaged.map(dataset => dataset.id)))];
		const names = await runNames();
		const batches = (await Promise.all(names.map(async name => await readBatch(fileService, joinPath(runsFolder, name)) ? [name] : []))).flat();
		let code: string | undefined;
		if (current && run) {
			try {
				code = (await fileService.readFile(joinPath(current, METHOD_FILE))).value.toString();
			} catch {
				code = undefined;
			}
		}
		post({
			command: 'state',
			root: runsFolder.fsPath,
			datasets: known,
			// The active datasets that the page scores, as Manage Challenge Datasets keeps them
			active: stored.filter(id => known.some(dataset => dataset.id === id)),
			runs: names,
			batches,
			batch: batch && batchChoices && {
				name: basename(batch),
				...batchChoices,
				members: await Promise.all(batchChoices.datasets.map(async id => ({
					id,
					progress: await readJson(fileService, joinPath(batch!, id, PROGRESS_FILE)),
					results: briefResults(await readJson(fileService, joinPath(batch!, id, RESULTS_FILE))),
				}))),
			},
			run: current && run && {
				name: current.path.split('/').pop(),
				...run,
				code,
				progress: await readJson(fileService, joinPath(current, PROGRESS_FILE)),
				results: await readJson(fileService, joinPath(current, RESULTS_FILE)),
				hasForecasts: await fileService.exists(joinPath(current, FORECASTS_FILE)),
				hasScores: await fileService.exists(joinPath(current, SCORES_FILE)),
				next: Object.fromEntries(await Promise.all(NEXT_STEPS.map(async step => [step, await readJson(fileService, joinPath(current!, `${step}.json`))]))),
				other: other && await readOther(other),
			},
		});
	};

	/** The run that Compare Two Runs sets beside the current one: its choices and its results. */
	const readOther = async (folder: URI) => {
		const choices = await readRun(fileService, folder);
		return choices && { name: basename(folder), ...choices, results: await readJson(fileService, joinPath(folder, RESULTS_FILE)) };
	};

	/**
	 * Writes the run's folder and sends run.jl to the Julia REPL: for one dataset, a run of it; for several, a folder
	 * with a run of each in the subfolder named by its id, and a run.jl that runs them in turn.
	 */
	const startRun = async (inputs: Omit<IRunInputs, 'datasets'> & { readonly datasets: readonly IScoredDataset[] }) => {
		const packageIds = inputs.datasets.filter(dataset => !dataset.folder).map(dataset => dataset.id);
		const present = new Set((await packageScoredDatasets(fileService, pathService, packageIds)).map(dataset => dataset.id));
		const missing = inputs.datasets.filter(dataset => !dataset.folder && !present.has(dataset.id)).map(dataset => dataset.name);
		if (missing.length) {
			post({ command: 'runProblem', text: localize('competitions.notOnComputer', "The data of {0} are not on this computer.", missing.join(', ')) });
			return;
		}
		const name = METHOD_FUNCTIONS[inputs.kind];
		if (!new RegExp(`\\bfunction\\s+${name}\\s*\\(|\\b${name}\\s*\\([^)]*\\)\\s*=`).test(inputs.code)) {
			post({
				command: 'runProblem', text: inputs.kind === 'series'
					? localize('competitions.noFunction', "Your method must define a function forecast(y, h, period).")
					: inputs.kind === 'tabular'
						? localize('competitions.noPredictTabular', "Your method must define a function predict(train, test, target, response_type, classes).")
						: localize('competitions.noPredictSurvival', "Your method must define a function predict(train, test, time, event, times).")
			});
			return;
		}
		const now = new Date();
		const stamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
		const started = now.toISOString().slice(0, 16).replace('T', ' ');
		const writeRun = async (folder: URI, dataset: IScoredDataset, frequency: string) => {
			const choices: IRunChoices = { kind: inputs.kind, competition: dataset.id, frequency, sample: inputs.sample, seed: inputs.seed, splits: inputs.splits, ...(dataset.folder ? { folder: dataset.folder } : {}) };
			await fileService.writeFile(joinPath(folder, RUN_FILE), VSBuffer.fromString(runToml(choices, started)));
			await fileService.writeFile(joinPath(folder, METHOD_FILE), VSBuffer.fromString(inputs.code));
			await fileService.writeFile(joinPath(folder, SCRIPT_FILE), VSBuffer.fromString(inputs.kind === 'series' ? runScript(folder) : scoredRunScript(folder)));
		};
		const writeGroup = async (group: readonly IScoredDataset[], frequency: string): Promise<URI> => {
			if (group.length === 1) {
				const dataset = group[0];
				const folder = joinPath(runsFolder, `${dataset.id.replace(/_/g, '-')}${frequency ? '-' + frequency.toLowerCase() : ''}-${stamp}`);
				await writeRun(folder, dataset, frequency);
				return folder;
			}
			const folder = joinPath(runsFolder, `datasets-${stamp}`);
			for (const dataset of group) {
				await writeRun(joinPath(folder, dataset.id), dataset, '');
			}
			const ids = group.map(dataset => dataset.id);
			await fileService.writeFile(joinPath(folder, RUN_FILE), VSBuffer.fromString(batchToml({ kind: inputs.kind, datasets: ids, sample: inputs.sample, seed: inputs.seed, splits: inputs.splits, started })));
			await fileService.writeFile(joinPath(folder, METHOD_FILE), VSBuffer.fromString(inputs.code));
			await fileService.writeFile(joinPath(folder, SCRIPT_FILE), VSBuffer.fromString(batchScript(folder, ids, inputs.kind)));
			return folder;
		};
		const folder = await writeGroup(inputs.datasets, inputs.datasets.length === 1 ? inputs.frequency : '');
		await show(folder);
		await sendState();
		await sendToJuliaRepl(`include(raw"${joinPath(folder, SCRIPT_FILE).fsPath}")`, commandService);
		post({ command: 'running' });
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: CompetitionsMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'codeDraft' && hasKey(message, { text: true }) && typeof message.text === 'string') {
				await postCode(message.text);
			} else if (message.command === 'ready') {
				await sendState();
			} else if (message.command === 'run' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs, known);
				if (inputs) {
					await startRun(inputs);
				}
			} else if (message.command === 'load' && hasKey(message, { name: true }) && /^[a-z0-9-]+$/.test(message.name)) {
				await show(joinPath(runsFolder, message.name));
				await sendState();
			} else if (message.command === 'member' && hasKey(message, { id: true }) && typeof message.id === 'string' && batch) {
				await show(batch, message.id);
				await sendState();
			} else if (message.command === 'compareWith' && hasKey(message, { name: true }) && current) {
				other = /^[a-z0-9-]+$/.test(message.name) ? joinPath(runsFolder, message.name) : undefined;
				await sendState();
			} else if (message.command === 'diffMethods' && current && other) {
				await editorService.openEditor({ original: { resource: joinPath(other, METHOD_FILE) }, modified: { resource: joinPath(current, METHOD_FILE) } });
			} else if (message.command === 'manage') {
				await commandService.executeCommand(FORECASTING_CATALOGUE_COMMAND_ID);
			} else if (message.command === 'newRun') {
				await show(undefined);
				await sendState();
			} else if (message.command === 'open' && hasKey(message, { what: true }) && current) {
				const file = { method: METHOD_FILE, forecasts: FORECASTS_FILE, scores: SCORES_FILE, script: SCRIPT_FILE }[message.what];
				if (file) {
					await editorService.openEditor({ resource: joinPath(current, file) });
				}
			} else if (message.command === 'nextStep' && hasKey(message, { step: true }) && current) {
				const step = NEXT_STEPS.find(s => s === message.step);
				if (step && await fileService.exists(joinPath(current, FORECASTS_FILE))) {
					const script = joinPath(current, `${step}.jl`);
					await fileService.writeFile(script, VSBuffer.fromString(nextStepScript(step, current, checkedRequest(message))));
					await sendToJuliaRepl(`include(raw"${script.fsPath}")`, commandService);
				}
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

function pageHtml(): string {
	const text = {
		intro: localize('competitions.intro', "Score Models runs a method of your own on challenge datasets and scores it as each dataset's competition or benchmark scored its models. On forecasting datasets, your method forecasts each series from the values the forecasters saw, and its forecasts are scored by sMAPE, MASE and OWA, beside the eight statistical benchmarks computed on the same series. On tabular and survival datasets, it is fitted on the training rows of each published split and predicts the test rows, and its predictions are scored by the measures of the dataset's benchmark, beside the published runs on the same splits. Score Models lists the datasets active in Manage Challenge Datasets on which it scores models, those of PollisCompetitions.jl and those you add there, and scores your method on several datasets of one kind in one run, each in turn, its scores on them side by side."),
		datasetsStep: localize('competitions.datasetsStep', "Datasets"),
		dataset: localize('competitions.dataset', "Dataset"),
		severalHint: localize('competitions.severalHint', "The datasets active in Manage Challenge Datasets on which Score Models can score models, of the kind chosen. A run scores your method on each in turn, with the same choices; a frequency is chosen only when there is one dataset. To use other datasets, tick them in the column Active of Manage Challenge Datasets."),
		kindOfDataset: localize('competitions.kindOfDataset', "Kind of Dataset"),
		kinds: {
			series: localize('competitions.kindSeries', "Series"),
			tabular: localize('competitions.kindTabular', "Tabular"),
			survival: localize('competitions.kindSurvival', "Survival"),
		},
		kindHint: localize('competitions.kindHint', "Your method differs by kind of dataset, so a run holds datasets of one kind: datasets of another kind need a run of their own."),
		rows: localize('competitions.rows', "Rows"),
		responseType: localize('competitions.responseType', "Response Type"),
		measure: localize('competitions.measure', "Measure"),
		splitsColumn: localize('competitions.splitsColumn', "Splits"),
		splitsCount: localize('competitions.splitsCount', "{0} ({1} × {2})"),
		datasetsHintScored: localize('competitions.datasetsHintScored', "Each dataset is scored from its data on this computer, built in with PollisCompetitions.jl or downloaded into {0}. Each split holds out its test rows from your method, which is fitted on the other rows; its predictions of the test rows are scored by the measures of the dataset's benchmark: rmse for Continuous and Count, the area under the ROC curve for Binary, log loss for Multiclass, and for Survival Harrell's C, Uno's C, the integrated survival Brier score and log loss, their explained residual variation, D-calibration and alpha-calibration.", '<span class="yellow">~/.pollis/competitions</span>'),
		splitsToRun: localize('competitions.splitsToRun', "Splits to Run"),
		allSplits: localize('competitions.allSplits', "All the Published Splits"),
		firstRepeat: localize('competitions.firstRepeat', "The First Repeat"),
		splitsHint: localize('competitions.splitsHint', "The published scores are means over all the published splits, so only a run on all of them is compared with them as an equal. The first repeat fits your method 3 times on a dataset of 3 folds, and its comparison is indicative. {0}"),
		fits: localize('competitions.fits', "This run fits your method {0} times."),
		noneActive: localize('competitions.noneActive', "None of the active datasets is one on which Score Models can score models. Tick the datasets to use in the column Active of Manage Challenge Datasets, where the column Model Scoring says which are Ready."),
		manage: localize('competitions.manage', "Open Manage Challenge Datasets"),
		batchTitle: localize('competitions.batchTitle', "Datasets of This Run"),
		batchHint: localize('competitions.batchHint', "A row for each dataset, your method scored on each in turn. Select a row to see its scores on that dataset and a series below, and its Next Steps."),
		status: localize('competitions.status', "Status"),
		waiting: localize('competitions.waiting', "Waiting"),
		done: localize('competitions.done', "Done"),
		stoppedShort: localize('competitions.stoppedShort', "Stopped"),
		batchProgress: localize('competitions.batchProgress', "Dataset {0} of {1}, {2}: "),
		batchDone: localize('competitions.batchDone', "All {0} datasets run."),
		series: localize('competitions.series', "Series"),
		frequencies: localize('competitions.frequencies', "Frequencies and Horizons"),
		datasetsHint: localize('competitions.datasetsHint', "Each dataset is scored from its data on this computer, built in with PollisCompetitions.jl, downloaded into {0}, or added to your Pollis Workspace. The horizon of a series is the number of its last values held out from the forecasters.", '<span class="yellow">~/.pollis/competitions</span>'),
		frequency: localize('competitions.frequency', "Frequency"),
		allFrequencies: localize('competitions.allFrequencies', "All"),
		seriesToRun: localize('competitions.seriesToRun', "Series to Run"),
		allSeries: localize('competitions.allSeries', "All"),
		sampleOf: localize('competitions.sampleOf', "A Sample of"),
		seed: localize('competitions.seed', "Seed"),
		sampleHint: localize('competitions.sampleHint', "A sample is drawn with the seed, so that the same seed gives the same series. The benchmarks are computed on the same series as your method."),
		yourMethod: localize('competitions.yourMethod', "Your Method"),
		methodHints: {
			series: localize('competitions.methodHint', "A Julia function forecast(y, h, period) that returns h forecasts of the series y, whose seasonal period is period. It runs on each series on its own, over Julia's threads when the REPL has several. The example is the benchmark Theta."),
			tabular: localize('competitions.methodHintTabular', "A Julia function predict(train, test, target, response_type, classes) that predicts the target of the test rows from the training rows: numbers, the probability of the second class, or a probability for each class. It runs on each split in turn, and draws no random numbers unless it seeds them itself, so that a run can be repeated. The example predicts the training mean or the share of each class."),
			survival: localize('competitions.methodHintSurvival', "A Julia function predict(train, test, time, event, times) that gives each test row its probability of surviving past each of times, from the training rows. It runs on each split in turn, and draws no random numbers unless it seeds them itself, so that a run can be repeated. The example is the Kaplan-Meier estimate."),
		},
		otherKindMethod: localize('competitions.otherKindMethod', "The method in the box is not of this kind of dataset: Reset to the Example puts in the example of this kind."),
		reset: localize('competitions.reset', "Reset to the Example"),
		run: localize('competitions.run', "Run"),
		runHint: localize('competitions.runHint', "Run writes the run's folder in {0} and runs it in the Julia REPL: the method on every series or split chosen, then the scores. The progress shows here as it runs.", '<span class="yellow" id="root"></span>'),
		start: localize('competitions.start', "Run the Method"),
		earlier: localize('competitions.earlier', "Earlier runs..."),
		newRun: localize('competitions.newRun', "New Run"),
		runShown: localize('competitions.runShown', "A run is shown: New Run starts another."),
		noneListed: localize('competitions.noneListed', "Step 1 lists no dataset: tick the datasets to use in the column Active of Manage Challenge Datasets."),
		running: localize('competitions.running', "Sent to the Julia REPL."),
		progress: localize('competitions.progress', "{0} of {1} series forecast, {2} s"),
		failedSeries: localize('competitions.failedSeries', "{0} series not forecast"),
		progressSplits: localize('competitions.progressSplits', "{0} of {1} splits run, {2} s"),
		noRun: localize('competitions.noRun', "No run yet: choose the datasets and the method, then run it."),
		openMethod: localize('competitions.openMethod', "method.jl"),
		openScript: localize('competitions.openScript', "run.jl"),
		openForecasts: localize('competitions.openForecasts', "forecasts.csv"),
		openScores: localize('competitions.openScores', "scores.csv"),
		scoresStep: localize('competitions.scoresStep', "Scores"),
		resultsHint: localize('competitions.resultsHint', "The scores show here once the run ends."),
		finished: localize('competitions.finished', "{0} series, finished {1}."),
		finishedSplits: localize('competitions.finishedSplits', "{0} splits, finished {1}."),
		indicative: localize('competitions.indicative', "Computed on the first repeat, {0} of the {1} published splits: the published scores are means over all of them, so the comparison is indicative."),
		scoredHint: localize('competitions.scoredHint', "Your method's mean over the splits, its rank among the published runs on the dataset (1 is the best), and the best, the median and the worst of them. Lower is better for rmse, log loss, the integrated Brier score and log loss, and D-calibration; higher for the area under the ROC curve, the C-indices and the explained residual variation; alpha-calibration is best at 1."),
		yourRank: localize('competitions.yourRank', "Your Rank"),
		rankOf: localize('competitions.rankOf', "{0} of {1}"),
		bestPublished: localize('competitions.bestPublished', "Best Published"),
		medianPublished: localize('competitions.medianPublished', "Median Published"),
		worstPublished: localize('competitions.worstPublished', "Worst Published"),
		noPublished: localize('competitions.noPublished', "There are no published runs on this dataset: the scores are your method's alone."),
		publishedRuns: localize('competitions.publishedRuns', "Published Runs"),
		publishedHint: localize('competitions.publishedHint', "The published runs on the dataset with your method among them, sorted by {0}, best first."),
		model: localize('competitions.model', "Model"),
		splitScores: localize('competitions.splitScores', "Scores by Split"),
		splitScoresHint: localize('competitions.splitScoresHint', "Your method's score on each split, and their mean, which is compared with the published means."),
		repeat: localize('competitions.repeat', "Repeat"),
		fold: localize('competitions.fold', "Fold"),
		mean: localize('competitions.mean', "Mean"),
		rankOn: localize('competitions.rankOn', "Rank on {0}"),
		acrossTitle: localize('competitions.acrossTitle', "Across the Datasets"),
		acrossHint: localize('competitions.acrossHint', "For each measure, over the datasets of the run scored by it, the published models with a run on every one of them: your mean rank among them on those datasets, your place among them by mean rank, and the model with the best mean rank. 1 is the best."),
		datasetsColumn: localize('competitions.datasetsColumn', "Datasets"),
		modelsColumn: localize('competitions.modelsColumn', "Models"),
		meanRank: localize('competitions.meanRank', "Your Mean Rank"),
		place: localize('competitions.place', "Your Place"),
		bestModel: localize('competitions.bestModel', "Best by Mean Rank"),
		seriesOnly: localize('competitions.seriesOnly', "This step is about series: it is offered for runs on forecasting datasets, not on tabular or survival ones."),
		stopped: localize('competitions.stopped', "The run stopped: {0}"),
		scores: localize('competitions.scores', "Scores"),
		scoresHint: localize('competitions.scoresHint', "Your method and the benchmarks on the same series, at {0}; OWA weighs the sMAPE and the MASE of each against those of Naive2. A benchmark is left out when a series of the run is too short for it."),
		method: localize('competitions.method', "Your Method"),
		benchmark: localize('competitions.benchmark', "Benchmark"),
		aSeries: localize('competitions.aSeries', "A Series"),
		plotHint: localize('competitions.plotHint', "The first series of the run: its last values, the values it was scored on, and your method's forecast."),
		actual: localize('competitions.actual', "Actual"),
		nextNeedsRun: localize('competitions.nextNeedsRun', "Run a method first: the Next Steps work on the forecasts of a finished run, the one shown in steps 3 and 4."),
		compute: localize('competitions.compute', "Compute in the Julia REPL"),
		stepStopped: localize('competitions.stepStopped', "The step stopped: {0}"),
		naive2: localize('competitions.naive2', "Naive2"),
		measureOf: localize('competitions.measureOf', "{0}, {1}"),
		stepAhead: localize('competitions.stepAhead', "Step Ahead (h)"),
		horizon: localize('competitions.horizon', "Errors by Horizon"),
		horizonSeries: localize('competitions.horizonSeries', "Means over {0} series of this frequency."),
		browse: localize('competitions.browse', "Browse the Series"),
		seriesName: localize('competitions.seriesName', "Series"),
		seriesPlaceholder: localize('competitions.seriesPlaceholder', "Its name, or empty for the first"),
		show: localize('competitions.show', "Show"),
		previous: localize('competitions.previous', "Previous"),
		next: localize('competitions.next', "Next"),
		seriesOf: localize('competitions.seriesOf', "Series {0} of the {1} of the run: {2}, horizon {3}."),
		benchmarkLine: localize('competitions.benchmarkLine', "Benchmark"),
		none: localize('competitions.none', "None"),
		allPast: localize('competitions.allPast', "All the Past Values"),
		fails: localize('competitions.fails', "Where It Fails"),
		sortHint: sortHint(),
		frequencyColumn: localize('competitions.frequencyColumn', "Frequency"),
		betterThan: localize('competitions.betterThan', "Better Than Naive2"),
		worseThan: localize('competitions.worseThan', "Worse Than Naive2"),
		relativeOf: localize('competitions.relativeOf', "{0} Relative to Naive2"),
		relativeHint: localize('competitions.relativeHint', "Your method's {0} on the series over Naive2's: above 1, your method forecasts the series worse than Naive2. Sort by this column; click again to reverse."),
		worstRows: localize('competitions.worstRows', "The series where your method does worst: the 100 worst by each of the four measures, {0} series in all. A series' name opens it in Browse the Series."),
		runsStep: localize('competitions.runsStep', "Compare Two Runs"),
		otherRun: localize('competitions.otherRun', "The Other Run"),
		chooseRun: localize('competitions.chooseRun', "Choose a run..."),
		thisRun: localize('competitions.thisRun', "This Run"),
		noOtherRuns: localize('competitions.noOtherRuns', "There is no other finished run yet: run another method, or the same one again, on the same series."),
		notSameSeries: localize('competitions.notSameSeries', "The two runs are not on the same series: a run is compared with another of the same dataset, frequency, sample and seed. {0} is {1}, the other is {2}."),
		notSameSplits: localize('competitions.notSameSplits', "The two runs are not on the same splits: a run is compared with another of the same dataset and splits. {0} is {1}, the other is {2}."),
		splitsSettings: localize('competitions.splitsSettings', "{0}, {1}"),
		otherNotDone: localize('competitions.otherNotDone', "The other run has no scores yet: it is still running, or it stopped."),
		runSettings: localize('competitions.runSettings', "{0}, {1}, {2}"),
		allSeriesText: localize('competitions.allSeriesText', "all series"),
		sampleText: localize('competitions.sampleText', "a sample of {0} with seed {1}"),
		secondsRow: localize('competitions.secondsRow', "Seconds"),
		diffMethods: localize('competitions.diffMethods', "Compare method.jl"),
		nextIntro: {
			runs: localize('competitions.runsIntro', "This run beside another of your runs on the same series, such as two methods, or two versions of one, run with the same dataset, frequency, sample and seed: their scores, the time each took, and the differences between their method.jl."),
			fails: localize('competitions.failsIntro', "The sMAPE and the MASE of each series of the run, of your method and of Naive2, and each relative to Naive2's: how many series your method forecasts better than Naive2, and the series where it does worst."),
			series: localize('competitions.browseIntro', "One series of the run at a time: the values the forecasters saw, the values it was scored on, your method's forecast, and a benchmark computed on the series. Show finds a series by its name; Previous and Next go through the series of the run in order."),
			horizon: localize('competitions.horizonIntro', "The sMAPE and the MASE of your method and of Naive2 at each step ahead, means over the series of each frequency: how fast the errors grow with the horizon, beside those of the benchmark against which OWA weighs the method."),
		},
		nextCard: {
			horizon: localize('competitions.horizonCard', "The sMAPE and the MASE of your method and of Naive2 at each step ahead"),
			series: localize('competitions.browseCard', "One series of the run at a time, with your method's forecast and a benchmark"),
			fails: localize('competitions.failsCard', "The series where your method does worst against Naive2"),
			runs: localize('competitions.runsCard', "This run beside another of your runs on the same series"),
		},
	};
	return buildWebviewHtml({
		title: localize('competitions.title', "Score Models"),
		introHtml: text.intro,
		omitPoweredBy: !FORECASTINGCOMPETITIONS_METADATA.forecastingCompetitions.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=number] { font: inherit; width: 7em; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; }
		${codeEditorCss}
		table.fc { width: auto; max-width: 100%; }
		table.fc tr.mine td { font-weight: 600; }
		table.fc-batch tbody tr { cursor: pointer; }
		table.fc-batch tbody tr:hover td { background: var(--vscode-list-hoverBackground); }
		table.fc-batch tbody tr.chosen td { background: var(--vscode-list-inactiveSelectionBackground); font-weight: 600; }
		.fc-plot { max-width: 900px; margin: 8px 0 16px 0; }
		.fc-plot text { fill: var(--vscode-foreground); font-size: 11px; font-family: var(--vscode-font-family); }
		.fc-plot .axis { stroke: var(--vscode-widget-border); }
		.fc-plot .past, .fc-plot .actual { fill: none; stroke: var(--vscode-foreground); stroke-width: 1.5; }
		.fc-plot .actual { stroke-dasharray: 2 2; }
		.fc-plot .forecast { fill: none; stroke: var(--vscode-textLink-foreground); stroke-width: 2; }
		.fc-plot .reference { fill: none; stroke: var(--vscode-descriptionForeground); stroke-width: 1.5; stroke-dasharray: 5 3; }
		${sortHeadingsCss}
		.fc-worst { max-height: 420px; overflow-y: auto; }
		.fc-plot .benchmark { fill: none; stroke: var(--vscode-charts-orange); stroke-width: 1.5; }
		.fc-next input[type=text] { font: inherit; width: 14em; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; }
		.fc-legend span { margin-right: 16px; }
		.links .link + .link { margin-left: 10px; }
		.fc-next .fc-plot { max-width: 100%; }
		.fc-next table.fc { font-size: 0.95em; }
`,
		steps: [
			{
				id: 'step-competition',
				title: text.datasetsStep,
				bodyHtml: `
		<div id="kindPart" hidden>
			<div class="row"><span class="small">${text.kindOfDataset}</span>
				${(['series', 'tabular', 'survival'] as const).map(kind => `<label id="kind-${kind}"><input type="radio" name="kind" value="${kind}"> ${text.kinds[kind]}</label>`).join(' ')}
			</div>
			<p class="hint">${text.kindHint}</p>
		</div>
		<p class="hint" id="severalHint">${text.severalHint}</p>
		<div id="noneActive" hidden><p class="hint">${text.noneActive}</p><div class="bar"><button class="action current" id="manage">${text.manage}</button></div></div>
		<table class="fc" id="datasetsTable">
			<thead id="datasetsHead"></thead>
			<tbody id="competitions"></tbody>
		</table>
		<p class="hint" id="datasetsHint">${text.datasetsHint}</p>
		<p class="hint" id="datasetsHintScored" hidden>${text.datasetsHintScored}</p>
		<div class="row" id="frequencyRow"><span class="small">${text.frequency}</span> <select id="frequency"></select></div>
		<div class="row" id="sampleRow"><span class="small">${text.seriesToRun}</span>
			<label><input type="radio" name="scope" value="all" checked> ${text.allSeries}</label>
			<label><input type="radio" name="scope" value="sample"> ${text.sampleOf}</label> <input type="number" id="sample" min="1" value="1000">
			<span class="small">${text.seed}</span> <input type="number" id="seed" value="1">
		</div>
		<p class="hint" id="sampleHint">${text.sampleHint}</p>
		<div class="row" id="splitsRow" hidden><span class="small">${text.splitsToRun}</span>
			<label><input type="radio" name="splits" value="all" checked> ${text.allSplits}</label>
			<label><input type="radio" name="splits" value="first"> ${text.firstRepeat}</label>
		</div>
		<p class="hint" id="splitsHint" hidden></p>
`,
			},
			{
				id: 'step-method',
				title: text.yourMethod,
				bodyHtml: `
		<p class="hint" id="methodHint">${text.methodHints.series}</p>
		<p class="hint missing" id="otherKindMethod" hidden>${text.otherKindMethod}</p>
		${codeEditorHtml('code', 18)}
		<div class="row"><button class="link" id="reset">${text.reset}</button></div>
`,
			},
			{
				id: 'step-run',
				title: text.run,
				bodyHtml: `
		<p class="hint">${text.runHint}</p>
		<div class="row"><select id="earlier"></select> <button class="link" id="newRun" hidden>${text.newRun}</button></div>
		<div class="settings"><span class="bar"><button class="action current" id="start">${text.start}</button></span></div>
		<div class="small status missing" id="runProblem"></div>
		<div class="small status" id="runStatus"></div>
		<div class="links" id="runLinks"></div>
`,
			},
			{
				id: 'step-results',
				title: text.scoresStep,
				bodyHtml: `
		<div id="batchPart" hidden>
			<h3 class="part">${text.batchTitle}</h3>
			<p class="hint">${text.batchHint}</p>
			<table class="fc fc-batch"><thead id="batchHead"></thead><tbody id="batchRows"></tbody></table>
			<div id="acrossPart" hidden>
				<h3 class="part">${text.acrossTitle}</h3>
				<p class="hint">${text.acrossHint}</p>
				<table class="fc"><thead><tr><th>${text.measure}</th><th class="number">${text.datasetsColumn}</th><th class="number">${text.modelsColumn}</th><th class="number">${text.meanRank}</th><th class="number">${text.place}</th><th>${text.bestModel}</th></tr></thead><tbody id="acrossRows"></tbody></table>
			</div>
			<h3 class="part" id="memberName"></h3>
		</div>
		<p class="hint" id="resultsHint">${text.resultsHint}</p>
		<div id="results" hidden>
			<p class="small" id="finished"></p>
			<p class="hint" id="indicative" hidden></p>
			<h3 class="part">${text.scores}</h3>
			<p class="hint" id="scoresHint"></p>
			<table class="fc"><thead id="scoreHead"></thead><tbody id="scoreRows"></tbody></table>
			<div id="seriesPart">
				<h3 class="part">${text.aSeries}</h3>
				<p class="hint">${text.plotHint}</p>
				<div class="fc-legend small" id="legend"></div>
				<div class="fc-plot" id="plot"></div>
			</div>
			<div id="scoredPart" hidden>
				<h3 class="part">${text.publishedRuns}</h3>
				<p class="hint" id="publishedHint"></p>
				<div class="fc-worst"><table class="fc"><thead id="publishedHead"></thead><tbody id="publishedRows"></tbody></table></div>
				<h3 class="part">${text.splitScores}</h3>
				<p class="hint">${text.splitScoresHint}</p>
				<div class="fc-worst"><table class="fc"><thead id="splitHead"></thead><tbody id="splitRows"></tbody></table></div>
			</div>
		</div>
`,
			},
		],
		// The panels on the right, opened from the cards of their groups, which the page's script then fills
		...pageNextSteps({
			visualise: [
				{ id: 'horizonStep', label: text.horizon, desc: text.nextCard.horizon, event: 'pollis-horizon-step' },
				{ id: 'seriesStep', label: text.browse, desc: text.nextCard.series, event: 'pollis-series-step' },
			],
			diagnose: [
				{ id: 'failsStep', label: text.fails, desc: text.nextCard.fails, event: 'pollis-fails-step' },
			],
			compare: [
				{ id: 'runsStep', label: text.runsStep, desc: text.nextCard.runs, event: 'pollis-runs-step' },
			],
		}),
		pageScriptJs: `
	${ONE_BLUE_BUTTON_JS.trim()}
	${colorizeBracketsJs}
	${codeEditorJs}
	const TEXT = ${JSON.stringify(text)};
	const EXAMPLES = ${JSON.stringify(EXAMPLE_METHODS)};
	const FUNCTIONS = ${JSON.stringify(METHOD_FUNCTIONS)};
	const TABULAR_MEASURES = ${JSON.stringify(TABULAR_MEASURES)};
	const KINDS = ['series', 'tabular', 'survival'];
	const code = document.getElementById('code');
	const frequency = document.getElementById('frequency');
	const sample = document.getElementById('sample');
	const seed = document.getElementById('seed');
	const earlier = document.getElementById('earlier');
	let state = undefined;
	// The kind of dataset chosen in step 1 while no run is shown
	let chosenKind = 'series';

	function escapeHtml(value) {
		return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	}
	function format(x) {
		return typeof x === 'number' && isFinite(x) ? x.toFixed(3) : '';
	}
	// The datasets the page can list: those of PollisCompetitions.jl, then those of the user's own
	function datasets() {
		return state && state.datasets ? state.datasets : [];
	}
	function datasetOf(id) {
		return datasets().find(c => c.id === id);
	}
	// The kind of the run shown, else the kind chosen
	function currentKind() {
		return state && state.batch ? state.batch.kind : state && state.run ? state.run.kind : chosenKind;
	}
	// The kinds of the active datasets that the page scores, in their order
	function activeKinds() {
		const active = state ? datasets().filter(c => (state.active || []).includes(c.id)) : [];
		return KINDS.filter(kind => active.some(c => c.kind === kind));
	}
	// The datasets step 1 lists: those of the run shown, else the active datasets of the kind chosen that the page scores
	function listedDatasets() {
		const ids = !state ? [] : state.batch ? state.batch.datasets : state.run ? [state.run.competition] : state.active || [];
		const kind = currentKind();
		return datasets().filter(c => ids.includes(c.id) && c.kind === kind);
	}
	// Chooses a kind of dataset, and puts in its example when the box holds the example of another kind
	function setKind(kind) {
		const example = Object.values(EXAMPLES).includes(code.value);
		chosenKind = kind;
		if (example) {
			setCode(EXAMPLES[kind]);
		}
	}
	function splitsChoice() {
		const radio = document.querySelector('input[name=splits]:checked');
		return radio ? radio.value : 'all';
	}
	// Which value of a measure is best ('lower', 'higher' or 'one'), as a number of which lower is better
	function loss(best, value) {
		return best === 'lower' ? value : best === 'higher' ? -value : Math.abs(value - 1);
	}
	// The progress of a run of one dataset, in series or in splits
	function progressText(kind, p) {
		return (kind === 'series' ? TEXT.progress : TEXT.progressSplits).replace('{0}', p.done.toLocaleString()).replace('{1}', p.total.toLocaleString()).replace('{2}', Math.round(p.seconds));
	}
	// The frequencies of a dataset that have a name, which step 1 offers when it is the only dataset listed
	function namedFrequencies(c) {
		return c ? c.frequencies.filter(f => f.name) : [];
	}
	function scope() {
		const radio = document.querySelector('input[name=scope]:checked');
		return radio ? radio.value : 'all';
	}
	function locked() {
		return !!(state && state.run);
	}

	function drawCompetitions() {
		const listed = listedDatasets();
		const kind = currentKind();
		const kinds = activeKinds();
		document.getElementById('kindPart').hidden = locked() || kinds.length < 2;
		for (const k of KINDS) {
			document.getElementById('kind-' + k).hidden = !kinds.includes(k);
		}
		for (const radio of document.querySelectorAll('input[name=kind]')) {
			radio.checked = radio.value === kind;
		}
		document.getElementById('noneActive').hidden = !!listed.length;
		document.getElementById('severalHint').hidden = !listed.length || locked();
		document.getElementById('datasetsTable').hidden = !listed.length;
		document.getElementById('datasetsHint').hidden = !listed.length || kind !== 'series';
		document.getElementById('datasetsHintScored').hidden = !listed.length || kind === 'series';
		const heads = kind === 'series' ? [[TEXT.dataset], [TEXT.series, 'number'], [TEXT.frequencies]]
			: kind === 'tabular' ? [[TEXT.dataset], [TEXT.rows, 'number'], [TEXT.responseType], [TEXT.measure], [TEXT.splitsColumn, 'number']]
				: [[TEXT.dataset], [TEXT.rows, 'number'], [TEXT.splitsColumn, 'number']];
		document.getElementById('datasetsHead').innerHTML = '<tr>' + heads.map(([label, cls]) => '<th' + (cls ? ' class="' + cls + '"' : '') + '>' + escapeHtml(label) + '</th>').join('') + '</tr>';
		document.getElementById('competitions').innerHTML = listed.map(c => {
			if (c.kind !== 'series') {
				const splits = '<td class="number">' + escapeHtml(TEXT.splitsCount.replace('{0}', (c.repeats * c.folds).toLocaleString()).replace('{1}', c.repeats).replace('{2}', c.folds)) + '</td>';
				return '<tr><td>' + escapeHtml(c.name) + '</td><td class="number">' + c.rows.toLocaleString() + '</td>'
					+ (c.kind === 'tabular' ? '<td>' + escapeHtml(c.responseType) + '</td><td>' + escapeHtml(TABULAR_MEASURES[c.responseType]) + '</td>' : '') + splits + '</tr>';
			}
			const total = c.frequencies.reduce((sum, f) => sum + f.series, 0);
			// Each frequency with its horizon, or the shortest and the longest when its series differ
			const frequencies = c.frequencies.map(f => (f.name ? escapeHtml(f.name) + ' ' : '') + '(' + f.shortest + (f.longest > f.shortest ? '&ndash;' + f.longest : '') + ')').join(', ');
			return '<tr><td>' + escapeHtml(c.name) + '</td><td class="number">' + total.toLocaleString() + '</td><td class="small">' + frequencies + '</td></tr>';
		}).join('');
	}
	function drawChoices() {
		const chosen = listedDatasets();
		const offered = chosen.length === 1 ? namedFrequencies(chosen[0]) : [];
		const value = frequency.value;
		frequency.innerHTML = '<option value="">' + escapeHtml(TEXT.allFrequencies) + '</option>' + offered.map(f => '<option value="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</option>').join('');
		frequency.value = offered.some(f => f.name === value) ? value : '';
		const kind = currentKind();
		const series = kind === 'series';
		document.getElementById('frequencyRow').hidden = !series || offered.length < 2;
		document.getElementById('sampleRow').hidden = !series;
		document.getElementById('sampleHint').hidden = !series;
		document.getElementById('splitsRow').hidden = series;
		const splitsHint = document.getElementById('splitsHint');
		splitsHint.hidden = series;
		if (!series) {
			const fits = chosen.reduce((sum, c) => sum + (splitsChoice() === 'first' ? c.folds : c.repeats * c.folds), 0);
			splitsHint.textContent = TEXT.splitsHint.replace('{0}', TEXT.fits.replace('{0}', fits.toLocaleString()));
		}
		for (const field of [frequency, sample, seed, code, ...document.querySelectorAll('input[name=scope]'), ...document.querySelectorAll('input[name=splits]'), ...document.querySelectorAll('input[name=kind]')]) {
			field.disabled = locked();
		}
		document.getElementById('reset').disabled = locked();
		sample.disabled = locked() || scope() !== 'sample';
		document.getElementById('methodHint').textContent = TEXT.methodHints[kind];
		document.getElementById('otherKindMethod').hidden = locked() || code.value.includes(FUNCTIONS[kind] + '(');
	}

	function inputs() {
		const chosen = listedDatasets();
		const series = currentKind() === 'series';
		return {
			kind: currentKind(), datasets: chosen.map(x => x.id), frequency: series && chosen.length === 1 && namedFrequencies(chosen[0]).length > 1 ? frequency.value : '',
			sample: series && scope() === 'sample' ? Math.max(1, Math.round(Number(sample.value) || 1)) : 0, seed: Math.round(Number(seed.value) || 0), splits: splitsChoice(), code: code.value,
		};
	}

	function drawRun() {
		const run = state.run;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlier) + '</option>' + state.runs.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = state.batch ? state.batch.name : run ? run.name : '';
		// Only when there is a run to open: before the first run, the list would hold its title alone
		earlier.hidden = !state.runs.length;
		document.getElementById('newRun').hidden = !run;
		const status = document.getElementById('runStatus');
		const links = document.getElementById('runLinks');
		if (!run) {
			status.textContent = TEXT.noRun;
			links.innerHTML = '';
			return;
		}
		const p = run.progress;
		let line = state.batch ? batchLine() : '';
		line += p ? progressText(run.kind, p) : TEXT.running;
		if (p && p.failed) {
			line += ' · ' + TEXT.failedSeries.replace('{0}', p.failed);
		}
		status.textContent = line;
		links.innerHTML = '<button class="link" data-open="method">' + TEXT.openMethod + '</button><button class="link" data-open="script">' + TEXT.openScript + '</button>' + (run.hasForecasts ? '<button class="link" data-open="forecasts">' + TEXT.openForecasts + '</button>' : '')
			+ (run.hasScores ? '<button class="link" data-open="scores">' + TEXT.openScores + '</button>' : '');
	}

	/** The last values of the series, the values it was scored on, and the forecasts, on one time axis. */
	function plot(p) {
		const past = p.past || [], actual = p.actual || [], forecast = p.forecast || [], benchmark = p.benchmark || [];
		const all = past.concat(actual, forecast, benchmark).filter(v => typeof v === 'number' && isFinite(v));
		if (!all.length) {
			return '';
		}
		const width = 800, height = 260, left = 60, right = 16, top = 12, bottom = 28;
		const n = past.length + Math.max(actual.length, forecast.length);
		let low = Math.min(...all), high = Math.max(...all);
		if (high === low) {
			high += 1;
			low -= 1;
		}
		const pad = (high - low) * 0.05;
		low -= pad;
		high += pad;
		const x = i => left + i / Math.max(n - 1, 1) * (width - left - right);
		const y = v => top + (high - v) / (high - low) * (height - top - bottom);
		const path = (values, start, cls) => values.length ? '<path class="' + cls + '" d="' + values.map((v, i) => (i ? 'L' : 'M') + x(start + i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ') + '"></path>' : '';
		let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img">';
		svg += '<line class="axis" x1="' + left + '" x2="' + (width - right) + '" y1="' + (height - bottom) + '" y2="' + (height - bottom) + '"></line>';
		svg += '<line class="axis" x1="' + x(past.length - 0.5) + '" x2="' + x(past.length - 0.5) + '" y1="' + top + '" y2="' + (height - bottom) + '"></line>';
		for (const v of [low + pad, (low + high) / 2, high - pad]) {
			svg += '<text x="' + (left - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + escapeHtml(Number(v.toPrecision(4)).toLocaleString()) + '</text>';
		}
		const joined = past.length ? [past[past.length - 1]] : [];
		svg += path(past, 0, 'past') + path(joined.concat(actual), past.length - joined.length, 'actual');
		svg += path(benchmark, past.length, 'benchmark') + path(forecast, past.length, 'forecast');
		return svg + '</svg>';
	}

	/** The legend of a plot of a series: its name, and the lines drawn. */
	function legendHtml(name, benchmarkName) {
		return '<span>' + escapeHtml(name) + '</span><span>' + escapeHtml(TEXT.actual) + ' &middot;&middot;&middot;</span><span style="color: var(--vscode-textLink-foreground)">' + escapeHtml(TEXT.method) + '</span>'
			+ (benchmarkName ? '<span style="color: var(--vscode-charts-orange)">' + escapeHtml(benchmarkName) + '</span>' : '');
	}

	// Where a run of several datasets is: the dataset being run, or that all have run
	function batchLine() {
		const members = state.batch.members;
		const at = members.findIndex(m => !m.results);
		if (at < 0) {
			return TEXT.batchDone.replace('{0}', members.length) + ' ';
		}
		const c = datasetOf(members[at].id);
		return TEXT.batchProgress.replace('{0}', at + 1).replace('{1}', members.length).replace('{2}', c ? c.name : members[at].id);
	}
	// The table of a run of several datasets: a row for each, its scores side by side, the row of the dataset shown chosen
	function drawBatch() {
		const b = state.batch;
		document.getElementById('batchPart').hidden = !b;
		if (!b) {
			return;
		}
		const measures = [];
		for (const m of b.members) {
			for (const measure of (m.results && m.results.measures) || []) {
				if (!measures.includes(measure)) {
					measures.push(measure);
				}
			}
		}
		const scored = b.kind !== 'series';
		document.getElementById('batchHead').innerHTML = '<tr><th>' + escapeHtml(TEXT.dataset) + '</th><th class="number">' + escapeHtml(scored ? TEXT.splitsColumn : TEXT.series) + '</th>'
			+ measures.map(m => '<th class="number">' + escapeHtml(m) + '</th>').join('') + (scored ? '<th class="number">' + escapeHtml(TEXT.yourRank) + '</th>' : '') + '<th>' + escapeHtml(TEXT.status) + '</th></tr>';
		document.getElementById('batchRows').innerHTML = b.members.map(m => {
			const c = datasetOf(m.id);
			const r = m.results;
			const done = r && !r.error;
			const status = r ? (r.error ? TEXT.stoppedShort : TEXT.done) : m.progress ? progressText(b.kind, m.progress) : TEXT.waiting;
			// Of a tabular or survival dataset, the rank on its first measure, among the published runs on it
			const rank = done && scored && r.ranks && r.measures.length ? r.ranks[r.measures[0]] : undefined;
			return '<tr data-member="' + escapeHtml(m.id) + '"' + (state.run && state.run.competition === m.id ? ' class="chosen"' : '') + '><td>' + escapeHtml(c ? c.name : m.id) + '</td>'
				+ '<td class="number">' + (done ? Number(scored ? r.splits : r.series).toLocaleString() : '') + '</td>'
				+ measures.map(measure => '<td class="number">' + (done ? format(r.method[measure]) : '') + '</td>').join('')
				+ (scored ? '<td class="number"' + (rank ? ' title="' + escapeHtml(TEXT.rankOn.replace('{0}', r.measures[0])) + '"' : '') + '>' + (rank ? escapeHtml(TEXT.rankOf.replace('{0}', rank.rank).replace('{1}', rank.of)) : '') + '</td>' : '')
				+ '<td class="small"' + (r && r.error ? ' title="' + escapeHtml(r.error) + '"' : '') + '>' + escapeHtml(status) + '</td></tr>';
		}).join('');
		const shown = state.run && datasetOf(state.run.competition);
		document.getElementById('memberName').textContent = shown ? shown.name : '';
		drawAcross();
	}

	/**
	 * Of a run on several tabular or survival datasets: for each measure, over the datasets scored by it, the published
	 * models with a run on every one of them, each ranked on each dataset among them and your method; your mean rank,
	 * your place by mean rank, and the model with the best mean rank.
	 */
	function drawAcross() {
		const b = state.batch;
		const done = b && b.kind !== 'series' ? b.members.filter(m => m.results && !m.results.error && m.results.published) : [];
		document.getElementById('acrossPart').hidden = !done.length;
		if (!done.length) {
			return;
		}
		const measures = [];
		for (const m of done) {
			for (const measure of m.results.measures) {
				if (!measures.includes(measure)) {
					measures.push(measure);
				}
			}
		}
		document.getElementById('acrossRows').innerHTML = measures.map(measure => {
			const those = done.filter(m => m.results.measures.includes(measure));
			const best = those[0].results.best[measure];
			let models = undefined;
			for (const m of those) {
				const ids = m.results.published.filter(p => typeof p.scores[measure] === 'number').map(p => p.model);
				models = models === undefined ? ids : models.filter(id => ids.includes(id));
			}
			const names = {}, sums = {};
			let mine = 0;
			for (const m of those) {
				// Your method under the empty name, which no model has
				const scores = { '': m.results.method[measure] };
				for (const p of m.results.published) {
					if (models.includes(p.model)) {
						scores[p.model] = p.scores[measure];
						names[p.model] = p.name;
					}
				}
				const ids = Object.keys(scores);
				for (const id of ids) {
					const rank = 1 + ids.filter(other => loss(best, scores[other]) < loss(best, scores[id])).length;
					if (id === '') {
						mine += rank;
					} else {
						sums[id] = (sums[id] || 0) + rank;
					}
				}
			}
			const n = those.length;
			const myMean = mine / n;
			const means = models.map(id => sums[id] / n);
			const place = 1 + means.filter(v => v < myMean).length;
			const top = means.length ? means.indexOf(Math.min(...means)) : -1;
			const bestText = top >= 0 && means[top] < myMean ? names[models[top]] + ' (' + format(means[top]) + ')' : TEXT.method + ' (' + format(myMean) + ')';
			return '<tr><td>' + escapeHtml(measure) + '</td><td class="number">' + n + '</td><td class="number">' + models.length + '</td><td class="number">' + format(myMean)
				+ '</td><td class="number">' + escapeHtml(TEXT.rankOf.replace('{0}', place).replace('{1}', models.length + 1)) + '</td><td>' + escapeHtml(bestText) + '</td></tr>';
		}).join('');
	}

	function drawResults() {
		const run = state.run;
		const results = run && run.results;
		const box = document.getElementById('results');
		const hint = document.getElementById('resultsHint');
		box.hidden = !results || !!results.error;
		hint.hidden = !!results && !results.error;
		if (results && results.error) {
			hint.hidden = false;
			hint.innerHTML = '<span class="missing">' + escapeHtml(TEXT.stopped.replace('{0}', results.error)) + '</span>';
			return;
		}
		hint.textContent = TEXT.resultsHint;
		if (!results) {
			return;
		}
		const scored = !!results.kind && results.kind !== 'series';
		document.getElementById('seriesPart').hidden = scored;
		document.getElementById('scoredPart').hidden = !scored;
		document.getElementById('indicative').hidden = !scored || !results.first_repeat;
		if (scored) {
			drawScored(results);
			return;
		}
		document.getElementById('finished').textContent = TEXT.finished.replace('{0}', results.series.toLocaleString()).replace('{1}', results.finished);
		document.getElementById('scoresHint').textContent = TEXT.scoresHint.replace('{0}', results.level);
		const measures = results.measures;
		document.getElementById('scoreHead').innerHTML = '<tr><th></th>' + measures.map(m => '<th class="number">' + escapeHtml(m) + '</th>').join('') + '</tr>';
		const row = (name, scores, mine) => '<tr' + (mine ? ' class="mine"' : '') + '><td>' + escapeHtml(name) + '</td>' + measures.map(m => '<td class="number">' + format(scores[m]) + '</td>').join('') + '</tr>';
		document.getElementById('scoreRows').innerHTML = row(TEXT.method, results.method, true) + results.benchmarks.map(b => row(b.name, b.scores, false)).join('');
		const p = results.plot;
		document.getElementById('legend').innerHTML = p ? legendHtml(p.series, '') : '';
		document.getElementById('plot').innerHTML = p ? plot(p) : '';
	}

	/**
	 * The scores of a run on a tabular or survival dataset: each measure's mean over the splits with its rank among the
	 * published runs and the best, the median and the worst of them; the published runs with your method among them;
	 * and the scores of each split.
	 */
	function drawScored(results) {
		document.getElementById('finished').textContent = TEXT.finishedSplits.replace('{0}', results.splits.toLocaleString()).replace('{1}', results.finished);
		document.getElementById('indicative').textContent = TEXT.indicative.replace('{0}', results.splits).replace('{1}', results.all_splits);
		const measures = results.measures;
		const published = results.published || [];
		document.getElementById('scoresHint').textContent = published.length ? TEXT.scoredHint : TEXT.noPublished;
		// The published runs with a score on a measure, best first
		const ranked = m => published.filter(p => typeof p.scores[m] === 'number').sort((a, b) => loss(results.best[m], a.scores[m]) - loss(results.best[m], b.scores[m]));
		const cell = p => p ? '<td class="number" title="' + escapeHtml(p.name) + '">' + format(p.scores[p.measure]) + '</td>' : '<td></td>';
		document.getElementById('scoreHead').innerHTML = '<tr><th>' + escapeHtml(TEXT.measure) + '</th><th class="number">' + escapeHtml(TEXT.method) + '</th><th class="number">' + escapeHtml(TEXT.yourRank) + '</th>'
			+ [TEXT.bestPublished, TEXT.medianPublished, TEXT.worstPublished].map(label => '<th class="number">' + escapeHtml(label) + '</th>').join('') + '</tr>';
		document.getElementById('scoreRows').innerHTML = measures.map(m => {
			const runs = ranked(m).map(p => ({ name: p.name, scores: p.scores, measure: m }));
			const rank = results.ranks && results.ranks[m];
			return '<tr><td>' + escapeHtml(m) + '</td><td class="number">' + format(results.method[m]) + '</td><td class="number">' + (rank && runs.length ? escapeHtml(TEXT.rankOf.replace('{0}', rank.rank).replace('{1}', rank.of)) : '') + '</td>'
				+ cell(runs[0]) + cell(runs[Math.floor((runs.length - 1) / 2)]) + cell(runs[runs.length - 1]) + '</tr>';
		}).join('');
		// The published runs, your method among them, best first by the first measure; those with no score on it last
		const first = measures[0];
		document.getElementById('publishedHint').textContent = TEXT.publishedHint.replace('{0}', first);
		const rows = published.map(p => ({ name: p.name, scores: p.scores, mine: false })).concat([{ name: TEXT.method, scores: results.method, mine: true }]);
		const key = r => typeof r.scores[first] === 'number' ? loss(results.best[first], r.scores[first]) : Infinity;
		rows.sort((a, b) => key(a) - key(b));
		document.getElementById('publishedHead').innerHTML = '<tr><th class="number">#</th><th>' + escapeHtml(TEXT.model) + '</th>' + measures.map(m => '<th class="number">' + escapeHtml(m) + '</th>').join('') + '</tr>';
		document.getElementById('publishedRows').innerHTML = rows.map((r, i) => '<tr' + (r.mine ? ' class="mine"' : '') + '><td class="number">' + (i + 1) + '</td><td>' + escapeHtml(r.name) + '</td>'
			+ measures.map(m => '<td class="number">' + format(r.scores[m]) + '</td>').join('') + '</tr>').join('');
		document.getElementById('splitHead').innerHTML = '<tr><th class="number">' + escapeHtml(TEXT.repeat) + '</th><th class="number">' + escapeHtml(TEXT.fold) + '</th>'
			+ measures.map(m => '<th class="number">' + escapeHtml(m) + '</th>').join('') + '<th class="number">' + escapeHtml(TEXT.secondsRow) + '</th></tr>';
		document.getElementById('splitRows').innerHTML = (results.per_split || []).map(r => '<tr><td class="number">' + r.repeat + '</td><td class="number">' + r.fold + '</td>'
			+ measures.map(m => '<td class="number">' + format(r.scores[m]) + '</td>').join('') + '<td class="number">' + Number(r.seconds).toFixed(2) + '</td></tr>').join('')
			+ '<tr class="mine"><td colspan="2">' + escapeHtml(TEXT.mean) + '</td>' + measures.map(m => '<td class="number">' + format(results.method[m]) + '</td>').join('') + '<td class="number">' + Number(results.seconds).toFixed(2) + '</td></tr>';
	}

	function draw() {
		document.getElementById('root').textContent = state.root;
		const run = state.run;
		if (run) {
			// A run of several datasets shows them all, with its choices
			const shown = state.batch || run;
			chosenKind = shown.kind;
			for (const radio of document.querySelectorAll('input[name=splits]')) {
				radio.checked = radio.value === shown.splits;
			}
			drawChoices();
			frequency.value = state.batch ? '' : run.frequency;
			for (const radio of document.querySelectorAll('input[name=scope]')) {
				radio.checked = radio.value === (shown.sample > 0 ? 'sample' : 'all');
			}
			if (shown.sample > 0) {
				sample.value = String(shown.sample);
			}
			seed.value = String(shown.seed);
			if (typeof run.code === 'string') {
				setCode(run.code);
			}
		} else {
			// No run shown: a kind of the active datasets, the first when the one chosen has none
			const kinds = activeKinds();
			if (kinds.length && !kinds.includes(chosenKind)) {
				setKind(kinds[0]);
			}
		}
		drawCompetitions();
		drawChoices();
		drawRun();
		drawBatch();
		drawResults();
		for (const step of Object.keys(NEXT_DRAW)) {
			drawNext(step);
		}
	}

	document.getElementById('manage').addEventListener('click', () => vscode.postMessage({ command: 'manage' }));
	document.getElementById('batchRows').addEventListener('click', event => {
		const row = event.target.closest('tr[data-member]');
		if (row && state.batch && row.dataset.member !== state.run.competition) {
			vscode.postMessage({ command: 'member', id: row.dataset.member });
		}
	});
	for (const radio of document.querySelectorAll('input[name=scope]')) {
		radio.addEventListener('change', drawChoices);
	}
	for (const radio of document.querySelectorAll('input[name=splits]')) {
		radio.addEventListener('change', drawChoices);
	}
	for (const radio of document.querySelectorAll('input[name=kind]')) {
		radio.addEventListener('change', () => {
			setKind(radio.value);
			drawCompetitions();
			drawChoices();
		});
	}
	document.getElementById('reset').addEventListener('click', () => {
		setCode(EXAMPLES[currentKind()]);
		drawChoices();
	});
	// Run the Method is never disabled: pressed when it cannot run, it says why, and a second press takes it away
	document.getElementById('start').addEventListener('click', () => {
		const why = state.run ? TEXT.runShown : !listedDatasets().length ? TEXT.noneListed : '';
		const problem = document.getElementById('runProblem');
		problem.textContent = why && problem.textContent === why ? '' : why;
		if (why) {
			return;
		}
		vscode.postMessage({ command: 'run', inputs: inputs() });
	});
	earlier.addEventListener('change', () => vscode.postMessage(earlier.value ? { command: 'load', name: earlier.value } : { command: 'newRun' }));
	document.getElementById('newRun').addEventListener('click', () => vscode.postMessage({ command: 'newRun' }));
	document.getElementById('runLinks').addEventListener('click', event => {
		const target = event.target.closest('button[data-open]');
		if (target) {
			vscode.postMessage({ command: 'open', what: target.dataset.open });
		}
	});

	// The method's code: shown at once, coloured as the editor colours Julia once the page has tokenized it
	let codeTimer = undefined;
	function colourCode() {
		showEditorText('code');
		clearTimeout(codeTimer);
		codeTimer = setTimeout(() => vscode.postMessage({ command: 'codeDraft', text: code.value }), 150);
	}
	function setCode(text) {
		if (code.value !== text) {
			code.value = text;
			colourCode();
		}
	}
	code.addEventListener('input', () => {
		colourCode();
		document.getElementById('otherKindMethod').hidden = locked() || code.value.includes(FUNCTIONS[currentKind()] + '(');
	});
	code.value = EXAMPLES.series;
	colourCode();
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const wasLocked = locked();
			state = message;
			if (wasLocked && !state.run) {
				setCode(EXAMPLES[chosenKind]);
			}
			draw();
		} else if (message.command === 'colorizedCode') {
			showEditorColors('code', message, '#');
		} else if (message.command === 'runProblem') {
			document.getElementById('runProblem').textContent = message.text;
		} else if (message.command === 'running') {
			document.getElementById('runStatus').textContent = TEXT.running;
		}
	});

	// The Next Steps: each panel is drawn from the JSON file of the run that the step's Julia script writes
	const NEXT_DRAW = { horizon: drawHorizon, series: drawSeries, fails: drawFails, runs: drawRuns };
	// What a step does once its panel is drawn
	const NEXT_AFTER = { fails: sortArrowsOfFails };
	// Steps whose panel has controls of its own before anything is computed
	const NEXT_CONTROLS = { series: true, runs: true };
	let horizonFrequency = '';
	function drawNext(step) {
		const box = document.getElementById(step + 'Step');
		if (!box) {
			return;
		}
		box.classList.add('fc-next');
		const run = state && state.run;
		const results = run && run.results;
		let html = '<p class="hint">' + escapeHtml(TEXT.nextIntro[step]) + '</p>';
		if (!results || results.error) {
			box.innerHTML = html + '<p class="hint">' + escapeHtml(TEXT.nextNeedsRun) + '</p>';
			return;
		}
		if (step !== 'runs' && results.kind && results.kind !== 'series') {
			box.innerHTML = html + '<p class="hint">' + escapeHtml(TEXT.seriesOnly) + '</p>';
			return;
		}
		const data = run.next && run.next[step];
		if (NEXT_CONTROLS[step]) {
			box.innerHTML = html + NEXT_DRAW[step](data);
			return;
		}
		if (data && !data.error) {
			box.innerHTML = html + NEXT_DRAW[step](data);
			if (NEXT_AFTER[step]) {
				NEXT_AFTER[step](box);
			}
			return;
		}
		if (data && data.error) {
			html += '<p class="small missing">' + escapeHtml(TEXT.stepStopped.replace('{0}', data.error)) + '</p>';
		}
		box.innerHTML = html + '<div class="row bar"><button class="action" data-next="' + step + '">' + escapeHtml(TEXT.compute) + '</button></div>';
	}

	/** A line for each of lines ({ cls, values }, a value for each step of steps, null where there is none), on axes from 0. */
	function stepChart(steps, lines) {
		const values = lines.flatMap(line => line.values).filter(v => typeof v === 'number' && isFinite(v));
		if (!values.length || !steps.length) {
			return '';
		}
		const width = 480, height = 210, left = 52, right = 12, top = 10, bottom = 40;
		const low = 0;
		let high = Math.max(...values);
		if (high <= low) {
			high = low + 1;
		}
		const first = steps[0], last = steps[steps.length - 1];
		const x = h => left + (last === first ? 0.5 : (h - first) / (last - first)) * (width - left - right);
		const y = v => top + (high - v) / (high - low) * (height - top - bottom);
		let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img">';
		svg += '<line class="axis" x1="' + left + '" x2="' + (width - right) + '" y1="' + y(low) + '" y2="' + y(low) + '"></line>';
		svg += '<line class="axis" x1="' + left + '" x2="' + left + '" y1="' + top + '" y2="' + y(low) + '"></line>';
		for (const v of [low, high / 2, high]) {
			svg += '<text x="' + (left - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + escapeHtml(Number(v.toPrecision(3)).toLocaleString()) + '</text>';
		}
		for (const h of [...new Set([first, steps[Math.floor((steps.length - 1) / 2)], last])]) {
			svg += '<text x="' + x(h) + '" y="' + (y(low) + 14) + '" text-anchor="middle">' + h + '</text>';
		}
		svg += '<text x="' + ((left + width - right) / 2) + '" y="' + (height - 4) + '" text-anchor="middle">' + escapeHtml(TEXT.stepAhead) + '</text>';
		for (const line of lines) {
			let d = '', drawing = false;
			steps.forEach((h, i) => {
				const v = line.values[i];
				if (typeof v === 'number' && isFinite(v)) {
					d += (drawing ? 'L' : 'M') + x(h).toFixed(1) + ' ' + y(v).toFixed(1) + ' ';
					drawing = true;
				} else {
					drawing = false;
				}
			});
			svg += d ? '<path class="' + line.cls + '" d="' + d.trim() + '"></path>' : '';
		}
		return svg + '</svg>';
	}

	function drawHorizon(data) {
		const frequencies = data.frequencies || [];
		if (!frequencies.length) {
			return '';
		}
		const chosen = frequencies.find(f => f.name === horizonFrequency) || frequencies[0];
		let html = '';
		if (frequencies.length > 1) {
			html += '<div class="row"><span class="small">' + escapeHtml(TEXT.frequency) + '</span> <select id="horizonFrequency">'
				+ frequencies.map(f => '<option value="' + escapeHtml(f.name) + '"' + (f === chosen ? ' selected' : '') + '>' + escapeHtml(f.name) + '</option>').join('') + '</select></div>';
		}
		html += '<p class="small">' + escapeHtml(TEXT.horizonSeries.replace('{0}', chosen.series.toLocaleString())) + '</p>';
		html += '<div class="fc-legend small"><span style="color: var(--vscode-textLink-foreground)">' + escapeHtml(TEXT.method) + '</span><span>' + escapeHtml(TEXT.naive2) + ' - - -</span></div>';
		const measures = ['sMAPE', 'MASE'];
		for (const measure of measures) {
			html += '<h3 class="part">' + measure + '</h3><div class="fc-plot">' + stepChart(chosen.h, [{ cls: 'reference', values: chosen.naive2[measure] }, { cls: 'forecast', values: chosen.method[measure] }]) + '</div>';
		}
		const heads = measures.flatMap(m => [TEXT.measureOf.replace('{0}', m).replace('{1}', TEXT.method), TEXT.measureOf.replace('{0}', m).replace('{1}', TEXT.naive2)]);
		html += '<table class="fc"><thead><tr><th class="number">h</th>' + heads.map(head => '<th class="number">' + escapeHtml(head) + '</th>').join('') + '</tr></thead><tbody>'
			+ chosen.h.map((h, i) => '<tr><td class="number">' + h + '</td>' + measures.map(m => '<td class="number">' + format(chosen.method[m][i]) + '</td><td class="number">' + format(chosen.naive2[m][i]) + '</td>').join('') + '</tr>').join('')
			+ '</tbody></table>';
		return html;
	}

	// Browse the Series: the benchmark drawn, and whether the plot shows all the past values or the last three horizons
	let seriesBenchmark = 'Naive2';
	let seriesAllPast = false;
	function drawSeries(data) {
		const ok = !!data && !data.error;
		let html = '<div class="row bar"><span class="small">' + escapeHtml(TEXT.seriesName) + '</span> <input type="text" id="seriesName" spellcheck="false" value="' + escapeHtml(ok ? data.name : '') + '" placeholder="' + escapeHtml(TEXT.seriesPlaceholder) + '">'
			+ ' <button class="action" data-series="name">' + escapeHtml(TEXT.show) + '</button>'
			+ ' <button class="action" data-series="previous"' + (ok && data.position > 1 ? '' : ' disabled') + '>' + escapeHtml(TEXT.previous) + '</button>'
			+ ' <button class="action" data-series="next"' + (ok && data.position >= data.count ? ' disabled' : '') + '>' + escapeHtml(TEXT.next) + '</button></div>';
		if (data && data.error) {
			html += '<p class="small missing">' + escapeHtml(TEXT.stepStopped.replace('{0}', data.error)) + '</p>';
		}
		if (!ok) {
			return html;
		}
		html += '<p class="small">' + escapeHtml(TEXT.seriesOf.replace('{0}', data.position.toLocaleString()).replace('{1}', data.count.toLocaleString()).replace('{2}', data.frequency || '').replace('{3}', data.horizon)) + '</p>';
		const names = Object.keys(data.benchmarks || {});
		const benchmark = names.includes(seriesBenchmark) ? seriesBenchmark : '';
		html += '<div class="row">';
		if (names.length) {
			html += '<span class="small">' + escapeHtml(TEXT.benchmarkLine) + '</span> <select id="seriesBenchmark"><option value="">' + escapeHtml(TEXT.none) + '</option>'
				+ names.map(name => '<option value="' + escapeHtml(name) + '"' + (name === benchmark ? ' selected' : '') + '>' + escapeHtml(name) + '</option>').join('') + '</select> ';
		}
		html += '<label><input type="checkbox" id="seriesAllPast"' + (seriesAllPast ? ' checked' : '') + '> ' + escapeHtml(TEXT.allPast) + '</label></div>';
		const past = seriesAllPast ? data.past : data.past.slice(-3 * data.horizon);
		const benchmarkValues = benchmark ? data.benchmarks[benchmark] : [];
		html += '<div class="fc-legend small">' + legendHtml(data.name, benchmark) + '</div>';
		html += '<div class="fc-plot">' + plot({ past, actual: data.actual, forecast: data.forecast, benchmark: benchmarkValues }) + '</div>';
		const heads = [TEXT.actual, TEXT.method].concat(benchmark ? [benchmark] : []);
		html += '<table class="fc"><thead><tr><th class="number">h</th>' + heads.map(head => '<th class="number">' + escapeHtml(head) + '</th>').join('') + '</tr></thead><tbody>'
			+ data.forecast.map((f, i) => '<tr><td class="number">' + (i + 1) + '</td><td class="number">' + format(data.actual[i]) + '</td><td class="number">' + format(f) + '</td>'
				+ (benchmark ? '<td class="number">' + format(benchmarkValues[i]) + '</td>' : '') + '</tr>').join('')
			+ '</tbody></table>';
		return html;
	}
	/** Asks the Julia REPL for a series of the run: by the name in the box, or the one before or after the series shown. */
	function requestSeries(kind, button) {
		const shown = state.run.next && state.run.next.series;
		const at = shown && !shown.error ? shown.position : 0;
		const name = document.getElementById('seriesName').value.trim();
		const request = kind === 'name' ? (name ? { series: name } : { position: 1 }) : { position: kind === 'next' ? at + 1 : Math.max(1, at - 1) };
		if (button) {
			button.disabled = true;
			button.insertAdjacentHTML('afterend', ' <span class="small">' + escapeHtml(TEXT.running) + '</span>');
		}
		vscode.postMessage(Object.assign({ command: 'nextStep', step: 'series' }, request));
	}

	// Where It Fails: the column its table of the worst series is sorted by
	${sortHeadingsScript()}
	let failsSort = { key: 'relative_mase', descending: true };
	function failsColumns() {
		const relative = m => ({ key: 'relative_' + m.toLowerCase(), label: TEXT.relativeOf.replace('{0}', m), title: TEXT.relativeHint.replace('{0}', m) });
		return [
			{ key: 'name', label: TEXT.seriesName, text: true },
			{ key: 'frequency', label: TEXT.frequencyColumn, text: true },
			{ key: 'smape', label: 'sMAPE' },
			{ key: 'naive2_smape', label: TEXT.measureOf.replace('{0}', 'sMAPE').replace('{1}', TEXT.naive2) },
			relative('sMAPE'),
			{ key: 'mase', label: 'MASE' },
			{ key: 'naive2_mase', label: TEXT.measureOf.replace('{0}', 'MASE').replace('{1}', TEXT.naive2) },
			relative('MASE'),
		];
	}
	function drawFails(data) {
		const counts = data.frequencies || [];
		let html = '<table class="fc"><thead><tr><th>' + escapeHtml(TEXT.frequencyColumn) + '</th><th class="number">' + escapeHtml(TEXT.series) + '</th>'
			+ ['sMAPE', 'MASE'].map(m => '<th class="number">' + escapeHtml(TEXT.measureOf.replace('{0}', m).replace('{1}', TEXT.betterThan)) + '</th><th class="number">' + escapeHtml(TEXT.measureOf.replace('{0}', m).replace('{1}', TEXT.worseThan)) + '</th>').join('')
			+ '</tr></thead><tbody>'
			+ counts.map(c => '<tr><td>' + escapeHtml(c.name) + '</td><td class="number">' + c.series.toLocaleString() + '</td>'
				+ ['smape', 'mase'].map(m => '<td class="number">' + c['better_' + m].toLocaleString() + '</td><td class="number">' + c['worse_' + m].toLocaleString() + '</td>').join('') + '</tr>').join('')
			+ '</tbody></table>';
		const columns = failsColumns();
		const column = columns.find(c => c.key === failsSort.key) || columns[columns.length - 1];
		const value = row => row[column.key];
		// Text in order of the alphabet, numbers by size, a ratio with no value (infinite) as the largest
		const rows = (data.rows || []).slice().sort((a, b) => {
			const order = column.text ? String(value(a)).localeCompare(String(value(b)), undefined, { numeric: true })
				: (value(a) === null ? Infinity : value(a)) - (value(b) === null ? Infinity : value(b));
			return failsSort.descending ? -order : order;
		});
		html += '<p class="small">' + escapeHtml(TEXT.worstRows.replace('{0}', rows.length.toLocaleString())) + '</p>';
		html += '<div class="fc-worst"><table class="fc"><thead><tr>'
			+ columns.map(c => '<th class="sortable' + (c.text ? '' : ' number') + '" data-fails-key="' + c.key + '" data-label="' + escapeHtml(c.label) + '" title="' + escapeHtml(c.title || TEXT.sortHint) + '">' + escapeHtml(c.label) + '</th>').join('')
			+ '</tr></thead><tbody>'
			+ rows.map(r => '<tr>' + columns.map(c => c.key === 'name'
				? '<td><button class="link" data-show-series="' + escapeHtml(r.name) + '">' + escapeHtml(r.name) + '</button></td>'
				: c.text ? '<td>' + escapeHtml(r[c.key]) + '</td>' : '<td class="number">' + (r[c.key] === null ? '&#x221e;' : format(r[c.key])) + '</td>').join('') + '</tr>').join('')
			+ '</tbody></table></div>';
		return html;
	}
	function sortArrowsOfFails(box) {
		for (const heading of box.querySelectorAll('th[data-fails-key]')) {
			setSortArrow(heading, heading.dataset.label, heading.dataset.failsKey === failsSort.key, failsSort.descending);
		}
	}
	/** Opens Browse the Series on the series named, which the Julia REPL then finds. */
	function showSeries(name) {
		window.dispatchEvent(new CustomEvent('pollis-open-page-step', { detail: 'seriesStep' }));
		const box = document.getElementById('seriesName');
		if (box) {
			box.value = name;
		}
		vscode.postMessage({ command: 'nextStep', step: 'series', series: name });
	}

	// Compare Two Runs: drawn from the page's state, with no Julia; the other run is read by the page when chosen
	function runSettings(run) {
		const c = datasetOf(run.competition);
		if (run.kind !== 'series') {
			return TEXT.splitsSettings.replace('{0}', c ? c.name : run.competition).replace('{1}', run.splits === 'first' ? TEXT.firstRepeat : TEXT.allSplits);
		}
		return TEXT.runSettings.replace('{0}', c ? c.name : run.competition).replace('{1}', run.frequency || TEXT.allFrequencies)
			.replace('{2}', run.sample > 0 ? TEXT.sampleText.replace('{0}', run.sample.toLocaleString()).replace('{1}', run.seed) : TEXT.allSeriesText);
	}
	function drawRuns() {
		const run = state.run;
		// The runs of one dataset: a run of several datasets is compared dataset by dataset in its own table
		const others = state.runs.filter(name => name !== run.name && !state.batches.includes(name));
		if (!others.length) {
			return '<p class="hint">' + escapeHtml(TEXT.noOtherRuns) + '</p>';
		}
		const o = run.other;
		let html = '<div class="row"><span class="small">' + escapeHtml(TEXT.otherRun) + '</span> <select id="otherRun"><option value="">' + escapeHtml(TEXT.chooseRun) + '</option>'
			+ others.map(name => '<option value="' + escapeHtml(name) + '"' + (o && o.name === name ? ' selected' : '') + '>' + escapeHtml(name) + '</option>').join('') + '</select></div>';
		if (!o) {
			return html;
		}
		const scored = run.kind !== 'series';
		const same = o.kind === run.kind && o.competition === run.competition
			&& (scored ? o.splits === run.splits : o.frequency === run.frequency && o.sample === run.sample && (run.sample === 0 || o.seed === run.seed));
		if (!same) {
			return html + '<p class="hint">' + escapeHtml((scored ? TEXT.notSameSplits : TEXT.notSameSeries).replace('{0}', TEXT.thisRun).replace('{1}', runSettings(run)).replace('{2}', runSettings(o))) + '</p>';
		}
		if (!o.results || o.results.error) {
			return html + '<p class="hint">' + escapeHtml(TEXT.otherNotDone) + '</p>';
		}
		const a = run.results, b = o.results;
		html += '<p class="small">' + escapeHtml(runSettings(run)) + '</p>';
		html += '<table class="fc"><thead><tr><th></th><th class="number">' + escapeHtml(TEXT.thisRun) + '<br><span class="small">' + escapeHtml(run.name) + '</span></th><th class="number">'
			+ escapeHtml(TEXT.otherRun) + '<br><span class="small">' + escapeHtml(o.name) + '</span></th></tr></thead><tbody>'
			+ a.measures.map(m => '<tr><td>' + escapeHtml(m) + '</td><td class="number">' + format(a.method[m]) + '</td><td class="number">' + format(b.method[m]) + '</td></tr>').join('');
		html += '<tr><td>' + escapeHtml(TEXT.secondsRow) + '</td><td class="number">' + Math.round(a.seconds).toLocaleString() + '</td><td class="number">' + Math.round(b.seconds).toLocaleString() + '</td></tr>';
		html += '</tbody></table>';
		html += '<div class="row"><button class="link" id="diffMethods">' + escapeHtml(TEXT.diffMethods) + '</button></div>';
		return html;
	}

	window.addEventListener('pollis-horizon-step', () => drawNext('horizon'));
	window.addEventListener('pollis-runs-step', () => drawNext('runs'));
	window.addEventListener('pollis-fails-step', () => drawNext('fails'));
	window.addEventListener('pollis-series-step', () => drawNext('series'));
	document.addEventListener('click', event => {
		const heading = event.target.closest && event.target.closest('th[data-fails-key]');
		if (heading) {
			const key = heading.dataset.failsKey;
			failsSort = { key, descending: failsSort.key === key ? !failsSort.descending : !['name', 'frequency'].includes(key) };
			drawNext('fails');
			return;
		}
		const named = event.target.closest && event.target.closest('button[data-show-series]');
		if (named) {
			showSeries(named.dataset.showSeries);
			return;
		}
		if (event.target.id === 'diffMethods') {
			vscode.postMessage({ command: 'diffMethods' });
			return;
		}
		const move = event.target.closest && event.target.closest('button[data-series]');
		if (move && state && state.run) {
			requestSeries(move.dataset.series, move);
			return;
		}
		const button = event.target.closest && event.target.closest('button[data-next]');
		if (button && state && state.run) {
			button.disabled = true;
			button.insertAdjacentHTML('afterend', ' <span class="small">' + escapeHtml(TEXT.running) + '</span>');
			vscode.postMessage({ command: 'nextStep', step: button.dataset.next });
		}
	});
	document.addEventListener('change', event => {
		if (event.target.id === 'horizonFrequency') {
			horizonFrequency = event.target.value;
			drawNext('horizon');
		} else if (event.target.id === 'otherRun') {
			vscode.postMessage({ command: 'compareWith', name: event.target.value });
		} else if (event.target.id === 'seriesBenchmark') {
			seriesBenchmark = event.target.value;
			drawNext('series');
		} else if (event.target.id === 'seriesAllPast') {
			seriesAllPast = event.target.checked;
			drawNext('series');
		}
	});
	document.addEventListener('keydown', event => {
		if (event.key === 'Enter' && event.target.id === 'seriesName' && state && state.run) {
			requestSeries('name', undefined);
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: FORECASTING_COMPETITIONS_COMMAND_ID, title: localize2('competitions.action', "Score Models..."), category: localize2('competitions.category', "Challenges"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openForecastingCompetitionsPage(accessor);
	}
});
