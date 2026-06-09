# Time-Varying Volatility Models

Financial markets are characterised by periods of calm and turbulence, where volatility evolves over time rather than remaining constant. Capturing this behaviour is essential for forecasting risk, estimating uncertainty, and pricing financial instruments. This section presents three major classes of time-varying volatility models, each reflecting a different modelling philosophy and practical use case.

---

## GARCH-Type Deterministic Volatility Models

Models such as GARCH and its extensions (e.g., EGARCH, GJR-GARCH) describe volatility as a deterministic function of past returns and past volatility. These models are widely used due to their simplicity, interpretability, and strong empirical performance in capturing volatility clustering. They are particularly well suited for forecasting and risk management tasks.

---

## Discrete-Time Stochastic Volatility Models

In contrast, stochastic volatility models treat volatility as an unobserved (latent) process that evolves randomly over time. The canonical framework, introduced by Stephen Taylor, models log-volatility as a persistent stochastic process. These models provide greater flexibility than GARCH-type models and allow for richer dynamics, such as leverage effects and heavy-tailed behaviour. Estimation typically relies on simulation-based methods, including Bayesian techniques and filtering algorithms.

---

## Continuous-Time Stochastic Volatility Models

Continuous-time models extend the stochastic volatility framework to a diffusion setting, where both asset prices and volatility evolve according to stochastic differential equations. Prominent examples include the Heston model and the SABR model. These models are fundamental in derivatives pricing and quantitative finance, as they provide a natural link between market data and option-implied volatility surfaces.

---

## Overview

Together, these three classes form a coherent hierarchy:

* GARCH-type models offer a practical and efficient approach for modelling and forecasting volatility based on observed data.
* Discrete-time stochastic volatility models introduce latent dynamics, enabling deeper statistical inference and richer modelling of uncertainty.
* Continuous-time stochastic volatility models provide the foundation for modern derivatives pricing and risk-neutral valuation.


# Comparison of Time-Varying Volatility Models

| Feature                                      | GARCH-Type Models                               | Discrete-Time Stochastic Volatility Models         | Continuous-Time Stochastic Volatility Models      |
|----------------------------------------------|-------------------------------------------------|-----------------------------------------------------|----------------------------------------------------|
| **Representative models**                    | GARCH, EGARCH, GJR-GARCH                        | Taylor SV, SV with leverage                         | Heston model, SABR model                           |
| **Time framework**                           | Discrete-time                                   | Discrete-time                                       | Continuous-time (SDEs)                             |
| **Volatility nature**                        | Deterministic (given past data)                 | Latent and stochastic                               | Latent and stochastic                               |
| **Observability**                            | Implicit (computed from past)                   | Hidden (must be inferred)                           | Hidden (must be inferred or calibrated)            |
| **Source of randomness in volatility**       | None (driven by past returns)                   | Own innovation (separate shock)                     | Own diffusion process                               |
| **Estimation method**                        | Maximum likelihood (MLE)                        | Bayesian / simulation (MCMC, filters)               | Calibration to market prices (often risk-neutral)  |
| **Computational complexity**                 | Low                                             | Medium–High                                         | High                                                |
| **Interpretability**                         | High (simple recursion)                         | Moderate (latent states)                            | Lower (continuous-time abstraction)                 |
| **Typical use cases**                        | Volatility forecasting, risk (VaR, ES)          | Statistical inference, structural modelling        | Derivatives pricing, volatility surfaces            |
| **Captures volatility clustering**           | Yes                                             | Yes                                                 | Yes                                                 |
| **Captures leverage effect**                 | With extensions (e.g. EGARCH)                   | Naturally included                                  | Naturally included                                  |
| **Connection to markets**                    | Historical (real-world measure)                 | Historical (real-world measure)                     | Risk-neutral (pricing measure)                      |
