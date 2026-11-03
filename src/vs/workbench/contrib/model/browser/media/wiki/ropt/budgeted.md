# Uncertainty-Set Robust Optimisation: Budgeted Uncertainty

**Budgeted** uncertainty, from [Bertsimas and Sim (2004)](#ref-BS2004b), protects each constraint against the case in which at most Γ of its coefficients deviate fully, with one more deviating by the fraction that remains. The budget Γ moves the robust plan between the nominal one and the box.

## The set

For row i, the scaled deviations lie in

𝒰 = {u : ‖u‖∞ ≤ 1, ‖u‖₁ ≤ Γ}

with Γ the **Budget (Gamma)**. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) describe the budgeted set as the intersection of the ‖·‖∞ and ‖·‖₁ balls, and Γ as an uncertainty budget.

[Bertsimas and Sim (2004)](#ref-BS2004b) introduce a parameter Γᵢ for every constraint, not necessarily integer, taking values in [0, ∣Jᵢ∣], with ∣Jᵢ∣ the number of uncertain coefficients of the row. Their aim is protection against all cases in which up to ⌊Γᵢ⌋ of the coefficients change, and one more changes by (Γᵢ − ⌊Γᵢ⌋) âᵢₜ. The panel uses the same Γ for every constraint.

## The protection function

For a plan x, the worst case of row i is the protection function of [Bertsimas and Sim (2004)](#ref-BS2004b): the largest sum of âᵢⱼ ∣xⱼ∣ over a subset of ⌊Γ⌋ coefficients, plus (Γ − ⌊Γ⌋) times the next largest term. In the code, `protect` sorts the deviations âᵢⱼ xⱼ in decreasing order and adds the ⌊Γ⌋ largest and the fraction of the next one.

With Γ = 0 there is no protection and the constraint is nominal. With Γ = ∣Jᵢ∣ every coefficient is protected, and [Bertsimas and Sim (2004)](#ref-BS2004b) recover the method of [Soyster (1973)](#ref-Soy1973a). In between, the budget adjusts the robustness of the method against the level of conservatism of the solution.

## The linear robust counterpart

The protection function is the optimal value of a small linear programme in the deviations. [Bertsimas and Sim (2004)](#ref-BS2004b) replace it by its dual, by strong duality, and obtain the equivalent linear formulation

a⁰ᵢᵀx + Γ zᵢ + Σⱼ pᵢⱼ ≤ bᵢ, zᵢ + pᵢⱼ ≥ âᵢⱼ yⱼ, −yⱼ ≤ xⱼ ≤ yⱼ, pᵢⱼ ≥ 0, zᵢ ≥ 0.

The panel has x ≥ 0, so yⱼ = xⱼ, and it adds one variable zᵢ and n variables pᵢⱼ per constraint. [Bertsimas and Sim (2004)](#ref-BS2004b) remark that the formulation preserves the sparsity of the matrix A. The LP is solved with HiGHS, by [Huangfu and Hall (2018)](#ref-HH2018a).

## The probability bound

[Bertsimas and Sim (2004)](#ref-BS2004b) show that, if up to ⌊Γᵢ⌋ coefficients change, the robust plan is feasible deterministically, and that even if more change, it remains feasible with high probability. When the scaled deviations ηᵢⱼ are independent and symmetrically distributed in [−1, 1], the probability that constraint i is violated is at most

exp(−Γᵢ² / (2∣Jᵢ∣)),

a bound that does not depend on the solution. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) reach the bound exp(−γ²/(2L)) for the budgeted set by relating it to the ball of radius γ/√L.

## In the panel

**Violation Probability** on the **Budgeted** tab prints exp(−Γ²/(2n)), the bound for a row with n uncertain coefficients, next to the simulated violation frequencies of each constraint. **Price of Robustness** solves the counterpart for Γ from 0 to n in steps of 0.25 and plots the profit and the simulated probability of violation.

The panel's decision table describes the set as tunable: it keeps an LP and interpolates between nominal, Γ = 0, and box, Γ = n.

## Discrete problems

[Bertsimas and Sim (2004)](#ref-BS2004b) stress that, unlike the ellipsoidal approach, their robust counterpart is a linear optimisation problem, so the approach readily generalises to discrete optimisation; with integer variables it stays a mixed-integer programme, and the deterministic and probabilistic guarantees remain valid. They test it on a zero-one knapsack problem with uncertain weights.

[Bertsimas and Sim (2003)](#ref-BS2003a) carry the approach further, to robust discrete optimisation and network flows. In the panel the production plan is continuous, and the budgeted counterpart stays an LP.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BS2003a"></a>Bertsimas, D., & Sim, M. (2003). Robust Discrete Optimization and Network Flows. *Mathematical Programming* 98(1-3), 49-71. [doi:10.1007/s10107-003-0396-4](https://doi.org/10.1007/s10107-003-0396-4)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-Soy1973a"></a>Soyster, A. L. (1973). Convex Programming with Set-Inclusive Constraints and Applications to Inexact Linear Programming. *Operations Research* 21(5), 1154-1157. [doi:10.1287/opre.21.5.1154](https://doi.org/10.1287/opre.21.5.1154)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Polyhedral Uncertainty](polyhedral.md)
