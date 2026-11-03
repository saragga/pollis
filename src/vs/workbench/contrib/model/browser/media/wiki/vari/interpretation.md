# Variational Inequalities: Interpretation

How to read a solution of the **Variational Inequalities** panel: component by component, against the bounds, and as an equilibrium of the default Cournot game.

## Component by component

**Equilibrium Interpretation** classifies each component of the solution with a tolerance of 10⁻⁶: at the lower bound, at the upper bound, or interior with F_i = 0. The description of the action reads an interior component as one where the first-order condition holds, and a component at a bound as one where |F_i| is the shadow value of relaxing that bound.

The three cases are those of the mixed complementarity constraint in the JuMP documentation: F_i = 0 between the bounds, F_i ≥ 0 at the lower bound and F_i ≤ 0 at the upper bound.

## The Cournot reading

In the default problem, F_i is minus the marginal profit of firm i. An interior component is then an output at which the marginal profit is zero, and a component at its upper bound, the capacity, one with F_i ≤ 0, a marginal profit that is non-negative.

At the lower bound, x_i = 0 with F_i ≥ 0: the firm produces nothing and its marginal profit is not positive. The column `shadow_value` reports |F_i| for each component at a bound and 0 for the interior ones.

## Bounds vs NCP

**Bounds vs NCP** solves the problem again with the lower bounds only, a nonlinear complementarity problem with no upper bounds, and sets that solution and its F beside those of the VI on K. The description reads the difference as how much the upper bounds, the capacities, change the equilibrium.

The JuMP tutorial on mixed complementarity problems describes the familiar form 0 ≤ F(x) ⟂ x ≥ 0 as the special case with lower bounds 0 and upper bounds ∞.

## Parametric VI

**Parametric VI** shifts every component of F down by t, for 41 values of t from −3 to 3, solves the problem for each and plots the path x*(t). For the Cournot default, the description reads the shift as a rise of t in the demand intercept.

A shift at which the solve fails appears as a gap in the path, since the action records NaN there.

## The QVI solution

For the QVI, `K_at_x` gives the box at the solution, so the bounds against which **Equilibrium Interpretation** classifies the components are those of K(x*). In the default problem, the upper bound of each firm is 5 minus the other's output, and the decision table notes that the shared capacity binds.

The decision table also warns that generalised Nash equilibria are typically not unique: the point reached depends on the start and on the damping.

## Equilibria and optimisation

[Dafermos and Sparrow (1969)](#ref-DS1969a) contrast two criteria for a traffic network: a central authority that minimises the total cost, and users who each choose the cheapest route given the choices of the others. The equilibrium of the second kind is in general not the optimum of the first.

The panel's second bullet makes the same point for VIs in general: they apply wherever the equilibrium condition cannot be written as a simple minimisation.

## References

<a id="ref-DS1969a"></a>Dafermos, S. C., & Sparrow, F. T. (1969). The Traffic Assignment Problem for a General Network. *Journal of Research of the National Bureau of Standards, Section B* 73B(2), 91-118. [doi:10.6028/jres.073B.010](https://doi.org/10.6028/jres.073B.010)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Variational Inequality (VI)](vi.md) · [Quasi-Variational Inequality (QVI)](qvi.md)
