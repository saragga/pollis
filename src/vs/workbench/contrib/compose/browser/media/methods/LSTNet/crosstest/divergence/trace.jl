# The Julia side of the step-by-step trace of cross-test D: replays the case that trace.py traced, and at every step
# compares the convolution's pre-activations that PyTorch had within 1e-4 of zero (a ReLU input on the other side of
# zero in Julia is a flip) and the weights after the step. Needs what ../crosstest.jl needs, and crosstest.jl itself.

"""
	tracereplay(folder, k)

The trace of case `k` (1-based) of authors/replay.json against the authors' trace in `folder` (written by trace.py):
the relative distance between the two codes' weights after every step, and the flips of every step, as
(sample, filter, time, Julia's pre-activation, PyTorch's).
"""
function tracereplay(folder, k)
	replay = JSON.parsefile(joinpath(CROSSTEST, "authors", "replay.json"))
	case = replay["cases"][k]
	layout = JSON.parsefile(joinpath(folder, "layout.json"))
	trace = JSON.parsefile(joinpath(folder, "near.json"))
	sizes = [prod(Int.(shape)) for shape in layout["shapes"]]
	offsets = cumsum([0; sizes])
	weights = reinterpret(Float32, read(joinpath(folder, "weights.bin")))
	# The authors' weights after a step, as Lux parameters
	torchat(step) = let w = weights[(step - 1) * offsets[end] + 1:step * offsets[end]]
		luxparameters(Dict(name => Dict("shape" => layout["shapes"][i], "values" => w[offsets[i] + 1:offsets[i + 1]])
			for (i, name) in enumerate(layout["names"])))
	end
	near = Dict{Int, Vector{Any}}()
	for entry in trace["near"]
		push!(get!(near, Int(entry[1]), []), entry)
	end
	s = crosssplit(case)
	settings = crosssettings(replay, case; dropout = 0)
	model = LSTNet.network(settings, size(s.data, 2))
	t = LSTNet.trainer(model, s, settings)
	state = Training.TrainState(model, luxparameters(case["steps"]["initial"]), t.state.states, Adam(Float32(settings.learningrate)))
	fit = LSTNet.targets(s, settings.window)
	flat(p) = reduce(vcat, vec.(collect(Optimisers.trainables(p))))
	distances, flips = Float64[], Dict{Int, Vector{Any}}()
	step = 0
	for order in case["steps"]["orders"], batch in Iterators.partition(fit[order .+ 1], settings.batchsize)
		step += 1
		x = t.inputs(batch)
		# The convolution's pre-activations, filters × steps × batch, as LSTNet.convolve computes them before the ReLU
		conv = state.parameters.conv
		steps = size(x, 2) - settings.kernel + 1
		u = reduce(vcat, [x[:, j:j + steps - 1, :] for j in 1:settings.kernel])
		pre = reshape(conv.weight * reshape(u, :, steps * size(x, 3)) .+ conv.bias, :, steps, size(x, 3))
		for (_, sample, filter, time, torch) in get(near, step, [])
			julia = pre[filter + 1, time + 1, sample + 1]
			(julia > 0) != (torch > 0) && push!(get!(flips, step, []), (sample + 1, filter + 1, time + 1, julia, torch))
		end
		_, state = LSTNet.step(t.ad, t.loss, (x, t.target(batch)), state, settings.clip)
		a, b = flat(state.parameters), flat(torchat(step))
		push!(distances, norm(a - b) / norm(b))
	end
	(; distances, flips)
end
