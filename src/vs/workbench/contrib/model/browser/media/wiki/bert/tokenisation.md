# Tokenisation

A transformer reads integers, not text. Tokenisation decides how a string becomes those integers, and every later step inherits its choices.

## How WordPiece Splits Text

BERT uses WordPiece, a method that goes back to [Schuster and Nakajima (2012)](#ref-SN2012a). After a basic clean-up and a split on whitespace and punctuation, each word is matched against a fixed vocabulary, greedily, with the longest known piece first. A word absent from the vocabulary breaks into pieces, with `##` marking a continuation, such as `em` and `##bedding`. Any word can thus be represented, and only a word that cannot be broken into known pieces falls back to `[UNK]`. Each piece then maps to an integer ID.

## What the Special Tokens Do

- `[CLS]` opens every sequence, and its output has been used to summarise the whole.
- `[SEP]` ends a sentence, and separates the two sentences of a pair.
- `[PAD]` fills shorter sentences up to the longest in a batch.
- `[MASK]` replaces words during pre-training.
- `[UNK]` stands for a word that the vocabulary cannot cover.

[Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a) use all of them. A sentence embedding that averages over the mask includes `[CLS]` and `[SEP]`, as the code counts them among the real tokens.

## How Padding and the Attention Mask Work

Sentences of different lengths share one array, so shorter ones are padded. The attention mask marks real tokens, and it keeps padding out of the attention sums. The mean in `embed_texts` covers `1:lens[b]`, the real tokens of sentence `b`, where `lens` comes from `sample.attention_mask.len`. Padding therefore does not change a sentence's vector beyond rounding. **Batch Encoding** relies on that fact when it groups documents, and padding each batch only to its longest member saves compute.

## Why Each Checkpoint Needs Its Own Tokenizer

A vocabulary is tied to the weights, since an ID is an index into the embedding table. `load_tokenizer` and `load_model` therefore take the same **Model** name. A mismatch gives no error, and nonsense vectors. `bert-base-uncased` lowercases text and removes accents, so `Apple` and `apple` become the same token, and the case signal is lost. A cased checkpoint keeps that signal. A multilingual checkpoint or a domain checkpoint has its own vocabulary, which treats specialist terms better.

## What Tokenisation Does to the Results

Rare terms split into pieces, which then carry a good part of the sentence's mean, so a long technical word weighs more than a short common one. Numbers break into pieces too, so a model reads them poorly. A pre-trained vocabulary stops at its training period, and terms coined later fall to pieces. [Jurafsky and Martin (2024)](#ref-JM2024a) discuss tokenisation for language models more generally. Inspect the tokens before relying on a result, which **Token Attribution** and **Attention Weights** both show as a by-product.

## What Happens to Long Text

A model has a fixed number of position embeddings, 512 in the case of `bert-base-uncased`, so longer texts cannot be read whole. A long document needs splitting into passages, with each passage encoded separately. The passage vectors can then be averaged, or searched one by one so that a hit points to a place. A document's average loses detail, and mixes topics. An overlap between passages keeps a sentence from being cut in two. In all cases, count tokens and not words, as one word may give several tokens.

## References

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *NAACL-HLT*. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

<a id="ref-JM2024a"></a>Jurafsky, D. and Martin, J. H. (2024). *Speech and Language Processing*, 3rd ed., draft. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-SN2012a"></a>Schuster, M. and Nakajima, K. (2012). Japanese and Korean voice search. *ICASSP*, 5149–5152. [doi:10.1109/ICASSP.2012.6289079](https://doi.org/10.1109/ICASSP.2012.6289079)

## See Also

- [Factsheet](factsheet.md) · [Attention](attention.md) · [Assumptions](assumptions.md) · [Overview](overview.md)
