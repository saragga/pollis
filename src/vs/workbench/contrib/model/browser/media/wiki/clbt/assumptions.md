# Assumptions

Retrieval has no fitted statistical model in this panel, but each result still rests on assumptions about the language, the labels and the scale of the test.

## What a Pretrained Model Assumes

The checkpoint is used as it stands, with no training on the corpus. It was trained on web passages and search-style questions in English. Texts on Homer and Confucius differ in names and style, and an unfamiliar name may split into fragments that carry little meaning. Quality on a specialist domain cannot be assumed from published benchmarks. Testing on labelled queries from that domain is the only direct evidence. Translation is a further limit, as a checkpoint of this kind expects English input.

## What the Token-Sum Score Assumes

MaxSim treats each query token as an independent request that one passage token can satisfy. A passage that covers each term somewhere can score well even when the parts have nothing to do with each other. Word order, negation and logic come only through context in the encoder, so "not" may be poorly handled. A question requiring facts from two passages is also outside it. [Khattab and Zaharia (2020)](#ref-KZ2020a) argue for the score on grounds of speed and quality, and not as a model of understanding.

## What the Relevance Labels Assume

Eight queries have labels written for this corpus, and each label is a judgement. Should a query about a hero's journey home accept all four passages on Odysseus? The code says yes, and another judge might not. Unlabelled good results count as misses. Many of the queries are also deliberately phrased with words other than those in the passages, which is a design that favours semantic retrieval over term matching. [Manning, Raghavan and Schütze (2008)](#ref-MRS2008a) discuss how test collections and judgements shape results.

## Why Eight Queries Cannot Settle a Comparison

Means over eight queries move in large steps. One changed query shifts MRR by up to 0.125. With a corpus of 24 passages, a random ranking also has a fair chance of a hit in the top 5. Differences here illustrate the method, and do not rank systems. Published comparisons use collections with thousands of queries. A statistical test would need far more queries, and a paired design with the same queries for each system. Treat a tie as the expected outcome of such a small test.

## What the BM25 Baseline Assumes

Okapi BM25 assumes that shared terms signal relevance. Word frequency in a passage helps with saturation, and rare terms carry more weight. Stemming and stopword removal in the code are choices that change results, and so are the parameters k1 and b. On a very short corpus, document-frequency statistics are weak. [Robertson and Zaragoza (2009)](#ref-RZ2009a) give the framework. A tuned BM25 could do better than the baseline, so a win against a fixed configuration says little about BM25 in general.

## What Exact Scores and the Index Assume

The index assumes that a compressed vector keeps MaxSim scores close to exact. It also assumes that relevant passages have tokens in the probed clusters, or they never become candidates. Both hold well in published runs on large collections, and neither has been tested here beyond a check on the returned passages. **Compression Check** compares only passages that were retrieved. A relevant passage that the index failed to retrieve does not appear in that test. **Score Heatmap** gives exact scores on all passages, which fills that gap.

## References

<a id="ref-KZ2020a"></a>Khattab, O. and Zaharia, M. (2020). ColBERT: efficient and effective passage search via contextualized late interaction over BERT. *SIGIR*. [arXiv:2004.12832](https://arxiv.org/abs/2004.12832)

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

## See Also

- [Factsheet](factsheet.md) · [Late Interaction](late-interaction.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
