# Diagnostics

## Trace Plot
**Trace Plot** shows x[1] over the last round for the single chain and for PT, on a common axis. For the default target, the single chain stays near +3 or -3; PT jumps between them many times. Long stays in one region of the PT trace mean the swaps are not reaching the target often enough.

## Joint Samples
**Joint Samples** scatters x[1] against x[2] for both runs, or overlays their histograms when d = 1. PT should show two clouds of similar size; the single chain usually one.

## Swap Acceptance and Barrier
**Swap Acceptance and Barrier** bars the acceptance rate of each neighbouring pair (i, i + 1) and plots the local barrier along beta. A well-tuned schedule gives roughly equal acceptance across pairs; a pair near 0 blocks the path. The global barrier Lambda, the sum of the rejection rates, sets the suggested number of chains, 2 Lambda.

## Index Process
**Index Process** plots which chain each replica occupies over time. A **round trip** is a replica going from the reference to the target and back; a **tempered restart**, from the reference to the target. Each restart brings an independent reference draw to the target: with none in the last round, PT has not mixed.

## Effective Sample Size
**Effective Sample Size** gives the ESS of each coordinate for both runs. The single chain can show a high ESS while stuck in one mode: ESS measures autocorrelation within the region visited and cannot see a mode never reached. The share of draws with sum(x) > 0 beside it is the check that can.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Trace | Jumps between modes | Stays in one |
| Swap acceptance | Even across pairs | Near 0 for some pair |
| Chains | About 2 Lambda | Far fewer |
| Round trips | Many in the last round | None |
| Mode share | Near 0.5 (default) | Near 0 or 1 |

## See Also
- [Assumptions](assumptions.md) · [Parallel Tempering](parallel-tempering.md) · [Interpretation](interpretation.md)
