# Decision Guide

The first question is whether you have equations or only data. After that, the choices concern which measure answers the question, how long to run, and how firmly to state a result.

## Which Tab Fits the Question

| Question | Tab or action |
|---|---|
| Is the system chaotic? | **Lyapunov Exponents**, **Chaos Classification** |
| How far ahead can forecasts go? | **Predictability Horizon** |
| How many variables may be needed? | **Fractal Dimension**, **Embedding Dimension** |
| How does a measured signal behave? | **Recurrence (RQA)** |
| Has a measured system changed over time? | **Stationarity Check**, RQA in windows |
| Is there nonlinear structure in the data? | **vs Linear Surrogate** |

## Which Route Fits Equations and Data

| You have | Route |
|---|---|
| Equations | `lyapunovspectrum`, then **Fractal Dimension** as a check |
| A long, clean series | Embedding, `lyapunov_from_data`, surrogates |
| A short or noisy series | **Recurrence (RQA)**, with surrogates |
| Very short series | Simple summaries, and no claim of chaos |

Equations give the most reliable values, as no reconstruction is needed. Data-based estimates are harder to defend, and they need the supporting tests. RQA tolerates short and noisy data best, and it gives descriptive measures rather than a verdict on chaos.

## How Long to Run

For an exponent, raise **Integration time (T)** until **Lyapunov Convergence** is flat at the digits required. For dimension, keep the sampling step and raise T, so that the extra points are independent and not just denser. The recurrence matrix grows with the square of the length, so a very long series needs a shorter window or down-sampling. Discard the transient in all cases. For measured data, keep to the part in which the system's conditions were steady.

## How to Choose the Recurrence Threshold

Set **Threshold (epsilon, fraction of sd)** so that RR falls between 1% and 5%, or use 0.05 to 0.2 of the sd. Fixing RR gives comparable values across series, whereas fixing ε is better for tracking a single system over time. Repeat at a few values, and report a result only if it holds across them. Noisy series need a threshold above the noise level, and a threshold no larger than about a tenth of the attractor's size is a common limit.

## When to Stop Claiming Chaos

Chaos is a strong claim. Stop short of it when the record is short, the noise is high, the surrogate test fails, or there is no clear scaling region. Describe the result in plain terms: nonlinear structure, or recurrent patterns, or limited predictability. For systems with an agreed model, a run from the equations can back the claim. For others, consider a stochastic alternative, and test whether it fits as well, before accepting a low-dimensional chaotic account of the data.

## What to Report from a Chaos Analysis

Report the system or series, its length, the sampling step, the transient, and any cleaning. For exponents, give the method, T and a measure of convergence. For D2, give the scale range and the slope plot, and also mention any Theiler window. For RQA, give the threshold, the embedding, and the minimum line length. Add the surrogate kind and number, and the seed. Name the package versions, because methods behind the same name can change between releases.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Lyapunov Exponents](lyapunov.md) · [Recurrence Analysis](rqa.md)
