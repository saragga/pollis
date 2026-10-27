# Assumptions

## All Methods
- **Non-informative censoring.** Censored subjects have the same future risk as those still followed. If subjects drop out because they are getting worse (or better), every estimate is biased.
- **A clear time origin.** Time starts at the same kind of moment for everyone: diagnosis, randomisation, the loan's start date.
- **Independent subjects.** One row per subject, one event at most. Repeated events or clusters need other models.

## Kaplan-Meier and Nelson-Aalen
No assumption on the shape of survival. The estimates are reliable only while enough subjects are at risk: the tail of the curve, where few remain, is uncertain.

## Aalen-Johansen
The causes are **mutually exclusive**: the first event of any cause ends follow-up. Censoring is non-informative for every cause.

## Cox PH
- **Proportional hazards**: the ratio of the hazards of two subjects is the same at all times. A treatment that helps early and harms later breaks it.
- **Log-linear effects**: each covariate multiplies the hazard by a fixed factor per unit.

## AFT
- **A distribution for the times**: the log time is a linear function of the covariates plus an error from the chosen distribution (extreme value for Weibull and Exponential, normal for Log-Normal, log-gamma for Gamma and Generalised Gamma).
- **Accelerated time**: a covariate multiplies the whole time scale by the same factor. Only the Weibull and the Exponential are both AFT and proportional hazards models.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
