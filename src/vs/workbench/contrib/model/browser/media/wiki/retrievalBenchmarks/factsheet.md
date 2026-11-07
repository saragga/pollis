# Benchmark Embedding and Reranking Models — Factsheet

**Benchmark Embedding and Reranking Models** runs the embedding models and the rerankers of this computer on published retrieval benchmarks, SciFact and SCIDOCS, as [Thakur, Reimers, Rücklé, Srivastava and Gurevych (2021)](#ref-TRRSG2021a) run them in BEIR. Each benchmark is a set of queries, each with the documents relevant to it, searched among the benchmark's own documents, and each query is scored by the first 10 documents found.

| | |
|---|---|
| **Purpose** | See how an embedding model or a reranker ranks the documents of a published benchmark, beside the results others report on it |
| **Input** | Embedding models or rerankers on this computer, and a benchmark of PollisBenchmarks with its queries |
| **Core packages** | [PollisBenchmarks.jl](https://github.com/Trumpingtons/PollisBenchmarks.jl), which holds the queries and documents in `~/.pollis/databases/PollisBenchmarks.duckdb` |
| **Local models** | Run by [llama.cpp](https://github.com/ggml-org/llama.cpp), one after the other, each alone in memory |
| **Steps** | Benchmark, Sample, Models, Run, Results |
| **Output** | nDCG@10 with its 95% interval and Recall@10 for each model, its speed and memory, and the nDCG@10 of each query |
| **Key choice** | The benchmark, all its queries or a sample, and the kind of model, embedding or reranking |

## When to Use Benchmark Embedding and Reranking Models
- Setting a local embedding model or reranker beside the scores published for it, or for others, on SciFact or SCIDOCS.
- Checking that a downloaded model works as its authors report, before relying on it.
- Comparing the embedding models or the rerankers of this computer on documents and queries that no one at Pollis wrote.
- Seeing how much a reranker adds to the order of BM25 on scientific text.

## What Benchmark Embedding and Reranking Models Does Not Measure
A published benchmark says how a model does in general, on its own queries and documents, not on Pollis's documents. The embedding model and the reranker of Ask Pollis are chosen in Evaluate Embedding Models and Evaluate Reranking Models, on questions made from Pollis's own documents, and only those pages have **Use for Ask Pollis**. A run writes no answer either: answering models are run in Evaluate Answering Models and Benchmark Answering Models.

## References

<a id="ref-TRRSG2021a"></a>Thakur, N., Reimers, N., Rücklé, A., Srivastava, A. and Gurevych, I. (2021). BEIR: a heterogeneous benchmark for zero-shot evaluation of information retrieval models. *Proceedings of the Neural Information Processing Systems Track on Datasets and Benchmarks* 1. arXiv:2104.08663. [doi:10.48550/arXiv.2104.08663](https://doi.org/10.48550/arXiv.2104.08663)

## See Also
- [Overview](overview.md) · [Interpretation](interpretation.md)
