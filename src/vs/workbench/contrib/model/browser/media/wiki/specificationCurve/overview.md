# Specification Curve: Overview

Specification Curve runs every defensible way of answering one research question on one dataset, shows the estimates in order with the choices behind each, and tests whether the curve as a whole shows an effect. Coding agents propose the choices and write the code; Pollis runs every specification in Julia. The page is in Compose > Orchestration.

## What Is a Specification Curve?

A specification curve is the set of estimates that every reasonable combination of analytic choices gives for the same question, sorted from the lowest to the highest. [Simonsohn, Simmons and Nelson (2020)](#ref-SSN2020a) introduced specification curve analysis in three steps: identify the set of theoretically justified, statistically valid and non-redundant specifications; display the results graphically, so that readers can see which decisions are consequential; and conduct joint inference across all specifications. [Steegen, Tuerlinckx, Gelman and Vanpaemel (2016)](#ref-STGV2016a) proposed a related practice, the multiverse analysis, which runs the same analysis on every data set that reasonable choices of excluding, transforming and coding the data produce. Both make visible how much a result depends on choices a single paper reports only one of.

## What Are the Five Steps of Specification Curve?

**Question and Data** names the study and sets the data, the question and the estimate every specification must give. **The Choices** gathers the decisions and their options, from two to four coding agents with **Ask the Agents**, or from the analysts of a Many Analysts study with **Take the Study's Choices**; each option can then be unticked. **The Code** has one coding agent write `specification.jl` with **Write the Code**, and check it on every specification. **The Curve** runs every specification with **Run Every Specification** and draws the curve, the grid of choices and the table of which choices matter. **Inference Under the Null** runs the joint test with **Run the Test**.

## What Do the Coding Agents of Specification Curve Do?

Two kinds of coding agent take part, each started in its own terminal and its own folder of the study, with `SKILL.md` and `TASK.md`. Each proposer, in `proposer-1` to `proposer-N`, follows the propose-specifications skill of Pollis Agents: it looks at the data and lists, on its own, the decisions an analyst faces and the defensible options of each, with a reason for each option, in `decisions.toml`. The coder, in `coder`, follows the write-specification-code skill: it writes `specification.jl`, which gives each specification's rows of the data and its estimate, and runs it on every specification until none fails. No agent runs the curve or the test: Pollis does both in Julia, at no cost.

## What Does Pollis Compute in Julia for Specification Curve?

Pollis writes `curve.jl` into the coder's folder. It builds every specification as one option of each decision kept, and calls the two functions of `specification.jl` for each. **Run Every Specification** sends code to the Julia REPL that runs `curve.jl` in a new Julia process with as many threads as the computer has, and writes each specification's estimate, standard error and number of rows to `curve.json`. **Run the Test** runs the same file in its test mode, which resamples data made to have no effect and writes the observed statistics, their medians under the null and their p-values to `inference.json`. The page draws everything from these two files.

## What Does the Example of Specification Curve Ask?

The example asks for the effect of the National Supported Work job training programme on the earnings of the men who took part, with the data that Many Analysts uses. [LaLonde (1986)](#ref-LaL1986a) found that nonexperimental methods, with groups of men from two surveys in place of the experiment's controls, gave a large range of estimates of the programme's effect. [Dehejia and Wahba (1999)](#ref-DW1999a) found propensity score estimates on the same comparison groups much closer to the experimental benchmark. The choice of comparison group, of sample and of estimator are among the decisions such a question leaves open, which makes the example a natural case for a specification curve.

## References

<a id="ref-DW1999a"></a>Dehejia, R. H. and Wahba, S. (1999). Causal Effects in Nonexperimental Studies: Reevaluating the Evaluation of Training Programs. *Journal of the American Statistical Association* 94(448), 1053–1062. [doi:10.1080/01621459.1999.10473858](https://doi.org/10.1080/01621459.1999.10473858)

<a id="ref-LaL1986a"></a>LaLonde, R. J. (1986). Evaluating the Econometric Evaluations of Training Programs with Experimental Data. *American Economic Review* 76(4), 604–620. [www.jstor.org/stable/1806062](https://www.jstor.org/stable/1806062)

<a id="ref-SSN2020a"></a>Simonsohn, U., Simmons, J. P. and Nelson, L. D. (2020). Specification Curve Analysis. *Nature Human Behaviour* 4(11), 1208–1214. [doi:10.1038/s41562-020-0912-z](https://doi.org/10.1038/s41562-020-0912-z)

<a id="ref-STGV2016a"></a>Steegen, S., Tuerlinckx, F., Gelman, A. and Vanpaemel, W. (2016). Increasing Transparency Through a Multiverse Analysis. *Perspectives on Psychological Science* 11(5), 702–712. [doi:10.1177/1745691616658637](https://doi.org/10.1177/1745691616658637)

## See Also

- [Factsheet](factsheet.md) · [Choosing the Specifications](choosing-specifications.md) · [Reading the Curve](reading-curve.md) · [Inference Under the Null](inference-null.md)
