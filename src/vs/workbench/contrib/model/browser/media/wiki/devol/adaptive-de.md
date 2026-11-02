# Adaptive DE

The **Adaptive DE** tab implements jDE, in which each member carries its own F and CR. Settings evolve along with the solutions, and good settings survive because the members using them survive.

## How Self-Adaptation Works

Each member i has F_i and CR_i. Before it builds a trial:

- With probability **Re-sampling Probability**, F_i is redrawn uniformly from [0.1, 1].
- With the same probability, independently, CR_i is redrawn uniformly from [0, 1].

A trial then uses DE/rand/1/bin with those values. If the trial wins, the new values are kept with it. If it loses, the old values stay. No external memory or update rule is needed. The method comes from [Brest, Greiner, Bošković, Mernik and Žumer (2006)](#ref-BGBMZ2006a).

## Why Inherited Settings Work

The logic is indirect selection: a setting that yields a winning trial stays, on the view that it is likely to work again. Nothing measures a setting directly, and its fate depends on the single trial it produced. Over generations, the population's values concentrate where they are useful, and they can move as the search moves from wide exploration to fine convergence. A small re-sampling probability provides new values without erasing what has been learned.

## How jDE Differs from JADE and SHADE

| Method | Where settings live | Learns from |
|---|---|---|
| jDE, this tab | Each member | Survival of the member's trial |
| JADE | One mean for each parameter | Successful settings in a generation |
| SHADE | H memory slots | Successful settings, weighted by gain |

The panel's bullet describes this tab as JADE-style, but its code and table are jDE. JADE, from [Zhang and Sanderson (2009)](#ref-ZS2009a), also uses current-to-pbest mutation, while this tab stays with rand/1. That gives less greed, and usually slower convergence.

## How to Set the Re-sampling Probability

**Re-sampling Probability** has a default of 0.1, which is the value commonly used for this method. Low values let settings persist and be tested more. High values turn the method into DE with random settings, which loses the adaptation. Results are usually not sensitive to it across a moderate range. The ranges of F and CR are fixed in the code, and F in [0.1, 1] stops steps from vanishing. Reporting the values used is enough in most cases.

## How to Read the Adapted Settings

**Parameter History** plots the population means of F and CR per generation. Mean CR moving low suggests that coordinate-wise moves work, as on a separable problem such as Rastrigin. Mean CR moving high suggests related variables. A flat mean near the midpoint may mean no clear signal, or a short run. Adapted values are also shaped by the stage of the search, and they should not be taken as the best fixed settings for a later run with **DE**.

## Where Adaptive DE Is Strong and Weak

jDE is simple, and it has few settings, so it makes a good choice when a light adaptive method is wanted. It costs nothing beyond plain DE. Its adaptation is slow compared with **SHADE**, as each setting gets judged by one trial. With rand/1 as the base, it explores widely, and it tends to converge more slowly on simple functions. Very short runs leave too little time for adaptation. Evolutionary self-adaptation in general is treated by [Eiben and Smith (2015)](#ref-ES2015a).

## References

<a id="ref-BGBMZ2006a"></a>Brest, J., Greiner, S., Bošković, B., Mernik, M. and Žumer, V. (2006). Self-adapting control parameters in differential evolution: a comparative study on numerical benchmark problems. *IEEE Transactions on Evolutionary Computation* 10(6), 646–657. [doi:10.1109/TEVC.2006.872133](https://doi.org/10.1109/TEVC.2006.872133)

<a id="ref-ES2015a"></a>Eiben, A. E. and Smith, J. E. (2015). *Introduction to Evolutionary Computing*. Springer. [doi:10.1007/978-3-662-44874-8](https://doi.org/10.1007/978-3-662-44874-8)

<a id="ref-ZS2009a"></a>Zhang, J. and Sanderson, A. C. (2009). JADE: adaptive differential evolution with optional external archive. *IEEE Transactions on Evolutionary Computation* 13(5), 945–958. [doi:10.1109/TEVC.2009.2014613](https://doi.org/10.1109/TEVC.2009.2014613)

## See Also

- [Factsheet](factsheet.md) · [Classic DE](de.md) · [SHADE](shade.md) · [Decision Guide](decision-guide.md)
