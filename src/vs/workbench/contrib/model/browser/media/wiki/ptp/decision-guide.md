# Decision Guide

The choice of model starts with one question about the events: whether they arrive independently, follow an outside rate, or provoke one another. A timeline alone seldom settles this, so the fits are best compared.

## Which Point Process Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Steady rate and gaps close to exponential | **Poisson** | One parameter with an exact interval |
| Slow trend or seasonal rate, no triggering | **Inhomogeneous** | A smooth rate with no assumed shape |
| Clusters from an unseen driver | **Cox** | A random rate, with W to test for triggering |
| Events that trigger more events | **Hawkes** | Self-excitation with a branching ratio |
| Several streams that influence one another | **Network Hawkes** | Directed links with posterior probabilities |
| A forecast past T is needed | **Poisson** or **Hawkes** | **Inhomogeneous** and **Cox** describe only [0, T] |

## How to Tell Self-Excitation from a Hidden Random Rate

**Cox** and **Hawkes** both produce clusters, and on one short series they can be hard to tell apart. Fit both. Under a hidden rate, the **Cox** weight W sits near 0 in **Branching Ratio**. Under triggering, W is clearly positive, and **Q-Q Plot** tends to look better for **Hawkes** than for **Inhomogeneous**. Knowledge of the process counts too: a Cox model suits an outside driver, and a Hawkes model suits a mechanism where one event causes the next.

## How to Choose the Bandwidth of the Inhomogeneous Tab

**Bandwidth (h)** is the standard deviation of the Gaussian kernel, in the units of T. Small values chase each event, and large values flatten real changes. The panel has no automatic choice, and **Log-Likelihood** always favours the smaller h on the same events. Start at a value several times the mean gap, try a range, read **Q-Q Plot**, and trust only the features that stay across that range. A cycle of known length calls for h well under that length.

## How to Set the Gaussian Process Prior of the Cox Tab

**Length Scale (l)** says how long the rate holds its level, and **GP Variance (sigma2)** says how far the log rate moves. The tab does not estimate them, so run a few values and see which conclusions change. **Squared Exp.** gives a smooth path, and **Ornstein-Uhlenbeck** a rough one that can change sharply from one grid point to the next. Results that depend strongly on these inputs mean that the data do not pin down the rate.

## How to Set the Gibbs Iterations of a Point Process Fit

**Gibbs Iterations** defaults to 2000, with the first quarter thrown away. Raise it when the summaries move on a longer run. Each sweep visits every event's parent, so time grows with event count, and with several nodes it grows further. **Network Hawkes** with many nodes has many more parameters than events can pin down, and a longer run does not cure that: use fewer nodes or a longer **Time Horizon (T)**.

## How Point Process Models Compare with Count Models

A count model on fixed bins, such as a Poisson regression, is simpler and takes covariates, which none of these point process tabs does. Point process models use exact times and describe triggering directly. Use a count model when the timestamps are coarse or when covariates drive the rate. Use a survival model when each subject has one event at most.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Goodness of Fit](goodness-of-fit.md)
