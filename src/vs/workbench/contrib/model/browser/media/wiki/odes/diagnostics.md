# Ordinary Differential Equations — Diagnostics

## Return Code

`sol.retcode` should be `Success`. Other codes:

| Code | Meaning | What to do |
|---|---|---|
| `MaxIters` | Too many steps | Stiffness (switch to Rodas5P) or a very long time span |
| `DtLessThanMin` | The step size collapsed | A blow-up or a discontinuity in $f$ |
| `Unstable` | The solution became `NaN` or infinite | Blow-up, or an explicit solver on a stiff problem |

## Step Sizes and Stiffness

The **Step Sizes and Stiffness** action plots the steps the solver chose. Healthy behaviour: small steps where the solution changes fast, large steps where it is smooth. Warning signs:

- **Steps stay tiny while the solution is flat.** This is the signature of stiffness. The Jacobian eigenvalues confirm it: a **stiffness ratio**, the largest decay rate divided by the smallest, in the thousands or more.
- **Many rejected steps.** The tolerance is too tight for the method, or $f$ has a discontinuity.

An explicit method is stable only for steps below about $2.8 / \max|\lambda|$; compare that with the time scale of the solution.

## Residual Check

A numerical solution should satisfy the equation. The **defect** $\|\hat y'(t) - f(t, \hat y(t))\|$ measures how far the computed curve's slope is from the right-hand side. Comparing against a Vern9 solution at tolerance $10^{-12}$ gives the actual error. The error should be of the order of the tolerance times the size of the solution.

## Convergence

- **Tighten the tolerance** by a factor of 100. If the answer changes by much more than the tolerance, the first solve was not accurate.
- **Work-precision diagram.** On a log-log plot of error against function evaluations, a method of order $p$ gives a line of slope $-p$ in the fixed-step case. Euler has slope $-1$ and RK4 slope $-4$. A flatter line means the equation is not smooth enough for the method's order.

## Sensitivity

Perturbing the initial state by 1% and re-solving shows whether small errors shrink (a stable system: forecasts are reliable) or grow (an unstable or chaotic system: the long-run individual path is not meaningful).

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
