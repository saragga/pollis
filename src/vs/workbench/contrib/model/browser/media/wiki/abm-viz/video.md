# Video Animation

A video shows the order of events in a run. It is the natural form when the question is how a pattern forms, and not only what it ends up as.

## What the Video Animation Tab Records

**Video Animation** calls `abmvideo` with the file name, the model and the shared colour rules. The function draws a frame, steps the model, and repeats until it has written **Steps (T)** + 1 frames, from step 0 to step T. The tab prints the path of the saved file and the labels before and after. The call changes the model in place, so `model` afterwards holds the state at step T, and any Next Step that reads `model` sees that state. [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a) describe the function within `Agents.jl`.

## How Long an Agent-Based Video Runs

- Frames: T + 1
- Duration in seconds: (T + 1) / **Frame rate (fps)**
- Model steps between two frames: 1

Doubling **Steps (T)** at a fixed rate doubles the length, and doubling **Frame rate (fps)** halves it. A slow process, where few agents change at each step, needs a low rate to be readable. A long run recorded at a high rate may pass too quickly for its events to be followed.

## Which Inputs the Video Animation Tab Uses

**Steps (T)** sets the number of frames, and **Frame rate (fps)** the playback speed. **Output file** names the file saved in the working directory, and must end in `.mp4`. **Grid Side**, **Density**, **Threshold** and **Seed** set the model. Printing `pwd()` shows where the file went, and the code prints the full path after each run. **Video with Observable** saves its own file, with `observable-` before the name given.

## Where Video of an Agent-Based Model Is Strong

Motion shows mechanism: unhappy residents leaving, clusters growing and merging, and a map that slowly stops changing. Those sequences are hard to infer from frames. A video communicates a model to an audience in seconds, and a wrong rule often shows itself as a motion that nobody expected. Videos also suit the moment when a pattern first appears, as nothing has to be chosen in advance about which steps to look at.

## Where Video of an Agent-Based Model Misleads

Viewers remember moving images poorly, and compare frames that are not on screen together with difficulty. The review by [Tversky, Morrison and Betrancourt (2002)](#ref-TMB2002a) argues that animation helps only when it is slow and clear enough to be perceived, and when it matches the concept being shown. A compelling video is also one run, and invites a story about what happened that may not hold across seeds. With residents acting one at a time, a frame shows the state after all moves of that step, not the moves one by one.

## What to Compare a Video With

**Video with Observable** adds the segregation index under the grid, so that visual changes and their measure are seen together. **Multi-Panel Figure** gives three fixed moments for close reading. **Animation Summary** prints the start and end values, the step by which most of the change had happened, and whether moving stopped, which can guide what to look for in the video. Run a second **Seed** before drawing conclusions from any single film.

## References

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-TMB2002a"></a>Tversky, B., Morrison, J. B. and Betrancourt, M. (2002). Animation: can it facilitate? *International Journal of Human-Computer Studies* 57(4), 247–262. [doi:10.1006/ijhc.2002.1017](https://doi.org/10.1006/ijhc.2002.1017)

## See Also

- [Factsheet](factsheet.md) · [Static Plot](static-plot.md) · [Interactive Explorer](interactive.md) · [Decision Guide](decision-guide.md)
