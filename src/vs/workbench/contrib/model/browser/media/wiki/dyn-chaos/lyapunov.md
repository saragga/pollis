# Lyapunov Exponents

Lyapunov exponents give the long-run average rates at which small differences grow or shrink. A positive largest exponent is the standard numerical sign of chaos.

## What the Exponents Mean

A tiny error along the orbit changes roughly as e^(λt). A system with n variables has n exponents, one for each independent direction, ordered from largest to smallest. Together, they describe how a small ball of starts stretches into an ellipsoid. λ1 above zero means stretching, so the orbit diverges from its neighbours. Sums of exponents give rates for areas and volumes, and the sum of them all is the mean rate of change of volume in state space.

## How the Code Computes Them

`lyapunov` follows two nearby orbits, measures their growing separation, and rescales it to keep it small. `lyapunovspectrum` follows the system with several tangent directions, and it re-orthogonalises them at regular intervals, so that they do not collapse onto the fastest one. [Benettin, Galgani, Giorgilli and Strelcyn (1980)](#ref-BGGS1980a) set out that scheme. Both drop a transient of 100 time units, so that the estimate is taken on the attractor, and both average over **Integration time (T)**.

## What the Lorenz Values Should Be

For an orbit of a flow that is not a fixed point, one exponent is exactly zero, along the direction of motion. The sum is known too, as the divergence of the Lorenz equations is a constant:

- λ1 + λ2 + λ3 = −(σ + 1 + β) = −13.667

The commonly reported values are λ1 of about 0.906, λ2 = 0 and λ3 of about −14.57, which add to −13.66. These two facts are a firm check on `lyapunovspectrum`.

## How the Kaplan-Yorke Dimension Follows

[Kaplan and Yorke (1979)](#ref-KY1979a) linked exponents to dimension. Add exponents from the largest until the sum would turn negative, after j terms:

- D_KY = j + (λ1 + … + λj) / |λ(j+1)|

For Lorenz, j = 2 and D_KY = 2 + 0.906 / 14.57, about 2.062. Intuitively, the set has the dimension at which the stretching and the contraction balance. `kaplanyorke_dim` applies this to the spectrum, and **Lyapunov vs Fractal Dim** sets it against D2.

## How Exponents Are Estimated from Data

Without equations, tangent dynamics are not available, so a method tracks pairs of close states, and fits a slope to the mean log distance as steps go forward. [Rosenstein, Collins and De Luca (1993)](#ref-RCD1993a) and [Kantz (1994)](#ref-Kan1994a) describe methods of that kind. Results depend on the embedding, the Theiler window and the range of the fit. **Noise Sensitivity** and **vs Linear Surrogate** use `lyapunov_from_data` in this way. The slope only makes sense over the rising part of the curve: the distance saturates at the size of the attractor.

## What the Exponent Says about Forecasts

The Lyapunov time 1 / λ1 is the natural time scale for error growth, about 1.1 time units for Lorenz. With an error δ0 and a tolerance Δ, the horizon is about:

- T_pred = ln(Δ / δ0) / λ1

**Predictability Horizon** uses δ0 = 1e-6 and Δ = 0.1, which at λ1 = 0.906 gives about 12.7. Tenfold better starting accuracy adds only about 2.5 time units. The formula is meaningful only when λ1 is positive.

## References

<a id="ref-BGGS1980a"></a>Benettin, G., Galgani, L., Giorgilli, A. and Strelcyn, J.-M. (1980). Lyapunov characteristic exponents for smooth dynamical systems and for Hamiltonian systems; a method for computing all of them. Part 1: Theory. *Meccanica* 15(1), 9–20. [doi:10.1007/BF02128236](https://doi.org/10.1007/BF02128236)

<a id="ref-Kan1994a"></a>Kantz, H. (1994). A robust method to estimate the maximal Lyapunov exponent of a time series. *Physics Letters A* 185(1), 77–87. [doi:10.1016/0375-9601(94)90991-1](https://doi.org/10.1016/0375-9601(94)90991-1)

<a id="ref-KY1979a"></a>Kaplan, J. L. and Yorke, J. A. (1979). Chaotic behavior of multidimensional difference equations. In *Functional Differential Equations and Approximation of Fixed Points*, Lecture Notes in Mathematics, 204–227. Springer. [doi:10.1007/BFb0064319](https://doi.org/10.1007/BFb0064319)

<a id="ref-RCD1993a"></a>Rosenstein, M. T., Collins, J. J. and De Luca, C. J. (1993). A practical method for calculating largest Lyapunov exponents from small data sets. *Physica D: Nonlinear Phenomena* 65(1–2), 117–134. [doi:10.1016/0167-2789(93)90009-P](https://doi.org/10.1016/0167-2789(93)90009-P)

## See Also

- [Factsheet](factsheet.md) · [Fractal Dimension](fractal-dim.md) · [Recurrence Analysis](rqa.md) · [Diagnostics](diagnostics.md)
