# Swarm Intelligence: Interpretation

The result of a run is a best point, its value, the number of evaluations and the final swarm. Reading them means comparing the value with what is known about the objective, the point with its box, and the run with other runs and other methods.

## The best value

The main run prints `best_point`, `best_value` and `evaluations`. For the default Rastrigin function, the tooltip of **Objective f(x)** gives the global minimum as 0 at the origin, so the best value is also the distance in objective from the global minimum.

For an objective of the user's own, the global minimum is usually unknown, and the best value is an upper bound on it: some point of the box attains it. **Run Consistency**, **Multi-Start** and **Algorithm Shootout** show whether other seeds or other algorithms find lower values with the same budget.

## The best point in its box

**Solution Summary** prints each variable of the best point with its bounds and its relative position (x − lb)/(ub − lb), from 0 at the lower bound to 1 at the upper bound.

A relative position at 0 or 1 puts the variable on a bound. For the CSO tab, the code clamps positions to the box, so variables can sit exactly on a bound. The default Rastrigin box is symmetric about the origin, where the tooltip places the minimum, so its relative positions there are 0.5.

## The final swarm

**Population Snapshot** draws the final swarm in the first two variables over filled contours of f, with the other variables held at the best point, and marks the best point with a star. **Fitness Landscape** draws the same slice of f as a heatmap.

The slice is a two-dimensional cut through an n-dimensional function: it shows f as x1 and x2 vary with the other variables fixed, and the members of the swarm, which differ in all n variables, are projected onto it.

## Swarm against gradient

**vs Gradient-Based** prints the swarm's best value beside L-BFGS from the midpoint of the box and the best of L-BFGS from ten random starts inside the box. **Local Refinement** starts the same L-BFGS from the swarm's best point.

The three numbers place the swarm among local searches with the same box: a lower value for the swarm than for the ten local searches means the swarm found a better point than any of those starts, and a lower value after **Local Refinement** means the local search improved the swarm's point.

## Comparing algorithms

**Algorithm Shootout** runs PSO, CSO, ABC, WOA and CGSA of Metaheuristics.jl with `f_calls_limit` set to the evaluations of the current run, three seeds each, and prints the mean and the worst best value. **Benchmark Functions** runs the current algorithm on the sphere, Rosenbrock, Rastrigin and Ackley functions and prints the best value and the distance to the known optimum, the origin or, for Rosenbrock, the point of all ones.

Comparisons of this kind hold for the budget, the box, the dimension and the seeds used: the action prints them with the result.

## Settings and scaling

**Hyperparameter Guide** lists the main settings of the selected algorithm, with the values the panel uses and their meaning in the Metaheuristics.jl documentation or the original paper, such as the inertia weight of PSO, the `limit` of ABC after which a food source is abandoned, or the coefficient a of WOA.

**Dimension Scaling** re-runs the search for n = 2, 5, 10, 20 and 40 with the same per-variable bounds and prints the best value, the evaluations and the run time. [Cheng and Jin (2015)](#ref-CJ2015a) describe CSO as an optimiser for large scale optimisation, tested on problems of dimensionality up to 5 000; the decision table of the panel gives large scale optimisation as the context of the CSO tab.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
