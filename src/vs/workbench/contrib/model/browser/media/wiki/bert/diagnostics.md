# Diagnostics

No loss or test accompanies a pre-trained embedding, so checks compare its behaviour with what is known about the texts.

## How to Run a Basic Sanity Check on Embeddings

Encode a sentence twice, and the cosine should be 1 up to rounding. A batch with several sentences should give the same vector as encoding each alone, which tests the padding and mask, and any difference beyond rounding signals a problem. The **Embed** tab prints the embedding size, which should match the checkpoint: 768 for `bert-base-uncased` and 384 for `sentence-transformers/all-MiniLM-L6-v2`. A failure on loading usually means a wrong name or no network, and a name can be tested on the Hugging Face Hub.

## How to Test Whether Similarity Separates Meaning

**Compare Pooling** and **Compare Models** score a paraphrase pair and an unrelated pair. A useful setting gives a clear gap between the two, and the size of the gap matters, not the level. A high unrelated score reveals the problem that the panel warns of. **Similarity Heatmap** prints the mean off-diagonal similarity, and a high figure for sentences on different topics signals vectors that share a common direction, as [Ethayarajh (2019)](#ref-Eth2019a) reports for contextual models. Blocks along the diagonal should mirror the topics in `docs`.

## How to Read Embedding Norms

**Embedding Norms** plots a histogram of vector lengths across the documents. Norms should cluster, and an extreme outlier may reveal an unusual text. Length carries little meaning, and it is removed by cosine, so a tidy histogram is no sign of good embeddings. Mean pooling also shortens vectors when their tokens point different ways, so long, mixed texts may have smaller norms. With only eight demo sentences, the histogram holds little information, and a larger corpus is needed for a fair look.

## How to Look at Structure Without Labels

**Embedding Scatter** projects the vectors onto the first two principal components, with the share of variance on each axis. Numbers mark documents in the order of `docs`, and sentences on one topic should lie together. A small share of variance means that the plot hides most of the differences, so a lack of separation there does not prove their absence. Axes have no fixed meaning, and may flip between runs on other data. Many more documents are needed before UMAP or t-SNE add much.

## How to Check Retrieval

**Nearest Neighbour** and **Top Similar Docs** list the closest documents for one query and for several. Write queries with a known answer, and look at whether the answer comes first. A systematic test counts how often the right document appears among the top k, with a set of queries and known answers. [Reimers and Gurevych (2019)](#ref-RG2019a) evaluate models on labelled pairs, and that is the standard to aim for when choosing a checkpoint for real use. A demo with eight documents only tells whether the setup works.

## How to Check Attribution and Attention

**Token Attribution** prints a score per token. Run it with a clear sentence, and see whether content words stand out over function words. Its target is the `[CLS]` norm, and not a sentence embedding, so it does not explain a similarity score. Gradient times input is one of several methods, and the paper by [Sundararajan, Taly and Yan (2017)](#ref-STY2017a) discusses what such attributions should satisfy. **Attention Weights** can catch tokenisation problems, as labels show each piece. A faulty split there explains many odd results downstream.

## References

<a id="ref-Eth2019a"></a>Ethayarajh, K. (2019). How contextual are contextualized word representations? Comparing the geometry of BERT, ELMo, and GPT-2 embeddings. *EMNLP-IJCNLP*, 55–65. [doi:10.18653/v1/D19-1006](https://doi.org/10.18653/v1/D19-1006)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

<a id="ref-STY2017a"></a>Sundararajan, M., Taly, A. and Yan, Q. (2017). Axiomatic attribution for deep networks. [arXiv:1703.01365](https://arxiv.org/abs/1703.01365)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
