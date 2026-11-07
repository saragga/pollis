# Benchmark Embedding and Reranking Models — Overview

Benchmark Embedding and Reranking Models runs local embedding models and rerankers on the retrieval benchmarks of PollisBenchmarks, as BEIR runs them ([Thakur, Reimers, Rücklé, Srivastava and Gurevych (2021)](#ref-TRRSG2021a)). The queries, their relevant documents and the documents searched all come from the benchmark, in `~/.pollis/databases/PollisBenchmarks.duckdb`, so the results can be set beside those published for the same benchmark.

## The Benchmarks: SciFact and SCIDOCS
**SciFact** pairs scientific claims with the abstracts that support or refute them ([Wadden, Lin, Lo, Wang, van Zuylen, Cohan and Hajishirzi (2020)](#ref-WLLWZ...2020a)): each claim is a query, and its relevant documents are those abstracts. **SCIDOCS** comes from the evaluation of document representations of [Cohan, Feldman, Beltagy, Downey and Weld (2020)](#ref-CFBDW2020a): the title of a paper is the query, and the papers it cites are among its relevant documents. Both are in BEIR, and PollisBenchmarks keeps their test queries and all their documents at a fixed revision.

## Choosing the Benchmark of a Run
Step 1, **Benchmark**, lists SciFact and SCIDOCS with what each measures, which documents are relevant to a query, and how many queries and documents each has; a click anywhere on a row chooses the benchmark. The queries, their relevant documents and the documents searched come with Pollis, in `~/.pollis/databases/PollisBenchmarks.duckdb`, at a fixed revision of their source, so there is nothing to download.

## Drawing the Sample of Queries
Step 2, **Sample**, takes all the queries of the benchmark, or a simple random sample of them: SciFact and SCIDOCS have no strata. Only a run of all the queries gives the figures published results are set beside, and **All Queries** brings the sample back to them. A smaller sample is quicker, above all for rerankers; an embedding model embeds all the documents of the benchmark in any case, once. The **Seed** draws the same sample again, so that runs of different models search the same queries, and **New Seed** draws another.

## Choosing the Kind of Model and the Models
Step 3, **Models**, has a switch between **Embedding Models** and **Reranking Models**. The table below it lists the models of that kind on this computer, with their sizes, and any number of them can be run together. Models are downloaded in Compose > Local AI Models. A run is of one kind; the choice of models of each kind is remembered.

## Running Embedding Models on a Benchmark
Each embedding model, alone in memory, first embeds the documents of the benchmark it has not embedded yet, with the prefix it was trained with, and keeps them in `~/.pollis/documents/embeddings.duckdb`, so that each document is embedded once by each model, ever. Each query is then embedded with the model's query prefix, and the documents nearest it by meaning are taken in order. The first time, embedding the documents takes some minutes, longer for SCIDOCS, which has many more of them.

## Running Rerankers on a Benchmark
For each query, BM25 first finds 100 documents of the benchmark by their words ([Robertson and Zaragoza (2009)](#ref-RZ2009a)), as BEIR does before reranking. Each reranker, alone in memory, then reads the query with each of those documents and puts them in its order. The order of BM25 itself is scored too, as **No Reranker**, so that each reranker is measured against the order it starts from. A reranker reads every query with each of its 100 documents, so a run on all the queries takes long.

## Reading the Results of a Benchmark Run
Step 4, **Run**, runs the models chosen, one after the other. Step 5, **Results**, has two parts. **Descriptive Statistics** has a column for each model, the best first by **nDCG@10**, with its 95% interval, then **Recall@10**, the speed and the memory of each model. **Queries** shows the nDCG@10 of each query for each model. Earlier runs of both kinds stay under **Run**, named by their kind and benchmark, and **Delete Run** removes one.

## Benchmarks and the Models of Ask Pollis
A published benchmark says how a model does in general, not on Pollis's documents. The models of Ask Pollis are chosen in Evaluate Embedding Models and Evaluate Reranking Models, which run questions made from Pollis's own documents and have **Use for Ask Pollis**; this page has none. A model that ranks first on SciFact or SCIDOCS may not rank first on the wikis and guides that Ask Pollis answers from.

## References

<a id="ref-CFBDW2020a"></a>Cohan, A., Feldman, S., Beltagy, I., Downey, D. and Weld, D. (2020). SPECTER: document-level representation learning using citation-informed transformers. *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics*, 2270–2282. [doi:10.18653/v1/2020.acl-main.207](https://doi.org/10.18653/v1/2020.acl-main.207)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

<a id="ref-TRRSG2021a"></a>Thakur, N., Reimers, N., Rücklé, A., Srivastava, A. and Gurevych, I. (2021). BEIR: a heterogeneous benchmark for zero-shot evaluation of information retrieval models. *Proceedings of the Neural Information Processing Systems Track on Datasets and Benchmarks* 1. arXiv:2104.08663. [doi:10.48550/arXiv.2104.08663](https://doi.org/10.48550/arXiv.2104.08663)

<a id="ref-WLLWZ...2020a"></a>Wadden, D., Lin, S., Lo, K., Wang, L. L., van Zuylen, M., Cohan, A. and Hajishirzi, H. (2020). Fact or fiction: verifying scientific claims. *Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, 7534–7550. [doi:10.18653/v1/2020.emnlp-main.609](https://doi.org/10.18653/v1/2020.emnlp-main.609)

## See Also
- [Factsheet](factsheet.md) · [Interpretation](interpretation.md)
