# New Article Method — Diagnostics

## Where the Results of a Pollis Method's Tests Appear

**Package and Test** in **Package and Publish** runs the tests of a Pollis method in a terminal. There is one testset for each target table and one test for each printed value, named by its row and column, so a failure says which cell of which table differs. Reading the failures as a pattern across the table says more than any one of them.

## Every Value of a Target Table Is Wrong

When a whole target table fails, the cause is usually the call or the data rather than a detail of the estimator. Check that the `call` in `method.toml` returns a matrix laid out like the target, without its label column, in the same row and column order. Check that the input table is read correctly: the delimiter, the header line, and `skipto` or `limit` for a file with other lines around the table. A size mismatch is reported by its own test.

## Only the Last Digit of Some Values Is Off

Values that fail only in the last printed digit of a Pollis method's target usually come from rounding, not from a wrong method: the article may have rounded at an intermediate step, or used a lower precision or an older algorithm. Software has long been a source of such differences: [Longley (1967)](#ref-Lon1967a) showed that least squares programs could give inaccurate results through round-off and truncation, and [McCullough and Vinod (1999)](#ref-MV1999a) that users cannot safely assume their econometric software is accurate. Check the method first for a step it should round. If nothing is found, a tolerance of 1 in that target's table in `method.toml` is honest, and the vignette says so.

## A Target Computed by a Nonlinear Solver Disagrees

A target of a Pollis method that comes from a maximum likelihood or other nonlinear solver may differ because a solver stopped in the wrong place, in the article or in the code. [McCullough and Vinod (2003)](#ref-MV2003a) describe a probit example in which five packages declared convergence to five solutions, with the sixth coefficient ranging from 4.4 to 8.1 and its standard error from 46 to 114,550. Declared convergence is not evidence of a solution, so try other starting values and a stricter stopping rule, and check that the gradient at the solution is near zero.

## One Row or Column of a Target Table Is Wrong

When one row or column fails and the rest of a Pollis method's target table passes, the shared part of the code is right and the difference is specific: a degrees-of-freedom correction, a variance formula, a different definition of a statistic, or a sign convention. The article's definition of that row or column is the place to look. A single isolated value that disagrees, while the values computed from it agree, points to a misprint.

## A Suspected Misprint in a Published Table

A value of a Pollis method's target that looks like a misprint is confirmed by evidence, not by the code alone: another value in the article derived from it, a later edition or erratum, or another implementation that agrees with the code. The target table keeps what the article prints. The difference is noted in the method's instructions and its vignette, so that the reader sees it rather than a target quietly changed to pass.

## Tests Fail Because the Data Cannot Be Read

A Pollis method's tests that stop on a download error, or show an error instead of a table in **Input Tables**, point to the link rather than the code. Open the link in a browser: it may have moved, or now return a web page rather than the file. When the columns come out wrong, change **Columns separated by** for that table. A table with no header line needs `columns` in `method.toml`.

## Registry Checks and Pushing Fail

The registry rules are checked on every run of **Package and Publish** and reported whatever the tests say. A short name, a missing usage example or an exported name with no docstring stops registration, and the **Prepare for Registration** button asks the coding agent to fix these. Pushing refuses to run while a test fails. It also needs the GitHub CLI installed and signed in, and a **GitHub Owner**.

## References

<a id="ref-Lon1967a"></a>Longley, J. W. (1967). An appraisal of least squares programs for the electronic computer from the point of view of the user. *Journal of the American Statistical Association* 62(319), 819–841. [doi:10.1080/01621459.1967.10500896](https://doi.org/10.1080/01621459.1967.10500896)

<a id="ref-MV1999a"></a>McCullough, B. D. and Vinod, H. D. (1999). The numerical reliability of econometric software. *Journal of Economic Literature* 37(2), 633–665. [doi:10.1257/jel.37.2.633](https://doi.org/10.1257/jel.37.2.633)

<a id="ref-MV2003a"></a>McCullough, B. D. and Vinod, H. D. (2003). Verifying the solution from a nonlinear solver: a case study. *American Economic Review* 93(3), 873–892. [doi:10.1257/000282803322157133](https://doi.org/10.1257/000282803322157133)

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
