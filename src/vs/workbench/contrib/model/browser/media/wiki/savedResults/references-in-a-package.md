# Compare with Saved Results: Reference Tests in a Package

What a package should save as references, why its simulated data need a stable random number generator, how tight a tolerance should be, where references go in a package, and when to update them.

## What Should a Package Save as References?

The tests of a method package of Pollis already compare its results with the values printed in the article, its targets. An article prints few digits and few results, so the targets cannot see a change in the digits it did not print, in a standard error it did not report or in a figure. Reference tests can: once the targets pass, the full results of the method are saved as references, and any later change to them fails. Numbers are best saved in full, so that a change in the last digits shows, and compared within a tolerance. A table or a summary that users read is best saved as it is printed, so that a change a reader would see fails. A figure is saved as an image. A large result that should not change at all can be saved as a hash, which takes little space but cannot show what changed.

## Why Do Simulated Data Need StableRNGs?

A test that simulates its data draws them from a random number generator with a fixed seed. The manual of Julia states that a minor release of Julia may change the sequence of numbers that its default generator draws from a given seed, while the distribution they come from stays the same. Data simulated with the default generator can therefore change when Julia changes, and every reference saved from them fails, although the code is unchanged. The manual advises tests that depend on particular random data to save the data, to put them in the test code, or to use a package such as StableRNGs.jl, whose generator keeps the same sequence across versions of Julia for `rand`, `randn`, `randexp`, `shuffle` and `randperm`. Every tab of Compare with Saved Results draws its data with `StableRNG(1)`.

## How Tight Should the Tolerance Be?

Computing the same quantity in another order of operations changes its last digits: the **Exact and Within a Tolerance** action of the panel computes the coefficients of the regression from the normal equations, which differ from those of the reference only in the last digits, and fail an exact comparison. A newer version of a linear algebra library, another processor or another number of threads can change the order of operations without any change to the package. A tolerance should therefore be wider than such differences and narrower than the smallest change that matters, such as the rounding of the digits a user reads. A relative tolerance suits numbers far from zero; a number that may be zero needs an absolute tolerance as well, given as `atol` to `isapprox`.

## Where Do References Go in a Package?

The references of a package usually go in a folder of its `test` folder, such as `test/references`, and the path given to `@test_reference` is relative to the file of the test that calls it. The references are committed with the package, so that every computer that runs the tests compares with the same files. Text references suit this best: a change to a reference shows in the history of the package line by line, and a reviewer can read what changed. An image or a hash shows only that the file changed. ReferenceTests needs to be in the test dependencies of the package, with FileIO and the package that reads each image format used.

## When Should a Reference Be Updated?

A reference should be updated only when the new result is known to be right: after a correction to the method, a deliberate change of what it computes, or a change in a dependency that has been checked. Run interactively, with `include("test/runtests.jl")` in a Julia session, a failing reference test asks whether to replace the reference with the result. Run with `Pkg.test()`, it fails, unless the environment variable `JULIA_REFERENCETESTS_UPDATE` is `true`, which replaces every failing reference at once. The documentation of ReferenceTests advises checking the changed references before they are committed. The **Update the Reference** action of the panel replaces the reference of the current tab.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
