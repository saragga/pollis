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
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { AGENTFORECASTING_METADATA } from '../../model/browser/webviews/agentForecasting.data.js';
import { sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss } from '../../model/browser/webviews/webviewPager.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { COMPETITIONS } from './forecastingCompetitionsPage.js';
import { freeStudyName, IOrchestrationCell, JULIA_TO_JSON, orchestrationCss, orchestrationPageJs, startStudyAgent, stopAgentRun, studiesFolder, studyStepText, StudyRuns, tomlString, unattendedCells, validStudyName } from './orchestration.js';
import { pollisJlPath, skillFile } from './pollisAgents.js';

// Agents' Forecasting Competition, from Compose > Orchestration (compose.contribution.ts): several coding agents each write a
// forecasting method for the same series of an M competition, on their own, from the part of the series the
// competition's forecasters saw; Pollis runs every method, scores it on the part held back as the organisers scored
// the entries, and scores the mean and the median of the agents' forecasts beside them and the benchmarks. A page of
// the scaffold in the Time Arrow style, in four steps: 1, Competition (M1, M3 or M4, a frequency, all its series or
// a sample with a seed; Prepare the Series writes the part seen into the study's data); 2, Agents; 3, Runs, each
// agent with the skill forecast-independently; 4, Scores. A study is a folder, orchestration/forecasting-competition/
// <study> of the Pollis Workspace: study.toml, prepared.toml and data/ (series.csv, README.md), written by
// Prepare the Series; agent-1 to agent-N, each with its SKILL.md, TASK.md, data/, check.jl (written by Pollis),
// method.jl and REPORT.md; then score.jl and results.json.

export const AGENT_FORECASTING_COMMAND_ID = 'pollis.orchestration.forecastingCompetition';

const KIND = 'forecasting-competition';
const SKILL = 'forecast-independently';
const STUDY_FILE = 'study.toml';
const PREPARED_FILE = 'prepared.toml';
const METHOD_FILE = 'method.jl';
const REPORT_FILE = 'REPORT.md';
const CHECK_FILE = 'check.jl';
const SCORE_FILE = 'score.jl';
const RESULTS_FILE = 'results.json';
const MIN_AGENTS = 2;
const MAX_AGENTS = 8;
const DEFAULT_AGENTS = 4;
const DEFAULT_SAMPLE = 300;

/** The competitions the agents can compete on: those of series forecast point by point that can be sampled, M1, M3 and M4. */
const CHOICES = COMPETITIONS.filter(competition => competition.method === 'forecast' && competition.sampling);

/** What the user sets in step 1. */
interface IStudyInputs {
	readonly name: string;
	readonly competition: string;
	readonly frequency: string;
	/** The number of series of the sample, or 0 for all the series of the frequency. */
	readonly sample: number;
	readonly seed: number;
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
	readonly agents: readonly IAgentEntry[];
}

/** The runs of the agents of every study started since Pollis started. */
const runs = new StudyRuns();

type AgentForecastingMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'prepare'; readonly inputs: IStudyInputs }
	| { readonly command: 'start'; readonly agents: readonly { readonly agent: string; readonly model: string }[] }
	| { readonly command: 'score' }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newStudy' }
	| { readonly command: 'open'; readonly agent: string; readonly what: 'method' | 'report' | 'terminal' | 'stop' }
	| { readonly command: 'restart'; readonly agent: number; readonly cell: { readonly agent: string; readonly model: string } };

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

/** The cells of the page's messages, checked. */
function checkedCells(value: unknown): { agent: string; model: string }[] {
	return Array.isArray(value) ? value.filter((cell): cell is { agent: string; model: string } => typeof cell?.agent === 'string' && typeof cell?.model === 'string').map(cell => ({ agent: cell.agent, model: cell.model })) : [];
}

/** The inputs of step 1 as the page sent them, checked: a competition and frequency the page offers, a sample and seed from 0. */
function checkedInputs(value: unknown): IStudyInputs | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const { name, competition, frequency, sample, seed } = value as Record<string, unknown>;
	const known = CHOICES.find(choice => choice.id === competition);
	if (typeof name !== 'string' || !known || typeof frequency !== 'string' || !known.frequencies.some(f => f.name === frequency)
		|| typeof sample !== 'number' || !Number.isInteger(sample) || sample < 0 || typeof seed !== 'number' || !Number.isInteger(seed) || seed < 0) {
		return undefined;
	}
	return { name: name.trim(), competition: known.id, frequency, sample, seed };
}

function studyToml(study: IStudy): string {
	const lines = [
		'# Agents\' Forecasting Competition: a study of Compose > Orchestration in Pollis',
		`competition = ${tomlString(study.competition)}`,
		`frequency = ${tomlString(study.frequency)}`,
		`sample = ${study.sample}`,
		`seed = ${study.seed}`,
		`created = ${tomlString(study.created)}`,
	];
	for (const agent of study.agents) {
		lines.push('', '[[agents]]', `agent = ${tomlString(agent.agent)}`, `model = ${tomlString(agent.model)}`, `label = ${tomlString(agent.label)}`);
	}
	return lines.join('\n') + '\n';
}

async function readStudy(fileService: IFileService, folder: URI): Promise<IStudy | undefined> {
	try {
		const toml = parseToml((await fileService.readFile(joinPath(folder, STUDY_FILE))).value.toString());
		const text = (key: string) => typeof toml[key] === 'string' ? toml[key] as string : '';
		const number = (key: string) => typeof toml[key] === 'number' ? toml[key] as number : 0;
		const agents: IAgentEntry[] = [];
		for (const entry of Array.isArray(toml.agents) ? toml.agents as Record<string, unknown>[] : []) {
			if (typeof entry?.agent === 'string' && typeof entry.model === 'string') {
				agents.push({ agent: entry.agent, model: entry.model, label: typeof entry.label === 'string' ? entry.label : entry.agent });
			}
		}
		return { folder, name: basename(folder), competition: text('competition'), frequency: text('frequency'), sample: number('sample'), seed: number('seed'), created: text('created'), agents };
	} catch {
		return undefined;
	}
}

/** The competition's name, as step 1 shows it. */
function competitionName(id: string): string {
	return CHOICES.find(choice => choice.id === id)?.name ?? id;
}

/** What data/README.md says of series.csv: the competition, the frequency and the columns. */
function dataReadme(study: IStudy, series: number): string {
	return [
		localize('agentForecasting.readme.title', "# The Series"),
		'',
		localize('agentForecasting.readme.what', "The {0} series of {1}, frequency {2}: for each, the values its forecasters saw. The values to forecast come after them, and are not here.", series, competitionName(study.competition), study.frequency),
		'',
		localize('agentForecasting.readme.columns', "`series.csv` has a row for each value, the values of a series in order:"),
		'',
		localize('agentForecasting.readme.series', "- `series`: the series' name, as the competition names it"),
		localize('agentForecasting.readme.period', "- `period`: its seasonal period, 1 for none"),
		localize('agentForecasting.readme.horizon', "- `horizon`: how many values ahead to forecast"),
		localize('agentForecasting.readme.t', "- `t`: the value's place in the series, from 1"),
		localize('agentForecasting.readme.value', "- `value`: the value"),
		'',
	].join('\n');
}

