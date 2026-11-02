# Diagnostics

Diagnostics separate three questions: whether the right passages were retrieved, whether the index damaged the scores, and whether the system's reasons make sense.

## How to Measure Retrieval Quality

**Recall and MRR** prints Recall@k and RR@k per query and their means, then names the weakest query. Recall says how many of the relevant passages were found, and RR says how soon the first one appeared. Read per-query values first, as a mean can hide one complete failure. A query with one relevant passage has a Recall@k of 0 or 1. Reciprocal rank, used for question answering by [Voorhees (1999)](#ref-Voo1999a), rewards an early hit and ignores all after it.

## How to Check for Compression Loss

**Compression Check** prints index and exact scores for each returned passage, the gap between them, a correlation, and whether the order agrees. Small gaps with the same order mean that compression has done no harm for this query. A consistent offset matters less than a change of rank. Correlation over k = 5 points is unstable, so read the gaps first. Repeat with several queries, as one query is thin evidence, and note that passages the index failed to return are not tested.

## How to Spot Retrieval Misses

**Score Heatmap** computes exact scores for all query-passage pairs, and circles the relevant ones, and it prints how many queries have a relevant passage scoring highest. Compare that count with the result of **Recall and MRR**. If an exact scan finds a passage that the index misses, the fault lies in probing, and a larger `nprobe` may help. If the exact scan also misses it, the fault lies in the model or in the label, and no search setting will fix it.

## How to Check Why a Passage Ranked High

**MaxSim Breakdown** lists query tokens, their matched passage token and the similarity. Good results show content words matching related terms. Warning signs are scores carried by [MASK] tokens or by function words, and many tokens matching one passage token. The figure shows the contributions together, and the score printed should equal their sum, as a check on the arithmetic. Run the same action on a wrong result, as a comparison often shows which word misled the system.

## How to Test the Effect of Padding

**Query Analysis** prints the tokens, the number of [MASK] tokens, and the top k with and without them. It also gives the share of the top score due to masks. A large share is normal, since masks are numerous, and it should not be read as a fault in itself. A change in the ranking shows that the augmentation matters to this query. When labels exist, recall with and without gives a small test of value.

## How to Handle Failures in the Run

A search that fails on a large **Top-k** has too few candidates, so reduce k, or raise `nprobe`. Failing at **Re-rank BM25** may mean **BM25 Candidates** is below **Top-k**. A slow first run is expected, as the checkpoint is large and a CPU encodes slowly. A partial download leaves a file in **Checkpoint Folder** that is skipped by `isfile` the next time, so delete a damaged file. BM25 scores of 0 share no stemmed term with the query, and their order is arbitrary.

## References

<a id="ref-Voo1999a"></a>Voorhees, E. M. (1999). The TREC-8 question answering track report. *Proceedings of the Eighth Text REtrieval Conference*. National Institute of Standards and Technology. [trec.nist.gov](https://trec.nist.gov/pubs/trec8/papers/qa_report.pdf)

## See Also

- [Assumptions](assumptions.md) · [Index Structure](index-structure.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
