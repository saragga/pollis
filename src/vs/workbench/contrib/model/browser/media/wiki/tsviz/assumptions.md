# Assumptions

A time series plot is a descriptive visualisation, so it imposes very few formal assumptions. The ones that matter are about the *data* you feed it, not about any underlying statistical model.

## Ordered Time Index

The horizontal axis must be **ordered**. Observations are assumed to be sorted by time. If your data is unsorted, sort it first — plotting unsorted timestamps produces a meaningless zig-zag.

## Regular vs Irregular Spacing

- **Regular spacing** (daily, monthly, quarterly) is assumed by most downstream diagnostics such as autocorrelation. Line plots render correctly regardless.
- **Irregular spacing** (event data, tick data) plots fine, but be cautious: connecting two points far apart in time with a straight line visually implies a smooth transition that the data does not support.

## Handling of Gaps and Missing Values

Missing observations break the continuity assumption. Decide explicitly whether to:

- leave gaps (recommended — `missing` values create a visible break),
- interpolate (introduces information that is not in the data), or
- drop them (distorts the time axis if spacing is regular).

## Comparable Scales for Overlays

When overlaying multiple series on a single axis, they are implicitly assumed to be on **comparable scales**. If they are not, normalise, index to a common base, or use a secondary axis. Otherwise the smaller series collapses to a flat line.

## No Distributional Assumptions

Unlike model fitting, plotting makes **no assumptions** about stationarity, normality, or independence. That is precisely why it comes first — you plot the data to *check* those assumptions before any model relies on them.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
