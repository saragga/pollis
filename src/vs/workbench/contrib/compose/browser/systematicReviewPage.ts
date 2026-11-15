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
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { API_PROVIDERS, ProviderRequests } from '../../model/browser/common/apiProviders.js';
import { readReferences } from '../../model/browser/common/referenceImport.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { folderUri } from '../../model/browser/handlers/scaffold.handler.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { SYSTEMATICREVIEW_METADATA } from '../../model/browser/webviews/systematicReview.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { parseCsv, writeCsv } from '../../monitor/browser/csv.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { invertedText, IOpenAlexWork, OPENALEX_TYPES } from './literatureRadarPage.js';
import { freeStudyName, IOrchestrationCell, JULIA_TO_JSON, orchestrationCss, orchestrationPageJs, startStudyAgent, stopAgentRun, studiesFolder, studyStepText, StudyRuns, tomlString, unattendedCells, validStudyName } from './orchestration.js';
import { pollisJlPath, skillFile } from './pollisAgents.js';

// Systematic Review, from Compose > Orchestration (compose.contribution.ts): a review with two independent reviewers
// at each stage, as systematic reviews have them, the reviewers being coding agents. A page of the scaffold in the
// Time Arrow style, in eight steps: 1, Question (the question, the inclusion and exclusion criteria, the outcome and
// the effect measure); 2, Records (from a file of references, BibTeX, RIS or CSL-JSON, and from a search of OpenAlex,
// duplicates removed); 3, Screening, two agents screening every record's title and abstract on their own, with the
// skill screen-records; 4, Conflicts, their agreement and Cohen's kappa, and the records they disagree on, settled by
// the user or by a third agent; 5, Full Texts, a PDF for each record included, added by the user, its text read with
// the Poppler tools; 6, Extraction, two agents extracting each study's effect and its standard error on their own,
// with the skill extract-effect-sizes; 7, Differences, where the two differ, settled by the user; 8, Meta-Analysis,
// fixed and random effects in Julia (meta.jl), with the forest and funnel plots and the flow of records.
// A study is a folder, orchestration/systematic-review/<study> of the Pollis Workspace: study.toml; records.json and
// records.csv; choices.json, the user's decisions; full-texts/ (<id>.pdf, <id>.txt); screener-1, screener-2 and
// adjudicator, each with SKILL.md, TASK.md, data/records.csv, screening.csv and SCREENING.md; extractor-1 and
// extractor-2, each with SKILL.md, TASK.md, data/ (studies.csv, full-texts/), extraction.csv and EXTRACTION.md;
// effects.csv, meta.jl and results.json.

export const SYSTEMATIC_REVIEW_COMMAND_ID = 'pollis.orchestration.systematicReview';

const KIND = 'systematic-review';
const SCREEN_SKILL = 'screen-records';
const EXTRACT_SKILL = 'extract-effect-sizes';
const STUDY_FILE = 'study.toml';
const RECORDS_FILE = 'records.json';
const RECORDS_CSV = 'records.csv';
const CHOICES_FILE = 'choices.json';
const FULL_TEXTS = 'full-texts';
const SCREENING_CSV = 'screening.csv';
const SCREENING_DONE = 'SCREENING.md';
const EXTRACTION_CSV = 'extraction.csv';
const EXTRACTION_DONE = 'EXTRACTION.md';
const STUDIES_CSV = 'studies.csv';
const EFFECTS_CSV = 'effects.csv';
const META_FILE = 'meta.jl';
const RESULTS_FILE = 'results.json';
const SCREENERS = ['screener-1', 'screener-2'];
const ADJUDICATOR = 'adjudicator';
const EXTRACTORS = ['extractor-1', 'extractor-2'];
const CALL_SITE = 'pollis.systematicReview';
/** The works OpenAlex lists a request, at most. */
const OPENALEX_PAGE = 200;
const DEFAULT_SEARCH_LIMIT = 500;
const MAX_SEARCH_LIMIT = 5000;
/** Two extracted values are the same when they differ by less than this, or by less than 1% of the larger. */
const SAME_VALUE = 0.005;

/** The effect measures a review can extract. */
const MEASURES = ['smd', 'md', 'logor', 'logrr', 'z', 'other'] as const;
type Measure = typeof MEASURES[number];

function measureNames(): Record<Measure, string> {
	return {
		smd: localize('systematicReview.measure.smd', "Standardized Mean Difference (Hedges' g)"),
		md: localize('systematicReview.measure.md', "Mean Difference"),
		logor: localize('systematicReview.measure.logor', "Log Odds Ratio"),
		logrr: localize('systematicReview.measure.logrr', "Log Risk Ratio"),
		z: localize('systematicReview.measure.z', "Correlation, as Fisher's z"),
		other: localize('systematicReview.measure.other', "Another Measure, with Its Standard Error"),
	};
}

/** What each measure is, for the extractors' TASK.md. */
function measureTexts(): Record<Measure, string> {
	return {
		smd: localize('systematicReview.measureText.smd', "the standardized mean difference, as Hedges' g, the intervention group minus the comparison group"),
		md: localize('systematicReview.measureText.md', "the mean difference, the intervention group minus the comparison group, in the outcome's unit"),
		logor: localize('systematicReview.measureText.logor', "the natural logarithm of the odds ratio, the intervention group against the comparison group"),
		logrr: localize('systematicReview.measureText.logrr', "the natural logarithm of the risk ratio, the intervention group against the comparison group"),
		z: localize('systematicReview.measureText.z', "the correlation, as Fisher's z, the inverse hyperbolic tangent of r"),
		other: localize('systematicReview.measureText.other', "the measure the outcome names, on the scale it is pooled on"),
	};
}

function isMeasure(value: unknown): value is Measure {
	return typeof value === 'string' && (MEASURES as readonly string[]).includes(value);
}

/** What the user sets in step 1. */
interface IQuestionInputs {
	readonly name: string;
	readonly question: string;
	readonly inclusion: string;
	readonly exclusion: string;
	readonly outcome: string;
	readonly measure: Measure;
}

interface ICellEntry {
	readonly agent: string;
	readonly model: string;
	readonly label: string;
}

/** A review as its study.toml records it. */
interface IStudy extends Omit<IQuestionInputs, 'name'> {
	readonly folder: URI;
	readonly name: string;
	readonly created: string;
	readonly screeners: readonly ICellEntry[];
	readonly adjudicator?: ICellEntry;
	readonly extractors: readonly ICellEntry[];
}

/** A record of the review: a work found in a file of references or in OpenAlex. */
interface IRecord {
	readonly id: string;
	readonly title: string;
	readonly abstract: string;
	readonly year?: number;
	/** The authors' names, as the source gives them: `Last, First` or `First Last`. */
	readonly authors: readonly string[];
	readonly journal: string;
	readonly doi: string;
	/** A link to the work, open access when OpenAlex knows one. */
	readonly link: string;
}

/** Where records came from: a file of references, or a search of OpenAlex. */
interface IRecordSource {
	readonly kind: 'file' | 'openalex';
	/** The file's name, or the search. */
	readonly label: string;
	/** The works read from the file, or that OpenAlex found. */
	readonly found: number;
	/** The works taken, before duplicates are removed. */
	readonly taken: number;
	/** The records added: those taken that were not duplicates. */
	readonly added: number;
	readonly date: string;
}

interface IRecords {
	readonly sources: readonly IRecordSource[];
	readonly records: readonly IRecord[];
}

/** The user's decisions: on each screening conflict, and which extraction to keep for each study. */
interface IChoices {
	readonly screening: Record<string, 'include' | 'exclude'>;
	readonly extraction: Record<string, '1' | '2' | 'exclude'>;
}

/** A row of an extractor's extraction.csv. */
interface IExtraction {
	readonly eligible: 'yes' | 'no' | '';
	readonly reason: string;
	readonly effect?: number;
	readonly se?: number;
	readonly n?: number;
	readonly how: string;
	readonly where: string;
	readonly notes: string;
}

/** The runs of the screeners, the adjudicator and the extractors of every review started since Pollis started. */
const runs = new StudyRuns();

type SystematicReviewMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'save'; readonly inputs: IQuestionInputs }
	| { readonly command: 'chooseFile'; readonly value: string }
	| { readonly command: 'addFile'; readonly path: string }
	| { readonly command: 'search'; readonly query: string; readonly from: number; readonly to: number; readonly limit: number }
	| { readonly command: 'startScreeners'; readonly cells: readonly { readonly agent: string; readonly model: string }[] }
	| { readonly command: 'settle'; readonly cell: { readonly agent: string; readonly model: string } }
	| { readonly command: 'decide'; readonly kind: 'screening' | 'extraction'; readonly id: string; readonly value: string }
	| { readonly command: 'addPdf'; readonly id: string }
	| { readonly command: 'startExtractors'; readonly cells: readonly { readonly agent: string; readonly model: string }[] }
	| { readonly command: 'runMeta' }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newStudy' }
	| { readonly command: 'open'; readonly agent: string; readonly what: 'output' | 'summary' | 'terminal' | 'stop' }
	| { readonly command: 'openFile'; readonly what: 'records' | 'meta' | 'pdf'; readonly id?: string }
	| { readonly command: 'openUrl'; readonly url: string }
	| { readonly command: 'restart'; readonly agent: string; readonly cell: { readonly agent: string; readonly model: string } };

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

function checkedCell(value: unknown): { agent: string; model: string } | undefined {
	const cell = value as { agent?: unknown; model?: unknown } | undefined;
	return typeof cell?.agent === 'string' && typeof cell.model === 'string' ? { agent: cell.agent, model: cell.model } : undefined;
}

/** The inputs of step 1 as the page sent them, checked. */
function checkedInputs(value: unknown): IQuestionInputs | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const { name, question, inclusion, exclusion, outcome, measure } = value as Record<string, unknown>;
	if (typeof name !== 'string' || typeof question !== 'string' || typeof inclusion !== 'string' || typeof exclusion !== 'string' || typeof outcome !== 'string' || !isMeasure(measure)) {
		return undefined;
	}
	return { name: name.trim(), question: question.trim(), inclusion: inclusion.trim(), exclusion: exclusion.trim(), outcome: outcome.trim(), measure };
}

function cellLines(name: string, cells: readonly ICellEntry[]): string[] {
	return cells.flatMap(cell => ['', `[[${name}]]`, `agent = ${tomlString(cell.agent)}`, `model = ${tomlString(cell.model)}`, `label = ${tomlString(cell.label)}`]);
}

function studyToml(study: IStudy): string {
	const lines = [
		'# Systematic Review: a study of Compose > Orchestration in Pollis',
		`question = ${tomlString(study.question)}`,
		`inclusion = ${tomlString(study.inclusion)}`,
		`exclusion = ${tomlString(study.exclusion)}`,
		`outcome = ${tomlString(study.outcome)}`,
		`measure = ${tomlString(study.measure)}`,
		`created = ${tomlString(study.created)}`,
	];
	if (study.adjudicator) {
		lines.push(`adjudicator_agent = ${tomlString(study.adjudicator.agent)}`, `adjudicator_model = ${tomlString(study.adjudicator.model)}`, `adjudicator_label = ${tomlString(study.adjudicator.label)}`);
	}
	return [...lines, ...cellLines('screeners', study.screeners), ...cellLines('extractors', study.extractors)].join('\n') + '\n';
}

function cellsOf(value: unknown): ICellEntry[] {
	return (Array.isArray(value) ? value as Record<string, unknown>[] : []).flatMap(entry =>
		typeof entry?.agent === 'string' && typeof entry.model === 'string' ? [{ agent: entry.agent, model: entry.model, label: typeof entry.label === 'string' ? entry.label : entry.agent }] : []);
}

async function readStudy(fileService: IFileService, folder: URI): Promise<IStudy | undefined> {
	try {
		const toml = parseToml((await fileService.readFile(joinPath(folder, STUDY_FILE))).value.toString());
		const text = (key: string) => typeof toml[key] === 'string' ? toml[key] as string : '';
		const adjudicator = text('adjudicator_agent') && text('adjudicator_model') ? { agent: text('adjudicator_agent'), model: text('adjudicator_model'), label: text('adjudicator_label') || text('adjudicator_agent') } : undefined;
		return {
			folder, name: basename(folder), question: text('question'), inclusion: text('inclusion'), exclusion: text('exclusion'), outcome: text('outcome'),
			measure: isMeasure(toml.measure) ? toml.measure : 'other', created: text('created'), screeners: cellsOf(toml.screeners), adjudicator, extractors: cellsOf(toml.extractors),
		};
	} catch {
		return undefined;
	}
}

async function readJson<T>(fileService: IFileService, file: URI): Promise<T | undefined> {
	try {
		return JSON.parse((await fileService.readFile(file)).value.toString()) as T;
	} catch {
		return undefined;
	}
}

async function readRecords(fileService: IFileService, study: URI): Promise<IRecords> {
	const records = await readJson<IRecords>(fileService, joinPath(study, RECORDS_FILE));
	return { sources: Array.isArray(records?.sources) ? records.sources : [], records: Array.isArray(records?.records) ? records.records : [] };
}

async function readChoices(fileService: IFileService, study: URI): Promise<IChoices> {
	const choices = await readJson<IChoices>(fileService, joinPath(study, CHOICES_FILE));
	return { screening: { ...choices?.screening }, extraction: { ...choices?.extraction } };
}

/** The rows of a CSV file an agent writes, by their `id`, each as its fields by the header's names; empty when it is not there. */
async function readCsvRows(fileService: IFileService, file: URI): Promise<Map<string, Record<string, string>>> {
	const rows = new Map<string, Record<string, string>>();
	try {
		const [header, ...lines] = parseCsv((await fileService.readFile(file)).value.toString().replace(/^\uFEFF/, ''));
		const names = header.map(name => name.trim().toLowerCase());
		for (const line of lines) {
			const row: Record<string, string> = {};
			names.forEach((name, index) => row[name] = (line[index] ?? '').trim());
			if (row.id) {
				rows.set(row.id, row);
			}
		}
	} catch {
		// Not written yet
	}
	return rows;
}

/** A screener's decision, as the page counts it: unsure goes on to the full text, as include does. */
function screeningDecision(row: Record<string, string> | undefined): 'include' | 'exclude' | 'unsure' | undefined {
	const decision = row?.decision?.toLowerCase();
	return decision === 'include' || decision === 'exclude' || decision === 'unsure' ? decision : undefined;
}

function numberOf(text: string | undefined): number | undefined {
	const value = text ? Number(text) : NaN;
	return text && Number.isFinite(value) ? value : undefined;
}

function extractionOf(row: Record<string, string> | undefined): IExtraction | undefined {
	if (!row) {
		return undefined;
	}
	const eligible = row.eligible?.toLowerCase();
	return {
		eligible: eligible === 'yes' || eligible === 'no' ? eligible : '', reason: row.reason ?? '', effect: numberOf(row.effect), se: numberOf(row.se), n: numberOf(row.n),
		how: row.how ?? '', where: row.where ?? '', notes: row.notes ?? '',
	};
}

