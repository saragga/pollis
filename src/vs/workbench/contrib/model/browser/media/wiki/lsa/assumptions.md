# Latent Semantic Analysis: Assumptions

What LSA takes for granted about words and documents, and what the code of the **Latent Semantic Analysis** panel assumes about its corpus.

## A latent structure in word use

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) assume that there is an underlying latent semantic structure in the data that is partially obscured by the randomness of word choice. A document, in their analogy, is a small selection from the complete discourse that might have been written on its topic, so its terms are a fallible observation of the terms that apply to it.

If term occurrences were uncorrelated, they explain, the term by document matrix could not be used to correct its own errors. When the occurrence of some words is a strong clue to the occurrence of others, one part of the table can be used to correct other parts.

## Counts in a matrix

The method starts from a matrix of term-document associations. In the tests of [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a), each cell held the frequency with which a term occurs in a document, so the order of the words within a document plays no part.

The panel's matrix holds TF-IDF weights instead, with documents as rows and terms as columns. [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) note that their equations do not take preprocessing or reweighting into account, and that such reweighting might be used to prevent documents of different length from having different effects on the model, or to express which terms are more important.

## A Euclidean space

The SVD places terms and documents as points in a k-dimensional space, compared by dot products or cosines. [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) call the model of a Euclidean space at best a useful approximation: conceptual relations among terms and documents involve more complex structures, such as local hierarchies and non-linear interactions between meanings.

More complex relations can often be fitted approximately by increasing the number of dimensions, with different parts of the space used for different parts of the language.

## One point per term

Every term is a single point in the space. [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) write that the method deals nicely with the synonymy problem, the many ways of referring to the same object.

For polysemy, a word with several meanings, they describe the method as a partial solution. A word such as "bank" is represented as a weighted average of its different meanings, and the meaning of a word in a document can still be conditioned by the other words of the document and of the query.

## Preparing the text

The panel removes punctuation and case before building the vocabulary, and keeps every remaining term.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) indexed the title and abstract of each document and kept all terms that occurred in more than one document and were not on a stop list of 439 common words; they did not stem words. In a footnote, they explain that terms occurring in only one document, or equally frequently in all documents, have little or no influence on the SVD solution. The TextAnalysis.jl documentation of [JuliaText Contributors (2023)](#ref-JTC2023a) describes TF-IDF as giving zero weight to the words that occur in all documents.

## Dimensions to keep

The panel keeps the first k dimensions, those with the largest singular values. [Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) keep the k largest singular values and set the rest to zero, which gives the rank-k matrix closest to the original in the least-squares sense.

They also assume that the reduced space should not reconstruct the original term space perfectly, because they regard the original term space as unreliable. The Dimensionality page describes how they chose k.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SVD](svd.md) · [Dimensionality](dimensionality.md)
