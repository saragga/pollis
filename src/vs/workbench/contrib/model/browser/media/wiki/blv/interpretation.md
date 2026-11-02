# Interpretation

A bilevel solution is a pair of decisions plus a statement about strategic power. Reading it means asking what the leader gained by moving first, and what the follower's response cost.

## How to Read the Stackelberg Solution

**Stackelberg Value** gives the leader's x, the follower's y, both objectives, and `binding_follower_constraints`, the indices of follower constraints that hold with equality. Binding constraints describe the regime: the follower is stopped by those limits, and a leader's small move stays in that regime until another constraint binds. Values are minimised, so a more negative leader objective is better for the leader. Treat the follower's objective on its own scale, as the two are not generally comparable.

## How to Read the Reaction Curve

**Reaction Curve** plots y*(x) and the leader's objective along it, with the solution marked. In a linear follower, the reaction is piecewise linear, with kinks where the set of binding constraints changes. [Bard (1998)](#ref-Bar1998a) discusses this geometry for the linear case. Gaps in the right panel show values of x that the leader cannot use. A leader's optimum at a kink is typical, since linear objectives along a piecewise linear path reach their best at a breakpoint or an end.

## How to Read the Inducible Region

**Inducible Region** shades the joint feasible set and overlays the reaction curve, with leader contours and two marked points. The curve is what the leader can actually achieve, and the shaded area is what would be possible if it controlled y. A cooperative point off the curve shows a plan that the follower would reject. The vertical distance at that x is the follower's change of mind. The Stackelberg point lies on the curve, on the best contour the curve can reach.

## How to Read the Multipliers

Multipliers from **Karush-Kuhn-Tucker Verification** are the follower's shadow prices. A positive one means that the follower's constraint binds, and that loosening it would improve the follower's value at a rate given by the multiplier. They describe the follower's problem at fixed x. They do not measure a shadow price for the leader, whose response runs through the whole hierarchy. Multipliers can also lack uniqueness when more constraints bind than the single variable y requires, as happens at a kink, so one reported set is only one of several valid answers.

## How to Read the Price of Hierarchy

**Price of Hierarchy** subtracts the cooperative value from the Stackelberg value. It measures what the leader loses because the follower acts for itself, and it is never negative, as the cooperative problem has fewer restrictions. A value of zero means that interests align, at least at the optimum. **Cooperative Bound** shows that optimum, and `follower_accepts` shows whether the follower would agree. The joint problem is often called the high-point relaxation. Its bound can be poor, so a large price does not signal a flawed model.

## How to Read a Parametric Solve

**Parametric Solve** re-solves with an added cap x ≤ t, across the leader's range. A cap that does not bind changes nothing, so the curve flattens once t passes the unconstrained choice. Steps in the curve show thresholds at which a further region opens up. Bilevel values can jump, unlike those of ordinary convex programs, since small changes can change the follower's regime. A failed solve at a tight cap leaves a NaN and a gap. The figure answers how much restriction the leader can tolerate, for a regulator's cap or a budget.

## References

<a id="ref-Bar1998a"></a>Bard, J. F. (1998). *Practical Bilevel Optimization*. Springer. [doi:10.1007/978-1-4757-2836-1](https://doi.org/10.1007/978-1-4757-2836-1)

## See Also

- [Factsheet](factsheet.md) · [Bilevel Optimisation](bilevel.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
