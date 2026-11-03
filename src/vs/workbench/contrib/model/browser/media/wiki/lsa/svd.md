# Latent Semantic Analysis: SVD

The singular value decomposition splits the TF-IDF matrix into document vectors, singular values and term vectors. Truncating it to k dimensions gives LSA its latent space.

## The decomposition

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) write the SVD of a term by document matrix X as

X = T₀ S₀ D₀ᵀ,

where T₀ and D₀ have orthonormal columns, the left and right singular vectors, and S₀ is diagonal, the singular values. By convention the singular values are ordered by size. They note that the decomposition is unique up to certain row, column and sign permutations.

The panel's matrix M has documents as rows, so its `svd(M)` returns U for the documents, S for the singular values and V for the terms: U plays the part of D₀ and V that of T₀.

## Truncation

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) keep the first k singular values and set the others to zero. The product of the reduced matrices is

X̂ = T S Dᵀ,

of rank k, which they call the rank-k model with the best possible least-squares fit to X. Deleting the zero rows and columns of S₀, and the matching columns of T₀ and D₀, gives the smaller matrices T, S and D.

The panel's main code keeps `U_k = U[:, 1:k]`, `S_k = S[1:k]` and `V_k = V[:, 1:k]`, and **Reconstruction Error** forms U_k Diagonal(S_k) V_kᵀ.

## Coordinates for comparisons

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) derive three kinds of comparison from X̂:

| Comparison | Coordinates |
| --- | --- |
| term with term | rows of TS |
| document with document | rows of DS |
| term with document | rows of TS^½ and DS^½ |

The panel's document vectors, U_k S_k, follow the second row of the table, and **Document Similarity** and **Query Documents** take cosines between them.

## Pseudo-documents

For a query or new document with term vector X_q, [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) derive the representation

D_q = X_qᵀ T S⁻¹,

chosen so that putting in a real document of the matrix gives back its own row of D when the model is exact. With appropriate rescaling of the axes, they explain, the pseudo-document is placed at the centroid of its term points; scaled by S, D_q can be compared with documents.

## Fold-In New Doc

**Fold-In New Doc** counts the terms of `new_text` that are in the vocabulary, dropping unseen terms, and weights them as in the decomposed matrix: term counts divided by the document's length, the term frequency of the TextAnalysis.jl documentation, and multiplied by the weight that `tf_idf` gave each term in the corpus, read off the matrix as tf_idf / tf. It then computes

u = S_k⁻¹ V_kᵀ v,

which the code comment describes as comparable with the rows of U_k. The new text is cleaned with the same `prepare!` steps as the corpus.

## Computation

The panel computes the full SVD of the dense TF-IDF matrix with `svd` from LinearAlgebra and reads the first k columns.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) fitted their model with PARAFAC, a program for the iterative numerical solution of multi-mode factor analysis problems, and note that other programs for the standard SVD were also available. [Dumais (2004)](#ref-Dum2004a) reviews the computational issues of LSA among its topics.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

<a id="ref-Dum2004a"></a>Dumais, S. T. (2004). Latent Semantic Analysis. *Annual Review of Information Science and Technology* 38(1), 188-230. [doi:10.1002/aris.1440380105](https://doi.org/10.1002/aris.1440380105)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dimensionality](dimensionality.md)
