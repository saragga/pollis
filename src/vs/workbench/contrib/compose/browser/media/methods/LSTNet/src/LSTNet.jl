module LSTNet

using LinearAlgebra, Statistics, Random, Serialization, TOML, Tables
using Lux, Optimisers, Enzyme, Zygote, MLDataDevices
using Functors: fmap

export Split, rse, corr, evaluate, forecast, table2, Settings, SETTINGS
export LSTNetSkip

"""
	Split

A multivariate series cut as in Lai et al. (2018) and their code (`utils.py`): each series divided by the largest
absolute value it takes, then the first 60 per cent of the times for training, the next 20 for validation and the last
20 for the test. A forecast of time t with horizon `horizon` uses the observations up to time t - `horizon`.

Fields: `raw` and `data` (times in rows, series in columns, as read and divided), `scale` (each series' divisor),
`train`, `valid` and `test` (the times of each part), `horizon`.
"""
struct Split
	raw::Matrix{Float64}
	data::Matrix{Float64}
	scale::Vector{Float64}
	train::UnitRange{Int}
	valid::UnitRange{Int}
	test::UnitRange{Int}
	horizon::Int
end

"""
	Split(table, horizon)

The split of a Tables.jl table, one column per series, for forecasts `horizon` steps ahead.
"""
function Split(table, horizon::Integer)
	raw = Float64.(Tables.matrix(table))
	n = size(raw, 1)
	scale = vec(maximum(abs, raw; dims = 1))
	train, valid = floor(Int, 0.6n), floor(Int, 0.8n)
	Split(raw, raw ./ scale', scale, 1:train, train + 1:valid, valid + 1:n, horizon)
end

"The times of the training targets of a model whose forecasts look `window` observations back."
targets(s::Split, window) = window + s.horizon:last(s.train)

"""
The standard deviation of `normal_std` in Lai et al.'s `utils.py`: that of all the values with n - 1 (`torch.std`), times
√((r - 1) / r), where r is the number of rows (`len` of a matrix), not of values.
"""
normalstd(x::AbstractMatrix) = std(x) * sqrt((size(x, 1) - 1) / size(x, 1))

"""
	rse(predicted, actual)

The root relative squared error of Lai et al. (2018): the root mean squared error over every series and time, divided by
the standard deviation of all the actual values as their code computes it (see [`normalstd`](@ref)).
"""
rse(predicted::AbstractMatrix, actual::AbstractMatrix) = sqrt(mean(abs2, predicted - actual)) / normalstd(actual)

"""
	corr(predicted, actual)

The empirical correlation coefficient of Lai et al. (2018): the correlation over time of each series' forecasts and
values, averaged over the series that are not constant in the test period.
"""
function corr(predicted::AbstractMatrix, actual::AbstractMatrix)
	sp, sa = vec(std(predicted; dims = 1, corrected = false)), vec(std(actual; dims = 1, corrected = false))
	c = vec(mean((predicted .- mean(predicted; dims = 1)) .* (actual .- mean(actual; dims = 1)); dims = 1)) ./ (sp .* sa)
	mean(c[sa .!= 0])
end

"The RSE of forecasts of the series as divided, at the times `times`, in the units of the data."
score(s::Split, predicted, times) = rse(predicted .* s.scale', s.raw[times, :])

"""
	evaluate(s::Split, predicted)

The RSE and CORR of forecasts of the test times, made on the series as divided, in the units of the data.
"""
evaluate(s::Split, predicted::AbstractMatrix) = (rse = rse(predicted .* s.scale', s.raw[s.test, :]), corr = corr(predicted .* s.scale', s.raw[s.test, :]))

include("neural.jl")

"""
	SETTINGS

The settings of the neural networks for each dataset, from the scripts of Lai et al.'s code (`ele.sh`, `traffic.sh`,
`solar.sh`, `stock.sh`; the last is the exchange rates): a window of 24 × 7, a convolution of 6 steps, a highway of 24,
a skip of 24, dropout 0.2, and the hidden sizes and output function each script sets.
"""
const SETTINGS = Dict(
	"electricity" => Settings(; output = identity),
	"traffic" => Settings(; hidskip = 10, output = sigmoid),
	"solar" => Settings(; hidskip = 10, output = identity),
	"exchange" => Settings(; hidcnn = 50, hidrnn = 50, output = identity),
)

"""
	table2(table, dataset; horizons = (3, 6, 12, 24), epochs = 100, folder = nothing)

One dataset's LSTNet-Skip columns of Lai et al.'s Table 2: the RSE and CORR (rows) at each horizon (columns).
`dataset` is "electricity", "traffic", "solar" or "exchange", which picks the [`SETTINGS`](@ref).

With `folder`, each horizon's result is saved there when its training ends (`DATASET-HORIZON.toml`: the RSE, CORR, the
epoch kept, the seconds, the settings and the versions), and its training after every epoch
(`DATASET-HORIZON.checkpoint`). Run again with the same folder, `table2` takes the finished horizons from their files
and continues an unfinished one from its last epoch. A stop (Ctrl-C, or stopping the notebook cell) returns the table so
far, NaN where a horizon is not finished.
"""
function table2(table, dataset::AbstractString; horizons = (3, 6, 12, 24), epochs::Integer = 100, folder = nothing)
	settings = Settings(SETTINGS[dataset]; epochs)
	results = fill(NaN, 2, length(horizons))
	folder === nothing || mkpath(folder)
	try
		for (j, horizon) in enumerate(horizons)
			cell = folder === nothing ? nothing : joinpath(folder, "$dataset-$horizon")
			if cell !== nothing && isfile(cell * ".toml")
				saved = TOML.parsefile(cell * ".toml")
				saved["epochs"] == epochs || error("$cell.toml has $(saved["epochs"]) epochs, not $epochs: move it away to train again")
				results[:, j] = [saved["rse"], saved["corr"]]
				@info "$dataset, horizon $horizon: RSE $(round(saved["rse"]; digits = 4)), CORR $(round(saved["corr"]; digits = 4)) (finished earlier, $cell.toml)"
				continue
			end
			s = Split(table, horizon)
			f = forecast(LSTNetSkip(settings), s; checkpoint = cell === nothing ? nothing : cell * ".checkpoint")
			e = evaluate(s, f.test)
			results[:, j] = [e.rse, e.corr]
			@info "$dataset, horizon $horizon: RSE $(round(e.rse; digits = 4)), CORR $(round(e.corr; digits = 4)), epoch $(f.epoch), $(round(Int, f.seconds)) s"
			if cell !== nothing
				open(cell * ".toml", "w") do io
					TOML.print(io, Dict("dataset" => dataset, "horizon" => horizon, "rse" => e.rse, "corr" => e.corr, "epoch" => f.epoch,
						"seconds" => f.seconds, "epochs" => epochs, "settings" => string(settings), "device" => string(gpu_device()),
						"julia" => string(VERSION), "lstnet" => string(pkgversion(LSTNet))))
				end
				rm(cell * ".checkpoint"; force = true)
			end
		end
	catch caught
		caught isa InterruptException || rethrow()
		@info "Stopped. " * (folder === nothing ? "" : "Run table2 again with folder = $(repr(folder)) to continue.")
	end
	results
end

end
