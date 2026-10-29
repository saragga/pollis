# Assumptions

## A Good Random Number Generator
All samplers start from uniform pseudo-random numbers. Julia's default generator, Xoshiro, has excellent statistical properties for simulation; it is **not** suitable for cryptography. A **seed** makes the sequence reproducible: the same seed, generator and Julia version give the same draws.

## Independence of the Draws
rand returns **independent** draws. Statistical rules such as the 1/sqrt(n) error assume this. Draws from a Markov chain are dependent, and their errors shrink more slowly; see Markov Chain Monte Carlo.

## Moments Must Exist
The law of large numbers needs a **finite mean**, and the 1/sqrt(n) rate needs a **finite variance**. For the Cauchy (no mean) the sample mean never settles; for Student's t with 2 or fewer degrees of freedom (no variance) it settles, but slowly and erratically. Medians and quantiles converge regardless, which is why the panel tracks the median for univariate distributions.

## Correct Parametrisation
The sample is only as right as the distribution it comes from. The usual pitfalls are a standard deviation given where a variance is meant (Normal), a scale where a rate is meant (Gamma, Exponential), and a covariance matrix that is not positive definite (MvNormal).

## Tails Need Many Draws
Rare events are rarely sampled. An event of probability p appears about n p times in n draws: estimating a 1-in-1,000 probability to within 10% takes about 100,000 draws.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
