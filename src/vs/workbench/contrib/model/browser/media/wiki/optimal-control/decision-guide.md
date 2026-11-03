# Linear Optimal Control: Decision Guide

Two choices shape a design here: which model fits what can be measured, and how to set the weights. The second usually takes more care, because the gain follows directly from it.

## Which model fits the measurements?

| What you can measure | Model | Reason |
|---|---|---|
| Every state, with little noise | **State-Feedback LQR** | No estimator to add dynamics or lose margin |
| Part of the state, with noise | **Output-Feedback LQG** | Kalman estimate stands in for the missing states |
| Every state, with heavy noise | **Output-Feedback LQG**, with C as the identity | A filter cleans up the measurements |
| Part of the state, noise unknown | **Output-Feedback LQG**, with W and V as tuning values | Treat the noise inputs as design choices |

A state that can be computed from measurements without lag counts as measured. Start with **State-Feedback LQR** even when the plant needs an estimator, since it shows the best the loop could do, and the gap to **Output-Feedback LQG** is then the price of estimation.

## How should Q and R be set?

A common starting point makes both weights diagonal, with each entry equal to 1 over the square of the largest acceptable value of that variable. A state allowed to deviate by 0.1 gets a weight of 100, and an input allowed to reach 2 gets a weight of 0.25. Units then cancel, and each term is about 1 when its variable is at its limit.

From there, adjust using the results. If a state responds too slowly, raise its entry in **State Cost Q**. If the input is too large, raise **Control Cost R**. **Control-Weight Sweep** shows the overall balance, and only relative sizes matter, as a common scale on Q and R leaves `K` unchanged. Off-diagonal entries are seldom needed. A worked discussion of quadratic criteria is in [Kirk (2012)](#ref-Kir2012a).

## How should W and V be set?

Measure them if possible: V from the variance of a sensor at rest, and W from what is known about the disturbances. Often they are not known well, and the two then act as a dial for the filter.

| Change | Effect on `L` | Filter behaviour |
|---|---|---|
| Larger W relative to V | Larger | Follows measurements quickly, more noise in the estimate |
| Smaller W relative to V | Smaller | Trusts the model, smooth but slower |
| Only a common scale | None | `L` depends on the ratio only |

A common scale on W and V does change `simulated_cost`, because the simulation uses them as real noise. To treat them purely as tuning values, judge the design from the poles and the margins as well as the cost.

## Should the panel be used at all?

| Situation | Better approach |
|---|---|
| Hard limits on inputs or states | **Model Predictive Control** |
| Nonlinear plant, far from one operating point | Nonlinear methods under **Optimal Control** |
| Short task with a fixed end time | A finite-horizon gain, see [Finite Horizon](finitehorizon.md) |
| Unknown model, data available | **Reinforcement Learning**, or identify A and B first |
| Tracking a reference | Rewrite the state as an error first |

A plant that is only nearly linear is still a good case for these models. LQR around an operating point is a standard first design, and the role of that step in design practice is explained by [Athans (1971)](#ref-Ath1971a).

## How fast should it be sampled?

**Sample Time** does not enter the design directly, as it comes in through A and B. Sampled-data and digital control systems are treated in [D'Azzo, Houpis and Sheldon (2003)](#ref-DHS2003a).

Slower sampling leaves more time between corrections, and the loop gives up margin. Very fast sampling brings the poles close to 1 and can make numerical work harder. After any change, rebuild **System Matrix A** and **Input Matrix B** from the continuous model, and rescale **State Cost Q** and **Control Cost R** with the sample time.

## A sensible order of work

1. Run **Controllability & Observability** first, before reading any gain.
2. Set Q and R from acceptable sizes, and read the **Control Signal** chart at the largest start expected.
3. Use **Control-Weight Sweep** to find the bend in the trade-off curve.
4. Confirm with **Closed-Loop Poles** and **Stability Margins**.
5. Move to **Output-Feedback LQG** if the states are not all measured, and set W and V.
6. Read the margins again, since estimation can reduce them.
7. Test on a perturbed plant by editing `simulate`.

Step 7 matters most for a real system, as the other simulations use the design model itself.

## References

<a id="ref-Ath1971a"></a>Athans, M. (1971). The Role and Use of the Stochastic Linear-Quadratic-Gaussian Problem in Control System Design. *IEEE Transactions on Automatic Control* 16(6), 529-552. [doi:10.1109/TAC.1971.1099818](https://doi.org/10.1109/TAC.1971.1099818)

<a id="ref-DHS2003a"></a>D'Azzo, J. J., Houpis, C. H., & Sheldon, S. N. (2003). *Linear Control System Analysis and Design with MATLAB* (5th ed.). Marcel Dekker.

<a id="ref-Kir2012a"></a>Kirk, D. E. (2012). *Optimal Control Theory: An Introduction*. Dover Publications.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
