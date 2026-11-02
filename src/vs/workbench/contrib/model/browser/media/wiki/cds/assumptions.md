# Assumptions

Few of the assumptions here are statistical. They concern the form of the rule, the link between the computed orbit and the true one, and what a finite run can say about long-run behaviour.

## What the Differential Equation Assumes

The state is taken to change smoothly, and to depend only on the present state, with no delays or randomness. A rule with continuous derivatives has a unique solution through each point, so orbits do not cross in phase space, as [Strogatz (2015)](#ref-Str2015a) shows. That is why chaos needs at least three variables in a flow. Delay, noise and discrete events each break the setting, and need another type of system. A rule with a kink can defeat the solver's error control.

## Why the Lorenz Model Is Not the Weather

[Lorenz (1963)](#ref-Lor1963a) truncated a convection model to three modes, and the result is a severe simplification. A real fluid has very many active scales. Its chaos may have very different properties, and the exact values here apply to the three equations only. The system is good for teaching and for testing methods. Claims about the atmosphere or any other real system need a model fitted to and checked against that system.

## What Fixed Parameters Assume

Parameters stay constant over the run, and are taken as known. Real systems have uncertain, drifting parameters, and small changes can change the type of motion near a bifurcation. Rule fitting and uncertainty quantification lie outside the panel, which simulates a rule as given. Use **Parameter Sweep** to see how much the conclusion depends on the chosen values. Note that it fixes sigma and beta, and that it covers rho between 20 and 30 only.

## What a Numerical Orbit Assumes

A computed orbit is treated as a good stand-in for a true one. That holds for short times, up to the limit set by tolerance and Lyapunov exponent. Over long times, it holds only in the sense that the computed orbit may stay near some true orbit from a slightly different start, a property called shadowing, which is known for some systems and not for all. For the classical Lorenz values, the proof by [Tucker (2002)](#ref-Tuc2002a) shows that the attractor is not a numerical artefact.

## What Long-Run Statistics Assume

A time average stands for long-run behaviour only if the orbit has reached the attractor and has explored it. Long-run averages from different starts agree only where a single attractor attracts almost all starts. Transients can be long, and they can look chaotic before settling, which a short run misclassifies. Two attractors can also coexist, in which case different starts give different answers. **State Summary** keeps the transient, so its figures mix both phases unless `Ttr` is added.

## What the Panel's Search Box Assumes

**Fixed Points** searches inside a fixed box, and it needs a smooth rule and a Jacobian. An equilibrium outside the box is missed with no warning. Equilibria of the Lorenz system sit at z = rho − 1, so a rho above 61 leaves the box's z range. Stability from eigenvalues is local, and describes small perturbations only. A stable equilibrium does not mean that orbits starting far from it will reach it.

## References

<a id="ref-Lor1963a"></a>Lorenz, E. N. (1963). Deterministic nonperiodic flow. *Journal of the Atmospheric Sciences* 20(2), 130–141. [doi:10.1175/1520-0469(1963)020&lt;0130:DNF&gt;2.0.CO;2](https://doi.org/10.1175/1520-0469(1963)020%3C0130:DNF%3E2.0.CO;2)

<a id="ref-Str2015a"></a>Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos*, 2nd ed. Westview Press.

<a id="ref-Tuc2002a"></a>Tucker, W. (2002). A rigorous ODE solver and Smale's 14th problem. *Foundations of Computational Mathematics* 2(1), 53–117. [doi:10.1007/s002080010018](https://doi.org/10.1007/s002080010018)

## See Also

- [Factsheet](factsheet.md) · [Solvers](solvers.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
