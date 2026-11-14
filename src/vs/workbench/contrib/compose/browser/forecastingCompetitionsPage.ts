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
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { FORECASTINGCOMPETITIONS_METADATA } from '../../model/browser/webviews/forecastingCompetitions.data.js';
import { sortHeadingsCss, sortHeadingsScript, sortHint } from '../../model/browser/webviews/webviewPager.js';
import { buildWebviewHtml, codeEditorCss, codeEditorHtml, codeEditorJs, colorizeBracketsJs, nextStepIcon, openPageStepJs } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';

// Forecasting Competitions, from Compose > Forecasting Competitions (compose.contribution.ts): a forecasting method of the user's
// own, run on the series of a competition of PollisCompetitions.jl, scored as the competition's organisers scored the
// entries, and ranked among them. A page of the scaffold in the Time Arrow style, in four steps: 1, Competition (M1,
// M3, M4 or M5, a frequency, a sample, and Download when it is not on this computer); 2, Your Method, a Julia function
// forecast(y, h, period); 3, Run, in the Julia REPL; 4, Score and Rank. A run is a folder of
// ~/.pollis/competitions/runs: run.toml (the choices of step 1), method.jl, run.jl (which the page writes and the REPL
// runs), progress.json while it runs, then forecasts.csv and results.json, which step 4 draws.

export const FORECASTING_COMPETITIONS_COMMAND_ID = 'pollis.competitions.forecastingCompetitions';

const RUN_FILE = 'run.toml';
const METHOD_FILE = 'method.jl';
const SCRIPT_FILE = 'run.jl';
const PROGRESS_FILE = 'progress.json';
const RESULTS_FILE = 'results.json';
const FORECASTS_FILE = 'forecasts.csv';

/** A frequency of a competition: its name in PollisCompetitions, its number of series and its horizon. */
export interface IFrequency {
	readonly name: string;
	readonly series: number;
	readonly horizon: number;
}

/** A competition the page holds, with the facts step 1 shows. */
export interface ICompetition {
	readonly id: string;
	readonly name: string;
	readonly frequencies: readonly IFrequency[];
	readonly measures: string;
	/** Whether a run can be a sample of the series: not for M5, whose WRMSSE adds up all of them. */
	readonly sampling: boolean;
	/** Whether the published scores of the entries rank a run of the whole competition or of a whole frequency. */
	readonly ranked: boolean;
	readonly entries: string;
	/** The function the method defines: forecast(y, h, period) for a competition of series, decide(prices, date) for M6. */
	readonly method: 'forecast' | 'decide';
	/** What step 1 says of the competition's series, when not their frequencies and horizons. */
	readonly summary?: string;
	/** Why a competition that cannot be sampled is run whole. */
	readonly wholeNote?: string;
}

export const COMPETITIONS: readonly ICompetition[] = [
	{
		id: 'm1', name: 'M1 (1982)', sampling: true, ranked: false, method: 'forecast',
		frequencies: [{ name: 'Yearly', series: 181, horizon: 6 }, { name: 'Quarterly', series: 203, horizon: 8 }, { name: 'Monthly', series: 617, horizon: 18 }],
		measures: 'sMAPE, MASE, OWA',
		entries: localize('competitions.m1.entries', "No entries here: scored beside Naive2"),
	},
	{
		id: 'm3', name: 'M3 (2000)', sampling: true, ranked: false, method: 'forecast',
		frequencies: [{ name: 'Yearly', series: 645, horizon: 6 }, { name: 'Quarterly', series: 756, horizon: 8 }, { name: 'Monthly', series: 1428, horizon: 18 }, { name: 'Other', series: 174, horizon: 8 }],
		measures: 'sMAPE, MASE, OWA',
		entries: localize('competitions.m3.entries', "No entries here: scored beside Naive2"),
	},
	{
		id: 'm4', name: 'M4 (2018)', sampling: true, ranked: true, method: 'forecast',
		frequencies: [{ name: 'Yearly', series: 23000, horizon: 6 }, { name: 'Quarterly', series: 24000, horizon: 8 }, { name: 'Monthly', series: 48000, horizon: 18 }, { name: 'Weekly', series: 359, horizon: 13 }, { name: 'Daily', series: 4227, horizon: 14 }, { name: 'Hourly', series: 414, horizon: 48 }],
		measures: 'sMAPE, MASE, OWA',
		entries: localize('competitions.m4.entries', "61 entries"),
	},
	{
		id: 'm5', name: 'M5 Accuracy (2020)', sampling: false, ranked: true,
		frequencies: [{ name: 'Daily', series: 30490, horizon: 28 }],
		measures: 'WRMSSE',
		entries: localize('competitions.m5.entries', "74 entries: 24 benchmarks and the top 50"),
		method: 'forecast',
		wholeNote: localize('competitions.m5.whole', "M5 is run on all its series: the WRMSSE adds them up into the 42,840 series of its 12 levels."),
	},
	{
		id: 'm6', name: 'M6 (2022)', sampling: false, ranked: true,
		frequencies: [{ name: 'Daily', series: 100, horizon: 20 }],
		measures: 'RPS, IR, OR',
		entries: localize('competitions.m6.entries', "251 teams, M6 Dummy the benchmark"),
		method: 'decide',
		summary: localize('competitions.m6.summary', "100 assets, 12 rounds of 4 weeks"),
		wholeNote: localize('competitions.m6.whole', "M6 is run on its 12 rounds, each with all its 100 assets, as its teams submitted."),
	},
];

/** The choices of step 1 and the method of step 2, as the page sends them. */
interface IRunInputs {
	readonly competition: string;
	/** A frequency of the competition, or '' for all of them. */
	readonly frequency: string;
	/** The number of series of the sample, or 0 for all the series chosen. */
	readonly sample: number;
	readonly seed: number;
	readonly code: string;
}

type CompetitionsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'download'; readonly competition: string }
	| { readonly command: 'run'; readonly inputs: IRunInputs }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newRun' }
	| { readonly command: 'open'; readonly what: 'method' | 'forecasts' | 'script' }
	| { readonly command: 'nextStep'; readonly step: string; readonly series?: unknown; readonly position?: unknown; readonly entry?: unknown }
	| { readonly command: 'compareWith'; readonly name: string }
	| { readonly command: 'diffMethods' }
	| { readonly command: 'codeDraft'; readonly text: string };

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

/** The example of step 2: the benchmark Theta of M4, written out from the functions of PollisCompetitions.M4Benchmarks. */
const EXAMPLE_METHOD = `# Your method: a function forecast(y, h, period) that returns h forecasts of the series y (its values in order),
# whose seasonal period is period (1 for none). Here, the benchmark Theta of M4, written out from the functions
# of PollisCompetitions.jl: change it, or write a method of your own, with any package you have installed.
using PollisCompetitions.M4Benchmarks: is_seasonal, seasonal_index, theta

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
`;

/** The example of step 2 for M6: equal probabilities and equal weights, as M6 Dummy, the benchmark of M6. */
const EXAMPLE_DECIDE = `# Your method for M6: a function decide(prices, date) that, at each of the 12 rounds, gets the prices of the 100
# assets up to date, the first day of the round (prices.symbol, prices.date and prices.price, a column each), and
# returns a table with a row for each asset: symbol; rank1 to rank5, the probabilities that its return over the
# next four weeks ranks in each fifth of the 100 assets, from the lowest (rank1) to the highest (rank5), adding up
# to 1; and decision, the weight invested in it, negative to sell short, the absolute weights adding up to 0.25 to 1.
# Here, equal probabilities and equal weights, as M6 Dummy, the benchmark of M6: change it, or write a method of your own.
function decide(prices, date)
	symbols = sort(unique(prices.symbol))
	n = length(symbols)
	(; symbol = symbols, rank1 = fill(0.2, n), rank2 = fill(0.2, n), rank3 = fill(0.2, n), rank4 = fill(0.2, n),
		rank5 = fill(0.2, n), decision = fill(1 / n, n))
end
`;

/** The inputs of a run as the page sent them, checked; undefined when they are not well formed. */
function checkedInputs(value: unknown): IRunInputs | undefined {
	if (typeof value !== 'object' || value === null) {
		return undefined;
	}
	const { competition, frequency, sample, seed, code }: { readonly [K in keyof IRunInputs]?: unknown } = value;
	const known = COMPETITIONS.find(c => c.id === competition);
	if (!known || typeof frequency !== 'string' || (frequency !== '' && !known.frequencies.some(f => f.name === frequency))
		|| typeof sample !== 'number' || !Number.isInteger(sample) || sample < 0 || typeof seed !== 'number' || !Number.isInteger(seed) || typeof code !== 'string') {
		return undefined;
	}
	return { competition: known.id, frequency, sample: known.sampling ? sample : 0, seed, code };
}

/** run.toml of a run: the choices of step 1. */
function runToml(inputs: IRunInputs, started: string): string {
	return [
		'# A run of Compose > Forecasting Competitions: the method of method.jl on these series',
		`competition = "${inputs.competition}"`,
		`frequency = "${inputs.frequency}"`,
		`sample = ${inputs.sample}`,
		`seed = ${inputs.seed}`,
		`started = "${started}"`,
		'',
	].join('\n');
}

