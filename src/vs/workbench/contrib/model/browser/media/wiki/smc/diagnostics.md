# Diagnostics

## Effective Sample Size
The **effective sample size**, ESS = 1 / sum(w^2) for normalised weights, lies between 1 (all the weight on one particle) and N (uniform weights). It approximates how many independent samples the weighted particles are worth. The **ESS Trajectory** plots ESS / N at each step with the resampling threshold, and marks the steps after which the filter resampled; **ESS per Step** lists the same numbers. A typical run shows ESS falling after each update and recovering after resampling. A **sudden drop** flags an observation the particles did not anticipate: an outlier, a sharp likelihood, or a misspecified model. ESS that stays low across many steps means the proposal and the posterior hardly overlap: more particles, or a better proposal, are needed.

## Weight Distribution
The **Weight Distribution** is the histogram of N times the normalised weights at the last step: values near 1 for every particle mean uniform weights. A long right tail, a few particles with weights hundreds of times the average, is degeneracy.

## Filtering Density
The **Filtering Density** compares the weighted histogram of the particles at the last step with the exact Kalman density. Agreement in location and spread is the direct check of the approximation.

## Log-Likelihood Trajectory
The **Log-Likelihood Trajectory** plots the cumulative log p(y[1:t]) from the filter and the exact Kalman value, and the per-step differences. Small differences scattered around zero are Monte Carlo noise; a large difference at one step points to a degeneracy event there, visible as a drop in the ESS.

## Resampling and Path Degeneracy
The **Resampling and Path Degeneracy** traces the final particles back through their ancestors and counts the **distinct ancestors** at each earlier step. Each resampling step removes some lineages, so the paths stored by the filter **coalesce**: the early states are represented by few distinct particles, often a single one. This does not harm the filtering distribution at the current time, but makes the stored genealogy a poor estimate of the smoothing distribution of early states, which is why the smoother simulates backwards.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| ESS / N | Mostly above the threshold, recovering after resampling | Long stretches near 1 / N |
| Weight distribution | Weights near the average | A few particles with most of the weight |
| Filtering density | Close to the Kalman density | Shifted or too narrow |
| Log-likelihood per step | Small, scattered differences | One large jump |
| Distinct ancestors | Many at recent steps | Few even at recent steps |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
