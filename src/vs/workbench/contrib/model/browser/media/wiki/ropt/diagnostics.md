# Uncertainty-Set Robust Optimisation: Diagnostics

How to check a robust solution: the solver status, the worst case of each constraint, the simulated violations, and the cost of the protection.

## The solver status

The output `solved` reports whether the solver returned a feasible optimal solution. The LPs of the **Box**, **Budgeted** and **Polyhedral** sets are solved by HiGHS, with the dual revised simplex method of [Huangfu and Hall (2018)](#ref-HH2018a); the second-order cone programme of the **Ellipsoidal** set by Clarabel, the interior-point method of [Goulart and Chen (2024)](#ref-GC2024a).

The robust problem always has the feasible point x = 0 when **Capacity b** is non-negative, as in the default data, so a status other than solved points to the inputs: a negative capacity, rows and columns of **Resource Use A** that do not match **Profit c** and **Capacity b**, or a direction in which the profit grows without bound.

## The worst case of each constraint

**Worst-Case Scenario** lists, for every constraint, the capacity, the use of the resource by the nominal plan at the nominal coefficients, and the use by the nominal and by the robust plan at the worst coefficients of the set. The last column flags the constraints the nominal plan violates in its worst case.

By construction, the robust plan's worst-case use stays within capacity in every row; that is the definition of robust feasibility of [Ben-Tal and Nemirovski (1998)](#ref-BN1998a). The table shows which constraints the nominal plan leaves unprotected, and by how much its worst-case use exceeds the capacity of each.

## The cost of protection

**Nominal Suboptimality** gives the nominal and the robust profit, the profit given up, and the largest amount by which the nominal plan overshoots a capacity at its worst coefficients. The two numbers show the trade-off: the profit given up is the price paid for robustness, the overshoot what the nominal plan would risk without it.

[Bertsimas and Sim (2004)](#ref-BS2004b) describe the price of robustness as the suboptimality accepted for the nominal values of the data in exchange for a solution that remains feasible and near optimal when the data change.

## Simulated violations

**Violation Probability** applies the nominal and the robust plan to 10 000 matrices of independent uniform coefficients, and reports for each constraint the share of draws in which it is violated, and the share in which any constraint is violated.

On the **Budgeted** tab it also prints exp(−Γ²/(2n)), with n the number of products. The bound of [Bertsimas and Sim (2004)](#ref-BS2004b) for constraint i is exp(−Γᵢ²/(2∣Jᵢ∣)), with ∣Jᵢ∣ the number of uncertain coefficients in the row, so the printed value is the bound for a row in which all n coefficients are uncertain.

For the **Ellipsoidal** set, [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) give the bound exp(−Ω²/2) per constraint, with Ω the radius **Ellipsoid Radius (omega)**.

## Coefficients outside the simulation

The simulated coefficients lie in the box of each row, so the simulation tests the plans against the box and nothing beyond. For the **Polyhedral** set with Γ > 1, the panel's set ‖u‖₁ ≤ Γ allows a single coefficient to move Γ times its range, as the comment in the code notes, beyond any draw.

For **Ellipsoidal** with ω > 1, the ball also reaches beyond the box; with ω ≥ √n it contains the box, as the tooltip of **Ellipsoid Radius (omega)** says.

## The slack at the solution

**Conservatism Analysis** lists, for every constraint of the robust plan, the slack at the nominal coefficients and at the worst coefficients of the set, the protection term the set requires, and the protection the **Box** set would require for the same plan.

A worst-case slack of 0 marks a constraint the robust plan holds exactly at its worst case; the nominal slack of the same row is then the protection term itself.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BN1998a"></a>Ben-Tal, A., & Nemirovski, A. (1998). Robust Convex Optimization. *Mathematics of Operations Research* 23(4), 769-805. [doi:10.1287/moor.23.4.769](https://doi.org/10.1287/moor.23.4.769)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
