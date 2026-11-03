# Uncertainty-Set Robust Optimisation: Polyhedral Uncertainty

**Polyhedral** uncertainty describes the set of deviations by linear inequalities, W u ≤ h, and turns the worst case of each constraint into a linear programme whose dual makes the robust counterpart an LP. The panel's polytope is the ball ‖u‖₁ ≤ Γ.

## The general route

For row i with deviations dⱼ = âᵢⱼ xⱼ, the robust constraint is

a⁰ᵢᵀx + max {dᵀu : W u ≤ h} ≤ bᵢ.

The inner maximum is a linear programme in u. When it is feasible and bounded, the duality theorem of linear programming, in [Bertsimas and Tsitsiklis (1997)](#ref-BT1997a), gives it the same value as the dual

min {hᵀλ : Wᵀλ = d, λ ≥ 0}.

The constraint therefore holds for all u in the polytope exactly when some λ ≥ 0 satisfies Wᵀλ = d and a⁰ᵢᵀx + hᵀλ ≤ bᵢ, a system linear in x and λ together.

## The theorem of Ben-Tal, El Ghaoui and Nemirovski

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) prove the general form: for a perturbation set given by a conic representation, the robust counterpart of an uncertain linear inequality is a system of conic inequalities in the decision variables and in a vector of dual variables, obtained by conic duality. For a polyhedral set, the cone is the nonnegative orthant and the usual linear programming duality theorem yields the same conclusion, with no strict feasibility condition.

As a corollary, they state that the robust counterpart of an uncertain linear inequality with a polyhedral perturbation set admits an equivalent reformulation as an explicit system of linear inequalities.

## The panel's polytope

The panel writes the cross-polytope ‖u‖₁ ≤ Γ with one inequality sᵀu ≤ Γ for every sign vector s ∈ {−1, 1}ⁿ, so that W has 2ⁿ rows and h = Γ 1. Each constraint receives 2ⁿ dual variables λ ≥ 0, with Wᵀλ = d and the robust constraint a⁰ᵢᵀx + Γ Σₖ λₖ ≤ bᵢ.

For x ≥ 0, the worst case over the cross-polytope puts the whole budget on the largest deviation, so the protection is Γ maxⱼ âᵢⱼ xⱼ; the function `protect` in the code uses this value for **Worst-Case Scenario** and **Conservatism Analysis**.

## Relation to the budgeted set

The budgeted set adds the bounds ‖u‖∞ ≤ 1 to the same ‖u‖₁ ≤ Γ. For Γ ≤ 1, ‖u‖₁ ≤ Γ already implies ‖u‖∞ ≤ 1, so the two sets coincide; the panel's decision row states that the polyhedral set equals the budgeted set for Γ ≤ 1 and is not clipped to the box beyond.

For Γ > 1, a single coefficient may move Γ times its range, as the comment in the code notes, and the robust plan protects against deviations larger than any simulated draw. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) derive the budgeted set as the intersection of the two balls and obtain its own linear representation.

## In the panel

**Price of Robustness** on the **Polyhedral** tab solves the counterpart for Γ from 0 to n in steps of 0.25 and plots the profit and the simulated probability of violation. **All Sets vs Nominal** sets the polyhedral plan beside the budgeted one at the same Γ.

The panel's decision table calls the polyhedral set the general LP-duality route, for any uncertainty set described by linear inequalities. Any other polytope leads to the same construction, with one dual variable per inequality of W u ≤ h.

## Solving the LP

The robust counterpart is an LP with n + 2ⁿ × m variables for m constraints, solved by HiGHS. HiGHS is cited through [Huangfu and Hall (2018)](#ref-HH2018a), who describe two parallel dual simplex solvers for general large-scale sparse linear programming problems.

JuMP, by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), builds the constraints Wᵀλ = d and the robust inequality directly from the matrix W, in the same algebraic syntax as the other sets.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BT1997a"></a>Bertsimas, D., & Tsitsiklis, J. N. (1997). *Introduction to Linear Optimization*. Athena Scientific. [athenasc.com](http://www.athenasc.com/linoptbook.html)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md)
