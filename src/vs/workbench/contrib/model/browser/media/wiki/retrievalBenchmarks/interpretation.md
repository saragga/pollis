# Interpretation

## What nDCG@10 Means
**nDCG@10**, normalised discounted cumulative gain at 10, scores the first 10 documents found for a query by where the relevant ones are: a relevant document counts for less the further down it comes, and the total is divided by the best the query could have, so the score runs from 0 to 1 ([Järvelin and Kekäläinen (2002)](#ref-JK2002a)). A score of 1 means the relevant documents are the first found; 0 means none is among the first 10. Benchmark Embedding and Reranking Models gives each relevant document the same weight, as the labels of SciFact and SCIDOCS do, and reports the average over the queries, the measure BEIR reports ([Thakur, Reimers, Rücklé, Srivastava and Gurevych (2021)](#ref-TRRSG2021a)).

## What Recall@10 Means
**Recall@10** is the share of the relevant documents of a query that are among the first 10 found, averaged over the queries ([Manning, Raghavan and Schütze (2008)](#ref-MRS2008a)). Unlike nDCG@10, Recall@10 ignores the order within the first 10: two models that find the same documents have the same Recall@10, and the one that puts them higher has the higher nDCG@10. A query with more relevant documents than 10 cannot reach a Recall@10 of 1.

## The 95% Interval of nDCG@10
Beside nDCG@10, the page gives the half-width of its 95% interval: 1.96 standard errors of the mean over the queries run. Two models whose intervals overlap widely may not differ on the benchmark as a whole, and a run of a small sample gives a wide interval. Running all the queries narrows it most, and gives the figure comparable with published results.

## The Share of Relevant Documents BM25 Found
On a run of rerankers, a line above the results gives the share of the relevant documents of a query that are among the 100 BM25 found, on average. A reranker only reorders those 100 documents, so a relevant document BM25 missed stays missing whatever the reranker does: the share is the most Recall@10 can reach, and it bounds what any reranker can gain over **No Reranker**, the order of BM25 ([Robertson and Zaragoza (2009)](#ref-RZ2009a)).

## The nDCG@10 of Each Query
The part **Queries** of **Results**, below **Descriptive Statistics**, shows each query with its nDCG@10 for each model; a click on a model's heading sorts the queries by it, the best first. Queries where the models differ most show what one model finds that another misses. A query with 0 in every column has relevant documents that no model ranked among its first 10.

## Reading the Speed and Memory of a Model
For an embedding model, **Query, ms** is the time to embed a query and **Search, ms** the time to find its documents by meaning, each on average; **Documents a Second** is how fast it embedded the documents, when the run embedded any. For a reranker, **Reranking, ms** is the time to score the documents of a query. **Memory, GB** is the memory the model's server took, the memory free before it started less the memory free when it was done.

## Benchmark Scores and the Choice for Ask Pollis
A published benchmark says how a model does in general, on its own queries and documents, not on Pollis's documents. A model's rank on SciFact or SCIDOCS is evidence about the model, and the choice of the embedding model and the reranker of Ask Pollis is made in Evaluate Embedding Models and Evaluate Reranking Models, on questions made from the documents Ask Pollis answers from.

## References

<a id="ref-JK2002a"></a>Järvelin, K. and Kekäläinen, J. (2002). Cumulated gain-based evaluation of IR techniques. *ACM Transactions on Information Systems* 20(4), 422–446. [doi:10.1145/582415.582418](https://doi.org/10.1145/582415.582418)

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

<a id="ref-TRRSG2021a"></a>Thakur, N., Reimers, N., Rücklé, A., Srivastava, A. and Gurevych, I. (2021). BEIR: a heterogeneous benchmark for zero-shot evaluation of information retrieval models. *Proceedings of the Neural Information Processing Systems Track on Datasets and Benchmarks* 1. arXiv:2104.08663. [doi:10.48550/arXiv.2104.08663](https://doi.org/10.48550/arXiv.2104.08663)

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md)
