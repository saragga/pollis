# Interpretation

Output is a ranked list with a score beside each passage. The rank carries most of the meaning, and the size of a score carries much less.

## What a ColBERT Score Means

A score is a sum of cosines over query tokens, so its maximum is about the number of query tokens. All queries are padded to the same length, and a share of the sum comes from that padding. A score says that one passage is a better match than another for this query. It is not a probability of relevance. Comparing scores across queries, or across checkpoints, is unsafe, and a fixed threshold for a "good" score has no general basis.

## How to Read Recall and Reciprocal Rank

Recall@k says how much of the relevant set was found, so it matters when a user wants everything. MRR says how soon the first good result appears, so it matters when one answer is enough. Each treats relevance as yes or no, and neither sees how ranks differ past the first hit. Normalised discounted gain handles graded labels, as in [Järvelin and Kekäläinen (2002)](#ref-JK2002a). Interpret values with k in mind: with one to four relevant passages per query, Recall@5 depends on how many the query has.

## How to Read the Comparison with BM25

**vs BM25** gives a bar for each system on both metrics. A lead for ColBERT on these queries suggests that it copes with paraphrase, and that is partly by design of the labels. **BM25 + ColBERT** shows what re-ranking adds to a term-matching first stage. If BM25 finds nothing relevant in its candidates, ColBERT cannot help, as **Re-rank BM25** states when it prints missed passages. Two-stage systems are common because the first stage is cheap, and [Robertson and Zaragoza (2009)](#ref-RZ2009a) cover that classical stage.

## How to Read the Heatmap

**Score Heatmap** has passages along one axis and queries along the other, with relevant cells circled. A strong system shows circled cells as bright within their row. Compare within a row and not across rows, as rows have different scales. A column that is bright for all queries is a passage that matches many tokens in general, which is called a hub. Clusters of bright cells near the circles often reveal passages on the same topic, as with two passages on the same epic.

## How to Read the Token Breakdown

**MaxSim Breakdown** shows which query tokens found strong matches, and with what. High values on content words are a reasonable explanation of why a passage was chosen. Matches are local, and they are computed in context, so a match between two different words can still be right. A breakdown accounts for the score and not for meaning, and a high share from a [MASK] token resists easy explanation. A breakdown can show why a system was wrong as readily as why it was right.

## What the Results Do Not Say

A top-ranked passage matches the query under this model, and may still be wrong or out of date. Retrieval does not check truth, and it does not answer the question. On a corpus of 24 passages, the top result is sometimes the least bad, and search always returns k passages, so weak results appear even when nothing fits. For a treatment of language models and retrieval in context, see [Jurafsky and Martin (2024)](#ref-JM2024a). Conclusions apply to this corpus and to these queries.

## References

<a id="ref-JK2002a"></a>Järvelin, K. and Kekäläinen, J. (2002). Cumulated gain-based evaluation of IR techniques. *ACM Transactions on Information Systems* 20(4), 422–446. [doi:10.1145/582415.582418](https://doi.org/10.1145/582415.582418)

<a id="ref-JM2024a"></a>Jurafsky, D. and Martin, J. H. (2024). *Speech and Language Processing*, 3rd ed., draft. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

## See Also

- [Factsheet](factsheet.md) · [Late Interaction](late-interaction.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
