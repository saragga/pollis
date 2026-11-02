# Interpretation

Embedding outputs are relative quantities. A similarity or a position means something only by comparison with others from the same model and the same pooling.

## How to Read a Cosine Similarity

The **Similarity** tab prints a cosine between -1 and 1. A cosine has no fixed scale across models. With a plain BERT, a high value is common, even for unrelated text, so the printed number alone tells little. Always read it next to an unrelated baseline from the same model. With a checkpoint trained for similarity, values spread more widely, and high ones carry more meaning. A score is also not a probability, so a statement like "83% similar" has no basis.

## How to Read a Similarity Heatmap

**Similarity Heatmap** plots all pairs in `docs`. The diagonal is 1 by construction. Read contrasts: blocks of higher values show groups of related sentences, and lighter areas show weaker links. The printed mean of the off-diagonal entries is a useful summary of the baseline. Heatmap colours stretch to fit the data, so strong colour differences may reflect a narrow range of values. Order the documents by topic to make the blocks visible, as the demo list already does.

## How to Read Nearest Neighbours

**Nearest Neighbour** lists the closest five documents to `query`, and **Top Similar Docs** the closest three to each of `queries`. Rankings are more reliable than values, which change with the model. A list always comes back, even when nothing in `docs` is relevant, so a top result is no proof of relevance. Check it by eye. Short queries and long documents differ in shape, and retrieval quality often improves when questions and passages have been embedded by a model trained for such pairs, as in the work of [Reimers and Gurevych (2019)](#ref-RG2019a).

## How to Read an Embedding Scatter

**Embedding Scatter** is a linear view of a high-dimensional cloud, with each axis labelled by its share of variance. Close points are similar along the two axes, and they may be different in others. Clusters in a plot with a good share of variance are worth a closer look. With few documents, points may look well separated by chance. Scales of the two axes differ, so distance across the plot is not uniform. Check any apparent grouping against the similarity values.

## How to Read Token Attribution

**Token Attribution** prints gradient times input for each token, for the norm of the `[CLS]` output. A large positive score means that scaling up that token's input would raise the norm, and a negative one means it would lower it. Scores do not explain any task or the meaning of the sentence, as a vector's norm is not a judgement about anything. For an attribution with practical meaning, change `target` to the quantity of interest, such as a similarity with a chosen sentence. A local gradient can mislead when a network saturates, and [Sundararajan, Taly and Yan (2017)](#ref-STY2017a) motivate a path-based method on that ground.

## What an Embedding Does Not Say

A close vector means similar use in the training text, not the same truth. A sentence and its opposite can sit close, since they share a topic, a form and most of their words. Numbers, dates and named entities can be swapped with little change in a mean-pooled vector. [Rogers, Kovaleva and Rumshisky (2020)](#ref-RKR2020a) review such limits, including handling of negation. For decisions where these matter, an embedding is a first filter, and a further step or human check should follow.

## References

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

<a id="ref-RKR2020a"></a>Rogers, A., Kovaleva, O. and Rumshisky, A. (2020). A primer in BERTology: what we know about how BERT works. *Transactions of the Association for Computational Linguistics* 8, 842–866. [doi:10.1162/tacl_a_00349](https://doi.org/10.1162/tacl_a_00349)

<a id="ref-STY2017a"></a>Sundararajan, M., Taly, A. and Yan, Q. (2017). Axiomatic attribution for deep networks. [arXiv:1703.01365](https://arxiv.org/abs/1703.01365)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
