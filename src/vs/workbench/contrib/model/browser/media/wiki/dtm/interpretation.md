# Interpretation

A cell's value says how much a term stands out in a document, under a chosen weighting. Reading results well means keeping in mind which table is at hand, and what a score can be compared with.

## How to Read the Count Matrix

A row shows what one document uses, and a column shows where one term occurs. Row totals are document lengths, after cleaning. Column totals are the corpus counts behind **Term Frequency Bar Chart**. These figures describe word use and do not measure importance: frequent words may be generic within the subject. The counts are comparable across documents only after allowing for length, since a long document naturally has larger values.

## How to Read TF-IDF Weights

A high weight means frequent here and rare elsewhere. **Top Terms Per Document** lists the highest terms, and a good list reads like a set of keywords for that document. Weights can be compared within a corpus and within a scheme, and not across corpora, as idf changes with the collection. A weight of zero means either that the term is absent or that it occurs in every document, which the raw count can tell apart. In **TF-IDF Heatmap**, the columns are term indices, so the picture shows structure and not specific words.

## How to Read IDF Weights

**IDF Weights** ranks terms by rarity. The top of the list holds terms in a single document, which have idf = ln D, so these are not always the most useful ones, and many are typos or names. Words of medium df are often the most useful for separating groups of documents. Rarity also says nothing about relevance to a question. A term of low idf can still matter a lot, when a query is about the subject of the entire corpus.

## How to Read Similarity Scores

**Cosine Similarity** gives a value from 0 to 1 for each document, and `sortperm` gives the ranking. Zero means no shared term, and 1 means the same direction. Scores between 0 and 1 have no absolute scale: 0.4 may be high with short queries, and low with long ones. Compare them within one query. A ranking says which documents use the query's terms in the most concentrated way, and this is a proxy for relevance. It does not mean that the top document answers the question.

## How to Read BM25 Scores

BM25 scores are unbounded and depend on the query and the corpus. Comparing scores across queries is generally not meaningful, because a query with rare terms or more terms scores higher. Within one query, the order and the size of gaps can be read: a large drop after the first few documents suggests a clear match. **TF-IDF vs BM25** prints only document indices, so that its differences are in rank alone. Read the documents involved before deciding which ranking is better.

## What the Results Do Not Say

Weights report word use, and they do not say what a document claims, or whether it is right. A top rank does not establish relevance without judgement by a reader. The semantic reach of the method is small, and synonyms get no credit: a matching document in other words scores zero, as [Jurafsky and Martin (2024)](#ref-JM2024a) discuss when motivating vector semantics. Nor does a good result on the default corpus carry over to other text, as both the vocabulary and the weights are specific to it.

## References

<a id="ref-JM2024a"></a>Jurafsky, D. and Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). Pearson. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [TF-IDF](tf-idf.md) · [BM25](bm25.md)
