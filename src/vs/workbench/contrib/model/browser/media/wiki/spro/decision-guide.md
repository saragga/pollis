# Stochastic Programming: Decision Guide

The choice among the three tabs rests on how decisions and observations alternate, how large the scenario tree is, and whether the uncertainty is independent from stage to stage.

## The decision table

| Tab | Context | Purpose in the panel |
|---|---|---|
| **Two-Stage** | Decide now, observe uncertainty once, then take a recourse action (newsvendor ordering, capacity sizing, unit commitment) | Order before demand is known, sell after it is revealed; one extensive-form LP over S sampled demand scenarios, with EVPI and VSS |
| **Multistage** | Decisions and observations alternate over several periods, and each decision may use only what has been observed (non-anticipativity) | The same inventory problem over T periods on a scenario tree with S branches per period (S^T paths), solved exactly as one extensive-form LP |
| **SDDP** | Many stages or large trees where the extensive form explodes, with stagewise-independent uncertainty and convex costs | Forward simulations and backward passes build Benders cuts of each stage's cost-to-go, giving a policy and a lower bound |

## Two stages or several

[Dantzig (1955)](#ref-Dan1955a) describes models whose activities are divided into two or more stages, with only the first-stage quantities to be determined now. When the uncertainty is revealed once and a single recourse follows, the **Two-Stage** tab applies; when orders and demands alternate, the **Multistage** and **SDDP** tabs apply. [Dowson and Kapelevich (2021)](#ref-DK2021b) describe SDDP as a dynamic programming-inspired algorithm that decomposes the multistage stochastic optimisation problem in time into a series of sequential subproblems, each choosing an action to minimise the cost of the current decision plus the cost-to-go of the remaining stages.

## Extensive form or SDDP

The extensive form of the **Multistage** tab has one set of variables for each of the S + S² + … + S^T nodes of the tree. The tooltip of **Scenarios per Stage (S)** advises keeping S^T under about 20 000, and the tooltip of **Periods (T)** states that the extensive form grows as S^T while SDDP grows only linearly in T.

The SDDP.jl documentation describes its result as a policy, a set of decision rules, with a lower bound from the cuts and a statistical estimate of its cost from simulation. **Extensive Form vs SDDP** compares the two on the current inputs.

## When SDDP applies

The SDDP.jl documentation lists the assumptions of the algorithm: a finite number of nodes; finite, discrete random variables; convex problems, with linear transition functions; no infinite loops in the policy graph; and relatively complete recourse. The random variable of each node is independent of those of all other nodes.

[Dowson and Kapelevich (2021)](#ref-DK2021b) explain that traditional dynamic programming estimates the cost-to-go function at a set of discretised points, which limits it to low-dimensional problems, while SDDP approximates it with piecewise linear cuts. With stagewise independent noise, a convex cost-to-go function and continuous state variables, SDDP can efficiently find an optimal policy, to within some bound.

## Scenario count and iterations

**Scenario Count Study** shows how the optimal cost and the first order change as S grows. The S values are samples of the Uniform(50, 150) demand, and for **Multistage** each extra value adds branches at every period of the tree.

For **SDDP**, **SDDP Iterations** sets the number of forward and backward passes. The theory tutorial of SDDP.jl recommends, as a rule of thumb, training for a large number of iterations, such as 10 times the number of nodes times the largest number of noise values per node. With the defaults, that is 10 · (T + 1) · S = 800.

## Out of the sample

**Out-of-Sample** and **Bound Gap** test the decisions on demand that was not used to compute them. The panel's code comment notes that the optima of sample average approximations are biased low, so the in-sample expected cost is compared with the cost on fresh scenarios.

[Rockafellar and Wets (1991)](#ref-RW1991a) address a related case, in which statistical information is not enough to support a stochastic programming model, and a set of scenarios with weights is used to build a decision policy by scenario bundling and iterative adjustment.

## References

<a id="ref-DK2021b"></a>Dowson, O., & Kapelevich, L. (2021). SDDP.jl: A Julia Package for Stochastic Dual Dynamic Programming. *INFORMS Journal on Computing* 33(1), 27-33. [doi:10.1287/ijoc.2020.0987](https://doi.org/10.1287/ijoc.2020.0987)

<a id="ref-Dan1955a"></a>Dantzig, G. B. (1955). Linear Programming under Uncertainty. *Management Science* 1(3-4), 197-206. [doi:10.1287/mnsc.1.3-4.197](https://doi.org/10.1287/mnsc.1.3-4.197)

<a id="ref-RW1991a"></a>Rockafellar, R. T., & Wets, R. J-B. (1991). Scenarios and Policy Aggregation in Optimization Under Uncertainty. *Mathematics of Operations Research* 16(1), 119-147. [doi:10.1287/moor.16.1.119](https://doi.org/10.1287/moor.16.1.119)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md) · [SDDP](sddp.md)
