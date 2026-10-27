# Decision Guide

| Situation | Method | Why |
|---|---|---|
| A strong result with little tuning | **Random Forests** ([Random Forests](random-forests.md)) | Works well at the default settings; hard to overfit by adding trees |
| The best accuracy on tabular data, in pure Julia | **Gradient Boosting** ([Gradient Boosting](gradient-boosting.md)) | Boosting usually wins once tuned; no external library |
| Large data, or results to match an existing XGBoost pipeline | **XGBoost** ([XGBoost](xgboost.md)) | Fast C++ implementation, explicit regularisation, the industry standard |
| Trees inside a gradient-based or neural pipeline | **Differentiable DT** | Soft trees trained by gradient descent, like any network layer |
| A model that people can read | **Stable Rules (SIRUS)** ([SIRUS](sirus.md)) | A few stable if-then rules instead of hundreds of trees |

## Decision Flow

1. **Start with Random Forests** at the default settings, and compare it with the simple baseline and a single tree.
2. **Need more accuracy?** Try Gradient Boosting with a depth of 3 to 6 and a learning rate of 0.05 to 0.1, and increase the rounds while the validation metric improves.
3. **Data too large for EvoTrees, or an XGBoost model to reproduce?** Use XGBoost with the same settings.
4. **Must the model be explained?** Run permutation importance and partial dependence; if a rule list is needed, check how much accuracy SIRUS gives up.
5. **Is the difference between two models real?** Compare their bootstrap intervals from Test Metric Uncertainty.

## Rules of Thumb
- **More trees never hurt a random forest**, only the running time; more rounds can hurt a boosted model.
- **Lower the learning rate and raise the rounds** together: 0.1 with 100 rounds and 0.01 with 1000 often end close, the second a little better.
- **Deep forests, shallow boosting**: depth 5 to 20 for forests, 3 to 8 for boosting.
- **Prefer permutation importance** to compare features across models.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md)
