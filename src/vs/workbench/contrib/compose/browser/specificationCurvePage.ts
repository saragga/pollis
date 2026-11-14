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
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { folderUri } from '../../model/browser/handlers/scaffold.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { SPECIFICATIONCURVE_METADATA } from '../../model/browser/webviews/specificationCurve.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ITerminalInstance, ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { DataKind, EXAMPLE_DATASETS, freeStudyName, IOrchestrationCell, JULIA_TO_JSON, orchestrationCss, orchestrationPageJs, quantile, studiesFolder, studyDataText, studyStepHtml, studyStepText, tomlString, unattendedCells, unattendedRun, validStudyName } from './orchestration.js';
import { launchAgent, pollisJlPath, skillFile } from './pollisAgents.js';

// Specification Curve, from Compose > Orchestration (compose.contribution.ts), after Simonsohn, Simmons and Nelson
// (2020): every defensible way of answering a question on the data, each one option of each decision, is run, and
// the estimates are shown in order with the choices behind them, then tested together against data made to have no
// effect. A page of the scaffold in the Time Arrow style, in five steps: 1, Question and Data, as Many Analysts';
// 2, The Choices, proposed by two to four coding agents each on its own (propose-specifications), or taken from the
// analysts of a Many Analysts study, the options the user keeps ticked; 3, The Code, specification.jl, written by one
// coding agent (write-specification-code) and checked on every specification; 4, The Curve, every specification run
// in Julia; 5, Inference Under the Null. A study is a folder, orchestration/specification-curve/<study> of the
// Pollis Workspace: study.toml, data/ for a file of the user's own, proposer-1 to proposer-N, each with its SKILL.md,
// TASK.md and decisions.toml, or proposals.toml for choices taken from a study; coder/, with choices.toml,
// curve.jl (written by Pollis), specification.jl, check.json; then curve.json and inference.json.

export const SPECIFICATION_CURVE_COMMAND_ID = 'pollis.orchestration.specificationCurve';

const KIND = 'specification-curve';
const MANY_ANALYSTS_KIND = 'many-analysts';
const PROPOSE_SKILL = 'propose-specifications';
const CODE_SKILL = 'write-specification-code';
const STUDY_FILE = 'study.toml';
const PROPOSALS_FILE = 'proposals.toml';
const DECISIONS_FILE = 'decisions.toml';
const CHOICES_FILE = 'choices.toml';
const RUNNER_FILE = 'curve.jl';
const CODE_FILE = 'specification.jl';
const CHECK_FILE = 'check.json';
const CURVE_FILE = 'curve.json';
const NULL_FILE = 'inference.json';
const CODER = 'coder';
const MIN_PROPOSERS = 2;
const MAX_PROPOSERS = 4;
const DEFAULT_PROPOSERS = 3;
const MAX_SPECIFICATIONS = 2000;
const DRAWS = [200, 500, 1000];
const DEFAULT_DRAWS = 500;

/** The choices of a Many Analysts analyst's choices.toml that become decisions: the outcome and the standard errors stay out, as the curve keeps the estimate's unit and gives each specification its own standard error. */
const STUDY_DECISIONS = ['sample', 'controls', 'estimator'] as const;

type Source = 'agents' | 'study';

/** What the user sets in steps 1 and 2 before the choices are proposed. */
interface IStudyInputs {
	readonly name: string;
	readonly question: string;
	readonly estimate: string;
	readonly data: DataKind;
	readonly file: string;
	readonly description: string;
	readonly source: Source;
	/** The Many Analysts study the choices come from, when `source` is `study`. */
	readonly from: string;
	readonly proposers: readonly { readonly agent: string; readonly model: string }[];
}

interface IAgentEntry {
	readonly agent: string;
	readonly model: string;
	readonly label: string;
}

/** A study as its study.toml records it. */
interface IStudy extends IStudyInputs {
	readonly folder: URI;
	readonly created: string;
	readonly proposers: readonly IAgentEntry[];
	readonly coder?: IAgentEntry;
}

/** An option of a decision, as the proposals give it, merged across the agents that proposed it. */
interface IOption {
	readonly id: string;
	readonly label: string;
	readonly reasons: string[];
	/** The proposers, or the analysts of the Many Analysts study, that proposed it, from 1. */
	readonly proposedBy: number[];
}

interface IDecision {
	readonly id: string;
	readonly label: string;
	readonly options: IOption[];
}

/** A run of an agent, while its terminal is there. */
interface IAgentRun {
	readonly terminal: ITerminalInstance;
	readonly started: number;
	ended?: number;
	exitCode?: number;
}

/** The runs of every study started since Pollis started, by study folder and by agent: `proposer-1`... and `coder`. */
const runs = new Map<string, Map<string, IAgentRun>>();

/** Called when a run ends, to draw the page again, while it is open. */
let onRunEnded: (() => void) | undefined;

type SpecificationCurveMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'propose'; readonly inputs: IStudyInputs }
	| { readonly command: 'writeCode'; readonly kept: Readonly<Record<string, readonly string[]>>; readonly coder: { readonly agent: string; readonly model: string } }
	| { readonly command: 'runCurve' }
	| { readonly command: 'runNull'; readonly draws: number; readonly seed: number }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newStudy' }
	| { readonly command: 'open'; readonly agent: string; readonly what: 'code' | 'decisions' | 'terminal' }
	| { readonly command: 'chooseFile'; readonly value: string };

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

/** An id of a decision or an option: lower-case letters, digits and underscores, starting with a letter. */
function validId(value: unknown): value is string {
	return typeof value === 'string' && /^[a-z][a-z0-9_]{0,59}$/.test(value);
}

/** The cells of the page's messages, checked. */
function checkedCells(value: unknown): { agent: string; model: string }[] {
	return Array.isArray(value) ? value.filter((cell): cell is { agent: string; model: string } => typeof cell?.agent === 'string' && typeof cell?.model === 'string').map(cell => ({ agent: cell.agent, model: cell.model })) : [];
}

/** The inputs of steps 1 and 2 as the page sent them, checked; undefined when they are not well formed. */
function checkedInputs(value: unknown): IStudyInputs | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const record = value as Record<string, unknown>;
	const text = (key: string) => typeof record[key] === 'string' ? record[key] as string : undefined;
	const [name, question, estimate, data, file, description, source, from] = ['name', 'question', 'estimate', 'data', 'file', 'description', 'source', 'from'].map(text);
	if (name === undefined || question === undefined || estimate === undefined || (data !== 'example' && data !== 'file') || file === undefined || description === undefined || (source !== 'agents' && source !== 'study') || from === undefined) {
		return undefined;
	}
	return { name: name.trim(), question: question.trim(), estimate: estimate.trim(), data, file: file.trim(), description: description.trim(), source, from: from.trim(), proposers: checkedCells(record.proposers) };
}

function studyToml(study: IStudy): string {
	const lines = [
		'# Specification Curve: a study of Compose > Orchestration in Pollis',
		`question = ${tomlString(study.question)}`,
		`estimate = ${tomlString(study.estimate)}`,
		`data = ${tomlString(study.data)}`,
		...(study.data === 'file' ? [`file = ${tomlString(study.file)}`, `description = ${tomlString(study.description)}`] : [`datasets = [${EXAMPLE_DATASETS.map(tomlString).join(', ')}]`]),
		`source = ${tomlString(study.source)}`,
		...(study.source === 'study' ? [`from = ${tomlString(study.from)}`] : []),
		`created = ${tomlString(study.created)}`,
	];
	for (const proposer of study.proposers) {
		lines.push('', '[[proposers]]', `agent = ${tomlString(proposer.agent)}`, `model = ${tomlString(proposer.model)}`, `label = ${tomlString(proposer.label)}`);
	}
	if (study.coder) {
		lines.push('', '[coder]', `agent = ${tomlString(study.coder.agent)}`, `model = ${tomlString(study.coder.model)}`, `label = ${tomlString(study.coder.label)}`);
	}
	return lines.join('\n') + '\n';
}

function agentEntry(value: unknown): IAgentEntry | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const record = value as Record<string, unknown>;
	const text = (key: string) => typeof record[key] === 'string' ? record[key] as string : '';
	return text('agent') ? { agent: text('agent'), model: text('model'), label: text('label') || text('agent') } : undefined;
}

async function readStudy(fileService: IFileService, folder: URI): Promise<IStudy | undefined> {
	try {
		const toml = parseToml((await fileService.readFile(joinPath(folder, STUDY_FILE))).value.toString());
		const text = (key: string) => typeof toml[key] === 'string' ? toml[key] as string : '';
		const proposers = (Array.isArray(toml.proposers) ? toml.proposers : []).map(agentEntry).filter((entry): entry is IAgentEntry => !!entry);
		return {
			folder,
			name: basename(folder),
			question: text('question'),
			estimate: text('estimate'),
			data: text('data') === 'file' ? 'file' : 'example',
			file: text('file'),
			description: text('description'),
			source: text('source') === 'study' ? 'study' : 'agents',
			from: text('from'),
			created: text('created'),
			proposers,
			coder: agentEntry(toml.coder),
		};
	} catch {
		return undefined;
	}
}

/** The decisions of a decisions.toml, proposals.toml or choices.toml, those well formed. */
function decisionsOf(content: string): { id: string; label: string; options: { id: string; label: string; reason: string; proposedBy: number[] }[] }[] {
	const toml = parseToml(content);
	const decisions = [];
	for (const decision of Array.isArray(toml.decisions) ? toml.decisions as Record<string, unknown>[] : []) {
		if (!validId(decision?.id)) {
			continue;
		}
		const options: { id: string; label: string; reason: string; proposedBy: number[] }[] = [];
		for (const option of Array.isArray(decision.options) ? decision.options as Record<string, unknown>[] : []) {
			if (validId(option?.id) && !options.some(other => other.id === option.id)) {
				const proposedBy = Array.isArray(option.proposed_by) ? option.proposed_by.filter((k): k is number => typeof k === 'number') : [];
				options.push({ id: option.id, label: typeof option.label === 'string' && option.label.trim() ? option.label.trim() : option.id, reason: typeof option.reason === 'string' ? option.reason.trim() : '', proposedBy });
			}
		}
		if (options.length) {
			decisions.push({ id: decision.id, label: typeof decision.label === 'string' && decision.label.trim() ? decision.label.trim() : decision.id, options });
		}
	}
	return decisions;
}

