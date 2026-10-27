# SHAP Values

**Shapley values** (Shapley, 1953; Lundberg and Lee, 2017) split one prediction among the features. Each feature receives its average contribution over all the orders in which the features could be added to the model, so that the contributions add up to the prediction minus the average prediction. SHAP is the name of this approach for explaining models.

## How the Panel Computes Them
The **Shapley Values** action uses Monte Carlo permutation sampling, which works for any model:

1. Draw a random training row as the starting point, and a random order of the features.
2. Replace the features of the starting row, in that order, by those of the observation being explained, and record how much the prediction changes at each step.
3. Repeat 200 times and average each feature's changes.

It explains the first test observation; change the row to explain another. In classification it explains the probability of the last class.

## Reading the Bars
- A **positive** bar means the feature's value pushed this prediction up, compared with a typical observation; a **negative** bar pushed it down.
- The values are in the units of the prediction: probability points in classification, units of the target in regression.
- They explain **one** prediction. The importance of a feature over the data is the average absolute Shapley value over many observations.

## Caveats
- **Sampling noise**: with 200 samples, small values may not differ from zero; increase `samples` for more precision.
- **Correlated features**: replacing one feature while keeping its correlated partner creates unusual combinations, and the credit can be split between them in unexpected ways.

## See Also
- [Feature Importance](feature-importance.md) · [Interpretation](interpretation.md) · [SIRUS](sirus.md)
