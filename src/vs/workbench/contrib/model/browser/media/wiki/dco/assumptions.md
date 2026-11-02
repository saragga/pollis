# Assumptions

Metaheuristics make few formal assumptions about the problem, and give few formal guarantees. Their success rests on properties of the landscape that are usually taken on trust.

## What Local Search Assumes About the Landscape

Local search assumes that good solutions lie close to each other, with a landscape that has useful structure. For Euclidean tours, this seems largely true: good tours share many edges. Problems with no such structure defeat these methods, as a local optimum then says little about where others lie. A method tuned on a tour problem will not always transfer. [Talbi (2009)](#ref-Tal2009a) discusses how to analyse a landscape, through measures such as the distribution of local optima.

## What the Instance Assumes

The panel's instance has uniform random cities in a square, symmetric Euclidean distances and a fixed seed. Random uniform instances are easier than many real ones, and the triangle inequality holds. Real routing often has asymmetric times, clusters, time windows, or capacity limits, which change what a good move is. A 2-opt reversal costs nothing to evaluate only under symmetric distances. Treat results here as lessons about method, and test on instances like the real ones.

## What a Heuristic Result Does Not Claim

A tour from any of the three methods has no proof of optimality. The best tour is only the best seen. **Objective Gap** gives an upper limit on how far it could be from optimal, using a lower bound, and that limit may be loose. No claim about the gap to the optimum can be made from convergence alone. A flat curve may mean that the method is stuck. Where a guarantee is needed, an exact method must be used, or an approximation algorithm with a proven ratio.

## What Comparing by Iterations Assumes

**Iterations** counts different work in each tab. A **GRASP** iteration builds and descends, a **VND** iteration descends from a random tour, and a **VNS** iteration repairs a shaken tour. Equal iterations do not mean equal effort, so a fair comparison uses the same time or the same number of moves. **Time Budget** supports that. Wall-clock time depends on the machine and on compilation, so the first run of a session runs slower. Report the machine when times matter.

## What One Seed Assumes

`search` uses seed 1 by default, and the instance uses seed 1 too. One seed gives one sample of a random method. Differences between tabs on one seed can be noise, and **Restart Study** runs ten. All such seeds use the same instance, so they measure the search's luck, and not its behaviour across instances. Conclusions about a method need several instances as well as several seeds, as the handbook of [Gendreau and Potvin (2019)](#ref-GP2019a) makes clear.

## What Scale Assumes

The default of 40 cities is small enough for simple code. The moves scan the whole tour for each step, and `swap!` recomputes the length for every candidate, so that time grows steeply with n. Real tour solvers use neighbour lists and fast updates. Results at n = 40 do not predict the time needed at n = 4000. Small instances are also solved optimally by exact methods within seconds, so there is little need for a heuristic at that size outside teaching.

## References

<a id="ref-GP2019a"></a>Gendreau, M. and Potvin, J.-Y., eds (2019). *Handbook of Metaheuristics*, 3rd ed. Springer.

<a id="ref-Tal2009a"></a>Talbi, E.-G. (2009). *Metaheuristics: From Design to Implementation*. Wiley. [doi:10.1002/9780470496916](https://doi.org/10.1002/9780470496916)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
