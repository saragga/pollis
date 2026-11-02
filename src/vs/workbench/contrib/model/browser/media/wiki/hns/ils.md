# Iterated Local Search

Iterated local search alternates a kick with a local descent. Instead of restarting from nowhere, it searches among local minima near the best one found so far.

## Walking among local minima

The scheme has four parts: an initial solution, a local search, a perturbation and an acceptance rule ([Helena R. Lourenço, Olivier C. Martin and Thomas Stützle (2003)](#ref-LMS2003a)). The search effectively moves in a much smaller space, the set of local minima, because each candidate has already been brought to the bottom of its valley.

In the code the first descent starts from `x_start`. Each later step adds `knob .* (ub .- lb) .* randn(n)` to the incumbent, moves the point just inside the box if the kick left it, and descends with bounded L-BFGS. A new minimum replaces the incumbent only if its value is strictly lower.

## How big a kick?

**Perturbation Scale** sets the standard deviation as a fraction of box width. The balance sits between two failures: too small and the descent falls back to the same minimum, and too large and the search forgets where it was, becoming random restarts.

Rastrigin shows the numbers. Its minima are one unit apart, so a kick must travel about half a unit in a coordinate to change valley. At scale 0.02 the standard deviation is about 0.2, and the kick stays in the same two-variable valley some 97% of the time. At the default 0.15 it is about 1.5, and only about 6% of kicks stay. At 0.4 it reaches about 4, and the search is close to a restart. **Parameter Sensitivity** tries 0.02, 0.05, 0.1, 0.2 and 0.4.

## Greedy acceptance and its risk

Accepting improvements only is the simplest rule and it makes the incumbent's value fall monotonically. The risk is that a good minimum can be reached only through a worse one. The search then keeps kicking from the same point, and the **Convergence Curve** shows a long flat line to the end.

The framework allows other acceptance rules, and **BH** in this panel uses one of them. A long flat line combined with disagreement across seeds is the usual sign that a looser rule or a larger kick would help. Agreement across seeds with a flat line is more encouraging, though it remains no proof of reaching the global minimum.

## Where the budget goes

Every move pays for a full descent. With finite-difference gradients, a single L-BFGS iteration costs several evaluations per variable, so one kick and descent may cost dozens of evaluations even in two dimensions. A budget of 5000 therefore funds far fewer moves than the number suggests.

The descent is capped by `outer_iterations=5` to keep each step affordable, which leaves the incumbent less exact than a full solve. Run **Local Polish** on the result, as the tightening is cheap. With a smooth objective **ILS** is a sensible first tab: it has a single setting, no memory to manage and a clear reading of failure.

## References

<a id="ref-LMS2003a"></a>Lourenço, H. R., Martin, O. C., & Stützle, T. (2003). Iterated Local Search: Framework and Applications. In *Handbook of Metaheuristics*, 320-353. Kluwer Academic Publishers. [doi:10.1007/0-306-48056-5_11](https://doi.org/10.1007/0-306-48056-5_11)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
