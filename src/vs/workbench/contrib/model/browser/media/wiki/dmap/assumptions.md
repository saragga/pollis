# Assumptions

A map has no noise and no fitted parameters, so the assumptions concern what a finite computer run can say about the true long-run behaviour.

## What the Map Assumes

The rule is deterministic, autonomous and exact: the next state depends only on the current one, and the parameters do not change with time. Real systems with noise or drift need a different model. The code defines one map, the Hénon map in `henon`, and a different map means editing that function, along with `henon_jac` for **Fixed Points of Map**. **Initial state (u0)** must then match its dimension. A smooth rule is needed for the Jacobian and for the usual theory of exponents.

## What Discarding a Transient Assumes

Most actions drop the first 1000 steps, on the assumption that the orbit has reached its long-run set by then. The assumption usually holds at the defaults, since an orbit there quickly falls on the attractor. It fails near a bifurcation, where convergence slows sharply, and near a crisis, where chaos may last a long time before an escape. **Time Series** keeps the transient so that it can be seen. A check is to raise **Iterations (n)** and to see whether the results move.

## What an Attractor Assumes

Talk of the attractor assumes that one set draws in the orbits from a region, called its basin. Starts outside the basin escape to infinity, and at some parameters several attractors can coexist, each with its own basin. No claim holds for all starts. Numerical pictures also do not prove that a strange attractor exists. [Benedicks and Carleson (1991)](#ref-BC1991a) proved strange attractors for a positive-measure set of parameters with small b, and the classic a = 1.4, b = 0.3 lies outside that proof. A very long stable cycle at those values cannot be excluded by a finite run.

## What Finite Precision Assumes

Double precision holds about 16 digits, and with an exponent of 0.42, a rounding error grows to the size of the attractor in about 88 steps. After that, a computed orbit is not close to the true orbit from the same start. Results are still useful if a true orbit stays near the computed one from a slightly different start. [Hammel, Yorke and Grebogi (1987)](#ref-HYG1987a) showed such shadowing over long stretches for the logistic map. Statistics and shapes then remain meaningful, but a specific state far ahead does not.

## What Long-Run Averages Assume

**State Statistics** and **Lyapunov Exponent** use a time average along one orbit, which assumes that the average settles to a value and that it does not depend on the start, for typical starts in the basin. The framework is the ergodic theory reviewed by [Eckmann and Ruelle (1985)](#ref-ER1985a). In practice, the assumption is tested rather than proved, by comparing long orbits from several starts, as in **Multiple Initial Conditions**. Averages along a chaotic orbit converge slowly, and the orbit is not a random sample, so standard errors do not carry over.

## References

<a id="ref-BC1991a"></a>Benedicks, M. and Carleson, L. (1991). The dynamics of the Hénon map. *Annals of Mathematics* 133(1), 73–169. [doi:10.2307/2944326](https://doi.org/10.2307/2944326)

<a id="ref-ER1985a"></a>Eckmann, J.-P. and Ruelle, D. (1985). Ergodic theory of chaos and strange attractors. *Reviews of Modern Physics* 57(3), 617–656. [doi:10.1103/RevModPhys.57.617](https://doi.org/10.1103/RevModPhys.57.617)

<a id="ref-HYG1987a"></a>Hammel, S. M., Yorke, J. A. and Grebogi, C. (1987). Do numerical orbits of chaotic dynamical processes represent true orbits? *Journal of Complexity* 3(2), 136–145. [doi:10.1016/0885-064X(87)90024-0](https://doi.org/10.1016/0885-064X(87)90024-0)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
