# Interpretation

## Coefficients on the Link Scale
Each coefficient is the change in g(mean) per unit of the covariate, holding the others fixed. The link decides what that means; **Coefficient Interpretation** turns it into the natural scale.

## Odds Ratios (Logit Link)
exp(coefficient) multiplies the **odds** p / (1 - p) per unit of the covariate: 2 means the odds double, 0.5 that they halve. An odds ratio is not a ratio of probabilities; the two are close only when the outcome is rare.

## Rate Ratios (Log Link)
exp(coefficient) multiplies the **expected count** (Poisson, Negative Binomial) or the **mean amount** (Gamma with log link) per unit of the covariate: 1.2 means 20% more, 0.8 means 20% less.

## Other Links
With the probit, the coefficients shift a standard normal score; with the inverse link of the Gamma, they change 1 / mean, so a positive coefficient means a **lower** mean. These are harder to read: report marginal effects or predicted means instead.

## Marginal Effects
**Marginal Effects** gives the average change in the mean response per unit of one continuous covariate, on the response scale (probability points, counts, amounts). Unlike the coefficients, it depends on where the other covariates are, so it is averaged over the observations.

## Predicted Means
**Predicted Mean** and **Confidence Band** give the fitted mean, with its interval, for chosen covariate values. The interval is built on the link scale and transformed back, so it is not symmetric around the prediction.

## Deviance and Pseudo R-Squared
The deviance plays the role of the residual sum of squares. The share of the null deviance explained measures fit relative to a model with no covariates, but there is no universal good value.

## Robust Standard Errors
HC, HAC and clustered errors change only the uncertainty, not the estimates. If they are much larger than the standard ones, the model's variance or independence assumption is wrong, and the standard p-values are too small.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
