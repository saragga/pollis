# Copula Estimation

Setting **Target** to **Copula c(u)** in any tab removes the margins from the data and leaves the flow their dependence. The separation rests on Sklar's theorem, as set out by [Nelsen (2006)](#ref-Nel2006a).

## What Sklar's Theorem Says About a Copula

A copula is a joint distribution on the unit cube with uniform margins. By Sklar's theorem, any joint distribution function can be written as F(x) = C(F_1(x_1), ..., F_D(x_D)), and C is unique when the margins are continuous. The joint density then factors:

p(x) = c(F_1(x_1), ..., F_D(x_D)) × p_1(x_1) × ... × p_D(x_D)

Strictly increasing changes of a variable leave c unaffected, so it describes dependence with no reference to units. [Genest and Favre (2007)](#ref-GF2007a) introduce the subject for applied work.

## What the Copula Target Does to the Data

Lines at the top of each tab's code prepare the data:

- `pit(x)` gives u = (rank − 0.5) / n for each variable
- `data` holds the normal scores z = Phi^(−1)(u), with Phi the standard normal distribution function

Rank-based pseudo-observations are the usual route to a copula with unknown margins ([Genest, Ghoudi and Rivest (1995)](#ref-GGR1995a)). The probit step moves the data off the bounded cube, whose edges cause trouble for density estimates ([Geenens, Charpentier and Paindaveine (2017)](#ref-GCP2017a)).

## What the Log-Density Means Under the Copula Target

`logdensity(model, data)` returns log p(z) on the normal-score scale, and not log c(u). Neither the code nor any Next Step converts it. By the change of variables, with phi the standard normal density:

log c(u) = log p(z) − sum over i of log phi(z_i)

In Julia, that is `logdensity(model, data) .- vec(sum(logpdf.(Normal(), data); dims=1))`. The result is a true copula density only if the fitted margins of p are standard normal, which nothing in the loss imposes. Under independence, log c(u) is 0 everywhere.

## How the Next Steps Read Under the Copula Target

**Training Curve**, **Data vs Latent Space**, **Latent Normality** and **Per-Step Log-Determinant** all work on normal scores, so their axes are not in original units. **Density Slice** shows p(z) along the scores of the first variable, with the others near 0. **vs Multivariate Gaussian** fits a Gaussian to the scores, which makes it a Gaussian copula baseline. An in-sample gain from the flow may point to dependence beyond a correlation matrix, or to overfitting.

## How to Score New Points Under the Copula Target

**Held-Out Log-Likelihood** and **Density of New Points** evaluate `X_test` and `X_new` as given, with no rank or probit step, so the two numbers from **Held-Out Log-Likelihood** lie on different scales. First map each new value through the training margin of its variable: find its position among the sorted training values, convert that to a value in (0, 1), and apply the probit function. Values outside the training range need a rule of their own. The panel keeps no margins.

## Where a Copula Fitted by a Flow Misleads

`sortperm` gives tied values distinct ranks by position, so rounded or discrete data gain differences that were never observed. Scores are limited by n, the largest being Phi^(−1)(1 − 1 / (2n)), so dependence beyond the most extreme ranks can only be extrapolated. No output reflects the error of the ranks themselves. With so many parameters, a small sample can yield a detailed copula that is only noise.

## What to Compare a Flow Copula With

The Gaussian copula baseline through **vs Multivariate Gaussian** comes first. Parametric families, such as Student t or Archimedean copulas, use far fewer parameters and report named quantities such as tail dependence. A flow adds value when dependence has a shape these families miss and the sample is large. Modelling both the margins and the copula with flows is another design, which this panel does not offer ([Wiese, Knobloch and Korn (2019)](#ref-WKK2019a)).

## References

<a id="ref-GCP2017a"></a>Geenens, G., Charpentier, A. and Paindaveine, D. (2017). Probit transformation for nonparametric kernel estimation of the copula density. *Bernoulli* 23(3), 1848–1873. [doi:10.3150/15-BEJ798](https://doi.org/10.3150/15-BEJ798)

<a id="ref-GF2007a"></a>Genest, C. and Favre, A.-C. (2007). Everything you always wanted to know about copula modeling but were afraid to ask. *Journal of Hydrologic Engineering* 12(4), 347–368. [doi:10.1061/(ASCE)1084-0699(2007)12:4(347)](https://doi.org/10.1061/(ASCE)1084-0699(2007)12:4(347))

<a id="ref-GGR1995a"></a>Genest, C., Ghoudi, K. and Rivest, L.-P. (1995). A semiparametric estimation procedure of dependence parameters in multivariate families of distributions. *Biometrika* 82(3), 543–552. [doi:10.1093/biomet/82.3.543](https://doi.org/10.1093/biomet/82.3.543)

<a id="ref-Nel2006a"></a>Nelsen, R. B. (2006). An introduction to copulas. Springer Series in Statistics. [doi:10.1007/0-387-28678-0](https://doi.org/10.1007/0-387-28678-0)

<a id="ref-WKK2019a"></a>Wiese, M., Knobloch, R. and Korn, R. (2019). Copula & marginal flows: disentangling the marginal from its joint. arXiv:1907.03361. [doi:10.48550/arXiv.1907.03361](https://doi.org/10.48550/arXiv.1907.03361)

## See Also

- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
