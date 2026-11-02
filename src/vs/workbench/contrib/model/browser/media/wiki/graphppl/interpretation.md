# Interpretation

The result is a set of posterior marginals, along with a free energy. Reading them means remembering what kind of approximation produced them.

## How to Read the Posterior Marginals

**Posterior Summary** gives a mean and sd for each variable. On the first tab, they are exact under the model. On the second, the mean of mu is typically close, while the sd is too small. On the third, the marginals are Gaussian approximations at each time. A marginal says nothing about dependence between variables: under mean field, none is represented. For the trend, a band drawn from marginals does not give the distribution of a whole path.

## How to Read the Precision

`tau` is a precision, so that its scale is unfamiliar. The observation sd is about 1 / √E[tau], which is what the code prints. As 1 / √ is nonlinear, the mean of the implied sd is a little different from that figure. With q(tau) a Gamma of shape 11, the coefficient of variation of tau is 1 / √11, about 0.30, and so the sd of observations is known to about 15%. Treat that as a lower limit on the uncertainty, given the mean-field fit.

## How to Read the Credible Interval

**Credible Interval** gives central 95% intervals. They are statements about the parameter, given the model, the priors and the data, and they are not coverage statements about repeated sampling. On **Variational Message Passing**, the output marks the interval for mu as too narrow, by a modest amount at n = 20. On **Expectation Propagation**, the action reports the share of time points credibly above or below 0, each judged separately, so that it does not control for the many comparisons along the path.

## How to Read the Trend Plot

**Posterior Mean** on **Expectation Propagation** shows the trend with a 95% band, the hidden trend used to simulate, and the data as ±1. A band that contains the hidden trend most of the time is a good sign. It should be wide, because binary outcomes carry little information. With real data no hidden trend is available, so remove that line. Trends near 0 mean a probability near 0.5, and the mapping is Φ(x): x = 1 gives 0.84, and x = 2 gives 0.98.

## How to Read the Free Energy Value

An absolute value of F means little. Differences between models on the same data do have meaning: a lower F suggests more evidence, and on a tree, F is exactly −log p(y). A gap of 3 means evidence odds of about e³, or 20 to 1, if the KL gaps are equal. On the approximate tabs, that condition is not assured, so treat small differences with care. Comparisons across different data sets, or across different scalings of the data, are not valid.

## What the Results Do Not Say

Posterior uncertainty covers only the unknowns in the model. Fixed choices, such as **Known Variance** and the 0.15 step, are not reflected in the width. Agreement with the simulated truth shows that the code is working, and says little about real data. A narrow interval does not show that a model is right. Message passing also does not reveal multiple modes. State the approximation with any result, because its bias is part of the answer.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Variational Message Passing](vmp.md) · [Expectation Propagation](ep.md)
