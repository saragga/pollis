# Metric Guide

Regression metrics differ in the target they reward and in how they respond to large errors. Choosing one means deciding what an error costs in the task at hand.

## What Each Regression Metric Computes

With residual e = y - ŷ for each of n cases:

| Metric | Formula | Units | Best value |
|---|---|---|---|
| RMSE | sqrt(sum(e²) / n) | Those of the target | 0 |
| MAE | sum(abs(e)) / n | Those of the target | 0 |
| R² | 1 - sum(e²) / sum((y - ȳ_train)²) | None | 1, and it can be negative |
| Adjusted R² | 1 - (1 - R²)(n - 1) / (n - p - 1) | None | 1 |
| MAPE | 100 × mean(abs(e / y)), near-zero y skipped | Per cent | 0 |

In the panel, ȳ_train is the mean of **Training Targets**, p is **No. of Predictors**, and n is the length of **Actual Values**.

## How to Choose Between RMSE and MAE for a Regression Model

The choice follows the quantity the prediction should target. [Gneiting (2011)](#ref-Gne2011a) shows that squared error is consistent for the mean and absolute error for the median, so RMSE suits a model of the conditional mean and MAE a model of the conditional median. [Willmott and Matsuura (2005)](#ref-WM2005a) prefer MAE as the plainer description of average error size, while [Chai and Draxler (2014)](#ref-CD2014a) defend RMSE when errors are close to Normal. MAE never exceeds RMSE, and RMSE never exceeds sqrt(n) × MAE. A large ratio of RMSE to MAE signals a few large errors, which the **Residual Plot** can then locate.

## How R² Behaves Out of Sample

[Kvålseth (1985)](#ref-Kva1985a) lists several formulas that all go by the name R², which agree only for a linear least squares fit with an intercept, evaluated in-sample. The formula in the panel can be negative on test data, and a negative value means that the training mean predicts these cases better than the model does. R² is scale-free, which helps across targets, but it depends on the spread of the actual values: the same absolute error gives a higher R² on a more variable test set. R² therefore compares models fairly only on one target and one set of test cases.

## When Adjusted R² Is Meaningful

Adjusted R², from a correction in the line of [Wherry (1931)](#ref-Whe1931a), corrects the rise in R² that comes with each added predictor when a model is scored on its own training data. In that setting, with training cases as **Actual Values**, it helps to compare fits of different sizes on one data set. On a test set the penalty has nothing to correct, because test predictions did not use those cases for fitting, and a comment in the panel's code says so. The panel computes it anyway with n from **Actual Values**. If n - p - 1 is zero, the formula divides by zero; if negative, the sign of the penalty flips. A held-out error is the better comparison.

## When MAPE Fails as a Regression Metric

MAPE divides by the actual value, so [Hyndman and Koehler (2006)](#ref-HK2006a) warn that it is infinite or undefined when actual values reach zero, and that it needs a scale with a meaningful zero. The panel excludes actual values under 1e-8 of the largest in size and warns of the number skipped, so a reported MAPE may cover fewer cases than the other metrics, and values just over the cut can still dominate. For positive targets, under-prediction costs at most 100 per cent while over-prediction has no limit. [Tofallis (2015)](#ref-Tof2015a) shows that MAPE therefore favours models that under-predict, and proposes the log of the accuracy ratio instead.

## Which Regression Metric to Use in Each Situation

| Situation | Metric | Why |
|---|---|---|
| Large errors cost disproportionately more | RMSE | Squaring gives them extra weight |
| Cost grows in step with error size | MAE | Treats each unit of error alike |
| Target is a median, or errors have heavy tails | MAE | Consistent for the median |
| The audience needs a unit-free figure for one target | R² | Compares with the training mean |
| In-sample comparison of fits of different size | Adjusted R² | Penalises added predictors |
| Target strictly positive, with relative errors what matters | MAPE, with care | Reads as a percentage, but favours under-prediction |
| Several series of different scales | A scaled error | [Armstrong and Collopy (1992)](#ref-AC1992a) warn against RMSE for comparing across series |

## How to Compare Two Regression Models on One Metric

A lower RMSE on one test set may reflect sampling variation only, and the panel offers no test or interval. Both models should be scored on the same cases, which allows pairing: the per-case differences in squared or absolute error have a mean and a standard error that can be reported. For forecasts, the test of [Diebold and Mariano (1995)](#ref-DM1995a) compares predictive accuracy using those loss differences, and allows for their autocorrelation. A small gain may also fail to justify a more complex model, a question no metric settles by itself.

## References

<a id="ref-AC1992a"></a>Armstrong, J. S. and Collopy, F. (1992). Error measures for generalizing about forecasting methods: empirical comparisons. *International Journal of Forecasting* 8(1), 69–80. [doi:10.1016/0169-2070(92)90008-W](https://doi.org/10.1016/0169-2070(92)90008-W)

<a id="ref-CD2014a"></a>Chai, T. and Draxler, R. R. (2014). Root mean square error (RMSE) or mean absolute error (MAE)? Arguments against avoiding RMSE in the literature. *Geoscientific Model Development* 7(3), 1247–1250. [doi:10.5194/gmd-7-1247-2014](https://doi.org/10.5194/gmd-7-1247-2014)

<a id="ref-DM1995a"></a>Diebold, F. X. and Mariano, R. S. (1995). Comparing predictive accuracy. *Journal of Business & Economic Statistics* 13(3), 253–263. [doi:10.1080/07350015.1995.10524599](https://doi.org/10.1080/07350015.1995.10524599)

<a id="ref-Gne2011a"></a>Gneiting, T. (2011). Making and evaluating point forecasts. *Journal of the American Statistical Association* 106(494), 746–762. [doi:10.1198/jasa.2011.r10138](https://doi.org/10.1198/jasa.2011.r10138)

<a id="ref-HK2006a"></a>Hyndman, R. J. and Koehler, A. B. (2006). Another look at measures of forecast accuracy. *International Journal of Forecasting* 22(4), 679–688. [doi:10.1016/j.ijforecast.2006.03.001](https://doi.org/10.1016/j.ijforecast.2006.03.001)

<a id="ref-Kva1985a"></a>Kvålseth, T. O. (1985). Cautionary note about R². *The American Statistician* 39(4), 279–285. [doi:10.1080/00031305.1985.10479448](https://doi.org/10.1080/00031305.1985.10479448)

<a id="ref-Tof2015a"></a>Tofallis, C. (2015). A better measure of relative prediction accuracy for model selection and model estimation. *Journal of the Operational Research Society* 66(8), 1352–1362. [doi:10.1057/jors.2014.103](https://doi.org/10.1057/jors.2014.103)

<a id="ref-Whe1931a"></a>Wherry, R. J. (1931). A new formula for predicting the shrinkage of the coefficient of multiple correlation. *Annals of Mathematical Statistics* 2(4), 440–457. [doi:10.1214/aoms/1177732951](https://doi.org/10.1214/aoms/1177732951)

<a id="ref-WM2005a"></a>Willmott, C. J. and Matsuura, K. (2005). Advantages of the mean absolute error (MAE) over the root mean square error (RMSE) in assessing average model performance. *Climate Research* 30, 79–82. [doi:10.3354/cr030079](https://doi.org/10.3354/cr030079)

## See Also

- [Overview](rp-overview.md) · [Assumptions](rp-assumptions.md) · [Interpretation](rp-interpretation.md)
