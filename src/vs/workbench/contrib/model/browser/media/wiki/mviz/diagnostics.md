# Diagnostics

## Corner Plot
- **Tilted off-diagonal clouds** — correlated parameters (and, for MCMC, posterior dependence).
- **Banana / curved shapes** — nonlinear dependence or a poorly identified model.
- **Diagonal densities** — marginal shape; multimodality signals trouble.

## Parallel Coordinates
- **Bundles of parallel lines** — clusters.
- **Crossing X-patterns between two axes** — negative correlation.
- **Lines staying parallel** — positive correlation.

## Bubble Chart
- **Size gradient across the plane** — the third variable tracks position.
- **Colour clusters** — the fourth variable's groups.

## Heatmap
- **Blocks of similar colour** — groups of correlated variables.
- **Strong diagonal** (correlation matrix) — trivially expected (self-correlation = 1).
- **Bright off-diagonal cells** — notable pairwise relationships.

## Quick Checklist

| Plot | Cue | Implication |
|---|---|---|
| Corner | Banana shape | Nonlinear / weak identifiability |
| Parallel | X between axes | Negative correlation |
| Bubble | Size gradient | Third variable structure |
| Heatmap | Colour block | Correlated variable group |
