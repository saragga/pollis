# Overview

A complementarity problem looks for a point where each variable and its partner condition cannot both be active. Many equilibrium conditions take that form, and a single solver, PATH, handles the standard form.

## What Complementarity Means

Given a map F, the basic problem asks for x such that:

- x ≥ 0, F(x) ≥ 0, x'F(x) = 0

Because all terms are non-negative, the last condition means that, for each i, either x_i = 0 or F_i(x) = 0, or both. The pair (x_i, F_i) is said to be complementary, and each one holds the other at zero when positive. The combinatorial part lies in deciding which of the two is zero for each i, with n pairs giving up to 2^n patterns. [Harker and Pang (1990)](#ref-HP1990a) survey theory and methods.

## Where Complementarity Problems Come From

Economic and engineering conditions often have this shape, as shown by [Ferris and Pang (1997)](#ref-FP1997a):

- Market: a price is zero, or supply equals demand
- Production: an activity runs at zero, or it breaks even
- Traffic: a route is unused, or its cost equals the minimum
- Contact: a gap is open, or the force across it is non-zero
- Optimisation: a multiplier is zero, or its constraint is active

Each is a choice between two regimes, with the model deciding which one holds.

## How the Three Tabs Relate

| Tab | Map | Bounds |
|---|---|---|
| **Linear Complementarity** | F(x) = Mx + q | x ≥ 0 |
| **Nonlinear Complementarity** | Any smooth F | x ≥ 0 |
| **Mixed Complementarity** | Any smooth F | lb ≤ x ≤ ub |

Each row includes the one before it. The mixed form is also the standard input for PATH, so all three tabs share the same `solve_cp`, with different `lb`, `ub` and `Fop`.

## How the Panel Solves Them

The code builds a JuMP model with `PATHSolver.Optimizer`, and it states the pairs with `complements(F(x), x)`. It then returns the solution, the map at the solution, the status, and the natural residual, which is zero exactly at a solution. PATH, from [Dirkse and Ferris (1995)](#ref-DF1995a), applies a stabilised Newton method. **Merit Function Reformulation** adds a contrasting route, through Ipopt, as a cross-check.

## A Common Workflow for a Complementarity Model

1. Run a tab, and confirm that `solved` is true and that `residual` is tiny.
2. Use **Complementarity Check** and **Complementarity Pairs** to verify the solution.
3. Use **Solution Multiplicity** to see whether others exist.
4. Use **Dual Interpretation** to read the regime of each pair.
5. Use **Sensitivity Analysis** and **Parametric Solve** to study how the solution responds.
6. Use **Solver Status** for a local uniqueness indicator.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P. and Ferris, M. C. (1995). The PATH solver: a nonmonotone stabilization scheme for mixed complementarity problems. *Optimization Methods and Software* 5(2), 123–156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

<a id="ref-FP1997a"></a>Ferris, M. C. and Pang, J.-S. (1997). Engineering and economic applications of complementarity problems. *SIAM Review* 39(4), 669–713. [doi:10.1137/S0036144595285963](https://doi.org/10.1137/S0036144595285963)

<a id="ref-HP1990a"></a>Harker, P. T. and Pang, J.-S. (1990). Finite-dimensional variational inequality and nonlinear complementarity problems: a survey of theory, algorithms and applications. *Mathematical Programming* 48(1–3), 161–220. [doi:10.1007/BF01582255](https://doi.org/10.1007/BF01582255)

## See Also

- [Factsheet](factsheet.md) · [Linear Complementarity (LCP)](lcp.md) · [Nonlinear Complementarity (NCP)](ncp.md) · [Mixed Complementarity (MCP)](mcp.md)
