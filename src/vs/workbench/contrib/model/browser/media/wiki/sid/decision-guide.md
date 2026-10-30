# Decision Guide

| Situation | Method |
|---|---|
| Unimodal, smooth, differentiable target | A single chain; NUTS in Turing.jl |
| Several separated modes | **Parallel tempering** |
| A normalising constant or Bayes factor | **PT** with the stepping-stone estimate |
| Swap acceptance near 0 for some pair | More chains, about 2 Lambda |
| PT still misses a mode | A wider reference, more rounds |
| Expensive log-density, many cores | Distributed PT in Pigeons |

## Decision Flow

1. **Run a single chain** and PT with a few chains.
2. **Compare them**: if they agree and PT has round trips, the target may be easy.
3. **If they disagree**, trust PT only once it has round trips.
4. **Set the chains** to about 2 Lambda and rerun.
5. **Check with another seed**, and a wider reference if a mode may be missing.

## Rules of Thumb

- **2 Lambda chains** is near optimal for non-reversible PT.
- **Reference wider than the target**: an SD at least the distance from the origin to the furthest mode.
- **Round trips, not ESS**, tell whether PT has mixed.
- **More rounds** before more chains if the schedule is still changing.
- **Report the mode shares** of multimodal results, not only means.

## See Also
- [Factsheet](factsheet.md) · [Parallel Tempering](parallel-tempering.md) · [Assumptions](assumptions.md)
