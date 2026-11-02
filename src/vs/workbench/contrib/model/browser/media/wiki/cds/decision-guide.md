# Decision Guide

Choices here cover which question to ask of a flow, and how long and how accurately to run it. Most errors come from runs that are too short, rather than from a wrong tool.

## Which Action Answers Which Question

| Question | Action |
|---|---|
| What does the motion look like? | **Time Series**, **Phase Portrait** |
| What structure does the attractor have? | **Poincare Section** |
| Where could the system settle? | **Fixed Points** |
| Is the motion chaotic? | **Lyapunov Indicator**, **Sensitivity to ICs** |
| How long can it be predicted? | **Forward Simulation** |
| Does the start matter? | **Multiple Initial Conditions** |
| How do parameters change it? | **Parameter Sweep** |

## How to Choose T, Ttr and Dt

Pick `Ttr` long enough to reach the attractor, and T long enough to cover it. A figure of the attractor needs tens to hundreds of loops. A Lyapunov exponent needs far more, often thousands of time units, and a section needs more again, as crossings are rare. Set `Dt` well below the fastest visible oscillation, for smooth lines. Recording fewer points saves memory and costs no accuracy, as the solver still chooses its own steps. A cost of more T is only time, so increase it until answers stop moving.

## When to Change the Solver Settings

Defaults suit pictures of the attractor and rough statistics. Tighten tolerances when comparing two orbits, computing exponents, or locating crossings. A run that slows greatly should raise the question of stiffness, as a stiff rule needs an implicit method. Keep solver settings the same across a sweep, so that differences come from the parameters. High-order solvers such as `Vern9` become worthwhile at tight tolerances. [Hairer, Nørsett and Wanner (1993)](#ref-HNW1993a) cover how the work grows with accuracy.

## Whether to Classify by Exponent or by Picture

An exponent gives a single number that can be used across a sweep, but it can be slow to converge, and it hides coexisting attractors. A picture shows structure at once, but the eye can take a long transient, or a long period, for chaos. Use both. A positive exponent that holds up as T grows, plus a section that shows fine structure, plus bounded motion, is sound evidence. The tolerance of 0.01 in **Lyapunov Indicator** is a judgment call, and it should be larger for short runs.

## When to Go Beyond the Panel's Tools

Other questions need other methods:

- All Lyapunov exponents and dimension estimates, using other functions from `DynamicalSystems.jl`, described in [Datseris and Parlitz (2022)](#ref-DP2022a)
- A full bifurcation diagram, by a sweep with sections, or by continuation
- Basins of attraction, to map which starts reach which attractor
- A discrete-time rule, which needs a map rather than a flow
- A rule with delays or noise, which needs a different solver setup
- A rule estimated from data, which needs fitting before any of these steps

## What to Report from a Study of a Flow

Report the equations, the parameter values, the start, T, `Ttr`, the solver and its tolerances. Give a Lyapunov exponent with evidence of convergence, such as values at several T. State which plane and which direction a section uses. Say whether results were tested against tighter tolerances and other starts. Do not claim chaos from a figure alone, and do not use a single long orbit as a forecast. Results apply to the equations studied, and not automatically to the real system they stand for.

## References

<a id="ref-DP2022a"></a>Datseris, G. and Parlitz, U. (2022). *Nonlinear Dynamics*. Springer. [doi:10.1007/978-3-030-91032-7](https://doi.org/10.1007/978-3-030-91032-7)

<a id="ref-HNW1993a"></a>Hairer, E., Nørsett, S. P. and Wanner, G. (1993). *Solving Ordinary Differential Equations I*, 2nd ed. Springer. [doi:10.1007/978-3-540-78862-1](https://doi.org/10.1007/978-3-540-78862-1)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Solvers](solvers.md) · [Poincare Sections](poincare.md)
