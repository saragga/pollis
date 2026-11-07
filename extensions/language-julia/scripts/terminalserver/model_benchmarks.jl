# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
# ---------------------------------------------------------------------------------------------

"""
    ModelBenchmarks

The published benchmarks of Model Benchmarks (Compose > Knowledge for Models > Model Benchmarks...), run on the
chat models of this computer. The page runs this file in a hidden Julia process (pollisModelBenchmarks.ts of the
Julia extension); a notebook loads it with `Pollis.model_benchmarks()` and calls the same functions, so that both do
the same things:

```julia
MB = Pollis.model_benchmarks()
MB.download("mmlu-pro")
sample = MB.draw("mmlu-pro"; size = 140, allocation = "equal", seed = 1)
run = MB.new_run("mmlu-pro", sample; shots = 0, reasoning = true)
MB.run_models!(run, ["hf:unsloth/Qwen3.5-0.8B-GGUF/Qwen3.5-0.8B-Q4_K_M.gguf"])
MB.figures(run)
```

A benchmark is downloaded once into `DATA/<benchmark>`, at a fixed revision of its dataset: its questions,
`questions.jsonl`, one question a line with its id, its stratum, the question, its choices and its right answer; its
examples, `examples.jsonl`, the questions with worked answers that a prompt with examples shows first; and
`info.json`, the revision and the number of questions of each stratum. A sample is drawn from the strata chosen, by
proportional or equal allocation, with a seed, so that it can be drawn again. A run is kept in `RUNS`: `<id>.json`,
the benchmark and its revision, the settings, the sample and the figures of each model, written as the model answers,
and `<id>.jsonl`, each answer as it comes, with its grade and its timings.
"""
module ModelBenchmarks

import Downloads
import Pkg
using Dates: now, UTC
using Random: Xoshiro, shuffle
using UUIDs: UUID, uuid4

"""Where Model Benchmarks keeps the benchmarks' questions and its runs."""
const HOME = joinpath(homedir(), ".pollis", "benchmarks")
const DATA = joinpath(HOME, "data")
const RUNS = joinpath(HOME, "runs")
"""The Julia environment of Model Benchmarks, for JSON3, one per Julia minor version."""
const ENVIRONMENT = joinpath(HOME, "julia", "v$(VERSION.major).$(VERSION.minor)")
"""The environment of the packages built into Pollis, where PollisDB installs DuckDB, which reads the Parquet files."""
const POLLIS_ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")

const DUCKDB = Base.PkgId(UUID("d2f5444f-75bc-4fdf-ac35-56f514c445e1"), "DuckDB")
const DBINTERFACE = Base.PkgId(UUID("a10d1c49-ce27-4219-8d33-6db1a4562965"), "DBInterface")

# After the user's environments, so that their own versions of these packages come first
for environment in (ENVIRONMENT, POLLIS_ENVIRONMENT)
	environment in LOAD_PATH || push!(LOAD_PATH, environment)
end

"""Installs JSON3 into `ENVIRONMENT` the first time, the active environment left as it was; `say` tells that it does."""
function install(say = () -> nothing)
	Base.identify_package("JSON3") === nothing || return
	say()
	active = Base.active_project()
	mkpath(ENVIRONMENT)
	try
		Pkg.activate(ENVIRONMENT; io = devnull)
		Pkg.add("JSON3"; io = devnull)
	finally
		active === nothing ? Pkg.activate(; io = devnull) : Pkg.activate(dirname(active); io = devnull)
	end
end

# The hidden process says it is installing, so that the page can tell
const HIDDEN = abspath(PROGRAM_FILE) == @__FILE__()
install(() -> HIDDEN && (println("{\"status\":\"installing\"}"); flush(stdout)))
using JSON3

# ---------------------------------------------------------------------------------------------
# The benchmarks
# ---------------------------------------------------------------------------------------------

"""
A benchmark: where its questions and examples come from, as Parquet files, how a question is written for the model,
and how its answer is read and graded. `strata` names the column the questions are grouped by, or nothing.
"""
struct Benchmark
	id::String
	name::String
	"""The revision of the dataset on Hugging Face its files are downloaded from, so that a later download gives the same questions."""
	revision::String
	questions::String
	examples::String
	strata::Union{Nothing, String}
	"""The question of a row of the Parquet file, as kept: (; id, stratum, question, choices, answer, worked)."""
	read_row::Function
	"""The prompt for a question: the instruction, the examples, then the question."""
	prompt::Function
	"""The answer the model gave, read from its text, or nothing when none can be read."""
	extract::Function
	"""Whether the answer read is the right one."""
	grade::Function
	"""The examples a prompt shows: those of the question's stratum, the first `shots`."""
	examples_of::Function
	"""The probability that an answer picked at random among the question's options is right, or nothing for a benchmark without options."""
	chance::Union{Nothing, Function}