/** An agent's task, as it reads it in TASK.md. */
function taskText(study: IStudy, agents: number, series: number, horizon: number): string {
	return [
		localize('agentForecasting.task.title', "# Your Task"),
		'',
		localize('agentForecasting.task.intro', "You are one of {0} agents who each write, on their own, a forecasting method for the same series. Pollis runs every method on the series, scores its forecasts on the values that come after the ones you have, as the organisers of {1} scored its entries, and compares the methods. Follow SKILL.md, in this folder.", agents, competitionName(study.competition)),
		'',
		localize('agentForecasting.task.series', "## The Series"),
		'',
		localize('agentForecasting.task.seriesText', "{0} series of {1}, frequency {2}, each to be forecast {3} values ahead, in `data/series.csv`; `data/README.md` says what its columns are.", series, competitionName(study.competition), study.frequency, horizon),
		'',
		localize('agentForecasting.task.julia', "## Running Julia"),
		'',
		localize('agentForecasting.task.juliaText', "Run Julia with the command below, which gives Julia the packages of Pollis. To check your method on every series as Pollis will run it, run `check.jl`, in this folder:"),
		'',
		'```sh',
		`julia --threads=auto -L "${pollisJlPath()}" check.jl`,
		'```',
		'',
	].join('\n');
}

/** The Julia the REPL runs for Prepare the Series: the part of the series the forecasters saw, into data/series.csv. */
function prepareCode(study: IStudy): string {
	return String.raw`# Agents' Forecasting Competition: the series of the study, the values their forecasters saw, into data/series.csv
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC, Random
let study = raw"${study.folder.fsPath}", id = "${study.competition}", frequency = "${study.frequency}", sample = ${study.sample}, seed = ${study.seed}
	isfile(joinpath(PC.HOME, id, "info.toml")) || PC.download(id)
	id == "m4" && PC.download_forecasts("m4"; entries = ["Naive2"])
	isdefined(Main, :PollisDB) && Base.invokelatest(Main.PollisDB.build_competitions)
	known = PC.series(id; frequency)
	numbers = collect(known.series)
	whole = sample <= 0 || sample >= length(numbers)
	whole || (numbers = sort(Random.shuffle(Random.Xoshiro(seed), numbers)[1:sample]))
	name, period, horizon = Dict(zip(known.series, known.name)), Dict(zip(known.series, known.period)), Dict(zip(known.series, known.horizon))
	# Only the values the forecasters saw: the held-out part stays with PollisCompetitions
	seen = PC.observations(id; series = whole ? nothing : numbers, frequency = whole ? frequency : nothing, split = "train")
	mkpath(joinpath(study, "data"))
	open(joinpath(study, "data", "series.csv"), "w") do io
		println(io, "series,period,horizon,t,value")
		for (s, t, v) in zip(seen.series, seen.t, seen.value)
			println(io, replace(string(name[s]), ',' => ';'), ",", period[s], ",", horizon[s], ",", t, ",", repr(Float64(v)))
		end
	end
	open(joinpath(study, "${PREPARED_FILE}"), "w") do io
		println(io, "series = ", length(numbers))
		println(io, "horizon = ", horizon[numbers[1]])
		println(io, "numbers = [", join(numbers, ", "), "]")
	end
	println("Agents' Forecasting Competition: ", length(numbers), " series in ", joinpath(study, "data", "series.csv"))
end`;
}

/** The Julia file each agent runs to check its method on every series, as the scoring runs it. */
function checkCode(): string {
	return String.raw`# Agents' Forecasting Competition: written by Pollis. Runs forecast(y, h, period) of method.jl on every series of
# data/series.csv, over the threads of Julia, as Pollis will when it scores the method, and prints each series it
# fails on and the time it took. Run it from this folder:
#   julia --threads=auto -L Pollis.jl check.jl
let folder = @__DIR__
	names, periods, horizons, values = String[], Int[], Int[], Vector{Float64}[]
	for line in Iterators.drop(eachline(joinpath(folder, "data", "series.csv")), 1)
		s, p, h, _, v = split(line, ',')
		if isempty(names) || names[end] != s
			push!(names, s)
			push!(periods, parse(Int, p))
			push!(horizons, parse(Int, h))
			push!(values, Float64[])
		end
		push!(values[end], parse(Float64, v))
	end
	method = Module(:Method)
	Core.eval(method, :(const Pollis = Main.Pollis))
	Base.include(method, joinpath(folder, "method.jl"))
	isdefined(method, :forecast) || error("method.jl defines no function forecast(y, h, period)")
	forecast = getfield(method, :forecast)
	failed = fill("", length(names))
	started = time()
	Threads.@threads for k in eachindex(names)
		try
			f = Float64.(collect(Base.invokelatest(forecast, values[k], horizons[k], periods[k])))
			length(f) == horizons[k] || error("forecast gave $(length(f)) values, not $(horizons[k])")
			all(isfinite, f) || error("forecast gave values that are not finite")
		catch err
			failed[k] = sprint(showerror, err)
		end
	end
	seconds = round(time() - started; digits = 1)
	bad = findall(!isempty, failed)
	for k in bad[1:min(end, 20)]
		println("FAILED ", names[k], ": ", failed[k])
	end
	println(isempty(bad) ? "Every one of the $(length(names)) series was forecast, in $seconds s on $(Threads.nthreads()) threads." : "$(length(bad)) of the $(length(names)) series failed.")
end
`;
}

/**
 * The Julia file that scores the study, written into its folder: each agent's method.jl run on the series, as
 * check.jl runs it; its forecasts scored with PollisCompetitions as the organisers scored the entries; the mean and
 * the median of the forecasts of the agents that forecast every series; the benchmarks on the same series; and, for
 * all the series of a frequency of M4, the place of each among the entries; into results.json.
 */
