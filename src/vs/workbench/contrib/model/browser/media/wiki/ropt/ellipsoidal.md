# Uncertainty-Set Robust Optimisation: Ellipsoidal Uncertainty

**Ellipsoidal** uncertainty confines the scaled deviations of each row to a ball of radius ω, so that they cannot all be extreme at once. The robust counterpart is a second-order cone programme, the setting of [Ben-Tal and Nemirovski (1998)](#ref-BN1998a).

## The set

For row i, the coefficients are aᵢ = a⁰ᵢ + diag(âᵢ) u with

𝒰 = {u : ‖u‖₂ ≤ ω}

and ω the **Ellipsoid Radius (omega)**. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) normalise ellipsoidal uncertainty to the ball of radius Ω centred at the origin, which is the panel's set with Ω = ω.

The ball of radius 1 lies inside the unit box, and the ball of radius √n contains it, n being the number of products, as the tooltip of **Ellipsoid Radius (omega)** says.

## The robust counterpart

The largest value of Σⱼ âᵢⱼ uⱼ xⱼ over the ball is ω times the Euclidean norm of the vector (âᵢⱼ xⱼ)ⱼ, so the robust constraint is

a⁰ᵢᵀx + ω ‖(âᵢⱼ xⱼ)ⱼ‖₂ ≤ bᵢ.

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) derive this conic quadratic inequality for a ball of perturbations. The panel writes it as the second-order cone constraint [bᵢ − a⁰ᵢᵀx; ω (âᵢⱼ xⱼ)ⱼ] ∈ SOC, which JuMP, by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), passes to Clarabel.

## Clarabel

The second-order cone programme is solved by Clarabel, the solver of [Goulart and Chen (2024)](#ref-GC2024a): a general-purpose interior-point method for convex problems with conic constraints, based on a homogeneous embedding and specialised to problems with quadratic objectives. The panel's objective is linear, a special case.

The other sets of the panel lead to LPs, solved by HiGHS; Clarabel is used only on the **Ellipsoidal** tab.

## Robust convex optimisation

[Ben-Tal and Nemirovski (1998)](#ref-BN1998a) lay the foundation of robust convex optimisation and show that, for an ellipsoidal uncertainty set, the robust counterparts of linear programming, quadratically constrained programming, semidefinite programming and others are either exactly or approximately tractable, solvable by efficient methods such as polynomial-time interior-point methods.

They argue for ellipsoids as uncertainty sets on two grounds: an ellipsoid has a simple parametric representation and is easily handled numerically, and, for stochastic data, probabilistic arguments often allow stochastic uncertainty to be replaced by an ellipsoidal deterministic one.

## The probabilistic guarantee

When the scaled deviations are independent, with mean 0 and bounded by 1 in absolute value, [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) show that a solution of the ball robust counterpart violates the constraint with probability at most exp(−Ω²/2). With Ω ≥ √(2 ln(1/ε)), the robust constraint is therefore a safe approximation of the chance constraint that holds with probability 1 − ε.

[Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) add that the unreliability exp(−Ω²/2) is less than 10⁻⁶ for Ω = 5.26, and less than 10⁻¹² for Ω = 7.44.

## In the panel

**Price of Robustness** on the **Ellipsoidal** tab solves the robust counterpart for ω from 0 to 3 in steps of 0.25 and plots the profit and the simulated probability of violation. At ω = 0 the robust plan is the nominal one.

The panel's decision table suggests **Ellipsoidal** when deviations are unlikely to be all extreme at once, protecting against a Euclidean ball of joint deviations. **Feasible Region** shows the curved boundary of the robust region that the norm term produces.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BN1998a"></a>Ben-Tal, A., & Nemirovski, A. (1998). Robust Convex Optimization. *Mathematics of Operations Research* 23(4), 769-805. [doi:10.1287/moor.23.4.769](https://doi.org/10.1287/moor.23.4.769)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
