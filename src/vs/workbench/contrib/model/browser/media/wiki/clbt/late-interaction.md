# Late Interaction

Late interaction keeps one vector per token, and matches query and passage only at the final step. That preserves word-level detail while still allowing passages to be encoded in advance.

## How MaxSim Scores a Passage

Let each query token have a unit vector q_i, and each passage token a unit vector d_j. The score is:

- S(q, d) = sum over i of max over j of q_i'd_j

Each query token looks for its best match in the passage, and those best matches are summed. With unit vectors, each inner product is a cosine, between −1 and 1. A passage scores highly if it has something close to every query token. In the code, `transpose(Q) * D` gives the full table of similarities, and **MaxSim Breakdown** shows it token by token. [Khattab and Zaharia (2020)](#ref-KZ2020a) define the score.

## Why Late Interaction Is Efficient

The passage encoder never sees the query, so all passage vectors can be computed once and stored. A query then costs one encoder pass and some inner products. MaxSim needs no neural network at scoring time, which is what makes it so much cheaper than a cross-encoder, such as that of [Nogueira and Cho (2019)](#ref-NC2019a), which must run the model again on each candidate pair. The cost is storage, since a passage needs many vectors. Compression deals with that, as [Index Structure](index-structure.md) describes.

## What the Query Tokens Include

A query is prefixed by a marker token, and padded with [MASK] tokens to a fixed length, `config.query_maxlen`. Padding is a form of query augmentation: the masks still receive vectors in context, so they can act as extra soft terms for what the query implies. They also add to the score. **Query Analysis** lists them, and reranks without them, to show how much they matter on the query at hand. Punctuation is dropped from the passage side through `encoder.skiplist`, and this reduces storage and removes weak matches.

## How the Encoder Produces Token Vectors

BERT, from [Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a), gives a contextual vector per token. A linear layer projects those down to `config.dim` dimensions, and they are normalised to unit length. Context gives the same word different vectors in different senses, so that a match on "bank" takes its neighbours into account. Words split into WordPiece units before encoding, so **MaxSim Breakdown** may show matches on word fragments. A passage longer than the model's length limit is cut, so long documents should be split into passages first.

## What the v2 Checkpoint Changed

Late interaction scoring stays the same across versions, and the training and storage changed. [Santhanam, Khattab, Saad-Falcon, Potts and Zaharia (2022)](#ref-SKSPZ2022a) describe training with distillation from a cross-encoder and with hard negatives, and they add residual compression. **Compare Checkpoints** builds an index with `colbertv1.9` and with `colbertv2.0`, and compares them on the labelled queries. Few queries cannot separate close systems, and the second download is large, so treat it as an illustration of the procedure.

## Where Late Interaction Is Strong and Weak

Word-level matching lets a system handle paraphrase and rare terms together, and the token table offers an explanation of a result. Encoding, however, is expensive on a CPU, and the storage cost exceeds that of single-vector methods. Each query token votes independently, so word order and negation are captured only through the encoder's context. The score counts how well query tokens find matches, and says nothing about whether the passage is true, or actually answers the question.

## References

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *NAACL-HLT*. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

<a id="ref-KZ2020a"></a>Khattab, O. and Zaharia, M. (2020). ColBERT: efficient and effective passage search via contextualized late interaction over BERT. *SIGIR*. [arXiv:2004.12832](https://arxiv.org/abs/2004.12832)

<a id="ref-NC2019a"></a>Nogueira, R. and Cho, K. (2019). Passage re-ranking with BERT. [arXiv:1901.04085](https://doi.org/10.48550/arXiv.1901.04085)

<a id="ref-SKSPZ2022a"></a>Santhanam, K., Khattab, O., Saad-Falcon, J., Potts, C. and Zaharia, M. (2022). ColBERTv2: effective and efficient retrieval via lightweight late interaction. *NAACL*. [arXiv:2112.01488](https://arxiv.org/abs/2112.01488)

## See Also

- [Factsheet](factsheet.md) · [Index Structure](index-structure.md) · [Interpretation](interpretation.md) · [Assumptions](assumptions.md)
