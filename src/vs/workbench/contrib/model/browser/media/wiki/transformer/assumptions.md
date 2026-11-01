# Transformers — Assumptions

A transformer has few built-in beliefs about sequences, which makes it flexible and also hungry for data. What the architecture leaves out, the training set must supply.

## How Much Data a Transformer Assumes

A convolution assumes local patterns and a recurrent network assumes a step-by-step state, so both start with useful structure. Attention assumes much less, and has to learn from data which positions relate to which. With the default inputs, a model holds a very large number of parameters, so a few thousand examples will often be memorised. **Parameter Count** gives the figure, which should be set against the number of training examples before results are taken seriously.

## What Each Tab Assumes About Visibility

**Encoder**, **Time Series** and **Cross-Modal** attend across their whole input with no mask, so each input must be fully known at the time of prediction. That is sound for a completed lookback window, and it would be a leak if the input included anything later than the time of prediction. **Decoder** applies a causal mask, and it assumes that each token depends only on earlier ones. **Encoder-Decoder** assumes that the whole source is known before any target token appears.

## What the Time Series Tab Assumes About Lookback

**Time Series** assumes that the lookback window of **seq_len** steps contains what the horizon needs, and that patches of **patch_size** steps are a useful unit. With patches that do not overlap, a pattern that falls across a boundary is split. The tab maps the single series in a window to its forecast, assuming a stable relation between past and future shapes. A change of level between training and later data hurts it, since it applies no normalisation per window, so scale the data first.

## What Order Assumes in a Set of Tokens

Position vectors are the only source of order. [Zeng, Chen, Zhang and Xu (2023)](#ref-ZCZX2023a) argue that this is a weak point for forecasting: attention is close to invariant to permutations, while time series depend on temporal order, and their simple linear models beat several transformer forecasters on long horizons. Their result does not rule transformers out, and patching was in part a response to it, but it is a reason to run **vs Simple Baseline** before trusting one.

## What the Training Setup Assumes

The tabs train for 20 epochs with a small learning rate of 0.0001 and no warmup, which assumes that this is enough for the problem at hand. A large model may need far longer. For token tabs, **vocab_size** must exceed the largest token id, and sequences are assumed to have a common length: the code has no padding mask, so padded positions take part in attention as if they were real tokens. Time series windows that overlap also make the examples less independent than their count suggests.

## What the Absence of a Held-Out Split Means

The code trains on all the data it is given. **Predictions**, **Training Curve** and **vs Simple Baseline** all read the first 256 training examples, so each measures fit and not generalisation. A large model can score well on these figures by memorising. Keep a separate test set, and for time series take it from a later period, then evaluate with **Predict New Data** before making any claim about performance.

## References

<a id="ref-ZCZX2023a"></a>Zeng, A., Chen, M., Zhang, L. and Xu, Q. (2023). Are transformers effective for time series forecasting? *Proceedings of the AAAI Conference on Artificial Intelligence* 37(9), 11121–11128. [doi:10.1609/aaai.v37i9.26317](https://doi.org/10.1609/aaai.v37i9.26317)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Positional Encoding](positional-encoding.md)
