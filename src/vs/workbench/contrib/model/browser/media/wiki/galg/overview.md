# Overview

A genetic algorithm searches by imitating selection and inheritance: good candidates pass on parts of themselves to the next generation. The panel covers a classic real-coded form, two compact forms that keep a probability model in place of a population, and a form built on random keys.

## How a Genetic Algorithm Works

Each generation goes through three steps:

1. Selection picks parents, favouring good values.
2. Crossover mixes parents to make children.
3. Mutation adds small random changes.

Only values of f are used, with no gradients. The power of the method lies in recombination: partial solutions found in different individuals can come together. [Whitley (1994)](#ref-Whi1994a) gives a clear tutorial, and [Goldberg (1989)](#ref-Gol1989a) the classic textbook.

## How the Four Tabs Differ

| Tab | Holds | Encoding | Variation |
|---|---|---|---|
| **GA** | Population | Real numbers | Tournament, intermediate crossover, Gaussian mutation |
| **Compact GA** | Probability per bit | Gray-coded fixed-point bits | Pairwise competitions |
| **BRKGA** | Population | Random keys in [0, 1] | Elite-biased crossover, fresh mutants |
| **MCCGA** | Probability per bit | IEEE bits of a Float32 | Pairwise competitions |

All four are written directly in the panel's code, so that every step can be read and edited. [Compact GA](cga.md) covers both of the probability-vector tabs.

## Which Problem the Panel Solves by Default

**Objective f(x)** defaults to the Rastrigin function, in **Dimension (n)** = 5, on a box from −5.12 to 5.12:

- f(x) = 10 n + Σ (x² − 10 cos(2π x))

Its global minimum of 0 lies at the origin. Local minima sit close to every integer point, and each coordinate near an integer k adds about k². The test suits these methods because a good answer needs recombining coordinates that are each already near 0, and it punishes a search that loses diversity early.

## How a Run Is Budgeted

**Generations** counts rounds, and the cost differs by tab. With **Population Size** of 50 and 300 generations:

| Tab | Evaluations |
|---|---|
| **GA** | 50 + 300 × 49 = 14750 |
| **BRKGA** | 50 + 300 × 40 = 12050 |
| **Compact GA**, **MCCGA** | 1 + 300 × 50 = 15001, fewer if stopped early |

Elites keep their stored values, so they cost no new evaluation. **Compare with DE** and **Compare with CMA-ES** use the evaluations of the run for the rival, for a fair budget.

## A Common Workflow for a New Objective

1. Start with **GA** at the default settings.
2. Read **Convergence Plot** and **Population Diversity**.
3. Repeat with **Multi-Run Reliability**.
4. Vary the size with **Population Size Study**.
5. Check the answer with **Sensitivity Analysis**.
6. Compare with **Compare with DE** and **Compare with CMA-ES**.

Try the other tabs at the same **Generations** only after this first pass, and read their evaluations, as the cost per generation differs.

## References

<a id="ref-Gol1989a"></a>Goldberg, D. E. (1989). *Genetic Algorithms in Search, Optimization, and Machine Learning*. Addison-Wesley.

<a id="ref-Whi1994a"></a>Whitley, D. (1994). A genetic algorithm tutorial. *Statistics and Computing* 4(2), 65–85. [doi:10.1007/BF00175354](https://doi.org/10.1007/BF00175354)

## See Also

- [Factsheet](factsheet.md) · [Classic GA](ga.md) · [Compact GA](cga.md) · [BRKGA](brkga.md)
