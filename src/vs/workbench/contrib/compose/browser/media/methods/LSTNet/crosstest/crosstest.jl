# The cross-tests against Lai et al.'s code, on the artificial datasets of artificial/ and the results of their code in
# authors/reference.json (written by authors/export.py):
#
#   A  the same weights: the forecasts of the test times and their RSE and CORR
#   B  the same weights, the same batch order and dropout 0: the gradient norm of every training step, the validation
#      RSE of every epoch and the final weights
#
# Needs LSTNet, Lux, Optimisers, Test, MLDataDevices, JSON, DelimitedFiles, Tables, Random and Statistics loaded.

const CROSSTEST = @__DIR__

"A PyTorch tensor of reference.json (its values flattened in row-major order) as a Julia array of the same shape."
function torcharray(tensor)
	shape = Int.(tensor["shape"])
	permutedims(reshape(Float32.(tensor["values"]), reverse(shape)...), length(shape):-1:1)
end

"The parameters of [`LSTNet.network`](@ref) from a PyTorch `state_dict`."
function luxparameters(weights)
	t(name) = torcharray(weights[name])
	# conv1.weight is filters × 1 × kernel × series; the dense layer takes the window unfolded series first
	conv = t("conv1.weight")[:, 1, :, :]
	gru(name) = (weight_ih = t("$name.weight_ih_l0"), weight_hh = t("$name.weight_hh_l0"), bias_ih = t("$name.bias_ih_l0"), bias_hh = t("$name.bias_hh_l0"))
	(conv = (weight = reshape(permutedims(conv, (1, 3, 2)), size(conv, 1), :), bias = t("conv1.bias")), gru = gru("GRU1"),
		skipgru = gru("GRUskip"), drop = (;), head = (weight = t("linear1.weight"), bias = t("linear1.bias")),
		highway = (weight = t("highway.weight"), bias = t("highway.bias")))
end

"The settings of the cross-tests (those of export.py) with the case's output function and dropout."
function crosssettings(reference, case; dropout = 0.2)
	r = reference["settings"]
	Settings(; window = r["window"], kernel = r["CNN_kernel"], skip = r["skip"], hidcnn = r["hidCNN"], hidrnn = r["hidRNN"],
		hidskip = r["hidSkip"], highway = r["highway_window"], dropout, output = case["output"] == "sigmoid" ? sigmoid : identity)
end

crosssplit(case) = Split(Tables.table(readdlm(joinpath(CROSSTEST, "artificial", case["dataset"] * ".txt"), ',', Float64)), case["horizon"])

