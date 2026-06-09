# Introduction: Measuring Volatility in High-Frequency Finance

Volatility is a central concept in financial econometrics, yet it is not directly observable. Instead, it must be estimated from data, typically using high-frequency returns. Over time, several estimators have been developed to approximate different aspects of the underlying (latent) volatility process. Among the most widely used are **realized volatility**, **two-scales realized volatility**, and **bipower variation**.

While these measures are closely related, they differ in what they estimate and how they handle key features of financial data, such as **microstructure noise** and **price jumps**.

---

## Realized Volatility (RV)

Realized volatility is the simplest and most intuitive estimator. It is defined as the sum of squared high-frequency returns over a fixed time interval:

\[
RV = \sum_{i=1}^{n} r_i^2
\]

Under ideal conditions—very frequent sampling and no market frictions—realized volatility provides a consistent estimate of **integrated volatility**, the true cumulative variance of the price process.

However, in practice, realized volatility has two important limitations:

- It is **sensitive to microstructure noise** (e.g., bid–ask bounce, discreteness), which can bias estimates upward.
- It **includes both continuous variation and jumps**, and therefore does not distinguish between normal fluctuations and abrupt price movements.

---

## Two-Scales Realized Volatility (TSRV)

Two-scales realized volatility is designed to address the problem of **microstructure noise**.

The key idea is to combine volatility estimates computed at different sampling frequencies (or "scales"):

- A **fine scale** (high-frequency data), which is informative but noisy  
- A **coarse scale** (lower-frequency data), which is less noisy but less precise  

By combining these two sources of information, TSRV reduces the bias caused by noise while preserving consistency.

**Key properties:**

- Provides a **noise-robust estimate** of integrated volatility  
- Still captures **total variation**, including both continuous movements and jumps  

---

## Bipower Variation (BPV)

Bipower variation takes a different approach. Instead of correcting for noise, it is designed to **separate continuous volatility from jumps**.

It is defined as:

\[
BPV = \sum_{i=2}^{n} |r_i| \cdot |r_{i-1}|
\]

The key property of BPV is that it provides a consistent estimate of the **integrated volatility of the continuous component**, even when jumps are present.

**Key properties:**

- **Robust to jumps** (excludes their contribution)  
- Captures only **continuous variation**  
- Does **not explicitly correct for microstructure noise**  

The difference between realized volatility and bipower variation:

\[
RV - BPV
\]

is often used as an estimate of **jump variation**.

---

## Jump Detection: Barndorff–Nielsen and Shephard (BNS) Test

The Barndorff–Nielsen and Shephard (BNS) test builds directly on the difference between **realized volatility (RV)** and **bipower variation (BPV)** to formally detect the presence of jumps.

### Intuition

- **RV** captures total variation (continuous + jumps)  
- **BPV** captures only continuous variation  

If the two differ significantly, this suggests the presence of **jumps**.

---

### Test Statistic

The BNS test constructs a standardized statistic:

\[
Z = \frac{RV - BPV}{\sqrt{\widehat{\text{Var}}(RV - BPV)}}
\]

Under the null hypothesis of **no jumps**:

\[
Z \sim \mathcal{N}(0,1)
\]

---

### Interpretation

- \( Z \approx 0 \): no evidence of jumps  
- Large \( |Z| \): evidence of jumps  
- Typical significance threshold: \( |Z| > 1.96 \)
