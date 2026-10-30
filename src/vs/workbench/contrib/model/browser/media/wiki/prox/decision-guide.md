# Decision Guide

| Situation | Method |
|---|---|
| Smooth loss plus a penalty with a cheap prox | Accelerated proximal gradient (FISTA, in Compare with ProximalAlgorithms) |
| Two terms, both with cheap proximal maps | **Douglas-Rachford** |
| g(x) + h(K x), with K a linear operator | **Chambolle-Pock** |
| Only function values and subgradients; accuracy matters | **Bundle** |
| Only subgradients; a simple baseline | **Subgradient** |
| Proximal subproblem easier than the original | **Proximal Point** |

## Decision Flow

1. **Split F** into pieces with known proximal maps; ProximalOperators.jl lists many.
2. **If one piece is smooth**, use forward-backward (FISTA): it needs only its gradient.
3. **If both pieces are nonsmooth but proxable**, use Douglas-Rachford, or Chambolle-Pock when a linear operator stands between them.
4. **If no prox is available**, use a bundle method; subgradients only as a last resort.
5. **Check the prox-gradient residual** and the **Sparsity Pattern**.

## Rules of Thumb

- **Proximal beats subgradient**: on the panel's problem the splitting methods reach gaps of 1e-8 where the subgradient method stalls around 1e-2.
- **Measure optimality with the residual**, not with the iterate change.
- **Douglas-Rachford is robust to the step**; tune it for speed, not for convergence.
- **Chambolle-Pock needs tau sigma ||K||^2 < 1**; balance the two steps.
- **Choose the penalty weight by cross-validation** or an information criterion; the Lasso panel does it.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
