# GRASP

GRASP stands for greedy randomised adaptive search procedure. Each iteration builds a new solution with a randomised greedy rule, improves it by local search, and keeps the best seen across iterations.

## How the Two Phases Work

Each iteration has a construction phase and an improvement phase:

1. Build a tour, one city at a time, by a randomised greedy rule.
2. Improve that tour with `vnd!` to a local optimum.
3. Keep it if it beats the best so far.

Iterations are independent, as nothing is learned from one to the next. [Feo and Resende (1989)](#ref-FR1989a) introduced the approach on set covering, and [Feo and Resende (1995)](#ref-FR1995a) gave the general form. It is simple to code, with few settings to tune.

## How the Candidate List Works

`construct` starts at a random city. At each step, it ranks the unvisited cities by distance from the last city, and it forms a restricted candidate list:

- All cities c with d(c) ≤ lo + alpha (hi − lo)

Here lo and hi are the smallest and largest of the distances. One city is chosen from that list at random. The list is rebuilt after each step, and that is the meaning of "adaptive". This is a value-based list. Other versions use a cardinality rule, with the k best candidates.

## How to Think About Greediness

**Greediness (alpha)** balances quality against diversity:

| alpha | Construction | Result |
|---|---|---|
| 0 | Nearest neighbour, starting city still random | Good starts, little variety |
| Small | Near-greedy | Good starts, some variety |
| 1 | Uniform random | Poor starts, much variety |

Pure greed gives little to explore, and pure randomness leaves too much work for local search. Good values tend to be small to moderate, and they depend on the problem. The default is 0.3.

## Why Good Starts Matter

Local search converges to the local optimum reachable from its start, so a better start usually gives a better optimum, and also needs fewer moves. **Construction Quality** shows a nearest-neighbour tour, the same after one descent, and the full algorithm. On long tours, descent from a random start takes many moves, so that GRASP's starts save a lot of time compared with **VND** restarts. That saving is the argument for the greedy part of the method.

## Which Extensions Learn Between Iterations

Plain GRASP has no memory, which is its main weakness. Reactive GRASP, from [Prais and Ribeiro (2000)](#ref-PR2000a), adjusts alpha according to the results obtained at each value. Path relinking explores the path between good solutions, and bias functions favour promising candidates. [Resende and Ribeiro (2016)](#ref-RR2016a) cover these developments in depth. None is in the tab, although each can be added by editing `search` or `construct`.

## Where GRASP Is Strong and Weak

GRASP suits problems with a natural greedy rule, as in scheduling and covering. It runs easily in parallel, since iterations are independent, and its best result can only improve. The output is a random sample of local optima, so a problem with very many poor local optima can take long to reveal a good one. For a large instance, each full construction is costly, and repeating it from nothing may waste work that a method such as **VNS** would keep.

## References

<a id="ref-FR1989a"></a>Feo, T. A. and Resende, M. G. C. (1989). A probabilistic heuristic for a computationally difficult set covering problem. *Operations Research Letters* 8(2), 67–71. [doi:10.1016/0167-6377(89)90002-3](https://doi.org/10.1016/0167-6377(89)90002-3)

<a id="ref-FR1995a"></a>Feo, T. A. and Resende, M. G. C. (1995). Greedy randomized adaptive search procedures. *Journal of Global Optimization* 6(2), 109–133. [doi:10.1007/BF01096763](https://doi.org/10.1007/BF01096763)

<a id="ref-PR2000a"></a>Prais, M. and Ribeiro, C. C. (2000). Reactive GRASP: an application to a matrix decomposition problem in TDMA traffic assignment. *INFORMS Journal on Computing* 12(3), 164–176. [doi:10.1287/ijoc.12.3.164.12639](https://doi.org/10.1287/ijoc.12.3.164.12639)

<a id="ref-RR2016a"></a>Resende, M. G. C. and Ribeiro, C. C. (2016). *Optimization by GRASP*. Springer. [doi:10.1007/978-1-4939-6530-4](https://doi.org/10.1007/978-1-4939-6530-4)

## See Also

- [Factsheet](factsheet.md) · [VND](vnd.md) · [VNS](vns.md) · [Decision Guide](decision-guide.md)
