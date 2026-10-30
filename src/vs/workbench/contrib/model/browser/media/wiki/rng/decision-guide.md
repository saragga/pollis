# Decision Guide

| Situation | Method |
|---|---|
| Tests, examples, published results that must reproduce years later | **Stable RNG** |
| Fast general simulation | **Xoshiro** |
| Default rand() calls, multithreaded code | **Task Local RNG** |
| Matching results from R, Python or older Julia code | **Mersenne Twister** |
| Seeds, tokens, anything that must not be predictable | **Random Device** |
| Low-discrepancy points for integration | Quasi-Random Numbers panel |

## Decision Flow

1. **Must it reproduce across Julia versions?** Use StableRNG.
2. **Otherwise, for speed**, use Xoshiro with an explicit seed.
3. **Pass the rng explicitly** to every function that draws.
4. **For parallel streams**, give each task its own seeded generator.
5. **For unpredictability**, use RandomDevice, and never seed it.

## Rules of Thumb

- **Always seed** simulations and record the seed with the results.
- **Pass rng as an argument** rather than relying on the global state.
- **Never tune the seed**: report results that hold across several.
- **One generator per thread**, never one shared.
- **StableRNG for tests**: a test that breaks with a Julia upgrade only because the stream changed is no test.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
