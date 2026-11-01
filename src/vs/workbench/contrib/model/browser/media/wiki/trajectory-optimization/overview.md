# Trajectory Optimisation — Overview

A trajectory optimiser plans a whole motion in advance: how a system should move, and which controls produce that motion, from start to finish. Pendulum swing-ups, rocket ascents, robot arm motions and vehicle manoeuvres are all problems of this kind.

## Direct and Indirect: The Two Families of Trajectory Methods

Numerical methods for optimal control fall into two families ([Betts (1998)](#ref-Bet1998a)). A direct method turns the problem into a large nonlinear program over the discretised states and controls, and hands that program to a general solver. An indirect method first derives the conditions an optimum must satisfy, from the calculus of variations and Pontryagin's principle, and then solves those conditions numerically. Dynamic programming methods such as DDP form a third approach. They improve a trajectory by working backwards from the end along a local model of the cost-to-go.

## How the Four Tabs of Trajectory Optimisation Differ

The **Direct Methods** tab applies trapezoidal collocation and Ipopt, with bounds on the controls. The **Indirect Methods** tab solves for the states and costates by multiple shooting, with no bounds. The **DDP** tab repeats a backward pass and a forward rollout in iterative LQR form, and also returns feedback gains. The **ALTRO** tab wraps that same inner solver in an augmented Lagrangian loop, so that bounds on the controls can be enforced.

## Which Inputs Define a Trajectory Problem

**Dynamics f(x, u)** holds the equation of motion as Julia code, with x the state vector and u the control vector. **Initial State** and **Target State** give the two ends and set the number of states. **State Cost Q**, **Control Cost R** and **Terminal Cost Qf** set the balance of the cost, and the size of **Control Cost R** sets the number of controls. **Knot Points** and **Time Horizon** give the step dt = tf / (N − 1).

## Why a Planned Trajectory Is Only Part of a Controller

An optimal trajectory is open-loop: the controls were computed for one starting point and one exact model, and a real system will drift from the plan. Two remedies appear in the Next Steps. **Disturbance Rejection** and **Model Mismatch** compare the open-loop plan with a time-varying LQR controller that corrects deviations around the trajectory. **Replan from New State** solves the problem again from another start, which is the idea behind model predictive control ([Tassa, Erez and Todorov (2012)](#ref-TET2012a)).

## A Common Workflow for Trajectory Optimisation

1. Write the dynamics and set the two states, with large **Terminal Cost Qf** if the target must be reached.
2. Solve with one tab and read **State Trajectory** and **Control Trajectory**.
3. Confirm the solution with **Dynamics Feasibility** and **Solver Convergence**.
4. Check the grid with **Discretisation Accuracy**.
5. Read **Cost Breakdown** to see what the solution spends its cost on, and adjust the weights.
6. Test the plan with **Disturbance Rejection** and **Model Mismatch**.

## References

<a id="ref-Bet1998a"></a>Betts, J. T. (1998). Survey of numerical methods for trajectory optimization. *Journal of Guidance, Control, and Dynamics* 21(2), 193–207. [doi:10.2514/2.4231](https://doi.org/10.2514/2.4231)

<a id="ref-TET2012a"></a>Tassa, Y., Erez, T. and Todorov, E. (2012). Synthesis and stabilization of complex behaviors through online trajectory optimization. *2012 IEEE/RSJ International Conference on Intelligent Robots and Systems*, 4906–4913. [doi:10.1109/IROS.2012.6386025](https://doi.org/10.1109/IROS.2012.6386025)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
