# Surrogate-Based Optimisation: Kriging

The **Kriging** tab models the objective as a Gaussian process, fitted to all the evaluations, and evaluates next the candidate with the highest expected improvement over the best value so far.

## The stochastic process model

[Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) model the deterministic output of a computer code as the realisation of a stochastic process. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) write the DACE model as y(x) = μ + ε(x), where ε(x) is normal with mean 0 and variance σ², and the correlation between ε(xᵢ) and ε(xⱼ) is exp(−d(xᵢ, xⱼ)), with d(xᵢ, xⱼ) = Σₕ θₕ |xᵢₕ − xⱼₕ|^pₕ.

They explain why the regression terms can be reduced to a constant: modelling the correlation in this way is powerful enough. The approach, they add, has a long history in mathematical geology, global optimisation and statistics; in mathematical geology it is called Kriging and dates back to the early 1960s, with data that are often core samples and the aim of approximating the underground concentration of a valuable mineral.

## The panel's kernel

```
kern(a, b, l) = exp(-sum(abs2, a - b) / (2l^2))
```

The code standardises the values, subtracting their mean and dividing by their standard deviation, and uses a squared-exponential kernel in the unit box with one length scale l for all the variables and a nugget of 10⁻⁶ on the diagonal. In the notation of [Jones, Schonlau and Welch (1998)](#ref-JSW1998a), the kernel has every pₕ = 2, a choice they also make in their test problems, and the same θₕ in every direction.

The length scale is chosen from 0.05, 0.1, 0.2, 0.3, 0.5 and 1.0 by the highest log marginal likelihood, −½ yᵀK⁻¹y − Σ log Lᵢᵢ, where L is the Cholesky factor of K. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) estimate their parameters by maximising the likelihood of the sample.

## The predictor and its error

The prediction at x is m₀ + s₀ k(x)ᵀ K⁻¹ y, with k(x) the vector of kernel values between x and the evaluated points, and m₀ and s₀ the mean and standard deviation used to standardise y. Its standard deviation is s₀ √(1 − k(x)ᵀ K⁻¹ k(x)), floored at a tiny positive value.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) show that the DACE predictor interpolates the data, and that its mean squared error is 0 at a sampled point and close to σ² far from the data, as one would expect with a deterministic function. Their error formula also has a term for the uncertainty in the estimate of μ; the panel treats the standardised mean as known.

## Expected improvement

With f_min the best value so far, ŷ the prediction and s its standard deviation, the code computes

EI(x) = (f_min − ŷ) Φ((f_min − ŷ)/s) + s φ((f_min − ŷ)/s),

the closed form derived by [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) for E[max(f_min − Y, 0)] with Y normal with mean ŷ and standard deviation s. They show that the expected improvement is larger the lower ŷ is and the higher s is, so it balances local and global search, and that it is 0 at sampled points and highly multimodal.

## Maximising the criterion

`acquire` evaluates EI at 1 000 candidates, 500 uniform in the box and 500 Gaussian around the best point with a spread of 0.1 of the box, and returns the best. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) maximise the expected improvement with a branch-and-bound algorithm, and note that its many flat regions make standard multistart approaches difficult.

Their EGO algorithm starts from a space-filling Latin-hypercube design, checks the model by cross-validation, and stops when the expected improvement is less than 1% of the current best value. The panel's loop runs **Evaluations** steps, and **Leave-One-Out Error** gives the cross-validated errors.

## Ill-conditioning

When points are close together, two columns of the correlation matrix are nearly identical, and the matrix is nearly singular. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) name two causes: a very smooth function, whose sample points are all highly correlated, and the end of an optimisation run, when the algorithm samples near earlier points. They zero small singular values of the matrix.

The panel adds 10⁻⁶ to the diagonal before the Cholesky factorisation. **Exploration Check** prints the smallest gap between a new point and an earlier one. [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) also note matrix ill-conditioning, in their chapter on noisy data.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-SWMW1989a"></a>Sacks, J., Welch, W. J., Mitchell, T. J., & Wynn, H. P. (1989). Design and Analysis of Computer Experiments. *Statistical Science* 4(4), 409-423. [doi:10.1214/ss/1177012413](https://doi.org/10.1214/ss/1177012413)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Radial Basis Functions](rbf.md)
