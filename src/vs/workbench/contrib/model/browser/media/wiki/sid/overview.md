# Sampling from Intractable Distributions — Overview

The panel asks one question: when does a single MCMC chain fail on a multimodal target, and how does parallel tempering fix it? It samples the same target twice, once with a single chain (n_chains = 1, Pigeons' slice sampler with no tempering) and once with PT, and compares them.

## The Target
**Log-potential log p(x)** is a Julia expression in x, up to a constant. The default is an equal mixture of two unit Gaussians centred at (3, ..., 3) and (-3, ..., -3), in **Dimension d** = 2: the modes are far enough apart that a single chain rarely crosses between them. A custom target is a callable struct that Pigeons evaluates, with chains started from standard Gaussian draws.

## The Reference
Pigeons cannot build a reference for a custom target, so one is given: a Gaussian N(0, s^2 I) with **Reference SD** s = 5, sampled exactly at beta = 0. It must cover every mode.

## The Run
**Rounds** = 10: round r runs 2^r scans and the schedule is re-tuned after each, so the draws and diagnostics come from the last round, 1024 draws. **Chains** = 10 sets the PT chains; **Seed** fixes the run. The main code prints the share of draws with sum(x) > 0, which is 0.5 for the default target, the round trips, the tempered restarts and the barrier Lambda with the suggested number of chains.

## Common Workflow

1. Write the **Log-potential log p(x)**, its **Dimension d** and the **Reference SD**.
2. Run, and compare the **Trace Plot** and the **Joint Samples**.
3. Check the **Swap Acceptance and Barrier**, the **Index Process** and the **Effective Sample Size**.
4. Read the **Posterior Mean** and the **Credible Intervals**.
5. Try the **Chain Count Sweep** and the **Mode Separation Sweep**.
6. Estimate the **Normalising Constant**; read **Single Chain vs PT**.

## See Also
- [Factsheet](factsheet.md) · [Parallel Tempering](parallel-tempering.md) · [Interpretation](interpretation.md)
