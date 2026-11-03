# Latent Semantic Analysis: Factsheet

A summary of the **Latent Semantic Analysis** panel: the method, its two inputs, the preparation of the corpus and the matrices the main code returns.

## At a glance

| Item | Value |
| --- | --- |
| Method | truncated SVD of the TF-IDF matrix |
| Matrix | documents × terms, `Matrix(tf_idf(dtm))` |
| Decomposition | `U, S, V = svd(M)` from LinearAlgebra |
| Document vectors | `U_k`, the first k columns of U |
| Term vectors | `V_k`, the first k columns of V |
| Singular values | `S_k`, the k largest |
| Default corpus | The Pollis Guide from PollisDatasets, one document per section |
| Default k | 50 |

The method is that of [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a); the corpus and the TF-IDF matrix come from TextAnalysis.jl, of [JuliaText Contributors (2023)](#ref-JTC2023a).

## Inputs

| Input | Default | Tooltip, in brief |
| --- | --- | --- |
| **Corpus** | `corpus` | array of text documents |
| **Dimensions (k)** | `50` | latent dimensions to retain from the SVD, at most the number of documents or terms; 50-100 in various problems of [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a), 100 for MED |

The tooltip of **Corpus** adds that the default example also defines `query_idx` and `new_text` for **Query Documents** and **Fold-In New Doc**. With the default corpus, `query_idx = 2`, the section Install Pollis, and `new_text` is a question about installing Julia and the packages of a panel.

## Preparing the corpus

The code makes a `StringDocument` of each string, cleans the corpus with

```
prepare!(crps, strip_punctuation | strip_case)
```

and builds the vocabulary with `update_lexicon!`. `DocumentTermMatrix(crps)` gives the counts of each term in each document, and `tf_idf(dtm)` the weighted matrix.

The TextAnalysis.jl documentation explains that TF-IDF addresses two issues of raw word counts: some documents are longer than others, and some words are more frequent than others. It adds that TF-IDF inserts zeros into the columns of words that occur in all documents, a way to avoid having to remove those words during preprocessing.

## The decomposition

The main code computes the full SVD of the dense TF-IDF matrix and keeps the first k columns:

```
U, S, V = svd(M)
U_k = U[:, 1:k]; S_k = S[1:k]; V_k = V[:, 1:k]
```

Its comments read U_k as the document vectors in latent space, S_k as the singular values and V_k as the term vectors. Rows of M are documents and columns terms, so U has one row per document and V one row per term.

## Packages

The panel loads TextAnalysis for the corpus, the document-term matrix and `tf_idf`, LinearAlgebra for `svd`, `norm` and `Diagonal`, and PollisDatasets for the default corpus. Plots draws the charts of **Term Space**, **Variance Explained** and **Compare k Values**.

TextAnalysis.jl also has `lsa(dtm)`, which its documentation describes as Latent Semantic Analysis on a corpus or document-term matrix; the panel calls `svd` directly and reads U, S and V in its actions.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SVD](svd.md) · [Dimensionality](dimensionality.md)
