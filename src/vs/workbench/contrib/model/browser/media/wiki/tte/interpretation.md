# Interpretation

## Survival Curves
A Kaplan-Meier value of 0.6 at 12 months means an estimated 60% of subjects are still event-free at 12 months. Tick marks show censored times; the 95% band widens as fewer subjects remain at risk. The **Median and Quartile Survival Times** are the times at which the curve drops to 75%, 50% and 25%; NA means it never drops that far within follow-up.

## Cumulative Hazard
H(t) is the expected number of events per subject up to t if the event could repeat. Its slope is the hazard: a steepening curve means a rising risk.

## Cumulative Incidence
An Aalen-Johansen incidence of 0.3 for a cause at 5 years means 30% of subjects had that cause first by 5 years. The incidences of all causes and the event-free survival add up to 1. With competing risks, 1 minus Kaplan-Meier for one cause (treating the others as censored) overstates its incidence.

## Hazard Ratios (Cox PH)
exp(coefficient) multiplies the hazard per unit increase of the covariate, at every time: 1.5 means a 50% higher event rate, 0.7 a 30% lower one. A hazard ratio is not a ratio of probabilities, and it says nothing directly about how much longer subjects live.

## Time Ratios (AFT)
exp(coefficient) multiplies the time to the event: 1.4 means times 40% longer, so a **positive** AFT coefficient means **longer** survival, the opposite sign to Cox. The log-scale sets how spread out the times are; kappa, for the Generalised Gamma, their shape.

## Restricted Mean Survival Time
The area under the Kaplan-Meier curve up to a horizon: the average event-free time within the follow-up window. A difference of 2 months in RMST is easier to communicate than a hazard ratio, and needs no proportional hazards.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
