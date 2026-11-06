# Model Benchmarks — Overview

A published benchmark is a fixed set of questions with their right answers and a rule for grading an answer, so that models can be compared on the same ground. Model Benchmarks runs the chat models of this computer on such benchmarks, on a sample of their questions drawn at random, so that a run takes minutes rather than hours, with an interval that says how far the score of the sample may be from the score on all the questions.

## The Benchmarks
**MMLU-Pro** has 12,032 questions in 14 subjects, from law, economics and business to mathematics, physics and chemistry, each with ten options ([Wang, Ma, Zhang, Ni, Chandra, Guo, Ren, Arulraj, He, Jiang, Li, Ku, Wang, Zhuang, Fan, Yue and Chen (2024)](#ref-WMZNC...2024a)). It grew out of MMLU, whose questions had four options ([Hendrycks, Burns, Basart, Zou, Mazeika, Song and Steinhardt (2021)](#ref-HBBZM...2021a)). The answer read is the letter of "the answer is (X)", as MMLU-Pro's own scripts read it, or else the letter after "Answer:", or else the last letter that stands alone. **GSM8K** has 1,319 test problems of grade-school mathematics, each answered with a number ([Cobbe, Kosaraju, Bavarian, Chen, Jun, Kaiser, Plappert, Tworek, Hilton, Nakano, Hesse and Schulman (2021)](#ref-CKBCJ...2021a)). The answer read is the number of "The answer is N", or else the last number of the answer.

## Downloading a Benchmark
Step 1, **Benchmark**, lists the benchmarks with what each measures and how its answers are graded. **Download** fetches a benchmark once from Hugging Face into `~/.pollis/benchmarks/data`: its questions and the worked examples a prompt can show first. Nothing of a benchmark comes with Pollis.

## Drawing the Sample
Step 2, **Sample**, draws the questions to ask. MMLU-Pro is stratified by subject: tick the subjects to draw from, choose how many questions, and how they are shared among the subjects ([Cochran (1977)](#ref-Coc1977a)). **Equal** gives each subject as many questions, so that each subject's own score rests on as many answers; **Proportional** gives each subject its share of the questions of the subjects ticked. Every subject ticked has one question at least, when the sample allows. Within each subject the questions are drawn at random with the **Seed**, and the same seed draws the same sample again, so that runs of different models or settings ask the same questions. GSM8K has no strata, and its sample is a simple random sample. The line below the table gives the widest 95% interval the sample can give.

## Choosing the Models and How They Answer
Step 3, **Models**, lists the chat models on this computer. **Examples First** shows the benchmark's own worked answers before each question: those of the same subject for MMLU-Pro, the first problems of the training set for GSM8K. **Answers** asks for an answer worked step by step, as the benchmarks' prompts do, or for the answer alone. **Thinking** lets a model that thinks first do so. **Longest Answer** cuts an answer off at that many tokens.

## Running and Reading the Results
Step 4, **Run**, draws the sample, then each model chosen answers its questions, one after the other and alone in memory, at temperature 0. **Stop** ends a run, and the answers given until then are kept. Step 5, **Results**, has a column for each model, the best score first, a table of the score in each subject, and each question with each model's answer: a click on a question shows it whole, with each model's full answer. Earlier runs stay under **Run**, and **Delete Run** removes one. A notebook does the same with `Pollis.model_benchmarks()`, whose functions the page runs.

## A Typical Benchmark Run
1. Choose **MMLU-Pro** and **Download** it.
2. Draw 140 questions, **Equal**, 10 in each subject.
3. Choose two or three chat models, with the answers worked step by step.
4. **Run**.
5. Compare the **Score** and its **95% Interval**, then the subjects in **By Stratum**.
6. Weigh the score against **Seconds an Answer** and **Memory**.

## References

<a id="ref-CKBCJ...2021a"></a>Cobbe, K., Kosaraju, V., Bavarian, M., Chen, M., Jun, H., Kaiser, L., Plappert, M., Tworek, J., Hilton, J., Nakano, R., Hesse, C. and Schulman, J. (2021). Training verifiers to solve math word problems. [arXiv:2110.14168](https://doi.org/10.48550/arXiv.2110.14168)

<a id="ref-Coc1977a"></a>Cochran, W. G. (1977). *Sampling Techniques*, 3rd edition. Wiley.

<a id="ref-HBBZM...2021a"></a>Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D. and Steinhardt, J. (2021). Measuring massive multitask language understanding. *International Conference on Learning Representations*. [arXiv:2009.03300](https://doi.org/10.48550/arXiv.2009.03300)

<a id="ref-WMZNC...2024a"></a>Wang, Y., Ma, X., Zhang, G., Ni, Y., Chandra, A., Guo, S., Ren, W., Arulraj, A., He, X., Jiang, Z., Li, T., Ku, M., Wang, K., Zhuang, A., Fan, R., Yue, X. and Chen, W. (2024). MMLU-Pro: a more robust and challenging multi-task language understanding benchmark. *Advances in Neural Information Processing Systems 37*, 95266-95290. [doi:10.52202/079017-3018](https://doi.org/10.52202/079017-3018)

## See Also
- [Factsheet](factsheet.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
