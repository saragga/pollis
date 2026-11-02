# Diagnostics

The checks in the panel ask whether a picture shows what is intended, and whether what it shows agrees with the numbers. None tests whether the model describes a real system.

## How to Check the Colour Encoding of an Agent-Based Plot

**Colour Encoding Check** lists the groups present against the colours in its `palette`, and reports any group without a colour. It prints the number of residents against the number of cells and the count of empty cells, so that the visible squares can be checked. The plot then marks unhappy residents with crosses, for those about to move. A failure is most likely after an edit, such as a third group with no colour. Note that `palette` restates the colours of `groupcolor` by hand, so an edit to one needs an edit to the other.

## How to Match a Plot with Its Numbers

**Frame Inspection** draws a live plot with `abmplot` and advances it three times by 10 steps, with `step!(abmobs, 10)`, printing the label at each stop and pausing one second. Rising blocks of colour should go with a rising index. A map that changes while the index does not, or the reverse, points to an error in the measure or in the drawing. The step lets you see a frame while the corresponding number is on screen, which video playback cannot.

## How to Check the Measure Against a Reference

**Spatial Clustering** prints the observed same-group share at step T, its value under random mixing, the excess, and **Threshold**. At the start of a run, the excess should be near zero, as residents are placed at random. A large excess at the start points to a mistake in setting up the groups. With two equal groups, the random-mixing value sits a little under one half. A small excess at the end means that little sorting has taken place, whatever the picture seems to suggest.

## How to Check Whether a Pattern Is More Than Composition

**Same Mix, Different Pattern** assigns the groups at random among the cells of the final state, and draws both versions. The group shares and the density are identical, while the index and the map differ. A viewer can use the second panel to calibrate what random clumping looks like at this density. If the two pictures look alike and the indices are close, the run produced little structure. The reshuffle uses its own generator with seed 1, so it does not depend on **Seed**.

## How to Check How a Run Unfolded

**Animation Summary** prints segregation and happiness at the start and end, the step by which 90% of the change had happened, and whether anyone is still moving. Read the step only when segregation has risen, since a fall makes the rule report step 0, as its condition is then met at once. A share of happy residents equal to 1 means that the run has reached its absorbing state. Anything else means that residents still move at step T, and that a longer **Steps (T)** may change the result.

## How to Check That a Window or a File Was Produced

Failures here are usually about the environment and not the model. **Static Plot** and **Interactive Explorer** need a display to show a window. **Video Animation** prints the full path of the file, and if the file is missing, check the working directory with `pwd()` and check that **Output file** ends in `.mp4`. [Danisch and Krumbiegel (2021)](#ref-DK2021a) describe the backends of the plotting system, and a file-based backend can replace `GLMakie.jl` where no display exists.

## References

<a id="ref-DK2021a"></a>Danisch, S. and Krumbiegel, J. (2021). Makie.jl: flexible high-performance data visualization for Julia. *Journal of Open Source Software* 6(65), 3349. [doi:10.21105/joss.03349](https://doi.org/10.21105/joss.03349)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
