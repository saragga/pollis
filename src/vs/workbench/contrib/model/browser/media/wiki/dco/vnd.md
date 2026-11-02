# VND

Variable neighbourhood descent searches several neighbourhoods in a fixed order. It stops only at a solution that none of them can improve, which is a stronger kind of local optimum than any single move gives.

## How the Descent Works

`vnd!` follows a simple loop:

1. Set k = 1.
2. Try the neighbourhood k.
3. If it improves the tour, go back to k = 1.
4. Otherwise set k = k + 1.
5. Stop when k passes the last neighbourhood.

Each call to a neighbourhood function applies the first improving move that it finds, and reports back. The final tour is a local optimum for all active neighbourhoods. The method comes from the variable neighbourhood literature of [Hansen and Mladenović (2001)](#ref-HM2001a).

## Which Neighbourhoods the Panel Uses

| Function | Move | Scan cost |
|---|---|---|
| `two_opt!` | Remove two edges, and reconnect by reversing a segment | Quadratic, constant per candidate |
| `or_opt!` | Move a segment of 1 to 3 cities, possibly reversed | Quadratic, with list rebuilding |
| `swap!` | Exchange two cities | Quadratic, with a full length per candidate |

[Croes (1958)](#ref-Cro1958a) introduced the segment reversal, and in the Euclidean plane a 2-opt tour has no crossings. The code's `swap!` is simple rather than fast, as it calls `tourlen` for every candidate.

## Why the Order of Neighbourhoods Matters

A common rule goes from the cheapest and most productive neighbourhood to the costliest. Going back to the first after each improvement spends most of the time in cheap moves, and uses costly ones only at the end. **Neighbourhoods** sets how many are active, in the fixed order 2-opt, or-opt, swap. A different order changes which local optimum is reached, as well as the time. For a tour problem, swap rarely adds much after the other two, which **Neighbourhood Usage** can confirm.

## First Improvement or Best Improvement

The code stops at the first improving move in each scan. Best improvement scans the whole neighbourhood, and applies the best move. First improvement makes cheaper steps, and usually needs more of them. Neither one dominates, as both reach local optima, and quality is often similar. The scan order is deterministic in the code, so that the result depends only on the start. A random scan order, or a neighbour list that limits candidates to nearby cities, would make large instances far faster.

## How the Tab Restarts the Descent

A single descent ends at one local optimum, and it gives no more on a second call. **VND** therefore restarts: the first descent starts from a nearest-neighbour tour, and later ones from random tours given by `randperm(n)`. Random starts need many moves to get to a local optimum, so each iteration costs much. Their results also tend to be worse than descents from greedy starts. That makes the **VND** tab a useful baseline: it shows how much descent alone gives, with no good start and no shaking.

## How VND Relates to Stronger Moves

Each neighbourhood looks at small changes, so the method is cheap, and is limited by that. Larger moves find better tours at higher cost. The Lin-Kernighan heuristic of [Lin and Kernighan (1973)](#ref-LK1973a) builds variable-depth moves, and it remains a strong local search for the problem. On that scale, the panel's moves are simple. They are enough to teach the ideas, and a serious tour solver would use something stronger or an exact method.

## References

<a id="ref-Cro1958a"></a>Croes, G. A. (1958). A method for solving traveling-salesman problems. *Operations Research* 6(6), 791–812. [doi:10.1287/opre.6.6.791](https://doi.org/10.1287/opre.6.6.791)

<a id="ref-HM2001a"></a>Hansen, P. and Mladenović, N. (2001). Variable neighbourhood search: principles and applications. *European Journal of Operational Research* 130(3), 449–467. [doi:10.1016/S0377-2217(00)00100-4](https://doi.org/10.1016/S0377-2217(00)00100-4)

<a id="ref-LK1973a"></a>Lin, S. and Kernighan, B. W. (1973). An effective heuristic algorithm for the traveling-salesman problem. *Operations Research* 21(2), 498–516. [doi:10.1287/opre.21.2.498](https://doi.org/10.1287/opre.21.2.498)

## See Also

- [Factsheet](factsheet.md) · [GRASP](grasp.md) · [VNS](vns.md) · [Diagnostics](diagnostics.md)
