# Variational Inequalities: Decision Guide

Choices in the **Variational Inequalities** panel: the VI or the QVI, the inputs of each, and the action that answers a given question.

## VI or QVI

The panel's decision table:

| Problem | Context | Purpose |
| --- | --- | --- |
| Variational Inequality | fixed box K = [lb, ub]: Nash-Cournot equilibria with capacities, traffic equilibria, contact problems, KKT systems of convex programmes | x* in K with F(x*)ᵀ(y − x*) ≥ 0 for every y in K; on a box, the mixed complementarity problem, solved with PATH through JuMP |
| Quasi-Variational Inequality | a constraint set that moves with the solution, K(x): generalised Nash equilibria with shared resources | x* in K(x*) solving the VI on K(x*), by damped fixed-point iteration |

The question that separates them is whether the bounds of one variable depend on the values of the others. When they do not, the VI on a fixed box applies; when they do, as with a capacity that the players share, the QVI.

## Setting up the VI

**Lower Bounds lb** and **Upper Bounds ub** define the box, with `-Inf` or `Inf` for a missing bound. Infinite upper bounds and lower bounds of zero give the nonlinear complementarity problem that **Bounds vs NCP** solves for comparison.

**Operator F(x)** holds n expressions in `x[1]` to `x[n]`. For a game, the tooltip's convention for the default applies: F_i is minus the marginal payoff of player i.

## Setting up the QVI

**Moving Set K(x)** returns the box as a tuple (lb, ub) evaluated at x. The default limits each firm to 5 minus the other's output, a shared capacity of 5.

The QVI iteration solves the VI on K(x_k), moves halfway towards its solution and updates the set. The code starts from `x0 = zeros(n)` with `damp = 0.5`, and the loop ends after 200 steps or when a step is shorter than 10⁻⁹.

## Which action to use

| Question | Action |
| --- | --- |
| Where does −F point near the solution? | **Operator Field** |
| Where are the zeros of the residual? | **Residual Map** |
| Does the VI inequality hold at x*? | **VI Residual** |
| Has the QVI iteration converged? | **Convergence Check** |
| How does x* move with demand? | **Parametric VI** |
| What do the capacities change? | **Bounds vs NCP** |
| Which components are at a bound? | **Equilibrium Interpretation** |
| How far was the start from a solution? | **Gap Function** |

## Solver and licence

Both problems use PATH, which [Dirkse and Ferris (1995)](#ref-DF1995a) describe as a stabilised Newton method with a non-monotone pathsearch for mixed complementarity problems. The panel's code states each problem in JuMP with `complements(F(x), x)` and passes it to PATH through PATHSolver.jl.

The PATHSolver.jl README states that PATH without a licence solves problems with up to 300 variables and 2000 non-zeros, and links a temporary licence, valid for a year, for larger ones.

## Further reading

[Dafermos and Sparrow (1969)](#ref-DS1969a) is the panel's original paper, on the traffic assignment problem for a general network, where the traffic demands between pairs of nodes and convex travelling cost functions on the links are given, and the traffic patterns that either minimise the total cost or equilibrate the users' costs are sought. They recall that the two criteria lead in general to different traffic patterns, as Pigou first observed in a network of two nodes and two links.

## References

<a id="ref-DS1969a"></a>Dafermos, S. C., & Sparrow, F. T. (1969). The Traffic Assignment Problem for a General Network. *Journal of Research of the National Bureau of Standards, Section B* 73B(2), 91-118. [doi:10.6028/jres.073B.010](https://doi.org/10.6028/jres.073B.010)

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Variational Inequality (VI)](vi.md) · [Quasi-Variational Inequality (QVI)](qvi.md)
