# Novelty Detection — Factsheet

**Novelty detection** learns what normal data looks like from a **clean training set** and then flags new observations that do not fit. Unlike outlier detection, the model never sees the points it will judge.

| | |
|---|---|
| **Purpose** | Flag new observations, or a shift in a stream, unlike the data seen in training |
| **Input** | A clean training set plus new data, or a baseline series plus new observations |
| **Core packages** | [LIBSVM.jl](https://github.com/JuliaML/LIBSVM.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [OnlineStats.jl](https://github.com/joshday/OnlineStats.jl) |
| **Methods** | One-Class SVM and Gaussian (non-temporal); CUSUM (temporal) |
| **Output** | A novelty score and a novel/normal flag per test point, or an alarm time |
| **Key choices** | Expected false-alarm rate (nu, alpha) or shift size and threshold (k, h) |

## When to Use

- You have a **trusted sample of normal data**: a validated period, a good production batch, known-good transactions.
- New data arrives **later** and must be screened: incoming records, sensor readings, monitoring streams.
- You want a **controlled false-alarm rate** set in advance.

## What It Is Not

Novelty detection assumes the training data is clean. If the training set already contains anomalies, the boundary grows to include them; use an outlier detector (Proximity-Based Outlier Detection) to clean it first.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [One-Class SVM](one-class-svm.md)
