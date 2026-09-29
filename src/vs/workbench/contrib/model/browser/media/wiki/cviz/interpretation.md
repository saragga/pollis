# Interpretation

## Scatter
The cloud's **shape** is the message: a tilted ellipse means correlation, a curved band means a nonlinear relationship, a shapeless blob means little association. Read direction (positive/negative), strength (tightness), and form (linear/curved).

## Bar
Compare **heights** across categories. Beware: bars starting above zero exaggerate differences — always anchor the axis at zero for counts and magnitudes.

## Histogram
Read **centre** (where the mass sits), **spread** (how wide), and **shape** (symmetric, skewed, multimodal). Remember the picture depends on bin width — confirm any feature survives a different binning.

## Box vs Violin
A box plot gives robust **summary** statistics; a violin shows the **full shape**. When comparing groups, a box plot answers "which is higher and more spread?", a violin additionally answers "are any of them bimodal?". Use a violin when distribution shape matters, a box when you only need location and spread.

## Caveat
All four describe the *sample*. Apparent features in small samples can be noise. Treat them as hypotheses to confirm with formal tools.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
