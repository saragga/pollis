# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
# ---------------------------------------------------------------------------------------------

# The hidden Julia process of Model Benchmarks (Compose > Local Models > Model Benchmarks...), which the Julia
# extension runs (pollisModelBenchmarks.ts): it runs a task of the page with PollisBenchmarks.jl, which PollisDB
# installs into the environment of the packages built into Pollis; a notebook calls the same functions of the package.

using UUIDs: UUID

"""The environment of the packages built into Pollis, where PollisDB installs PollisBenchmarks.jl."""
const POLLIS_ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")
# After the user's environments, so that their own versions of these packages come first
POLLIS_ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, POLLIS_ENVIRONMENT)

const POLLIS_BENCHMARKS = Base.PkgId(UUID("42886f46-29ec-4b6e-a6c6-e95103b5ec0b"), "PollisBenchmarks")

"""
What the Julia extension runs: with a JSON file of the task as its argument, and a line of JSON on stdin for "model",
{url, freeBefore}. It writes a line of JSON on stdout as it goes: {"done", "total"} (with "tokens" for "model"), then
what the task answers, or {"error"}. The tasks:
  - "download", {benchmark}: answers {info};
  - "start", {benchmark, sample: {size, strata, allocation, seed}, settings: {shots, reasoning, thinking, maxTokens}, pollis}: answers {run};
  - "model", {run, model: {value, label, size}}: answers {figures}.
"""
function main(task_file)
	if Base.locate_package(POLLIS_BENCHMARKS) === nothing
		println("{\"error\":\"PollisBenchmarks.jl is not installed yet: start the Julia REPL, or restart it, and Pollis installs it.\"}")
		exit(1)
	end
	PB = Base.require(POLLIS_BENCHMARKS)
	Base.invokelatest(run_task, PB, task_file)
end

function run_task(PB, task_file)
	JSON3 = PB.JSON3
	say(value) = (println(JSON3.write(value)); flush(stdout))
	task = JSON3.read(read(task_file, String))
	try
		if task.task == "download"
			info = PB.download(task.benchmark; progress = (done, total) -> say((; done, total)))
			say((; info))
		elseif task.task == "start"
			# All the strata when the job names none: the page leaves them out when every stratum is ticked
			strata = get(task.sample, :strata, nothing)
			sample = PB.draw(task.benchmark; size = task.sample.size, strata = strata === nothing ? nothing : String.(strata),
				allocation = task.sample.allocation, seed = task.sample.seed)
			id = PB.new_run(task.benchmark, sample; shots = task.settings.shots, reasoning = task.settings.reasoning,
				thinking = task.settings.thinking, max_tokens = task.settings.maxTokens, pollis = task.pollis)
			say((; run = id, questions = sample.size))
		elseif task.task == "model"
			server = JSON3.read(readline(stdin))
			result = PB.run_model!(task.run, task.model.value, server.url; label = task.model.label, size = something(get(task.model, :size, nothing), ""),
				free_before = something(get(server, :freeBefore, nothing), PB.available_memory()),
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

main(abspath(ARGS[1]))
