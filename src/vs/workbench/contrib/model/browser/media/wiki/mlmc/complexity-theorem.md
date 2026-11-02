# Multilevel Monte Carlo — Complexity Theorem

The complexity theorem predicts the total cost of reaching a tolerance from three decay rates. [Giles (2008)](#ref-Gil2008a) gave it for path simulation, and the survey by [Giles (2015)](#ref-Gil2015a) states it as Theorem 1, the form the panel uses. A version with a general cost rate is in [Cliffe, Giles, Scheichl and Teckentrup (2011)](#ref-CGST2011a).

## What the Multilevel Complexity Theorem Assumes

The theorem takes positive constants alpha, beta, gamma, with alpha at least min(beta, gamma)/2, such that for level l:

- the weak error satisfies |E[Q_l - Q]| <= c1 2^(-alpha l)
- the correction variance satisfies V_l <= c2 2^(-beta l)
- the cost of one sample satisfies C_l <= c3 2^(gamma l)

Rates are asymptotic bounds, stated for large l. The panel measures them from a few levels, so its fitted figures only suggest which case applies.

## What Cost the Multilevel Complexity Theorem Predicts

For a tolerance eps small enough, an estimator exists with mean squared error under eps^2 and with this total cost, up to a constant:

| Regime | Cost of multilevel estimator | Where the cost goes |
|---|---|---|
| beta > gamma | eps^-2 | Mostly the coarse levels |
| beta = gamma | eps^-2 (log eps)^2 | Evenly across the levels |
| beta < gamma | eps^-(2 + (gamma - beta)/alpha) | Mostly the finest levels |

Plain sampling at one fine level needs eps^-(2 + gamma/alpha). So the gain is largest when beta exceeds gamma, where the cost of the grid no longer shows in the rate.

## Which Regime Each Test Problem of the Multilevel Panel Falls Into

| **Problem** | alpha, beta, gamma in the code | Regime | Multilevel cost | Single-level cost |
|---|---|---|---|---|
| **Random Integral** | 2, 4, 1 | beta > gamma | eps^-2 | eps^-2.5 |
| **GBM Call Option** | 1, 1, 1 | beta = gamma | eps^-2 (log eps)^2 | eps^-3 |

The midpoint rule explains the first row: its error for each X is O(h^2), and so is the correction. Euler-Maruyama explains the second, with weak order 1 and strong order 1/2 under a Lipschitz payoff.

## How the Multilevel Panel Applies the Complexity Theorem

**Cost Forecast** picks a regime from the measured rates, treating rates within 0.25 as equal, and multiplies the current cost for a tolerance ten times smaller. The factor is 100 for beta > gamma, about 100 times a squared log ratio for beta = gamma, and 10^(2 + (gamma - beta)/alpha) for beta < gamma. **Complexity Check** prints tol^2 times cost at four tolerances, for both methods. Under beta > gamma, the multilevel column should stay roughly constant. Under beta = gamma, it should grow like (log tol)^2. The single-level column should grow like tol^(-gamma/alpha).

## Where the Multilevel Complexity Theorem Misleads

The theorem gives rates and hides constants, so a method with the better rate can cost more at a loose tolerance. Its bounds hold for an estimator using the right number of levels and an idealised allocation, while the package estimates these from samples. Its gamma in the panel is the cost model and not a measurement. On **MLQMC**, the theorem does not describe the lattice rule: the fitted beta belongs to independent points, so the regime named by **Cost Forecast** and the figures from **Complexity Check** can overstate the growth in cost.

## What to Compare the Complexity Theorem With

Set the prediction against measurements. **Cost vs Tolerance** plots real cost for both methods against tolerance on log-log axes, with a dashed tol^-2 line. **Multilevel vs Single Level** gives the ratio at one tolerance. Agreement in slope over a wide range of tolerances supports the regime. Over four tolerances, each a factor of 2 from the next, a slope is only rough, and a log factor is hard to see.

## References

<a id="ref-CGST2011a"></a>Cliffe, K. A., Giles, M. B., Scheichl, R. and Teckentrup, A. L. (2011). Multilevel Monte Carlo methods and applications to elliptic PDEs with random coefficients. *Computing and Visualization in Science* 14(1), 3–15. [doi:10.1007/s00791-011-0160-x](https://doi.org/10.1007/s00791-011-0160-x)

<a id="ref-Gil2008a"></a>Giles, M. B. (2008). Multilevel Monte Carlo path simulation. *Operations Research* 56(3), 607–617. [doi:10.1287/opre.1070.0496](https://doi.org/10.1287/opre.1070.0496)

<a id="ref-Gil2015a"></a>Giles, M. B. (2015). Multilevel Monte Carlo methods. *Acta Numerica* 24, 259–328. [doi:10.1017/S096249291500001X](https://doi.org/10.1017/S096249291500001X)

## See Also

- [MLMC Algorithm](mlmc-algorithm.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Quasi-Monte Carlo Extension](qmc-extension.md)
