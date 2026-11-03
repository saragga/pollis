# Mathematical Programming with Equilibrium Constraints: Interpretation

The solution of an MPEC is a decision together with the equilibrium it induces. Reading it means asking which components of the equilibrium are active, how the equilibrium moves with the decision, and what the decision-maker gains by anticipating it.

## Reading the printed result

| Output | Reading in the default market |
|---|---|
| `x` | The leader's output |
| `y` | The followers' outputs at the leader's choice |
| `objective` | Minus the leader's profit |
| `complementarity_violation` | How closely the followers' equilibrium holds |
| `solved` | Whether the method reported success |

With **Objective F(x, y)** written as minus a profit, the leader's profit is minus `objective`. The price follows from the inverse demand, 10 minus the sum of x and y.

For a problem of one's own, x and y take the meaning given to them by the inputs, and the printed result reads the same way: the best decision found, the equilibrium at it, and the value of the objective there.

## Which components are active?

**Active Constraints** gives the status of each complementarity pair at the solution, within 1e-6.

| Status | Meaning | In the default market |
|---|---|---|
| `y > 0, f = 0` | The component is active and its condition holds with equality | The follower produces, with marginal revenue equal to its cost |
| `y = 0, f > 0` | The component is shut out | The follower does not produce, as its cost exceeds its marginal revenue at zero output |
| `degenerate (both zero)` | Both are zero | The follower is on the margin of entering |

The pattern of statuses is the combinatorial part of the answer: once it is known, the MPEC reduces to an ordinary nonlinear program on that branch. A degenerate pair marks a point where two branches meet.

## How does the equilibrium respond?

**Equilibrium Response** plots every component of y*(x) over the feasible range of x, solved by PATH at 200 points, with a dashed line at the solution.

The slope of each curve shows how strongly that component reacts to the decision. A curve that reaches zero and stays there marks the value of x beyond which the component is shut out, and the other curves can bend at the same point, since the equilibrium has one fewer active component from there on.

In the default market, the curves show how the followers' outputs adjust as the leader's output changes. The leader's problem is to choose a point on these curves, which is the reaction that [Sherali, Soyster and Murphy (1983)](#ref-SSM1983a) describe the Stackelberg firm taking into account.

## What happens as the decision is capped?

**Parametric MPEC** solves the MPEC again with an extra constraint x ≤ t, for 20 caps from near the lower end of the range up to the upper end, and plots the objective and y against the cap.

A tighter cap shrinks the feasible set, so the best objective cannot fall as the cap tightens. Where the cap exceeds the unconstrained solution, the objective is flat and the cap is slack. Where it binds, x equals the cap, the objective rises as the cap falls, and y follows its equilibrium response.

The chart answers a regulatory question: what a limit on the decision costs, and how the rest of the system responds.

## What does the equilibrium constraint cost?

**Relaxed Bound** drops the complementarity, keeps y ≥ 0 and f ≥ 0, and solves the relaxed problem with Ipopt.

The relaxed problem allows every point the MPEC allows and more, so its global minimum is a lower bound on the MPEC's. The output sets `relaxed_bound` beside `mpec_objective`.

| Reading | Meaning |
|---|---|
| A small gap | The equilibrium costs the decision-maker little |
| A large gap | The decision-maker would gain by controlling y directly |
| A relaxed `complementarity_violation` near zero | The relaxed solution is already an equilibrium |

In the default market, the relaxed problem lets the leader choose the followers' outputs within the region where none of them has a marginal revenue greater than its cost.

## What is anticipation worth?

**Value of Commitment** compares the MPEC with a simultaneous move. In the simultaneous move, x is a best response to y held fixed, on a grid of 4001 points, and y is the equilibrium at x, repeated until x stops changing.

| Output | Meaning |
|---|---|
| `mpec_x`, `mpec_objective` | The decision chosen anticipating the equilibrium |
| `nash_x`, `nash_objective` | The decision chosen as a best response |
| `value_of_commitment` | `nash_objective` minus `mpec_objective` |

The simultaneous outcome pairs a decision in the feasible range with its own equilibrium, so, whenever the outer constraints hold there, it is one of the points the MPEC compares. At a global solution of the MPEC, `value_of_commitment` is therefore at least zero. In the default market, the simultaneous move is a Cournot game among all three firms, and the value of commitment is the leader's gain in profit from moving first.

## References

<a id="ref-SSM1983a"></a>Sherali, H. D., Soyster, A. L., & Murphy, F. H. (1983). Stackelberg-Nash-Cournot Equilibria: Characterizations and Computations. *Operations Research* 31(2), 253-276. [doi:10.1287/opre.31.2.253](https://doi.org/10.1287/opre.31.2.253)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [MPEC](mpec.md)
