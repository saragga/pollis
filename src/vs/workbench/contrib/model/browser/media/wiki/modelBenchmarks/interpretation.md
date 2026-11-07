# Interpretation

## What the Score Means
The **Score** is the share of right answers, each stratum weighted by its share of the questions of the strata ticked: the estimate, from the sample, of the share a model would answer right among all those questions ([Cochran (1977)](#ref-Coc1977a)). On MMLU-Pro, a model that chose its letters at random would score about one in ten, as most of its questions have ten options ([Wang, Ma, Zhang, Ni, Chandra, Guo, Ren, Arulraj, He, Jiang, Li, Ku, Wang, Zhuang, Fan, Yue and Chen (2024)](#ref-WMZNC...2024a)); on GSM8K, where the answer is a number, chance is near nothing.

## What the 95% Interval Means
The **95% Interval** gives the points on either side of the score within which the score on all the questions of the strata ticked lies, 95 times in 100 samples. It narrows with more questions, and is widest for a score near one half. When the intervals of two models overlap widely, the sample does not tell them apart, and a larger sample is the next step rather than a choice.

## By Chance
**By Chance** is the probability that answers picked at random among each question's options would get as many questions right as the model did, or more. On MMLU-Pro most questions have ten options and some fewer, so each question has its own chance of a right guess, and the number of right guesses follows the Poisson binomial distribution, computed exactly ([Hong (2013)](#ref-Hon2013a)). A small value, such as 0.019 for 4 right answers of 11, says that guessing seldom does as well; a value near one half or above says that the sample does not tell the model from guessing. It is not the probability that the model guessed. Answers that could not be read count as wrong, as in the score. GSM8K, whose answers are numbers, has no options to guess among, and shows a dash.

## The Scores by Stratum
**By Stratum** gives each model's share of right answers in each subject, with the questions asked. A subject's own share rests on its questions only, so with few in each subject a difference between subjects is mostly chance: **Equal** allocation gives each subject as many questions, which makes them easier to compare.

## Could Not Be Read and Cut Off
An answer that could not be read counts as wrong; one that was cut off is graded on what it gave before, and counts as wrong when no answer can be read in it. With **The Answer Only** and Thinking off an answer is cut off at 32 tokens, so an answer cut off there is one the model began to work out against the instruction. When many are, the score says more about the form of the answers than about what the model knows: read them before comparing scores.

## Speed and Memory
**First Token, ms** is how long the model takes before it starts to answer, mostly reading the prompt; **Reading** and **Writing** are its speeds in tokens per second, as llama.cpp measures them. **Seconds an Answer** includes everything, and grows with the tokens of the answers, so worked answers cost time. **Memory** is the memory free before the model's server started, less the least memory free while it answered.

## Published Scores
A model's makers often publish its score on a benchmark, measured with their own prompt, examples and settings, and on the full-precision model. The score measured here, on a quantised model, a sample and Pollis' prompt, may differ: compare models with each other on this page, on the same sample, rather than with numbers published elsewhere.

## References

<a id="ref-Coc1977a"></a>Cochran, W. G. (1977). *Sampling Techniques*, 3rd edition. Wiley.

<a id="ref-Hon2013a"></a>Hong, Y. (2013). On computing the distribution function for the Poisson binomial distribution. *Computational Statistics & Data Analysis* 59, 41–51. [doi:10.1016/j.csda.2012.10.006](https://doi.org/10.1016/j.csda.2012.10.006)

<a id="ref-WMZNC...2024a"></a>Wang, Y., Ma, X., Zhang, G., Ni, Y., Chandra, A., Guo, S., Ren, W., Arulraj, A., He, X., Jiang, Z., Li, T., Ku, M., Wang, K., Zhuang, A., Fan, R., Yue, X. and Chen, W. (2024). MMLU-Pro: a more robust and challenging multi-task language understanding benchmark. *Advances in Neural Information Processing Systems 37*, 95266-95290. [doi:10.52202/079017-3018](https://doi.org/10.52202/079017-3018)

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
