# Positional Encoding

## Why Position Matters

Self-attention is **permutation-equivariant**: if you shuffle the input tokens, the output is shuffled in exactly the same way. The attention mechanism has no inherent notion of order. For language and time series this is a problem — "rates rise then fall" and "rates fall then rise" are opposite signals, but a bare attention layer treats them identically.

Positional encoding injects order information into the token representations before the first attention layer. The webview checkbox switches between the two most common approaches: **sinusoidal** (fixed) and **learned** (trained).

---

## Sinusoidal Positional Encoding

Proposed in the original Transformer paper (Vaswani et al., 2017). Each position p gets a fixed d_model-dimensional vector computed from sine and cosine functions at geometrically spaced frequencies:

**PE(p, 2i)   = sin(p / 10000^(2i/d_model))**
**PE(p, 2i+1) = cos(p / 10000^(2i/d_model))**

where i indexes the embedding dimension. The resulting vectors have two useful properties:

1. **Unique:** every position produces a distinct vector.
2. **Relative distance encodable:** PE(p + k) can be expressed as a linear function of PE(p) for any fixed offset k. The model can therefore learn to attend based on relative distances.

### Properties

| Property | Value |
|:---|:---|
| Parameters | None — fully deterministic |
| Max sequence length | Unlimited (formula defined for any p) |
| Generalises to unseen lengths | Yes |
| Captures relative positions | Implicitly, via the linear relationship |
| Works with small datasets | Yes — no parameters to overfit |

### When to Use Sinusoidal

- You need the model to generalise to sequences longer than any seen during training.
- Your dataset is small and you cannot afford extra parameters.
- You are using PatchTST for time series: patches at inference time may span different temporal ranges than during training.
- As a first baseline — switch to learned only if it measurably improves validation loss.

---

## Learned Positional Encoding

Used in BERT (Devlin et al., 2019) and most subsequent pretrained language models. Each position index is mapped to a trainable embedding vector:

**PE = Embedding(max_seq_len → d_model)**

At training time the model optimises these vectors jointly with all other parameters. The result is a position embedding tailored to the specific distributional patterns in your data.

### Properties

| Property | Value |
|:---|:---|
| Parameters | max_seq_len × d_model (e.g. 512 × 768 = 393 216 for BERT-base) |
| Max sequence length | Fixed at max_seq_len — positions beyond it are undefined |
| Generalises to unseen lengths | No — extrapolation requires special handling |
| Captures relative positions | Implicitly, if the training distribution covers diverse offsets |
| Works with small datasets | Riskier — embeddings for rare positions may be poorly trained |

### When to Use Learned

- Sequence length is fixed and known in advance (e.g., always exactly 128 tokens).
- You have a large training corpus where all positions are frequently observed.
- You are fine-tuning a pretrained model (BERT, FinBERT) that already uses learned PE — changing to sinusoidal would require full retraining.
- Empirical results on your validation set show a clear improvement over sinusoidal.

---

## Modern Variants

The sinusoidal vs learned dichotomy is from 2017–2019. More recent architectures use position encodings that extend better to long sequences and encode relative rather than absolute positions. These are not in the webview template but are worth knowing.

### Relative Position Encodings (Shaw et al., 2018)

Instead of adding a fixed PE vector to each token, relative PE modifies the attention logit between positions i and j by a learned scalar that depends on (i − j):

**e_ij = (q_i Kᵀ + q_i aᵢⱼᵀ) / √d_k**

where a_ij is a learned embedding for the clipped distance clip(i−j, −k, k). This encodes pairwise distances directly rather than absolute positions, giving better generalisation to length shifts.

### ALiBi — Attention with Linear Biases (Press et al., 2022)

ALiBi adds a fixed, non-learned penalty proportional to distance to each attention logit:

**e_ij = q_i · k_j / √d_k − m · |i − j|**

where m is a head-specific slope. No position vectors are added to the input embeddings at all. ALiBi models trained on seq_len = 1 024 can extrapolate to seq_len = 2 048 without fine-tuning — a property standard PE methods lack. Used in MPT and BLOOM.

### RoPE — Rotary Position Embedding (Su et al., 2021)

RoPE encodes absolute position by rotating the query and key vectors in 2D subspaces before the dot product:

**q̃_m = R_m q_m,   k̃_n = R_n k_n**

where R_m is a block-diagonal rotation matrix parameterised by position m. The dot product q̃_mᵀ k̃_n then depends on (m − n) rather than absolute values, giving relative-position sensitivity without explicit relative PE tables. RoPE is used in LLaMA, Mistral, GPT-NeoX, and most recent open-weight LLMs. It scales gracefully to long contexts with techniques like YaRN or NTK-aware interpolation.

---

## Comparison

| Method | Type | Params | Length generalisation | Used in |
|:---|:---|:---|:---|:---|
| Sinusoidal | Fixed absolute | 0 | Good | Original Transformer, PatchTST |
| Learned | Trained absolute | max_len × d | Poor (fixed max) | BERT, GPT-2 |
| Relative PE | Trained relative | 2k × d per layer | Moderate | T5, Music Transformer |
| ALiBi | Fixed relative bias | 0 | Excellent | MPT, BLOOM |
| RoPE | Fixed rotary | 0 | Good (with interpolation) | LLaMA, Mistral, GPT-NeoX |

---

## Financial Applications

### Fixed-Length Tabular Sequences

If every training example is exactly 60 trading days (a quarter), learned PE is a natural fit. The model can specialise position 1 (start of quarter) and position 60 (end of quarter) embeddings for patterns specific to those temporal anchors.

### Variable-Length Documents

Earnings call transcripts vary from 5 000 to 40 000 tokens. Sinusoidal PE handles variable lengths without modification. ALiBi is the better production choice if you later scale to very long inputs, since it generalises beyond the training length without retraining.

### Long Time Series Forecasting

PatchTST uses sinusoidal PE by default. The lookback window varies across experiments (96, 336, 720 steps) and sinusoidal PE extrapolates to unseen window sizes — important when comparing across forecast horizons without retraining the positional encoding.

### Fine-Tuning Pretrained Financial Models

FinBERT and BloombergGPT use learned absolute PE. When fine-tuning on a downstream task (sentiment classification, NER on filings), keep the learned PE frozen for the first few epochs then unfreeze — this avoids overwriting position embeddings that were carefully trained on large corpora.

---

## Practical Advice

1. **Start with sinusoidal** unless you have a strong reason to use learned. It has zero parameters, generalises to new lengths, and performs comparably to learned PE on most tasks.
2. **Switch to learned** when sequence length is fixed and training data is large — BERT-style pretraining is the canonical example.
3. **For new long-context work**, prefer ALiBi or RoPE over either. They generalise better and are now the community default for frontier models.
4. **Never mix PE types** when fine-tuning a pretrained model. If the base model used learned PE, keep it.
