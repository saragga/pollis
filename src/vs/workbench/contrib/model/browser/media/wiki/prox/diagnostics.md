# Diagnostics

## Convergence Curve
The **Convergence Curve** plots the gap F(x_k) - F* on a log scale, with the running best. Proximal splitting methods show a steady, often linear decline on this well-conditioned problem; the subgradient method a slow, jagged one, O(1 / sqrt(k)), whose running best is what matters.

## Optimality Residual
The **Optimality Residual** plots the **prox-gradient residual**, L ||x - prox(x - grad loss(x) / L)||, which is zero exactly when 0 lies in the subdifferential of F: a certificate of optimality that does not need F*. It is the most reliable stopping measure.

## Iterate Change
The **Iterate Change** plots ||x_k+1 - x_k||, a common stopping rule. Small changes do not prove optimality: the subgradient method's diminishing steps make it small however far from the optimum.

## Optimality Check
The **Optimality Check** reports the objective, the reference F*, the gap, the prox-gradient residual, and whether 0 is in the subdifferential within a relative tolerance of 1e-4.

## Step Size Sensitivity
**Step Size Sensitivity** reruns with steps from a tenth to ten times the chosen one, reporting the gap and residual. Douglas-Rachford and Proximal Point converge for any step, but their speed varies; Chambolle-Pock trades the primal step against the dual one; the subgradient method is sensitive in both directions.

## Descent Check
The **Descent Check** counts how often the objective rose between iterations, the largest rise and the last improvement. The subgradient method and the primal-dual and splitting methods are **not descent methods**: increases are normal. The bundle method's centre and the proximal point method's iterates decrease monotonically.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Gap | Below 1e-6 | Flat at a high level |
| Prox-gradient residual | Falls steadily to near 0 | Stalls |
| Zero in subdifferential | true | false |
| Step sensitivity | Similar gaps over a range | Gap explodes away from one value |
| Sparsity | Support matches the truth | Many false positives or misses |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
