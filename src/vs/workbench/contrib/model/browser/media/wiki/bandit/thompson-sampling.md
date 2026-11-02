# Thompson Sampling

Thompson sampling keeps a probability distribution over what each arm is worth, and pulls each arm with the probability that it is the best. Exploration follows directly from what remains unknown.

## How the Thompson Sampling Tab Chooses an Arm

Each arm's success probability has a Beta posterior. At each step, the rule draws one value from every posterior and pulls the arm with the highest draw. A well-known arm has a narrow posterior, whose draws stay near its mean. A little-known arm has a wide one, and sometimes draws high. The idea is old: [Thompson (1933)](#ref-Tho1933a) asked how likely it is that one unknown probability exceeds another, with allocation of treatments in mind.

## How the Beta Posterior Updates

- Prior: p_a follows Beta(alpha, beta)
- Likelihood: a success has probability p_a
- Posterior after N pulls and W successes: Beta(alpha + W, beta + N − W)
- Posterior mean: (alpha + W) / (alpha + beta + N)

Each pull adds 1 to one of the two parameters, so an update is a single addition. The Beta family is conjugate to a Bernoulli reward, which is why no numerical integration is required. Other reward types need another family, or an approximate posterior.

## How to Choose a Prior for Thompson Sampling

**Prior alpha** and **Prior beta** set the prior, with alpha = beta = 1 giving a uniform one. Their sum acts like a count of earlier pulls, so a large sum gives a strong prior that takes data longer to overrule. **Parameter Sweep** tries (1, 1), (0.5, 0.5), (2, 2), (5, 5), (1, 5) and (5, 1). The pair (1, 5) expects low rewards and (5, 1) expects high ones, with the second encouraging more early exploration. The same prior goes on every arm in the tab, though real knowledge may differ by arm, which a small code change allows.

## What Regret Thompson Sampling Achieves

For a long time, Thompson sampling had strong empirical results and weak theory. [Agrawal and Goyal (2011)](#ref-AG2011a) gave a logarithmic regret bound for the multi-armed problem. **Lai-Robbins Bound** draws the limit against which that growth can be judged, on the same arms. Thompson sampling is often the best performer in practice, and **Algorithm Benchmark** can test that for a given set of arms and horizon. Any claim holds only for the case tried, and with the number of runs used.

## Which Inputs the Thompson Sampling Tab Uses

**Prior alpha** and **Prior beta** apply to every arm. **Arm Success Probabilities** sets the arms, and the rule draws one Beta value per arm at each step, so its cost per step grows with the number of arms. **Random Seed** covers both rewards and posterior draws in the main run. **Exploration (epsilon)** and **UCB Constant (c)** are not used. **Optimal Arm** adds `posterior_probability_best`, from 10000 joint draws, using a fixed seed of its own.

## Where Thompson Sampling Is Strong and Weak

Randomised choices tolerate delayed feedback well, as the same batch of posteriors still spreads pulls across arms. Prior knowledge has a natural place, and the idea extends to many structured problems, as the tutorial of [Russo, Van Roy, Kazerouni, Osband and Wen (2018)](#ref-RVKOW2018a) shows. Weaknesses are a need for a posterior that can be sampled, and an outcome that depends on the prior over short horizons. Exploration also shrinks steadily, so it adapts poorly when arms change over time, unless old data are discounted.

## References

<a id="ref-AG2011a"></a>Agrawal, S. and Goyal, N. (2011). Analysis of Thompson sampling for the multi-armed bandit problem. [arXiv:1111.1797](https://arxiv.org/abs/1111.1797)

<a id="ref-RVKOW2018a"></a>Russo, D., Van Roy, B., Kazerouni, A., Osband, I. and Wen, Z. (2018). A tutorial on Thompson sampling. *Foundations and Trends in Machine Learning* 11(1), 1–96. [doi:10.1561/2200000070](https://doi.org/10.1561/2200000070)

<a id="ref-Tho1933a"></a>Thompson, W. R. (1933). On the likelihood that one unknown probability exceeds another in view of the evidence of two samples. *Biometrika* 25(3–4), 285–294. [doi:10.1093/biomet/25.3-4.285](https://doi.org/10.1093/biomet/25.3-4.285)

## See Also

- [Factsheet](factsheet.md) · [epsilon-Greedy](epsilon-greedy.md) · [UCB](ucb.md) · [Interpretation](interpretation.md)
