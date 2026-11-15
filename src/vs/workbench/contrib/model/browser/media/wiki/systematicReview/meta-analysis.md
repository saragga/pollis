# Systematic Review: Reading the Meta-Analysis

The fixed and random effects estimates of Systematic Review, heterogeneity and I², the forest and funnel plots, Egger's test, and the flow of records.

## What Does the Meta-Analysis of Systematic Review Compute?

**Run the Meta-Analysis** writes `effects.csv`, the effect and standard error of each study kept, and `meta.jl`, in the review's folder, and runs `meta.jl` in a new Julia process from the Julia REPL. It computes the fixed effect estimate, in which each study weighs by the inverse of its variance, and the random effects estimate of [DerSimonian and Laird (1986)](#ref-DL1986a), with the between-study variance, Cochran's Q and its p-value, I² and H² as defined by [Higgins and Thompson (2002)](#ref-HT2002a), and Egger's regression test of the funnel plot of [Egger, Davey Smith, Schneider and Minder (1997)](#ref-EDSM1997a), each estimate with its 95% confidence interval. It writes them, with each study's weights, to `results.json`, from which the page draws the figures and the plots. `meta.jl` can be read and run again by itself.

## Fixed Effect or Random Effects in Systematic Review?

The fixed effect estimate of Systematic Review assumes that every study estimates the same effect, and that the studies differ only by chance. The random effects estimate of [DerSimonian and Laird (1986)](#ref-DL1986a) lets the effect differ from study to study, around a mean, and incorporates that heterogeneity into the estimate of the mean: it estimates the between-study variance, adds it to each study's own variance, and weighs each study by the inverse of the sum. Small studies then weigh relatively more than in the fixed effect estimate, and the interval of the mean is wider. When the between-study variance is estimated as 0, the two estimates are the same. The page shows the random effects estimate first.

## What Do Q and I² Say About Heterogeneity?

Cochran's Q, in the Meta-Analysis step of Systematic Review, tests whether the studies' effects differ by more than chance, and its p-value is small when they do. [Higgins and Thompson (2002)](#ref-HT2002a) note that the test depends on the number of studies in the meta-analysis, and propose measures of the impact of heterogeneity that do not, among them I², the proportion of the total variation in the studies' estimates that is due to heterogeneity rather than chance. They recommend presenting I², or H, in a meta-analysis in preference to the test. The page shows I² as a percentage, and the between-study variance of the random effects estimate on the scale of the effect measure.

## How Do I Read the Forest Plot of Systematic Review?

The forest plot of Systematic Review has a row for each study, named by its first author and year, with its effect as a square, sized by its weight in the random effects estimate, and its 95% confidence interval as a line. Its effect, interval and weight are written at the right. Below, two diamonds show the random effects and the fixed effect estimates, each as wide as its interval. A dashed vertical line marks 0, no effect on the scale of the measure: for a log odds ratio or a log risk ratio, an odds or risk ratio of 1. For a ratio or a correlation, the figures above the plot also give the pooled estimates on their own scale.

## What Does the Funnel Plot and Egger's Test Show?

The funnel plot of Systematic Review places each study by its effect, across, and its standard error, down, the most precise studies at the top. Without bias, the studies scatter around the fixed effect estimate, the vertical line, within the dashed funnel, wider at the bottom where studies are less precise. [Egger, Davey Smith, Schneider and Minder (1997)](#ref-EDSM1997a) measure the funnel's asymmetry by the intercept of the regression of each study's effect divided by its standard error on its precision, and found asymmetry in 38% of the meta-analyses they examined in leading general medicine journals. They caution that the test's capacity to detect bias is limited when a meta-analysis has few small trials. The page gives the test's p-value from three studies, and notes when there are fewer than ten.

## What Is the Flow of Records of Systematic Review?

The Flow of Records, at the end of the Meta-Analysis step of Systematic Review, counts the records at each stage, as the flow diagram of the PRISMA 2020 statement of [Page and 25 coauthors (2021)](#ref-PMBBH...2021a) has them: the records identified in each source, the duplicates removed, the records screened and those excluded on title and abstract, the studies assessed for eligibility, with a full text or with the abstract only, those excluded on reading, those eligible with no effect to pool, and the studies in the meta-analysis. Each count appears once the stage it follows is settled. Its figures, with the reasons in the screeners' and extractors' files, are those a review reports.

## References

<a id="ref-DL1986a"></a>DerSimonian, R. and Laird, N. (1986). Meta-Analysis in Clinical Trials. *Controlled Clinical Trials* 7(3), 177–188. [doi:10.1016/0197-2456(86)90046-2](https://doi.org/10.1016/0197-2456(86)90046-2)

<a id="ref-EDSM1997a"></a>Egger, M., Davey Smith, G., Schneider, M. and Minder, C. (1997). Bias in Meta-Analysis Detected by a Simple, Graphical Test. *BMJ* 315(7109), 629–634. [doi:10.1136/bmj.315.7109.629](https://doi.org/10.1136/bmj.315.7109.629)

<a id="ref-HT2002a"></a>Higgins, J. P. T. and Thompson, S. G. (2002). Quantifying Heterogeneity in a Meta-Analysis. *Statistics in Medicine* 21(11), 1539–1558. [doi:10.1002/sim.1186](https://doi.org/10.1002/sim.1186)

<a id="ref-PMBBH...2021a"></a>Page, M. J. and 25 coauthors (2021). The PRISMA 2020 Statement: An Updated Guideline for Reporting Systematic Reviews. *BMJ* 372, n71. [doi:10.1136/bmj.n71](https://doi.org/10.1136/bmj.n71)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Two Screeners and Their Agreement](screening-agreement.md) · [Double Extraction](double-extraction.md)
