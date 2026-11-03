# Latent Semantic Analysis: Interpretation

How to read the output of the **Latent Semantic Analysis** panel: documents and terms as points in a k-dimensional space, their similarities as cosines, and the dimensions through their highest-loading terms.

## Documents in the space

**Document-Topic Mix** computes `doc_weights = U_k S_k`, the weight of each document on each latent dimension, prints its size, documents × k, and shows the weights of the first 10 documents on the first 5 dimensions. **Document Similarity** uses the same vectors.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) show that the document-to-document dot products of the rank-k matrix are the dot products between rows of DS, the right singular vectors scaled by the singular values, so the rows of DS serve as coordinates for documents. In the panel, where rows are documents, U_k S_k plays the part of DS. The comment of **Document Similarity** adds that unscaled U_k would weight every dimension equally.

## Similarity

**Document Similarity** normalises each row of U_k S_k to unit length and multiplies the result by its transpose, giving the cosine similarity of every pair of documents.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) return the documents with the highest cosines to a query, the nearest vectors in the space. They note that, by virtue of the dimension reduction, documents with somewhat different profiles of term usage can be mapped into the same vector of factor values.

## Terms in the space

**Term Space** plots every term on the first two dimensions, as a row of V_k S_k, and labels the 20 terms farthest from the origin.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) use the rows of TS as coordinates for terms when comparing two terms, and TS^½ and DS^½ when comparing a term with a document. They write that no single configuration of points allows both kinds of comparison, but the configurations differ only by a stretching or shrinking of the axes.

## The dimensions

**Top Terms per Topic** prints, for each of the first five dimensions, the ten terms with the largest absolute loading in V.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) made no attempt to interpret the underlying factors or to rotate them to a meaningful orientation. Their aim was not to describe the factors verbally but to represent terms, documents and queries in a way that escapes the unreliability, ambiguity and redundancy of individual terms.

## Close without shared words

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) explain that terms that did not appear in a document may still end up close to it, if that is consistent with the major patterns of association in the data. Position in the space then serves as a new kind of semantic indexing.

**Query Documents** ranks all documents by their cosine with document `query_idx` in the space, from the most similar to the least.

## Synonymy and polysemy

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) describe LSA as dealing nicely with synonymy and as offering a partial solution to polysemy. A word with several entirely different meanings is a single point, a weighted average of those meanings. They contrast this with classical term overlap methods, in which the meaning of a term is the union of all its meanings.

[Dumais (2004)](#ref-Dum2004a) reviews applications that build on this representation, among them information filtering and cross-language retrieval.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

<a id="ref-Dum2004a"></a>Dumais, S. T. (2004). Latent Semantic Analysis. *Annual Review of Information Science and Technology* 38(1), 188-230. [doi:10.1002/aris.1440380105](https://doi.org/10.1002/aris.1440380105)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [SVD](svd.md) · [Dimensionality](dimensionality.md)
