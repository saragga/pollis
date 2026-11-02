# TF-IDF

TF-IDF gives a high weight to a term that is frequent in a document and rare in the corpus. Common words fall towards zero, and distinctive words rise.

## Where the Idea Comes From

Two observations combine. [Luhn (1957)](#ref-Luh1957a) argued that the frequency of a word within a text signals how much it matters to that text. [Spärck Jones (1972)](#ref-Jon1972a) added that a term used in many documents is a poor way to pick one out, and proposed weighting by the rarity of the term across the collection. Multiplying the two gives the weight. Nothing about the meaning of words is used, only where they occur.

## How the Weight Is Computed

In the most common form, with D documents and df(t) documents containing t:

- idf(t) = ln(D / df(t))
- weight(d, t) = tf(d, t) × idf(t)

Take the corpus "cat sat", "cat ran", "dog ran", with D = 3. Then cat and ran have df = 2, so idf = ln(1.5), about 0.405. Dog and sat have df = 1, so idf = ln 3, about 1.099. A term in every document has idf = ln 1 = 0, and it disappears altogether.

## Which Variant the Panel Uses

Term frequency and rarity each come in several forms. [Salton and Buckley (1988)](#ref-SB1988a) compared many combinations on test collections, and found that the best one depends on the collection.

| Choice | Forms |
|---|---|
| Term frequency | Count, share of the document, 1 + log count |
| Rarity | ln(D / df), smoothed forms that add 1 |
| Normalisation | None, unit length |

`tf_idf(m)` follows the conventions of `TextAnalysis.jl`, which should be checked in its documentation. **IDF Weights** computes plain ln(D / df) itself, so those numbers need not match the factors inside `tf_idf`.

## How Cosine Similarity Compares Documents

The cosine of the angle between two vectors is their dot product divided by their lengths. Since weights are not negative, it lies between 0 and 1, and a long document does not win through size alone. With plain idf and counts, the query "cat" scores against the corpus thus:

| Document | Vector norm | Cosine |
|---|---|---|
| "cat sat" | 1.171 | 0.346 |
| "cat ran" | 0.573 | 0.707 |
| "dog ran" | 1.171 | 0 |

"cat ran" wins, because its other term is less distinctive. **Cosine Similarity** applies the same formula.

## How a Query Should Be Treated

A query must pass through the same steps as the documents, or else its terms miss. `dtv(query, lexicon(crps))` counts the query's terms over the corpus vocabulary, so any term outside it is ignored. The text of a query is not cleaned in the code, so that capitals or punctuation can stop a match. **Query Vector** advises weighting by IDF before comparing, while **Cosine Similarity** uses the raw counts of the query against weighted documents, which is one of the schemes in use. If no query term is in the vocabulary, all scores are zero.

## Where TF-IDF Falls Short

A term's count rises linearly, so 20 uses count twice as much as 10, even though the second 10 add little evidence. The weight has no idea of synonyms: "car" and "automobile" are unrelated axes. Long documents contain more terms, and normalisation can overshoot: [Singhal, Buckley and Mitra (1996)](#ref-SBM1996a) found that it favours short documents too strongly. Rarity also favours typos and one-off terms. BM25 deals with the first and third of those, and embeddings deal with the second.

## References

<a id="ref-Luh1957a"></a>Luhn, H. P. (1957). A statistical approach to mechanized encoding and searching of literary information. *IBM Journal of Research and Development* 1(4), 309–317. [doi:10.1147/rd.14.0309](https://doi.org/10.1147/rd.14.0309)

<a id="ref-SB1988a"></a>Salton, G. and Buckley, C. (1988). Term-weighting approaches in automatic text retrieval. *Information Processing & Management* 24(5), 513–523. [doi:10.1016/0306-4573(88)90021-0](https://doi.org/10.1016/0306-4573(88)90021-0)

<a id="ref-SBM1996a"></a>Singhal, A., Buckley, C. and Mitra, M. (1996). Pivoted document length normalization. In *Proceedings of the 19th Annual International ACM SIGIR Conference on Research and Development in Information Retrieval*, 21–29. [doi:10.1145/243199.243206](https://doi.org/10.1145/243199.243206)

<a id="ref-Jon1972a"></a>Spärck Jones, K. (1972). A statistical interpretation of term specificity and its application in retrieval. *Journal of Documentation* 28(1), 11–21. [doi:10.1108/eb026526](https://doi.org/10.1108/eb026526)

## See Also

- [Factsheet](factsheet.md) · [BM25](bm25.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
