# Diagnostics

## Cohort Summary
Patients, deaths, the share censored, the median and maximum follow-up, the age range and the range of diagnosis years. Check that:

- there are **enough deaths**: with few, the late part of the curve rests on a handful of events;
- the **follow-up** reaches the milestones you will report: estimates past the longest follow-up do not exist;
- the **ages and years**, plus the follow-up, lie inside the rate table.

## Negative Excess Hazard
Counts the steps where the patients died **less** than the population, giving a negative excess hazard, and checks whether the net survival curve ever rises. A few negative steps are noise. Many, or a rising curve over a long period, mean the rate table overstates the patients' other-cause mortality: a healthier selected group, or a table from a population with higher mortality. Late after diagnosis, when the disease no longer adds deaths, net survival levels off; a sustained rise is not "cure", it is a mismatch.

## Excess and Expected Hazards
The cumulative excess hazard next to the expected and the observed hazards. The observed hazard should lie above the expected one; the excess hazard usually rises steeply in the first years and flattens.

## Four Estimators
Net survival at 5 years from all four estimators. If Pohar-Perme differs clearly from Ederer II, the excess hazard depends on age, and the older estimators are biased.

## Quick Checklist

| Check | Action | Good sign | Warning sign |
|---|---|---|---|
| Data volume | Cohort Summary | Many deaths, follow-up past the milestones | Few deaths; milestones beyond follow-up |
| Rate-table coverage | Cohort Summary | Ages and years inside the table | Outside it |
| Rate-table fit | Negative Excess Hazard | Few isolated negative steps | Long periods of rising net survival |
| Estimator bias | Four Estimators | Pohar-Perme close to Ederer II | Clear gap |
| Precision | Curves (95% band) | Narrow band | Band widening sharply late on |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Rate Tables](rate-tables.md)
