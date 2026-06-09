# Efficient Attention

## The Quadratic Bottleneck

Standard scaled dot-product attention computes a full N×N matrix of pairwise similarities between all positions in a sequence of length N:

**Attention(Q, K, V) = softmax(QKᵀ / √d_k) V**

The QKᵀ product has shape (N, N), so memory and compute both scale as **O(N²)**. For short sequences (N ≤ 512) this is fine. For long sequences — long documents, high-resolution time series, tick-level order books — the quadratic cost becomes the primary constraint.

| seq_len | Attention matrix entries | Approximate GPU memory (fp32, d_model=512) |
|:---|:---|:---|
| 512 | 262 144 | ~1 MB |
| 2 048 | 4 194 304 | ~16 MB |
| 8 192 | 67 108 864 | ~256 MB |
| 32 768 | 1 073 741 824 | ~4 GB |

The last row shows why a single attention layer on a 32k-token input exhausts a 4 GB GPU. Efficient attention methods attack this from two directions: **exact but IO-aware** (FlashAttention) and **approximate** (linear attention, sparse attention).

---

## FlashAttention

FlashAttention (Dao et al., 2022; Dao, 2023) computes the **exact same result** as standard attention but reorganises the computation to avoid materialising the full N×N matrix in high-bandwidth memory (HBM). Instead it tiles the computation into blocks that fit in the GPU's fast on-chip SRAM, fusing the three operations (QKᵀ, softmax, ×V) into a single kernel.

**What changes:** wall-clock speed and peak memory usage. Nothing else. The output is bit-for-bit identical to standard attention.

| Property | Standard Attention | FlashAttention |
|:---|:---|:---|
| Mathematical result | Exact | Exact (identical) |
| Memory complexity | O(N²) | O(N) |
| Speed | Baseline | 2–4× faster in practice |
| Requires special kernel | No | Yes (CUDA/ROCm) |
| Supported in Julia | Partial | Via NNlib / Metal backends |

**When to use:** whenever your sequence is long enough that training is slow or runs out of memory, and you want no approximation. FlashAttention has become the default in production Transformer training.

---

## Linear Attention

Linear attention methods replace the softmax with a kernel function φ that factorises the attention computation:

**Attention(Q, K, V) ≈ φ(Q)(φ(K)ᵀV)**

By associativity of matrix products, φ(K)ᵀV can be computed first (shape d_k × d_v, independent of N), reducing overall complexity to **O(N)** in both memory and compute.

The tradeoff is **approximation quality**. The softmax's ability to sharply focus attention on a small number of positions is difficult to replicate with a kernel. Linear attention tends to work well when the sequence requires broad contextual mixing rather than sharp sparse attention.

### Performer / FAVOR+

**Performer** (Choromanski et al., 2021) uses random orthogonal features to approximate the softmax kernel unbiasedly:

φ(x) = (1/√m) [exp(ωᵢᵀx − ‖x‖²/2)]ᵢ₌₁ᵐ   for random ωᵢ ~ N(0, I)

Larger m gives a better approximation at higher cost. m ≈ d_model is typical.

---

## Sparse Attention

Rather than approximating the full attention matrix, sparse methods compute only a structured subset of the N² entries.

### Longformer

Longformer (Beltagy et al., 2020) combines:
- **Local window attention:** each token attends to its w nearest neighbours on each side.
- **Global attention:** a small set of designated tokens (e.g., [CLS]) attend to all positions and are attended to by all.

Complexity: O(N · w) for local, O(N · g) for global (g = number of global tokens). Effective for long documents where local context dominates but a few anchor tokens need global context.

---

## Comparison

| Method | Complexity | Exact? | Best for |
|:---|:---|:---|:---|
| Standard attention | O(N²) | Yes | N ≤ 1024 |
| FlashAttention | O(N²) compute, O(N) memory | Yes | Any N; primary choice for speed |
| Performer / FAVOR+ | O(N) | No (approximation) | Very long N where approximation is acceptable |
| Longformer | O(N · w) | Yes (for attended pairs) | Long documents with local structure |

---

## Financial Applications

### Long Earnings Transcripts

Quarterly earnings call transcripts run to 10 000–30 000 tokens when processed at the word level. Standard attention at seq_len = 20 000 requires ~1.6 GB just for the attention matrix per layer. FlashAttention brings this to a tractable memory footprint, enabling full-document encoding without chunking.

### Tick-Level Order Book

A one-second window of order book updates for a liquid equity can contain thousands of events. Using PatchTST with patch_size = 10 reduces the sequence length, but FlashAttention is still a sensible default for large batch sizes or many variables.

### Regulatory Filing Analysis

10-K and 10-Q filings are long structured documents (often 50 000+ words). Longformer's global [CLS] token can aggregate a document-level representation while local windows capture paragraph-level context — appropriate when section boundaries matter (risk factors vs financial statements).

### Multi-Year Daily Return Series

A 10-year daily return series is 2 500 time steps. At d_model = 256 this is manageable with standard attention but FlashAttention still reduces training time by 2–3× — worthwhile when running hyperparameter sweeps across many assets.

---

## Practical Advice

1. **Default to FlashAttention** for any training run where seq_len > 512. It is exact and strictly faster — there is no reason not to use it when the backend supports it.
2. **Use linear attention (Performer)** only when seq_len is so large (> 8 000) that even FlashAttention's O(N) memory is a constraint, and you are willing to accept approximation error.
3. **Use Longformer** when your data has a natural local + global structure: long documents with a few anchor tokens.
4. **Always benchmark** approximation methods against standard attention on a small held-out set before committing to them — approximation error varies significantly with data distribution.
