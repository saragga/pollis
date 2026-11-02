# BRKGA

A biased random-key genetic algorithm evolves vectors of numbers in [0, 1], and a decoder turns each vector into a solution. The biased part favours elite parents, and fresh random members keep diversity alive.

## What a Random Key Is

[Bean (1994)](#ref-Bea1994a) introduced random keys, to keep crossover valid on sequencing problems. Any vector of keys decodes to a feasible solution. Sorting the keys .46, .91, .33, .75, .51 gives the order 3, 1, 5, 4, 2, which can serve as a tour or a schedule. Crossover then works on keys alone, and it never yields an invalid permutation. In the panel, the decoder is simply `lb .+ k .* (ub .- lb)`, since the default problem is continuous.

## How the Generations Are Built

Sort the population, and form the next generation from three parts:

| Part | Source | Default number |
|---|---|---|
| Elite | Best members, copied | 10 |
| Mutants | Fresh random keys | 8 |
| Children | Crossover of one elite and one non-elite parent | 32 |

Only mutants and children are evaluated, so that a generation costs 40 evaluations. Mutants here mean new random individuals, and not changed copies. [Gonçalves and Resende (2011)](#ref-GR2011a) describe the design, and compare it with unbiased random-key GAs.

## How the Bias Works

Each key of a child comes from the elite parent with chance **Elite Inheritance**, and otherwise from the non-elite parent. A value above 0.5 pulls children towards good solutions, and at 0.7 most genes come from the elite parent. Because one parent is always elite, good material spreads quickly, while the non-elite parent injects variety. The authors report that this bias generally improves on the unbiased variant.

## Which Settings the Literature Suggests

**Elite Fraction**, **Mutant Fraction** and **Elite Inheritance** have ranges commonly suggested for this method:

| Setting | Suggested | Default |
|---|---|---|
| Elite share | 0.10 to 0.25 | 0.2 |
| Mutant share | 0.10 to 0.30 | 0.15 |
| Inheritance | 0.5 to 0.8 | 0.7 |

Few problems respond sharply within these ranges. Too many elites leave little room for new material, and too few mutants allow early convergence. Note that the population should scale with the length of the key vector, so that a large **Dimension (n)** needs a larger **Population Size**.

## Why Decoders Make the Method General

All problem knowledge lives in the decoder, while the search stays the same. To apply the tab to scheduling, routing or packing, only `decode` and the objective have to change. A smart decoder can build a good solution from keys, including greedy repair or local search. Decoding cost becomes part of the evaluation, and it can dominate. The panel's table therefore suggests this tab mainly for combinatorial problems, with continuous problems being a simple demonstration.

## Where BRKGA Is Strong and Weak

Strengths are a simple framework, valid solutions from any keys, and few parameters. Elitism guarantees that the best value does not get worse. Weaknesses come when the decoder is poor, since changes in keys then barely affect solutions, or too strongly change them. Uniform-style crossover on continuous problems can be slower to reach precision than a method with learned shape. Mutants are always completely random, which sets a floor on diversity, so it does not converge in the way that **Compact GA** does.

## References

<a id="ref-Bea1994a"></a>Bean, J. C. (1994). Genetic algorithms and random keys for sequencing and optimization. *ORSA Journal on Computing* 6(2), 154–160. [doi:10.1287/ijoc.6.2.154](https://doi.org/10.1287/ijoc.6.2.154)

<a id="ref-GR2011a"></a>Gonçalves, J. F. and Resende, M. G. C. (2011). Biased random-key genetic algorithms for combinatorial optimization. *Journal of Heuristics* 17(5), 487–525. [doi:10.1007/s10732-010-9143-1](https://doi.org/10.1007/s10732-010-9143-1)

## See Also

- [Factsheet](factsheet.md) · [Classic GA](ga.md) · [Compact GA](cga.md) · [Decision Guide](decision-guide.md)
