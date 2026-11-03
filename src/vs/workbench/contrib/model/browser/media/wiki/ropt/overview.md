# Uncertainty-Set Robust Optimisation: Overview

Robust optimisation chooses a decision that stays feasible for every value of the uncertain data in a given set. The panel applies it to a production plan whose resource coefficients are uncertain, with four shapes of the set.

## Uncertain data and robust counterparts

[Ben-Tal and Nemirovski (1998)](#ref-BN1998a) consider optimisation problems whose data are only known to belong to an uncertainty set 𝒰, while the constraints must be satisfied whatever the actual realisation of the data in 𝒰. The best decision is then an optimal solution of the robust counterpart: the problem of optimising the worst-case objective subject to the constraints for all data in 𝒰. Its feasible and optimal solutions are the robust feasible and robust optimal solutions, and its optimal value the robust optimal value.

The panel's nominal problem is a linear programme: maximise the profit cᵀx of a production plan x ≥ 0 subject to the resource constraints Ax ≤ b. The coefficients of A are uncertain, and every constraint must hold for all the coefficients its row of the set allows.

## Tractability

A robust counterpart has a constraint for every point of the uncertainty set, a semi-infinite problem. [Ben-Tal and Nemirovski (1998)](#ref-BN1998a) make it a goal of primary importance to convert robust counterparts into explicit convex programmes that high-performance optimisation methods can solve, and they show that, for ellipsoidal uncertainty, the robust counterparts of linear programmes and of several other generic convex problems are either exactly or approximately tractable.

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) give the explicit forms for an uncertain linear constraint: a system of linear inequalities for a box, a conic quadratic inequality for a ball, and, for any polyhedral set, a system of linear inequalities obtained by linear programming duality. As the panel's second bullet says, the robust counterparts of its four sets are deterministic LPs or second-order cone programmes, solved directly in JuMP, by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a).

## Four uncertainty sets

| Set | Idea | Source |
|---|---|---|
| **Box** | Every coefficient may take its worst value at once | [Soyster (1973)](#ref-Soy1973a) |
| **Ellipsoidal** | The scaled deviations lie in a ball of radius ω | [Ben-Tal and Nemirovski (1998)](#ref-BN1998a) |
| **Budgeted** | At most Γ coefficients of a row deviate fully | [Bertsimas and Sim (2004)](#ref-BS2004b) |
| **Polyhedral** | Any set given by linear inequalities; in the panel, ‖u‖₁ ≤ Γ | [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) |

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) trace robust linear programming back to [Soyster (1973)](#ref-Soy1973a), the first to consider it, in 1973.

## The price of robustness

[Bertsimas and Sim (2004)](#ref-BS2004b) describe robust linear optimisation as accepting a suboptimal solution for the nominal values of the data, to ensure that the solution remains feasible and near optimal when the data change. The profit given up is what they call the price of robustness; the panel reports it as `price_of_robustness_percent`.

They adjust the level of conservatism of the robust solutions in terms of probabilistic bounds on constraint violation, with a budget Γ for each constraint, and keep the robust formulation a linear programme. The budget also extends to discrete problems: [Bertsimas and Sim (2003)](#ref-BS2003a) treat robust discrete optimisation and network flows.

## Probabilistic guarantees

The robust counterpart protects against every point of the set, with no probability distribution assumed, as the panel's first bullet says. When the deviations are random, independent, with mean 0 and bounded, [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) show that a robust solution for a ball or a budgeted set also satisfies the constraint with high probability, with explicit bounds; [Bertsimas and Sim (2004)](#ref-BS2004b) give a bound for the budgeted set when the deviations are independent and symmetric.

The panel checks the plans against 10 000 random coefficient matrices, each coefficient drawn independently and uniformly in [a⁰ᵢⱼ − âᵢⱼ, a⁰ᵢⱼ + âᵢⱼ], and reports how often a constraint is violated.

## The panel in Julia

The code builds the robust counterpart of each set with a few JuMP constraints and solves it with HiGHS, whose dual revised simplex method is described by [Huangfu and Hall (2018)](#ref-HH2018a), or, for the second-order cone programme of the **Ellipsoidal** set, with Clarabel, the interior-point conic solver of [Goulart and Chen (2024)](#ref-GC2024a).

[Bertsimas and Tsitsiklis (1997)](#ref-BT1997a) cover the linear programming, duality and sensitivity analysis on which the counterparts and the **Shadow Prices** action rest.

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

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
