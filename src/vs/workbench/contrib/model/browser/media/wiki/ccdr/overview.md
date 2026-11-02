# Overview

Planning under uncertainty often has constraints that cannot hold in every case at a reasonable price. The panel treats two ways of stating how much protection to buy, one that trusts a distribution, and one that does not.

## What Chance Constraints Do

A chance constraint requires a condition to hold with high probability, and accepts a small risk of failure:

- P(xi'x ≤ b) ≥ 1 − epsilon

Here x is the decision, xi a random coefficient and b a limit. The idea comes from [Charnes and Cooper (1959)](#ref-CC1959a). The aim is to avoid paying for extremely rare cases, while retaining a stated level of reliability. The formulation depends on knowing the distribution of xi. The results may be poor if that distribution has only been estimated, and a good share of what follows concerns that weakness.

## What Distributional Robustness Does

Distributionally robust optimisation protects against every distribution in a set, called an ambiguity set, and not just one. Data set the centre of that set, and a radius sets how far the truth may lie from it. The panel uses a ball in the Wasserstein distance, following [Mohajerin Esfahani and Kuhn (2018)](#ref-EK2018a). A guarantee then holds for all distributions in the ball. The approach sits between trusting a fitted model and the classical robust method, which ignores probability and guards against every value in a set.

## Which Problem the Panel Solves

Two products share one capacity, and each unit of each product uses a random amount:

- Maximise x1 + 1.5 x2, with x ≥ 0, subject to protection on xi'x ≤ 10
- True xi: Normal with means 1 and 2, variances 0.30 and 0.60, and covariance 0.10

Decisions see only **Samples (n)** draws. The true distribution is used only to measure results, on 100000 fresh draws, in `violation`. Knowing the truth lets the panel show how often a decision really fails, which cannot be done with real data.

## How the Two Tabs Compare

| Item | **Chance-Constrained** | **Distributionally Robust** |
|---|---|---|
| Assumes | Normal xi | Samples only |
| Protection | Normal quantile | Worst-case CVaR over a ball |
| Parameter | **Violation Probability (epsilon)** | Also **Wasserstein Radius (theta)** |
| Problem type | Second-order cone | Conic, with n extra variables |

Both are solved by Clarabel, through `JuMP.jl`. `solve_box` adds the classical robust and nominal baselines.

## A Common Workflow for Reliable Decisions

1. Run a tab, and compare `true_violation` with the target.
2. Use **Reliability** to see how the result varies across data sets.
3. Use **Robust and Nominal Baselines** to place it among simpler options.
4. Use **Epsilon Sweep** and **Shadow Prices** to see the price of reliability.
5. Use **CC vs DRO** to see how sample size changes the comparison.
6. Use **Feasible Region** to see all the constraints together.

## References

<a id="ref-CC1959a"></a>Charnes, A. and Cooper, W. W. (1959). Chance constrained programming. *Management Science* 6(1), 73–79. [doi:10.1287/mnsc.6.1.73](https://doi.org/10.1287/mnsc.6.1.73)

<a id="ref-EK2018a"></a>Mohajerin Esfahani, P. and Kuhn, D. (2018). Data-driven distributionally robust optimization using the Wasserstein metric. *Mathematical Programming* 171(1–2), 115–166. [doi:10.1007/s10107-017-1172-1](https://doi.org/10.1007/s10107-017-1172-1)

## See Also

- [Factsheet](factsheet.md) · [Chance-Constrained](chance-constrained.md) · [Distributionally Robust](dro.md) · [Decision Guide](decision-guide.md)
