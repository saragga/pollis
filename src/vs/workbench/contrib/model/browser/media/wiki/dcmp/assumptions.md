# Assumptions

## Input Form
- **ECDF, QQ** — one numeric sample (QQ also needs a **reference**: a theoretical distribution or a second sample).
- **Marginal** — **two** numeric variables.
- **Correlogram** — several numeric variables.

## Sample Size
- ECDF is reliable even for small samples (it makes no smoothing choice).
- QQ plots are interpretable from moderate samples but their tails are noisy when n is small.
- Density-based panels (marginal KDE, correlogram diagonal) need enough points to be stable.

## Choosing a Reference
A QQ plot or ECDF overlay is only as meaningful as its reference distribution. Standardise the sample (subtract mean, divide by sd) when comparing to a **standard** normal, or fit the distribution's parameters first.

## Independence
Observations are treated as an i.i.d. sample. Autocorrelated (time-series) data violates this; the plots still draw but their interpretation as a distributional check is compromised.

## Continuity
QQ and ECDF assume an underlying continuous variable. Heavily discretised or tied data produces visible steps and staircase artefacts.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
