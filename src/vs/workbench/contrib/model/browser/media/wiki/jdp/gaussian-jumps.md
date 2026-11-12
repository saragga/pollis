# Gaussian Jumps

Log-normal jump sizes define the jump-diffusion of [Merton (1976)](#ref-Mer1976a). The tab follows that model and treats the typed drift as the total expected growth.

## What the Gaussian Jumps Tab Computes

The tab solves dX = (mu(X) - lambda kappa X) dt + g dW + X- (exp(J) - 1) dN, with J ~ Normal(muJ, sigmaJ) drawn afresh at each jump, and N a Poisson process of rate **Jump rate lambda**. Here mu(X) is **Drift f(X)**, and kappa = exp(muJ + sigmaJ^2/2) - 1. The code calls the corrected drift `f` and the typed expression `mu`. The solver sees only the corrected drift between jumps, and `affect!` applies the factor exp(J) at each jump time.

## What the Merton Compensator Does to the Drift

The term lambda kappa X cancels the average effect of jumps on the mean. For a linear drift mu(X) = m X, E[X(T)] = X0 exp(m T) whatever lambda, muJ and sigmaJ are. Since jumps with negative muJ have a negative kappa, the continuous part must rise between jumps to make up for falls at jumps. At the defaults the typed `0.05*X` becomes about `0.238*X` between jumps. A rising path that drops suddenly is thus how the model is meant to look, and it is not a fault. Jump risk in the original model is assumed diversifiable, a claim about pricing that the panel does not use.

## What the Gaussian Jump Moments Are in Closed Form

Let m_c stand for the coefficient of the corrected drift, m - lambda kappa, and let g = s X. With kappa2 = exp(2 muJ + 2 sigmaJ^2) - 1:

- E[X(T)] = X0 exp((m_c + lambda kappa) T) = X0 exp(m T)
- E[X(T)^2] = X0^2 exp((2 m_c + s^2 + lambda kappa2) T)
- Mean of log growth: (m_c - s^2/2 + lambda muJ) T
- Variance of log growth: (s^2 + lambda (muJ^2 + sigmaJ^2)) T
- Third cumulant: lambda (muJ^3 + 3 muJ sigmaJ^2) T
- Fourth cumulant: lambda (muJ^4 + 6 muJ^2 sigmaJ^2 + 3 sigmaJ^4) T

**Ensemble Moments** prints the first two.

## What Gaussian Jumps Add to the Shape of Log Growth

Given the number of jumps n, log growth over T is normal with mean (m_c - s^2/2) T + n muJ and variance s^2 T + n sigmaJ^2. The unconditional law is thus a Poisson mixture of normals, and it has the excess kurtosis and skew that a pure diffusion lacks. A negative muJ yields a left tail, the shape often sought for crash modelling. A small sigmaJ with a large absolute muJ gives separate humps, one per jump count, when s is small. **With vs Without Jumps** shows the resulting histogram next to the diffusion one.

## Where the Gaussian Jumps Tab Is Strong

Parameters have direct meanings: **Jump rate lambda** for frequency, **Jump mean muJ** for direction, and **Jump std sigmaJ** for spread. Holding expected growth fixed lets you vary jump parameters without changing E[X(T)] for a linear drift, which isolates their effect on risk. Closed forms exist for the first moments under linear f and g, and a conditional normal law is available for checks by hand.

## Where the Gaussian Jumps Tab Misleads

**With vs Without Jumps** runs the diffusion-only case on the corrected drift. That run therefore has the expected growth m - lambda kappa and not m, so with kappa < 0 its expected level rises faster than that of the jump run. With muJ < 0 its mean log growth is higher by the absolute value of lambda muJ T, which is a feature of the comparison and not a result about jumps. A thin normal tail understates extreme jumps. The theory line needs a linear form: a mean-reverting drift reads a wrong m at X = 1, and the printed value is then meaningless.

## What to Compare the Gaussian Jumps Tab With

Set muJ to 0 and sigmaJ near 0.115, the standard deviation of Uniform(-0.2, 0.2), to compare with **Compound Poisson** at a like jump variance, and allow for the difference in drift convention. The double-exponential law of [Kou (2002)](#ref-Kou2002a) is an alternative with fatter tails and needs an edit of `affect!`, `kappa` and `kappa2`. A pure diffusion with variance s^2 + lambda (muJ^2 + sigmaJ^2) shows what the jumps add beyond the variance.

## References

<a id="ref-Kou2002a"></a>Kou, S. G. (2002). A jump-diffusion model for option pricing. *Management Science* 48(8), 1086–1101. [doi:10.1287/mnsc.48.8.1086.166](https://doi.org/10.1287/mnsc.48.8.1086.166)

<a id="ref-Mer1976a"></a>Merton, R. C. (1976). Option pricing when underlying stock returns are discontinuous. *Journal of Financial Economics* 3(1-2), 125–144. [doi:10.1016/0304-405X(76)90022-2](https://doi.org/10.1016/0304-405X(76)90022-2)

## See Also

- [Factsheet](factsheet.md) · [Compound Poisson](compound-poisson.md) · [Custom Rate](custom-rate.md) · [Interpretation](interpretation.md)
