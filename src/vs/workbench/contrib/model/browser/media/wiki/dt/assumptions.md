# Assumptions

Decision trees make few assumptions about the data; most of what follows is about what makes their results trustworthy.

## Both Methods
- **Training and test data from the same distribution.** A tree learns thresholds on the training data; samples outside their range get the prediction of an edge leaf.
- **Independent samples**, or a split into training and test sets that respects their grouping (all samples of one patient in the same set), or the test accuracy will be too optimistic.
- **Enough samples per leaf.** A leaf with very few samples predicts noise; min_samples_leaf guards against it.
- **Informative features.** No scaling or normality is needed, and monotone transformations of a feature change nothing, but a tree cannot find a signal that is spread thinly over many features as well as a linear model can.

## Decision Tree
- **Splits parallel to the axes.** A boundary along a diagonal (x1 + x2 > c) needs a staircase of many splits; adding the combined feature helps.
- **Greedy growth.** Each split is the best one locally; a pattern that shows only after two splits (an exclusive-or) may be missed.
- **Class balance** in classification: with a rare class, the leaves favour the common one; weigh the classes or judge by more than accuracy.

## Modal Decision Tree
- **Meaningful structure within each series**: the modal splits look for intervals with some property, so the series must be aligned in time (or space) in a comparable way across samples.
- **Class labels** as text or categorical values; the modal tree is used here for classification.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
