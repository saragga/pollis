# Output-Feedback LQG

When only noisy outputs are available, the Linear Quadratic Gaussian controller combines an optimal estimator with the optimal state-feedback gain. **Output-Feedback LQG** designs the two parts separately and simulates them together with noise.

## What the code computes

The panel builds `sys = ss(A, B, C, 0, Ts)` and makes two independent calls: `K = lqr(sys, Q, R)` and `L = kalman(sys, W, V)`.

| Step in `simulate` | Formula |
|---|---|
| Measure | y = C x + v |
| Act on the estimate | u = −K x_hat |
| Advance the plant | x[k+1] = A x + B u + w |
| Advance the estimate | x_hat[k+1] = A x_hat + B u + L (y − C x_hat) |

The input at step k uses the estimate made before y[k] arrived, so this is a predictor. A filter form would use y[k] straight away, and it would perform slightly better at the price of a direct path from measurement to input. The noises are drawn from W and V with `Xoshiro(seed)` and `seed = 1`.

## What the Kalman gain does

The estimator runs a copy of the model and corrects it by the difference between the measured and the predicted output. [Kalman (1960)](#ref-Kal1960a) gave the gain that minimises the variance of the estimation error.

In steady state, that gain comes from a second Riccati equation, dual to the control equation, with S as the prediction-error covariance:

S = A S A' + W − A S C' (C S C' + V)^(−1) C S A'

L = A S C' (C S C' + V)^(−1)

The equation is the control equation with A' in place of A, C' in place of B, W in place of Q and V in place of R. Larger **Process Noise W** means that the model is less reliable, so L grows and the filter leans on y. Larger **Measurement Noise V** means the opposite.

## Why the two designs can be done apart

The estimation error does not depend on the input, since the same u enters both plant and model and cancels in the difference. Its covariance is therefore fixed by the noise, and no choice of K can improve it.

The cost then splits. [Joseph and Tou (1961)](#ref-JT1961a) showed for linear multivariable systems that optimum performance follows when controller and estimator are independently designed in an optimum manner, and [Wonham (1968)](#ref-Won1968a) studied how far the theorem extends. The same split appears in the eigenvalues: the closed loop of plant and estimator has exactly the eigenvalues of A − B K together with those of A − L C. **Closed-Loop Poles** draws the two sets, and the printed `closed_loop_poles` holds only the first.

## What cost should you expect?

Noise never stops, so the total cost grows with **Steps** and has no finite limit, and the proper measure is the cost per step. Part of that cost comes from the process noise, which no controller avoids, and part from acting on an imperfect estimate, which falls as the estimate improves.

Dividing `simulated_cost` by **Steps** over a long run gives an estimate of the cost per step, once the transient from **Initial State x0** has gone. `predicted_cost` in **Predicted Cost** answers a different question, since x0' P x0 is the cost of the noise-free problem.

## What happens to the robustness?

The state-feedback loop has margins of its own, and the estimator changes the loop. Separation guarantees optimality for the assumed model, and it says nothing about robustness when the model is wrong.

[Doyle (1978)](#ref-Doy1978a) gave a simple example whose margins can be made arbitrarily small, however good the separate designs look. **Stability Margins** computes the margins of the actual controller in series with the plant, `ss(A - B * K - L * C, L, K, 0, Ts) * ss(A, B, C, 0, Ts)`, so compare them with the figures from **State-Feedback LQR** on the same matrices. If they fall a long way, change **Process Noise W** and **Measurement Noise V** as tuning values and read the margins again.

## Reading a simulation

The estimate starts at zero while the state starts at **Initial State x0**, so the first part of **State Trajectory** shows the estimator catching up, and the input reacts only as it does.

A longer transient than on **State-Feedback LQR** is therefore to be expected. A second cause of difference is noise, which keeps the state in small motion at the end of the run. Because the simulation uses one noise path, compare designs by rerunning `simulate` with several values of `seed`, and do not rely on one figure of `simulated_cost`.

## References

<a id="ref-Doy1978a"></a>Doyle, J. C. (1978). Guaranteed Margins for LQG Regulators. *IEEE Transactions on Automatic Control* 23(4), 756-757. [doi:10.1109/TAC.1978.1101812](https://doi.org/10.1109/TAC.1978.1101812)

<a id="ref-JT1961a"></a>Joseph, P. D., & Tou, J. T. (1961). On Linear Control Theory. *Transactions of the American Institute of Electrical Engineers, Part II: Applications and Industry* 80(4), 193-196. [doi:10.1109/TAI.1961.6371743](https://doi.org/10.1109/TAI.1961.6371743)

<a id="ref-Kal1960a"></a>Kalman, R. E. (1960). A New Approach to Linear Filtering and Prediction Problems. *Journal of Basic Engineering* 82(1), 35-45. [doi:10.1115/1.3662552](https://doi.org/10.1115/1.3662552)

<a id="ref-Won1968a"></a>Wonham, W. M. (1968). On the Separation Theorem of Stochastic Control. *SIAM Journal on Control* 6(2), 312-326. [doi:10.1137/0306023](https://doi.org/10.1137/0306023)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
