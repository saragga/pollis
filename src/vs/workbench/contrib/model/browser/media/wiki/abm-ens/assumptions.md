# Assumptions

Replication and scanning rest on a few conditions about seeds, run length and the parameter ranges chosen. If they fail, the printed spreads and rankings describe something other than the model's behaviour.

## Why Replications Must Be Independent

Standard errors assume runs that do not share randomness. Each replication gets `Xoshiro(seed)` from its own seed, and all random draws must come through `abmrng(model)` for that to hold. A call to `rand()` without the generator draws from a global stream, which breaks both independence and reproducibility. Reusing the same seed list in two conditions is a deliberate pairing, and then the differences should be read pair by pair. The seeds 1 to R are not a sample from a larger population in any deeper sense, only a convenient set of streams.

## Why a Fresh Model Is Needed for Every Run

**Model initializer** must return a new model at each call, with nothing carried over from an earlier run. A function that reuses a global model, or that keeps agents in a shared variable, would make runs depend on each other and on their order. Parameters must also reach the model through keywords, since `paramscan` sets them that way. A setting hard-coded in the function body stays the same across a scan, however it appears in the list, and the scan then reports a false flat response.

## Why the Reading Step Must Suit the Question

Every summary in the panel reads the outcome at step **Steps (T)**. The word equilibrium in **Equilibrium Summary** and in the code assumes that the model has settled by then, and nothing checks it. Runs that are still moving give a figure that depends on the length of the run. If a question concerns transient behaviour, the last step may be the wrong moment to read, and a fixed earlier step or a time mean may suit it better. **Burn-in Detection** helps, but its judgement is by eye.

## How the Scan Range Limits a Study

A study of an agent-based model can only speak about the values it visits. Lists in `params` and ranges in `bounds` are choices of the analyst, and a change of range changes both the map and the Sobol indices. The upper and lower values should come from what the parameter means. In the example, density 0 is an empty grid and density 1 leaves no empty cell, and the code avoids both. A ranking from a narrow range should not be extended beyond it.

## Why the Example Outcome Reads an Earlier Moment

`mood` in the example is set when a resident acts, before any move, so it records whether the resident was happy at that check. A resident who moved has no updated value until the next step, and neighbours can change after the check. So `mean_mood` at a step is the share who were satisfied when they acted, which can differ from the share satisfied at the end of the step. It is 0 at step 0, as nobody has yet been checked. A share measured from the state at the end of a step would need its own function.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
