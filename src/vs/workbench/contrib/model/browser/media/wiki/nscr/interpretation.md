# Interpretation

## Net Survival
"If the disease were the only cause of death, x% of patients would be alive 5 years after diagnosis." It removes the background mortality, so it compares groups with different life expectancy: countries, periods, men and women. It is not anyone's actual chance of survival; for a patient, use crude mortality.

## Relative Survival
Observed survival divided by the survival expected from the rate table. The **Observed, Expected and Relative Survival** action shows the observed (Kaplan-Meier) survival, the expected survival (Ederer II), their ratio, and the net survival of the chosen estimator. Relative survival estimates net survival only when the excess hazard does not depend on age; Pohar-Perme does not need that.

## Crude Mortality
Three curves that add up: the probability of having died **from the disease** by time t, **from other causes**, and from **all causes** (one minus the observed survival). They describe the real world, where both causes compete: an older patient may have a high chance of dying of other causes before the disease could cause death.

**Deaths Attributable to the Disease** divides disease deaths by all deaths: the share of the mortality of the cohort that the disease accounts for. It usually falls with time since diagnosis.

## Excess Hazard
The rate of deaths beyond the population's, per day. It is highest soon after diagnosis; when it falls to zero, the survivors die at the population rate, which is what population-based studies call **statistical cure**.

## Graffeo's Test
A small p-value means net survival differs between groups. It says nothing about the size or the timing of the difference: look at the curves per group and at the milestone estimates.

## In Plain Terms
The **In Plain Terms** action writes the 5-year results as sentences, for reports and patients.

## See Also
- [Net Survival Estimators](estimators.md) · [Crude Mortality](crude-mortality.md) · [Graffeo's Test](graffeo-test.md)
