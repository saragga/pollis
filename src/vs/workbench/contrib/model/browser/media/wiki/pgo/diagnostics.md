# Stochastic Search with Local Refinement: Diagnostics

How to check a search: the evaluated points, the convergence of the best value, the return code, the variation across seeds, and the gradient at the answer.

## Where the method looked

**Objective Landscape** draws f as a heat map over the first two variables, holding any others at the best point, with every evaluated point in white and the best point as a red star. The cloud of points shows how the method spent its budget: spread over the box in its global stage, concentrated in the basins its local searches descended.

With the default Rastrigin function, the grid of local minima is visible, and the star sits at the origin, the global minimum, when the method has found it.

## The convergence curve

**Convergence Curve** plots the best value found against the number of evaluations. As its description says, the jumps are new basins found: each drop marks an evaluation at which the method found a point better than all earlier ones.

A curve that is flat over the last part of the budget suggests that the method stopped improving well before **Budget** ran out; one still dropping at the end, that a larger budget may help. **Budget Study** answers the same question directly, by rerunning the method with budgets from 100 to 5000.

## The return code

**Return Status** explains the return code, gives the budget and the evaluations used, and the evaluation at which the final best value was first reached. The codes include:

| Code | Meaning |
|---|---|
| `MAXEVAL_REACHED` | The budget is used up, the normal stop for global methods |
| `SUCCESS` | Generic success |
| `FTOL_REACHED`, `XTOL_REACHED` | A function or step tolerance was met |
| `STOPVAL_REACHED` | The target value was reached |
| `MAXTIME_REACHED` | The time limit was reached |

NLopt's reference, in the documentation of [Johnson (2007)](#ref-Joh2007c), lists the same codes, with negative values for failures; any other code is reported as a failure, with a prompt to check the bounds and the objective.

## Variation across seeds

**Seed Robustness** repeats the search with seeds 1 to 5 and returns the five best values, their mean and standard deviation, and the largest distance between the solutions found. As its description says, MLSL and StoGO-R sample at random, so their results vary, while TikTak is deterministic, and a spread of best values means the budget is too small.

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) measure an optimiser's reliability as the likelihood of finding the global optimum of the problem at hand; repeated runs with different seeds give a first view of it on one problem.

## The gradient at the answer

**Solution** returns the best point and value with the norm of the gradient there, computed with ForwardDiff, by [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a). As its description says, the norm is near 0 at an interior minimum; at a minimum on the boundary of the box, the gradient may not vanish.

**Local Polish** runs L-BFGS from the answer with a tight tolerance and up to 1000 evaluations, and reports the improvement. NLopt's documentation advises that, after a global optimisation, it is often worthwhile to use the global optimum as the starting point of a local optimisation that polishes it to greater accuracy, since many global algorithms devote more effort to searching the space than to locating the local optimum precisely.

## The position within the box

**Solution Summary** gives the relative position of the best point within the box, 0 at a lower bound and 1 at an upper one, for every variable. A coordinate at 0 or 1 marks a solution on the boundary, where a wider box might hold a lower value.

With the default box, the origin lies at 0.42 of the way along the first variable and 0.46 along the second, away from the centre that DIRECT-L samples first.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007c"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. *NLopt Documentation*. [nlopt.readthedocs.io](https://nlopt.readthedocs.io/en/latest/)

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
