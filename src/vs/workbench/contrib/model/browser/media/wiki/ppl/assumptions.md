# Assumptions

## The Model
- **The likelihood describes the data.** The Gaussian and regression models assume normal noise with constant spread; the logistic model, independent 0/1 outcomes. A wrong likelihood gives a confident posterior for the wrong question: the **Posterior Predictive Check** tests it.
- **Independent observations** given the parameters, or given the group effects in the hierarchical model.
- **Exchangeable groups** in the hierarchical model: before seeing the data, no group is expected to differ from the others in a known direction. Known differences belong in covariates.

## The Priors
- **Priors are part of the model.** The panel uses weakly informative priors: Normal(0, 10) for means and coefficients, Exponential(1) for standard deviations. They assume the data are on a scale of roughly units to tens; with data in thousands, rescale them or widen the priors.
- **Proper priors.** A prior that does not integrate to 1 can give an improper posterior, which no sampler can detect.
- **Sensitivity.** With many data the likelihood dominates; with few, the prior matters. **Marginal Posteriors** overlays prior and posterior to show which.

## The Sampler
- **Continuous parameters** for NUTS and HMC, which need gradients. Discrete parameters need MH, Gibbs or marginalising them out.
- **A smooth posterior** without sharp funnels or ridges. A funnel, typical of hierarchical models with small groups, makes NUTS report **divergent transitions**; the non-centred form used here avoids it.
- **Enough draws after warm-up.** Summaries are averages over correlated draws; their precision depends on the effective sample size, not the number of draws.
- **Several chains** from different starting points, so that R-hat can detect a chain stuck in one region.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
