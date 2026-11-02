# Assumptions

A pre-trained embedding comes with no diagnostics of its own, and its usefulness rests on assumptions about the text, the training and the measure of closeness.

## Why Training Text Limits What a Model Knows

A pre-trained model reflects the corpus it learned from. `bert-base-uncased` was trained on general English text, so legal, medical or financial terms may be poorly represented, and later coinages absent. Its associations also reflect that corpus, including social biases. A text unlike the training text gets a vector anyway, and nothing warns of a poor fit. [Rogers, Kovaleva and Rumshisky (2020)](#ref-RKR2020a) review what BERT does and does not capture. Check with examples from the actual domain before relying on any result.

## What Cosine Similarity Assumes

Cosine compares directions and ignores length, assuming that meaning sits in the angle. That is plausible for a model trained with a cosine objective, as with sentence-transformers. It is much less secure for a plain BERT, whose vectors often share a common direction, so most pairs score high. [Ethayarajh (2019)](#ref-Eth2019a) measures this anisotropy in the geometry of contextual embeddings. Differences then fall in a narrow band near the top of the range, and a fixed threshold of similarity cannot be carried between models.

## What Mean Pooling Assumes

A mean treats every token as equally informative, including the special tokens and common words. It works well in practice, particularly in models trained with it, but word order and negation can fade, as averaging tends to blur differences across a sentence. A sentence and its negation can then score very close. Long texts suffer more, since a mean of many topics points somewhere between them. `pooling=:cls` makes a different assumption, namely that one token holds the summary, and **Compare Pooling** tests which works better here.

## What the Tokenisation Limits Assume

Text must fit within the model's position limit. The lowercasing and accent stripping of an uncased model drop information, which can matter for names or for languages with accents. An English checkpoint assumes English input, and other languages come out as many fragmented pieces. Each case produces a vector with no error, so a language mismatch appears only as bad results. A multilingual checkpoint, or one trained in the target language, can correct this, and the rest of the code stays the same.

## What a Small Demo Corpus Can Show

The default `docs` holds only eight sentences, on three clearly separate topics. They suit a demonstration, and they say little about hard cases, such as near topics or subtle differences. **Embedding Scatter** uses principal components because methods like UMAP need more documents. A method that sorts these sentences correctly may still fail on a real corpus. Evaluation needs labelled examples from the intended use, with enough cases to give a stable measure.

## What Reproducibility Assumes

Encoding is deterministic for fixed weights, as dropout plays no role during inference, so a repeated run gives the same vector up to rounding. Hub checkpoints can change, though, and a file might be updated under the same name. Device, numeric precision and package version may shift values slightly. A study that must be repeated should record the model revision, and the versions of `Transformers.jl` and its tokenizer. Stored embeddings cannot be compared with those of another model, as each model has a space of its own.

## References

<a id="ref-Eth2019a"></a>Ethayarajh, K. (2019). How contextual are contextualized word representations? Comparing the geometry of BERT, ELMo, and GPT-2 embeddings. *EMNLP-IJCNLP*, 55–65. [doi:10.18653/v1/D19-1006](https://doi.org/10.18653/v1/D19-1006)

<a id="ref-RKR2020a"></a>Rogers, A., Kovaleva, O. and Rumshisky, A. (2020). A primer in BERTology: what we know about how BERT works. *Transactions of the Association for Computational Linguistics* 8, 842–866. [doi:10.1162/tacl_a_00349](https://doi.org/10.1162/tacl_a_00349)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
