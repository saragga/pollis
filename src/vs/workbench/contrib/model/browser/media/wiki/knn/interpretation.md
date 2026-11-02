# Reading Nearest-Neighbour Results

Results here are lists of cases and their distances, not coefficients. Reading them means asking how far away the neighbours are, how much they agree and whether the same result would survive small changes.

## Distances are in standard deviations

`dists` and **r** refer to the standardised data. A distance of 1 under Euclidean means one standard deviation in total, spread across the features.

The default gives a sense of scale. For `rand(2, 200)` each feature has standard deviation of about 0.289, so five neighbours of a central query need about π r² × 200 = 5 in original units, r ≈ 0.089, or about 0.31 standard deviations. Distances grow with dimension, since more features add more terms, so no single value counts as close everywhere. Judge a distance against the **k-Distance Curve** for your data.

## How many points does a radius hold?

**Range Search** results depend on **Metric** as well as **r**. For a central query in the default data, r = 1 in standard deviations covers a region of shape and area that vary with the metric. The expected number of points follows by hand, with one square standard deviation worth 200 × 0.0833 ≈ 16.7 points:

| Metric | Area in squared standard deviations | Points expected, of 200 |
|---|---|---|
| Manhattan | 2 | About 33 |
| Euclidean | π | About 52 |
| Chebyshev | 4 | About 67 |

The same number therefore means different things across metrics. Change **r** along with **Metric**, and use the count as a check on the setting.

## Votes and weighted means

A classification vote from **kNN Classification** can be read as a rough probability: 4 of 5 neighbours in a class suggests 0.8, with a high uncertainty at such a small k. A 3 to 2 split is little better than a coin toss, even though the output shows one label.

**kNN Regression** weights each neighbour by the inverse of its distance. With values 10 and 40 at distances 1 and 2, the weights are 1 and 0.5, and the prediction is (10 + 20) / 1.5 = 20. Weighting by distance has a long history in the nearest-neighbour rule ([Dudani (1976)](#ref-Dud1976a)). A neighbour at nearly zero distance takes almost all the weight, which makes the prediction close to that one case's value.

## The evidence behind one prediction

**Nearest Examples** and **Nearest Training Series** show exactly which cases produced an answer. Read them as you would read precedents. Neighbours that look truly like the query, sharing a label, give a well-grounded answer. Neighbours with mixed labels, or that are far away, show a weak answer even if a label was still returned.

A prediction can then be challenged on specifics, and data errors become visible: one mislabelled neighbour at k = 1 changes the answer directly. Agreement between the predicted class and the true class on one case proves little, so read several, especially the wrong ones.

## Reading a warping path

**Warping Path** draws a test series, its nearest training series and the values that DTW matches. Parallel lines mean a nearly direct match, while lines fanning out show time being stretched at that point.

A small case shows the gain. With a = (0, 0, 1, 0) and b = (0, 1, 0, 0), the squared Euclidean distance is 2, while DTW with a window of 1 matches the peaks and gets a cost of 0. Warped matches that cross most of the window suggest that the window limits the alignment. Look at the plot critically too: warping can make different shapes look similar by stretching a small feature across much of the other series.

## Test error against the default rate

**Euclidean vs DTW** reports test error next to the default rate, the error from always choosing the largest class. With classes split 70 and 30, that rate is 0.30, and a test error of about 0.30 means no real skill, however good it looks by itself.

Differences between Euclidean and DTW rows should be judged against the test set's size: with 100 test series, one case equals 0.01, so a gap of 0.02 is two series. The archive reports this classifier as a baseline for time-series work. A large published comparison found only some of the newer classifiers significantly more accurate than this benchmark ([Bagnall, Lines, Bostrom, Large and Keogh (2017)](#ref-BLBLK2017a)).

## References

<a id="ref-BLBLK2017a"></a>Bagnall, A., Lines, J., Bostrom, A., Large, J., & Keogh, E. (2017). The Great Time Series Classification Bake Off: A Review and Experimental Evaluation of Recent Algorithmic Advances. *Data Mining and Knowledge Discovery* 31(3), 606-660. [doi:10.1007/s10618-016-0483-9](https://doi.org/10.1007/s10618-016-0483-9)

<a id="ref-Dud1976a"></a>Dudani, S. A. (1976). The Distance-Weighted k-Nearest-Neighbor Rule. *IEEE Transactions on Systems, Man, and Cybernetics* SMC-6(4), 325-327. [doi:10.1109/TSMC.1976.5408784](https://doi.org/10.1109/TSMC.1976.5408784)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
