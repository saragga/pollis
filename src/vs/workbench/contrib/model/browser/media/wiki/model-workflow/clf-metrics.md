# Metric Guide

Each metric on the **Metrics** tab of Classification Performance summarises the same four counts in a different way. [Sokolova and Lapalme (2009)](#ref-SL2009b) compare such measures by which changes to the confusion matrix they respond to and which they ignore.

## How the Confusion Matrix of a Binary Classifier Is Laid Out

A confusion matrix counts each case by its predicted and its true class. The four cells are the raw material of every metric the **Metrics** tab prints.

| Predicted class | Truly positive | Truly negative |
|---|---|---|
| Positive | True positives, TP | False positives, FP |
| Negative | False negatives, FN | True negatives, TN |

The tab stores the matrix in `cm`, built by `confmat(yhat_c, y_c)` with the positive class as the second level, and prints only the metrics. Displaying `cm` shows the counts, which are worth reading before any ratio, since a small denominator can make a ratio look precise when it is not.

## What Accuracy, Precision, Recall, F1 and MCC Compute

| Metric | Formula | Question it answers | Cells it ignores |
|---|---|---|---|
| **Accuracy** | (TP + TN) / n | What share of all cases is right | None, but it treats all errors alike |
| **Precision** | TP / (TP + FP) | What share of predicted positives is truly positive | FN, TN |
| **Recall** | TP / (TP + FN) | What share of true positives is found | FP, TN |
| **F1** | 2 × Precision × Recall / (Precision + Recall) | How high precision and recall are together, as a harmonic mean | TN |
| **MCC** | (TP × TN - FP × FN) / sqrt((TP + FP)(TP + FN)(TN + FP)(TN + FN)) | How strongly prediction and truth are correlated | None |

The panel computes them with `accuracy`, `ppv`, `recall`, `f1score` and `matthews_correlation`, and rounds each to three decimal places.

## When the Accuracy of a Classifier Misleads

Accuracy mixes the performance on each class in proportion to class size, so it changes with prevalence even when the classifier does not. A rule that always predicts the larger class has an accuracy equal to that class's share and detects nothing. Before reading accuracy, compare it with that share, which **Class Imbalance Check** prints. Accuracy also gives a false negative and a false positive the same weight. Where one kind of error costs far more than the other, equal accuracy can hide very different consequences, and the threshold should come from the costs instead.

## How to Choose Between Precision and Recall for a Classifier

Precision matters when acting on a positive prediction is expensive, as with a costly follow-up or an unwarranted alert. Recall matters when a missed positive is the costly mistake, as with a dangerous condition left undetected. Moving the threshold trades one for the other, so a single pair describes one operating point and no more. Recall depends only on the true positives and does not change with prevalence, provided the scores of each class stay the same. Precision falls as positives become rarer, even for an unchanged classifier, so a precision from one population does not carry over to another.

## Why F1 Depends on Which Class Is Called Positive

F1 uses true positives, false positives and false negatives, and never true negatives. Swapping the class called positive therefore changes the value, and so does a change in the number of true negatives only by leaving it untouched: a classifier can add or lose correct negatives with no effect on F1. The harmonic mean also weights precision and recall equally, which is a choice and not a neutral default. The F-beta family, available in MLJ.jl as `FScore(beta=...)`, changes that weight. On the **Metrics** tab, the label chosen as `pos_class` decides which F1 is printed.

## How to Read the Matthews Correlation Coefficient

The Matthews coefficient, from [Matthews (1975)](#ref-Mat1975a), is the Pearson correlation between two binary variables, prediction and truth. It runs from -1 for perfect anti-prediction through 0 to +1 for perfect prediction, and swapping the classes leaves it unchanged. [Chicco and Jurman (2020)](#ref-CJ2020a) argue for it over accuracy and F1 because a high value requires good results in all four cells. **MCC Interpretation** prints bands of strong above 0.7, moderate from 0.3 to 0.7 and weak under 0.3, and calls them rules of thumb with no formal basis. A classifier that predicts one class only makes the formula divide by zero, and the package then returns 0.

## How the Metrics Tab Picks the Positive Class

By default `pos_class` is `last(sort(unique(y_raw)))`, the last label in sort order, which may not be the class of interest. The tab prints the choice on its first line. To change it, set the value in the code, for example `pos_class = "default"`. Accuracy and MCC stay the same under either choice, while precision, recall and F1 all change. **True Labels** must hold exactly two distinct labels, and **Predicted Labels** must use only those two. Three or more classes stop the tab with an error, so a multi-class task needs its own per-class treatment outside the panel.

## How Much Sampling Error Classification Metrics Carry

The **Metrics** tab prints point values with no interval, and three decimal places can suggest more precision than a small test set supports. Accuracy, recall and precision are proportions, so each has a standard error of about sqrt(p(1 - p) / m). For accuracy, m is all cases; for recall, the true positives plus false negatives; for precision, the predicted positives. With a few dozen true positives, recall is known only roughly. For F1 and MCC, a bootstrap of the test cases gives an interval. Two classifiers on the same cases should be compared by paired differences and not by separate intervals.

## References

<a id="ref-CJ2020a"></a>Chicco, D. and Jurman, G. (2020). The advantages of the Matthews correlation coefficient (MCC) over F1 score and accuracy in binary classification evaluation. *BMC Genomics* 21(1). [doi:10.1186/s12864-019-6413-7](https://doi.org/10.1186/s12864-019-6413-7)

<a id="ref-Mat1975a"></a>Matthews, B. W. (1975). Comparison of the predicted and observed secondary structure of T4 phage lysozyme. *Biochimica et Biophysica Acta (BBA) - Protein Structure* 405(2), 442–451. [doi:10.1016/0005-2795(75)90109-9](https://doi.org/10.1016/0005-2795(75)90109-9)

<a id="ref-SL2009b"></a>Sokolova, M. and Lapalme, G. (2009). A systematic analysis of performance measures for classification tasks. *Information Processing & Management* 45(4), 427–437. [doi:10.1016/j.ipm.2009.03.002](https://doi.org/10.1016/j.ipm.2009.03.002)

## See Also

- [Overview](clf-overview.md) · [ROC Analysis](clf-roc.md) · [Imbalanced Classes](clf-imbalanced.md)
