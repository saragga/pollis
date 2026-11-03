# Model Predictive Control: Factsheet

A quick reference for **Model Predictive Control**: the two controllers, their inputs, the settings the package supplies, and what each action computes. Both run through `ModelPredictiveControl.jl`, which builds the plant model, the state estimator, the optimisation problem and the closed-loop simulation.

## The two controllers side by side

| Controller | Plant model | Problem at each step | Default solver | Default estimator |
|---|---|---|---|---|
| **Linear MPC** | `LinModel` from a transfer function | Convex quadratic program | OSQP | `SteadyKalmanFilter` |
| **Nonlinear MPC** | `NonLinModel` from f and h | Nonlinear program | Ipopt | `UnscentedKalmanFilter` |

Both use `SingleShooting()` as the transcription by default. OSQP is described by [Stellato, Banjac, Goulart, Bemporad and Boyd (2020)](#ref-SBGBB2020a), and Ipopt by [Wächter and Biegler (2006)](#ref-WB2006a).

## Inputs for Linear MPC

| Input | Default | Meaning |
|---|---|---|
| **Plant Transfer Function** | `tf(2, [1, 1])` | Continuous-time plant, a first-order lag |
| **Setpoint** | `[1.0]` | Output reference, one entry per output |

`LinModel` discretises the transfer function at **Sample Time** with a zero-order hold on the inputs. The tooltip's second example, `tf(1, [1, 0.6, 1])`, is a lightly damped second-order plant. A system with several inputs and outputs needs **Setpoint**, the weights and the bounds sized to match.

## Inputs for Nonlinear MPC

| Input | Default | Meaning |
|---|---|---|
| **Dynamics f(x, u)** | A pendulum with friction and torque input | Continuous-time state derivative |
| **Output h(x)** | `[180 / pi * x[1]]` | The angle in degrees |
| **States** | 2 | Length of x |
| **Inputs** | 1 | Length of u |
| **Setpoint** | `[180.0]` | The pendulum upright |

`NonLinModel` integrates f between samples with `RungeKutta(4)`. The pendulum, its horizons, weights and torque limits follow the nonlinear example in the package's manual.

## Inputs shared by both

| Input | Default | Meaning |
|---|---|---|
| **Sample Time** | 0.1 | Control period, in seconds |
| **Prediction Horizon** | 20 | Steps predicted, Hp |
| **Control Horizon** | 2 | Free input moves, Hc, after which the input is held |
| **Simulation Steps** | 35 | Length of the closed-loop run |
| **Output Weights** | `[0.5]` | Weight on setpoint tracking, one per output |
| **Move Weights** | `[2.5]` | Weight on input moves, one per input |
| **Input Min**, **Input Max** | `[-1.5]`, `[1.5]` | Bounds on each input |

## What the controller minimises

The package's documentation writes the objective as a sum of four terms.

| Term | Weight | Set by |
|---|---|---|
| Output error over Hp, setpoint minus prediction | `Mwt` | **Output Weights** |
| Input moves over Hc | `Nwt` | **Move Weights** |
| Input error against an input setpoint | `Lwt` | Package default 0 |
| Squared slack for softened constraints | `Cwt` | Package default 1e5 |

Input bounds and bounds on input moves are hard by default, and output bounds are soft, through the slack. **Nonlinear MPC** can add an economic term and custom constraints, through the keywords `Ewt`, `JE` and `gc`.

## What a run builds and prints

`build` makes a controller from the inputs, with `setconstraint!` applying **Input Min** and **Input Max**, and it takes `Hp`, `Hc`, `Mwt` and `Nwt` as keywords so that the actions can vary them. `sim!` then runs **Simulation Steps** of closed loop on the nominal plant, and its result `res` holds `Y_data`, `U_data` and `T_data`.

The printed result has `final_output`, `setpoint`, `tracking_rmse` and `peak_input`. `tracking_rmse` is the root mean square of output minus setpoint over the whole run, and `peak_input` the largest absolute input.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Closed-Loop Response** | Outputs with the setpoint, inputs with their bounds |
| Visualise | **Open-Loop Step Response** | The plant alone under a unit input step |
| Diagnose | **Constraint Check** | `inputs_within_bounds`, `share_of_steps_saturated`, `overshoot`, `final_error` |
| Diagnose | **Solve Time** | `mean_solve_seconds`, `worst_solve_seconds`, `real_time_feasible` |
| Predict | **Disturbance Rejection** | Closed loop with a step load disturbance of 0.1 on each input |
| Predict | **Plant Mismatch** | Closed loop on a plant with 20% more input gain, with both RMSEs |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Horizon Sweep** | `tracking_rmse`, `input_moves`, `seconds_per_step` for Hp of 5, 10, 20 and 40 |
| Compare | **Alternative Controller** | `mpc_rmse`, `alternative_rmse`, `alternative_peak_input`, with a chart |
| Interpret | **Weight Sensitivity** | `tracking_rmse` and `input_moves` for move weights of 0.1, 0.5, 2.5 and 10 |
| Interpret | **Receding-Horizon Plan** | The input sequence planned at the first step, `first_move`, `objective` |

Every action rebuilds the controller through `build` or reuses `res`, so changing an input and rerunning updates them all.

## Packages and textbooks

`ModelPredictiveControl.jl` is described by [Gagnon, Thivierge, Desbiens and Bagge Carlson (2024)](#ref-GTDC2024a), and `ControlSystemsBase` supplies the transfer functions. `Plots` draws the charts, with the package's own plot recipe for simulation results, and JuMP passes the problems to the solvers.

[Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) cover theory, computation and design, with a free edition on the authors' website. [Maciejowski (2002)](#ref-Mac2002a) is a textbook on predictive control with constraints.

## References

<a id="ref-GTDC2024a"></a>Gagnon, F., Thivierge, A., Desbiens, A., & Bagge Carlson, F. (2024). ModelPredictiveControl.jl: Advanced Process Control Made Easy in Julia. [doi:10.48550/arXiv.2411.09764](https://doi.org/10.48550/arXiv.2411.09764)

<a id="ref-Mac2002a"></a>Maciejowski, J. M. (2002). *Predictive Control with Constraints*. Pearson Education.

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

<a id="ref-SBGBB2020a"></a>Stellato, B., Banjac, G., Goulart, P., Bemporad, A., & Boyd, S. (2020). OSQP: An Operator Splitting Solver for Quadratic Programs. *Mathematical Programming Computation* 12(4), 637-672. [doi:10.1007/s12532-020-00179-2](https://doi.org/10.1007/s12532-020-00179-2)

<a id="ref-WB2006a"></a>Wächter, A., & Biegler, L. T. (2006). On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming. *Mathematical Programming* 106(1), 25-57. [doi:10.1007/s10107-004-0559-y](https://doi.org/10.1007/s10107-004-0559-y)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Linear MPC](linmpc.md) · [Nonlinear MPC](nonlinmpc.md)
