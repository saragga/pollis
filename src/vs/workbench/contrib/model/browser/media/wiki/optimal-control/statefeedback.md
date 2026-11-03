# State-Feedback LQR

When every state is known at each step, the optimal input for a linear system with a quadratic cost is a fixed matrix times the state. **State-Feedback LQR** computes that matrix and simulates the result without noise.

## What the code computes

The panel builds `sys = ss(A, B, I(n), 0, Ts)`, in which the output is the full state, and calls `K = lqr(sys, Q, R)`.

Behind the call is one matrix equation, the discrete algebraic Riccati equation, with solution P:

P = Q + A' P A − A' P B (R + B' P B)^(−1) B' P A

The gain then follows directly: K = (R + B' P B)^(−1) B' P A. `simulate` runs x[k+1] = A x[k] + B u[k] with u[k] = −K x[k] for **Steps** steps, and adds up the stage costs in `cost`. The derivation by dynamic programming is on the [Infinite Horizon](infinitehorizon.md) wiki.

## How the weights shape the response

| Change | Effect on the gain | Effect on the response |
|---|---|---|
| Raise an entry of **State Cost Q** | Larger, for that state | That state returns faster |
| Raise **Control Cost R** | Smaller | Gentler input, slower settling |
| Scale Q and R together | None | Identical `K`, scaled cost |
| Set an entry of Q to zero | Less attention to that state | It may drift, if stable |

As R grows, effort becomes expensive and the design moves towards the least effort that still stabilises. As R falls towards zero, effort stops counting and the response approaches the fastest that the sampled system allows. **Control-Weight Sweep** moves along that range.

## What a double integrator shows

The default model is a mass pushed by a force, with position and velocity as states and two poles at 1. Left alone, a mass at rest stays displaced for ever, so **vs. Uncontrolled** shows a flat line and the closed loop shows the decay.

`gain` has one row with two entries, a position gain and a velocity gain. Together they act as a spring and a damper chosen by the cost, and it is a useful exercise to raise the second entry of **State Cost Q** and watch how **State Trajectory** becomes more damped. The spring-and-damper reading comes from classical control, the subject of [D'Azzo, Houpis and Sheldon (2003)](#ref-DHS2003a).

## How does it compare with pole placement?

Pole placement also produces a gain K, by choosing the closed-loop poles directly. Each approach starts from a different specification.

| Feature | Pole placement | **State-Feedback LQR** |
|---|---|---|
| Designer states | Pole locations | Weights in the cost |
| Effort is considered | Not directly | Yes, through R |
| Multiple inputs | Gain not unique | Unique optimal gain |
| Result | Exact poles | Optimal cost, poles follow from it |

With several inputs, LQR settles how to share effort among them, where pole placement leaves that open. Both need a controllable pair, or at least a stabilisable one for LQR. To see the poles an LQR design has chosen, read `closed_loop_poles`, or use **Closed-Loop Poles**.

## Limits of the full-state assumption

Every state has to be available at each step, without noise or delay. A velocity obtained by differencing a position is really an estimate, with noise and a lag of its own, so the loop no longer has the properties computed here.

If some states are unmeasured, the alternative is **Output-Feedback LQG**, and the same `K` is still the one used. A delay in the loop can be folded into the state by adding past inputs as states, which leaves the problem in the same form. On the discrete-time margins, read the [Interpretation](interpretation.md) wiki before quoting the guarantee of [Safonov and Athans (1977)](#ref-SA1977a), which holds for continuous-time loops.

## References

<a id="ref-DHS2003a"></a>D'Azzo, J. J., Houpis, C. H., & Sheldon, S. N. (2003). *Linear Control System Analysis and Design with MATLAB* (5th ed.). Marcel Dekker.

<a id="ref-SA1977a"></a>Safonov, M. G., & Athans, M. (1977). Gain and Phase Margin for Multiloop LQG Regulators. *IEEE Transactions on Automatic Control* 22(2), 173-179. [doi:10.1109/TAC.1977.1101470](https://doi.org/10.1109/TAC.1977.1101470)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
