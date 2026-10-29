# Diagnostics

## Overfitting
**Depth vs Accuracy** plots the training accuracy and the 5-fold cross-validated accuracy as max_depth grows. The training accuracy keeps rising, towards a perfect fit; the cross-validated accuracy rises, levels off and then falls. Choose the depth where it levels off: beyond that the tree is learning noise. A large gap between the two curves at the chosen depth means the tree is still too complex, or the data too few.

## Cross-Validation
**Cross-Validation** reports the k-fold accuracy (classification) or R-squared (regression), with its spread over the folds. A wide spread means the tree, and its score, depend strongly on which samples it saw: the high variance of single trees.

## Confusion Matrix
The **Confusion Matrix** cross-tabulates predicted against true classes on the test set. Read the off-diagonal cells: which classes are confused with which. With unbalanced classes, overall accuracy hides a poorly predicted rare class; look at the recall of each class.

## Stability
Refit on a slightly different sample (another split, a bootstrap sample). If the top splits change, the rules should not be read too literally; an ensemble, compared in **Tree vs Random Forest**, will be more reliable.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Depth vs accuracy | Cross-validated accuracy levels off at a modest depth | Training near perfect, cross-validated much lower |
| Cross-validation | Small spread over folds | Large spread: an unstable tree |
| Confusion matrix | Errors spread thinly | One class mostly misclassified |
| Leaves | Each holds a reasonable number of samples | Many leaves with one or two samples |
| Tree vs forest | Close test scores | Forest much better: the single tree overfits |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
