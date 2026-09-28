# Diagnostics

Outlier scores have no ground truth, so diagnostics focus on **stability** and **separation**.

## Score Distribution
Plot a histogram of the scores. A clear gap between the bulk and a thin right tail means the flagged points really stand apart. A smooth tail with no gap means the cut-off is arbitrary: report a ranking, not a verdict.

## Sensitivity to k
Refit with several values of `k` and compare the flagged sets (the **k Sensitivity** action reports their Jaccard overlap). Genuine outliers stay flagged across a range of `k`; points that come and go are borderline.

- **Small k** reacts to local noise and can miss small anomaly clusters.
- **Large k** smooths over local structure and blurs clusters of different density.

## Agreement Between Detectors
Run KNN, LOF, COF and ABOD on the same data (**Compare Detectors**). Points flagged by most detectors are the most credible. Low rank correlation between detectors means the data has structure (clusters, varying density) that the simpler ones miss.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Score histogram | Gap before the tail | Smooth tail, no gap |
| Varying k | Same points flagged | Flags change a lot |
| Other detectors | Majority agree | Little overlap |
| Top outliers | Explainable by one or two features | No feature stands out |

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md)
