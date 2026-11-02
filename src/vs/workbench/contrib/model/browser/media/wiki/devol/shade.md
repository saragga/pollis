# SHADE

SHADE adapts F and CR during the run, through a memory of settings that recently produced improvements. It is a strong general-purpose variant, and needs little tuning of those two values.

## How the Memory Works

Two arrays of **Memory Size (H)** slots, `MF` and `MCR`, start at 0.5. For each member at each generation:

1. Pick a random slot r.
2. Draw CR from a normal with mean MCR[r] and spread 0.1, clipped to [0, 1].
3. Draw F from a Cauchy with centre MF[r] and spread 0.1, redrawn if not positive, capped at 1.

[Tanabe and Fukunaga (2013)](#ref-TF2013a) introduced this history. Several slots hold several promising settings, so that a single bad update does less harm than it would to a single mean.

## How Success Updates the Memory

At the end of a generation, the code collects settings from all trials that strictly improved, with weights given by the size of each improvement:

- MF[slot] = weighted Lehmer mean of the successful F values
- MCR[slot] = weighted arithmetic mean of the successful CR values

The slot index then moves on, in a cycle. A Lehmer mean, sum(w F^2) / sum(w F), leans toward larger values, which resists a drift toward very small F. If no trial succeeds, the memories stay as they are. **Parameter History** shows the mean F and CR that result.

## How Current-to-pbest Mutation Works

- v = x_i + F (x_pb − x_i) + F (x_r1 − x_r2)

Here x_pb is drawn from the best **p-best Fraction** of the population, with at least 2 members. x_r1 comes from the population, and x_r2 from the population or the archive. The first term pulls toward good regions, and the second keeps some variety. A small fraction is greedy, and it can collapse early. The mutation comes from JADE, by [Zhang and Sanderson (2009)](#ref-ZS2009a), which keeps one mean for each parameter instead of a memory.

## What the Archive Adds

When a trial replaces its parent, the parent joins the archive. The archive feeds x_r2, so that difference vectors can point away from solutions already left behind. Its size is limited to the population size, with random members deleted once it overflows. Archived points are never returned as answers, and they cost no evaluations. The archive matters most on hard problems, where variety is short. The code's `pool = [X; archive]` shows how simple the change is.

## Which Settings Remain

SHADE removes F and CR as settings, and it adds **Memory Size (H)** and **p-best Fraction**. Results tend to be less sensitive to those two than DE's are to F and CR, and H near 10 and a fraction near 0.1 are common. **Population Size** still matters. A later variant, L-SHADE, shrinks the population during a run, which is often better on long runs. [Das, Mullick and Suganthan (2016)](#ref-DMS2016a) review such later developments.

## Where SHADE Is Strong and Weak

SHADE does well on benchmark sets, and it suits cases in which hand tuning is impractical. It costs a little extra bookkeeping per generation, which is negligible beside a costly objective. Adaptation needs time to learn, so that very short runs gain little, and may do worse than a well-chosen fixed setting. Its greedy pull can also hurt on deceptive functions. Benchmark success does not assure success on a real problem, and a comparison on the problem at hand is still needed.

## References

<a id="ref-DMS2016a"></a>Das, S., Mullick, S. S. and Suganthan, P. N. (2016). Recent advances in differential evolution: an updated survey. *Swarm and Evolutionary Computation* 27, 1–30. [doi:10.1016/j.swevo.2016.01.004](https://doi.org/10.1016/j.swevo.2016.01.004)

<a id="ref-TF2013a"></a>Tanabe, R. and Fukunaga, A. (2013). Success-history based parameter adaptation for differential evolution. *IEEE Congress on Evolutionary Computation*, 71–78. [doi:10.1109/CEC.2013.6557555](https://doi.org/10.1109/CEC.2013.6557555)

<a id="ref-ZS2009a"></a>Zhang, J. and Sanderson, A. C. (2009). JADE: adaptive differential evolution with optional external archive. *IEEE Transactions on Evolutionary Computation* 13(5), 945–958. [doi:10.1109/TEVC.2009.2014613](https://doi.org/10.1109/TEVC.2009.2014613)

## See Also

- [Factsheet](factsheet.md) · [Classic DE](de.md) · [Adaptive DE](adaptive-de.md) · [Decision Guide](decision-guide.md)
