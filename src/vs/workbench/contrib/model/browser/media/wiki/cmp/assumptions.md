# Assumptions

Most complementarity methods rely on smoothness and regularity. Existence and uniqueness depend on the map, and the economic reading rests on a correct pairing of variables with conditions.

## What Smoothness Assumes

PATH needs the Jacobian of F at each iterate, and JuMP supplies it by automatic differentiation of the expressions in **Operator F(x)**. The map should be continuously differentiable near the solution. A map with kinks, such as an `abs` or a `max` inside F, may confuse the local model. Discontinuous maps are outside the setting altogether. [Facchinei and Pang (2003)](#ref-FP2003a) state the formal conditions. Where the map has a pole, or a domain limit such as a logarithm, keep iterates in the region through bounds.

## What a Solution's Existence Depends On

Nothing guarantees a solution for a general map. A monotone map with a strictly feasible point has a solution, and finite bounds on every variable give existence for continuous F. With no such structure, PATH can only fail, without any certificate that no solution exists. Ill-posed models often show up as repeated failures across starts. Failure of the solver is then evidence, not proof, of non-existence.

## What Uniqueness Depends On

A strongly monotone map, or a P-matrix in the affine case, gives a single solution, as [Cottle, Pang and Stone (1992)](#ref-CPS1992a) prove for the linear form. Without those properties, several solutions can exist, and the default nonlinear map is an example. A solver returns one of them, depending on the start. **Parametric Solve** can also jump between branches with warm starts. In a model of an economy, more than one solution means that the model does not settle which equilibrium holds.

## What Regularity Assumes

Fast local convergence requires regularity at the solution, a condition that holds when a suitable active block of the Jacobian is nonsingular. Degeneracy, in which x_i and F_i are both at zero, makes regularity harder to meet, and the regime of that pair is ambiguous. The default **Nonlinear Complementarity** problem has one such solution, on purpose. Results near a degenerate point can be sensitive, and local slopes can differ between shifts up and shifts down.

## What the Pairing Assumes

The form says each variable has one partner condition. In a market, a price pairs with excess supply, and an activity pairs with unit profit. Swapping partners, or using a wrong sign, can give a model that solves with no error and with no meaning. **Dual Interpretation** helps to read the regimes, but does not know what the economic meaning should be. Only the model author can check this, by tracing each pair back to its condition.

## What the Numerical Tolerances Assume

`tol = 1e-6` in the checks treats anything smaller as zero, so badly scaled problems can pass or fail for scale reasons alone. A map with values near 1e6 has a large residual even when very near a solution, and one with values near 1e-6 looks solved everywhere. Scale units so that F and x have similar sizes. The `residual` is also absolute, so that a comparison across models needs care. Rounding `x` to six digits in the printout hides any finer detail.

## References

<a id="ref-CPS1992a"></a>Cottle, R. W., Pang, J.-S. and Stone, R. E. (1992). *The Linear Complementarity Problem*. SIAM. [doi:10.1137/1.9780898719000](https://doi.org/10.1137/1.9780898719000)

<a id="ref-FP2003a"></a>Facchinei, F. and Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems*, Vols I and II. Springer.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
