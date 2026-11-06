# Assumptions

## The Sample Stands for the Questions of the Strata Ticked
A score is an estimate of the score on all the questions of the strata ticked, not of the benchmark as a whole when some strata are left out. Each stratum's share of right answers is weighted by its share of those questions, so a sample with **Equal** allocation estimates the same score as one with **Proportional** allocation, each subject in its true weight ([Cochran (1977)](#ref-Coc1977a)). The 95% interval assumes the questions of each stratum were drawn at random, as the seed draws them, and enough of them for the normal approximation to hold.

## One Right Answer for Each Question
Each question has one right answer, the one the benchmark gives, and an answer is right when the answer read from it is that one. An answer the rules cannot read counts as wrong, and an error in the benchmark's own answer counts against every model alike.

## The Answer Is Read by Fixed Rules
The answer of MMLU-Pro is read as its own scripts read it ([Wang, Ma, Zhang, Ni, Chandra, Guo, Ren, Arulraj, He, Jiang, Li, Ku, Wang, Zhuang, Fan, Yue and Chen (2024)](#ref-WMZNC...2024a)), and that of GSM8K from "The answer is N" or the last number. A model that gives the right answer in another form, or names two options, is graded by what the rules read, not by what a reader would understand.

## The Models Answer the Same Prompt at Temperature 0
Every model reads the same prompt, with the same examples, and answers at temperature 0, so that a model asked again gives nearly the same answer, and the differences between models are the models' own. A prompt in another form, or other examples, can change a score.

## The Questions May Have Been Seen in Training
The benchmarks' questions are public, and a model may have met them, or their answers, while it was trained. Its score then says how well it remembers as well as how well it reasons.

## Speed and Memory Depend on the Computer
How fast a model reads and writes, and the memory it takes, are those of this computer, with what else runs on it; they compare models on the same computer, not across computers.

## References

<a id="ref-Coc1977a"></a>Cochran, W. G. (1977). *Sampling Techniques*, 3rd edition. Wiley.

<a id="ref-WMZNC...2024a"></a>Wang, Y., Ma, X., Zhang, G., Ni, Y., Chandra, A., Guo, S., Ren, W., Arulraj, A., He, X., Jiang, Z., Li, T., Ku, M., Wang, K., Zhuang, A., Fan, R., Yue, X. and Chen, W. (2024). MMLU-Pro: a more robust and challenging multi-task language understanding benchmark. *Advances in Neural Information Processing Systems 37*, 95266-95290. [doi:10.52202/079017-3018](https://doi.org/10.52202/079017-3018)

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
