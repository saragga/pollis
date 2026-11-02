# Epidemic

The SIR model divides a population into susceptible, infectious and recovered people. As a reaction network, it needs two reactions, and it runs as equations or as a stochastic process.

## Which Reactions the Tab Uses

- beta / N, S + I --> 2I (transmission)
- gamma, I --> R (recovery)

**k1 (forward rate)** sets beta, **k2 (reverse/decay rate)** sets gamma, and **u0 (initial amount)** sets the total N. A single infectious person seeds the outbreak. Dividing by N makes transmission frequency-dependent: contacts per person stay fixed as the population grows. S + I + R is conserved, so that there are no births, deaths or waning immunity. [Kermack and McKendrick (1927)](#ref-KM1927a) gave the classic analysis.

## What R0 Means

R0 = beta / gamma is the mean number of new cases caused by one case in a fully susceptible population. The mean infectious period is 1 / gamma. The code prints both, and the defaults give R0 = 10, which the code's comment calls measles-like. Above 1, an outbreak can grow. Below 1, it dies out. Infections peak when S falls to N / R0, the same point at which the effective reproduction number reaches 1. Vaccinating above a share of 1 − 1/R0 prevents growth, in this simple setting.

## How Big an Outbreak Gets

An outbreak ends with some people never infected, because transmission stops once few infectious people remain. The share s left susceptible solves the final size relation:

- log(s) = −R0 (1 − s), approximately, for a small seed

That follows from the equations without simulating them, and it depends only on R0. Note that it does not depend on the infectious period, which shifts the timing and leaves the size alone. **T (time)** should be long enough for I to return to near zero before reading R.

## Why a Single Case Can Fail to Spread

With one infectious person, chance matters at the start. If that person recovers before infecting anyone, the outbreak ends at once. The early stage acts like a branching process, in which the probability of early extinction is about 1 / R0. [Whittle (1955)](#ref-Whi1955a) studied such threshold results for stochastic epidemics. The differential equations cannot show this, as they always produce an outbreak when R0 > 1. **ODE vs Gillespie** counts the runs with fewer than 10 per cent ever infected, and prints the approximation beside the result.

## How the Stochastic Runs Relate to the Curve

**Stochastic Simulation** draws one run, and **ODE vs Gillespie** overlays up to 30 runs on the deterministic curve. Runs that take off have about the same shape as the curve, with a random delay, since the time taken to escape the early stage varies. Averaging all runs therefore gives a lower and flatter curve than the equations, and neither describes a typical run. The panel's population is small, so the spread is visible. With a larger N, that spread shrinks in relative terms.

## Where the SIR Model Falls Short

The model assumes a homogeneous, well-mixed population with exponentially distributed infectious periods. Real contact networks, age structure, latent periods, behaviour changes and waning immunity all alter its results. Adding reactions gives extensions: S --> V for vaccination, an exposed class for a latent period, and R --> S for waning. [Murray (2002)](#ref-Mur2002a) covers many of them. A model fitted to real data needs a treatment of under-reporting. Treat tab output as an illustration of mechanism, and not as a forecast of a real outbreak.

## References

<a id="ref-KM1927a"></a>Kermack, W. O. and McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. *Proceedings of the Royal Society of London, Series A* 115(772), 700–721. [doi:10.1098/rspa.1927.0118](https://doi.org/10.1098/rspa.1927.0118)

<a id="ref-Mur2002a"></a>Murray, J. D. (2002). *Mathematical Biology I: An Introduction*, 3rd ed. Springer.

<a id="ref-Whi1955a"></a>Whittle, P. (1955). The outcome of a stochastic epidemic: a note on Bailey's paper. *Biometrika* 42(1–2), 116–122. [doi:10.1093/biomet/42.1-2.116](https://doi.org/10.1093/biomet/42.1-2.116)

## See Also

- [Factsheet](factsheet.md) · [Ecological](ecological.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
