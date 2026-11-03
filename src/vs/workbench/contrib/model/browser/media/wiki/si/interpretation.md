# System Identification Methods: Interpretation

A fitted model is read through its coefficients, its poles and zeros, its frequency response and its fit on the validation data. With the default data, each reading can be checked against the plant that generated them.

## The ARX coefficients

With the defaults, the plant is

y(t) = 1.5 y(t−1) − 0.7 y(t−2) + u(t−1) + 0.5 u(t−2) + e(t),

so A(q) = 1 − 1.5q⁻¹ + 0.7q⁻² and B(q) = q⁻¹ + 0.5q⁻². The tooltip of **Output data (y)** notes that ARX with na = nb = 2 should recover these coefficients. The `println(model)` line prints the transfer function B/A in powers of z, the variable of the discrete-time transfer function in ControlSystems.jl.

The sign convention matters: the coefficient of y(t−1) in the difference equation is 1.5, while the coefficient a₁ of A(q) is −1.5.

## Poles and zeros

**Transfer Function** prints `tf(model)`, its `poles` and its `tzeros`, and **Pole-Zero Map** draws them with `pzmap`. The poles of the default plant are the roots of z² − 1.5z + 0.7, 0.75 ± 0.37i, with modulus √0.7, about 0.84: inside the unit circle, so the plant is stable.

The zero of B(z) = z + 0.5 is at −0.5. [Söderström and Stoica (1989)](#ref-SS1989a) list common factors of A and B, in noise-free data fitted with too high an order, among the cases in which the least-squares problem of an ARX model is singular.

## Frequency response

**Bode Plot** draws the magnitude and phase of the model over frequency with `bodeplot`. **Compare Structures** overlays the Bode plots of the four structures fitted to the same estimation data, and **Parameter Uncertainty** those of the fit to all estimation data and to its two halves.

The ControlSystemIdentification.jl documentation relates the focus of a fit to frequency: low frequencies matter for simulation, higher frequencies for prediction. The **OE** tab minimises the simulation error.

## State-space models

[Van Overschee and De Moor (1995)](#ref-OM1995a) note that the extended observability matrix is determined only up to a non-singular similarity transformation T, and the subspace problem is to find A, B, C, D and the noise covariances up to a similarity transformation.

For the **N4SID** tab, the printed matrices A, B, C, D and K are one such realisation. **Transfer Function** converts the state-space models of **N4SID** and **OE** to transfer functions, which can be compared with B/A of the polynomial models.

## The fit percentage

The fit 100 (1 − ‖y − ŷ‖ / ‖y − ȳ‖) is a ratio of norms. The description of **Fit Percentage** states that 100% is perfect, 0% is no better than the mean, and that the fit is a norm ratio, not variance explained.

A fit of 80% means a residual norm one fifth of the norm of the deviations of y from its mean. The printed estimation fit sets the validation fit in context: the action notes that a much higher estimation fit suggests overfitting.

## Parameter uncertainty

The ARX coefficients printed by **Parameter Uncertainty** carry standard deviations from `stochastic = true`, as Particles of MonteCarloMeasurements.jl; the description of the action derives them from the least-squares covariance. With the defaults, the coefficients −1.5, 0.7, 1 and 0.5 of the plant give a reference against which the means and standard deviations can be read.

The Bode plots of the two halves show the spread of the frequency response over two separate fits; the action description reads large differences as poorly determined dynamics.

## References

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

<a id="ref-OM1995a"></a>Van Overschee, P., & De Moor, B. (1995). A Unifying Theorem for Three Subspace System Identification Algorithms. *Automatica* 31(12), 1853-1864. [doi:10.1016/0005-1098(95)00072-0](https://doi.org/10.1016/0005-1098(95)00072-0)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [ARX / ARMAX](arx-armax.md) · [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
