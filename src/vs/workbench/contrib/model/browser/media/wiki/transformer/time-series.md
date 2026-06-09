# Time Series Transformers

## Why Transformers for Time Series

Standard RNN-based models (LSTM, GRU) process sequences step by step and struggle to capture long-range dependencies efficiently. CNNs aggregate locally. Transformers address both limitations: the self-attention mechanism allows any two positions in a sequence to interact directly in O(1) path length, irrespective of their distance.

Time series in finance are long (hundreds to thousands of steps), multivariate (many assets or features simultaneously), and contain irregular long-range patterns such as earnings cycles, macro regimes, and seasonal effects. Transformers can, in principle, capture these patterns directly.

---

## PatchTST

This webview uses **PatchTST** (Nie et al., 2023, ICLR) as the Time Series Transformer architecture. The key idea is **patch tokenisation**: instead of treating each time step as a token, PatchTST divides the input series into non-overlapping windows (patches) and embeds each patch as a single token via a linear projection.

### Why Patches Help

| Issue with step-wise tokenisation | How patches fix it |
|:---|:---|
| seq_len tokens → O(seq_len²) attention cost | num_patches = seq_len ÷ patch_size tokens → much cheaper |
| Each token carries one step of signal | Each token carries patch_size steps → richer, more stable representations |
| Long sequences exhaust memory | Coarser tokenisation fits longer histories |

### Architecture

```
Input: x ∈ ℝ^(seq_len × n_vars)   — lookback window, n_vars channels

1. Patchify: split into N = seq_len ÷ patch_size non-overlapping patches
   p_i ∈ ℝ^(patch_size)   for i = 1, …, N

2. Patch projection (linear embedding):
   z_i = W_patch · p_i + b   ∈ ℝ^(d_model)

3. Positional encoding:
   z_i ← z_i + PE(i)         sinusoidal or learned

4. Transformer encoder (L layers of self-attention + FFN)

5. Flatten patch representations: ℝ^(d_model × N) → ℝ^(d_model · N)

6. Linear head: ℝ^(d_model · N) → ℝ^(pred_len)   — direct multi-step forecast
```

PatchTST applies the encoder **channel-independently**: each of the n_vars input channels is processed by the same encoder weights, and the outputs are concatenated before the linear head. This keeps parameter count independent of n_vars and prevents attention from being distracted by cross-channel noise.

### Key Parameters

| Parameter | Role |
|:---|:---|
| `seq_len` | Lookback window in time steps. Typical: 96–720. |
| `pred_len` | Forecast horizon. Common benchmarks: 24, 96, 192, 336, 720. |
| `patch_size` | Steps per patch token. Must divide `seq_len`. Typical: 8–64. |
| `d_model` | Patch embedding dimension. Typical: 64–512. |
| `num_heads` | Self-attention heads. Must divide `d_model`. |
| `d_ff` | Feed-forward dimension, usually 2× or 4× `d_model`. |
| `num_layers` | Number of encoder layers. Typical: 2–6 for financial time series. |

---

## Financial Applications

### Multivariate Return Forecasting

Each input channel is a return series for one asset or factor. PatchTST forecasts the next `pred_len` returns for each channel independently. The patch encoder captures local volatility clusters and medium-range momentum patterns without overfitting to cross-sectional correlations.

### Volatility Regime Detection

Feed rolling realised volatility as the input signal. PatchTST's attention maps reveal which historical volatility clusters most influence the current forecast — useful for interpreting model behaviour during crisis periods.

### Macro Indicator Nowcasting

Financial macro indicators (GDP growth, CPI, PMI) are released at mixed frequencies. Resample to a common frequency, stack into a multivariate series, and use PatchTST to nowcast the next release using higher-frequency proxies. The long lookback window (336–720 steps) covers multiple economic cycles.

### Intraday Price Forecasting

Use minute-level OHLCV data with `seq_len = 390` (one trading day at 1-minute resolution). Patch size of 15 or 30 groups bars into 15- or 30-minute intervals — natural trading horizons for intraday strategies.

---

## Benchmarks and Limitations

PatchTST achieves state-of-the-art results on standard long-range forecasting benchmarks (ETTh1, ETTm1, Weather, Traffic, Exchange-Rate) as of 2023, outperforming earlier Transformer variants (Informer, Autoformer, FEDformer) and matching or exceeding N-HiTS on many settings.

**Known limitations:**

- **Fixed lookback window.** PatchTST uses a fixed `seq_len`. It cannot dynamically extend the context the way a model with KV-cache can.
- **No cross-variable attention in the standard formulation.** Channel-independent processing can miss cross-asset dependencies. A channel-mixing variant exists but increases memory cost.
- **Requires regular spacing.** PatchTST assumes uniform time steps. Irregularly-sampled data (tick data, corporate events) needs resampling first.
- **Linear head is a strong assumption.** The direct multi-step forecast head works well on smooth series but can underfit on heavy-tailed financial returns.

---

## Comparison with Other Architectures

| Model | Attention Type | Multi-step Strategy | Key Advantage |
|:---|:---|:---|:---|
| PatchTST | Full self-attention on patches | Direct (flat linear head) | Long-range, efficient, SOTA benchmarks |
| Informer | Sparse ProbSparse attention | Generative (auto-regressive decoder) | Early efficient transformer attempt |
| Autoformer | Auto-correlation block | Decomposition-based | Trend/seasonality decomposition |
| N-HiTS | No attention — MLP with hierarchical interpolation | Direct | Often competitive with fewer parameters |
| TFT | Multi-horizon LSTM + gating | Quantile output | Interpretable, handles covariates |

For most financial forecasting tasks on daily or intraday data, PatchTST is a strong first choice. If interpretability and covariate handling are paramount, consider TFT. If you need fewer parameters and faster training, N-HiTS is worth benchmarking.
