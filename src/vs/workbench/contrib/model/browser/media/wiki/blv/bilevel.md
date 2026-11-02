# Bilevel Optimisation

A bilevel problem places one optimisation inside the constraints of another. Solving it means reasoning about a follower's response, and the standard route turns that response into a set of algebraic conditions.

## How a Bilevel Problem Is Written

- Leader: minimise F(x, y) over x, subject to G(x, y) ≤ 0
- With y solving the follower's problem at x: minimise f(x, y) over y, subject to g(x, y) ≤ 0

The follower's choice y*(x) is called the reaction. The set of pairs (x, y*(x)) that also satisfy the leader's constraints is the inducible region. It is the set of outcomes that the leader can bring about. The texts by [Dempe (2002)](#ref-Dem2002a) and by [Dempe, Kalashnikov, Pérez-Valdés and Kalashnykova (2015)](#ref-DKPK2015a) develop the theory.

## Why Bilevel Problems Are Hard

The leader's feasible set is defined by another optimisation, so it is generally not convex, even with linear objectives and constraints throughout. It can be a chain of segments, and with constraints on the follower's variable at the upper level, it can be disconnected. Local optima may therefore not be global. [Hansen, Jaumard and Savard (1992)](#ref-HJS1992a) show that even the linear case is strongly NP-hard, so exact methods can take exponential time as the number of variables grows.

## How the KKT Reformulation Works

A convex follower is fully described by its Karush-Kuhn-Tucker conditions:

- Primal feasibility: g(x, y) ≤ 0
- Dual feasibility: lambda ≥ 0
- Stationarity: df/dy + sum of lambda_i dg_i/dy = 0
- Complementarity: lambda_i g_i(x, y) = 0 for every i

Replacing the inner problem by these conditions gives a single-level problem, with extra variables lambda. Complementarity is what makes that problem difficult, as each product forces either a multiplier or a slack to zero, which is a choice among combinations.

## How Big-M Linearises Complementarity

[Fortuny-Amat and McCarl (1981)](#ref-FAM1981a) replace each product with a binary variable z_i and two bounds:

- lambda_i ≤ M z_i
- −g_i(x, y) ≤ M (1 − z_i)

If z_i = 0 the multiplier must vanish, and if z_i = 1 the constraint must bind. Linear follower constraints then yield a mixed-integer linear program. The code sets `FortunyAmatMcCarlMode`, with **Big-M** used for both slack and dual bounds, and HiGHS solves the result. M must exceed the true values of both, a demand that is hard to check in advance.

## Why Optimistic and Pessimistic Solutions Differ

If the follower has several optimal responses at x, the problem as stated is ambiguous. An optimistic solution assumes that the follower picks the one best for the leader, and a pessimistic solution assumes the worst one. The panel uses the optimistic form. `follower` makes that explicit: it solves the follower's problem, then fixes its value within 1e-9 and minimises F. Optimistic solutions can overstate the leader's result, since nothing compels the follower to help. A strict follower objective removes the question, as it leaves a unique response.

## Where the Reformulation Can Go Wrong

Equivalence needs a convex follower with a suitable constraint qualification, and a linear follower satisfies that. Global solutions of the two problems then coincide, though [Dempe and Dutta (2012)](#ref-DD2012a) show that local solutions of the reformulated problem need not be local solutions of the bilevel one. A non-convex follower breaks the reformulation altogether, as KKT conditions no longer imply optimality. Linear objectives and constraints avoid these traps, and an exact global MILP solve avoids the local-solution trap.

## References

<a id="ref-Dem2002a"></a>Dempe, S. (2002). *Introduction to Bilevel Programming*. Kluwer Academic Publishers. [doi:10.1007/b101970](https://doi.org/10.1007/b101970)

<a id="ref-DD2012a"></a>Dempe, S. and Dutta, J. (2012). Is bilevel programming a special case of a mathematical program with complementarity constraints? *Mathematical Programming* 131(1–2), 37–48. [doi:10.1007/s10107-010-0342-1](https://doi.org/10.1007/s10107-010-0342-1)

<a id="ref-DKPK2015a"></a>Dempe, S., Kalashnikov, V., Pérez-Valdés, G. A. and Kalashnykova, N. (2015). *Bilevel Programming Problems: Theory, Algorithms and Applications to Energy Networks*. Springer. [doi:10.1007/978-3-662-45827-3](https://doi.org/10.1007/978-3-662-45827-3)

<a id="ref-FAM1981a"></a>Fortuny-Amat, J. and McCarl, B. (1981). A representation and economic interpretation of a two-level programming problem. *Journal of the Operational Research Society* 32(9), 783–792. [doi:10.1057/jors.1981.156](https://doi.org/10.1057/jors.1981.156)

<a id="ref-HJS1992a"></a>Hansen, P., Jaumard, B. and Savard, G. (1992). New branch-and-bound rules for linear bilevel programming. *SIAM Journal on Scientific and Statistical Computing* 13(5), 1194–1217. [doi:10.1137/0913069](https://doi.org/10.1137/0913069)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