function sameValue(a: number | undefined, b: number | undefined): boolean {
	if (a === undefined || b === undefined) {
		return a === b;
	}
	return Math.abs(a - b) <= Math.max(SAME_VALUE, 0.01 * Math.max(Math.abs(a), Math.abs(b)));
}

/** Whether the two extractions of a study agree: on eligibility and, for an eligible study, on its effect and standard error. */
function extractionsAgree(first: IExtraction | undefined, second: IExtraction | undefined): boolean {
	if (!first || !second || first.eligible !== second.eligible) {
		return false;
	}
	return first.eligible === 'no' || sameValue(first.effect, second.effect) && sameValue(first.se, second.se);
}

/** Whether an extraction can go into the meta-analysis: an eligible study with an effect and a positive standard error. */
function usable(extraction: IExtraction | undefined): extraction is IExtraction & { effect: number; se: number } {
	return extraction?.eligible === 'yes' && extraction.effect !== undefined && extraction.se !== undefined && extraction.se > 0;
}

/** A surname of a name written `Last, First` or `First Last`. */
function surname(name: string): string {
	const comma = name.indexOf(',');
	return (comma >= 0 ? name.slice(0, comma) : name.trim().split(/\s+/).pop() ?? name).trim();
}

/** A record's label, as a forest plot names a study: `Surname (Year)`, `Surname and Surname (Year)` or `Surname and others (Year)`. */
function recordLabel(record: IRecord): string {
	const names = record.authors.map(surname).filter(name => name);
	const authors = names.length === 0 ? record.title.slice(0, 40)
		: names.length === 1 ? names[0]
			: names.length === 2 ? localize('systematicReview.twoAuthors', "{0} and {1}", names[0], names[1])
				: localize('systematicReview.manyAuthors', "{0} and others", names[0]);
	return record.year ? `${authors} (${record.year})` : authors;
}

/** A title or DOI as a key that finds duplicates: lower case, letters and digits only. */
function titleKey(title: string): string {
	return title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
}

function doiOf(value: string | null | undefined): string {
	return (value ?? '').replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase();
}

/**
 * The records with `found` added: those whose DOI, or else whose title, no record has, numbered after the last.
 * A work found twice in `found` is added once.
 */
function withRecords(records: readonly IRecord[], found: readonly Omit<IRecord, 'id'>[]): { records: IRecord[]; added: number } {
	const dois = new Set(records.map(record => record.doi).filter(doi => doi));
	const titles = new Set(records.map(record => titleKey(record.title)));
	const all = [...records];
	let next = records.reduce((last, record) => Math.max(last, Number(record.id.slice(1)) || 0), 0);
	for (const work of found) {
		const key = titleKey(work.title);
		if (!key || work.doi && dois.has(work.doi) || titles.has(key)) {
			continue;
		}
		next++;
		all.push({ ...work, id: `R${String(next).padStart(4, '0')}` });
		if (work.doi) {
			dois.add(work.doi);
		}
		titles.add(key);
	}
	return { records: all, added: all.length - records.length };
}

/** The records as their CSV for the screeners, with `extra` columns of each record when given. */
function recordsCsv(records: readonly IRecord[], extra?: { readonly header: readonly string[]; readonly values: (record: IRecord) => readonly string[] }): string {
	return writeCsv([
		['id', 'title', 'abstract', 'year', 'authors', 'journal', 'doi', ...extra?.header ?? []],
		...records.map(record => [record.id, record.title, record.abstract, record.year ? String(record.year) : '', record.authors.join('; '), record.journal, record.doi, ...extra?.values(record) ?? []]),
	]);
}

/** The review's question, criteria, outcome and measure, as the agents' TASK.md lists them. */
function reviewLines(study: IStudy): string[] {
	return [
		localize('systematicReview.task.review', "## The Review"),
		'',
		localize('systematicReview.task.question', "**Question.** {0}", study.question),
		'',
		localize('systematicReview.task.inclusion', "**Inclusion criteria.**"),
		'',
		study.inclusion,
		'',
		localize('systematicReview.task.exclusion', "**Exclusion criteria.**"),
		'',
		study.exclusion || localize('systematicReview.task.noExclusion', "None beyond the inclusion criteria."),
		'',
		localize('systematicReview.task.outcome', "**Outcome.** {0}", study.outcome || localize('systematicReview.task.noOutcome', "As the question says.")),
		'',
		localize('systematicReview.task.measure', "**Effect measure.** {0}: {1}.", measureNames()[study.measure], measureTexts()[study.measure]),
		'',
	];
}

function screenerTask(study: IStudy, index: number, count: number, withoutAbstract: number): string {
	return [
		localize('systematicReview.task.title', "# Your Task"),
		'',
		localize('systematicReview.screenerTask.intro', "You are Screener {0} of the two screeners of the records of a systematic review. Each screens every record on its own. Follow SKILL.md, in this folder.", index + 1),
		'',
		...reviewLines(study),
		localize('systematicReview.task.records', "## The Records"),
		'',
		localize('systematicReview.screenerTask.records', "`data/records.csv` holds {0} records, {1} of them with no abstract. Screen every one.", count, withoutAbstract),
		'',
	].join('\n');
}

function adjudicatorTask(study: IStudy, count: number): string {
	return [
		localize('systematicReview.task.title', "# Your Task"),
		'',
		localize('systematicReview.adjudicatorTask.intro', "You are the third screener of the records of a systematic review: you settle the records the two screeners disagreed on. Follow SKILL.md, in this folder, with the rules for settling conflicts."),
		'',
		...reviewLines(study),
		localize('systematicReview.task.records', "## The Records"),
		'',
		localize('systematicReview.adjudicatorTask.records', "`data/records.csv` holds the {0} records the two screeners disagreed on, with each screener's decision and reason in `decision_1`, `reason_1`, `decision_2` and `reason_2`. Decide each: include or exclude.", count),
		'',
	].join('\n');
}

function extractorTask(study: IStudy, index: number, count: number, withText: number): string {
	return [
		localize('systematicReview.task.title', "# Your Task"),
		'',
		localize('systematicReview.extractorTask.intro', "You are Extractor {0} of the two extractors of the studies of a systematic review. Each extracts every study on its own. Follow SKILL.md, in this folder.", index + 1),
		'',
		...reviewLines(study),
		localize('systematicReview.extractorTask.studies', "## The Studies"),
		'',
		localize('systematicReview.extractorTask.count', "`data/studies.csv` holds the {0} studies the screening kept. {1} of them have a full text in `data/full-texts/`; the others have only their abstract.", count, withText),
		'',
		localize('systematicReview.task.julia', "## Running Julia"),
		'',
		localize('systematicReview.task.juliaText', "To compute an effect and its standard error, run Julia with the command below, which gives Julia the packages of Pollis:"),
		'',
		'```sh',
		`julia -L "${pollisJlPath()}" file.jl`,
		'```',
		'',
	].join('\n');
}

/**
 * The Julia of meta.jl: the fixed effect (inverse variance) and random effects (DerSimonian and Laird) estimates of
 * the effects in effects.csv, Cochran's Q, I2 and H2 (Higgins and Thompson), and Egger's regression test of the
 * funnel plot's asymmetry, into results.json.
 */
function metaCode(): string {
	return String.raw`# Systematic Review: written by Pollis. The meta-analysis of the effects in effects.csv, each with its standard error:
# the fixed effect (inverse variance) and random effects (DerSimonian and Laird, 1986) estimates, Cochran's Q, I2 and H2
# (Higgins and Thompson, 2002) and Egger's regression test of the funnel plot (Egger and others, 1997), into
# results.json. Run it from this folder:
#   julia -L Pollis.jl meta.jl
Pollis.packages("Distributions")
import DelimitedFiles, Distributions, LinearAlgebra
let study = @__DIR__
${JULIA_TO_JSON}
	table, _ = DelimitedFiles.readdlm(joinpath(study, "${EFFECTS_CSV}"), ',', Any; header = true)
	ids = string.(table[:, 1])
	y = Float64.(table[:, 2])
	se = Float64.(table[:, 3])
	k = length(y)
	v = se .^ 2
	z975 = Distributions.quantile(Distributions.Normal(), 0.975)
	summary(estimate, s) = Dict("estimate" => estimate, "se" => s, "low" => estimate - z975 * s, "high" => estimate + z975 * s,
		"z" => estimate / s, "p" => 2 * Distributions.ccdf(Distributions.Normal(), abs(estimate / s)))
	# Fixed effect: weights the inverse of each variance
	w = 1 ./ v
	fixed = sum(w .* y) / sum(w)
	q = sum(w .* (y .- fixed) .^ 2)
	df = k - 1
	# Random effects: the between-study variance of DerSimonian and Laird
	tau2 = max(0.0, (q - df) / (sum(w) - sum(w .^ 2) / sum(w)))
	wr = 1 ./ (v .+ tau2)
	random = sum(wr .* y) / sum(wr)
	random_summary = merge(summary(random, sqrt(1 / sum(wr))), Dict("tau2" => tau2, "tau" => sqrt(tau2)))
	heterogeneity = Dict("q" => q, "df" => df, "p" => df > 0 ? Distributions.ccdf(Distributions.Chisq(df), q) : nothing,
		"i2" => q > df ? (q - df) / q : 0.0, "h2" => df > 0 ? q / df : nothing)
	# Egger's test: the standardized effect regressed on the precision; an intercept away from 0 is asymmetry
	egger = nothing
	if k >= 3
		x, t = 1 ./ se, y ./ se
		X = hcat(ones(k), x)
		b = X \ t
		residuals = t .- X * b
		s2 = sum(residuals .^ 2) / (k - 2)
		cov = s2 * LinearAlgebra.inv(transpose(X) * X)
		intercept_se = sqrt(cov[1, 1])
		statistic = b[1] / intercept_se
		egger = Dict("intercept" => b[1], "se" => intercept_se, "t" => statistic, "df" => k - 2,
			"p" => 2 * Distributions.ccdf(Distributions.TDist(k - 2), abs(statistic)))
	end
	studies = [Dict("id" => ids[i], "effect" => y[i], "se" => se[i], "low" => y[i] - z975 * se[i], "high" => y[i] + z975 * se[i],
		"weight_fixed" => w[i] / sum(w), "weight_random" => wr[i] / sum(wr)) for i in 1:k]
	write(joinpath(study, "${RESULTS_FILE}"), to_json(Dict("finished" => Libc.strftime("%Y-%m-%d %H:%M", time()), "k" => k,
		"fixed" => summary(fixed, sqrt(1 / sum(w))), "random" => random_summary, "heterogeneity" => heterogeneity, "egger" => egger, "studies" => studies)))
	println("The meta-analysis is in ", joinpath(study, "${RESULTS_FILE}"))
end
`;
}

/** The Julia code the REPL runs: meta.jl in a new Julia process. */
function runMetaCode(study: IStudy): string {
	return String.raw`# Systematic Review: the meta-analysis of the review, in a new Julia process
let dir = raw"${study.folder.fsPath}", pollis = raw"${pollisJlPath()}"
	command = Cmd(Cmd([Base.julia_cmd().exec; "-L"; pollis; "${META_FILE}"]); dir = dir)
	success(command) || println("Systematic Review: meta.jl did not finish, see the messages above")
end`;
}

