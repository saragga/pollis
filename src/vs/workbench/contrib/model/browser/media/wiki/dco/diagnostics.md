# Diagnostics

A heuristic gives a value without proof, so checks are needed to show that the solution is valid, the search is healthy, and the value is good relative to something else.

## How to Check the Tour Is Valid

**Solution** prints the closed city sequence, the length, a recomputed length, and `visits_every_city_once`. The last must be true, and the two lengths must agree. **Tour Plot** gives a quick visual check as well. A tour that crosses itself in the plane is not 2-opt optimal, and so points to a bug or to a run without 2-opt. Validity checks cost little, and they catch errors in new neighbourhoods at once, which is especially useful after editing `or_opt!` or `shake`.

## How to Read the Convergence Curve

**Convergence Curve** draws the best length per iteration, as a step plot. A steep early fall with a long flat tail is typical. Long flat stretches mean no new best, so that the method has stalled or has reached a very good tour. The curve can only fall, so it cannot show how widely the search is exploring. A very early flat line may reflect a very weak search or a strong start. Use **Budget Impact** to see whether more iterations would help.

## How to Measure Variation Across Seeds

**Restart Study** runs 10 seeds on the same instance, and reports the lengths, the best, the mean, the spread and `share_at_best`. A low spread with all runs at one value suggests the optimum, or a strong common trap. A wide spread says that more restarts would help. **Multistart** reports the best of the same 10 runs, with the time. A sound comparison of two settings should use the same seeds and a paired test.

## How to Bound the Quality

**Objective Gap** compares the length with `lowerbound(D)`, from `TravelingSalesmanHeuristics.jl`. The true gap to the optimum is at most the printed gap, and any looseness in the bound inflates it. The tree-based relaxation of [Held and Karp (1970)](#ref-HK1970a) is known for giving a tight bound. A rule from [Beardwood, Halton and Hammersley (1959)](#ref-BHH1959a) also gives a rough check: for random uniform points, a good tour's length grows in proportion to sqrt(n A), with a constant near 0.7 for large n, and boundary effects raising it for small n.

## How to See Which Moves Do the Work

**Neighbourhood Usage** counts improving moves per neighbourhood over the run. Because the order favours the earlier ones, 2-opt usually does the most. A very small count for the last suggests that it could go, saving time. **Neighbourhood Count** tests this, by rerunning with 1, 2 and 3 neighbourhoods and printing time. **Neighbourhood Analysis** checks each move on the best tour: every neighbourhood in use should report no improvement. An unused one that finds an improvement is worth adding.

## How to Compare with Other Methods

**Compare with 2-opt Baseline** tests against a nearest-neighbour tour with 2-opt, and any advanced method should beat that clearly. **Compare with Library** runs `solve_tsp` and simulated annealing from `TravelingSalesmanHeuristics.jl`, with times. A library result well below the panel's suggests a weak setting. These run at their own effort settings, and not at an equal budget. For a true test, also solve small instances exactly, as a known optimum gives a firm reference, as the work of [Applegate, Bixby, Chvátal and Cook (2011)](#ref-ABCC2011a) makes possible.

## References

<a id="ref-ABCC2011a"></a>Applegate, D. L., Bixby, R. E., Chvátal, V. and Cook, W. J. (2011). *The Traveling Salesman Problem: A Computational Study*. Princeton University Press. [doi:10.1515/9781400841103](https://doi.org/10.1515/9781400841103)

<a id="ref-BHH1959a"></a>Beardwood, J., Halton, J. H. and Hammersley, J. M. (1959). The shortest path through many points. *Mathematical Proceedings of the Cambridge Philosophical Society* 55(4), 299–327. [doi:10.1017/S0305004100034095](https://doi.org/10.1017/S0305004100034095)

<a id="ref-HK1970a"></a>Held, M. and Karp, R. M. (1970). The traveling-salesman problem and minimum spanning trees. *Operations Research* 18(6), 1138–1162. [doi:10.1287/opre.18.6.1138](https://doi.org/10.1287/opre.18.6.1138)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
