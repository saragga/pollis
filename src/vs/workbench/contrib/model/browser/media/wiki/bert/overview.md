# Overview

BERT turns text into vectors whose values reflect a word's context, so that sentences can be compared by meaning. The panel loads a pre-trained model, turns sentences into vectors, and shows how far those vectors can be trusted.

## What BERT Is

Bidirectional Encoder Representations from Transformers is a stack of transformer layers, pre-trained on a large text corpus. [Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a) trained it to fill in masked words and to predict whether one sentence follows another. Each token's output depends on all the others, on both sides. A word therefore gets different vectors in different sentences, which older word embeddings could not do. No labels from a user's task are needed to produce a vector, and that makes the model a general starting point.

## What a Sentence Embedding Is

A model gives one vector per token, so a sentence needs one summary. **Embed** computes the mean of the token vectors, over the real tokens only, and the mask excludes padding. The first token, `[CLS]`, offers an alternative through `pooling=:cls`. Sentences then become points in a fixed-size space, and closeness in that space can drive search, clustering or a classifier. Closeness reflects meaning only as far as the model was trained for it, a point that matters greatly with a plain pre-trained BERT.

## How the Two Tabs of the BERT Embeddings Panel Differ

**Embed** encodes one text and reports the size of its vector. **Similarity** encodes two texts and reports the cosine of the angle between their vectors. Both tabs load the tokenizer and the model from the Hugging Face Hub by **Model** name, through `Transformers.jl`, by [Cheng (2023)](#ref-Che2023a). Each defines `embed_texts`, and the Next Steps build on it, using a small demo list called `docs`, unless one is defined beforehand. All the work is local once the files have been downloaded.

## Why a Pre-Trained BERT Needs Caution

A plain BERT was not trained to make similar sentences close. Many pairs score high with it, including unrelated ones, so a raw cosine says little, and contrasts are more reliable than levels. A checkpoint trained for this purpose does better, such as the sentence-transformers models of [Reimers and Gurevych (2019)](#ref-RG2019a), which **Compare Models** tests directly. For **Model**, `sentence-transformers/all-MiniLM-L6-v2` can replace the default, and all other steps then work as before.

## A Common Workflow for Sentence Embeddings

1. Use **Embed** or **Similarity** to confirm that the model loads.
2. Use **Similarity Heatmap** on a known set of documents, and read its contrasts.
3. Use **Compare Pooling** and **Compare Models** to choose a pooling and a checkpoint.
4. Use **Embedding Scatter** to see the structure.
5. Use **Nearest Neighbour** or **Top Similar Docs** with queries of interest.
6. Use **Batch Encoding** for a large corpus.

## References

<a id="ref-Che2023a"></a>Cheng, C.-W. (2023). Transformers.jl: transformers in Julia. [github.com/chengchingwen/Transformers.jl](https://github.com/chengchingwen/Transformers.jl)

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *NAACL-HLT*. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

## See Also

- [Factsheet](factsheet.md) · [Tokenisation](tokenisation.md) · [Attention](attention.md) · [Decision Guide](decision-guide.md)
