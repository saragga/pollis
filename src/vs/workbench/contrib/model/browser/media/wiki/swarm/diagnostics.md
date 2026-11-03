# Swarm Intelligence: Diagnostics

A swarm run returns a best point without a certificate of optimality. The diagnostics of the panel look at the history of the run, the state of the final swarm, and how the result changes with the seed, the swarm size and a local search from the best point.

## Convergence Curve

The panel wraps f in a recorder that stores every value it returns, and `accumulate(min, vals)` turns the record into the best value found after each evaluation. **Convergence Curve** plots that trace on a logarithmic scale, after subtracting a shift that keeps the values positive.

A flat stretch of the curve is a stretch of evaluations in which the run found no better value. Since the curve counts evaluations rather than iterations, the curves of different tabs share the same horizontal axis, although an iteration costs a different number of evaluations in each, as the tooltip of **Iterations** explains.

## Swarm Diversity

**Swarm Diversity** reads the final population from `res.pop`, the `positions` of the Metaheuristics.jl result or the panel's own swarm for CSO. It prints the standard deviation of each variable divided by the width of its box, the mean distance of the members to the best point, and a flag `collapsed` that is true when every standard deviation is under 10⁻⁶.

With `collapsed` true, the members of the final swarm sit at one point to within 10⁻⁶ in every variable. [Cheng and Jin (2015)](#ref-CJ2015a) analyse the exploration and exploitation abilities of CSO empirically, and the relative spread is the panel's measure of how much of the box the final swarm still covers.

## Run Consistency

**Run Consistency** repeats the search with seeds 1 to 10 and prints the ten best values, their mean and standard deviation, the share of runs within 10⁻⁶ of the best of the ten, and the largest distance between the ten solutions.

The share at the best and the largest distance between solutions separate two cases: runs that end at the same point, and runs whose values or points differ from seed to seed. **Multi-Start** uses the same idea to keep the best of five seeds.

## Population Sensitivity

**Population Sensitivity** runs N = 10, 20, 40, 80 and 160 members with iterations div(NP · budget, N), so that N times the iterations stays about constant, with three seeds each, and prints the mean and the worst best value.

A small swarm runs for more iterations, a large one evaluates more points per iteration. The documentation's examples of `WOA` on a three-variable sphere function show the effect of N on the cost: 15 000 function calls with N = 30 and 50 000 with N = 100, both in 500 iterations.

## Local Refinement

**Local Refinement** starts box-constrained L-BFGS, `Fminbox(LBFGS())` of Optim.jl with ForwardDiff gradients, from the swarm's best point, moved strictly inside the box, and prints the swarm value, the refined value, the improvement and the distance moved.

The improvement and the distance moved show how much a gradient-based local search adds to the swarm's result from the same point. **vs Gradient-Based** runs the same L-BFGS from the midpoint of the box and from ten random starts instead.

## Best Solution

**Best Solution** prints the best point, the value the algorithm reported and f re-evaluated at the point, with the number of evaluations. The reported and re-evaluated values agree for a deterministic objective; a difference points to an objective whose value changes between calls. **Multi-Start** keeps the best of five runs, seeds 1 to 5, and prints it with its seed beside the value of the single main run.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
