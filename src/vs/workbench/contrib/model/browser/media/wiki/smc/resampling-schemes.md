# Resampling Schemes

**Resampling** replaces N weighted particles by N equally weighted ones, each particle i copied about N w_i times. Every scheme does this without bias, so that the expected number of copies is exactly N w_i; they differ in the **extra noise** they add.

## Multinomial
Draw N independent indices with probabilities w_i. The simplest scheme, and the noisiest: the number of copies of each particle is binomial.

## Stratified
Divide [0, 1] into N equal strata, draw one uniform number in each, and map them through the cumulative weights. Less noisy than multinomial, since each stratum contributes exactly one particle.

## Systematic
Like stratified, but with a **single** uniform number u in [0, 1 / N], and the points u, u + 1 / N, ..., u + (N - 1) / N. It is the cheapest, and usually the least noisy in practice, though it lacks some theoretical guarantees of the others. LowLevelParticleFilters uses it by default.

## Residual
Give particle i floor(N w_i) copies deterministically, then fill the remaining places by multinomial (or systematic) sampling on the residual weights. It reduces the randomness to the fractional parts.

## When to Resample
Resampling at every step adds noise and accelerates path degeneracy; never resampling (sequential importance sampling) lets the weights degenerate until one particle holds all the weight. **Adaptive resampling** resamples only when the ESS falls below a threshold times N; 0.5 is the common choice, and LowLevelParticleFilters defaults to 0.1. The **Resampling Threshold Sweep** compares 0, 0.1, 0.5 and 1 on the log-likelihood estimate.

## Resampling and Smoothness
Resampling makes the likelihood estimate a discontinuous function of the model parameters, even with common random numbers, which hinders gradient-based or optimisation-based parameter estimation. Continuous resampling schemes, or methods that avoid differentiating through resampling, address this.

## See Also
- [Bootstrap Filter](bootstrap-filter.md) · [Smoothing](smoothing.md) · [Diagnostics](diagnostics.md)
