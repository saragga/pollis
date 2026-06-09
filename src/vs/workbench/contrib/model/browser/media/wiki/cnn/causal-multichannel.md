# Causal Convolutions and Multi-Channel Inputs

## Causal Convolutions

A convolution is **causal** when the output at time step *t* depends only on inputs at times *t* and earlier — never on future observations. This is achieved by padding the input exclusively on the left (past side) before the convolution kernel slides over it.

```
Standard (acausal):   y[t] = Σ w[k] · x[t − ⌊K/2⌋ + k]   (centred window)
Causal:               y[t] = Σ w[k] · x[t − k]              (past only)
```

### When to Use Causal Convolutions

| Scenario | Causal | Acausal |
|---|---|---|
| Online / real-time prediction | ✓ | — |
| Autoregressive generation | ✓ | — |
| Backtesting with no look-ahead bias | ✓ | — |
| Offline post-processing of complete sequences | — | ✓ |
| Feature extraction from fixed-length windows | — | ✓ |

### Causal Convolutions in Practice

**1D Conv (causal)** pads `kernel_size − 1` zeros on the left of each layer, keeping the output length equal to the input length while guaranteeing no future information leaks into the prediction.

**TCN** always uses causal convolutions — it is part of the architecture definition. Each residual block applies two causal dilated convolutions, so the model can be used safely for online forecasting without modification.

### Applications

- **Algorithmic trading signals** — generating buy/sell signals from a rolling window of prices and volumes without look-ahead bias.
- **Multi-horizon forecasting** — predicting *h*-step-ahead returns using only past observations, enabling walk-forward validation.
- **Autoregressive price generation** — modelling the conditional distribution p(x_t | x_{t−1}, …) for simulation or scenario analysis.
- **Event-driven risk monitoring** — real-time credit or liquidity risk scoring as new transactions arrive.

---

## Multi-Channel Inputs

A **multi-channel** 1D convolution treats the input as a matrix of shape *(channels, T)* rather than a single vector of length *T*. Each channel is a separate time series aligned on the same time axis. The convolutional kernel learns to combine information across all channels simultaneously at each time step, in the same way that an image CNN kernel combines red, green, and blue pixels.

```
Single-channel:    X ∈ ℝ^{T}          →  in_channels = 1
Multi-channel:     X ∈ ℝ^{C × T}     →  in_channels = C
```

### Typical Channel Combinations in Finance

| Use Case | Example Channels |
|---|---|
| Price modelling | Close, Open, High, Low |
| Order book | Mid-price, Bid–Ask spread, Volume imbalance |
| Macro + micro | Price return, VIX, 10y yield, FX rate |
| Sentiment fusion | Price, volume, news sentiment score |
| Alternative data | Price, satellite foot-traffic, credit-card spend |

### Applications

**Text & Multi-Channel CNNs — Financial Sentiment Analysis**

Multi-channel CNNs are well-suited to sentiment analysis of financial text (news headlines, earnings reports, social media). Each channel can represent a different text embedding or a different data source:

- **Channel 1** — static word embeddings (e.g. GloVe trained on financial corpora)
- **Channel 2** — fine-tuned contextual embeddings (e.g. FinBERT output)
- **Channel 3** — price or volume time series aligned with publication timestamps

The convolution learns which combination of textual signals and market data best predicts short-term price reactions. Multi-source sentiment classification benefits especially from this architecture because it avoids the need to manually engineer cross-source features.

**Temporal Convolutional Networks — Financial Risk Assessment**

TCNs with multi-channel inputs are highly effective for risk assessment tasks that require processing long historical sequences:

- **Multi-horizon forecasting** — simultaneous prediction of 1-day, 5-day, and 20-day returns from a single forward pass, using the dilated causal structure to capture different temporal scales in parallel.
- **Credit risk scoring** — combining payment history, macroeconomic indicators, and industry-level signals as parallel channels, with dilated convolutions capturing both short-term payment patterns and long-term economic cycles.
- **Systemic risk monitoring** — processing a panel of asset return series as channels to detect correlation regime changes or contagion signals.

The dilated causal architecture is particularly memory-efficient for long sequences: rather than maintaining a hidden state as in RNNs, the entire sequence is processed in parallel with a receptive field that grows exponentially with depth.

---

## Choosing the Right Combination

| Architecture | Causal | Multi-channel | Typical Use |
|---|---|---|---|
| 1D Conv | ✗ | ✗ | Offline feature extraction, fixed windows |
| 1D Conv | ✓ | ✗ | Single-series online forecasting |
| 1D Conv | ✗ | ✓ | Panel data, multi-source offline analysis |
| 1D Conv | ✓ | ✓ | Real-time multi-source signal generation |
| Dilated Conv | ✓ | ✓ | Long-range dependencies, multi-source |
| TCN | ✓ (fixed) | ✓ | Multi-horizon forecasting, risk assessment |
