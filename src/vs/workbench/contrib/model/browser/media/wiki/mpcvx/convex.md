# Convex Programming

A **convex programme** minimises a convex function over a convex set ([Boyd and Vandenberghe (2004)](#ref-BV2004a)). The General Convex Programming panel solves the convex programme that minimises an objective f(x) subject to one linear constraint in x and x >= 0, with f written in Convex.jl on the Convex.jl (DCP) tab and in JuMP on the JuMP tab.

## Why Convexity Matters
For a convex problem, every **local minimum is global**, the optimality (KKT) conditions are sufficient, and the dual problem gives a bound on the optimal value ([Boyd and Vandenberghe (2004)](#ref-BV2004a)). A solver that returns OPTIMAL on a convex problem has solved it, not found one of many local minima. **Status and Feasibility** reports the termination status, and on the JuMP tab the primal and dual statuses and any constraint the solution violates.

## How JuMP Passes a Convex Problem to the Solver
JuMP ([Dunning, Huchette and Lubin (2017)](#ref-DHL2017a)) passes each part of a model that the solver supports as written, and **bridges** the others: it rewrites them as equivalent constraints of types the solver supports. Clarabel, COSMO and SCS accept a quadratic objective, so a convex quadratic objective reaches them unchanged, while a scalar equality or inequality becomes a vector constraint in the Zeros or Nonnegatives cone. Functions other than linear and quadratic ones, such as `abs` or a norm, become nonlinear expressions in JuMP, which these conic solvers do not accept: the Convex.jl (DCP) tab reduces them to cones instead. JuMP does not check that a quadratic objective is convex: COSMO stops with an error on one that is not, SCS reports an invalid model, and Clarabel can report OPTIMAL for a point with no guarantee of being a global optimum. **Conic Form** on the JuMP tab prints the bridges JuMP uses.

## The Default Problem of General Convex Programming
The default objective is the squared distance from x to the point (1/n, 2/n, ..., 1), under the constraint sum(x) == 1: the **projection** of that point onto the **probability simplex**. Since that point sums to more than 1, the solution lowers every coordinate by the same amount and sets the smallest ones to 0, the coordinates whose bound x >= 0 is active. The **Solution Profile** shows which coordinates are zero.

## The Dual Value of the Constraint
The dual value of a constraint measures how the optimal value changes with the constraint's right-hand side. For a convex problem the optimal value is a convex function of the right-hand side, and the dual value gives its slope wherever that function is differentiable ([Boyd and Vandenberghe (2004)](#ref-BV2004a)). Convex.jl reports the dual value as `con.dual` and JuMP as `dual(con)`. The **Dual Value Check** compares it with the change in the optimal value when the right-hand side grows by 0.001, and the **Parametric Sweep** draws the optimal value as the right-hand side goes from half to twice its value.

## References

<a id="ref-BV2004a"></a>Boyd, S. and Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also
- [Disciplined Convex Programming](dcp.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
