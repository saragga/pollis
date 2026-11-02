# Interpretation — Linear Models with Autocorrelation

The outputs of the panel mix two scales: coefficients that apply to the original variables, and a transformed regression that produces their standard errors. Most misreadings come from confusing the two.

## How to Read the Coefficients of an AR(1) Regression

**Coefficients** lists each estimate with **std_error**, **t**, **p**, **lower95** and **upper95**. A slope is the change in y for a one-unit change in that regressor, on the original scale, despite the quasi-differencing used to obtain it. The standard errors come from least squares on the transformed data, so they treat rho as known and do not reflect the error in estimating it. In short samples or with rho near one, they tend to be too small. The t statistics use n − k degrees of freedom. A significant slope still says nothing about causation.

## How to Read Rho and Autocorrelation Strength

**Autocorrelation Strength** reports rho with a large-sample standard error sqrt((1 − rho²)/n) and a 95% interval. Rho belongs to the regression errors, and it is neither the autocorrelation of y nor that of the regressors. A positive value means that errors tend to persist in sign, and a negative one that they tend to alternate. The standard error formula is a rule of thumb that ignores the estimation of beta. An interval that reaches close to one warns that the errors may not be stationary.

## How to Read Half-Life and Effective Sample Size for AR(1) Errors

**half_life** equals log(0.5)/log(rho) when rho is positive, and `NaN` otherwise. It gives the number of periods for a shock in the error to fall by half. **effective_sample_size** equals n(1 − rho)/(1 + rho). That formula comes from the variance of the mean of an AR(1) series. For regression slopes it is only a rough guide, because their precision also depends on how the regressors move over time. It is not the number of observations used in the fit.

## How to Read Compare with OLS for an AR(1) Regression

**Compare with OLS** lists **ols**, **ols_se**, **corrected** and **corrected_se** by term. A wide gap between **ols** and **corrected** deserves attention, since under exogeneity both estimators target the same beta in large samples, so a large shift can indicate a specification problem instead of a gain from correction. The corrected standard error need not exceed the OLS one. Under autocorrelation **ols_se** comes from a wrong formula, so the two columns of standard errors do not measure precision on an equal footing.

## How to Read R-Squared After an AR(1) Correction

The printed result reports R² and adjusted R² from the residuals y − X b on the original scale. OLS minimises that sum of squares by construction, so with an intercept the corrected R² cannot exceed the OLS one. A lower value there does not mean the corrected model is worse. Fit should not guide the choice between these estimators in any case, since they differ in efficiency and in the validity of their standard errors, and all aim at the same beta.

## How to Read AR(1) Predictions and Forecast Intervals

**One-Step Predictions** compares X b with X b + rho e_(t−1), through **rmse_regression_only** and **rmse_one_step**. Both are in-sample, using parameters estimated on the same data, so the gain is optimistic. **Forecast** gives the regression part plus rho^h e_T at step h, and the variance s² times the sum of rho^(2(j−1)) for j up to h. The intervals use 1.96 and ignore uncertainty in beta and rho, so they are too narrow, especially in short samples. Forecasts inherit the placeholder rows of **Future regressors** until real values replace them.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
