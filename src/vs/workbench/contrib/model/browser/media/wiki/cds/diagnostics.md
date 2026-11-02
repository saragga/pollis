# Diagnostics

Each diagnostic asks whether a result comes from the system, or from the settings used to compute it. Most can be run by changing one setting and looking for a change in the answer.

## How to Test Numerical Convergence

Rerun with tighter tolerances through `diffeq`, and compare. Orbits will agree up to a time, and then part, and that time should grow by a modest amount per added digit. Statistics, ranges and section shapes should not change. A change in statistics means that the run was not converged. For a test of the code rather than the solver, use a case with a known answer: at rho below 1, every orbit should approach the origin, and at rho = 10, it should settle on one of the outer equilibria.

## How to Check That the Transient Is Gone

Plot **Time Series** and judge where the behaviour becomes steady. Split a long run into halves, and compare means and ranges. Agreement between the halves supports the removal, and a drift suggests that `Ttr` is too small. Near a bifurcation, transients can run to thousands of time units, so that a fixed `Ttr = 100` may mislead. **State Summary** and **Phase Portrait** keep the transient unless `Ttr` is added, which can show as a stray line coming into the attractor.

## How to Test Convergence of the Lyapunov Exponent

**Lyapunov Indicator** returns a running average that settles slowly. Double **Time span (T)** several times, and watch the value. Changing the starting state gives a second check, since a single attractor should give the same value from every start, as **Multiple Initial Conditions** prints. The default T = 100 is short for this purpose. The standard approach follows nearby orbits and renormalises their separation, as in [Benettin, Galgani, Giorgilli and Strelcyn (1980)](#ref-BGGS1980a). Treat small values with caution, as a limit near zero takes a long time to resolve.

## How to Read the Sensitivity Check

**Sensitivity to ICs** fits the growth rate of log distance, from the start until the distance first passes 1. The slope should be near the value of **Lyapunov Indicator**, with noise from a single pair of orbits. A very different value can mean that the fit window has reached saturation, or that the orbit was still in transient. Plot `log.(dist)` against `t` to see the straight section. A distance that never grows means a non-chaotic regime, and `k` then falls at the end of the run.

## How to Check Fixed Points

Substitute each reported point in the rule, and confirm that the rates are near zero. Known forms offer a check: the origin, and (±sqrt(beta (rho − 1)), ±sqrt(beta (rho − 1)), rho − 1) when rho exceeds 1. Stability should change at known values, as [Sparrow (1982)](#ref-Spa1982a) sets out: the two outer points lose stability near rho = 24.74 at sigma = 10 and beta = 8/3. Results that contradict these values usually mean an edited rule that does not match its hand-coded Jacobian.

## How to Use Symmetry as a Check

The Lorenz equations are unchanged when x and y both flip sign. Long-run means of x and y should therefore be near zero when a single orbit explores both lobes, and their ranges should be close to mirror images. **State Summary** prints both. A mean far from zero means that T is too short, or that the orbit is held on one lobe, as happens near a stable equilibrium. A check of that kind costs nothing, and it often catches a run that is too short.

## References

<a id="ref-BGGS1980a"></a>Benettin, G., Galgani, L., Giorgilli, A. and Strelcyn, J.-M. (1980). Lyapunov characteristic exponents for smooth dynamical systems and for Hamiltonian systems; a method for computing all of them. *Meccanica* 15(1), 9–20. [doi:10.1007/BF02128236](https://doi.org/10.1007/BF02128236)

<a id="ref-Spa1982a"></a>Sparrow, C. (1982). *The Lorenz Equations: Bifurcations, Chaos, and Strange Attractors*. Springer. [doi:10.1007/978-1-4612-5767-7](https://doi.org/10.1007/978-1-4612-5767-7)

## See Also

- [Assumptions](assumptions.md) · [Solvers](solvers.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
