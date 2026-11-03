# Model Predictive Control: Overview

Model predictive control chooses each input by optimising a forecast. At every sample it predicts how the plant will respond over a horizon, picks the input sequence that best balances tracking against effort within the limits, applies the first move, and starts again with the next measurement. **Model Predictive Control** offers a linear and a nonlinear version.

## What happens at each sampling time?

| Stage | Operation | In the code |
|---|---|---|
| Measure | Read the plant output | `evaloutput` |
| Estimate | Correct the state estimate with the measurement | `preparestate!` |
| Optimise | Solve for the input sequence over the horizon | `moveinput!` |
| Apply | Send the first move to the plant | The u returned |
| Advance | Predict the state for the next sample | `updatestate!` |

`sim!` repeats that cycle for **Simulation Steps**, and **Solve Time** runs it by hand with the same functions. The idea of solving an open-loop problem from the measured state, using its first portion and repeating, is traced by [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) to the optimal control literature of the 1960s.

## Why optimise over a horizon at all?

A forecast lets the controller act before an error appears, and the limits enter the problem directly. Saturation, rate limits and output bounds are part of the optimisation, not something added after a control law has been designed, as the panel's second bullet says.

[Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) describe MPC as having become the most useful method in modern control technology for problems with hard constraints, starting from the process industries. The price is computation: a full optimisation must finish within every sample, which is why the solve time matters as much as the tracking.

## What does the controller trade off?

The objective weighs the predicted output error against the size of input moves.

| Input | Raises the weight on | Effect of a larger value |
|---|---|---|
| **Output Weights** | Setpoint tracking | Faster, more aggressive response |
| **Move Weights** | Changes of the input | Smoother, slower control |
| **Prediction Horizon** | Length of the forecast | Looks further ahead, costs more per solve |
| **Control Horizon** | Number of free moves | More freedom, more decision variables |

**Weight Sensitivity** shows that trade-off directly, by sweeping **Move Weights** with **Output Weights** fixed.

## How do the two controllers differ?

| | **Linear MPC** | **Nonlinear MPC** |
|---|---|---|
| Model | A linear transfer function, discretised | Nonlinear differential equations, integrated |
| Optimisation | Convex quadratic program | Nonlinear program |
| State estimate | Steady-state Kalman filter | Unscented Kalman filter |
| Default problem | First-order plant, step in setpoint | Pendulum swung to upright |

A linear model holds near an operating point, and the pendulum shows why the nonlinear version exists: the dynamics at the bottom and at the top differ in sign. **Alternative Controller** sets the two against each other on the pendulum.

## When is the closed loop stable?

Optimising over a finite horizon does not by itself yield a stabilising control, and [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) note that the early literature left that question open. [Mayne and Michalska (1990)](#ref-MM1990a) showed that a receding horizon controller yields a stable closed loop for nonlinear systems, using a terminal equality constraint.

Later results added a terminal cost and terminal constraint set. [Mayne, Rawlings, Rao and Scokaert (2000)](#ref-MRRS2000a) review the stability and optimality of constrained MPC, and the book points to that review for a fuller history. **Horizon Sweep** shows how the closed loop changes as **Prediction Horizon** grows.

## What do the action groups answer?

| Group | Question |
|---|---|
| Visualise | How does the closed loop respond, and what is the plant like alone? |
| Diagnose | Did the inputs stay in bounds, and is the solve fast enough? |
| Predict | How does the loop cope with a disturbance or a wrong model? |
| Compare | What do the horizon and a simpler controller change? |
| Interpret | How do the weights trade tracking against effort, and what was planned? |

The package behind the panel is described by [Gagnon, Thivierge, Desbiens and Bagge Carlson (2024)](#ref-GTDC2024a).

## References

<a id="ref-GTDC2024a"></a>Gagnon, F., Thivierge, A., Desbiens, A., & Bagge Carlson, F. (2024). ModelPredictiveControl.jl: Advanced Process Control Made Easy in Julia. [doi:10.48550/arXiv.2411.09764](https://doi.org/10.48550/arXiv.2411.09764)

<a id="ref-MM1990a"></a>Mayne, D. Q., & Michalska, H. (1990). Receding Horizon Control of Nonlinear Systems. *IEEE Transactions on Automatic Control* 35(7), 814-824. [doi:10.1109/9.57020](https://doi.org/10.1109/9.57020)

<a id="ref-MRRS2000a"></a>Mayne, D. Q., Rawlings, J. B., Rao, C. V., & Scokaert, P. O. M. (2000). Constrained Model Predictive Control: Stability and Optimality. *Automatica* 36(6), 789-814. [doi:10.1016/S0005-1098(99)00214-9](https://doi.org/10.1016/S0005-1098(99)00214-9)

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Linear MPC](linmpc.md) · [Nonlinear MPC](nonlinmpc.md)
