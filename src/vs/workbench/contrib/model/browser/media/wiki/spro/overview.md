# Stochastic Programming: Overview

Stochastic programming optimises decisions that must be taken before uncertain data are known, with later decisions that adapt once the data are revealed. The panel solves one inventory problem in three ways: as a two-stage program, as a multistage program on a scenario tree, and with stochastic dual dynamic programming.

## Stages and recourse

[Dantzig (1955)](#ref-Dan1955a) describes the general models as having activities divided into two or more stages. The quantities of the first-stage activities are the only ones that must be determined; those of later stages cannot be determined in advance, since they depend on the earlier stages and on the random or uncertain demands that occur on or before the later stage.

The panel's problem has that structure. An order is placed before demand is seen; once demand is revealed, the units on hand are sold up to the demand, the leftover stock is carried at a holding cost, and, in the multistage tabs, a new order is placed for the next period.

## The inventory problem

| Item | Value in the code |
|---|---|
| Sale price p | 5.0 |
| Unit order cost c | 2.0 |
| Holding cost h per unit carried | 0.5 |
| Demand | Uniform(50, 150), S equally likely values per period, seed 1 |
| Initial stock | 0 |
| Objective | Minimise expected cost: order cost − sales revenue + holding cost |

The expected cost is negative when the business is profitable; the **Two-Stage** tab also prints the expected profit, the negative of the cost.

## Three formulations

| Tab | Periods | Method |
|---|---|---|
| **Two-Stage** | 1 | Extensive-form LP over S scenarios |
| **Multistage** | **Periods (T)** | Extensive-form LP over a scenario tree of S^T paths |
| **SDDP** | **Periods (T)** | Benders cuts of each stage's cost-to-go with SDDP.jl |

The extensive form writes one copy of the recourse variables for every node of the scenario tree, so that a single linear program, built with JuMP and solved with HiGHS, gives the optimal decisions. [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a) present JuMP, a modelling language for mathematical optimisation, and the panel's reference for HiGHS is [Huangfu and Hall (2018)](#ref-HH2018a), on the design and implementation of two parallel dual simplex solvers for large sparse linear programs.

## Stochastic dual dynamic programming

[Dowson and Kapelevich (2021)](#ref-DK2021b) present SDDP.jl, an open-source library for solving multistage stochastic programming problems with the stochastic dual dynamic programming algorithm, built on JuMP. The algorithm goes back to [Pereira and Pinto (1991)](#ref-PP1991a).

The SDDP.jl documentation explains that the algorithm applies Kelley's cutting plane method to the cost-to-go terms of a dynamic programming recursion. A forward pass simulates the policy and records the states visited; a backward pass adds a cut at each visited state; the first-stage problem with its cuts gives a lower bound, and Monte Carlo simulation of the policy a statistical estimate of its cost.

## Scenarios and non-anticipativity

In the multistage tabs, each decision may use only the demands observed so far, the condition the decision table calls non-anticipativity. [Rockafellar and Wets (1991)](#ref-RW1991a) develop an algorithmic procedure in which scenarios are bundled at various levels to reflect the availability of information, and iterative adjustments are made to the decision policy to remove the dependence on hindsight.

The extensive form of the panel builds the same condition into the tree: every node has one order, shared by all the paths that pass through it.

## References

<a id="ref-Dan1955a"></a>Dantzig, G. B. (1955). Linear Programming under Uncertainty. *Management Science* 1(3-4), 197-206. [doi:10.1287/mnsc.1.3-4.197](https://doi.org/10.1287/mnsc.1.3-4.197)

<a id="ref-DK2021b"></a>Dowson, O., & Kapelevich, L. (2021). SDDP.jl: A Julia Package for Stochastic Dual Dynamic Programming. *INFORMS Journal on Computing* 33(1), 27-33. [doi:10.1287/ijoc.2020.0987](https://doi.org/10.1287/ijoc.2020.0987)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-PP1991a"></a>Pereira, M. V. F., & Pinto, L. M. V. G. (1991). Multi-stage Stochastic Optimization Applied to Energy Planning. *Mathematical Programming* 52(1-3), 359-375. [doi:10.1007/BF01582895](https://doi.org/10.1007/BF01582895)

<a id="ref-RW1991a"></a>Rockafellar, R. T., & Wets, R. J-B. (1991). Scenarios and Policy Aggregation in Optimization Under Uncertainty. *Mathematics of Operations Research* 16(1), 119-147. [doi:10.1287/moor.16.1.119](https://doi.org/10.1287/moor.16.1.119)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md) · [SDDP](sddp.md)
