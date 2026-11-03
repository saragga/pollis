# System Identification Methods: Diagnostics

The diagnostics of the panel check a fitted model on the 30% of the data held out for validation: residual correlations, the fit of the simulated output, predictions, and the spread of refits on parts of the estimation data.

## Residual tests

[Söderström and Stoica (1989)](#ref-SS1989a) test the residuals ε(t, θ̂) of a fitted model against four null hypotheses: A1, ε(t) is zero-mean white noise; A2, ε(t) has a symmetric distribution; A3, ε(t) is independent of past inputs; A4, ε(t) is independent of all inputs, which applies in open loop. They note that the tests suit methods with an explicit model of the disturbance, such as prediction error methods.

**Residual Analysis** calls `residualplot(pmodel, dval)`, which the ControlSystemIdentification.jl documentation describes as a plot of the residual autocorrelation and the input-residual correlation. The code comment adds that the residuals are the one-step prediction errors on the validation data and should be white.

## The autocorrelation test

[Söderström and Stoica (1989)](#ref-SS1989a) estimate the covariance function of the residuals, r̂ε(τ) = (1/N) Σ ε(t + τ)ε(t), and normalise it by r̂ε(0). Under A1,

N Σᵢ₌₁ᵐ r̂ε²(i) / r̂ε²(0) → χ²(m) in distribution,

and the model is rejected when the statistic exceeds the χ²(m) quantile for a risk α, typically between 0.01 and 0.1, with 0.05 frequently used.

For a single lag, √N r̂ε(τ)/r̂ε(0) is asymptotically N(0, 1), so whiteness at lag τ is accepted when |r̂ε(τ)/r̂ε(0)| ≤ 1.96/√N, with a risk of 0.05.

## The cross-correlation test

Under A3 and A4, [Söderström and Stoica (1989)](#ref-SS1989a) use the normalised cross-correlation r̂εu(τ)/[r̂ε(0) r̂u(0)]^½ between residuals and input. If the model is not an accurate representation of the system, r̂εu(τ) for τ ≥ 0 is expected to be far from zero.

For τ < 0, the cross-correlation may be non-zero even for an exact model if there is feedback during the experiment, so the test also checks for feedback. When u(t) is white, they note, r̂εu(τ) = 0 for τ < 0 even for an inaccurate model.

## Fit Percentage

**Fit Percentage** computes

fit = 100 (1 − ‖y − ŷ‖ / ‖y − ȳ‖)

for the simulated output ŷ, from `modelfit`. The ControlSystemIdentification.jl documentation calls it the normalised root mean square error and states that 100 is a perfect fit, 0 no better than the mean, and negative values possible. The action prints the fit on the validation and on the estimation data, with the note "a much higher value suggests overfitting".

The simulation uses only the input: the documentation of `simulate` states that the noise model and Kalman gain have no influence on the simulated output.

## Prediction and simulation

**Predicted Output** draws the one-step-ahead prediction on the validation data with `predplot`, and **k-Step Prediction** the five-step-ahead prediction with `h = 5`. **Simulate** draws the response to a new random input with `lsim` and the simulation on the validation data with `simplot`.

[Söderström and Stoica (1989)](#ref-SS1989a) describe the comparison of the model output y_m(t) = G(q⁻¹; θ̂)u(t), computed without disturbances, with the measured output as a first check of whether a model is flexible enough. The descriptions of the prediction actions note that the output-error model has no noise model, so its prediction equals its simulation.

## Refits on two halves

**Parameter Uncertainty** refits the current structure on each half of the estimation data and overlays the two Bode plots on the fit to all of it; the action description reads large differences as poorly determined dynamics. For **ARX**, it also prints the coefficients as means and standard deviations from `arx(...; stochastic = true)`, which the documentation describes as a transfer function with uncertain parameters represented by MonteCarloMeasurements.Particles.

## References

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ARX / ARMAX](arx-armax.md) · [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
