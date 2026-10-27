# Bifurcation Diagrams

A **bifurcation** is a parameter value at which the long-term behaviour of a system changes in kind. A **bifurcation diagram** plots a measure of the system's states (here, x at each equilibrium) against the parameter. Two approaches, with different strengths, draw one.

## Numerical Continuation (the Bifurcation Tab)
BifurcationKit.jl follows a **branch of equilibria** as the parameter changes, by **pseudo-arclength continuation** (`PALC`): from a known equilibrium it predicts the next one along the branch and corrects it with Newton's method. Along the way it computes the eigenvalues of the Jacobian, which give the stability, and detects where they cross zero:

- a real eigenvalue crossing zero: a **branch point**, such as a pitchfork, where new branches meet this one;
- a pair of complex eigenvalues crossing the imaginary axis: a **Hopf** point, where oscillations are born.

For Lorenz the tab starts at the origin with rho = 0.5, finds the pitchfork at rho = 1, **switches branch** there onto C+ and C- (`continuation(origin, 1, opts; bothside = true)`), and finds the Hopf at 24.74. `detect_bifurcation = 3` and `n_inversion` locate each point by bisection. The **Bifurcation Diagram** action plots the branches, solid where stable and dashed where unstable.

Continuation is deterministic and exact to the tolerance, and follows **unstable** equilibria, which no simulation can see. It does not see chaotic attractors.

## Global Continuation (Attractors.jl)
`global_continuation(AttractorSeedContinueMatch(mapper), pcurve, sampler)` finds **all attractors**, by simulation, at each parameter value, and matches them from one value to the next, giving the basin fractions of every attractor along the parameter. It sees chaos, and shows how basins grow and shrink, but only stable sets, and its results depend on the random starting points.

For Lorenz it shows what continuation cannot: the chaotic attractor appearing near rho = 24.06, three coexisting attractors up to 24.74, and the chaotic attractor alone after it. The **Tipping Point** action gives a simpler version: the number of attractors over a sweep of rho.

## Which to Use
Use both: continuation for where and how equilibria change stability, global continuation for what the system actually does at each parameter value.

## See Also
- [The Lorenz System](lorenz.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
