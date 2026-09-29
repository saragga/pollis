# Interpretation

## Corner Plot
Each off-diagonal panel is a 2-D marginal; each diagonal is a 1-D marginal. For posteriors, tight diagonal peaks mean well-constrained parameters, and tilted panels mean the data cannot separate two parameters independently. Read it as a map of what the data does and does not pin down.

## Parallel Coordinates
Follow lines across axes. Tight **bundles** are clusters; the order of axes matters because only **adjacent** axes show their relationship clearly — reorder axes to test different pairings. Colour by a known group to see whether the groups separate.

## Bubble Chart
Position encodes two variables, size a third, colour a fourth. Read position first, then check whether **size grows in a direction** (the third variable correlates with position) and whether **colours cluster**. Keep encodings few — four channels is already near the limit of legibility.

## Heatmap
Colour *is* the value: consult the colour bar. On a correlation heatmap, look past the all-ones diagonal to the off-diagonal blocks. Use a diverging palette so that sign (positive vs negative) reads as colour direction and zero as the neutral midpoint.

## Caveat
Multivariate plots are exploratory. Striking patterns warrant a model or test, not a conclusion on their own — and watch for artefacts from scaling and colour choices.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
