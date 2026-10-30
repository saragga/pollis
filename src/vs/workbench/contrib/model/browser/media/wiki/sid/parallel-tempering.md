# Parallel Tempering

## The Path
Parallel tempering runs N chains on the distributions pi_beta(x) proportional to pi_0(x)^(1 - beta) pi_1(x)^beta, for an increasing schedule 0 = beta_0 < beta_1 < ... < beta_(N-1) = 1. At beta = 0 is the reference, which can be sampled exactly; at beta = 1 the target. Intermediate distributions are flatter versions of the target, where a chain moves between modes easily.

## Local Moves and Swaps
Each scan has two steps:
- **Local exploration**: each chain makes an MCMC move on its own distribution, a slice sampler in Pigeons, and the reference chain draws afresh from pi_0.
- **Communication**: neighbouring chains propose to swap states, accepted with probability min(1, ratio), where the ratio compares how each distribution likes the other's state.

A state found by the reference can thus climb, swap by swap, to the target, bringing a new mode with it.

## Non-Reversible Swaps
Classical PT chooses random pairs to swap, so a state's position on the path performs a random walk, and a trip from reference to target takes about N^2 steps. Pigeons uses non-reversible PT (Syed, Bouchard-Cote, Deligiannidis and Doucet, 2022): it alternates even and odd pairs deterministically, so that states move in one direction until rejected. Round trips then take about N steps, and performance no longer collapses as the chains increase.

## The Barrier Lambda
The global communication barrier Lambda is the sum of the swap rejection rates along the path; in the limit of many chains it is a property of the reference and the target alone. It measures how hard the target is to reach from the reference. The round-trip rate is highest at about 2 Lambda chains, which Pigeons suggests.

## Adaptive Schedule
After each round, Pigeons places the betas so that the rejection rate is equal between all neighbours, using the local barrier estimated in that round. This is why rounds double in length: early rounds tune, the last one samples.

## Normalising Constants
The path also gives the ratio of normalising constants Z_1 / Z_0 by the stepping-stone estimator, a product of ratios estimated between neighbouring chains.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