/** The decisions of a file, merged into `merged`: a decision or an option of an id already there gains the proposer. */
function mergeDecisions(merged: IDecision[], decisions: ReturnType<typeof decisionsOf>, proposer: number | undefined): void {
	for (const decision of decisions) {
		let into = merged.find(other => other.id === decision.id);
		if (!into) {
			into = { id: decision.id, label: decision.label, options: [] };
			merged.push(into);
		}
		for (const option of decision.options) {
			const by = proposer === undefined ? option.proposedBy : [proposer];
			const same = into.options.find(other => other.id === option.id);
			if (same) {
				same.proposedBy.push(...by.filter(k => !same.proposedBy.includes(k)));
				if (option.reason) {
					same.reasons.push(option.reason);
				}
			} else {
				into.options.push({ id: option.id, label: option.label, reasons: option.reason ? [option.reason] : [], proposedBy: [...by] });
			}
		}
	}
}

/** The choices of a Many Analysts study as decisions: each analyst's sample, controls and estimator an option, the same words one option. */
async function choicesOfStudy(fileService: IFileService, folder: URI): Promise<IDecision[]> {
	const names = { sample: localize('specificationCurve.sample', "Sample"), controls: localize('specificationCurve.controls', "Controls"), estimator: localize('specificationCurve.estimator', "Estimator") };
	const decisions: IDecision[] = STUDY_DECISIONS.map(id => ({ id, label: names[id], options: [] }));
	for (let k = 1; await fileService.exists(joinPath(folder, `analyst-${k}`)); k++) {
		let toml;
		try {
			toml = parseToml((await fileService.readFile(joinPath(folder, `analyst-${k}`, 'choices.toml'))).value.toString());
		} catch {
			continue;
		}
		for (const decision of decisions) {
			const value = toml[decision.id];
			const label = Array.isArray(value) ? value.map(String).join(', ') : typeof value === 'string' ? value.trim() : '';
			if (!label) {
				continue;
			}
			const same = decision.options.find(option => option.label === label);
			if (same) {
				same.proposedBy.push(k);
			} else {
				decision.options.push({ id: `analyst_${k}`, label, reasons: [], proposedBy: [k] });
			}
		}
	}
	return decisions.filter(decision => decision.options.length);
}

/** Decisions as TOML, each option with the agents that proposed it when `withProposers`. */
function decisionsToml(heading: string, decisions: readonly IDecision[], withProposers: boolean): string {
	const lines = [heading];
	for (const decision of decisions) {
		lines.push('', '[[decisions]]', `id = ${tomlString(decision.id)}`, `label = ${tomlString(decision.label)}`);
		for (const option of decision.options) {
			lines.push('', '[[decisions.options]]', `id = ${tomlString(option.id)}`, `label = ${tomlString(option.label)}`);
			if (withProposers) {
				lines.push(`proposed_by = [${option.proposedBy.join(', ')}]`);
				if (option.reasons.length) {
					lines.push(`reason = ${tomlString(option.reasons.join(' / '))}`);
				}
			}
		}
	}
	return lines.join('\n') + '\n';
}

/** The number of specifications: the product of the numbers of options. */
function specificationCount(decisions: readonly { readonly options: readonly unknown[] }[]): number {
	return decisions.length ? decisions.reduce((product, decision) => product * decision.options.length, 1) : 0;
}

/** The common part of the agents' TASK.md: the question, the estimate and the data. */
function taskHead(study: IStudy, title: string, intro: string): string[] {
	return [
		title,
		'',
		intro,
		'',
		localize('specificationCurve.task.question', "## The Question"),
		'',
		study.question,
		'',
		localize('specificationCurve.task.estimate', "## The Estimate"),
		'',
		study.estimate,
		'',
		localize('specificationCurve.task.data', "## The Data"),
		'',
		studyDataText(study),
		'',
	];
}

/** A proposer's task, as it reads it in TASK.md. */
function proposeTaskText(study: IStudy, proposers: number): string {
	return [
		...taskHead(study, localize('specificationCurve.proposeTask.title', "# Your Task"), localize('specificationCurve.proposeTask.intro', "You are one of {0} agents who each list, on their own, the decisions an analyst faces in answering the question below, and the defensible options of each. Every combination of the options will be run, and the estimates shown in order: a specification curve. Follow SKILL.md, in this folder.", proposers)),
		localize('specificationCurve.task.julia', "## Running Julia"),
		'',
		localize('specificationCurve.proposeTask.julia', "To look at the data, write a Julia file in this folder and run it with the command below, which gives Julia the packages of Pollis, PollisDatasets among them:"),
		'',
		'```sh',
		`julia -L "${pollisJlPath()}" explore.jl`,
		'```',
		'',
	].join('\n');
}

/** The coder's task, as it reads it in TASK.md: with the decisions and the options kept. */
function codeTaskText(study: IStudy, decisions: readonly IDecision[]): string {
	const list = decisions.flatMap(decision => [
		`- **${decision.label}** (\`${decision.id}\`):`,
		...decision.options.map(option => `  - \`${option.id}\`: ${option.label}`),
	]);
	return [
		...taskHead(study, localize('specificationCurve.codeTask.title', "# Your Task"), localize('specificationCurve.codeTask.intro', "Write `specification.jl`, which gives the rows and the estimate of every specification of a specification curve: each specification is one option of each decision below, as `choices.toml` of this folder lists them. Follow SKILL.md, in this folder.")),
		localize('specificationCurve.codeTask.decisions', "## The Decisions"),
		'',
		localize('specificationCurve.codeTask.count', "{0} specifications in all.", specificationCount(decisions)),
		'',
		...list,
		'',
		localize('specificationCurve.task.julia', "## Running Julia"),
		'',
		localize('specificationCurve.codeTask.julia', "Check your code on every specification with the command below, run from this folder, which gives Julia the packages of Pollis, PollisDatasets among them. It writes `check.json` and prints each specification that fails:"),
		'',
		'```sh',
		`julia -L "${pollisJlPath()}" curve.jl check`,
		'```',
		'',
	].join('\n');
}

/**
 * The Julia file that runs the specifications, written into the coder's folder: every specification is one option of
 * each decision of choices.toml, and specification.jl gives its rows and its estimate. `check` runs each once into
 * check.json; `curve` runs each into a JSON file; `null` runs the test under the null into a JSON file.
 */
function runnerCode(): string {
	return String.raw`# Specification Curve: written by Pollis. Every specification is one option of each decision of choices.toml, and
# the functions of specification.jl give its rows and its estimate. Run it from this folder with the Julia of Pollis:
#   julia -L Pollis.jl curve.jl check                     every specification once, into check.json
#   julia -L Pollis.jl curve.jl curve OUT.json            every specification: its estimate, standard error and n
#   julia -L Pollis.jl curve.jl null OUT.json DRAWS SEED  the test under the null, with DRAWS resamples
import TOML, Random, Statistics
include(joinpath(@__DIR__, "specification.jl"))

let mode = isempty(ARGS) ? "check" : ARGS[1]
${JULIA_TO_JSON}
	decisions = TOML.parsefile(joinpath(@__DIR__, "choices.toml"))["decisions"]
	# Every specification, one option of each decision; built in its own scope, so that the closures below see a
	# variable that is never assigned again
	specs = let combinations = [Dict{String, String}()]
		for decision in decisions
			combinations = [merge(spec, Dict(decision["id"] => option["id"])) for spec in combinations for option in decision["options"]]
		end
		combinations
	end
	K = length(specs)
	stamp() = Libc.strftime("%Y-%m-%d %H:%M", time())
	# The rows of a specification, checked: a NamedTuple of columns as long as y, with y the outcome and d the variable
	# whose effect is estimated
	function rows_of(spec)
		rows = specification_data(spec)
		(rows isa NamedTuple && haskey(rows, :y) && haskey(rows, :d)) || error("specification_data must return a NamedTuple of columns with y and d")
		all(column -> column isa AbstractVector && length(column) == length(rows.y), values(rows)) || error("every column of specification_data must be a vector as long as y")
		return rows
	end
	# The estimate and standard error of a specification on rows, checked
	function fit(rows, spec)
		b, se = estimate(rows, spec)
		(isfinite(b) && isfinite(se) && se > 0) || error("estimate gave $b with standard error $se")
		return Float64(b), Float64(se)
	end
	# Every specification once, over the threads of Julia; a failure is kept with its message
	function run_all()
		results = Vector{Dict{String, Any}}(undef, K)
		done = Threads.Atomic{Int}(0)
		Threads.@threads for k in 1:K
			entry = Dict{String, Any}("choices" => specs[k])
			try
				rows = rows_of(specs[k])
				b, se = fit(rows, specs[k])
				entry["estimate"] = b
				entry["std_error"] = se
				entry["n"] = length(rows.y)
			catch err
				entry["error"] = sprint(showerror, err)
			end
			results[k] = entry
			finished = Threads.atomic_add!(done, 1) + 1
			finished % max(1, div(K, 10)) == 0 && println("  $finished of $K specifications")
		end
		return results
	end

	if mode == "check"
		results = run_all()
		failed = filter(entry -> haskey(entry, "error"), results)
		write(joinpath(@__DIR__, "check.json"), to_json(Dict("checked" => stamp(), "specifications" => K, "failed" => length(failed), "failures" => failed[1:min(end, 20)])))
		for entry in failed[1:min(end, 20)]
			println("FAILED ", entry["choices"], ": ", entry["error"])
		end
		println(isempty(failed) ? "Every one of the $K specifications ran." : "$(length(failed)) of the $K specifications failed.")
	elseif mode == "curve"
		println("Running the $K specifications on $(Threads.nthreads()) threads")
		results = run_all()
		write(ARGS[2], to_json(Dict("ran" => stamp(), "decisions" => decisions, "specifications" => results)))
		println("The curve is in ", ARGS[2])
	elseif mode == "null"
		out, draws, seed = ARGS[2], parse(Int, ARGS[3]), parse(Int, ARGS[4])
		println("The test under the null: the $K specifications on $draws resamples, on $(Threads.nthreads()) threads")
		observed = run_all()
		any(entry -> haskey(entry, "error"), observed) && error("Some specifications fail: run the curve, and fix specification.jl")
		b = [entry["estimate"] for entry in observed]
		se = [entry["std_error"] for entry in observed]
		# The dominant direction is the sign of the median estimate; the statistics are taken in it
		direction = Statistics.median(b) >= 0 ? 1.0 : -1.0
		statistics(b, se) = (median = direction * Statistics.median(b), share = Statistics.mean(direction .* b ./ se .> 1.96), stouffer = direction * sum(b ./ se) / sqrt(length(b)))
		actual = statistics(b, se)
		B = fill(NaN, K, draws)
		S = fill(NaN, K, draws)
		done = Threads.Atomic{Int}(0)
		Threads.@threads for k in 1:K
			rows = rows_of(specs[k])
			# The outcome with the specification's own estimate taken out, so that its effect is zero
			y0 = rows.y .- b[k] .* rows.d
			# Resampled within the treated and the untreated when d is 0 or 1, so that both groups keep their sizes
			groups = all(v -> v == 0 || v == 1, rows.d) ? filter(!isempty, [findall(==(1), rows.d), findall(==(0), rows.d)]) : [collect(eachindex(rows.y))]
			for r in 1:draws
				# The same draw for every specification on the same rows: the seed and the draw's number make it
				rng = Random.Xoshiro(seed + r)
				index = reduce(vcat, [rand(rng, group, length(group)) for group in groups])
				drawn = merge(map(column -> column[index], rows), (y = y0[index],))
				try
					B[k, r], S[k, r] = fit(drawn, specs[k])
				catch
				end
			end
			finished = Threads.atomic_add!(done, 1) + 1
			finished % max(1, div(K, 10)) == 0 && println("  $finished of $K specifications")
		end
		# A draw counts when every specification ran on it
		used = [r for r in 1:draws if all(isfinite, view(B, :, r))]
		null = [statistics(B[:, r], S[:, r]) for r in used]
		summary(f) = Dict("observed" => f(actual), "null" => isempty(null) ? nothing : Statistics.median(f.(null)), "p" => isempty(null) ? nothing : Statistics.mean(f(s) >= f(actual) for s in null))
		write(out, to_json(Dict(
			"ran" => stamp(), "draws" => draws, "seed" => seed, "used" => length(used), "direction" => direction,
			"median" => summary(s -> s.median), "share" => summary(s -> s.share), "stouffer" => summary(s -> s.stouffer),
		)))
		println("The test under the null is in ", out)
	else
		error("Unknown mode $mode: check, curve or null")
	end
end
`;
}

