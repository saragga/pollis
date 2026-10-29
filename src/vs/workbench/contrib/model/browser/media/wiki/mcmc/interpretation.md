# Interpretation

## Summary Statistics
**Summary Statistics** gives, for each parameter, the mean, the standard deviation and quantiles of its draws, with ESS and R-hat. The **MCSE** (Monte Carlo standard error), the standard deviation divided by the square root of the ESS, is the precision of the posterior mean as computed from this chain; it is not the uncertainty about the parameter, which the posterior standard deviation measures.

## Posterior Mean and Intervals
The **Posterior Mean** is the average of the draws. A 95% **Credible Interval** (equal-tailed) runs from the 2.5% to the 97.5% quantile of the draws: the parameter lies in it with probability 0.95 under the model. The **HPD Interval** is the shortest interval with 95% of the draws; for skewed posteriors it is shifted towards the mode.

## Marginal Densities and Pair Plots
The **Marginal Histogram** and **Marginal Densities** show each parameter's distribution on its own. The **Pair Plot** shows two at a time: strong correlations, banana shapes or funnels explain slow mixing, and suggest a reparametrisation.

## Posterior Predictive
**Posterior Predictive** draws new data from the model, one data set per posterior draw. Their spread combines the uncertainty about the parameters with the noise of the data, and is what a prediction interval should reflect.

## Comparing Models
**WAIC** and **LOO-CV** estimate the expected log predictive density for new data; higher is better (on the deviance scale, multiplied by -2, lower is better). LOO-CV, computed by Pareto-smoothed importance sampling, is the more reliable; its Pareto k values above 0.7 flag observations for which it is not.

## Comparing Samplers
Read the **ESS per second**. NUTS usually wins on smooth posteriors, despite its higher cost per draw, because its draws are nearly independent; Metropolis-Hastings wins only on cheap, low-dimensional targets, or where gradients are unavailable.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
