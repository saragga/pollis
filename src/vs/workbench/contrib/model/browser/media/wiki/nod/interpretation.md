# Interpretation

## Scores Are Relative
A score ranks points within one data set and one detector. KNN scores are distances (in the units of the scaled data); LOF and COF are ratios around 1; ABOD scores are negated angle variances, close to zero for outliers. **Do not compare raw scores across detectors**: convert them to percentile ranks first (the **Normalise Scores** action).

## Choosing the Cut-off
The contamination rate turns scores into flags: with 5% contamination the top 5% are flagged. It is a **modelling choice**, not a property of the data. Report it, and check how the conclusions change when it is halved or doubled.

## Why Is a Point an Outlier?
Proximity scores do not say which feature is responsible. Look at the point's per-feature z-scores (**Feature Deviations**): an outlier driven by one extreme value is a candidate data error; one that is moderate on every feature but unusual in combination is a genuinely rare pattern.

## Outlier Is Not Error
A flagged point is unusual, not necessarily wrong. Before removing anything, ask whether it is a recording mistake, a rare but valid case, or the most interesting observation in the data.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
