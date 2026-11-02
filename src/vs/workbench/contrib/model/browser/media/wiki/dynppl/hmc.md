# Hamiltonian Monte Carlo

**Hamiltonian Monte Carlo** uses the gradient of the log posterior to make long moves that are still likely to be accepted. Its reach comes from simulating physical motion, and it pays for this with two settings that must be chosen by hand.

## What Hamiltonian Monte Carlo Computes

The method, from [Duane, Kennedy, Pendleton and Roweth (1987)](#ref-DKPR1987a), adds a momentum vector p to the parameters theta and defines H(theta, p) = -log p(theta | y) + (1/2) p' M^(-1) p. Each iteration draws a fresh p, then runs L leapfrog steps of size epsilon. A leapfrog step moves p half a step along the gradient, moves theta a full step, and moves p the other half. Exact motion would keep H constant, so the proposal is accepted with probability min(1, exp(H_old - H_new)), which corrects the error of the numerical steps. [Neal (2011)](#ref-Nea2011a) gives a full account of why this leaves the posterior as the target.

## How the Hamiltonian Monte Carlo Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Model Name** | `my_model` | Name of the function defined by `@model` |
| **Data Variable** | `y` | Name of the observed vector |
| **Samples (n)** | 1000 | Draws kept per chain |
| **Chains** | 4 | Number of chains |
| **Step Size (epsilon)** | 0.01 | Size of each leapfrog step |
| **Leapfrog Steps (L)** | 30 | Steps per trajectory |

The code runs `sample(model, HMC(epsilon, L), MCMCThreads(), n, chains; chain_type = MCMCChains.Chains, discard_initial = 100)`. There is no warm-up in this tab, so the first 100 draws from the random starting point are dropped. A longer burn-in can be set through `discard_initial` if **Trace Plot** shows that chains are still settling at that point.

## How to Set Step Size and Leapfrog Steps

The path length is epsilon times L, so at the defaults it is 0.3. A step size that is too large makes the numerical path unstable and leads to rejections, while one that is too small wastes gradient evaluations. An acceptance rate of around 0.6 to 0.9 is a usual working aim. Path length should be long enough to cross the posterior, but a path that is too long loops back, and it costs more without gain. Parameters on different scales suit different values, and one step size must serve them all here, so rescale the data first.

## Where Hamiltonian Monte Carlo Works Well

Correlated and many-dimensional posteriors are explored far better than with random-walk methods, because the gradient directs moves along the shape of the posterior. Settings are fixed, so the behaviour is easy to reason about and the chain has a simple theoretical form. [Betancourt (2017)](#ref-Bet2017a) gives a geometric explanation of why this works and when it does not. As a teaching tool, it shows clearly what the **No-U-Turn Sampler** automates.

## Where Hamiltonian Monte Carlo Misleads

Fixed settings that suit one region can fail in another, which is most obvious with hierarchical funnels. Certain combinations of epsilon and L can also return to the starting point, so that the chain hardly moves while the acceptance rate looks high. Plain results can therefore look sound by acceptance alone. A low **Effective Sample Size** with high acceptance is a clear sign of this. Discrete parameters and non-differentiable models are outside its range, and each draw costs L gradient evaluations.

## What to Compare Hamiltonian Monte Carlo With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether hand tuning fell short | **No-U-Turn Sampler** | A higher **Effective Sample Size** per gradient |
| Whether the settings mattered | The same tab at other values of epsilon and L | Posterior means and intervals that do not move |
| Whether mixing is adequate | **Autocorrelation** | Slow decay or oscillation at the fixed path length |

Keep the model and data fixed across these runs, so that any change comes from the sampler.

## References

<a id="ref-Bet2017a"></a>Betancourt, M. (2017). A conceptual introduction to Hamiltonian Monte Carlo. arXiv:1701.02434. [doi:10.48550/arXiv.1701.02434](https://doi.org/10.48550/arXiv.1701.02434)

<a id="ref-DKPR1987a"></a>Duane, S., Kennedy, A. D., Pendleton, B. J. and Roweth, D. (1987). Hybrid Monte Carlo. *Physics Letters B* 195(2), 216–222. [doi:10.1016/0370-2693(87)91197-X](https://doi.org/10.1016/0370-2693(87)91197-X)

<a id="ref-Nea2011a"></a>Neal, R. M. (2011). MCMC using Hamiltonian dynamics. In *Handbook of Markov Chain Monte Carlo*, 113–162. Chapman and Hall/CRC. [doi:10.1201/b10905-6](https://doi.org/10.1201/b10905-6)

## See Also

- [No-U-Turn Sampler](nuts.md) · [Metropolis-Hastings](metropolis-hastings.md) · [Decision Guide](decision-guide.md)
