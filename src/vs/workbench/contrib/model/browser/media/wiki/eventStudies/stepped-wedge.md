# Event Studies — Stepped Wedge

## What a Stepped-Wedge Trial Is
In a stepped-wedge cluster randomized trial, clusters such as clinics all start untreated and cross over to treatment at randomized times, until all are treated. The design suits a treatment that cannot be withdrawn or rolled out at once. The usual analysis is the mixed model of [Hussey and Hughes (2007)](#ref-HH2007a), with fixed effects for time and a random effect for each cluster. A stepped-wedge study in Pollis is fitted by MixedModels.jl, and needs a **Treatment Indicator** rather than First Treated.

## Choosing the Effect in a Stepped-Wedge Analysis

| Effect | Meaning |
|---|---|
| Immediate Treatment (IT) | One effect at every exposure time |
| Exposure Time Indicators (ETI) | An effect at each exposure time |
| Heterogeneity by Exposure Time (TEH) | A random effect at each exposure time, about a mean effect |

The simple IT model can go badly wrong when the effect changes with time since crossing over: [Kenny, Voldal, Xia, Heagerty and Hughes (2022)](#ref-KVXHH...2022a) show that its estimate may be far from any average of the true effects, even converging to the wrong value. Unless the effect is known to be immediate and constant, a model of exposure time is the safer choice.

## Choosing the Estimand and Outcome Type of a Stepped-Wedge Study
**Estimand** is either **Average over Exposure Times** (TATE), with From and To, or **At One Exposure Time** (PTE), with At. **Outcome Type** is **Continuous** (Gaussian) or **Binary or Counts** (Binomial), the latter with **Trials** naming the column of trials for counts. **Individual** names the column of individuals when the table has a row per individual, unit and time. The results count exposure time 1 as the first time treated.

## When a Stepped-Wedge Design Beats a Parallel Trial
Treatment in a stepped wedge is confounded with any underlying trend over time, because later periods hold more treated clusters. [Hemming, Haines, Chilton, Girling and Lilford (2015)](#ref-HHCGL2015a) compare the design with a parallel cluster trial: the parallel design is better when the intra-cluster correlation is small, and the stepped wedge more powerful when cluster effects are substantial or clusters are large. The time effects in the model of a stepped-wedge study are there because of that confounding, and leaving them out removes the protection against it.

## References

<a id="ref-HHCGL2015a"></a>Hemming, K., Haines, T. P., Chilton, P. J., Girling, A. J. and Lilford, R. J. (2015). The stepped wedge cluster randomised trial: rationale, design, analysis, and reporting. *BMJ* 350, h391. [doi:10.1136/bmj.h391](https://doi.org/10.1136/bmj.h391)

<a id="ref-HH2007a"></a>Hussey, M. A. and Hughes, J. P. (2007). Design and analysis of stepped wedge cluster randomized trials. *Contemporary Clinical Trials* 28(2), 182–191. [doi:10.1016/j.cct.2006.05.007](https://doi.org/10.1016/j.cct.2006.05.007)

<a id="ref-KVXHH...2022a"></a>Kenny, A., Voldal, E. C., Xia, F., Heagerty, P. J. and Hughes, J. P. (2022). Analysis of stepped wedge cluster randomized trials in the presence of a time-varying treatment effect. *Statistics in Medicine* 41(22), 4311–4339. [doi:10.1002/sim.9511](https://doi.org/10.1002/sim.9511)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Market Event Studies](market-event-studies.md) · [Panel Event Studies](panel-event-studies.md) · [FOMC Releases](fomc-releases.md)
