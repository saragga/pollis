# Model Tasks and Routing — Overview

## Why Route Tasks to Different Language Models
A stronger model costs more and answers more slowly, and many tasks do not need one. [Chen, Zaharia and Zou (2023)](#ref-CZZ2023a) showed that sending each query first to a cheap model and only then, if needed, to a dearer one reduces cost considerably with little loss of quality, and [Ong, Almahairi, Wu, Chiang, Wu, Gonzalez, Kadous and Stoica (2024)](#ref-OAWCW...2024a) train a router on human preferences to decide which model each query goes to. Pollis takes the simpler route of deciding by task, not by query: the user knows that polishing a report differs from writing a method, and a table of fixed choices stays readable and predictable.

## What a Tier Means in Pollis
A tier names a level of effort, so that tasks need not name a model. **Light** is for small tasks, on a fast, cheap or local model. **Standard** is for everyday tasks. **Strong** is for hard tasks, where a mistake costs most. Changing the model of a tier moves every task on that tier at once, and a new model only has to be placed once. A name of one's own, such as Max, adds a tier beside these.

## Running a Coding Agent on a Local Model
The Local rows of the table list the chat models of Compose > Local Models > Models Installed, not the embedding models or rerankers, served by llama.cpp. An agent needs a model that can call tools, of about 4 billion parameters or more, with a context of 32k tokens. A smaller model usually fails at the agent's first steps, even if it chats well. **Not on this computer** marks a local model named in a cell whose file is gone.

## Routing and Cascading Language Models Query by Query
Choosing a model for each query is an active line of work, in contrast with the Model Tasks and Routing table. Hybrid LLM, by [Ding, Mallick, Wang, Sim, Mukherjee, Ruhle, Lakshmanan and Awadallah (2024)](#ref-DMWSM...2024a), sends a query to the small or the large model by its predicted difficulty and the quality desired, with up to 40% fewer calls to the large model and no drop in quality. [Dekoninck, Baader and Vechev (2024)](#ref-DBV2024a) separate routing, which picks one model per query, from cascading, which runs increasingly larger models in turn, and unify the two as cascade routing, for which good estimates of quality are critical. The cascade is older than language models: [Viola and Jones (2001)](#ref-VJ2001a) chained increasingly complex classifiers to discard background regions of an image quickly and spend computation on the promising ones.

## References

<a id="ref-CZZ2023a"></a>Chen, L., Zaharia, M. and Zou, J. (2023). FrugalGPT: how to use large language models while reducing cost and improving performance. *arXiv preprint*. [arXiv:2305.05176](https://arxiv.org/abs/2305.05176)

<a id="ref-DBV2024a"></a>Dekoninck, J., Baader, M. and Vechev, M. (2024). A unified approach to routing and cascading for LLMs. *arXiv preprint*. [arXiv:2410.10347](https://arxiv.org/abs/2410.10347)

<a id="ref-DMWSM...2024a"></a>Ding, D., Mallick, A., Wang, C., Sim, R., Mukherjee, S., Ruhle, V., Lakshmanan, L. V. S. and Awadallah, A. H. (2024). Hybrid LLM: cost-efficient and quality-aware query routing. *International Conference on Learning Representations*. [arXiv:2404.14618](https://arxiv.org/abs/2404.14618)

<a id="ref-OAWCW...2024a"></a>Ong, I., Almahairi, A., Wu, V., Chiang, W., Wu, T., Gonzalez, J. E., Kadous, M. W. and Stoica, I. (2024). RouteLLM: learning to route LLMs with preference data. *arXiv preprint*. [arXiv:2406.18665](https://arxiv.org/abs/2406.18665)

<a id="ref-VJ2001a"></a>Viola, P. and Jones, M. (2001). Rapid object detection using a boosted cascade of simple features. *Proceedings of the 2001 IEEE Computer Society Conference on Computer Vision and Pattern Recognition* 1, I-511–I-518. [doi:10.1109/cvpr.2001.990517](https://doi.org/10.1109/cvpr.2001.990517)

## See Also
- [Factsheet](factsheet.md) · [Tiers and Cells](tiers.md) · [Tasks](tasks.md)
