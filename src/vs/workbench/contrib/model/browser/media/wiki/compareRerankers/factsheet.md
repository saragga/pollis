# Evaluate Reranking Models — Factsheet

**Evaluate Reranking Models** shows which reranker should choose the passages that Ask Pollis answers from, or whether any should. A reranker reads the question together with each passage found and scores how well the passage answers it; [Nogueira and Cho (2019)](#ref-NC2019a) reordered the passages found by a search in this way. Each question of a test set was made from a passage, and the page shows how often each reranker puts that passage among those Ask Pollis gives.

| | |
|---|---|
| **Purpose** | Choose the reranker of Ask Pollis by how well it puts the right passage first, its speed and its memory |
| **Input** | Rerankers on this computer and a test set of questions, each made from a passage |
| **Core packages** | [DuckDB.jl](https://github.com/duckdb/DuckDB.jl) |
| **Local models** | Run by [llama.cpp](https://github.com/ggml-org/llama.cpp), which scores each passage for its question |
| **Steps** | Models, Questions, Run, Results |
| **Output** | A column of figures for each reranker and for No Reranker, the place of the passage for each question, and Use for Ask Pollis |
| **Key choice** | Whether a reranker gives enough more right passages to justify its time and memory, or none is needed |

## When to Use Evaluate Reranking Models
- Choosing the reranker of Ask Pollis, which **Use for Ask Pollis** sets, or setting none.
- Deciding whether a reranker is worth the time it adds to every question.
- Checking a new reranker against the one in use, on the documents of this Pollis.
- Following up questions whose passage the search finds, but too far down for Ask Pollis to give it.

## What Evaluate Reranking Models Does Not Measure
Evaluate Reranking Models measures the choice of passages, and a run writes no answer: the answers are compared in Evaluate Answering Models. A reranker can only reorder the passages the search found, so a passage the search missed stays missing whatever the reranker; finding it is the work of the embedding model, compared in Evaluate Embedding Models. The page measures Pollis' own index, and the collections of Retrieval-Augmented Generation may rank the rerankers differently.

## References

<a id="ref-NC2019a"></a>Nogueira, R. and Cho, K. (2019). Passage re-ranking with BERT. [arXiv:1901.04085](https://doi.org/10.48550/arXiv.1901.04085)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
