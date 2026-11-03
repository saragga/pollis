# Surrogate-Based Optimisation: Overview

Surrogate-based optimisation minimises an expensive function by fitting a cheap model, the surrogate, to the evaluations made so far and using it to choose the next point. The panel runs the same loop with three surrogates: a quadratic response surface, Kriging and radial basis functions.

## Expensive functions

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) start from engineering problems in which the number of function evaluations is severely limited by time or cost, giving the example of an automotive crash simulation that may take twenty hours. One way to address the limit, they write, is to fit response surfaces to data collected by evaluating the objective at a few points, and to use the surfaces for visualisation, trade-off analysis and optimisation.

In the foreword to [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a), Donald R. Jones puts the basic idea of the surrogate approach as investing the computational budget in fast mathematical approximations to the long-running codes, which can then answer many questions before one returns to the code to test the ideas.

## Computer experiments

[Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) describe a computer experiment as a number of runs of a code with various inputs, and note that the output of many such codes is deterministic: rerunning the code with the same inputs gives identical observations. Their approach models the deterministic output as the realisation of a stochastic process, which gives a statistical basis for choosing the inputs and estimates of the uncertainty of predictions.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) call this the DACE stochastic process model, after the title of that paper, and use it for global optimisation. The **Kriging** tab follows the same idea with a Gaussian-process surrogate.

## The loop

Each tab runs the same steps in the code:

1. evaluate the objective at **Initial Samples** points of a Latin-hypercube design in the box from **Lower Bounds** to **Upper Bounds**;
2. fit the surrogate to all the evaluations so far;
3. choose the next point from candidate points with the surrogate's acquisition rule;
4. evaluate the objective there, and repeat steps 2 to 4 **Evaluations** times.

The result is the best evaluated point and its value, with the trace of the best value after each evaluation. [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) organise the subject in the same stages: sampling plans, constructing a surrogate, and exploring and exploiting it.

## Exploitation and exploration

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) identify the key to using response surfaces for global optimisation as balancing the need to exploit the approximating surface, by sampling where it is minimised, against the need to improve the approximation, by sampling where the prediction error may be high. [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) distinguish prediction-based exploitation, error-based exploration and criteria that balance the two.

The three tabs strike the balance in different ways: **Response Surface Methods** minimises the quadratic near the best point, **Kriging** maximises the expected improvement, and **Radial Basis Functions** weighs the prediction against the distance from evaluated points.

## Three surrogates

| Surrogate | Fit | Next point |
|---|---|---|
| **Response Surface Methods** | Full quadratic by least squares | Minimum of the quadratic among candidates near the best point |
| **Kriging** | Gaussian process, squared-exponential kernel, length scale by marginal likelihood | Maximum expected improvement |
| **Radial Basis Functions** | Cubic radial basis interpolant with a linear tail | Lowest weighted score of prediction and distance, as in the stochastic RBF method |

[Jones (2001)](#ref-Jon2001a) presents a taxonomy of the existing approaches for using response surfaces in global optimisation. [Regis and Shoemaker (2007)](#ref-RS2007a) introduce the stochastic response surface method that the **Radial Basis Functions** tab follows.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-Jon2001a"></a>Jones, D. R. (2001). A Taxonomy of Global Optimization Methods Based on Response Surfaces. *Journal of Global Optimization* 21(4), 345-383. [doi:10.1023/A:1012771025575](https://doi.org/10.1023/A:1012771025575)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-RS2007a"></a>Regis, R. G., & Shoemaker, C. A. (2007). A Stochastic Radial Basis Function Method for the Global Optimization of Expensive Functions. *INFORMS Journal on Computing* 19(4), 497-509. [doi:10.1287/ijoc.1060.0182](https://doi.org/10.1287/ijoc.1060.0182)

<a id="ref-SWMW1989a"></a>Sacks, J., Welch, W. J., Mitchell, T. J., & Wynn, H. P. (1989). Design and Analysis of Computer Experiments. *Statistical Science* 4(4), 409-423. [doi:10.1214/ss/1177012413](https://doi.org/10.1214/ss/1177012413)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
