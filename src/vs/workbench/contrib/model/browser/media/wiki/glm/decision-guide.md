# Decision Guide

| Response | Family | Default link | Why |
|---|---|---|---|
| 0/1 outcome | **Bernoulli** | Logit | Odds ratios; probit if a latent normal is natural |
| Successes out of n trials | **Binomial** | Logit | Uses the number of trials as well as the share |
| Counts, variance about the mean | **Poisson** | Log | Rate ratios |
| Counts, variance above the mean | **Negative Binomial** | Log | Estimates the extra dispersion |
| Counts, strongly overdispersed, few parameters | **Geometric** | Log | Negative Binomial with theta = 1 |
| Positive amounts, constant coefficient of variation | **Gamma** | Inverse (log often clearer) | Costs, durations, claim sizes |
| Positive amounts, very long right tail | **Inverse Gaussian** | Inverse square | Variance grows with the cube of the mean |
| Continuous, constant variance | **Normal** | Identity | The linear model |

## Decision Flow

1. **What kind of response?** Binary, count, positive amount or unrestricted continuous: this picks the family group.
2. **For counts, fit the Poisson first** and run the Overdispersion Check. Above about 1.5, move to the Negative Binomial.
3. **For amounts**, compare the Gamma and the Inverse Gaussian by the Information Criteria, and look at how the residual spread grows with the fitted values.
4. **Choose the link**: the default, unless another one gives effects that are easier to explain (log for Gamma means), or the default does not fit.
5. **Choose the inference**: standard errors for independent observations with the right variance; HC when in doubt; HAC for time series; Clustered for grouped data.

## Rules of Thumb
- **Prefer the log link** when effects should be multiplicative and must keep the mean positive.
- **Do not trust Poisson errors** without checking overdispersion.
- **Report predictions or marginal effects** next to the coefficients: they are on the response's own scale.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
