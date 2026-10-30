# Time-to-Event Analysis — Factsheet

**Time-to-event analysis** (survival analysis) models the time until an event, from data where some times are only partly observed: a censored subject was event-free when follow-up ended, so its time is known only to be longer. Ordinary regression on the observed times would treat those as events and understate survival.

| | |
|---|---|
| **Purpose** | Estimate survival over time, compare groups, and relate the timing of events to covariates |
| **Input** | A table with a time column, an event column (0 = censored, 1 = event; 1, 2, ... = causes for Aalen-Johansen) and, for regression, covariates |
| **Core packages** | [Survival.jl](https://github.com/JuliaStats/Survival.jl), [LSurvival.jl](https://github.com/alexpkeil1/LSurvival.jl) |
| **Methods** | Kaplan-Meier, Nelson-Aalen, Aalen-Johansen, Cox PH, AFT |
| **Output** | Survival and cumulative hazard estimates, cumulative incidence per cause, coefficient tables with standard errors and intervals |
| **Key choice** | Non-parametric description or regression; Cox PH (no baseline distribution) or AFT (a chosen distribution) |

## When to Use

- The outcome is a **duration**, and follow-up ends before everyone has had the event.
- You want **survival probabilities** at given times, or the median time to the event.
- You want to know how **covariates change the risk** (Cox) or **the time** (AFT) of the event.

## What It Is Not

Time-to-event methods assume right censoring that is **unrelated to the risk of the event**. They do not fix censoring caused by the outcome itself (subjects leaving because they are getting worse), and a hazard ratio is an association, not a causal effect, unless the design makes it one.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
