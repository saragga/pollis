# Mathematical Programming with Equilibrium Constraints: Assumptions

What the panel's three methods take for granted about the objective, the constraints and the equilibrium, and what the convergence results in the literature require.

## Smooth functions

[Hu and Ralph (2004)](#ref-HR2004a) state the problem with smooth functions for the objective, the constraints and both sides of the complementarity, and the convergence results for regularisation and penalty methods rest on that setting.

In the panel, **Objective F(x, y)**, **Constraints G(x, y) <= 0** and **Equilibrium Map f(x, y)** are Julia expressions evaluated on JuMP variables, so that Ipopt and PATH receive them with their derivatives. Polynomials, exponentials and logarithms on their domains fit the setting. Functions with kinks, such as `abs` or `max`, place the problem outside it.

## One scalar outer decision

The outer variable x is a single number in all three methods: `nlp_model` declares one variable `xv`, and **Implicit (PATH)** searches a grid of x.

The equilibrium y, by contrast, can have any length, set by **Equilibrium Dimension**. **Objective F(x, y)** and the other inputs refer to its components as `y[1]`, `y[2]` and so on, or through vector operations such as `sum(y)`.

## A bounded range for x

`x_range` minimises and maximises x subject to the outer constraints and y ≥ 0, and the two results, `xlo` and `xhi`, bound the grid of the implicit method, the charts and the caps of **Parametric MPEC**. **Constraints G(x, y) <= 0** should therefore bound x on both sides.

The default `[x - 10, -x]` means 0 ≤ x ≤ 10. Constraints that involve y as well count too: `x_range` finds the extremes of x over all y ≥ 0 that satisfy them.

## An equilibrium for each decision

The implicit method, **Implicit Objective**, **Equilibrium Response** and **Stationarity Check** treat y as a function y*(x), found by PATH at each x from a starting value of 1.0 for every component. The decision table describes the implicit method for an inner equilibrium with a unique solution.

For the default market, [Sherali, Soyster and Murphy (1983)](#ref-SSM1983a) study the existence and uniqueness of the followers' Cournot equilibrium under market assumptions on demand and costs. Where an equilibrium has several solutions, PATH returns one of them, and the chart of **Equilibrium Response** shows the branch it follows.

## Constraint qualifications

A constraint qualification is a condition on the gradients of the active constraints under which the usual optimality conditions hold. [Hu and Ralph (2004)](#ref-HR2004a) explain that the Mangasarian-Fromovitz constraint qualification fails for problems with complementarity constraints, and so does the stronger linear independence condition.

The condition used in its place, MPCC-LICQ, asks for the linear independence of the gradients of the active constraints of the problem with y'f = 0 removed, that is, the usual LICQ for that relaxed problem. Under MPCC-LICQ at a limit point, the same authors summarise, a limit of stationary points of the regularised problems is C-stationary. A weak second-order necessary condition at each iterate makes it M-stationary, and further conditions are needed for B-stationarity. The [Diagnostics](diagnostics.md) page describes the three notions.

## Lengths and signs that must match

| Input | Requirement |
|---|---|
| **Equilibrium Map f(x, y)** | A vector with one entry per component of y |
| **Equilibrium Dimension** | Equal to the length of **Equilibrium Map f(x, y)** |
| **Constraints G(x, y) <= 0** | A vector, each entry at most zero at a feasible point |
| **Objective F(x, y)** | A scalar |
| **Grid Points** | A positive integer |

The sign of f matters. Complementarity pairs y_i ≥ 0 with f_i ≥ 0, so f_i is written as the quantity that must be non-negative, such as marginal cost minus marginal revenue for a producer.

## References

<a id="ref-HR2004a"></a>Hu, X. M., & Ralph, D. (2004). Convergence of a Penalty Method for Mathematical Programming with Complementarity Constraints. *Journal of Optimization Theory and Applications* 123(2), 365-390. [doi:10.1007/s10957-004-5154-0](https://doi.org/10.1007/s10957-004-5154-0)

<a id="ref-SSM1983a"></a>Sherali, H. D., Soyster, A. L., & Murphy, F. H. (1983). Stackelberg-Nash-Cournot Equilibria: Characterizations and Computations. *Operations Research* 31(2), 253-276. [doi:10.1287/opre.31.2.253](https://doi.org/10.1287/opre.31.2.253)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MPEC](mpec.md)
