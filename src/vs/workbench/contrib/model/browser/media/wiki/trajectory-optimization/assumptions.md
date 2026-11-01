# Trajectory Optimisation — Assumptions

All four methods of the Trajectory Optimisation panel are local and gradient-based, and they share assumptions about the form of the problem. A few assumptions belong to one method only.

## What Trajectory Optimisation Assumes About the Dynamics

The function in **Dynamics f(x, u)** must be smooth enough to differentiate, and must accept the dual numbers that ForwardDiff.jl passes through it and, in the **Direct Methods** tab, the variables of JuMP.jl. A hard `Float64` conversion inside the function will fail. Contact, friction with a sign change and switching behaviour break smoothness, and tend to stall the solvers or give poor derivatives. The model is treated as exact: no method here accounts for uncertainty in the dynamics while planning.

## What the Quadratic Cost Assumes

The cost is quadratic in x − xf and in u, so it assumes that being far from the target and using control are penalised by squared distance. **State Cost Q** and **Terminal Cost Qf** should be symmetric positive-semidefinite. **Control Cost R** should be symmetric positive-definite: the indirect method inverts it, and the iterative LQR step needs it to keep the control step well defined. Costs such as minimum time, or the absolute value of the control, are outside this form.

## What a Fixed Horizon and a Fixed Grid Assume

**Time Horizon** fixes the duration in advance, so the panel cannot find the best arrival time. Run several horizons and compare their costs to study that. **Knot Points** fixes a uniform grid, which assumes that one step size suits the whole motion. A trajectory with a quick manoeuvre within a long, slow phase may need many nodes to resolve only a small part of it.

## Why Trajectory Solutions Are Only Locally Optimal

Each method stops at a point where its local conditions hold, and a nonconvex problem can have many such points. A pendulum, for example, can swing up in either direction, with several swings or one. Different starting guesses and different methods can therefore return different solutions, each valid. A solution from these tabs is not a proof that no cheaper trajectory exists.

## What the Indirect Method Assumes in Addition

The **Indirect Methods** tab writes the optimal control in closed form from the Hamiltonian. The closed form is only correct when the dynamics are control-affine, meaning that f(x, u) is a function of x plus a matrix of x times u. For dynamics that are nonlinear in u, the computed control is not the true minimiser. The tab also assumes no bound on the controls.

## What a Feasible Problem Means

The direct and ALTRO tabs assume that a trajectory exists within the **Control Bound**. When the limit is too tight for the horizon, as with a weak motor and a short time, the solvers report failure or return a trajectory that misses the target, and a longer **Time Horizon** may help. The target itself enters as a cost, so a trajectory can look feasible and still end far from **Target State**: check the final state.

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md) · [Indirect Methods](indirect.md)
