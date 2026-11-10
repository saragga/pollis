# Find Where the Time Goes: Reading a Flame Graph

A flame graph draws the samples of a profile as stacks of frames, one frame for each function in a chain of calls. These sections say what its axes, widths and colours mean, in Gregg's description and in the flame graph of the **Flame Graph** tab, drawn by the Julia extension with the viewer of ProfileCanvas.

## What Do the Width and the Height of a Frame in a Flame Graph Mean?

[Gregg (2016)](#ref-Gre2016a) describes the flame graph as a visualization of a profile of stack traces. Each rectangle is a frame, a function in a stack. The vertical axis is the depth of the stack: a function sits on the frame of the function that called it. The width of a frame is the share of the samples in which that function appears in that chain of calls, so a wide frame is a function that is often running or often waiting on the functions it calls. A frame's position along the horizontal axis carries no meaning of its own: what matters is how wide it is.

## Does the Horizontal Axis of a Flame Graph Show Time?

The horizontal axis of a flame graph is not the passage of time. [Gregg (2016)](#ref-Gre2016a) describes it as spanning the population of stack samples, which his flame graphs sort alphabetically, so that identical chains of calls merge into one frame however far apart in time they were sampled. Two frames side by side need not have run one after the other. A chart that keeps the order in time, one stack per moment, is a different picture of the same samples.

## Which Frames of a Flame Graph Hold the Time?

In [Gregg (2016)](#ref-Gre2016a), the top edge of a flame graph shows the functions that were running when the samples were taken, and the frames beneath them are their ancestors, the calls that led there. A frame that is wide at the top edge, with nothing above it, is a function spending its own time: its self time. A frame that is wide but covered by the frames of the functions it calls passes its time on to them: its width is its total time, which includes theirs. The first frames to read are the widest ones at the top edge, and then the chains of calls beneath them, which say where in the code they are reached from.

## What Do the Colours of the Flame Graph of Find Where the Time Goes Mean?

The ProfileCanvas documentation, whose viewer the Julia extension uses, gives two colours a meaning. A red frame is a call resolved at run time: Julia did not know the types of its arguments when it compiled the caller, and chose the method to call while the code ran, which costs time on every call. A yellow frame is garbage collection, the time Julia spends freeing memory no longer in use. The **Type Instabilities** action of Find Where the Time Goes shows the inferred types behind red frames, and **Allocation Flame Graph** shows the allocations that lead to the garbage collection.

## How Is the Flame Graph of Find Where the Time Goes Navigated?

The ProfileCanvas documentation describes the controls of the viewer: the mouse wheel scrolls the graph, and a click on a frame zooms on it, so that the frame fills the width of the tab and its calls can be read. The **Flame Graph** tab leaves out the frames of C code, such as Julia's runtime and libraries written in C; the **Flame Graph with C Code** action keeps them, with `C = true`. Frames from Base and the standard libraries are part of the picture: a wide frame of `sort!` or `rand` beneath the profiled function says that the time goes there.

## References

<a id="ref-Gre2016a"></a>Gregg, B. (2016). The flame graph. *Communications of the ACM* 59(6), 48–57. [doi:10.1145/2909476](https://doi.org/10.1145/2909476)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
