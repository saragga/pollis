# Retrieval-Augmented Generation — Overview

A language model answers from what it learned in training, which may be old, wrong or silent about your documents. Retrieval-augmented generation puts the relevant text in front of it at the moment of answering ([Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel and Kiela (2020)](#ref-LPPPK...2020a)). Two halves make it up: retrieval, which finds passages, and generation, which words an answer from them. A wrong answer comes from one or the other, and the six steps of the page let you look at each.

## Document Ingestion
A **Collection** is a set of documents with an index of its own. **Add Files...** puts in PDF, Markdown and text files. They stay where they are: the collection keeps their paths, and marks a file it can no longer find as **Missing**.

## Chunking
A model cannot be given a whole library, and a question's answer usually sits in a paragraph, so each document is cut into passages of about **Passage Length** words, from 100 to 500:
- **PDF**: at its paragraphs, under its bookmarks if it has them; running titles and page numbers are left out.
- **Markdown**: at its headings.
- **Text**: at its blank lines.

A paragraph longer than a passage is cut at its sentences. A passage starts with the last sentence of the one before it under the same heading, if that sentence is short, so that a thought cut in two can still be read. Each passage keeps the heading it is under, and the search reads the heading too.

## Embedding
An embedding model turns a passage into a vector, so that texts of similar meaning lie close together even with no words in common ([Reimers and Gurevych (2019)](#ref-RG2019a)). **Embedding Model** chooses the model and **Build the Index** reads, cuts and embeds the collection. Each passage is embedded once by each model, ever: building again, or another collection with the same text, takes the vectors from `~/.pollis/documents/embeddings.duckdb`. The index of a collection is a [DuckDB](#ref-RM2019a) file in `~/.pollis/rag`.

## Retrieval
**Search** looks for the **Question** in two ways, and each keeps its best 20 passages:
- **By words**, with BM25 ([Robertson and Zaragoza (2009)](#ref-RZ2009a)), which rewards the words of the question that are frequent in a passage and rare in the collection, the idea of inverse document frequency ([Sparck Jones (1972)](#ref-Jon1972a)) with the length of the passage taken into account ([Salton and Buckley (1988)](#ref-SB1988a)). It finds names, codes and exact terms. Words are reduced to their English stems.
- **By meaning**, with the cosine between the question's embedding and each passage's. It finds the same thing said differently.

The two lists are fused by reciprocal rank fusion ([Cormack, Clarke and Büttcher (2009)](#ref-CCB2009a)), which uses only the ranks: a passage scores 1 / (60 + r) for its rank r in each list, and the scores are added. **Passages** says how many of the fused list to keep.

## Reranking
Optional. An embedding is made without knowing the question; a **Reranker** reads the question and a passage together and scores how well one answers the other ([Nogueira and Cho (2019)](#ref-NC2019a)). That is more precise and too slow for a whole collection, so it comes second: find more passages than you need in Retrieval, **Rerank** them, **Keep** the best, and tick **Answer from the passages kept**.

## Generation
**Answer** gives the question and the passages to the **Answering Model**, which is told to answer from them and to cite them by their numbers. A model **On This Computer** runs here; a **Cloud** model needs its key, and it is sent the passages.

## Common Workflow

1. Make a **Collection** and **Add Files...**.
2. Keep the default **Passage Length**, 250 words, to begin with.
3. Choose the **Embedding Model** and **Build the Index**.
4. Search a few questions whose answers you know, and read the passages found.
5. Change the **Passage Length** and build again if they are cut badly.
6. **Rerank** if the right passage is found but too far down.
7. **Answer**, and follow the citations.

## References

<a id="ref-CCB2009a"></a>Cormack, G. V., Clarke, C. L. A. and Büttcher, S. (2009). Reciprocal rank fusion outperforms Condorcet and individual rank learning methods. *SIGIR*, 758–759. [doi:10.1145/1571941.1572114](https://doi.org/10.1145/1571941.1572114)

<a id="ref-LPPPK...2020a"></a>Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S. and Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *NeurIPS*. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

<a id="ref-NC2019a"></a>Nogueira, R. and Cho, K. (2019). Passage re-ranking with BERT. [arXiv:1901.04085](https://arxiv.org/abs/1901.04085)

<a id="ref-RM2019a"></a>Raasveldt, M. and Mühleisen, H. (2019). DuckDB: an embeddable analytical database. *Proceedings of the 2019 International Conference on Management of Data (SIGMOD)*, 1981–1984. [doi:10.1145/3299869.3320212](https://doi.org/10.1145/3299869.3320212)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

<a id="ref-SB1988a"></a>Salton, G. and Buckley, C. (1988). Term-weighting approaches in automatic text retrieval. *Information Processing & Management* 24(5), 513–523. [doi:10.1016/0306-4573(88)90021-0](https://doi.org/10.1016/0306-4573(88)90021-0)

<a id="ref-Jon1972a"></a>Sparck Jones, K. (1972). A statistical interpretation of term specificity and its application in retrieval. *Journal of Documentation* 28(1), 11–21. [doi:10.1108/eb026526](https://doi.org/10.1108/eb026526)

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
