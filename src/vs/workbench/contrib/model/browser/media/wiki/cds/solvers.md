# Solvers

Almost no nonlinear flow has a formula for its solution, so a numerical integrator stands in for the exact flow. Its settings decide how far a computed orbit can be trusted.

## How an Adaptive Solver Moves Forward

An explicit Runge-Kutta method evaluates the rule at several points inside a step, and combines them. An embedded pair computes two estimates of different orders, and their difference estimates the error. A step is accepted if the error is below the tolerance, and the next step grows or shrinks to match. [Dormand and Prince (1980)](#ref-DP1980a) gave the classic fifth-order pair. Steps become small where the orbit turns quickly, and large where it moves smoothly, with no input from the user.

## Which Solver CoupledODEs Uses

`CoupledODEs` passes the work to the Julia ecosystem of [Rackauckas and Nie (2017)](#ref-RN2017a). Its usual default is `Tsit5`, the fifth-order pair of [Tsitouras (2011)](#ref-Tsi2011a), with tolerances near 1e-6. That is a good general choice for non-stiff problems at moderate accuracy. Set the choice explicitly when it matters, through the `diffeq` keyword, with the solver loaded from `OrdinaryDiffEq`:

- `CoupledODEs(lorenz!, u0, p; diffeq = (alg = Vern9(), abstol = 1e-12, reltol = 1e-12))`

## Why Dt Is Not the Step Size

`Dt` in `trajectory` sets how often the state is recorded, not how the solver advances. Recorded points come from interpolation between internal steps, so a smaller `Dt` adds output, and does not add accuracy. Accuracy comes from `abstol` and `reltol`. A coarse `Dt` still matters to the results, because a figure made of few points looks jagged, and an extreme value between samples goes unseen. **Multiple Initial Conditions** records at `Dt = 0.1`, so its ranges run slightly inside the true ones.

## What Stiffness Is and When It Matters

A problem is stiff if some components decay far faster than the motion of interest. An explicit method must then take tiny steps for stability, not for accuracy, and the run becomes very slow. The Lorenz system at standard values is not stiff in that sense. Fast-slow systems, such as those in chemical kinetics or neurons, can be. An implicit solver such as `Rodas5` handles that case, and [Hairer and Wanner (1996)](#ref-HW1996a) give the theory. A run that slows sharply with no visible activity is the usual sign.

## How Much Accuracy Chaos Allows

Any error in a chaotic orbit grows at the rate of the largest Lyapunov exponent, so a local tolerance gives no lasting global accuracy. Tightening the tolerance only extends the window of correct prediction, and it does so slowly, in proportion to the log of the tolerance. Beyond that window, the computed orbit differs from the true orbit from the same start. Long-run statistics usually survive, because the computed orbit still lies on the attractor. General error theory for such methods is in [Hairer, Nørsett and Wanner (1993)](#ref-HNW1993a).

## When to Tighten or Change the Solver

| Goal | Setting |
|---|---|
| Shape of the attractor, statistics | Defaults |
| Short-time prediction, comparing orbits | Tolerances of 1e-10 or tighter |
| Lyapunov exponents to several digits | Tight tolerances, long runs |
| Conserved quantities over long times | A symplectic or high-order method |
| Stiff rule | An implicit method |

Run again with tighter tolerances. A result that changes needs tighter settings.

## References

<a id="ref-DP1980a"></a>Dormand, J. R. and Prince, P. J. (1980). A family of embedded Runge-Kutta formulae. *Journal of Computational and Applied Mathematics* 6(1), 19–26. [doi:10.1016/0771-050X(80)90013-3](https://doi.org/10.1016/0771-050X(80)90013-3)

<a id="ref-HNW1993a"></a>Hairer, E., Nørsett, S. P. and Wanner, G. (1993). *Solving Ordinary Differential Equations I*, 2nd ed. Springer. [doi:10.1007/978-3-540-78862-1](https://doi.org/10.1007/978-3-540-78862-1)

<a id="ref-HW1996a"></a>Hairer, E. and Wanner, G. (1996). *Solving Ordinary Differential Equations II*, 2nd ed. Springer. [doi:10.1007/978-3-642-05221-7](https://doi.org/10.1007/978-3-642-05221-7)

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-Tsi2011a"></a>Tsitouras, C. (2011). Runge–Kutta pairs of order 5(4) satisfying only the first column simplifying assumption. *Computers and Mathematics with Applications* 62(2), 770–775. [doi:10.1016/j.camwa.2011.06.002](https://doi.org/10.1016/j.camwa.2011.06.002)

## See Also

- [Factsheet](factsheet.md) · [Poincare Sections](poincare.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
