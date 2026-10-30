# Interpretation

## The Score of a Passage
With both searches, a score is the reciprocal rank fusion of [Cormack, Clarke and Büttcher (2009)](#ref-CCB2009a): the sum of 1 / (60 + r) over the two lists, r being the passage's rank in each:
- **First in both**: 2 / 61, about 0.033, the highest there can be.
- **First in one, absent from the other**: 1 / 61, about 0.016.

So a score says how high the two searches placed a passage, not how relevant it is: the first passage of a collection that does not hold the answer scores as much as the first of one that does. Compare scores within one search, never between questions.

When the search ran by words only, the score is BM25's own, which has no upper limit and depends on the question and the collection.

## The Order of the Passages
Reciprocal rank fusion favours passages both searches agree on. Each search keeps 20 passages, so a passage in both lists always comes before a passage in only one: even 20th in both, 2 / 80 = 0.025, it passes one first in a single list, 1 / 61, about 0.016. A passage found by one search only is often a sign of what that search is good at: an exact term by words, a paraphrase by meaning.

The fused list holds at most 40 passages, and fewer the more the two searches agree. Asking for more **Passages** than that gives no more.

## The Reranker's Scores
After **Rerank**, each passage shows the reranker's score and where it was before. A passage that moved far up was read as an answer though it was not close in words or embedding, which is the reranker's use; one that moved far down was similar without answering. The scale depends on the reranker, so compare scores only within one reranking, never between rerankers.

## The Answer
The numbers in an answer are the passages it was given, in their order. A click on a source opens its document, at its page for a PDF. Read them as follows:
- **A sentence with a citation**: the model says the passage supports it. That is a claim to check, not a proof.
- **A sentence without one**: it may be a connecting remark, or it may come from the model's memory.
- **"The passages do not say"**: often the right result, and worth more than an answer. Search again in other terms before believing it.

## The Length of the Passages
The passages are cut to about the length chosen, not exactly, since they are cut at paragraphs and sentences. With a longer length there are fewer of them, each with more around its answer: a model has more to read, and the search a blunter target. If the page says the index was cut to another length, the passages shown and searched are still the old ones until the index is built again.

## References

<a id="ref-CCB2009a"></a>Cormack, G. V., Clarke, C. L. A. and Büttcher, S. (2009). Reciprocal rank fusion outperforms Condorcet and individual rank learning methods. *SIGIR*, 758–759. [doi:10.1145/1571941.1572114](https://doi.org/10.1145/1571941.1572114)

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md) · [Decision Guide](decision-guide.md)