/** The Julia code the REPL runs for steps 4 and 5: curve.jl in a new Julia process, on the threads of this computer, in the coder's folder. */
function runCode(study: IStudy, args: readonly string[], heading: string): string {
	const coder = joinPath(study.folder, CODER).fsPath;
	return String.raw`# Specification Curve: ${heading}
let dir = raw"${coder}", pollis = raw"${pollisJlPath()}"
	command = Cmd(Cmd([Base.julia_cmd().exec; "--threads=auto"; "-L"; pollis; "${RUNNER_FILE}"; ${args.map(arg => `raw"${arg}"`).join('; ')}]); dir = dir)
	success(command) || println("Specification Curve: curve.jl did not finish, see the messages above")
end`;
}

/** A finite number of a parsed JSON value, else undefined. */
function finite(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** A parsed JSON file of the study, else undefined. */
async function readJson(fileService: IFileService, file: URI): Promise<Record<string, unknown> | undefined> {
	try {
		const json = JSON.parse((await fileService.readFile(file)).value.toString());
		return json && typeof json === 'object' ? json : undefined;
	} catch {
		return undefined;
	}
}

/** A specification of curve.json that ran: its options, by decision, its estimate, standard error and number of rows. */
interface ISpecificationResult {
	readonly choices: Record<string, string>;
	readonly estimate: number;
	readonly std_error: number;
	readonly n: number;
}

/** The specifications of curve.json, checked: those that ran, and the errors of those that failed. */
function curveOf(json: Record<string, unknown>): { ran: string; specifications: ISpecificationResult[]; errors: string[] } {
	const specifications: ISpecificationResult[] = [];
	const errors: string[] = [];
	for (const entry of Array.isArray(json.specifications) ? json.specifications as Record<string, unknown>[] : []) {
		const choices: Record<string, string> = {};
		for (const [key, value] of Object.entries(entry?.choices && typeof entry.choices === 'object' ? entry.choices : {})) {
			if (typeof value === 'string') {
				choices[key] = value;
			}
		}
		const estimate = finite(entry?.estimate), stdError = finite(entry?.std_error), n = finite(entry?.n);
		if (estimate !== undefined && stdError !== undefined) {
			specifications.push({ choices, estimate, std_error: stdError, n: n ?? 0 });
		} else {
			errors.push(typeof entry?.error === 'string' ? entry.error : '');
		}
	}
	return { ran: typeof json.ran === 'string' ? json.ran : '', specifications, errors };
}

/** Opens the Specification Curve page, or shows it when it is open. */
async function openSpecificationCurvePage(accessor: ServicesAccessor): Promise<void> {
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
	const fileDialogService = accessor.get(IFileDialogService);
	const terminalService = accessor.get(ITerminalService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const progressService = accessor.get(IProgressService);
	const instantiationService = accessor.get(IInstantiationService);
	const launchServices = { terminalService, terminalInstanceService, fileService, commandService, progressService, workspaceContextService: contextService, pathService };

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('specificationCurve.title', "Specification Curve");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.specificationCurve',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'specificationCurve', title, SPECIFICATIONCURVE_METADATA.specificationCurve, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The study shown in steps 2 to 5, once started or opened; its folders are watched. */
	let current: IStudy | undefined;
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	onRunEnded = () => refresh.schedule();

	const watch = (study: IStudy | undefined) => {
		current = study;
		if (!study) {
			watcher.clear();
			return;
		}
		const store = new DisposableStore();
		for (const folder of [study.folder, joinPath(study.folder, CODER), ...study.proposers.map((_, index) => joinPath(study.folder, `proposer-${index + 1}`))]) {
			const fileWatcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			store.add(fileWatcher.onDidChange(() => refresh.schedule()));
		}
		watcher.value = store;
	};

	/** An agent's status: from its run while its terminal is there, else from the file it writes when it is done. */
	const agentState = async (study: IStudy, key: string, entry: IAgentEntry, doneFile: string) => {
		const folder = joinPath(study.folder, key);
		const [started, done] = await Promise.all([fileService.exists(joinPath(folder, 'TASK.md')), fileService.exists(joinPath(folder, doneFile))]);
		const run = runs.get(study.folder.toString())?.get(key);
		const status = run && run.ended === undefined ? 'running'
			: done ? 'done'
				: run ? 'failed'
					: started ? 'ended' : 'waiting';
		return { key, label: entry.label, status, started: run?.started, ended: run?.ended, exitCode: run?.exitCode, hasFile: done, hasTerminal: !!run && !run.terminal.isDisposed };
	};

	/** The decisions proposed: merged from the proposers' decisions.toml, or those taken from a Many Analysts study. */
	const proposals = async (study: IStudy): Promise<IDecision[]> => {
		if (study.source === 'study') {
			try {
				const merged: IDecision[] = [];
				mergeDecisions(merged, decisionsOf((await fileService.readFile(joinPath(study.folder, PROPOSALS_FILE))).value.toString()), undefined);
				return merged;
			} catch {
				return [];
			}
		}
		const merged: IDecision[] = [];
		for (let k = 1; k <= study.proposers.length; k++) {
			try {
				mergeDecisions(merged, decisionsOf((await fileService.readFile(joinPath(study.folder, `proposer-${k}`, DECISIONS_FILE))).value.toString()), k);
			} catch {
				// Not written yet
			}
		}
		return merged;
	};

	/** The decisions and options kept, once the code was asked for. */
	const keptChoices = async (study: IStudy): Promise<IDecision[] | undefined> => {
		try {
			const merged: IDecision[] = [];
			mergeDecisions(merged, decisionsOf((await fileService.readFile(joinPath(study.folder, CODER, CHOICES_FILE))).value.toString()), undefined);
			return merged;
		} catch {
			return undefined;
		}
	};

	/** The curve as the page draws it: each specification, sorted by estimate, and the figures of the whole. */
	const curveState = async (study: IStudy) => {
		const json = await readJson(fileService, joinPath(study.folder, CURVE_FILE));
		if (!json) {
			return undefined;
		}
		const curve = curveOf(json);
		const ran = curve.specifications.sort((a, b) => a.estimate - b.estimate);
		const estimates = ran.map(spec => spec.estimate);
		const median = estimates.length ? quantile(estimates, 0.5) : 0;
		const direction = median >= 0 ? 1 : -1;
		const significant = (spec: ISpecificationResult) => direction * spec.estimate / spec.std_error > 1.96;
		const opposite = (spec: ISpecificationResult) => -direction * spec.estimate / spec.std_error > 1.96;
		return {
			ran: curve.ran,
			specifications: ran,
			failed: curve.errors.length,
			firstError: curve.errors[0] ?? '',
			figures: estimates.length ? {
				count: estimates.length,
				median,
				q1: quantile(estimates, 0.25),
				q3: quantile(estimates, 0.75),
				min: estimates[0],
				max: estimates[estimates.length - 1],
				direction,
				sameSign: ran.filter(spec => Math.sign(spec.estimate) === direction).length / ran.length,
				significant: ran.filter(significant).length / ran.length,
				opposite: ran.filter(opposite).length / ran.length,
			} : undefined,
		};
	};

	const nullState = async (study: IStudy) => {
		const json = await readJson(fileService, joinPath(study.folder, NULL_FILE));
		if (!json) {
			return undefined;
		}
		const statistic = (key: string) => {
			const value = json[key] && typeof json[key] === 'object' ? json[key] as Record<string, unknown> : {};
			return { observed: finite(value.observed), null: finite(value.null), p: finite(value.p) };
		};
		return { ran: typeof json.ran === 'string' ? json.ran : '', draws: finite(json.draws), seed: finite(json.seed), used: finite(json.used), direction: finite(json.direction), median: statistic('median'), share: statistic('share'), stouffer: statistic('stouffer') };
	};

	const studyNames = async (root: URI, needs?: (folder: URI) => Promise<boolean>): Promise<string[]> => {
		if (!await fileService.exists(root)) {
			return [];
		}
		const stat = await fileService.resolve(root, { resolveMetadata: true });
		const studies = [];
		for (const child of stat.children ?? []) {
			if (child.isDirectory && await fileService.exists(joinPath(child.resource, STUDY_FILE)) && (!needs || await needs(child.resource))) {
				studies.push(child);
			}
		}
		return studies.sort((a, b) => b.mtime - a.mtime).map(child => child.name);
	};

	let cells: IOrchestrationCell[] = [];
	const sendState = async () => {
		const root = await studiesFolder(contextService, fileService, pathService, KIND);
		const studies = await studyNames(root);
		const manyAnalysts = await studyNames(await studiesFolder(contextService, fileService, pathService, MANY_ANALYSTS_KIND), async folder => fileService.exists(joinPath(folder, 'analyst-1', 'choices.toml')));
		const study = current && await readStudy(fileService, current.folder);
		const coderFolder = study && joinPath(study.folder, CODER);
		const check = coderFolder && await readJson(fileService, joinPath(coderFolder, CHECK_FILE));
		const kept = study && await keptChoices(study);
		post({
			command: 'state',
			root: root.fsPath,
			studies,
			manyAnalysts,
			cells,
			suggestion: freeStudyName('nsw-training', studies),
			study: study && {
				name: study.name,
				question: study.question,
				estimate: study.estimate,
				data: study.data,
				file: study.file,
				description: study.description,
				source: study.source,
				from: study.from,
				proposers: await Promise.all(study.proposers.map((entry, index) => agentState(study, `proposer-${index + 1}`, entry, DECISIONS_FILE))),
				proposals: await proposals(study),
				kept,
				coder: study.coder && await agentState(study, CODER, study.coder, CODE_FILE),
				check: check && { specifications: finite(check.specifications), failed: finite(check.failed), checked: typeof check.checked === 'string' ? check.checked : '' },
				curve: await curveState(study),
				null: await nullState(study),
			},
		});
	};

	/** Checks the inputs of steps 1 and 2; returns why the choices cannot be proposed, else undefined. */
	const problem = async (inputs: IStudyInputs, root: URI): Promise<string | undefined> => {
		if (!validStudyName(inputs.name)) {
			return localize('specificationCurve.badName', "The study's name is its folder's: letters, digits, hyphens and underscores, starting with a letter or digit.");
		}
		if (await fileService.exists(joinPath(root, inputs.name))) {
			return localize('specificationCurve.taken', "There is a study {0} already: open it from the list, or give the new one another name.", inputs.name);
		}
		if (!inputs.question.trim() || !inputs.estimate.trim()) {
			return localize('specificationCurve.noQuestion', "Write the question, and the estimate every specification must give.");
		}
		if (inputs.source === 'agents') {
			if (inputs.data === 'file' && (!inputs.file.trim() || !await fileService.exists(URI.file(inputs.file.trim())))) {
				return localize('specificationCurve.noFile', "Choose the file of your data.");
			}
			if (inputs.proposers.length < MIN_PROPOSERS || inputs.proposers.length > MAX_PROPOSERS) {
				return localize('specificationCurve.count', "From {0} to {1} agents propose the choices.", MIN_PROPOSERS, MAX_PROPOSERS);
			}
			if (inputs.proposers.some(proposer => !cells.some(cell => cell.agent === proposer.agent && cell.model === proposer.model))) {
				return localize('specificationCurve.noCell', "Choose an agent and a model for every agent that proposes.");
			}
		} else if (!validStudyName(inputs.from)) {
			return localize('specificationCurve.noStudy', "Choose the Many Analysts study whose choices to take.");
		}
		return undefined;
	};

	/** Starts an agent in its folder of the study, with its skill and task, and follows its run. */
	const startAgent = async (study: IStudy, key: string, entry: IAgentEntry, skill: URI, task: string, focus: boolean, terminalName: string) => {
		const folder = joinPath(study.folder, key);
		await fileService.copy(skill, joinPath(folder, 'SKILL.md'), true);
		await fileService.writeFile(joinPath(folder, 'TASK.md'), VSBuffer.fromString(task));
		if (study.data === 'file' && await fileService.exists(joinPath(study.folder, 'data'))) {
			await fileService.copy(joinPath(study.folder, 'data'), joinPath(folder, 'data'), true);
		}
		const run = unattendedRun(configurationService, entry);
		const prompt = localize('specificationCurve.prompt', "Read SKILL.md and TASK.md in this folder and follow them, without asking me anything.");
		const launched = run ? await launchAgent(launchServices, { name: terminalName, run, prompt, cwd: folder, focus }) : 'missing';
		if (typeof launched === 'string') {
			notificationService.error(launched === 'missing'
				? localize('specificationCurve.missing', "{0} did not start: it cannot be run on this computer.", entry.label)
				: localize('specificationCurve.failed', "{0} did not start: {1}", entry.label, launched));
			return;
		}
		let studyRuns = runs.get(study.folder.toString());
		if (!studyRuns) {
			studyRuns = new Map();
			runs.set(study.folder.toString(), studyRuns);
		}
		const agentRun: IAgentRun = { terminal: launched, started: Date.now() };
		studyRuns.set(key, agentRun);
		const runStore = new DisposableStore();
		runStore.add(launched.onExit(exit => {
			agentRun.ended = Date.now();
			agentRun.exitCode = typeof exit === 'number' ? exit : undefined;
			onRunEnded?.();
		}));
		runStore.add(launched.onDisposed(() => {
			agentRun.ended ??= Date.now();
			runStore.dispose();
			onRunEnded?.();
		}));
	};

	/** Writes the study's folder, then starts the agents that propose the choices, or takes those of a Many Analysts study. */
	const propose = async (inputs: IStudyInputs) => {
		const root = await studiesFolder(contextService, fileService, pathService, KIND);
		const reason = await problem(inputs, root);
		if (reason) {
			post({ command: 'problem', step: 'propose', text: reason });
			return;
		}
		const folder = joinPath(root, inputs.name);
		const created = new Date().toISOString().slice(0, 16).replace('T', ' ');
		if (inputs.source === 'study') {
			// The question, the estimate and the data are the Many Analysts study's, so that its choices fit them
			const source = await readStudy(fileService, joinPath(await studiesFolder(contextService, fileService, pathService, MANY_ANALYSTS_KIND), inputs.from));
			const sourceToml = source && parseToml((await fileService.readFile(joinPath(source.folder, STUDY_FILE))).value.toString());
			const decisions = source ? await choicesOfStudy(fileService, source.folder) : [];
			if (!source || !sourceToml || !decisions.length) {
				post({ command: 'problem', step: 'propose', text: localize('specificationCurve.studyEmpty', "The study {0} has no choices of its analysts to take.", inputs.from) });
				return;
			}
			const text = (key: string) => typeof sourceToml[key] === 'string' ? sourceToml[key] as string : '';
			const study: IStudy = { ...inputs, folder, created, question: text('question'), estimate: text('estimate'), data: text('data') === 'file' ? 'file' : 'example', file: text('file'), description: text('description'), proposers: [] };
			await fileService.writeFile(joinPath(folder, STUDY_FILE), VSBuffer.fromString(studyToml(study)));
			if (study.data === 'file' && await fileService.exists(joinPath(source.folder, 'data'))) {
				await fileService.copy(joinPath(source.folder, 'data'), joinPath(folder, 'data'), true);
			}
			await fileService.writeFile(joinPath(folder, PROPOSALS_FILE), VSBuffer.fromString(decisionsToml(localize('specificationCurve.proposalsHeading', "# Specification Curve: the choices of the analysts of the Many Analysts study {0}", inputs.from), decisions, true)));
			watch(study);
			await sendState();
			return;
		}
		const skill = await instantiationService.invokeFunction(skillFile, PROPOSE_SKILL);
		if (!skill || !await fileService.exists(skill)) {
			post({ command: 'problem', step: 'propose', text: localize('specificationCurve.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", PROPOSE_SKILL) });
			return;
		}
		const file = inputs.data === 'file' ? URI.file(inputs.file.trim()) : undefined;
		const study: IStudy = {
			...inputs,
			folder,
			created,
			file: file ? `data/${basename(file)}` : '',
			proposers: inputs.proposers.map(proposer => ({ ...proposer, label: cells.find(cell => cell.agent === proposer.agent && cell.model === proposer.model)!.label })),
		};
		await fileService.writeFile(joinPath(folder, STUDY_FILE), VSBuffer.fromString(studyToml(study)));
		if (file) {
			await fileService.copy(file, joinPath(folder, 'data', basename(file)));
			await fileService.writeFile(joinPath(folder, 'data', 'README.md'), VSBuffer.fromString(`# ${basename(file)}\n\n${inputs.description.trim()}\n`));
		}
		watch(study);
		const task = proposeTaskText(study, study.proposers.length);
		for (const [index, proposer] of study.proposers.entries()) {
			await startAgent(study, `proposer-${index + 1}`, proposer, skill, task, index === 0, localize('specificationCurve.proposerTerminal', "Specification Curve: {0}, Proposer {1} ({2})", study.name, index + 1, proposer.label));
		}
		await sendState();
	};

	/** Writes the decisions and options kept, the runner and the task into the coder's folder, then starts the coder. */
	const writeCode = async (kept: Readonly<Record<string, readonly string[]>>, coderCell: { agent: string; model: string }) => {
		if (!current) {
			return;
		}
		const study = await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const decisions = (await proposals(study)).map(decision => ({ ...decision, options: decision.options.filter(option => kept[decision.id]?.includes(option.id)) }));
		const count = specificationCount(decisions);
		if (decisions.some(decision => !decision.options.length)) {
			post({ command: 'problem', step: 'code', text: localize('specificationCurve.emptyDecision', "Keep at least one option of each decision.") });
			return;
		}
		if (count > MAX_SPECIFICATIONS) {
			post({ command: 'problem', step: 'code', text: localize('specificationCurve.tooMany', "{0} specifications are more than the {1} a curve can have: keep fewer options.", count, MAX_SPECIFICATIONS) });
			return;
		}
		const cell = cells.find(other => other.agent === coderCell.agent && other.model === coderCell.model);
		if (!cell) {
			post({ command: 'problem', step: 'code', text: localize('specificationCurve.noCoder', "Choose the agent and the model that write the code.") });
			return;
		}
		const skill = await instantiationService.invokeFunction(skillFile, CODE_SKILL);
		if (!skill || !await fileService.exists(skill)) {
			post({ command: 'problem', step: 'code', text: localize('specificationCurve.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", CODE_SKILL) });
			return;
		}
		const withCoder: IStudy = { ...study, coder: { agent: cell.agent, model: cell.model, label: cell.label } };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withCoder)));
		const coderFolder = joinPath(study.folder, CODER);
		await fileService.writeFile(joinPath(coderFolder, CHOICES_FILE), VSBuffer.fromString(decisionsToml(localize('specificationCurve.choicesHeading', "# Specification Curve: the decisions and the options kept; every specification is one option of each decision"), decisions, false)));
		await fileService.writeFile(joinPath(coderFolder, RUNNER_FILE), VSBuffer.fromString(runnerCode()));
		watch(withCoder);
		await startAgent(withCoder, CODER, withCoder.coder!, skill, codeTaskText(withCoder, decisions), true, localize('specificationCurve.coderTerminal', "Specification Curve: {0}, Code ({1})", study.name, cell.label));
		await sendState();
	};

	const openFile = async (agent: string, what: 'code' | 'decisions' | 'terminal') => {
		if (!current || !(agent === CODER || /^proposer-\d+$/.test(agent))) {
			return;
		}
		if (what === 'terminal') {
			const run = runs.get(current.folder.toString())?.get(agent);
			if (run && !run.terminal.isDisposed) {
				terminalService.setActiveInstance(run.terminal);
				await terminalService.revealTerminal(run.terminal);
			}
			return;
		}
		await editorService.openEditor({ resource: joinPath(current.folder, agent, what === 'code' ? CODE_FILE : DECISIONS_FILE) });
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		onRunEnded = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: SpecificationCurveMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				cells = await unattendedCells(configurationService, commandService, terminalInstanceService, fileService);
				await sendState();
			} else if (message.command === 'propose' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs);
				if (inputs) {
					await propose(inputs);
				}
			} else if (message.command === 'writeCode' && hasKey(message, { kept: true, coder: true })) {
				const kept: Record<string, string[]> = {};
				for (const [decision, options] of Object.entries(message.kept && typeof message.kept === 'object' ? message.kept : {})) {
					if (validId(decision) && Array.isArray(options)) {
						kept[decision] = options.filter(validId);
					}
				}
				const [coder] = checkedCells([message.coder]);
				if (coder) {
					await writeCode(kept, coder);
				}
			} else if (message.command === 'runCurve' && current) {
				await sendToJuliaRepl(runCode(current, ['curve', joinPath(current.folder, CURVE_FILE).fsPath], localize('specificationCurve.runCurveHeading', "every specification, with specification.jl, in a new Julia process")), commandService);
				post({ command: 'sent', step: 'curve' });
			} else if (message.command === 'runNull' && current && hasKey(message, { draws: true, seed: true }) && DRAWS.includes(message.draws) && Number.isInteger(message.seed) && message.seed >= 0) {
				await sendToJuliaRepl(runCode(current, ['null', joinPath(current.folder, NULL_FILE).fsPath, String(message.draws), String(message.seed)], localize('specificationCurve.runNullHeading', "the test under the null, in a new Julia process")), commandService);
				post({ command: 'sent', step: 'null' });
			} else if (message.command === 'load' && hasKey(message, { name: true }) && validStudyName(message.name)) {
				const root = await studiesFolder(contextService, fileService, pathService, KIND);
				watch(await readStudy(fileService, joinPath(root, message.name)));
				await sendState();
			} else if (message.command === 'newStudy') {
				watch(undefined);
				await sendState();
			} else if (message.command === 'open' && hasKey(message, { agent: true, what: true }) && typeof message.agent === 'string' && ['code', 'decisions', 'terminal'].includes(message.what)) {
				await openFile(message.agent, message.what);
			} else if (message.command === 'chooseFile' && hasKey(message, { value: true })) {
				const home = await pathService.userHome({ preferLocal: true });
				const value = folderUri(message.value, home);
				const picked = await fileDialogService.showOpenDialog({
					title: localize('specificationCurve.chooseFile', "Choose the Data"),
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					filters: [{ name: localize('specificationCurve.dataFiles', "Data"), extensions: ['csv', 'tsv', 'parquet', 'arrow', 'json', 'xlsx', 'duckdb'] }],
					defaultUri: await fileService.exists(value) ? value : home,
				});
				if (picked?.[0]) {
					post({ command: 'file', value: picked[0].fsPath });
				}
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

function pageHtml(): string {
	const text = {
		...studyStepText(),
		intro: localize('specificationCurve.intro', "A specification curve runs every defensible way of answering a question on the same data, and shows the estimates in order, with the choices behind each: which sample, which controls, which estimator. It then tests whether the curve as a whole shows an effect, against data made to have none. Coding agents propose the choices and write the code; Pollis runs every specification in Julia. The example asks for the effect of a job training programme on earnings, with LaLonde's data."),
		questionAndData: localize('specificationCurve.questionAndData', "Question and Data"),
		theChoices: localize('specificationCurve.theChoices', "The Choices"),
		source: localize('specificationCurve.source', "Choices From"),
		fromAgents: localize('specificationCurve.fromAgents', "Coding Agents"),
		fromStudy: localize('specificationCurve.fromStudy', "A Many Analysts Study"),
		studyNone: localize('specificationCurve.studyNone', "Choose a study..."),
		noManyAnalysts: localize('specificationCurve.noManyAnalysts', "There is no Many Analysts study with analysts' choices yet."),
		agentsHint: localize('specificationCurve.agentsHint', "Each agent lists, on its own, the decisions an analyst faces in answering the question and the defensible options of each, with the reason for each option. Different models propose more varied options than one model several times. Each run is billed by its agent's provider, as any run of the agent is."),
		studyHint: localize('specificationCurve.studyHint', "The sample, the controls and the estimator each analyst of the study chose become the options of three decisions; the question, the estimate and the data are the study's. No agent runs."),
		howMany: localize('specificationCurve.howMany', "How Many"),
		proposer: localize('specificationCurve.proposer', "Agent {0}"),
		noCells: localize('specificationCurve.noCells', "No coding agent that can run on its own was found on this computer: install Claude Code, Codex or OpenCode, then open this page again."),
		propose: localize('specificationCurve.propose', "Ask the Agents"),
		takeChoices: localize('specificationCurve.takeChoices', "Take the Study's Choices"),
		agentColumn: localize('specificationCurve.agentColumn', "Agent"),
		agentModel: localize('specificationCurve.agentModel', "Agent and Model"),
		status: localize('specificationCurve.status', "Status"),
		time: localize('specificationCurve.time', "Time"),
		open: localize('specificationCurve.open', "Open"),
		statuses: {
			waiting: localize('specificationCurve.waiting', "Waiting"),
			running: localize('specificationCurve.running', "Running"),
			done: localize('specificationCurve.done', "Done"),
			failed: localize('specificationCurve.failedStatus', "Ended without results"),
			ended: localize('specificationCurve.ended', "Ended without results"),
		},
		exit: localize('specificationCurve.exit', "exit code {0}"),
		decisionsLink: localize('specificationCurve.decisionsLink', "Decisions"),
		code: localize('specificationCurve.code', "Code"),
		terminal: localize('specificationCurve.terminalLink', "Terminal"),
		decision: localize('specificationCurve.decision', "Decision"),
		option: localize('specificationCurve.option', "Option"),
		proposedBy: localize('specificationCurve.proposedBy', "Proposed By"),
		keep: localize('specificationCurve.keep', "Keep"),
		keptHint: localize('specificationCurve.keptHint', "Untick an option you would not defend before other researchers, or one that says the same as another; hover an option for the reasons given. Every specification is one option of each decision kept."),
		count: localize('specificationCurve.countText', "{0} specifications"),
		tooMany: localize('specificationCurve.tooManyText', "More than {0}: keep fewer options.", MAX_SPECIFICATIONS),
		noProposals: localize('specificationCurve.noProposals', "The decisions show here once an agent has proposed them."),
		theCode: localize('specificationCurve.theCode', "The Code"),
		codeHint: localize('specificationCurve.codeHint', "One coding agent writes {0}: for each specification, its rows of the data and its estimate and standard error, then runs it on every specification and fixes what fails. A strong model is the safer choice, as the code must handle every option kept.", '<span class="yellow">specification.jl</span>'),
		coder: localize('specificationCurve.coder', "Agent and Model"),
		writeCode: localize('specificationCurve.writeCode', "Write the Code"),
		checked: localize('specificationCurve.checked', "Checked {0}: every one of the {1} specifications ran."),
		checkFailed: localize('specificationCurve.checkFailed', "Checked {0}: {1} of the {2} specifications failed; see check.json in the coder's folder."),
		theCurve: localize('specificationCurve.theCurve', "The Curve"),
		curveHint: localize('specificationCurve.curveHint', "Run Every Specification sends the code to the Julia REPL, which runs each specification in a new Julia process on every thread of this computer and writes {0}. It costs nothing: no agent runs.", '<span class="yellow">curve.json</span>'),
		runCurve: localize('specificationCurve.runCurve', "Run Every Specification"),
		sentCurve: localize('specificationCurve.sentCurve', "Sent to the Julia REPL: the curve shows here once every specification has run."),
		ran: localize('specificationCurve.ran', "Ran {0}."),
		specifications: localize('specificationCurve.specifications', "Specifications"),
		median: localize('specificationCurve.median', "Median Estimate"),
		iqr: localize('specificationCurve.iqr', "Interquartile Range (Q1 to Q3)"),
		range: localize('specificationCurve.range', "Range"),
		sameSign: localize('specificationCurve.sameSign', "Same Sign as the Median"),
		significant: localize('specificationCurve.significant', "Significant, Same Sign"),
		opposite: localize('specificationCurve.opposite', "Significant, Opposite Sign"),
		significantTooltip: localize('specificationCurve.significantTooltip', "The share whose 95% confidence interval leaves out zero, on the side of the median estimate"),
		failedSpecs: localize('specificationCurve.failedSpecs', "{0} specifications failed and are left out: {1}"),
		plotHint: localize('specificationCurve.plotHint', "Above, each specification's estimate and 95% confidence interval, from the lowest estimate to the highest; a filled point is significant at 5%. Below, a mark in each column shows the option of each decision that specification used."),
		matters: localize('specificationCurve.matters', "Which Choices Matter"),
		mattersHint: localize('specificationCurve.mattersHint', "For each option, the specifications that use it: their number, their median estimate and the share significant on the side of the curve's median. An option whose median is far from the others' moves the estimate most."),
		count2: localize('specificationCurve.countColumn', "Specifications"),
		medianColumn: localize('specificationCurve.medianColumn', "Median Estimate"),
		significantColumn: localize('specificationCurve.significantColumn', "Significant"),
		inference: localize('specificationCurve.inference', "Inference Under the Null"),
		inferenceHint: localize('specificationCurve.inferenceHint', "Is the curve's effect more than chance? The test takes each specification's estimate out of its outcome, so that the data have no effect, resamples the rows, within the treated and the untreated, and runs every specification on each resample. A p-value is the share of resamples whose statistic is at least the one observed. It runs in Julia, and with many specifications and draws it takes minutes."),
		draws: localize('specificationCurve.draws', "Resamples"),
		seed: localize('specificationCurve.seed', "Seed"),
		runNull: localize('specificationCurve.runNull', "Run the Test"),
		sentNull: localize('specificationCurve.sentNull', "Sent to the Julia REPL: the test shows here once every resample has run."),
		statistic: localize('specificationCurve.statistic', "Statistic"),
		observed: localize('specificationCurve.observed', "Observed"),
		underNull: localize('specificationCurve.underNull', "Median Under the Null"),
		pValue: localize('specificationCurve.pValue', "p-Value"),
		statMedian: localize('specificationCurve.statMedian', "Median estimate"),
		statShare: localize('specificationCurve.statShare', "Share significant, same sign"),
		statStouffer: localize('specificationCurve.statStouffer', "Stouffer's Z"),
		statStoufferTooltip: localize('specificationCurve.statStoufferTooltip', "The sum of the specifications' z values, each estimate over its standard error, divided by the square root of their number"),
		nullRan: localize('specificationCurve.nullRan', "Ran {0}: {1} of {2} resamples, seed {3}. The statistics are taken on the side of the median estimate."),
		pBelow: localize('specificationCurve.pBelow', "below {0}"),
		needCurve: localize('specificationCurve.needCurve', "Run the curve first."),
	};
	return buildWebviewHtml({
		title: localize('specificationCurve.title', "Specification Curve"),
		introHtml: text.intro,
		omitPoweredBy: !SPECIFICATIONCURVE_METADATA.specificationCurve.packages.length,
		extraCss: `
		${compareCss}
		${orchestrationCss}
		.missing { color: var(--vscode-errorForeground); }
		.sc-decision td { padding-top: 10px; font-weight: 600; }
		.sc-option td:first-child { padding-left: 18px; }
		.sc-reason { cursor: help; }
		.sc-plot { max-width: 1000px; margin: 8px 0 16px 0; }
		.sc-plot text { fill: var(--vscode-foreground); font-size: 11px; font-family: var(--vscode-font-family); }
		.sc-plot .group { font-weight: 600; }
		.sc-plot .axis { stroke: var(--vscode-widget-border); }
		.sc-plot .zero { stroke: var(--vscode-descriptionForeground); stroke-dasharray: 4 3; }
		.sc-plot .interval { stroke: var(--vscode-descriptionForeground); opacity: 0.6; }
		.sc-plot .point { fill: var(--vscode-editor-background); stroke: var(--vscode-foreground); }
		.sc-plot .point.significant { fill: #e8a33d; stroke: #e8a33d; }
		body.vscode-light .sc-plot .point.significant { fill: #a8650d; stroke: #a8650d; }
		.sc-plot .mark { fill: var(--vscode-foreground); }
		.sc-plot .row-line { stroke: var(--vscode-widget-border); opacity: 0.4; }
		#seed { min-width: 6em; width: 6em; }
`,
		steps: [
			{
				id: 'step-question',
				title: text.questionAndData,
				bodyHtml: studyStepHtml(text),
			},
			{
				id: 'step-choices',
				title: text.theChoices,
				bodyHtml: `
		<div class="row choices"><span class="small">${text.source}</span>
			<label><input type="radio" name="source" value="agents" checked> ${text.fromAgents}</label>
			<label><input type="radio" name="source" value="study"> ${text.fromStudy}</label>
			<select id="from"></select>
		</div>
		<div id="agentsFields">
			<p class="hint">${text.agentsHint}</p>
			<div class="row"><span class="small">${text.howMany}</span> <select id="count">${Array.from({ length: MAX_PROPOSERS - MIN_PROPOSERS + 1 }, (_, i) => MIN_PROPOSERS + i).map(n => `<option value="${n}"${n === DEFAULT_PROPOSERS ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
			<div class="analysts" id="proposers"></div>
			<p class="warning" id="noCells" hidden>${text.noCells}</p>
		</div>
		<p class="hint" id="studyHint" hidden>${text.studyHint}</p>
		<p class="warning" id="noManyAnalysts" hidden>${text.noManyAnalysts}</p>
		<div class="settings"><span class="bar"><button class="action current" id="propose">${text.propose}</button></span></div>
		<div class="small status missing" id="proposeProblem"></div>
		<table class="ma" id="proposerTable" hidden>
			<thead><tr><th>${text.agentColumn}</th><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.open}</th></tr></thead>
			<tbody id="proposerRows"></tbody>
		</table>
		<div id="proposals" hidden>
			<p class="hint">${text.keptHint}</p>
			<table class="ma">
				<thead><tr><th>${text.decision} / ${text.option}</th><th>${text.proposedBy}</th><th>${text.keep}</th></tr></thead>
				<tbody id="proposalRows"></tbody>
			</table>
			<p class="small" id="specCount"></p>
		</div>
		<p class="hint" id="noProposals" hidden>${text.noProposals}</p>
`,
			},
			{
				id: 'step-code',
				title: text.theCode,
				bodyHtml: `
		<p class="hint">${text.codeHint}</p>
		<div class="analysts"><span class="small">${text.coder}</span><select id="coder"></select></div>
		<div class="settings"><span class="bar"><button class="action" id="writeCode">${text.writeCode}</button></span></div>
		<div class="small status missing" id="codeProblem"></div>
		<table class="ma" id="coderTable" hidden>
			<thead><tr><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.open}</th></tr></thead>
			<tbody id="coderRows"></tbody>
		</table>
		<p class="small" id="checkStatus"></p>
`,
			},
			{
				id: 'step-curve',
				title: text.theCurve,
				bodyHtml: `
		<p class="hint">${text.curveHint}</p>
		<div class="settings"><span class="bar"><button class="action" id="runCurve">${text.runCurve}</button></span></div>
		<div class="small status" id="curveStatus"></div>
		<div id="curve" hidden>
			<div id="figures"></div>
			<p class="hint">${text.plotHint}</p>
			<div class="sc-plot" id="plot"></div>
			<h3 class="part">${text.matters}</h3>
			<p class="hint">${text.mattersHint}</p>
			<table class="ma">
				<thead><tr><th>${text.decision} / ${text.option}</th><th class="number">${text.count2}</th><th class="number">${text.medianColumn}</th><th class="number">${text.significantColumn}</th></tr></thead>
				<tbody id="matterRows"></tbody>
			</table>
		</div>
`,
			},
			{
				id: 'step-null',
				title: text.inference,
				bodyHtml: `
		<p class="hint">${text.inferenceHint}</p>
		<div class="row"><span class="small">${text.draws}</span> <select id="draws">${DRAWS.map(n => `<option value="${n}"${n === DEFAULT_DRAWS ? ' selected' : ''}>${n}</option>`).join('')}</select>
			<span class="small">${text.seed}</span> <input type="text" id="seed" value="1" spellcheck="false"></div>
		<div class="settings"><span class="bar"><button class="action" id="runNull">${text.runNull}</button></span></div>
		<div class="small status" id="nullStatus"></div>
		<table class="ma" id="nullTable" hidden>
			<thead><tr><th>${text.statistic}</th><th class="number">${text.observed}</th><th class="number">${text.underNull}</th><th class="number">${text.pValue}</th></tr></thead>
			<tbody id="nullRows"></tbody>
		</table>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const DEFAULT_PROPOSERS = ${DEFAULT_PROPOSERS};
	const MAX_SPECIFICATIONS = ${MAX_SPECIFICATIONS};
	const nameInput = document.getElementById('name');
	const earlier = document.getElementById('earlier');
	const fileInput = document.getElementById('file');
	const description = document.getElementById('description');
	const question = document.getElementById('question');
	const estimate = document.getElementById('estimate');
	const count = document.getElementById('count');
	const from = document.getElementById('from');
	const proposersBox = document.getElementById('proposers');
	const coderSelect = document.getElementById('coder');
	let state = undefined;
	/** The cell chosen for each proposer, kept when their number changes. */
	let chosen = [];
	/** The options kept, by decision: unticked ones are left out; a new study keeps every option. */
	let unticked = new Set();
	let timer = undefined;
${orchestrationPageJs}
	function sourceKind() {
		const radio = document.querySelector('input[name=source]:checked');
		return radio ? radio.value : 'agents';
	}
	function locked() {
		return !!(state && state.study);
	}
	function optionKey(decision, option) {
		return decision + '/' + option;
	}

	/** The proposers' choices: at first the cells in turn, so that the models differ. */
	function drawProposers() {
		const cells = state ? state.cells : [];
		const n = Number(count.value);
		while (chosen.length < n && cells.length) {
			chosen.push(cellKey(cells[chosen.length % cells.length]));
		}
		proposersBox.innerHTML = '';
		for (let i = 0; i < n; i++) {
			const label = document.createElement('span');
			label.className = 'small';
			label.textContent = TEXT.proposer.replace('{0}', String(i + 1));
			const select = document.createElement('select');
			select.innerHTML = cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
			select.value = chosen[i] || '';
			select.addEventListener('change', () => { chosen[i] = select.value; });
			proposersBox.append(label, select);
		}
		document.getElementById('noCells').hidden = cells.length > 0;
	}
	/** The coder's choice: a strong model when there is one, else the first cell. */
	function drawCoder() {
		const cells = state ? state.cells : [];
		const previous = coderSelect.value;
		coderSelect.innerHTML = cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
		const strong = cells.find(cell => /opus|gpt-5\\.5|argon/i.test(cell.label));
		coderSelect.value = previous && cells.some(cell => cellKey(cell) === previous) ? previous : strong ? cellKey(strong) : (cells[0] ? cellKey(cells[0]) : '');
	}
	function drawSource() {
		const kind = sourceKind();
		const study = state && state.study;
		document.getElementById('agentsFields').hidden = kind !== 'agents' || locked();
		document.getElementById('studyHint').hidden = kind !== 'study';
		from.hidden = kind !== 'study';
		document.getElementById('noManyAnalysts').hidden = kind !== 'study' || locked() || !state || state.manyAnalysts.length > 0;
		document.getElementById('propose').textContent = kind === 'study' ? TEXT.takeChoices : TEXT.propose;
		// Step 1 sets the data only when the agents propose: a study's choices come with its question and data
		for (const id of ['question', 'estimate', 'file', 'description', 'chooseFile']) {
			document.getElementById(id).disabled = locked() || (kind === 'study' && !study);
		}
		for (const radio of document.querySelectorAll('input[name=data]')) {
			radio.disabled = locked() || kind === 'study';
		}
	}

	function inputs() {
		const n = Number(count.value);
		const proposers = chosen.slice(0, n).map(key => state.cells.find(c => cellKey(c) === key)).filter(c => c).map(c => ({ agent: c.agent, model: c.model }));
		return { name: nameInput.value.trim() || nameInput.placeholder, question: question.value, estimate: estimate.value, data: dataKind(), file: fileInput.value, description: description.value, source: sourceKind(), from: from.value, proposers };
	}

	function link(label, agent, what) {
		return '<button class="link" data-agent="' + escapeHtml(agent) + '" data-what="' + what + '">' + escapeHtml(label) + '</button>';
	}
	function runRow(run, first, fileLink) {
		const status = TEXT.statuses[run.status] + (run.status === 'failed' && typeof run.exitCode === 'number' ? ' (' + TEXT.exit.replace('{0}', run.exitCode) + ')' : '');
		const links = [run.hasFile ? fileLink : '', run.hasTerminal ? link(TEXT.terminal, run.key, 'terminal') : ''].filter(x => x).join('');
		return '<tr>' + first + '<td>' + escapeHtml(run.label) + '</td><td class="status-' + run.status + '">' + escapeHtml(status) + '</td><td class="number" data-run="' + escapeHtml(run.key) + '">' + elapsed(run) + '</td><td class="links">' + links + '</td></tr>';
	}
	function allRuns(study) {
		return study ? [...study.proposers, ...(study.coder ? [study.coder] : [])] : [];
	}
	function drawRuns() {
		const study = state.study;
		const proposers = study ? study.proposers : [];
		document.getElementById('proposerTable').hidden = !proposers.length;
		document.getElementById('proposerRows').innerHTML = proposers.map((run, i) => runRow(run, '<td>' + (i + 1) + '</td>', link(TEXT.decisionsLink, run.key, 'decisions'))).join('');
		document.getElementById('coderTable').hidden = !(study && study.coder);
		document.getElementById('coderRows').innerHTML = study && study.coder ? runRow(study.coder, '', link(TEXT.code, study.coder.key, 'code')) : '';
		clearInterval(timer);
		if (allRuns(study).some(run => run.status === 'running')) {
			timer = setInterval(() => {
				for (const cell of document.querySelectorAll('td[data-run]')) {
					const run = allRuns(state.study).find(r => r.key === cell.dataset.run);
					cell.textContent = run ? elapsed(run) : '';
				}
			}, 1000);
		}
	}

	/** The decisions proposed, each option with a tick box, or the options kept once the code was asked for. */
	function drawProposals() {
		const study = state.study;
		const decisions = study ? (study.kept || study.proposals) : [];
		document.getElementById('proposals').hidden = !decisions.length;
		document.getElementById('noProposals').hidden = !study || decisions.length > 0;
		const frozen = !!(study && study.kept);
		document.getElementById('proposalRows').innerHTML = decisions.map(decision =>
			'<tr class="sc-decision"><td colspan="3">' + escapeHtml(decision.label) + '</td></tr>' + decision.options.map(option => {
				const key = optionKey(decision.id, option.id);
				const reasons = option.reasons.join(' / ');
				return '<tr class="sc-option"><td' + (reasons ? ' class="sc-reason" title="' + escapeHtml(reasons) + '"' : '') + '>' + escapeHtml(option.label) + '</td><td class="small">' + escapeHtml(option.proposedBy.join(', ')) + '</td><td><input type="checkbox" data-key="' + escapeHtml(key) + '"' + (frozen || !unticked.has(key) ? ' checked' : '') + (frozen ? ' disabled' : '') + '></td></tr>';
			}).join('')).join('');
		drawCount();
	}
	function keptDecisions() {
		const study = state.study;
		if (!study) {
			return [];
		}
		if (study.kept) {
			return study.kept;
		}
		return study.proposals.map(decision => ({ ...decision, options: decision.options.filter(option => !unticked.has(optionKey(decision.id, option.id))) }));
	}
	function drawCount() {
		const decisions = keptDecisions();
		const total = decisions.length ? decisions.reduce((product, decision) => product * decision.options.length, 1) : 0;
		document.getElementById('specCount').textContent = TEXT.count.replace('{0}', format(total)) + (total > MAX_SPECIFICATIONS ? '. ' + TEXT.tooMany : '');
	}

	function drawCode() {
		const study = state.study;
		const check = study && study.check;
		let text = '';
		if (check && typeof check.specifications === 'number') {
			text = check.failed ? TEXT.checkFailed.replace('{0}', check.checked).replace('{1}', format(check.failed)).replace('{2}', format(check.specifications)) : TEXT.checked.replace('{0}', check.checked).replace('{1}', format(check.specifications));
		}
		document.getElementById('checkStatus').textContent = text;
		coderSelect.disabled = !!(study && study.coder);
		if (study && study.coder) {
			coderSelect.innerHTML = '<option>' + escapeHtml(study.coder.label) + '</option>';
		}
	}

	function figure(label, value, tooltip) {
		return '<div class="ma-figure"' + (tooltip ? ' title="' + escapeHtml(tooltip) + '"' : '') + '><div class="small">' + escapeHtml(label) + '</div><div class="value">' + value + '</div></div>';
	}
	function percent(x) {
		return format(Math.round(x * 1000) / 10) + '%';
	}

	/** The curve: the sorted estimates and their intervals above, the options of each specification below. */
	function plot(curve, decisions) {
		const specs = curve.specifications;
		if (!specs.length) {
			return '';
		}
		const width = 1000, left = 260, right = 16, top = 10, curveHeight = 220, rowHeight = 14, gap = 22;
		const rows = decisions.flatMap(decision => [{ group: decision.label }, ...decision.options.map(option => ({ decision: decision.id, option: option.id, label: option.label }))]);
		const height = top + curveHeight + gap + rows.length * rowHeight + 8;
		let low = Math.min(0, ...specs.map(s => s.estimate - 1.96 * s.std_error));
		let high = Math.max(0, ...specs.map(s => s.estimate + 1.96 * s.std_error));
		if (high === low) {
			high += 1;
			low -= 1;
		}
		const y = v => top + (high - v) / (high - low) * curveHeight;
		const column = (width - left - right) / specs.length;
		const x = i => left + (i + 0.5) * column;
		let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img">';
		const step = Math.pow(10, Math.floor(Math.log10((high - low) / 4)));
		const nice = [1, 2, 5, 10].map(m => m * step).find(s => (high - low) / s <= 6) || step * 10;
		for (let t = Math.ceil(low / nice) * nice; t <= high; t += nice) {
			svg += '<line class="axis" x1="' + (left - 4) + '" x2="' + left + '" y1="' + y(t) + '" y2="' + y(t) + '"></line>';
			svg += '<text x="' + (left - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + format(Number(t.toPrecision(6))) + '</text>';
		}
		svg += '<line class="axis" x1="' + left + '" x2="' + left + '" y1="' + top + '" y2="' + (top + curveHeight) + '"></line>';
		svg += '<line class="zero" x1="' + left + '" x2="' + (width - right) + '" y1="' + y(0) + '" y2="' + y(0) + '"></line>';
		const radius = Math.max(1, Math.min(3, column / 2.5));
		specs.forEach((s, i) => {
			const significant = Math.abs(s.estimate / s.std_error) > 1.96;
			if (column >= 2) {
				svg += '<line class="interval" x1="' + x(i) + '" x2="' + x(i) + '" y1="' + y(s.estimate + 1.96 * s.std_error) + '" y2="' + y(s.estimate - 1.96 * s.std_error) + '"></line>';
			}
			svg += '<circle class="point' + (significant ? ' significant' : '') + '" cx="' + x(i) + '" cy="' + y(s.estimate) + '" r="' + radius + '"></circle>';
		});
		const gridTop = top + curveHeight + gap;
		rows.forEach((row, r) => {
			const rowY = gridTop + r * rowHeight + rowHeight / 2;
			if (row.group) {
				svg += '<text class="group" x="' + (left - 8) + '" y="' + (rowY + 4) + '" text-anchor="end">' + escapeHtml(row.group) + '</text>';
				return;
			}
			const label = row.label.length > 40 ? row.label.slice(0, 39) + '\\u2026' : row.label;
			svg += '<text x="' + (left - 8) + '" y="' + (rowY + 4) + '" text-anchor="end"><title>' + escapeHtml(row.label) + '</title>' + escapeHtml(label) + '</text>';
			svg += '<line class="row-line" x1="' + left + '" x2="' + (width - right) + '" y1="' + rowY + '" y2="' + rowY + '"></line>';
			specs.forEach((s, i) => {
				if (s.choices[row.decision] === row.option) {
					svg += '<rect class="mark" x="' + (x(i) - Math.max(0.5, column * 0.35)) + '" y="' + (rowY - 3) + '" width="' + Math.max(1, column * 0.7) + '" height="6"></rect>';
				}
			});
		});
		return svg + '</svg>';
	}

	/** For each option: its specifications, their median estimate and the share significant on the side of the median. */
	function matters(curve, decisions) {
		const direction = curve.figures ? curve.figures.direction : 1;
		const median = values => {
			const sorted = [...values].sort((a, b) => a - b);
			const position = (sorted.length - 1) / 2;
			return sorted.length ? sorted[Math.floor(position)] + (position - Math.floor(position)) * (sorted[Math.ceil(position)] - sorted[Math.floor(position)]) : undefined;
		};
		return decisions.map(decision =>
			'<tr class="sc-decision"><td colspan="4">' + escapeHtml(decision.label) + '</td></tr>' + decision.options.map(option => {
				const specs = curve.specifications.filter(s => s.choices[decision.id] === option.id);
				const significant = specs.length ? specs.filter(s => direction * s.estimate / s.std_error > 1.96).length / specs.length : undefined;
				return '<tr class="sc-option"><td>' + escapeHtml(option.label) + '</td><td class="number">' + format(specs.length) + '</td><td class="number">' + format(median(specs.map(s => s.estimate))) + '</td><td class="number">' + (significant === undefined ? '' : percent(significant)) + '</td></tr>';
			}).join('')).join('');
	}

	function drawCurve() {
		const study = state.study;
		const curve = study && study.curve;
		document.getElementById('curve').hidden = !curve || !curve.figures;
		const status = document.getElementById('curveStatus');
		if (curve) {
			status.textContent = TEXT.ran.replace('{0}', curve.ran) + (curve.failed ? ' ' + TEXT.failedSpecs.replace('{0}', format(curve.failed)).replace('{1}', curve.firstError) : '');
		} else if (!study) {
			status.textContent = '';
		}
		if (!curve || !curve.figures) {
			return;
		}
		const f = curve.figures;
		document.getElementById('figures').innerHTML = '<div class="ma-figures">' + figure(TEXT.specifications, format(f.count)) + figure(TEXT.median, format(f.median)) + figure(TEXT.iqr, interval(f.q1, f.q3)) + figure(TEXT.range, interval(f.min, f.max)) + figure(TEXT.sameSign, percent(f.sameSign)) + figure(TEXT.significant, percent(f.significant), TEXT.significantTooltip) + figure(TEXT.opposite, percent(f.opposite)) + '</div>';
		const decisions = study.kept || [];
		document.getElementById('plot').innerHTML = plot(curve, decisions);
		document.getElementById('matterRows').innerHTML = matters(curve, decisions);
	}

	function drawNull() {
		const study = state.study;
		const result = study && study['null'];
		document.getElementById('nullTable').hidden = !result;
		const status = document.getElementById('nullStatus');
		if (result) {
			status.textContent = TEXT.nullRan.replace('{0}', result.ran).replace('{1}', format(result.used)).replace('{2}', format(result.draws)).replace('{3}', String(result.seed));
		} else if (!study) {
			status.textContent = '';
		}
		if (!result) {
			return;
		}
		const p = value => typeof value !== 'number' ? '' : value === 0 && result.used ? TEXT.pBelow.replace('{0}', format(1 / result.used)) : format(value);
		const row = (label, stat, show, tooltip) => '<tr><td' + (tooltip ? ' title="' + escapeHtml(tooltip) + '"' : '') + '>' + escapeHtml(label) + '</td><td class="number">' + show(stat.observed) + '</td><td class="number">' + show(stat['null']) + '</td><td class="number">' + p(stat.p) + '</td></tr>';
		document.getElementById('nullRows').innerHTML = row(TEXT.statMedian, result.median, format) + row(TEXT.statShare, result.share, v => typeof v === 'number' ? percent(v) : '') + row(TEXT.statStouffer, result.stouffer, format, TEXT.statStoufferTooltip);
	}

	/** The one blue button is the next thing to do. */
	function drawButtons() {
		const study = state.study;
		const running = allRuns(study).some(run => run.status === 'running');
		const proposalsReady = !!(study && study.proposals.length && !study.proposers.some(run => run.status === 'running'));
		const codeReady = !!(study && study.check && !study.check.failed && study.coder && study.coder.status !== 'running');
		const propose = document.getElementById('propose');
		const writeCode = document.getElementById('writeCode');
		const runCurve = document.getElementById('runCurve');
		const runNull = document.getElementById('runNull');
		propose.disabled = !!study || (sourceKind() === 'agents' ? !state.cells.length : !state.manyAnalysts.length);
		writeCode.disabled = !proposalsReady || !!(study && study.coder) || !state.cells.length;
		runCurve.disabled = !codeReady;
		runNull.disabled = !(study && study.curve && study.curve.figures);
		propose.classList.toggle('current', !study);
		writeCode.classList.toggle('current', proposalsReady && !(study && study.coder) && !running);
		runCurve.classList.toggle('current', codeReady && !(study && study.curve));
		runNull.classList.toggle('current', !!(study && study.curve && study.curve.figures && !study['null']));
	}

	function draw() {
		const study = state.study;
		document.getElementById('root').textContent = state.root;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlierNone) + '</option>' + state.studies.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = study ? study.name : '';
		const previousFrom = from.value;
		from.innerHTML = '<option value="">' + escapeHtml(TEXT.studyNone) + '</option>' + state.manyAnalysts.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		from.value = study && study.source === 'study' ? study.from : previousFrom;
		document.getElementById('newStudy').hidden = !study;
		nameInput.disabled = !!study;
		count.disabled = !!study;
		from.disabled = !!study;
		for (const radio of document.querySelectorAll('input[name=source]')) {
			radio.disabled = !!study;
		}
		if (study) {
			nameInput.value = study.name;
			question.value = study.question;
			estimate.value = study.estimate;
			fileInput.value = study.file;
			description.value = study.description;
			for (const radio of document.querySelectorAll('input[name=data]')) {
				radio.checked = radio.value === study.data;
			}
			for (const radio of document.querySelectorAll('input[name=source]')) {
				radio.checked = radio.value === study.source;
			}
		} else {
			nameInput.value = '';
			nameInput.placeholder = state.suggestion;
			drawProposers();
		}
		drawCoder();
		drawData();
		drawSource();
		drawRuns();
		drawProposals();
		drawCode();
		drawCurve();
		drawNull();
		drawButtons();
	}

	nameInput.addEventListener('input', () => { document.getElementById('proposeProblem').textContent = ''; });
	for (const radio of document.querySelectorAll('input[name=data]')) {
		radio.addEventListener('change', drawData);
	}
	for (const radio of document.querySelectorAll('input[name=source]')) {
		radio.addEventListener('change', () => { drawSource(); drawButtons(); });
	}
	count.addEventListener('change', drawProposers);
	earlier.addEventListener('change', () => {
		unticked = new Set();
		vscode.postMessage(earlier.value ? { command: 'load', name: earlier.value } : { command: 'newStudy' });
	});
	document.getElementById('newStudy').addEventListener('click', () => { unticked = new Set(); vscode.postMessage({ command: 'newStudy' }); });
	document.getElementById('chooseFile').addEventListener('click', () => vscode.postMessage({ command: 'chooseFile', value: fileInput.value }));
	document.getElementById('propose').addEventListener('click', () => {
		document.getElementById('proposeProblem').textContent = '';
		vscode.postMessage({ command: 'propose', inputs: inputs() });
	});
	document.getElementById('proposalRows').addEventListener('change', event => {
		const box = event.target.closest('input[data-key]');
		if (box) {
			if (box.checked) {
				unticked.delete(box.dataset.key);
			} else {
				unticked.add(box.dataset.key);
			}
			drawCount();
		}
	});
	document.getElementById('writeCode').addEventListener('click', () => {
		document.getElementById('codeProblem').textContent = '';
		const kept = {};
		for (const decision of keptDecisions()) {
			kept[decision.id] = decision.options.map(option => option.id);
		}
		const cell = state.cells.find(c => cellKey(c) === coderSelect.value);
		vscode.postMessage({ command: 'writeCode', kept, coder: cell ? { agent: cell.agent, model: cell.model } : {} });
	});
	document.getElementById('runCurve').addEventListener('click', () => vscode.postMessage({ command: 'runCurve' }));
	document.getElementById('runNull').addEventListener('click', () => {
		const seed = Math.max(0, Math.floor(Number(document.getElementById('seed').value) || 0));
		vscode.postMessage({ command: 'runNull', draws: Number(document.getElementById('draws').value), seed });
	});
	document.body.addEventListener('click', event => {
		const target = event.target.closest('button[data-what]');
		if (target) {
			vscode.postMessage({ command: 'open', agent: target.dataset.agent, what: target.dataset.what });
		}
	});

	question.value = TEXT.exampleQuestion;
	estimate.value = TEXT.exampleEstimate;
	count.value = String(DEFAULT_PROPOSERS);
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const wasLocked = locked();
			state = message;
			if (wasLocked && !state.study) {
				question.value = TEXT.exampleQuestion;
				estimate.value = TEXT.exampleEstimate;
				fileInput.value = '';
				description.value = '';
				count.value = String(DEFAULT_PROPOSERS);
				for (const radio of document.querySelectorAll('input[name=data]')) {
					radio.checked = radio.value === 'example';
				}
			}
			draw();
		} else if (message.command === 'file') {
			fileInput.value = message.value;
		} else if (message.command === 'problem') {
			document.getElementById(message.step === 'code' ? 'codeProblem' : 'proposeProblem').textContent = message.text;
		} else if (message.command === 'sent') {
			document.getElementById(message.step === 'null' ? 'nullStatus' : 'curveStatus').textContent = message.step === 'null' ? TEXT.sentNull : TEXT.sentCurve;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: SPECIFICATION_CURVE_COMMAND_ID, title: localize2('specificationCurve.action', "Specification Curve..."), category: localize2('orchestration.category', "Orchestration"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openSpecificationCurvePage(accessor);
	}
});
