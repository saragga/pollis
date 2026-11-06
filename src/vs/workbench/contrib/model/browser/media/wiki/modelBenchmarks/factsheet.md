# Model Benchmarks — Factsheet

**Model Benchmarks** runs the chat models of this computer on published benchmarks, on a stratified random sample of their questions, and grades each answer as the benchmark grades it. **MMLU-Pro** asks multiple-choice questions with ten options in 14 subjects ([Wang, Ma, Zhang, Ni, Chandra, Guo, Ren, Arulraj, He, Jiang, Li, Ku, Wang, Zhuang, Fan, Yue and Chen (2024)](#ref-WMZNC...2024a)), a harder successor of MMLU ([Hendrycks, Burns, Basart, Zou, Mazeika, Song and Steinhardt (2021)](#ref-HBBZM...2021a)). **GSM8K** asks grade-school word problems answered with a number ([Cobbe, Kosaraju, Bavarian, Chen, Jun, Kaiser, Plappert, Tworek, Hilton, Nakano, Hesse and Schulman (2021)](#ref-CKBCJ...2021a)).

| | |
|---|---|
| **Purpose** | Compare the chat models of this computer on the questions of published benchmarks, by score, speed and memory |
| **Input** | A benchmark downloaded from Hugging Face, a sample of its questions and the chat models on this computer |
| **Core packages** | [JSON3.jl](https://github.com/quinnj/JSON3.jl), [DuckDB.jl](https://github.com/duckdb/DuckDB.jl) |
| **Local models** | Run by [llama.cpp](https://github.com/ggml-org/llama.cpp), one after the other, each alone in memory |
| **Sample** | Stratified random sampling, with proportional or equal allocation and a seed ([Cochran (1977)](#ref-Coc1977a)) |
| **Steps** | Benchmark, Sample, Models, Run, Results |
| **Output** | Each model's score with its 95% interval, its score in each stratum, its speed and memory, and each question with each model's answer |
| **Key choice** | How many questions to draw: more narrow the interval, and take longer |

## When to Use Model Benchmarks
- Choosing a chat model for this computer by what it knows and how it reasons, beside its speed and memory.
- Comparing two sizes or two quantisations of the same model on the same questions.
- Checking how much worked answers, examples or thinking change a model's score.
- Seeing in which subjects of MMLU-Pro a model is weak or strong.

## What Model Benchmarks Does Not Measure
A benchmark measures a model on its own questions, not on the documents of Pollis: how well a model answers from them is measured in Evaluate Answering Models. The published questions may have been seen by a model while it was trained, which raises its score. A score from a sample is an estimate of the score on all the questions of the strata ticked, with the uncertainty that its interval gives. The page measures the models as llama.cpp runs them on this computer, in their quantisation, so a score can differ from the one a model's makers published for the full-precision model.

## References

<a id="ref-CKBCJ...2021a"></a>Cobbe, K., Kosaraju, V., Bavarian, M., Chen, M., Jun, H., Kaiser, L., Plappert, M., Tworek, J., Hilton, J., Nakano, R., Hesse, C. and Schulman, J. (2021). Training verifiers to solve math word problems. [arXiv:2110.14168](https://doi.org/10.48550/arXiv.2110.14168)

<a id="ref-Coc1977a"></a>Cochran, W. G. (1977). *Sampling Techniques*, 3rd edition. Wiley.

<a id="ref-HBBZM...2021a"></a>Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D. and Steinhardt, J. (2021). Measuring massive multitask language understanding. *International Conference on Learning Representations*. [arXiv:2009.03300](https://doi.org/10.48550/arXiv.2009.03300)

<a id="ref-WMZNC...2024a"></a>Wang, Y., Ma, X., Zhang, G., Ni, Y., Chandra, A., Guo, S., Ren, W., Arulraj, A., He, X., Jiang, Z., Li, T., Ku, M., Wang, K., Zhuang, A., Fan, R., Yue, X. and Chen, W. (2024). MMLU-Pro: a more robust and challenging multi-task language understanding benchmark. *Advances in Neural Information Processing Systems 37*, 95266-95290. [doi:10.52202/079017-3018](https://doi.org/10.52202/079017-3018)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
