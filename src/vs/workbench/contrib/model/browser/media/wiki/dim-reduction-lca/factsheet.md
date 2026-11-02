# Factsheet

The Latent Component Analysis panel replaces the p features of each observation with k scores, using MultivariateStats.jl. Its three tabs look for different structure: straight directions of largest variance, curved structure through a kernel, or shared causes with noise particular to each feature.

## What the Latent Component Analysis Panel Does

| Item | Description |
|---|---|
| **Purpose** | Summarise a table of features by a few scores per observation, and rebuild the features from those scores |
| **Julia stack** | MultivariateStats.jl for the models; Plots.jl for the Next Steps |
| **Models** | **PCA**, **Kernel PCA** and **Factor Analysis** tabs |
| **Input shape** | **Feature Matrix** is n × p, one row per observation; the code transposes it to p × n for the package |
| **Output** | Scores `Y` (n × k), rebuilt data `X_hat` and shares of variance `explained` |
| **Key choice** | How many dimensions to keep, and whether the data call for a linear, a kernel or a latent variable model |

## How the PCA, Kernel PCA and Factor Analysis Tabs Differ

| Tab | What the code fits | What the scores are | What the rebuilt data are |
|---|---|---|---|
| **PCA** | `fit(PCA, Xt; maxoutdim=k)`: orthonormal directions of largest variance | Projections onto those directions | The projection back from k directions |
| **Kernel PCA** | `fit(KernelPCA, Xt; kernel=kernel, maxoutdim=k, inverse=true)`: eigenvectors of the centred Gaussian kernel matrix | Projections in the feature space of the kernel | Approximate pre-images from a learned inverse map |
| **Factor Analysis** | `fit(FactorAnalysis, Xt; maxoutdim=k, method=:cm)`: Cov(x) = W W' + Psi | Posterior means of the factors | The common part only, W × scores + mean |

## Which Inputs the Latent Component Analysis Tabs Use

**Feature Matrix**, **Output Dimensions** (k, default 2) and **Scaling** apply to all three tabs. **Scaling** offers **Standardise**, the default, and **Centre Only**, and **Project New Data** reuses the training mean and standard deviation. **gamma (RBF bandwidth)**, default 1.0, applies to **Kernel PCA** alone, in k(x, y) = exp(-gamma ||x - y||^2). **Output Dimensions** is an upper limit in two tabs: **PCA** stops once its components reach 99% of the variance, and **Factor Analysis** keeps only factors whose scaled eigenvalue exceeds 1.

## See Also

- [Overview](overview.md) · [PCA](pca.md) · [Kernel PCA](kpca.md) · [Factor Analysis](fa.md)
