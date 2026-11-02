# Interactive Explorer

An interactive explorer lets a user steer a model while it runs. It suits questions that are not yet well formed, when the aim is to find out what is worth measuring.

## What the Interactive Explorer Tab Opens

**Interactive Explorer** calls `abmexploration(model; params, mdata, mlabels, plotkw...)` and displays the returned figure, with the grid at the top, controls for the run, a slider, and curves for the recorded measures. `mdata` holds `segregation` and `share_happy`, labelled **Same-group neighbours** and **Happy residents**. The call also returns `abmobs`, an observable holding the model. The code uses `on(abmobs.model)` to print the step and the label after each step, so that the terminal keeps a record of what the window shows.

## Which Parameters the Interactive Explorer Can Change

`params = Dict(:min_to_be_happy => 0.0:0.05:1.0)` makes one slider over a model property. A slider can only reach a value kept in the `properties` of the model, because the agent step reads it from there at each step. Settings used only when the model is built, such as **Density** and **Grid Side**, cannot become sliders in the same way, and need a new model. Adding a slider for another rule means adding a property to the model, reading it in the step function, and adding a key to `params`.

## Which Inputs the Interactive Explorer Tab Uses

**Grid Side**, **Density**, **Threshold** and **Seed** set the starting model, and **Threshold** is the starting position for the rule. **Steps (T)** is not used by the tab itself, since a user runs the model by hand, although several Next Steps read it. **Frame rate (fps)** and **Output file** have no effect here. The window needs a graphics display, which `GLMakie.jl` opens through the graphics card. A remote session without a display cannot show it, and **Static Plot** or **Video Animation** can serve there instead.

## Where an Interactive Explorer Is Strong

A user can form and test a hypothesis in seconds, by changing the rule during a run and seeing the grid and curves respond together. The same action shows what a parameter does after a pattern has formed, as well as from a fresh start. Live control is a good way of teaching a model and of finding a region worth a formal scan. [Murray (2017)](#ref-Mur2017a) discusses the value of letting readers act on a visualisation, in a web setting.

## Where an Interactive Explorer Misleads

A session leaves no complete record, and it cannot easily be repeated, as the outcome depends on when each slider was moved. A user tends to stop when the picture looks right, which is a route to confirming what was expected. One run at each setting says nothing about variation between seeds. Slider changes also act on a state with history, so the result of a threshold in a session can differ from a fresh run at that threshold. Findings from an explorer are leads to test, and not results.

## What to Compare an Interactive Session With

Once a setting looks interesting, fix it in **Threshold** and use **Threshold Scenarios**, which compares three values from the same seed. **Frame Inspection** gives a middle path, with a live plot that advances ten steps at a time and prints the index at each stop. For a formal answer, **Ensemble & Parameter Scanning** repeats the runs over seeds and over values. A written note of the settings found, with the seed, keeps a session useful afterwards.

## References

<a id="ref-Mur2017a"></a>Murray, S. (2017). *Interactive Data Visualization for the Web*, 2nd ed. O'Reilly Media.

## See Also

- [Factsheet](factsheet.md) · [Static Plot](static-plot.md) · [Video Animation](video.md) · [Decision Guide](decision-guide.md)
