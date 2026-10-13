module ArcFS

using DecisionTree, StatsBase, Random, Statistics, Tables
using DecisionTree: Leaf, Node

export arcfs, prune, classify, vote

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

caselabels(t::Leaf) = t.values  # the training classes that reached each leaf
caselabels(t::Node) = vcat(caselabels(t.left), caselabels(t.right))
misclassified(v) = length(v) - maximum(values(countmap(v)))  # R(t): errors as a leaf
nleaves(t::Leaf) = 1
nleaves(t::Node) = nleaves(t.left) + nleaves(t.right)
branchmisclassified(t::Leaf) = misclassified(t.values)
branchmisclassified(t::Node) = branchmisclassified(t.left) + branchmisclassified(t.right)

"""g(t): the training errors saved per leaf by the branch below internal node `t`."""
g(t::Node) = (misclassified(caselabels(t)) - branchmisclassified(t)) / (nleaves(t) - 1)

"""The smallest g(t) over the internal nodes of `t`: the weakest link."""
weakest(t::Leaf) = Inf
weakest(t::Node) = min(g(t), weakest(t.left), weakest(t.right))

"""Collapse to a leaf every internal node with g(t) at most `alpha`."""
cut(t::Leaf, alpha) = t
cut(t::Node, alpha) = g(t) <= alpha + 1e-12 ? (v = caselabels(t); Leaf(mode(v), v)) : Node(t.featid, t.featval, cut(t.left, alpha), cut(t.right, alpha))

"""
	prune(t, X, y)

The subtree of the cost-complexity sequence of tree `t` with the fewest errors on the cases (X, y), the smallest on ties.
"""
function prune(t, X, y)
	best, fewest = t, sum(classify(t, X) .!= y)
	while t isa Node
		t = cut(t, weakest(t))
		e = sum(classify(t, X) .!= y)
		if e <= fewest
			best, fewest = t, e
		end
	end
	best
end

"""
	arcfs(X, y, K, rng)

Breiman's (1998) arc-fs: `K` steps of adaptive resampling with Freund and Schapire's update, each tree pruned on a second draw.
Returns the trees and their weights log β. A restart drops the tree of its step.
"""
function arcfs(X, y, K, rng)
	n = length(y)
	p = fill(1 / n, n)
	trees, weights = Any[], Float64[]
	for k in 1:K
		draw1, draw2 = sample(rng, 1:n, Weights(p), n), sample(rng, 1:n, Weights(p), n)
		full = build_tree(y[draw1], X[draw1, :], 0, -1, 1, 2, 0.0; loss=DecisionTree.util.gini, rng=rng, impurity_importance=false)
		t = prune(full.node, X[draw2, :], y[draw2])
		d = classify(t, X) .!= y
		ε = sum(p[d])
		if ε >= 1 / 2 || ε == 0
			fill!(p, 1 / n)  # restart
			continue
		end
		β = (1 - ε) / ε
		p .*= β .^ d
		p ./= sum(p)
		push!(trees, t)
		push!(weights, log(β))
	end
	trees, weights
end

"""The weighted vote of `trees` on each row of `X`, with `C` classes."""
function vote(trees, X, C; weights=ones(length(trees)))
	votes = zeros(size(X, 1), C)
	for (t, w) in zip(trees, weights)
		for (i, c) in enumerate(classify(t, X))
			votes[i, c] += w
		end
	end
	[argmax(r) for r in eachrow(votes)]
end

"""The test error, in percent, of `K` steps of arc-fs trained on the cases `train` and tested on `test`."""
function testerror(X, y, C, train, test, rng; K=50)
	trees, weights = arcfs(X[train, :], y[train], K, rng)
	100mean(vote(trees, X[test, :], C; weights=weights) .!= y[test])
end

# The tests: the AdaBoost column of Breiman's random forests paper (2001, Table 2), arc-fs's test errors, on 15 data sets of
# PollisDatasets, the zip-code digits and four simulated data sets

"""Run `f(rng)` for runs 1:n, each with its own seed `Xoshiro(i)`, on all threads: the results do not depend on the number of threads."""
function runs(f, n)
	r = Vector{Float64}(undef, n)
	Threads.@threads for i in 1:n
		r[i] = f(Xoshiro(i))
	end
	r
end

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

"The class column of each small data set."
const SMALL = [:glass => :type, :breastwisconsin => :class, :pima => :diabetes, :sonar => :class, :vowel => :vowel, :ionosphere => :class,
	:vehicle => :class, :soybean => :disease, :germancredit => :credit, :image => :class, :ecoli => :site, :votes => :party, :liver => :selector]

"""
The small data sets (Breiman 2001, Table 2 and p. 15), from a named tuple of their tables: for each, the average test error of 100 runs, each
setting a random 10% aside as the test set and voting 50 trees grown on the rest.
"""
function small(data)
	map(SMALL) do (id, class)
		X, y, C = inputs(getproperty(data, id), class)
		n = length(y)
		mean(runs(100) do rng
			test = randperm(rng, n)[1:round(Int, n / 10)]
			testerror(X, y, C, setdiff(1:n, test), test, rng)
		end)
	end
end

"A zip-code table: the digit, then the 256 grey levels; the digits are numbered 1 to 10."
zipcode(data) = (M = Tables.matrix(data)[:, 1:257]; (Float64.(M[:, 2:end]), Int.(M[:, 1]) .+ 1))

"""
The larger data sets (Breiman 2001, Table 2), each one run on its own test set: letters (the first 15,000 cases train), sat-images (its
train and test sets) and the zip-code digits (100 trees).
"""
function large(letters, satimage, ziptrain, ziptest)
	X, y, C = inputs(letters, :letter)
	e1 = testerror(X, y, C, 1:15000, 15001:20000, Xoshiro(1998))
	X, y, C = inputs(satimage, :class)
	set = Tables.getcolumn(satimage, :set)
	e2 = testerror(X, y, C, findall(==("train"), set), findall(==("test"), set), Xoshiro(1998))
	(X1, y1), (X2, y2) = zipcode(ziptrain), zipcode(ziptest)
	e3 = testerror(vcat(X1, X2), vcat(y1, y2), 10, 1:length(y1), length(y1)+1:length(y1)+length(y2), Xoshiro(1998); K=100)
	[e1, e2, e3]
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
The simulated data sets (Breiman 2001, Table 2): for each, the average test error of 50 runs, each drawing 300 training cases and 3,000
test cases.
"""
function simulated()
	map([(waveform, 3), (twonorm, 2), (threenorm, 2), (ringnorm, 2)]) do (simulate, C)
		mean(runs(50) do rng
			X, y = simulate(300, rng)
			Xt, yt = simulate(3000, rng)
			testerror([X; Xt], [y; yt], C, 1:300, 301:3300, rng)
		end)
	end
end

end
