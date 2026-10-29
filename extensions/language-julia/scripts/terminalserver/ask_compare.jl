# Pollis: the evaluation of Evaluate Answering Models, with RAGTools.jl and PromptingTools.jl, which RAGTools.jl calls the models
# with (Pollis' forks, which run on Julia 1.13, as in LLM Text Analysis). Run by the Julia extension in a hidden process
# (pollisCompareModels.ts) with one argument, a JSON file of the task, and on stdin one line of JSON: the keys of the
# cloud providers, from Secret Storage, by the variable PromptingTools reads them from (ANTHROPIC_API_KEY, ...), set in
# this process only, and the address of the llama-server of each local model the task needs, by its file. Two tasks:
#   - "questions": RAGTools.build_qa_evals has the model `model` write, for each passage of `passages` ({source,
#     context}), a question that only that passage answers, and the answer; each is written as {"item"}, a QAEvalItem
#     of RAGTools.jl, as it comes.
#   - "judge": each answer of `answers` ({id, question, passages, answer}) is rated by each model of `judges` against
#     the passages it was given, with the template :RAGJudgeAnswerFromContext and the five parts of
#     RAGTools.JudgeAllScores, written as {"score"}; and for each question of `retrieval` ({id, context, passages}), made
#     from a passage, whether that passage was among those found and at what place (RAGTools.score_retrieval_rank),
#     written as {"rank"}.
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

"""The passages an answer was written from, numbered as the model was given them."""
numbered(passages) = join(("[$(i)] $(text)" for (i, text) in enumerate(passages)), "\n\n")

"""
A judge's reply as RAGTools.JudgeAllScores, or why it cannot be. A reply that does not fit the type exactly (a part
given as 4.5 or as "4") comes as a Dict: its parts are read as numbers, each part rounded to a whole one.
"""
function scores_of(content)
	content isa RAGTools.JudgeAllScores && return content
	content isa AbstractDict || return "the judge's reply could not be read"
	reply = Dict(Symbol(key) => value for (key, value) in content)
	number(value) = value isa Real ? Float64(value) : value isa AbstractString ? tryparse(Float64, strip(value)) : nothing
	parts = (:relevance, :completeness, :clarity, :consistency, :helpfulness, :final_rating)
	values = Dict(part => number(get(reply, part, nothing)) for part in parts)
	absent = [String(part) for part in parts if isnothing(values[part]) || !isfinite(values[part])]
	isempty(absent) || return "the judge's reply has no $(join(absent, ", "))"
	rationale = get(reply, :rationale, nothing)
	RAGTools.JudgeAllScores(; (part => (part == :final_rating ? values[part] : round(Int, values[part])) for part in parts)...,
		rationale = rationale isa AbstractString ? String(rationale) : nothing)
end

"""
Each answer rated by each judge against its passages, with the five parts of RAGTools.JudgeAllScores; and the places of
the passages found. A judge on this computer replies in JSON mode, held by llama-server to the type's schema, as a
small model does not always give the parts as whole numbers when it calls a tool.
"""
function judge()
	for question in JOB.retrieval
		candidates = String.(question.passages)
		rank = isempty(candidates) ? nothing : RAGTools.score_retrieval_rank(String(question.context), candidates)
		json((; rank = (; question.id, rank)))
	end
	judges = [(spec = judge, call = use_model(judge)) for judge in JOB.judges]
	total = length(JOB.answers) * length(judges)
	done = 0
	tokens = [0, 0]
	for (spec, call) in judges, answer in JOB.answers
		try
			msg = aiextract(:RAGJudgeAnswerFromContext; call.model, call.api_kwargs, verbose = false,
				question = String(answer.question), context = numbered(answer.passages), answer = String(answer.answer),
				return_type = RAGTools.JudgeAllScores, json_mode = spec.provider == "local" ? true : nothing)
			tokens .+= msg.tokens
			scores = scores_of(msg.content)
			if scores isa RAGTools.JudgeAllScores
				json((; score = (; answer.id, judge = spec.name, scores.relevance, scores.completeness, scores.clarity,
					scores.consistency, scores.helpfulness, scores.final_rating, scores.rationale,
					tokens = msg.tokens)))
			else
				json((; failed = answer.id, judge = spec.name, error = scores))
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