/** A finite number of a parsed JSON value, else undefined. */
function finite(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** The meta-analysis of results.json, checked; undefined when it is not there or not whole. */
function resultsOf(json: unknown) {
	const value = json as Record<string, unknown> | undefined;
	const summary = (part: unknown) => {
		const entry = part as Record<string, unknown> | undefined;
		const estimate = finite(entry?.estimate), se = finite(entry?.se), low = finite(entry?.low), high = finite(entry?.high);
		return estimate !== undefined && se !== undefined && low !== undefined && high !== undefined ? { estimate, se, low, high, p: finite(entry?.p), tau2: finite(entry?.tau2) } : undefined;
	};
	const fixed = summary(value?.fixed), random = summary(value?.random);
	if (!value || !fixed || !random || !Array.isArray(value.studies)) {
		return undefined;
	}
	const studies = (value.studies as Record<string, unknown>[]).flatMap(entry => {
		const effect = finite(entry?.effect), se = finite(entry?.se), low = finite(entry?.low), high = finite(entry?.high);
		return typeof entry?.id === 'string' && effect !== undefined && se !== undefined && low !== undefined && high !== undefined
			? [{ id: entry.id, effect, se, low, high, weightFixed: finite(entry.weight_fixed) ?? 0, weightRandom: finite(entry.weight_random) ?? 0 }] : [];
	});
	const heterogeneity = value.heterogeneity as Record<string, unknown> | undefined;
	const egger = value.egger as Record<string, unknown> | null | undefined;
	return {
		finished: typeof value.finished === 'string' ? value.finished : '',
		fixed, random, studies,
		q: finite(heterogeneity?.q), df: finite(heterogeneity?.df), pQ: finite(heterogeneity?.p), i2: finite(heterogeneity?.i2), h2: finite(heterogeneity?.h2),
		egger: egger && finite(egger.intercept) !== undefined ? { intercept: finite(egger.intercept), se: finite(egger.se), p: finite(egger.p) } : undefined,
	};
}

/** Opens the Systematic Review page, or shows it when it is open. */
async function openSystematicReviewPage(accessor: ServicesAccessor): Promise<void> {
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
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);
	const terminalService = accessor.get(ITerminalService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const progressService = accessor.get(IProgressService);
	const instantiationService = accessor.get(IInstantiationService);
	const fileDialogService = accessor.get(IFileDialogService);
	const requestService = accessor.get(IRequestService);
	const secretStorageService = accessor.get(ISecretStorageService);
	const launchServices = { terminalService, terminalInstanceService, fileService, commandService, progressService, workspaceContextService: contextService, pathService };
	const providers = new ProviderRequests(requestService, secretStorageService, CALL_SITE);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('systematicReview.title', "Systematic Review");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.systematicReview',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'systematicReview', title, SYSTEMATICREVIEW_METADATA.systematicReview, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The review shown in steps 2 to 8, once saved or opened; its folders are watched. */
	let current: IStudy | undefined;
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	runs.onEnded = () => refresh.schedule();
	const home = await pathService.userHome({ preferLocal: true });
	const problem = (step: string, text: string) => post({ command: 'problem', step, text });

	const watch = (study: IStudy | undefined) => {
		current = study;
		if (!study) {
			watcher.clear();
			return;
		}
		const store = new DisposableStore();
		for (const folder of [study.folder, joinPath(study.folder, FULL_TEXTS), ...[...SCREENERS, ADJUDICATOR, ...EXTRACTORS].map(key => joinPath(study.folder, key))]) {
			const fileWatcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			store.add(fileWatcher.onDidChange(() => refresh.schedule()));
		}
		watcher.value = store;
	};

	const studyNames = async (root: URI): Promise<string[]> => {
		if (!await fileService.exists(root)) {
			return [];
		}
		const stat = await fileService.resolve(root, { resolveMetadata: true });
		const studies = [];
		for (const child of stat.children ?? []) {
			if (child.isDirectory && await fileService.exists(joinPath(child.resource, STUDY_FILE))) {
				studies.push(child);
			}
		}
		return studies.sort((a, b) => b.mtime - a.mtime).map(child => child.name);
	};

	/**
	 * The screening of a review: each record's decisions by the two screeners, the conflicts (one includes, or is
	 * unsure, and the other excludes) with the adjudicator's decision and the user's, and the records included.
	 */
	const screeningOf = async (study: IStudy, records: readonly IRecord[], choices: IChoices) => {
		const [first, second, third] = await Promise.all([...SCREENERS, ADJUDICATOR].map(key => readCsvRows(fileService, joinPath(study.folder, key, SCREENING_CSV))));
		const goesOn = (decision: string | undefined) => decision === 'include' || decision === 'unsure';
		let both = 0, bothInclude = 0, bothExclude = 0, firstOn = 0, secondOn = 0;
		const conflicts = [];
		const included: IRecord[] = [];
		let unsettled = 0;
		for (const record of records) {
			const d1 = screeningDecision(first.get(record.id)), d2 = screeningDecision(second.get(record.id));
			if (!d1 || !d2) {
				continue;
			}
			both++;
			firstOn += goesOn(d1) ? 1 : 0;
			secondOn += goesOn(d2) ? 1 : 0;
			if (goesOn(d1) && goesOn(d2)) {
				bothInclude++;
				included.push(record);
			} else if (!goesOn(d1) && !goesOn(d2)) {
				bothExclude++;
			} else {
				const agent = screeningDecision(third.get(record.id));
				const settled = choices.screening[record.id] ?? (agent === 'include' || agent === 'exclude' ? agent : undefined);
				if (settled === 'include') {
					included.push(record);
				} else if (!settled) {
					unsettled++;
				}
				conflicts.push({
					id: record.id, label: recordLabel(record), title: record.title, link: record.link,
					d1, r1: first.get(record.id)?.reason ?? '', d2, r2: second.get(record.id)?.reason ?? '',
					agent: agent === 'include' || agent === 'exclude' ? agent : undefined, agentReason: third.get(record.id)?.reason ?? '', yours: choices.screening[record.id],
				});
			}
		}
		// Cohen's kappa of the two screeners on going on or not: the agreement observed beyond that expected by chance
		const observed = both ? (bothInclude + bothExclude) / both : undefined;
		const expected = both ? (firstOn / both) * (secondOn / both) + (1 - firstOn / both) * (1 - secondOn / both) : undefined;
		const kappa = observed !== undefined && expected !== undefined && expected < 1 ? (observed - expected) / (1 - expected) : undefined;
		return { both, bothInclude, bothExclude, conflicts, included, unsettled, agreement: observed, kappa };
	};

	/** The two extractions of each study included, whether they agree, and the one the user keeps. */
	const extractionOfStudies = async (study: IStudy, included: readonly IRecord[], choices: IChoices) => {
		const [first, second] = await Promise.all(EXTRACTORS.map(key => readCsvRows(fileService, joinPath(study.folder, key, EXTRACTION_CSV))));
		return included.map(record => {
			const e1 = extractionOf(first.get(record.id)), e2 = extractionOf(second.get(record.id));
			const agree = extractionsAgree(e1, e2);
			const choice = choices.extraction[record.id] ?? (agree ? '1' : undefined);
			const kept = choice === '1' ? e1 : choice === '2' ? e2 : undefined;
			return { id: record.id, label: recordLabel(record), title: record.title, e1, e2, agree, choice, kept };
		});
	};

	let cells: IOrchestrationCell[] = [];
	const sendState = async () => {
		const root = await studiesFolder(contextService, fileService, pathService, KIND);
		const studies = await studyNames(root);
		const study = current && await readStudy(fileService, current.folder);
		let state: object | undefined;
		if (study) {
			const { sources, records } = await readRecords(fileService, study.folder);
			const choices = await readChoices(fileService, study.folder);
			const screenerRuns = await Promise.all(study.screeners.map(async (entry, index) => ({
				...await runs.state(fileService, study.folder, SCREENERS[index], entry.label, SCREENING_DONE), agent: entry.agent, model: entry.model,
				decided: (await readCsvRows(fileService, joinPath(study.folder, SCREENERS[index], SCREENING_CSV))).size,
			})));
			const adjudicatorRun = study.adjudicator && { ...await runs.state(fileService, study.folder, ADJUDICATOR, study.adjudicator.label, SCREENING_DONE), agent: study.adjudicator.agent, model: study.adjudicator.model };
			const extractorRuns = await Promise.all(study.extractors.map(async (entry, index) => ({
				...await runs.state(fileService, study.folder, EXTRACTORS[index], entry.label, EXTRACTION_DONE), agent: entry.agent, model: entry.model,
			})));
			const screened = screenerRuns.length === 2 && screenerRuns.every(run => run.hasFile);
			const screening = screened ? await screeningOf(study, records, choices) : undefined;
			const fullTexts = screening ? await Promise.all(screening.included.map(async record => ({
				id: record.id, label: recordLabel(record), title: record.title, link: record.link,
				pdf: await fileService.exists(joinPath(study.folder, FULL_TEXTS, `${record.id}.pdf`)),
			}))) : [];
			const extracted = extractorRuns.length === 2 && extractorRuns.every(run => run.hasFile);
			const differences = extracted && screening ? await extractionOfStudies(study, screening.included, choices) : undefined;
			const results = resultsOf(await readJson(fileService, joinPath(study.folder, RESULTS_FILE)));
			const kept = differences?.filter(study => usable(study.kept)) ?? [];
			// The meta-analysis is out of date when its studies or their values are not those kept now
			const stale = !!results && (results.studies.length !== kept.length || results.studies.some((entry, index) => entry.id !== kept[index].id || !sameValue(entry.effect, kept[index].kept?.effect) || !sameValue(entry.se, kept[index].kept?.se)));
			state = {
				name: study.name, question: study.question, inclusion: study.inclusion, exclusion: study.exclusion, outcome: study.outcome, measure: study.measure,
				records: { count: records.length, withoutAbstract: records.filter(record => !record.abstract).length, sources },
				screeners: screenerRuns,
				adjudicator: adjudicatorRun,
				screening: screening && { missing: records.length - screening.both, both: screening.both, bothInclude: screening.bothInclude, bothExclude: screening.bothExclude, agreement: screening.agreement, kappa: screening.kappa, conflicts: screening.conflicts, unsettled: screening.unsettled, included: screening.included.length },
				fullTexts,
				extractors: extractorRuns,
				differences: differences?.map(entry => ({ ...entry, usable: usable(entry.kept) })),
				labels: Object.fromEntries((screening?.included ?? []).map(record => [record.id, recordLabel(record)])),
				results, stale,
			};
		}
		post({ command: 'state', root: root.fsPath, studies, cells, suggestion: freeStudyName('review', studies), study: state });
	};

	/** Writes the review's folder and study.toml. */
	const save = async (inputs: IQuestionInputs) => {
		const root = await studiesFolder(contextService, fileService, pathService, KIND);
		if (!validStudyName(inputs.name)) {
			problem('question', localize('systematicReview.badName', "The review's name is its folder's: letters, digits, hyphens and underscores, starting with a letter or digit."));
			return;
		}
		if (await fileService.exists(joinPath(root, inputs.name))) {
			problem('question', localize('systematicReview.taken', "There is a review {0} already: open it from the list, or give the new one another name.", inputs.name));
			return;
		}
		if (!inputs.question || !inputs.inclusion) {
			problem('question', localize('systematicReview.needQuestion', "Write the question and the inclusion criteria first."));
			return;
		}
		const study: IStudy = {
			...inputs, folder: joinPath(root, inputs.name), created: new Date().toISOString().slice(0, 16).replace('T', ' '), screeners: [], extractors: [],
		};
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(study)));
		watch(study);
		await sendState();
	};

	/** Adds the works found to the records, duplicates removed, and records where they came from. */
	const addRecords = async (study: IStudy, found: readonly Omit<IRecord, 'id'>[], source: Omit<IRecordSource, 'taken' | 'added' | 'date'>) => {
		const { sources, records } = await readRecords(fileService, study.folder);
		const { records: all, added } = withRecords(records, found);
		const entry: IRecordSource = { ...source, taken: found.length, added, date: new Date().toISOString().slice(0, 10) };
		await fileService.writeFile(joinPath(study.folder, RECORDS_FILE), VSBuffer.fromString(JSON.stringify({ sources: [...sources, entry], records: all }, undefined, '\t') + '\n'));
		await fileService.writeFile(joinPath(study.folder, RECORDS_CSV), VSBuffer.fromString(recordsCsv(all)));
		post({ command: 'added', found: source.found, taken: found.length, added });
	};

	const recordsLocked = async (study: IStudy, step: string) => {
		if (study.screeners.length) {
			problem(step, localize('systematicReview.recordsLocked', "The screeners have started: no record can be added to this review. Choose New Study for another."));
			return true;
		}
		return false;
	};

	const addFile = async (path: string) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study || await recordsLocked(study, 'file')) {
			return;
		}
		const file = folderUri(path, home);
		if (!path || !await fileService.exists(file)) {
			problem('file', localize('systematicReview.noFile', "Choose a file of references: BibTeX, RIS or CSL-JSON."));
			return;
		}
		const read = readReferences((await fileService.readFile(file)).value.toString());
		if (read.format === 'dois') {
			problem('file', localize('systematicReview.notReferences', "The file is not BibTeX, RIS or CSL-JSON: export the search's results in one of them."));
			return;
		}
		const found = read.references.map(reference => ({
			title: reference.title, abstract: reference.abstract ?? '', year: reference.year, authors: reference.authors ?? [], journal: reference.journal ?? reference.booktitle ?? '',
			doi: doiOf(reference.doi), link: reference.oa_url ?? (reference.doi ? `https://doi.org/${doiOf(reference.doi)}` : reference.url ?? ''),
		}));
		await addRecords(study, found, { kind: 'file', label: basename(file), found: read.references.length + read.unread });
		await sendState();
	};

	/** Adds the works of an OpenAlex search of titles and abstracts, of the years given, up to `limit` of them. */
	const search = async (query: string, from: number, to: number, limit: number) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study || await recordsLocked(study, 'search')) {
			return;
		}
		if (!query) {
			problem('search', localize('systematicReview.noQuery', "Write the search first."));
			return;
		}
		post({ command: 'searching' });
		// Commas part OpenAlex's filters, so the search has none
		const filter = `title_and_abstract.search:${query.replace(/,/g, ' ')},publication_year:${from}-${to},type:${OPENALEX_TYPES}`;
		const select = 'id,doi,title,publication_year,authorships,primary_location,open_access,abstract_inverted_index';
		const works: IOpenAlexWork[] = [];
		let cursor: string | undefined = '*';
		let count = 0;
		while (cursor && works.length < limit) {
			const context = await providers.ask(API_PROVIDERS.openAlex, { url: `https://api.openalex.org/works?filter=${encodeURIComponent(filter)}&per_page=${OPENALEX_PAGE}&cursor=${encodeURIComponent(cursor)}&select=${select}` });
			const answer = context && isSuccess(context) ? await asJson<{ meta?: { count?: number; next_cursor?: string | null }; results?: IOpenAlexWork[] }>(context) : undefined;
			if (!answer?.results) {
				problem('search', works.length
					? localize('systematicReview.searchCut', "OpenAlex stopped answering after {0} works: they are added. Search again later for the rest.", works.length)
					: localize('systematicReview.searchFailed', "OpenAlex could not be reached, or did not accept the search: check it, and the connection."));
				break;
			}
			count = answer.meta?.count ?? count;
			works.push(...answer.results);
			cursor = answer.results.length ? answer.meta?.next_cursor ?? undefined : undefined;
		}
		const found = works.slice(0, limit).flatMap(work => work.title ? [{
			title: work.title, abstract: work.abstract_inverted_index ? invertedText(work.abstract_inverted_index) : '', year: work.publication_year ?? undefined,
			authors: (work.authorships ?? []).map(authorship => authorship.author?.display_name).filter((name): name is string => !!name),
			journal: work.primary_location?.source?.display_name ?? '', doi: doiOf(work.doi),
			link: work.open_access?.oa_url ?? (work.doi ? `https://doi.org/${doiOf(work.doi)}` : work.id),
		}] : []);
		if (works.length) {
			await addRecords(study, found, { kind: 'openalex', label: localize('systematicReview.searchLabel', "{0}, {1} to {2}", query, from, to), found: count });
		} else if (!cursor) {
			problem('search', localize('systematicReview.nothingFound', "OpenAlex found no work for this search in these years."));
		}
		await sendState();
	};

	const skillOf = async (name: string, step: string) => {
		const skill = await instantiationService.invokeFunction(skillFile, name);
		if (!skill || !await fileService.exists(skill)) {
			problem(step, localize('systematicReview.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", name));
			return undefined;
		}
		return skill;
	};

	const cellOf = (chosen: { agent: string; model: string }) => cells.find(other => other.agent === chosen.agent && other.model === chosen.model);

	const startScreener = async (study: IStudy, index: number, skill: URI, focus: boolean) => {
		const { records } = await readRecords(fileService, study.folder);
		const key = SCREENERS[index];
		await fileService.writeFile(joinPath(study.folder, key, 'data', RECORDS_CSV), VSBuffer.fromString(recordsCsv(records)));
		await startStudyAgent(launchServices, configurationService, notificationService, runs, {
			study: study.folder, key, cell: study.screeners[index], skill, focus, task: screenerTask(study, index, records.length, records.filter(record => !record.abstract).length),
			terminalName: localize('systematicReview.screenerTerminal', "Systematic Review: {0}, Screener {1} ({2})", study.name, index + 1, study.screeners[index].label),
		});
	};

	const startScreeners = async (chosen: { agent: string; model: string }[]) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const screeners = chosen.map(cellOf);
		if (screeners.length !== 2 || screeners.some(cell => !cell)) {
			problem('screen', localize('systematicReview.noScreenerCell', "Choose an agent and a model for each screener."));
			return;
		}
		if (!(await readRecords(fileService, study.folder)).records.length) {
			problem('screen', localize('systematicReview.noRecords', "Add records first, from a file or from OpenAlex."));
			return;
		}
		const skill = await skillOf(SCREEN_SKILL, 'screen');
		if (!skill) {
			return;
		}
		const withScreeners: IStudy = { ...study, screeners: screeners.map(cell => ({ agent: cell!.agent, model: cell!.model, label: cell!.label })) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withScreeners)));
		watch(withScreeners);
		for (const index of withScreeners.screeners.keys()) {
			await startScreener(withScreeners, index, skill, index === 0);
		}
		await sendState();
	};

	/** Starts the adjudicator on the conflicts of the screening, with both screeners' decisions and reasons. */
	const startAdjudicator = async (study: IStudy, cell: ICellEntry, step: string) => {
		const skill = await skillOf(SCREEN_SKILL, step);
		if (!skill) {
			return;
		}
		const { records } = await readRecords(fileService, study.folder);
		const [first, second] = await Promise.all(SCREENERS.map(key => readCsvRows(fileService, joinPath(study.folder, key, SCREENING_CSV))));
		const goesOn = (decision: string | undefined) => decision === 'include' || decision === 'unsure';
		const conflicts = records.filter(record => {
			const d1 = screeningDecision(first.get(record.id)), d2 = screeningDecision(second.get(record.id));
			return d1 && d2 && goesOn(d1) !== goesOn(d2);
		});
		if (!conflicts.length) {
			problem(step, localize('systematicReview.noConflicts', "The two screeners agree on every record: there is nothing to settle."));
			return;
		}
		const withAdjudicator: IStudy = { ...study, adjudicator: cell };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withAdjudicator)));
		await fileService.writeFile(joinPath(study.folder, ADJUDICATOR, 'data', RECORDS_CSV), VSBuffer.fromString(recordsCsv(conflicts, {
			header: ['decision_1', 'reason_1', 'decision_2', 'reason_2'],
			values: record => [first.get(record.id)?.decision ?? '', first.get(record.id)?.reason ?? '', second.get(record.id)?.decision ?? '', second.get(record.id)?.reason ?? ''],
		})));
		watch(withAdjudicator);
		await startStudyAgent(launchServices, configurationService, notificationService, runs, {
			study: study.folder, key: ADJUDICATOR, cell, skill, focus: true, task: adjudicatorTask(withAdjudicator, conflicts.length),
			terminalName: localize('systematicReview.adjudicatorTerminal', "Systematic Review: {0}, Third Screener ({1})", study.name, cell.label),
		});
		await sendState();
	};

	const running = (study: IStudy, keys: readonly string[]) => keys.some(key => {
		const run = runs.get(study.folder, key);
		return run && run.ended === undefined;
	});

	const settle = async (chosen: { agent: string; model: string }) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const cell = cellOf(chosen);
		if (!cell) {
			problem('settle', localize('systematicReview.noAdjudicatorCell', "Choose an agent and a model for the third screener."));
			return;
		}
		if (running(study, SCREENERS)) {
			problem('settle', localize('systematicReview.waitScreeners', "Wait for the screeners to end, or stop them."));
			return;
		}
		await startAdjudicator(study, { agent: cell.agent, model: cell.model, label: cell.label }, 'settle');
	};

	/** The records the screening kept, as the extractors get them, with the file of each one's full text. */
	const startExtractor = async (study: IStudy, index: number, skill: URI, focus: boolean) => {
		const { records } = await readRecords(fileService, study.folder);
		const screening = await screeningOf(study, records, await readChoices(fileService, study.folder));
		const key = EXTRACTORS[index];
		const data = joinPath(study.folder, key, 'data');
		const rows: string[][] = [['id', 'title', 'year', 'authors', 'journal', 'doi', 'abstract', 'full_text']];
		let withText = 0;
		for (const record of screening.included) {
			const pdf = joinPath(study.folder, FULL_TEXTS, `${record.id}.pdf`);
			const has = await fileService.exists(pdf);
			if (has) {
				withText++;
				await fileService.copy(pdf, joinPath(data, FULL_TEXTS, `${record.id}.pdf`), true);
				const text = joinPath(study.folder, FULL_TEXTS, `${record.id}.txt`);
				if (await fileService.exists(text)) {
					await fileService.copy(text, joinPath(data, FULL_TEXTS, `${record.id}.txt`), true);
				}
			}
			rows.push([record.id, record.title, record.year ? String(record.year) : '', record.authors.join('; '), record.journal, record.doi, record.abstract, has ? `${FULL_TEXTS}/${record.id}.pdf` : '']);
		}
		await fileService.writeFile(joinPath(data, STUDIES_CSV), VSBuffer.fromString(writeCsv(rows)));
		await startStudyAgent(launchServices, configurationService, notificationService, runs, {
			study: study.folder, key, cell: study.extractors[index], skill, focus, task: extractorTask(study, index, screening.included.length, withText),
			terminalName: localize('systematicReview.extractorTerminal', "Systematic Review: {0}, Extractor {1} ({2})", study.name, index + 1, study.extractors[index].label),
		});
	};

	const startExtractors = async (chosen: { agent: string; model: string }[]) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const extractors = chosen.map(cellOf);
		if (extractors.length !== 2 || extractors.some(cell => !cell)) {
			problem('extract', localize('systematicReview.noExtractorCell', "Choose an agent and a model for each extractor."));
			return;
		}
		const { records } = await readRecords(fileService, study.folder);
		const screening = await screeningOf(study, records, await readChoices(fileService, study.folder));
		if (screening.unsettled) {
			problem('extract', localize('systematicReview.settleFirst', "Settle the {0} conflicts of the screening first, in Conflicts.", screening.unsettled));
			return;
		}
		if (!screening.included.length) {
			problem('extract', localize('systematicReview.noneIncluded', "The screening kept no record: there is nothing to extract."));
			return;
		}
		const skill = await skillOf(EXTRACT_SKILL, 'extract');
		if (!skill) {
			return;
		}
		const withExtractors: IStudy = { ...study, extractors: extractors.map(cell => ({ agent: cell!.agent, model: cell!.model, label: cell!.label })) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withExtractors)));
		watch(withExtractors);
		for (const index of withExtractors.extractors.keys()) {
			await startExtractor(withExtractors, index, skill, index === 0);
		}
		await sendState();
	};

	/** Starts a screener, the third screener or an extractor again, on the agent and model now chosen for it, in its folder emptied. */
	const restart = async (key: string, chosen: { agent: string; model: string }) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const step = EXTRACTORS.includes(key) ? 'extract' : key === ADJUDICATOR ? 'settle' : 'screen';
		const run = runs.get(study.folder, key);
		if (run && run.ended === undefined) {
			problem(step, localize('systematicReview.stillRunning', "It is running: stop it first, then restart it."));
			return;
		}
		const cell = cellOf(chosen);
		if (!cell) {
			problem(step, localize('systematicReview.noRestartCell', "Choose an agent and a model for it, then restart it."));
			return;
		}
		const entry = { agent: cell.agent, model: cell.model, label: cell.label };
		const folder = joinPath(study.folder, key);
		if (key === ADJUDICATOR) {
			if (await fileService.exists(folder)) {
				await fileService.del(folder, { recursive: true, useTrash: true });
			}
			await startAdjudicator(study, entry, step);
			return;
		}
		const screener = SCREENERS.indexOf(key), extractor = EXTRACTORS.indexOf(key);
		const skill = await skillOf(screener >= 0 ? SCREEN_SKILL : EXTRACT_SKILL, step);
		if (!skill || screener < 0 && extractor < 0) {
			return;
		}
		const updated: IStudy = screener >= 0
			? { ...study, screeners: study.screeners.map((other, index) => index === screener ? entry : other) }
			: { ...study, extractors: study.extractors.map((other, index) => index === extractor ? entry : other) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(updated)));
		if (await fileService.exists(folder)) {
			await fileService.del(folder, { recursive: true, useTrash: true });
		}
		watch(updated);
		await (screener >= 0 ? startScreener(updated, screener, skill, true) : startExtractor(updated, extractor, skill, true));
		await sendState();
	};

	const decide = async (kind: 'screening' | 'extraction', id: string, value: string) => {
		if (!current) {
			return;
		}
		const choices = await readChoices(fileService, current.folder);
		if (kind === 'screening' && (value === 'include' || value === 'exclude')) {
			choices.screening[id] = value;
		} else if (kind === 'extraction' && (value === '1' || value === '2' || value === 'exclude')) {
			choices.extraction[id] = value;
		} else {
			return;
		}
		await fileService.writeFile(joinPath(current.folder, CHOICES_FILE), VSBuffer.fromString(JSON.stringify(choices, undefined, '\t') + '\n'));
		await sendState();
	};

	/** Copies a PDF the user chooses as a record's full text, with its text, page by page, from the Poppler tools. */
	const addPdf = async (id: string) => {
		if (!current || !/^R\d+$/.test(id)) {
			return;
		}
		const picked = await fileDialogService.showOpenDialog({
			title: localize('systematicReview.choosePdf', "Choose the Full Text of {0}", id),
			canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
			filters: [{ name: 'PDF', extensions: ['pdf'] }],
			defaultUri: home,
		});
		if (!picked?.[0]) {
			return;
		}
		const target = joinPath(current.folder, FULL_TEXTS, `${id}.pdf`);
		await fileService.copy(picked[0], target, true);
		const answer = await commandService.executeCommand<{ error?: string }>('language-julia.pollisPoppler', {
			op: 'run', tool: 'pdftotext', args: ['-enc', 'UTF-8', target.fsPath, joinPath(current.folder, FULL_TEXTS, `${id}.txt`).fsPath],
		}).catch(() => undefined);
		if (answer?.error === 'installing') {
			problem('texts', localize('systematicReview.installing', "The PDF tools are being installed, to read the full text: add it again in a minute."));
		}
		await sendState();
	};

	/** Writes effects.csv, the effects kept, and meta.jl, and runs it in a new Julia process. */
	const runMeta = async () => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const { records } = await readRecords(fileService, study.folder);
		const choices = await readChoices(fileService, study.folder);
		const screening = await screeningOf(study, records, choices);
		const studies = await extractionOfStudies(study, screening.included, choices);
		if (studies.some(entry => !entry.choice)) {
			problem('meta', localize('systematicReview.settleDifferences', "Settle the differences between the extractors first, in Differences."));
			return;
		}
		const kept = studies.filter(entry => usable(entry.kept));
		if (kept.length < 2) {
			problem('meta', localize('systematicReview.needTwo', "A meta-analysis needs two studies or more with an effect and its standard error."));
			return;
		}
		await fileService.writeFile(joinPath(study.folder, EFFECTS_CSV), VSBuffer.fromString(writeCsv([['id', 'effect', 'se'], ...kept.map(entry => [entry.id, String(entry.kept!.effect), String(entry.kept!.se)])])));
		await fileService.writeFile(joinPath(study.folder, META_FILE), VSBuffer.fromString(metaCode()));
		await sendToJuliaRepl(runMetaCode(study), commandService);
		post({ command: 'sent' });
	};

	const openAgentFile = async (key: string, what: 'output' | 'summary' | 'terminal' | 'stop') => {
		if (!current || ![...SCREENERS, ADJUDICATOR, ...EXTRACTORS].includes(key)) {
			return;
		}
		if (what === 'stop') {
			await stopAgentRun(runs.get(current.folder, key));
			return;
		}
		if (what === 'terminal') {
			const run = runs.get(current.folder, key);
			if (run && !run.terminal.isDisposed) {
				terminalService.setActiveInstance(run.terminal);
				await terminalService.revealTerminal(run.terminal);
			}
			return;
		}
		const extractor = EXTRACTORS.includes(key);
		const file = joinPath(current.folder, key, what === 'output' ? (extractor ? EXTRACTION_CSV : SCREENING_CSV) : (extractor ? EXTRACTION_DONE : SCREENING_DONE));
		if (await fileService.exists(file)) {
			await editorService.openEditor({ resource: file });
		}
	};

	const openStudyFile = async (what: 'records' | 'meta' | 'pdf', id: string | undefined) => {
		if (!current) {
			return;
		}
		const file = what === 'records' ? joinPath(current.folder, RECORDS_CSV)
			: what === 'meta' ? joinPath(current.folder, META_FILE)
				: id && /^R\d+$/.test(id) ? joinPath(current.folder, FULL_TEXTS, `${id}.pdf`) : undefined;
		if (file && await fileService.exists(file)) {
			await editorService.openEditor({ resource: file });
		}
	};

	const chooseFile = async (value: string) => {
		const start = value ? folderUri(value, home) : home;
		const picked = await fileDialogService.showOpenDialog({
			title: localize('systematicReview.chooseFile', "Choose a File of References"),
			canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
			filters: [{ name: localize('systematicReview.references', "References"), extensions: ['bib', 'ris', 'json', 'txt'] }],
			defaultUri: await fileService.exists(start) ? start : home,
		});
		if (picked?.[0]) {
			post({ command: 'chosen', value: picked[0].fsPath });
		}
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		runs.onEnded = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: SystematicReviewMessage }) => {
		const message = e.message;
		const cellList = (value: unknown) => Array.isArray(value) ? value.flatMap(entry => {
			const cell = checkedCell(entry);
			return cell ? [cell] : [];
		}) : [];
		try {
			if (message.command === 'ready') {
				cells = await unattendedCells(configurationService, commandService, terminalInstanceService, fileService);
				await sendState();
			} else if (message.command === 'save' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs);
				if (inputs) {
					await save(inputs);
				}
			} else if (message.command === 'chooseFile' && hasKey(message, { value: true }) && typeof message.value === 'string') {
				await chooseFile(message.value);
			} else if (message.command === 'addFile' && hasKey(message, { path: true }) && typeof message.path === 'string') {
				await addFile(message.path.trim());
			} else if (message.command === 'search' && hasKey(message, { query: true, from: true, to: true, limit: true }) && typeof message.query === 'string') {
				const year = new Date().getFullYear();
				const from = Number.isInteger(message.from) ? Math.min(Math.max(message.from, 1800), year) : 1900;
				const to = Number.isInteger(message.to) ? Math.min(Math.max(message.to, from), year) : year;
				const limit = Number.isInteger(message.limit) ? Math.min(Math.max(message.limit, 1), MAX_SEARCH_LIMIT) : DEFAULT_SEARCH_LIMIT;
				await search(message.query.trim(), from, to, limit);
			} else if (message.command === 'startScreeners' && hasKey(message, { cells: true })) {
				await startScreeners(cellList(message.cells));
			} else if (message.command === 'settle' && hasKey(message, { cell: true })) {
				const cell = checkedCell(message.cell);
				if (cell) {
					await settle(cell);
				}
			} else if (message.command === 'decide' && hasKey(message, { kind: true, id: true, value: true }) && (message.kind === 'screening' || message.kind === 'extraction') && typeof message.id === 'string' && typeof message.value === 'string') {
				await decide(message.kind, message.id, message.value);
			} else if (message.command === 'addPdf' && hasKey(message, { id: true }) && typeof message.id === 'string') {
				await addPdf(message.id);
			} else if (message.command === 'startExtractors' && hasKey(message, { cells: true })) {
				await startExtractors(cellList(message.cells));
			} else if (message.command === 'runMeta') {
				await runMeta();
			} else if (message.command === 'load' && hasKey(message, { name: true }) && validStudyName(message.name)) {
				const root = await studiesFolder(contextService, fileService, pathService, KIND);
				watch(await readStudy(fileService, joinPath(root, message.name)));
				await sendState();
			} else if (message.command === 'newStudy') {
				watch(undefined);
				await sendState();
			} else if (message.command === 'open' && hasKey(message, { agent: true, what: true }) && typeof message.agent === 'string' && ['output', 'summary', 'terminal', 'stop'].includes(message.what)) {
				await openAgentFile(message.agent, message.what);
			} else if (message.command === 'openFile' && hasKey(message, { what: true }) && ['records', 'meta', 'pdf'].includes(message.what)) {
				await openStudyFile(message.what, typeof message.id === 'string' ? message.id : undefined);
			} else if (message.command === 'openUrl' && hasKey(message, { url: true }) && typeof message.url === 'string' && /^https?:\/\//.test(message.url)) {
				await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
			} else if (message.command === 'restart' && hasKey(message, { agent: true, cell: true }) && typeof message.agent === 'string') {
				const cell = checkedCell(message.cell);
				if (cell) {
					await restart(message.agent, cell);
				}
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

function pageHtml(): string {
	const shared = studyStepText();
	const measures = measureNames();
	const year = new Date().getFullYear();
	const text = {
		studyTooltip: localize('systematicReview.studyTooltip', "The name of the review's folder"),
		earlierNone: localize('systematicReview.earlierNone', "Earlier reviews..."),
		newStudy: shared.newStudy,
		studyFolder: localize('systematicReview.studyFolder', "Each review is a folder in {0}.", '<span class="yellow" id="root"></span>'),
		between: shared.between,
		choose: shared.choose,
		intro: localize('systematicReview.intro', "A systematic review in which coding agents are the two independent reviewers of each stage. Two agents screen every record's title and abstract on their own; you, or a third agent, settle where they disagree. Two agents extract each study's effect from its full text on their own; you settle where they differ. Pollis then runs the meta-analysis in Julia, with its forest and funnel plots."),
		questionStep: localize('systematicReview.questionStep', "Question"),
		review: localize('systematicReview.review', "Review"),
		question: localize('systematicReview.question', "Question"),
		questionPlaceholder: localize('systematicReview.questionPlaceholder', "For example, does exercise reduce depressive symptoms in adults with depression?"),
		inclusion: localize('systematicReview.inclusion', "Inclusion Criteria"),
		inclusionPlaceholder: localize('systematicReview.inclusionPlaceholder', "One line each: the population, the intervention, the comparison, the outcome and the study design"),
		exclusion: localize('systematicReview.exclusion', "Exclusion Criteria"),
		exclusionPlaceholder: localize('systematicReview.exclusionPlaceholder', "Optional: one line each"),
		outcome: localize('systematicReview.outcome', "Outcome"),
		outcomePlaceholder: localize('systematicReview.outcomePlaceholder', "For example, depressive symptoms at the end of treatment"),
		measure: localize('systematicReview.measure', "Effect Measure"),
		measures,
		measureHint: localize('systematicReview.measureHint', "Every study's effect is extracted on this measure, with its standard error: a ratio on the log scale, a correlation as Fisher's z, so that the effects can be pooled."),
		save: localize('systematicReview.save', "Save the Question"),
		recordsStep: localize('systematicReview.recordsStep', "Records"),
		recordsHint: localize('systematicReview.recordsHint', "Add the records from a file of references, as a database exports a search's results (Scopus, Web of Science, PubMed, Zotero), from a search of OpenAlex, or both. A record found twice, by its DOI or its title, is kept once."),
		file: localize('systematicReview.file', "File"),
		filePlaceholder: localize('systematicReview.filePlaceholder', "BibTeX, RIS or CSL-JSON"),
		addFile: localize('systematicReview.addFile', "Add the File"),
		searchLabel: localize('systematicReview.search', "OpenAlex"),
		searchPlaceholder: localize('systematicReview.searchPlaceholder', "Words of titles and abstracts; AND, OR, NOT and quotes for phrases"),
		from: localize('systematicReview.from', "From"),
		to: localize('systematicReview.to', "To"),
		limit: localize('systematicReview.limit', "Up To"),
		searchButton: localize('systematicReview.searchButton', "Search OpenAlex"),
		searching: localize('systematicReview.searching', "Searching OpenAlex..."),
		addedText: localize('systematicReview.added', "{0} found, {1} taken, {2} added; the others were records already."),
		recordsCount: localize('systematicReview.recordsCount', "{0} records, {1} of them with no abstract"),
		sourceColumn: localize('systematicReview.sourceColumn', "Source"),
		foundColumn: localize('systematicReview.foundColumn', "Found"),
		takenColumn: localize('systematicReview.takenColumn', "Taken"),
		addedColumn: localize('systematicReview.addedColumn', "Added"),
		dateColumn: localize('systematicReview.dateColumn', "Date"),
		openRecords: localize('systematicReview.openRecords', "Open the Records"),
		screeningStep: localize('systematicReview.screeningStep', "Screening"),
		screeningHint: localize('systematicReview.screeningHint', "Two agents screen every record's title and abstract against the criteria, each on its own, as include, exclude or unsure; unsure goes on to the full text, as include does. Different models make the two less alike. Each run is billed by its agent's provider."),
		screenerLabel: localize('systematicReview.screenerLabel', "Screener {0}"),
		adjudicatorLabel: localize('systematicReview.adjudicatorLabel', "Third Screener"),
		extractorLabel: localize('systematicReview.extractorLabel', "Extractor {0}"),
		noCells: localize('systematicReview.noCells', "No coding agent that can run on its own was found on this computer: install one in Compose > Coding Agents, then open this page again."),
		startScreeners: localize('systematicReview.startScreeners', "Start the Screeners"),
		agentColumn: localize('systematicReview.agentColumn', "Agent"),
		agentModel: localize('systematicReview.agentModel', "Agent and Model"),
		status: localize('systematicReview.status', "Status"),
		time: localize('systematicReview.time', "Time"),
		decidedColumn: localize('systematicReview.decidedColumn', "Records Decided"),
		open: localize('systematicReview.open', "Open"),
		statuses: {
			waiting: localize('systematicReview.waiting', "Waiting"),
			running: localize('systematicReview.running', "Running"),
			stopped: localize('systematicReview.stopped', "Stopped"),
			done: localize('systematicReview.done', "Done"),
			failed: localize('systematicReview.failed', "Ended before it finished"),
			ended: localize('systematicReview.ended', "Ended before it finished"),
		},
		exit: localize('systematicReview.exit', "exit code {0}"),
		output: localize('systematicReview.output', "Decisions"),
		extraction: localize('systematicReview.extractionLink', "Extraction"),
		summary: localize('systematicReview.summary', "Summary"),
		terminal: localize('systematicReview.terminal', "Terminal"),
		stop: localize('systematicReview.stop', "Stop"),
		restart: localize('systematicReview.restart', "Restart"),
		restartTooltip: localize('systematicReview.restartTooltip', "Start it again, on the agent and model chosen for it above, in its folder emptied: its earlier work goes to the Trash"),
		conflictsStep: localize('systematicReview.conflictsStep', "Conflicts"),
		noScreening: localize('systematicReview.noScreening', "The agreement of the screeners shows here once both have finished."),
		screened: localize('systematicReview.screened', "Records Screened"),
		bothInclude: localize('systematicReview.bothInclude', "Both Include"),
		bothExclude: localize('systematicReview.bothExclude', "Both Exclude"),
		conflictCount: localize('systematicReview.conflictCount', "Conflicts"),
		agreement: localize('systematicReview.agreement', "Agreement"),
		kappa: localize('systematicReview.kappa', "Cohen's Kappa"),
		conflictsHint: localize('systematicReview.conflictsHint', "A conflict is a record one screener would keep and the other would exclude. Decide each yourself, or have a third agent decide them, with both screeners' reasons before it; your decision comes before the third agent's."),
		settle: localize('systematicReview.settle', "Settle with an Agent"),
		recordColumn: localize('systematicReview.recordColumn', "Record"),
		thirdColumn: localize('systematicReview.thirdColumn', "Third Screener"),
		yoursColumn: localize('systematicReview.yoursColumn', "Your Decision"),
		include: localize('systematicReview.include', "Include"),
		exclude: localize('systematicReview.exclude', "Exclude"),
		unsure: localize('systematicReview.unsure', "Unsure"),
		unsettledText: localize('systematicReview.unsettled', "{0} conflicts to settle"),
		missingDecisions: localize('systematicReview.missingDecisions', "{0} records lack a decision of one screener, and are left out: restart it to screen every record."),
		allSettled: localize('systematicReview.allSettled', "Every conflict is settled: {0} records go on to the full text."),
		noConflictText: localize('systematicReview.noConflictText', "The screeners agree on every record: {0} records go on to the full text."),
		textsStep: localize('systematicReview.textsStep', "Full Texts"),
		textsHint: localize('systematicReview.textsHint', "Add the full text of each record the screening kept, as a PDF, from the link to it, your library or its authors. A record with no full text goes to the extractors with its abstract only, which they say in their notes."),
		noTexts: localize('systematicReview.noTexts', "The records the screening keeps show here once its conflicts are settled."),
		fullTextColumn: localize('systematicReview.fullTextColumn', "Full Text"),
		pdfAdded: localize('systematicReview.pdfAdded', "PDF"),
		abstractOnly: localize('systematicReview.abstractOnly', "Abstract only"),
		addPdf: localize('systematicReview.addPdf', "Add PDF..."),
		replacePdf: localize('systematicReview.replacePdf', "Replace..."),
		link: localize('systematicReview.link', "Link"),
		textsCount: localize('systematicReview.textsCount', "{0} of {1} with a full text"),
		extractionStep: localize('systematicReview.extractionStep', "Extraction"),
		extractionHint: localize('systematicReview.extractionHint', "Two agents read each study kept, its full text or its abstract, each on its own: whether it meets the criteria, and its effect on the measure chosen, its standard error, its sample size and where in the study each value is."),
		startExtractors: localize('systematicReview.startExtractors', "Start the Extractors"),
		differencesStep: localize('systematicReview.differencesStep', "Differences"),
		noDifferences: localize('systematicReview.noDifferences', "The two extractions show here, side by side, once both extractors have finished."),
		differencesHint: localize('systematicReview.differencesHint', "Two extractions agree when they agree on eligibility and, for an eligible study, on the effect and its standard error, to 1%. Where they differ, open both and keep one, or exclude the study."),
		studies: localize('systematicReview.studies', "Studies"),
		agree: localize('systematicReview.agree', "Agree"),
		differ: localize('systematicReview.differ', "Differ"),
		toSettle: localize('systematicReview.toSettle', "To Settle"),
		studyColumn: localize('systematicReview.studyColumn', "Study"),
		keepColumn: localize('systematicReview.keepColumn', "Keep"),
		keepFirst: localize('systematicReview.keepFirst', "Extractor 1"),
		keepSecond: localize('systematicReview.keepSecond', "Extractor 2"),
		keepNone: localize('systematicReview.keepNone', "Exclude"),
		choosePlaceholder: localize('systematicReview.choosePlaceholder', "Choose..."),
		notEligible: localize('systematicReview.notEligible', "Not eligible: {0}"),
		noEffect: localize('systematicReview.noEffect', "No effect"),
		missingRow: localize('systematicReview.missingRow', "Not extracted"),
		metaStep: localize('systematicReview.metaStep', "Meta-Analysis"),
		metaHint: localize('systematicReview.metaHint', "Pollis writes meta.jl in the review's folder and runs it in the Julia REPL, in a new Julia process: the fixed effect estimate, weighting each study by the inverse of its variance; the random effects estimate of DerSimonian and Laird, which lets the effect differ from study to study; the heterogeneity, as Q and I\u00B2; and Egger's test of the funnel plot."),
		runMeta: localize('systematicReview.runMeta', "Run the Meta-Analysis"),
		sent: localize('systematicReview.sent', "Sent to the Julia REPL: the results show here once meta.jl has written them."),
		stale: localize('systematicReview.stale', "The studies kept, or their values, have changed since this meta-analysis: run it again."),
		randomEffects: localize('systematicReview.randomEffects', "Random Effects"),
		fixedEffect: localize('systematicReview.fixedEffect', "Fixed Effect"),
		i2: localize('systematicReview.i2', "I\u00B2"),
		tau2: localize('systematicReview.tau2', "Between-Study Variance"),
		qTest: localize('systematicReview.qTest', "Q, p-Value"),
		egger: localize('systematicReview.egger', "Egger's Test, p-Value"),
		eggerFew: localize('systematicReview.eggerFew', "Egger's test needs three studies or more, and says little with fewer than ten."),
		ratio: { logor: localize('systematicReview.oddsRatio', "Odds ratio {0}"), logrr: localize('systematicReview.riskRatio', "Risk ratio {0}"), z: localize('systematicReview.correlation', "Correlation {0}") },
		forest: localize('systematicReview.forest', "Forest Plot"),
		funnel: localize('systematicReview.funnel', "Funnel Plot"),
		funnelAxis: localize('systematicReview.funnelAxis', "Standard error"),
		weight: localize('systematicReview.weight', "Weight"),
		openMeta: localize('systematicReview.openMeta', "Open meta.jl"),
		flow: localize('systematicReview.flow', "Flow of Records"),
		flowRows: {
			identified: localize('systematicReview.flow.identified', "Records identified"),
			duplicates: localize('systematicReview.flow.duplicates', "Duplicates removed"),
			screened: localize('systematicReview.flow.screened', "Records screened"),
			excludedScreening: localize('systematicReview.flow.excludedScreening', "Excluded on title and abstract"),
			sought: localize('systematicReview.flow.sought', "Studies assessed for eligibility"),
			withText: localize('systematicReview.flow.withText', "With a full text"),
			abstractOnly: localize('systematicReview.flow.abstractOnly', "With the abstract only"),
			excludedText: localize('systematicReview.flow.excludedText', "Excluded on reading"),
			noEffect: localize('systematicReview.flow.noEffect', "Eligible, with no effect to pool"),
			included: localize('systematicReview.flow.included', "Studies in the meta-analysis"),
		},
		flowColumn: localize('systematicReview.flowColumn', "Stage"),
		countColumn: localize('systematicReview.countColumn', "Records"),
		needSave: localize('systematicReview.needSave', "Save the question first."),
		saved: localize('systematicReview.saved', "The question of this review is saved: choose New Study for another review."),
		needQuestion: localize('systematicReview.needQuestion', "Write the question and the inclusion criteria first."),
		needFile: localize('systematicReview.needFile', "Choose a file of references first."),
		needQuery: localize('systematicReview.needQuery', "Write the search first."),
		recordsLocked: localize('systematicReview.recordsLocked', "The screeners have started: no record can be added to this review. Choose New Study for another."),
		needRecords: localize('systematicReview.needRecords', "Add records first, from a file or from OpenAlex."),
		screenStarted: localize('systematicReview.screenStarted', "The screeners of this review have started: restart one from its row, below."),
		waitScreeners: localize('systematicReview.waitScreeners', "Wait for the screeners to end, or stop them."),
		noConflicts: localize('systematicReview.noConflicts', "The two screeners agree on every record: there is nothing to settle."),
		adjudicatorStarted: localize('systematicReview.adjudicatorStarted', "The third screener has started: restart it from its row, in Screening."),
		settleFirst: localize('systematicReview.settleFirstPage', "Settle the conflicts of the screening first, in Conflicts."),
		noneIncluded: localize('systematicReview.noneIncluded', "The screening kept no record: there is nothing to extract."),
		extractStarted: localize('systematicReview.extractStarted', "The extractors of this review have started: restart one from its row, below."),
		waitExtractors: localize('systematicReview.waitExtractors', "Wait for both extractors to finish."),
		settleDifferences: localize('systematicReview.settleDifferences', "Settle the differences between the extractors first, in Differences."),
		needTwo: localize('systematicReview.needTwo', "A meta-analysis needs two studies or more with an effect and its standard error."),
	};
	return buildWebviewHtml({
		title: localize('systematicReview.title', "Systematic Review"),
		introHtml: text.intro,
		omitPoweredBy: !SYSTEMATICREVIEW_METADATA.systematicReview.packages.length,
		extraCss: `
		${compareCss}
		${orchestrationCss}
		.missing { color: var(--vscode-errorForeground); }
		#filePath, #query { min-width: 32em; }
		#outcome { min-width: 32em; }
		input[type=number] { font: inherit; width: 6em; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; }
		.sr-cells { display: grid; grid-template-columns: max-content minmax(0, 360px); gap: 6px 12px; align-items: center; margin: 8px 0; }
		.sr-cells select { width: 100%; }
		.sr-scroll { max-height: 420px; overflow-y: auto; margin-top: 8px; }
		.sr-scroll thead th { position: sticky; top: 0; background: var(--vscode-editor-background); }
		td.sr-title { max-width: 360px; }
		td.sr-reason { max-width: 260px; color: var(--vscode-descriptionForeground); }
		.sr-include { color: var(--vscode-testing-iconPassed, var(--vscode-charts-green)); }
		.sr-exclude { color: var(--vscode-errorForeground); }
		.sr-differ { color: var(--vscode-editorWarning-foreground); }
		.sr-plot { max-width: 900px; margin-top: 12px; }
		.sr-plot svg { width: 100%; height: auto; }
		.sr-plot text { fill: var(--vscode-foreground); font-size: 11px; }
		.sr-plot .axis { stroke: var(--vscode-descriptionForeground); stroke-width: 1; }
		.sr-plot .null { stroke: var(--vscode-descriptionForeground); stroke-dasharray: 3 3; }
		.sr-plot .ci { stroke: var(--vscode-foreground); stroke-width: 1.2; }
		.sr-plot .box { fill: var(--vscode-charts-blue); }
		.sr-plot .diamond { fill: var(--vscode-charts-orange); }
		.sr-plot .dot { fill: var(--vscode-charts-blue); opacity: 0.8; }
		.sr-plot .pooled { stroke: var(--vscode-charts-orange); }
		.sr-plot .muted { fill: var(--vscode-descriptionForeground); }
`,
		steps: [
			{
				id: 'step-question',
				title: text.questionStep,
				bodyHtml: `
		<div class="row">
			<span class="small" title="${text.studyTooltip}">${text.review}</span> <input type="text" id="name" spellcheck="false">
			<select id="earlier"><option value="">${text.earlierNone}</option></select>
			<button class="link" id="newStudy" hidden>${text.newStudy}</button>
		</div>
		<p class="small">${text.studyFolder}</p>
		<label class="small field-label" for="question">${text.question}</label>
		<textarea id="question" class="ma-text" rows="2" placeholder="${text.questionPlaceholder}"></textarea>
		<label class="small field-label" for="inclusion">${text.inclusion}</label>
		<textarea id="inclusion" class="ma-text" rows="5" placeholder="${text.inclusionPlaceholder}"></textarea>
		<label class="small field-label" for="exclusion">${text.exclusion}</label>
		<textarea id="exclusion" class="ma-text" rows="3" placeholder="${text.exclusionPlaceholder}"></textarea>
		<div class="row"><span class="small">${text.outcome}</span> <input type="text" id="outcome" placeholder="${text.outcomePlaceholder}"></div>
		<div class="row"><span class="small">${text.measure}</span> <select id="measure">${MEASURES.map(measure => `<option value="${measure}">${measures[measure]}</option>`).join('')}</select></div>
		<p class="hint">${text.measureHint}</p>
		<div class="settings"><span class="bar"><button class="action current" id="save">${text.save}</button></span></div>
		<div class="small status missing" id="questionProblem"></div>
`,
			},
			{
				id: 'step-records',
				title: text.recordsStep,
				bodyHtml: `
		<p class="hint">${text.recordsHint}</p>
		<div class="row"><span class="small">${text.file}</span> <input type="text" id="filePath" spellcheck="false" placeholder="${text.filePlaceholder}"> <button class="action" id="chooseFile">${text.choose}</button> <button class="action" id="addFile">${text.addFile}</button></div>
		<div class="small status missing" id="fileProblem"></div>
		<div class="row"><span class="small">${text.searchLabel}</span> <input type="text" id="query" spellcheck="false" placeholder="${text.searchPlaceholder}"></div>
		<div class="row"><span class="small">${text.from}</span> <input type="number" id="from" value="1900" min="1800" max="${year}"> <span class="small">${text.to}</span> <input type="number" id="to" value="${year}" min="1800" max="${year}"> <span class="small">${text.limit}</span> <input type="number" id="limit" value="${DEFAULT_SEARCH_LIMIT}" min="1" max="${MAX_SEARCH_LIMIT}"> <button class="action" id="search">${text.searchButton}</button></div>
		<div class="small status" id="searchStatus"></div>
		<div class="small status missing" id="searchProblem"></div>
		<p class="small" id="recordsCount"></p>
		<table class="ma" id="sourceTable" hidden>
			<thead><tr><th>${text.sourceColumn}</th><th class="number">${text.foundColumn}</th><th class="number">${text.takenColumn}</th><th class="number">${text.addedColumn}</th><th>${text.dateColumn}</th></tr></thead>
			<tbody id="sourceRows"></tbody>
		</table>
		<button class="link" id="openRecords" hidden>${text.openRecords}</button>
`,
			},
			{
				id: 'step-screening',
				title: text.screeningStep,
				bodyHtml: `
		<p class="hint">${text.screeningHint}</p>
		<div class="sr-cells" id="screenerCells"></div>
		<p class="warning" id="noCells" hidden>${text.noCells}</p>
		<div class="settings"><span class="bar"><button class="action" id="startScreeners">${text.startScreeners}</button></span></div>
		<div class="small status missing" id="screenProblem"></div>
		<table class="ma" id="screenTable" hidden>
			<thead><tr><th>${text.agentColumn}</th><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th class="number">${text.decidedColumn}</th><th>${text.open}</th></tr></thead>
			<tbody id="screenRows"></tbody>
		</table>
`,
			},
			{
				id: 'step-conflicts',
				title: text.conflictsStep,
				bodyHtml: `
		<p class="hint" id="noScreening">${text.noScreening}</p>
		<div id="screeningBox" hidden>
			<div class="ma-figures">
				<div class="ma-figure"><div class="small">${text.screened}</div><div class="value" id="fScreened"></div></div>
				<div class="ma-figure"><div class="small">${text.bothInclude}</div><div class="value" id="fBothInclude"></div></div>
				<div class="ma-figure"><div class="small">${text.bothExclude}</div><div class="value" id="fBothExclude"></div></div>
				<div class="ma-figure"><div class="small">${text.conflictCount}</div><div class="value" id="fConflicts"></div></div>
				<div class="ma-figure"><div class="small">${text.agreement}</div><div class="value" id="fAgreement"></div></div>
				<div class="ma-figure"><div class="small">${text.kappa}</div><div class="value" id="fKappa"></div></div>
			</div>
			<p class="small" id="settledStatus"></p>
			<div id="conflictBox">
				<p class="hint">${text.conflictsHint}</p>
				<div class="sr-cells"><span class="small">${text.adjudicatorLabel}</span> <select id="adjudicatorCell"></select></div>
				<div class="settings"><span class="bar"><button class="action" id="settle">${text.settle}</button></span></div>
				<div class="small status missing" id="settleProblem"></div>
				<div class="sr-scroll">
					<table class="ma">
						<thead><tr><th>${text.recordColumn}</th><th>${text.screenerLabel.replace('{0}', '1')}</th><th>${text.screenerLabel.replace('{0}', '2')}</th><th>${text.thirdColumn}</th><th>${text.yoursColumn}</th></tr></thead>
						<tbody id="conflictRows"></tbody>
					</table>
				</div>
			</div>
		</div>
`,
			},
			{
				id: 'step-texts',
				title: text.textsStep,
				bodyHtml: `
		<p class="hint">${text.textsHint}</p>
		<p class="hint" id="noTexts">${text.noTexts}</p>
		<p class="small" id="textsCount"></p>
		<div class="small status missing" id="textsProblem"></div>
		<div class="sr-scroll" id="textsBox" hidden>
			<table class="ma">
				<thead><tr><th>${text.recordColumn}</th><th>${text.fullTextColumn}</th><th>${text.open}</th></tr></thead>
				<tbody id="textRows"></tbody>
			</table>
		</div>
`,
			},
			{
				id: 'step-extraction',
				title: text.extractionStep,
				bodyHtml: `
		<p class="hint">${text.extractionHint}</p>
		<div class="sr-cells" id="extractorCells"></div>
		<div class="settings"><span class="bar"><button class="action" id="startExtractors">${text.startExtractors}</button></span></div>
		<div class="small status missing" id="extractProblem"></div>
		<table class="ma" id="extractTable" hidden>
			<thead><tr><th>${text.agentColumn}</th><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.open}</th></tr></thead>
			<tbody id="extractRows"></tbody>
		</table>
`,
			},
			{
				id: 'step-differences',
				title: text.differencesStep,
				bodyHtml: `
		<p class="hint" id="noDifferences">${text.noDifferences}</p>
		<div id="differencesBox" hidden>
			<p class="hint">${text.differencesHint}</p>
			<div class="ma-figures">
				<div class="ma-figure"><div class="small">${text.studies}</div><div class="value" id="fStudies"></div></div>
				<div class="ma-figure"><div class="small">${text.agree}</div><div class="value" id="fAgree"></div></div>
				<div class="ma-figure"><div class="small">${text.differ}</div><div class="value" id="fDiffer"></div></div>
				<div class="ma-figure"><div class="small">${text.toSettle}</div><div class="value" id="fToSettle"></div></div>
			</div>
			<div class="sr-scroll">
				<table class="ma">
					<thead><tr><th>${text.studyColumn}</th><th>${text.keepFirst}</th><th>${text.keepSecond}</th><th>${text.keepColumn}</th></tr></thead>
					<tbody id="differenceRows"></tbody>
				</table>
			</div>
		</div>
`,
			},
			{
				id: 'step-meta',
				title: text.metaStep,
				bodyHtml: `
		<p class="hint">${text.metaHint}</p>
		<div class="settings"><span class="bar"><button class="action" id="runMeta">${text.runMeta}</button></span></div>
		<div class="small status" id="metaStatus"></div>
		<div class="small status missing" id="metaProblem"></div>
		<div id="metaBox" hidden>
			<p class="small missing" id="staleNote" hidden>${text.stale}</p>
			<div class="ma-figures">
				<div class="ma-figure"><div class="small">${text.randomEffects}</div><div class="value" id="fRandom"></div><div class="small" id="fRandomRatio"></div></div>
				<div class="ma-figure"><div class="small">${text.fixedEffect}</div><div class="value" id="fFixed"></div><div class="small" id="fFixedRatio"></div></div>
				<div class="ma-figure"><div class="small">${text.i2}</div><div class="value" id="fI2"></div></div>
				<div class="ma-figure"><div class="small">${text.tau2}</div><div class="value" id="fTau2"></div></div>
				<div class="ma-figure"><div class="small">${text.qTest}</div><div class="value" id="fQ"></div></div>
				<div class="ma-figure"><div class="small">${text.egger}</div><div class="value" id="fEgger"></div></div>
			</div>
			<p class="small ma-note" id="eggerNote"></p>
			<h4>${text.forest}</h4>
			<div class="sr-plot" id="forestPlot"></div>
			<h4>${text.funnel}</h4>
			<div class="sr-plot" id="funnelPlot"></div>
			<button class="link" id="openMeta">${text.openMeta}</button>
		</div>
		<h4>${text.flow}</h4>
		<table class="ma" id="flowTable">
			<thead><tr><th>${text.flowColumn}</th><th class="number">${text.countColumn}</th></tr></thead>
			<tbody id="flowRows"></tbody>
		</table>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const fields = { name: document.getElementById('name'), question: document.getElementById('question'), inclusion: document.getElementById('inclusion'), exclusion: document.getElementById('exclusion'), outcome: document.getElementById('outcome'), measure: document.getElementById('measure') };
	const earlier = document.getElementById('earlier');
	const filePath = document.getElementById('filePath');
	const query = document.getElementById('query');
	const adjudicatorCell = document.getElementById('adjudicatorCell');
	let state = undefined;
	/** The cells chosen for the screeners, the third screener and the extractors, kept across redraws. */
	let chosenScreeners = [];
	let chosenAdjudicator = '';
	let chosenExtractors = [];
	let timer = undefined;
${orchestrationPageJs}

	function options(cells) {
		return cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
	}
	/** Two cell menus, at first different cells, so that the two agents are less alike; a running agent's menu is locked on its cell. */
	function drawPair(box, chosen, label, agentRuns) {
		const cells = state ? state.cells : [];
		while (chosen.length < 2 && cells.length) {
			chosen.push(cellKey(cells[chosen.length % cells.length]));
		}
		box.innerHTML = '';
		for (let i = 0; i < 2; i++) {
			const span = document.createElement('span');
			span.className = 'small';
			span.textContent = label.replace('{0}', String(i + 1));
			const select = document.createElement('select');
			select.innerHTML = options(cells);
			const run = agentRuns[i];
			if (run && run.status === 'running') {
				chosen[i] = cellKey(run);
			}
			select.value = chosen[i] || '';
			select.disabled = !!(run && run.status === 'running');
			select.addEventListener('change', () => { chosen[i] = select.value; });
			box.append(span, select);
		}
	}
	function drawAdjudicatorCell() {
		const cells = state ? state.cells : [];
		adjudicatorCell.innerHTML = options(cells);
		const run = state.study && state.study.adjudicator;
		if (run && run.status === 'running') {
			chosenAdjudicator = cellKey(run);
		}
		if (!chosenAdjudicator && cells.length) {
			// At first a cell neither screener has, when there is one
			const taken = new Set(chosenScreeners);
			chosenAdjudicator = cellKey(cells.find(cell => !taken.has(cellKey(cell))) || cells[0]);
		}
		adjudicatorCell.value = chosenAdjudicator;
		adjudicatorCell.disabled = !!(run && run.status === 'running');
	}

	function link(label, agent, what, title) {
		return '<button class="link" data-agent="' + escapeHtml(agent) + '" data-what="' + what + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') + '>' + escapeHtml(label) + '</button>';
	}
	function statusText(run) {
		return TEXT.statuses[run.status] + (run.status === 'failed' && typeof run.exitCode === 'number' ? ' (' + TEXT.exit.replace('{0}', run.exitCode) + ')' : '');
	}
	function runLinks(run, outputLabel) {
		return [run.hasFile || run.status === 'running' ? link(outputLabel, run.key, 'output') : '', run.hasFile ? link(TEXT.summary, run.key, 'summary') : '', run.hasTerminal ? link(TEXT.terminal, run.key, 'terminal') : '',
			run.status === 'running' ? link(TEXT.stop, run.key, 'stop') : link(TEXT.restart, run.key, 'restart', TEXT.restartTooltip)].filter(x => x).join('');
	}
	function runRow(name, run, cells, outputLabel) {
		return '<tr><td>' + escapeHtml(name) + '</td><td>' + escapeHtml(run.label) + '</td><td class="status-' + run.status + '">' + escapeHtml(statusText(run)) + '</td><td class="number" data-run="' + escapeHtml(run.key) + '">' + elapsed(run) + '</td>'
			+ cells + '<td class="links">' + runLinks(run, outputLabel) + '</td></tr>';
	}
	function allRuns() {
		const study = state && state.study;
		return study ? study.screeners.concat(study.adjudicator ? [study.adjudicator] : [], study.extractors) : [];
	}
	function drawRuns() {
		const study = state.study;
		const screeners = study ? study.screeners : [];
		const screenRuns = screeners.map((run, i) => runRow(TEXT.screenerLabel.replace('{0}', String(i + 1)), run, '<td class="number">' + (typeof run.decided === 'number' ? format(run.decided) : '') + '</td>', TEXT.output));
		if (study && study.adjudicator) {
			screenRuns.push(runRow(TEXT.adjudicatorLabel, study.adjudicator, '<td></td>', TEXT.output));
		}
		document.getElementById('screenTable').hidden = !screenRuns.length;
		document.getElementById('screenRows').innerHTML = screenRuns.join('');
		const extractors = study ? study.extractors : [];
		document.getElementById('extractTable').hidden = !extractors.length;
		document.getElementById('extractRows').innerHTML = extractors.map((run, i) => runRow(TEXT.extractorLabel.replace('{0}', String(i + 1)), run, '', TEXT.extraction)).join('');
		clearInterval(timer);
		if (allRuns().some(run => run.status === 'running')) {
			timer = setInterval(() => {
				for (const cell of document.querySelectorAll('td[data-run]')) {
					const run = allRuns().find(r => r.key === cell.dataset.run);
					cell.textContent = run ? elapsed(run) : '';
				}
			}, 1000);
		}
	}

	function decision(value) {
		return value ? '<span class="sr-' + value + '">' + escapeHtml(TEXT[value]) + '</span>' : '';
	}
	function recordCell(entry) {
		return '<td class="sr-title"><b>' + escapeHtml(entry.label) + '</b><br>' + (entry.link ? '<button class="link" data-url="' + escapeHtml(entry.link) + '">' + escapeHtml(entry.title) + '</button>' : escapeHtml(entry.title)) + '</td>';
	}
	function drawScreening() {
		const screening = state.study && state.study.screening;
		document.getElementById('screeningBox').hidden = !screening;
		document.getElementById('noScreening').hidden = !!screening;
		if (!screening) {
			return;
		}
		document.getElementById('fScreened').textContent = format(screening.both);
		document.getElementById('fBothInclude').textContent = format(screening.bothInclude);
		document.getElementById('fBothExclude').textContent = format(screening.bothExclude);
		document.getElementById('fConflicts').textContent = format(screening.conflicts.length);
		document.getElementById('fAgreement').textContent = typeof screening.agreement === 'number' ? format(100 * screening.agreement) + '%' : '';
		document.getElementById('fKappa').textContent = typeof screening.kappa === 'number' ? format(screening.kappa) : '';
		document.getElementById('settledStatus').textContent = (screening.missing ? TEXT.missingDecisions.replace('{0}', format(screening.missing)) + ' ' : '') + (!screening.conflicts.length ? TEXT.noConflictText.replace('{0}', format(screening.included))
			: screening.unsettled ? TEXT.unsettledText.replace('{0}', format(screening.unsettled)) : TEXT.allSettled.replace('{0}', format(screening.included)));
		document.getElementById('conflictBox').hidden = !screening.conflicts.length;
		document.getElementById('conflictRows').innerHTML = screening.conflicts.map(entry => {
			const choice = ['include', 'exclude'].map(value => '<label><input type="radio" name="c-' + entry.id + '" data-decide="screening" data-id="' + entry.id + '" value="' + value + '"' + (entry.yours === value ? ' checked' : '') + '> ' + escapeHtml(TEXT[value]) + '</label>').join(' ');
			return '<tr>' + recordCell(entry)
				+ '<td class="sr-reason">' + decision(entry.d1) + '<br>' + escapeHtml(entry.r1) + '</td>'
				+ '<td class="sr-reason">' + decision(entry.d2) + '<br>' + escapeHtml(entry.r2) + '</td>'
				+ '<td class="sr-reason">' + decision(entry.agent) + (entry.agent ? '<br>' + escapeHtml(entry.agentReason) : '') + '</td>'
				+ '<td>' + choice + '</td></tr>';
		}).join('');
	}

	function drawTexts() {
		const study = state.study;
		const texts = study && study.screening && !study.screening.unsettled ? study.fullTexts : [];
		document.getElementById('textsBox').hidden = !texts.length;
		document.getElementById('noTexts').hidden = texts.length > 0;
		document.getElementById('textsCount').textContent = texts.length ? TEXT.textsCount.replace('{0}', format(texts.filter(entry => entry.pdf).length)).replace('{1}', format(texts.length)) : '';
		document.getElementById('textRows').innerHTML = texts.map(entry => '<tr>' + recordCell(entry)
			+ '<td>' + (entry.pdf ? '<button class="link" data-pdf="' + entry.id + '">' + escapeHtml(TEXT.pdfAdded) + '</button>' : '<span class="small">' + escapeHtml(TEXT.abstractOnly) + '</span>') + '</td>'
			+ '<td class="links"><button class="link" data-add-pdf="' + entry.id + '">' + escapeHtml(entry.pdf ? TEXT.replacePdf : TEXT.addPdf) + '</button>' + (entry.link ? '<button class="link" data-url="' + escapeHtml(entry.link) + '">' + escapeHtml(TEXT.link) + '</button>' : '') + '</td></tr>').join('');
	}

	function extractionCell(row) {
		if (!row) {
			return '<td class="sr-reason">' + escapeHtml(TEXT.missingRow) + '</td>';
		}
		if (row.eligible === 'no') {
			return '<td class="sr-reason">' + escapeHtml(TEXT.notEligible.replace('{0}', row.reason)) + '</td>';
		}
		const value = typeof row.effect === 'number' ? format(row.effect) + (typeof row.se === 'number' ? ' (' + format(row.se) + ')' : '') : TEXT.noEffect;
		const details = [typeof row.n === 'number' ? 'n = ' + format(row.n) : '', row.where, row.how, row.notes].filter(x => x).join('; ');
		return '<td class="sr-reason"><b>' + escapeHtml(value) + '</b>' + (details ? '<br>' + escapeHtml(details) : '') + '</td>';
	}
	function drawDifferences() {
		const differences = state.study && state.study.differences;
		document.getElementById('differencesBox').hidden = !differences;
		document.getElementById('noDifferences').hidden = !!differences;
		if (!differences) {
			return;
		}
		document.getElementById('fStudies').textContent = format(differences.length);
		document.getElementById('fAgree').textContent = format(differences.filter(entry => entry.agree).length);
		document.getElementById('fDiffer').textContent = format(differences.filter(entry => !entry.agree).length);
		document.getElementById('fToSettle').textContent = format(differences.filter(entry => !entry.choice).length);
		document.getElementById('differenceRows').innerHTML = differences.map(entry => {
			const select = '<select data-decide="extraction" data-id="' + entry.id + '">' + (entry.choice ? '' : '<option value="" selected>' + escapeHtml(TEXT.choosePlaceholder) + '</option>')
				+ [['1', TEXT.keepFirst], ['2', TEXT.keepSecond], ['exclude', TEXT.keepNone]].map(([value, label]) => '<option value="' + value + '"' + (entry.choice === value ? ' selected' : '') + '>' + escapeHtml(label) + '</option>').join('') + '</select>';
			return '<tr><td class="sr-title"><b>' + escapeHtml(entry.label) + '</b><br>' + escapeHtml(entry.title) + (entry.agree ? '' : '<br><span class="sr-differ">' + escapeHtml(TEXT.differ) + '</span>') + '</td>'
				+ extractionCell(entry.e1) + extractionCell(entry.e2) + '<td>' + select + '</td></tr>';
		}).join('');
	}

	/** A pooled estimate with its interval, and, for a ratio or a correlation, the same on its own scale. */
	function pooled(summary) {
		return format(summary.estimate) + ' (' + interval(summary.low, summary.high) + ')';
	}
	function natural(summary) {
		const measure = state.study.measure;
		const back = measure === 'logor' || measure === 'logrr' ? Math.exp : measure === 'z' ? Math.tanh : undefined;
		return back ? TEXT.ratio[measure].replace('{0}', format(back(summary.estimate)) + ' (' + interval(back(summary.low), back(summary.high)) + ')') : '';
	}
	function forestSvg(results, labels) {
		const rows = results.studies.length + 3;
		const rowHeight = 20, top = 24, left = 200, plot = 360, right = 230, width = left + plot + right;
		const height = top + rows * rowHeight + 30;
		const lows = results.studies.map(s => s.low).concat([results.random.low, results.fixed.low, 0]);
		const highs = results.studies.map(s => s.high).concat([results.random.high, results.fixed.high, 0]);
		const min = Math.min(...lows), max = Math.max(...highs), pad = (max - min) * 0.05 || 1;
		const x = v => left + (v - (min - pad)) / (max - min + 2 * pad) * plot;
		const maxWeight = Math.max(...results.studies.map(s => s.weightRandom), 0.0001);
		let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">';
		svg += '<text x="' + (left + plot + 10) + '" y="14" class="muted">' + escapeHtml(TEXT.randomEffects) + ', ' + escapeHtml(TEXT.weight) + '</text>';
		results.studies.forEach((s, i) => {
			const y = top + i * rowHeight + rowHeight / 2;
			const size = 4 + 8 * Math.sqrt(s.weightRandom / maxWeight);
			svg += '<text x="4" y="' + (y + 4) + '">' + escapeHtml(labels[s.id] || s.id) + '</text>';
			svg += '<line class="ci" x1="' + x(s.low) + '" x2="' + x(s.high) + '" y1="' + y + '" y2="' + y + '"/>';
			svg += '<rect class="box" x="' + (x(s.effect) - size / 2) + '" y="' + (y - size / 2) + '" width="' + size + '" height="' + size + '"/>';
			svg += '<text x="' + (left + plot + 10) + '" y="' + (y + 4) + '">' + escapeHtml(format(s.effect) + ' (' + interval(s.low, s.high) + ')') + '  ' + format(100 * s.weightRandom) + '%</text>';
		});
		[[TEXT.randomEffects, results.random], [TEXT.fixedEffect, results.fixed]].forEach(([name, summary], j) => {
			const y = top + (results.studies.length + 1 + j) * rowHeight;
			svg += '<text x="4" y="' + (y + 4) + '"><tspan font-weight="bold">' + escapeHtml(name) + '</tspan></text>';
			svg += '<polygon class="diamond" points="' + x(summary.low) + ',' + y + ' ' + x(summary.estimate) + ',' + (y - 6) + ' ' + x(summary.high) + ',' + y + ' ' + x(summary.estimate) + ',' + (y + 6) + '"/>';
			svg += '<text x="' + (left + plot + 10) + '" y="' + (y + 4) + '">' + escapeHtml(pooled(summary)) + '</text>';
		});
		const axisY = top + rows * rowHeight;
		svg += '<line class="null" x1="' + x(0) + '" x2="' + x(0) + '" y1="' + top + '" y2="' + axisY + '"/>';
		svg += '<line class="axis" x1="' + left + '" x2="' + (left + plot) + '" y1="' + axisY + '" y2="' + axisY + '"/>';
		for (let i = 0; i <= 4; i++) {
			const v = min - pad + i * (max - min + 2 * pad) / 4;
			svg += '<text x="' + x(v) + '" y="' + (axisY + 16) + '" text-anchor="middle" class="muted">' + format(v) + '</text>';
		}
		return svg + '</svg>';
	}
	function funnelSvg(results) {
		const width = 520, height = 320, left = 50, bottom = 40, top = 14, right = 16;
		const maxSe = Math.max(...results.studies.map(s => s.se)) * 1.1;
		const centre = results.fixed.estimate;
		const spread = Math.max(...results.studies.map(s => Math.abs(s.effect - centre)), 1.96 * maxSe) * 1.1;
		const x = v => left + (v - (centre - spread)) / (2 * spread) * (width - left - right);
		const y = se => top + se / maxSe * (height - top - bottom);
		let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">';
		svg += '<polyline class="null" fill="none" points="' + x(centre - 1.96 * maxSe) + ',' + y(maxSe) + ' ' + x(centre) + ',' + y(0) + ' ' + x(centre + 1.96 * maxSe) + ',' + y(maxSe) + '"/>';
		svg += '<line class="pooled" x1="' + x(centre) + '" x2="' + x(centre) + '" y1="' + y(0) + '" y2="' + y(maxSe) + '"/>';
		for (const s of results.studies) {
			svg += '<circle class="dot" cx="' + x(s.effect) + '" cy="' + y(s.se) + '" r="4"/>';
		}
		svg += '<line class="axis" x1="' + left + '" x2="' + (width - right) + '" y1="' + (height - bottom) + '" y2="' + (height - bottom) + '"/>';
		svg += '<line class="axis" x1="' + left + '" x2="' + left + '" y1="' + top + '" y2="' + (height - bottom) + '"/>';
		for (let i = 0; i <= 4; i++) {
			const v = centre - spread + i * spread / 2;
			svg += '<text x="' + x(v) + '" y="' + (height - bottom + 16) + '" text-anchor="middle" class="muted">' + format(v) + '</text>';
			const se = i * maxSe / 4;
			svg += '<text x="' + (left - 6) + '" y="' + (y(se) + 4) + '" text-anchor="end" class="muted">' + format(se) + '</text>';
		}
		svg += '<text x="' + (left - 40) + '" y="' + (top + (height - top - bottom) / 2) + '" class="muted" transform="rotate(-90 ' + (left - 40) + ' ' + (top + (height - top - bottom) / 2) + ')" text-anchor="middle">' + escapeHtml(TEXT.funnelAxis) + '</text>';
		return svg + '</svg>';
	}
	function drawMeta() {
		const study = state.study;
		const results = study && study.results;
		document.getElementById('metaBox').hidden = !results;
		if (results) {
			document.getElementById('metaStatus').textContent = '';
			document.getElementById('staleNote').hidden = !study.stale;
			document.getElementById('fRandom').textContent = pooled(results.random);
			document.getElementById('fRandomRatio').textContent = natural(results.random);
			document.getElementById('fFixed').textContent = pooled(results.fixed);
			document.getElementById('fFixedRatio').textContent = natural(results.fixed);
			document.getElementById('fI2').textContent = typeof results.i2 === 'number' ? format(100 * results.i2) + '%' : '';
			document.getElementById('fTau2').textContent = typeof results.random.tau2 === 'number' ? format(results.random.tau2) : '';
			document.getElementById('fQ').textContent = typeof results.q === 'number' ? format(results.q) + (typeof results.pQ === 'number' ? ', ' + format(results.pQ) : '') : '';
			document.getElementById('fEgger').textContent = results.egger && typeof results.egger.p === 'number' ? format(results.egger.p) : '';
			document.getElementById('eggerNote').textContent = results.studies.length < 10 ? TEXT.eggerFew : '';
			document.getElementById('forestPlot').innerHTML = forestSvg(results, study.labels);
			document.getElementById('funnelPlot').innerHTML = funnelSvg(results);
		}
		drawFlow();
	}
	/** The counts of the flow of records, from the records found to the studies pooled, as a PRISMA flow diagram has them. */
	function drawFlow() {
		const study = state.study;
		const rows = [];
		if (study) {
			const identified = study.records.sources.reduce((sum, source) => sum + source.taken, 0);
			rows.push([TEXT.flowRows.identified, identified]);
			if (study.records.sources.length) {
				rows.push([TEXT.flowRows.duplicates, identified - study.records.count]);
			}
			const screening = study.screening;
			if (screening) {
				rows.push([TEXT.flowRows.screened, screening.both]);
				if (!screening.unsettled) {
					rows.push([TEXT.flowRows.excludedScreening, screening.both - screening.included]);
					const withText = study.fullTexts.filter(entry => entry.pdf).length;
					rows.push([TEXT.flowRows.sought, screening.included], ['\\u2003' + TEXT.flowRows.withText, withText], ['\\u2003' + TEXT.flowRows.abstractOnly, screening.included - withText]);
				}
			}
			const differences = study.differences;
			if (differences && differences.every(entry => entry.choice)) {
				const excluded = differences.filter(entry => entry.choice === 'exclude' || entry.kept && entry.kept.eligible === 'no').length;
				const kept = differences.filter(entry => entry.usable).length;
				rows.push([TEXT.flowRows.excludedText, excluded], [TEXT.flowRows.noEffect, differences.length - excluded - kept], [TEXT.flowRows.included, kept]);
			}
		}
		document.getElementById('flowTable').hidden = !rows.length;
		document.getElementById('flowRows').innerHTML = rows.map(([label, count]) => '<tr><td>' + escapeHtml(label) + '</td><td class="number">' + format(count) + '</td></tr>').join('');
	}

	/** Why a step's button cannot do its work now, or '' when it can: the buttons are never disabled, and say why when pressed. */
	function saveBlocked() {
		return state && state.study ? TEXT.saved : !fields.question.value.trim() || !fields.inclusion.value.trim() ? TEXT.needQuestion : '';
	}
	function recordsBlocked() {
		const study = state && state.study;
		return !study ? TEXT.needSave : study.screeners.length ? TEXT.recordsLocked : '';
	}
	function fileBlocked() {
		return recordsBlocked() || (!filePath.value.trim() ? TEXT.needFile : '');
	}
	function searchBlocked() {
		return recordsBlocked() || (!query.value.trim() ? TEXT.needQuery : '');
	}
	function screenBlocked() {
		const study = state && state.study;
		return !study ? TEXT.needSave : !study.records.count ? TEXT.needRecords : study.screeners.length ? TEXT.screenStarted : !state.cells.length ? TEXT.noCells : '';
	}
	function settleBlocked() {
		const study = state && state.study;
		return !study || !study.screening ? TEXT.waitScreeners : !study.screening.conflicts.length ? TEXT.noConflicts : study.adjudicator ? TEXT.adjudicatorStarted : !state.cells.length ? TEXT.noCells : '';
	}
	function extractBlocked() {
		const study = state && state.study;
		return !study || !study.screening ? TEXT.waitScreeners : study.screening.unsettled ? TEXT.settleFirst : !study.screening.included ? TEXT.noneIncluded
			: study.extractors.length ? TEXT.extractStarted : !state.cells.length ? TEXT.noCells : '';
	}
	function metaBlocked() {
		const study = state && state.study;
		return !study || !study.differences ? TEXT.waitExtractors : study.differences.some(entry => !entry.choice) ? TEXT.settleDifferences
			: study.differences.filter(entry => entry.usable).length < 2 ? TEXT.needTwo : '';
	}
	const BUTTONS = [
		['save', 'save', 'questionProblem', saveBlocked],
		['file', 'addFile', 'fileProblem', fileBlocked],
		['search', 'search', 'searchProblem', searchBlocked],
		['screen', 'startScreeners', 'screenProblem', screenBlocked],
		['settle', 'settle', 'settleProblem', settleBlocked],
		['extract', 'startExtractors', 'extractProblem', extractBlocked],
		['meta', 'runMeta', 'metaProblem', metaBlocked],
	];
	/** The one blue button is the next thing to do: after the question, adding records until the screeners start; the third screener only while conflicts are unsettled. */
	function drawButtons() {
		const study = state && state.study;
		const ready = Object.fromEntries(BUTTONS.map(([step, , , blocked]) => [step, !blocked()]));
		const records = study && study.records.count > 0;
		const fresh = study && study.results && !study.stale;
		const blue = ready.save ? 'save'
			: ready.file ? 'file' : !records && ready.search ? 'search' : !records && study && !study.screeners.length ? (filePath.value.trim() ? 'file' : 'search')
				: ready.screen ? 'screen'
					: ready.settle && study.screening.unsettled ? 'settle'
						: ready.extract ? 'extract'
							: ready.meta && !fresh ? 'meta' : '';
		for (const [step, id, problemId] of BUTTONS) {
			document.getElementById(id).classList.toggle('current', step === blue);
			if (ready[step]) {
				document.getElementById(problemId).textContent = '';
			}
		}
	}

	function draw() {
		const study = state.study;
		document.getElementById('root').textContent = state.root;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlierNone) + '</option>' + state.studies.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = study ? study.name : '';
		document.getElementById('newStudy').hidden = !study;
		for (const field of Object.values(fields)) {
			field.disabled = !!study;
		}
		if (study) {
			fields.name.value = study.name;
			for (const key of ['question', 'inclusion', 'exclusion', 'outcome', 'measure']) {
				fields[key].value = study[key];
			}
			document.getElementById('recordsCount').textContent = TEXT.recordsCount.replace('{0}', format(study.records.count)).replace('{1}', format(study.records.withoutAbstract));
		} else {
			fields.name.placeholder = state.suggestion;
			document.getElementById('recordsCount').textContent = '';
		}
		const sources = study ? study.records.sources : [];
		document.getElementById('sourceTable').hidden = !sources.length;
		document.getElementById('openRecords').hidden = !(study && study.records.count);
		document.getElementById('sourceRows').innerHTML = sources.map(source => '<tr><td>' + escapeHtml(source.label) + '</td><td class="number">' + format(source.found) + '</td><td class="number">' + format(source.taken) + '</td><td class="number">' + format(source.added) + '</td><td>' + escapeHtml(source.date) + '</td></tr>').join('');
		document.getElementById('noCells').hidden = state.cells.length > 0;
		drawPair(document.getElementById('screenerCells'), chosenScreeners, TEXT.screenerLabel, study ? study.screeners : []);
		drawAdjudicatorCell();
		drawPair(document.getElementById('extractorCells'), chosenExtractors, TEXT.extractorLabel, study ? study.extractors : []);
		drawRuns();
		drawScreening();
		drawTexts();
		drawDifferences();
		drawMeta();
		drawButtons();
	}

	function pressed(step, send) {
		const entry = BUTTONS.find(([s]) => s === step);
		const blocked = entry[3]();
		document.getElementById(entry[2]).textContent = blocked;
		if (!blocked) {
			send();
		}
	}
	function cellsOf(chosen) {
		return chosen.slice(0, 2).map(key => state.cells.find(c => cellKey(c) === key)).filter(c => c).map(c => ({ agent: c.agent, model: c.model }));
	}
	document.getElementById('save').addEventListener('click', () => pressed('save', () => vscode.postMessage({ command: 'save', inputs: {
		name: fields.name.value.trim() || fields.name.placeholder, question: fields.question.value, inclusion: fields.inclusion.value, exclusion: fields.exclusion.value, outcome: fields.outcome.value, measure: fields.measure.value,
	} })));
	document.getElementById('chooseFile').addEventListener('click', () => vscode.postMessage({ command: 'chooseFile', value: filePath.value.trim() }));
	document.getElementById('addFile').addEventListener('click', () => pressed('file', () => vscode.postMessage({ command: 'addFile', path: filePath.value.trim() })));
	document.getElementById('search').addEventListener('click', () => pressed('search', () => vscode.postMessage({ command: 'search', query: query.value.trim(),
		from: Number(document.getElementById('from').value), to: Number(document.getElementById('to').value), limit: Number(document.getElementById('limit').value) })));
	document.getElementById('startScreeners').addEventListener('click', () => pressed('screen', () => vscode.postMessage({ command: 'startScreeners', cells: cellsOf(chosenScreeners) })));
	document.getElementById('settle').addEventListener('click', () => pressed('settle', () => {
		const cell = state.cells.find(c => cellKey(c) === chosenAdjudicator);
		if (cell) {
			vscode.postMessage({ command: 'settle', cell: { agent: cell.agent, model: cell.model } });
		}
	}));
	document.getElementById('startExtractors').addEventListener('click', () => pressed('extract', () => vscode.postMessage({ command: 'startExtractors', cells: cellsOf(chosenExtractors) })));
	document.getElementById('runMeta').addEventListener('click', () => pressed('meta', () => vscode.postMessage({ command: 'runMeta' })));
	document.getElementById('openRecords').addEventListener('click', () => vscode.postMessage({ command: 'openFile', what: 'records' }));
	document.getElementById('openMeta').addEventListener('click', () => vscode.postMessage({ command: 'openFile', what: 'meta' }));
	adjudicatorCell.addEventListener('change', () => { chosenAdjudicator = adjudicatorCell.value; });
	for (const element of [fields.question, fields.inclusion, filePath, query]) {
		element.addEventListener('input', () => state && drawButtons());
	}
	earlier.addEventListener('change', () => vscode.postMessage(earlier.value ? { command: 'load', name: earlier.value } : { command: 'newStudy' }));
	document.getElementById('newStudy').addEventListener('click', () => vscode.postMessage({ command: 'newStudy' }));
	document.body.addEventListener('change', event => {
		const target = event.target;
		if (target.dataset && target.dataset.decide && target.value) {
			vscode.postMessage({ command: 'decide', kind: target.dataset.decide, id: target.dataset.id, value: target.value });
		}
	});
	document.body.addEventListener('click', event => {
		const pdf = event.target.closest('button[data-pdf]');
		const add = event.target.closest('button[data-add-pdf]');
		const agentButton = event.target.closest('button[data-what]');
		const url = event.target.closest('button[data-url]');
		if (url) {
			vscode.postMessage({ command: 'openUrl', url: url.dataset.url });
		} else if (pdf) {
			vscode.postMessage({ command: 'openFile', what: 'pdf', id: pdf.dataset.pdf });
		} else if (add) {
			document.getElementById('textsProblem').textContent = '';
			vscode.postMessage({ command: 'addPdf', id: add.dataset.addPdf });
		} else if (agentButton) {
			const key = agentButton.dataset.agent;
			if (agentButton.dataset.what !== 'restart') {
				vscode.postMessage({ command: 'open', agent: key, what: agentButton.dataset.what });
				return;
			}
			// It starts again on the agent and model chosen for it, else on those it had
			const study = state.study;
			const index = Number(key.slice(-1)) - 1;
			const chosen = key === 'adjudicator' ? chosenAdjudicator : key.startsWith('screener') ? chosenScreeners[index] : chosenExtractors[index];
			const run = allRuns().find(r => r.key === key);
			const cell = state.cells.find(c => cellKey(c) === chosen) || run;
			if (cell && study) {
				vscode.postMessage({ command: 'restart', agent: key, cell: { agent: cell.agent, model: cell.model } });
			}
		}
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const before = state && state.study ? state.study.name : '';
			const wasStudy = !!(state && state.study);
			state = message;
			const study = state.study;
			// Another review: the menus show its agents
			if (study && study.name !== before) {
				chosenScreeners = study.screeners.map(cellKey);
				chosenExtractors = study.extractors.map(cellKey);
				chosenAdjudicator = study.adjudicator ? cellKey(study.adjudicator) : '';
			}
			if (wasStudy && !study) {
				for (const field of Object.values(fields)) {
					field.value = '';
				}
				fields.measure.value = 'smd';
				filePath.value = '';
				query.value = '';
				chosenScreeners = [];
				chosenExtractors = [];
				chosenAdjudicator = '';
			}
			draw();
		} else if (message.command === 'problem') {
			const ids = { question: 'questionProblem', file: 'fileProblem', search: 'searchProblem', screen: 'screenProblem', settle: 'settleProblem', texts: 'textsProblem', extract: 'extractProblem', meta: 'metaProblem' };
			document.getElementById(ids[message.step] || 'questionProblem').textContent = message.text;
			if (message.step === 'search') {
				document.getElementById('searchStatus').textContent = '';
			}
		} else if (message.command === 'chosen') {
			filePath.value = message.value;
			drawButtons();
		} else if (message.command === 'searching') {
			document.getElementById('searchStatus').textContent = TEXT.searching;
		} else if (message.command === 'added') {
			filePath.value = '';
			document.getElementById('searchStatus').textContent = TEXT.addedText.replace('{0}', format(message.found)).replace('{1}', format(message.taken)).replace('{2}', format(message.added));
		} else if (message.command === 'sent') {
			document.getElementById('metaStatus').textContent = TEXT.sent;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: SYSTEMATIC_REVIEW_COMMAND_ID, title: localize2('systematicReview.action', "Systematic Review..."), category: localize2('orchestration.category', "Orchestration"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openSystematicReviewPage(accessor);
	}
});
