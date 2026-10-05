# Ordinary Differential Equations — Assumptions

## Existence and Uniqueness

- **Picard-Lindelof theorem.** If $f$ is continuous and **Lipschitz** in $y$ (for example, has a bounded derivative $\partial f / \partial y$), then exactly one solution passes through each starting point, at least for a while.
- **Non-uniqueness.** $y' = \sqrt{|y|}$, $y(0) = 0$ has the solution $y = 0$ and also $y = t^2/4$; a solver will quietly pick one.
- **Finite-time blow-up.** $y' = y^2$, $y(0) = 1$ has the solution $1/(1 - t)$, which becomes infinite at $t = 1$. The solver shrinks its steps and stops with the return code `DtLessThanMin` or `Unstable`. That is a property of the equation, not a solver failure.

## Smoothness Drives Accuracy

- The order of a method (4 for RK4, 5 for Tsit5) assumes $f$ has that many continuous derivatives.
- **Switches, kinks and jumps** in $f$, such as `max(0, ...)`, `if` statements or a policy change at a date, reduce accuracy near the switch. Put the date at the end of one solve and start a new one there, or use callbacks (`DiscreteCallback`, `ContinuousCallback` in OrdinaryDiffEq).

## Tolerances

- `reltol` and `abstol` control the **local** error of each step. The global error at the end can be larger, especially for unstable or chaotic systems where errors grow.
- `abstol` matters when a component passes through zero; this panel uses `reltol / 1000`.
- Tolerances tighter than about `1e-13` hit the limit of double precision.

## Chaos

In chaotic systems such as the Lorenz equations, nearby trajectories separate exponentially fast. Beyond a few multiples of the separation time, no tolerance gives an accurate individual trajectory. Statistical features, such as the shape of the attractor or long-run averages, are still reliable.

## Model Assumptions

An ODE assumes the state is fully described by a few numbers, that nothing is random, and that there is no delay. Spatial spread needs a PDE (see the Partial Differential Equations panel), random shocks need a stochastic differential equation, and delays need a delay differential equation (DelayDiffEq.jl).

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
