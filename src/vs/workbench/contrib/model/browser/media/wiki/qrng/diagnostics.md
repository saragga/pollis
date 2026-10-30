# Diagnostics

## Points Against Pseudo-Random
**Points Against Pseudo-Random** plots the first two dimensions of the sequence beside the same number of pseudo-random points. The pseudo-random points show clusters and gaps; a low-discrepancy sequence fills the square evenly, without large empty regions. Grid and lattice-like patterns are expected for Kronecker and Golden.

## Order of Filling
**Order of Filling** colours the points by their index. In a good sequence the early points already cover the whole square and later points fill the gaps between them, so any prefix is useful. Grid fills row by row, which is why it is not a sequence in this sense.

## L2-Star Discrepancy
**L2-Star Discrepancy** computes Warnock's formula for the L2-star discrepancy, the root mean square, over all boxes anchored at the origin, of the gap between the share of points in the box and its volume. It is printed for the sequence and for pseudo-random points of the same size. Lower is better; a low-discrepancy sequence should be several times below pseudo-random, and further below as n grows.

## One-Dimensional Projections
**One-Dimensional Projections** draws a 16-bin histogram of each dimension. Every sequence here should give nearly flat histograms: Latin Hypercube exactly flat at its n slices, Sobol exactly flat at a power of 2. Uneven projections in a high dimension of Halton signal the correlation of large prime bases.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Scatter | Even cover | Gaps, stripes |
| Order of filling | Early points spread out | Fills by region |
| L2-star | Well below pseudo-random | Close to pseudo-random |
| Projections | Flat | Uneven in high dimensions |
| n | Balanced for the sequence | Between powers of 2 for Sobol |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
