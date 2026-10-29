# Decision Guide

| Question | Data | Method | Why |
|---|---|---|---|
| Which class, with readable rules? | Table of features, class labels | **Decision Tree**, Classification | Rules from root to leaf |
| What value, with readable rules? | Table of features, numeric target | **Decision Tree**, Regression | Leaf means, a step function |
| Which class, from series or signals? | One series per sample in a column | **Modal Decision Tree** | Splits over intervals of each series |
| Highest accuracy, rules not needed? | Any table | **Random Forest** (Compare) or boosting | Averaging many trees lowers the variance |
| Smooth trend or extrapolation? | Numeric target | A linear or additive model instead | Trees predict constants and stop at the data's edge |

## Choosing the Size

1. Start with a shallow tree (a depth of 3 to 5) to read the main rules.
2. Run **Depth vs Accuracy** and pick the depth where the cross-validated accuracy stops improving.
3. Raise **min_samples_leaf** if many leaves hold only a few samples.
4. Confirm the choice with **Cross-Validation** and on the test set.

## Decision Flow

1. **Do you need to explain the predictions?** If yes, a single tree; if not, compare it with a random forest and keep the better one.
2. **Is each sample a row of values, or a series?** Rows: Decision Tree. Series: Modal Decision Tree.
3. **Are the classes balanced?** If not, judge by the confusion matrix and the per-class recall, not accuracy alone.

## Rules of Thumb
- **Prefer the shallowest tree** within the noise of the best cross-validated score.
- **Read permutation importance**, not impurity importance alone.
- **Never judge a tree on its training accuracy.**

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
