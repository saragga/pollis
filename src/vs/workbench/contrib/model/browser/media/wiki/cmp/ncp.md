# Nonlinear Complementarity (NCP)

The nonlinear problem keeps the sign conditions, and lets F be any smooth map. Uniqueness can no longer be expected, and a good start can decide what is found.

## What the Problem Asks

Find x such that x ≥ 0, F(x) ≥ 0 and x'F(x) = 0. **Operator F(x)** gives the map as a vector of Julia expressions in x[1] to x[n], and **Dimension n** must match its length. The tab holds x ≥ 0 and adds no other bound. Nonlinear equations are the special case in which every variable is free, and the sign conditions turn the task into the choice of pattern as well as the solving of a system. [Facchinei and Pang (2003)](#ref-FP2003a) cover the theory.

## Which Test Problem the Tab Uses

The default is the problem from [Kojima and Shindo (1986)](#ref-KS1986a), with four variables and quadratic terms, used widely as a test. It has two solutions:

- (1, 0, 3, 0)
- (sqrt(6)/2, 0, 0, 1/2)

Each can be confirmed by hand from the expressions in the input. The second solution has x3 = 0 and F3 = 0 together, so it is degenerate at component 3, a feature that makes Newton-type methods work harder near it. Together with non-uniqueness, this has made it a standard test, included in the MCPLIB collection of [Dirkse and Ferris (1995)](#ref-DF1995b).

## How the Natural Residual Measures Failure

The code defines a residual that vanishes exactly at solutions:

- r(x) = ‖x − mid(x − F(x), lb, ub)‖

For the tab's bounds, this reduces to components min(x_i, F_i(x)). A small value means a near-solution for the pairs, whichever regime each one is in. A norm does not say which pair fails, so a separate check matters. A small residual can still hide a point far from a true solution where the map is nearly flat. **Complementarity Check** reports the residual next to the separate sign conditions.

## How Newton Methods Handle the Nonsmooth Kink

The reformulated system switches form at each pattern change, so it is nonsmooth, and ordinary Newton steps do not apply directly. The method of [Robinson (1992)](#ref-Rob1992a) rewrites it as a normal map, and a Newton step solves a linear complementarity model at the current point. [Ralph (1994)](#ref-Ral1994a) gives the global path search along which the step is followed, damped if needed. Convergence is fast near a regular solution, so that the iterations shown in **Residual Plot** usually drop steeply at the end. Degeneracy can slow that final stage.

## How Starting Points Affect the Answer

Without monotonicity, different starts can reach different solutions, or fail. The default start is all ones. **Solution Multiplicity** tries 50 random starts in [0, 3] and counts the solutions reached. Absence of a second solution among the runs is not a proof that none exists, and the counts reflect the solver's paths, not any measure of importance. In an economic model, several solutions may mean several equilibria, so any interpretation should say which one is reported, and why.

## When a Solution May Not Exist or Be Unique

If F is strongly monotone, a unique solution exists. A continuous F may have no solution on an unbounded set, while a finite box guarantees one. **Solver Status** prints the smallest eigenvalue of the symmetric Jacobian at the solution. A positive value is sufficient for local uniqueness, and a negative value does not rule it out, since the test ignores the active pattern.

## References

<a id="ref-DF1995b"></a>Dirkse, S. P. and Ferris, M. C. (1995). MCPLIB: a collection of nonlinear mixed complementarity problems. *Optimization Methods and Software* 5(4), 319–345. [doi:10.1080/10556789508805619](https://doi.org/10.1080/10556789508805619)

<a id="ref-FP2003a"></a>Facchinei, F. and Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems*, Vols I and II. Springer.

<a id="ref-KS1986a"></a>Kojima, M. and Shindo, S. (1986). Extension of Newton and quasi-Newton methods to systems of PC^1 equations. *Journal of the Operations Research Society of Japan* 29(4), 352–375. [doi:10.15807/jorsj.29.352](https://doi.org/10.15807/jorsj.29.352)

<a id="ref-Ral1994a"></a>Ralph, D. (1994). Global convergence of damped Newton's method for nonsmooth equations via the path search. *Mathematics of Operations Research* 19(2), 352–389. [doi:10.1287/moor.19.2.352](https://doi.org/10.1287/moor.19.2.352)

<a id="ref-Rob1992a"></a>Robinson, S. M. (1992). Normal maps induced by linear transformations. *Mathematics of Operations Research* 17(3), 691–714. [doi:10.1287/moor.17.3.691](https://doi.org/10.1287/moor.17.3.691)

## See Also

- [Factsheet](factsheet.md) · [Linear Complementarity (LCP)](lcp.md) · [Mixed Complementarity (MCP)](mcp.md) · [Diagnostics](diagnostics.md)
