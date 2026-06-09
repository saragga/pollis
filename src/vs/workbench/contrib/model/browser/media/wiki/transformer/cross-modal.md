# Cross-Modal Transformers

## What Cross-Modal Means

A cross-modal model combines information from two or more data modalities — data types with fundamentally different structure and representation — into a single prediction. In finance the most common pairing is **text and numerical data**: textual sources (earnings call transcripts, news articles, regulatory filings, analyst reports) alongside structured numerical features (price ratios, trading volumes, balance-sheet metrics, macro indicators).

The Encoder button in this webview processes token sequences. The Cross-Modal button extends that architecture with a **numerical branch** that projects tabular features into the same embedding space and fuses them with the text representation before the prediction head.

---

## Architecture

```
Text input:    x_text ∈ ℤ^(seq_len)         — token IDs
Numerical:     x_num  ∈ ℝ^(d_num)           — tabular features

Text branch:
  Embedding(vocab_size → d_model)
  + Positional Encoding
  → L × TransformerBlock (self-attention + FFN)
  → LayerNorm
  → x[:, 1, :]                              — [CLS] pooling → (d_model,)
  = h_text ∈ ℝ^(d_model)

Numerical branch:
  Dense(d_num → d_model)
  = h_num  ∈ ℝ^(d_model)

Fusion:
  fused = h_text + h_num                    — element-wise residual fusion
  ŷ = Dense(d_model → out_dim)(fused)
```

The element-wise sum used here is the simplest fusion strategy. Alternatives include concatenation followed by a projection layer, or a cross-attention layer where the text tokens attend to numerical feature tokens.

---

## Fusion Strategies

| Strategy | Formula | Tradeoff |
|:---|:---|:---|
| **Additive (residual)** | h = h_text + h_num | Simple, no extra parameters; requires d_model to be the same for both |
| **Concatenation** | h = Dense([h_text ‖ h_num]) | More expressive; doubles the pre-head dimension |
| **Gated** | h = σ(g) ⊙ h_text + (1 − σ(g)) ⊙ h_num | Gate learned from both branches; explicit modality weighting |
| **Cross-attention** | Q from numerical, K/V from text tokens | Allows numerical features to attend to specific text spans |

The webview template generates the additive strategy. Concatenation or gating is straightforward to add after generating the template code.

---

## Financial Applications

### Earnings Sentiment Fusion

Quarterly earnings calls produce a transcript (text) and simultaneous financial disclosures (numerical). A cross-modal model trained to predict post-earnings returns fuses:

- **Text branch:** BERT-style encoder over the transcript tokens, [CLS] pooling captures overall sentiment tone.
- **Numerical branch:** EPS surprise, revenue growth, gross margin change, guidance revision flag.

The model learns that large EPS beats mentioned alongside cautious guidance language have a different return profile than beats with optimistic forward-looking statements.

### ESG Score Prediction

ESG rating agencies produce structured scores (pillars: Environmental E, Social S, Governance G). A cross-modal model can predict ESG scores from:

- **Text:** Annual report sustainability sections, proxy statements.
- **Numerical:** Carbon emissions intensity, board diversity ratios, employee turnover rates, supply-chain audit scores.

### Credit Default Prediction

Combining loan origination documents (text) with borrower financials (numerical):

- **Text:** Loan officer notes, business description, purpose of loan.
- **Numerical:** Debt-to-income ratio, credit score, employment tenure, collateral value.

A cross-modal Transformer outperforms a logistic regression on numerical features alone when the text contains information not captured by the structured fields.

### Central Bank Communication Analysis

Combine Federal Reserve FOMC statements (text) with macro data (numerical):

- **Text:** FOMC statement tokens encode policy stance and forward guidance language.
- **Numerical:** Inflation rate, unemployment, GDP growth, yield curve slope at the time of the statement.

The model can predict the subsequent 10-year yield move or the probability of a rate hike at the next meeting.

---

## Practical Considerations

### Tokenisation

Financial text has domain-specific vocabulary: ticker symbols, accounting terms, regulatory acronyms. A general-purpose BPE tokeniser (e.g., from a pretrained BERT model) will segment these into subword fragments. Options:

1. **Use a pretrained financial language model** (FinBERT, BloombergGPT) as the text encoder — transfer learning is highly effective when your labelled dataset is small.
2. **Train a domain tokeniser** on a financial corpus (earnings calls, 10-K filings) if you have the data volume.
3. **Use the general tokeniser** with `vocab_size = 30 000–50 000`; it works adequately for most tasks.

### Alignment

Text and numerical features must refer to the same observation. For earnings calls, this means aligning each transcript to the correct quarter's financial data. For news, it means matching articles to the trading day immediately before publication to avoid look-ahead bias.

### Class Imbalance

If the target is a binary event (default, large return, ESG upgrade), the dataset will typically be imbalanced. Use class-weighted cross-entropy loss or oversample the minority class.

### Gradient Flow

Deep text encoders (many layers) can develop vanishing or exploding gradients relative to the shallow numerical branch. Monitor gradient norms per branch during training. If the numerical branch is consistently dominated, increase its learning rate via a parameter group or add a normalisation layer after the projection.

---

## Comparison with Alternatives

| Approach | Strengths | Weaknesses |
|:---|:---|:---|
| **Cross-Modal Transformer (this webview)** | End-to-end, captures interaction between modalities | Requires paired text + numerical data; higher training cost |
| **Text-only Transformer (Encoder button)** | Strong when text signal dominates | Ignores quantitative information |
| **Numerical-only model (GLM, RF, XGBoost)** | Fast, interpretable, robust on tabular data | Ignores textual signal |
| **Two-stage: embed text, then feed to tabular model** | Modular, easy to implement | Misses joint interactions; embedding is frozen |
| **Late fusion: average two model outputs** | Simple, no shared parameters | Cannot learn cross-modal interactions |

Cross-modal Transformers add meaningful value when both modalities carry complementary information — the most common case in financial applications where numbers describe what happened and text explains why.
