# Compact GA

A compact genetic algorithm replaces the population with one probability per bit. The **Compact GA** and **MCCGA** tabs share this idea, and they differ in how a bit string becomes a number.

## How the Probability Vector Evolves

Each generation runs **Population Size** / 2 competitions, each with this form:

1. Sample two bit strings from the vector p.
2. Evaluate both, and call the better one the winner.
3. Where the bits differ, move p by 1 / N towards the winner.

[Harik, Lobo and Goldberg (1999)](#ref-HLG1999a) showed that this mimics a simple GA with uniform crossover and a population of N, using the memory of a single vector. With N = 50, each step is 0.02, so that a bit needs at least 25 consecutive wins to go from 0.5 to fixed.

## How Bits Become Numbers on Compact GA

**Bits per Variable** sets a fixed-point code. Each variable has 2^b − 1 steps across its range, which for 16 bits on the default box means steps of about 0.000156. A step this size is also a floor on accuracy. As the origin falls midway between two grid points, the closest point has each coordinate about 0.000078 away, so f cannot fall below about 6e-6 at n = 5. Raising the number of bits lowers that floor and lengthens the model.

## Why the Origin Is Hard for Plain Binary

The two grid values closest to the origin are 0111…1 and 1000…0, which differ in every bit. All 16 probabilities have to move together for such a small step, so that the middle of the box sits on the worst of the code's Hamming cliffs. The default optimum therefore tests this tab at its weakest point. A Gray code, in which neighbouring values differ by one bit, is the usual cure: change `decode` in the code to try it, and move the optimum off-centre for a fairer test.

## How MCCGA Encodes Numbers

**MCCGA** uses the 32 bits of an IEEE Float32 as the code: sign, 8 exponent bits and 23 mantissa bits, as proposed by [Satman and Akadal (2020)](#ref-SA2020a). No **Bits per Variable** applies, and the precision is that of the format. Patterns outside the box are clamped back in, or set to the midpoint if not finite. A uniform bit start would mostly produce numbers far from the box, huge or tiny, and so the initial probabilities are the bit frequencies of 10000 uniform samples from the box. Exact zero is representable here, with all bits off.

## What the Independence Assumption Costs

The model treats bits as independent, so it cannot represent a rule such as "these two bits must agree". [Thierens (1999)](#ref-Thi1999a) shows how simple GAs scale badly when building blocks must stay linked. Since **Population Size** sets step size, a larger size gives more reliable decisions, at more generations. A small size can fix bits wrongly, and no mutation can undo that, so a fixed bit stays fixed for good in this code.

## How to Read the Convergence of the Model

**Population Diversity** plots 4 p (1 − p), averaged over the bits, which is 1 when undecided and 0 when all bits are fixed. **Operator Statistics** counts undecided bits. A run stops once all bits are within 1e-9 of 0 or 1, so that fewer generations and evaluations than asked may be printed. An early stop at a poor value means that the model converged on the wrong bits, and the remedy is to raise **Population Size**.

## References

<a id="ref-HLG1999a"></a>Harik, G. R., Lobo, F. G. and Goldberg, D. E. (1999). The compact genetic algorithm. *IEEE Transactions on Evolutionary Computation* 3(4), 287–297. [doi:10.1109/4235.797971](https://doi.org/10.1109/4235.797971)

<a id="ref-SA2020a"></a>Satman, M. H. and Akadal, E. (2020). Machine coded compact genetic algorithms for real parameter optimization problems. *Alphanumeric Journal* 8(1), 43–58. [doi:10.17093/alphanumeric.576919](https://doi.org/10.17093/alphanumeric.576919)

<a id="ref-Thi1999a"></a>Thierens, D. (1999). Scalability problems of simple genetic algorithms. *Evolutionary Computation* 7(4), 331–352. [doi:10.1162/evco.1999.7.4.331](https://doi.org/10.1162/evco.1999.7.4.331)

## See Also

- [Factsheet](factsheet.md) · [Classic GA](ga.md) · [BRKGA](brkga.md) · [Diagnostics](diagnostics.md)
