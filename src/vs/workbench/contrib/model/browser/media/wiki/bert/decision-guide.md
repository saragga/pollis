# Decision Guide

Embedding text well depends on the task, the checkpoint and the pooling, and a plain BERT is often not the best start.

## Which Checkpoint Fits a Purpose

| Purpose | Checkpoint | Why |
|---|---|---|
| Semantic similarity or search | A sentence-transformers model | Trained so that cosine reflects meaning |
| Fast encoding on a laptop | A small model, such as `all-MiniLM-L6-v2` | Few layers and small vectors |
| A base for fine-tuning a classifier | `bert-base-uncased` | A general model, widely studied |
| Specialist text | A domain checkpoint | Vocabulary and training match the field |
| Case matters | A cased checkpoint | Keeps capitals, as in names |

## When to Use CLS or Mean Pooling

Use whatever the checkpoint was trained with, as its loss shaped its vectors. Sentence-transformers models commonly use the mean over the mask, and **Compare Models** applies each model's own form. For a plain BERT, [Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a) used `[CLS]` for classification, after fine-tuning, and its pre-trained state serves a different objective. Mean pooling is the safer default on an unadapted model. **Compare Pooling** gives a quick reading for a given model and a pair of examples.

## When to Fine-Tune a Model

Use a pre-trained model when labels are few or when the task is general. Fine-tune when labelled examples exist and a measurable task defines success, such as classification, and when the pre-trained vectors fall short. A linear classifier on fixed embeddings is a cheap first step, and it provides a baseline. Fine-tuning a whole model calls for more data and compute, and for a careful validation split. The panel's notebook on fine-tuning uses `Lux.jl`. Train a sentence model with pairs when the goal is similarity.

## When Simpler Text Methods Are Enough

A bag of words with TF-IDF weights costs almost nothing, is transparent, and does well on keyword search or on topic classification with enough data. Prefer an embedding when paraphrases matter and queries use different words from the documents. Run a simple baseline first, so that an embedding's benefit can be measured. [Jurafsky and Martin (2024)](#ref-JM2024a) cover both families. Costs differ too, since an embedding needs a model to be downloaded and run for every text.

## How to Handle a Large Corpus

Use **Batch Encoding** with a batch size that fits memory, as cost grows with the length of the longest sentence in a batch. Sorting documents by length before batching saves on padding. Split long documents into passages under the position limit. Normalise and store the vectors, so that cosine reduces to a dot product. A GPU helps a great deal for large collections. For many millions of vectors, approximate nearest neighbour search replaces the full comparison used by the Next Steps.

## How to Evaluate an Embedding Choice

Choose a measure tied to the task: precision at k for search, accuracy for classification, or correlation with human ratings for similarity. Prepare examples from the real domain, including near misses. Compare at least two checkpoints and two pooling choices, and record the model revision. A demo with few sentences cannot separate good options. [Reimers and Gurevych (2019)](#ref-RG2019a) show how such comparisons are reported, and any threshold must be set on data for the same model.

## References

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *NAACL-HLT*. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

<a id="ref-JM2024a"></a>Jurafsky, D. and Martin, J. H. (2024). *Speech and Language Processing*, 3rd ed., draft. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Tokenisation](tokenisation.md) · [Attention](attention.md)