function scoreCode(): string {
	return String.raw`# Agents' Forecasting Competition: written by Pollis. Runs the method.jl of each agent on the series of the study, scores
# the forecasts on the values held back, as the organisers scored the entries, beside the mean and the median of the
# agents' forecasts and the benchmarks, into results.json. Run it from this folder:
#   julia --threads=auto -L Pollis.jl score.jl
import PollisCompetitions as PC, Statistics, TOML
let study = @__DIR__
${JULIA_TO_JSON}
	settings = TOML.parsefile(joinpath(study, "${STUDY_FILE}"))
	prepared = TOML.parsefile(joinpath(study, "${PREPARED_FILE}"))
	id, frequency = settings["competition"], settings["frequency"]
	numbers = Int.(prepared["numbers"])
	known = PC.series(id; frequency)
	period, horizon = Dict(zip(known.series, known.period)), Dict(zip(known.series, known.horizon))
	whole = length(numbers) == length(known.series)
	seen = PC.observations(id; series = whole ? nothing : numbers, frequency = whole ? frequency : nothing, split = "train")
	n = length(numbers)
	starts = [searchsortedfirst(seen.series, number) for number in numbers]
	stops = [k == n ? length(seen.series) : starts[k + 1] - 1 for k in 1:n]
	past(k) = Float64.(seen.value[starts[k]:stops[k]])
	measures = ["sMAPE", "MASE", "OWA"]
	pick(scores) = Dict(m => only(scores.value[(scores.measure .== m) .& (scores.breakdown .== "frequency") .& (scores.level .== frequency)]) for m in measures)
	as_table(forecasts) = (; series = reduce(vcat, [fill(numbers[k], length(forecasts[k])) for k in 1:n]), h = reduce(vcat, [collect(eachindex(f)) for f in forecasts]), value = reduce(vcat, forecasts))
	agents = sort([parse(Int, m.captures[1]) for m in filter(!isnothing, match.(r"^agent-(\d+)$", readdir(study)))])
	rows = Dict{String, Any}[]
	complete = Vector{Vector{Float64}}[]
	for a in agents
		folder = joinpath(study, "agent-$a")
		row = Dict{String, Any}("name" => "agent-$a", "kind" => "agent", "agent" => a)
		push!(rows, row)
		file = joinpath(folder, "${METHOD_FILE}")
		if !isfile(file)
			row["error"] = "no method.jl"
			continue
		end
		println("Agent $a: forecasting $n series")
		started = time()
		failed = fill("", n)
		forecasts = Vector{Vector{Float64}}(undef, n)
		try
			method = Module(Symbol("Agent", a))
			Core.eval(method, :(const Pollis = Main.Pollis))
			cd(() -> Base.include(method, file), folder)
			isdefined(method, :forecast) || error("method.jl defines no function forecast(y, h, period)")
			forecast = getfield(method, :forecast)
			Threads.@threads for k in 1:n
				h = horizon[numbers[k]]
				try
					f = Float64.(collect(Base.invokelatest(forecast, past(k), h, period[numbers[k]])))
					length(f) == h || error("forecast gave $(length(f)) values, not $h")
					all(isfinite, f) || error("forecast gave values that are not finite")
					forecasts[k] = f
				catch err
					failed[k] = sprint(showerror, err)
				end
			end
		catch err
			row["error"] = sprint(showerror, err)
			continue
		end
		row["seconds"] = time() - started
		bad = findall(!isempty, failed)
		row["failed"] = length(bad)
		if !isempty(bad)
			row["error"] = failed[bad[1]]
			continue
		end
		row["scores"] = pick(PC.score(id, as_table(forecasts)))
		push!(complete, forecasts)
	end
	# The mean and the median of the forecasts of the agents that forecast every series, series by series and step by step
	if length(complete) >= 2
		for (label, combine) in (("mean", Statistics.mean), ("median", Statistics.median))
			combined = [[combine(f[k][j] for f in complete) for j in eachindex(complete[1][k])] for k in 1:n]
			push!(rows, Dict("name" => label, "kind" => "combination", "agents" => length(complete), "scores" => pick(PC.score(id, as_table(combined)))))
		end
	end
	# The benchmarks, on the same series: those of M4 computed with PollisCompetitions.M4Benchmarks, Naive2 for M1 and M3
	println("Computing the benchmarks on the same series")
	if id == "m4"
		computed = PC.benchmarks(id; series = numbers)
		for m in PC.M4_BENCHMARKS
			k = computed.method .== m
			push!(rows, Dict("name" => m, "kind" => "benchmark", "scores" => pick(PC.score(id, (; series = computed.series[k], h = computed.h[k], value = computed.value[k])))))
		end
	else
		naive2 = [PC.naive2(past(k), period[numbers[k]], horizon[numbers[k]]) for k in 1:n]
		push!(rows, Dict("name" => "Naive2", "kind" => "benchmark", "scores" => pick(PC.score(id, as_table(naive2)))))
	end
	# For all the series of a frequency of M4: the place of each among the published OWA of the entries
	entries = nothing
	if id == "m4" && whole
		published = PC.published_scores(id; measure = "OWA", breakdown = "frequency")
		owa = [published.value[i] for i in eachindex(published.value) if published.level[i] == frequency]
		entries = length(owa)
		for row in rows
			haskey(row, "scores") && (row["place"] = 1 + count(<(row["scores"]["OWA"]), owa))
		end
	end
	write(joinpath(study, "${RESULTS_FILE}"), to_json(Dict("finished" => Libc.strftime("%Y-%m-%d %H:%M", time()), "series" => n, "whole" => whole, "entries" => entries, "rows" => rows)))
	println("The scores are in ", joinpath(study, "${RESULTS_FILE}"))
end
`;
}

/** The Julia code the REPL runs to score: score.jl in a new Julia process, on the threads of this computer. */
function runScoreCode(study: IStudy): string {
	return String.raw`# Agents' Forecasting Competition: every agent's method run on the series and scored, in a new Julia process
let dir = raw"${study.folder.fsPath}", pollis = raw"${pollisJlPath()}"
	command = Cmd(Cmd([Base.julia_cmd().exec; "--threads=auto"; "-L"; pollis; "${SCORE_FILE}"]); dir = dir)
	success(command) || println("Agents' Forecasting Competition: score.jl did not finish, see the messages above")
end`;
}

