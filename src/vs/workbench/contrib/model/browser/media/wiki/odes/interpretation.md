# Ordinary Differential Equations — Interpretation

## Equilibria

An **equilibrium** (steady state) $u^*$ satisfies $F(u^*) = 0$: started there, the system stays there. Examples are the carrying capacity in logistic growth, the steady-state capital stock in the Solow model, and the coexistence point of predator and prey.

## Stability from the Jacobian

Near an equilibrium, $u' \approx J (u - u^*)$ with $J = \partial F / \partial u$ at $u^*$. The eigenvalues of $J$ decide what happens:

| Eigenvalues | Type | Behaviour |
|---|---|---|
| All real and negative | Stable node | Returns directly |
| Complex with negative real parts | Stable spiral | Returns while oscillating (damped cycles) |
| Real, opposite signs | Saddle | Unstable: pulled in along one direction, pushed out along another |
| Positive real parts | Unstable node or spiral | Moves away |
| Purely imaginary | Centre | Linearisation cannot decide; the nonlinear terms do |

The real part is a **rate**: a real part of $-0.2$ means deviations shrink by a factor $e$ every 5 time units, a **half-life** of $\ln 2 / 0.2 \approx 3.5$. The imaginary part $\omega$ gives the **period** of oscillation, $2\pi / \omega$.

## Reading a Phase Portrait

- Equilibria are where the arrows vanish.
- Closed loops are periodic cycles, like the Lotka-Volterra predator-prey cycle.
- Trajectories cannot cross in an autonomous system: the arrows at a point are unique.
- For a second-order equation, the $(y, y')$ plane shows energy: undamped oscillations are closed loops; damped ones spiral into equilibrium.

## Long-Run and Transient Behaviour

- **Transient:** how the system moves towards its long-run behaviour, measured by the time to reach the maximum, the overshoot, and the half-life.
- **Long run:** convergence to an equilibrium, a periodic cycle, divergence, or chaos. **Extend the Horizon** checks which.

## Units and Scale

Rates in $f$ carry units per unit of time. A growth rate of 0.8 per year and a time span of 20 years make 16 "e-foldings" of time. Rescaling time or state to order one often improves solver behaviour and understanding.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
