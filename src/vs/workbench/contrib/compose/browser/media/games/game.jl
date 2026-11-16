# Copyright (c) 2026 Antonio Saragga Seabra
# SPDX-License-Identifier: MIT

# Compose > Collaboration > Simulation Games: plays one round of a case's model. Pollis runs it on the
# facilitator's computer, in a fresh Julia process for each round, and reads the JSON it writes.
#
#   julia game.jl CASE_FOLDER GAME_FOLDER ROUND
#
# A case is a folder with case.toml and model.jl, which defines two functions:
#
#   initial(rng, parameters, teams) -> state, or (state, results) for what the teams see before round 1
#   play(rng, state, decisions, parameters) -> (state, results)
#
# - parameters: the [parameters] table of case.toml, a Dict with String keys, as the news released in the
#   rounds so far changed it: round-j/news.toml, for each round j up to this one, lists the [[news]] released
#   in it, each with the values of [news.parameters] that replace those of [parameters] from round j on. In
#   a case with round_choices, "rounds" is the number of rounds the facilitator chose, from game.toml. In a
#   Trading Floor case, "market" is its [market] table, and each team's decisions are its desk's position at
#   the close of the period: cash, shares, bought, sold, average_buy, average_sell, and the market's
#   last_price, average_price, high, low and volume.
# - teams: a Dict for each team, with "team", its number from 1, and "name"; in a case whose teams differ
#   ([[sides]] in case.toml, such as a buyer and the sellers), also "side", the key of its side.
# - decisions: a Dict for each team, in the order of the teams, with "team", "name" ("side" too, in a case
#   with sides) and "decisions", the values the team chose for the [[decisions]] of case.toml, by key: only
#   those of its side and of this round, when a decision names its sides or its rounds. A decision with
#   rivals = true, made for each other team still in the game, is a Dict by the other team's number as a
#   string: bid["2"].
# - state: a Dict with String keys whose values TOML can hold (numbers, strings, Booleans, arrays and
#   tables). It is written to state.toml in each round's folder, so a game can be read and played again.
# - results: a Dict with "public", the rows every player sees, and "private", the rows each team alone
#   sees, by team number as a string. Each row is a Dict whose keys are those of [[results.public]] or
#   [[results.private]] in case.toml. "text", when there is one, is shown to everyone; "private_text", a
#   Dict by team number as a string, is shown to each team alone. "out", a Dict by team number as a string,
#   takes those teams out of the game from the next round (a company bought, say), saying why; they keep
#   their results but decide no more. "over" = true ends the game after this round.
#
# Round 0 calls initial and writes round-00/state.toml. Round k from 1 reads round-(k-1)/state.toml and
# round-k/decisions.toml, calls play, and writes round-k/state.toml and round-k/results.json. The random
# number generator is Xoshiro(seed + round), with the seed of GAME_FOLDER/game.toml, so a round played again
# gives the same results. When the round fails, round-k/error.txt says why.

using TOML, Random, Printf

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
json(io::IO, value::Symbol) = json(io, String(value))
json(io::IO, value::Bool) = print(io, value ? "true" : "false")
json(io::IO, value::Integer) = print(io, value)
json(io::IO, value::AbstractFloat) = isfinite(value) ? print(io, Float64(value)) : print(io, "null")
json(io::IO, value::Nothing) = print(io, "null")
json(io::IO, value::Union{AbstractVector,Tuple}) = (print(io, '['); for (i, item) in enumerate(value)
		i > 1 && print(io, ','); json(io, item)
	end; print(io, ']'))
json(io::IO, value::Union{AbstractDict,NamedTuple}) = (print(io, '{'); for (i, (key, item)) in enumerate(pairs(value))
		i > 1 && print(io, ','); json(io, string(key)); print(io, ':'); json(io, item)
	end; print(io, '}'))

"""The packages a case names that the active environment cannot load, installed quietly."""
function install(packages)
	missing = filter(name -> Base.find_package(name) === nothing, packages)
	if !isempty(missing)
		@eval Main import Pkg
		Main.Pkg.add(missing; io = devnull)
	end
end

"""The case's model.jl, loaded in a module of its own, with Random, Statistics, LinearAlgebra and Printf."""
function model(case::AbstractString, packages)
	m = Module(:Case)
	Core.eval(m, :(using Random, Statistics, LinearAlgebra, Printf))
	for name in packages
		Core.eval(m, :(using $(Symbol(name))))
	end
	Base.include(m, joinpath(case, "model.jl"))
	return m
end

roundfolder(game::AbstractString, round::Integer) = joinpath(game, @sprintf("round-%02d", round))

"""Applies a news item's changes to the parameters: each value replaces the one in the same place."""
function apply!(parameters::AbstractDict, changes::AbstractDict)
	for (key, value) in changes
		if value isa AbstractDict && get(parameters, key, nothing) isa AbstractDict
			apply!(parameters[key], value)
		else
			parameters[key] = value
		end
	end
	return parameters
end

function main(args)
	case, game, round = args[1], args[2], parse(Int, args[3])
	folder = roundfolder(game, round)
	mkpath(folder)
	try
		spec = TOML.parsefile(joinpath(case, "case.toml"))
		packages = get(spec, "packages", String[])
		install(packages)
		setup = TOML.parsefile(joinpath(game, "game.toml"))
		parameters = merge(get(spec, "parameters", Dict{String,Any}()), get(setup, "parameters", Dict{String,Any}()))
		haskey(spec, "market") && (parameters["market"] = spec["market"])
		for j in 1:round
			news = joinpath(roundfolder(game, j), "news.toml")
			if isfile(news)
				for item in get(TOML.parsefile(news), "news", Any[])
					apply!(parameters, get(item, "parameters", Dict{String,Any}()))
				end
			end
		end
		rng = Xoshiro(setup["seed"] + round)
		m = model(case, packages)
		if round == 0
			start = Base.invokelatest(Core.eval(m, :initial), rng, parameters, setup["teams"])
			state, results = start isa Tuple ? start : (start, Dict{String,Any}())
		else
			state = TOML.parsefile(joinpath(roundfolder(game, round - 1), "state.toml"))
			decisions = TOML.parsefile(joinpath(folder, "decisions.toml"))["teams"]
			state, results = Base.invokelatest(Core.eval(m, :play), rng, state, decisions, parameters)
		end
		open(io -> TOML.print(io, state), joinpath(folder, "state.toml"), "w")
		open(io -> json(io, results), joinpath(folder, "results.json"), "w")
	catch error
		write(joinpath(folder, "error.txt"), sprint(showerror, error isa LoadError ? error.error : error))
	end
end

main(ARGS)
