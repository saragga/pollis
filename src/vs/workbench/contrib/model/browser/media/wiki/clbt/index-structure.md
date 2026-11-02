# Index Structure

An index stores token vectors so that they take little space, and it finds candidates without scanning all of them. Both aims rest on the same clustering.

## Why Token Vectors Need Compression

One vector per token means tens of vectors per passage, and a large collection then has billions of them. At full precision, that takes far more disk and memory than a single-vector index. The aim is to shrink each vector while keeping MaxSim scores nearly unchanged. Token vectors help here: they fall into tight semantic clusters, so a cluster's centre says much about each member. [Santhanam, Khattab, Saad-Falcon, Potts and Zaharia (2022)](#ref-SKSPZ2022a) report a reduction of six to ten times against the original design.

## How Centroids and Residuals Store a Vector

Indexing first runs k-means on a sample of passages to choose centroids. Each token vector is then stored as:

- The identifier of the nearest centroid
- A residual, the vector minus that centroid, compressed to `config.nbits` bits for each dimension

Decompression adds the two back, and normalises the result. **Compression Check** prints the number of centroids and bits. Storing a coarse code with a compact remainder belongs to the same family as the product quantisation of [Jégou, Douze and Schmid (2011)](#ref-JDS2011a).

## How Search Finds Candidates

Each query token probes its nearest `nprobe` centroids, and the passages with tokens in those clusters become candidates. The index keeps a list from centroid to passages for that purpose. Candidates are decompressed and scored by MaxSim, and the top k are returned. A larger `nprobe` means more candidates, better recall and a slower search. The panel uses 8 centroids per query token. The tooltip for **Top-k** warns that search fails when fewer than k passages are candidates, which can happen on a tiny corpus.

## How the Seed and the Sample Matter

The sample of passages and the k-means start are random, so that different seeds can give different centroids. Scores can move slightly, and close passages can swap ranks. `Random.seed!` with **Seed** keeps a run repeatable on one machine. On a large collection, the effect should be small. On 24 passages, clusters are built on very few vectors, and each is coarse, so a change of seed is a fair test of stability.

## What the Panel's Small Index Does Not Show

With only 24 passages, exact scoring would be instant, so the index gains nothing here in speed. The panel shows the machinery rather than its benefit. The index also lives in a temporary folder, because `index` skips a folder that exists, and each run rebuilds it. A real system builds once to a fixed path, and reuses it through `Searcher(index_path)`. Added passages then call for a rebuild or an update, and a stale index returns old content without warning.

## How Larger Engines Speed Up Search

Decompressing all candidates is the slow step at scale. [Santhanam, Khattab, Potts and Zaharia (2022)](#ref-SKPZ2022a) describe PLAID, an engine that first scores candidates with centroids only, drops most of them, and decompresses the remainder. The same scoring model is kept, so quality stays close to exact scoring, at a lower latency. That sort of pruning matters for millions of passages, and not for a teaching corpus. Treat speed figures from the panel accordingly, as they say little about a large collection.

## References

<a id="ref-JDS2011a"></a>Jégou, H., Douze, M. and Schmid, C. (2011). Product quantization for nearest neighbor search. *IEEE Transactions on Pattern Analysis and Machine Intelligence* 33(1), 117–128. [doi:10.1109/TPAMI.2010.57](https://doi.org/10.1109/TPAMI.2010.57)

<a id="ref-SKPZ2022a"></a>Santhanam, K., Khattab, O., Potts, C. and Zaharia, M. (2022). PLAID: an efficient engine for late interaction retrieval. *Proceedings of the 31st ACM International Conference on Information and Knowledge Management*, 1747–1756. [doi:10.1145/3511808.3557325](https://doi.org/10.1145/3511808.3557325)

<a id="ref-SKSPZ2022a"></a>Santhanam, K., Khattab, O., Saad-Falcon, J., Potts, C. and Zaharia, M. (2022). ColBERTv2: effective and efficient retrieval via lightweight late interaction. *NAACL*. [arXiv:2112.01488](https://arxiv.org/abs/2112.01488)

## See Also

- [Factsheet](factsheet.md) · [Late Interaction](late-interaction.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