/** A run's choices, as its run.toml records them; undefined when it is not a run's. */
async function readRun(fileService: IFileService, folder: URI): Promise<(Omit<IRunInputs, 'code'> & { readonly started: string }) | undefined> {
	try {
		const data = parseToml((await fileService.readFile(joinPath(folder, RUN_FILE))).value.toString());
		const { competition, frequency, sample, seed, started } = data;
		if (typeof competition !== 'string' || typeof frequency !== 'string' || typeof sample !== 'number' || typeof seed !== 'number') {
			return undefined;
		}
		return { competition, frequency, sample, seed, started: typeof started === 'string' ? started : '' };
	} catch {
		return undefined;
	}
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
 * The Julia code that installs PollisCompetitions.jl when it is not, and downloads a competition; for M4 also the
 * forecasts of Naive2, against which OWA weighs every forecast.
 */
function downloadCode(competition: string): string {
	return `# Forecasting Competitions: download ${competition} from its source, each file checked against its SHA-256
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC
PC.download("${competition}")${competition === 'm4' ? '\nPC.download_forecasts("m4"; entries = ["Naive2"])' : ''}`;
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

/** The Julia of every script of a run, inside its `let run = ...` and once `id` is set: the winner's forecast of a series. */
const JULIA_WINNER = String.raw`	# The forecasts of series s by the winner of competition id (M4 or M5), when they are on this computer: its name and values
	function winner_forecast(s)
		id in ("m4", "m5") || return nothing
		listed = PC.entries(id)
		w = findfirst(k -> listed.kind[k] == "submission" && listed.forecasts[k] == "point" && coalesce(listed.rank[k], 0) == 1, eachindex(listed.entry))
		(w === nothing || !isfile(joinpath(PC.folder(id), "forecasts", string(listed.entry[w], ".parquet")))) && return nothing
		Dict("name" => listed.name[w], "values" => PC.forecasts(id; entry = Int(listed.entry[w]), series = s).value)
	end`;

/**
 * The Next Steps of a finished run. Each is a Julia script of the run's folder, `<step>.jl`, which the page writes
 * and the Julia REPL runs, and which writes `<step>.json`, from which the page draws the step's panel.
 */
const NEXT_STEPS = ['horizon', 'series', 'fails', 'entry'] as const;
type NextStep = typeof NEXT_STEPS[number];

/**
 * What a Next Step is asked for: for Browse the Series, the series named as its source names it, or the one at a place
 * among the run's series, from 1; for Compare With an Entry, the number of the entry, or none to list the entries.
 */
interface INextStepRequest {
	readonly name?: string;
	readonly position?: number;
	readonly entry?: number;
}

/** What a message asks of a Next Step, checked: a name of letters, digits and . _ : -, a place from 1, an entry's number. */
function checkedRequest(message: { readonly series?: unknown; readonly position?: unknown; readonly entry?: unknown }): INextStepRequest {
	const entry = typeof message.entry === 'number' && Number.isInteger(message.entry) && message.entry >= 0 && message.entry < 32768 ? message.entry : undefined;
	if (typeof message.series === 'string' && /^[\w .:-]{1,100}$/.test(message.series)) {
		return { name: message.series, entry };
	}
	return { position: typeof message.position === 'number' && Number.isInteger(message.position) && message.position >= 1 ? message.position : 1, entry };
}

/** The Julia of every Next Steps script, inside its `let run = ...`, after JULIA_JSON. */
const JULIA_NEXT = String.raw`	settings = TOML.parsefile(joinpath(run, "${RUN_FILE}"))
	id = settings["competition"]
	# The forecasts of the run, from forecasts.csv: series, h and value
	function read_forecasts()
		fields = [split(line, ',') for line in Iterators.drop(eachline(joinpath(run, "${FORECASTS_FILE}")), 1)]
		(; series = [parse(Int, f[1]) for f in fields], h = [parse(Int, f[2]) for f in fields], value = [parse(Float64, f[3]) for f in fields])
	end
	# The forecasts of Naive2 of the series numbers: those published for M4, those computed on this computer for M1 and M3
	function naive2_forecasts(numbers)
		chosen = Set(numbers)
		if id == "m4"
			published = PC.forecasts(id; entry = "Naive2")
			keep = [s in chosen for s in published.series]
			return (; series = published.series[keep], h = published.h[keep], value = published.value[keep])
		end
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
	return String.raw`# Forecasting Competitions > Next Steps: ${comment}; writes ${step}.json
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC, TOML
let run = raw"${folder.fsPath}"
${JULIA_JSON}
${JULIA_NEXT}
${JULIA_WINNER}
	try
		isdefined(PC, :step_errors) || error("This step needs a newer PollisCompetitions.jl: update it with Pkg.update(\"PollisCompetitions\").")`;
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
		id == "m5" && error("Errors by Horizon is for M1, M3 and M4: M5 is scored by the WRMSSE of its 12 levels.")
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
 * it was scored on, the method's forecast, the eight benchmarks of M4 computed on it (M1, M3 and M4), and the winner's
 * forecast when it is on this computer.
 */
function seriesScript(folder: URI, request: INextStepRequest): string {
	const find = request.name !== undefined
		? String.raw`
		wanted = raw"${request.name}"
		k = findfirst(==(wanted), known.name)
		k === nothing && error(string(wanted, " is not a series of this competition."))
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
		# The benchmarks of M4 on this series, as PollisCompetitions.M4Benchmarks computes them; Naive2 alone when the series is too short for the others
		benchmarks = Dict{String, Any}()
		if id != "m5"
			try
				computed = PC.M4Benchmarks.benchmarks(past; period, horizon = h)
				for m in PC.M4_BENCHMARKS
					benchmarks[m] = getproperty(computed, Symbol(m))
				end
			catch
				benchmarks["Naive2"] = PC.naive2(past, period, h)
			end
		end
		write_json("series.json", Dict("position" => position, "count" => length(numbers), "name" => known.name[k], "frequency" => known.frequency[k],
			"horizon" => h, "past" => past[max(1, end - 4999):end], "actual" => PC.observations(id; series = s, split = "test").value,
			"forecast" => forecast, "benchmarks" => benchmarks, "winner" => winner_forecast(s)))` + nextStepEnd('series');
}

/**
 * fails.jl: the sMAPE and the MASE over the horizon of each series of the run, of the method and of Naive2, and each
 * relative to Naive2's; how many series the method forecasts better than Naive2, by frequency; and the 100 series
 * where the method does worst by each of the four, which the page's table holds.
 */
function failsScript(folder: URI): string {
	return nextStepStart('fails', folder, 'Where It Fails, the series where the method does worst against Naive2') + String.raw`
		id == "m5" && error("Where It Fails is for M1, M3 and M4: M5 is scored by the WRMSSE of its 12 levels.")
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

/**
 * entry.jl: the entries of M4 or M5 with point forecasts, and whether their forecasts are on this computer; and, when
 * `request` names an entry, its forecasts of the run's series, downloaded first when they are not, scored beside the
 * method's on the same series. For M4, the two are also compared series by series; for M5, level by level.
 */
function entryScript(folder: URI, request: INextStepRequest): string {
	return nextStepStart('entry', folder, 'Compare With an Entry, the method beside an entry of the competition on the same series') + String.raw`
		id in ("m4", "m5") || error("Compare With an Entry is for M4 and M5: PollisCompetitions.jl has no entries of M1 and M3.")
		listed = PC.entries(id)
		on_disk(number) = isfile(joinpath(PC.folder(id), "forecasts", string(number, ".parquet")))
		point = [k for k in eachindex(listed.entry) if listed.forecasts[k] == "point"]
		entries = [Dict("entry" => Int(listed.entry[k]), "name" => listed.name[k], "kind" => listed.kind[k], "rank" => listed.rank[k],
			"downloaded" => on_disk(listed.entry[k])) for k in point]
		chosen = ${request.entry ?? 'nothing'}
		compared = nothing
		if chosen !== nothing
			k = findfirst(i -> Int(listed.entry[i]) == chosen, point)
			k === nothing && error(string("Entry ", chosen, " has no point forecasts."))
			k = point[k]
			if !on_disk(chosen)
				println("Downloading the forecasts of ", listed.name[k])
				PC.download_forecasts(id; entries = [chosen])
			end
			mine = read_forecasts()
			numbers = Set(mine.series)
			published = PC.forecasts(id; entry = chosen)
			keep = [s in numbers for s in published.series]
			theirs = (; series = published.series[keep], h = published.h[keep], value = published.value[keep])
			frequency = settings["frequency"]
			measures = id == "m5" ? ["WRMSSE"] : ["sMAPE", "MASE", "OWA"]
			breakdown, level = id == "m5" ? ("level", "Total") : ("frequency", isempty(frequency) ? "Total" : frequency)
			println("Scoring the method and ", listed.name[k], " on the same series")
			a, b = PC.score(id, mine), PC.score(id, theirs)
			pick(scores, at) = Dict(m => only(scores.value[(scores.measure .== m) .& (scores.breakdown .== breakdown) .& (scores.level .== at)]) for m in measures)
			compared = Dict{String, Any}("entry" => chosen, "name" => listed.name[k], "kind" => listed.kind[k], "rank" => listed.rank[k], "series" => length(numbers),
				"level" => level, "measures" => measures, "method" => pick(a, level), "other" => pick(b, level))
			if id == "m5"
				compared["levels"] = [Dict("level" => at, "method" => pick(a, at)["WRMSSE"], "other" => pick(b, at)["WRMSSE"]) for at in vcat(string.(1:12), "Total")]
			else
				# Series by series: how often each is the better, and where the difference is largest
				known = PC.series(id)
				row_of = Dict(s => r for (r, s) in enumerate(known.series))
				ours, others = series_means(PC.step_errors(id, mine)), series_means(PC.step_errors(id, theirs))
				both = [s for s in keys(ours) if haskey(others, s)]
				rows = [Dict{String, Any}("name" => known.name[row_of[s]], "frequency" => known.frequency[row_of[s]], "mase" => ours[s].mase,
					"other_mase" => others[s].mase, "relative_mase" => relative(ours[s].mase, others[s].mase)) for s in both]
				compared["counts"] = Dict(m => Dict("better" => count(s -> getfield(ours[s], m) < getfield(others[s], m), both),
					"worse" => count(s -> getfield(ours[s], m) > getfield(others[s], m), both)) for m in (:smape, :mase))
				order = sortperm([r["relative_mase"] for r in rows]; rev = true)
				compared["entry_better"] = rows[order[1:min(50, end)]]
				compared["method_better"] = rows[reverse(order)[1:min(50, end)]]
			end
		end
		write_json("entry.json", Dict("entries" => entries, "compared" => compared))` + nextStepEnd('entry');
}

/** The Julia script of a Next Step of the run in `folder`; `request` says what Browse the Series and Compare With an Entry show. */
function nextStepScript(step: NextStep, folder: URI, request: INextStepRequest): string {
	switch (step) {
		case 'horizon': return horizonScript(folder);
		case 'series': return seriesScript(folder, request);
		case 'fails': return failsScript(folder);
		case 'entry': return entryScript(folder, request);
	}
}

/**
 * run.jl of a run of M6: calls decide of method.jl at each of the 12 rounds with the prices up to its first day,
 * checks its answer against the rules of M6, writes the submissions to forecasts.csv and scores them with
 * PollisCompetitions.jl; places the method among the teams ranked over the year by the overall rank (OR), the mean of
 * a team's ranks by RPS and by IR, recomputed with the method among them; then writes results.json.
 */
function m6RunScript(folder: URI): string {
	return String.raw`# Forecasting Competitions: the method of method.jl on the 12 rounds of M6, scored as its organisers scored the
# teams; progress.json while it runs, then forecasts.csv and results.json
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC
let run = raw"${folder.fsPath}"
${JULIA_JSON}
	id = "m6"
	try
		isdefined(PC, :m6_prices) || error("M6 needs a newer PollisCompetitions.jl: update it with Pkg.update(\"PollisCompetitions\").")
		method = Module(:Method)
		Base.include(method, joinpath(run, "${METHOD_FILE}"))
		isdefined(method, :decide) || error("method.jl defines no function decide(prices, date).")
		decide = getfield(method, :decide)
		known = PC.table(id, "prices")
		rounds = PC.m6_prices(id)
		assets = first(rounds).symbols
		columns = (:rank1, :rank2, :rank3, :rank4, :rank5)
		submitted = (; evaluation = Int[], symbol = String[], decision = Float64[], rank1 = Float64[], rank2 = Float64[], rank3 = Float64[],
			rank4 = Float64[], rank5 = Float64[])
		started = time()
		for k in eachindex(rounds)
			day = first(rounds[k].days)
			seen = findall(<=(day), known.date)
			prices = (; symbol = known.symbol[seen], date = known.date[seen], price = known.price[seen])
			answer = PC.Tables.columntable(Base.invokelatest(decide, prices, day))
			for name in (:symbol, columns..., :decision)
				haskey(answer, name) || error(string("Round ", k, ": decide gave no column ", name, "; it must give symbol, rank1 to rank5 and decision."))
			end
			row_of = Dict(String(s) => i for (i, s) in enumerate(answer.symbol))
			absent = [a for a in assets if !haskey(row_of, a)]
			isempty(absent) || error(string("Round ", k, ": decide gave no row for ", join(absent[1:min(5, end)], ", "), length(absent) > 5 ? " and others." : "."))
			for a in assets
				i = row_of[a]
				p = Float64[getproperty(answer, c)[i] for c in columns]
				all(x -> 0 <= x <= 1, p) && abs(sum(p) - 1) <= 1e-6 ||
					error(string("Round ", k, ", ", a, ": the five probabilities must each be from 0 to 1 and add up to 1."))
				push!(submitted.evaluation, k); push!(submitted.symbol, a); push!(submitted.decision, Float64(answer.decision[i]))
				for (c, v) in zip(columns, p)
					push!(getproperty(submitted, c), v)
				end
			end
			invested = sum(abs, submitted.decision[submitted.evaluation .== k])
			0.25 - 1e-9 <= invested <= 1 + 1e-9 || error(string("Round ", k, ": the absolute weights add up to ", round(invested; digits = 4), "; M6 asks for 0.25 to 1."))
			write_json("${PROGRESS_FILE}", Dict("done" => k, "total" => length(rounds), "seconds" => time() - started, "failed" => 0))
			println("Round ", k, " of ", length(rounds), " decided")
		end
		open(joinpath(run, "${FORECASTS_FILE}"), "w") do io
			println(io, "evaluation,symbol,decision,rank1,rank2,rank3,rank4,rank5")
			for i in eachindex(submitted.symbol)
				println(io, join([submitted.evaluation[i], submitted.symbol[i], repr(submitted.decision[i]), [repr(getproperty(submitted, c)[i]) for c in columns]...], ","))
			end
		end
		println("Scoring the submissions")
		scores = PC.score(id, submitted)
		pick(measure, breakdown, level) = (found = findfirst(i -> scores.measure[i] == measure && scores.breakdown[i] == breakdown && scores.level[i] == level, eachindex(scores.value)); found === nothing ? nothing : scores.value[found])
		published = PC.published_scores(id)
		lookup = Dict((published.entry[i], published.measure[i], published.breakdown[i], published.level[i]) => published.value[i] for i in eachindex(published.entry))
		at(entry, measure, breakdown, level) = get(lookup, (entry, measure, breakdown, level), nothing)
		entries = PC.entries(id)
		# The teams the organisers ranked over the year, and the method among them. As in the organisers' leaderboard, OR is
		# the mean of the ranks by RPS (lowest first) and by IR (highest first), of the scores to six decimals, teams with the
		# same score sharing the mean of their places; the teams' scores are computed from their submissions, as the leaderboard
		# gives them to five decimals only
		println("Scoring the teams")
		teams = PC.scores(id)
		full = Dict((teams.entry[i], teams.measure[i], teams.breakdown[i], teams.level[i]) => teams.value[i] for i in eachindex(teams.entry))
		ranked = [k for k in eachindex(entries.entry) if at(entries.entry[k], "OR", "global", "Total") !== nothing && haskey(full, (entries.entry[k], "RPS", "global", "Total"))]
		rps = round.([[full[(entries.entry[k], "RPS", "global", "Total")] for k in ranked]; pick("RPS", "global", "Total")]; digits = 6)
		ir = round.([[full[(entries.entry[k], "IR", "global", "Total")] for k in ranked]; pick("IR", "global", "Total")]; digits = 6)
		places(values, better) = [count(v -> better(v, x), values) + (count(==(x), values) + 1) / 2 for x in values]
		overall = (places(rps, <) .+ places(ir, >)) ./ 2
		mine = Dict("RPS" => rps[end], "IR" => ir[end], "OR" => overall[end])
		name_of(k) = coalesce(entries.team[k], entries.name[k])
		rows = [Dict("name" => name_of(k), "kind" => entries.kind[k], "value" => overall[i], "method" => false) for (i, k) in enumerate(ranked)]
		push!(rows, Dict("name" => "Your Method", "kind" => "method", "value" => overall[end], "method" => true))
		sort!(rows; by = r -> (r["value"], !r["method"]))
		ranking = Dict("measure" => "OR", "place" => findfirst(r -> r["method"], rows), "of" => length(rows), "rows" => rows)
		dummy = findfirst(==("benchmark"), entries.kind)
		benchmarks = Dict{String, Any}[]
		if dummy !== nothing
			d = findfirst(==(dummy), ranked)
			push!(benchmarks, Dict("name" => name_of(dummy), "source" => "published", "scores" => Dict("RPS" => at(entries.entry[dummy], "RPS", "global", "Total"),
				"IR" => at(entries.entry[dummy], "IR", "global", "Total"), "OR" => d === nothing ? nothing : overall[d])))
		end
		by_round = [Dict("round" => k, "method" => Dict("RPS" => pick("RPS", "month", string(k)), "IR" => pick("IR", "month", string(k))),
			"benchmark" => dummy === nothing ? nothing : Dict("RPS" => at(entries.entry[dummy], "RPS", "month", string(k)), "IR" => at(entries.entry[dummy], "IR", "month", string(k))))
			for k in eachindex(rounds)]
		write_json("${RESULTS_FILE}", Dict("finished" => Libc.strftime("%Y-%m-%d %H:%M", time()), "series" => length(assets), "whole" => true, "level" => "Total",
			"measures" => ["RPS", "IR", "OR"], "method" => mine, "benchmarks" => benchmarks, "ranking" => ranking, "plot" => nothing, "rounds" => by_round,
			"benchmarkName" => dummy === nothing ? nothing : name_of(dummy), "seconds" => time() - started))
		println("Results in ", joinpath(run, "${RESULTS_FILE}"))
	catch err
		write_json("${RESULTS_FILE}", Dict("error" => sprint(showerror, err)))
		println("The run stopped: ", sprint(showerror, err))
	end
end`;
}

/**
 * run.jl of a run: runs forecast of method.jl on each series chosen, over Julia's threads, writes the forecasts and
 * scores them with PollisCompetitions.jl beside the benchmarks, and ranks them among the entries when the run is of the
 * whole competition or of a whole frequency of M4, or of M5; then writes results.json, which step 4 draws.
 */
function runScript(folder: URI): string {
	return String.raw`# Forecasting Competitions: the method of method.jl on the series of run.toml, scored as the competition's
# organisers scored the entries; progress.json while it runs, then forecasts.csv and results.json
import Pkg
Base.find_package("PollisCompetitions") === nothing && Pkg.add("PollisCompetitions")
import PollisCompetitions as PC, Random, TOML
let run = raw"${folder.fsPath}"
${JULIA_JSON}
	settings = TOML.parsefile(joinpath(run, "${RUN_FILE}"))
	id, frequency, sample, seed = settings["competition"], settings["frequency"], settings["sample"], settings["seed"]
	measures = id == "m5" ? ["WRMSSE"] : ["sMAPE", "MASE", "OWA"]
	breakdown, level = id == "m5" ? ("level", "Total") : ("frequency", isempty(frequency) ? "Total" : frequency)
${JULIA_WINNER}
	try
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
		pick(scores) = Dict(m => only(scores.value[(scores.measure .== m) .& (scores.breakdown .== breakdown) .& (scores.level .== level)]) for m in measures)
		mine = pick(PC.score(id, table))
		entries = id in ("m4", "m5") ? PC.entries(id) : nothing
		ranked = entries !== nothing && whole
		benchmarks = Dict{String, Any}[]
		ranking = nothing
		if ranked
			# The published scores of the entries, on the same series
			published = PC.published_scores(id)
			at(entry, m) = (k = findfirst(i -> published.entry[i] == entry && published.measure[i] == m && published.breakdown[i] == breakdown && published.level[i] == level, eachindex(published.entry)); k === nothing ? nothing : published.value[k])
			scored = [(entry = e, name = nm, kind = kd) for (e, nm, kd, f) in zip(entries.entry, entries.name, entries.kind, entries.forecasts) if f == "point"]
			for e in scored
				e.kind == "benchmark" && push!(benchmarks, Dict("name" => e.name, "source" => "published", "scores" => Dict(m => at(e.entry, m) for m in measures)))
			end
			measure = id == "m5" ? "WRMSSE" : "OWA"
			rows = [Dict("name" => e.name, "kind" => e.kind, "value" => at(e.entry, measure), "method" => false) for e in scored if at(e.entry, measure) !== nothing]
			push!(rows, Dict("name" => "Your Method", "kind" => "method", "value" => mine[measure], "method" => true))
			sort!(rows; by = r -> (r["value"], !r["method"]))
			ranking = Dict("measure" => measure, "place" => findfirst(r -> r["method"], rows), "of" => length(rows), "rows" => rows)
		elseif id == "m4"
			# The benchmarks computed on the same series, with PollisCompetitions.M4Benchmarks
			println("Computing the benchmarks on the same series")
			computed = PC.benchmarks(id; series = numbers)
			for m in PC.M4_BENCHMARKS
				k = computed.method .== m
				push!(benchmarks, Dict("name" => m, "source" => "computed", "scores" => pick(PC.score(id, (; series = computed.series[k], h = computed.h[k], value = computed.value[k])))))
			end
		elseif id != "m5"
			# Naive2, against which OWA weighs the method
			reference = [PC.naive2(Float64.(seen.value[starts[k]:stops[k]]), period[numbers[k]], horizon[numbers[k]]) for k in 1:n]
			naive2 = (; series = table.series, h = reduce(vcat, [collect(eachindex(f)) for f in reference]), value = reduce(vcat, reference))
			push!(benchmarks, Dict("name" => "Naive2", "source" => "computed", "scores" => pick(PC.score(id, naive2))))
		end
		# A series to plot: the first chosen, with the winner's forecast when it is on this computer
		s = numbers[1]
		past = Float64.(seen.value[starts[1]:stops[1]])
		past = past[max(1, end - 3 * horizon[s] + 1):end]
		plot = Dict("series" => name[s], "past" => past, "actual" => PC.observations(id; series = s, split = "test").value, "forecast" => forecasts[1], "winner" => winner_forecast(s))
		write_json("${RESULTS_FILE}", Dict("finished" => Libc.strftime("%Y-%m-%d %H:%M", time()), "series" => n, "whole" => whole, "level" => level,
			"measures" => measures, "method" => mine, "benchmarks" => benchmarks, "ranking" => ranking, "plot" => plot, "seconds" => time() - started))
		println("Results in ", joinpath(run, "${RESULTS_FILE}"))
	catch err
		write_json("${RESULTS_FILE}", Dict("error" => sprint(showerror, err)))
		println("The run stopped: ", sprint(showerror, err))
	end
end`;
}

/** Opens the Forecasting Competitions page, or shows it when it is open. */
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

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('competitions.title', "Forecasting Competitions");
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

	/** The run shown in steps 3 and 4, once started or opened; its folder is watched. */
	let current: URI | undefined;
	/** The run Compare Two Runs sets beside the current one, if any. */
	let other: URI | undefined;
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	// The folder of the competitions, for a download that ends, and the current run's, for the files it writes
	const competitionsWatcher = disposables.add(fileService.createWatcher(competitionsFolder, { recursive: false, excludes: [] }));
	disposables.add(competitionsWatcher.onDidChange(() => refresh.schedule()));
	const runWatcher = disposables.add(new MutableDisposable<DisposableStore>());
	const watch = (folder: URI | undefined) => {
		current = folder;
		other = undefined;
		if (!folder) {
			runWatcher.clear();
			return;
		}
		const store = new DisposableStore();
		const fileWatcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
		store.add(fileWatcher.onDidChange(() => refresh.schedule()));
		runWatcher.value = store;
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
		const downloaded = await Promise.all(COMPETITIONS.map(c => fileService.exists(joinPath(competitionsFolder, c.id, 'info.toml'))));
		const run = current && await readRun(fileService, current);
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
			downloaded: Object.fromEntries(COMPETITIONS.map((c, i) => [c.id, downloaded[i]])),
			runs: await runNames(),
			run: current && run && {
				name: current.path.split('/').pop(),
				...run,
				code,
				progress: await readJson(fileService, joinPath(current, PROGRESS_FILE)),
				results: await readJson(fileService, joinPath(current, RESULTS_FILE)),
				hasForecasts: await fileService.exists(joinPath(current, FORECASTS_FILE)),
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

	/** Writes the run's folder and sends run.jl to the Julia REPL. */
	const startRun = async (inputs: IRunInputs) => {
		const competition = COMPETITIONS.find(c => c.id === inputs.competition)!;
		if (!await fileService.exists(joinPath(competitionsFolder, competition.id, 'info.toml'))) {
			post({ command: 'runProblem', text: localize('competitions.notDownloaded', "{0} is not on this computer yet: download it in step 1 first.", competition.name) });
			return;
		}
		const defines = new RegExp(`\\bfunction\\s+${competition.method}\\s*\\(|\\b${competition.method}\\s*\\([^)]*\\)\\s*=`);
		if (!defines.test(inputs.code)) {
			post({
				command: 'runProblem', text: competition.method === 'decide'
					? localize('competitions.noDecide', "Your method for M6 must define a function decide(prices, date).")
					: localize('competitions.noFunction', "Your method must define a function forecast(y, h, period).")
			});
			return;
		}
		const now = new Date();
		const stamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
		const folder = joinPath(runsFolder, `${competition.id}${inputs.frequency ? '-' + inputs.frequency.toLowerCase() : ''}-${stamp}`);
		await fileService.writeFile(joinPath(folder, RUN_FILE), VSBuffer.fromString(runToml(inputs, now.toISOString().slice(0, 16).replace('T', ' '))));
		await fileService.writeFile(joinPath(folder, METHOD_FILE), VSBuffer.fromString(inputs.code));
		await fileService.writeFile(joinPath(folder, SCRIPT_FILE), VSBuffer.fromString(competition.method === 'decide' ? m6RunScript(folder) : runScript(folder)));
		watch(folder);
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
			} else if (message.command === 'download' && hasKey(message, { competition: true }) && COMPETITIONS.some(c => c.id === message.competition)) {
				await sendToJuliaRepl(downloadCode(message.competition), commandService);
				post({ command: 'downloading', competition: message.competition });
			} else if (message.command === 'run' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs);
				if (inputs) {
					await startRun(inputs);
				}
			} else if (message.command === 'load' && hasKey(message, { name: true }) && /^[a-z0-9-]+$/.test(message.name)) {
				watch(joinPath(runsFolder, message.name));
				await sendState();
			} else if (message.command === 'compareWith' && hasKey(message, { name: true }) && current) {
				other = /^[a-z0-9-]+$/.test(message.name) ? joinPath(runsFolder, message.name) : undefined;
				await sendState();
			} else if (message.command === 'diffMethods' && current && other) {
				await editorService.openEditor({ original: { resource: joinPath(other, METHOD_FILE) }, modified: { resource: joinPath(current, METHOD_FILE) } });
			} else if (message.command === 'newRun') {
				watch(undefined);
				await sendState();
			} else if (message.command === 'open' && hasKey(message, { what: true }) && current) {
				const file = { method: METHOD_FILE, forecasts: FORECASTS_FILE, script: SCRIPT_FILE }[message.what];
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
		intro: localize('competitions.intro', "Forecasting Competitions runs a forecasting method of your own on the series of a competition, M1, M3, M4, M5 Accuracy or M6, scores its forecasts with the competition's own measures, as its organisers scored the entries, and shows where it would have finished among them. The series come with the split the forecasters had: the values they saw, and the values their forecasts were scored on; in M6, the prices of its 100 assets up to each round."),
		competition: localize('competitions.competition', "Competition"),
		series: localize('competitions.series', "Series"),
		frequencies: localize('competitions.frequencies', "Frequencies and Horizons"),
		measures: localize('competitions.measures', "Measures"),
		entries: localize('competitions.entries', "Entries"),
		onComputer: localize('competitions.onComputer', "On This Computer"),
		yes: localize('competitions.yes', "Yes"),
		download: localize('competitions.download', "Download"),
		downloadHint: localize('competitions.downloadHint', "Download fetches the competition from its source in the Julia REPL, checks every file against its SHA-256 and converts it into {0}. It installs PollisCompetitions.jl first if it is not installed.", '<span class="yellow">~/.pollis/competitions</span>'),
		downloading: localize('competitions.downloading', "Sent to the Julia REPL: the competition shows as on this computer once it is downloaded."),
		frequency: localize('competitions.frequency', "Frequency"),
		allFrequencies: localize('competitions.allFrequencies', "All"),
		seriesToRun: localize('competitions.seriesToRun', "Series to Run"),
		allSeries: localize('competitions.allSeries', "All"),
		sampleOf: localize('competitions.sampleOf', "A Sample of"),
		seed: localize('competitions.seed', "Seed"),
		sampleHint: localize('competitions.sampleHint', "A sample is drawn with the seed, so that the same seed gives the same series. A run of all the series of the competition, or of one frequency of M4, is ranked among the entries; a sample is scored beside the benchmarks, computed on the same series."),
		yourMethod: localize('competitions.yourMethod', "Your Method"),
		methodHintDecide: localize('competitions.methodHintDecide', "A Julia function decide(prices, date) that, at each of the 12 rounds of M6, gets the prices of the 100 assets up to the first day of the round and returns, for each asset, the probabilities that its return over the next four weeks ranks in each fifth of the 100, and the weight invested in it. The run checks every answer against the rules of M6. The example is M6 Dummy, the benchmark: equal probabilities and equal weights."),
		progressRounds: localize('competitions.progressRounds', "{0} of {1} rounds decided, {2} s"),
		finishedRounds: localize('competitions.finishedRounds', "{0} assets over 12 rounds, finished {1}."),
		byRound: localize('competitions.byRound', "By Round"),
		round: localize('competitions.round', "Round"),
		methodHint: localize('competitions.methodHint', "A Julia function forecast(y, h, period) that returns h forecasts of the series y, whose seasonal period is period. It runs on each series on its own, over Julia's threads when the REPL has several. The example is the benchmark Theta of M4."),
		reset: localize('competitions.reset', "Reset to the Example"),
		run: localize('competitions.run', "Run"),
		runHint: localize('competitions.runHint', "Run writes the run's folder in {0} and runs it in the Julia REPL: the method on every series chosen, then the scores. The progress shows here as it runs.", '<span class="yellow" id="root"></span>'),
		start: localize('competitions.start', "Run the Method"),
		earlier: localize('competitions.earlier', "Earlier runs..."),
		newRun: localize('competitions.newRun', "New Run"),
		running: localize('competitions.running', "Sent to the Julia REPL."),
		progress: localize('competitions.progress', "{0} of {1} series forecast, {2} s"),
		failedSeries: localize('competitions.failedSeries', "{0} series not forecast"),
		noRun: localize('competitions.noRun', "No run yet: choose the competition and the method, then run it."),
		openMethod: localize('competitions.openMethod', "method.jl"),
		openScript: localize('competitions.openScript', "run.jl"),
		openForecasts: localize('competitions.openForecasts', "forecasts.csv"),
		scoreAndRank: localize('competitions.scoreAndRank', "Score and Rank"),
		resultsHint: localize('competitions.resultsHint', "The scores show here once the run ends."),
		finished: localize('competitions.finished', "{0} series, finished {1}."),
		stopped: localize('competitions.stopped', "The run stopped: {0}"),
		scores: localize('competitions.scores', "Scores"),
		method: localize('competitions.method', "Your Method"),
		benchmark: localize('competitions.benchmark', "Benchmark"),
		published: localize('competitions.published', "Published"),
		computed: localize('competitions.computed', "Computed on the same series"),
		source: localize('competitions.source', "Source"),
		place: localize('competitions.place', "Place"),
		placeText: localize('competitions.placeText', "Place {0} of {1} by {2} ({3}), among the entries' published scores."),
		notRanked: localize('competitions.notRanked', "Not ranked: the entries' published scores are of the whole competition and of each frequency of M4. Run all the series, or a whole frequency of M4, to be ranked."),
		noEntries: localize('competitions.noEntries', "Not ranked: PollisCompetitions.jl has no entries of {0} yet, so the method is scored beside Naive2."),
		entry: localize('competitions.entry', "Entry"),
		kind: localize('competitions.kind', "Kind"),
		kinds: {
			submission: localize('competitions.submission', "Submission"),
			benchmark: localize('competitions.benchmarkKind', "Benchmark"),
			standard: localize('competitions.standard', "Standard"),
			method: localize('competitions.methodKind', "Yours"),
		},
		aSeries: localize('competitions.aSeries', "A Series"),
		plotHint: localize('competitions.plotHint', "The first series of the run: its last values, the values it was scored on, your method's forecast and, when its forecasts are on this computer, the winner's."),
		actual: localize('competitions.actual', "Actual"),
		winner: localize('competitions.winner', "Winner: {0}"),
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
		entryStep: localize('competitions.entryStep', "Compare With an Entry"),
		listEntries: localize('competitions.listEntries', "List the Entries"),
		compare: localize('competitions.compare', "Compare"),
		entryLabel: localize('competitions.entryLabel', "Entry"),
		rankText: localize('competitions.rankText', "rank {0}"),
		downloadedText: localize('competitions.downloadedText', "on this computer"),
		entryDownloadHint: localize('competitions.entryDownloadHint', "Compare downloads the entry's forecasts first when they are not on this computer: about 8 MB for an entry of M4, and about 22 MB for one of M5 Accuracy."),
		comparedText: localize('competitions.comparedText', "Your method beside {0} on the {1} series of the run, at {2}."),
		entryColumn: localize('competitions.entryColumn', "The Entry"),
		level: localize('competitions.level', "Level"),
		betterCount: localize('competitions.betterCount', "Your Method Better"),
		worseCount: localize('competitions.worseCount', "The Entry Better"),
		entryBetter: localize('competitions.entryBetter', "Where the Entry Does Better"),
		methodBetter: localize('competitions.methodBetter', "Where Your Method Does Better"),
		relativeToEntry: localize('competitions.relativeToEntry', "MASE Relative to the Entry"),
		pairHint: localize('competitions.pairHint', "The 50 series with the largest and the smallest MASE of your method relative to the entry's. A series' name opens it in Browse the Series."),
		runsStep: localize('competitions.runsStep', "Compare Two Runs"),
		otherRun: localize('competitions.otherRun', "The Other Run"),
		chooseRun: localize('competitions.chooseRun', "Choose a run..."),
		thisRun: localize('competitions.thisRun', "This Run"),
		noOtherRuns: localize('competitions.noOtherRuns', "There is no other finished run yet: run another method, or the same one again, on the same series."),
		notSameSeries: localize('competitions.notSameSeries', "The two runs are not on the same series: a run is compared with another of the same competition, frequency, sample and seed. {0} is {1}, the other is {2}."),
		otherNotDone: localize('competitions.otherNotDone', "The other run has no scores yet: it is still running, or it stopped."),
		runSettings: localize('competitions.runSettings', "{0}, {1}, {2}"),
		allSeriesText: localize('competitions.allSeriesText', "all series"),
		sampleText: localize('competitions.sampleText', "a sample of {0} with seed {1}"),
		placeRow: localize('competitions.placeRow', "Place"),
		placeOf: localize('competitions.placeOf', "{0} of {1}"),
		secondsRow: localize('competitions.secondsRow', "Seconds"),
		diffMethods: localize('competitions.diffMethods', "Compare method.jl"),
		nextIntro: {
			runs: localize('competitions.runsIntro', "This run beside another of your runs on the same series, such as two methods, or two versions of one, run with the same competition, frequency, sample and seed: their scores, their places among the entries when ranked, the time each took, and the differences between their method.jl."),
			entry: localize('competitions.entryIntro', "Your method beside one entry of the competition, a submission or a benchmark, on the same series: their scores, and for M4 how often each forecasts a series better and where they differ most, or for M5 their WRMSSE at each of the 12 levels."),
			fails: localize('competitions.failsIntro', "The sMAPE and the MASE of each series of the run, of your method and of Naive2, and each relative to Naive2's: how many series your method forecasts better than Naive2, and the series where it does worst."),
			series: localize('competitions.browseIntro', "One series of the run at a time: the values the forecasters saw, the values it was scored on, your method's forecast, a benchmark of M4 computed on the series, and the winner's forecast when it is on this computer. Show finds a series by its name; Previous and Next go through the series of the run in order."),
			horizon: localize('competitions.horizonIntro', "The sMAPE and the MASE of your method and of Naive2 at each step ahead, means over the series of each frequency: how fast the errors grow with the horizon, beside those of the benchmark against which OWA weighs the method."),
		},
		nextOnly: {
			series: '',
			runs: '',
			entry: localize('competitions.entryOnly', "Compare With an Entry is for M4 and M5: PollisCompetitions.jl has no entries of M1 and M3."),
			fails: localize('competitions.failsOnly', "Where It Fails is for M1, M3 and M4: M5 is scored by the WRMSSE of its 12 levels."),
			horizon: localize('competitions.horizonOnly', "Errors by Horizon is for M1, M3 and M4: M5 is scored by the WRMSSE of its 12 levels."),
		},
	};
	return buildWebviewHtml({
		title: localize('competitions.title', "Forecasting Competitions"),
		introHtml: text.intro,
		omitPoweredBy: !FORECASTINGCOMPETITIONS_METADATA.forecastingCompetitions.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=number] { font: inherit; width: 7em; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; }
		${codeEditorCss}
		table.fc { width: auto; max-width: 100%; }
		table.fc tr.mine td { font-weight: 600; }
		.fc-ranking { max-height: 360px; overflow-y: auto; display: inline-block; }
		.fc-plot { max-width: 900px; margin: 8px 0 16px 0; }
		.fc-plot text { fill: var(--vscode-foreground); font-size: 11px; font-family: var(--vscode-font-family); }
		.fc-plot .axis { stroke: var(--vscode-widget-border); }
		.fc-plot .past, .fc-plot .actual { fill: none; stroke: var(--vscode-foreground); stroke-width: 1.5; }
		.fc-plot .actual { stroke-dasharray: 2 2; }
		.fc-plot .forecast { fill: none; stroke: var(--vscode-textLink-foreground); stroke-width: 2; }
		.fc-plot .winner { fill: none; stroke: var(--vscode-descriptionForeground); stroke-width: 1.5; stroke-dasharray: 5 3; }
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
				title: text.competition,
				bodyHtml: `
		<table class="fc">
			<thead><tr><th></th><th>${text.competition}</th><th class="number">${text.series}</th><th>${text.frequencies}</th><th>${text.measures}</th><th>${text.entries}</th><th>${text.onComputer}</th></tr></thead>
			<tbody id="competitions"></tbody>
		</table>
		<p class="hint">${text.downloadHint}</p>
		<div class="small status" id="downloadStatus"></div>
		<div class="row" id="frequencyRow"><span class="small">${text.frequency}</span> <select id="frequency"></select></div>
		<div class="row" id="sampleRow"><span class="small">${text.seriesToRun}</span>
			<label><input type="radio" name="scope" value="all" checked> ${text.allSeries}</label>
			<label><input type="radio" name="scope" value="sample"> ${text.sampleOf}</label> <input type="number" id="sample" min="1" value="1000">
			<span class="small">${text.seed}</span> <input type="number" id="seed" value="1">
		</div>
		<p class="hint" id="sampleHint">${text.sampleHint}</p>
		<p class="hint" id="wholeOnly" hidden></p>
`,
			},
			{
				id: 'step-method',
				title: text.yourMethod,
				bodyHtml: `
		<p class="hint" id="methodHint">${text.methodHint}</p>
		<p class="hint" id="methodHintDecide" hidden>${text.methodHintDecide}</p>
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
				title: text.scoreAndRank,
				bodyHtml: `
		<p class="hint" id="resultsHint">${text.resultsHint}</p>
		<div id="results" hidden>
			<p class="small" id="finished"></p>
			<h3 class="part">${text.scores}</h3>
			<table class="fc"><thead id="scoreHead"></thead><tbody id="scoreRows"></tbody></table>
			<h3 class="part">${text.place}</h3>
			<p id="placeText"></p>
			<div class="fc-ranking" id="ranking"></div>
			<div id="roundsPart" hidden>
				<h3 class="part">${text.byRound}</h3>
				<div id="byRound"></div>
			</div>
			<div id="seriesPart">
				<h3 class="part">${text.aSeries}</h3>
				<p class="hint">${text.plotHint}</p>
				<div class="fc-legend small" id="legend"></div>
				<div class="fc-plot" id="plot"></div>
			</div>
		</div>
`,
			},
		],
		nextStepsHtml: `					<li><button class="list-btn panel-toggle" id="btn-horizon">${nextStepIcon('visualise')}${text.horizon}</button></li>
					<li><button class="list-btn panel-toggle" id="btn-series">${nextStepIcon('visualise')}${text.browse}</button></li>
					<li><button class="list-btn panel-toggle" id="btn-fails">${nextStepIcon('diagnose')}${text.fails}</button></li>
					<li><button class="list-btn panel-toggle" id="btn-entry">${nextStepIcon('compare')}${text.entryStep}</button></li>
					<li><button class="list-btn panel-toggle" id="btn-runs">${nextStepIcon('compare')}${text.runsStep}</button></li>`,
		// The panels on the right, opened as the scaffold opens its own, which the page's script then fills
		nextStepsWiringJs: `${openPageStepJs}
		document.getElementById('btn-horizon').addEventListener('click', function() {
			openPageStep(this, 'horizonStep', ${JSON.stringify(text.horizon)}, 'pollis-horizon-step');
		});
		document.getElementById('btn-series').addEventListener('click', function() {
			openPageStep(this, 'seriesStep', ${JSON.stringify(text.browse)}, 'pollis-series-step');
		});
		document.getElementById('btn-fails').addEventListener('click', function() {
			openPageStep(this, 'failsStep', ${JSON.stringify(text.fails)}, 'pollis-fails-step');
		});
		document.getElementById('btn-entry').addEventListener('click', function() {
			openPageStep(this, 'entryStep', ${JSON.stringify(text.entryStep)}, 'pollis-entry-step');
		});
		document.getElementById('btn-runs').addEventListener('click', function() {
			openPageStep(this, 'runsStep', ${JSON.stringify(text.runsStep)}, 'pollis-runs-step');
		});`,
		pageScriptJs: `
	${colorizeBracketsJs}
	${codeEditorJs}
	const TEXT = ${JSON.stringify(text)};
	const COMPETITIONS = ${JSON.stringify(COMPETITIONS)};
	const EXAMPLE = ${JSON.stringify(EXAMPLE_METHOD)};
	const EXAMPLES = { forecast: EXAMPLE, decide: ${JSON.stringify(EXAMPLE_DECIDE)} };
	const code = document.getElementById('code');
	const frequency = document.getElementById('frequency');
	const sample = document.getElementById('sample');
	const seed = document.getElementById('seed');
	const earlier = document.getElementById('earlier');
	let state = undefined;
	let selected = 'm4';

	function escapeHtml(value) {
		return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	}
	function format(x, measure) {
		if (typeof x !== 'number' || !isFinite(x)) {
			return '';
		}
		// M6 published its RPS and IR to five decimals, and its OR, a mean of two ranks that teams may share, in quarters
		return measure === 'RPS' || measure === 'IR' ? x.toFixed(5) : measure === 'OR' ? String(Math.round(x * 4) / 4) : x.toFixed(3);
	}
	function competition() {
		return COMPETITIONS.find(c => c.id === selected);
	}
	function scope() {
		const radio = document.querySelector('input[name=scope]:checked');
		return radio ? radio.value : 'all';
	}
	function locked() {
		return !!(state && state.run);
	}

	function drawCompetitions() {
		document.getElementById('competitions').innerHTML = COMPETITIONS.map(c => {
			const total = c.frequencies.reduce((sum, f) => sum + f.series, 0);
			const frequencies = c.summary ? escapeHtml(c.summary) : c.frequencies.map(f => escapeHtml(f.name) + ' (' + f.horizon + ')').join(', ');
			const onComputer = state && state.downloaded[c.id] ? escapeHtml(TEXT.yes) : '<button class="link" data-download="' + c.id + '">' + escapeHtml(TEXT.download) + '</button>';
			return '<tr><td><input type="radio" name="competition" value="' + c.id + '"' + (c.id === selected ? ' checked' : '') + (locked() ? ' disabled' : '') + '></td><td>' + escapeHtml(c.name) + '</td><td class="number">' + total.toLocaleString() + '</td><td class="small">' + frequencies + '</td><td>' + escapeHtml(c.measures) + '</td><td class="small">' + escapeHtml(c.entries) + '</td><td>' + onComputer + '</td></tr>';
		}).join('');
	}
	function drawChoices() {
		const c = competition();
		const value = frequency.value;
		frequency.innerHTML = (c.frequencies.length > 1 ? '<option value="">' + escapeHtml(TEXT.allFrequencies) + '</option>' : '') + c.frequencies.map(f => '<option value="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</option>').join('');
		frequency.value = c.frequencies.some(f => f.name === value) ? value : (c.frequencies.length > 1 ? '' : c.frequencies[0].name);
		document.getElementById('frequencyRow').hidden = c.frequencies.length < 2;
		document.getElementById('sampleRow').hidden = !c.sampling;
		document.getElementById('sampleHint').hidden = !c.sampling;
		document.getElementById('wholeOnly').hidden = c.sampling;
		document.getElementById('wholeOnly').textContent = c.wholeNote || '';
		document.getElementById('methodHint').hidden = c.method !== 'forecast';
		document.getElementById('methodHintDecide').hidden = c.method !== 'decide';
		for (const field of [frequency, sample, seed, code, ...document.querySelectorAll('input[name=scope]')]) {
			field.disabled = locked();
		}
		document.getElementById('reset').disabled = locked();
		sample.disabled = locked() || scope() !== 'sample';
	}

	function inputs() {
		const c = competition();
		return { competition: c.id, frequency: c.frequencies.length > 1 ? frequency.value : '', sample: c.sampling && scope() === 'sample' ? Math.max(1, Math.round(Number(sample.value) || 1)) : 0, seed: Math.round(Number(seed.value) || 0), code: code.value };
	}

	function drawRun() {
		const run = state.run;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlier) + '</option>' + state.runs.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = run ? run.name : '';
		// Only when there is a run to open: before the first run, the list would hold its title alone
		earlier.hidden = !state.runs.length;
		document.getElementById('newRun').hidden = !run;
		document.getElementById('start').disabled = !!run;
		const status = document.getElementById('runStatus');
		const links = document.getElementById('runLinks');
		if (!run) {
			status.textContent = TEXT.noRun;
			links.innerHTML = '';
			return;
		}
		const p = run.progress;
		let line = p ? (run.competition === 'm6' ? TEXT.progressRounds : TEXT.progress).replace('{0}', p.done.toLocaleString()).replace('{1}', p.total.toLocaleString()).replace('{2}', Math.round(p.seconds)) : TEXT.running;
		if (p && p.failed) {
			line += ' · ' + TEXT.failedSeries.replace('{0}', p.failed);
		}
		status.textContent = line;
		links.innerHTML = '<button class="link" data-open="method">' + TEXT.openMethod + '</button><button class="link" data-open="script">' + TEXT.openScript + '</button>' + (run.hasForecasts ? '<button class="link" data-open="forecasts">' + TEXT.openForecasts + '</button>' : '');
	}

	/** The last values of the series, the values it was scored on, and the forecasts, on one time axis. */
	function plot(p) {
		const past = p.past || [], actual = p.actual || [], forecast = p.forecast || [], winner = p.winner ? p.winner.values : [], benchmark = p.benchmark || [];
		const all = past.concat(actual, forecast, winner, benchmark).filter(v => typeof v === 'number' && isFinite(v));
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
		svg += path(winner, past.length, 'winner') + path(benchmark, past.length, 'benchmark') + path(forecast, past.length, 'forecast');
		return svg + '</svg>';
	}

	/** The legend of a plot of a series: its name, and the lines drawn. */
	function legendHtml(name, winner, benchmarkName) {
		return '<span>' + escapeHtml(name) + '</span><span>' + escapeHtml(TEXT.actual) + ' &middot;&middot;&middot;</span><span style="color: var(--vscode-textLink-foreground)">' + escapeHtml(TEXT.method) + '</span>'
			+ (benchmarkName ? '<span style="color: var(--vscode-charts-orange)">' + escapeHtml(benchmarkName) + '</span>' : '')
			+ (winner ? '<span>' + escapeHtml(TEXT.winner.replace('{0}', winner.name)) + ' - - -</span>' : '');
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
		document.getElementById('finished').textContent = (results.rounds ? TEXT.finishedRounds : TEXT.finished).replace('{0}', results.series.toLocaleString()).replace('{1}', results.finished);
		const measures = results.measures;
		document.getElementById('scoreHead').innerHTML = '<tr><th></th>' + measures.map(m => '<th class="number">' + escapeHtml(m) + '</th>').join('') + '<th>' + TEXT.source + '</th></tr>';
		const row = (name, scores, source, mine) => '<tr' + (mine ? ' class="mine"' : '') + '><td>' + escapeHtml(name) + '</td>' + measures.map(m => '<td class="number">' + format(scores[m], m) + '</td>').join('') + '<td class="small">' + escapeHtml(source) + '</td></tr>';
		document.getElementById('scoreRows').innerHTML = row(TEXT.method, results.method, '', true) + results.benchmarks.map(b => row(b.name, b.scores, b.source === 'published' ? TEXT.published : TEXT.computed, false)).join('');
		const c = COMPETITIONS.find(x => x.id === run.competition);
		const ranking = results.ranking;
		document.getElementById('placeText').textContent = ranking
			? TEXT.placeText.replace('{0}', ranking.place).replace('{1}', ranking.of).replace('{2}', ranking.measure).replace('{3}', results.level)
			: (c && c.ranked ? TEXT.notRanked : TEXT.noEntries.replace('{0}', c ? c.name : run.competition));
		document.getElementById('ranking').innerHTML = ranking
			? '<table class="fc"><thead><tr><th class="number">' + TEXT.place + '</th><th>' + TEXT.entry + '</th><th>' + TEXT.kind + '</th><th class="number">' + escapeHtml(ranking.measure) + '</th></tr></thead><tbody>'
				+ ranking.rows.map((r, i) => '<tr' + (r.method ? ' class="mine"' : '') + '><td class="number">' + (i + 1) + '</td><td>' + escapeHtml(r.method ? TEXT.method : r.name) + '</td><td class="small">' + escapeHtml(TEXT.kinds[r.kind] || r.kind) + '</td><td class="number">' + format(r.value, ranking.measure) + '</td></tr>').join('')
				+ '</tbody></table>'
			: '';
		const rounds = results.rounds;
		document.getElementById('roundsPart').hidden = !rounds;
		document.getElementById('byRound').innerHTML = rounds
			? '<table class="fc"><thead><tr><th class="number">' + TEXT.round + '</th><th class="number">RPS</th><th class="number">IR</th>'
				+ (results.benchmarkName ? '<th class="number">' + escapeHtml(results.benchmarkName) + ' RPS</th><th class="number">' + escapeHtml(results.benchmarkName) + ' IR</th>' : '') + '</tr></thead><tbody>'
				+ rounds.map(r => '<tr><td class="number">' + r.round + '</td><td class="number">' + format(r.method.RPS, 'RPS') + '</td><td class="number">' + format(r.method.IR, 'IR') + '</td>'
					+ (results.benchmarkName ? '<td class="number">' + format(r.benchmark && r.benchmark.RPS, 'RPS') + '</td><td class="number">' + format(r.benchmark && r.benchmark.IR, 'IR') + '</td>' : '') + '</tr>').join('')
				+ '</tbody></table>'
			: '';
		const p = results.plot;
		document.getElementById('seriesPart').hidden = !p;
		document.getElementById('legend').innerHTML = p ? legendHtml(p.series, p.winner, '') : '';
		document.getElementById('plot').innerHTML = p ? plot(p) : '';
	}

	function draw() {
		document.getElementById('root').textContent = state.root;
		const run = state.run;
		if (run) {
			selected = run.competition;
			drawChoices();
			frequency.value = run.frequency;
			for (const radio of document.querySelectorAll('input[name=scope]')) {
				radio.checked = radio.value === (run.sample > 0 ? 'sample' : 'all');
			}
			if (run.sample > 0) {
				sample.value = String(run.sample);
			}
			seed.value = String(run.seed);
			if (typeof run.code === 'string') {
				setCode(run.code);
			}
		}
		drawCompetitions();
		drawChoices();
		drawRun();
		drawResults();
		for (const step of Object.keys(NEXT_DRAW)) {
			drawNext(step);
		}
	}

	document.getElementById('competitions').addEventListener('change', event => {
		if (event.target.name === 'competition') {
			selected = event.target.value;
			// The example of the competition's kind of method, unless the code is the user's own
			if (Object.values(EXAMPLES).includes(code.value)) {
				setCode(EXAMPLES[competition().method]);
			}
			drawCompetitions();
			drawChoices();
		}
	});
	document.getElementById('competitions').addEventListener('click', event => {
		const target = event.target.closest('button[data-download]');
		if (target) {
			vscode.postMessage({ command: 'download', competition: target.dataset.download });
		}
	});
	for (const radio of document.querySelectorAll('input[name=scope]')) {
		radio.addEventListener('change', drawChoices);
	}
	document.getElementById('reset').addEventListener('click', () => setCode(EXAMPLES[competition().method]));
	document.getElementById('start').addEventListener('click', () => {
		document.getElementById('runProblem').textContent = '';
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
	code.addEventListener('input', colourCode);
	code.value = EXAMPLE;
	colourCode();
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const wasLocked = locked();
			state = message;
			if (wasLocked && !state.run) {
				setCode(EXAMPLES[competition().method]);
			}
			draw();
		} else if (message.command === 'colorizedCode') {
			showEditorColors('code', message, '#');
		} else if (message.command === 'runProblem') {
			document.getElementById('runProblem').textContent = message.text;
		} else if (message.command === 'downloading') {
			document.getElementById('downloadStatus').textContent = TEXT.downloading;
		} else if (message.command === 'running') {
			document.getElementById('runStatus').textContent = TEXT.running;
		}
	});

	// The Next Steps: each panel is drawn from the JSON file of the run that the step's Julia script writes
	const NEXT_ONLY = { horizon: ['m1', 'm3', 'm4'], series: ['m1', 'm3', 'm4', 'm5'], fails: ['m1', 'm3', 'm4'], entry: ['m4', 'm5'], runs: ['m1', 'm3', 'm4', 'm5', 'm6'] };
	const NEXT_DRAW = { horizon: drawHorizon, series: drawSeries, fails: drawFails, entry: drawEntry, runs: drawRuns };
	// What a step does once its panel is drawn
	const NEXT_AFTER = { fails: sortArrowsOfFails };
	// Steps whose panel has controls of its own before anything is computed
	const NEXT_CONTROLS = { series: true, entry: true, runs: true };
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
		if (!NEXT_ONLY[step].includes(run.competition)) {
			box.innerHTML = html + '<p class="hint">' + escapeHtml(TEXT.nextOnly[step]) + '</p>';
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
		box.innerHTML = html + '<div class="row"><button class="action" data-next="' + step + '">' + escapeHtml(TEXT.compute) + '</button></div>';
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
			html += '<h3 class="part">' + measure + '</h3><div class="fc-plot">' + stepChart(chosen.h, [{ cls: 'winner', values: chosen.naive2[measure] }, { cls: 'forecast', values: chosen.method[measure] }]) + '</div>';
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
		let html = '<div class="row"><span class="small">' + escapeHtml(TEXT.seriesName) + '</span> <input type="text" id="seriesName" spellcheck="false" value="' + escapeHtml(ok ? data.name : '') + '" placeholder="' + escapeHtml(TEXT.seriesPlaceholder) + '">'
			+ ' <button class="action" data-series="name">' + escapeHtml(TEXT.show) + '</button>'
			+ ' <button class="action" data-series="previous"' + (ok && data.position > 1 ? '' : ' disabled') + '>' + escapeHtml(TEXT.previous) + '</button>'
			+ ' <button class="action" data-series="next"' + (ok && data.position >= data.count ? ' disabled' : '') + '>' + escapeHtml(TEXT.next) + '</button></div>';
		if (data && data.error) {
			html += '<p class="small missing">' + escapeHtml(TEXT.stepStopped.replace('{0}', data.error)) + '</p>';
		}
		if (!ok) {
			return html;
		}
		html += '<p class="small">' + escapeHtml(TEXT.seriesOf.replace('{0}', data.position.toLocaleString()).replace('{1}', data.count.toLocaleString()).replace('{2}', data.frequency).replace('{3}', data.horizon)) + '</p>';
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
		html += '<div class="fc-legend small">' + legendHtml(data.name, data.winner, benchmark) + '</div>';
		html += '<div class="fc-plot">' + plot({ past, actual: data.actual, forecast: data.forecast, winner: data.winner, benchmark: benchmarkValues }) + '</div>';
		const heads = [TEXT.actual, TEXT.method].concat(benchmark ? [benchmark] : [], data.winner ? [TEXT.winner.replace('{0}', data.winner.name)] : []);
		html += '<table class="fc"><thead><tr><th class="number">h</th>' + heads.map(head => '<th class="number">' + escapeHtml(head) + '</th>').join('') + '</tr></thead><tbody>'
			+ data.forecast.map((f, i) => '<tr><td class="number">' + (i + 1) + '</td><td class="number">' + format(data.actual[i]) + '</td><td class="number">' + format(f) + '</td>'
				+ (benchmark ? '<td class="number">' + format(benchmarkValues[i]) + '</td>' : '')
				+ (data.winner ? '<td class="number">' + format(data.winner.values[i]) + '</td>' : '') + '</tr>').join('')
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
		document.getElementById('btn-series').click();
		const box = document.getElementById('seriesName');
		if (box) {
			box.value = name;
		}
		vscode.postMessage({ command: 'nextStep', step: 'series', series: name });
	}

	// Compare With an Entry: the entry chosen in the list
	let entryChoice = undefined;
	function entryName(e) {
		return e.name + ' (' + (TEXT.kinds[e.kind] || e.kind) + (e.rank !== null && e.rank !== undefined ? ', ' + TEXT.rankText.replace('{0}', e.rank) : '') + ')';
	}
	function drawEntry(data) {
		const ok = !!data && !data.error;
		let html = '';
		if (data && data.error) {
			html += '<p class="small missing">' + escapeHtml(TEXT.stepStopped.replace('{0}', data.error)) + '</p>';
		}
		const entries = ok ? data.entries.slice() : [];
		if (!entries.length) {
			return html + '<div class="row"><button class="action" data-entry="list">' + escapeHtml(TEXT.listEntries) + '</button></div>';
		}
		// Submissions by rank, then the benchmarks and the others by name
		entries.sort((a, b) => (a.rank === null) - (b.rank === null) || (a.rank || 0) - (b.rank || 0) || a.name.localeCompare(b.name, undefined, { numeric: true }));
		const compared = data.compared;
		if (entryChoice === undefined) {
			entryChoice = compared ? compared.entry : entries[0].entry;
		}
		html += '<div class="row"><span class="small">' + escapeHtml(TEXT.entryLabel) + '</span> <select id="entryChoice">'
			+ entries.map(e => '<option value="' + e.entry + '"' + (e.entry === entryChoice ? ' selected' : '') + '>' + escapeHtml(entryName(e) + (e.downloaded ? ', ' + TEXT.downloadedText : '')) + '</option>').join('')
			+ '</select> <button class="action" data-entry="compare">' + escapeHtml(TEXT.compare) + '</button></div>';
		html += '<p class="hint">' + escapeHtml(TEXT.entryDownloadHint) + '</p>';
		if (!compared) {
			return html;
		}
		html += '<p class="small">' + escapeHtml(TEXT.comparedText.replace('{0}', entryName(compared)).replace('{1}', compared.series.toLocaleString()).replace('{2}', compared.level)) + '</p>';
		html += '<table class="fc"><thead><tr><th></th><th class="number">' + escapeHtml(TEXT.method) + '</th><th class="number">' + escapeHtml(TEXT.entryColumn) + '</th></tr></thead><tbody>'
			+ compared.measures.map(m => '<tr><td>' + escapeHtml(m) + '</td><td class="number">' + format(compared.method[m]) + '</td><td class="number">' + format(compared.other[m]) + '</td></tr>').join('')
			+ '</tbody></table>';
		if (compared.levels) {
			html += '<table class="fc"><thead><tr><th>' + escapeHtml(TEXT.level) + '</th><th class="number">' + escapeHtml(TEXT.measureOf.replace('{0}', 'WRMSSE').replace('{1}', TEXT.method)) + '</th><th class="number">' + escapeHtml(TEXT.measureOf.replace('{0}', 'WRMSSE').replace('{1}', TEXT.entryColumn)) + '</th></tr></thead><tbody>'
				+ compared.levels.map(l => '<tr><td>' + escapeHtml(l.level) + '</td><td class="number">' + format(l.method) + '</td><td class="number">' + format(l.other) + '</td></tr>').join('')
				+ '</tbody></table>';
		}
		if (compared.counts) {
			html += '<table class="fc"><thead><tr><th></th><th class="number">' + escapeHtml(TEXT.betterCount) + '</th><th class="number">' + escapeHtml(TEXT.worseCount) + '</th></tr></thead><tbody>'
				+ [['sMAPE', 'smape'], ['MASE', 'mase']].map(([label, key]) => '<tr><td>' + label + '</td><td class="number">' + compared.counts[key].better.toLocaleString() + '</td><td class="number">' + compared.counts[key].worse.toLocaleString() + '</td></tr>').join('')
				+ '</tbody></table>';
			html += '<p class="hint">' + escapeHtml(TEXT.pairHint) + '</p>';
			const list = rows => '<div class="fc-worst"><table class="fc"><thead><tr><th>' + escapeHtml(TEXT.seriesName) + '</th><th>' + escapeHtml(TEXT.frequencyColumn) + '</th><th class="number">MASE</th><th class="number">'
				+ escapeHtml(TEXT.measureOf.replace('{0}', 'MASE').replace('{1}', TEXT.entryColumn)) + '</th><th class="number">' + escapeHtml(TEXT.relativeToEntry) + '</th></tr></thead><tbody>'
				+ rows.map(r => '<tr><td><button class="link" data-show-series="' + escapeHtml(r.name) + '">' + escapeHtml(r.name) + '</button></td><td>' + escapeHtml(r.frequency) + '</td><td class="number">' + format(r.mase) + '</td><td class="number">'
					+ format(r.other_mase) + '</td><td class="number">' + (r.relative_mase === null ? '&#x221e;' : format(r.relative_mase)) + '</td></tr>').join('')
				+ '</tbody></table></div>';
			html += '<h3 class="part">' + escapeHtml(TEXT.entryBetter) + '</h3>' + list(compared.entry_better);
			html += '<h3 class="part">' + escapeHtml(TEXT.methodBetter) + '</h3>' + list(compared.method_better);
		}
		return html;
	}

	// Compare Two Runs: drawn from the page's state, with no Julia; the other run is read by the page when chosen
	function runSettings(run) {
		const c = COMPETITIONS.find(x => x.id === run.competition);
		return TEXT.runSettings.replace('{0}', c ? c.name : run.competition).replace('{1}', run.frequency || TEXT.allFrequencies)
			.replace('{2}', run.sample > 0 ? TEXT.sampleText.replace('{0}', run.sample.toLocaleString()).replace('{1}', run.seed) : TEXT.allSeriesText);
	}
	function drawRuns() {
		const run = state.run;
		const others = state.runs.filter(name => name !== run.name);
		if (!others.length) {
			return '<p class="hint">' + escapeHtml(TEXT.noOtherRuns) + '</p>';
		}
		const o = run.other;
		let html = '<div class="row"><span class="small">' + escapeHtml(TEXT.otherRun) + '</span> <select id="otherRun"><option value="">' + escapeHtml(TEXT.chooseRun) + '</option>'
			+ others.map(name => '<option value="' + escapeHtml(name) + '"' + (o && o.name === name ? ' selected' : '') + '>' + escapeHtml(name) + '</option>').join('') + '</select></div>';
		if (!o) {
			return html;
		}
		const same = o.competition === run.competition && o.frequency === run.frequency && o.sample === run.sample && (run.sample === 0 || o.seed === run.seed);
		if (!same) {
			return html + '<p class="hint">' + escapeHtml(TEXT.notSameSeries.replace('{0}', TEXT.thisRun).replace('{1}', runSettings(run)).replace('{2}', runSettings(o))) + '</p>';
		}
		if (!o.results || o.results.error) {
			return html + '<p class="hint">' + escapeHtml(TEXT.otherNotDone) + '</p>';
		}
		const a = run.results, b = o.results;
		html += '<p class="small">' + escapeHtml(runSettings(run)) + '</p>';
		html += '<table class="fc"><thead><tr><th></th><th class="number">' + escapeHtml(TEXT.thisRun) + '<br><span class="small">' + escapeHtml(run.name) + '</span></th><th class="number">'
			+ escapeHtml(TEXT.otherRun) + '<br><span class="small">' + escapeHtml(o.name) + '</span></th></tr></thead><tbody>'
			+ a.measures.map(m => '<tr><td>' + escapeHtml(m) + '</td><td class="number">' + format(a.method[m], m) + '</td><td class="number">' + format(b.method[m], m) + '</td></tr>').join('');
		const place = r => r.ranking ? TEXT.placeOf.replace('{0}', r.ranking.place).replace('{1}', r.ranking.of) : '';
		if (a.ranking || b.ranking) {
			html += '<tr><td>' + escapeHtml(TEXT.placeRow) + '</td><td class="number">' + escapeHtml(place(a)) + '</td><td class="number">' + escapeHtml(place(b)) + '</td></tr>';
		}
		html += '<tr><td>' + escapeHtml(TEXT.secondsRow) + '</td><td class="number">' + Math.round(a.seconds).toLocaleString() + '</td><td class="number">' + Math.round(b.seconds).toLocaleString() + '</td></tr>';
		html += '</tbody></table>';
		html += '<div class="row"><button class="link" id="diffMethods">' + escapeHtml(TEXT.diffMethods) + '</button></div>';
		return html;
	}

	window.addEventListener('pollis-horizon-step', () => drawNext('horizon'));
	window.addEventListener('pollis-runs-step', () => drawNext('runs'));
	window.addEventListener('pollis-entry-step', () => drawNext('entry'));
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
		const entryButton = event.target.closest && event.target.closest('button[data-entry]');
		if (entryButton && state && state.run) {
			const choice = document.getElementById('entryChoice');
			entryButton.disabled = true;
			entryButton.insertAdjacentHTML('afterend', ' <span class="small">' + escapeHtml(TEXT.running) + '</span>');
			vscode.postMessage(entryButton.dataset.entry === 'compare' && choice ? { command: 'nextStep', step: 'entry', entry: Number(choice.value) } : { command: 'nextStep', step: 'entry' });
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
		} else if (event.target.id === 'entryChoice') {
			entryChoice = Number(event.target.value);
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
		super({ id: FORECASTING_COMPETITIONS_COMMAND_ID, title: localize2('competitions.action', "Forecasting Competitions..."), category: localize2('competitions.category', "Competitions"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openForecastingCompetitionsPage(accessor);
	}
});
