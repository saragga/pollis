# Partial Differential Equations — Diagnostics

A PDE solution has two separate sources of error. The **spatial** error comes from the grid spacing $h$. The **time** error comes from the solver tolerance. Tightening one does not reduce the other.

## Grid Convergence

Re-solve with $h$ halved. For second-order differences, the change should fall by about 4 each time. The **observed order** is

$$p \approx \frac{\log(e_{h} / e_{h/2})}{\log 2}.$$

| Observed order | Meaning |
|---|---|
| About 2 | Resolved and smooth: the grid is adequate |
| Well below 2 | A kink, a discontinuity, inconsistent boundary data, or a grid too coarse to be in the asymptotic range |
| Erratic | The time error is swamping the spatial error: tighten `reltol` |

## Exact-Solution Test

Run the same code on a problem with a known answer. Examples are a decaying sine mode for heat, a standing wave for the wave equation, and $u = \sin(\pi x/L)\sin(\pi y/L)$ for Poisson. This is the **method of manufactured solutions**: it verifies the discretisation itself, not just one run.

## Stiffness and Conditioning

- **Heat:** the discrete operator has decay rates from about $D(\pi/L)^2$ up to $4D/h^2$. Their ratio, the **stiffness ratio**, grows like $1/h^2$, so explicit solvers take steps bounded by $h^2/(2D)$ whatever the accuracy needed. Use FBDF, Rodas5P or the stabilised ROCK2.
- **Wave:** not stiff, but the step must be of order $h / c$.
- **Poisson:** the condition number of $A$ grows like $(2L/(\pi h))^2$. Conjugate gradients needs about $\tfrac12\sqrt{\kappa}\,\log(2/\text{tol})$ iterations, which doubles when $h$ halves.

## Conservation Checks

- **Heat** with no-flux or periodic boundaries and no reaction conserves $\int u\,dx$. A drift reveals a bug in the boundary treatment.
- **Wave** conserves energy $\tfrac12\int (u_t^2 + c^2 u_x^2)\,dx$. A steady fall is numerical damping, typical of implicit solvers or loose tolerances.
- **Poisson:** the total source must leave through the boundary.

## Solver Warnings

A `MaxIters` return code on the heat equation almost always means an explicit solver on a stiff problem. On the wave equation, a growing amplitude means the solver tolerance is too loose.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
