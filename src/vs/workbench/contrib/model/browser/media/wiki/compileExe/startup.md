# Compile Julia to an Executable: Start-Up Time

What happens between starting a program and its first result, for each tool of Compile Julia to an Executable and for julia running the same program as a script, and how **Start-Up and Run Time** measures it.

## What Is Start-Up Time?

The time a program takes from the start to its result is made of two parts: the work it was written to do, here filling the counts of every pixel, and everything before that work can begin. The second part is its start-up time: the operating system loads the program and the libraries it depends on, and the program prepares what its code needs to run. For a program run once on a large task the start-up hardly matters. For a program run often on small tasks, such as a command-line tool called from a script or a step of a pipeline run thousands of times, it can be most of the time, and it is the usual reason for compiling Julia to an executable.

## What Does julia Do Before a Script's First Result?

`julia fractal.jl` starts the Julia runtime and loads its system image, the compiled Base and standard libraries. It then reads the script and defines `escape_time`, `fill_counts`, `fractal` and `main`. When `main` is called, none of these functions has compiled code yet, so Julia compiles each one on its first call, for the types of its arguments, before running it. That compilation happens again in every new julia process, as a script keeps no compiled code from one run to the next. **Start-Up and Run Time** runs the script with `--startup-file=no`, so that the user's `startup.jl`, which may load packages, does not add its own time.

## What Does a Compiled Program Do Before Its First Result?

A compiled program has all its code compiled when it starts, so what remains is loading it. A program of **JuliaC** loads the Julia libraries of its bundle and a trimmed image that holds only the code `@main` reaches. A program of **PackageCompiler** loads the Julia runtime and a whole system image, with Base, the standard libraries it kept, the package Fractal and the compiler; the image is larger than a trimmed one, which takes longer to load, but no function has to be compiled before it runs. A program of **StaticCompiler** has no Julia runtime and no image: the operating system loads one small file that depends only on the system's libraries, much as it loads a program written in C.

## How Does Start-Up and Run Time Measure It?

**Start-Up and Run Time** runs each tool's program five times with the same arguments, measures each run from the start of the process to its end, and keeps the fastest. It does the same with `julia --startup-file=no fractal.jl`, and times `fill_counts` alone in the Julia session, five times, the fastest kept. All three kinds of time include filling the same pixels, and the programs and the script also draw the picture, write `fractal.bmp` and `counts.bin`, and print one line. The time of `fill_counts` in the session has no start-up at all, as the function was compiled when the tab ran, so the difference between a program's time and that of `fill_counts` is close to what the program spends starting and writing its file.

## Why Does Start-Up and Run Time Keep the Fastest of Five Runs?

The first run of a program after it is built, or after a while, often reads its files from the disk, while the runs that follow find them in the memory the operating system keeps as a cache of recent files. The first run also pays for other one-time work of the system, such as checking a new program. Other programs running at the same time can slow any single run. Keeping the fastest of five runs leaves out most of these effects, and gives a time that the same program reaches again when it is run repeatedly. A program whose folder is large, such as an app of PackageCompiler, gains most from the cache, so its first run can be much slower than the fastest.

## What Does Julia Sets Along a Circle Time?

**Julia Sets Along a Circle**, in Next Steps, builds a program with the tab's tool that draws the Julia set of c in frames, with c on a circle of radius 0.7885 around 0, and writes each frame as a BMP file. From one frame to the next, the program multiplies c by w = cos(2 pi / frames) + i sin(2 pi / frames), which Julia computes and passes on the command line, so the program needs no sine or cosine and computes the same c as the session at every frame. The card runs the program once to write the frames, then times a second run, as the first run of a new program can take longer while the system checks it. Beside it, the session draws the same frames with `fill_counts` and `fill_picture`, already compiled, and checks each frame against the program's byte for byte. The program pays its start-up once for all the frames, so over many frames its time comes close to that of the compiled code in the session. The frames are then shown as an animated GIF.

## How Does Use All the Cores Run a Compiled Program on Several Threads?

**Use All the Cores**, in Next Steps, builds the program again with the tab's tool, with `fill_counts` sharing its columns among threads through `Threads.@threads`: each column is written by one thread, and the pixels inside are counted afterwards from the counts, so that no two threads add to the same number. A compiled program starts as many threads as the environment variable `JULIA_NUM_THREADS` asks for, as julia does, since an option on its command line would be one of the program's own arguments. The card runs the program with one thread and with one for each core the computer reports, keeps the fastest of three runs of each, and checks the counts against Julia's. Each time includes the program's start-up, and the columns that cross the set take longer than the others, so the speed-up is smaller than the number of threads. The card is in the **JuliaC** and **PackageCompiler** tabs only: a program of StaticCompiler has no Julia runtime, and threads are part of the runtime.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Entry Points and Arguments](entry-points.md) · [Writing for StaticCompiler](staticcompiler.md) · [Shipping an Executable](shipping.md)
