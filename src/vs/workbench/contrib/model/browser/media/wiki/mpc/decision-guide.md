# Model Predictive Control: Decision Guide

The choice between the two controllers follows from how far the plant departs from linear behaviour over the range of operation. The horizons, weights and sample time then set how the chosen controller behaves.

## Linear or nonlinear?

| Situation | Choose | Reason |
|---|---|---|
| Plant operates near one point | **Linear MPC** | A linear model is accurate there, and the problem is convex |
| Fast sampling, tight computing budget | **Linear MPC** | A quadratic program solves quickly and reliably |
| Wide manoeuvres, such as swinging a pendulum upright | **Nonlinear MPC** | The dynamics change across the range |
| Only a transfer function is known | **Linear MPC** | The panel's linear model takes a transfer function |
| A physical model in differential equations is available | **Nonlinear MPC** | The model can be used as it is |

The package manual compares the two on the pendulum. A linear controller built at the upright position rejects a small disturbance there, while it does not bring the pendulum up from the bottom, and it is much faster to solve. Successive linearisation, which re-linearises at each step, is offered by the package as a middle way.

## How long should the horizons be?

**Prediction Horizon** should cover the main dynamics: the tooltip's rule is that Hp × Ts should span them. Read the time to settle from **Open-Loop Step Response**, convert it into samples, and start there.

**Control Horizon** sets the number of free moves, and 2 is the package's default. A small Hc keeps the problem small and the moves smooth, while a larger one lets the controller shape a complex response. [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) describe move blocking, which keeps only the first few moves free, as a common practice that can cut the cost per iteration.

| Symptom | Adjust |
|---|---|
| Slow or poor response | Raise Hp |
| Solve too slow | Lower Hp, or lower Hc |
| Response lacks shape | Raise Hc |

**Horizon Sweep** confirms the choice of Hp.

## How should the weights be set?

**Output Weights** and **Move Weights** are set against each other, so start by fixing one and varying the other. **Weight Sensitivity** sweeps **Move Weights** and plots the trade-off.

With several outputs, **Output Weights** sets their relative importance, and each should be scaled for the units of its output. A weight of 1 on a temperature in degrees and on a level in metres treats an error of one degree like an error of one metre. Scaling the outputs to comparable ranges first makes the weights easier to read.

## How should the sample time be chosen?

**Sample Time** is the period at which the controller measures and acts. A shorter period follows the plant more closely, but it lengthens the horizon in samples needed to cover the same dynamics, and it shortens the time available for each solve.

A common starting point is a sample time that resolves the fastest dynamics of interest with several samples, then a check with **Solve Time** that the worst solve fits within it. If it does not, **Linear MPC**, a shorter horizon or a longer period are the options, and a longer period needs a horizon recomputed in samples.

## When is another panel the better place?

| Situation | Better place |
|---|---|
| No constraints, linear plant, a fixed gain is enough | **Linear Optimal Control** |
| No model yet, only input and output data | **System Identification Methods** |
| A dynamic model to be learned with neural networks | **Neural ODEs for System Identification** |
| Discrete states and actions with known probabilities | **Single-Agent Decision Processes** |
| A sequential problem to solve offline over a grid | **Dynamic Programming** |

The unconstrained linear quadratic regulator is the special case of MPC with no limits and an infinite horizon, which [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) take as their starting point. A plant whose limits never bind may therefore be served as well by a fixed gain.

## A sensible order of work

1. Look at **Open-Loop Step Response**, and set **Prediction Horizon** from it.
2. Run the controller and read **Closed-Loop Response** and **Constraint Check**.
3. Adjust **Move Weights** with **Weight Sensitivity**.
4. Check robustness with **Disturbance Rejection** and **Plant Mismatch**.
5. Confirm the horizon with **Horizon Sweep**.
6. Check **Solve Time** against **Sample Time**.

Leaving step 6 to the end is deliberate, as every earlier change can slow the solve. A controller that tracks well but misses its time budget is not usable on line.

## References

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Linear MPC](linmpc.md) · [Nonlinear MPC](nonlinmpc.md)
