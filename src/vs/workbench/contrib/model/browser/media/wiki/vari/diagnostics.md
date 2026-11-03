# Variational Inequalities: Diagnostics

The **Variational Inequalities** panel checks a solution in four ways: the natural residual, a direct test of the inequality, the gap function and, for the QVI, the steps of the iteration.

## Natural residual

The main code computes the natural residual

r(x) = ‖x − P_K(x − F(x))‖,

with P_K the projection onto the box, `clamp.(x .- F(x), lb, ub)`. The code comment calls it zero exactly at a solution, and the output reports it as `residual`.

**Residual Map** draws log₁₀ of the residual, plus 10⁻⁶, on a grid of 121 by 121 points over the first two coordinates, from the lower bounds minus one to the upper bounds plus one, with the other coordinates held at the solution. In the panel's words, solutions are exactly the zeros of this surface; the solution is marked in white.

## VI Residual

**VI Residual** reports the natural residual and checks the defining inequality directly. With the generator `MersenneTwister(1)`, it draws 10 000 random points y of K(x*), uniformly in each coordinate between the bounds, with an infinite bound replaced by x*_i ∓ 10 so that an unbounded box can be sampled, and computes the smallest value of F(x*)ᵀ(y − x*).

The field `holds` is true when that minimum is no lower than −10⁻⁸. For the VI, the set is the fixed box; for the QVI, the box at the solution.

## Gap Function

**Gap Function** evaluates

g(x) = max over y in K(x) of F(x)ᵀ(x − y),

which the panel's description calls non-negative on K(x) and zero exactly at a solution. On a box the maximum separates by coordinate: y_i sits at the bound towards which F_i pushes, the lower bound when F_i > 0 and the upper bound when F_i < 0.

The action compares the gap at the start point, `clamp.(zeros(n), K(0)...)`, with the gap at x*. Following the description, the gap is infinite when F pushes towards an infinite bound.

## Convergence Check

**Convergence Check**, an action of the QVI, plots the step length ‖x_{k+1} − x_k‖ on a logarithmic scale. The steps are those of the damped fixed-point loop that produced the solution, one VI solve each, so the plot shows how the iteration approached its fixed point.

The loop stops after 200 steps or when a step is shorter than 10⁻⁹, and `solved` is true when the last step is under 10⁻⁶. The VI needs no such check: PATH solves it in a single call, and `solved` reports the termination status of that call.

## The solver's report

For the VI, `solved` comes from the termination status of PATH, `LOCALLY_SOLVED`, and the code keeps `raw_status(m)`, the solver's own message, in the result of `solve_vi`. The PATHSolver.jl README shows the same status for its linear complementarity example.

[Dirkse and Ferris (1995)](#ref-DF1995a) describe the stabilisation scheme of PATH: a pathsearch along a piecewise linear path to the Newton point, with a non-monotone step acceptance criterion.

## Operator Field

**Operator Field** draws −F on an 11 by 11 grid over K(x*) in the first two coordinates, with the others fixed at the solution, and marks x* in red. The description states the condition to look for: at x* every arrow pointing into K has been stopped by a bound.

The arrows are scaled so that the longest is 8% of the width of the box in x1. In the complementarity terms of the JuMP documentation, −F_i can point outwards only at a bound: −F_i ≥ 0 at the upper bound and −F_i ≤ 0 at the lower bound, with F_i = 0 in between.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Variational Inequality (VI)](vi.md) · [Quasi-Variational Inequality (QVI)](qvi.md)