end

const LETTERS = collect("ABCDEFGHIJ")

# MMLU-Pro (Wang et al., 2024): ten options, 14 subjects; the prompt and the reading of the answer of its own
# evaluation scripts (TIGER-AI-Lab/MMLU-Pro, evaluate_from_api.py): "the answer is (X)", else "Answer: X", else the
# last letter that stands alone.

function mmlu_pro_row(row)
	options = [String(option) for option in row.options if option !== nothing && !isempty(strip(String(option)))]
	(; id = string(row.question_id), stratum = String(row.category), question = String(row.question),
		choices = options, answer = String(row.answer), worked = row.cot_content === nothing ? "" : String(row.cot_content))
end

function mmlu_pro_question(question; with_answer = false)
	text = "Question:\n$(question.question)\nOptions:\n"
	for (letter, option) in zip(LETTERS, question.choices)
		text *= "$(letter). $(option)\n"
	end
	with_answer || return text * "Answer: Let's think step by step."
	text * replace(question.worked, "A: Let's think step by step." => "Answer: Let's think step by step.") * "\n\n"
end

function mmlu_pro_prompt(question, examples, settings)
	if settings.reasoning
		head = "The following are multiple choice questions (with answers) about $(question.stratum). Think step by step and then finish your answer with \"the answer is (X)\" where X is the correct letter choice.\n\n\n"
		return head * join(mmlu_pro_question.(examples; with_answer = true)) * mmlu_pro_question(question)
	end
	head = "The following are multiple choice questions about $(question.stratum). Give only the correct letter choice, as \"the answer is (X)\".\n\n\n"
	shown = join(["$(chop(mmlu_pro_question(example), tail = length("Let's think step by step.")))the answer is ($(example.answer))\n\n" for example in examples])
	head * shown * chop(mmlu_pro_question(question), tail = length(" Let's think step by step."))
end

function mmlu_pro_extract(text)
	found = match(r"answer is \(?([A-J])\)?", text)
	found === nothing || return String(found.captures[1])
	found = match(r"(?s).*[aA]nswer:\s*\(?([A-J])\)?", text)
	found === nothing || return String(found.captures[1])
	found = match(r"(?s)\b([A-J])\b(?!.*\b[A-J]\b)", text)
	found === nothing ? nothing : String(found.captures[1])
end

# GSM8K (Cobbe et al., 2021): the number after "####" in the worked answer is the right one; the model's is the one
# of "The answer is N", else the last number of its text.

"""The number of a text such as "\$1,250.00" or "18.", without its commas, dollar sign and full stop."""
function plain_number(text)
	cleaned = rstrip(replace(String(text), "," => "", "\$" => ""), '.')
	tryparse(Float64, cleaned)
end

function gsm8k_row(row, index)
	worked, answer = split(String(row.answer), "####"; limit = 2)
	(; id = string(index), stratum = "", question = String(row.question), choices = String[],
		answer = strip(answer), worked = strip(replace(worked, r"<<[^>]*>>" => "")))
end

function gsm8k_prompt(question, examples, settings)
	if settings.reasoning
		head = "Solve the following math problems step by step. The last line of your response should be of the form \"The answer is N\", where N is the final number.\n\n"
		shown = join(["Question: $(example.question)\nAnswer: $(example.worked)\nThe answer is $(example.answer).\n\n" for example in examples])
		return head * shown * "Question: $(question.question)\nAnswer:"
	end
	head = "Solve the following math problems. Give only the final number, as \"The answer is N\".\n\n"
	shown = join(["Question: $(example.question)\nAnswer: The answer is $(example.answer).\n\n" for example in examples])
	head * shown * "Question: $(question.question)\nAnswer:"
end

const NUMBER = r"-?\$?\s?\d[\d,]*(?:\.\d+)?"

function gsm8k_extract(text)
	said = collect(eachmatch(Regex("(?i)the (?:final )?answer is[:\\s]*\\**\\s*(" * NUMBER.pattern * ")"), text))
	isempty(said) || return replace(String(last(said).captures[1]), r"\s" => "")
	marked = collect(eachmatch(Regex("####\\s*(" * NUMBER.pattern * ")"), text))
	isempty(marked) || return replace(String(last(marked).captures[1]), r"\s" => "")
	numbers = collect(eachmatch(NUMBER, text))
	isempty(numbers) ? nothing : replace(String(last(numbers).match), r"\s" => "")
end

function gsm8k_grade(extracted, answer)
	given, right = plain_number(extracted), plain_number(answer)
	given !== nothing && right !== nothing && abs(given - right) <= 1e-6 * max(1, abs(right))
end

# The revisions of the datasets on Hugging Face, fixed so that the questions do not change when a dataset is updated
const MMLU_PRO_REVISION = "b189ec765aa7ed75c8acfea42df31fdae71f97be"
const GSM8K_REVISION = "740312add88f781978c0658806c59bc2815b9866"

"""The benchmarks Model Benchmarks runs, by their id."""
const BENCHMARKS = Dict(
	"mmlu-pro" => Benchmark(
		"mmlu-pro", "MMLU-Pro", MMLU_PRO_REVISION,
		"https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/resolve/$(MMLU_PRO_REVISION)/data/test-00000-of-00001.parquet",
		"https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/resolve/$(MMLU_PRO_REVISION)/data/validation-00000-of-00001.parquet",
		"category",
		(row, index) -> mmlu_pro_row(row),
		mmlu_pro_prompt,
		mmlu_pro_extract,
		(extracted, answer) -> extracted == answer,
		(examples, question, shots) -> first(filter(example -> example.stratum == question.stratum, examples), shots),
		question -> 1 / length(question.choices),
	),
	"gsm8k" => Benchmark(
		"gsm8k", "GSM8K", GSM8K_REVISION,
		"https://huggingface.co/datasets/openai/gsm8k/resolve/$(GSM8K_REVISION)/main/test-00000-of-00001.parquet",
		"https://huggingface.co/datasets/openai/gsm8k/resolve/$(GSM8K_REVISION)/main/train-00000-of-00001.parquet",
		nothing,
		gsm8k_row,
		gsm8k_prompt,
		gsm8k_extract,
		gsm8k_grade,
		(examples, question, shots) -> first(examples, shots),
		nothing,
	),
)

benchmark_of(id) = get(BENCHMARKS, String(id)) do
	error("No benchmark $(id): Model Benchmarks has $(join(sort(collect(keys(BENCHMARKS))), ", ")).")
end

# ---------------------------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------------------------

"""The rows of a Parquet file, read with DuckDB, which PollisDB installs when the Julia REPL first starts."""
function parquet_rows(file)
	Base.identify_package("DuckDB") === nothing && error("DuckDB is not installed yet: start the Julia REPL once, and Pollis installs it.")
	DuckDB = Base.require(DUCKDB)
	DBInterface = Base.require(DBINTERFACE)
	json = tempname() * ".jsonl"
	try
		Base.invokelatest() do
			db = DuckDB.DB()
			try
				path = replace(file, "'" => "''")
				DBInterface.execute(db, "COPY (SELECT * FROM read_parquet('$(path)')) TO '$(replace(json, "'" => "''"))' (FORMAT JSON)")
			finally
				DBInterface.close!(db)
			end
		end
		[JSON3.read(line) for line in eachline(json) if !isempty(line)]
	finally
		rm(json; force = true)
	end
end

"""The file `url` downloaded to `path`, unless it is there already."""
function fetch_file(url, path)
	isfile(path) && return path
	mkpath(dirname(path))
	partial = path * ".part"
	Downloads.download(url, partial)
	mv(partial, path; force = true)
end

"""The revision of the dataset that the questions of `benchmark` on this computer come from, or "" when unknown."""
function downloaded_revision(id)
	path = joinpath(DATA, String(id), "info.json")
	isfile(path) || return ""
	String(get(JSON3.read(read(path, String)), :revision, ""))
end

"""
    download(benchmark; progress = (done, total) -> nothing)

Downloads the questions and examples of `benchmark` ("mmlu-pro", "gsm8k") into `DATA/<benchmark>`, once, at the
revision of the dataset that Model Benchmarks fixes, and answers its `info`: the revision and the number of questions
of each stratum. Files of another revision are downloaded again.
"""
function download(id; progress = (done, total) -> nothing)
	benchmark = benchmark_of(id)
	folder = joinpath(DATA, benchmark.id)
	if downloaded_revision(benchmark.id) != benchmark.revision
		rm(joinpath(folder, "questions.parquet"); force = true)
		rm(joinpath(folder, "examples.parquet"); force = true)
	end
	progress(0, 3)
	questions_file = fetch_file(benchmark.questions, joinpath(folder, "questions.parquet"))
	progress(1, 3)
	examples_file = fetch_file(benchmark.examples, joinpath(folder, "examples.parquet"))
	progress(2, 3)
	questions = [benchmark.read_row(row, index) for (index, row) in enumerate(parquet_rows(questions_file))]
	examples = [benchmark.read_row(row, index) for (index, row) in enumerate(parquet_rows(examples_file))]
	write_lines(joinpath(folder, "questions.jsonl"), questions)
	write_lines(joinpath(folder, "examples.jsonl"), examples)
	counts = Dict{String, Int}()
	for question in questions
		counts[question.stratum] = get(counts, question.stratum, 0) + 1
	end
	info = (; benchmark = benchmark.id, revision = benchmark.revision, downloaded = string(now(UTC)), count = length(questions),
		strata = [(; name, count = counts[name]) for name in sort(collect(keys(counts)))])
	write_json(joinpath(folder, "info.json"), info)
	progress(3, 3)
	info
end

"""The questions of a benchmark downloaded, as kept in `questions.jsonl` (or `examples.jsonl`)."""
function read_questions(id, file = "questions.jsonl")
	path = joinpath(DATA, benchmark_of(id).id, file)
	isfile(path) || error("$(benchmark_of(id).name) is not downloaded yet: download(\"$(id)\") first.")
	[question_of(JSON3.read(line)) for line in eachline(path) if !isempty(line)]
end

question_of(object) = (; id = String(object.id), stratum = String(object.stratum), question = String(object.question),
	choices = String.(object.choices), answer = String(object.answer), worked = String(object.worked))

function write_lines(path, values)
	mkpath(dirname(path))
	open(path * ".part", "w") do io
		for value in values
			JSON3.write(io, value)
			println(io)
		end
	end
	mv(path * ".part", path; force = true)
end

function write_json(path, value)
	mkpath(dirname(path))
	write(path * ".part", JSON3.write(value))
	mv(path * ".part", path; force = true)
end

# ---------------------------------------------------------------------------------------------
# The sample
# ---------------------------------------------------------------------------------------------

"""
The number of questions of each stratum, of populations `populations`, for a sample of `size`: each stratum has one
at least, when the size allows, and the rest is shared in proportion to the populations ("proportional") or equally
("equal"), by largest remainders, a stratum never given more than it has; the shares a stratum cannot take go to the
others. The page computes the same (modelBenchmarksPage.ts, allocate).
"""
function allocate(size::Integer, populations::AbstractVector{<:Integer}, allocation::AbstractString)
	count = length(populations)
	sizes = zeros(Int, count)
	left = min(size, sum(populations))
	if left >= count
		sizes .= min.(1, populations)
		left -= sum(sizes)
	end
	while left > 0
		open_strata = findall(sizes .< populations)
		isempty(open_strata) && break
		weights = allocation == "equal" ? ones(length(open_strata)) : Float64.(populations[open_strata])
		quotas = left .* weights ./ sum(weights)
		whole = floor.(Int, quotas)
		# The remainders, largest first, the earlier stratum first on a tie
		order = sortperm(quotas .- whole; rev = true, alg = Base.Sort.DEFAULT_STABLE)
		for index in order[1:(left - sum(whole))]
			whole[index] += 1
		end
		given = min.(whole, populations[open_strata] .- sizes[open_strata])
		sizes[open_strata] .+= given
		left -= sum(given)
		sum(given) == 0 && break
	end
	sizes
end

"""
    draw(benchmark; size, strata = nothing, allocation = "proportional", seed = 1)

A stratified random sample of the questions of `benchmark`: from the strata named in `strata` (all of them when
nothing), `size` questions shared among them by `allocation` ("proportional" or "equal"), drawn within each stratum
with `seed`, the same seed drawing the same sample again. A benchmark without strata gives a simple random sample.
"""
function draw(id; size::Integer, strata = nothing, allocation::AbstractString = "proportional", seed::Integer = 1)
	questions = read_questions(id)
	names = sort(unique(question.stratum for question in questions))
	chosen = strata === nothing || isempty(strata) ? names : filter(in(Set(String.(strata))), names)
	isempty(chosen) && error("None of the strata $(strata) is in $(benchmark_of(id).name).")
	groups = [sort([question.id for question in questions if question.stratum == name]) for name in chosen]
	sizes = allocate(size, length.(groups), allocation)
	rng = Xoshiro(seed)
	ids = String[]
	for (group, count) in zip(groups, sizes)
		append!(ids, shuffle(rng, group)[1:count])
	end
	(; benchmark = benchmark_of(id).id, seed, allocation = String(allocation), size = length(ids),
		strata = [(; name, population = length(group), size = count) for (name, group, count) in zip(chosen, groups, sizes)], ids)
end

# ---------------------------------------------------------------------------------------------
# A run
# ---------------------------------------------------------------------------------------------

"""The longest answer when a run asks for the answer alone, without thinking."""
const ANSWER_ONLY_TOKENS = 32

"""
    new_run(benchmark, sample; shots = 0, reasoning = true, thinking = false, max_tokens = 2048, pollis = "")

A run of `benchmark` on the questions of `sample` (from `draw`): with `shots` examples before each question, the
answer worked step by step or given alone (`reasoning`), the model thinking first or not (`thinking`, for the
models that do), at most `max_tokens` tokens an answer, or `ANSWER_ONLY_TOKENS` for the answer alone without
thinking. Kept in `RUNS`; answers its id.
"""
function new_run(id, sample; shots::Integer = 0, reasoning::Bool = true, thinking::Bool = false, max_tokens::Integer = 2048, pollis::AbstractString = "")
	benchmark = benchmark_of(id).id
	# The answer alone, without thinking: room for the answer and a short sentence, so that an answer worked out
	# against the instruction is cut off at once
	reasoning || thinking || (max_tokens = ANSWER_ONLY_TOKENS)
	run = (; id = string(uuid4()), started = round(Int, time() * 1000), pollis = String(pollis), benchmark,
		revision = downloaded_revision(benchmark),
		settings = (; shots, reasoning, thinking, maxTokens = max_tokens),
		sample = (; sample.seed, sample.allocation, sample.size, sample.strata, questions = sample.ids),
		models = [])
	write_json(run_file(run.id), run)
	touch(answers_file(run.id))
	run.id
end

run_file(id) = joinpath(RUNS, "$(id).json")
answers_file(id) = joinpath(RUNS, "$(id).jsonl")

"""The run `id` as kept."""
load_run(id) = JSON3.read(read(run_file(id), String))

"""The answers of the run `id`, each as written: (; model, id, extracted, correct, ...)."""
function load_answers(id)
	path = answers_file(id)
	isfile(path) || return []
	answers = []
	for line in eachline(path)
		isempty(line) && continue
		try
			push!(answers, JSON3.read(line))
		catch
			# A line cut off when the run was stopped
		end
	end
	answers
end

"""
The memory free on this computer, in bytes, as the Julia extension measures it (pollisModels.ts, availableMemory):
on macOS the memory less what the processes hold, as vm_stat counts it, on Linux MemAvailable.
"""
function available_memory()
	if Sys.isapple()
		stats = try read(`vm_stat`, String) catch; "" end
		size = match(r"page size of (\d+) bytes", stats)
		pages(name) = (found = match(Regex("$(name):\\s+(\\d+)"), stats); found === nothing ? nothing : parse(Int, found.captures[1]))
		counts = pages.(["Anonymous pages", "Pages purgeable", "Pages wired down", "Pages occupied by compressor"])
		(size === nothing || any(isnothing, counts)) && return Int(Sys.free_memory())
		used = (counts[1] - counts[2] + counts[3] + counts[4]) * parse(Int, size.captures[1])
		return max(0, Int(Sys.total_memory()) - used)
	elseif Sys.islinux()
		info = try read("/proc/meminfo", String) catch; "" end
		found = match(r"(?m)^MemAvailable:\s+(\d+) kB", info)
		found === nothing || return parse(Int, found.captures[1]) * 1024
	end
	Int(Sys.free_memory())
end

const MODEL_DOWNLOADER = Ref{Union{Nothing, Downloads.Downloader}}(nothing)

"""
The downloader of the requests to a model's server, made the first time: llama-server sends nothing until the answer is
written, which can take minutes, so the 20 seconds without a byte after which Downloads gives up are lifted; the
`timeout` of each answer still holds.
"""
function model_downloader()
	if MODEL_DOWNLOADER[] === nothing
		downloader = Downloads.Downloader()
		downloader.easy_hook = (easy, info) -> Downloads.Curl.setopt(easy, Downloads.Curl.CURLOPT_LOW_SPEED_TIME, 0)
		MODEL_DOWNLOADER[] = downloader
	end
	MODEL_DOWNLOADER[]
end

"""
One answer of the model at `url`, the OpenAI-compatible API of its llama-server: its text, why it ended, its tokens
and its timings, as llama-server measures them; or the error.
"""
function ask(url, prompt; max_tokens, timeout = 900)
	body = JSON3.write((; messages = [(; role = "user", content = prompt)], temperature = 0, max_tokens, stream = false))
	output = IOBuffer()
	started = time()
	response = Downloads.request(rstrip(url, '/') * "/chat/completions"; method = "POST", input = IOBuffer(body), output,
		headers = ["Content-Type" => "application/json"], timeout, throw = false, downloader = model_downloader())
	seconds = time() - started
	response isa Downloads.Response || return (; error = first(sprint(showerror, response), 300), seconds)
	text = String(take!(output))
	response.status == 200 || return (; error = "HTTP $(response.status): $(first(text, 300))", seconds)
	reply = JSON3.read(text)
	choice = first(reply.choices)
	timings = get(reply, :timings, nothing)
	usage = get(reply, :usage, nothing)
	number(object, key) = object === nothing ? nothing : get(object, key, nothing)
	# The milliseconds of a token written, which the first token takes after the question is read
	written, writing_ms = number(timings, :predicted_n), number(timings, :predicted_ms)
	token_ms = written isa Real && writing_ms isa Real && written > 0 ? writing_ms / written : nothing
	(; text = something(get(choice.message, :content, nothing), ""), finish = String(something(get(choice, :finish_reason, nothing), "")),
		seconds, promptTokens = number(usage, :prompt_tokens), writtenTokens = number(usage, :completion_tokens),
		promptMs = number(timings, :prompt_ms), readingSpeed = number(timings, :prompt_per_second),
		writingSpeed = number(timings, :predicted_per_second), tokenMs = token_ms)
end

"""
    run_model!(run, model, url; label = model, size = "", free_before = available_memory(), progress = (done, total, tokens) -> nothing)

Has the model `model` (its file or `hf:` value), whose llama-server is at `url`, answer the questions of the run
`run`, one after the other, each answer written as it comes and graded; the model's figures are kept in the run
after each answer and at the end. The memory it takes is `free_before`, the memory free before its server started,
less the least memory free while it answers.
"""
function run_model!(id, model, url; label = model, size = "", free_before = available_memory(), progress = (done, total, tokens) -> nothing)
	run = load_run(id)
	benchmark = benchmark_of(run.benchmark)
	by_id = Dict(question.id => question for question in read_questions(run.benchmark))
	examples = run.settings.shots > 0 ? read_questions(run.benchmark, "examples.jsonl") : []
	questions = [by_id[String(question)] for question in run.sample.questions]
	settings = (; reasoning = run.settings.reasoning)
	entry = Dict{Symbol, Any}(:value => String(model), :label => String(label), :size => String(size), :started => round(Int, time() * 1000),
		:freeBefore => free_before, :lowestFree => available_memory())
	save_model!(id, entry)
	# The least memory free while the model answers, every two seconds
	watch = Timer(_ -> (entry[:lowestFree] = min(entry[:lowestFree], available_memory())), 0; interval = 2)
	tokens = [0, 0]
	failures = 0
	try
		for (done, question) in enumerate(questions)
			prompt = benchmark.prompt(question, benchmark.examples_of(examples, question, run.settings.shots), settings)
			answer = ask(url, prompt; max_tokens = run.settings.maxTokens)
			if hasproperty(answer, :error)
				failures += 1
				record = (; model = entry[:value], id = question.id, stratum = question.stratum, error = answer.error, answer.seconds)
				entry[:error] = answer.error
			else
				extracted = benchmark.extract(answer.text)
				correct = extracted !== nothing && benchmark.grade(extracted, question.answer)
				tokens .+= (something(answer.promptTokens, 0), something(answer.writtenTokens, 0))
				record = (; model = entry[:value], id = question.id, stratum = question.stratum, extracted, correct, answer.text, answer.finish,
					answer.seconds, answer.promptTokens, answer.writtenTokens, answer.promptMs, answer.readingSpeed, answer.writingSpeed, answer.tokenMs)
			end
			open(io -> (JSON3.write(io, record); println(io)), answers_file(id), "a")
			# The figures kept after each answer, before it is reported, so that the page shows the run as it goes
			save_model!(id, entry)
			progress(done, length(questions), tokens)
			# A server that stopped answering: the questions left are not asked
			failures >= 3 && failures == done && break
		end
	finally
		close(watch)
		entry[:lowestFree] = min(entry[:lowestFree], available_memory())
		entry[:ended] = round(Int, time() * 1000)
		save_model!(id, entry)
	end
	figures(id)
end

"""Keeps `entry`, the model's line of the run, in place of the one of the same model, and the figures of all the models."""
function save_model!(id, entry)
	run = Dict{Symbol, Any}(pairs(load_run(id)))
	models = [Dict{Symbol, Any}(pairs(model)) for model in run[:models] if String(model.value) != entry[:value]]
	push!(models, copy(entry))
	run[:models] = models
	run[:figures] = figures(id; run = run)
	write_json(run_file(id), run)
end

"""
    run_models!(run, models; thinking = nothing)

Runs each model of `models` (files or `hf:` values) on the run `run`, one after the other and each alone in
memory: its llama-server started for it (`Pollis.llama_server`, in the Julia REPL or a notebook of Pollis) and
stopped once it has answered.
"""
function run_models!(id, models; progress = (model, done, total, tokens) -> nothing)
	pollis = isdefined(Main, :Pollis) ? Main.Pollis : error("run_models! runs in the Julia REPL or a notebook of Pollis.")
	thinking = Bool(load_run(id).settings.thinking)
	for model in models
		free_before = available_memory()
		url = pollis.llama_server(model; thinking)
		try
			run_model!(id, model, url; label = replace(basename(String(model)), r"\.gguf$"i => ""), free_before, progress = (done, total, tokens) -> progress(model, done, total, tokens))
		finally
			pollis.stop_llama_server(model; thinking)
		end
	end
	figures(id)
end

# ---------------------------------------------------------------------------------------------
# The figures
# ---------------------------------------------------------------------------------------------

mean(values) = isempty(values) ? nothing : sum(values) / length(values)

function median(values)
	isempty(values) && return nothing
	sorted = sort(values)
	middle = length(sorted) ÷ 2
	isodd(length(sorted)) ? sorted[middle + 1] : (sorted[middle] + sorted[middle + 1]) / 2
end

"""
The score of a stratified sample, with the half-width of its 95% interval (Cochran, 1977, chapter 5): each stratum's
share of right answers weighted by its share of the population of the strata, its variance the sum of the strata's
W² (1 - n/N) p (1 - p) / (n - 1). A stratum of one question has no variance that can be measured: then there is
no interval.
"""
function stratified_score(strata, right, asked)
	population = sum(stratum.population for stratum in strata)
	score = 0.0
	variance = 0.0
	weight_asked = 0.0
	measured = true
	for stratum in strata
		n = get(asked, stratum.name, 0)
		n == 0 && continue
		weight = stratum.population / population
		p = get(right, stratum.name, 0) / n
		score += weight * p
		weight_asked += weight
		if n > 1
			variance += weight^2 * (1 - n / stratum.population) * p * (1 - p) / (n - 1)
		else
			measured = false
		end
	end
	weight_asked == 0 && return (; score = nothing, half = nothing)
	# Strata not asked yet, while a run goes on: the score of those asked
	(; score = score / weight_asked, half = measured ? 1.96 * sqrt(variance) / weight_asked : nothing)
end

"""
The probability that answers picked at random get at least `right` of the questions right, the answer to each
question right with its own probability of `chances`: the upper tail of the Poisson binomial distribution (Hong, 2013),
computed exactly by adding the questions one at a time.
"""
function chance_of_at_least(right, chances)
	# distribution[k + 1]: the probability of k right answers among the questions added so far
	distribution = [1.0]
	for chance in chances
		next = zeros(length(distribution) + 1)
		next[1:end - 1] .+= (1 - chance) .* distribution
		next[2:end] .+= chance .* distribution
		distribution = next
	end
	right <= 0 ? 1.0 : min(1.0, sum(distribution[right + 1:end]; init = 0.0))
end

"""The chance of a random answer to each question of a benchmark, by question id, read once; nothing for a benchmark without options."""
const CHANCES = Dict{String, Dict{String, Float64}}()
function chances_of(id)
	benchmark = benchmark_of(id)
	benchmark.chance === nothing && return nothing
	get!(() -> Dict(question.id => Float64(benchmark.chance(question)) for question in read_questions(benchmark.id)), CHANCES, benchmark.id)
end

"""
    figures(run)

The figures of each model of the run `run`: its score with the half-width of its 95% interval, its score in each
stratum, the questions answered, the probability that answers picked at random would get as many right or more
(`byChance`, nothing for a benchmark without options), those whose answer could not be read and those cut off at
the most tokens, the time to its first token, how fast it read and wrote, the seconds an answer took and the memory it took.
"""
function figures(id; run = load_run(id))
	answers = load_answers(id)
	strata = run[:sample][:strata]
	chances = chances_of(run[:benchmark])
	map(run[:models]) do model
		mine = [answer for answer in answers if String(answer.model) == String(model[:value])]
		answered = [answer for answer in mine if !haskey(answer, :error)]
		right = Dict{String, Int}()
		asked = Dict{String, Int}()
		for answer in answered
			stratum = String(answer.stratum)
			asked[stratum] = get(asked, stratum, 0) + 1
			answer.correct && (right[stratum] = get(right, stratum, 0) + 1)
		end
		overall = stratified_score(strata, right, asked)
		total = sum(values(right); init = 0)
		# Answers that could not be read count as wrong, as in the score
		by_chance = chances === nothing || isempty(answered) ? nothing : chance_of_at_least(total, [chances[String(answer.id)] for answer in answered])
		numbers(key) = [Float64(answer[key]) for answer in answered if get(answer, key, nothing) isa Real]
		first_token = [Float64(answer.promptMs) + something(get(answer, :tokenMs, nothing), 0.0) for answer in answered if get(answer, :promptMs, nothing) isa Real]
		lowest = get(model, :lowestFree, nothing)
		before = get(model, :freeBefore, nothing)
		(; value = String(model[:value]), label = String(model[:label]), questions = length(answered), failed = length(mine) - length(answered),
			score = overall.score, half = overall.half, right = total, byChance = by_chance,
			strata = [(; name = stratum.name, asked = get(asked, String(stratum.name), 0), right = get(right, String(stratum.name), 0)) for stratum in strata],
			unread = count(answer -> answer.extracted === nothing, answered),
			cutOff = count(answer -> get(answer, :finish, "") == "length", answered),
			firstTokenMs = median(first_token), readingSpeed = median(numbers(:readingSpeed)), writingSpeed = median(numbers(:writingSpeed)),
			seconds = mean(numbers(:seconds)), writtenTokens = mean(numbers(:writtenTokens)),
			memory = before isa Real && lowest isa Real ? max(0, before - lowest) : nothing,
			error = get(model, :error, nothing))
	end
end

"""The runs kept, the latest first: their ids."""
function runs()
	isdir(RUNS) || return String[]
	files = [file for file in readdir(RUNS) if endswith(file, ".json")]
	ids = [file[1:end - 5] for file in files]
	sort(ids; by = id -> load_run(id).started, rev = true)
end

# ---------------------------------------------------------------------------------------------
# The hidden process of the page
# ---------------------------------------------------------------------------------------------

"""
What the Julia extension runs (pollisModelBenchmarks.ts): with a JSON file of the task as its argument, and a line of
JSON on stdin for "model", {url, freeBefore}. It writes a line of JSON on stdout as it goes: {"done", "total"} (with
"tokens" for "model"), then what the task answers, or {"error"}. The tasks:
  - "download", {benchmark}: answers {info};
  - "start", {benchmark, sample: {size, strata, allocation, seed}, settings: {shots, reasoning, thinking, maxTokens}, pollis}: answers {run};
  - "model", {run, model: {value, label, size}}: answers {figures}.
"""
function main(task_file)
	say(value) = (println(JSON3.write(value)); flush(stdout))
	task = JSON3.read(read(task_file, String))
	try
		if task.task == "download"
			info = download(task.benchmark; progress = (done, total) -> say((; done, total)))
			say((; info))
		elseif task.task == "start"
			# All the strata when the job names none: the page leaves them out when every stratum is ticked
			strata = get(task.sample, :strata, nothing)
			sample = draw(task.benchmark; size = task.sample.size, strata = strata === nothing ? nothing : String.(strata),
				allocation = task.sample.allocation, seed = task.sample.seed)
			id = new_run(task.benchmark, sample; shots = task.settings.shots, reasoning = task.settings.reasoning,
				thinking = task.settings.thinking, max_tokens = task.settings.maxTokens, pollis = task.pollis)
			say((; run = id, questions = sample.size))
		elseif task.task == "model"
			server = JSON3.read(readline(stdin))
			result = run_model!(task.run, task.model.value, server.url; label = task.model.label, size = something(get(task.model, :size, nothing), ""),
				free_before = something(get(server, :freeBefore, nothing), available_memory()),
				progress = (done, total, tokens) -> say((; done, total, tokens)))
			say((; figures = result))
		else
			say((; error = "no task $(task.task)"))
		end
	catch err
		say((; error = first(sprint(showerror, err), 400)))
		exit(1)
	end
end

end

ModelBenchmarks.HIDDEN && ModelBenchmarks.main(abspath(ARGS[1]))
