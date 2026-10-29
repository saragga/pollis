# Distance-Based

The distance-based strategies of DataSplits.jl are **sample-selection** methods from chemometrics. Instead of choosing the training set at random, which follows the density of the data, they choose observations that **cover** the feature space, the response range, or both. This is useful when only some samples can be measured or used for calibration, and the training set must span the domain.

## Training-Set Design, Not Performance Estimation
These strategies put the extreme and isolated observations in the training set, and leave the test set inside the region it covers. The test set is therefore **not a random sample**, and its score is not an estimate of prospective performance: studies comparing it with large blind test sets have found it pessimistic with small training sets and optimistic with large ones. To estimate performance, hold out evaluation data first, then apply the selection to the training part only (inside each fold, if resampling).

## Kennard-Stone
**KennardStoneSplit** starts from the two observations farthest apart, then repeatedly adds the observation whose distance to its nearest selected observation is largest (the **maximin** criterion), until the training set is full. It is deterministic and uses only the features.

## SPXY
**SPXYSplit** applies Kennard-Stone to a joint distance: the feature distance and the response distance, each divided by its maximum, added. The training set then covers the range of the response as well as the features. It needs the response for all candidates, so it cannot choose which samples to measure when measuring is the expensive step.

## MDKS
**MDKSSplit** is like SPXY, but measures feature distances by the **Mahalanobis** distance, which accounts for the scale and correlation of the features. It needs a stable covariance estimate; with many correlated features and few samples, reduce the dimension first.

## OptiSim and the Dissimilarity Family
**OptiSimSplit** draws a random subsample of candidates at each step and adds the one most dissimilar to the selected set: faster than Kennard-Stone, at some cost in coverage. **MinDissimilaritySplit** (a subsample of one) is the fastest greedy choice; **MaxDissimilaritySplit** (all candidates) gives the widest spread and is the slowest.

## Lazy Variants
The full strategies store the n by n distance matrix. **LazyKennardStoneSplit** and **LazyOptiSimSplit** recompute distances as needed, using memory in proportion to n but running several times slower: use them only when the matrix does not fit in memory.

## Scaling
All these strategies depend on the distance: standardise the features first, or the features with the largest variance decide the selection.

## See Also
- [Overview](overview.md) · [Cross-Validation](cross-validation.md) · [Decision Guide](decision-guide.md)
