# Interpretation

## The Draws
The main code prints the values drawn. **Uniform Floats** lie in [0, 1); **Integer Range** includes both **Min** and **Max**; **Uniform Integers** cover the whole range of the **Numeric Type**, negative included for Int64; **Shuffle** returns a new vector, leaving the **Collection** unchanged (shuffle! changes it in place).

## Generator Properties
**Generator Properties** gives the algorithm, the period, whether the stream is the same across Julia versions, and the intended use of the chosen generator. Only StableRNG answers true for stability.

## Generator Speed
**Generator Speed** times filling a vector of a million floats with Xoshiro, Mersenne Twister, StableRNG and RandomDevice. Xoshiro is typically fastest, a millisecond or less; RandomDevice is far slower, since each call goes to the operating system. For simulations that draw billions of numbers, the generator's speed matters; for most, it does not.

## Independent Streams
**Independent Streams** draws 100,000 normals from each of four generators seeded with consecutive seeds and prints their correlation matrix. Off-diagonal correlations should be of order 1 / sqrt(100,000), about 0.003: consecutive seeds give independent streams.

## Monte Carlo Estimate of Pi
**Monte Carlo Estimate of Pi** estimates pi as 4 times the share of a million random points in the unit square that fall inside the quarter circle, with its standard error, about 0.0016, and the actual error. The error should be within two standard errors.

## Does the Seed Matter?
**Does the Seed Matter?** computes the mean of 10,000 uniforms for each of 20 seeds. The spread of the means across seeds should match the theoretical standard error, 1 / sqrt(12 x 10,000), about 0.0029. The seed changes the particular result, never its distribution: a result that holds for one seed but not others is noise, and choosing the seed that gives the best result is a form of p-hacking.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
