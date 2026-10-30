# Evaluate Embedding Models — Factsheet

**Evaluate Embedding Models** shows which embedding model should find the passages that Ask Pollis answers from. Each question of a test set was made from a passage; each model chosen searches every question as Ask Pollis would, and the page shows how often that passage is found, and at what place. An embedding model turns a text into a vector so that texts of similar meaning lie close together ([Reimers and Gurevych (2019)](#ref-RG2019a)).

| | |
|---|---|
| **Purpose** | Choose the embedding model of Ask Pollis by how well it finds the right passage, its speed and its memory |
| **Input** | Embedding models on this computer and a test set of questions, each made from a passage |
| **Core packages** | [llama.cpp](https://github.com/ggml-org/llama.cpp), [DuckDB](https://duckdb.org) |
| **Steps** | Models, Questions, Run, Results |
| **Output** | A column of figures for each model, the place of the passage for each question, and Use for Ask Pollis |
| **Key choice** | Whether a larger model finds enough more passages to justify its memory and its index |

## When to Use Evaluate Embedding Models
- Choosing the embedding model of Ask Pollis, which **Use for Ask Pollis** sets together with its prefixes.
- Deciding whether a larger embedding model is worth its memory and the size of its index.
- Checking a new embedding model against the one in use, on the documents of this Pollis.
- Following up a low line of the passages found in Evaluate Answering Models.

## What Evaluate Embedding Models Does Not Measure
Evaluate Embedding Models measures finding, and no answer is written in a run: Evaluate Answering Models compares the models that answer. A model that finds more passages does not guarantee better answers, though an answer cannot use a passage that was not found. The page measures finding in Pollis' own index, and a collection of your own, in Retrieval-Augmented Generation, may rank the models differently.

## References

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
