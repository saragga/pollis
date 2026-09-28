# Diagnostics

Neural detectors add two sources of doubt to the usual ones: **training randomness** and **overfitting**.

## Seed Stability
Different random initial weights give different scores. Refit with several seeds and compare the rankings (the **Seed Stability** action reports their Spearman correlations). The most anomalous points should stay at the top even if the ordering of normal points changes.

## Score Distribution
A histogram of scores with a separated right tail means the network clearly distinguishes some points. A single smooth hump means it has not learned a useful notion of normal; try more epochs, a smaller latent size or a different architecture.

## Epochs
- **Too few**: the network underfits and reconstructs everything badly; scores barely vary.
- **Too many**: it starts to memorise the anomalies too; their scores drop towards the bulk.
Compare the flagged sets at, say, 25, 50 and 100 epochs.

## Baseline Comparison
Compare against a simple proximity detector (**vs Proximity (LOF)**). If a network cannot beat LOF on your data, prefer LOF: it is faster, deterministic and easier to explain.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Seeds | Top points stable | Rankings change a lot |
| Score histogram | Separated tail | One smooth hump |
| Epochs | Flags stable across a range | Flags drift with training length |
| LOF baseline | Network finds more, or agrees | LOF clearly better |

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md)
