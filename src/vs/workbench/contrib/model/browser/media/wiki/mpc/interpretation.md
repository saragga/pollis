# Model Predictive Control: Interpretation

The printed result summarises one closed-loop run, and the Interpret and Compare actions show how the tuning and the controller's design change it. Every figure comes from a simulation over **Simulation Steps**, so it describes that run and that setpoint.

## Reading the printed result

| Output | Meaning | Reading |
|---|---|---|
| `final_output` | Output at the last step | Compare with `setpoint` |
| `setpoint` | The reference | As entered |
| `tracking_rmse` | Root mean square of output minus setpoint over the run | Includes the initial transient |
| `peak_input` | Largest absolute input | Compare with the bounds |

`tracking_rmse` is dominated by the first steps after the setpoint change, so it measures speed of response as much as accuracy. Two tunings with the same final value can differ widely in it. It is in the units of the output, which on the pendulum are degrees.

## How do the weights trade tracking against effort?

**Weight Sensitivity** reruns the loop with **Move Weights** set to 0.1, 0.5, 2.5 and 10, and plots `tracking_rmse` against `input_moves`, the total absolute change of the input.

| End of the curve | Tuning | Behaviour |
|---|---|---|
| Low `input_moves`, high `tracking_rmse` | Heavy move weight | Smooth and slow |
| High `input_moves`, low `tracking_rmse` | Light move weight | Fast and busy |

The curve is a trade-off frontier for this plant and setpoint. Its flat stretch shows where more input activity buys little extra tracking, and that region often holds a good compromise. As the inputs reach their bounds, the curve flattens because the limits, not the weights, set the speed.

## What does the Horizon Sweep show?

**Horizon Sweep** builds controllers with **Prediction Horizon** of 5, 10, 20 and 40, keeping **Control Horizon** no larger than Hp.

| Output | Reading |
|---|---|
| `tracking_rmse` | Usually falls, then levels off, as Hp grows |
| `input_moves` | Changes as the controller sees further ahead |
| `seconds_per_step` | Grows with Hp, and includes the simulation |

The horizon at which `tracking_rmse` levels off is the one that covers the main dynamics, which links back to the **Open-Loop Step Response**. A horizon much longer than that adds cost and little else. A very short horizon can make the closed loop poor or unstable, since the controller cannot see the consequence of its moves.

## Comparing with another controller

**Alternative Controller** sets the main controller against a simpler one, on the same plant.

| Model | Alternative | Question it answers |
|---|---|---|
| **Linear MPC** | `ExplicitMPC`, with no constraints | What do the input bounds cost and buy? |
| **Nonlinear MPC** | `LinMPC` on the model linearised at x = 0, u = 0 | What does the nonlinear model add? |

On the linear model, `alternative_peak_input` beyond **Input Max** shows how far the unconstrained law would like to go, and a lower `alternative_rmse` reflects that freedom. On the pendulum, the linear model describes the hanging position, as the action's description says, so the comparison shows the value of the nonlinear model on a wide manoeuvre.

## How does mismatch change the numbers?

**Plant Mismatch** prints `tracking_rmse_mismatch` and `tracking_rmse_nominal` for the same controller. The ratio of the two is a simple measure of sensitivity to the input gain.

A ratio close to one shows that the tuning is tolerant, and the integrating disturbance states then do most of the work of correcting the error. A large ratio, or an oscillating chart, means the controller relies on the model's gain being right, and a sweep of the weights or horizon with the same action shows which settings tolerate the error best.

## What do the planned inputs mean?

**Receding-Horizon Plan** prints `first_move` and `objective`, and plots the full sequence planned at the first step.

`objective` is the value of the cost at the optimum, in the weighted units of the four terms, so it compares runs with the same weights but not across different weights. `first_move` is the only input of the plan that is applied. The rest is a forecast, which will be revised at the next step with new information, as the panel's first bullet describes.

[Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) describe this receding-horizon principle, in which only the first portion of each open-loop solution is used before a new measurement is taken.

## References

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Linear MPC](linmpc.md) · [Nonlinear MPC](nonlinmpc.md)
