# Finite Horizon LQR

A task with a fixed end calls for a gain that changes with the time remaining. The panel computes the stationary gain of a long horizon, so the finite-horizon solution is a way of understanding where that gain comes from, and of seeing when it is not the right one.

## What changes when the horizon is finite?

The problem minimises x[T]' Qf x[T] plus the sum for k from 0 to T − 1 of x[k]' Q x[k] + u[k]' R u[k], where Qf is the cost on the final state.

A finite end means that the value of being in a state depends on the time left. Near the end there is little reason to spend effort on a state error that is about to stop counting, and with one step left only the immediate effects matter. The optimal law is still linear in the state, but its gain depends on k: u[k] = −K[k] x[k]. **Steps** in the panel sets only the length of a simulation and does not produce such a design.

## How the backward recursion works

Dynamic programming solves the problem from the end, as [Bertsekas (2017)](#ref-Ber2017a) sets out for this linear-quadratic case. The cost to go from step k has the form x' P[k] x, and P[k] follows from P[k+1]:

1. Start with P[T] = Qf.
2. Compute K[k] = (R + B' P[k+1] B)^(−1) B' P[k+1] A.
3. Compute P[k] = Q + A' P[k+1] A − A' P[k+1] B K[k].
4. Repeat down to k = 0.

The gains are computed once, backwards in time, and stored. Running the controller then goes forward, looking up K[k] at each step. The optimal total cost from x[0] is x[0]' P[0] x[0], and each step of the recursion costs a few matrix products.

## How the gain settles towards the stationary one

Far from the end, the recursion converges under the conditions of stabilisability and detectability. P[k] approaches the P of the Riccati equation, and K[k] approaches the stationary `K`.

For most of a long task the gain is therefore almost constant, and it changes only over a short final stretch. That explains why the stationary gain is such a good approximation, and why the panel's `K` is the same for any value of **Steps**. The length of the final stretch depends on how quickly the closed loop decays, and it is of the order of the settling time. If the horizon is many times longer than that, the extra benefit of the time-varying gain is small.

## When the time-varying gain matters

| Situation | Use | Reason |
|---|---|---|
| Horizon many times the settling time | Stationary `K` | The final stretch hardly matters |
| Horizon comparable to the settling time | K[k] | The gain changes over much of the task |
| A required state at the end | K[k], with a large Qf | Only the final cost can demand it |
| Time-varying A or B | K[k] | No stationary solution applies |
| Regulation with no end | Stationary `K` | Nothing singles out a final time |

A rendezvous, a landing or a planned manoeuvre belongs in the K[k] rows. A worked treatment of the continuous and discrete versions is in [Kirk (2012)](#ref-Kir2012a).

## How to get finite-horizon behaviour from the panel

No input of the panel asks for this design, but the recursion is short enough to add to the code. After `n, m = size(B)`, write the loop from the steps above for your T and Qf, with a list of gains filled from the last to the first.

Then copy `simulate` with `K[k]` in place of `K`. **Predicted Cost** then provides a useful yardstick, since `predicted_cost` from the stationary P applies to the infinite-horizon problem. Compare it with x0' P[0] x0 as T grows and watch the two meet.

## References

<a id="ref-Ber2017a"></a>Bertsekas, D. P. (2017). *Dynamic Programming and Optimal Control, Vol. 1* (4th ed.). Athena Scientific.

<a id="ref-Kir2012a"></a>Kirk, D. E. (2012). *Optimal Control Theory: An Introduction*. Dover Publications.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Infinite Horizon](infinitehorizon.md)
