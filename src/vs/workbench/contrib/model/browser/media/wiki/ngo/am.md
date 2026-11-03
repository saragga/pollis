# Network and Graph Optimisation: Assignment

**Assignment** gives every worker one job, and every job at most one worker, at the least total cost, with the Hungarian method as implemented in Hungarian.jl.

## The assignment problem

[Kuhn (1955)](#ref-Kuh1955a) states the problem with numerical scores for the performance of each of n persons on each of n jobs: the assignment problem is the quest for an assignment of persons to jobs that makes the sum of the n scores as large as possible. Exchanging scores for costs turns the largest sum into the smallest, which is how the panel poses it: **Cost Matrix (n x p)** holds the cost W[i, j] of giving job j to worker i, and the model minimises the total cost.

Every worker can take every job, so the underlying graph is the complete bipartite graph between workers and jobs, and **Connectivity Check** reports it as such, with the numbers of workers and jobs and the range of the costs.

## The Hungarian method

[Kuhn (1955)](#ref-Kuh1955a) showed that ideas latent in the work of two Hungarian mathematicians yield a new method of solving the problem, which gave the method its name. The Hungarian.jl README describes its implementation as one of the Hungarian algorithm based on its matrix interpretation, with a sparse matrix that keeps track of the marked zeros.

[Williamson (2019)](#ref-Wil2019a) treats the same problem as the minimum-cost perfect matching problem in a bipartite graph, models it as a minimum-cost circulation, and develops a successive shortest path algorithm for it, in its exercises, that runs in O(n(m + n log n)) time.

## Rectangular matrices and forbidden pairs

The matrix need not be square. In the README's example, five workers and three tasks give the assignment `[2, 1, 0, 0, 3]`: workers 1, 2 and 5 take tasks 2, 1 and 3, and the zeros mark workers left without a task. The panel keeps the pairs with a non-zero entry, so the number of pairs is the smaller of the two dimensions, which **Solution Validation** prints as `expected_pairs`.

A pair that is not allowed is marked with `missing` in the cost matrix, as the README shows, and Hungarian.jl converts any `Inf` to `prevfloat(typemax(T))` before it runs. **Edge Sensitivity** forbids each chosen pair in turn by giving it the prohibitive cost 10·sum(W), and solves again.

## In the panel

The code calls `hungarian(W)`, which returns the assignment and its total cost, and turns the assignment into a list of (worker, job) pairs. The result prints `assignment` and `total_cost`. The default costs are integers from 1 to 20, drawn with **Random Seed**, in an n × n matrix whose size is set by **Vertices (n)**.

**Cross-Check** solves the linear programme in which each x(i, j) lies between 0 and 1, every row and every column has a total of at most 1, and the total of all the x(i, j) equals the smaller dimension, with JuMP and HiGHS. It reports both optima and whether the solution of the linear programme is integral. **Algorithm Comparison** times the same two methods.

## Related models

The **Bipartite Matching** model of the panel uses the same function on a shifted weight matrix to find a matching of greatest weight along existing edges. **Baseline Comparison** sets the optimum against a greedy assignment that takes the cheapest remaining pair whose worker and job are both free, and **All Pairs / Vertex Values** solves the problem again without each worker in turn and prints the change in the total cost.

[Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) cover matchings in bipartite graphs in a chapter new to their fourth edition.

## References

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Kuh1955a"></a>Kuhn, H. W. (1955). The Hungarian Method for the Assignment Problem. *Naval Research Logistics Quarterly* 2(1-2), 83-97. [doi:10.1002/nav.3800020109](https://doi.org/10.1002/nav.3800020109)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md)
