# Interpretation

A neural estimator returns numbers that look like those of any other estimator, but their meaning depends on the prior, the simulator and the loss used in training. Read them with those three in mind.

## What the Point Tab's Estimates Mean

`theta_hat` holds one value per parameter, an approximation to the marginal posterior median under `sampler` and `simulator`. Absolute-error loss is what makes it a median, so a different loss would give a different quantity. Being Bayesian, the estimate reflects the prior as well as the data, and it moves towards the prior's centre when the data are weak. It is not a maximum likelihood estimate, although the two can come close when m is large. Each parameter's median is taken separately, so the vector as a whole need not be a likely point of the joint posterior.

## What the Three Kinds of Interval Mean

| Tab | Output | How to read it |
|---|---|---|
| **Point** | `interval(bootstrap(...))`, p x 2 | The spread of re-estimates from data simulated at `theta_hat`, a frequentist idea of uncertainty |
| **Interval** | `bounds(Z_obs)`, lower and upper | An approximate 95% marginal credible interval |
| **Quantile** | `quantiles(Z_obs)`, one row per parameter and one column per probability | Approximate marginal posterior quantiles at the five values in `probs` |

An interval for each parameter on its own does not make a joint region, so two parameters at their limits together may be implausible.

## How to Read the Quantiles of a Parameter

Compare the gaps between neighbouring quantiles to learn the shape of the marginal posterior. Equal gaps on each side of the 0.5 quantile suggest symmetry, and a longer upper gap suggests a right-skewed posterior. A very wide spread relative to the prior says that the data add little. Quantiles should rise with probability, so results that cross, with a lower quantile over a higher one, would point to a problem in training.

## What Sampling Distribution and RMSE vs Replicates Say

**Sampling Distribution** answers a frequentist question: if the parameters were at the estimate, how much would the estimate vary across new data sets? Its spread is not a posterior width. **RMSE vs Replicates** applies the same trained estimator at a quarter, half, once and twice **Replicates (m)**, and shows how error changes with data size. Error that falls steadily with m suggests that the estimator has learnt a summary that adapts to size. Error that rises away from the trained m says that it should be retrained at that size and not reused.

## What the Results Cannot Show

Good results on these checks show that the network does its job for data from the simulator, and they do not show that the simulator describes reality. A neural estimate says nothing of the model's fit to the observed data, and no likelihood is available for comparing models. Report the prior, the simulator, m, K, the number of epochs and the architecture along with any estimate, since each one shapes the result. **Estimate New Data** returns answers for any input of the right form, so inputs unlike the training data still get an output, however unreliable it may be.

## See Also

- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
