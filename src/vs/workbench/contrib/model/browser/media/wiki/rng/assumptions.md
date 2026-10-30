# Assumptions

## Pseudo-Randomness
A PRNG's output is deterministic: the same seed gives the same sequence. The assumption behind every simulation is that the sequence is statistically indistinguishable from independent uniform draws for the purpose at hand. The modern generators here pass the standard batteries of tests (TestU01's BigCrush), but no PRNG is random, and none of them is cryptographically secure.

## Reproducibility Has Limits
A seed reproduces a stream only for the **same generator, the same Julia version and the same sequence of calls**:
- Julia does not guarantee that rand, randn or shuffle produce the same values across versions, even with the same seed, for its built-in generators; **StableRNG** does.
- Drawing one more number anywhere changes everything after it.
- Multithreaded code reproduces only if each task's stream is fixed: TaskLocalRNG derives each child task's state from its parent's when it is spawned, so seeding before spawning makes it reproducible.
**RandomDevice** is never reproducible.

## Period and State
The period, how long before the sequence repeats, must far exceed the draws used: 2^126 for StableRNG, 2^256 - 1 for Xoshiro, 2^19937 - 1 for Mersenne Twister, all far beyond any simulation. More important in practice is the quality of the low bits and of successive tuples, where old linear congruential generators failed.

## Seeds
Nearby seeds, 1, 2, 3, give streams that behave as independent for the generators here, because they hash or scramble the seed into the state. For many parallel streams, seeding each with a distinct integer is standard; **Independent Streams** checks their correlations.

## Transformations
Normal and exponential draws come from uniform ones through the ziggurat algorithm, and integer ranges through rejection to avoid bias. Their correctness is assumed; **Draws Against the Target Density** checks it.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
