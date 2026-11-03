# Linear MPC

Linear model predictive control predicts with a linear model and solves a convex quadratic program at each step. **Linear MPC** builds it with `LinMPC` on a `LinModel` made from **Plant Transfer Function**.

## How is the model built?

`LinModel(plant, Ts)` converts the continuous-time transfer function into a discrete state-space model at **Sample Time**, with a zero-order hold on the inputs. The controller then predicts the output over **Prediction Horizon** steps from the current state estimate and the planned inputs.

| Default | Value | Meaning |
|---|---|---|
| **Plant Transfer Function** | `tf(2, [1, 1])` | Gain 2, time constant 1 s |
| **Sample Time** | 0.1 | Ten samples per time constant |
| **Prediction Horizon** | 20 | Two seconds of forecast |
| **Setpoint** | `[1.0]` | Reached with a steady input of 0.5 |

Any transfer function that `ControlSystemsBase` accepts can be entered, including systems with several inputs and outputs. The weights and bounds then need one entry per output or per input.

## Why is the problem a quadratic program?

With a linear model, the predicted outputs depend linearly on the planned input moves. The objective is a weighted sum of squares of output errors and input moves, so it is quadratic in the moves, and bounds on inputs are linear inequalities.

The result is a convex quadratic program, with a single optimum that a solver finds reliably and fast. [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) build their introduction to MPC on this linear quadratic problem, and treat linear systems with control and state constraints among their examples.

The default solver is OSQP, an operator-splitting method by [Stellato, Banjac, Goulart, Bemporad and Boyd (2020)](#ref-SBGBB2020a). It can be replaced through the `optim` keyword with any quadratic programming solver that JuMP supports.

## How is the state estimated?

`LinMPC` uses a `SteadyKalmanFilter` by default, the steady-state form of the filter of [Kalman (1960)](#ref-Kal1960a). The package adds an integrating disturbance on each measured output, unless that would make the augmented model unobservable.

| Keyword | Default | Role |
|---|---|---|
| `σQ` | `fill(1/model.nx, model.nx)` | Process noise on the plant states |
| `σR` | `fill(1, ny)` | Measurement noise |
| `nint_ym` | One per measured output | Integrators on the outputs |
| `nint_u` | 0 | Integrators on the inputs |

The package documentation advises one integrator per output for step-like disturbances, and two for ramp-like ones. The manual's linear example adds integrators on the inputs, which speeds the rejection of a load disturbance. Extra keywords given to `LinMPC` pass to the filter.

## What does the controller cost and constrain?

`LinMPC` minimises the output error weighted by **Output Weights**, the input moves weighted by **Move Weights**, an input setpoint term with weight 0 by default, and a slack term with weight `Cwt` = 1e5. **Input Min** and **Input Max** are hard.

The control horizon reduces the decision variables to Hc moves per input, after which the input is held. With Hc = 2 the quadratic program on the default plant is very small, which is part of why linear MPC can run at short sample times.

## What is ExplicitMPC in the comparison?

**Alternative Controller** compares the controller with `ExplicitMPC`, built with the same horizons and weights. `ExplicitMPC` has no constraints and no optimiser, and the package solves its unconstrained problem analytically, as the action's description says.

The comparison shows what the input bounds do. Where the unconstrained law asks for an input beyond **Input Max**, the bounded controller saturates and plans around the limit, and the two responses part ways. Where the bounds never bind, the two should agree closely, and the explicit law is then the cheaper choice.

## References

<a id="ref-Kal1960a"></a>Kalman, R. E. (1960). A New Approach to Linear Filtering and Prediction Problems. *Journal of Basic Engineering* 82(1), 35-45. [doi:10.1115/1.3662552](https://doi.org/10.1115/1.3662552)

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

<a id="ref-SBGBB2020a"></a>Stellato, B., Banjac, G., Goulart, P., Bemporad, A., & Boyd, S. (2020). OSQP: An Operator Splitting Solver for Quadratic Programs. *Mathematical Programming Computation* 12(4), 637-672. [doi:10.1007/s12532-020-00179-2](https://doi.org/10.1007/s12532-020-00179-2)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Nonlinear MPC](nonlinmpc.md)
