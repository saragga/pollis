# Random Numbers Generation — Overview

Every random function in Julia takes an optional generator as its first argument: rand(rng, n), randn(rng, n). Passing an explicit rng, seeded once, is the reliable way to make code reproducible; without it, the functions use the default task-local generator.

## The Generators
- **Stable RNG**: StableRNGs.jl's LehmerRNG, whose stream is guaranteed **not to change** across Julia versions. For tests and published results.
- **Mersenne Twister**: MT19937, the classic generator with period 2^19937 - 1, Julia's default before 1.7.
- **Xoshiro**: Xoshiro256++, fast with a small state, the default algorithm since Julia 1.7.
- **Task Local RNG**: the default generator: one Xoshiro state per task, so that parallel tasks do not share or race on a state.
- **Random Device**: the operating system's entropy; cannot be seeded, not reproducible.

## The Operations
The **Operation** chooses what to draw: **Uniform Floats** in [0, 1), **Uniform Integers** of a **Numeric Type**, an **Integer Range** from **Min** to **Max**, **Standard Normal**, **Exponential** with rate 1, **Random Bits**, a **Shuffle** of a **Collection**, or a **Permutation** of 1:n. **Count (n)** sets how many; **Seed** sets the start.

## Common Workflow

1. Choose a generator and its **Seed**, the **Operation** and the **Count (n)**.
2. Look at the **Draws Against the Target Density** and the **Successive Pairs**.
3. Run the **Uniformity and Independence Tests** and the **Reproducibility Check**.
4. Use it: the **Monte Carlo Estimate of Pi** and the **Monte Carlo Convergence**.
5. Compare the **Generator Speed** and the **Independent Streams**.
6. Read the **Generator Properties** and **Does the Seed Matter?**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
