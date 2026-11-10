# New Article Method — Decision Guide

## Choosing How to Add a Table to a Pollis Method

| Situation | Choice |
|---|---|
| The data is at a stable public link | **Add from a Link** under **Input Tables** |
| The data is in the PollisDatasets catalogue | **Add from PollisDatasets** |
| The article prints the data and nothing else has it | **Empty Table**, typed in, or **Add from Article** |
| The published results are in CSV files you already have | **Add from CSV Files** under **Target Tables** |
| The published results are printed tables, and many of them | **Add from Article**, then checked by hand against the article |
| The published results are a short table | **Empty Table**, typed in with every digit as printed |

## Choosing Who Writes a Pollis Method's Code

| Situation | Choice |
|---|---|
| The article states the estimator fully and the targets are in place | **Write Method**, with notes in **Instructions** |
| You already know how to write the code | **Open Code**, and **Package and Test** to check it |
| The article leaves a step unstated | Say so in **Instructions**, with what you know of it |
| The agent's code fails some targets | Read the pattern of failures before asking again |

## Choosing How Far to Publish a Pollis Method

| Situation | Choice |
|---|---|
| The method is for your own use, or still changing | **Package and Test** |
| Others should be able to read and install it | **Package, Test and Push to GitHub** |
| Others should find it by name and in Package Vignettes | **Package, Test, Push and Register** |
| A printed value cannot be reproduced | Publish only with the value and the reason in the vignette |

## The Order of Work on a Pollis Method

1. **Are there data and printed results?** Without both, there is no method: look for another article, or another source for the data.
2. **Are the targets exact?** Check every value against the article before any code is written, as later steps trust them.
3. **Do the tests pass?** Read the failures as a pattern, and keep the targets as printed.
4. **Is it documented?** Write the vignette once the tests pass, with what is reproduced and what is not.
5. **Does it meet the registry rules?** Set the **Package Name**, then run **Prepare for Registration** before publishing.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md)
