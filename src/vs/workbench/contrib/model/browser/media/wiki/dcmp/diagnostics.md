# Diagnostics

## ECDF
- **Vertical gap** between empirical and theoretical curves — the Kolmogorov–Smirnov distance; large gaps mean poor fit.
- **Systematic shift** left/right — a location difference.
- **Different steepness** — a scale (spread) difference.

## QQ Plot
- **Points on the line** — distributions match.
- **S-shape** — sample is heavier- or lighter-tailed than the reference.
- **Curve (convex/concave)** — skew.
- **Off-line endpoints** — outliers in the tails.

## Marginal Plot
- **Joint cloud shape** — relationship between the variables.
- **Marginal skew / multimodality** — read off the axis histograms.

## Correlogram
- **Tilted clouds off the diagonal** — correlated pairs.
- **Diagonal density shapes** — each variable's marginal.

## Quick Checklist

| Plot | Cue | Implication |
|---|---|---|
| QQ | S-shape | Heavy/light tails |
| QQ | Curvature | Skew |
| ECDF | Horizontal shift | Location difference |
| Correlogram | Tilted panel | Correlated pair |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
