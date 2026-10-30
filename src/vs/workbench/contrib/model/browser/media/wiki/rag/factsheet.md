# Retrieval-Augmented Generation — Factsheet

**Retrieval-augmented generation** (RAG) answers a question from a collection of documents: the passages nearest to the question are found first, and a language model answers from them rather than from what it remembers. The name and the method's first full form are due to [Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel and Kiela (2020)](#ref-LPPPK...2020a).

| | |
|---|---|
| **Purpose** | Answer questions from your own documents, with the sources of each answer |
| **Input** | PDF, Markdown and text files, an embedding model and an answering model; a reranker if wanted |
| **Core packages** | [DuckDB.jl](https://github.com/duckdb/duckdb), [Poppler_jll.jl](https://github.com/JuliaBinaryWrappers/Poppler_jll.jl), [llama.cpp](https://github.com/ggml-org/llama.cpp) |
| **Steps** | Document Ingestion, Chunking, Embedding, Retrieval, Reranking (optional), Generation |
| **Output** | An index of the collection, the passages found for a question with their scores, an answer citing them by number |
| **Key choice** | The length of the passages, and whether to rerank |

The search is by the question's words, with BM25, and by its meaning, with the cosine between embeddings:

    score(passage) = 1 / (60 + rank by words) + 1 / (60 + rank by meaning)

A passage missing from one list has only the other's term.

## When to Use

- **Questions whose answers are in documents you have**: papers, manuals, reports, notes.
- **Documents newer or more private than what a model was trained on**.
- **Answers you need to check**: each one cites the passages it comes from.

## What It Is Not

Not a guarantee of truth: a model can misread a passage or go beyond it, so the citations are there to be followed. Not a summary of a whole collection: the model sees only the passages found, not the documents. Not for questions that need counting or comparing across many documents: those need a table and a query.

## References

<a id="ref-LPPPK...2020a"></a>Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S. and Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *NeurIPS*. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
