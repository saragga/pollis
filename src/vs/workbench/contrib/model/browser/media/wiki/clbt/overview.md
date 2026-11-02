# Overview

ColBERT finds passages that answer a query, comparing them word by word in context instead of through one summary vector. The panel builds an index over a small corpus, searches it, and compares it with a classical baseline.

## What the Retrieval Problem Is

Given a query and a collection of passages, a retrieval system returns a short ranked list, with the most useful passages first. Good results may share no words with the query, as with "mother and father" and "parents". Classical term matching misses such cases, and neural models handle them better at a higher cost. [Manning, Raghavan and Schütze (2008)](#ref-MRS2008a) give the classical background, and the balance between quality and speed is what shapes all that follows.

## How ColBERT Differs from Other Neural Retrievers

A bi-encoder reduces each text to one vector, which is fast but squeezes out detail. A cross-encoder reads query and passage together, which is accurate but too slow for large collections. Late interaction sits in between: each text keeps one vector per token, encoded independently, and these only meet at the end, in a cheap sum of best matches. [Khattab and Zaharia (2020)](#ref-KZ2020a) introduced the design, and the encoder is the BERT model of [Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a).

## What Happens in the Two Phases

| Phase | Steps |
|---|---|
| **Indexing**, offline | Encode passages, cluster token vectors with k-means, store each as a centroid plus a compressed residual |
| **Search**, online | Encode the query, probe the nearest centroids to find candidates, decompress them, rank by MaxSim |

Indexing happens once per collection, and search happens per query. The panel rebuilds its index on every run, because the corpus is tiny and a fresh folder keeps runs reproducible.

## What the Panel Compares

The code has a built-in corpus of 24 passages on classical texts, with 8 labelled queries, and three systems:

- **BM25** alone, a classical term-matching baseline
- **ColBERT** through its index
- **BM25 + ColBERT**, in which ColBERT re-ranks the BM25 candidates

The labelled queries let **Recall and MRR** and **vs BM25** score each system. Any other **Query** still runs, with no scores.

## A Common Workflow for Evaluating Retrieval

1. Run a query, and read the ranked passages.
2. Score all the labelled queries with **Recall and MRR**.
3. Compare the three systems with **vs BM25**.
4. Check what the index loses with **Compression Check**.
5. Explain a result with **MaxSim Breakdown**.
6. Look at the padding tokens with **Query Analysis**.

Repeat with new queries of your own, to see how results read with no labels.

## References

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *NAACL-HLT*. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

<a id="ref-KZ2020a"></a>Khattab, O. and Zaharia, M. (2020). ColBERT: efficient and effective passage search via contextualized late interaction over BERT. *SIGIR*. [arXiv:2004.12832](https://arxiv.org/abs/2004.12832)

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

## See Also

- [Factsheet](factsheet.md) · [Late Interaction](late-interaction.md) · [Index Structure](index-structure.md) · [Decision Guide](decision-guide.md)
