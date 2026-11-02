# Classic GA

The **GA** tab runs a real-coded genetic algorithm: tournament selection, intermediate crossover, Gaussian mutation and one elite. Each operator appears in a few lines of the generated code.

## How Selection Works

A tournament of 3 picks three members at random and keeps the best. The best individual enters a tournament with chance of about 3 / N, so that it expects about 3 copies per generation. Unchecked, it would then fill a population of 50 in about log₃ 50, or 3.6 generations. Larger tournaments push harder. Tournaments use only the order of values, so that rescaling f does not change them, and they do not need the sorting that rank selection does.

## How Crossover Works

With chance **Crossover Rate**, each gene of a child is drawn along the line between its parents:

- child = a + (1.5 u − 0.25)(b − a), with u uniform on [0, 1]

The child can lie up to a quarter of the gap beyond either parent, which is the BLX-0.25 of [Eshelman and Schaffer (1993)](#ref-ES1993a). Overshoot matters: plain averaging would keep children between their parents, and so diversity would shrink at each generation. When parents agree on a gene, the child agrees as well, so that spread narrows as the population converges.

## How Mutation Works

Each gene is mutated with chance **Mutation Rate**, by adding noise of standard deviation 10% of its range, which on the default box is 1.024. At a rate of 0.1 with 5 genes, about 41% of children get at least one mutation, as 1 − 0.9^5 = 0.41. That size stays fixed, so it provides steady exploration, and it never helps with fine tuning. Precision comes from crossover alone, and clamping at the bounds can pile points up on a face of the box.

## What the Elite Does

The best individual is copied unchanged to the next generation, and its stored value is reused, so that the best value can never rise. Without it, a good solution could be lost by chance. A single elite is mild. A larger number would speed up convergence, at a cost in diversity. Because the elite is exempt from mutation, the final answer is a point that was actually evaluated, and **Best Solution** re-evaluates it as a check.

## Why Binary Coding Is Not Used

Classic texts encode variables in bits, and they explain the search through schemata, as [Goldberg (1989)](#ref-Gol1989a) does. Real coding fits continuous variables directly, without a fixed resolution. In place of a bit flip, it uses a change on the scale of the range. Crossover between real values has a different effect, and the older theory carries over only in part. The bit-based alternatives in the panel are on the **Compact GA** and **MCCGA** tabs.

## Where the Classic GA Is Strong and Weak

| Strong | Weak |
|---|---|
| Simple and easy to modify | Slow final precision |
| Tolerates rough, multimodal functions | Tuning of population and rates |
| Mixes coordinates of separable functions | Struggles on tilted, non-separable valleys |
| Handles custom operators and encodings | Costly on expensive objectives |

Per-gene operators favour axis-aligned structure, so that a rotated Rastrigin function will be much harder than the default one. **Compare with CMA-ES** shows the contrast on such a test.

## References

<a id="ref-ES1993a"></a>Eshelman, L. J. and Schaffer, J. D. (1993). Real-coded genetic algorithms and interval-schemata. In *Foundations of Genetic Algorithms*, 187–202. Elsevier. [doi:10.1016/B978-0-08-094832-4.50018-0](https://doi.org/10.1016/B978-0-08-094832-4.50018-0)

<a id="ref-Gol1989a"></a>Goldberg, D. E. (1989). *Genetic Algorithms in Search, Optimization, and Machine Learning*. Addison-Wesley.

## See Also

- [Factsheet](factsheet.md) · [Compact GA](cga.md) · [BRKGA](brkga.md) · [Diagnostics](diagnostics.md)
