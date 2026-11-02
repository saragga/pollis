# Recurrence Analysis

States of a bounded system keep coming back near earlier ones. Recurrence analysis records when, as a matrix of ones and zeros, and summarises the patterns in that matrix.

## What the Recurrence Matrix Is

Entry (i, j) is 1 if the states at times i and j lie within a threshold ε of each other, and 0 otherwise. [Eckmann, Kamphorst and Ruelle (1987)](#ref-EKR1987a) introduced the picture of this matrix as a recurrence plot. It is symmetric, with a full main diagonal, and it needs no stationarity or long record to draw. The code sets ε as **Threshold (epsilon, fraction of sd)** times the standard deviation of **Time series (x)**, so that the units of x do not matter.

## How to Read the Plot

| Pattern | Likely cause |
|---|---|
| Long diagonal lines, evenly spaced | Periodic motion |
| Short diagonal lines, irregular | Chaos |
| Isolated dots | Uncorrelated noise |
| Vertical and horizontal blocks | Slow phases or intermittency |
| Fading away from the main diagonal | Trend or drift |

A diagonal line means that two stretches of the orbit run side by side for that long. **Recurrence Plot** gives that picture. Reading it comes before any number, because a single number can hide a drift or a change of regime.

## What the Quantifiers Mean

| Name | Definition | High value means |
|---|---|---|
| RR | Share of ones | Frequent returns |
| DET | Share of recurrent points in diagonal lines of length 2 or more | Repeating stretches |
| L | Mean diagonal line length | Long parallel runs |
| LAM | Share of recurrent points in vertical lines | Slowly changing states |
| TT | Mean vertical line length | Long stay in such states |

`rqa(R)` computes them all, and the panel prints the main ones. [Marwan, Romano, Thiel and Kurths (2007)](#ref-MRTK2007a) review the measures and their theory.

## How to Choose the Threshold

Too small a threshold leaves few points, and too large a threshold counts almost everything. The tooltip suggests 0.05 to 0.2 of the sd, or a target RR of 1% to 5%. RR rises with ε, and DET usually rises as well, so compare series only at the same threshold or at the same RR. For Gaussian white noise, the difference of two values has sd √2 σ, and so at ε = 0.1 sd, RR is about 5.6%, a helpful hand check.

## Why Noise Gives Some DET Anyway

Short diagonal lines occur by chance. In independent noise, a recurrent point has two diagonal neighbours, each recurrent with chance RR, so that it falls in a line of length 2 or more with chance about:

- DET ≈ 1 − (1 − RR)²

For RR = 5.6%, this is about 0.11. DET near that value says no more than noise does. A value well above it is required for evidence of determinism, and a comparison with surrogates makes that formal, as in **vs Linear Surrogate** with DET in place of the exponent.

## What Embedding Does for the Matrix

The code uses the scalar series directly, so that closeness depends on a single coordinate. Two states can be close in x and far apart in full state, which adds false recurrences. Delay embedding, with `embed` and the values from **Embedding Dimension**, gives a better state and usually changes the quantifiers, so state clearly which was used. Some authors recommend embedding only with care, since it can also create spurious structure, and a good test is to see if conclusions hold both with and without it.

## References

<a id="ref-EKR1987a"></a>Eckmann, J.-P., Kamphorst, S. O. and Ruelle, D. (1987). Recurrence plots of dynamical systems. *Europhysics Letters* 4(9), 973–977. [doi:10.1209/0295-5075/4/9/004](https://doi.org/10.1209/0295-5075/4/9/004)

<a id="ref-MRTK2007a"></a>Marwan, N., Romano, M. C., Thiel, M. and Kurths, J. (2007). Recurrence plots for the analysis of complex systems. *Physics Reports* 438(5–6), 237–329. [doi:10.1016/j.physrep.2006.11.001](https://doi.org/10.1016/j.physrep.2006.11.001)

## See Also

- [Factsheet](factsheet.md) · [Lyapunov Exponents](lyapunov.md) · [Fractal Dimension](fractal-dim.md) · [Diagnostics](diagnostics.md)
