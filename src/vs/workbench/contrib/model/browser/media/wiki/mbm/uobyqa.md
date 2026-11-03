# UOBYQA

Unconstrained Optimisation BY Quadratic Approximation, from [Powell (2002)](#ref-Pow2002a), fits a complete quadratic to enough points to determine every coefficient. On a small smooth problem, that model is as informative as a quadratic can be.

## What problem does UOBYQA solve?

**UOBYQA** minimises f(x) with no limits on x, and is meant for a small number of variables. The panel calls `uobyqa(fr, x0; maxfun, rhobeg, rhoend=1e-8)`, from the package of [Zhang (2023)](#ref-Zha2023a).

The box serves only **Multi-Start** and the charts. As on **NEWUOA**, the minimiser may lie outside it, and `violation` reads 0.0 regardless. Choose this method when the box does not matter and n is small enough to pay for the first model.

## Why does it need so many points?

A quadratic in n variables has 1 constant, n slopes and n(n + 1) / 2 distinct second derivatives. Together they make (n + 1)(n + 2) / 2 coefficients, and the same number of well-placed points fixes them uniquely.

| n | Points in the model |
|---|---|
| 2 | 6 |
| 5 | 21 |
| 10 | 66 |
| 20 | 231 |

The first model cannot be formed until all of these have been evaluated, so at high n the initial set alone can consume the budget. Each iteration then requires work of order n⁴ to maintain the model, a cost that matters when f is cheap, and that **Method Comparison** shows in `seconds`.

## How one iteration works

The model is kept in terms of Lagrange functions, one per point. Each equals 1 at its own point and 0 at all others, so the size of a Lagrange function at a candidate point shows how well that candidate would replace the existing one.

1. Minimise the quadratic within a ball of radius delta around the best point.
2. Evaluate f at the trial point, compare the reductions, and adjust delta.
3. Choose the point to drop, using the Lagrange functions, and update the model.
4. If the set has grown unbalanced, replace a far-off point with one chosen to improve its geometry.
5. When nothing further can be done at this scale, reduce rho towards `rhoend`.

A general account of why such geometry matters is in [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a).

## Where a full model pays off

Near the minimum of a smooth function, a quadratic can be very accurate, so a fully determined model delivers fast local progress with few evaluations once the first set has been paid for. Problems with strong interaction between variables benefit most, as those interactions appear from the first model.

The partial models in **NEWUOA** learn the same interactions slowly, over many iterations, while a full model has them at once. At a small n the extra points add little to the cost, so **UOBYQA** is a natural choice there when **Max Evaluations** is well above the initial count. Choose by trying: **Method Comparison** runs both side by side from the same start and budget.

## When to choose something else

| Condition | Why **UOBYQA** struggles | Alternative |
|---|---|---|
| n in the tens or more | Too many initial evaluations, arithmetic of order n⁴ | **NEWUOA** |
| A limited budget | The first model consumes it | **NEWUOA**, **BOBYQA** |
| Bounds that matter | No constraints handled | **BOBYQA** |
| Noise | A full model fits more of the noise | **Sbplx**, or a higher `rhoend` |

Noise does particular harm to the many second-derivative coefficients, as these rest on small differences between values.

## Reading a UOBYQA run

**Query Scatter** shows the initial set clearly: besides the steps along each axis, it has points displaced along pairs of axes, which give the off-diagonal curvature. In a run with n above 2, many of them overlap on a chart of the first two variables.

**Budget Sweep** can show almost no progress at small budgets, as the rows below the initial count have no model to work with. That is the cost of the method and no sign of failure. The `reduced_hessian_eigenvalues` in **Scaling Check** are a useful cross-check, since a model that fits well implies positive curvature at the minimiser.

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Pow2002a"></a>Powell, M. J. D. (2002). UOBYQA: Unconstrained Optimisation by Quadratic Approximation. *Mathematical Programming* 92(3), 555-582. [doi:10.1007/s101070100290](https://doi.org/10.1007/s101070100290)

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
