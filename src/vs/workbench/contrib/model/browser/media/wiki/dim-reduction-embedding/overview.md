# Overview

Neighbour embedding builds a low-dimensional picture in which points that are close in the original features tend to stay close. The panel offers two such methods: t-SNE of [van der Maaten and Hinton (2008)](#ref-MH2008a) and UMAP of [McInnes, Healy and Melville (2018)](#ref-MHM2018a).

## What Neighbour Embedding Tries to Preserve

Both methods turn distances into weights on pairs of nearby points, then move points in a low-dimensional layout until the weights there resemble the originals. The objective cares mainly about who is near whom. A long distance in the layout has little effect on the objective, so gaps between groups, the relative size of groups and the shape of a group are weakly constrained. Neither method yields a formula from features to coordinates, and neither produces axes with a meaning of their own.

## How the t-SNE Tab Builds an Embedding

**t-SNE** gives each point a Gaussian over its neighbours, with a width chosen so that the effective number of neighbours equals **Perplexity**. Similarities in the layout follow a Student t distribution with one degree of freedom, whose heavy tails let moderately distant points move apart. The tab starts from a random layout and minimises the Kullback-Leibler divergence with gradient steps for **max_iter** iterations, and the first 250 iterations use exaggerated attractions. Each iteration compares all pairs.

## How the UMAP Tab Builds an Embedding

**UMAP** builds a weighted graph over each point's **n_neighbors** nearest neighbours, found approximately, and starts from a spectral layout of that graph. Stochastic gradient descent then minimises a cross-entropy between graph weights and layout weights, sampling a few non-neighbours for each edge to push apart. **min_dist** sets how tightly points may pack in the layout. The fitted model is kept, and `UMAP.transform` can add new points with the training layout held fixed.

## How to Choose Between t-SNE and UMAP

| Situation | Tab | Why |
|---|---|---|
| Small or moderate n, and a plot of local groups | **t-SNE** | Exact all-pairs search, at a cost that grows as n^2 per iteration |
| Larger data | **UMAP** | Approximate neighbours avoid the all-pairs step in the fit |
| New points must be added to an existing layout | **UMAP** | `UMAP.transform` optimises each new point against the fitted graph |
| The layout will guide a decision | Both | Agreement across tabs is better evidence than one layout |

The panel describes **UMAP** as better at preserving global structure, but the claim is disputed. [Kobak and Linderman (2021)](#ref-KL2021a) traced that difference largely to the starting layout, which is random for the **t-SNE** tab and spectral for the **UMAP** tab.

## What a Neighbour Embedding Cannot Establish

A plot from **t-SNE** or **UMAP** does not show that clusters exist, how far apart they lie, or how large they are. [Wattenberg, Viégas and Johnson (2016)](#ref-WVJ2016a) show layouts in which noise forms clumps and cluster sizes carry no information, and [Chari and Pachter (2023)](#ref-CP2023a) measure how strongly such plots distort distances in genomic data. Use an embedding to form hypotheses, then test them in the original features. Coordinates from an embedding are also a doubtful input for later clustering or inference, unless that step is validated against the original features.

## A Common Workflow for Neighbour Embedding

1. Standardise the features if their units differ, and enter them as **Feature Matrix**.
2. Run a tab at its defaults, then look at **Embedding Scatter**.
3. Read **Perplexity / n_neighbors Sweep** and **Trustworthiness**.
4. Run **Seed Stability** to see how far neighbours change between runs.
5. Run **vs PCA**, so that a linear baseline sets the standard.
6. Use **Colour Scatter by Feature** and **Label Overlay** to relate the layout to what is known, and confirm any finding in the original features.

## References

<a id="ref-CP2023a"></a>Chari, T. and Pachter, L. (2023). The specious art of single-cell genomics. *PLOS Computational Biology* 19(8), e1011288. [doi:10.1371/journal.pcbi.1011288](https://doi.org/10.1371/journal.pcbi.1011288)

<a id="ref-KL2021a"></a>Kobak, D. and Linderman, G. C. (2021). Initialization is critical for preserving global data structure in both t-SNE and UMAP. *Nature Biotechnology* 39(2), 156–157. [doi:10.1038/s41587-020-00809-z](https://doi.org/10.1038/s41587-020-00809-z)

<a id="ref-MHM2018a"></a>McInnes, L., Healy, J. and Melville, J. (2018). UMAP: uniform manifold approximation and projection for dimension reduction. arXiv:1802.03426. [doi:10.48550/arXiv.1802.03426](https://doi.org/10.48550/arXiv.1802.03426)

<a id="ref-MH2008a"></a>van der Maaten, L. and Hinton, G. (2008). Visualizing data using t-SNE. *Journal of Machine Learning Research* 9(86), 2579–2605. [jmlr.org/papers/v9/vandermaaten08a.html](https://jmlr.org/papers/v9/vandermaaten08a.html)

<a id="ref-WVJ2016a"></a>Wattenberg, M., Viégas, F. and Johnson, I. (2016). How to use t-SNE effectively. *Distill* 1(10). [doi:10.23915/distill.00002](https://doi.org/10.23915/distill.00002)

## See Also

- [Factsheet](factsheet.md) · [t-SNE](tsne.md) · [UMAP](umap.md)
