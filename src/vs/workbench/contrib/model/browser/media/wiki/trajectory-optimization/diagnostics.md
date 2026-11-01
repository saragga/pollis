# Trajectory Optimisation — Diagnostics

A solver can report success and still return a plan that is of little use. These checks separate a converged run from a trajectory that the system could really follow.

## How to Read Solver Convergence in Each Trajectory Tab

**Solver Convergence** shows something different in each tab. The direct method reports the status of Ipopt, and only a locally optimal status counts as success. The indirect method reports the residual of the shooting equations, which should fall close to zero. DDP and ALTRO show the cost at each iterative LQR sweep, which should fall and flatten. A DDP run that stops at **Max Iterations** has not met its **Tolerance**, so raise the limit or look for a poorly scaled cost.

## How to Check That a Trajectory Obeys the Dynamics

**Dynamics Feasibility** rolls the optimal controls through the RK4 model and compares the result with the planned states. For the direct method, the gap includes the collocation defects: trapezoidal collocation and RK4 are different integrators, so a large gap suggests a grid that is too coarse. In DDP and ALTRO the states come from a rollout, and so the gap should be very small. In the indirect method it measures the difference between the control that changes within each step of the shooting and the same control held over the interval. A gap that grows with time is a warning, as errors in an open-loop plan accumulate.

## How to Tell Whether the Knot Points Are Enough

**Discretisation Accuracy** integrates the same piecewise-constant controls with 1, 4 and 16 RK4 sub-steps per interval. A final state that barely moves means the grid resolves the dynamics. A final state that changes shows that **Knot Points** is too low, or **Time Horizon** too long for that number of nodes. A second check is to solve with double the number of nodes and compare the final states and the shape of the controls. Compare no total costs here, as the running cost is a sum over the nodes and grows with their number.

## Why a Trajectory Solver Fails to Converge

A failing direct run often comes from the straight-line initial guess, when the true motion is far from a line, as in a swing-up. Failure of the indirect tab is often a matter of costate initial guesses, since the costates start from zero and the equations are very sensitive. DDP and ALTRO fail through a line search that finds no decrease, which raises the regularisation until the steps become too small. Weights that differ by many orders of magnitude worsen all of these. Rescale **State Cost Q** and **Control Cost R** first, and reduce **Time Horizon** to reach an easier problem.

## How to Detect a Poor Local Solution

Run the same problem in another tab, or from a nearby **Initial State** with **Replan from New State**, and compare the costs. A clearly cheaper result elsewhere shows that the first run stopped at a poor local optimum. Small differences in cost between tabs are expected, as the tabs discretise differently. Equal costs do not prove global optimality, though they do raise confidence.

## How to Test a Plan Against Disturbances and Model Error

**Disturbance Rejection** runs the plan under random state disturbances, with open-loop controls against time-varying LQR feedback. **Model Mismatch** does the same on dynamics with every derivative scaled. An open-loop plan that diverges is normal on an unstable system, and the question is whether the feedback version stays close. Feedback that also diverges means the deviations have left the region where the linear model around the trajectory holds, so the plan needs replanning or a slower motion.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
