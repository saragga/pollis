# Linear Optimal Control: Factsheet

A quick reference for **Linear Optimal Control**: the two models, their inputs, their formulas and what each action computes. Both models work in discrete time and take the matrices of the system directly, with `lqr` and `kalman` from `ControlSystemsBase` doing the design.

## The two models and their formulas

| Model | Measured | Control law | Gains computed |
|---|---|---|---|
| **State-Feedback LQR** | The whole state | u[k] = −K x[k] | `K` from `lqr(sys, Q, R)` |
| **Output-Feedback LQG** | y = C x + v | u[k] = −K x_hat[k] | `K` from `lqr`, `L` from `kalman(sys, W, V)` |

The plant is x[k+1] = A x[k] + B u[k], with noise w added on **Output-Feedback LQG**. The estimate follows x_hat[k+1] = A x_hat[k] + B u[k] + L (y[k] − C x_hat[k]), so `L` is the gain of a one-step predictor, and u[k] does not use y[k].

## Inputs shared by both models

| Input | Default | Meaning |
|---|---|---|
| **System Matrix A** | `[1.0 0.1; 0.0 1.0]` | n × n, a double integrator sampled at 0.1 s |
| **Input Matrix B** | `reshape([0.005, 0.1], 2, 1)` | n × m, a matrix even for one input |
| **Sample Time** | 0.1 | Seconds, for the time axis and the margins |
| **State Cost Q** | `[1.0 0.0; 0.0 0.1]` | Symmetric, positive semidefinite |
| **Control Cost R** | `fill(0.01, 1, 1)` | Symmetric, positive definite |
| **Initial State x0** | `[1.0, 0.0]` | Start of the simulations |
| **Steps** | 100 | Length of the simulations, no effect on the gains |

## Inputs of Output-Feedback LQG

| Input | Default | Meaning |
|---|---|---|
| **Output Matrix C** | `[1.0 0.0]` | p × n, position only by default |
| **Process Noise W** | `[1e-4 0.0; 0.0 1e-4]` | Covariance of w, n × n, positive semidefinite |
| **Measurement Noise V** | `fill(1e-2, 1, 1)` | Covariance of v, p × p, positive definite |

`simulate` draws both noises with seed 1, and `x_hat` starts at zero whatever **Initial State x0** says.

## What a run builds and prints

| Object | Contents |
|---|---|
| `sys` | The state-space model, with **Sample Time** attached |
| `K`, `L` | Control gain, and on **Output-Feedback LQG** the Kalman gain |
| `simulate` | Function that runs the loop, with `X`, `U`, `cost` and, for LQG, `Xhat` |
| `sim` | The default simulation |
| `A_cl` | A − B K |

The printed result has `gain`, `closed_loop_poles`, `stable` and `simulated_cost`. `closed_loop_poles` and `stable` both concern A − B K alone, including on **Output-Feedback LQG**, where the estimator poles of A − L C appear only in the **Closed-Loop Poles** chart.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **State Trajectory** | Closed-loop states, with dashed estimates for LQG |
| Visualise | **Control Signal** | u[k] held over each sample |
| Diagnose | **Controllability & Observability** | `controllability_rank`, `cost_observability_rank`, `measurement_observability_rank`, `open_loop_poles` |
| Diagnose | **Closed-Loop Poles** | Open-loop, LQR and estimator poles against the unit circle |
| Predict | **Response from New State** | Chart from `2 .* x0`, with `final_state`, `cost`, `peak_control` |
| Predict | **Predicted Cost** | `predicted_cost`, `simulated_cost`, `riccati_solution` |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **vs. Uncontrolled** | State norm with u = 0 against the closed loop |
| Compare | **Control-Weight Sweep** | `state_cost`, `control_cost`, `spectral_radius` for R scaled by 0.01 to 100 |
| Interpret | **Gain Analysis** | `gain`, and `relative_gain` with each row scaled by its largest entry |
| Interpret | **Stability Margins** | `gain_margin`, `gain_crossover`, `phase_margin_degrees`, `phase_crossover`, for one input and one output |

## Textbooks and the Riccati solver

The theory of optimal control, including the linear regulator, is covered by [Kirk (2012)](#ref-Kir2012a). Stability margins and classical design, which give the vocabulary of **Stability Margins**, are in [D'Azzo, Houpis and Sheldon (2003)](#ref-DHS2003a).

The Riccati equation in **Predicted Cost** is solved by `ared` from `MatrixEquations`. Solvers of this kind go back to the Schur-vector approach of [Laub (1979)](#ref-Lau1979a), which replaced earlier eigenvector methods because of its numerical stability.

## References

<a id="ref-DHS2003a"></a>D'Azzo, J. J., Houpis, C. H., & Sheldon, S. N. (2003). *Linear Control System Analysis and Design with MATLAB* (5th ed.). Marcel Dekker.

<a id="ref-Kir2012a"></a>Kirk, D. E. (2012). *Optimal Control Theory: An Introduction*. Dover Publications.

<a id="ref-Lau1979a"></a>Laub, A. J. (1979). A Schur Method for Solving Algebraic Riccati Equations. *IEEE Transactions on Automatic Control* 24(6), 913-921. [doi:10.1109/TAC.1979.1102178](https://doi.org/10.1109/TAC.1979.1102178)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md) · [Infinite Horizon](infinitehorizon.md)
