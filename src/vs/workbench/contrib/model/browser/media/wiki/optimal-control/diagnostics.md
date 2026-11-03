# Linear Optimal Control: Diagnostics

A Riccati solver usually returns a gain whenever one exists, so the checks ask something else: whether the problem was well posed, whether the loop is stable by a comfortable distance, and whether the cost and the signals look as the theory predicts.

## Is the problem well posed?

**Controllability & Observability** compares ranks with `n` and lists `open_loop_poles`.

| Output | Rank n means | Rank below n means |
|---|---|---|
| `controllability_rank` | u can place every pole | Some modes ignore u, and any unstable one is fatal |
| `cost_observability_rank` | Q sees every mode | Some modes are not penalised, and the gain ignores stable ones |
| `measurement_observability_rank` | y reveals every state | The estimator cannot correct some modes |

A stabilising solution requires stabilisability and detectability, so a rank below n is acceptable when the missing modes are stable. For each mode missing from a rank, check whether its pole in `open_loop_poles` lies inside the unit circle. Rank is also sharp at the edge: nearly dependent columns can pass the test while the design needs very large gains.

## How stable is the closed loop?

**Closed-Loop Poles** draws the open-loop poles, the poles of A − B K and, on **Output-Feedback LQG**, those of A − L C, all against the unit circle.

`stable` is true when `maximum(abs, eigvals(A_cl)) < 1`, which is a yes-or-no answer. The distance from the circle is what matters in practice: a pole of modulus r shrinks that mode by r per step, so r very near 1 means slow decay even though `stable` is true. A pole near −1 or with a large angle gives an oscillation at each sample, which is usually a sign of too aggressive a design for that **Sample Time**.

On **Output-Feedback LQG**, `stable` refers to A − B K, and the diamonds on the chart show A − L C. Read both, as both sets belong to the closed loop.

## Do the signals look reasonable?

**State Trajectory** should settle to zero at the speed implied by the poles, and **Control Signal** should be largest at the start and decay, as u = −K x follows the state.

| Symptom | Likely reason | Try |
|---|---|---|
| Very large first input | Small **Control Cost R** | Raise R |
| Slow, sluggish states | Large R, or small **State Cost Q** | Lower R |
| Oscillation from step to step | Gains too high for the sample time | Raise R, or sample faster |
| One state never settles | Mode not seen by Q or not reached by B | **Controllability & Observability** |

**Steps** has to be long enough for the settling to be visible, since it sets only the length of the simulation and has no effect on the gain.

## Does the simulated cost match the prediction?

**Predicted Cost** computes `riccati_solution` as P from `ared`, then `predicted_cost` as x0' P x0, the total cost over an infinite horizon. `simulated_cost` is the same sum truncated at **Steps**.

On **State-Feedback LQR**, the two should agree closely when the state has settled by the end, with the simulated figure slightly lower. A large gap means **Steps** is too short. A simulated cost above the prediction points to an error in the model or the inputs.

On **Output-Feedback LQG** the two cannot be expected to agree. Noise never stops, so `simulated_cost` keeps growing with **Steps**, the estimate starts at zero, and `predicted_cost` includes neither effect.

## How well does the estimator track?

**State Trajectory** on **Output-Feedback LQG** draws the estimates as dashed lines beside the true states. They start apart, because `x_hat` begins at zero, and the gap should close at the rate of the poles of A − L C.

A persistent gap suggests **Output Matrix C** cannot see the state in question, and `measurement_observability_rank` tells you whether that is so. A jagged estimate follows noise too closely, which means **Process Noise W** is high relative to **Measurement Noise V**. A smooth one that lags at the start has the opposite balance. The filter comes from [Kalman (1960)](#ref-Kal1960a), and real noise statistics seldom match the values entered, so these ratios deserve a check.

## How robust is the loop?

**Stability Margins** breaks the loop at the plant input and gives `gain_margin` and `phase_margin_degrees`, for one input and one output.

`gain_crossover` is the frequency at which the `gain_margin` is measured, and `phase_crossover` the frequency at which the `phase_margin_degrees` is measured. `margin` gives the gain margin as a magnitude and the phase margin in degrees, and it returns the smallest of each. Compare the two models on the same problem, since the warning of [Doyle (1978)](#ref-Doy1978a) is that the estimator can remove the margins of the state-feedback design, however good they were.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| Error from `lqr` | An unstabilisable mode, or an R that is not positive definite | **Controllability & Observability**, then check R |
| Error from `kalman` | Unobservable unstable mode, or V not positive definite | Check C and V |
| Size mismatch | B not a matrix, or x0 of the wrong length | Use `reshape` for one input |
| Error from `cholesky` | V not positive definite | Check **Measurement Noise V** |
| `stable` is false | A failed solve or an inconsistent input | Recheck A and B |
| **Stability Margins** fails | More than one input or output | Reduce to one channel, or analyse the channels apart |

## References

<a id="ref-Doy1978a"></a>Doyle, J. C. (1978). Guaranteed Margins for LQG Regulators. *IEEE Transactions on Automatic Control* 23(4), 756-757. [doi:10.1109/TAC.1978.1101812](https://doi.org/10.1109/TAC.1978.1101812)

<a id="ref-Kal1960a"></a>Kalman, R. E. (1960). A New Approach to Linear Filtering and Prediction Problems. *Journal of Basic Engineering* 82(1), 35-45. [doi:10.1115/1.3662552](https://doi.org/10.1115/1.3662552)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
