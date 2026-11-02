# Optimal Control Assumptions

A transcribed control problem has limits set by its form, by the discretisation and by the solver. These conditions decide when its output answers the continuous problem you meant to pose.

## A fixed horizon and fixed end points

The panel's form holds T constant and imposes **Terminal State** as an equality on every state. A free final time needs a change of model, typically by making T a variable and rescaling time, and a minimum-time question cannot be typed directly into **T**. A free or partly free terminal state likewise needs an edit of the code.

States carry no bounds, and only the controls have them, through a single symmetric **Control Bound**. A speed limit, or a control that may run only in one direction, must be written into the code as an added constraint.

## A problem that has a solution

Fixed end points and bounded controls can make the problem infeasible. The default shows how. Moving a unit distance from rest to rest at acceleration limit a takes at least 2√(1/a) in time, by accelerating for half the time and braking for the other half. With a = 5 that is about 0.894, so **T** below that value has no solution.

Reducing **T** towards the limit first makes the bound active: the unbounded optimum needs |u| = 6 / T², which exceeds 5 once T falls below about 1.095. No discretisation can rescue an infeasible problem, and a coarse mesh can occasionally hide or create infeasibility near the limit.

## Smooth functions for the solver

`Ipopt` uses first and second derivatives, so **Dynamics dx/dt** and **Running Cost f(x, u, t)** need to be smooth in `x` and `u`. Absolute values, `max` and if-else branches break that, and the solver can then stall or return a poor point. A smooth approximation, or a reformulation with added variables, is the usual fix.

`Ipopt` also finds local optima only. A linear ODE with a convex cost, as in the default, has one optimum. Nonlinear dynamics can have several, and a result then depends on the solver's starting point. `HiGHS` needs a linear ODE and a convex quadratic cost, and it will reject anything else, so nonlinear inputs require `Ipopt`.

## A mesh fine enough for the solution

The transcription approximates the true trajectories by values at supports, and it treats their behaviour between supports as smooth. Fast dynamics, a control switch or a boundary layer call for points close together, and a uniform grid may place too few of them there.

**Mesh Refinement** tests the size of the grid but not its layout. A bang-bang control has jumps that a fixed grid cannot place exactly, so high-order accuracy falls away near each switch ([Kelly (2017)](#ref-Kel2017a)). The time of a switch is then known only to about one grid interval.

## A model of the real system

An answer is optimal for the equations typed in. Any gap between those and the real system stays out of view, because the output is a fixed time-plan. **Open-Loop Simulation** applies the plan to the same equations, so its `miss` measures numerical error, not model error.

An unstable system magnifies this. For x' = x + u, an early error grows by e^T over the horizon, so a plan that looks exact on paper may miss badly in practice. Feedback, for example by re-solving from each measured state as in model predictive control, is what handles that gap.

## References

<a id="ref-Kel2017a"></a>Kelly, M. (2017). An Introduction to Trajectory Optimization: How to Do Your Own Direct Collocation. *SIAM Review* 59(4), 849-904. [doi:10.1137/16M1062569](https://doi.org/10.1137/16M1062569)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
