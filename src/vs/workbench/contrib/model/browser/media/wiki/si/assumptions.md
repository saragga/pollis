# System Identification Methods: Assumptions

Each structure assumes that the data come from a linear, time-invariant system of a given form, observed through a constant sample time, excited by an informative input and disturbed by noise of a given kind. The assumptions decide whether the estimates converge to the true parameters as the data grow.

## Linear, time-invariant dynamics

All four structures are linear, with constant coefficients. [Söderström and Stoica (1989)](#ref-SS1989a) state the general model y(t) = G(q⁻¹; θ)u(t) + H(q⁻¹; θ)e(t) with fixed filters G and H, and [Van Overschee and De Moor (1995)](#ref-OM1995a) state the subspace problem for a system with constant matrices A, B, C and D and constant noise covariances.

The tooltip of **h** asks for a sample time that is constant throughout the experiment, and the tooltip of **Output data (y)** asks for an output sampled at that rate.

## A persistently exciting input

The tooltip of **Input data (u)** asks for a persistently exciting signal, and the default is a random binary signal of +1 and −1.

[Söderström and Stoica (1989)](#ref-SS1989a) list an input that is not persistently exciting of order nb among the cases in which the least-squares estimate of an ARX model is not consistent. In the unifying theorem of [Van Overschee and De Moor (1995)](#ref-OM1995a), the input is persistently exciting of order 2i, where i, a user-defined index that is "large enough", is the number of block rows of the extended observability matrix; the authors explain that the input should contain at least i sinusoids with distinct frequencies, and that any white or coloured noise signal also satisfies the assumption.

## Noise and consistency of least squares

[Söderström and Stoica (1989)](#ref-SS1989a) give two conditions for the consistency of least squares: E φ(t)φᵀ(t) nonsingular, and E φ(t)v(t) = 0, where v(t) is the equation error. The second is in most cases not satisfied; the important exception is white v(t). When v(t) is not white, it is correlated with past outputs, which are regressors.

The ARX model has v(t) = e(t), white, when the true system has the ARX form. They add that the least-squares method gives consistent estimates only under rather restrictive conditions, and that the bias is small when the signal-to-noise ratio is large. ARMAX, N4SID and OE model the noise differently.

## Open loop

[Söderström and Stoica (1989)](#ref-SS1989a) assume open-loop operation for their output-error analysis, E u(t)e(s) = 0 for all t and s, and list low-order linear feedback among the cases in which least squares fails.

Assumption 2 of [Van Overschee and De Moor (1995)](#ref-OM1995a), an input uncorrelated with the process and measurement noise, is satisfied in open loop; in closed loop, the authors note, the noise would be fed back to the inputs through the controller.

The default data are open loop: the binary input does not depend on the output.

## Stability for output error

For the output-error method, [Söderström and Stoica (1989)](#ref-SS1989a) assume that the true system G⁰ is stable, that the true noise filter H⁰ is stable and invertible, and that the polynomials of G⁰ have no common zeros. Under these assumptions and open loop, the estimate converges to the true parameters as N → ∞ and is asymptotically normal.

Their assumptions allow any stable and invertible H⁰, not only H⁰ = 1, while the output-error model itself has the noise model 1 and fits G alone.

## Enough data and the right delay

Assumption 4 of [Van Overschee and De Moor (1995)](#ref-OM1995a) is an infinite number of measurements, for the asymptotic analysis; in practice, they write, a large amount of data suffices. The default data have 700 samples for estimation and 300 for validation.

**nk** is the input delay in samples. The tooltip advises nk = 1 when there is no extra delay beyond the inherent one-step delay; a larger value shifts the B polynomial by nk − 1 further samples.

## References

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

<a id="ref-OM1995a"></a>Van Overschee, P., & De Moor, B. (1995). A Unifying Theorem for Three Subspace System Identification Algorithms. *Automatica* 31(12), 1853-1864. [doi:10.1016/0005-1098(95)00072-0](https://doi.org/10.1016/0005-1098(95)00072-0)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ARX / ARMAX](arx-armax.md) · [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
