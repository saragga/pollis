# Diagnostics

A solver's success message says that a reformulated problem was solved, and not that the bilevel answer is right. The checks in the panel test the answer directly.

## How to Verify the Follower's Optimality

**Karush-Kuhn-Tucker Verification** computes the follower's conditions at the solution, using multipliers from a fresh linear solve.

| Output | Expected |
|---|---|
| `primal_feasibility` | At most 0 |
| `dual_feasibility` | At least 0 |
| `stationarity` | Close to 0 |
| `complementarity` | Close to 0 |

A clear failure means that the reported y is not the follower's best response. Multipliers may not be unique, so a small difference from the MILP's multipliers is not an error.

## How to Check the Leader's Optimum Independently

**Optimality Check** reports the leader's objective, whether the leader's constraints hold, `follower_gap`, and the result of a dense grid search with 2001 points. `follower_gap` compares the solution's follower value with a direct solve, and should be close to 0. The grid value should match the leader's objective closely, and a grid value clearly below it is proof that the reformulated solve missed the optimum. A grid value slightly above is expected, as a grid can miss the exact vertex by up to its spacing.

## How to Detect a Bad Big-M

A too-small **Big-M** can make the problem infeasible, or cut off the true solution while still returning "optimal". Look for three signs: `solved` is false, the objective changes when **Big-M** rises, or the grid finds something better. Doubling **Big-M** repeatedly until the answer stops changing is a practical check, though no proof, and [Pineda and Morales (2019)](#ref-PM2019a) warn against trusting such heuristics blindly. Large **Big-M** values can also cause numerical issues, with binary values slightly off 0 or 1, so a very large setting has its own risks.

## How to Compare the Two Methods

**KKT vs Grid Search** runs the big-M method and grids of 401 and 2001 points, reporting x, y, objective and seconds. Values should agree within grid spacing. Spacing is (xhi − xlo) / (points − 1), so the two grids narrow the error fivefold, at about five times the cost. Note that this comparison calls `solve_kkt()` and `solve_grid()` with their own default settings, so **Big-M** and **Grid Points** do not apply. Timings on a first call include compilation, so they need a second run to be fair.

## How to Spot Modelling Mistakes

**Reaction Curve** and **Response Table** show y*(x) and whether the leader's constraints hold. Gaps in the curve mark values of x where the follower has no feasible response, or where the leader is infeasible. A flat or jumping curve can be right, as responses in a linear problem are piecewise. **Inducible Region** draws the joint feasible set, shaded, so a wrong sign in a constraint usually shows at once. Writing every constraint as "expression ≤ 0" is a common source of sign errors.

## What to Do When a Solve Fails

A failed run has `solved` as false and NaN values. Common causes are a follower that is infeasible at every x, an unbounded follower, or an unbounded leader. Test the follower at one fixed x with `follower(x)`, and test the joint problem with `high_point()`. HiGHS, described by [Huangfu and Hall (2018)](#ref-HH2018a), solves all the linear programs, so a status can be read through JuMP if needed. Adding bounds on x and y is often all that is required. **Leader Grid Search** can also give a first look with no **Big-M** at all.

## References

<a id="ref-HH2018a"></a>Huangfu, Q. and Hall, J. A. J. (2018). Parallelizing the dual revised simplex method. *Mathematical Programming Computation* 10(1), 119–142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-PM2019a"></a>Pineda, S. and Morales, J. M. (2019). Solving linear bilevel problems using big-Ms: not all that glitters is gold. *IEEE Transactions on Power Systems* 34(3), 2469–2471. [doi:10.1109/TPWRS.2019.2892607](https://doi.org/10.1109/TPWRS.2019.2892607)

## See Also

- [Assumptions](assumptions.md) · [Bilevel Optimisation](bilevel.md) · [Interpretation](interpretation.md)
