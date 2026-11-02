# Snowball Search Map — Overview

## What Snowballing Is in a Literature Search
Snowballing starts from a set of relevant works and follows their citations: the reference list of each work leads backward in time, and the works citing it lead forward ([Wohlin (2014)](#ref-Woh2014a)). The finds become new starting points, until nothing new appears. In the audit by [Greenhalgh and Peacock (2005)](#ref-GP2005a) of a systematic review on a complex topic, snowballing found more of the sources than the protocol's database searches, because terms differ across fields while citations cross them.

## The Lists of Snowball Search Map and Where They Come From

| List | What it holds | From |
|---|---|---|
| Cited By | The works citing each seed, the 2,000 most cited, 200 a request | OpenAlex ([Priem, Piwowar and Orr (2022)](#ref-PPO2022a)) |
| Cites | The works each seed cites | OpenAlex |
| Related | Works alike in titles and abstracts, mostly recent, up to 500 | Semantic Scholar's recommendations; for a seed it has no record of, the ten or so OpenAlex relates |

Related works join the pool, but **Links** does not count them.

## What the Map's Record Keeps
Each step is kept in the map's record, which **Save...** writes to `~/.pollis/literature` and **Open...** reads again. A saved search can be shown to others or taken up later. Removing a seed keeps its lists, and its works' **Links** are counted again.

## Where the Word Snowball and the Network of Papers Come From
The name comes from sampling: in the s stage k name snowball sampling of [Goodman (1961)](#ref-Goo1961a), sampled individuals name others, who form the first stage, and so on. [Price (1965)](#ref-Pri1965a) described the references between scientific papers as a network, with a research front of recent work. Snowball Search Map follows that network from its seeds, with works in place of people.

## How Much a Snowball Search Adds to a Database Search
Citations reach work that keywords miss. [Haddaway, Grainger and Gray (2022)](#ref-HGG2022a), with their tool citationchaser for forward and backward chasing, point to research disconnected in its terms though related in meaning. [Wohlin, Kalinowski, Romero Felizardo and Mendes (2022)](#ref-WKFM2022a) replicated a systematic review with a hybrid of database search and snowballing, and identified 30% more primary studies than the review's traditional search. Snowball Search Map works best with such a search behind it, as the quality of the seeds decides where the rounds go.

## References

<a id="ref-Goo1961a"></a>Goodman, L. A. (1961). Snowball sampling. *Annals of Mathematical Statistics* 32(1), 148–170. [doi:10.1214/aoms/1177705148](https://doi.org/10.1214/aoms/1177705148)

<a id="ref-GP2005a"></a>Greenhalgh, T. and Peacock, R. (2005). Effectiveness and efficiency of search methods in systematic reviews of complex evidence: audit of primary sources. *BMJ* 331(7524), 1064–1065. [doi:10.1136/bmj.38636.593461.68](https://doi.org/10.1136/bmj.38636.593461.68)

<a id="ref-HGG2022a"></a>Haddaway, N. R., Grainger, M. J. and Gray, C. T. (2022). citationchaser: a tool for transparent and efficient forward and backward citation chasing in systematic searching. *Research Synthesis Methods* 13(4), 533–545. [doi:10.1002/jrsm.1563](https://doi.org/10.1002/jrsm.1563)

<a id="ref-Pri1965a"></a>Price, D. J. de S. (1965). Networks of scientific papers. *Science* 149(3683), 510–515. [doi:10.1126/science.149.3683.510](https://doi.org/10.1126/science.149.3683.510)

<a id="ref-PPO2022a"></a>Priem, J., Piwowar, H. and Orr, R. (2022). OpenAlex: a fully-open index of scholarly works, authors, venues, institutions, and concepts. *arXiv preprint*. [arXiv:2205.01833](https://arxiv.org/abs/2205.01833)

<a id="ref-Woh2014a"></a>Wohlin, C. (2014). Guidelines for snowballing in systematic literature studies and a replication in software engineering. *Proceedings of the 18th International Conference on Evaluation and Assessment in Software Engineering*, 1–10. [doi:10.1145/2601248.2601268](https://doi.org/10.1145/2601248.2601268)

<a id="ref-WKFM2022a"></a>Wohlin, C., Kalinowski, M., Romero Felizardo, K. and Mendes, E. (2022). Successful combination of database search and snowballing for identification of primary studies in systematic literature studies. *Information and Software Technology* 147, 106908. [doi:10.1016/j.infsof.2022.106908](https://doi.org/10.1016/j.infsof.2022.106908)

## See Also
- [Factsheet](factsheet.md) · [Rounds and Saturation](rounds-and-saturation.md) · [Links and Citations](links-and-citations.md)
