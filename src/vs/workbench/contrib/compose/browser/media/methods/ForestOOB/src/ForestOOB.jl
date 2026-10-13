module ForestOOB

using DecisionTree, StatsBase, Random, Statistics, Tables
using DecisionTree: Node

export forest, importance, vote, classify

"""Run each row of `X` down tree `t`."""
function classify(t, X::AbstractMatrix)
	t isa DecisionTree.Root && (t = t.node)
	map(eachrow(X)) do x
		s = t
		while s isa Node
			s = x[s.featid] < s.featval ? s.left : s.right
		end
		s.majority
	end
end

"""The class with the most votes in each row of `votes`."""
winner(votes) = [argmax(r) for r in eachrow(votes)]

"""A Forest-RI tree on the cases `boot`: unpruned, Gini, each node split on the best of `F` random inputs."""
grow(X, y, boot, F, rng) = build_tree(y[boot], X[boot, :], F, -1, 1, 2, 0.0; loss=DecisionTree.util.gini, rng=rng, impurity_importance=false)

"""
	forest(X, y, C, F, ntree, rng)

Forest-RI with `ntree` trees and `F` random inputs per node, for `C` classes.
Returns the trees, the out-of-bag error of the forest, and the average out-of-bag error of its trees.
"""
function forest(X, y, C, F, ntree, rng)
	n = length(y)
	votes = zeros(n, C)
	trees = Vector{Any}(undef, ntree)
	single = 0.0
	for b in 1:ntree
		boot = rand(rng, 1:n, n)
		trees[b] = grow(X, y, boot, F, rng)
		oob = setdiff(1:n, boot)
		p = classify(trees[b], X[oob, :])
		single += mean(p .!= y[oob])
		for (i, c) in zip(oob, p)
			votes[i, c] += 1
		end
	end
	seen = vec(sum(votes, dims=2)) .> 0
	trees, mean(winner(votes[seen, :]) .!= y[seen]), single / ntree
end

"""The majority vote of `trees` on each row of `X`, with `C` classes."""
function vote(trees, X, C)
	votes = zeros(size(X, 1), C)
	for t in trees
		for (i, c) in enumerate(classify(t, X))
			votes[i, c] += 1
		end
	end
	winner(votes)
end

"""
	importance(X, y, C, F, ntree, rng)

The percent increase in the out-of-bag error of a Forest-RI when each input in turn is permuted among the out-of-bag cases of every tree.
"""
function importance(X, y, C, F, ntree, rng)
	n, M = size(X)
	votes, noised = zeros(n, C), zeros(n, C, M)
	for b in 1:ntree
		boot = rand(rng, 1:n, n)
		t = grow(X, y, boot, F, rng)
		oob = setdiff(1:n, boot)
		for (i, c) in zip(oob, classify(t, X[oob, :]))
			votes[i, c] += 1
		end
		for m in 1:M
			Xm = X[oob, :]
			Xm[:, m] = shuffle(rng, Xm[:, m])
			for (i, c) in zip(oob, classify(t, Xm))
				noised[i, c, m] += 1
			end
		end
	end
	seen = vec(sum(votes, dims=2)) .> 0
	base = mean(winner(votes[seen, :]) .!= y[seen])
	[100 * (mean(winner(noised[seen, :, m]) .!= y[seen]) - base) / base for m in 1:M]
end

# The tests: Breiman's random forests paper (2001), Table 2's Selection, Single input and One tree columns on 14 data sets of
# PollisDatasets, the zip-code digits and four simulated data sets, and the forests on the inputs his importance picked out (Section 10)

const NOTINPUT = [:id, :protein, :speaker, :segment, :set]  # identifiers and the train/test marker

