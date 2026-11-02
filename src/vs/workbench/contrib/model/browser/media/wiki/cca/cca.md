# CCA

Classical canonical correlation analysis is a compact eigenvalue problem. Its solution gives paired directions in two spaces, and the regularised and covariance forms in the panel are small changes to the same calculation.

## What CCA Solves

Given centred X and Y, with covariances Sxx, Syy and Sxy, the first pair of weights a and b solves:

- Maximise corr(Xa, Yb) = a' Sxy b / sqrt(a' Sxx a × b' Syy b)

The scale of a and b does not matter, so one may fix each variate to variance 1. Later pairs repeat the search, subject to being uncorrelated with all earlier variates in each set. The number of pairs is at most min(p, q). [Hotelling (1936)](#ref-Hot1936a) derived the solution as an eigenvalue problem.

## How the Solution Is Computed

Whitening puts both sets on an equal footing:

- T = Sxx^(-1/2) Sxy Syy^(-1/2)
- Singular value decomposition: T = U D V'
- Weights: a_j = Sxx^(-1/2) u_j and b_j = Syy^(-1/2) v_j
- Canonical correlations: the entries of D

The tab calls `fit(CCA, ...)` from `MultivariateStats.jl`, which centres the data and expects variables in rows, so the code swaps rows and columns with `permutedims`. **k** sets how many pairs are kept, and `rho` then measures their correlations directly.

## How Ridge Regularisation Changes CCA

[Vinod (1976)](#ref-Vin1976a) introduced canonical ridge. **Regularised CCA** replaces Sxx by Sxx + lambda I and Syy by Syy + lambda I. Those matrices can be inverted even when p or q nears n, and small eigenvalues, which cause instability, lose their grip. With **lambda (ridge)** of 0 and scaling aside, classical CCA returns. A large lambda makes the whitening nearly a constant multiple of the identity, and the directions approach those of **PLS**. The penalty treats all directions alike, so **Scaling** matters, unlike in classical CCA. The method's `rho` can be lower than classical values, and that lowering is a part of the benefit.

## How PLS Differs from CCA

**PLS** takes the singular value decomposition of Sxy directly, with no whitening. It therefore maximises covariance:

- Maximise a' Sxy b, with a'a = 1 and b'b = 1

A covariance rewards directions with large variance as well as high correlation, so it favours what is large in both sets, and a small correlated signal may be overlooked. The weights are orthonormal, and the variates of each set need not be uncorrelated, unlike those of **CCA**. No inverse is needed, so it works with p and q above n. The form used in the tab is the singular value version, and [Witten, Tibshirani and Hastie (2009)](#ref-WTH2009a) build a sparse form on the same decomposition.

## How to Choose k

**k** must be at most min(p, q). The first pairs do not change as **k** rises, so a larger value costs nothing in the fit. Choose by what stands out: **vs Permuted Y** gives a chance level for the first pair, and **Bartlett Test** gives sequential tests. **Held-Out Correlations** shows which dimensions survive on new rows. A dimension whose correlation disappears on held-out rows should not be interpreted. Later pairs have lower correlations by construction, and the drop is a useful guide.

## What the Canonical Variates Are Used For

`Zx` and `Zy` are new scores for each row, and they can feed other work. **Joint Embedding** plots one dimension's pair directly, and shows whether a strong correlation comes from the whole sample or from a few points. **Transform New Data** applies stored weights to new rows, and predicts Y from a regression on the X variates, which is a form of reduced-rank prediction. Scores of a single set are also a compact summary, though they are built to serve the link to the other set and not to explain that set's own variance.

## References

<a id="ref-Hot1936a"></a>Hotelling, H. (1936). Relations between two sets of variates. *Biometrika* 28(3–4), 321–377. [doi:10.1093/biomet/28.3-4.321](https://doi.org/10.1093/biomet/28.3-4.321)

<a id="ref-Vin1976a"></a>Vinod, H. D. (1976). Canonical ridge and econometrics of joint production. *Journal of Econometrics* 4(2), 147–166. [doi:10.1016/0304-4076(76)90010-5](https://doi.org/10.1016/0304-4076(76)90010-5)

<a id="ref-WTH2009a"></a>Witten, D. M., Tibshirani, R. and Hastie, T. (2009). A penalized matrix decomposition, with applications to sparse principal components and canonical correlation analysis. *Biostatistics* 10(3), 515–534. [doi:10.1093/biostatistics/kxp008](https://doi.org/10.1093/biostatistics/kxp008)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
