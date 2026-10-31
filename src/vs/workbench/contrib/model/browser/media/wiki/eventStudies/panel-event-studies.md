# Event Studies — Panel Event Studies

## What a Panel Event Study Needs as Input
**Table** is a CSV file of units over time, with a header and three columns or more, copied into the study's folder as `panel.csv`. Times are whole numbers. **Columns** names the Unit, Time and Outcome, and units also serve as clusters. **Treated** is either a Treatment Indicator or First Treated, the time each unit was first treated, missing or 0 for those never treated. **Event Times** sets the Leads and Lags; the leads make the test of pre-trends.

## Why Two-Way Fixed Effects Can Mislead With Staggered Treatment
A regression with unit and time effects, run on units treated at different times, is a weighted average of comparisons, and some of them use already treated units as controls ([Goodman-Bacon (2021)](#ref-Goo2021a)). With effects that change over time, those comparisons bias the result. In event-study form, the coefficient at one event time also takes in effects from other event times when effects differ between cohorts ([Sun and Abraham (2021)](#ref-SA2021a)), so even apparent pre-trends may come from later effects.

## Sun and Abraham and Callaway and Sant'Anna

| | Sun and Abraham | Callaway and Sant'Anna |
|---|---|---|
| Builds on | Each cohort's effect at each event time | Group-time average treatment effects |
| Combines by | Cohort shares | Aggregating to event time |
| Controls | Never or last treated | **Auto**, **Never Treated**, **Not Yet Treated**, **Treated Last** |
| Reference | [Sun and Abraham (2021)](#ref-SA2021a) | [Callaway and Sant'Anna (2021)](#ref-CS2021a) |

Callaway and Sant'Anna's page options are **Method**, namely Doubly Robust, Inverse Probability Weighting or Outcome Regression; and **Intervals**, Normal or Student's t with clusters less one degree of freedom.

## Reading the Results of a Panel Event Study
Results give effects by event time with 95% intervals, with 0 the first time treated. Standard errors are clustered by unit, a line reports the test of pre-trends, and **Averages** sum up the effect after treatment. Units treated from the first time are left out, as they have no time before treatment to compare with.

## Other Estimators and Syntheses for Staggered Treatment
Panel Event Studies offers the estimators of Sun and Abraham and of Callaway and Sant'Anna, and the literature holds others worth knowing. [de Chaisemartin and D'Haultfœuille (2020)](#ref-CD2020a) show that the two-way fixed effects estimator averages effects with weights that can be negative. [Borusyak, Jaravel and Spiess (2024)](#ref-BJS2024a) propose an imputation estimator, efficient under their assumptions, which predicts the untreated outcome of each treated unit. [Roth, Sant'Anna, Bilinski and Poe (2023)](#ref-RSBP2023a) synthesise this literature around three ways of relaxing the classic design.

## What a Test of Pre-Trends Does and Does Not Show in a Panel Event Study
Flat estimates before treatment are reassuring, but less so than they look. [Roth (2022)](#ref-Rot2022a) shows that tests of pre-trends can have low power, and that keeping only the studies that pass them distorts later inference. [Rambachan and Roth (2023)](#ref-RR2023a) propose instead to restrict how far parallel trends may fail after treatment relative to the failures seen before it, and to report how the conclusions change with that restriction. Reading the results of a panel event study means asking what size of violation the pre-treatment estimates could have missed.

## Why Few Clusters Weaken the Bands of a Panel Event Study
Standard errors clustered by unit rest on having many clusters. [Cameron, Gelbach and Miller (2008)](#ref-CGM2008a) find that with five to thirty clusters the usual tests reject too often, and that a cluster bootstrap-t brings a rejection rate of 10% down to the nominal 5%. A panel of a few states or regions should therefore read its bands with care, and pay more attention to the size of the effects than to whether a band excludes zero.

## References

<a id="ref-BJS2024a"></a>Borusyak, K., Jaravel, X. and Spiess, J. (2024). Revisiting event-study designs: robust and efficient estimation. *Review of Economic Studies* 91(6), 3253–3285. [doi:10.1093/restud/rdae007](https://doi.org/10.1093/restud/rdae007)

<a id="ref-CS2021a"></a>Callaway, B. and Sant'Anna, P. H. C. (2021). Difference-in-differences with multiple time periods. *Journal of Econometrics* 225(2), 200–230. [doi:10.1016/j.jeconom.2020.12.001](https://doi.org/10.1016/j.jeconom.2020.12.001)

<a id="ref-CGM2008a"></a>Cameron, A. C., Gelbach, J. B. and Miller, D. L. (2008). Bootstrap-based improvements for inference with clustered errors. *Review of Economics and Statistics* 90(3), 414–427. [doi:10.1162/rest.90.3.414](https://doi.org/10.1162/rest.90.3.414)

<a id="ref-CD2020a"></a>de Chaisemartin, C. and D'Haultfœuille, X. (2020). Two-way fixed effects estimators with heterogeneous treatment effects. *American Economic Review* 110(9), 2964–2996. [doi:10.1257/aer.20181169](https://doi.org/10.1257/aer.20181169)

<a id="ref-Goo2021a"></a>Goodman-Bacon, A. (2021). Difference-in-differences with variation in treatment timing. *Journal of Econometrics* 225(2), 254–277. [doi:10.1016/j.jeconom.2021.03.014](https://doi.org/10.1016/j.jeconom.2021.03.014)

<a id="ref-RR2023a"></a>Rambachan, A. and Roth, J. (2023). A more credible approach to parallel trends. *Review of Economic Studies* 90(5), 2555–2591. [doi:10.1093/restud/rdad018](https://doi.org/10.1093/restud/rdad018)

<a id="ref-Rot2022a"></a>Roth, J. (2022). Pretest with caution: event-study estimates after testing for parallel trends. *American Economic Review: Insights* 4(3), 305–322. [doi:10.1257/aeri.20210236](https://doi.org/10.1257/aeri.20210236)

<a id="ref-RSBP2023a"></a>Roth, J., Sant'Anna, P. H. C., Bilinski, A. and Poe, J. (2023). What's trending in difference-in-differences? A synthesis of the recent econometrics literature. *Journal of Econometrics* 235(2), 2218–2244. [doi:10.1016/j.jeconom.2023.03.008](https://doi.org/10.1016/j.jeconom.2023.03.008)

<a id="ref-SA2021a"></a>Sun, L. and Abraham, S. (2021). Estimating dynamic treatment effects in event studies with heterogeneous treatment effects. *Journal of Econometrics* 225(2), 175–199. [doi:10.1016/j.jeconom.2020.09.006](https://doi.org/10.1016/j.jeconom.2020.09.006)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Market Event Studies](market-event-studies.md) · [Stepped Wedge](stepped-wedge.md) · [FOMC Releases](fomc-releases.md)
