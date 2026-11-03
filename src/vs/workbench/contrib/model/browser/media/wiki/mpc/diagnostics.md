# Model Predictive Control: Diagnostics

A predictive controller can track well in simulation and still fail in practice, because the solve takes too long, the inputs saturate, or the model is too optimistic. The checks look at the closed loop, the limits, the timing and the plan.

## Reading the Closed-Loop Response

**Closed-Loop Response** draws the outputs with the setpoint, and the inputs with their bounds, using the package's plot recipe.

| Feature | Reading |
|---|---|
| Output rises smoothly to the setpoint | Tracking with little overshoot |
| Overshoot, then settling | More aggressive tuning, or a lightly damped plant |
| Output settles away from the setpoint | Offset, often from an input held on a bound |
| Input sits on a bound for a stretch | Saturation, which slows the response |
| Input oscillates from step to step | Little weight on moves, or a horizon too short |

The input is drawn as a staircase, since each move is held for one **Sample Time**, and the move at each step is the first of a freshly planned sequence.

## Did the inputs stay within the bounds?

**Constraint Check** compares every applied input with **Input Min** and **Input Max**, within 1e-6.

| Output | Reading |
|---|---|
| `inputs_within_bounds` | Should be `true`, as input bounds are hard |
| `share_of_steps_saturated` | Share of steps with some input at a bound |
| `overshoot` | Largest output minus the setpoint, for each output |
| `final_error` | Last output minus the setpoint |

A large `share_of_steps_saturated` shows that the limits, not the weights, set the pace of the response. Saturation in steady state, together with a nonzero `final_error`, points to a setpoint that cannot be held within the bounds, one of the cases in which [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) note that offset can remain. For a setpoint lower than the starting output, `overshoot` gives the largest output minus the setpoint, and the chart is the better guide.

## Is the controller fast enough?

**Solve Time** runs the loop step by step and times each call to `moveinput!`, leaving out the first step, which includes compilation.

| Output | Reading |
|---|---|
| `mean_solve_seconds` | Typical time per optimisation |
| `worst_solve_seconds` | Slowest step |
| `sample_time` | The budget per step |
| `real_time_feasible` | `true` when the worst solve is under the sample time |

The worst case is what matters, since one late move upsets the loop. A worst time close to the sample time leaves no room for measurement, communication or a slower machine, so a clear margin is wise. The times come from the machine in use and serve as a guide to those on the target hardware.

## What does the plant do on its own?

**Open-Loop Step Response** applies a unit step on every input with no controller, from the model's initial state.

The chart shows the time scale the controller must shape, which is the scale the tooltip of **Prediction Horizon** refers to. The time to settle, divided by **Sample Time**, gives the number of steps that span the main dynamics. A lightly damped plant shows oscillations that the controller has to suppress, and a plant that does not settle needs feedback before anything else.

On the pendulum, the chart shows the response to a unit torque from the hanging position, a swing about the stable equilibrium.

## How robust is the tracking?

**Disturbance Rejection** adds a step load of 0.1 on each input and plots the closed loop. The output should dip and recover, and a full recovery shows the integrating disturbance states at work in the estimator.

**Plant Mismatch** keeps the controller's model and gives the plant 20% more input gain, then prints `tracking_rmse_mismatch` beside `tracking_rmse_nominal`. A modest rise is normal, while a large one, or oscillation on the chart, shows tuning that depends on a precise model. Rerunning the action with other weights shows how the tuning changes that dependence.

## What does the first plan look like?

**Receding-Horizon Plan** builds a fresh controller, solves once from the initial state, and plots the planned input over the prediction horizon.

The first Hc values are free and the rest are held, as **Control Horizon** says, so the chart shows moves at the start and a flat line after. Only the first move is applied before the controller plans again. A plan that sits on a bound shows that the limits dominate the first step, and `objective` gives the value of the cost at that plan.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| `real_time_feasible` is `false` | Long horizon or costly model | Shorter Hp, smaller Hc, or **Linear MPC** |
| Steady offset | Input held at a bound | Wider bounds, or a reachable setpoint |
| Oscillating input | Low **Move Weights** | Raise it |
| Slow, sluggish response | High **Move Weights**, or saturation | Lower it, or check the bounds |
| Error on building **Nonlinear MPC** | `f` or `h` not matching **States** and **Inputs** | Check the lengths of x, u and the output |
| Error on a vector input | **Setpoint** or a weight of the wrong length | One entry per output or per input |

## References

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Linear MPC](linmpc.md) · [Nonlinear MPC](nonlinmpc.md)
