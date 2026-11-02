# Factsheet

**Continuous Dynamical Systems** integrates a system of differential equations, and studies its orbits, equilibria and sensitivity. The example throughout is the Lorenz system.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Simulate a flow and classify its long-run behaviour |
| Julia stack | `DynamicalSystems.jl` for systems and analysis, `GLMakie.jl` for figures |
| System type | `CoupledODEs`, with an in-place rule `lorenz!` |
| Main functions | `trajectory`, `poincaresos`, `fixedpoints`, `lyapunov`, `reinit!` |
| Printed result | Final state, and the size of the trajectory |

The software is described in [Datseris (2018)](#ref-Dat2018a), and the integrators come from the ecosystem of [Rackauckas and Nie (2017)](#ref-RN2017a).

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Initial state (u0)** | [1.0, 0.0, 0.0] | Where the orbit starts |
| **Parameters (p)** | [10.0, 28.0, 8/3] | sigma, rho and beta |
| **Time span (T)** | 100.0 | Total integration time |

All three are pasted into the code as written, so any Julia expression of the right shape is accepted.

## What the Generated Code Fixes

| Setting | Value | Where |
|---|---|---|
| Sampling interval `Dt` | 0.01 | Most actions |
| Sampling interval `Dt` | 0.05 and 0.1 | **Parameter Sweep**, **Multiple Initial Conditions** |
| Transient `Ttr` | 100 | **Forward Simulation**, **Parameter Sweep**, **Multiple Initial Conditions**, **Lyapunov Indicator** |
| Section plane | x = 0 | **Poincare Section** |
| Perturbation | 1e-8 for each variable | **Sensitivity to ICs** |
| Perturbation | 1e-4 in x | **Nearby Trajectories** |
| Search box | x and y in [−30, 30], z in [0, 60] | **Fixed Points** |
| Range of rho | 20 to 30, 50 values | **Parameter Sweep** |
| Tolerance for a zero exponent | 0.01 | **Lyapunov Indicator** |

## Which Actions Ignore Which Inputs

| Action | Fixed in its code |
|---|---|
| **Parameter Sweep** | sigma = 10, beta = 8/3, and rho swept |
| **Forward Simulation** | Starting state [2.0, 3.0, 25.0] |
| **Multiple Initial Conditions** | Four starts, with y = 0 and z = 25 |
| **Nearby Trajectories** | Start at [1.0, 0.0, 0.0] |

**Fixed Points** has its own copy of the rule and a hand-coded Jacobian, so a change to `lorenz!` must be made there too.

## References

<a id="ref-Dat2018a"></a>Datseris, G. (2018). DynamicalSystems.jl: a Julia software library for chaos and nonlinear dynamics. *Journal of Open Source Software* 3(23), 598. [doi:10.21105/joss.00598](https://doi.org/10.21105/joss.00598)

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

## See Also

- [Overview](overview.md) · [Solvers](solvers.md) · [Poincare Sections](poincare.md) · [Diagnostics](diagnostics.md)
