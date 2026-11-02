# Diagnostics

Every estimate here has a setting that can change the answer. The checks test convergence in time, stability under noise, consistency between measures, and a comparison with a null.

## How to Check That an Exponent Has Converged

**Lyapunov Convergence** plots the estimate of λ1 across T from 10 to 500. Early values swing, and a settled curve is a flat one with small remaining wiggles. Chaotic averages narrow slowly, roughly as 1 / √T, so doubling T only cuts the error by about 30%. Report λ1 with the digits that remain stable, and raise **Integration time (T)** if the curve is still moving at 200. A different start on the same attractor should give the same value within that range.

## How to Check the Spectrum by Hand

Lorenz offers two exact checks on the output of `lyapunovspectrum`:

| Check | Expected |
|---|---|
| λ2 | Zero, the direction of motion |
| Sum of exponents | −(σ + 1 + β) = −13.667 |

For another flow, the second check needs the mean divergence of the vector field along the orbit, and the first holds so long as the orbit is not at a fixed point. An error in these suggests a problem with T or with the integration. Together, they catch coding mistakes in a new system.

## How to Check the Dimension Fit

**Correlation Dimension** shows log C against log ε. Look for a straight part at least a decade wide. Plotting the local slope makes the check clearer. Without a plateau in the slope, no value should be quoted. Repeat at a larger T, and see whether the slope holds: a value that keeps rising with more data suggests that the record was too short. Exclude close-in-time pairs if the slope falls towards 1 at small ε. Compare with **Lyapunov vs Fractal Dim**, in which D2 should be close to, and normally not above, D_KY.

## How to Test against Surrogates

**vs Linear Surrogate** compares the data exponent with 19 phase-randomised series, which share the power spectrum but lack nonlinear structure. The method comes from [Theiler, Eubank, Longtin, Galdrikian and Farmer (1992)](#ref-TELGF1992a). If the data value is above all 19, the null of a linear Gaussian process is rejected at the one-sided 5% level, as 1 / (19 + 1) = 0.05. A rejection shows nonlinear structure, or a mismatch with the null such as a non-Gaussian marginal. It does not by itself establish chaos.

## How to Test the Effect of Noise

**Noise Sensitivity** prints the exponent from the equations, from clean data, and from data with 1% noise. The first two should be broadly alike. If they differ widely, the data-based method needs better settings before the noise matters. A large change with noise signals that the estimate is fragile, and that a measured series at that noise level cannot be trusted with these settings. Since the noise is random and has no fixed seed in the code, repeat the action to see how much of the change is just sampling.

## How to Check the Embedding and Stationarity

**Embedding Dimension** gives a delay and a dimension, by the first minimum of mutual information, from [Fraser and Swinney (1986)](#ref-FS1986a), and the false-neighbour method of [Cao (1997)](#ref-Cao1997a). Too small a delay makes coordinates redundant, and too large a one unrelated. A dimension at the top of the search range suggests noise or high complexity. **vs Linear Surrogate** fixes d = 3, so compare the two, and edit `d` if they differ. **Stationarity Check** should show close DET values in both halves.

## References

<a id="ref-Cao1997a"></a>Cao, L. (1997). Practical method for determining the minimum embedding dimension of a scalar time series. *Physica D: Nonlinear Phenomena* 110(1–2), 43–50. [doi:10.1016/S0167-2789(97)00118-8](https://doi.org/10.1016/S0167-2789(97)00118-8)

<a id="ref-FS1986a"></a>Fraser, A. M. and Swinney, H. L. (1986). Independent coordinates for strange attractors from mutual information. *Physical Review A* 33(2), 1134–1140. [doi:10.1103/PhysRevA.33.1134](https://doi.org/10.1103/PhysRevA.33.1134)

<a id="ref-TELGF1992a"></a>Theiler, J., Eubank, S., Longtin, A., Galdrikian, B. and Farmer, J. D. (1992). Testing for nonlinearity in time series: the method of surrogate data. *Physica D: Nonlinear Phenomena* 58(1–4), 77–94. [doi:10.1016/0167-2789(92)90102-S](https://doi.org/10.1016/0167-2789(92)90102-S)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Lyapunov Exponents](lyapunov.md) · [Fractal Dimension](fractal-dim.md)
