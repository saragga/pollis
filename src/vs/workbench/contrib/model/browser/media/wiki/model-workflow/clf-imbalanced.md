# Imbalanced Classes

Classes are imbalanced when one label is much rarer than the other. Rarity changes how some metrics read and limits what can be estimated, but [van den Goorbergh, van Smeden, Timmerman and Van Calster (2022)](#ref-GSTC2022a) show that it is not, in itself, a defect that resampling must repair.

## What Class Imbalance Does to Classification Metrics

| Metric | Effect of a rarer positive class, classifier unchanged |
|---|---|
| **Accuracy** | Rises towards the majority share, even for a rule that detects nothing |
| **Precision** | Falls, because false positives come from a larger group |
| **Recall** | Stays the same, since it conditions on the true positives |
| **F1** | Falls along with precision |
| **MCC** | Changes with prevalence, but stays near 0 for a rule that detects nothing |
| **AUC** | Stays the same in expectation, while its estimate gets noisier as positives become few |

Each row assumes that the scores of each class keep their distribution. Under that condition, a change in these metrics between two populations can come from prevalence alone.

## How to Check Class Balance with the Class Imbalance Check

**Class Imbalance Check** counts the labels in **True Labels** with `countmap` and prints each class's count and percentage, to one decimal place. It sets no limit for what counts as imbalanced, and it should not be read as if it did. The absolute number of cases in the rare class usually matters more than its share, since this number limits how well any model can learn that class and how precisely any metric can be estimated. The event count, not the sample size, also drives the small-sample bias in logistic regression that [King and Zeng (2001)](#ref-KZ2001a) describe for rare events.

## Why the Precision-Recall Curve Helps with Rare Positives

Precision has false positives in its denominator without scaling them by the number of negatives, so it shows the false alarms that a ROC curve can compress into a small horizontal distance. [Saito and Rehmsmeier (2015)](#ref-SR2015a) report that readers draw more accurate conclusions on imbalanced data from the precision-recall plot, whose baseline is the positive fraction and not a fixed diagonal. **Precision-Recall Curve** plots `Functions.precision_recall_curve` with that baseline as a dashed line. Since the baseline moves with prevalence, curves from data of different prevalence are not directly comparable.

## How to Read the Precision-Recall Curve Without Overreading It

The first point of the **Precision-Recall Curve** is fixed by convention at recall 0 and precision 1, and is not an observation, so the left edge can look better than the model is. The panel joins the points with straight lines. [Davis and Goadrich (2006)](#ref-DG2006a) show that straight-line interpolation is not valid in precision-recall space, so an area taken by the trapezoid rule from such a plot would be optimistic; the panel prints no area. The same authors prove that one curve dominates another in ROC space if and only if it does in precision-recall space, so a domination seen in either plot holds in both.

## How to Read the Lift Curve under Class Imbalance

The **Lift Curve** sorts cases by descending score and divides the positive share among the top k by the overall positive rate. Lift is thus the precision at rank k over the base rate. The dashed line at 1 is what a random order gives. Every curve ends at exactly 1, where all cases are taken, and no curve can pass 1 / base rate, so a rarer class allows a higher lift and heights do not carry over between data sets of different prevalence. Lift suits a fixed budget, such as a set number of cases to review. A curve mostly under 1 means that `pos_class` is not the class the scores refer to.

## Why Resampling Is Often Unnecessary for Imbalanced Classes

Over-sampling, under-sampling and synthetic methods such as SMOTE, from [Chawla, Bowyer, Hall and Kegelmeyer (2002)](#ref-CBHK2002a), change the class proportions a model trains on. [He and Garcia (2009)](#ref-HG2009a) survey these methods. Models trained that way overestimate the probability of the rare class. In the simulations of van den Goorbergh and co-authors, cited at the head of the Imbalanced Classes wiki, such corrections gave logistic models miscalibrated risks with no gain in discrimination. Where sampling is used for another reason, such as training time, the prior correction of [King and Zeng (2001)](#ref-KZ2001a) restores the intercept of a logistic model. The panel has no resampling step, and test cases should keep their real prevalence in any event.

## How to Handle Imbalance with Proper Scores and a Cost Threshold

Instead of changing the training data, a modeller can judge probabilities with a proper scoring rule and then pick the decision threshold from costs. Log loss and the Brier score are strictly proper in the sense of [Gneiting and Raftery (2007)](#ref-GR2007a), so they reward honest probabilities; MLJ.jl provides them as `log_loss` and `brier_loss`. For a calibrated probability p, predicting positive is the cheaper action when p > cost_fp / (cost_fp + cost_fn). With the values set in the **ROC** tab, 1 and 5, that gives about 0.167, and not the customary 0.5. If the probabilities are not calibrated, the Model Calibration panel can address that first, or the minimum-cost threshold of the **ROC** tab can be read from the data directly.

## What to Do in Each Imbalanced Classification Situation

| Situation | What to use | Why |
|---|---|---|
| Probabilities feed a decision with known costs | Proper scores, then a cost-based threshold | Keeps probabilities honest and places the errors where they cost least |
| A fixed number of cases can be reviewed | **Lift Curve** and precision at that rank | Answers the question for the budget available |
| The rare class is the focus and costs are unknown | **Precision-Recall Curve** with **ROC** | Shows both the false alarms and the ranking |
| Very few cases in the rare class | More data, or wide intervals on every metric | No metric can repair the shortage |
| Training folds may miss the rare class | `StratifiedCV(nfolds=5, shuffle=true, rng=1)` | Keeps the class share in each fold |

## References

<a id="ref-CBHK2002a"></a>Chawla, N. V., Bowyer, K. W., Hall, L. O. and Kegelmeyer, W. P. (2002). SMOTE: synthetic minority over-sampling technique. *Journal of Artificial Intelligence Research* 16, 321–357. [doi:10.1613/jair.953](https://doi.org/10.1613/jair.953)

<a id="ref-DG2006a"></a>Davis, J. and Goadrich, M. (2006). The relationship between precision-recall and ROC curves. *Proceedings of the 23rd International Conference on Machine Learning*, 233–240. [doi:10.1145/1143844.1143874](https://doi.org/10.1145/1143844.1143874)

<a id="ref-GR2007a"></a>Gneiting, T. and Raftery, A. E. (2007). Strictly proper scoring rules, prediction, and estimation. *Journal of the American Statistical Association* 102(477), 359–378. [doi:10.1198/016214506000001437](https://doi.org/10.1198/016214506000001437)

<a id="ref-GSTC2022a"></a>van den Goorbergh, R., van Smeden, M., Timmerman, D. and Van Calster, B. (2022). The harm of class imbalance corrections for risk prediction models: illustration and simulation using logistic regression. *Journal of the American Medical Informatics Association* 29(9), 1525–1534. [doi:10.1093/jamia/ocac093](https://doi.org/10.1093/jamia/ocac093)

<a id="ref-HG2009a"></a>He, H. and Garcia, E. A. (2009). Learning from imbalanced data. *IEEE Transactions on Knowledge and Data Engineering* 21(9), 1263–1284. [doi:10.1109/TKDE.2008.239](https://doi.org/10.1109/TKDE.2008.239)

<a id="ref-KZ2001a"></a>King, G. and Zeng, L. (2001). Logistic regression in rare events data. *Political Analysis* 9(2), 137–163. [doi:10.1093/oxfordjournals.pan.a004868](https://doi.org/10.1093/oxfordjournals.pan.a004868)

<a id="ref-SR2015a"></a>Saito, T. and Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. *PLOS ONE* 10(3), e0118432. [doi:10.1371/journal.pone.0118432](https://doi.org/10.1371/journal.pone.0118432)

## See Also

- [Overview](clf-overview.md) · [Metric Guide](clf-metrics.md) · [ROC Analysis](clf-roc.md)
