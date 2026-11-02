# Diagnostics

The checks in the panel ask whether a run has settled, whether it can be repeated, and how much of its result is chance. None compares the model with observed data.

## How to Check Whether an Agent-Based Run Has Settled

**Convergence** applies a different test on each tab. **Grid Space** steps until every resident is happy, up to 1000 steps, the absorbing state where nobody moves again. **Continuous Space** compares mean polarisation in the third and the last quarter of the run, and calls a gap under 0.05 stationary, with a running mean drawn beside the series. **Graph Space** steps until nobody is infectious and reports when the epidemic ended. In each case, a settled point later than **Steps (T)** means that the main run is too short, and the printed line says so.

## How to Read the Reproducibility Check of an Agent-Based Model

**Reproducibility** runs the model twice with the same seed and prints whether the two runs are identical. A false value points to randomness that does not pass through `abmrng(model)`, such as a call to `rand()` without the generator, and should be fixed before anything else. The check then runs seeds 1 to 10 and prints the mean, the standard deviation and the range of the outcome. A wide spread means that one run says little, and that a change of a parameter must be judged against this spread.

## How to Use an Ensemble to Measure Chance in an Agent-Based Model

**Ensemble** runs 20 replicates with `ensemblerun!` and draws every trajectory. Trajectories in one band point to a single typical outcome, and trajectories that split point to more than one. **Grid Space** and **Continuous Space** print a mean and a 90% range, and with 20 replicates that range rests on very few runs at each end. **Graph Space** adds a histogram of final size and counts major outbreaks, those above 10%. Replicates are the proper basis for any claim about a parameter's effect, and the means of several replicates compare better than two single runs.

## How to Check an Agent-Based Model Against Known Theory

Known results give a test of the code. **Grid Space** should start near a same-group share of one half, with two equal groups placed at random. **Continuous Space** should reach a polarisation near 1 with no noise and dense particles, and a level of order 1 / sqrt(N) at **Noise** 1. **Graph Space** should rarely produce a large outbreak when R0 from **Summary** is well under 1. A failure of one of these checks suggests an error in an edited step function, and a pass does not validate the model.

## How to Test the Sensitivity of an Agent-Based Model

**Parameter Sweep** and **Phase Diagram** vary parameters over a range, and **Structure** varies the setting that the tab depends on most. A result should change smoothly, except near a transition, and a jump between neighbouring values with few replicates may be noise. [Ten Broeke, van Voorn and Ligtenberg (2016)](#ref-BVL2016a) find that classical sensitivity methods have limited information content for models with emergent behaviour, and evaluate three of them. **Phase Diagram** uses one run per cell, so isolated odd cells deserve a repeat before being read as structure.

## References

<a id="ref-BVL2016a"></a>Ten Broeke, G., van Voorn, G. and Ligtenberg, A. (2016). Which sensitivity analysis method should I use for my agent-based model? *Journal of Artificial Societies and Social Simulation* 19(1). [doi:10.18564/jasss.2857](https://doi.org/10.18564/jasss.2857)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
