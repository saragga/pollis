# Interpretation

## Solution Summary
The **Solution Summary** gives the minimiser, the minimum, the value at the start, the improvement and the number of evaluations. On the default problem the minimum is at (1, -0.5) with f = 0.125. Direct search usually reaches a few digits of accuracy quickly and more digits slowly: when the minimiser is needed to many digits on a smooth problem, finish with a gradient method.

## Evaluation Budget
The **Evaluation Budget** gives the number of evaluations needed to come within 10%, 1%, 0.1% and 0.01% of the final improvement. Typically most of the improvement comes early and each further digit costs as much as the previous ones. When each evaluation is an expensive simulation, this table says how much accuracy a budget buys.

## Compare Methods
**Compare Methods** runs the selected method, Nelder-Mead from Optim.jl and OrthoMADS from DirectSearch.jl from the same start, with the minimum and the evaluations. Nelder-Mead usually uses the fewest evaluations on smooth, low-dimensional problems; MADS is more reliable on non-smooth ones like the default.

## vs Gradient-Based
**vs Gradient-Based** runs BFGS with automatic differentiation from the same start, with its function and gradient calls. On smooth problems BFGS needs far fewer evaluations; on the default non-smooth problem its line search can stall at a kink, giving a worse minimum. That contrast is the reason direct search exists.

## Evaluate at New Point
**Evaluate at New Point** gives f at another point, its increase over the minimum and its distance from the minimiser.

## What Direct Search Does Not Give
No gradient or Hessian at the solution, hence no curvature information, no standard errors and no sensitivity analysis. If those are needed and f is smooth enough, compute them afterwards by finite differences or automatic differentiation at the solution.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
