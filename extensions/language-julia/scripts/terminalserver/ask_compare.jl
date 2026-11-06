# Pollis: the evaluation of Evaluate Answering Models, with RAGTools.jl and PromptingTools.jl, which RAGTools.jl calls the models
# with (Pollis' forks, which run on Julia 1.13, as in LLM Text Analysis). Run by the Julia extension in a hidden process
# (pollisCompareModels.ts) with one argument, a JSON file of the task, and on stdin one line of JSON: the keys of the
# cloud providers, from Secret Storage, by the variable PromptingTools reads them from (ANTHROPIC_API_KEY, ...), set in
# this process only, and the address of the llama-server of each local model the task needs, by its file. Two tasks:
#   - "questions": RAGTools.build_qa_evals has the model `model` write, for each passage of `passages` ({source,
#     context}), a question that only that passage answers, and the answer; each is written as {"item"}, a QAEvalItem
#     of RAGTools.jl, as it comes.
#   - "judge": each answer of `answers` ({id, question, right, answer}) is rated by each model of `judges` against
#     the right answer, from 1 to 5 with a rationale, written as {"score"}; the judge reads only the question, the
#     right answer and the answer, not the passages the answer was written from.
# A model is {name, provider, file}: provider "local" for a model of this computer, else "anthropic", "google" or
# "openai". Its own environment, ~/.pollis/ask/julia/vX.Y, gets the packages the first time, while {"status":
# "installing"} is written. It writes a line of JSON on stdout as it goes: {"done", "total"} after each item, in "judge"
# with "tokens", [read, written], the tokens the judges used until then; {"failed"} with what went wrong for an item
# that gave nothing, {"error"} when the task cannot be done.
import Pkg

const TASK = abspath(ARGS[1])
const ENVIRONMENT = joinpath(homedir(), ".pollis", "ask", "julia", "v$(VERSION.major).$(VERSION.minor)")
"""Pollis' forks of PromptingTools.jl and RAGTools.jl, as LLM Text Analysis installs them."""
const FORKS = [
	(name = "PromptingTools", url = "https://github.com/Trumpingtons/PromptingTools.jl"),
	(name = "RAGTools", url = "https://github.com/Trumpingtons/RAGTools.jl"),
]

say(line) = (println(line); flush(stdout))

Pkg.activate(ENVIRONMENT; io = devnull)
let installed = Set(info.name for info in values(Pkg.dependencies()) if info.is_direct_dep)
	missing_forks = [Pkg.PackageSpec(; fork.url, rev = "main") for fork in FORKS if !(fork.name in installed)]
	if !isempty(missing_forks) || !("JSON3" in installed)
		say("{\"status\":\"installing\"}")
		isempty(missing_forks) || Pkg.add(missing_forks; io = devnull)
		"JSON3" in installed || Pkg.add("JSON3"; io = devnull)
	end
end

using JSON3

# The keys, set before PromptingTools loads, which reads them then; and the local models' servers
const SECRETS = JSON3.read(readline(stdin))
for (variable, key) in pairs(get(SECRETS, :keys, Dict()))
	ENV[String(variable)] = String(key)
end
const SERVERS = Dict(String(file) => String(url) for (file, url) in pairs(get(SECRETS, :servers, Dict())))
# The key PromptingTools gives the OpenAI API of llama-server, which reads none, when RAGTools calls a local model
isempty(SERVERS) || haskey(ENV, "OPENAI_API_KEY") || (ENV["OPENAI_API_KEY"] = "llama.cpp")

using PromptingTools, RAGTools
const PT = PromptingTools

const JOB = JSON3.read(read(TASK, String))

json(value) = say(JSON3.write(value))
failure(err) = sprint(showerror, err) |> text -> first(text, 400)

"""The schema of PromptingTools for a model's provider: a local model through the OpenAI API of its llama-server."""
schema(provider) = provider == "anthropic" ? PT.AnthropicSchema() :
	provider == "google" ? PT.GoogleOpenAISchema() :
	provider == "openai" ? PT.OpenAISchema() : PT.CustomOpenAISchema()

