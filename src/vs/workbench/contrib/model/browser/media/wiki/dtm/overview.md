# Overview

A document-term matrix turns a set of texts into numbers, with one row per document and one column per word. Weighting schemes such as TF-IDF and BM25 then make those numbers better at telling documents apart.

## What the Matrix Holds

Entry (d, t) counts how many times term t occurs in document d. A corpus of D documents with a vocabulary of V terms gives a D × V matrix. Word order is dropped, which is why the representation is called a bag of words. Each document becomes a point in a space with one axis per term, as in the vector space model of [Salton, Wong and Yang (1975)](#ref-SWY1975a). Most entries are zero, since a document uses only a small part of the vocabulary.

## How the Code Builds It

| Step | Code | Effect |
|---|---|---|
| Wrap the texts | `Corpus(map(StringDocument, docs))` | One document per string |
| Clean | `prepare!` | Removes punctuation, case and stop words |
| Build the vocabulary | `update_lexicon!` | Lists terms and their counts |
| Build the matrix | `DocumentTermMatrix` | Holds the counts |

The tools come from [JuliaText Contributors (2023)](#ref-JTC2023a). **Corpus variable** names a Julia vector of strings. Its default, `docs`, is the text of The Pollis Guide, with one document per section.

## How the Three Tabs Differ

| Tab | Entry in the matrix | Good for |
|---|---|---|
| **DTM** | Raw counts | Inspection, topic models |
| **TF-IDF** | Counts re-weighted by rarity | Similarity, features |
| **BM25** | Saturating counts, adjusted for length and rarity | Ranking documents for a query |

The matrix on the **DTM** tab is the raw material for the other two tabs, so that [TF-IDF](tf-idf.md) and [BM25](bm25.md) cover the weighted forms.

## What a Small Matrix Looks Like

Three documents give the idea: "cat sat", "cat ran" and "dog ran".

| Document | cat | dog | ran | sat |
|---|---|---|---|---|
| 1 | 1 | 0 | 0 | 1 |
| 2 | 1 | 0 | 1 | 0 |
| 3 | 0 | 1 | 1 | 0 |

Half of the 12 entries are zero here, and a real corpus has a far higher share. Documents 1 and 2 share one term, as do documents 2 and 3, whereas documents 1 and 3 share none, and so counts already carry some idea of similarity.

## A Common Workflow for a New Corpus

1. Set **Corpus variable** to your vector of strings.
2. Read **Vocabulary Report** and **Sparsity Report**.
3. Scan **Term Frequency Bar Chart** for words that should have been cleaned.
4. Look at **Top Terms Per Document** on **TF-IDF**.
5. Rank documents with **Cosine Similarity**, after changing the query in the code.
6. Compare the rankings in **TF-IDF vs BM25**.

Go back to the cleaning whenever a later step shows odd terms, since each later step inherits it.

## References

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-SWY1975a"></a>Salton, G., Wong, A. and Yang, C. S. (1975). A vector space model for automatic indexing. *Communications of the ACM* 18(11), 613–620. [doi:10.1145/361219.361220](https://doi.org/10.1145/361219.361220)

## See Also

- [Factsheet](factsheet.md) · [TF-IDF](tf-idf.md) · [BM25](bm25.md) · [Assumptions](assumptions.md)
