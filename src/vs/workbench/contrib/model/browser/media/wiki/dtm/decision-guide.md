# Decision Guide

The main choices are the weighting, the cleaning, and whether a word-count method is enough for the task at all.

## Which Tab Fits the Task

| Task | Tab |
|---|---|
| Inspect vocabulary, or feed a topic model | **DTM** |
| Compare documents with each other | **TF-IDF** with cosine |
| Rank documents for a short query | **BM25** |
| Features for a classifier | **TF-IDF** |

LDA and other count-based models expect counts, and so the **DTM** tab is right for them. BM25 is built for query against document, and it is not symmetric. Where the task is a mix of these, start with **TF-IDF**, and use the others as checks.

## When Counts Are Not Enough

| Situation | Option |
|---|---|
| Synonyms matter | Latent semantic analysis, embeddings |
| Word order matters | N-grams, sequence models |
| Few documents, short texts | Embeddings trained elsewhere |
| Want a fast, explainable baseline | Stay with the panel |

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) reduce the matrix by singular value decomposition so that related terms share dimensions. In hybrid search, BM25 still often runs alongside embeddings, since it is exact on names and codes.

## How to Choose the Cleaning

Clean with the task in mind. For search, keep it light, because a query should match what users type. For topic models, remove more, such as very rare and very frequent terms. Keep case for fields in which it matters, or protect such terms in advance. Use a language-appropriate stop-word list, and add domain words that appear everywhere. Stemming helps small collections, and it may hurt precision in a larger one. Apply the same cleaning to documents and queries.

## How to Set BM25 Parameters

Keep the defaults at first. **BM25** takes k1 and b from `bm_25`, and changing them means editing that call in the code, with its parameters taken from the package's documentation. Tune only with relevance judgements, as otherwise there is nothing to tune against. Raise k1 when repeated terms really are informative, as in long and focused texts, and lower it for short texts. Lower b for corpora with naturally long and rich documents. Differences are usually modest around the usual values.

## How to Choose the Vocabulary Size

The default keeps every term that survives cleaning. For large corpora, drop terms in very few documents, or in almost all of them, and this reduces memory use and noise. Check the effect through **Vocabulary Report** and **Sparsity Report**. A pruning that removes half the columns usually removes only a tiny share of the total counts. Fix the vocabulary when a model will later score new text, so that the columns stay the same. Save it with the model, in the same order.

## What to Report from a Text Representation

Report the corpus, how documents were defined, the cleaning steps, and the vocabulary size. Name the weighting scheme and its exact formula, with the package and its version, since variants differ. For search results, give queries, measures and the relevance judgements behind them, and for BM25, give k1 and b. Say that a word-count method was used, and what that method cannot see. Enough detail lets another reader rebuild the matrix.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K. and Harshman, R. (1990). Indexing by latent semantic analysis. *Journal of the American Society for Information Science* 41(6), 391–407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [TF-IDF](tf-idf.md) · [BM25](bm25.md)
