# Surrogate-Based Optimisation: Assumptions

What the panel assumes about the objective, the box and the budget, and what each surrogate assumes about the shape of the function.

## A deterministic objective

The code evaluates **Objective f(x)** once at every point and treats the value as exact: the Kriging and radial basis surrogates pass through the evaluated points, up to a small regularisation, and the quadratic is fitted to them by least squares. [Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) note that many computer codes are deterministic, so that rerunning them with the same inputs gives identical observations, and [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) draw the consequence for prediction: once a point has been sampled, its value is known, and the uncertainty there should be zero.

For noisy objectives, [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) write that the DACE methodology can also handle data with both signal and noise, and [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) give a chapter to infill criteria with noisy data, with a regressing form of Kriging.

## An expensive objective

The design is built for a small number of evaluations: **Initial Samples** plus **Evaluations**, 50 by default. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) describe the problems they address as those in which the number of function evaluations is severely limited by time or cost, and existing methods often require more evaluations than can be comfortably afforded.

The surrogate is refitted after every evaluation, from all the points so far. [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) state the two key requirements of a surrogate as a significant speed increase in use and useful accuracy, and note that the two are often in tension.

## A continuous function

[Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) explain that surrogates are educated guesses as to what a function might look like, based on a few points where its value can be afforded, and that they become useful through the assumptions built into them, for example that the function is continuous, and that its derivatives are continuous too.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) base the stochastic process model on the same idea: if two points are close together, the errors of a regression at those points should also be close, so the model assumes a correlation that is high for nearby points and low for points far apart.

## A box

The search is confined to the box from **Lower Bounds** to **Upper Bounds**: the design, the candidates and the result all lie inside it. Every surrogate works on the box mapped to [0, 1]ⁿ, so the variables enter on a common scale.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) point out that a plain Euclidean distance weights all the variables equally, and use a weighted distance with one parameter θₕ per variable, which they interpret as the importance or activity of that variable. The panel's Kriging uses a single length scale for all the variables of the unit box.

## The surrogates' shapes

| Surrogate | What it assumes about f |
|---|---|
| **Response Surface Methods** | Close to a quadratic near the best point |
| **Kriging** | A realisation of a Gaussian process with squared-exponential correlation, smooth in every direction |
| **Radial Basis Functions** | Well represented by a sum of cubic radial functions centred at the evaluated points plus a linear trend |

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) relate the exponent of their correlation function to smoothness: a value of 2, as in the squared-exponential kernel, corresponds to smooth functions, and values near 1 to less smoothness.

## The dimension and the design

A full quadratic in n variables has (n + 1)(n + 2)/2 coefficients, 6 for n = 2 and 66 for n = 10, and the least-squares fit needs at least as many points to determine them. **Surrogate Guide** lists the same minimum.

For the initial design of the Kriging approach, [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) write that, based on past experience, about 10k points are needed in k dimensions. [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) discuss the curse of dimensionality and how many sample plan and infill points to use.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-SWMW1989a"></a>Sacks, J., Welch, W. J., Mitchell, T. J., & Wynn, H. P. (1989). Design and Analysis of Computer Experiments. *Statistical Science* 4(4), 409-423. [doi:10.1214/ss/1177012413](https://doi.org/10.1214/ss/1177012413)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
