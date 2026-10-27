# Net Survival Estimators

All four estimators combine the observed deaths of the patients with the deaths expected from the rate table. They differ in how they weight the patients, and so in what they estimate.

| Estimator | Year | What it estimates | Biased when |
|---|---|---|---|
| **Ederer I** | 1961 | Observed survival over the expected survival of the whole cohort, as if no one were censored | The excess hazard depends on age; long follow-up |
| **Ederer II** | 1959 | Same, with the expected survival of the patients still at risk at each time | The excess hazard depends on age |
| **Hakulinen** | 1982 | Same, with the expected survival of patients removed at their potential censoring time | The excess hazard depends on age |
| **Pohar-Perme** | 2012 | Net survival, consistently | Never, under the assumptions of the method |

## Why Pohar-Perme
Over time, older patients die of other causes faster, so those still at risk are younger. If the disease is also less deadly in the young, the classical estimators see an excess hazard that falls only because the old have gone, and overestimate net survival. Pohar-Perme weights each patient by the **inverse of their expected survival**: a patient whom the population table expected to survive with probability 0.5 counts twice, standing in for a similar patient who died of other causes. The weighted cohort keeps the age mix of the original one, so the estimate is the net survival of the whole cohort.

## The Cost
The weights grow with follow-up, especially for the old, so the variance of Pohar-Perme grows too. Late estimates rest on few, heavily weighted patients; the 95% band shows it.

## In the Panel
The **Estimator** input sets the estimator of the Net Survival and Crude Mortality tabs; the Log-Rank Test always uses Pohar-Perme. **Four Estimators** compares them at 5 years.

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Crude Mortality](crude-mortality.md)
