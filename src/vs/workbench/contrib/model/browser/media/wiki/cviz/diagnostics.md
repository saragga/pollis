# Diagnostics

What to look for in each plot, and what it implies.

## Scatter
- **Trend / slope** — linear or nonlinear relationship.
- **Spread changing with x** — heteroskedasticity.
- **Clusters** — sub-populations.
- **Isolated points** — outliers or leverage points.

## Histogram
- **Modality** — one peak, or several (mixture)?
- **Skew** — a long tail left or right.
- **Gaps / spikes** — rounding, censoring, or data-entry artefacts.

## Box Plot
- **Median line position** within the box — skew.
- **Box / whisker length** — spread.
- **Points beyond whiskers** — outliers (default: 1.5 × IQR).

## Violin Plot
- **Multiple bulges** — multimodality a box plot would miss.
- **Width at a value** — local density.

## Quick Checklist

| Plot | Key cue | Implication |
|---|---|---|
| Scatter | Funnel shape | Heteroskedasticity |
| Histogram | Two peaks | Mixed populations |
| Box | Off-centre median | Skew |
| Violin | Extra bulge | Hidden mode |
