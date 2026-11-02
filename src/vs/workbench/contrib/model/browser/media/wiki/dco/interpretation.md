# Interpretation

Results here are lengths and tours, compared against each other. A length means little alone, so read it relative to a baseline, a bound, and the variation across seeds.

## How to Read the Printed Result

The tab prints `tour_length`, `tour`, `iterations` and `improving_moves`. Length is measured in the unit square, so its value depends on n and on the instance. `tour` is a permutation, and closes back to its first city. `improving_moves` pairs each neighbourhood with its count, which reflects total effort over all iterations. **Summary** puts the configuration and the result together. A shorter length than another run shows only that this run did better on this instance.

## How to Read the Tour Plot

**Tour Plot** draws the best tour through the cities, with its length in the title. A good Euclidean tour looks tidy: no crossings, and it mostly follows the outer points in order, as the optimum visits the points of the convex hull in hull order. Long jumps or spikes hint at room for improvement. Visual tidiness is not proof, as tours that look good can still be a few percent above optimal. The figure is of most use in spotting a clear failure.

## How to Read the Convergence Patterns

Each tab has its own typical curve:

| Tab | Typical shape |
|---|---|
| **GRASP** | Early drops, then rare drops as lucky starts occur |
| **VND** | First value from the nearest-neighbour start, then rare drops |
| **VNS** | Starts low, then a sequence of small steps |

The patterns reflect how each method uses memory. **GRASP** and **VND** treat each iteration independently, so that progress is by chance, whereas **VNS** builds on the best. Compare at equal time, and not at equal iterations.

## How to Read the Budget and Time Results

**Budget Impact** gives length and time at six budgets. Typical results show strongly falling returns: the first iterations give most of the gain. A plateau means that the extra budget buys little under this method. Time should grow in proportion to iterations. **Time Budget** stops on a clock, so its result depends on the machine. The most useful reading is the point where an extra doubling is no longer worth the time, which depends on the cost of a longer tour.

## How to Read the Baseline and Gap Figures

**Compare with 2-opt Baseline** gives `improvement`, the share by which the selected method beats the simple baseline. **Construction Quality** shows the same kind of share for search over construction. **Objective Gap** gives `gap_to_bound`, which is an upper limit on how far from optimal the tour lies, and not the gap itself. A gap near zero proves that the tour is close to optimal, while a larger gap may reflect a loose bound. Read it as "no worse than" and not as "exactly".

## What the Results Do Not Say

A method that wins on one instance and seed may lose elsewhere. Rankings between metaheuristics are unstable, and a no-free-lunch argument warns against claiming one method as best in general. Results here say something about these moves on this kind of random instance. The instance is fixed by its seed. The handbook of [Gendreau and Potvin (2019)](#ref-GP2019a) discusses sound experiments, with benchmark sets and full reporting.

## References

<a id="ref-GP2019a"></a>Gendreau, M. and Potvin, J.-Y., eds (2019). *Handbook of Metaheuristics*, 3rd ed. Springer.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
