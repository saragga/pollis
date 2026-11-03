# Linear Optimal Control: Interpretation

The output is a matrix of gains and a few numbers, and their meaning depends on the units and the weights chosen. The readings ask what the gain does, what the cost pays for, and how much the loop can absorb.

## Reading the printed result

| Output | Meaning | Caution |
|---|---|---|
| `gain` | K, with rows for inputs and columns for states | Depends on the units of each state |
| `closed_loop_poles` | Eigenvalues of A − B K | Excludes the estimator on **Output-Feedback LQG** |
| `stable` | All of those inside the unit circle | Says nothing about how far inside |
| `simulated_cost` | Sum of stage costs over **Steps** | From **Initial State x0**, and for LQG from one noise path |

A single figure of `simulated_cost` is meaningful mostly in comparison, since its scale comes from Q, R and x0. For LQG it also changes with the seed, so a small difference between two designs may be chance.

## What the gain says

**Gain Analysis** shows `gain` and `relative_gain`, where each row is divided by its largest absolute entry.

An entry of K is the input produced per unit of the state in that column. A larger value does not by itself mean that the state matters more, since a state in smaller units gets a larger number for the same effect. To compare fairly, multiply each entry by the typical size of its state. In a double integrator, the second entry acts on velocity, and it is the source of damping, so the balance between the two sets how the response settles.

The signs are not arbitrary. Where B is positive, a positive entry of K gives an input that opposes that state.

## What does P tell you?

**Predicted Cost** shows `riccati_solution`, the matrix P of the Riccati equation, and x' P x is the total future cost from state x under the optimal law.

P therefore gives the value of a state before any simulation. Large diagonal entries mark states that are expensive to bring back, and an off-diagonal entry says that two states interact, so that a position error already moving in the right direction costs less. The quadratic form also implies scaling: doubling the state multiplies the noise-free cost by four, which `cost` in **Response from New State** shows on **State-Feedback LQR**. On **Output-Feedback LQG** noise spoils that exact ratio.

## Reading the trade-off curve

**Control-Weight Sweep** scales R by 0.01, 0.1, 1, 10 and 100, and plots `state_cost` against `control_cost`, each measured with the original Q and R, along with `spectral_radius`.

A point near the bend of the curve is usually a good design, as moving away from it trades a lot on one axis for little on the other. Only the ratio of Q to R affects K, so scaling both together changes nothing, and the sweep covers all designs that differ in overall balance. `spectral_radius` falls as R falls in the common case, with faster decay at the price of more effort, and values near 1 mark a slow design. Rows on **Output-Feedback LQG** share one seed, so they compare on one noise path and change `K` with `L` fixed.

## How much margin does the loop have?

**Stability Margins** reports how far the loop transfer is from instability, at the plant input.

| Output | Meaning | Reading |
|---|---|---|
| `gain_margin` | Factor by which the loop gain can rise before instability | Well above 1 is comfortable |
| `phase_margin_degrees` | Extra phase lag the loop can absorb | Larger is safer |
| `gain_crossover` | Frequency at which `gain_margin` is measured | Compare with the sampling frequency |
| `phase_crossover` | Frequency at which `phase_margin_degrees` is measured | Compare with the sampling frequency |

Classical design texts such as [D'Azzo, Houpis and Sheldon (2003)](#ref-DHS2003a) give the usual targets. Remember that the two crossover labels name the frequencies by the margin they belong to, and a textbook may use them the other way round.

## Which margins can you count on?

In continuous time with full state, multiloop LQR has strong guarantees, as [Safonov and Athans (1977)](#ref-SA1977a) show: at least 60 degrees of phase margin and an infinite upward gain margin in each loop. These facts are widely quoted, and they do not apply to these models.

In discrete time the loop satisfies only |1 + L| ≥ sqrt(R / (R + B' P B)) for one input, and the bound is below 1, so the guarantee weakens as R falls relative to B' P B. The margins have to be read, not assumed. On LQG the case is sharper still. Asked about guaranteed margins for LQG, the abstract of [Doyle (1978)](#ref-Doy1978a) reads in full: "There are none." The estimator can strip the margins away, so read `phase_margin_degrees` on **Output-Feedback LQG** before trusting the state-feedback figure.

## What a comparison with no control means

**vs. Uncontrolled** plots the state norm with u = 0 against the closed loop, from the same start. It makes the action of the controller visible at a glance, but both curves should be read with the open-loop poles in mind.

An unstable open loop diverges, and the plot's scale then hides the closed-loop curve. For the default double integrator the open loop does not decay at all. On **Output-Feedback LQG**, the closed-loop curve includes noise and the open-loop curve does not, so the small closed-loop ripple at the end cannot be compared to a flat open-loop line. Such ripple is the noise floor, which control does not remove.

## References

<a id="ref-DHS2003a"></a>D'Azzo, J. J., Houpis, C. H., & Sheldon, S. N. (2003). *Linear Control System Analysis and Design with MATLAB* (5th ed.). Marcel Dekker.

<a id="ref-Doy1978a"></a>Doyle, J. C. (1978). Guaranteed Margins for LQG Regulators. *IEEE Transactions on Automatic Control* 23(4), 756-757. [doi:10.1109/TAC.1978.1101812](https://doi.org/10.1109/TAC.1978.1101812)

<a id="ref-SA1977a"></a>Safonov, M. G., & Athans, M. (1977). Gain and Phase Margin for Multiloop LQG Regulators. *IEEE Transactions on Automatic Control* 22(2), 173-179. [doi:10.1109/TAC.1977.1101470](https://doi.org/10.1109/TAC.1977.1101470)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
