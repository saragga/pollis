# Overview

Chaos means bounded, irregular motion that is sensitive to its starting point, even though the rule that produces it is deterministic. The panel measures it in three ways: by divergence rates, by the shape of the attractor, and by recurrences.

## What Makes an Orbit Chaotic

Three features usually go together: the motion stays bounded, it never settles into a repeating pattern, and nearby starts separate exponentially. [Lorenz (1963)](#ref-Lor1963a) found all three in a three-variable model of convection. Chaos is thus distinct from noise, which has no rule behind it, and from a long but regular cycle. A chaotic orbit looks random, and yet short-range forecasts work.

## What the Three Tabs Measure

| Tab | Quantity | Question | Needs |
|---|---|---|---|
| **Lyapunov Exponents** | Rates of separation | Does it diverge, and how quickly? | The equations |
| **Fractal Dimension** | Correlation dimension D2 | How complex is the set it lives on? | An orbit |
| **Recurrence (RQA)** | RR, DET, LAM | How often and how does it return? | A time series |

The three views complement one another, and no single one settles the matter alone.

## Which System the Panel Studies

The first two tabs use the Lorenz system, at σ = 10, ρ = 28, β = 8/3:

- dx/dt = σ (y − x)
- dy/dt = x (ρ − z) − y
- dz/dt = x y − β z

To study another system, edit `Systems.lorenz` in the code. **Recurrence (RQA)**, **Embedding Dimension**, **Stationarity Check** and **vs Linear Surrogate** read **Time series (x)** instead, so that a measured series can be used. The tools come from [Datseris (2018)](#ref-Dat2018a).

## How Equations and Data Differ

With equations, an exponent can be measured directly, by following the system and its linearisation. With data alone, the state must first be rebuilt from a few measured variables, by delay embedding. A good treatment is that of [Kantz and Schreiber (2004)](#ref-KS2004a). Each step adds error, and noise weakens the results. The panel shows both routes: **Noise Sensitivity** puts an estimate from the equations beside estimates from clean and noisy data.

## A Common Workflow for a New System

1. Compute the spectrum on **Lyapunov Exponents**.
2. Check settling with **Lyapunov Convergence**.
3. Name the behaviour with **Chaos Classification**.
4. Compare geometry with **Lyapunov vs Fractal Dim**.
5. Read **Predictability Horizon**.

For a measured series, start with **Stationarity Check**, then use **Embedding Dimension**, **vs Linear Surrogate** and **RQA Summary**. Set **Time series (x)** to your own variable first, since the code does not create it.

## References

<a id="ref-Dat2018a"></a>Datseris, G. (2018). DynamicalSystems.jl: A Julia software library for chaos and nonlinear dynamics. *Journal of Open Source Software* 3(23), 598. [doi:10.21105/joss.00598](https://doi.org/10.21105/joss.00598)

<a id="ref-KS2004a"></a>Kantz, H. and Schreiber, T. (2004). *Nonlinear Time Series Analysis* (2nd ed.). Cambridge University Press.

<a id="ref-Lor1963a"></a>Lorenz, E. N. (1963). Deterministic nonperiodic flow. *Journal of the Atmospheric Sciences* 20(2), 130–141. [doi:10.1175/1520-0469(1963)020&lt;0130:DNF&gt;2.0.CO;2](https://doi.org/10.1175/1520-0469(1963)020%3C0130:DNF%3E2.0.CO;2)

## See Also

- [Factsheet](factsheet.md) · [Lyapunov Exponents](lyapunov.md) · [Fractal Dimension](fractal-dim.md) · [Recurrence Analysis](rqa.md)
