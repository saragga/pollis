# Assumptions

A bilevel model rests on behavioural assumptions about the follower, and a solution method adds mathematical ones. Each should be weighed before a result is used.

## What the Leader-Follower Hierarchy Assumes

The model assumes that the leader truly moves first and that the follower observes x before choosing. It also assumes that the leader cannot be matched by a counter-move. In a simultaneous game, the same payoffs give a Nash equilibrium and a different answer. Commitment matters as well: the plan works only if the leader cannot later change x, and if the follower believes that. [Dempe (2002)](#ref-Dem2002a) gives the mathematical framing, and whether it fits a situation is a question for the modeller.

## What Rational Follower Behaviour Assumes

The follower is taken to solve its problem exactly, with an objective known to the leader. A real follower may be boundedly rational, informed differently, or driven by goals that the model omits. Such a follower may respond differently, and the leader's expected result may then not arrive. Sensitivity analysis of the follower's objective is a useful guard. Several followers competing with each other are a richer model, which the panel's single scalar y does not cover.

## Why the Follower Must Be Linear in y

Both tabs rely on it. **KKT Reformulation** uses an exact KKT description and linear big-M constraints, and **Leader Grid Search** solves the follower with a linear solver. The tooltip of each follower input states the requirement. Products of x and y are acceptable from the follower's view, since x is then a number, but they make the reformulated problem bilinear, and a linear solver cannot then handle the upper level. **Karush-Kuhn-Tucker Verification** also estimates the y-gradients with a step of 1, which is exact only for linear y.

## What Big-M Assumes

The reformulation assumes that M exceeds every multiplier and every slack at the solution. Multipliers are not bounded by any simple formula, and [Pineda and Morales (2019)](#ref-PM2019a) show that common ways of picking big-M can yield a wrong solution with no warning. A smaller M is tighter and faster, and a larger M is safer, but it weakens the relaxation and can cause numerical trouble. The default of 100 suits the small default problem and has no general claim. Checks with a larger value, and with a grid, guard against a bad choice.

## What Optimism and Bounded Ranges Assume

Optimism assumes that ties break in the leader's favour. Where the follower has a unique response, the point does not arise, and the **Response Table** helps to reveal when it might. The code also finds the range of x from the joint constraints, so it assumes that this range is finite. An unbounded x makes `high_point` and the grid fail, and calls for an added bound. The solution reported is then valid only within that bound.

## What the Scalar Setup Assumes

The tabs treat x and y as scalars, because that lets a user draw and check everything. Real problems often have many variables, and the grid no longer works there. **KKT Reformulation** itself generalises directly, with vector variables in `solve_kkt`, at the price of a bigger integer program whose time can grow quickly. Code for the plots, the grid and the checks would all need rewriting. Conclusions on run time from the small default problem do not carry over.

## References

<a id="ref-Dem2002a"></a>Dempe, S. (2002). *Introduction to Bilevel Programming*. Kluwer Academic Publishers. [doi:10.1007/b101970](https://doi.org/10.1007/b101970)

<a id="ref-PM2019a"></a>Pineda, S. and Morales, J. M. (2019). Solving linear bilevel problems using big-Ms: not all that glitters is gold. *IEEE Transactions on Power Systems* 34(3), 2469–2471. [doi:10.1109/TPWRS.2019.2892607](https://doi.org/10.1109/TPWRS.2019.2892607)

## See Also

- [Factsheet](factsheet.md) · [Bilevel Optimisation](bilevel.md) · [Diagnostics](diagnostics.md)
