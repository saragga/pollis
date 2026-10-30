# Overview

The Time-to-Event Analysis panel analyses **time-to-event data**: how long until something happens (death, failure, default, relapse), when some subjects are still event-free at the end of follow-up. Those subjects are **censored**: we know only that their time is longer than what was observed, and every method here uses that partial information instead of dropping it.

## Kaplan-Meier
The non-parametric estimate of the **survival function** S(t), the probability of being event-free beyond time t. At each event time it multiplies the survival so far by the share of those still at risk who did not have the event. From Survival.jl.

## Nelson-Aalen
The non-parametric estimate of the **cumulative hazard** H(t): the sum, over event times, of events divided by the number at risk. Its plot of log H(t) against log t tells whether a Weibull model fits. From Survival.jl.

## Aalen-Johansen
**Competing risks**: when a subject can have one of several kinds of event (death from the disease or from another cause), the cumulative incidence of each cause. With one cause it is 1 minus Kaplan-Meier. From LSurvival.jl.

## Cox PH
**Semi-parametric regression**: covariates multiply the hazard by exp(coefficient), whatever the baseline hazard looks like. The most used survival model. From Survival.jl.

## AFT
**Parametric regression**: covariates stretch or shrink the time to the event by exp(coefficient), for a chosen distribution of the times: Log-Normal, Weibull, Exponential, Gamma or Generalised Gamma. From LSurvival.jl.

## Common Workflow

1. Run the **Censoring Summary**: how many subjects are censored, and when.
2. Plot the **Kaplan-Meier** curve, and compare groups with the **Log-Rank** test.
3. Fit a **Cox PH** model with the covariates, and run the **Proportional Hazards Check**.
4. If the check fails, or you need predicted times, fit **AFT** models and compare their distributions by AIC.
5. Report **Hazard Ratios** (Cox) or time ratios (AFT), and the **Restricted Mean Survival Time**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
