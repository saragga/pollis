# Decision Guide

The main choice is whether word-level neural matching is worth its cost on a given collection. Other choices then follow from the size of the collection and from what a query needs.

## Which Retrieval Method Fits the Situation

| Situation | Choice | Why |
|---|---|---|
| Exact terms, names and codes matter | BM25 | Fast and transparent |
| Paraphrased queries, large collection | ColBERT index | Word-level quality at search speed |
| An existing term index | BM25 + ColBERT re-ranking | Adds quality with little change |
| Tight storage and simple needs | Single-vector bi-encoder | One vector per passage |
| A few candidates and top quality | Cross-encoder re-ranking | Most accurate per pair, slowest |

## When an Index Is Worth Building

A small collection can be scored exactly, as **Score Heatmap** does, and no index is needed. An index earns its build time as the collection grows, and as queries become frequent. Building is the costly part, so a GPU helps a lot, and the panel's `use_gpu = false` is a choice for portability. Plan to rebuild when content changes. For a large collection, [Santhanam, Khattab, Potts and Zaharia (2022)](#ref-SKPZ2022a) describe a dedicated engine for the search step.

## How to Choose Top-k and BM25 Candidates

Set **Top-k** to what a reader or a later stage will use. Downstream language models work with a few passages, while a human reader may scan ten. On the panel's 24 passages, keep it small, since a large k makes any system look good on recall. Set **BM25 Candidates** well above k, so that re-ranking has room to work. Too few candidates can lose relevant passages for good. Raising it costs more scoring, but on a large collection the first stage should cast a wide net.

## How to Choose Index Settings

`nprobe` trades recall for speed, and `config.nbits` trades storage for accuracy of scores. Raise `nprobe` if an exact scan finds passages that search misses. Raise `nbits` if **Compression Check** shows gaps that change the order. Lower each only after testing on labelled queries. Published runs use one or two bits per dimension, as reported by [Santhanam, Khattab, Saad-Falcon, Potts and Zaharia (2022)](#ref-SKSPZ2022a). Change one setting at a time, and keep **Seed** fixed while comparing.

## How to Test Retrieval on New Data

Replace `docs`, `queries` and `relevant` in the code. Write queries as real users would, in their words and not the documents' words, and also avoid writing them so as to favour one system. Judge a pool of the top results from all systems, so that unjudged passages do not count against any one of them, which is a standard practice, covered in [Manning, Raghavan and Schütze (2008)](#ref-MRS2008a). Aim for many more than eight queries. Then **Recall and MRR** and **vs BM25** can be used as they stand.

## What to Report from a Retrieval Study

Report the corpus and its size, how queries and labels were made, the checkpoint, and the settings: `nprobe`, `nbits`, k and the number of candidates. Give Recall@k and MRR@k per system on the same queries, with per-query values, or at least a measure of spread. Include a term-matching baseline. State the indexing time and the storage used if cost is part of the argument. Note that results from a corpus of 24 passages demonstrate a procedure, and do not support any claim about which system is better.

## References

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

<a id="ref-SKPZ2022a"></a>Santhanam, K., Khattab, O., Potts, C. and Zaharia, M. (2022). PLAID: an efficient engine for late interaction retrieval. *Proceedings of the 31st ACM International Conference on Information and Knowledge Management*, 1747–1756. [doi:10.1145/3511808.3557325](https://doi.org/10.1145/3511808.3557325)

<a id="ref-SKSPZ2022a"></a>Santhanam, K., Khattab, O., Saad-Falcon, J., Potts, C. and Zaharia, M. (2022). ColBERTv2: effective and efficient retrieval via lightweight late interaction. *NAACL*. [arXiv:2112.01488](https://arxiv.org/abs/2112.01488)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Late Interaction](late-interaction.md) · [Index Structure](index-structure.md)
