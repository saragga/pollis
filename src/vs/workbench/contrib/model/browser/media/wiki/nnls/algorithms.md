# Algorithms

All four algorithms solve the same convex problem and, when A has full column rank, give the same answer up to rounding. They differ in speed, which matters for large A or many right-hand sides.

## Active Sets
At the solution the components split into two sets: the **active** ones, held at zero by the constraint, and the **passive** ones, which are positive and solve ordinary least squares on their columns. If the right split were known, one least-squares solve would finish the job; the algorithms search for it.

| Option | Method | Strategy | Best for |
|---|---|---|---|
| `:nnls` | Lawson and Hanson (1974) | Starts with all components at zero; adds to the passive set, one at a time, the component whose increase would most reduce the residual; steps back when a passive component would turn negative | Small problems; the reference method |
| `:fnnls` | Bro and De Jong (1997) | Lawson and Hanson using the precomputed products A'A and A'b | Many more observations than columns (m much larger than n) |
| `:pivot` | Kim and Park | **Block principal pivoting**: exchanges many components between the sets at once | Large n; the default |
| `:pivot`, variant `:comb` | Kim and Park | Block pivoting for a matrix B, grouping the columns of B that share a passive set so that each group needs one factorisation | Many right-hand sides, as in non-negative matrix factorisation |

## Choosing
- **Start with `:pivot`.** It is usually the fastest and is the package's default.
- **Use `:fnnls`** when A is tall and narrow, but note that A'A squares the condition number of A: with nearly dependent columns it loses accuracy.
- **Use `:comb`** when b is a matrix with many columns.
- **Use `:nnls`** to check another algorithm's answer on a small problem.

`nonneg_lsq` also takes `gram = true` to pass A'A and A'B instead of A and B, and `tol` and `max_iter` to control the stopping rule.

## See Also
- [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md) · [Overview](overview.md)
