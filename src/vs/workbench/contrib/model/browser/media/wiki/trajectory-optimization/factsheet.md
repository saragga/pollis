# Trajectory Optimisation — Factsheet

Trajectory Optimisation computes the states and controls that take a dynamical system from an initial state towards a target state at the lowest cost over a fixed time. The panel offers four numerical methods for the same problem, written directly in Julia.

## What the Trajectory Optimisation Panel Does

| Item | Description |
|---|---|
| **Purpose** | Find an open-loop control sequence and its state trajectory for a user-defined system |
| **Julia stack** | JuMP.jl and Ipopt.jl for the direct method; NLsolve.jl for the indirect method; ForwardDiff.jl for all derivatives; Plots.jl for the Next Steps |
| **Models** | Direct Methods, Indirect Methods, DDP and ALTRO tabs |
| **Output** | States at each knot point, controls over each interval, the total cost and, through **Feedback Gains**, time-varying LQR gains |
| **Key choice** | Whether the controls have limits, and how good an initial guess is available |

## The Problem That All Four Trajectory Methods Solve

Every tab minimises a terminal cost on x(tf) − xf, weighted by **Terminal Cost Qf**, plus a running cost on x − xf, weighted by **State Cost Q**, and on u, weighted by **Control Cost R**. The minimisation is subject to the dynamics x' = f(x, u) from the **Dynamics f(x, u)** input, starting at **Initial State**. The time horizon **Time Horizon** is fixed and divided into **Knot Points** nodes. The target **Target State** is a soft goal unless **Terminal Cost Qf** is large.

## Which Algorithm Runs in Each Trajectory Optimisation Tab

| Tab | Algorithm | Control limits |
|---|---|---|
| **Direct Methods** | Trapezoidal collocation, solved by Ipopt | Yes, through **Control Bound** |
| **Indirect Methods** | Pontryagin's principle by multiple shooting on state and costate | No |
| **DDP** | Iterative LQR: backward pass, forward rollout and line search | No |
| **ALTRO** | Augmented Lagrangian outer loop around iterative LQR | Yes, through **Control Bound** |

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Direct Methods](direct.md) · [Indirect Methods](indirect.md) · [DDP](ddp.md) · [ALTRO](altro.md)
