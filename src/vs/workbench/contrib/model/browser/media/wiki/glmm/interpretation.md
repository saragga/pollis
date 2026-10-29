# Interpretation

## Coefficients on the Link Scale
The fixed-effect coefficients are on the scale of the linear predictor: log-odds for a logit link, log rates for a log link. Each is the change for a one-unit increase in its predictor, **within a group** (its random effect held fixed), the other predictors held fixed.

## Exponentiated Coefficients
The **Exponentiated Coefficients** give exp(coefficient) with 95% intervals: **odds ratios** under a logit link and **rate ratios** under a log link. An odds ratio of 1.5 means the odds of the outcome are 50% higher per unit of the predictor, for the same group. An interval that contains 1 is not significant at 5%.

## Conditional and Population-Averaged Effects
Under a nonlinear link, the effect within a group (conditional) is larger in absolute value than the effect averaged over the groups (marginal): averaging the S-shaped curves of the groups flattens them. The difference grows with the random-effect variance. **Conditional vs Population Predictions** shows predictions with each group's random effect against those with the random effects at zero; the spread between them is the effect of the groups.

## Variance Components and the Latent-Scale ICC
The random-effect standard deviation is on the link scale. A random-intercept standard deviation of 0.8 on the logit scale means the odds in a group at the upper quartile of the random effects are about exp(1.35 * 0.8), roughly 3, times those in a group at the lower quartile. The **Latent-Scale ICC** expresses it as a share of the variance on the latent scale: the between-group variance over itself plus pi^2/3 for the logit link (1 for probit).

## Against a GLM Without Random Effects
**Against a GLM Without Random Effects** is a likelihood ratio test of the random-intercept variance against zero, with AIC and BIC for both models. The variance lies on the boundary of its range, so the p-value is conservative; halving it is the usual correction.

## Predictive Accuracy
For a Bernoulli family, **Predictive Accuracy** gives the confusion matrix at a threshold of 0.5 and the **AUC**, the probability that a random positive gets a higher predicted probability than a random negative (0.5 is chance, 1 perfect). For the other families, the RMSE and MAE of the fitted means.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
