# System Identification Methods: ARX / ARMAX

The **ARX** and **ARMAX** tabs fit polynomial models in the backward shift operator: ARX by least squares, ARMAX by pseudo-linear regression, with a moving-average polynomial for the noise.

## The ARMAX model

[Söderström and Stoica (1989)](#ref-SS1989a) define the ARMAX model as

A(q⁻¹)y(t) = B(q⁻¹)u(t) + C(q⁻¹)e(t),

A(q⁻¹) = 1 + a₁q⁻¹ + … + a_na q⁻ⁿᵃ,
B(q⁻¹) = b₁q⁻¹ + … + b_nb q⁻ⁿᵇ,
C(q⁻¹) = 1 + c₁q⁻¹ + … + c_nc q⁻ⁿᶜ,

so that G = B/A and H = C/A. They require C(z) to have all its zeros outside the unit circle and call the model an ARMA model with an exogenous signal. Special cases include the AR, MA and ARMA models of time series, and the FIR model, with A = C = 1.

**na**, **nb** and **nc** set the three orders, and **nk** the input delay.

## ARX as a linear regression

With nc = 0, the model is ARX, A(q⁻¹)y(t) = B(q⁻¹)u(t) + e(t). [Söderström and Stoica (1989)](#ref-SS1989a) write it as

y(t) = φᵀ(t)θ + e(t),
φ(t) = (−y(t−1) … −y(t−na)  u(t−1) … u(t−nb))ᵀ,
θ = (a₁ … a_na  b₁ … b_nb)ᵀ,

which can in some sense be viewed as a linear regression. They add that the regressors are not deterministic, as they contain past outputs, so the analysis of linear regression with deterministic regressors cannot be applied directly.

## Least squares: the equation error method

[Söderström and Stoica (1989)](#ref-SS1989a) call least squares for this model the equation error method. The estimate is consistent when E φ(t)φᵀ(t) is nonsingular and E φ(t)v(t) = 0, where v(t) is the equation error, e(t) for a true ARX system. The first condition fails when the input is not persistently exciting of order nb, when noise-free data are fitted with too high an order, or under low-order linear feedback; the second holds when v(t) is white.

The ControlSystemIdentification.jl documentation describes `arx` as fitting a transfer function by an ARX model and equation error minimisation, by least squares with a closed-form solution. Its keyword `inputdelay` adds a delay of z⁻ᵈ, with the highest power of B equal to nb + inputdelay − 1, and `λ > 0` gives L₂ regularisation.

## Pseudo-linear regression for ARMAX

With nc > 0, the model contains the past noise e(t−1), …, e(t−nc), which is not measured. The documentation describes `plr`, of which `armax` is an alias, as pseudo-linear regression for a model Ay = Bu + Cw: the residual sequence is first estimated with a high-order ARX model, of order `initial_order = 20` by default, and the estimated residuals then enter a second estimation problem. The return values are the system model and the noise model, with the same denominator.

The panel shifts the input by nk − 1 samples before `armax`, which has a built-in delay of one sample, and multiplies the result by a pure delay of nk − 1 samples.

## The predictor

```
predictor(G, c)  # innovation form in observer canonical form
PredictionStateSpace(sys, reshape(c .- a[2:end], n, 1))  # K = c - a
```

The code builds a state-space predictor of A(q)y = B(q)u + C(q)e in observer canonical form, with innovation gain K = c − a. For ARX, c is empty and the noise model is 1/A; for ARMAX, c holds c₁, …, c_nc from the numerator of the noise model and the noise model is C/A.

**Predicted Output** and **k-Step Prediction** use this predictor; the code comment notes that the package predicts more than one step ahead only for state-space models.

## Uncertainty of the ARX coefficients

The documentation states that `stochastic = true` returns a transfer function with uncertain parameters represented by MonteCarloMeasurements.Particles. **Parameter Uncertainty** prints the ARX model in that form, with a mean and a standard deviation for each coefficient.

The description of the action derives the standard deviations from the least-squares covariance. The same action refits ARX on each half of the estimation data, with the same **na**, **nb** and **nk**, and overlays the Bode plots, which shows the spread of the frequency response as well as that of the coefficients.

## References

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
