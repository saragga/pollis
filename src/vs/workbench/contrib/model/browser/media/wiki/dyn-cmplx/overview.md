# Overview

Entropy measures how much new information each step of a series brings. The panel estimates it in two ways, one based on the order of values and one on repeated patterns, and tests the results against surrogate series.

## Why Measure Complexity

A correlation or a spectrum describes linear structure. A series can have a flat spectrum and still follow a strict rule, as some chaotic maps do. Entropy measures work with patterns, so they can pick up structure of a kind that second moments miss. The idea comes from the information theory treated in [Cover and Thomas (2006)](#ref-CT2006a): a process that is easy to predict adds little information per step, and a hard one adds much. These measures summarise a series in one number, and they need no fitted model.

## What the Three Tabs Do

| Tab | Measures | Output |
|---|---|---|
| **Permutation Entropy** | Variety of ordinal patterns | Value from 0 to 1 |
| **Sample Entropy** | How often close patterns stay close | Value from 0 upward |
| **Surrogate Testing** | Whether a statistic differs from a null | p-value |

The first two describe the series, and the third asks whether a description is more than a by-product of the null process.

## What Regular and Irregular Series Give

| Series | Permutation entropy | Sample entropy |
|---|---|---|
| Steady trend | 0 | Near 0 |
| Periodic, well sampled | Low | Near 0 |
| Gaussian white noise | Near 1 | About 2.19 at r = 0.2, any m |

A chaotic series lies between regular and noisy, and it can lie close to noise on both measures. Neither one alone separates chaos from noise. The **Surrogate Testing** tab addresses that question.

## Which Inputs the Tabs Share

**Time series (x)** names a vector of numbers, and the code does not create it, so it must exist before a run. **Embedding dim (m)** is the order on **Permutation Entropy**, and the template length on **Sample Entropy**, although good values differ widely between the two. **Tolerance (r)** applies to **Sample Entropy** only. The tools come from the same family as [Datseris (2018)](#ref-Dat2018a).

## A Common Workflow for a New Series

1. Plot the series, and remove any known trend.
2. Check drift with **Stationarity (PE)** and **Entropy vs Time**.
3. Choose m with **Order Sensitivity**.
4. Compute **Permutation Entropy** and **Sample Entropy**.
5. Check r with **SampEn vs r**.
6. Test the result with **Nonlinearity Test** and **Multiple Surrogates**.

Set the value of m for each tab in turn, since the two entropies call for very different values.

## References

<a id="ref-CT2006a"></a>Cover, T. M. and Thomas, J. A. (2006). *Elements of Information Theory* (2nd ed.). Wiley-Interscience.

<a id="ref-Dat2018a"></a>Datseris, G. (2018). DynamicalSystems.jl: A Julia software library for chaos and nonlinear dynamics. *Journal of Open Source Software* 3(23), 598. [doi:10.21105/joss.00598](https://doi.org/10.21105/joss.00598)

## See Also

- [Factsheet](factsheet.md) · [Permutation Entropy](permutation-entropy.md) · [Sample Entropy](sample-entropy.md) · [Surrogate Testing](surrogates.md)
