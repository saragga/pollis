# Diagnostics

There is no certificate of optimality, so the checks concern the progress of the run, the state of its diversity, its reliability over seeds, and the local quality of the answer.

## How to Read the Convergence Plot

**Convergence Plot** shows the best value per generation on a log scale. Fast early falls followed by a plateau are the usual picture. Long flat stretches are normal, since improvement depends on finding a lucky child. A flat line at a whole number on Rastrigin, such as 1 or 2, usually marks a local minimum one or two integer steps from the origin. A curve still falling at the end calls for more **Generations**.

## How to Read Diversity

**Population Diversity** means different things by tab:

| Tab | Measure | At the start | At convergence |
|---|---|---|---|
| **GA**, **BRKGA** | Mean standard deviation of genes | About 2.96 on the default box | Set by mutation |
| **Compact GA**, **MCCGA** | Mean of 4 p (1 − p) | 1 on **Compact GA** | 0 |

Uniform genes have standard deviation range / √12, which gives the first figure. On **GA** and **BRKGA**, diversity cannot collapse completely: mutation and fresh mutants keep adding spread.

## How to Read the Stagnation Check

**Stagnation Check** gives the last generation with a gain and the idle generations since. Its `premature` flag requires final diversity below 1e-6, with the last gain in the first half of the run. On **GA** with a positive **Mutation Rate**, or on **BRKGA** with mutants, such a low diversity is all but impossible, and so the flag will not fire there. Read idle generations and the diversity plot instead. On the compact tabs, the flag is meaningful, as there the model does collapse.

## How to Read the Convergence Rate

**Convergence Rate** gives the generation in which the run came within 1, 0.1, 0.01 and 0.0001 of its own final best. The gaps show how the effort splits between getting close and reaching precision. Since the reference is the run's own final value, a run stuck in a local minimum can look fast. Compare the final value with a known or better-found value before calling convergence quick. Multiply generations by the cost per generation to compare between tabs.

## How to Check Repeatability

**Multi-Run Reliability** repeats the run with 10 seeds, and gives `best_values`, `mean`, `spread` and `share_at_best`. A low share means that a single run is unreliable, and that restarts, a bigger population or a longer run are needed. `max_distance_between_solutions` shows whether runs reach the same place. Note that **Compare with DE** and **Compare with CMA-ES** also rerun the search. Use **Population Size Study** to test whether a bigger population lifts reliability at the same cost.

## How to Check the Answer Locally

**Sensitivity Analysis** samples 2000 points at each of four radii, with `share_better` and `mean_increase`. A zero share at small radii suggests a local minimum at that scale. A share above zero means that plain local search would do better from there, and so a polish is cheap. At the origin of Rastrigin, curvature of about 397 gives f ≈ 198 δ² per coordinate, so that even a tiny offset δ leaves a visible value. **Best Solution** re-evaluates the point, which guards against stale stored values.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Classic GA](ga.md) · [Compact GA](cga.md)
