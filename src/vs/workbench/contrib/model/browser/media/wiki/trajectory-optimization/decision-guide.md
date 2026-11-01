# Trajectory Optimisation — Decision Guide

The two questions that decide most cases are whether the controls have limits, and whether feedback gains are wanted from the same computation. Accuracy, speed and the quality of the starting guess come after those.

## Which Trajectory Method Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Controls have limits, and a robust first answer is wanted | **Direct Methods** | Ipopt takes bounds directly, and the states need not obey the dynamics until convergence |
| Smooth, unbounded problem, with high accuracy wanted | **Indirect Methods** | Solves the optimality conditions themselves |
| No limits, with feedback gains wanted | **DDP** | Each iteration is cheap, and the backward pass returns gains |
| Controls have limits, with the speed of iterative LQR wanted | **ALTRO** | Prices the limits around the same inner solver |
| Dynamics are nonlinear in u | **Direct Methods** or **DDP** | The indirect tab's closed-form control needs control-affine dynamics |

## How the Trajectory Methods Compare

| Property | Direct Methods | Indirect Methods | DDP | ALTRO |
|---|---|---|---|---|
| **Decision variables** | States and controls | Costate at the start, and state and costate at 4 interior nodes | Controls | Controls and multipliers |
| **Dynamics held at each iteration** | Only at convergence | Only at convergence | Always, by rollout | Always, by rollout |
| **Control bound** | Yes | No | No | Yes, approached by penalty |
| **Sensitivity to the starting guess** | Moderate | High | Moderate | Moderate |
| **Main software** | Ipopt.jl and JuMP.jl | NLsolve.jl | Written in the panel | Written in the panel |

## How to Choose Knot Points and a Time Horizon

**Knot Points** should resolve the fastest motion expected, so start from the default and use **Discretisation Accuracy** to check it. The cost of a direct solve grows with the number of nodes, since every node adds states and controls to the program. Each step of the running cost is weighted by its length dt, so more nodes leave the balance against **Terminal Cost Qf** as it was. A longer **Time Horizon** can make a problem feasible under a tight **Control Bound**, as the system has more time to build up. **Time Horizon** should be long enough for the task, and comparing costs over a few values is the way to find it here.

## How to Choose the Cost Weights

Start with diagonal matrices, and scale each entry by the inverse square of the deviation that is acceptable for that state or control. Use a **Terminal Cost Qf** much larger than **State Cost Q** when the target must be reached. When the state cost is not needed along the path, make **State Cost Q** small and let the terminal cost and control effort shape the motion.

## How to Set the ALTRO Inputs

**Initial Penalty** sets the first penalty weight, which rises tenfold after each outer iteration while limits are violated. A small value keeps the first solves well conditioned and takes more outer iterations. A large value reaches feasibility sooner, with a risk of poor conditioning. **Tolerance** sets the allowed violation for the outer loop. **Max Iterations** limits the iterative LQR sweeps within each solve.

## When to Look Beyond This Panel

Use another tool when the problem has state limits or obstacles, since the tabs enforce limits only on the controls. The same holds for a free final time, contact dynamics and several phases of motion, as these need dedicated formulations. A problem whose model is uncertain should be treated with feedback or stochastic control from the outset, rather than by a single plan.

## See Also

- [Factsheet](factsheet.md) · [Direct Methods](direct.md) · [Indirect Methods](indirect.md) · [DDP](ddp.md) · [ALTRO](altro.md)
