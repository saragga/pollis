# Interpretation

## Filtering Means
The **Filtering Means** table gives, at every step, the particle and Kalman estimates of E[x[t] | y[1:t]] and their standard deviations, and the error of the particle mean in Kalman standard deviations. Errors of a few hundredths of a standard deviation are Monte Carlo noise of order 1 / sqrt(ESS); errors of a large fraction of a standard deviation mean the particle approximation is poor at that step. The **Filter Mean** plot shows the same estimates with 2 sd bands against the true simulated state, which should lie inside the bands about 95% of the time.

## One-Step Predictive
The **One-Step Predictive** is the density of the next observation y[T+1] given y[1:T]: for the filter, a mixture of Gaussians over the weighted particles; for the Kalman filter, a single Gaussian. Its spread combines the uncertainty of the state, the state noise and the observation noise. Predictive densities are what forecasting and model comparison by predictive scores use.

## Smooth Path
The **Smooth Path** draws the backward-simulated trajectories and their mean against the exact Kalman smoother E[x[t] | y[1:T]]. Smoothed estimates use the observations after t as well as before, so their bands are narrower than the filter's, most of all at early steps. Each trajectory is a draw from the joint smoothing distribution, so trajectories show the uncertainty of whole paths, not only of each state.

## Log-Likelihood
The **Log-Likelihood** compares log p(y[1:T]) from the filter with the exact value. The particle estimate of the likelihood itself is **unbiased**; its logarithm is biased low, by about half the variance of the log estimate. The unbiasedness is what allows the estimate to replace the exact likelihood inside Metropolis-Hastings (particle marginal Metropolis-Hastings) and still target the exact posterior of the parameters, provided the log estimate's standard deviation is around 1 to 2.

## Log-Likelihood Variance
The **Log-Likelihood Variance** repeats the filter 50 times: the mean of exp(estimate - exact) near 1 confirms the unbiasedness, and the mean log estimate sits below the exact value by about var / 2.

## Particle Count Study and Threshold Sweep
The **Particle Count Study** shows the standard deviation of the log-likelihood estimate falling like 1 / sqrt(N). The **Resampling Threshold Sweep** shows that never resampling (threshold 0, sequential importance sampling) gives a poor estimate on long series, that resampling at every step adds some noise, and that adaptive resampling is usually best.

## Weight Entropy
The **Weight Entropy** gives the perplexity exp(H) of the normalised weights, where H is their entropy, relative to N, beside ESS / N. Both equal 1 for uniform weights and fall as the weight concentrates; perplexity is less sensitive to a single very large weight than ESS.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