"""
The inputs of a data set as Breiman used them, from a Tables.jl table and the name of its class column: the inputs as a matrix, a yes vote
as 1, missing values replaced by the median of their input; the classes numbered 1, 2, ...; and their number.
"""
function inputs(data, class)
	cols = [k for k in Tables.columnnames(data) if k ∉ NOTINPUT && k != class]
	X = reduce(hcat, [begin
		c = [v isa AbstractString ? Float64(v == "y") : v for v in Tables.getcolumn(data, k)]  # votes: yes = 1, no = 0
		m = median(skipmissing(c))
		Float64[ismissing(v) ? m : v for v in c]
	end for k in cols])
	labels = string.(Tables.getcolumn(data, class))
	names = sort(unique(labels))
	X, indexin(labels, names), length(names)
end

"""Selection, Single input and One tree, in percent, for forests of `ntree` trees trained on `train` and tested on `test`."""
function table2(X, y, C, train, test, rng; ntree=100)
	F = floor(Int, log2(size(X, 2)) + 1)
	t1, oob1, one1 = forest(X[train, :], y[train], C, 1, ntree, rng)
	tF, oobF, oneF = forest(X[train, :], y[train], C, F, ntree, rng)
	single = mean(vote(t1, X[test, :], C) .!= y[test])
	selection = oobF < oob1 ? mean(vote(tF, X[test, :], C) .!= y[test]) : single
	100 .* [selection, single, oobF < oob1 ? oneF : one1]
end

"The class column of each small data set."
const SMALL = [:glass => :type, :breastwisconsin => :class, :pima => :diabetes, :sonar => :class, :vowel => :vowel, :ionosphere => :class,
	:vehicle => :class, :germancredit => :credit, :image => :class, :ecoli => :site, :votes => :party, :liver => :selector]

"""Run `f(rng)`, which returns a vector, for runs 1:n, each with its own seed `Xoshiro(i)`, on all threads: the results do not depend on the number of threads."""
function runs(f, n)
	r = Vector{Vector{Float64}}(undef, n)
	Threads.@threads for i in 1:n
		r[i] = f(Xoshiro(i))
	end
	r
end

"""The average of the vectors `f(train, test, rng)` over `n` runs, each setting a random 10% of the cases of `y` aside as the test set."""
function averages(f, y, n=100)
	m = length(y)
	mean(runs(n) do rng
		test = randperm(rng, m)[1:round(Int, m / 10)]
		f(setdiff(1:m, test), test, rng)
	end)
end

"""
Table 2 (p. 11) on the small data sets, from a named tuple of their tables: for each, the Selection, Single input and One tree errors,
averaged over 100 runs of a random 10% test set.
"""
function table2small(data)
	permutedims(reduce(hcat, map(SMALL) do (id, class)
		X, y, C = inputs(getproperty(data, id), class)
		averages((train, test, rng) -> table2(X, y, C, train, test, rng), y)
	end))
end

"A zip-code table: the digit, then the 256 grey levels; the digits are numbered 1 to 10."
zipcode(data) = (M = Tables.matrix(data)[:, 1:257]; (Float64.(M[:, 2:end]), Int.(M[:, 1]) .+ 1))

"""
Table 2 (p. 11) on the larger data sets, each one run on its own test set: letters (the first 15,000 cases train), sat-images (its train
and test sets) and the zip-code digits (200 trees).
"""
function table2large(letters, satimage, ziptrain, ziptest)
	X, y, C = inputs(letters, :letter)
	e1 = table2(X, y, C, 1:15000, 15001:20000, Xoshiro(2001))
	X, y, C = inputs(satimage, :class)
	set = Tables.getcolumn(satimage, :set)
	e2 = table2(X, y, C, findall(==("train"), set), findall(==("test"), set), Xoshiro(2001))
	(X1, y1), (X2, y2) = zipcode(ziptrain), zipcode(ziptest)
	e3 = table2(vcat(X1, X2), vcat(y1, y2), 10, 1:length(y1), length(y1)+1:length(y1)+length(y2), Xoshiro(2001); ntree=200)
	permutedims([e1 e2 e3])
end

