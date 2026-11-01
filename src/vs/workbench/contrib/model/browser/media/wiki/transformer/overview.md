# Transformers — Overview

A transformer lets every position in a sequence read every other position directly, through attention, with no recurrent state. The architecture of [Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser and Polosukhin (2017)](#ref-VSPUJ...2017a) replaced recurrence with this mechanism and now underlies most large language models.

## How Self-Attention Works

Each position produces a query, a key and a value by linear maps of its representation. The match between one position's query and the keys of all positions, passed through a softmax, gives weights that sum to 1, and the output for that position is the weighted sum of values. The path between any two positions is therefore a single step, however far apart they are. **num_heads** parallel attentions each work on a share of **d_model**, so that different heads can follow different relations.

## Why Positions Must Be Added

Attention by itself ignores order: shuffling the inputs just shuffles the outputs. Each tab therefore adds a position vector to each input. With **Positional encoding** set to **Sinusoidal**, the vectors are fixed waves of different frequencies and are not trained. With **Learned**, they are a table trained like other weights. Both are built to a fixed maximum length. The [Positional Encoding](positional-encoding.md) page discusses these choices further.

## How the Encoder Tab Classifies

The **Encoder** tab follows the pattern of [Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a): every token attends to every other token, with no mask, and a classification head reads one summary vector. Because all positions see each other, the model suits a text known in full. Unlike the original article, this tab starts from random weights and does not load any pretrained model, so it needs a fairly large labelled dataset, with **num_classes** and **vocab_size** set to match it.

## How the Decoder Tab Generates Text

The **Decoder** tab uses a causal mask, so each position reads only itself and earlier positions, and it learns to predict the next token at each position. **Predict New Data** generates tokens one at a time by always taking the most likely next token, 20 tokens in all, with the context truncated to **seq_len**. Greedy choice is simple and deterministic, and it tends to repeat itself on small models, as no sampling or beam search is offered.

## How the Encoder-Decoder Tab Maps Sequences

**Encoder-Decoder** encodes the source and then decodes the target, with each decoder block reading the encoder output through attention, as in the original architecture. Training uses teacher forcing: the decoder receives the true previous tokens and predicts the next ones. In use, there are no true tokens, so **Predict New Data** feeds back its own predictions. That gap explains why generated sequences can be weaker than training loss suggests.

## How the Time Series and Cross-Modal Tabs Differ

**Time Series** follows the patching idea of [Nie, Nguyen, Sinthong and Kalagnanam (2022)](#ref-NNSK2022a): non-overlapping pieces of **patch_size** steps become tokens, which reduces their number and lets each token carry local shape. All outputs are then flattened and mapped to **pred_len** values. **Cross-Modal** encodes text, takes a summary from its first position, and adds a projection of **Numerical features** before the final layer. The [Time Series Transformers](time-series.md) and [Cross-Modal Transformers](cross-modal.md) pages cover these tabs in detail.

## References

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *Proceedings of NAACL-HLT 2019*, 4171–4186. [doi:10.18653/v1/N19-1423](https://doi.org/10.18653/v1/N19-1423)

<a id="ref-NNSK2022a"></a>Nie, Y., Nguyen, N. H., Sinthong, P. and Kalagnanam, J. (2022). A time series is worth 64 words: long-term forecasting with transformers. arXiv:2211.14730. [doi:10.48550/arXiv.2211.14730](https://doi.org/10.48550/arXiv.2211.14730)

<a id="ref-VSPUJ...2017a"></a>Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L. and Polosukhin, I. (2017). Attention is all you need. *Advances in Neural Information Processing Systems*. arXiv:1706.03762. [doi:10.48550/arXiv.1706.03762](https://doi.org/10.48550/arXiv.1706.03762)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Efficient Attention](efficient-attention.md)
