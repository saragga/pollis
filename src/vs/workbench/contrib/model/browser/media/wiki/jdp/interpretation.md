# Interpretation

Results from the jump-diffusion panel describe simulated paths under chosen parameters. Three distinctions prevent most misreadings: rate against probability, mean against mean log growth, and a jump in X against the total change over a horizon.

## How to Read the Jump Rate Lambda

**Jump rate lambda** is an expected count per unit of time and not a probability. The chance of at least one jump in a span T is 1 - exp(-lambda T), and the expected count is lambda T. The default lambda of 2.0 therefore means two jumps per unit of time on average, whatever that unit stands for in your model. Rescaling time requires rescaling lambda, f and g together. In **Custom Rate** the same input is a coefficient on abs(X), so the current rate is lambda abs(X) and has no fixed value over a run.

## How to Read an Observed Jump Count Against Its Compensator

Lambda in **Jump Counting** is the integrated intensity along this path, also called the compensator. The difference N(T) - Lambda(T) has mean zero. With a constant rate, N(T) follows a Poisson law with mean lambda T. With a rate that depends on X, N(T) and Lambda(T) are random together and N(T) is in general not Poisson. A high count in one run is expected from time to time, and it is no evidence that the code is wrong.

## How the Compensator Changes the Meaning of Drift

The value kappa = E[exp(J)] - 1 gives the average relative move per jump, and lambda kappa X is the expected growth due to jumps. In **Compound Poisson**, E[X(T)] = X0 exp((m + lambda kappa) T) for f = m X, so jumps add to the drift you typed. In **Gaussian Jumps**, the code removes lambda kappa X from the continuous part, so E[X(T)] = X0 exp(m T) with m the coefficient you typed. Typing one drift value into both tabs therefore describes two different models.

## Why Expected Level and Mean Log Growth Differ for Jump-Diffusions

**Ensemble Moments** reports levels, and **With vs Without Jumps** reports log growth. For f = m X and g = s X, without compensation, the mean of log(X(T) / X0) is (m - s^2/2 + lambda E[J]) T, and that of X(T) is governed by m + lambda kappa. Symmetric uniform jumps leave mean log growth unchanged, since E[J] = 0, and yet raise the mean level, since kappa > 0. Under **Gaussian Jumps**, negative muJ gives a lower typical path than the expected level suggests. Quoting either figure as the growth of a typical path is a common mistake.

## How to Read Skew and Excess Kurtosis of Log Growth

With f = m X and g = s X, log growth has variance (s^2 + lambda E[J^2]) T, third cumulant lambda E[J^3] T and fourth cumulant lambda E[J^4] T. Skew therefore takes the sign of E[J^3], which is zero for symmetric jumps and, for normal jumps, equal to the sign of muJ. Excess kurtosis equals the fourth cumulant over the squared variance and shrinks like 1/T, so jumps fatten the tails most at short horizons. Each of the 500-path estimates is noisy, and the kurtosis is noisier than the skew.

## How to Read Realised Jump Sizes

**Jump Size Distribution** plots log(X after / X before) at a jump, so the x-axis is J and not a percentage move. A log-jump of -0.1 corresponds to a fall of about 9.5 percent. The histogram shows only the jump part, while the change in X over a horizon adds the diffusion and possibly other jumps. In **Custom Rate** the curve is the density of log(1 + 0.1 Z), which is close to but not exactly normal.

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Gaussian Jumps](gaussian-jumps.md)
