# Uncertainty-Set Robust Optimisation: Decision Guide

Which uncertainty set to choose, how to set its size, and how to check the robust plan.

## Choosing a set

| Situation | Set | Robust counterpart |
|---|---|---|
| Every coefficient may independently take its worst value; simplest and most conservative | **Box** | LP with every deviation added in full |
| Deviations are unlikely to be all extreme at once; protect against a Euclidean ball of joint deviations | **Ellipsoidal** | Second-order cone programme |
| At most Γ coefficients per constraint deviate simultaneously; tunable price of robustness | **Budgeted** | LP, between nominal (Γ = 0) and box (Γ = n) |
| Any set described by linear inequalities W u ≤ h | **Polyhedral** | LP through the dual of the inner maximisation |

The table follows the panel's decision table, which attributes the first three sets to [Soyster (1973)](#ref-Soy1973a), [Ben-Tal and Nemirovski (1998)](#ref-BN1998a) and [Bertsimas and Sim (2004)](#ref-BS2004b).

## Conservatism

[Bertsimas and Sim (2004)](#ref-BS2004b) describe the formulation of [Soyster (1973)](#ref-Soy1973a) as the one that admits the highest protection and is also the most conservative in practice, in the sense that its robust solution has a much lower objective value than the nominal one. They and [Ben-Tal and Nemirovski (1998)](#ref-BN1998a) propose sets that protect against less than every coefficient at its worst at once.

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) compare the ball and the box under random deviations: the box guarantees feasibility with probability 1, the ball with probability at least 1 − exp(−Ω²/2), and for a moderate Ω and many perturbations the ball is much smaller than the box.

## Linear or conic

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) explain why the budgeted set is of interest even though its probabilistic guarantee also holds for a less conservative ball: its robust counterpart is a system of linear constraints, so the robust counterpart of an uncertain LP is itself an LP and can be processed by well-developed LP solvers, while the ball leads to a conic quadratic problem, more demanding although still efficiently tractable.

[Bertsimas and Sim (2004)](#ref-BS2004b) add that a linear robust counterpart carries over to discrete optimisation: with integer variables, the robust problem stays a mixed-integer programme of the same kind as the nominal one. [Bertsimas and Sim (2003)](#ref-BS2003a) pursue this for discrete optimisation and network flows.

## Setting the size of the set

| Input | Effect |
|---|---|
| **Relative Deviation (rho)** | The range of every coefficient, ±ρ ∣a⁰ᵢⱼ∣; **Robust Frontier** shows the profit for ρ from 0 to 0.5 |
| **Ellipsoid Radius (omega)** | The radius of the ball; ω = 1 lies inside the box, ω = √n contains it |
| **Budget (Gamma)** | The total scaled deviation per constraint, from 0 to the number of products |

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) give the radius Ω ≥ √(2 ln(1/ε)) for a ball robust counterpart that holds with probability at least 1 − ε; with the budgeted set, γ/√L plays the role of Ω. **Price of Robustness** shows profit and simulated violation together as the protection level varies.

## The polyhedral set

The **Polyhedral** tab shows the general route for any polytope W u ≤ h: the worst case maxᵤ {dᵀu : W u ≤ h} equals, by linear programming duality, min {hᵀλ : Wᵀλ = d, λ ≥ 0}, so the robust constraint becomes linear in x and λ. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) derive the same reformulation for polyhedral perturbation sets, and [Bertsimas and Tsitsiklis (1997)](#ref-BT1997a) treat the duality theorem it rests on.

The panel's polytope is ‖u‖₁ ≤ Γ, written with one inequality for every sign vector, 2ⁿ in all; each constraint gets 2ⁿ dual variables. As its decision row says, the set equals the budgeted set for Γ ≤ 1 and is not clipped to the box beyond.

## Checking the plan

| Question | Action |
|---|---|
| Does the robust plan hold at the worst case of each constraint? | **Worst-Case Scenario**, **Conservatism Analysis** |
| What does protection cost? | **Nominal Suboptimality**, `price_of_robustness_percent` |
| How often would each plan fail under random deviations? | **Violation Probability**, **Price of Robustness** |
| How do the sets compare at the same inputs? | **All Sets vs Nominal** |
| How does sampling constraints compare? | **Scenario Approach** |
| Which resources limit the profit? | **Shadow Prices** |

## Solvers

The models are written in JuMP, by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), whose abstract describes a modelling language for linear, mixed-integer, quadratic, conic-quadratic, semidefinite and nonlinear problems in a high-level, algebraic syntax. The panel's LPs go to HiGHS, described by [Huangfu and Hall (2018)](#ref-HH2018a), and the second-order cone programme to Clarabel, by [Goulart and Chen (2024)](#ref-GC2024a), a general-purpose interior-point solver for convex problems with conic constraints.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BN1998a"></a>Ben-Tal, A., & Nemirovski, A. (1998). Robust Convex Optimization. *Mathematics of Operations Research* 23(4), 769-805. [doi:10.1287/moor.23.4.769](https://doi.org/10.1287/moor.23.4.769)

<a id="ref-BS2003a"></a>Bertsimas, D., & Sim, M. (2003). Robust Discrete Optimization and Network Flows. *Mathematical Programming* 98(1-3), 49-71. [doi:10.1007/s10107-003-0396-4](https://doi.org/10.1007/s10107-003-0396-4)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

<a id="ref-BT1997a"></a>Bertsimas, D., & Tsitsiklis, J. N. (1997). *Introduction to Linear Optimization*. Athena Scientific. [athenasc.com](http://www.athenasc.com/linoptbook.html)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-Soy1973a"></a>Soyster, A. L. (1973). Convex Programming with Set-Inclusive Constraints and Applications to Inexact Linear Programming. *Operations Research* 21(5), 1154-1157. [doi:10.1287/opre.21.5.1154](https://doi.org/10.1287/opre.21.5.1154)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
