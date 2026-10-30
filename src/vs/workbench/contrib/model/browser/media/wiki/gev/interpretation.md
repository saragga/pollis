# Interpretation

## The Parameters
- **mu, the location**: near the typical block maximum; with xi = 0, the mode.
- **sigma, the scale**: the spread of the maxima from block to block.
- **xi, the shape**: the tail. Positive values give a tail falling like z^(-1/xi), so xi = 0.25 has finite moments only below order 4; negative values give an upper bound at mu - sigma / xi.
For Port Pirie, Coles (2001) reports about mu = 3.87, sigma = 0.20 and xi = -0.05: close to Gumbel.

## Return Levels
The T-block return level z_T is the level exceeded by a block maximum with probability 1 / T: the 1 - 1 / T quantile. With annual blocks, z_100 is the 100-year level: on average exceeded once a century, and with probability 1 - (1 - 1/100)^100, about 63%, at least once in any given century. **Evaluate** gives the return level at its **Quantile p** directly.

## Tail Behaviour
**Tail Behaviour** classifies the tail from the 95% interval of xi:
- **Heavy (Frechet)** if the whole interval is above 0.
- **Bounded (Weibull)** if it is below 0.
- **Not distinguishable from Gumbel** if it contains 0, the common case with few blocks.
It also gives the probability that a new block maximum beats the record, and its return period.

## Uncertainty
The intervals of the return levels come from the delta method and are symmetric; profile likelihood intervals, asymmetric and usually wider above, are more accurate for long return periods. Bayesian estimation gives the posterior of any return level directly.

## Sample
**Sample** shows the variability of maxima: with xi = 0.1, a few draws far above the rest are expected. The sample standard deviation converges slowly as xi approaches 0.5.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
