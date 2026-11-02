# Assumptions

Most of these measures are defined in the limit: infinite time, infinitely small scales and noise-free states. Any finite estimate leans on assumptions about how close the data come to that.

## What the Exponents Assume

Existence of long-run exponents rests on the theorem of Oseledets, which requires a suitable invariant measure on the orbit. In practice, that means a stationary, ergodic system: one long orbit visits the whole attractor in the right proportions. The exponents may be different for orbits in different basins, so a transient must be dropped and the start must be in the right basin. Finite-time values vary locally, and only the long average has the theoretical meaning. An unrefined integration tolerance can also shift the result.

## What Stationarity Assumes

All three tabs assume that the rule does not change during the record. A series with a trend or a regime change gives recurrence patterns and exponents that mix different dynamics. **Stationarity Check** compares DET across two halves, using one threshold, and that test catches only a change that alters DET. A passing result does not prove stationarity. If the system is known to drift, cut the record to a stable part, or work with short windows, while allowing for the fall in precision.

## What Reconstruction Assumes

With a single measured variable, delay coordinates can rebuild the state. [Takens (1981)](#ref-Tak1981a) proved it under generic conditions, for a smooth observation and a dimension above about twice that of the set. Noise-free data of infinite length are assumed. Delays do not enter the theorem, yet in practice they matter a great deal. For Lorenz at D of about 2.06, theory gives 5 dimensions, although 3 often suffice for a useful picture. The measured variable must also reflect the dynamics: a variable blind to part of the state gives a poor reconstruction.

## What Low Noise Assumes

Dimension and exponent estimates need separation of scales: noise must be much smaller than the structure of interest. **Noise Sensitivity** tests 1% noise, and real data can be far noisier. Noise hides small-scale behaviour, and it shortens scaling regions. A positive exponent can even be returned for pure noise by a method that always fits a slope. Measured data thus need a test against a noise-based null. Averaging or filtering can reduce noise, but it can also distort the dynamics being measured.

## What Sample Size Assumes

Short records limit what can be seen. Pairs of close states become scarce quickly as dimension rises, and [Kantz and Schreiber (2004)](#ref-KS2004a) warn against over-reading low-dimensional results from limited data. A record should cover many cycles of the slowest dynamics, and not only many points: sampling more finely adds points, but it adds few independent states. **Integration time (T)** of 200 covers about 180 Lyapunov times for Lorenz, which is enough for a rough estimate.

## What the Hard-Coded System Assumes

**Lyapunov Exponents**, **Fractal Dimension** and the actions built on them run the Lorenz system, whatever is in **Time series (x)**. To study another system, edit the code. Lorenz's classical parameters are themselves a known case, for which a chaotic attractor has been proved to exist, a fact that a parameter chosen freely cannot rely on. Values such as D2 near 2.05 should not be carried to a new problem. Treat them only as a check that the code is working.

## References

<a id="ref-KS2004a"></a>Kantz, H. and Schreiber, T. (2004). *Nonlinear Time Series Analysis* (2nd ed.). Cambridge University Press.

<a id="ref-Tak1981a"></a>Takens, F. (1981). Detecting strange attractors in turbulence. In *Dynamical Systems and Turbulence, Warwick 1980*, Lecture Notes in Mathematics, 366–381. Springer. [doi:10.1007/BFb0091924](https://doi.org/10.1007/BFb0091924)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
