# Factsheet

**Document-Term Matrix & TF-IDF** turns a corpus into a matrix of counts or weights with `TextAnalysis.jl`, and uses it to inspect vocabulary and to rank documents against a query.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Represent texts as numbers for search, comparison or later models |
| Julia stack | `TextAnalysis.jl`, `PollisDatasets` for the default corpus, `Plots.jl` for figures |
| Tabs | **DTM**, **TF-IDF**, **BM25** |
| Output | `dtm(m)`, `tf_idf(m)` or `bm_25(m)`, of size D × V |

All three tabs share the same Next Steps, which build the matrices that they need.

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Corpus variable** | `docs` | Vector of strings, one per document |
| **Lexicon variable** | `lexicon` | Optional pre-built vocabulary |

The default `docs` loads the `pollis_guide` dataset from `PollisDatasets`, which has 130 sections on 19 topics. Replace it with your own vector of strings, and the same code runs on your texts.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Cleaning | `strip_punctuation`, `strip_case`, `strip_stopwords` |
| **BM25** parameters | Package defaults of `bm_25` |
| **Term Frequency Bar Chart** | Top 20 terms |
| **Query Vector**, **Cosine Similarity** query | "install julia and the packages" |
| **TF-IDF vs BM25** query | "alerts on sec filings", top 5 of each |
| **Top Terms Per Document** | First 5 documents, 5 terms each |
| **DTM vs TF-IDF** | First document, first 10 terms |
| **IDF Weights** | log(D / df), top 10 printed |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Term Frequency Bar Chart** | Most frequent terms across the corpus |
| **TF-IDF Heatmap** | Weights by document and term index |
| **Sparsity Report** | Share of zero entries |
| **Vocabulary Report** | Vocabulary size, documents, mean tokens per document |
| **Query Vector** | A new text as counts over the vocabulary |
| **Cosine Similarity** | Documents ranked against a query |
| **DTM vs TF-IDF** | Counts beside weights for one document |
| **TF-IDF vs BM25** | Two top-5 rankings for a query |
| **Top Terms Per Document** | Highest TF-IDF terms per document |
| **IDF Weights** | Terms with the highest inverse document frequency |

## See Also

- [Overview](overview.md) · [TF-IDF](tf-idf.md) · [BM25](bm25.md) · [Decision Guide](decision-guide.md)
