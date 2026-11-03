# Network and Graph Optimisation: Robust Shortest Path

**Robust Shortest Path** chooses a route when each edge length is known only to lie in an interval: the path whose largest regret, over every possible set of lengths, is smallest.

## Interval data and scenarios

Each edge i → j has a lower bound, the entry of **Weight Matrix (n x n)**, and an upper bound, the entry of **Upper Bounds (n x n)**, and its true length may be any value between them. [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) call this the interval scenario case: every coefficient varies independently in its interval, so the set of scenarios is the Cartesian product of the intervals. An extreme scenario puts every length at one of its two bounds.

The default upper bounds add a random integer from 0 to 6 to every edge's lower bound, drawn with the seed after **Random Seed**, so some intervals are a single point and others are wide.

## Regret and max regret

Under a scenario s, a path x has length val(x, s), and the best path for s has length val*(s). [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) define the regret of x under s and its maximum regret as

R(x, s) = val(x, s) − val*(s),  Rmax(x) = max over s of R(x, s)

The regret is the gap between what x costs and what the best route would have cost had the lengths been known in advance. The min-max regret problem asks for the path with the smallest Rmax. The survey sets it against the min-max criterion, which minimises the worst length alone, and describes the regret criterion as the less conservative of the two.

## The worst-case scenario of a path

By Proposition 7 of [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a), the regret of a solution x is largest under the scenario that sets the elements of x at their upper bounds and every other element at its lower bound. The maximum regret of a path can therefore be computed with one shortest-path problem: set the path's own edges high and the rest low, and subtract the shortest length in that scenario from the path's length.

The panel's `regret(p, W, Wu, g)` does exactly that, with `dijkstra_shortest_paths` for the shortest length. Proposition 8 of the survey adds that an optimal robust solution is optimal for at least one extreme scenario, its most favourable one, in which its own elements sit at their lower bounds and all others at their upper bounds.

## Exact enumeration in the panel

The code lists every simple path from **Source** to **Target** with `all_simple_paths` of Graphs.jl, which iterates over them in depth-first order, computes the maximum regret of each, and returns the path with the smallest. The search is exhaustive, so the result is the exact min-max regret path among the simple paths.

The result prints `robust_path`, `max_regret`, the path's length when every edge sits at its lower bound (`cost_if_all_low`) and at its upper bound (`cost_if_all_high`), and `paths_enumerated`, the number of simple paths examined. The number of paths grows quickly with the size and density of the graph, which is why **Graph Size Scaling** uses graphs of 5 to 9 vertices for this model.

## Exact algorithms and complexity

[Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) report that the interval min-max regret versions of shortest path, spanning tree and assignment are strongly NP-hard. A direct method solves the problem on every extreme scenario and keeps the solution of least maximum regret, but there are up to 2ⁿ such scenarios for n uncertain lengths.

For shortest paths, [Montemanni and Gambardella (2004)](#ref-MG2004a) give an exact algorithm based on path ranking: under the worst-case scenario, it generates paths in order of non-decreasing length until a lower and an upper bound coincide, and the path with the best maximum regret found so far is then optimal. The survey also lists mixed integer linear formulations and branch-and-bound algorithms for shortest paths and spanning trees.

## Simple candidates

Solving the ordinary problem on one chosen scenario gives a quick candidate. With every length at its upper bound, the solution is the min-max one; [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) observe that its maximum regret is in practice close to the optimum but that, in the worst case, it can be very far from it. With every length at the midpoint of its interval, Proposition 9 of the survey bounds the maximum regret of the solution by twice the optimal value.

**Algorithm Comparison** prints the maximum regret of four paths: the robust one, the nominal shortest path with every length at its lower bound, the pessimistic one with every length at its upper bound, and the midpoint path.

## References

<a id="ref-ABV2009a"></a>Aissi, H., Bazgan, C., & Vanderpooten, D. (2009). Min–Max and Min–Max Regret Versions of Combinatorial Optimization Problems: A Survey. *European Journal of Operational Research* 197(2), 427-438. [doi:10.1016/j.ejor.2008.09.012](https://doi.org/10.1016/j.ejor.2008.09.012)

<a id="ref-MG2004a"></a>Montemanni, R., & Gambardella, L. M. (2004). An Exact Algorithm for the Robust Shortest Path Problem with Interval Data. *Computers & Operations Research* 31(10), 1667-1680. [doi:10.1016/S0305-0548(03)00114-X](https://doi.org/10.1016/S0305-0548(03)00114-X)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
