# Assumptions

## The Additive Hazard
Each patient's hazard is the sum of the population hazard for their age, sex and calendar year, and an excess hazard due to the disease. The two causes act independently: having the disease does not change the risk of dying from other causes, except through the disease itself.

## The Rate Table Fits the Patients
The other-cause mortality of the patients equals that of the general population with the same rate-table covariates. This fails when:

- the patients differ in risk factors that cause other deaths too (smoking for lung cancer, alcohol for liver cancer, deprivation): the excess hazard is overestimated;
- the patients were selected as healthy (by screening, or fit enough for treatment): it is underestimated, sometimes below zero;
- the table is of the wrong country, region or period.

Use the most specific table available, by region or deprivation where it exists. See [Rate Tables](rate-tables.md).

## Censoring
- **Non-informative**: patients lost to follow-up have the same mortality as those who stay. Registries usually censor everyone alive on a common closing date, which satisfies it.
- For **Pohar-Perme**, censoring must also not depend on the population mortality given the covariates; that holds for administrative censoring.

## Units
Time, age and date are in **days**, and the date of diagnosis counts days since year 0, as RateTables.jl expects. Ages and years outside the rate table are not covered.

## The Older Estimators
Ederer I, Ederer II and Hakulinen also assume that the excess hazard does **not depend on the covariates of the rate table**, mainly age. When older patients have a higher excess hazard, as in most cancers, they are biased; Pohar-Perme is not. See [Net Survival Estimators](estimators.md).

## See Also
- [Diagnostics](diagnostics.md) · [Rate Tables](rate-tables.md) · [Net Survival Estimators](estimators.md)
