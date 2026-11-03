# Uncertainty-Set Robust Optimisation: Interpretation

How to read the outputs: the robust plan and its price, the frontier and the feasible region, the trade-off between profit and violation, the comparisons, and the shadow prices.

## The robust plan and its price

`robust_x` is the production plan that maximises the profit cᵀx while every constraint holds for all the coefficients of the set; `robust_profit` is its profit at the known prices. `nominal_profit` is the optimum of the nominal problem, which trusts the nominal coefficients.

The robust feasible set lies inside the nominal one, so the robust profit is never higher. `price_of_robustness_percent` expresses the difference as a share of the nominal profit, the price of robustness in the sense of [Bertsimas and Sim (2004)](#ref-BS2004b): the suboptimality accepted for the nominal data in exchange for feasibility when the data change.

## The robust frontier

**Robust Frontier** solves the robust counterpart of the selected set for ρ from 0 to 0.5 in steps of 0.02 and plots the robust profit, with the nominal profit as a dashed line. At ρ = 0 all sets reduce to the nominal problem.

The curve shows how fast protection becomes expensive as the coefficients grow less certain. The other inputs of the set, ω or Γ, stay at their current values along the curve.

## The feasible region

**Feasible Region**, for two products, shades the plans feasible for the nominal problem and those feasible for the robust counterpart, and marks both optima. The robust region is the set of plans whose worst-case resource use stays within every capacity.

The boundary of the robust region is straight for the **Box**, **Budgeted** and **Polyhedral** sets, whose robust counterparts are linear, and curved for the **Ellipsoidal** set, whose counterpart is a conic quadratic inequality, as in the forms of [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a).

## Profit against violation

**Price of Robustness** varies the protection level and plots, side by side, the robust profit and the simulated probability that some constraint is violated:

| Set | Protection level varied |
|---|---|
| **Box** | The fraction of ρ protected, from 0 to 1 |
| **Ellipsoidal** | ω from 0 to 3 |
| **Budgeted**, **Polyhedral** | Γ from 0 to the number of products |

[Bertsimas and Sim (2004)](#ref-BS2004b) use the budget Γ exactly so: to adjust the level of conservatism of the robust solutions in terms of probabilistic bounds on constraint violation. With Γ = 0 the budgeted counterpart is the nominal problem, and with Γ equal to the number of uncertain coefficients of a row it is the formulation of [Soyster (1973)](#ref-Soy1973a).

## Robust plans against sampled constraints

**Scenario Approach** solves the LP that imposes the constraints for K sampled coefficient matrices, K = 20, 100 and 500, drawn with seed 11, and lists the plans, their profits and their simulated violation probabilities next to the nominal and the robust plan.

[Ben-Tal and Nemirovski (1998)](#ref-BN1998a) note that when the uncertainty set is the convex hull of a finite set of scenarios, the robust counterpart of a problem affine in the data is simply the problem with the constraints of every scenario. The scenario LP is therefore the robust counterpart for the convex hull of the K sampled matrices, a set that grows with K.

[Calafiore and Campi (2006)](#ref-CC2006a) call this the scenario approach: sampling the constraints of a problem with a linear objective and uncertain convex constraints gives a standard convex problem, the scenario problem, whose solution is approximately feasible for the original constraints. The measure of the set of original constraints that the scenario solution violates decreases rapidly to zero as the number of samples grows, and they give an explicit bound on the number of samples needed for a specified level of probabilistic guarantee.

## All sets side by side

**All Sets vs Nominal** solves the nominal problem and the robust counterparts of all four sets, at the current ρ and, where they apply, ω and Γ, and lists their plans, profits and simulated violation probabilities.

With the default Γ = 1, the **Budgeted** and **Polyhedral** sets coincide: ‖u‖₁ ≤ 1 implies ‖u‖∞ ≤ 1. The panel's decision table notes that the two are equal for Γ ≤ 1.

## Shadow prices

**Shadow Prices** raises each capacity by 0.001, solves the nominal and the robust problem again, and reports the gain in profit per unit of extra capacity, a finite-difference estimate of the marginal value of each resource.

[Bertsimas and Tsitsiklis (1997)](#ref-BT1997a) interpret optimal dual variables as marginal costs, and the two columns are estimates of them for the nominal and the robust problem. A resource with slack in the optimum has a shadow price of 0: one more unit of it does not change the plan.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BN1998a"></a>Ben-Tal, A., & Nemirovski, A. (1998). Robust Convex Optimization. *Mathematics of Operations Research* 23(4), 769-805. [doi:10.1287/moor.23.4.769](https://doi.org/10.1287/moor.23.4.769)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

<a id="ref-BT1997a"></a>Bertsimas, D., & Tsitsiklis, J. N. (1997). *Introduction to Linear Optimization*. Athena Scientific. [athenasc.com](http://www.athenasc.com/linoptbook.html)

<a id="ref-CC2006a"></a>Calafiore, G. C., & Campi, M. C. (2006). The Scenario Approach to Robust Control Design. *IEEE Transactions on Automatic Control* 51(5), 742-753. [doi:10.1109/TAC.2006.875041](https://doi.org/10.1109/TAC.2006.875041)

<a id="ref-Soy1973a"></a>Soyster, A. L. (1973). Convex Programming with Set-Inclusive Constraints and Applications to Inexact Linear Programming. *Operations Research* 21(5), 1154-1157. [doi:10.1287/opre.21.5.1154](https://doi.org/10.1287/opre.21.5.1154)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
