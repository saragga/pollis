# ROC Analysis

A receiver operating characteristic curve shows what a classifier's scores can do across all thresholds, before any one threshold is chosen. [Fawcett (2006)](#ref-Faw2006a) is the standard introduction. The **ROC** tab of Classification Performance reports the area under the curve and two candidate thresholds.

## What a ROC Curve Plots for a Classifier

A ROC curve plots the true positive rate, TPR = TP / P, against the false positive rate, FPR = FP / N, as the threshold falls through every distinct score. It starts at (0, 0), where nothing is predicted positive, and ends at (1, 1), where everything is. The diagonal is what scores unrelated to the labels produce on average. Both rates are conditional on the true class, so the curve does not change with class proportions as long as the scores of each class keep their distribution. The **ROC** tab holds the curve in `fprs` and `tprs` and does not draw it; `plot(fprs, tprs)` draws it after the tab has run.

## What the Area Under the ROC Curve Means

As [Hanley and McNeil (1982)](#ref-HM1982a) set out, the AUC is the probability that a randomly chosen positive case scores higher than a randomly chosen negative one, with ties counted as one half. A value of 0.5 means the ranking carries no information, and 1 means every positive outranks every negative. A value under 0.5 usually means that the scores refer to the other class, so `pos_class` should be checked first. `Functions.auc` computes the area from ranks, the Mann-Whitney form, so any strictly increasing change of the scores leaves it unchanged. For that reason AUC says nothing about whether the scores are well-calibrated probabilities.

## Where the Area Under the ROC Curve Misleads

The AUC averages over all thresholds, including those no user would adopt, so two models with equal areas can differ in the region that matters, and their curves can cross. [Hand (2009)](#ref-Han2009a) shows that, read as an average misclassification loss, AUC uses a cost distribution that depends on the classifier itself, which makes comparisons between classifiers incoherent in that sense. With very rare positives, a small false positive rate can still mean many false alarms, which the curve does not make visible ([Saito and Rehmsmeier (2015)](#ref-SR2015a)). The tab gives no standard error or test. To compare two correlated AUCs, the test of [DeLong, DeLong and Clarke-Pearson (1988)](#ref-DDC1988a) is the usual choice.

## How the ROC Tab Finds the Youden Threshold

The Youden index, from [Youden (1950)](#ref-You1950a), is J = sensitivity + specificity - 1, which equals TPR - FPR. The tab takes `argmax(tprs .- fprs)`, the point of the curve furthest above the diagonal, and prints its threshold as the **Youden threshold**. J weighs the two error rates equally, so the point minimises total cost only when cost_fp × N = cost_fn × P. Equal unit costs meet that condition only if the classes are also of equal size, although the printout says "equal error costs". With unequal classes and equal costs, the threshold that minimises the number of errors is usually a different one. [Perkins and Schisterman (2006)](#ref-PS2006a) show that cut-points from different optimality criteria can disagree, so the criterion is a choice to be stated.

## How the ROC Tab Finds the Minimum-Cost Threshold

The tab evaluates cost = cost_fp × FPR × N + cost_fn × (1 - TPR) × P at each point of the curve and prints the threshold at the smallest value. The code sets `cost_fp = 1.0` and `cost_fn = 5.0`, and these are placeholders to replace with real costs; no input exposes them. Geometrically, the best point lies on the lowest line of slope (cost_fp × N) / (cost_fn × P) that touches the curve, the iso-cost idea of [Provost and Fawcett (2001)](#ref-PF2001a). N and P come from the data entered, so a different prevalence in use changes the answer. The curve has one more point than `ts` has thresholds, so if the cheapest point is the last one, where everything is predicted positive, `ts[argmin(cost)]` raises a bounds error.

## How to Apply a Threshold from the ROC Tab

A printed threshold t stands for the rule "predict positive when the score is strictly greater than t", because `Functions.roc_curve` counts the cases with a score above each listed threshold. A rule with greater-or-equal gives different counts when cases sit exactly at t. Both thresholds are chosen on the data entered, so the rates at those points are optimistic for that data. A threshold should be chosen on validation cases and confirmed on separate test cases. It also belongs to one model and one score scale: a retrained or recalibrated model needs a new threshold, even when its AUC has not changed.

## What the ROC Tab Needs from Labels and Scores

**Score Vector** must hold one number per case, with higher values meaning more likely to be `pos_class`. The tooltip asks for probabilities in [0, 1], but the calculation uses only the ordering and the distinct values, so margins or log-odds work too, with thresholds then in those units. The default positive class is the last label in sort order, and scores that refer to the other class reverse the curve. The tab treats every label other than `pos_class` as negative and does not check for a third class, so a multi-class vector gives a one-against-the-rest result with no warning.

## References

<a id="ref-DDC1988a"></a>DeLong, E. R., DeLong, D. M. and Clarke-Pearson, D. L. (1988). Comparing the areas under two or more correlated receiver operating characteristic curves: a nonparametric approach. *Biometrics* 44(3), 837. [doi:10.2307/2531595](https://doi.org/10.2307/2531595)

<a id="ref-Faw2006a"></a>Fawcett, T. (2006). An introduction to ROC analysis. *Pattern Recognition Letters* 27(8), 861–874. [doi:10.1016/j.patrec.2005.10.010](https://doi.org/10.1016/j.patrec.2005.10.010)

<a id="ref-Han2009a"></a>Hand, D. J. (2009). Measuring classifier performance: a coherent alternative to the area under the ROC curve. *Machine Learning* 77(1), 103–123. [doi:10.1007/s10994-009-5119-5](https://doi.org/10.1007/s10994-009-5119-5)

<a id="ref-HM1982a"></a>Hanley, J. A. and McNeil, B. J. (1982). The meaning and use of the area under a receiver operating characteristic (ROC) curve. *Radiology* 143(1), 29–36. [doi:10.1148/radiology.143.1.7063747](https://doi.org/10.1148/radiology.143.1.7063747)

<a id="ref-PS2006a"></a>Perkins, N. J. and Schisterman, E. F. (2006). The inconsistency of "optimal" cutpoints obtained using two criteria based on the receiver operating characteristic curve. *American Journal of Epidemiology* 163(7), 670–675. [doi:10.1093/aje/kwj063](https://doi.org/10.1093/aje/kwj063)

<a id="ref-PF2001a"></a>Provost, F. and Fawcett, T. (2001). Robust classification for imprecise environments. *Machine Learning* 42(3), 203–231. [doi:10.1023/A:1007601015854](https://doi.org/10.1023/A:1007601015854)

<a id="ref-SR2015a"></a>Saito, T. and Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. *PLOS ONE* 10(3), e0118432. [doi:10.1371/journal.pone.0118432](https://doi.org/10.1371/journal.pone.0118432)

<a id="ref-You1950a"></a>Youden, W. J. (1950). Index for rating diagnostic tests. *Cancer* 3(1), 32–35. [doi:10.1002/1097-0142(1950)3:1&lt;32::AID-CNCR2820030106&gt;3.0.CO;2-3](https://doi.org/10.1002/1097-0142(1950)3:1%3C32::AID-CNCR2820030106%3E3.0.CO;2-3)

## See Also

- [Overview](clf-overview.md) · [Metric Guide](clf-metrics.md) · [Imbalanced Classes](clf-imbalanced.md)
