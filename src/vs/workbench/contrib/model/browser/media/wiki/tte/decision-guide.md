# Decision Guide

| Question | Data | Method | Why |
|---|---|---|---|
| What share is still event-free over time? | Times and event indicator | **Kaplan-Meier** | No assumption on the shape of survival |
| How does the risk accumulate? Is a Weibull plausible? | Times and event indicator | **Nelson-Aalen** | Cumulative hazard; log H against log t is straight for a Weibull |
| How likely is each kind of event? | Times and cause codes 1, 2, ... | **Aalen-Johansen** | Competing risks: 1 minus Kaplan-Meier would overstate each cause |
| Do two or more groups survive differently? | Times, events, a group | **Log-Rank** (Compare) | Tests equal survival without a model |
| How do covariates change the risk? | Times, events, covariates | **Cox PH** | Hazard ratios, no baseline distribution needed |
| How do covariates change the time? Need predicted times? | Times, events, covariates | **AFT** | Time ratios and a full distribution of times |

## Decision Flow

1. **Describing, or explaining?** To describe survival, use Kaplan-Meier; to explain it with covariates, go to step 3.
2. **Several kinds of event?** Use Aalen-Johansen for the incidence of each cause.
3. **Start with Cox PH**, and run the Proportional Hazards Check.
4. **If proportional hazards fails**, or you need predicted times or extrapolation beyond follow-up, use AFT.
5. **Choosing the AFT distribution:** look at the Cumulative Hazard plot (a straight line suggests Weibull), then fit several and compare by AIC. The Generalised Gamma contains the Weibull, the Exponential and the Gamma, and approaches the Log-Normal, so it shows which of them the data support.

## Rules of Thumb
- **Look at the censoring first**: heavy or early censoring limits every method.
- **Prefer the simplest distribution** within about 2 AIC of the best.
- **Report absolute measures too**: survival at a horizon or the RMST, not only hazard or time ratios.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
