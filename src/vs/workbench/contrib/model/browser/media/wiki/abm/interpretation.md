# Interpretation

The output of an agent-based run describes one possible history of a stylised system. The useful readings concern what the mechanism can do and how the outcome depends on parameters.

## How to Read the Same-Group Share in the Grid Space Tab

**Grid Space** prints two lines. **Same-group neighbours** is the mean share of neighbours from the resident's own group, near one half at a random start. **Happy residents** is the share satisfied with their neighbours. **Summary** sets the share reached against **Threshold**, and calls the result emergent when it passes **Threshold** by more than 0.2. The gap between the two figures is the finding: how much more sorting occurs than residents asked for. A share that falls while **Threshold** rises means that residents cannot be satisfied, and keep moving.

## How to Read Polarisation in the Continuous Space Tab

Polarisation runs from about 0 to 1, and measures how far headings agree across the whole flock. The settled figure printed is a mean over the second half of the run. **Summary** labels the flock ordered above 0.7, disordered under 0.3, and near the transition between the two, and those cut-offs are conventions of the code. Near the transition a mean hides large swings, so read the standard deviation beside it. Polarisation also falls when several flocks travel in different directions, so a low value does not always mean that particles are locally disordered.

## How to Read the Epidemic Curves of the Graph Space Tab

**Graph Space** prints the peak share infectious, its step, and the share ever infected by the last step. Final size matters for total burden, and peak size for the load at one moment. Steps are not days unless gamma is set to mean that, since the mean infectious period is 1 / gamma steps. **Summary** prints R0 from the network's degrees and the two probabilities, and the coverage needed for herd immunity. Single runs vary widely, and a very small final size at R0 above 1 usually means an outbreak that died out by chance.

## How to Read the Parameter Sweep and Phase Diagram

**Parameter Sweep** averages over seeds at each value of the key parameter, and shows where the outcome changes fastest. **Phase Diagram** shows the outcome across two parameters as a heatmap, from one run per cell. In **Graph Space**, the white contour marks R0 = 1 on the network of the main run, and large outbreaks lie on the side with high beta and low gamma. In **Continuous Space**, a printed noise level where polarisation first drops under 0.5 is a convenient marker, and not an estimate of a critical point. Read such a map for its broad regions.

## How to Read Structure and Scenario Results

**Structure** isolates a setting of the model at fixed values of the others, and its printed closing lines give the usual reading. **Scenario** changes something during a run or before it. Results that depend on history, as on **Grid Space**, show that the state reached is not determined by parameters alone. In **Graph Space**, the three lines for no, random and best-connected vaccination compare shares infected over 20 replicates, with vaccinated people left out of the count. Coverage is a share of all people, so the gain from targeting says nothing about the cost of finding those people.

## What an Agent-Based Result Can Support

A run shows what a set of rules can produce, under the stated assumptions. It can suggest a mechanism, rule one out as insufficient, and show which parameters matter. It does not estimate an effect in a real population, as nothing in the panel is fitted to data, and the printed shares should not be quoted as forecasts. To make claims about a real system, a model needs calibration and validation, for which [Wilensky and Rand (2015)](#ref-WR2015b) give an introduction.

## References

<a id="ref-WR2015b"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling: Modeling Natural, Social, and Engineered Complex Systems*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
