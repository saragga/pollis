# Diagnostics

What to look for, and what it implies.

## Mosaic
- **Unequal column widths** — the first variable's marginal is uneven.
- **Row splits that differ across columns** — the two variables are **associated** (confirm with a chi-squared test, see Diagnose → Chi-Squared Test).
- **Identical row splits** — approximate **independence**.

## Nightingale
- **One dominant sector** — be careful: radius-encoded area exaggerates large values (area grows with the square of radius).

## Waterfall
- **A bar that crosses zero** — a step that flips the cumulative sign.
- **Final bar not matching the running total** — a data or sign error in the deltas.

## Treemap
- **One tile dominating** — a highly concentrated distribution (low diversity; see Interpret → Diversity).
- **Slivers** — categories too small to read; bucket them.

## Sankey
- **Node where inflow ≠ outflow** — broken conservation; usually a data error.
- **Crossing bands** — reorder nodes to reduce clutter.

## Quick Checklist

| Plot | Cue | Implication |
|---|---|---|
| Mosaic | Differing row splits | Association between variables |
| Nightingale | One huge sector | Area over-states magnitude |
| Waterfall | End ≠ running total | Sign/data error |
| Sankey | Inflow ≠ outflow | Conservation broken |