"""
Registers `model` with its provider, so that any current model works (the model list of PromptingTools is older), and
answers what it is called with: its name, and for a local model the address of its server.
"""
function use_model(model)
	name = String(model.name)
	if !haskey(PT.MODEL_REGISTRY, name) || !(PT.MODEL_REGISTRY[name].schema isa typeof(schema(model.provider)))
		PT.register_model!(; name, schema = schema(model.provider))
	end
	model.provider == "local" || return (; model = name, api_kwargs = NamedTuple())
	url = get(SERVERS, String(model.file), "")
	isempty(url) && error("$(name) did not start on this computer")
	(; model = name, api_kwargs = (; url, temperature = 0))
end

"""One question and its answer for each passage, by RAGTools.build_qa_evals, a passage at a time so that each is written as it comes."""
function questions()
	model = use_model(JOB.model)
	total = length(JOB.passages)
	for (i, passage) in enumerate(JOB.passages)
		try
			items = RAGTools.build_qa_evals([String(passage.context)], [String(passage.source)]; model.model, model.api_kwargs, verbose = false)
			if isempty(items)
				json((; failed = i, error = "no question"))
			else
				json((; item = only(items)))
			end
		catch err
			json((; failed = i, error = failure(err)))
		end
		json((; done = i, total))
	end
end

"""A judge's rating of an answer against the right answer: why, in a sentence or two, then a whole number from 1 to 5."""
Base.@kwdef struct AnswerRating
	rationale::String
	rating::Int
end

"""What the judge is told: how to rate an answer against the right answer."""
const JUDGE_INSTRUCTION = """
You grade an answer to a question by comparing it with the right answer. Rate from 1 to 5 how well the answer agrees
with the right answer:
5: it gives the facts of the right answer and nothing that contradicts it;
4: it gives the main facts of the right answer, with a minor omission or a minor inaccuracy;
3: it gives part of the right answer, or its main fact with an error;
2: it misses the main fact of the right answer, or is mostly wrong;
1: it is wrong, unrelated to the question, or declines to answer.
Correct details that the right answer does not have are not a fault; anything that contradicts it is.
Give the rationale first, in one or two sentences, then the rating."""

"""What the judge is asked about an answer."""
judge_prompt(answer) = """
Question:
$(answer.question)

Right answer:
$(answer.right)

Answer to rate:
$(answer.answer)"""

"""
A judge's reply as a rating from 1 to 5 and its rationale, or why it cannot be read. A reply that does not fit the
type exactly (a rating given as 4.5 or as "4") comes as a Dict: its rating is read as a number, rounded, and held
between 1 and 5.
"""
function rating_of(content)
	content isa AnswerRating && return (; rating = clamp(content.rating, 1, 5), content.rationale)
	content isa AbstractDict || return "the judge's reply could not be read"
	reply = Dict(Symbol(key) => value for (key, value) in content)
	value = get(reply, :rating, nothing)
	number = value isa Real ? Float64(value) : value isa AbstractString ? tryparse(Float64, strip(value)) : nothing
	(isnothing(number) || !isfinite(number)) && return "the judge's reply has no rating"
	rationale = get(reply, :rationale, nothing)
	(; rating = clamp(round(Int, number), 1, 5), rationale = rationale isa AbstractString ? String(rationale) : "")
end

"""
Each answer rated by each judge against the right answer. A judge on this computer replies in JSON mode, held by
llama-server to the type's schema, as a small model does not always give the rating as a whole number when it calls a tool.
"""
function judge()
	judges = [(spec = judge, call = use_model(judge)) for judge in JOB.judges]
	total = length(JOB.answers) * length(judges)
	done = 0
	tokens = [0, 0]
	for (spec, call) in judges, answer in JOB.answers
		try
			prompt = [PT.SystemMessage(JUDGE_INSTRUCTION), PT.UserMessage(judge_prompt(answer))]
			msg = aiextract(prompt; call.model, call.api_kwargs, verbose = false,
				return_type = AnswerRating, json_mode = spec.provider == "local" ? true : nothing)
			tokens .+= msg.tokens
			rated = rating_of(msg.content)
			if rated isa AbstractString
				json((; failed = answer.id, judge = spec.name, error = rated))
			else
				json((; score = (; answer.id, judge = spec.name, rated.rating, rated.rationale, tokens = msg.tokens)))
			end
		catch err
			json((; failed = answer.id, judge = spec.name, error = failure(err)))
		end
		done += 1
		json((; done, total, tokens))
	end
end

try
	JOB.task == "questions" ? questions() : judge()
catch err
	json((; error = failure(err)))
	exit(1)
end
