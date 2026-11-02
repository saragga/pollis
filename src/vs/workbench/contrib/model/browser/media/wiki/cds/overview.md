# Overview

A continuous dynamical system follows a rule that gives the rate of change of a state at every instant. The panel simulates one such rule, the Lorenz system, and asks what its long-run behaviour looks like.

## What a Continuous Dynamical System Is

A state u moves according to a differential equation:

- du/dt = f(u, p, t)

Here f is the rule and p holds fixed parameters. Starting from an initial state, the solution traces a curve called a trajectory or orbit, in a space called phase space, with one axis for each state variable. A rule with no explicit t is autonomous, so that the future depends only on the present state. Long-run behaviour falls into a few types, from equilibria to closed loops to chaos, as set out in [Strogatz (2015)](#ref-Str2015a).

## Why the Lorenz System Is the Example

[Lorenz (1963)](#ref-Lor1963a) reduced a model of atmospheric convection to three equations:

- dx/dt = sigma (y − x)
- dy/dt = x (rho − z) − y
- dz/dt = x y − beta z

At sigma = 10, rho = 28 and beta = 8/3, the solution never settles and never repeats. Three variables and two simple products are enough for this. The system is cheap to simulate, and is a standard test for tools, so the panel uses it to show each idea. Replacing `lorenz!` with another rule lets the same steps study other systems.

## What Chaos Means Here

Chaos is bounded, aperiodic motion from a deterministic rule, with sensitive dependence on initial conditions. Two nearby orbits separate at an exponential rate, until the separation reaches the size of the attractor. Volumes in phase space shrink at the same time, so that orbits collect on a thin, folded set called a strange attractor. Numerical runs suggested this long before a proof, and [Tucker (2002)](#ref-Tuc2002a) gave a computer-assisted proof that the attractor exists at the classical values.

## What the Panel Provides

| Group | Actions | Question |
|---|---|---|
| Visualise | **Phase Portrait**, **Time Series**, **Poincare Section** | What does the motion look like? |
| Diagnose | **Sensitivity to ICs**, **Fixed Points** | Is it chaotic, and where are the equilibria? |
| Predict | **Forward Simulation**, **Parameter Sweep** | How far ahead can it be known, and how do parameters change it? |
| Compare | **Multiple Initial Conditions**, **Nearby Trajectories** | Does the starting point matter? |
| Interpret | **Lyapunov Indicator**, **State Summary** | What type of orbit is it, and what are its statistics? |

## A Common Workflow for Studying a Flow

1. Run the panel, then look at **Time Series** and **Phase Portrait**.
2. Find equilibria and their stability with **Fixed Points**.
3. Classify the orbit with **Lyapunov Indicator**.
4. Confirm sensitivity with **Sensitivity to ICs** and **Nearby Trajectories**.
5. See the structure with **Poincare Section**.
6. Map out changes in behaviour with **Parameter Sweep**.

Repeat the steps with a longer **Time span (T)** before trusting a conclusion.

## References

<a id="ref-Lor1963a"></a>Lorenz, E. N. (1963). Deterministic nonperiodic flow. *Journal of the Atmospheric Sciences* 20(2), 130–141. [doi:10.1175/1520-0469(1963)020&lt;0130:DNF&gt;2.0.CO;2](https://doi.org/10.1175/1520-0469(1963)020%3C0130:DNF%3E2.0.CO;2)

<a id="ref-Str2015a"></a>Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos*, 2nd ed. Westview Press.

<a id="ref-Tuc2002a"></a>Tucker, W. (2002). A rigorous ODE solver and Smale's 14th problem. *Foundations of Computational Mathematics* 2(1), 53–117. [doi:10.1007/s002080010018](https://doi.org/10.1007/s002080010018)

## See Also

- [Factsheet](factsheet.md) · [Solvers](solvers.md) · [Poincare Sections](poincare.md) · [Decision Guide](decision-guide.md)
