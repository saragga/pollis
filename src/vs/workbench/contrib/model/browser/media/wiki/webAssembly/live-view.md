# Compile Julia to WebAssembly: Running WebAssembly in the Page

How the page of Compile Julia to WebAssembly loads a module, computes the counts for Check and for Live View, colours the picture, zooms and moves it, and what the time it prints measures.

## How Does the Page of Compile Julia to WebAssembly Load a Module?

The page reads no file itself. **Run in the Page and Check** and **Draw** ask Pollis for `fractal.wasm` in the folder of the way chosen, which Pollis reads from the **Folder** of Compile and sends to the page as bytes; when there is no module yet, the page says where it looked. The page compiles the bytes with `WebAssembly.instantiate` and keeps the instance for that way. The module is read again at each Check and each Draw, so a new build is the one that runs. Changing the **Way** while a picture is shown draws it again with the module of the other way.

## How Does Live View Compute and Colour the Picture?

Live View computes the counts of every pixel of the view with the module, then colours each pixel from its count k, as the programs of Compile Julia to an Executable colour their pictures: black for a pixel that never escapes, and otherwise a colour from s = k / (k + 8), which runs from 0, for a pixel that escapes at once, towards 1 near the set, through blue, green and yellow to red. The colours of every count are computed once for each number of iterations and kept in a table. The picture has as many pixels as **Pixels Across** and the height of step 1; on a narrow page, the browser scales it down to fit.

## How Do Zooming and Dragging Change the Live View?

The view is the corner of the picture at its bottom left and the distance between two pixels. A turn of the mouse wheel over the picture multiplies that distance by 0.8 to zoom in or by 1.25 to zoom out, and moves the corner so that the point under the pointer stays where it is. A drag moves the corner by the distance the pointer moved, in pixels times the distance between two pixels. Each change computes and draws the picture again, at most once for each frame of the screen. The line under the picture gives the centre of the view as a complex number and its width; **Reset View** returns to the region of the example, as does a change of **Example** or **Pixels Across**.

## What Does the Time of a Picture in Live View Measure?

The time printed under the picture is that of computing the counts with the module, from the first call to the last, without colouring and drawing the picture. It says how the module computed them: one call of `fill_counts` for the whole picture, for the Rust and C modules, or one call of `escape_time` for each pixel, for the module of WebAssemblyCompiler.jl. The time grows with the pixels inside the set, each of which runs all the iterations, so a view deep inside the set takes longer than one far outside it. The first pictures after a module is loaded can take longer than the next ones, while the browser recompiles the functions that run often with its optimising compiler.

## What Does The Same in JavaScript Compare?

**The Same in JavaScript**, in Next Steps, writes `escape_time` and the loop over the pixels in JavaScript, with the operations of the Julia function in the same order, and runs them in the page beside each module that Compile has built, on the example of step 1. Each runs once to warm it up, then five times, and the table keeps the fastest time, the calls it made into WebAssembly, its speed-up over JavaScript, and the pixels where its counts differ from those of JavaScript, expected to be none. JavaScript numbers are 64-bit floating-point numbers and the engine does not fuse a multiplication and an addition, so the comparison is between the same computations. The browser compiles JavaScript that runs often, such as this loop, to machine code too, so the speed-up of WebAssembly on a loop of numbers can be small.

## What Does Compare the Ways Set Side by Side?

**Compare the Ways**, in Next Steps, runs in the page each module that Compile has built, Through Rust, Through C and With WebAssemblyCompiler.jl, on the example of step 1, and sets them in one table. For each way it gives the language the function was written in before it reached WebAssembly, what the way needs installed, the size of the module in bytes, the fastest of five runs after one to warm up, the calls the page made into WebAssembly, and the pixels where the counts differ from those of the same loop in JavaScript, expected to be none for all three. A way whose module is not built yet is listed as such. The table shows what each way costs to set up and to ship beside what it gives at run time: the Rust and C modules compute a picture in one call, and the module of WebAssemblyCompiler.jl in one call for each pixel.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [What Is WebAssembly](webassembly.md) · [Compiling Rust to WebAssembly](rust-to-webassembly.md) · [Compiling C to WebAssembly](c-to-webassembly.md) · [WebAssemblyCompiler.jl](webassemblycompiler.md)
