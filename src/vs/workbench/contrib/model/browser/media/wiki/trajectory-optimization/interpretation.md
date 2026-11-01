# Trajectory Optimisation — Interpretation

The output of a trajectory run is a plan, and most of what it shows follows from the weights chosen. Read it as the answer to the cost that was written, which may differ from the task that was meant.

## How to Read the State and Control Trajectories

**State Trajectory** shows the planned states over time, with the target values dashed. A final state away from its target is a result of the weights, not necessarily a failure: raise **Terminal Cost Qf** to make the target almost a hard constraint. **Control Trajectory** shows the control held over each interval. Controls resting at a limit for long stretches, known as a bang-bang pattern, are common when **Control Bound** binds, and they say that the system is working at its limit.

## How the Cost Weights Shape a Trajectory

The ratio of the weights matters more than their size, as scaling all three by the same factor leaves the solution unchanged. A larger **Control Cost R** gives gentler controls and slower arrival. A larger **State Cost Q** drives the state towards the target early in the motion, at the expense of control effort. A larger **Terminal Cost Qf** cares only about the final state, and leaves the path in between to whatever is cheapest. Because x − xf is penalised along the whole path, a large **State Cost Q** can discourage a motion that has to move away from the target first.

## How to Read the Cost Breakdown

**Cost Breakdown** splits the total cost into running state cost, control effort and terminal penalty. A dominant terminal penalty means the plan ends far from its target, so raise **Terminal Cost Qf** or lengthen **Time Horizon**. A dominant control effort means the task is expensive within the time allowed. Total costs can only be compared between runs with the same weights and the same **Knot Points**: a change of weight changes what the number measures, and the running cost is summed over the nodes without being scaled by the step.

## What Feedback Gains Tell About a Trajectory

**Feedback Gains** plots the size of the time-varying LQR gain along the trajectory. Large gains mark the moments when a deviation matters most and must be corrected strongly, such as balancing near an unstable point. Small gains mark stretches where an error can wait. Very large gains can exceed the real actuator's limits, so a plan with them may hold only in simulation. The DDP and ALTRO tabs compute comparable gains in their backward pass.

## What the Costate Means in the Indirect Method

The costates of the **Indirect Methods** tab are the sensitivity of the optimal cost to a small change in the state at each time. A large costate on a state means the cost reacts strongly to that state at that moment. Through the transversality condition, the final costate equals **Terminal Cost Qf** times the final error, so the two can be checked against each other.

## What Replanning from a New State Shows

**Replan from New State** solves again from a different start and compares the cost and terminal accuracy. A similar cost and motion suggest a plan that is robust to its starting point. A very different motion suggests that the problem has several local solutions close to each other, and that a plan from one start says little about another. Replanning repeatedly as the state evolves is the basis of model predictive control, provided that each solve finishes in time.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
