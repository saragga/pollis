# Optimal Control Diagnostics

A finished solve is not yet a correct answer to the continuous problem. The checks here separate solver failure, discretisation error and a mistaken model.

## Did the solver finish?

`status` should read `LOCALLY_SOLVED` with `Ipopt` or `OPTIMAL` with `HiGHS`. **Dynamics Residuals** repeats the termination status and adds `primal`, the status of the returned point.

An infeasibility status usually comes from the problem and not from the solver. Check that **T** is long enough for the target to be reachable under **Control Bound**, then check that **Initial State** and **Terminal State** have the right lengths and are consistent with the dynamics. An iteration limit points instead to scaling or to a difficult start, and values reported there should not be trusted. A problem that solves only with a large bound is often a sign the target is hard to reach within the horizon.

## How well is the ODE satisfied?

**Dynamics Residuals** compares the slope of `X` over each interval with the dynamics at the interval's midpoint and reports the largest gap as `max_ode_residual`. The check uses a different formula from most transcriptions, so a small non-zero value is normal even for a perfect solve.

The size of the gap should fall as **Supports** grows. If it stays large, the mesh is too coarse where the solution moves fastest. `initial_error` and `terminal_error` should be close to the solver's tolerance, since both are enforced as constraints, and a larger value means the solve did not really converge.

## Mesh refinement

**Mesh Refinement** solves at 10, 20, 50, 100 and 200 supports and prints the objective, status and seconds. A trustworthy result has objective values that settle, so the last two rows differ by little compared with what you care about.

The rate tells you about the method. With a first-order method such as Finite Difference (Backward), doubling the supports should roughly halve the error. On the default the exact cost is 1.5, so the error can be read directly. High-order collocation should settle much sooner, unless a jump in the control limits its accuracy. Solve time usually grows with supports, so stop refining once the change is below your need.

## Do the derivative methods agree?

**Compare Derivative Methods** solves with Collocation (3), Collocation (4), Backward FD and Central FD at the same support count. Agreement among all four is good evidence that the mesh is adequate.

Disagreement has a typical reading. If the two collocation rows agree and Backward FD is off, the first-order method is simply less accurate at this mesh. If Central FD differs sharply, inspect its control for a saw-tooth pattern, because central differences link each support to its two neighbours and skip the point itself, which can leave alternate supports weakly connected. Compare the trajectories and not only the cost: two methods can reach close costs through visibly different controls.

## Replaying the control

**Open-Loop Simulation** feeds `U`, linearly interpolated, into the dynamics with a 2,000-step RK4 integrator and reports `miss`, the distance from the target. A small miss says the plan really does steer the equations to the target when the integration is done accurately.

A large miss with small residuals points to an unstable system, where small errors grow, or to a control whose jumps do not suit linear interpolation. **Optimal Trajectory** draws the control as steps, whereas the replay joins the same values with straight lines, so a bang-bang control can show a larger miss for this reason alone. Rerun with more supports and see whether the miss shrinks.

## Costates against finite differences

**Initial-State Sensitivity** re-solves with each initial state raised by 0.01 and compares the cost change per unit, `finite_difference`, with `initial_condition_dual`. Theory says the two should match in size, so agreement is a strong independent check of the entire solve.

On the default both derivatives of the cost equal 3 at the initial state, by hand. With a step of 0.01 the finite differences are about 3.015 and 3.02, as the cost is quadratic in the initial state. Dual sign conventions depend on how a constraint is written and on the solver, so look at magnitudes first. A real mismatch in size suggests an unconverged solve, a non-smooth problem or a mesh that is too coarse.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
