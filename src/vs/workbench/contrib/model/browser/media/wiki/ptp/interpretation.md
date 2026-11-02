# Interpretation

Each fit returns an intensity, and most outputs are readings of it. The main misreadings confuse what the rate is with what caused it, and a plug-in forecast with a full predictive statement.

## How to Read the Printed Fit of Each Point Process Tab

**Poisson** prints the event count and the rate with an exact 95% interval, and **Inhomogeneous** prints the fitted rate at nine times. **Cox** prints the mean and interval of the weight W. **Hawkes** prints mean and 95% interval for mu, alpha, beta and kappa. **Network Hawkes** prints events per node, baselines and a matrix of link probabilities, with row m as the source. Bayesian intervals describe the posterior under each package's priors, and the Poisson interval is a frequentist one.

## How to Read the Fitted Intensity Plot of a Point Process

**Intensity Function** plots the fitted lambda(t) across [0, T] at 1000 points, with a dashed true curve on simulated data. On **Hawkes** and **Network Hawkes**, the saw-tooth shape is the jump after each event and its decay. On **Cox**, the solid line is the conditional intensity at the posterior mean, with self-excitation included, while the band labelled 95% band (baseline) covers only the hidden rate. So the line can leave the band after an event.

## How to Read the Branching Structure of a Hawkes Fit

**Branching Structure** on **Hawkes** prints kappa as direct offspring per event, the immigrant share 1 - kappa, and the mean cluster size 1/(1 - kappa). A kappa of 0.5 means that about half the events are immigrants. The share is a statistical split and does not label a given event. The mean cluster size is taken over the draws, so a draw near or above 1 can make it huge or meaningless: read the interval of kappa first.

## How to Read the Network Connectivity of a Network Hawkes Fit

**Network Connectivity** shows two heatmaps with source node in rows and target node in columns. P(link) is the posterior probability of a link, where values near the prior may mean that the data say little. A.*W is the mean effective weight, the expected direct offspring on the target per source event. **Branching Structure** adds the stationary rate and immigrant share per node.

## How to Read Effective Intensity at Point Process Events

**Effective Intensity** evaluates the fitted intensity at each event, using only earlier events. On **Network Hawkes**, the value is the intensity of the node that fired. High values mark events inside bursts, and values near the baseline mark isolated ones. A flat series on **Poisson** comes from the model's constant rate, and the values on any tab depend on the fit.

## How to Read Point Process Forecasts

**Next Event Time** plots F(s) = 1 - exp(-integral of lambda over T to T + s) with the median wait, on **Poisson**, **Hawkes** and, for an event on any node, **Network Hawkes**. It leaves out parameter uncertainty. **Future Events** shows one simulated path over 50 time units, a single draw and not a forecast of counts. **Expected Count** gives the mean and 90% predictive interval over those 50 units on **Poisson** and **Hawkes**, and includes parameter uncertainty. **Inhomogeneous** and **Cox** offer no forecast.

## Common Misreadings of Point Process Results

Clustering is not proof of triggering, since a hidden rate produces it too, and a high W or kappa can also reflect a trend. A rate from N / T says nothing of whether the rate was stable. A log-likelihood from one tab should not be compared raw with another: parameter counts differ, and **Cox** and **Network Hawkes** count each event's full offspring mass, while **Hawkes** truncates it at T.

## See Also

- [Diagnostics](diagnostics.md) · [Intensity Function](intensity-function.md) · [Decision Guide](decision-guide.md)
