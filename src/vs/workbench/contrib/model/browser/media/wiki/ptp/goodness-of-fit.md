# Goodness Of Fit

Goodness of fit for a point process comes from one result: a correct intensity turns the events into a plain Poisson process. The panel uses it in a test and a plot, and adds likelihood comparisons between models.

## What the Time-Rescaling Theorem Says

Let Lam be the compensator of a point process on [0, T]. The theorem says that the rescaled gaps tau_i = Lam(t_(i-1), t_i) are independent Exp(1) under the true model. Then z_i = 1 - exp(-tau_i) is uniform on (0, 1). The theorem reduces any model to one reference distribution, whatever its intensity looks like. [Ogata (1988)](#ref-Oga1988a) used this kind of transformed time as residual analysis for earthquake models. The article by [Brown, Barbieri, Ventura, Kass and Frank (2002)](#ref-BBVKF2002a) gives the theorem with a proof and shows the test on spike trains.

## How the Point Processes Panel Tests the Rescaled Gaps

**Time-Rescaling Test** computes tau from time 0 up to each event, then runs `ExactOneSampleKSTest(z, Uniform())`. **Q-Q Plot** draws sorted tau against Exp(1) quantiles at (i - 0.5)/m. **Network Hawkes** rescales each node by its own intensity and pools the gaps. Pooling can hide a poor fit on a small node, so a single node's gaps deserve their own look. Neither output tests independence of the gaps directly, and a plot of tau_i against tau_(i+1) in a cell of your own would.

## Why an In-Sample Rescaling Test Has Limited Power

The nominal distribution holds for a known model, while the panel plugs in estimates from the same events. Fitted parameters bring the rescaled gaps closer to Exp(1) than the true ones would, so the p-value is too large and rejections are too rare. The effect grows with the number of parameters: **Inhomogeneous** with a small **Bandwidth (h)** and **Cox** with a short **Length Scale (l)** can pass with little real fit. Rejection remains informative, and a pass only fails to find a problem. A parametric bootstrap or a split of the record gives a fairer test, and neither is in the panel.

## How to Compare Point Process Models by AIC and BIC

**Poisson vs Hawkes** prints AIC = -2 log L + 2 k and BIC = -2 log L + k log(n), with 1 parameter for Poisson and 3 for Hawkes, and lower is better. The Hawkes value comes from a maximum likelihood fit by `NHP.mle!`, with parameters bounded at 10 and an approximate likelihood that ignores truncation at T, as the code's comment says. A chi-square likelihood ratio test does not apply: under the Poisson model the branching ratio is on its boundary. Events on all nodes are pooled on **Network Hawkes**.

## What the Log-Likelihood of a Point Process Fit Can and Cannot Show

**Log-Likelihood** prints log L and log L per event at the fit. It is a fair comparison only for models fitted to the same events with similar complexity. On **Inhomogeneous**, it rises as the bandwidth shrinks, so it cannot select one. The Bayesian tabs evaluate it at the posterior mean, which ignores spread in the posterior. The tabs also differ in the treatment of offspring mass after T. Raw values across tabs are therefore a weak guide.

## How to Test a Point Process Model Beyond the Panel

Three checks go further than the Next Steps. A held-out test fits on the first part of the record and rescales the rest with the fitted model, which removes the in-sample effect. A residual plot of cumulative tau against event number should be a straight line of slope 1, and a bend locates when the model fails in time. Simulated events from the fit, compared with the real ones on a statistic such as the longest burst, test a feature that matters to the question.

## References

<a id="ref-BBVKF2002a"></a>Brown, E. N., Barbieri, R., Ventura, V., Kass, R. E. and Frank, L. M. (2002). The time-rescaling theorem and its application to neural spike train data analysis. *Neural Computation* 14(2), 325–346. [doi:10.1162/08997660252741149](https://doi.org/10.1162/08997660252741149)

<a id="ref-Oga1988a"></a>Ogata, Y. (1988). Statistical models for earthquake occurrences and residual analysis for point processes. *Journal of the American Statistical Association* 83(401), 9–27. [doi:10.1080/01621459.1988.10478560](https://doi.org/10.1080/01621459.1988.10478560)

## See Also

- [Diagnostics](diagnostics.md) · [Intensity Function](intensity-function.md) · [Assumptions](assumptions.md)
