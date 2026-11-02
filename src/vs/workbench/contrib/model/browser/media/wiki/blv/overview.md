# Overview

Some decisions are made in a hierarchy: one party moves first, knowing that another will then respond in its own interest. The panel solves such a problem by two routes, and shows how to check the answer.

## What Bilevel Optimisation Is

A bilevel problem has a leader and a follower. The leader chooses x and announces it. The follower then chooses y to minimise its own objective, given x. The leader's cost depends on both, so it must allow for the response when choosing. A road authority setting tolls, knowing that drivers will re-route, is the classic picture. [Colson, Marcotte and Savard (2007)](#ref-CMS2007a) survey the field. Ignoring the follower's reaction, and treating y as if the leader controlled it, leads to plans that the follower would refuse.

## How the Two Tabs of the Hierarchical Optimisation Panel Differ

**KKT Reformulation** replaces the follower with its optimality conditions, which turns the whole problem into one mixed-integer linear program, solved exactly by HiGHS. **Leader Grid Search** tries values of x along a grid, solves the follower's linear program at each one, and keeps the best. The first scales to many leader variables, and it depends on a **Big-M** bound. The second needs no reformulation and no such bound, and only works for one leader variable. Running both is a useful check.

## Which Problem the Panel Solves by Default

The default is Example 5.1.1 of [Bard (1998)](#ref-Bar1998a), a small linear problem:

- Leader: minimise x − 4y, subject to x ≥ 0
- Follower: minimise y, subject to x + y ≥ 3, y ≤ 2x, 2x + y ≤ 12, 3x − 2y ≤ 4 and y ≥ 0

The inputs take any Julia expressions in the scalars x and y, provided that the follower's problem stays linear in y. Constraints are written as lists of expressions that must be at most zero.

## What the Hierarchical Optimisation Panel Reports

A run prints `leader_x`, `follower_y`, `leader_objective`, `follower_objective` and `solved`. The solution is called a Stackelberg solution, after the leader-follower game of economics. It is optimistic: where the follower is indifferent, it picks what suits the leader. The code leaves `solve_bilevel`, `follower`, `high_point`, `solve_kkt` and `solve_grid` available for the Next Steps. `BilevelJuMP.jl`, by [Dias Garcia, Bodin and Street (2024)](#ref-GBS2024a), carries out the reformulation behind **KKT Reformulation**.

## A Common Workflow for a Bilevel Problem

1. Enter the objectives and constraints, and solve with **KKT Reformulation**.
2. Use **Karush-Kuhn-Tucker Verification** and **Optimality Check** to confirm the answer.
3. Use **KKT vs Grid Search** to compare the two methods.
4. Use **Reaction Curve** and **Inducible Region** to see the geometry.
5. Use **Cooperative Bound** and **Price of Hierarchy** to measure the cost of the hierarchy.
6. Use **Parametric Solve** to test a restriction on the leader.

## References

<a id="ref-Bar1998a"></a>Bard, J. F. (1998). *Practical Bilevel Optimization*. Springer. [doi:10.1007/978-1-4757-2836-1](https://doi.org/10.1007/978-1-4757-2836-1)

<a id="ref-CMS2007a"></a>Colson, B., Marcotte, P. and Savard, G. (2007). An overview of bilevel optimization. *Annals of Operations Research* 153(1), 235–256. [doi:10.1007/s10479-007-0176-2](https://doi.org/10.1007/s10479-007-0176-2)

<a id="ref-GBS2024a"></a>Dias Garcia, J., Bodin, G. and Street, A. (2024). BilevelJuMP.jl: modeling and solving bilevel optimization problems in Julia. *INFORMS Journal on Computing* 36(2), 327–335. [doi:10.1287/ijoc.2022.0135](https://doi.org/10.1287/ijoc.2022.0135)

## See Also

- [Factsheet](factsheet.md) · [Bilevel Optimisation](bilevel.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
