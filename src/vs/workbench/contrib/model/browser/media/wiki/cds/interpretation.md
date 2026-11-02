# Interpretation

Output describes the geometry of motion and the rate at which knowledge is lost, rather than a single answer. Read each output for what it says about the type of behaviour.

## How to Read the Time Series and Phase Portrait

**Time Series** shows x(t). Irregular switching in the sign of x means that the orbit moves between two lobes, with oscillations that grow on each lobe before a switch. No period is visible, and the times of switching look random although the rule is deterministic. **Phase Portrait** plots x against z, as a projection of a three-dimensional orbit, so lines that appear to cross in the figure do not cross in phase space. Both figures describe the attractor, and neither says which lobe the orbit will be on at a future time.

## What the Lyapunov Exponent Means

The largest exponent lambda is the long-run exponential rate of separation of nearby orbits. **Lyapunov Indicator** applies the usual reading for a flow:

| Sign of lambda | Long-run motion |
|---|---|
| Positive | Chaos |
| About zero | Periodic or quasi-periodic |
| Negative | Fixed point |

A flow always has one exponent of zero along the orbit, unless it stops, which explains the middle row. Units of lambda are one over time, so 1 / lambda sets a time scale. The value for the classical Lorenz system is near 0.91, as the code's comment notes.

## How to Read the Predictability Horizon

**Forward Simulation** prints log(tol / d0) / lambda: the time for an initial error d0 to grow to a tolerated error tol. A forecast is worthwhile up to that horizon, and past it, the attractor's range is the honest statement. The log makes better measurement very weak: a thousand-fold reduction in initial error adds only log(1000) / lambda time units. Horizons are averages, and some parts of the attractor predict better than others. A reasonable forecast past the horizon gives a range, or a distribution, instead of a point.

## What Fixed Points and Eigenvalues Say

**Fixed Points** lists each equilibrium, stability, and the largest real part of the Jacobian's eigenvalues. A negative value means that small disturbances decay, and a positive value means that some direction grows. Under the default parameters all three equilibria are unstable, so that orbits cannot settle anywhere. Chaos here lives among unstable equilibria, and each lobe spirals around one. Complex eigenvalues with small positive real part explain the slowly growing oscillations, as [Strogatz (2015)](#ref-Str2015a) describes.

## How to Read a Parameter Sweep

**Parameter Sweep** prints the range of x for each rho, after a transient. A small width means that the orbit settled, at x equal to ±sqrt(beta (rho − 1)), which may be far from zero. A wide range means continued motion. Behaviour changes near rho = 24.74, and [Sparrow (1982)](#ref-Spa1982a) describes the sequence of bifurcations. In a window just below that value, a stable equilibrium and the chaotic attractor coexist, so that the outcome depends on the start. A sweep from one start sees only one of them.

## How to Read the Summaries and Multiple Starts

**State Summary** gives the mean, the standard deviation and the extremes of each variable, as properties of the attractor. No orbit stays near the mean, so a mean describes a typical location across time, and not a typical state. **Multiple Initial Conditions** compares ranges and lambda from different starts. Close agreement supports a single attractor, even though the orbits themselves differ completely. **Nearby Trajectories** shows that in time: two lines match, then part, while each keeps the same overall character.

## References

<a id="ref-Spa1982a"></a>Sparrow, C. (1982). *The Lorenz Equations: Bifurcations, Chaos, and Strange Attractors*. Springer. [doi:10.1007/978-1-4612-5767-7](https://doi.org/10.1007/978-1-4612-5767-7)

<a id="ref-Str2015a"></a>Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos*, 2nd ed. Westview Press.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Poincare Sections](poincare.md) · [Decision Guide](decision-guide.md)
