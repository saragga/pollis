# Stochastic Programming: Diagnostics

The diagnostics ask how good the decisions are beyond the sampled scenarios: a lower bound against an estimate of the true cost, the stability of the solution as the sample grows, and the cost on fresh demand.

## Bound Gap for the extensive form

For **Two-Stage** and **Multistage**, **Bound Gap** solves the sampled problem ten times with independent demand samples, seeds 101 to 110, and averages the optimal costs into a lower-bound estimate with its standard error; the code comment notes that the optima of sample average approximations are biased low.

It then fixes the first order of the panel's solution and re-solves on ten fresh samples, seeds 201 to 210, with 2 000 demand values for **Two-Stage** and S values per period for **Multistage**. The mean of those costs estimates the cost of the chosen first order, and the action prints the gap between the two means.

[Shapiro, Dentcheva and Ruszczyński (2021)](#ref-SDR2021a) give a chapter to statistical inference for stochastic programs, and [Birge and Louveaux (2011)](#ref-BL2011a) chapters to evaluating and approximating expectations and to Monte Carlo methods.

## Bound Gap for SDDP

For **SDDP**, the action prints `SDDP.calculate_bound`, the lower bound from the cuts, against the mean simulated cost of 500 policy simulations with a 95% confidence interval, and the gap as a percentage of the bound.

The SDDP.jl documentation explains the two sides. The lower bound is the expected value of the first-stage problem with its cuts. An exact upper bound is almost always intractable for multistage programs, so a Monte Carlo simulation of the policy gives a statistical estimate of its cost. The documentation warns against stopping when the lower bound falls inside the confidence interval, since a small number of replications gives a wide interval and makes a false positive likely.

## The training log

The SDDP.jl documentation describes the columns of the log of `SDDP.train`. The simulation column is the cost of the single forward pass of the iteration, stochastic and not guaranteed to improve. The bound column is a lower bound when minimising, and should improve monotonically, although it can temporarily worsen through cut selection.

The panel trains with `print_level = 0`, so no log is printed, and reads the bound after training. The documentation also notes that the confidence interval of the log comes from in-sample simulations, which may not reflect the true performance of the policy.

## Scenario Count Study

**Scenario Count Study** re-solves the problem with more demand values per period and plots the optimal cost and the first order against the number of values, on a logarithmic axis:

| Tab | Counts |
|---|---|
| **Two-Stage** | 5, 10, 20, 50, 100, 200, 500 |
| **Multistage** | Those of 2, 3, 5, 8, 12 and 20 with n^T ≤ 20 000 |
| **SDDP** | 3, 5, 10, 20, 50, with at most 50 iterations each |

The action description states that the sample-average approximation stabilises as the count grows. For **SDDP**, the cost is the lower bound after training.

## Out-of-Sample

**Out-of-Sample** keeps the decisions and evaluates them on demand never used in the optimisation, seed 99. For **Two-Stage**, the order is fixed and the sales are re-optimised over 5 000 fresh demands; for **Multistage**, the first order is fixed on a fresh tree of S values per period.

For **SDDP**, `SDDP.OutOfSampleMonteCarlo` replaces the noise of every stage after the first by S fresh values with equal probabilities and simulates the trained policy 500 times. The theory tutorial of SDDP.jl notes that the random variable can be out-of-sample, which it calls a notable difference from progressive hedging or the deterministic equivalent. The action prints the mean, the standard deviation and the 95% quantile of the cost.

## Numerical checks

The SDDP.jl documentation lists the causes of an infeasible subproblem as a mistake in the formulation, a violation of relatively complete recourse, or numerical issues, and recommends scaling the problem so that the coefficients are of similar magnitudes. `SDDP.train` runs a numerical stability report by default.

The panel's coefficients are the prices 5, 2 and 0.5 and demands between 50 and 150, within a few orders of magnitude of each other.

## References

<a id="ref-BL2011a"></a>Birge, J. R., & Louveaux, F. (2011). *Introduction to Stochastic Programming* (2nd ed.). Springer. [doi:10.1007/978-1-4614-0237-4](https://doi.org/10.1007/978-1-4614-0237-4)

<a id="ref-SDR2021a"></a>Shapiro, A., Dentcheva, D., & Ruszczyński, A. (2021). *Lectures on Stochastic Programming: Modeling and Theory* (3rd ed.). SIAM. [doi:10.1137/1.9781611976595](https://doi.org/10.1137/1.9781611976595)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md) · [SDDP](sddp.md)
