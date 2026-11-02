# Factsheet

**ColBERT Retrieval** indexes a small corpus with late-interaction embeddings, runs ranked search, and compares the outcome with BM25.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Passage search with one vector per token, scored by MaxSim |
| Julia stack | `ColBERT.jl` for the index and search, `RAGTools.jl` for BM25, `CairoMakie.jl` for figures |
| Checkpoint | `colbert-ir/colbertv2.0`, about 440 MB, downloaded on the first run |
| Device | CPU, with `use_gpu = false` |
| Printed result | Ranked passages with scores, with relevant ones starred, plus Recall@k and RR@k for a labelled query |

The packages come from [Chaudhary (2024)](#ref-Cha...2024a) and [Simsa (2025)](#ref-Sim...2025a).

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Query** | "how should a state be governed" | Julia string to search for |
| **Top-k** | 5 | Results returned, and the cut-off for both metrics |
| **BM25 Candidates** | 10 | Passages that ColBERT re-ranks, at least **Top-k** |
| **Checkpoint Folder** | `joinpath(homedir(), "models", "colbertv2.0")` | Where the checkpoint is kept |
| **Seed** | 0 | Passage sample and k-means centroids |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Corpus | 24 passages on Homer, Confucius, Daoism, Plato and Caesar |
| Labelled queries | 8, with one to four relevant passages each |
| `nprobe` | 8 centroids per query token |
| BM25 text | Snowball stemming in English, with stopwords removed |
| Index folder | A new temporary folder on each run |

## What Each Metric Measures

| Metric | Definition |
|---|---|
| Recall@k | Relevant passages in the top k, divided by all relevant passages |
| RR@k | One over the rank of the first relevant passage in the top k, or 0 |
| MRR@k | Mean of RR@k over queries |

The cut-off for all three is **Top-k**, and labels exist only for the built-in queries.

## What Each Next Step in the Panel Does

| Action | Result |
|---|---|
| **Score Heatmap** | Exact score for each query and passage |
| **Result Preview** | ColBERT and BM25 lists side by side |
| **Recall and MRR** | Metrics per query, with means |
| **Compression Check** | Index scores against exact MaxSim |
| **Batch Search** | Column table of all results |
| **Re-rank BM25** | Two-stage ranking for the query |
| **vs BM25** | Three systems on both metrics |
| **Compare Checkpoints** | `colbertv1.9` against `colbertv2.0`, with a second download |
| **MaxSim Breakdown** | Contribution of each query token |
| **Query Analysis** | Effect of the [MASK] padding |

## References

<a id="ref-Cha...2024a"></a>Chaudhary, S. (2024). ColBERT.jl: efficient, late-interaction retrieval systems in Julia. [github.com/JuliaGenAI/ColBERT.jl](https://github.com/JuliaGenAI/ColBERT.jl)

<a id="ref-Sim...2025a"></a>Simsa, J. (2025). RAGTools.jl: retrieval-augmented generation tools in Julia. [github.com/JuliaGenAI/RAGTools.jl](https://github.com/JuliaGenAI/RAGTools.jl)

## See Also

- [Overview](overview.md) · [Late Interaction](late-interaction.md) · [Index Structure](index-structure.md) · [Diagnostics](diagnostics.md)
