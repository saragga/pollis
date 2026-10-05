# Partial Differential Equations — Interpretation

## Heat Equation: Spreading and Settling

- **Diffusion length.** After time $t$, a disturbance has spread over about $\sqrt{2Dt}$. With $D = 0.01$, a bump widens by about 0.3 in 5 time units.
- **Modes decay at different rates.** Under fixed zero ends, the profile is a sum of sine modes $\sin(k\pi x/L)$, each decaying like $e^{-D(k\pi/L)^2 t}$. Fine detail (large $k$) disappears first. The slowest mode sets the time to steady state, about $L^2/(D\pi^2)$.
- **Steady state.** With fixed ends, the rod settles to a straight line between the end values. With no flux, it settles to the average of the initial profile.
- **Maximum principle.** Without a reaction term, the maximum never exceeds the larger of the initial maximum and the boundary values: diffusion creates no new peaks.

## Reaction-Diffusion

With a growth term $r(u) = u(1 - u)$ (Fisher-KPP), a local population invades as a **travelling front** at speed $2\sqrt{rD}$. The same equation describes the spread of an advantageous gene, of an invasive species and of an innovation.

## Wave Equation: Travel and Reflection

- d'Alembert: $u = F(x - ct) + G(x + ct)$. A pulse released from rest splits into two halves moving left and right at speed $c$.
- At a fixed end, a pulse reflects **upside down**. At a free (no-flux) end, it reflects the same way up.
- A string of length $L$ with fixed ends vibrates at frequencies $k c / (2L)$, the harmonics.
- Energy moves between kinetic and stretching forms but its total is constant.

## Poisson Equation: Balance

- $u$ is highest far from the boundary and near the sources. For a uniform source on the unit square, the centre value is about $0.0737$.
- The solution is smoother than the source: sharp hot spots give smooth humps.
- **Superposition:** the response to two sources is the sum of the responses, because the equation is linear.

## In Economics and Finance

- **Black-Scholes** is a heat equation after a change of variables: the option price diffuses backwards from its payoff at maturity.
- **Spatial economics** uses diffusion for the spread of technology, prices across regions and migration.
- **Mean-field games** couple a backward Hamilton-Jacobi-Bellman equation to a forward diffusion of the distribution of agents.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
