# Tabular and Survival Measures

The page Score Models scores a method on a tabular or survival dataset by the measures that the dataset's benchmark scores its models by. PollisCompetitions.jl computes them on the test rows of each split, and the score of a run is their mean over the splits, as the published scores are.

## Which Measure Scores a Tabular Dataset?

The Response Type of the dataset, in the Dataset Catalog, decides its measure, as TabArena [(Erickson and 6 coauthors, 2025)](#ref-EPTHD...2025a) scores its datasets:

| Response Type | The method gives, for each test row | Measure | Best |
|---|---|---|---|
| Continuous | A number | `rmse` | Lower |
| Count | A number | `rmse` | Lower |
| Binary | The probability of the second class, the classes sorted | `roc_auc` | Higher |
| Multiclass | A probability for each class | `log_loss` | Lower |

A dataset whose Response Type is Ordered has no measure yet, and the column Model Scoring of Manage Challenge Datasets says Not Yet for it.

## What Is the RMSE?

The root mean squared error is the square root of the mean, over the test rows, of the squared difference between the target and the method's prediction. It is in the units of the target, and 0 is a perfect prediction.

## What Is the Area Under the ROC Curve?

The area under the ROC curve (`roc_auc`) of a binary target is the probability that a row of the second class, drawn at random, gets a higher probability from the method than a row of the first class, drawn at random [(Hanley and McNeil, 1982)](#ref-HM1982a). A method that ranks the rows at random has an area of 0.5, and one that ranks every row of the second class above every row of the first has an area of 1. PollisCompetitions.jl computes it from the ranks of the probabilities, a tie counting one half, and its values are those of scikit-learn [(Pedregosa and 18 coauthors, 2011)](#ref-PVGMT...2011a) on the same predictions.

## What Is the Log Loss?

The log loss of a multiclass target is the mean, over the test rows, of minus the natural logarithm of the probability the method gave the class the row has. A method that gives the right class a probability of 1 has a log loss of 0. As in scikit-learn, each probability is first kept within the machine precision of 0 and 1, so that a probability of 0 for the right class gives a large but finite loss.

## Which Measures Score a Survival Dataset?

A survival dataset is scored by the eight measures of the Low-Dimensional Survival Benchmark [(Burk, Zobolas, Bischl, Bender, Wright and Sonabend, 2026)](#ref-BZBBW...2026a), with the settings of the benchmark, as mlr3proba [(Sonabend, Király, Bender, Bischl and Lang, 2021)](#ref-SKBBL2021a) computes them. The method gives each test row its probability of surviving past each of the distinct times of the training rows, its survival curve, and the measures read the curves:

| Measure | What it scores | Best |
|---|---|---|
| `harrell_c` | Discrimination: Harrell's C | Higher |
| `uno_c` | Discrimination: Uno's C | Higher |
| `isbs` | The integrated survival Brier score | Lower |
| `isbs_erv` | The integrated survival Brier score, as explained residual variation | Higher |
| `isll` | The integrated survival log loss | Lower |
| `isll_erv` | The integrated survival log loss, as explained residual variation | Higher |
| `dcalib` | Calibration: D-calibration | Lower |
| `alpha_calib` | Calibration: alpha-calibration | Nearest 1 |

PollisCompetitions.jl's survival measures give the published scores of the benchmark's Kaplan-Meier [(Kaplan and Meier, 1958)](#ref-KM1958a) and Nelson-Aalen [(Aalen, 1978)](#ref-Aal1978a) estimates on every split of its 34 datasets.

## What Are Harrell's C and Uno's C?

Harrell's C, the concordance index of [Harrell, Califf, Pryor, Lee and Rosati (1982)](#ref-HCPLR1982a), takes the pairs of test rows whose order of failure is known, those in which the row with the shorter time had the event, and gives the share of them in which the method gives the higher risk to the row that failed first. Uno's C [(Uno, Cai, Pencina, D'Agostino and Wei, 2011)](#ref-UCPDW2011a) weighs each pair by the inverse of the probability of the time remaining uncensored, estimated from the training rows, so that its value does not depend on how much of the data is censored. For both, 0.5 is a ranking at random and 1 a perfect ranking. The risk of a test row comes from its survival curve, as mlr3proba derives it.

## What Are the Integrated Brier Score and Log Loss?

The Brier score of survival data at a time compares each row's predicted probability of surviving past that time with whether it did, the rows censored before that time weighted by the inverse of the probability of censoring, and the integrated Brier score averages it over the times [(Graf, Schmoor, Sauerbrei and Schumacher, 1999)](#ref-GSSS1999a). The integrated log loss does the same with the logarithmic loss in place of the squared error. The benchmark integrates over the times of the test rows up to the time by which 80% of them have had their event or been censored.

## What Is the Explained Residual Variation?

A score given as explained residual variation (ERV) compares the method's integrated Brier score or log loss with that of the Kaplan-Meier estimate fitted on the same training rows, as the benchmark reports them: 0 is a method that does as well as Kaplan-Meier, a positive value one that does better, and 1 a method with no loss.

## What Are D-Calibration and Alpha-Calibration?

D-calibration [(Haider, Hoehn, Davis and Greiner, 2020)](#ref-HHDG2020a) checks that the predicted survival probability at the time each row had its event is spread evenly between 0 and 1, as it is for well calibrated survival curves: it divides the interval into 10 equal parts, counts the rows in each, a censored row shared among the parts it may fall in, and gives the chi-square statistic of the counts against even counts. A lower value is better calibrated. Alpha-calibration, from the calibration of survival models of [van Houwelingen (2000)](#ref-Hou2000a), is the ratio of the number of events observed to the number expected from the predicted survival curves: 1 is perfect calibration, so Score Models ranks it by its distance from 1.

## How Is a Method Compared With the Published Runs?

The method's score on each measure is its mean over the splits of the run, and the published scores are means over all the published splits of the dataset. Its rank on a measure is 1, plus one for each published run that does better on that measure. A run on the first repeat only is compared in the same way, and Score Models says that the comparison is then indicative, as the means are over different splits.

## References

<a id="ref-Aal1978a"></a>Aalen, O. (1978). Nonparametric Inference for a Family of Counting Processes. *The Annals of Statistics* 6(4), 701–726. [doi:10.1214/aos/1176344247](https://doi.org/10.1214/aos/1176344247)

<a id="ref-BZBBW...2026a"></a>Burk, L., Zobolas, J., Bischl, B., Bender, A., Wright, M. N. and Sonabend, R. (2026). A large-scale neutral comparison study of survival models on low-dimensional data. *Bioinformatics* 42(5), btag186. [doi:10.1093/bioinformatics/btag186](https://doi.org/10.1093/bioinformatics/btag186)

<a id="ref-EPTHD...2025a"></a>Erickson, N., Purucker, L., Tschalzev, A., Holzmüller, D., Desai, P., Salinas, D. and Hutter, F. (2025). TabArena: A Living Benchmark for Machine Learning on Tabular Data. In *Advances in Neural Information Processing Systems 38*, 17285–17350. [doi:10.52202/085713-0519](https://doi.org/10.52202/085713-0519)

<a id="ref-GSSS1999a"></a>Graf, E., Schmoor, C., Sauerbrei, W. and Schumacher, M. (1999). Assessment and comparison of prognostic classification schemes for survival data. *Statistics in Medicine* 18(17-18), 2529–2545. [doi:10.1002/(sici)1097-0258(19990915/30)18:17/18<2529::aid-sim274>3.0.co;2-5](https://doi.org/10.1002/(sici)1097-0258(19990915/30)18:17/18%3C2529::aid-sim274%3E3.0.co;2-5)

<a id="ref-HHDG2020a"></a>Haider, H., Hoehn, B., Davis, S. and Greiner, R. (2020). Effective Ways to Build and Evaluate Individual Survival Distributions. *Journal of Machine Learning Research* 21(85), 1–63. [jmlr.org/papers/v21/18-772](https://jmlr.org/papers/v21/18-772.html)

<a id="ref-HM1982a"></a>Hanley, J. A. and McNeil, B. J. (1982). The meaning and use of the area under a receiver operating characteristic (ROC) curve. *Radiology* 143(1), 29–36. [doi:10.1148/radiology.143.1.7063747](https://doi.org/10.1148/radiology.143.1.7063747)

<a id="ref-HCPLR1982a"></a>Harrell, F. E., Califf, R. M., Pryor, D. B., Lee, K. L. and Rosati, R. A. (1982). Evaluating the Yield of Medical Tests. *JAMA: The Journal of the American Medical Association* 247(18), 2543. [doi:10.1001/jama.1982.03320430047030](https://doi.org/10.1001/jama.1982.03320430047030)

<a id="ref-KM1958a"></a>Kaplan, E. L. and Meier, P. (1958). Nonparametric Estimation from Incomplete Observations. *Journal of the American Statistical Association* 53(282), 457–481. [doi:10.1080/01621459.1958.10501452](https://doi.org/10.1080/01621459.1958.10501452)

<a id="ref-PVGMT...2011a"></a>Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Müller, A., Nothman, J., Louppe, G., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M. and Duchesnay, É. (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research* 12, 2825–2830. [jmlr.org/papers/v12/pedregosa11a](https://jmlr.org/papers/v12/pedregosa11a.html)

<a id="ref-SKBBL2021a"></a>Sonabend, R., Király, F. J., Bender, A., Bischl, B. and Lang, M. (2021). mlr3proba: an R package for machine learning in survival analysis. *Bioinformatics* 37(17), 2789–2791. [doi:10.1093/bioinformatics/btab039](https://doi.org/10.1093/bioinformatics/btab039)

<a id="ref-UCPDW2011a"></a>Uno, H., Cai, T., Pencina, M. J., D'Agostino, R. B. and Wei, L. J. (2011). On the C-statistics for evaluating overall adequacy of risk prediction procedures with censored survival data. *Statistics in Medicine* 30(10), 1105–1117. [doi:10.1002/sim.4154](https://doi.org/10.1002/sim.4154)

<a id="ref-Hou2000a"></a>van Houwelingen, H. C. (2000). Validation, calibration, revision and combination of prognostic survival models. *Statistics in Medicine* 19(24), 3401–3415. [doi:10.1002/1097-0258(20001230)19:24<3401::aid-sim554>3.0.co;2-2](https://doi.org/10.1002/1097-0258(20001230)19:24%3C3401::aid-sim554%3E3.0.co;2-2)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
