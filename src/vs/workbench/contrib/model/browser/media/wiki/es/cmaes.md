# CMA-ES

The covariance matrix adaptation evolution strategy samples from a Gaussian, and learns both its scale and its orientation from successful steps. It is the usual first choice for continuous black-box problems.

## How Sampling and Selection Work

Generation g draws candidates from a multivariate normal:

- x = m + σ N(0, C)

Here m is the centre, σ the step size and C the covariance. The best μ of the λ candidates give a new centre as a weighted mean. The code sets μ = λ / 2, and λ = 4 + ⌊3 ln d⌋ gives 8 at d = 5. Steps grow longer in directions that have paid off, which is how the shape comes to fit the landscape. The derivation is due to [Hansen and Ostermeier (2001)](#ref-HO2001a).

## How the Covariance Is Learned

C is updated in two ways:

| Update | Information used |
|---|---|
| Rank-μ | The directions of the current good steps |
| Rank-one | A cumulated path of successive centre moves |

The path keeps the signs of consecutive steps, which a covariance alone discards. On a smooth quadratic, C comes to resemble the inverse Hessian, up to a scale, and so an ill-conditioned problem starts to behave like a round one. Learning it takes many evaluations, in the order of d² for a full matrix.

## How the Step Size Is Controlled

A second path tracks the centre's movement in coordinates whitened by C. Under random selection, its length should match that of a standard normal vector. A longer path means that steps agree, so that σ should rise, and a shorter one means that steps cancel, so that σ should fall. **Initial Step Size** sets the first σ, as a fraction of the widest box side, which at the default of 0.3 is about 3.07. [Hansen (2016)](#ref-Han2016a) gives the formulas with default settings.

## Why the Method Is So Robust

The update uses only ranks, so any increasing transformation of f makes no difference. Rotating the coordinates makes no difference either, given a matching start. The method therefore performs similarly on tilted and axis-aligned problems. Default settings work over a very wide range, and few problems call for tuning. **Algorithm Info** states these invariances. Box constraints break rotation invariance to a degree, and a solution near a bound deserves a check.

## Why Population Size Matters on Rastrigin

The default small population follows local slopes, and it can settle in a nearby ripple. [Hansen and Kern (2004)](#ref-HK2004a) found that much larger populations help on multimodal functions with a global structure such as Rastrigin. To try it, raise `popsize` in the code. [Auger and Hansen (2005)](#ref-AH2005a) automate this idea by restarting with doubled populations each time progress stops. The panel has no restart, so that **Multi-Start Analysis** only shows the variation across fixed-size runs.

## Where CMA-ES Is Strong and Weak

| Strong | Weak |
|---|---|
| Non-separable and ill-conditioned problems | Very cheap gradients are ignored |
| Rugged and noisy objectives | Internal cost in d² per sample |
| Few settings | Many dimensions, beyond a few hundred |
| Invariance to scaling of f | Discrete variables |

The stopping status "converged" means that the search stopped moving, not that it found the global minimum, so read it together with **Multi-Start Analysis**.

## References

<a id="ref-AH2005a"></a>Auger, A. and Hansen, N. (2005). A restart CMA evolution strategy with increasing population size. In *2005 IEEE Congress on Evolutionary Computation*, vol. 2, 1769–1776. [doi:10.1109/CEC.2005.1554902](https://doi.org/10.1109/CEC.2005.1554902)

<a id="ref-Han2016a"></a>Hansen, N. (2016). The CMA evolution strategy: a tutorial. [arXiv:1604.00772](https://arxiv.org/abs/1604.00772)

<a id="ref-HK2004a"></a>Hansen, N. and Kern, S. (2004). Evaluating the CMA evolution strategy on multimodal test functions. In *Parallel Problem Solving from Nature – PPSN VIII*, Lecture Notes in Computer Science, 282–291. [doi:10.1007/978-3-540-30217-9_29](https://doi.org/10.1007/978-3-540-30217-9_29)

<a id="ref-HO2001a"></a>Hansen, N. and Ostermeier, A. (2001). Completely derandomized self-adaptation in evolution strategies. *Evolutionary Computation* 9(2), 159–195. [doi:10.1162/106365601750190398](https://doi.org/10.1162/106365601750190398)

## See Also

- [Factsheet](factsheet.md) · [xNES](xnes.md) · [GCMAES](gcmaes.md) · [Diagnostics](diagnostics.md)
