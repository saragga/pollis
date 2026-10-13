# Copyright (c) 2026 Antonio Saragga Seabra
# Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.

# Compose > Practice: makes one version of each exercise from a seed. Pollis runs it in a hidden terminal
# and reads the JSON it writes.
#
#   julia practice.jl OUT.json SEED EXERCISE.toml...
#
# An exercise is a TOML file (Write an Exercise... starts one from a template):
#
#   title = "Mean or median?"
#   panel = "chiara.explore.dstats"       # optional: the command of the panel that explains the method
#   packages = ["Distributions"]          # optional: installed into the default environment when missing
#   setup = """                           # optional Julia code; `rng` is a random number generator seeded
#   x = round.(rand(rng, Normal(50, 10), 8); digits = 1)   # for this version
#   """
#   question = """The sample is {{list(x)}}. What is its mean?"""
#   choices = ["{{fmt(mean(x), 2)}}", "{{fmt(median(x), 2)}}", "{{fmt(sum(x) / 7, 2)}}"]
#   answer = 1                            # the correct choice, counted from 1 in `choices`
#   explanation = """The mean is the sum divided by n = 8: {{fmt(mean(x), 2)}}."""
#
# Every {{expression}} in the question, the choices and the explanation is Julia, evaluated after setup in
# the exercise's own module, where Random, Statistics, LinearAlgebra and the packages are loaded and
# fmt(x, digits) (fixed decimals) and list(v) (values separated by commas) are defined. The choices are
# shuffled with the seed. When two choices come out the same, the version is drawn again with the next
# seed, so a choice is never ambiguous. Each exercise writes either its version or the error it raised.

using TOML, Random, Printf

const PLACEHOLDER = r"\{\{(?<expression>.+?)\}\}"s
const ATTEMPTS = 20

json(io::IO, value::AbstractString) = (print(io, '"'); for c in value
		if c == '"' || c == '\\'
			print(io, '\\', c)
		elseif c == '\n'
			print(io, "\\n")
		elseif c < ' '
			@printf(io, "\\u%04x", UInt32(c))
		else
			print(io, c)
		end
	end; print(io, '"'))
json(io::IO, value::Integer) = print(io, value)
json(io::IO, value::Nothing) = print(io, "null")
json(io::IO, value::AbstractVector) = (print(io, '['); for (i, item) in enumerate(value)
		i > 1 && print(io, ','); json(io, item)
	end; print(io, ']'))
json(io::IO, value::AbstractDict) = (print(io, '{'); for (i, (key, item)) in enumerate(value)
		i > 1 && print(io, ','); json(io, string(key)); print(io, ':'); json(io, item)
	end; print(io, '}'))

"""The packages an exercise names that the active environment cannot load, installed quietly."""
function install(packages)
	missing = filter(name -> Base.find_package(name) === nothing, packages)
	if !isempty(missing)
		@eval Main import Pkg
		Main.Pkg.add(missing; io = devnull)
	end
end

"""A fresh module for one version of an exercise, with its packages and the helpers loaded."""
function sandbox(packages, seed)
	m = Module(:Exercise)
	Core.eval(m, :(using Random, Statistics, LinearAlgebra, Printf))
	for name in packages
		Core.eval(m, :(using $(Symbol(name))))
	end
	Core.eval(m, quote
		fmt(x::Real, digits::Integer) = Printf.format(Printf.Format("%.$(digits)f"), x)
		list(v) = join(v, ", ")
		const rng = Xoshiro($seed)
	end)
	return m
end

"""`text` with each {{expression}} replaced by its value."""
function render(m::Module, text::AbstractString)
	replace(text, PLACEHOLDER => function (match)
		expression = Meta.parse(String(only(Base.match(PLACEHOLDER, match).captures)))
		value = Base.invokelatest(Core.eval, m, expression)
		value isa AbstractVector ? join(value, ", ") : string(value)
	end)
end

"""One version of the exercise in `file`, from `seed`: the question, the shuffled choices, the correct one and the explanation."""
function version(file::AbstractString, seed::Integer)
	exercise = TOML.parsefile(file)
	packages = get(exercise, "packages", String[])
	install(packages)
	choices = exercise["choices"]
	answer = exercise["answer"]
	1 <= answer <= length(choices) || error("answer = $answer, but there are $(length(choices)) choices")
	for attempt in 0:ATTEMPTS-1
		s = seed + 1000 * attempt
		m = sandbox(packages, s)
		Base.invokelatest(include_string, m, get(exercise, "setup", ""), file)
		rendered = [strip(render(m, choice)) for choice in choices]
		allunique(rendered) || continue
		order = randperm(Xoshiro(s + 1), length(choices))
		return Dict(
			"seed" => s,
			"title" => get(exercise, "title", splitext(basename(file))[1]),
			"panel" => get(exercise, "panel", nothing),
			"question" => strip(render(m, exercise["question"])),
			"choices" => rendered[order],
			"answer" => findfirst(==(answer), order),
			"explanation" => strip(render(m, get(exercise, "explanation", ""))),
		)
	end
	error("two choices came out the same in $ATTEMPTS versions: make the choices differ")
end

function main(args)
	out, seed, files = args[1], parse(Int, args[2]), args[3:end]
	results = map(enumerate(files)) do (i, file)
		try
			merge(Dict("file" => file), version(file, seed + i))
		catch error
			message = sprint(showerror, error isa LoadError ? error.error : error)
			Dict("file" => file, "error" => message)
		end
	end
	open(io -> json(io, Dict("exercises" => results)), out, "w")
end

main(ARGS)
