# Assumptions

## Input Form
- **Corner plot** — several numeric columns (commonly MCMC posterior draws).
- **Parallel coordinates** — several numeric columns; a categorical group adds colour.
- **Bubble chart** — three numeric variables (x, y, size) and optionally a fourth (colour).
- **Heatmap** — a 2-D numeric matrix.

## Scale Matters
Parallel coordinates and bubble size are **scale-sensitive**: a variable with a large range dominates unless axes are independently scaled (parallel) or sizes are normalised (bubble). Standardise or normalise before plotting.

## Bubble Size Encoding
Perceived bubble magnitude tracks **area**, not radius. Map the value to area (radius ∝ √value) or readers overstate large values.

## Heatmap Colour Scale
- Use a **diverging** scale (centred at zero) for correlations and signed data.
- Use a **sequential** scale for non-negative magnitudes.
A mismatched scale misleads about sign and midpoint.

## Dimensionality
These plots stay legible to a handful of variables (corner, parallel) or a moderate matrix (heatmap). Beyond that, reduce dimensions first.
