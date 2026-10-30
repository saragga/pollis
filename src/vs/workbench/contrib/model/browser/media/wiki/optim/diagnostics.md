# Diagnostics

## Convergence Trace
The **Convergence Trace** plots f(x_k) - f* against the iteration on a log scale. Newton's method shows a curve that **plunges** near the end (quadratic convergence); BFGS and L-BFGS, a curve that bends downward (superlinear); gradient descent and conjugate gradient on an ill-conditioned problem, a straight line (linear convergence, a constant ratio per step); Nelder-Mead, a slow, irregular descent. A plateau means the method is stuck.

## Contour + Path
For two-variable problems, the **Contour + Path** draws the iterates on the contours of f; with more variables, the others are held at the optimum. For Nelder-Mead it follows the centroid of the simplex. It shows whether the path follows the valley or zigzags across it, as gradient descent does in the Rosenbrock valley.

## Convergence Check
The **Convergence Check** reports the overall flag and its three parts: **x_converged** (the step became tiny), **f_converged** (f stopped changing) and **g_converged** (the gradient became tiny, the only one that says the point is stationary), with the iterations, the function and gradient calls, and the gradient norm at the solution by automatic differentiation. Optim stops by default after 1000 iterations; reaching the limit is not convergence. Simulated Annealing and Particle Swarm have no stopping test of their own and run to the limit, so their flag says little: judge them by the trace and the gradient norm.

## Gradient Check
The **Gradient Check** compares the automatic-differentiation gradient with a central finite-difference one, at x0 and at the solution. Differences of about 1e-10 relative to the gradient are normal on a smooth, well-scaled f; large ones point to a kink, a discontinuity or a branch in f near that point.

## Failures and What They Mean
- **Line search failure**: f is not smooth, or the gradient is inaccurate; check the gradient, or try Nelder-Mead.
- **Iteration limit reached**: a badly scaled or flat problem, or a non-smooth one; look at the trace before raising the limit.
- **NaN or Inf**: the iterates left the domain of f (a log of a negative number); reparametrise (optimise log sigma, not sigma), or bound the variable.
- **Different minima from Multi-Start**: f has several basins; the result depends on x0.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Convergence flag | Converged, with g_converged true | Iteration limit reached |
| Gradient norm at the solution | Near zero (unconstrained) | Far from zero, no bound active |
| Gradient check | Small relative differences | Large differences |
| Trace | Steady descent to a floor | Plateau or oscillation |
| Multi-Start | Same minimum from most starts | Many different minima |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
