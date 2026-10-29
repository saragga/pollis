# Bootstrap Filter

The **bootstrap particle filter** (Gordon, Salmond and Smith, 1993) is the simplest particle filter, and the one this panel runs.

## The Algorithm
Start with N particles drawn from the initial distribution p(x[1]), all with weight 1 / N. Then, at each step t:

1. **Weight**: give each particle x_i the unnormalised weight w_i times p(y[t] | x_i), the likelihood of the new observation, and normalise the weights to sum to one.
2. **Estimate**: the weighted particles approximate the filtering distribution p(x[t] | y[1:t]); the weighted average of any function of the state estimates its filtering expectation.
3. **Resample** if the ESS is below the threshold times N: draw N particles from the current ones with probabilities equal to their weights, and reset the weights to 1 / N.
4. **Propagate**: move each particle forward by drawing x_i from the dynamics p(x[t+1] | x_i).

It is called the bootstrap filter because the proposal is the model's own dynamics: no tuning beyond N and the threshold.

## The Likelihood Estimate
At each step, the weighted average of p(y[t] | x_i) over the predicted particles estimates the predictive likelihood p(y[t] | y[1:t-1]). The product over t estimates p(y[1:T]), **unbiasedly** for any N (Del Moral, 2004). Its variance grows with T at fixed N.

## Why It Works, and When It Does Not
Propagation and weighting are importance sampling, with the prediction as proposal and the filtering distribution as target. When the new observation is much more informative than the prediction, few particles land where the likelihood is high, and their weights dominate: **weight degeneracy**. Resampling discards the particles with negligible weight and multiplies the good ones, so that computation is not wasted on them; it does not create new information, and too frequent resampling discards information about the weights.

## Better Proposals
The **optimal proposal** p(x[t] | x[t-1], y[t]) uses the new observation and minimises the variance of the weights; it is available in closed form for some models (linear-Gaussian observations). The **auxiliary particle filter** (Pitt and Shephard, 1999) resamples with weights that look ahead at y[t]. Both help most when observations are precise.

## See Also
- [Resampling Schemes](resampling-schemes.md) · [Smoothing](smoothing.md) · [Overview](overview.md)
