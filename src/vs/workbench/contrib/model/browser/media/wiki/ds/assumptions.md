# Assumptions

## Function Values Only
The methods need only f(x), but they need it to be **deterministic**, or nearly so: they compare values, and noise larger than the differences being compared misleads them. Small noise is tolerated; **Noisy Objective** shows how far the solution moves.

## Continuity and Local Structure
- **Pattern search and GSS** converge to a stationary point when f is **continuously differentiable**, even though they never use the gradient; for non-smooth f they can stall at a kink where no compass direction improves, though a descent direction exists between them.
- **MADS** converges to a **Clarke-stationary** point under the weaker assumption that f is **Lipschitz** near the solution: its poll directions become dense, so every direction is eventually tried.
- **Nelder-Mead** has no general convergence guarantee: it can stall at a non-stationary point, even on smooth functions (McKinnon, 1998).

## Low Dimension
The poll methods use n + 1 to 2n evaluations per iteration, and the convergence slows as n grows. Direct search is practical up to ten or twenty variables; beyond that, model-based methods or gradients are needed.

## A Sensible Scale
The **Initial Step** should be of the order of a tenth of the expected distance to the solution. All coordinates are polled with the same step, so variables on very different scales should be rescaled first, or the method effectively searches in one direction only.

## Local Minima
Every method here finds a local minimum near its start. **Restart Sensitivity** solves from 10 random starts to show whether there are several.

## Unconstrained
The panel's problems are unconstrained. DirectSearch.jl and pattern search in general handle bounds and constraints by extreme barriers (infeasible points get the value Inf) or progressive barriers.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
