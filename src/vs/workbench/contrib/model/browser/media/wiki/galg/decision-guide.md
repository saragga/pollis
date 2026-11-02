# Decision Guide

Choose a tab by the kind of variables and by the memory and encoding available. Then set the population and the operators, and decide whether a genetic algorithm is the right kind of method at all.

## Which Tab Fits the Problem

| Situation | Tab |
|---|---|
| Continuous or mixed, a baseline to edit | **GA** |
| Tight memory, or a model of bits wanted | **Compact GA** |
| Combinatorial, through a decoder | **BRKGA** |
| Continuous, without designing an encoding | **MCCGA** |

If the choice is open, start with **GA**. Prefer **BRKGA** as soon as the solution is a permutation or a schedule, since a real-coded crossover is meaningless there.

## When to Use Another Kind of Method

| Situation | Better choice |
|---|---|
| Continuous, non-separable or ill-conditioned | CMA-ES |
| Continuous, moderate dimension | Differential evolution |
| Few, very costly evaluations | Bayesian optimisation |
| Gradient available and few minima | Local solvers with restarts |
| Linear or convex with integers | Mixed-integer programming |

**Compare with CMA-ES** and **Compare with DE** test the first two rows on your own objective. An exact solver gives a proof when the problem fits, which a GA cannot give.

## How to Set Population and Generations

The product of **Population Size** and **Generations** sets the budget. Start with 10 to 20 times the number of variables as the population, so that about 50 to 100 at n = 5. Then use **Population Size Study** at equal evaluations. On multimodal problems, a larger size and fewer generations often help, and on smooth problems, the opposite. For the compact tabs, a larger size means a smaller step per competition, so that the run lasts longer and decides bits more carefully.

## How to Set Crossover and Mutation

Keep **Crossover Rate** high, from 0.6 to 0.95. Set **Mutation Rate** near 1 / n per gene, which at n = 5 gives 0.2, and the default of 0.1 is a modest version of that. A high rate turns the search into random sampling, and a very low one loses exploration. In the code, mutation size is fixed at 10% of the range, and shrinking it over generations would help precision, at the cost of a small edit to one line.

## How to Combine a GA with Local Search

Genetic algorithms locate regions well and refine them slowly. A short local search from the final best point will often gain many digits at low cost. Inside the run, a memetic algorithm applies local search to some children, which helps greatly on rough problems, as is common in combinatorial decoders. Count the evaluations of a local step towards the budget when reporting. **Sensitivity Analysis** tells you whether a polish has anything to gain.

## What to Report from a GA Study

Report the encoding, the operators and their rates, the population, generations, and the total evaluations. Give the number of seeds, the mean, the best and worst values, and the share reaching the best. State any local search. Compare methods at equal evaluations, and also on more than one function when a general claim is being made, since a claim for one method over all problems cannot hold. Keep the seeds so that another reader can repeat the runs.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Classic GA](ga.md) · [BRKGA](brkga.md)