/** A finite number of a parsed JSON value, else undefined. */
function finite(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** The rows of results.json, checked. */
function resultsOf(json: Record<string, unknown>) {
	const rows = [];
	for (const row of Array.isArray(json.rows) ? json.rows as Record<string, unknown>[] : []) {
		if (!row || typeof row.name !== 'string' || typeof row.kind !== 'string') {
			continue;
		}
		const scores = row.scores && typeof row.scores === 'object' ? row.scores as Record<string, unknown> : undefined;
		rows.push({
			name: row.name,
			kind: row.kind,
			agent: finite(row.agent),
			agents: finite(row.agents),
			scores: scores ? { sMAPE: finite(scores.sMAPE), MASE: finite(scores.MASE), OWA: finite(scores.OWA) } : undefined,
			place: finite(row.place),
			failed: finite(row.failed),
			error: typeof row.error === 'string' ? row.error : undefined,
			seconds: finite(row.seconds),
		});
	}
	return { finished: typeof json.finished === 'string' ? json.finished : '', series: finite(json.series), entries: finite(json.entries), rows };
}

/** Opens the Agents' Forecasting Competition page, or shows it when it is open. */
async function openAgentForecastingPage(accessor: ServicesAccessor): Promise<void> {
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
	const launchServices = { terminalService, terminalInstanceService, fileService, commandService, progressService, workspaceContextService: contextService, pathService };

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('agentForecasting.title', "Agents' Forecasting Competition");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.agentForecasting',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'agentForecasting', title, AGENTFORECASTING_METADATA.agentForecasting, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The study shown in steps 2 to 4, once prepared or opened; its folders are watched. */
	let current: IStudy | undefined;
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	runs.onEnded = () => refresh.schedule();
	const home = await pathService.userHome({ preferLocal: true });

	const watch = (study: IStudy | undefined) => {
		current = study;
		if (!study) {
			watcher.clear();
			return;
		}
		const store = new DisposableStore();
		for (const folder of [study.folder, ...study.agents.map((_, index) => joinPath(study.folder, `agent-${index + 1}`))]) {
			const fileWatcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			store.add(fileWatcher.onDidChange(() => refresh.schedule()));
		}
		watcher.value = store;
	};

	/** The series prepared: their number and horizon, once Prepare the Series has written them. */
	const preparedOf = async (study: IStudy) => {
		try {
			const toml = parseToml((await fileService.readFile(joinPath(study.folder, PREPARED_FILE))).value.toString());
			return typeof toml.series === 'number' && typeof toml.horizon === 'number' ? { series: toml.series, horizon: toml.horizon } : undefined;
		} catch {
			return undefined;
		}
	};

	const resultsState = async (study: IStudy) => {
		try {
			const json = JSON.parse((await fileService.readFile(joinPath(study.folder, RESULTS_FILE))).value.toString());
			return json && typeof json === 'object' ? resultsOf(json) : undefined;
		} catch {
			return undefined;
		}
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

	let cells: IOrchestrationCell[] = [];
	const sendState = async () => {
		const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
		const studies = await studyNames(root);
		const downloaded = await Promise.all(CHOICES.map(choice => fileService.exists(joinPath(home, '.pollis', 'competitions', choice.id, 'info.toml'))));
		const study = current && await readStudy(fileService, current.folder);
		post({
			command: 'state',
			root: root.fsPath,
			studies,
			cells,
			downloaded: Object.fromEntries(CHOICES.map((choice, index) => [choice.id, downloaded[index]])),
			suggestion: freeStudyName('m4-monthly', studies),
			study: study && {
				name: study.name,
				competition: study.competition,
				frequency: study.frequency,
				sample: study.sample,
				seed: study.seed,
				prepared: await preparedOf(study),
				agents: await Promise.all(study.agents.map(async (entry, index) => ({ ...await runs.state(fileService, study.folder, `agent-${index + 1}`, entry.label, METHOD_FILE), agent: entry.agent, model: entry.model }))),
				results: await resultsState(study),
			},
		});
	};

	/** Writes the study's folder, then sends the code that writes the series to the Julia REPL. */
	const prepare = async (inputs: IStudyInputs) => {
		const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
		if (!validStudyName(inputs.name)) {
			post({ command: 'problem', step: 'prepare', text: localize('agentForecasting.badName', "The study's name is its folder's: letters, digits, hyphens and underscores, starting with a letter or digit.") });
			return;
		}
		if (await fileService.exists(joinPath(root, inputs.name))) {
			post({ command: 'problem', step: 'prepare', text: localize('agentForecasting.taken', "There is a study {0} already: open it from the list, or give the new one another name.", inputs.name) });
			return;
		}
		const study: IStudy = { ...inputs, folder: joinPath(root, inputs.name), created: new Date().toISOString().slice(0, 16).replace('T', ' '), agents: [] };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(study)));
		watch(study);
		await sendToJuliaRepl(prepareCode(study), commandService);
		post({ command: 'sent', step: 'prepare' });
		await sendState();
	};

	/** Starts every agent at once, each in its folder with the skill, its task, the series and check.jl. */
	const start = async (chosen: { agent: string; model: string }[]) => {
		const study = current && await readStudy(fileService, current.folder);
		const prepared = study && await preparedOf(study);
		if (!study || !prepared) {
			return;
		}
		if (chosen.length < MIN_AGENTS || chosen.length > MAX_AGENTS) {
			post({ command: 'problem', step: 'start', text: localize('agentForecasting.count', "From {0} to {1} agents compete.", MIN_AGENTS, MAX_AGENTS) });
			return;
		}
		const agents = chosen.map(cell => cells.find(other => other.agent === cell.agent && other.model === cell.model));
		if (agents.some(cell => !cell)) {
			post({ command: 'problem', step: 'start', text: localize('agentForecasting.noCell', "Choose an agent and a model for every agent.") });
			return;
		}
		const skill = await instantiationService.invokeFunction(skillFile, SKILL);
		if (!skill || !await fileService.exists(skill)) {
			post({ command: 'problem', step: 'start', text: localize('agentForecasting.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", SKILL) });
			return;
		}
		const withAgents: IStudy = { ...study, agents: agents.map(cell => ({ agent: cell!.agent, model: cell!.model, label: cell!.label })) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withAgents)));
		await fileService.writeFile(joinPath(study.folder, 'data', 'README.md'), VSBuffer.fromString(dataReadme(withAgents, prepared.series)));
		watch(withAgents);
		const task = taskText(withAgents, withAgents.agents.length, prepared.series, prepared.horizon);
		for (const [index, entry] of withAgents.agents.entries()) {
			const key = `agent-${index + 1}`;
			await fileService.writeFile(joinPath(study.folder, key, CHECK_FILE), VSBuffer.fromString(checkCode()));
			await startStudyAgent(launchServices, configurationService, notificationService, runs, {
				study: study.folder, key, cell: entry, skill, task, data: joinPath(study.folder, 'data'), focus: index === 0,
				terminalName: localize('agentForecasting.terminal', "Agents' Forecasting Competition: {0}, Agent {1} ({2})", study.name, index + 1, entry.label),
			});
		}
		await sendState();
	};

	/**
	 * Starts one agent again, the others left as they are: on the agent and model now chosen for it, in its folder
	 * emptied, its earlier work moved to the Trash.
	 */
	const restart = async (index: number, chosenCell: { agent: string; model: string }) => {
		const study = current && await readStudy(fileService, current.folder);
		const prepared = study && await preparedOf(study);
		if (!study || !prepared || index < 0 || index >= study.agents.length) {
			return;
		}
		const key = `agent-${index + 1}`;
		const run = runs.get(study.folder, key);
		if (run && run.ended === undefined) {
			post({ command: 'problem', step: 'runs', text: localize('agentForecasting.stillRunning', "Agent {0} is running: stop it first, then restart it.", index + 1) });
			return;
		}
		const cell = cells.find(other => other.agent === chosenCell.agent && other.model === chosenCell.model);
		if (!cell) {
			post({ command: 'problem', step: 'runs', text: localize('agentForecasting.noRestartCell', "Choose an agent and a model for Agent {0} in Agents, then restart it.", index + 1) });
			return;
		}
		const skill = await instantiationService.invokeFunction(skillFile, SKILL);
		if (!skill || !await fileService.exists(skill)) {
			post({ command: 'problem', step: 'runs', text: localize('agentForecasting.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", SKILL) });
			return;
		}
		const withAgents: IStudy = { ...study, agents: study.agents.map((entry, i) => i === index ? { agent: cell.agent, model: cell.model, label: cell.label } : entry) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withAgents)));
		const folder = joinPath(study.folder, key);
		if (await fileService.exists(folder)) {
			await fileService.del(folder, { recursive: true, useTrash: true });
		}
		await fileService.writeFile(joinPath(folder, CHECK_FILE), VSBuffer.fromString(checkCode()));
		watch(withAgents);
		await startStudyAgent(launchServices, configurationService, notificationService, runs, {
			study: study.folder, key, cell: withAgents.agents[index], skill, data: joinPath(study.folder, 'data'), focus: true,
			task: taskText(withAgents, withAgents.agents.length, prepared.series, prepared.horizon),
			terminalName: localize('agentForecasting.terminal', "Agents' Forecasting Competition: {0}, Agent {1} ({2})", study.name, index + 1, withAgents.agents[index].label),
		});
		await sendState();
	};

	const score = async () => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		await fileService.writeFile(joinPath(study.folder, SCORE_FILE), VSBuffer.fromString(scoreCode()));
		await sendToJuliaRepl(runScoreCode(study), commandService);
		post({ command: 'sent', step: 'score' });
	};

	const openFile = async (agent: string, what: 'method' | 'report' | 'terminal' | 'stop') => {
		if (!current || !/^agent-\d+$/.test(agent)) {
			return;
		}
		if (what === 'stop') {
			await stopAgentRun(runs.get(current.folder, agent));
			return;
		}
		if (what === 'terminal') {
			const run = runs.get(current.folder, agent);
			if (run && !run.terminal.isDisposed) {
				terminalService.setActiveInstance(run.terminal);
				await terminalService.revealTerminal(run.terminal);
			}
			return;
		}
		const file = joinPath(current.folder, agent, what === 'method' ? METHOD_FILE : REPORT_FILE);
		if (await fileService.exists(file)) {
			await editorService.openEditor({ resource: file });
		}
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		runs.onEnded = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: AgentForecastingMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				cells = await unattendedCells(configurationService, commandService, terminalInstanceService, fileService);
				await sendState();
			} else if (message.command === 'prepare' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs);
				if (inputs) {
					await prepare(inputs);
				}
			} else if (message.command === 'start' && hasKey(message, { agents: true })) {
				await start(checkedCells(message.agents));
			} else if (message.command === 'score') {
				await score();
			} else if (message.command === 'load' && hasKey(message, { name: true }) && validStudyName(message.name)) {
				const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
				watch(await readStudy(fileService, joinPath(root, message.name)));
				await sendState();
			} else if (message.command === 'newStudy') {
				watch(undefined);
				await sendState();
			} else if (message.command === 'open' && hasKey(message, { agent: true, what: true }) && typeof message.agent === 'string' && ['method', 'report', 'terminal', 'stop'].includes(message.what)) {
				await openFile(message.agent, message.what);
			} else if (message.command === 'restart' && hasKey(message, { agent: true, cell: true }) && Number.isInteger(message.agent)) {
				const [cell] = checkedCells([message.cell]);
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
	const text = {
		study: shared.study,
		studyTooltip: shared.studyTooltip,
		earlierNone: shared.earlierNone,
		newStudy: shared.newStudy,
		studyFolder: shared.studyFolder,
		between: shared.between,
		intro: localize('agentForecasting.intro', "Several coding agents each write a forecasting method for the same series of an M competition, on their own, from the values its forecasters saw. Pollis runs every method on the series, scores its forecasts on the values held back, as the organisers scored the entries, and scores beside them the mean and the median of the agents' forecasts, and the competition's benchmarks."),
		competitionStep: localize('agentForecasting.competitionStep', "Competition"),
		competition: localize('agentForecasting.competition', "Competition"),
		frequency: localize('agentForecasting.frequency', "Frequency"),
		sample: localize('agentForecasting.sample', "Series"),
		sampleTooltip: localize('agentForecasting.sampleTooltip', "How many series, drawn at random with the seed; 0 for all of them"),
		seed: localize('agentForecasting.seed', "Seed"),
		facts: localize('agentForecasting.facts', "{0} series, each forecast {1} values ahead."),
		notDownloaded: localize('agentForecasting.notDownloaded', "{0} is not on this computer yet: Prepare the Series downloads it first, from its source."),
		sampleHint: localize('agentForecasting.sampleHint', "The agents get only the values the competition's forecasters saw; the values their forecasts are scored on stay with Pollis. A sample keeps the agents' work and the scoring short; all the series of a frequency of M4 also place each method among the published entries."),
		prepare: localize('agentForecasting.prepare', "Prepare the Series"),
		preparing: localize('agentForecasting.preparing', "Sent to the Julia REPL: the series are written into the study's data/series.csv."),
		prepared: localize('agentForecasting.prepared', "{0} series ready, each forecast {1} values ahead."),
		agentsStep: localize('agentForecasting.agentsStep', "Agents"),
		agentsHint: localize('agentForecasting.agentsHint', "Each agent writes method.jl, a function forecast(y, h, period), on its own, in a folder of its own. Different models give more varied methods, which a combination gains most from. Each run is billed by its agent's provider, as any run of the agent is."),
		howMany: localize('agentForecasting.howMany', "How Many"),
		agentLabel: localize('agentForecasting.agentLabel', "Agent {0}"),
		noCells: localize('agentForecasting.noCells', "No coding agent that can run on its own was found on this computer: install Claude Code, Codex or OpenCode, then open this page again."),
		start: localize('agentForecasting.start', "Start the Agents"),
		runsStep: localize('agentForecasting.runsStep', "Runs"),
		agentColumn: localize('agentForecasting.agentColumn', "Agent"),
		agentModel: localize('agentForecasting.agentModel', "Agent and Model"),
		status: localize('agentForecasting.status', "Status"),
		time: localize('agentForecasting.time', "Time"),
		open: localize('agentForecasting.open', "Open"),
		statuses: {
			waiting: localize('agentForecasting.waiting', "Waiting"),
			running: localize('agentForecasting.running', "Running"),
			stopped: localize('agentForecasting.stopped', "Stopped"),
			done: localize('agentForecasting.done', "Done"),
			failed: localize('agentForecasting.failedStatus', "Ended without a method"),
			ended: localize('agentForecasting.ended', "Ended without a method"),
		},
		exit: localize('agentForecasting.exit', "exit code {0}"),
		method: localize('agentForecasting.method', "Method"),
		report: localize('agentForecasting.report', "Report"),
		terminal: localize('agentForecasting.terminalLink', "Terminal"),
		stop: localize('agentForecasting.stop', "Stop"),
		restart: localize('agentForecasting.restart', "Restart"),
		restartTooltip: localize('agentForecasting.restartTooltip', "Start this agent again, on the agent and model chosen for it in Agents, in its folder emptied: its earlier work goes to the Trash"),
		studyPrepared: localize('agentForecasting.studyPrepared', "The series of this study are prepared: choose New Study for another study."),
		needPrepare: localize('agentForecasting.needPrepare', "Prepare the Series first."),
		notPrepared: localize('agentForecasting.notPrepared', "The series are not ready yet: the Julia REPL is writing them."),
		started: localize('agentForecasting.started', "The agents of this study have started: restart one from its row in Runs, or choose New Study for another study."),
		waitAgents: localize('agentForecasting.waitAgents', "Wait for the agents to end, or stop them in Runs."),
		noMethods: localize('agentForecasting.noMethods', "No agent has written a method yet."),
		noRuns: localize('agentForecasting.noRuns', "The agents show here once they are started."),
		scoresStep: localize('agentForecasting.scoresStep', "Scores"),
		scoresHint: localize('agentForecasting.scoresHint', "Score the Methods sends the code to the Julia REPL, which runs every agent's method on the series in a new Julia process, on every thread of this computer, and scores the forecasts on the values held back: sMAPE, MASE and OWA, the overall weighted average of the two relative to Naive2, lower better. It costs nothing: no agent runs."),
		score: localize('agentForecasting.score', "Score the Methods"),
		scoring: localize('agentForecasting.scoring', "Sent to the Julia REPL: the scores show here once every method has run."),
		finished: localize('agentForecasting.finished', "Scored {0}, on {1} series."),
		rank: localize('agentForecasting.rank', "Rank"),
		rankTooltip: localize('agentForecasting.rankTooltip', "The place of the agents and the benchmarks in the order of the column sorted by"),
		sortHint: sortHint(),
		combinations: localize('agentForecasting.combinations', "Combinations of the Agents"),
		methodColumn: localize('agentForecasting.methodColumn', "Method"),
		place: localize('agentForecasting.place', "Place Among the {0} Entries"),
		note: localize('agentForecasting.note', "Note"),
		mean: localize('agentForecasting.mean', "Mean of the Agents"),
		median: localize('agentForecasting.median', "Median of the Agents"),
		combinedOf: localize('agentForecasting.combinedOf', "the forecasts of {0} agents"),
		benchmark: localize('agentForecasting.benchmark', "benchmark"),
		failedSeries: localize('agentForecasting.failedSeries', "{0} series failed: {1}"),
		noMethod: localize('agentForecasting.noMethod', "Not scored: {0}"),
		combinationNote: localize('agentForecasting.combinationNote', "The mean and the median combine, series by series and step by step, the forecasts of the agents whose methods forecast every series."),
	};
	return buildWebviewHtml({
		title: localize('agentForecasting.title', "Agents' Forecasting Competition"),
		introHtml: text.intro,
		omitPoweredBy: !AGENTFORECASTING_METADATA.agentForecasting.packages.length,
		extraCss: `
		${compareCss}
		${orchestrationCss}
		.missing { color: var(--vscode-errorForeground); }
		#sample, #seed { min-width: 6em; width: 6em; }
		tr.af-benchmark td { color: var(--vscode-descriptionForeground); }
		tr.af-combination td:nth-child(2) { font-weight: 600; }
		${stickyHeadCss}
		${sortHeadingsCss}
		.af-scores { max-height: 420px; overflow-y: auto; display: inline-block; max-width: 100%; }
		tr.af-separator td { padding-top: 14px; font-weight: 600; border-bottom: 1px solid var(--vscode-widget-border); }
`,
		steps: [
			{
				id: 'step-competition',
				title: text.competitionStep,
				bodyHtml: `
		<div class="row">
			<span class="small" title="${text.studyTooltip}">${text.study}</span> <input type="text" id="name" spellcheck="false">
			<select id="earlier"><option value="">${text.earlierNone}</option></select>
			<button class="link" id="newStudy" hidden>${text.newStudy}</button>
		</div>
		<p class="small">${text.studyFolder}</p>
		<div class="row">
			<span class="small">${text.competition}</span> <select id="competition">${CHOICES.map(choice => `<option value="${choice.id}"${choice.id === 'm4' ? ' selected' : ''}>${choice.name}</option>`).join('')}</select>
			<span class="small">${text.frequency}</span> <select id="frequency"></select>
			<span class="small" title="${text.sampleTooltip}">${text.sample}</span> <input type="text" id="sample" value="${DEFAULT_SAMPLE}" spellcheck="false">
			<span class="small">${text.seed}</span> <input type="text" id="seed" value="1" spellcheck="false">
		</div>
		<p class="small" id="facts"></p>
		<p class="warning" id="notDownloaded" hidden></p>
		<p class="hint">${text.sampleHint}</p>
		<div class="settings"><span class="bar"><button class="action current" id="prepare">${text.prepare}</button></span></div>
		<div class="small status" id="prepareStatus"></div>
		<div class="small status missing" id="prepareProblem"></div>
`,
			},
			{
				id: 'step-agents',
				title: text.agentsStep,
				bodyHtml: `
		<p class="hint">${text.agentsHint}</p>
		<div class="row"><span class="small">${text.howMany}</span> <select id="count">${Array.from({ length: MAX_AGENTS - MIN_AGENTS + 1 }, (_, i) => MIN_AGENTS + i).map(n => `<option value="${n}"${n === DEFAULT_AGENTS ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
		<div class="analysts" id="agents"></div>
		<p class="warning" id="noCells" hidden>${text.noCells}</p>
		<div class="settings"><span class="bar"><button class="action" id="start">${text.start}</button></span></div>
		<div class="small status missing" id="startProblem"></div>
`,
			},
			{
				id: 'step-runs',
				title: text.runsStep,
				bodyHtml: `
		<p class="hint" id="noRuns">${text.noRuns}</p>
		<table class="ma" id="runTable" hidden>
			<thead><tr><th>${text.agentColumn}</th><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.open}</th></tr></thead>
			<tbody id="runRows"></tbody>
		</table>
		<div class="small status missing" id="runsProblem"></div>
`,
			},
			{
				id: 'step-scores',
				title: text.scoresStep,
				bodyHtml: `
		<p class="hint">${text.scoresHint}</p>
		<div class="settings"><span class="bar"><button class="action" id="score">${text.score}</button></span></div>
		<div class="small status" id="scoreStatus"></div>
		<div class="small status missing" id="scoreProblem"></div>
		<div class="af-scores" id="scoreBox" hidden>
		<table class="ma stickyHead" id="scoreTable">
			<thead><tr><th class="number" title="${text.rankTooltip}">${text.rank}</th><th class="sortable" data-sort="method" data-label="${text.methodColumn}" title="${text.sortHint}">${text.methodColumn}</th><th class="sortable number" data-sort="sMAPE" data-label="sMAPE" title="${text.sortHint}">sMAPE</th><th class="sortable number" data-sort="MASE" data-label="MASE" title="${text.sortHint}">MASE</th><th class="sortable number" data-sort="OWA" data-label="OWA" title="${text.sortHint}">OWA</th><th class="sortable number" id="placeHeading" data-sort="place" data-label="" title="${text.sortHint}"></th><th>${text.note}</th></tr></thead>
			<tbody id="scoreRows"></tbody>
		</table>
		</div>
		<p class="small ma-note" id="combinationNote" hidden>${text.combinationNote}</p>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	${sortHeadingsScript()}
	const CHOICES = ${JSON.stringify(CHOICES.map(choice => ({ id: choice.id, name: choice.name, frequencies: choice.frequencies })))};
	const DEFAULT_AGENTS = ${DEFAULT_AGENTS};
	const DEFAULT_SAMPLE = ${DEFAULT_SAMPLE};
	const nameInput = document.getElementById('name');
	const earlier = document.getElementById('earlier');
	const competition = document.getElementById('competition');
	const frequency = document.getElementById('frequency');
	const sample = document.getElementById('sample');
	const seed = document.getElementById('seed');
	const count = document.getElementById('count');
	const agentsBox = document.getElementById('agents');
	let state = undefined;
	/** The cell chosen for each agent, kept when their number changes. */
	let chosen = [];
	let timer = undefined;
${orchestrationPageJs}
	function choice() {
		return CHOICES.find(c => c.id === competition.value) || CHOICES[0];
	}
	function drawFrequencies(selected) {
		const c = choice();
		frequency.innerHTML = c.frequencies.map(f => '<option value="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</option>').join('');
		frequency.value = selected && c.frequencies.some(f => f.name === selected) ? selected : (c.frequencies.find(f => f.name === 'Monthly') || c.frequencies[0]).name;
	}
	function drawFacts() {
		const c = choice();
		const f = c.frequencies.find(x => x.name === frequency.value) || c.frequencies[0];
		const n = Math.floor(Number(sample.value));
		const series = n > 0 && n < f.series ? n : f.series;
		document.getElementById('facts').textContent = TEXT.facts.replace('{0}', format(series)).replace('{1}', String(f.horizon));
		const missing = document.getElementById('notDownloaded');
		missing.hidden = !state || state.downloaded[c.id] !== false || !!state.study;
		missing.textContent = TEXT.notDownloaded.replace('{0}', c.name);
	}

	/** The agents' choices: at first the cells in turn, so that the models differ. */
	function drawAgents() {
		const cells = state ? state.cells : [];
		const n = Number(count.value);
		while (chosen.length < n && cells.length) {
			chosen.push(cellKey(cells[chosen.length % cells.length]));
		}
		agentsBox.innerHTML = '';
		for (let i = 0; i < n; i++) {
			const label = document.createElement('span');
			label.className = 'small';
			label.textContent = TEXT.agentLabel.replace('{0}', String(i + 1));
			const select = document.createElement('select');
			select.innerHTML = cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
			// A running agent keeps its model; the others may take another, for Restart
			const run = state && state.study ? state.study.agents[i] : undefined;
			if (run && run.status === 'running') {
				chosen[i] = cellKey(run);
			}
			select.value = chosen[i] || '';
			select.disabled = !!(run && run.status === 'running');
			select.addEventListener('change', () => { chosen[i] = select.value; });
			agentsBox.append(label, select);
		}
		document.getElementById('noCells').hidden = cells.length > 0;
	}

	function link(label, agent, what, title) {
		return '<button class="link" data-agent="' + escapeHtml(agent) + '" data-what="' + what + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') + '>' + escapeHtml(label) + '</button>';
	}
	function drawRuns() {
		const agents = state.study ? state.study.agents : [];
		document.getElementById('runTable').hidden = !agents.length;
		document.getElementById('noRuns').hidden = agents.length > 0;
		document.getElementById('runRows').innerHTML = agents.map((run, i) => {
			const status = TEXT.statuses[run.status] + (run.status === 'failed' && typeof run.exitCode === 'number' ? ' (' + TEXT.exit.replace('{0}', run.exitCode) + ')' : '');
			const links = [run.hasFile ? link(TEXT.method, run.key, 'method') + link(TEXT.report, run.key, 'report') : '', run.hasTerminal ? link(TEXT.terminal, run.key, 'terminal') : '', run.status === 'running' ? link(TEXT.stop, run.key, 'stop') : link(TEXT.restart, run.key, 'restart', TEXT.restartTooltip)].filter(x => x).join('');
			return '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(run.label) + '</td><td class="status-' + run.status + '">' + escapeHtml(status) + '</td><td class="number" data-run="' + escapeHtml(run.key) + '">' + elapsed(run) + '</td><td class="links">' + links + '</td></tr>';
		}).join('');
		clearInterval(timer);
		if (agents.some(run => run.status === 'running')) {
			timer = setInterval(() => {
				for (const cell of document.querySelectorAll('td[data-run]')) {
					const run = state.study.agents.find(r => r.key === cell.dataset.run);
					cell.textContent = run ? elapsed(run) : '';
				}
			}, 1000);
		}
	}

	/** The column the ranked rows are sorted by: OWA, from the lowest, at first. */
	let scoreSort = { key: 'OWA', descending: false };

	/**
	 * The scores: the agents and the benchmarks ranked by the column sorted by, the agents not scored after them, then,
	 * below a separator, the mean and the median of the agents, which are not ranked.
	 */
	function drawScores() {
		const study = state.study;
		const results = study && study.results;
		document.getElementById('scoreBox').hidden = !results;
		const status = document.getElementById('scoreStatus');
		if (results) {
			status.textContent = TEXT.finished.replace('{0}', results.finished).replace('{1}', format(results.series));
		} else if (!study) {
			status.textContent = '';
		}
		if (!results) {
			document.getElementById('combinationNote').hidden = true;
			return;
		}
		const ranked = typeof results.entries === 'number';
		const placeHeading = document.getElementById('placeHeading');
		placeHeading.dataset.label = ranked ? TEXT.place.replace('{0}', format(results.entries)) : '';
		placeHeading.hidden = !ranked;
		if (!ranked && scoreSort.key === 'place') {
			scoreSort = { key: 'OWA', descending: false };
		}
		const isScored = row => !!(row.scores && typeof row.scores.OWA === 'number');
		const combinations = ['mean', 'median'].map(name => results.rows.find(row => row.kind === 'combination' && row.name === name)).filter(row => row);
		const others = results.rows.filter(row => row.kind !== 'combination');
		const label = row => {
			if (row.kind === 'agent') {
				const run = study.agents[row.agent - 1];
				return TEXT.agentLabel.replace('{0}', String(row.agent)) + (run ? ' \\u00b7 ' + run.label : '');
			}
			if (row.kind === 'combination') {
				return row.name === 'mean' ? TEXT.mean : TEXT.median;
			}
			return row.name;
		};
		const note = row => row.kind === 'combination' ? TEXT.combinedOf.replace('{0}', String(row.agents))
			: row.kind === 'benchmark' ? TEXT.benchmark
				: row.failed ? TEXT.failedSeries.replace('{0}', format(row.failed)).replace('{1}', row.error || '')
					: row.error ? TEXT.noMethod.replace('{0}', row.error) : '';
		// The value a row is sorted by: the method's name in the order of the alphabet, else a number, none last either way
		const sortValue = row => scoreSort.key === 'method' ? label(row)
			: scoreSort.key === 'place' ? row.place
				: row.scores ? row.scores[scoreSort.key] : undefined;
		const ordered = others.filter(isScored).sort((a, b) => {
			const x = sortValue(a);
			const y = sortValue(b);
			const xMissing = typeof x !== 'number' && typeof x !== 'string';
			const yMissing = typeof y !== 'number' && typeof y !== 'string';
			if (xMissing || yMissing) {
				return Number(xMissing) - Number(yMissing);
			}
			const order = typeof x === 'string' ? x.localeCompare(y, undefined, { numeric: true }) : x - y;
			return scoreSort.descending ? -order : order;
		});
		const columns = ranked ? 7 : 6;
		const rowHtml = (row, rank) => {
			const value = key => row.scores ? format(row.scores[key]) : '';
			const placeCell = ranked ? '<td class="number">' + (typeof row.place === 'number' ? format(row.place) : '') + '</td>' : '';
			return '<tr class="af-' + escapeHtml(row.kind) + '"><td class="number">' + rank + '</td><td>' + escapeHtml(label(row)) + '</td><td class="number">' + value('sMAPE') + '</td><td class="number">' + value('MASE') + '</td><td class="number">' + value('OWA') + '</td>' + placeCell + '<td class="small' + (isScored(row) ? '' : ' missing') + '">' + escapeHtml(note(row)) + '</td></tr>';
		};
		document.getElementById('scoreRows').innerHTML = ordered.map((row, i) => rowHtml(row, String(i + 1))).join('')
			+ others.filter(row => !isScored(row)).map(row => rowHtml(row, '')).join('')
			+ (combinations.length ? '<tr class="af-separator"><td colspan="' + columns + '">' + escapeHtml(TEXT.combinations) + '</td></tr>' + combinations.map(row => rowHtml(row, '')).join('') : '');
		for (const heading of document.querySelectorAll('#scoreTable th[data-sort]')) {
			setSortArrow(heading, heading.dataset.label, heading.dataset.sort === scoreSort.key, scoreSort.descending);
		}
		document.getElementById('combinationNote').hidden = !combinations.length;
	}

	/** Why a step's button cannot do its work now, or '' when it can: the buttons are never disabled, and say why when pressed. */
	function prepareBlocked() {
		return state && state.study ? TEXT.studyPrepared : '';
	}
	function startBlocked() {
		const study = state && state.study;
		return !study ? TEXT.needPrepare
			: !study.prepared ? TEXT.notPrepared
				: study.agents.length ? TEXT.started
					: !state.cells.length ? TEXT.noCells : '';
	}
	function scoreBlocked() {
		const agents = state && state.study ? state.study.agents : [];
		return agents.some(run => run.status === 'running') ? TEXT.waitAgents
			: !agents.some(run => run.hasFile) ? TEXT.noMethods : '';
	}

	/** The one blue button is the next thing to do; a button that can do its work clears what it said when it could not. */
	function drawButtons() {
		const study = state.study;
		const ready = { prepare: !prepareBlocked(), start: !startBlocked(), score: !scoreBlocked() };
		document.getElementById('prepare').classList.toggle('current', ready.prepare);
		document.getElementById('start').classList.toggle('current', ready.start);
		document.getElementById('score').classList.toggle('current', ready.score && !study.results);
		for (const step of ['prepare', 'start', 'score']) {
			if (ready[step]) {
				document.getElementById(step + 'Problem').textContent = '';
			}
		}
	}

	function draw() {
		const study = state.study;
		document.getElementById('root').textContent = state.root;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlierNone) + '</option>' + state.studies.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = study ? study.name : '';
		document.getElementById('newStudy').hidden = !study;
		for (const element of [nameInput, competition, frequency, sample, seed]) {
			element.disabled = !!study;
		}
		count.disabled = !!(study && study.agents.length);
		if (study) {
			nameInput.value = study.name;
			competition.value = study.competition;
			drawFrequencies(study.frequency);
			sample.value = String(study.sample);
			seed.value = String(study.seed);
			if (study.agents.length) {
				count.value = String(study.agents.length);
			}
		} else {
			nameInput.value = '';
			nameInput.placeholder = state.suggestion;
		}
		const prepareStatus = document.getElementById('prepareStatus');
		if (study && study.prepared) {
			prepareStatus.textContent = TEXT.prepared.replace('{0}', format(study.prepared.series)).replace('{1}', String(study.prepared.horizon));
		} else if (!study) {
			prepareStatus.textContent = '';
		}
		drawFacts();
		drawAgents();
		drawRuns();
		drawScores();
		drawButtons();
	}

	competition.addEventListener('change', () => { drawFrequencies(); drawFacts(); });
	frequency.addEventListener('change', drawFacts);
	sample.addEventListener('input', drawFacts);
	count.addEventListener('change', drawAgents);
	earlier.addEventListener('change', () => vscode.postMessage(earlier.value ? { command: 'load', name: earlier.value } : { command: 'newStudy' }));
	document.getElementById('newStudy').addEventListener('click', () => vscode.postMessage({ command: 'newStudy' }));
	document.getElementById('prepare').addEventListener('click', () => {
		const blocked = prepareBlocked();
		document.getElementById('prepareProblem').textContent = blocked;
		if (blocked) {
			return;
		}
		document.getElementById('prepareStatus').textContent = '';
		vscode.postMessage({ command: 'prepare', inputs: {
			name: nameInput.value.trim() || nameInput.placeholder,
			competition: competition.value,
			frequency: frequency.value,
			sample: Math.max(0, Math.floor(Number(sample.value) || 0)),
			seed: Math.max(0, Math.floor(Number(seed.value) || 0)),
		} });
	});
	document.getElementById('start').addEventListener('click', () => {
		const blocked = startBlocked();
		document.getElementById('startProblem').textContent = blocked;
		if (blocked) {
			return;
		}
		const n = Number(count.value);
		const agents = chosen.slice(0, n).map(key => state.cells.find(c => cellKey(c) === key)).filter(c => c).map(c => ({ agent: c.agent, model: c.model }));
		vscode.postMessage({ command: 'start', agents });
	});
	document.getElementById('score').addEventListener('click', () => {
		const blocked = scoreBlocked();
		document.getElementById('scoreProblem').textContent = blocked;
		if (!blocked) {
			vscode.postMessage({ command: 'score' });
		}
	});
	document.getElementById('scoreTable').addEventListener('click', event => {
		const heading = event.target.closest('th[data-sort]');
		if (heading) {
			scoreSort = { key: heading.dataset.sort, descending: heading.dataset.sort === scoreSort.key ? !scoreSort.descending : false };
			drawScores();
		}
	});
	document.body.addEventListener('click', event => {
		const target = event.target.closest('button[data-what]');
		if (!target) {
			return;
		}
		if (target.dataset.what === 'restart') {
			// The agent starts again on the agent and model chosen in its menu in Agents, else on those it had
			const index = Number(target.dataset.agent.replace('agent-', '')) - 1;
			const cell = state.cells.find(c => cellKey(c) === chosen[index]) || state.study.agents[index];
			document.getElementById('runsProblem').textContent = '';
			vscode.postMessage({ command: 'restart', agent: index, cell: { agent: cell.agent, model: cell.model } });
		} else {
			vscode.postMessage({ command: 'open', agent: target.dataset.agent, what: target.dataset.what });
		}
	});

	drawFrequencies();
	count.value = String(DEFAULT_AGENTS);
	sample.value = String(DEFAULT_SAMPLE);
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const wasStudy = !!(state && state.study);
			const before = state && state.study ? state.study.name : '';
			state = message;
			// Another study: the menus show the agents and models of its agents
			if (state.study && state.study.name !== before && state.study.agents.length) {
				chosen = state.study.agents.map(cellKey);
			}
			if (wasStudy && !state.study) {
				competition.value = 'm4';
				drawFrequencies();
				sample.value = String(DEFAULT_SAMPLE);
				seed.value = '1';
				count.value = String(DEFAULT_AGENTS);
			}
			draw();
		} else if (message.command === 'problem') {
			document.getElementById(message.step === 'start' ? 'startProblem' : message.step === 'runs' ? 'runsProblem' : 'prepareProblem').textContent = message.text;
		} else if (message.command === 'sent') {
			document.getElementById(message.step === 'score' ? 'scoreStatus' : 'prepareStatus').textContent = message.step === 'score' ? TEXT.scoring : TEXT.preparing;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: AGENT_FORECASTING_COMMAND_ID, title: localize2('agentForecasting.action', "Agents' Forecasting Competition..."), category: localize2('orchestration.category', "Orchestration"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openAgentForecastingPage(accessor);
	}
});
