# Load and Compile Time: Precompilation and Invalidations

What precompiling a package saves, what a precompile workload adds to it, and why loading a package can make code already compiled invalid, as the documentation of Julia, SnoopCompile and PrecompileTools describes them.

## What Does Precompiling a Julia Package Save?

When a package is installed or changed, Julia precompiles it: it runs the code of its module once and stores the result on disk, so that later sessions load it without parsing and evaluating the source again. Since Julia 1.9, the stored result can include native code, package images, for the methods compiled while precompiling, so a later session runs them without compiling. What precompiling stores is limited to the methods it compiled, for the types they were compiled for: a method called later with arguments of other types, or never called while precompiling, is compiled in the session that first uses it. That compiling is the share of compiling that **First Use** and **Inference Time** of Load and Compile Time report.

## What Does a Precompile Workload Add?

A precompile workload is code that runs while a package precompiles, so that the methods it calls are compiled then and stored with the package. PrecompileTools provides two macros for it: `@setup_workload`, for the code that prepares data, whose own compiling is not kept, and `@compile_workload`, for the calls whose compiled code is kept. The documentation of PrecompileTools recommends a workload that uses the package as its users do, with arguments of the types they pass. The **Precompile Workload** action of Load and Compile Time prints such a block with the code of **First Use** as the workload. Precompiling then takes longer, and the first use of a session takes less.

## What Is an Invalidation in Julia?

Compiled code depends on the methods that existed when it was compiled: a call compiled to a particular method, or inlined, assumes that no other method fits better. When a package defines a new method that would now be chosen for some of those calls, Julia marks the compiled code that depended on them as invalid, and compiles it again the next time it is used. Loading a package can therefore add compiling to code that had none, in Base or in other packages. SnoopCompile's `@snoop_invalidations` records them while a package loads, and `invalidation_trees` groups them by the method that caused them. The documentation of SnoopCompile advises giving the most attention to causes that invalidate the most code.

## How Are Invalidations Reduced?

The documentation of SnoopCompile describes improving the inference of the code that is invalidated as the most broadly applicable fix: code whose types are inferred calls a known method, which a new method for other types does not affect, while a call with an argument of an unknown type can be taken over by any method added later. Defining a method of a function a package does not own, for types it does not own, is called type piracy; the Julia manual advises against it, since such a method changes the behaviour of code in other packages. The **Invalidations** action of Load and Compile Time prints the causes; Check Type Stability, in Compose > Profiling, finds the uninferred calls that leave code open to them.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
