# Model-Based Methods: Decision Guide

The form of the constraints narrows the seven methods to two or three, then the size of the problem and the quality of the objective decide among those. Most problems with sensible bounds can start on **BOBYQA**.

## Which method fits these constraints?

| Limits on the variables | Start with | Alternative |
|---|---|---|
| None | **NEWUOA** | **UOBYQA** when n is small, **PRAXIS** for a contrast |
| Simple bounds | **BOBYQA** | **Sbplx** when f is rough |
| Linear inequalities, perhaps with bounds | **LINCOA** | **COBYLA** |
| Nonlinear inequalities | **COBYLA** | A penalty in **Objective f(x)**, with **BOBYQA** |
| Equalities | Substitute them into **Objective f(x)** | **Constrained Optimisation**, if derivatives exist |

A method that handles more does not do better on a simpler problem. **COBYLA** can treat bounds as constraints, but its linear models cost far more evaluations on a smooth objective than the quadratic models of **BOBYQA** do. Choose the narrowest method that covers the constraints.

## How does the number of variables change the choice?

| Number of variables | Sensible choices | Reason |
|---|---|---|
| Very few | **UOBYQA**, **BOBYQA**, **NEWUOA** | A full quadratic is affordable and accurate |
| A dozen or more | **BOBYQA**, **NEWUOA**, **LINCOA** | (n + 1)(n + 2) / 2 points get expensive |
| A few hundred | **NEWUOA** | Designed for that range, if f is cheap enough |
| Many, with rough f | **Sbplx** | Subspaces keep each simplex small |

The boundaries are soft, and **Method Comparison** tests them on the objective in hand. Plain Nelder-Mead appears in that comparison as a baseline, and the gap to **Sbplx** generally grows with n.

## Smooth, noisy or non-smooth?

**BOBYQA**, **NEWUOA**, **UOBYQA** and **LINCOA** suit smooth objectives best and gain from curvature. For mild noise, they can still work if the final radius stays above the noise scale, which takes an edit to `rhoend` in the code. For stronger noise or real kinks, move to **Sbplx**, which relies only on comparisons.

Methods for noisy and non-smooth objectives are reviewed by [Larson, Menickelly and Wild (2019)](#ref-LMW2019a). A check from the outside helps here: evaluate f twice at the same point, and at two points very close together, then compare the difference with the scale of f. That tells you which of these cases applies before any budget is spent.

## Should this problem be in another panel?

| Situation | Better place |
|---|---|
| Derivatives or automatic differentiation are available | **Quasi-Newton Methods** or **Constrained Optimisation** |
| Many local minima, evaluations cheap | **Global Optimisation** |
| Very few evaluations, each very costly | **Bayesian Optimisation** or **Surrogate-Based Optimisation** |
| Sum of squared residuals | **Nonlinear Least Squares Methods** |
| Pattern search or plain simplex wanted | **Direct Search Methods** |
| Integer or discrete variables | **Discrete and Combinatorial Optimisation** |

Any of the seven will run on a problem that belongs elsewhere and return something, so the cost of the wrong place is usually wasted evaluations or a poor answer, not an error message. Interpolation also cannot treat a discrete variable, because small steps in it have no meaning.

## How large should the Initial Radius be?

**Initial Radius** is the scale at which the first model is built. The tooltip's rule is roughly a tenth of the expected distance to the minimiser.

Too large, and the first model is fitted over a region where f is not close to quadratic, and the early evaluations teach little. Too small, and the run creeps, using many evaluations to cover the distance, with a first model dominated by rounding or noise. **BOBYQA** also needs each box side to be at least twice the radius. As the radius is one number for all variables, a problem where no single value suits them all needs rescaling first, as the [Assumptions](assumptions.md) wiki explains.

## How large should Max Evaluations be?

Start from the model's first set of points, then allow for the climb. The first set costs n + 1 evaluations on **COBYLA**, 2n + 1 on the partial-quadratic methods and (n + 1)(n + 2) / 2 on **UOBYQA**, and useful progress needs many times that.

Run **Budget Sweep** at a small dimension if the objective is cheap to try. The budget at which `minimum` stops improving, scaled up with n, gives a working estimate, and the data profiles of [Moré and Wild (2009)](#ref-MW2009a) are built on the same idea. When each evaluation is expensive, spend the budget in stages: a first run, a look at **Convergence Curve**, then **Warm Start** from the result instead of a fresh run with a higher limit.

## A sensible order of work

1. Pick the method from the constraints, and set **Initial Radius** from the problem's scale.
2. Run it, and read `status`, `violation` and the shape of **Convergence Curve**.
3. Confirm with **Convergence Check** and, on a constrained problem, **Constraint Check**.
4. Test the answer with **Warm Start**, then **Multi-Start** if the budget allows.
5. Use **Scaling Check** if progress was slow.
6. Try **Method Comparison** only when the choice of method still looks open.

Skipping to step 6 first can mislead, since an objective with a poor scale makes every method look bad, and the comparison then ranks them for the wrong reason.

## References

<a id="ref-LMW2019a"></a>Larson, J., Menickelly, M., & Wild, S. M. (2019). Derivative-Free Optimization Methods. *Acta Numerica* 28, 287-404. [doi:10.1017/S0962492919000060](https://doi.org/10.1017/S0962492919000060)

<a id="ref-MW2009a"></a>Moré, J. J., & Wild, S. M. (2009). Benchmarking Derivative-Free Optimization Algorithms. *SIAM Journal on Optimization* 20(1), 172-191. [doi:10.1137/080724083](https://doi.org/10.1137/080724083)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
