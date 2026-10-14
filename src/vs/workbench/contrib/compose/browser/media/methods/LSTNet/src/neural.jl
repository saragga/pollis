# LSTNet-Skip, translated from Lai et al.'s code (models/LSTNet.py, main.py, Optim.py, utils.py; commit 093c4dc) into
# Lux. It trains on the GPU that `gpu_device()` finds (CUDA, AMDGPU, Metal or oneAPI, when its package is loaded), with
# Zygote, or on the CPU, with Enzyme

"""
	Settings(; window = 168, kernel = 6, highway = 24, skip = 24, hidcnn = 100, hidrnn = 100, hidskip = 5,
		dropout = 0.2, output = identity, epochs = 100, batchsize = 128, learningrate = 0.001, clip = 10, seed = 54321)

The settings of LSTNet-Skip, with the defaults of Lai et al.'s code (`main.py`): the window of observations each
forecast uses, the steps of the convolution, the highway (the autoregressive component) and the skip, the hidden sizes
of the convolution, the GRU and the skip GRU, the dropout, the output function (`sigmoid` or `identity`), and the
training: epochs, batch size, Adam's learning rate, the norm the gradient is clipped to and the random seed.
`Settings(settings; changes...)` copies settings with changes.
"""
Base.@kwdef struct Settings
	window::Int = 24 * 7
	kernel::Int = 6
	highway::Int = 24
	skip::Int = 24
	hidcnn::Int = 100
	hidrnn::Int = 100
	hidskip::Int = 5
	dropout::Float64 = 0.2
	output::Function = identity
	epochs::Int = 100
	batchsize::Int = 128
	learningrate::Float64 = 1e-3
	clip::Float64 = 10
	seed::Int = 54321
end

Settings(settings::Settings; changes...) = Settings(; (name => getfield(settings, name) for name in fieldnames(Settings))..., changes...)

"The windows before the forecast origins of `times`, as the network takes them: series × steps × times, oldest first."
function windows(series, s::Split, times, window)
	x = Array{Float32}(undef, size(series, 1), window, length(times))
	for (i, t) in enumerate(times)
		x[:, :, i] = view(series, :, t - s.horizon - window + 1:t - s.horizon)
	end
	x
end

"PyTorch's initialisation of `nn.Linear` and `nn.Conv2d` weights, uniform on ±1/√(inputs); Lux's biases already match it."
torchweight(rng, outputs, inputs) = (rand(rng, Float32, outputs, inputs) .- 0.5f0) .* (2 / sqrt(Float32(inputs)))

"The convolution of LSTNet as a dense layer on the unfolded window, which every GPU backend runs: hidcnn × steps × batch."
function convolve(conv, x, kernel)
	steps = size(x, 2) - kernel + 1
	u = reduce(vcat, [x[:, k:k + steps - 1, :] for k in 1:kernel])
	reshape(conv(reshape(u, :, steps * size(x, 3))), :, steps, size(x, 3))
end

"The highway of LSTNet: the same autoregression on the last `highway` values of every series, series × batch."
function highwayterm(highway, x, window)
	m, P, B = size(x)
	z = reshape(permutedims(x[:, P - window + 1:P, :], (2, 1, 3)), window, m * B)
	reshape(highway(z), m, B)
end

"""
	network(settings::Settings, m)

LSTNet-Skip for `m` series (Lai et al. 2018, Section 3), as in `models/LSTNet.py`: a convolution over the window
(`kernel` steps across all the series, `hidcnn` filters, ReLU), a GRU over its output, a GRU over the steps `skip` apart
(the same phase of each period), their last hidden states mapped to the forecasts by a dense layer, plus the highway (an
autoregression on the last `highway` values of each series, the same for all), then the output function; dropout after
the convolution and after each GRU. The skip GRU runs over the last ⌊(window - kernel) / skip⌋ periods of the
convolution's window - kernel + 1 steps: the code divides without rounding, which fails with its own defaults
(162 / 24 = 6.75), and its first author's fix is to take the whole part (issue #2 of the repository, 31 July 2018), so 6
periods of 24. The GRUs use tanh, as `nn.GRU` does (the article's Section 3.3 says ReLU), and all the weights start as
PyTorch's do.
"""
function network(settings::Settings, m)
	st = settings
	steps = st.window - st.kernel + 1
	periods = (st.window - st.kernel) ÷ st.skip
	gru(inputs, outputs) = Recurrence(GRUCell(inputs => outputs; init_weight = nothing, init_bias = nothing))
	@compact(conv = Dense(m * st.kernel => st.hidcnn, relu; init_weight = torchweight), gru = gru(st.hidcnn, st.hidrnn),
		skipgru = gru(st.hidcnn, st.hidskip), drop = Dropout(Float32(st.dropout)),
		head = Dense(st.hidrnn + st.skip * st.hidskip => m; init_weight = torchweight),
		highway = Dense(st.highway => 1; init_weight = torchweight), st = st, steps = steps, periods = periods) do x
		B = size(x, 3)
		c = drop(convolve(conv, x, st.kernel))
		# The last steps, as one sequence over the periods for each phase of the skip and each window
		p = reshape(c[:, steps - periods * st.skip + 1:steps, :], :, st.skip, periods, B)
		p = reshape(permutedims(p, (1, 3, 2, 4)), :, periods, st.skip * B)
		r = vcat(drop(gru(c)), drop(reshape(skipgru(p), :, B)))
		@return st.output.(head(r) .+ highwayterm(highway, x, st.highway))
	end
