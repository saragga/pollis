# Mix Julia with Compiled Code: Callbacks and Embedding

How compiled code calls Julia, in the two tabs of Mix Julia with Compiled Code that cross from the other side: a Julia function called back from a C loop, and a C program that starts Julia.

## What Is a Callback from C into Julia?

A callback is a function that one piece of code hands to another to be called later. In **Julia Callback**, the C function `fill_counts` takes, as its last argument, a pointer to a function of type `int32_t (*)(double, double, double, double, int32_t)`, and calls it once for each pixel. `@cfunction(escape_time, Int32, (Float64, Float64, Float64, Float64, Int32))` compiles the Julia function `escape_time` for exactly those C types and gives its address, which Julia passes to C as a `Ptr{Cvoid}`. The return type and the argument types of `@cfunction` must match the C declaration, as the C compiler cannot check a pointer that comes from Julia. Sorting with `qsort` of the C library, with a comparison written in Julia, is the classic use of the same mechanism.

## What Does a Callback into Julia Cost?

In **Julia Callback**, every pixel crosses the boundary twice: C calls the Julia function, and the Julia function returns to C. A call through a function pointer cannot be inlined by the C compiler, which does not know what it will call when it compiles the loop, and the call itself has a cost that a loop written entirely in one language does not pay. The work for each pixel, up to **Iterations** steps of the iteration, is usually much larger than the crossing, but pixels that escape after one or two iterations are dominated by it. **Julia and Compiled Times** measures the whole: the time to fill all the pixels in Julia alone, and through the C loop calling Julia.

## Why Does Julia Callback Pass c as Arguments?

The Julia set needs the point c inside the callback. **Julia Callback** passes its real and imaginary parts as two of the callback's arguments, which C forwards to Julia for each pixel, so the Julia function needs nothing but its arguments. The Julia manual describes the other way: marking the function with `$`, as in `@cfunction($f, ...)`, makes a callback that closes over values of the Julia session. The result is then an object of type `Base.CFunction` that must be kept alive for as long as C may call it, and whose code is erased when it is collected. The manual notes that this is rarely needed, since C APIs usually let the caller pass its own data along with the function pointer.

## Can C Call Julia from Another Thread?

The C loop of **Julia Callback** runs on the thread that called it from Julia, so the callback runs where Julia expects it. Some C libraries call their callbacks from threads of their own. For them, the Julia manual describes two layers: the callback given to C only sends a notification with `uv_async_send`, without allocating or touching the Julia runtime, and the real work is done by a Julia task waiting on a `Base.AsyncCondition`. Notifications may be merged, so several calls can wake the task only once. The same care applies to embedding: the Julia C API may be called only from the thread that called `jl_init` or from threads that Julia started.

## How Does a C Program Start Julia?

The program of **Julia from C** follows the steps of the Julia manual on embedding. `JULIA_DEFINE_FAST_TLS` appears once, in the program, for fast access to Julia's state for each thread. `jl_init()` starts Julia, once in the life of the program. `jl_get_function(jl_main_module, "include")` and `jl_call1` include the Julia file, which defines `fill_counts_at`. The ten arguments of `fill_counts_at` are boxed into Julia values (`jl_box_voidpointer`, `jl_box_int64`, `jl_box_float64`, `jl_box_bool`, `jl_box_int32`) in an array that `JL_GC_PUSHARGS` protects from the garbage collector until `JL_GC_POP`, and `jl_call` calls the function. After each call, `jl_exception_occurred` tells whether Julia threw an error. `jl_atexit_hook` lets Julia finish its work before the program ends.

## How Is a Program That Embeds Julia Built?

A program that embeds Julia needs the folder of `julia.h`, the library `libjulia` and, when it runs, a way to find that library. The script `julia-config.jl`, in the `share/julia` folder of every Julia installation, prints the flags for the Julia it belongs to: `--cflags` for the header folder, `--ldflags` and `--ldlibs` for the library, and `--allflags` for all three. **Julia from C** runs it with the same Julia as the session, splits its output with `Base.shell_split`, and passes it to the C compiler after the source and the program's name. On macOS and Linux the flags record where `libjulia` is, with `-Wl,-rpath`; on Windows the program finds `libjulia.dll` on the path, so the tab adds the folder of the Julia program to the path when it runs.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Memory Across the Boundary](memory-across-the-boundary.md) · [The Same Result Across Compilers](same-result-across-compilers.md)