"twonorm (Breiman 1998, p. 7): 20 normal inputs with mean (a, ..., a) for class 1 and (-a, ..., -a) for class 2, a = 2/sqrt(20)."
function twonorm(n, rng)
	a = 2 / sqrt(20)
	y = rand(rng, 1:2, n)
	randn(rng, n, 20) .+ a .* ifelse.(y .== 1, 1, -1), y
end

"threenorm (Breiman 1998, p. 7): class 1 an equal mixture of the normals with means (a, ..., a) and (-a, ..., -a), class 2 the normal with mean (a, -a, a, -a, ...), a = 2/sqrt(20)."
function threenorm(n, rng)
	a = 2 / sqrt(20)
	y = rand(rng, 1:2, n)
	alternating = [isodd(j) ? a : -a for j in 1:20]
	X = randn(rng, n, 20)
	for i in 1:n
		X[i, :] .+= y[i] == 2 ? alternating : fill(rand(rng, Bool) ? a : -a, 20)
	end
	X, y
end

"ringnorm (Breiman 1998, p. 7): class 1 normal with mean 0 and covariance 4I, class 2 normal with mean (a, ..., a) and covariance I, a = 1/sqrt(20)."
function ringnorm(n, rng)
	a = 1 / sqrt(20)
	y = rand(rng, 1:2, n)
	X = randn(rng, n, 20)
	ifelse.(y .== 1, 2 .* X, X .+ a), y
end

"waveform (Breiman et al. 1984, p. 49): 21 inputs, each class a random mixture of two of three triangular waves plus N(0, 1) noise."
function waveform(n, rng)
	h1 = [max(6 - abs(i - 11), 0) for i in 1:21]
	h2 = [max(6 - abs(i - 4 - 11), 0) for i in 1:21]
	h3 = [max(6 - abs(i + 4 - 11), 0) for i in 1:21]
	mixtures = ((h1, h2), (h1, h3), (h2, h3))
	y = rand(rng, 1:3, n)
	X = randn(rng, n, 21)
	for i in 1:n
		u = rand(rng)
		h, h′ = mixtures[y[i]]
		X[i, :] .+= u .* h .+ (1 - u) .* h′
	end
	X, y
end

"""
Table 2 (p. 11) on the simulated data sets: for each, the Selection, Single input and One tree errors averaged over 50 runs, each drawing
300 training cases and 3,000 test cases.
"""
function table2simulated()
	permutedims(reduce(hcat, map(((waveform, 3), (twonorm, 2), (threenorm, 2), (ringnorm, 2))) do (simulate, C)
		mean(runs(50) do rng
			X, y = simulate(300, rng)
			Xt, yt = simulate(3000, rng)
			table2([X; Xt], [y; yt], C, 1:300, 301:3300, rng)
		end)
	end))
end

"""
Section 10 (pp. 20-21): the Selection errors of forests on the inputs Breiman's importance picked out, averaged over 100 runs of a random
10% test set: diabetes on input 2, on all eight, on inputs 2 and 8 and on 2 and 6; votes on input 4.
"""
function section10(pima, votes)
	X, y, C = inputs(pima, :diabetes)
	errors = [averages((train, test, rng) -> table2(X[:, vars], y, C, train, test, rng)[1:1], y)[1] for vars in ([2], 1:8, [2, 8], [2, 6])]
	X, y, C = inputs(votes, :party)
	[errors; averages((train, test, rng) -> table2(X[:, [4]], y, C, train, test, rng)[1:1], y)[1]]
end

"""
Figures 4 and 6 (pp. 20-21): the most important input by permutation importance, with one forest of 1,000 trees: diabetes with F = 1,
votes with F = 5.
"""
function figures(pima, votes)
	X, y, C = inputs(pima, :diabetes)
	d = argmax(importance(X, y, C, 1, 1000, Xoshiro(10)))
	X, y, C = inputs(votes, :party)
	[d, argmax(importance(X, y, C, 5, 1000, Xoshiro(10)))]
end

end
