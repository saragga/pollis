# Interpretation

What a time series plot *tells you* depends on what you are looking at. This page connects common visual patterns to their substantive meaning.

## Reading the Line

- **Slope** — the local rate of change. Steep segments mean fast movement; flat segments mean stability.
- **Curvature** — acceleration or deceleration of the trend.
- **Roughness** — short-term variability. A jagged line has high short-run noise; a smooth line is dominated by its trend.

## Comparing Multiple Series

When series are overlaid, interpretation shifts from *level* to *relationship*:

- **Co-movement** — series that rise and fall together suggest a common driver or correlation.
- **Lead–lag** — one series consistently turning before another hints at a predictive relationship (but not necessarily causation).
- **Divergence** — series that drift apart over time may indicate a structural change in their relationship.

Beware comparing levels directly when scales differ; normalise or index first so the comparison is about *shape*, not magnitude.

## Reading a Ribbon

For a forecast ribbon (see [Ribbon Plot](ribbon.md)):

- The **central line** is the point forecast — your single best estimate.
- The **band width** is the uncertainty. Wider bands mean less confidence.
- Bands almost always **widen as the horizon extends**: the further ahead you forecast, the less certain you are.
- A band that is suspiciously narrow far into the future is a warning sign that the model is overconfident.

## Caveats

A plot describes the *sample*, not the *population*. Apparent patterns can arise by chance, especially in short series. Treat the plot as a generator of hypotheses to be confirmed with formal tools, not as proof.
