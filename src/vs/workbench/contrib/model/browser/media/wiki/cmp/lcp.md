# Linear Complementarity (LCP)

The linear complementarity problem uses an affine map. Its simple form hides a combinatorial problem, and the properties of one matrix decide whether a solution exists.

## What the Problem Asks

For a square matrix M and a vector q, find x such that:

- x ≥ 0, Mx + q ≥ 0, x'(Mx + q) = 0

Set w = Mx + q. Each i then has x_i = 0 or w_i = 0, and the rest follows from a linear system on the chosen pattern. With q ≥ 0, x = 0 solves it at once. The standard reference is [Cottle, Pang and Stone (1992)](#ref-CPS1992a). In the tab, **Matrix M (n x n)** and **Vector q** set the data, and the length of q sets n.

## When a Solution Exists and Is Unique

| Class of M | Consequence |
|---|---|
| Positive definite, including non-symmetric | Unique solution for every q |
| P-matrix, all principal minors positive | Unique solution for every q, and the converse holds |
| Positive semidefinite | Convex solution set, which may be empty |
| General | May have none, or several |

A positive definite M need not be symmetric, as only x'Mx > 0 matters. The default M is symmetric and positive definite, so it falls in the first row.

## Where the LCP Arises

The KKT conditions of a convex quadratic programme, min ½x'Mx + q'x with x ≥ 0, give exactly an LCP with symmetric M. Adding linear constraints gives a block matrix that is positive semidefinite for a convex programme. Two-player bimatrix games give an LCP too, although with a matrix that has no definite sign. American options, after discretisation, give one at each time step, and contact mechanics gives one at each load step. In these cases, a pair states a regime choice.

## How Pivoting Solves an LCP

[Lemke (1965)](#ref-Lem1965a) gave the classic method: add an artificial variable, then pivot through complementary bases until the artificial variable drops out. It extends the method of [Lemke and Howson (1964)](#ref-LH1964a) for bimatrix games. On suitable matrix classes the method ends either with a solution or with a proof that none exists. Pivoting is exact up to rounding, and works best on small and dense problems. Worst-case counts can grow exponentially, though typical cases are much better.

## How Newton-Type Methods Differ

PATH treats the problem as a nonsmooth equation, and takes Newton-like steps that solve a linear model of the problem with a pivotal method, then searches along a path. For an LCP, the model is the problem itself, so that a full step from a good pivot sequence solves it at once. That explains why **Residual Plot** can fall to zero in very few major iterations on this tab. Interior-point methods are an alternative for monotone LCPs, and they scale well for large sparse problems.

## How the Solution Responds to q

Because the map is affine, x is piecewise linear in q when M is a P-matrix: each pattern of active pairs has its own linear formula. **Sensitivity Analysis** reports the local slope of that map, and **Parametric Solve** traces it over a shift of all components. A kink marks a pair that changes regime. Between kinks, the slope comes from the inverse of the active block of M, which can be checked by hand for small problems. A shift of M itself would need separate code.

## References

<a id="ref-CPS1992a"></a>Cottle, R. W., Pang, J.-S. and Stone, R. E. (1992). *The Linear Complementarity Problem*. SIAM. [doi:10.1137/1.9780898719000](https://doi.org/10.1137/1.9780898719000)

<a id="ref-Lem1965a"></a>Lemke, C. E. (1965). Bimatrix equilibrium points and mathematical programming. *Management Science* 11(7), 681–689. [doi:10.1287/mnsc.11.7.681](https://doi.org/10.1287/mnsc.11.7.681)

<a id="ref-LH1964a"></a>Lemke, C. E. and Howson, J. T. (1964). Equilibrium points of bimatrix games. *Journal of the Society for Industrial and Applied Mathematics* 12(2), 413–423. [doi:10.1137/0112033](https://doi.org/10.1137/0112033)

## See Also

- [Factsheet](factsheet.md) · [Nonlinear Complementarity (NCP)](ncp.md) · [Mixed Complementarity (MCP)](mcp.md) · [Interpretation](interpretation.md)
