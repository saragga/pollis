# Sell One Product, a minimal case. Rival teams each sell the same kind of product to the same buyers, and each
# round a team sets its price and its marketing. A team's appeal to the buyers is
#
#   appeal = -price_sensitivity * log(price) + marketing_appeal * log(1 + marketing / 1000)
#
# and the buyers choose among the teams and buying none (no_purchase_appeal) by a multinomial logit: a team's
# share of the market is exp(appeal) over the sum of exp(appeal) of all teams and of buying none. Each game
# draws its own market size from the range of [parameters], and each round the market moves around it by a
# random shock of about demand_noise; the debrief shows what was drawn.
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
	return state, Dict{String,Any}("debrief" => @sprintf("What this game drew: the buyers would buy about %d units a round, more or less from one round to the next.", round(Int, market)))
end

"""One round: the market, each team's share of it, its sales and its profit."""
function play(rng, state, decisions, parameters)
	p = parameters
	noise = p["demand_noise"]
	market = round(Int, state["market"] * exp(noise * randn(rng) - noise^2 / 2))
	chosen = Dict(entry["team"] => entry["decisions"] for entry in decisions)
	offers = map(state["teams"]) do team
		d = chosen[team["team"]]
		price = float(d["price"])
		marketing = float(d["marketing"])
		appeal = -p["price_sensitivity"] * log(price) + p["marketing_appeal"] * log1p(marketing / 1000)
		(; team, price, marketing, weight = exp(appeal))
	end
	total = exp(p["no_purchase_appeal"]) + sum(offer.weight for offer in offers)

	teams = Dict{String,Any}[]
	public = Dict{String,Any}[]
	private = Dict{String,Any}()
	for offer in offers
		share = offer.weight / total
		sales = round(Int, share * market)
		revenue = sales * offer.price
		costs = sales * p["unit_cost"] + p["fixed_cost"]
		profit = revenue - costs - offer.marketing
		cumulative = offer.team["cumulative_profit"] + profit
		push!(teams, Dict{String,Any}("team" => offer.team["team"], "name" => offer.team["name"], "cumulative_profit" => cumulative))
		push!(public, Dict{String,Any}("team" => offer.team["name"], "price" => offer.price, "marketing" => offer.marketing, "share" => 100 * share, "profit" => profit, "cumulative_profit" => cumulative))
		private[string(offer.team["team"])] = [Dict{String,Any}("market" => market, "sales" => sales, "revenue" => revenue, "costs" => costs, "marketing" => offer.marketing, "profit" => profit)]
	end

	number = state["round"] + 1
	leader = argmax(team -> team["cumulative_profit"], teams)
	text = @sprintf("Round %d: the buyers would buy %d units. %s leads, with a cumulative profit of %.0f €.", number, market, leader["name"], leader["cumulative_profit"])
	return Dict{String,Any}("round" => number, "market" => state["market"], "teams" => teams),
		Dict{String,Any}("public" => public, "private" => private, "text" => text)
end
