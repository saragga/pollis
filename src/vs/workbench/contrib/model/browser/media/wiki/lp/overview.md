# Overview

This webview solves **linear programmes**: choose the values of variables x1, ..., xn to maximise or minimise a linear objective c1 x1 + ... + cn xn, subject to linear constraints A x <= b and x >= 0. Production planning, diets, blending, transport and assignment are classic examples. Problems are written in JuMP, which builds the model once and passes it to any of the solvers.

## Linear Programming (LP)
All variables are **continuous**. The feasible set is a polyhedron, and if an optimum exists, one is found at a **vertex** of it. The simplex method moves from vertex to vertex, improving the objective; interior-point methods cross the inside of the polyhedron. Both find the global optimum, and the solution comes with its **dual**: a shadow price for every constraint. Solvers: **HiGHS** (the default), **Clp** and **GLPK**.

## Mixed-Integer Linear Programming (MILP)
Some or all variables must take **integer** values: numbers of machines, yes-or-no decisions. The problem is no longer convex, and solvers use **branch-and-bound**: solve the LP relaxation (the same problem without integrality), branch on a fractional variable, and discard the branches whose bound cannot beat the best integer solution so far. Solvers: **HiGHS** and **GLPK**.

## Common Workflow

1. Enter the **objective coefficients c**, the **constraint matrix A** and the **right-hand side b**, and choose to maximise or minimise.
2. Solve, and run the **Feasibility Check**: the status must be OPTIMAL.
3. Look at the **Feasible Region** (for two variables) and the **Solution Plot**.
4. Find the **binding constraints** in **Constraint Activity**, and read their **Shadow Prices**.
5. Run the **Sensitivity Analysis** and the **Parametric Analysis** to see how stable the solution is; for a MILP, compare with the LP bound in **LP Relaxation Gap**.

## See Also
- [Factsheet](factsheet.md) · [LP](lp.md) · [MILP](milp.md) · [Duality](duality.md)
