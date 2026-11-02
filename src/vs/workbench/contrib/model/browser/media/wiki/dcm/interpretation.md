# Interpretation

A Pareto front is not an answer. It is a menu of trade-offs, and the choice among them needs preferences from outside the optimisation.

## How to Read the Printed Summary

The tab prints `front_size`, `ideal`, `nadir`, `hypervolume` and `all_feasible`. `ideal` is the best value found for each objective, and no single solution usually reaches all of them. `nadir` is the worst value on the front. The two together give the range of the trade-off. `hypervolume` is meaningful only relative to its reference point, and is mostly useful in a comparison. A front size equal to **Population** does not imply a good spread, as solutions can crowd.

## How to Read the Front Plot

**Pareto Front Plot** shows non-dominated solutions in black, other feasible members in grey and infeasible ones in red. Moving along the front gains in one objective and loses in the other. A steep part means that a small gain in one costs much in the other. A knee, where the slope changes sharply, is often a good compromise, as moving either way costs more than it gains. Infeasible points below the front show where the constraints are binding, as the objectives could otherwise improve.

## How to Read the Default Front

For CONSTR, the shape can be worked out by hand. At each x1 the code wants x2 small, so x2 = max(0, 6 − 9 x1):

- For x1 from 7/18 to 2/3, g1 is active, and f2 = (7 − 9 x1) / x1.
- For x1 from 2/3 to 1, x2 sits at its lower bound, and f2 = 1 / x1.

The first segment exists because of the constraint, and the second comes from the bound. **Active Constraints** labels the second as "none", because it reports only g and not the bounds. [Deb (2001)](#ref-Deb2001a) treats constrained test problems of this kind.

## How to Read the Decision Space

**Decision Space** plots the Pareto set in the first two variables, coloured by f1, and it lists five solutions spread along the front. Smooth curves mean that small changes in the design give small changes in the trade-off. Jumps mean that distinct designs give similar performance, which matters when a manufacturing or policy limit applies. Only two variables can be shown, so that other variables may hold the main structure. Take the listed solutions as examples that span the range, and not as recommendations.

## How to Read Constraints as Prices

**Constraint Relaxation** reruns with g(x) ≤ t for t up to 2, and overlays the fronts. The distance between them shows what loosening a constraint would gain. A large move means that the constraint limits performance strongly. This is an informal counterpart of a shadow price, and all constraints are loosened together. Each run is stochastic, so a small inversion between fronts is noise. **Active Constraints** names which constraint binds where, at a tolerance of 0.01, which a good solution might still miss.

## How to Read Comparison Tables

**Compare Algorithms** gives front size, hypervolume, feasible share and time for each algorithm on one seed. Differences on an easy problem may be noise. A method with a lower hypervolume may still give better spread, and a low feasible share in **MOEA/D** points to a mismatch with constraints. Time reflects this run and this machine, and evaluation cost can dominate on real problems. **Hypervolume** and many seeds should support any conclusion. [Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a) discuss the reporting of such results.

## References

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B. and Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*, 2nd ed. Springer.

<a id="ref-Deb2001a"></a>Deb, K. (2001). *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
