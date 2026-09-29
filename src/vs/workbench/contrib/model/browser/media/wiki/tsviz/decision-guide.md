# Decision Guide

Which plot should you reach for? The choice depends on what you are trying to see.

| Goal | Plot | Why |
|---|---|---|
| Inspect a single series over time | **Line plot** ([Time Series Plot](tsplot.md)) | Reveals trend, seasonality, breaks, and outliers at a glance |
| Compare several series | **Multi-series overlay** ([Time Series Plot](tsplot.md)) | Shows co-movement, lead–lag, and divergence on shared axes |
| Show a forecast with uncertainty | **Ribbon plot** ([Ribbon Plot](ribbon.md)) | Pairs a point estimate with a shaded confidence/prediction band |

## Decision Flow

1. **One series or many?**
   - One → start with a line plot.
   - Many → use an overlay; normalise if scales differ widely.

2. **Are you presenting a forecast or estimate with uncertainty?**
   - Yes → use a ribbon to draw the interval around the central line.
   - No → a plain line plot is clearer; avoid bands that imply uncertainty you are not quantifying.

3. **Is the data irregularly spaced or full of gaps?**
   - Keep `missing` values as `missing` so breaks render honestly.
   - Avoid connecting distant points with a single segment that implies a smooth path.

## Rules of Thumb

- **Always plot raw data first**, before any transform or model.
- **Use a ribbon only when the band has a defined meaning** (e.g. a 95% interval). A decorative band misleads.
- **Limit overlays** to a handful of series; beyond that, consider small multiples (faceting) instead of one crowded axis.
- **Label the time axis** with real dates where available — integer indices hide seasonality.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
