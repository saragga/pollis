# Diagnostics

There is no fit to test, so the checks look at the vocabulary, at what the weights emphasise, and at whether a known query brings back the right documents.

## How to Read the Sparsity Report

**Sparsity Report** prints the share of zero entries, 1 − nnz / (D × V). Values above 95% are normal for text, and it is the reason for storing the matrix in sparse form with `dtm(m, :sparse)`. Very high sparsity with short documents means little overlap among rows, so that similarity scores become unreliable. A low value on a large corpus can signal repeated text. Dense forms such as `Matrix(tf_idf(m))` need D × V numbers, so check the product before running an action on a large corpus.

## How to Read the Vocabulary Report

**Vocabulary Report** gives V, D and the mean number of tokens per document. A vocabulary close to the total number of tokens suggests noise or very short texts. Word frequencies usually follow a steep curve, with a few frequent words and many rare ones. A large fraction of terms that occur only once is normal, and these terms add columns without helping comparison. Removing them is common. A very low mean length warns that weights rest on few words.

## How to Check the Cleaning Worked

**Term Frequency Bar Chart** should show meaningful words. Stop words in the top 20 mean the list missed them, perhaps for another language. Boilerplate, such as page headers or a repeated phrase, shows up at the top. Fragments from split words or stray digits suggest problems in the cleaning. Fix the text and rerun, as the later steps inherit any such mistake. In **Top Terms Per Document**, a list of typos or file names has the same cause.

## How to Check the Weights

A term in every document should get ln(D / D) = 0 in **IDF Weights**, and a term in one document should get ln D, the maximum. Many terms tie at that maximum, so the top 10 printed are only some of them. **DTM vs TF-IDF** shows counts beside weights for one document: a zero count must give a zero weight. A hand calculation on a very small corpus, as in [TF-IDF](tf-idf.md), confirms which variant the package uses. Do so before reporting weights.

## How to Check the Ranking

The scores need ground truth to be judged, and a simple test is a query taken from a known document. That document should rank high. Measures such as precision at k or mean average precision need relevance judgements, which [Manning, Raghavan and Schütze (2008)](#ref-MRS2008a) describe in detail. **TF-IDF vs BM25** gives a cheap check on stability, as heavy disagreement in the top 5 calls for reading those documents. Zero scores for all documents mean that the query has no term in the vocabulary, and the sort order is then arbitrary.

## How to Check the Query Handling

Run **Query Vector**, and see how many terms have non-zero counts. Stop words have no column, and so "and" and "the" count for nothing. A capitalised word in the query misses, because `dtv` gets the raw string, while the corpus was lowered. Clean a query in the same way as the corpus, with a `prepare!` call on the query document. Compare the sum of the vector with the query's word count, and the gap shows how many words were lost.

## References

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [TF-IDF](tf-idf.md) · [BM25](bm25.md)
