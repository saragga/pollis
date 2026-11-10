# Compare with Saved Results: Factsheet

The tabs, inputs, file types, comparisons, settings and actions of Compare with Saved Results at a glance.

## Tabs of Compare with Saved Results

| Tab | `result` | Reference in `~/.pollis/reference-tests` | Comparison |
|---|---|---|---|
| **Numbers** | The coefficients of a regression, one to a line, as text | `coefficients.txt` | `by = same_within`, within **Relative Tolerance** |
| **Printed Output** | The table of the regression, as printed | `regression.txt` | `isequal`, character by character |
| **Plot** | A chart, saved as PNG and read back with `load` | `fitted-line.png` | `psnr_equality(threshold)`, at least **Least PSNR** |
| **Hash** | The coefficients | `coefficients.sha256` | The SHA-256 hash of the coefficients as text |

Every tab simulates its data with `StableRNG(1)` of StableRNGs.jl.

## Inputs of Compare with Saved Results

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Observations** | 200 | All | The number of simulated observations of the regression |
| **Relative Tolerance** | 1e-10 | Numbers | The `rtol` of `isapprox` between each number and its reference |
| **Least PSNR** | 25 | Plot | The least peak signal-to-noise ratio, in decibels, at which the image passes |

Changing **Observations** changes the results, so the next run fails against the reference saved before: **Update the Reference** saves the new result.

## File Types of ReferenceTests

| File | Saved as | Read back as |
|---|---|---|
| `.txt`, a string | The text | A string, compared with `isequal` unless `by` is given |
| `.txt`, a number | The number as text | A `Float64` |
| `.png` and other image files | The image, through FileIO | An image, compared with `psnr_equality()` |
| `.sha256` | The SHA-256 hash of the value as text | The hash |
| Other files that FileIO reads, such as `.bson` or `.jld2` | The value, through the package of the format | The value |

## Comparisons and Settings of ReferenceTests

| Name | What it does |
|---|---|
| `by = f` | Compares with `f(reference, result)`, which returns `true` when they match |
| `psnr_equality(threshold)` | Matches two images whose peak signal-to-noise ratio is at least `threshold` decibels; 25 by default |
| `JULIA_REFERENCETESTS_UPDATE=true` | An environment variable that replaces every failing reference with its result |
| `REFERENCE_TESTS_STAGING_PATH` | An environment variable naming the folder where failing results are saved, in place of a temporary one |

## Actions of Compare with Saved Results

| Group | Action | Tabs | Output |
|---|---|---|---|
| Visualise | **The Saved Reference** | All | The path and the content of the reference file |
| Diagnose | **Differences from the Reference** | Numbers | Each coefficient of the regression without its last observation beside its reference |
| Diagnose | **Lines That Change** | Printed Output | The lines of the table without its last observation that differ from the reference |
| Diagnose | **Hash of a Small Change** | Hash | The hash of the coefficients with the intercept moved to the next floating-point number |
| Compare | **Exact and Within a Tolerance** | Numbers | The coefficients from the normal equations, compared exactly and within the tolerance |
| Compare | **A Changed Chart at Several Thresholds** | Plot | The chart with larger markers, passing or failing at 15 to 40 decibels |
| Interpret | **Update the Reference** | All | The reference replaced by the result of the tab |

The actions use `result`, `reference_file` and the data of the tab: run the tab's code first.

## Further Reading on Reference Tests

The documentation of ReferenceTests.jl describes `@test_reference`, its file types and its comparisons, with examples for text, numbers, images and hashes. The documentation of StableRNGs.jl lists the functions whose streams it keeps the same across versions of Julia, and the manual of Julia, under Random Numbers, explains why the default generator does not. Check a Property, in Compose > Correctness Tests, checks rules on generated inputs.

## See Also

- [Overview](overview.md) · [Reference Tests in a Package](references-in-a-package.md)
