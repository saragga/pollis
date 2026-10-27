# Interpretation

An ensemble of hundreds of trees cannot be read tree by tree. The Interpret and Visualise actions describe what the model does from the outside.

## The Metrics
- **Accuracy** is the share of test observations classified correctly. Compare it with the share of the largest class: with 90% in one class, 90% accuracy is no achievement.
- **RMSE** is the typical size of a prediction error, in the units of the target. Compare it with the standard deviation of the target, which is the RMSE of always predicting the mean.

## Probabilities and the Score
In classification each model gives one probability per class, in the order of the sorted class labels. The Interpret actions and the calibration plot explain the **probability of the last class**; to explain another class, change `score`. In regression the score is the prediction itself.

## Feature Importance
**Which features the model relies on.** The built-in importance comes from the library and differs by method; permutation importance measures the loss in test performance when a feature is shuffled. Neither says in which direction a feature acts. See [Feature Importance](feature-importance.md).

## Partial Dependence
**How the prediction changes with one feature**, on average over the data: the feature is set to each value of a grid, for all observations at once, and the predictions are averaged. A rising curve means higher values lead to higher predictions. With strongly correlated features, part of the grid is made of combinations that never occur, and the curve there is unreliable.

## Shapley Values
**Why one observation got its prediction**: each feature's contribution, so that the contributions add up to the prediction minus the average prediction. See [SHAP Values](shap.md).

## Stable Rules
**A short list of if-then rules** that approximates the model and can be read in full. See [SIRUS](sirus.md).

## See Also
- [Feature Importance](feature-importance.md) · [SHAP Values](shap.md) · [SIRUS](sirus.md)
