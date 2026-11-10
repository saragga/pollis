# Check a Convergence Order: Factsheet

The tabs, solvers, inputs, functions and actions of Check a Convergence Order at a glance.

## Tabs of Check a Convergence Order

| Tab | Problem on [0, 1] | Error in `errors` | Variables the actions use |
|---|---|---|---|
| **ODE Solver** | Exponential growth, du/dt = a u, u(0) = 1 | `errors[:final]`, the distance from the exact solution at t = 1 | `prob`, `dts`, `solvers`, `alg`, `expected`, `errors`, `order`, `errors_of`, `fit_order` |
| **SDE Strong Order** | Geometric Brownian motion, dX = mu X dt + sigma X dW, X(0) = 1 | `errors[:final]`, the mean over the paths of the distance on each path at t = 1 | The same, with `mu`, `sigma` and `paths` |
| **SDE Weak Order** | Geometric Brownian motion | `errors[:weak_final]`, the distance between the means at t = 1, on the same paths | The same as **SDE Strong Order** |

`errors_of(solver)` returns the errors of a solver at the steps of the tab, and `fit_order(dts, errors)` the slope of the logarithm of the errors against the logarithm of the steps, by least squares.

## Solvers of Check a Convergence Order

| Tab | Option of **Solver** | Solver | Order of the theory |
|---|---|---|---|
| **ODE Solver** | **Euler, Order 1** | `Euler()` of OrdinaryDiffEqLowOrderRK | 1 |
| **ODE Solver** | **Midpoint, Order 2** | `Midpoint()` | 2 |
| **ODE Solver** | **RK4, Order 4** | `RK4()`, the classical Runge-Kutta method | 4 |
| **SDE Strong Order** | **Euler-Maruyama (EM), Order 1/2** | `EM()` of StochasticDiffEq | 1/2 |
| **SDE Strong Order** | **Milstein (RKMil), Order 1** | `RKMil()` | 1 |
| **SDE Strong Order** | **SRIW1, Order 3/2** | `SRIW1()` | 3/2 |
| **SDE Weak Order** | **Euler-Maruyama (EM), Order 1** | `EM()` | 1 |
| **SDE Weak Order** | **Milstein (RKMil), Order 1** | `RKMil()` | 1 |
| **SDE Weak Order** | **SRIW1, Order 2** | `SRIW1()` | 2 |

The Overview gives the source of each order.

## Inputs of Check a Convergence Order

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Solver** | RK4 or Euler-Maruyama | All | The solver whose order is estimated |
| **Largest Step** | 0.0625 | All | The largest step size; each further step is half the one before |
| **Step Sizes** | 6 | All | The number of step sizes |
| **Paths** | 1000 or 10000 | **SDE Strong Order**, **SDE Weak Order** | The number of Brownian paths solved at each step size |
| **Seed** | 1 | **SDE Strong Order**, **SDE Weak Order** | The seed of the random number generator that draws the paths |
| **Allowed Gap** | 0.2 | All | How far the estimated order may be from the order of the theory for `@test` to pass |

## Functions of DiffEqDevTools

| Function or option | What it does |
|---|---|
| `test_convergence(dts, prob, alg)` | Solves an ordinary differential equation with fixed steps `dts` and compares each solution with the exact solution of `prob` |
| `test_convergence(dts, prob, alg, ensemblealg; trajectories)` | The same for a stochastic differential equation, on `trajectories` paths at each step |
| `analyticless_test_convergence` | Compares with a solution at a much smaller step, for a problem with no exact solution |
| `analytic` of `ODEFunction` or `SDEFunction` | The exact solution, `(u0, p, t)` for an ordinary equation and `(u0, p, t, W)` for a stochastic one |
| `EnsembleSerial()` | Solves the paths one after another, so that a seed set before decides them |

## Actions of Check a Convergence Order

| Group | Action | Tabs | Output |
|---|---|---|---|
| Visualise | **Error Against Step Size** | All | The errors on log scales, with a dashed line of the slope of the theory |
| Diagnose | **Order at Each Halving** | All | The order between each two successive steps |
| Diagnose | **Steps Too Small** | **ODE Solver** | RK4 at fourteen steps, down to 1/65536 |
| Diagnose | **Too Few Paths** | **SDE Strong Order**, **SDE Weak Order** | The order with a hundredth of the paths, at five seeds |
| Diagnose | **Against the Exact Mean** | **SDE Weak Order** | The weak error against exp(mu), with the standard error of the mean |
| Compare | **All the Solvers of the Tab** | All | The estimated order of each solver beside its theory |
| Compare | **Heun Written by Hand** | **ODE Solver** | Heun's method and the same method with a slip |
| Compare | **Milstein Written by Hand** | **SDE Strong Order** | Milstein's scheme and the same scheme without its correction |
| Interpret | **Step for a Target Error** | All | The step and the number of steps for errors of 1e-2, 1e-4 and 1e-6 |

The actions use the variables of the tab: run the tab's code first.

## See Also

- [Overview](overview.md) · [Convergence Tests in a Package](convergence-in-a-package.md)
