# Compare with Saved Results: Overview

What a reference test is, how ReferenceTests.jl saves a result, compares later results with it and updates it, and what the four tabs of Compare with Saved Results save.

## What Is a Reference Test?

A reference test saves a result once it is known to be right, in a file called its reference, and compares every later result with that file. The test does not know why the result is right: it only fails when the result changes. That makes it the test of choice for results that are long or hard to state as a rule, such as a table of estimates, a printed summary or a chart, and for results that should not change while the code around them does, as when a package moves to a new version of a dependency or its author makes the code faster. A change that fails a reference test is not always a mistake, since a corrected method changes its results too, but it is always a change that someone should look at before it is accepted.

## How Does ReferenceTests Save and Compare a Reference?

`@test_reference file result` of ReferenceTests.jl looks for the reference file first. When it is missing, the macro saves the result as the reference, prints it, and asks for the tests to be run again, without counting a test. When the file exists, the macro reads it and compares it with the result, with `isequal` unless a comparison is given with `by`. A result that matches passes as a `@test` would. A result that does not match is saved in a temporary folder, and the macro prints the reference and the result, with the path of each. In an interactive Julia session it then asks whether to replace the reference with the result; in the tests of a package it fails, unless the environment variable `JULIA_REFERENCETESTS_UPDATE` is `true`, which replaces every failing reference.

## What Do the Four Tabs of Compare with Saved Results Save?

| Tab | Reference file | Compared |
|---|---|---|
| **Numbers** | The coefficients of a regression in full, one to a line, in a text file | Within the **Relative Tolerance**, through `by` |
| **Printed Output** | The table of the regression as it is printed, in a text file | Character by character |
| **Plot** | A chart of the data and the fitted line, as a PNG image | By the peak signal-to-noise ratio, at least **Least PSNR** |
| **Hash** | The SHA-256 hash of the coefficients, in a `.sha256` file | Exactly |

Each tab keeps the value it tests in `result` and the path of its reference in `reference_file`, which the Next Steps use. Its data are simulated with a `StableRNG`, whose numbers stay the same across versions of Julia.

## How Does a Reference Test Differ from a Benchmark and a Property?

The three entries of Compose > Correctness Tests check results in three ways. Published Benchmarks compares Julia's results with values that their publisher has certified, so it says whether a result is right. Check a Property tries a rule on many generated inputs, so it says whether results behave as they must on inputs nobody has solved. Compare with Saved Results compares a result with an earlier result of the same code, so it says whether a result has changed. A reference is right only if it was checked when it was saved: a method package of Pollis can save its results as references once its tests reproduce the article's tables, and from then on any change to them fails.

## Where Does Compare with Saved Results Keep Its References?

In a package, the path given to `@test_reference` is relative to the file of the test, usually in its `test` folder. In the Julia REPL there is no such file, and a relative path would depend on the folder Julia was started in, so the tabs of Compare with Saved Results give a full path in `~/.pollis/reference-tests`: `coefficients.txt`, `regression.txt`, `fitted-line.png` and `coefficients.sha256`. The **Update the Reference** action of the panel replaces the reference of the current tab with its result.

## See Also

- [Factsheet](factsheet.md) · [Reference Tests in a Package](references-in-a-package.md)
