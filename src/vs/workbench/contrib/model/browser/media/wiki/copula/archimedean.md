# Archimedean Copulas

## Definition
An Archimedean copula is built from a generator phi, a decreasing function from [0, infinity) to [0, 1] with phi(0) = 1: C(u1, ..., ud) = phi(phi^-1(u1) + ... + phi^-1(ud)). One function, usually with one parameter theta, defines the copula in any dimension. Kendall's tau has a closed form in the generator.

## The Families

| Family | Kendall's tau | Lower tail | Upper tail |
|---|---|---|---|
| **Clayton** | theta / (theta + 2) | 2^(-1/theta) | 0 |
| **Gumbel** | 1 - 1/theta | 0 | 2 - 2^(1/theta) |
| **Frank** | any in (-1, 1) | 0 | 0 |
| **Joe** | between 0 and 1 | 0 | 2 - 2^(1/theta) |
| **AMH** | -0.18 to 1/3 | 0 | 0 |
| **BB1** | 1 - 2 / (delta (theta + 2)) | 2^(-1/(theta delta)) | 2 - 2^(1/delta) |

Clayton with theta = 2, the default data, has tau 0.5 and lower tail dependence 2^(-1/2), about 0.71.

## Character
- **Clayton**: strong dependence in the lower tail, weak in the upper; joint crashes, joint low values.
- **Gumbel**: the reverse, and also an extreme value copula; joint floods, joint peaks.
- **Joe**: an upper tail stronger than Gumbel's for the same tau.
- **Frank**: symmetric with no tail dependence, but unlike the Gaussian, it allows negative dependence in its Archimedean form and has lighter joint tails.
- **AMH**: weak dependence only.
- **BB1**: two parameters, so both tails can be dependent, with different strengths.

## Limitations
In d > 2, a one-parameter Archimedean copula is **exchangeable**: every pair has the same dependence. Real data rarely do, which is the motivation for nested Archimedean and vine copulas. The negative dependence some families allow in two dimensions is not available in higher dimensions.

## See Also
- [Elliptical Copulas](elliptical.md) · [Extreme Value Copulas](extreme-value.md) · [Dependence Measures](dependence-measures.md)
