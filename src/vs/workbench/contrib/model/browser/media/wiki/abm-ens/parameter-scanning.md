# Parameter Scanning

A parameter scan runs a model at a list of parameter values, and shows how the outcome responds. It is the basic design for finding where a model's behaviour changes.

## What a Parameter Scan of an Agent-Based Model Computes

**Parameter Scanning** defines `params`, a `Dict` from each keyword to a list of values, and calls `paramscan(params, initialize_model; n = T, adata)`. The function runs the model once at each combination for **Steps (T)**, and returns a table with `time`, `mean_mood` and one column per scanned parameter. Selecting the rows at the last step gives the outcome at every point. The tab prints the number of combinations, as a check on the size of the grid, and the extreme values of the outcome.

## What Rules Set the Size of a Parameter Scan

- Runs: the product of the lengths of all lists, as the design is a full factorial
- Rows returned: runs × (**Steps (T)** + 1), as step 0 is included
- Scanned values: only `Vector` values, so a range needs `collect`, and a range left as it is would be passed as one constant
- Replication: none, unless `:seed` is one of the keys

Grid size grows quickly: four lists of ten values mean 10 000 runs, before any replication.

## Which Inputs the Parameter Scanning Tab Uses

**Model initializer** names the function that `paramscan` calls with keyword arguments, and each key of `params` must be one of its keywords. **Steps (T)** sets the length of each run. **Replications (R)** has no effect on the main code of the tab, and is used by **Equilibrium Summary** as its number of seeds. The values scanned are written in the code as `:threshold` and `:density` lists. Anything not listed stays at its keyword default, including `seed`, so every point of the main scan uses the same seed.

## Where Parameter Scanning Is Strong

A factorial scan makes no assumption about the shape of the response, and captures interactions, as every combination is run. Results are easy to read as a table or a heatmap, and a transition is visible as a band of rapid change. Sharing one seed between points removes part of the noise from the differences between them, a device known as common random numbers. The design is also simple to explain and to reproduce, as the whole experiment is one `Dict`.

## Where Parameter Scanning Misleads

With one run per combination, a small difference between neighbouring points can be pure chance, so the fine detail of a heatmap may be noise. Using the same seed throughout also ties the whole map to one random stream, which an unlucky stream would bias. The scan sees only the listed points, so a narrow transition can fall between them. Factorial cost grows with the power of the number of parameters, so scans over many inputs are impractical. Reading the last step as equilibrium is unsafe if some combinations settle later than others.

## What to Compare a Parameter Scan With

**Parameter Heatmap** draws two parameters on one map, and **Equilibrium Summary** gives a mean and spread per combination, with `:seed` crossed in. **Finer Parameter Grid** compares a coarse and a fine list over one parameter. **OAT vs Factorial** shows what a one-at-a-time design would miss. For many parameters, the screening design of [Morris (1991)](#ref-Mor1991a) varies one factor at a time from many starting points, at a cost that grows linearly with the number of factors, and it can narrow the list before a full scan.

## References

<a id="ref-Mor1991a"></a>Morris, M. D. (1991). Factorial sampling plans for preliminary computational experiments. *Technometrics* 33(2), 161–174. [doi:10.1080/00401706.1991.10484804](https://doi.org/10.1080/00401706.1991.10484804)

## See Also

- [Factsheet](factsheet.md) · [Ensemble Runs](ensemble.md) · [Sensitivity Analysis](sensitivity.md) · [Interpretation](interpretation.md)
