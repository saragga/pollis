# Uncertainty-Set Robust Optimisation: Box Uncertainty

**Box** uncertainty lets every uncertain coefficient take any value in its interval, independently of the others, and protects each constraint against all of them at their worst at once. The formulation goes back to [Soyster (1973)](#ref-Soy1973a).

## The set

For row i, the coefficients are aᵢⱼ = a⁰ᵢⱼ + âᵢⱼ uⱼ with

𝒰 = {u : ‖u‖∞ ≤ 1}, that is −1 ≤ uⱼ ≤ 1 for every j.

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) call this the case of interval uncertainty, and normalise the perturbation set to the unit box. Each coefficient ranges over [a⁰ᵢⱼ − âᵢⱼ, a⁰ᵢⱼ + âᵢⱼ], with âᵢⱼ = ρ ∣a⁰ᵢⱼ∣ set by **Relative Deviation (rho)**.

## The robust counterpart

The worst case of row i over the box is reached with every uⱼ at the sign of xⱼ, so the robust constraint is

a⁰ᵢᵀx + Σⱼ âᵢⱼ ∣xⱼ∣ ≤ bᵢ.

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) write the same constraint as a sum of absolute values and represent it by a system of linear inequalities with one auxiliary variable per perturbation. [Bertsimas and Sim (2004)](#ref-BS2004b) give the formulation of [Soyster (1973)](#ref-Soy1973a) in the form Σⱼ aᵢⱼxⱼ + Σⱼ âᵢⱼ yⱼ ≤ bᵢ with −yⱼ ≤ xⱼ ≤ yⱼ, where the second sum is the protection of the constraint.

The panel's plan satisfies x ≥ 0, so ∣xⱼ∣ = xⱼ and the constraint is the single linear inequality a⁰ᵢᵀx + Σⱼ âᵢⱼ xⱼ ≤ bᵢ, solved with HiGHS, by [Huangfu and Hall (2018)](#ref-HH2018a).

## The original formulation

[Soyster (1973)](#ref-Soy1973a) formulates a convex programme in which the feasible region is defined by set containment: given convex activity sets Kⱼ and a convex resource set K, a plan x is feasible when the combination x₁K₁ + … + xₙKₙ lies in K, and the problem is to maximise c · x over such plans. When the resource set has a special form, the problem is solved by an auxiliary linear programme, with an application to inexact linear programming.

[Bertsimas and Sim (2004)](#ref-BS2004b) note that [Soyster (1973)](#ref-Soy1973a) considers columnwise uncertainty, each column of the matrix varying in its own convex set, and write his robust formulation for interval coefficients in the form of the previous section.

## Protection and probability

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) observe that, when the deviations are random and confined to their intervals, every solution of the box robust counterpart is feasible with probability 1, which they call 100% immunisation against perturbations. In the panel, **Violation Probability** returns 0 for the robust plan of the **Box** tab, since every simulated coefficient lies in its interval.

## Price of Robustness on the Box tab

The box has no size parameter besides ρ, so **Price of Robustness** varies the fraction of the deviation that is protected, from 0 to 1 in steps of 0.1: the robust counterpart is solved with the deviations k âᵢⱼ, while the simulated coefficients keep the full range of ρ.

The fraction 0 gives the nominal plan, the fraction 1 the box plan. The two plots show the profit and the simulated probability of violation along the way.

## When to use it

The panel's decision table suggests **Box** when every coefficient may independently take its worst value, and calls it the simplest and most conservative set. Its robust counterpart is an LP with every deviation added in full, the same size as the nominal problem.

**Conservatism Analysis** reports the box protection of the current plan in every tab, so the protection of the other sets can be read against it.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-Soy1973a"></a>Soyster, A. L. (1973). Convex Programming with Set-Inclusive Constraints and Applications to Inexact Linear Programming. *Operations Research* 21(5), 1154-1157. [doi:10.1287/opre.21.5.1154](https://doi.org/10.1287/opre.21.5.1154)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
