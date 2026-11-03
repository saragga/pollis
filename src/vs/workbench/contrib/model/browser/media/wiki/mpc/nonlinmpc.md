# Nonlinear MPC

Nonlinear model predictive control predicts with the full nonlinear model and solves a nonlinear program at each step. **Nonlinear MPC** builds it with `NonLinMPC` on a `NonLinModel` made from **Dynamics f(x, u)** and **Output h(x)**.

## How is the model built?

`NonLinModel(f, h, Ts, nu, nx, ny)` takes the continuous-time derivative f and the output h, and integrates f between samples with a fourth-order Runge-Kutta method. The code wraps the two inputs as `f(x, u, _, _)` and `h(x, _, _)`, as the package also passes measured disturbances and parameters, which the panel leaves unused.

| Input | Default | Meaning |
|---|---|---|
| **Dynamics f(x, u)** | Pendulum with friction and torque | x[1] the angle in radians, x[2] the angular speed |
| **Output h(x)** | The angle in degrees | What the controller measures and tracks |
| **States**, **Inputs** | 2, 1 | Must match the lengths of x and u |
| **Setpoint** | `[180.0]` | The pendulum upright |

The pendulum, its settings and the torque limits follow the nonlinear example in the package's manual, which builds the same controller.

## What is solved at each step?

With a nonlinear model the predicted outputs are nonlinear in the inputs, so the problem is a nonlinear program, generally nonconvex. The default solver is Ipopt, the interior-point filter line-search method of [Waechter and Biegler (2006)](#ref-WB2006a), with derivatives from automatic differentiation.

The default transcription is single shooting: the decision variables are the input moves, and the states follow by simulating the model forward. [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) describe direct single shooting and multiple shooting in their chapter on numerical optimal control. The package also offers `MultipleShooting()` through the `transcription` keyword, which makes the states decision variables as well.

## How is the state estimated?

For a `NonLinModel`, `NonLinMPC` uses an `UnscentedKalmanFilter` by default. The unscented filter avoids linearising at one point by sampling the nonlinear response at several sigma points, as [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a) explain, and it goes back to the extension of the Kalman filter to nonlinear systems by [Julier and Uhlmann (1997)](#ref-JU1997a).

| Keyword | Default | Role |
|---|---|---|
| `σQ`, `σR` | As for the steady filter | Process and measurement noise |
| `nint_ym` | One per measured output | Integrators on the outputs |
| `α`, `β`, `κ` | 1e-3, 2, 0 | Spread and weights of the sigma points |

The manual's example tunes the filter by hand, with an integrator on the torque, and extra keywords given to `NonLinMPC` pass to the filter in the same way.

## What makes the pendulum a hard case?

The pendulum's gravity term behaves oppositely at the bottom and at the top: hanging is stable and upright is not. A move from 0 to 180 degrees crosses the whole range of that nonlinearity, under bounded torque.

A model valid across the whole range can plan that move from start to finish. **Alternative Controller** shows the contrast with a linear controller, built on the model linearised at x = 0 and u = 0.

The manual reports that a linear controller built at the upright position handles a small disturbance there, while a setpoint change from the bottom calls for the nonlinear model.

## What more can NonLinMPC do?

| Keyword | Adds |
|---|---|
| `Ewt`, `JE` | An economic term in the objective, such as energy used |
| `gc`, `nc` | Custom nonlinear inequality constraints |
| `transcription` | Single or multiple shooting |
| `optim` | Another nonlinear solver through JuMP |

Economic MPC, which optimises an operating cost directly instead of only tracking a setpoint, is covered by [Rawlings, Mayne and Diehl (2017)](#ref-RMD2017a). The manual's pendulum example adds an energy term and a power limit to show both features. Each of them makes the nonlinear program larger, so **Solve Time** is the check to rerun.

## How does the cost grow?

Each step integrates the model over the horizon many times inside the solver, so the cost grows with **Prediction Horizon**, the number of states and the work in f. [Gagnon, Thivierge, Desbiens and Bagge Carlson (2024)](#ref-GTDC2024a) present the package with an inverted pendulum among their case studies, and benchmark its solving times against equivalent implementations in MATLAB. The manual reports a nonlinear controller many times slower than a linear one on the pendulum.

**Solve Time** gives the figure on the machine in use. If the worst solve approaches **Sample Time**, a shorter horizon, fewer free moves or the package's successive linearisation are the usual ways to bring it down.

## References

<a id="ref-GTDC2024a"></a>Gagnon, F., Thivierge, A., Desbiens, A., & Bagge Carlson, F. (2024). ModelPredictiveControl.jl: Advanced Process Control Made Easy in Julia. [doi:10.48550/arXiv.2411.09764](https://doi.org/10.48550/arXiv.2411.09764)

<a id="ref-JU1997a"></a>Julier, S. J., & Uhlmann, J. K. (1997). A New Extension of the Kalman Filter to Nonlinear Systems. In *Proc. SPIE 3068, Signal Processing, Sensor Fusion, and Target Recognition VI*, 182. [doi:10.1117/12.280797](https://doi.org/10.1117/12.280797)

<a id="ref-RMD2017a"></a>Rawlings, J. B., Mayne, D. Q., & Diehl, M. M. (2017). *Model Predictive Control: Theory, Computation, and Design* (2nd ed.). Nob Hill Publishing.

<a id="ref-WB2006a"></a>Waechter, A., & Biegler, L. T. (2006). On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming. *Mathematical Programming* 106(1), 25-57. [doi:10.1007/s10107-004-0559-y](https://doi.org/10.1007/s10107-004-0559-y)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Linear MPC](linmpc.md)
