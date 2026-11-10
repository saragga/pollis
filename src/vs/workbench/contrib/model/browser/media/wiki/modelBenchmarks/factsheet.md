# Benchmark Answering Models — Factsheet

**Benchmark Answering Models** runs the chat models of this computer on ten published benchmarks, on a random sample of their questions, stratified where a benchmark has strata, and grades each answer as the benchmark grades it. Eight of them measure closed book answering, each model answering from what it learned in training alone ([Roberts, Raffel and Shazeer (2020)](#ref-RRS2020a)): **MMLU-Pro**, multiple-choice questions with up to ten options in 14 subjects ([Wang, Ma, Zhang, Ni, Chandra, Guo, Ren, Arulraj, He, Jiang, Li, Ku, Wang, Zhuang, Fan, Yue and Chen (2024)](#ref-WMZNC...2024a)), a harder successor of MMLU ([Hendrycks, Burns, Basart, Zou, Mazeika, Song and Steinhardt (2021)](#ref-HBBZM...2021a)); **TruthfulQA** ([Lin, Hilton and Evans (2022)](#ref-LHE2022a)); **ARC-Challenge**, grade-school science ([Clark, Cowhey, Etzioni, Khot, Sabharwal, Schoenick and Tafjord (2018)](#ref-CCEKS...2018a)); **GPQA**, graduate-level science written by experts ([Rein, Hou, Stickland, Petty, Pang, Dirani, Michael and Bowman (2024)](#ref-RHSPP...2024a)); **GSM8K**, grade-school word problems answered with a number ([Cobbe, Kosaraju, Bavarian, Chen, Jun, Kaiser, Plappert, Tworek, Hilton, Nakano, Hesse and Schulman (2021)](#ref-CKBCJ...2021a)); **BIG-Bench Hard** ([Suzgun, Scales, Schärli, Gehrmann, Tay, Chung, Chowdhery, Le, Chi, Zhou and Wei (2023)](#ref-SSSGT...2023a)); **IFEval** ([Zhou, Lu, Mishra, Brahma, Basu, Luan, Zhou and Hou (2023)](#ref-ZLMBB...2023a)); and **MultiPL-E Julia** ([Cassano, Gouwar, Nguyen, Nguyen, Phipps-Costin, Pinckney, Yee, Zi, Anderson, Feldman, Guha, Greenberg and Jangda (2023)](#ref-CGNNP...2023a)). **PubMedQA** ([Jin, Dhingra, Liu, Cohen and Lu (2019)](#ref-JDLCL2019a)) and **FinQA** ([Chen, Chen, Smiley, Shah, Borova, Langdon, Moussa, Beane, Huang, Routledge and Wang (2021)](#ref-CCSSB...2021a)) ask each question with the text it is answered from.

| | |
|---|---|
| **Purpose** | Compare the chat models of this computer on the questions of published benchmarks, by score, speed and memory |
| **Input** | A benchmark of PollisBenchmarks.jl made ready on this computer, a sample of its questions and the chat models on this computer |
| **Core packages** | [PollisBenchmarks.jl](https://github.com/Trumpingtons/PollisBenchmarks.jl), [JSON3.jl](https://github.com/quinnj/JSON3.jl), [DuckDB.jl](https://github.com/duckdb/DuckDB.jl) |
| **Local models** | Run by [llama.cpp](https://github.com/ggml-org/llama.cpp), one after the other, each alone in memory |
| **Sample** | Stratified random sampling, with proportional or equal allocation and a seed ([Cochran (1977)](#ref-Coc1977a)) |
| **Steps** | Benchmark, Sample, Models, Run, Results |
| **Output** | Each model's score with its 95% interval, the probability of as many right answers by chance, its score in each stratum, its speed and memory, and each question with each model's answer |
| **Key choice** | How many questions to draw: more narrow the interval, and take longer |

## When to Use Benchmark Answering Models
- Choosing a chat model for this computer by what it knows and how it reasons, beside its speed and memory.
- Comparing two sizes or two quantisations of the same model on the same questions.
- Checking how much worked answers, examples or thinking change a model's score.
- Seeing in which subjects of MMLU-Pro a model is weak or strong.

## What Benchmark Answering Models Does Not Measure
A benchmark measures a model on its own questions, not on the documents of Pollis: how well a model answers from them is measured in Evaluate Answering Models. The published questions may have been seen by a model while it was trained, which raises its score. A score from a sample is an estimate of the score on all the questions of the strata ticked, with the uncertainty that its interval gives. The page measures the models as llama.cpp runs them on this computer, in their quantisation, so a score can differ from the one a model's makers published for the full-precision model.

## References

<a id="ref-CCEKS...2018a"></a>Clark, P., Cowhey, I., Etzioni, O., Khot, T., Sabharwal, A., Schoenick, C. and Tafjord, O. (2018). Think you have solved question answering? Try ARC, the AI2 Reasoning Challenge. [arXiv:1803.05457](https://doi.org/10.48550/arXiv.1803.05457)

<a id="ref-CCSSB...2021a"></a>Chen, Z., Chen, W., Smiley, C., Shah, S., Borova, I., Langdon, D., Moussa, R., Beane, M., Huang, T.-H., Routledge, B. and Wang, W. Y. (2021). FinQA: a dataset of numerical reasoning over financial data. *Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing*, 3697–3711. [doi:10.18653/v1/2021.emnlp-main.300](https://doi.org/10.18653/v1/2021.emnlp-main.300)

<a id="ref-CGNNP...2023a"></a>Cassano, F., Gouwar, J., Nguyen, D., Nguyen, S., Phipps-Costin, L., Pinckney, D., Yee, M.-H., Zi, Y., Anderson, C. J., Feldman, M. Q., Guha, A., Greenberg, M. and Jangda, A. (2023). MultiPL-E: a scalable and polyglot approach to benchmarking neural code generation. *IEEE Transactions on Software Engineering* 49(7), 3675–3691. [doi:10.1109/tse.2023.3267446](https://doi.org/10.1109/tse.2023.3267446)

<a id="ref-CKBCJ...2021a"></a>Cobbe, K., Kosaraju, V., Bavarian, M., Chen, M., Jun, H., Kaiser, L., Plappert, M., Tworek, J., Hilton, J., Nakano, R., Hesse, C. and Schulman, J. (2021). Training verifiers to solve math word problems. [arXiv:2110.14168](https://doi.org/10.48550/arXiv.2110.14168)

<a id="ref-Coc1977a"></a>Cochran, W. G. (1977). *Sampling Techniques*, 3rd edition. Wiley.

<a id="ref-HBBZM...2021a"></a>Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D. and Steinhardt, J. (2021). Measuring massive multitask language understanding. *International Conference on Learning Representations*. [arXiv:2009.03300](https://doi.org/10.48550/arXiv.2009.03300)

<a id="ref-JDLCL2019a"></a>Jin, Q., Dhingra, B., Liu, Z., Cohen, W. and Lu, X. (2019). PubMedQA: a dataset for biomedical research question answering. *Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP)*, 2567–2577. [doi:10.18653/v1/d19-1259](https://doi.org/10.18653/v1/d19-1259)

<a id="ref-LHE2022a"></a>Lin, S., Hilton, J. and Evans, O. (2022). TruthfulQA: measuring how models mimic human falsehoods. *Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*, 3214–3252. [doi:10.18653/v1/2022.acl-long.229](https://doi.org/10.18653/v1/2022.acl-long.229)

<a id="ref-RHSPP...2024a"></a>Rein, D., Hou, B. L., Stickland, A. C., Petty, J., Pang, R. Y., Dirani, J., Michael, J. and Bowman, S. R. (2024). GPQA: a graduate-level Google-proof Q&A benchmark. *First Conference on Language Modeling*. [arXiv:2311.12022](https://doi.org/10.48550/arXiv.2311.12022)

<a id="ref-RRS2020a"></a>Roberts, A., Raffel, C. and Shazeer, N. (2020). How much knowledge can you pack into the parameters of a language model? *Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, 5418–5426. [doi:10.18653/v1/2020.emnlp-main.437](https://doi.org/10.18653/v1/2020.emnlp-main.437)

<a id="ref-SSSGT...2023a"></a>Suzgun, M., Scales, N., Schärli, N., Gehrmann, S., Tay, Y., Chung, H. W., Chowdhery, A., Le, Q., Chi, E., Zhou, D. and Wei, J. (2023). Challenging BIG-Bench tasks and whether chain-of-thought can solve them. *Findings of the Association for Computational Linguistics: ACL 2023*, 13003–13051. [doi:10.18653/v1/2023.findings-acl.824](https://doi.org/10.18653/v1/2023.findings-acl.824)

<a id="ref-WMZNC...2024a"></a>Wang, Y., Ma, X., Zhang, G., Ni, Y., Chandra, A., Guo, S., Ren, W., Arulraj, A., He, X., Jiang, Z., Li, T., Ku, M., Wang, K., Zhuang, A., Fan, R., Yue, X. and Chen, W. (2024). MMLU-Pro: a more robust and challenging multi-task language understanding benchmark. *Advances in Neural Information Processing Systems 37*, 95266-95290. [doi:10.52202/079017-3018](https://doi.org/10.52202/079017-3018)

<a id="ref-ZLMBB...2023a"></a>Zhou, J., Lu, T., Mishra, S., Brahma, S., Basu, S., Luan, Y., Zhou, D. and Hou, L. (2023). Instruction-following evaluation for large language models. [arXiv:2311.07911](https://doi.org/10.48550/arXiv.2311.07911)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
