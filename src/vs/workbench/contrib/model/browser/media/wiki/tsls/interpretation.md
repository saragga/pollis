# Interpretation

## Coefficient Table
The **Coefficient Table** gives the 2SLS estimates with standard errors, t statistics, two-sided p-values and 95% intervals. The coefficient on an endogenous regressor is its **structural** effect: the change in the response caused by a one-unit change in the regressor, the exogenous regressors fixed. The coefficients on the exogenous regressors are their effects given the endogenous ones.

## OLS vs 2SLS
**OLS vs 2SLS** shows how far the estimate moves when endogeneity is allowed for. The direction should match the story: if unobserved demand raises both advertising and sales, OLS overstates the effect of advertising and 2SLS should be smaller. A 2SLS estimate many times OLS often means weak instruments rather than a large effect.

## Local Average Treatment Effect
When the effect differs across units, 2SLS estimates the average effect for the **compliers**, the units whose regressor the instrument changes. Different instruments can identify different averages, which is also why the Sargan test can reject with valid instruments.

## Precision
2SLS standard errors are larger than OLS ones, often much larger: only the variation in the regressor explained by the instruments is used. A weak first stage makes them larger still, and unreliable.

## Confidence Intervals
The **Confidence Intervals** are the estimate plus or minus a t critical value times the selected standard error. They rely on a strong first stage.

## Weak-Instrument Robust Interval (Anderson-Rubin)
The **Anderson-Rubin** confidence set collects every value b of the endogenous coefficient for which y - b w is unrelated to the excluded instruments. Its coverage is right however weak the instruments are. With strong instruments it is close to the usual interval; with weak ones it widens, and it can be unbounded, which says honestly that the data cannot pin the coefficient down.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
