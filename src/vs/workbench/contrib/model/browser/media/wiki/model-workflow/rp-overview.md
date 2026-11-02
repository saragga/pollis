# Overview

A regression metric reduces the gaps between predictions and actual values to one number, and each metric reduces them differently. The Regression Performance panel computes five such numbers and offers plots of the gaps, because a summary alone can hide what plots show.

## What the Regression Performance Panel Does and Its Julia Stack

The panel evaluates predictions that already exist, and it fits no model on the user's behalf.

| Item | In Regression Performance |
|---|---|
| Purpose | Compare predicted with actual values, and inspect the residuals |
| Julia stack | Statistics for the means and standard deviations; Plots.jl for the four plots; Distributions.jl for the Normal quantiles of **Q-Q Plot** |
| Tabs | None, a single block of code |
| Inputs | **Predicted Values**, **Actual Values**, **Training Targets**, **No. of Predictors** |
| Results | `rmse`, `mae`, `r2`, `adj_r2`, `mape`, assigned to variables with no print call |
| Next Steps | **Residual Plot**, **Q-Q Plot**, **Predicted vs Actual**, **Error Distribution** |
| Not in the panel | Model fitting, intervals, tests between models |

## How the Regression Performance Panel Computes Its Metrics

The code takes residuals as **Actual Values** minus **Predicted Values** and derives everything from them. RMSE and MAE average the squared and absolute residuals. R² compares the squared residuals with the squared distance of the actual values from a baseline. Adjusted R² then applies a penalty using **No. of Predictors**, an input that affects no other metric. MAPE divides each residual by its actual value, and it skips actual values whose size is under 1e-8 of the largest, with a warning that gives their number. To see a result, evaluate its variable name after the block has run.

## Why Regression Performance Uses the Training Mean as the R² Baseline

The panel's R² is 1 - SS_res / SS_tot, where SS_tot sums the squared distances of **Actual Values** from the mean of **Training Targets**. On a test set this asks whether the model beats the prediction anyone could have made before seeing the test targets, namely the training mean. Using the test mean as the baseline would borrow information from the very values being predicted. For an in-sample fit, entering the actual values again in **Training Targets** gives the usual formula. As [Kvålseth (1985)](#ref-Kva1985a) stresses, R² is not one quantity across all settings, so it should be reported along with its baseline.

## Where the Regression Performance Metrics Come From

Each metric carries a history of argument. [Willmott and Matsuura (2005)](#ref-WM2005a) favour MAE as a measure of average error, and [Chai and Draxler (2014)](#ref-CD2014a) reply that RMSE keeps its place, especially when errors are close to Normal. [Gneiting (2011)](#ref-Gne2011a) gives the deeper reason for the choice: a scoring function implies a target, so squared error rewards predicting the mean and absolute error rewards the median. The correction behind Adjusted R² goes back to [Wherry (1931)](#ref-Whe1931a). [Hyndman and Koehler (2006)](#ref-HK2006a) set out why percentage errors fail when actual values reach zero.

## What the Next Steps of Regression Performance Show

| Next Step | Group | What it draws | What it reveals |
|---|---|---|---|
| **Residual Plot** | Diagnose | Residuals against predicted values, with a zero line | Curvature, a change in spread, outliers |
| **Q-Q Plot** | Diagnose | Sorted standardised residuals against Normal quantiles, with a reference line | Departures from a Normal shape, heavy tails |
| **Predicted vs Actual** | Interpret | Predicted against actual values, with a dashed perfect-fit line | Overall fit, and where errors gather |
| **Error Distribution** | Interpret | Histogram of residuals in 30 bins, with mean and zero lines | Systematic bias, the shape of the errors |

## A Common Workflow for Regression Performance

1. Fit the model elsewhere, and predict cases it did not train on.
2. Enter **Predicted Values**, **Actual Values** and **Training Targets**, and read RMSE, MAE and R² together.
3. Decide in advance which metric reflects the cost of errors in the task.
4. Open **Residual Plot** and **Error Distribution** before trusting a single figure.
5. Use **Q-Q Plot** if the work relies on Normal errors, for example in prediction intervals.
6. Compare other models on the same test cases with the same metric.

## References

<a id="ref-CD2014a"></a>Chai, T. and Draxler, R. R. (2014). Root mean square error (RMSE) or mean absolute error (MAE)? Arguments against avoiding RMSE in the literature. *Geoscientific Model Development* 7(3), 1247–1250. [doi:10.5194/gmd-7-1247-2014](https://doi.org/10.5194/gmd-7-1247-2014)

<a id="ref-Gne2011a"></a>Gneiting, T. (2011). Making and evaluating point forecasts. *Journal of the American Statistical Association* 106(494), 746–762. [doi:10.1198/jasa.2011.r10138](https://doi.org/10.1198/jasa.2011.r10138)

<a id="ref-HK2006a"></a>Hyndman, R. J. and Koehler, A. B. (2006). Another look at measures of forecast accuracy. *International Journal of Forecasting* 22(4), 679–688. [doi:10.1016/j.ijforecast.2006.03.001](https://doi.org/10.1016/j.ijforecast.2006.03.001)

<a id="ref-Kva1985a"></a>Kvålseth, T. O. (1985). Cautionary note about R². *The American Statistician* 39(4), 279–285. [doi:10.1080/00031305.1985.10479448](https://doi.org/10.1080/00031305.1985.10479448)

<a id="ref-Whe1931a"></a>Wherry, R. J. (1931). A new formula for predicting the shrinkage of the coefficient of multiple correlation. *Annals of Mathematical Statistics* 2(4), 440–457. [doi:10.1214/aoms/1177732951](https://doi.org/10.1214/aoms/1177732951)

<a id="ref-WM2005a"></a>Willmott, C. J. and Matsuura, K. (2005). Advantages of the mean absolute error (MAE) over the root mean square error (RMSE) in assessing average model performance. *Climate Research* 30, 79–82. [doi:10.3354/cr030079](https://doi.org/10.3354/cr030079)

## See Also

- [Metric Guide](rp-metric-guide.md) · [Assumptions](rp-assumptions.md) · [Interpretation](rp-interpretation.md)
