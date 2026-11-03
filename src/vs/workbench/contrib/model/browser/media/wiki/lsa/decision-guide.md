# Latent Semantic Analysis: Decision Guide

Choices in the **Latent Semantic Analysis** panel: the number of dimensions, the weighting of the matrix, how to place new documents, and the action that answers a given question.

## Number of dimensions

The tooltip of **Dimensions (k)** gives 50–300 as the typical range, and the panel's second bullet describes k as a trade-off between noise reduction and information loss.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) write that the choice of k is critical: large enough to fit all the real structure in the data, small enough not to fit the sampling error or unimportant details. They used an operational criterion, the value of k that gave good retrieval performance, and reported results from a 100-factor space. The Dimensionality page gives the details.

## Comparing values of k

**Compare k Values** computes the Frobenius error of the rank-k approximation for k = 10, 25, 50, 100 and 200, keeping only values no larger than the rank, and plots it against k; the code comment calls it an elbow plot for the choice of k.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) note that the SVD solutions are nested: to explore a 10-dimensional solution, they used only the first 10 coordinates of the 100-factor solution. The panel's actions likewise read the first k columns of one SVD.

## Raw counts or TF-IDF

**Raw vs TF-IDF** decomposes both the raw count matrix and the TF-IDF matrix and prints, for each, the sum of the k largest squared singular values.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) analysed a matrix of raw term frequencies in their tests and note that reweighting can prevent documents of different length from having different effects, or express which terms matter more. The TextAnalysis.jl documentation of [JuliaText Contributors (2023)](#ref-JTC2023a) gives the same two reasons for TF-IDF: some documents are longer than others, and some words are more frequent than others.

## New documents

**Fold-In New Doc** places a new text in the existing space without a new SVD; the SVD page describes the computation.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) call such objects pseudo-documents. They explain that folding-in gives a somewhat different space than including the new documents in the original analysis would have, and that how much updating can be done without a new decomposition is an open question. A new SVD of the whole corpus includes the new document in the analysis itself.

## Which action to use

| Question | Action |
| --- | --- |
| Which documents are alike? | **Document Similarity** |
| How are the terms arranged? | **Term Space** |
| How much does each dimension keep? | **Variance Explained** |
| How far is the rank-k matrix from the original? | **Reconstruction Error** |
| Which documents are nearest to a given one? | **Query Documents** |
| Where does a new text fall? | **Fold-In New Doc** |
| How many dimensions? | **Compare k Values** |
| Does the weighting matter? | **Raw vs TF-IDF** |
| What does each dimension stand for? | **Top Terms per Topic** |
| How does each document load on the dimensions? | **Document-Topic Mix** |

## Reading further

The panel lists [Jurafsky and Martin (2024)](#ref-JM2024a) and [Manning, Raghavan and Schütze (2008)](#ref-MRS2008a) as textbooks. [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) is the original paper on latent semantic indexing, and [Dumais (2004)](#ref-Dum2004a) a review of latent semantic analysis that covers its applications to information retrieval, filtering and cross-language retrieval, its relation to models of human memory, and its computational issues. The software entry is [JuliaText Contributors (2023)](#ref-JTC2023a).

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

<a id="ref-Dum2004a"></a>Dumais, S. T. (2004). Latent Semantic Analysis. *Annual Review of Information Science and Technology* 38(1), 188-230. [doi:10.1002/aris.1440380105](https://doi.org/10.1002/aris.1440380105)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [web.stanford.edu](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [SVD](svd.md) · [Dimensionality](dimensionality.md)
