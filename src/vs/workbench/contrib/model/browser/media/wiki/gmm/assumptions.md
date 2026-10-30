# Assumptions

## The Moment Conditions
- **Validity.** E[z_i e_i] = 0 for every instrument: the instruments are uncorrelated with the structural error. As in 2SLS, this is an argument about the data, partly testable only when there are more moments than parameters.
- **Identification.** The moments pin down theta uniquely: at least as many instruments as regressors (the order condition), and instruments that are correlated with the endogenous regressors (the rank condition, in practice a strong first stage).
- **A correctly specified model.** Hansen's J rejects when the moments are inconsistent with each other, which may mean an invalid instrument or a wrong functional form.

## The Data
- **Independent observations** for the sandwich standard errors and the J test; **clustered** data need the cluster bootstrap, and the J test then tends to reject too often.
- **Stationarity and weak dependence** if the observations are a time series; the moment covariance must then allow for autocorrelation, which the Generalized Method of Moments (GMM) panel's code does not.

## The Weighting Matrix
- Two-step GMM estimates S from first-step residuals. With **many moments relative to the sample**, this estimate is poor, and the efficient estimator loses its advantage. A rough guide: the number of moments well below the square root of the number of observations, or a few dozen at most.

## Asymptotics
GMM's standard errors, z tests and the J test are **large-sample** results. With a few hundred observations or fewer, the bootstrap intervals are a useful check.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
