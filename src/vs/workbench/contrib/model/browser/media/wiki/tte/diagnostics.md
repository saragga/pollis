# Diagnostics

## Censoring
The **Censoring Summary** gives the share of censored subjects and when they are censored. Heavy censoring, or censoring early in follow-up, leaves few subjects at risk later and makes the tail of every curve unreliable. Compare the censoring between groups: very different patterns are a warning that censoring may be informative.

## Proportional Hazards
The **Proportional Hazards Check** plots log(-log S) against log t for the low and high halves of the Cox model's risk score. Roughly parallel curves support proportional hazards; curves that cross or converge do not. When the check fails, consider an AFT model, or stratify on the offending covariate.

## Weibull Shape
In the **Cumulative Hazard** plot, a straight line of log H(t) against log t supports a Weibull model, with the slope as its shape; a slope of 1 supports the Exponential.

## Choosing an AFT Distribution
Compare the distributions by **AIC**, -2 log-likelihood + 2 p, where **p counts every parameter**: the coefficients, the log-scale and, for the Generalised Gamma, its shape kappa. The lowest AIC wins; differences below about 2 are not meaningful. LSurvival's own `aic` counts only the coefficients, which flatters the distributions with more parameters, so the **Model vs Baseline** step computes the AIC itself.

The distributions nest, so a **likelihood ratio test** also works: twice the gain in log-likelihood follows a chi-squared distribution with as many degrees of freedom as parameters added.
- The **Exponential** is a Weibull with log-scale 0.
- The **Weibull** is a Generalised Gamma with kappa = 0, and the **Gamma** is one with log-scale 0.
- The **Log-Normal** is the limit of the Generalised Gamma as kappa grows.

## Did the Fit Converge?
A fit has failed when its log-likelihood is **lower than that of a model it contains** (a Generalised Gamma below the Weibull), or when coefficients and standard errors are very large. LSurvival's own starting value for the Generalised Gamma, kappa = -10, is such a case, so the panel starts it from the Weibull's estimates, with kappa = 0: the Weibull itself.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Censoring | Moderate, spread over follow-up | Heavy, early, or different between groups |
| Proportional hazards | Parallel log(-log S) curves | Crossing or converging curves |
| AFT fit | Log-likelihood at least that of the nested models | Lower log-likelihood, huge coefficients |
| AFT choice | One distribution clearly lowest AIC | Several within 2 of each other: report the simplest |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
