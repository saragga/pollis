# Sell One Product, a minimal case. Rival teams each sell the same kind of product to the same buyers, and each
# round a team sets its price. A team's appeal to the buyers is
#
#   appeal = -price_sensitivity * log(price)
#
# and the buyers choose among the teams and buying none (no_purchase_appeal) by a multinomial logit: a team's
# share of the market is exp(appeal) over the sum of exp(appeal) of all teams and of buying none. Each game
# draws its own market size from the range of [parameters], and the debrief shows what was drawn.
#
# Pollis calls initial before the first round and play for each round; media/games/game.jl in Pollis says what
# each argument and result holds.

"""A value drawn evenly from a range [low, high]."""
draw(rng, range) = range[1] + (range[2] - range[1]) * rand(rng)

"""The state before the first round: the market drawn for this game, and each team with no profit yet; and, for the debrief, what was drawn."""
function initial(rng, parameters, teams)
	market = round(draw(rng, parameters["market_size"]); digits = -2)
	state = Dict{String,Any}(
		"round" => 0,
		"market" => market,
		"teams" => [Dict{String,Any}("team" => team["team"], "name" => team["name"], "cumulative_profit" => 0.0) for team in teams],
	)
	return state, Dict{String,Any}("debrief" => @sprintf("What this game drew: the buyers would buy %d units a round.", round(Int, market)))
end

"""One round: each team's share of the market, its sales and its profit."""
function play(rng, state, decisions, parameters)
	p = parameters
	chosen = Dict(entry["team"] => entry["decisions"] for entry in decisions)
	prices = [float(chosen[team["team"]]["price"]) for team in state["teams"]]
	weights = [exp(-p["price_sensitivity"] * log(price)) for price in prices]
	total = exp(p["no_purchase_appeal"]) + sum(weights)

	teams = Dict{String,Any}[]
	public = Dict{String,Any}[]
	private = Dict{String,Any}()
	for (team, price, weight) in zip(state["teams"], prices, weights)
		share = weight / total
		sales = round(Int, share * state["market"])
		revenue = sales * price
		costs = sales * p["unit_cost"] + p["fixed_cost"]
		profit = revenue - costs
		cumulative = team["cumulative_profit"] + profit
		push!(teams, Dict{String,Any}("team" => team["team"], "name" => team["name"], "cumulative_profit" => cumulative))
		push!(public, Dict{String,Any}("team" => team["name"], "price" => price, "share" => 100 * share, "profit" => profit, "cumulative_profit" => cumulative))
		private[string(team["team"])] = [Dict{String,Any}("sales" => sales, "revenue" => revenue, "costs" => costs, "profit" => profit)]
	end

	number = state["round"] + 1
	leader = argmax(team -> team["cumulative_profit"], teams)
	text = @sprintf("Round %d: %s leads, with a cumulative profit of %.0f €.", number, leader["name"], leader["cumulative_profit"])
	return Dict{String,Any}("round" => number, "market" => state["market"], "teams" => teams),
		Dict{String,Any}("public" => public, "private" => private, "text" => text)
end
