# Multi-Objective Optimisation Performance Metrics: Diagnostics

A metric value is only as good as the front and the reference it is computed from. The checks look at the inputs first, then at how the metrics agree, how the value evolved during the run, and how much it depends on the number of points.

## Is the front fit to be measured?

**Front Statistics** describes the front before any metric is read.

| Output | Reading |
|---|---|
| `front_size` | Number of points; very few points make every metric fragile |
| `objectives` | Should match the number of columns of **Reference Front** |
| `dominated_points` | Should be zero for a front from `pareto_front` |
| `duplicates` | Repeated points, which count twice in averages |
| `front_range` | Lowest and highest value of each objective on the front |
| `reference_range` | The same for **Reference Front** |

A front whose range falls well inside the reference range has missed the ends of the front, which **Inverted Generational Distance** and the hypervolume penalise. Ranges on very different scales across objectives point to the need to rescale before comparing.

## Do the metrics agree?

**All Metrics** prints the five values with the direction in which each improves. Agreement is not expected in every case, since the metrics measure different things, and the pattern of disagreement is informative.

| Pattern | Reading |
|---|---|
| Low GD, high IGD | Points close to the front, but leaving parts of it uncovered |
| Low IGD, large epsilon | Good on average, with one region poorly covered |
| Low spacing, high IGD | Evenly spaced points over only part of the front |

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) note that the generational distance equals zero when an algorithm finds a single point on the front, so a low GD on its own does not establish a good front.

## When did the search stop improving?

**Metric over Generations** computes the metric on the non-dominated front of each generation stored in the run, and plots it against the generation, on a logarithmic scale for the metrics where lower is better. It needs a result with stored history: a run with `Options(store_convergence=true)`, as in the demonstration.

| Shape | Reading |
|---|---|
| Steady improvement to the end | The search was still improving when it stopped |
| A plateau | The search converged on this metric |
| Jumps | A new region of the front was reached |
| A metric that worsens | Points traded for others elsewhere on the front |

The last shape can appear with GD, IGD and spacing, which [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) list as not monotone with respect to dominance.

## How much does the value depend on the size of the front?

**Subsample Sensitivity** keeps random subsets of 10%, 20%, 40%, 60%, 80% and 100% of the points, at least two, draws 20 subsets of each size with the seed 1, and plots the mean value with a band of one standard deviation.

| Metric | Expected shape as points are removed |
|---|---|
| **Hypervolume** | Falls or stays, since the dominated region can only shrink |
| **Inverted Generational Distance** | Rises or stays, as gaps open in the front |
| **Epsilon-Indicator** | Rises or stays, as the worst-covered region widens |
| **Generational Distance** | Roughly flat, as each point keeps its own distance |
| **Spacing** | Changes with the gaps between the remaining points |

A wide band at a given size shows that the value depends on which points are kept, not only on how many. Fronts of different sizes compared on a size-sensitive metric favour the larger one.

## Reading Front vs Reference

**Front vs Reference** draws the reference front as a grey line and the obtained points in black, in the first two objectives, then overlays what the chosen metric measures.

| Metric | Overlay |
|---|---|
| **Hypervolume** | The dominated region shaded, with the reference point in red |
| **Generational Distance** | A red line from each obtained point to its nearest reference point |
| **Inverted Generational Distance** | A red line from every fourth reference point to its nearest obtained point |
| **Epsilon-Indicator** | The front shifted by minus epsilon, in red |
| **Spacing** | A red line from each point to its nearest neighbour in the Manhattan distance |

Long red lines locate the problem: far from the front for GD, uncovered for IGD. For epsilon, every reference point should be weakly dominated by some point of the shifted front.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| Error from **Metric over Generations** | A matrix, or a run without stored history | Pass a result run with `store_convergence=true` |
| Dimension error | **Reference Front** with another number of objectives | Match the columns |
| Very large distances | Objectives on very different scales | Rescale all inputs alike |
| Values that differ from another study | Another reference point or reference front | Use the same for both |

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
