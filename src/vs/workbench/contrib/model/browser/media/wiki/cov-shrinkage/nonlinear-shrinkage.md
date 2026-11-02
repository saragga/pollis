# Nonlinear Shrinkage

**Nonlinear** shrinkage keeps the eigenvectors of the sample covariance and replaces each eigenvalue with a new value suited to its place in the spectrum. Where linear shrinkage applies one weight to the whole spectrum, this applies a separate adjustment to each eigenvalue.

## What Nonlinear Shrinkage Computes

The sample covariance is split as U diag(lambda) U'. For a fixed U, the best possible eigenvalue in Frobenius terms is u_i' Sigma u_i, which depends on the true covariance Sigma, so it is called an oracle. [Ledoit and Wolf (2020)](#ref-LW2020a) estimate that oracle in closed form: for p under n, with c = p/n, delta_i = lambda_i / [(pi c lambda_i f(lambda_i))^2 + (1 - c - pi c lambda_i Hf(lambda_i))^2]. Here f is a kernel estimate of the density of sample eigenvalues, and Hf is its Hilbert transform. The result is U diag(delta) U'. The theory comes from the limiting behaviour of large random matrices, in the line that starts with [Marčenko and Pastur (1967)](#ref-MP1967a).

## How the Nonlinear Tab Is Set Up

The tab has one input, **X (n × p)**, as `AnalyticalNonlinearShrinkage()` takes no tuning choices in this panel. The code runs `cov(AnalyticalNonlinearShrinkage(), X)`, makes the result dense and symmetric as `S`, and reports the condition numbers of `S` and `cov(X)`. With no target and no weight to specify, its results depend only on the data, so anyone running it on those data obtains the same estimator. That also means no prior knowledge of the structure can be built into it.

## How the Map Differs from Linear Shrinkage

| Feature | **Linear** | **Nonlinear** |
|---|---|---|
| Eigenvalue map | A straight line for a scalar target | A curve fitted to the data |
| Eigenvectors | May change with the target | Those of the sample covariance |
| Inputs | **Target**, **Shrinkage Method** | None |
| Knowledge of structure | Enters through the target | Not used |
| Cost | Low | An eigendecomposition, so greater for large p |

**Eigenvalue Shrinkage Map** shows the curve directly. Eigenvalues in crowded regions tend to be pulled together, and an isolated large one tends to be adjusted differently.

## Where Nonlinear Shrinkage Works Well

Large p with p/n not small is where it has the most to offer, particularly if eigenvalues fall into separated groups that one linear weight cannot serve. The work needs little from the user, so it fits automated pipelines and comparisons. It also has no target that might be wrong. If n is large against p, the map approaches the diagonal, and the estimate comes close to the sample covariance, as it should.

## Where Nonlinear Shrinkage Misleads

Its theory rests on large p and n, so results at small p should be checked against **Linear**. Since sample eigenvectors are kept, it cannot correct poor directions, and with far too few rows those directions may be mostly noise. It treats all directions alike, so it offers no protection against outliers, which can distort both eigenvalues and eigenvectors. A claim of being optimal refers to the Frobenius loss and to estimators of this kind, not to every use of the matrix. Scale matters as well, so standardise variables with differing units.

## What to Compare Nonlinear Shrinkage With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether it improves on a simple blend | **Linear** | **Held-Out Log-Likelihood**, and **Eigenvalue Shrinkage Map** |
| Whether a known structure would help | **Woodbury**, or a suitable **Target** | A score that beats this tab |
| Whether outliers play a part | **Biweight** | Large **Correlation Changes** between tabs |

Any strong gap between these estimators is worth tracing back to the data before choosing.

## References

<a id="ref-LW2020a"></a>Ledoit, O. and Wolf, M. (2020). Analytical nonlinear shrinkage of large-dimensional covariance matrices. *Annals of Statistics* 48(5), 3043–3065. [doi:10.1214/19-AOS1921](https://doi.org/10.1214/19-AOS1921)

<a id="ref-MP1967a"></a>Marčenko, V. A. and Pastur, L. A. (1967). Distribution of eigenvalues for some sets of random matrices. *Mathematics of the USSR-Sbornik* 1(4), 457–483. [doi:10.1070/SM1967v001n04ABEH001994](https://doi.org/10.1070/SM1967v001n04ABEH001994)

## See Also

- [Linear Shrinkage](linear-shrinkage.md) · [Woodbury Estimator](woodbury.md) · [Biweight](biweight.md) · [Decision Guide](decision-guide.md)