end

"""
One step of `Optim.py`: the gradient of `loss` on the batch `data`, its norm over all the parameters, the gradient
scaled down to norm `clip` when larger, then Adam. Returns the norm before clipping and the new training state.
"""
function step(ad, loss, data, state, clip)
	gradients, _, _, state = Training.compute_gradients(ad, loss, data, state)
	norm = sqrt(sum(g -> sum(abs2, g), Optimisers.trainables(gradients)))
	norm > clip && (gradients = fmap(g -> g .* Float32(clip / norm), gradients))
	norm, Training.apply_gradients!(state, gradients)
end

"""
	trainer(model, s::Split, settings::Settings)

What `main.py` sets up: the device, the automatic differentiation, the training state, the loss (the absolute error in
the units of the data, the series multiplied back by their scale, summed: `--L1Loss` is always true, since argparse
reads any value given, "False" too, as true) and the functions that make the network's inputs and targets.
"""
function trainer(model, s::Split, settings::Settings)
	rng = Xoshiro(settings.seed)
	device = gpu_device()
	# Runtime activity: the recurrent layers slice the (constant) window, which Enzyme's static analysis cannot tell apart
	ad = device isa CPUDevice ? AutoEnzyme(; mode = Enzyme.set_runtime_activity(Enzyme.Reverse)) : AutoZygote()
	parameters, states = Lux.setup(rng, model) |> device
	state = Training.TrainState(model, parameters, states, Adam(Float32(settings.learningrate)))
	scale = Float32.(s.scale) |> device
	loss(model, parameters, states, (x, y)) = let (ŷ, states) = model(x, parameters, states)
		(sum(abs, (ŷ .- y) .* scale), states, (;))
	end
	series = permutedims(s.data)
	inputs(times) = device(windows(series, s, times, settings.window))
	target(times) = device(permutedims(Float32.(s.data[times, :])))
	(; rng, device, ad, state, loss, inputs, target)
end

"The network's forecasts of `times` in evaluation mode (no dropout), on the series as divided: times × series."
function predict(model, parameters, states, inputs, times)
	states = Lux.testmode(states)
	batches = [cpu_device()(first(model(inputs(batch), parameters, states))) for batch in Iterators.partition(times, 1024)]
	permutedims(Float64.(reduce(hcat, batches)))
end

"""
Trains `model` on the training times of `s` as `main.py` does: each epoch in batches of `batchsize` in a random order,
then the validation RSE, keeping the parameters of the epoch with the smallest; returns its forecasts of the test times.
"""
function train(model, s::Split, settings::Settings)
	t = trainer(model, s, settings)
	state = t.state
	fit = targets(s, settings.window)
	best = (; score = Inf)
	for epoch in 1:settings.epochs
		for batch in Iterators.partition(fit[randperm(t.rng, length(fit))], settings.batchsize)
			_, state = step(t.ad, t.loss, (t.inputs(batch), t.target(batch)), state, settings.clip)
		end
		r = score(s, predict(model, state.parameters, state.states, t.inputs, s.valid), s.valid)
		r < best.score && (best = (; score = r, epoch, parameters = deepcopy(cpu_device()(state.parameters))))
	end
	(; test = predict(model, t.device(best.parameters), state.states, t.inputs, s.test), best.epoch)
end

"""
	LSTNetSkip(settings::Settings)

LSTNet with the recurrent-skip component, as in Lai et al.'s code: see [`network`](@ref) for the model and
[`forecast`](@ref) for its training.
"""
struct LSTNetSkip
	settings::Settings
end

"""
	forecast(method::LSTNetSkip, s::Split)

Trains LSTNet-Skip on the training times of `s` and forecasts the test times. Returns a named tuple whose field `test`
holds the forecasts, a row for each test time and a column for each series, on the series as divided (see
[`Split`](@ref)), and whose field `epoch` is the epoch kept.
"""
forecast(method::LSTNetSkip, s::Split) = train(network(method.settings, size(s.data, 2)), s, method.settings)
