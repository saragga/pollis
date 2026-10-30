# Assumptions

## The Log-Density
The target is known only through log p(x) up to an additive constant, and must be finite wherever the chains go: -Inf outside a support is allowed, NaN is not. With logaddexp, mixtures are computed stably on the log scale.

## The Reference Covers the Target
PT interpolates between the reference pi_0 and the target pi_1 through the tempered densities pi_0^(1 - beta) pi_1^beta. The reference is sampled exactly, so fresh independent draws enter at beta = 0 and travel up to the target through swaps. If the reference puts almost no mass near a mode, those draws never land there, and PT misses it as a single chain would. With modes at +-3, a reference SD of 5 is enough; with modes at +-10 it is not.

## Enough Chains
Swaps between neighbouring chains are accepted only if their distributions overlap. Too few chains along a long path, a large barrier Lambda, give swap acceptance near 0 for some pair and no communication. Pigeons' theory suggests about 2 Lambda chains; more costs computation without much gain.

## Enough Rounds
Each round doubles the scans and re-tunes the schedule from the previous round's swap rates. The last round's draws are kept. Too few rounds give an untuned schedule and few draws; 8 to 14 is typical.

## Local Exploration
Within each chain, Pigeons runs a slice sampler. It needs no gradient but assumes the tempered distributions are reasonably explored locally; very strong correlations or heavy tails within a mode slow it down.

## Convergence Is Not Proven
No diagnostic can prove that a chain has found every mode. Round trips and agreement between runs with different seeds give evidence, not proof.

## See Also
- [Diagnostics](diagnostics.md) · [Parallel Tempering](parallel-tempering.md) · [Decision Guide](decision-guide.md)
