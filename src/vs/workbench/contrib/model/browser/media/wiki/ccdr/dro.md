# Distributionally Robust

Distributionally robust optimisation asks for protection under every distribution close to the data. The radius of that neighbourhood takes the place of a distributional assumption.

## What a Wasserstein Ball Is

The Wasserstein distance between two distributions is the least average distance needed to move the mass of one onto the other. A ball of radius theta around the empirical distribution of the samples holds all distributions that can be reached by moving mass by at most theta on average. It contains distributions with mass where no data fell, which a set built on reweighted samples cannot do. [Mohajerin Esfahani and Kuhn (2018)](#ref-EK2018a) show that such problems have tractable reformulations, and give guarantees that hold out of sample.

## How the Tab Forms Its Constraint

CVaR at level epsilon is the mean of the worst epsilon share of outcomes, and a CVaR of at most 0 implies a chance constraint at level epsilon. The tab applies that to all distributions in the ball:

- Loss: xi'x − b, whose Lipschitz constant in xi is ‖x‖
- Constraint: tau + sum over i of s_i / (epsilon N) + theta ‖x‖ / epsilon ≤ 0, with s_i ≥ xi_i'x − b − tau and s_i ≥ 0

The first two terms are the sample CVaR, in the form of [Rockafellar and Uryasev (2000)](#ref-RU2000a). The last term is the price of robustness, which grows with theta and with reliability.

## What the Constraint Guarantees

The constraint bounds the worst-case CVaR, and that gives a safe condition for the chance constraint under every distribution in the ball. Because CVaR is more demanding than a pure failure probability, the result can be conservative, even at theta = 0. [Xie (2021)](#ref-Xie2021a) studies exact formulations of the distributionally robust chance constraint, which are harder to solve, and relates approximations to them. A guarantee covers the true distribution only if it lies inside the ball, which depends on the choice of theta and the amount of data.

## How to Choose the Radius

**Wasserstein Radius (theta)** has no universal scale, as it is measured in the units of xi. A value of zero recovers the sample CVaR constraint, and a large value gives a plan close to doing nothing. Theory ties the needed radius to the sample size, so that it shrinks as data accumulate, but the constants tend to be conservative. In practice, choose it by cross-validation or by a held-out reliability test. **CC vs DRO** holds theta fixed across sizes, so a fair use would try other values, since a value adequate at n = 1000 may not be at n = 10.

## How Moment-Based Sets Compare

The other common family uses moments: all distributions with a mean and a covariance near the estimates. [Delage and Ye (2010)](#ref-DY2010a) study such a set, with data-driven confidence regions, and show that it can be solved as a tractable conic problem. These sets are simple and interpretable, but they ignore all other information in the data, and may include quite strange distributions. The panel's notebook **DRO: Moment Ambiguity** covers that form, and the tab uses Wasserstein because its protection depends directly on the data at hand.

## Where the Distributionally Robust Tab Is Strong and Weak

Few data and little trust in a fitted model both favour it. It uses all samples and assumes no shape, and its protection has a clear parameter. Its cost is a larger problem, with one extra variable per sample, and a more conservative plan than a well-specified chance constraint when the true distribution is normal and data are plentiful. A poorly chosen radius loses both ways. Compare with **Robust and Nominal Baselines**, and test with **Reliability**, to see if the cost pays for itself on a given problem.

## References

<a id="ref-DY2010a"></a>Delage, E. and Ye, Y. (2010). Distributionally robust optimization under moment uncertainty with application to data-driven problems. *Operations Research* 58(3), 595–612. [doi:10.1287/opre.1090.0741](https://doi.org/10.1287/opre.1090.0741)

<a id="ref-EK2018a"></a>Mohajerin Esfahani, P. and Kuhn, D. (2018). Data-driven distributionally robust optimization using the Wasserstein metric. *Mathematical Programming* 171(1–2), 115–166. [doi:10.1007/s10107-017-1172-1](https://doi.org/10.1007/s10107-017-1172-1)

<a id="ref-RU2000a"></a>Rockafellar, R. T. and Uryasev, S. (2000). Optimization of conditional value-at-risk. *Journal of Risk* 2(3), 21–41. [doi:10.21314/JOR.2000.038](https://doi.org/10.21314/JOR.2000.038)

<a id="ref-Xie2021a"></a>Xie, W. (2021). On distributionally robust chance constrained programs with Wasserstein distance. *Mathematical Programming* 186(1–2), 115–155. [doi:10.1007/s10107-019-01445-5](https://doi.org/10.1007/s10107-019-01445-5)

## See Also

- [Factsheet](factsheet.md) · [Chance-Constrained](chance-constrained.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
