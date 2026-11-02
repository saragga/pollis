# Diagnostics

A stochastic search has no certificate of optimality. Checks focus on whether the population collapsed too early, whether results repeat across seeds, and whether the answer holds up when examined directly.

## How to Read Convergence and Diversity Together

**Convergence Curve** plots the best value on a log scale, and **Population Diversity** plots the mean spread. Read them together:

| Best value | Diversity | Reading |
|---|---|---|
| Still falling | Falling | Healthy progress |
| Flat | Near zero, at a poor value | Premature convergence |
| Flat | Large | Stagnation: moves no longer succeed |
| Near zero | Near zero | Probably converged |

A collapse before the value settles means raising **Population Size** or **Scale Factor (F)**. On **epsilonDE**, the curve can rise when an infeasible point gives way to a feasible one.

## How to Use the Convergence Check

**Convergence Check** prints the generations, evaluations, last improvement, final diversity, and a `stagnated` flag, set when diversity is under 1e-8 of the box's width. An improvement in the last generations means that the budget was too short. A long wait since the last improvement can mean success or failure, and only the value tells which. The flag says that the population has collapsed, and says nothing about whether it collapsed in the right place.

## How to Measure Reliability Across Seeds

**Multi-Start** runs 10 seeds, printing the values, mean, spread, `share_at_best`, and the largest distance between solutions. All seeds at one value and one point suggest a global minimum, or a very strong trap. Equal values at distant points mean several global minima. A wide spread means that the result depends on luck, and that a larger budget or population is needed. A success rate over many seeds is the usual reporting measure for benchmark work, as in [Das and Suganthan (2011)](#ref-DS2011a).

## How to Check the Solution Directly

**Evaluate at Minimum** re-evaluates f at the solution, and estimates the gradient by central differences. The reported and re-evaluated values should agree, unless the objective is noisy. A gradient norm near zero supports an interior local minimum, and a large norm means that more precision is available, or that a bound or constraint is active. **Bounds Check** lists coordinates at the bounds. A solution on a bound suggests that the box is too tight. A local polish from `x_best` can often add digits.

## How to Test Settings

**Population Size Study** holds evaluations fixed, and varies the population, with three seeds. **Budget Study** varies the generations. **Parameter History** shows what an adaptive tab has learned. A very small population may fail by collapse, and a large one by too few generations. On **DE**, try a low and a high **Crossover Rate (CR)**: a big difference shows how much separability matters here. Always compare at equal evaluations, as `res.evals` reports them.

## How to Compare with Other Methods

**Compare with Library DE** runs methods from `BlackBoxOptim.jl`, and **DE vs CMA-ES** runs the method of [Hansen and Ostermeier (2001)](#ref-HO2001a), at equal evaluations, over 5 seeds. A clear loss to a library method may mean a poor setting. CMA-ES often converges faster on smooth, ill-conditioned problems, and DE often holds up better on rugged ones. Five seeds show only a tendency. For a paper, a nonparametric test across many functions and seeds is the usual standard.

## References

<a id="ref-DS2011a"></a>Das, S. and Suganthan, P. N. (2011). Differential evolution: a survey of the state-of-the-art. *IEEE Transactions on Evolutionary Computation* 15(1), 4–31. [doi:10.1109/TEVC.2010.2059031](https://doi.org/10.1109/TEVC.2010.2059031)

<a id="ref-HO2001a"></a>Hansen, N. and Ostermeier, A. (2001). Completely derandomized self-adaptation in evolution strategies. *Evolutionary Computation* 9(2), 159–195. [doi:10.1162/106365601750190398](https://doi.org/10.1162/106365601750190398)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
