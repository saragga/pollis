# Diagnostics

A filter always returns an answer, so the checks are what tell a sound model from a wrong one.

## Innovations
The **innovation** at time t is the surprise in the measurement: e(t) = y(t) - yhat(t|t-1), what was measured minus what the filter predicted before seeing it. The filter also predicts its covariance S(t). If the model is right:

- the innovations have **mean zero**: a persistent sign means a bias in the dynamics or the measurement;
- the **standardised** innovations, S(t)^(-1/2) e(t), have variance one: larger means Q or R is too small and the filter is overconfident, smaller means they are too large;
- they are **white**: autocorrelation at any lag means the dynamics miss something, often a state that should be modelled.

**Innovation Sequence** plots the standardised innovations and their autocorrelation, for the three Kalman-type filters, which compute S(t). The normalised innovation squared, e' S^(-1) e, follows a chi-squared distribution with ny degrees of freedom under the model, which gives a formal test.

## Simulate Before Filtering
**Simulate Forward** draws data from the model with the observed inputs. If simulated measurements look nothing like the real ones (another scale, another smoothness, no trend where the data have one), the model is wrong before any filtering.

## Filter Divergence
A filter **diverges** when its covariance shrinks while its estimates drift away from the truth: it trusts its own predictions too much and stops listening to the data. The signs are innovations far outside their predicted spread and covariances that are implausibly small. Increasing Q, or adding states for what the model misses, are the usual remedies. The extended Kalman filter diverges more easily than the others, because its linearisation can be poor far from the current estimate.

## Particle Degeneracy
A particle filter **degenerates** when a few particles carry almost all the weight. Resampling counters it, but repeated resampling also reduces diversity. The log-likelihood is a random estimate: **Particle Count** runs it several times for each number of particles, and its spread should be small next to the differences being compared. Too few particles show as a log-likelihood that changes from run to run, and as state estimates that jump.

## Comparing Models
The **Log-Likelihood** of the measurements, log p(y | model), compares models and noise settings fitted to the same data: higher is better. Penalise extra parameters (AIC or BIC) when the models differ in size.

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Particle Filters](particle-filters.md)
