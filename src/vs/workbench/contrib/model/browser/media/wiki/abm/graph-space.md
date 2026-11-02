# Graph Space

The tab runs an SIR epidemic on a contact network, with one person on each node. It shows how the pattern of links, and not only their number, shapes whether an infection spreads.

## What the SIR Model on a Network Computes

Each of **People (N)** people is susceptible, infectious or recovered. In a step, an infectious person tries to infect each susceptible neighbour with **Infection Probability (beta)**, then recovers with **Recovery Probability (gamma)**. A person infected in a step waits until the next step to act, and recovery gives lasting immunity. **Initial Infectious** people start the epidemic, chosen at random. The tab records the three shares at each step, and prints the peak, its step, and the share ever infected by step **Steps (T)**, with a warning if some are still infectious.

## What Formulas Define the Graph Space Epidemic

- Transmissibility: T = beta / (beta + gamma − beta gamma), the chance that an infectious person infects a given neighbour before recovering
- Mean excess degree: (mean k² − mean k) / mean k, the expected other contacts of a person reached along a link
- Reproduction number: R0 = T × mean excess degree
- Critical transmissibility: T_c = mean k / (mean k² − mean k), where R0 = 1
- Herd-immunity share under random vaccination: 1 − 1 / R0

[Newman (2002)](#ref-New2002a) obtains this threshold by mapping the epidemic to bond percolation on a random network with a given degree distribution.

## How the Networks of the Graph Space Tab Are Built

| **Network** | Construction in the code | Feature |
|---|---|---|
| **Erdos-Renyi** | `erdos_renyi(n, k / (n - 1))` | Independent random links, with mean degree k in expectation, after [Erdos and Renyi (1960)](#ref-ER1960a) |
| **Watts-Strogatz** | `watts_strogatz(n, k, 0.1)` | Ring lattice with 10% of links rewired, so high clustering and short paths, after [Watts and Strogatz (1998)](#ref-WS1998a) |
| **Barabasi-Albert** | `barabasi_albert(n, div(k, 2))` | Preferential attachment, so a few hubs, after [Barabasi and Albert (1999)](#ref-BA1999a) |

**Mean Degree (k)** must be even, since two of the generators use k / 2.

## Where the Network SIR Model Is Strong

Contact structure enters directly, without the mixing assumption of the classical compartment equations. The same code runs on any graph, so the effect of hubs or clustering can be isolated by changing **Network** alone. Chance events are built in: an outbreak can die out early even when R0 is above 1, a result that a deterministic curve cannot show. Individual interventions are also easy to express, as **Scenario** does with vaccination of chosen people. A closed-form threshold exists for comparison, so simulation and theory check each other.

## Where the Network SIR Model Misleads

The network is fixed, while real contacts change with time and with illness. Every person has the same beta and gamma, and every link the same weight. The closed-form R0 assumes a locally tree-like network, so it overstates spread on **Watts-Strogatz**, where the neighbours of a person are often linked to each other. The result of [Pastor-Satorras and Vespignani (2001)](#ref-PV2001a), that the threshold vanishes on large scale-free networks, is for an SIS process in the limit of infinite size, and a network of a few hundred people shows only a low threshold. **Steps (T)** can also end a run before the epidemic does.

## What to Compare the Graph Space Model With

**Structure** runs all three networks at the same mean degree and prints the variance of the degrees beside peak and final size. **Parameter Sweep** sets final size against beta, with the epidemic threshold of the network marked as a dashed line. **Scenario** compares no vaccination, random vaccination and vaccination of the best-connected people. Fuller treatments of spreading on networks are in [Barrat, Barthelemy and Vespignani (2008)](#ref-BBV2008a). **Network Dynamics** is the panel for continuous dynamics on a network, as opposed to individual stochastic agents.

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L. and Albert, R. (1999). Emergence of scaling in random networks. *Science* 286(5439), 509–512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-BBV2008a"></a>Barrat, A., Barthelemy, M. and Vespignani, A. (2008). *Dynamical Processes on Complex Networks*. Cambridge University Press.

<a id="ref-ER1960a"></a>Erdos, P. and Renyi, A. (1960). On the evolution of random graphs. *Publications of the Mathematical Institute of the Hungarian Academy of Sciences*.

<a id="ref-New2002a"></a>Newman, M. E. J. (2002). Spread of epidemic disease on networks. *Physical Review E* 66(1). [doi:10.1103/PhysRevE.66.016128](https://doi.org/10.1103/PhysRevE.66.016128)

<a id="ref-PV2001a"></a>Pastor-Satorras, R. and Vespignani, A. (2001). Epidemic spreading in scale-free networks. *Physical Review Letters* 86(14), 3200–3203. [doi:10.1103/PhysRevLett.86.3200](https://doi.org/10.1103/PhysRevLett.86.3200)

<a id="ref-WS1998a"></a>Watts, D. J. and Strogatz, S. H. (1998). Collective dynamics of small-world networks. *Nature* 393(6684), 440–442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Factsheet](factsheet.md) · [Grid Space](grid-space.md) · [Continuous Space](continuous-space.md) · [Interpretation](interpretation.md)
