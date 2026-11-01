# Transformers — Factsheet

The Transformers panel builds attention networks from a small `Block` written in Flux.jl, and trains them on token sequences or time series. Each tab shows the same block arranged for a different task.

## What the Transformers Panel Does

| Item | Description |
|---|---|
| **Purpose** | Classification, text generation, sequence-to-sequence, forecasting and text with numbers |
| **Julia stack** | Flux.jl `MultiHeadAttention`, `LayerNorm` and `Dense` layers |
| **Models** | **Encoder**, **Decoder**, **Encoder-Decoder**, **Time Series** and **Cross-Modal** tabs |
| **Block** | Layer norm before self-attention and before a two-layer gelu feed-forward, each with a residual and dropout |
| **Training** | AdamW with learning rate 0.0001, batches of 32, 20 epochs |
| **Not included** | A held-out split: training figures come from the training data |

## What Each Transformer Tab Takes and Produces

| Tab | Input | Target | Loss |
|---|---|---|---|
| **Encoder** | Token ids, seq_len × n | One class label per sequence | Cross-entropy |
| **Decoder** | Token ids, seq_len × n | The next token at each position | Cross-entropy |
| **Encoder-Decoder** | Source ids, seq_len × n | Target ids, tgt_len × n, starting with a start token | Cross-entropy |
| **Time Series** | Lookback windows, seq_len × n | Horizons, pred_len × n | Mean squared error |
| **Cross-Modal** | Token ids and **Numerical features**, d_num × n | One value per example | Mean squared error |

## Which Inputs Shape a Transformer

**d_model**, **num_heads**, **d_ff**, **num_layers** and **dropout** apply to every tab, and **num_heads** must divide **d_model**. **Positional encoding** picks **Sinusoidal**, which is fixed, or **Learned**, a trained table with a fixed maximum length. **vocab_size** applies to the token tabs. **num_classes** applies to **Encoder**, **tgt_len** to **Encoder-Decoder**, and **d_num** to **Cross-Modal**. For **Time Series**, **pred_len** sets the horizon and **patch_size** must divide **seq_len**.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Time Series Transformers](time-series.md) · [Cross-Modal Transformers](cross-modal.md)
