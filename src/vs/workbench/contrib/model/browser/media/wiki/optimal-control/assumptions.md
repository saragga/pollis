# Linear Optimal Control: Assumptions

Optimality here is exact, but only for the problem as posed: a linear model, a quadratic cost, Gaussian noise and an input without limits. The checks on A, B, Q and R decide whether a solution exists, and the rest decide whether the answer means anything for the real system.

## Is the system really linear?

The model x[k+1] = A x[k] + B u[k] is usually a linearisation around an operating point of a nonlinear system. `K` is then optimal for the linear model only, and the closed loop behaves as designed only while the state stays near that point.

A large **Initial State x0** is therefore a test of the model as well as the controller. In the panel's simulations the plant is the linear model itself, so **Response from New State** looks equally good at any scale, and it will not reveal a range limit. The design approach of [Athans (1971)](#ref-Ath1971a) treats linearisation around a desired response as an explicit step, followed by a check on the nonlinear plant.

## What must hold for a solution to exist?

| Condition | On which pair | Requirement | If not met |
|---|---|---|---|
| Stabilisability | (A, B) | Every unstable mode can be moved by u | No stabilising gain exists |
| Detectability | (A, Q^(1/2)) | Every unstable mode is seen by the cost | The optimum may leave a mode unstable |
| Positive definite | R | All inputs cost something | The problem is ill-posed |
| Positive semidefinite | Q | No reward for deviation | The cost has no lower bound |

**Controllability & Observability** gives the ranks, and a rank of n meets the condition at once. A rank below n is acceptable if the lost modes are stable, which `open_loop_poles` lets you judge.

## Do the inputs have limits?

The optimal u is linear in the state and can be arbitrarily large. A real actuator saturates, and the cost has no knowledge of that.

The only tool in these models is **Control Cost R**, which lowers effort in the sense of the average, with no bound at each step. Read `peak_control` in **Response from New State** and the **Control Signal** chart, and raise R until the largest input is acceptable at the largest **Initial State x0** expected. A hard limit that is reached in practice breaks the linear analysis, including the stability result, and **Model Predictive Control** treats such limits directly.

## What does the noise model assume?

On **Output-Feedback LQG**, w and v are zero-mean, Gaussian, white and independent of each other. The Kalman filter of [Kalman (1960)](#ref-Kal1960a) is then the best estimator, and it remains the best linear estimator without Gaussianity.

| Assumption | Typical breach | Effect |
|---|---|---|
| Known W and V | Guessed values | The gain is no longer optimal, though it may be stable |
| White noise | Slow drift, biases | The estimate carries a persistent error |
| Independent w and v | Shared source | Performance below the design |
| Noise enters as w directly | A disturbance through a specific channel | Set W to reflect that channel |

**Process Noise W** adds directly to the state, so a disturbance entering through B has covariance B Σ B' for a force covariance Σ.

## Does the model have to be exact?

The formula assumes that A and B are known, and real models always contain errors. Full-state LQR tolerates a good deal of this in continuous time, because of its strong margins. A sampled-data loop tolerates less, and an LQG loop may have very little.

The simulations use the same A and B as the design. To test the effect of model error, design with the current matrices and then edit `simulate` in the code so that the plant uses a perturbed A. **Stability Margins** gives one quantitative measure of what can be tolerated, for one input and one output.

## Are the units and the sampling consistent?

Q and R compare quantities with different units, so the numbers mean nothing until the units are fixed. A state in metres and another in micrometres need very different weights to express the same concern.

The cost is also a sum per step, so halving **Sample Time** doubles the number of terms for the same real duration. To keep a design comparable across sample times, scale Q and R with the sample time. A and B have to be resampled as well, since **Sample Time** alone does not change them. The default **Input Matrix B** assumes a zero-order hold, in which the input stays constant over each sample, and that is the form of the **Control Signal** chart. Sampled-data and digital control systems are treated in [D'Azzo, Houpis and Sheldon (2003)](#ref-DHS2003a).

## References

<a id="ref-Ath1971a"></a>Athans, M. (1971). The Role and Use of the Stochastic Linear-Quadratic-Gaussian Problem in Control System Design. *IEEE Transactions on Automatic Control* 16(6), 529-552. [doi:10.1109/TAC.1971.1099818](https://doi.org/10.1109/TAC.1971.1099818)

<a id="ref-DHS2003a"></a>D'Azzo, J. J., Houpis, C. H., & Sheldon, S. N. (2003). *Linear Control System Analysis and Design with MATLAB* (5th ed.). Marcel Dekker.

<a id="ref-Kal1960a"></a>Kalman, R. E. (1960). A New Approach to Linear Filtering and Prediction Problems. *Journal of Basic Engineering* 82(1), 35-45. [doi:10.1115/1.3662552](https://doi.org/10.1115/1.3662552)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
