# Linear Optimal Control

A feedback law decides how hard to push a system given where it is now. Linear optimal control derives that law from a stated trade-off between keeping the state small and keeping the effort small, so that the design choice is the cost and not the gain.

## What does an LQR actually decide?

The Linear Quadratic Regulator takes a linear model, x[k+1] = A x[k] + B u[k], and asks for the inputs that minimise a total cost: the sum over k of x[k]' Q x[k] + u[k]' R u[k].

**State Cost Q** says which deviations matter, and **Control Cost R** says how expensive effort is. The answer has an unusual simplicity: the best input at every step is a fixed matrix times the current state, u[k] = −K x[k], whatever the starting point. All the work lies in computing `K` once, offline, from a Riccati equation, and running the controller is then a single matrix multiplication. A textbook development is by [Kirk (2012)](#ref-Kir2012a).

## Why a feedback law and not a planned sequence?

A planned sequence of inputs assumes the model is exact and that nothing disturbs the system. A feedback law reacts to wherever the state turns out to be, so it corrects errors as they arise.

For a linear model with a quadratic cost, there is no price for that benefit. Dynamic programming shows that the optimal open-loop sequence and the feedback law produce identical inputs when the model is exact, and the feedback law also handles disturbances. **vs. Uncontrolled** shows the difference between acting on the state and leaving the system alone, and the formal argument is in [Bertsekas (2017)](#ref-Ber2017a).

## The two models compared

| Feature | **State-Feedback LQR** | **Output-Feedback LQG** |
|---|---|---|
| Available to the controller | Every state | Noisy outputs y = C x + v |
| Noise in the simulation | None | Process and measurement noise |
| Gains designed | `K` | `K` and `L` |
| Extra inputs | None | **Output Matrix C**, **Process Noise W**, **Measurement Noise V** |
| Main risk | A state that cannot really be measured | Loss of the robustness of full-state feedback |

The separate wikis give the details: [State-Feedback](statefeedback.md) and [Output-Feedback](outputfeedback.md).

## What the separation principle allows

When the state must be estimated, the problem looks harder, since the controller's action could in principle also help the estimator learn. The linear-quadratic-Gaussian case avoids that difficulty.

The optimal controller is simply the LQR gain applied to the Kalman estimate, and the two can be designed entirely apart. [Joseph and Tou (1961)](#ref-JT1961a) showed that a linear multivariable system has optimum performance if controller and estimator are independently designed in an optimum manner, and [Wonham (1968)](#ref-Won1968a) treated the theorem more generally. **Output-Feedback LQG** builds its controller in exactly that way, from `lqr` and `kalman`.

## Discrete time, and what follows from it

The panel takes **System Matrix A** and **Input Matrix B** as an already sampled model, so every formula has k as a step and not a continuous time. The default is a double integrator, a mass pushed by a force, sampled at **Sample Time**.

Three things follow. Stability means eigenvalues inside the unit circle, and not in the left half-plane. **Sample Time** labels the axes and frequencies but does not enter the design, so changing it alone leaves `K` the same, and A and B have to be resampled to match. And the well-known margin guarantees of continuous-time LQR do not carry over, as the [Interpretation](interpretation.md) wiki explains.

## What the panel leaves out

The system has to be linear and time-invariant, with no limits on the input. Actuator saturation, state constraints and references to follow all lie outside these two models, and **Model Predictive Control** handles constraints directly.

Both models use a stationary gain, valid for a long horizon. The [Finite Horizon](finitehorizon.md) wiki covers the time-varying gain of a short horizon, which the panel does not compute, and the [Infinite Horizon](infinitehorizon.md) wiki covers the Riccati equation behind the one it does. The role of LQG in actual engineering practice is reviewed by [Athans (1971)](#ref-Ath1971a), and the [Decision Guide](decision-guide.md) wiki says how to set the weights.

## References

<a id="ref-Ath1971a"></a>Athans, M. (1971). The Role and Use of the Stochastic Linear-Quadratic-Gaussian Problem in Control System Design. *IEEE Transactions on Automatic Control* 16(6), 529-552. [doi:10.1109/TAC.1971.1099818](https://doi.org/10.1109/TAC.1971.1099818)

<a id="ref-Ber2017a"></a>Bertsekas, D. P. (2017). *Dynamic Programming and Optimal Control, Vol. 1* (4th ed.). Athena Scientific.

<a id="ref-JT1961a"></a>Joseph, P. D., & Tou, J. T. (1961). On Linear Control Theory. *Transactions of the American Institute of Electrical Engineers, Part II: Applications and Industry* 80(4), 193-196. [doi:10.1109/TAI.1961.6371743](https://doi.org/10.1109/TAI.1961.6371743)

<a id="ref-Kir2012a"></a>Kirk, D. E. (2012). *Optimal Control Theory: An Introduction*. Dover Publications.

<a id="ref-Won1968a"></a>Wonham, W. M. (1968). On the Separation Theorem of Stochastic Control. *SIAM Journal on Control* 6(2), 312-326. [doi:10.1137/0306023](https://doi.org/10.1137/0306023)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
