# Gaussian Mixture Models

**GMM** assumes that the data were drawn from a weighted mix of normal distributions, and it gives each observation a probability of belonging to each component. Among the tabs of the panel, only this one rests on a full probability model.

## What a Gaussian Mixture Model Computes

The density of a row x is p(x) = sum over j of w_j N(x; mu_j, S_j), where w_j are the weights, which add up to 1, and mu_j and S_j are the mean and covariance of component j. Parameters are fitted by the EM algorithm of [Dempster, Laird and Rubin (1977)](#ref-DLR1977a). The E step computes each point's probability for each component, given the current parameters. The M step updates the weights, means and covariances from those probabilities. The likelihood does not fall from one pass to the next, though it can settle at a local optimum, so the start matters.

## How the GMM Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | none | n by p data, with observations in rows |
| **k** | 3 | Number of components |
| **max_iter** | 300 | Limit on EM passes |

The code comes from BetaML.jl, described by [Lobianco (2021)](#ref-Lob2021a). It builds `GaussianMixtureClusterer(n_classes = k, maximum_iterations = max_iter)` and runs `fit!(model, X)`, then `predict(model, X)` gives `probs`, an n by k matrix. `labels` takes the largest probability in each row. BetaML.jl documents these defaults: diagonal Gaussians, a `minimum_variance` of 0.05 that guards against collapsing components, and starting values from k-means.

## Where GMM Works Well

Components may differ in spread and weight, so unequal groups are handled better than in **K-Means**. Posterior probabilities give a stated measure of doubt for each point, which **Membership Uncertainty** shows. Because the model has a likelihood, settings can be compared by BIC or AIC, which do not rely on distances. New rows are scored directly by **Assign New Data**, through `predict(model, X_new)`.

## Where GMM Misleads

Components are not always clusters. A skewed or heavy-tailed group may need several Gaussians to fit it, and a likelihood-based choice of **k** will count each one. With the default diagonal form, a correlated group appears as a chain of narrow components, while a full covariance needs about p squared parameters per component, so few observations per cluster make it unreliable. `minimum_variance` is an absolute floor, so its effect depends on the scale of the features. Confident probabilities are only as good as the assumption behind them, and a misspecified mixture can be very sure and still wrong.

## What to Compare GMM With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether the extra model pays off | **K-Means** | High **Agreement with K-Means**, so the simple method is enough |
| Whether probabilities depend on the model | **Fuzzy C-Means** | Which points are doubtful under both |
| Whether normal shapes are fair | **DBSCAN** | Dense groups that are split across several components |

Keep the features and their scaling fixed across these fits, because a change in either can alter the components.

## References

<a id="ref-DLR1977a"></a>Dempster, A. P., Laird, N. M. and Rubin, D. B. (1977). Maximum likelihood from incomplete data via the EM algorithm. *Journal of the Royal Statistical Society Series B* 39(1), 1–22. [doi:10.1111/j.2517-6161.1977.tb01600.x](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x)

<a id="ref-Lob2021a"></a>Lobianco, A. (2021). BetaML: The Beta Machine Learning Toolkit, a self-contained repository of machine learning algorithms in Julia. *Journal of Open Source Software* 6(60), 2849. [doi:10.21105/joss.02849](https://doi.org/10.21105/joss.02849)

## See Also

- [Fuzzy C-Means](fuzzy-cmeans.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
