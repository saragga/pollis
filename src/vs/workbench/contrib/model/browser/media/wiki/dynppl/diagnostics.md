# Diagnostics

Read the diagnostics before any posterior number. They ask whether the chains agree, how much information the draws carry, and whether the model can reproduce the data.

## How to Read R-hat

**R-hat** compares the variation between chains with the variation within them. The panel's `summarystats(chain)` uses the rank-normalised split version of [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a), which also catches differences in tails and spread. Values close to 1 are what convergence looks like, and the code comment follows those authors in treating values greater than 1.01 as a sign of trouble. If that happens, do not use the results. Run longer first, then look for a problem in the model or its parameterisation. A value of 1 is necessary and not sufficient, since all chains can share the same blind spot.

## How to Read Effective Sample Size

**Effective Sample Size** estimates how many independent draws would carry the same information as the correlated draws. `ess_rhat(chain)` reports it per parameter. A value much smaller than the total number of draws means strong autocorrelation. A few hundred is a common working minimum for means and central intervals, while tail quantiles need more, because few draws reach them. Low values call for more draws, or a better sampler or parameterisation. Monte Carlo standard error, in `summarystats(chain)`, puts the same information in the units of the parameter, so judge it against the precision that the question requires.

## What to Look for in a Trace Plot

**Trace Plot** draws each parameter against its iteration, chain by chain, next to its density. Healthy chains look like stationary noise, with all chains overlapping. Warning signs include a trend or slow drift, chains settled at different levels, long flat stretches where proposals are being rejected, and rare large excursions. Flat stretches are the classic picture for **Metropolis-Hastings**. A plot can look acceptable while **R-hat** is high, and the reverse can happen too, so use both.

## How to Read the Autocorrelation Plot

**Autocorrelation** shows how quickly each chain forgets its past. A fall to near 0 within a few lags means efficient sampling. Slow decay means that each new draw adds little, and that **Effective Sample Size** will be low. **Hamiltonian Monte Carlo** with a poor path length can show oscillating or very slow patterns. Thinning does not repair slow decay. It discards information to save storage, and improving the sampler or the parameterisation is the better response.

## How to Check Posterior Predictive Fit

**Posterior Predictive** rebuilds the model with `similar(y, Missing)` and draws new observations for each posterior draw through `predict(model_pred, chain)`. Compare the results with the data on features that matter for the question, such as the mean, spread, extremes or share of zeros. Gross differences show that the model cannot reproduce the data. Features fitted directly by a parameter will usually look fine, so choose a statistic the model did not target. Agreement does not make a model correct, because the same data are used twice.

## How to Spot Divergences and Tuning Failures

Gradient-based samplers report more than the tables show. In the **No-U-Turn Sampler** tab, the internal columns of `chain`, such as `numerical_error` and `tree_depth`, record divergent transitions and trajectories that reach the depth limit. Divergences point to regions the sampler cannot explore, and a biased result may follow. Raise **Target Acceptance** to shrink the steps, and reparameterise if they persist. For **Hamiltonian Monte Carlo**, watch the acceptance rate, as near 0 means **Step Size (epsilon)** is too large.

## References

<a id="ref-VGSCB2021a"></a>Vehtari, A., Gelman, A., Simpson, D., Carpenter, B. and Bürkner, P. (2021). Rank-normalization, folding, and localization: An improved R-hat for assessing convergence of MCMC. *Bayesian Analysis* 16(2), 667–718. [doi:10.1214/20-BA1221](https://doi.org/10.1214/20-BA1221)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
