# Assumptions

No statistical model is being fitted here, but the representation takes several things for granted. Each one loses information, and each one can suit a task or harm it.

## What a Bag of Words Assumes

Order is dropped, so that "dog bites man" and "man bites dog" have the same row. Terms are treated as separate axes, unrelated to one another. Negation is lost, and "not good" contributes both words. For finding documents on a topic, these losses often matter little, as the topic shows in the choice of words. For sentiment, questions and any task that turns on grammar, they can matter a great deal. Word n-grams recover some order, at the price of a much bigger vocabulary.

## What the Cleaning Assumes

`prepare!` removes punctuation, case and stop words. Stop-word lists assume English, and they assume that very common words carry no information about a task. Removing case merges "SEC" and "sec". Removing punctuation can break codes, such as "C++" or "10-K". Stemming is not applied, so "filing" and "filings" stay apart. [Manning, Raghavan and Schütze (2008)](#ref-MRS2008a) discuss how such choices trade precision against recall in search. Check them against your own corpus, rather than accepting the code's defaults.

## What Corpus-Level Weights Assume

IDF depends on the corpus, so the same word can be rare in one collection and common in another. A term's weight only has meaning within its collection. Adding documents changes df, and thus every weight in principle. New documents and queries are represented with the vocabulary already built, and unseen terms are dropped. The method therefore assumes that the corpus is a fair picture of the texts to come. A vocabulary shift over time weakens it.

## What the Document Split Assumes

The unit of a document is a choice, and it drives all the counts. Default sections in the guide are short and focused. A whole book as one document blurs its topics, and single sentences give very sparse rows. Length normalisation in BM25 also assumes that documents are broadly comparable in kind, with avgdl a sensible reference. A corpus with some very long and many very short documents may need to be split further, so that the mean makes sense.

## What Term Independence Assumes

Scores add across query terms, as if terms gave separate evidence. BM25's derivation states that assumption openly, as [Robertson and Zaragoza (2009)](#ref-RZ2009a) describe, and it is plainly false for phrases: "stock" and "market" tend to occur together. The method works well in practice even so. Such a scoring rule gets the order right more often than it gets probabilities right, so that a score is not a calibrated probability of relevance.

## References

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
