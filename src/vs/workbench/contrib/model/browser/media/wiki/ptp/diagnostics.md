# Diagnostics

A fitted intensity always looks plausible on a plot of the same events. These checks transform the events by the fit, so that departures from the model become visible against a known reference.

## How to Run the Time-Rescaling Test on a Point Process

**Time-Rescaling Test** converts each gap into the integral of the fitted intensity over that gap, maps it to z = 1 - exp(-tau), and applies a Kolmogorov-Smirnov test against the uniform distribution. A small p-value shows lack of fit. A large one is weak evidence only: the model was fitted to these events, so the test rejects less often than its nominal level, as the printed message says. **Network Hawkes** rescales each node and pools the results.

## How to Read the Q-Q Plot of Rescaled Point Process Gaps

**Q-Q Plot** sets the sorted rescaled gaps against the quantiles of Exp(1), with a dashed reference line. Points along the line support the model. Points above the line at the right are long rescaled gaps, which show unexplained clustering: the model expected more events in the quiet stretches. A next step is **Hawkes**, or a smaller **Bandwidth (h)** when fitting **Inhomogeneous**.

## How to Check Stationarity with the Branching Ratio

**Branching Ratio** prints the posterior mean and 95% interval of kappa on **Hawkes**, with P(kappa < 1). On **Network Hawkes**, it prints the same for the spectral radius of the links times the weights. A value well under 1 fits a stationary process. Values near 1, or draws above 1, suggest a trend read as excitation, so fit **Inhomogeneous** too. On **Cox**, the output is the weight W, and on **Poisson** and **Inhomogeneous** a message that the ratio is 0.

## How to Look for Clustering in Inter-Event Times

**Inter-Event Times** draws a histogram of the gaps with an exponential curve at the observed average rate, labelled Poisson at the same rate. An excess of short gaps and a longer tail is the signature of clustering. Close agreement supports **Poisson**, though a slow trend can hide in it. Events on all nodes are pooled on **Network Hawkes**, so the other nodes can mask the pattern of one.

## How to Compare Point Process Fits by Likelihood

**Log-Likelihood** gives the fit at the plug-in estimate, with its value per event. On **Inhomogeneous**, smaller bandwidths always raise it, so it cannot choose h. **Poisson vs Hawkes** prints AIC and BIC for the two maximum likelihood fits, with lower being better. A wide gap in favour of **Hawkes** supports self-excitation, under the caution that a trend can produce the same gap.

## How to Check a Point Process Sampler Without a Built-In Trace Plot

The panel has no trace plot, R-hat or effective sample size for its Gibbs samplers. Run again with twice the **Gibbs Iterations**, and treat summaries that move by more than their posterior spread as a call for a longer run. The draws remain in variables such as `mu_draws`, `kappa_draws`, `W_draws` and `A_draws`, so `plot(mu_draws)` in a new cell shows the chain. The seed is fixed by `Random.seed!(1)` in the code, so a different one means editing that line.

## See Also

- [Assumptions](assumptions.md) · [Goodness of Fit](goodness-of-fit.md) · [Interpretation](interpretation.md)
