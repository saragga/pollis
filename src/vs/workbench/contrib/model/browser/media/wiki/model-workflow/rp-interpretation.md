# Interpretation

The numbers of Regression Performance say how large the errors are, and its plots say where the errors fall. [Anscombe (1973)](#ref-Ans1973a) built data sets with the same summary statistics and very different plots, so the two should be read together.

## How to Read RMSE and MAE of a Regression Model

RMSE and MAE are in the units of the target, so they should be judged against what an error of that size means in the task and against the spread of the actual values. MAE is the average size of an error. RMSE is not a typical error: it is the square root of the average squared error, and it can be driven by a few large cases. Neither shows direction, because a model that is always too low can have the same MAE as one that errs evenly on both sides. A value counts as good or bad only in comparison with a baseline or a rival model.

## How to Read R² on Test Data

On held-out cases, the panel's R² of 0 means the model does as well as predicting the mean of **Training Targets** for every case, and a negative value means it does worse. A value of 1 means no error. Reading R² as the share of variance explained is exact only for least squares with an intercept in-sample, one of the distinctions drawn by [Kvålseth (1985)](#ref-Kva1985a). A high R² does not show that the model is correctly specified, that its errors are small enough for the task, or that any predictor has a causal effect. A trend shared by predictions and actual values alone can raise it.

## How to Read the Residual Plot of a Regression Model

**Residual Plot** draws residuals, actual minus predicted, against predicted values, with a dashed line at zero. A shapeless band of even width around the line is the good result. A curve means that the model misses a nonlinear pattern, and a transformation or an added term may help. A funnel means that the spread of errors changes with the size of the prediction. Isolated far points may be data errors or real cases the model handles badly, and they deserve a look before any removal. Parallel streaks usually reflect a discrete or rounded target, and not a modelling fault.

## How to Read the Q-Q Plot of Regression Residuals

**Q-Q Plot** sorts the residuals, after subtracting their mean and dividing by their standard deviation, and plots them against Normal quantiles at positions (i - 0.5) / n. Points along the line y = x are consistent with a Normal shape. Both ends bending away from the line in opposite directions, with the sample values more extreme than the Normal ones, indicate heavy tails. A curve in one direction indicates skew. A few wandering points at the extremes are common even with Normal errors in small samples. Since the mean has been removed, a straight **Q-Q Plot** says nothing about whether the model is biased.

## How to Read Predicted vs Actual for a Regression Model

**Predicted vs Actual** has actual values on the horizontal axis and predictions on the vertical axis, with a dashed line for a perfect fit. Points close to the line along its whole length indicate a good fit. A cloud flatter than the line is normal for an imperfect model, since predictions that are conditional means vary less than the actual values, so low cases get over-predicted and high cases under-predicted. A consistent shift to one side of the line shows bias. A wide cloud at one end shows where the model is least reliable. The closeness of the points to the line is partly a matter of the axis range.

## How to Read the Error Distribution of a Regression Model

**Error Distribution** is a histogram of residuals in 30 bins, with a red line at their mean and a dashed grey line at zero. Since a residual is actual minus predicted, a mean to the right of zero means that the model under-predicts on average, and a mean to the left means that it over-predicts. A gap between the lines on test data suggests a systematic bias, or a test set that differs from the training set. Two humps often point to a missing grouping variable. The appearance of a histogram depends on the fixed number of bins when there are few cases.

## What Are Common Misreadings of Regression Performance

| Reading | Why it can be wrong |
|---|---|
| Lower RMSE on one test set proves one model better | The gap may be within sampling variation, and the panel gives no interval |
| R² of two targets can be compared directly | R² depends on the spread of each target |
| Adjusted R² on a test set corrects for model size | The correction concerns in-sample fit |
| Normal residuals show the model is right | A Normal shape can sit alongside a missing variable |
| Small MAPE means accurate everywhere | Near-zero values may have been skipped, and low predictions are favoured |

## References

<a id="ref-Ans1973a"></a>Anscombe, F. J. (1973). Graphs in statistical analysis. *The American Statistician* 27(1), 17–21. [doi:10.1080/00031305.1973.10478966](https://doi.org/10.1080/00031305.1973.10478966)

<a id="ref-Kva1985a"></a>Kvålseth, T. O. (1985). Cautionary note about R². *The American Statistician* 39(4), 279–285. [doi:10.1080/00031305.1985.10479448](https://doi.org/10.1080/00031305.1985.10479448)

## See Also

- [Overview](rp-overview.md) · [Metric Guide](rp-metric-guide.md) · [Assumptions](rp-assumptions.md)
