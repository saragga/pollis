# Latent Semantic Analysis: Overview

The **Latent Semantic Analysis** panel represents documents and terms in a space of k latent dimensions, from a truncated singular value decomposition of the TF-IDF matrix of a corpus. Documents and terms that are used in similar ways end up close to one another in that space.

## The idea

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) introduced the method, as latent semantic indexing, for automatic indexing and retrieval. They start from a problem of matching the words of queries with the words of documents: there are many ways to express a given concept, so the terms of a query may not match those of a relevant document, and most words have several meanings, so a query may match documents of no interest.

Their approach treats the unreliability of observed term-document associations as a statistical problem. They assume an underlying latent semantic structure, partially obscured by the randomness of word choice, estimate it, and describe terms and documents by that structure.

## The method in brief

The panel's first bullet describes LSA as a low-rank SVD approximation of the TF-IDF matrix that captures latent semantic structure across documents.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) decompose a term by document matrix by singular value decomposition, keep the k largest singular values, and obtain the rank-k matrix closest to the original in the least-squares sense. Terms and documents become vectors of k factor values, and the dot product or cosine between two vectors gives their similarity. The SVD page gives the decomposition, and the Dimensionality page the choice of k.

## Packages

The panel's code builds the corpus and the TF-IDF matrix with TextAnalysis.jl, of [JuliaText Contributors (2023)](#ref-JTC2023a), and decomposes it with `svd` from LinearAlgebra.jl, which the third bullet describes as the Julia standard library used for the truncated SVD.

The documentation of TextAnalysis.jl presents LSA as a standard approach to analysing documents from the perspective of their semantic content, with an `lsa` function that uses `tf_idf` for the term statistics. The default corpus comes from PollisDatasets.

## Actions

| Group | Actions |
| --- | --- |
| Visualise | **Document Similarity**, **Term Space** |
| Diagnose | **Variance Explained**, **Reconstruction Error** |
| Predict | **Query Documents**, **Fold-In New Doc** |
| Compare | **Compare k Values**, **Raw vs TF-IDF** |
| Interpret | **Top Terms per Topic**, **Document-Topic Mix** |

Each action rebuilds the corpus from **Corpus** and computes its own SVD.

## Uses

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) tested the method on two standard document collections with queries and relevance judgements, MED and CISI. Queries were placed in the space as pseudo-documents, and documents were ranked by their cosine with the query. [Dumais (2004)](#ref-Dum2004a) reviews the applications of LSA, among them information retrieval, information filtering and cross-language retrieval, as well as its use in modelling human memory and the computational issues it raises.

## Wikis and notebooks

The Factsheet lists the inputs, the preparation of the corpus and the output. Assumptions covers the term-document matrix and the linear model behind the SVD, Diagnostics the variance and the reconstruction error, Interpretation the dimensions, documents and terms, and the Decision Guide the choices of the panel. SVD and Dimensionality describe the decomposition and the number of dimensions.

The notebook LSA covers latent semantic analysis by truncated SVD of a TF-IDF matrix with TextAnalysis.jl and LinearAlgebra.jl.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

<a id="ref-Dum2004a"></a>Dumais, S. T. (2004). Latent Semantic Analysis. *Annual Review of Information Science and Technology* 38(1), 188-230. [doi:10.1002/aris.1440380105](https://doi.org/10.1002/aris.1440380105)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SVD](svd.md) · [Dimensionality](dimensionality.md)