"""
Cross-test A: the forecasts of the test times by the network with the PyTorch initial weights, in evaluation mode, and
their RSE and CORR. Returns the largest absolute difference of the forecasts and the differences of the RSE and CORR.

The CORR is compared with the mean of the authors' correlations over the series whose test values are not constant.
Their `evaluate` checks the standard deviation against 0 in float32, where a nonzero constant can come out as 1.8e-7:
the series is then kept, with a correlation of 0, which pulls the mean towards 0. We leave it out, as the check intends.
"""
function crossforward(reference, case)
	s = crosssplit(case)
	model = LSTNet.network(crosssettings(reference, case), size(s.data, 2))
	parameters = luxparameters(case["forward"]["weights"])
	_, states = Lux.setup(Xoshiro(0), model)
	series = permutedims(s.data)
	predicted = LSTNet.predict(model, parameters, states, times -> LSTNet.windows(series, s, times, 48), s.test)
	e = evaluate(s, predicted)
	torch = case["forward"]
	(; forecasts = maximum(abs, predicted - reduce(hcat, torch["test"])'), rse = e.rse - torch["rse"], corr = e.corr - mean(Float64.(torch["corrs"])[Float64.(torch["sigma"]) .> 1e-5]))
end

"""
Cross-test B: training from the PyTorch initial weights, with dropout 0 and PyTorch's batch order, for as many epochs
as the reference. Returns the largest relative difference of the gradient norms, of the validation RSEs (normalised as
`main.py` does, by the standard deviation of the test values) and of the final weights.
"""
function crosssteps(reference, case)
	s = crosssplit(case)
	settings = crosssettings(reference, case; dropout = 0)
	model = LSTNet.network(settings, size(s.data, 2))
	t = LSTNet.trainer(model, s, settings)
	torch = case["steps"]
	state = Training.TrainState(model, t.device(luxparameters(torch["initial"])), t.state.states, Adam(Float32(settings.learningrate)))
	fit = LSTNet.targets(s, settings.window)
	norms, rses = Float64[], Float64[]
	for order in torch["orders"]
		for batch in Iterators.partition(fit[order .+ 1], settings.batchsize)
			norm, state = LSTNet.step(t.ad, t.loss, (t.inputs(batch), t.target(batch)), state, settings.clip)
			push!(norms, norm)
		end
		predicted = LSTNet.predict(model, state.parameters, state.states, t.inputs, s.valid) .* s.scale'
		push!(rses, sqrt(mean(abs2, predicted - s.raw[s.valid, :])) / LSTNet.normalstd(s.raw[s.test, :]))
	end
	final = luxparameters(torch["final"])
	relative(a, b) = maximum(abs.(a - b) ./ max.(abs.(b), 1e-3))
	weights = maximum(relative(x, y) for (x, y) in zip(Optimisers.trainables(cpu_device()(state.parameters)), Optimisers.trainables(final)))
	(; norms = relative(norms, torch["norms"]), rses = relative(rses, [e["rse"] for e in torch["epochs"]]), weights)
end

"""
Cross-test D: as B, over all the epochs of authors/replay.json, then the epoch with the smallest validation RSE, as
`main.py` keeps it, and the test RSE and CORR of its parameters (CORR over the series whose test values are not
constant, as in A). Returns the validation RSE of every epoch, both codes', the epochs kept and the test RSE and CORR.
"""
function crossreplay(reference, case)
	s = crosssplit(case)
	settings = crosssettings(reference, case; dropout = 0)
	model = LSTNet.network(settings, size(s.data, 2))
	t = LSTNet.trainer(model, s, settings)
	torch = case["steps"]
	state = Training.TrainState(model, t.device(luxparameters(torch["initial"])), t.state.states, Adam(Float32(settings.learningrate)))
	fit = LSTNet.targets(s, settings.window)
	rses = Float64[]
	best = (; rse = Inf)
	for (epoch, order) in enumerate(torch["orders"])
		for batch in Iterators.partition(fit[order .+ 1], settings.batchsize)
			_, state = LSTNet.step(t.ad, t.loss, (t.inputs(batch), t.target(batch)), state, settings.clip)
		end
		predicted = LSTNet.predict(model, state.parameters, state.states, t.inputs, s.valid) .* s.scale'
		push!(rses, sqrt(mean(abs2, predicted - s.raw[s.valid, :])) / LSTNet.normalstd(s.raw[s.test, :]))
		rses[end] < best.rse && (best = (; rse = rses[end], epoch, parameters = deepcopy(state.parameters)))
	end
	e = evaluate(s, LSTNet.predict(model, best.parameters, state.states, t.inputs, s.test))
	test = torch["test"]
	(; rses, torchrses = [e["rse"] for e in torch["epochs"]], epoch = best.epoch, torchepoch = torch["best"], e.rse, torchrse = test["rse"],
		e.corr, torchcorr = mean(Float64.(test["corrs"])[Float64.(test["sigma"]) .> 1e-5]))
end

"""
Cross-test C: a full training of the case with the seed, as `main.py` (dropout 0.2, 100 epochs): the test RSE and CORR.
Both codes draw their own random numbers, so only the spread over seeds can be compared.
"""
function crosstraining(reference, case, seed)
	s = crosssplit(case)
	evaluate(s, forecast(LSTNetSkip(Settings(crosssettings(reference, case); seed)), s).test)
end

"""
	crosstests()

Runs cross-tests A and B on every case of authors/reference.json, as test sets.
"""
function crosstests()
	reference = JSON.parsefile(joinpath(CROSSTEST, "authors", "reference.json"))
	@testset "Cross-tests against the authors' code" begin
		for case in reference["cases"]
			@testset "$(case["dataset"]), horizon $(case["horizon"])" begin
				a = crossforward(reference, case)
				@test a.forecasts < 1e-5
				@test abs(a.rse) < 1e-5
				@test abs(a.corr) < 1e-5
				b = crosssteps(reference, case)
				@test b.norms < 1e-4
				@test b.rses < 1e-4
				@test b.weights < 1e-3
			end
		end
	end
end
