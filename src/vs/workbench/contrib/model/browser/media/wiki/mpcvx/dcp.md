# Disciplined Convex Programming

**Disciplined convex programming (DCP)**, introduced by [Grant, Boyd and Ye (2006)](#ref-GBY2006a), is a way of stating convex problems so that their convexity can be verified, and the problem converted to a form a solver accepts, automatically. Convex.jl implements it in Julia ([Udell, Mohan, Zeng, Hong, Diamond and Boyd (2014)](#ref-UMZHD...2014a)), and the Convex.jl (DCP) tab of the General Convex Programming panel states its problem this way.

## Atoms and Their Curvature in Convex.jl
A DCP expression is built from **atoms**: functions whose curvature (convex, concave or affine), sign and monotonicity in each argument are known. In Convex.jl, `sumsquares`, `norm`, `abs`, `quadform` and `logsumexp` are convex atoms, and `sqrt` and `log` are concave ones. `vexity(expr)` returns the curvature Convex.jl proves for an expression: `ConvexVexity`, `ConcaveVexity`, `AffineVexity`, `ConstVexity` or `NotDcp`; `sign(expr)` returns its sign. The **Convexity Check** reports the curvature of the problem, of the objective and of each constraint, and the sign of the objective.

## The DCP Composition Rules
[Grant, Boyd and Ye (2006)](#ref-GBY2006a) give the rules by which the curvature of an expression follows from its atoms. An atom applied to arguments is convex when the atom is convex and, for each argument, the argument is affine, or the atom is nondecreasing in it and the argument is convex, or the atom is nonincreasing in it and the argument is concave; concave expressions follow the mirror rule. Sums and non-negative multiples of convex expressions are convex. A problem is DCP when it minimises a convex expression or maximises a concave one, under constraints that set a convex expression at most a concave one, or two affine expressions equal.

## Why Convex.jl Refuses a Convex Problem
The DCP rules are sufficient for convexity, not necessary: a convex function written with atoms whose composition the rules do not cover has no proven curvature. Convex.jl then marks the expression `NotDcp`, warns that the problem is not DCP compliant, and `solve!` stops with a `DCPViolationError`. The **Broken Rule** step writes the Euclidean norm in two ways. `norm(x - t, 2)` is one convex atom, while `sqrt(sumsquares(x - t))` applies the concave, nondecreasing `sqrt` to a convex expression, a composition no rule covers. The remedy is to rewrite the expression with atoms whose composition the rules cover.

## From a DCP Problem to Cones
Because every atom has a known representation by cones, a DCP problem can be converted automatically into a conic programme ([Grant, Boyd and Ye (2006)](#ref-GBY2006a); [Udell, Mohan, Zeng, Hong, Diamond and Boyd (2014)](#ref-UMZHD...2014a)). Convex.jl adds variables and cone constraints for the atoms: a sum of squares becomes a rotated second-order cone, a 1-norm becomes linear inequalities, and `logsumexp` becomes exponential cones. **Conic Form** on the Convex.jl (DCP) tab counts the constraints of the conic programme Convex.jl passes to the solver, cone by cone, and the **Expression Graph** prints the problem as a tree, with the curvature and sign of each node.

## References

<a id="ref-GBY2006a"></a>Grant, M., Boyd, S. and Ye, Y. (2006). Disciplined Convex Programming. In Liberti, L. and Maculan, N. (eds), *Global Optimization: From Theory to Implementation*, 155–210. Springer. [doi:10.1007/0-387-30528-9_7](https://doi.org/10.1007/0-387-30528-9_7)

<a id="ref-UMZHD...2014a"></a>Udell, M., Mohan, K., Zeng, D., Hong, J., Diamond, S. and Boyd, S. (2014). Convex Optimization in Julia. *2014 First Workshop for High Performance Technical Computing in Dynamic Languages*, 18–28. IEEE. [doi:10.1109/HPTCDL.2014.5](https://doi.org/10.1109/HPTCDL.2014.5)

## See Also
- [Convex Programming](convex.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
