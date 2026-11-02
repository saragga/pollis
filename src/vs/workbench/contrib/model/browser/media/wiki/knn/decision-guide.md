# Choosing a Nearest-Neighbour Setup

The main choices are the kind of question, the distance and the index. A sensible default exists for each, with a clear sign of when to move away from it.

## Quick choices by situation

| Situation | Tab or setting | Reason |
|---|---|---|
| A fixed number of neighbours is needed | **kNN Search** | Always returns k points |
| A meaningful distance threshold exists | **Range Search** | Returns all points within r, however many |
| Each item is a time series | **DTW Classification** | Compares whole shapes |
| Low dimensions, up to about 20 | KDTree | Fast pruning on coordinates |
| Higher dimensions or a non-Minkowski metric | BallTree | Prunes with the triangle inequality alone |
| Few points or many dimensions | BruteTree | No index overhead |

## k or radius?

**kNN Search** adapts to density. In crowded regions the neighbours are near, and in empty regions they are far, but k of them always come back, however poor. That suits prediction, where every query needs an answer.

**Range Search** holds a fixed scale, so the count varies, and an empty answer is itself informative. That suits questions with a natural threshold: everything within a set distance, or density estimates for clustering. Without a natural threshold, read one off the **k-Distance Curve**. For **DTW Classification** the code uses one neighbour, the archive's baseline, so the tab offers no k to tune.

## Which metric?

Euclidean is the safe default. It suits features that vary together in a roughly round cloud after standardising, and it penalises one large difference more than several small ones.

Manhattan treats differences additively, so a single outlying feature has less influence. That can help with many features or with noisy ones. Chebyshev looks only at the largest difference, which suits a rule where any single feature out of tolerance counts as far. **p** moves smoothly among them. Compare with the leave-one-out score from **kNN Classification** or **kNN Regression**, and accept a change only if the gain is clear and not one small step.

## Choosing k

Small k follows the data closely and is sensitive to noise, whereas large k is smoother and can blur real boundaries. A common starting point is the square root of n, about 14 for 200 points, then checking the leave-one-out curve around it.

**kNN Classification** tries odd values from 1 to 27, which avoids ties between two classes, though more classes can still tie. **kNN Regression** tries 1 to 30. Both need at least 30 or 31 points to run. Prefer a larger k if scores are close, since it is more stable, and accept a k at the end of the range only after extending the range.

## Which warping window?

**Warping window** has three modes. Learned follows the archive's baseline: windows from 0 to **Largest window (%)** are ranked by leave-one-out error on the training set. It suits most cases, but costs n(n − 1) / 2 distances per window, about 4,950 for 100 series.

Fixed suits domain knowledge about how far events may shift, and it also suits training sets too small to rank windows. Unconstrained allows any alignment and costs L² cells per pair, against about L(2r + 1) with a window: 9,216 against 2,016 at L = 96, r = 10. It can also match very unlike shapes. The narrow band is an old device, going back to speech recognition ([Sakoe and Chiba (1978)](#ref-SC1978a)), and it often improves accuracy as well as speed.

## When to leave nearest neighbours

Nearest neighbours suit a modest number of informative features, plenty of data and a need to justify answers with cases. Memory grows with the data, and so does the time to answer without an effective index.

Many irrelevant features or very high dimension favour a model that selects or combines them, such as gradient boosting or a regularised regression. Approximate search libraries extend neighbours to embeddings and very large collections, at the price of exactness. For time series, 1-NN with DTW is a strong baseline, and a more elaborate classifier needs to beat it clearly to justify the extra cost.

## References

<a id="ref-SC1978a"></a>Sakoe, H., & Chiba, S. (1978). Dynamic Programming Algorithm Optimization for Spoken Word Recognition. *IEEE Transactions on Acoustics, Speech, and Signal Processing* 26(1), 43-49. [doi:10.1109/TASSP.1978.1163055](https://doi.org/10.1109/TASSP.1978.1163055)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
