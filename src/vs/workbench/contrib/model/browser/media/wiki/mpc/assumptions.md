# Model Predictive Control: Assumptions

A predictive controller is only as good as its forecasts, so most of its assumptions concern the model: that it describes the plant, that its state can be estimated, and that the optimisation can be solved in time.

## Does the model describe the plant?

Every move rests on the prediction of the model, and a controller tuned on its own model can look better than it will on the real plant. The panel's main run is on the nominal plant, the same model the controller uses.

**Plant Mismatch** keeps the controller's model while the plant gets 20% more input gain, and **Disturbance Rejection** adds a step load on the input. Together they show how far the result depends on a perfect model. [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) give a chapter to robust and stochastic MPC, including the question of when nominal MPC is robust, for problems where model error is large.

## What does discretisation assume?

| Model | From continuous time | Assumption |
|---|---|---|
| `LinModel` | Zero-order hold on the inputs | The input is constant between samples |
| `NonLinModel` | `RungeKutta(4)` between samples | The step is small enough for accurate integration |

The zero-order hold matches how the controller acts, as it holds each move for one **Sample Time**. A fast mode with a long sample time is poorly resolved by either model, and `NonLinModel` takes its integrator through the `solver` keyword.

## Can the state be estimated?

The controller predicts from a state, but only the output is measured, so a state estimator runs alongside it. That requires the plant to be observable from the measured outputs.

By default the package adds one integrating disturbance state on each measured output. For a `LinModel` it removes that integrator if the augmented model would become unobservable. These integrators are the means by which the estimator absorbs a persistent disturbance or model error.

## When does the output reach the setpoint without offset?

[Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) give the conditions for offset-free control with integrating disturbances. They take as many integrating disturbances as measured outputs, chosen to satisfy a rank condition on the augmented model.

Under those conditions, if the output settles, the closed loop is stable and no constraint is active at steady state, the controlled variables reach their setpoints. The last condition matters on the default problem: if the input is held at **Input Min** or **Input Max** in steady state, an offset can remain. **Constraint Check** reports how often the inputs saturated.

## Are the limits hard or soft?

| Limit | Default treatment | Consequence |
|---|---|---|
| **Input Min**, **Input Max** | Hard | The applied input never leaves the bounds |
| Bounds on input moves | Hard, when set | Not set by the panel's inputs |
| Output bounds | Soft, with slack weight `Cwt` | Can be exceeded at a high cost, which keeps the problem feasible |

Hard bounds on inputs reflect actuators that cannot exceed their range. Output bounds are softened to keep the optimisation feasible, as the package's manual explains, since a disturbance can make them impossible to meet. `setconstraint!` also takes `Δumin`, `Δumax`, `ymin` and `ymax`, and editing the `build` line in the code adds them.

## Is the horizon long enough?

A finite horizon is an approximation of an infinite one. [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) devote a section to whether a terminal constraint set is necessary, and stability results commonly use a terminal cost and a terminal constraint, as [Mayne, Rawlings, Rao and Scokaert (2000)](#ref-MRRS2000a) review.

`setconstraint!` accepts terminal bounds `x̂min` and `x̂max` for a terminal constraint. The tooltip of **Prediction Horizon** gives the practical guide, that Hp × Ts should cover the main plant dynamics, so that the forecast sees the effect of a move before the horizon ends. **Open-Loop Step Response** shows how long that takes, and **Horizon Sweep** checks the result.

## Can the problem be solved within the sample time?

The controller has to finish each optimisation before the next sample, and the tooltip of **Sample Time** says as much. A quadratic program with a few variables is fast, while a nonlinear program grows with the horizon, the number of states and the cost of integrating f.

**Solve Time** measures the time of `moveinput!` at each step on the machine in use, which is a guide to, and not a guarantee of, the time on the target hardware. **Nonlinear MPC** also finds a local solution of a nonconvex problem, so its result depends on the starting guess the controller carries from step to step.

## References

<a id="ref-MRRS2000a"></a>Mayne, D. Q., Rawlings, J. B., Rao, C. V., & Scokaert, P. O. M. (2000). Constrained Model Predictive Control: Stability and Optimality. *Automatica* 36(6), 789-814. [doi:10.1016/S0005-1098(99)00214-9](https://doi.org/10.1016/S0005-1098(99)00214-9)

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Linear MPC](linmpc.md) · [Nonlinear MPC](nonlinmpc.md)
