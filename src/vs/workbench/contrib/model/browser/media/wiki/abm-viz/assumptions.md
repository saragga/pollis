# Assumptions

A picture of a model rests on choices about what to draw and on the belief that a frame is representative. Each choice can change what a viewer concludes.

## Why One Frame Stands for One History

Every view in the panel comes from one seed. A figure shows what happened in that history, and a viewer tends to read it as what the model does. The same rules from another seed can give clusters of other shapes and places. Only **Seed** changes this, and it does so one run at a time. A claim about typical pictures needs several frames from several seeds, set side by side, which is a small change to **Multi-Panel Figure**, or an ensemble in another panel.

## What a Colour Encoding of an Agent-Based Model Assumes

A colour rule assumes that viewers can tell its colours apart and read them in the intended way. The default pair of steel blue and dark orange differs in lightness and in hue, so it stays readable for many colour-vision conditions. [Crameri, Shephard and Heron (2020)](#ref-CSH2020a) warn against colour maps that distort data or exclude readers, and recommend perceptually uniform ones. **Colour Schemes** uses `:viridis` for the same-group share for that reason. An encoding also decides what looks important, as a saturated colour draws the eye before a grey one.

## Why the Drawn State Depends on the Scheduler

A frame shows the model after a whole step. Within a step, residents act one by one in a random order set by `Schedulers.Randomly()`, and these moves are not drawn. A pattern of movement inside a step therefore cannot be seen, and a resident may move and be overtaken by events before the next frame. The moment of drawing is an assumption too: a label for step 0 reads the model before any resident has acted, and every later label reads it after all have.

## What Fixed Sizes and Marker Choices Assume

`agent_size = 12` is a fixed marker size, chosen for the default figure and grid. A larger **Grid Side** in the same figure brings squares closer, so that they can overlap and hide residents. A smaller one leaves gaps that can read as empty cells. Empty cells draw nothing, so a viewer has to tell them from the background. A check for a figure at a new size is whether the number of visible squares could match `nagents(model)`.

## What a Visual Pattern Can and Cannot Establish

Human vision finds patterns readily, including in random data. A map of random colours contains clumps, and these can look meaningful without a reference. **Same Mix, Different Pattern** gives that reference, by reshuffling groups among the same cells, and **Spatial Clustering** compares the index with its value under random mixing. A figure can suggest and explain, while a measure and replication are needed to establish. [Wilensky and Rand (2015)](#ref-WR2015a) stress that a model can look right and still be wrong.

## References

<a id="ref-CSH2020a"></a>Crameri, F., Shephard, G. E. and Heron, P. J. (2020). The misuse of colour in science communication. *Nature Communications* 11(1), 5444. [doi:10.1038/s41467-020-19160-7](https://doi.org/10.1038/s41467-020-19160-7)

<a id="ref-WR2015a"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
