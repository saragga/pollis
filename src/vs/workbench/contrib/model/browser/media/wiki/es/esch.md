# ESCH

ESCH is a plain evolutionary algorithm with Cauchy mutations and box constraints. Its heavy-tailed jumps can carry candidates across barriers, without any adaptation of a search distribution.

## What the Method Does

[da Silva Santos, Gonçalves and Hernández-Figueroa (2010)](#ref-SGH2010a) describe the method. It keeps a population, makes offspring by recombination and mutation, and selects the better individuals. No covariance and no step-size rule is learned, so the method has little internal state and little cost per sample. In **Algorithm Info**, "adapts" is thus "nothing: fixed Cauchy mutations". It works only with bounds, as `NLopt.jl` provides no nonlinear constraints for it.

## Why Cauchy Mutations

A Cauchy distribution has heavy tails: its variance is infinite, and large jumps occur now and then. In standard form, the chance of a draw beyond 3 in size is about 20%, as against 0.27% for a normal distribution. [Yao, Liu and Lin (1999)](#ref-YLL1999a) found that Cauchy mutation helps on multimodal functions with many local minima, through such long jumps, while being less precise near an optimum. ESCH uses this property in place of learned adaptation.

## What the Code Does

The tab calls `NLopt.optimize` with `:GN_ESCH`, the box and **Budget** as `maxeval`. `NLopt.srand` sets the seed. The start is a random point in the box, as on the other tabs. **Convergence Check** shows how early the best value appeared.

## How to Read Its Progress

A method without adaptation should show no steady fall in **Search Radius History**, or a much slower fall than in **CMA-ES**. **Convergence Curve** tends to improve in sudden steps when a jump finds a new basin, with long flat stretches. **Evaluate at Minimum** can show a large gradient norm, since refinement is poor. Polishing with a local method is often a clear gain: one that starts from `x_best` gets the precision that ESCH does not attempt.

## Where ESCH Is Strong and Weak

ESCH makes a quick first try on a box-bounded problem, with no settings to think about. Its coverage can be good on low-dimensional multimodal problems. Weaknesses include slow precision, poor handling of tilted and ill-conditioned valleys, and rapid decline with dimension. The same seed gives the same run, and yet results vary widely across seeds, so **Multi-Start Analysis** is essential before trusting a single value.

## References

<a id="ref-SGH2010a"></a>da Silva Santos, C. H., Gonçalves, M. S. and Hernández-Figueroa, H. E. (2010). Designing novel photonic devices by bio-inspired computing. *IEEE Photonics Technology Letters* 22(15), 1177–1179. [doi:10.1109/LPT.2010.2051222](https://doi.org/10.1109/LPT.2010.2051222)

<a id="ref-YLL1999a"></a>Yao, X., Liu, Y. and Lin, G. (1999). Evolutionary programming made faster. *IEEE Transactions on Evolutionary Computation* 3(2), 82–102. [doi:10.1109/4235.771163](https://doi.org/10.1109/4235.771163)

## See Also

- [Factsheet](factsheet.md) · [ISRES](isres.md) · [CMA-ES](cmaes.md) · [Decision Guide](decision-guide.md)
