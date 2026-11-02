# Static Plot

A static plot freezes the model at chosen moments. It is the form best suited to a report, and to comparing states closely.

## What the Static Plot Tab Draws

**Static Plot** builds a figure with two axes and draws the grid with `abmplot!`, first at step 0 and then at step **Steps (T)**. The starting frame comes from a second call to `initialize()`, which repeats the layout since the seed is the same. The model is then stepped forward in place with `step!(model, T)`. Each frame's title gives the segregation index and the share of happy residents at that step, computed by `label`, so the picture and its measure appear together. [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a) describe the drawing function.

## What the Static Plot Tab Measures in Its Titles

- Same-group share of a resident: same-group neighbours / all neighbours, over up to 8 surrounding cells
- Segregation index: the mean of that share over residents who have neighbours
- Happy share: the share of residents with same-group share at least **Threshold**, or with no neighbours

Both figures are rounded to two digits in the title. The index is one summary of the map, and two grids with the same index can look different.

## Which Inputs the Static Plot Tab Uses

**Steps (T)** sets when the second frame is taken. **Grid Side**, **Density**, **Threshold** and **Seed** set the model, through keywords of `initialize`. **Frame rate (fps)** and **Output file** have no effect here. The figure size and the square aspect of each axis are set in the code. A figure stays on screen until it is replaced, and saving one as a file means adding a call such as `save("grid.png", fig)` after the figure is built.

## Where Static Plots of an Agent-Based Model Are Strong

Still frames can be studied for as long as needed, and placed side by side so that the eye compares like with like. Nothing depends on memory of what happened earlier, which is the weakness of moving images. They print in a paper and in a report, and their cost is low. The review by [Tversky, Morrison and Betrancourt (2002)](#ref-TMB2002a) found that animation often fails to beat a well-made static graphic, once the two carry equal information.

## Where Static Plots of an Agent-Based Model Mislead

Two frames hide the path between them, so an early change and a late change look the same. A frame is also one seed's history, and blocks of a certain size may be chance. The fixed `agent_size` suits the default grid, and on a much larger or smaller **Grid Side** squares can overlap or leave gaps that change the visual impression. Titles round to two digits, so small differences in the index vanish. Reading a frame as typical, without other seeds, is the most common mistake.

## What to Compare a Static Plot With

**Multi-Panel Figure** adds a middle frame at step T / 2, and shows whether the change was early or late. **Observable Overlay** puts the two measures under the final grid over time. **Threshold Scenarios** draws the final grid at three thresholds with the same seed. **Same Mix, Different Pattern** sets the final grid beside a reshuffled copy, which shows how much of the picture a group share cannot describe.

## References

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-TMB2002a"></a>Tversky, B., Morrison, J. B. and Betrancourt, M. (2002). Animation: can it facilitate? *International Journal of Human-Computer Studies* 57(4), 247–262. [doi:10.1006/ijhc.2002.1017](https://doi.org/10.1006/ijhc.2002.1017)

## See Also

- [Factsheet](factsheet.md) · [Video Animation](video.md) · [Interactive Explorer](interactive.md) · [Interpretation](interpretation.md)
