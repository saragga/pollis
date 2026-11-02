# Large Neighbourhood Search

Large neighbourhood search breaks part of a solution and rebuilds it. A single move can change much more than a small local step, so the search can jump over obstacles that hold back a small-step method.

## Destroy and repair

The idea began in vehicle routing, where the method removes a set of related customers from the routes and reinserts them with constraint programming ([Paul Shaw (1998)](#ref-Sha1998a)). Fixing most of the solution makes each repair a small problem that can be solved well, even when the whole problem is far too large to solve at once.

Destroy and repair form a pair that must match the problem. In routing, related customers are those close together or sharing a route, since removing unrelated ones leaves little freedom for a better reinsertion.

## The continuous version in the panel

The code adapts the idea to a box. `destroy` picks a random subset of `max(1, round(Int, frac * n))` variables and draws new values for them uniformly in the box. A bounded L-BFGS descent then does the repair, and the result replaces the incumbent only if its value is strictly lower.

The repair moves every variable. The variables that were not destroyed keep their old values only as a starting point, and the descent is free to shift them. That is looser than the classic scheme, which holds the rest of the solution fixed while it rebuilds, and it makes the method closer in spirit to a partial restart.

## What the destroy fraction does

**Destroy Fraction** rounds to a whole number of variables, and small dimensions leave few real choices. With two variables, fractions of 0.1, 0.25 and 0.5 all re-sample one variable, while 0.75 and 1.0 re-sample both. **Parameter Sensitivity** can thus show identical behaviour across its first three grid values.

A fraction of 1.0 throws away the whole incumbent, which makes each step a random restart with a descent. Small fractions keep most of the solution and change little per move. With ten variables, 0.5 gives five re-sampled and 0.1 gives one, so the grid becomes meaningful only as the dimension grows.

## Why the default flatters this method

Rastrigin is additive: a coordinate at its best value stays best whatever the others do. Re-sampling one coordinate at a time can therefore solve the problem in pieces. A uniform draw lands in the central valley with probability about 1/10.24 ≈ 0.1, so the optimal value of a coordinate turns up after about ten draws of that coordinate, and the improvements-only rule then keeps it.

Most real objectives couple their variables, so a new value for one variable pays off only alongside changes in others. Good results on the default then do not carry over. Before relying on **LNS**, test it on a problem whose coupling resembles your own, or rotate the default's coordinates in the **Objective f(x)** expression.

## References

<a id="ref-Sha1998a"></a>Shaw, P. (1998). Using Constraint Programming and Local Search Methods to Solve Vehicle Routing Problems. In *International Conference on Principles and Practice of Constraint Programming*, 417-431. Springer. [doi:10.1007/3-540-49481-2_30](https://doi.org/10.1007/3-540-49481-2_30)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
