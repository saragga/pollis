# Random Numbers Generation — Factsheet

A **pseudo-random number generator** (PRNG) produces a deterministic sequence of numbers that behaves, for statistical purposes, like independent uniform draws. From a **seed**, the same sequence comes back every time, which makes simulations reproducible. Julia's Random library provides the generators and the functions that turn their output into floats, integers, normals, permutations.

| | |
|---|---|
| **Purpose** | Generate reproducible random numbers for simulation, sampling, randomisation and testing |
| **Input** | A generator and its seed; an operation (uniform, integer, normal, exponential, bits, shuffle, permutation) and how many values |
| **Core packages** | [Random](https://github.com/JuliaLang/julia/tree/master/stdlib/Random), [StableRNGs.jl](https://github.com/JuliaRandom/StableRNGs.jl) |
| **Models** | Stable RNG, Mersenne Twister, Xoshiro, Task Local RNG, Random Device |
| **Output** | A vector of random values, and the generator object to pass to later calls |
| **Key choice** | Reproducibility across Julia versions (StableRNG), speed (Xoshiro), or true entropy (RandomDevice) |

## When to Use

- **Monte Carlo simulation** and bootstrapping.
- **Random assignment**: shuffling participants into treatment groups.
- **Reproducible research** and tests: a fixed seed and a stable generator.

## What It Is Not

Not cryptography: the PRNGs are predictable from their output, and only RandomDevice draws on the operating system's entropy. Not quasi-random: low-discrepancy sequences, which fill space more evenly for integration, are in the Quasi-Random Numbers panel.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
