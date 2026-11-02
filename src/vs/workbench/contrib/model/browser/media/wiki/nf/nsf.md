# Neural Spline Flows

The **Neural Spline** tab uses coupling layers with a rational-quadratic spline in place of an affine map, after [Durkan, Bekasov, Murray and Papamakarios (2019)](#ref-DBMP2019a). The spline form goes back to the monotone interpolation of [Gregory and Delbourgo (1982)](#ref-GD1982a).

## What a Rational-Quadratic Spline Coupling Layer Computes

As in an affine coupling layer, x_a passes through unchanged and sets the parameters for x_b. Each x_b coordinate then goes through its own monotone spline with K segments. Within segment k, with left knot (x_k, y_k), width w, height h, slope s = h / w, position e = (x − x_k) / w and knot derivatives d_k and d_(k+1):

- y = y_k + h · (s · e^2 + d_k · e · (1 − e)) / (s + (d_(k+1) + d_k − 2s) · e · (1 − e))

The log-determinant is the sum of the logs of the derivatives of those splines. Even-numbered steps swap the two halves.

## How the Neural Spline Tab Builds Each Spline

One network outputs 3K − 1 raw numbers per transformed variable: K widths, K heights and K − 1 interior derivatives. `Bijectors.RationalQuadraticSpline(widths, heights, derivatives, B)` turns them into a valid spline. Softmax gives positive widths and heights that span the box, and a softplus gives positive derivatives. `B` is fixed at 5, and the boundary derivatives are 1. Outside [-B, B] the map is the identity, with zero log-determinant. The code sets no minimum bin width.

## Which Inputs the Neural Spline Tab Takes

| Input | Role in the code | Default |
|---|---|---|
| **input_dim** | D; must equal the number of rows of **Input data** | Set for the default **Input data** |
| **num_flows** | Spline coupling layers | 8 |
| **num_bins** | K, the segments of each spline | 8 |
| **hidden_size** | Width of the network in each step | 128 |
| **num_layers** | Hidden relu layers of that network | 2 |
| **dropout** | Probability of the one dropout layer before the network's output | 0.0 |

The published model also places invertible linear layers between couplings. This tab only swaps the halves, so it mixes variables less.

## What Rational-Quadratic Splines Do Well

One spline can bend several times, so a step can produce multimodal or sharply bounded conditionals that an affine step cannot. For such coupling flows, the authors of Neural Spline Flows report density estimation on a par with the best autoregressive flows, while keeping a closed-form inverse. In this tab, **num_bins** gives direct control over the flexibility of each step, which **RealNVP** and **MAF** lack. Fewer steps may then suffice.

## Where the Neural Spline Tab Misleads

The spline box of [-5, 5] is a real limit. Values beyond it pass through a step unchanged and add nothing to the log-determinant, so unscaled data leave the flow little to do, and only the normal base shapes the far tails. Bins can become very narrow and give spikes in the density, which **Held-Out Log-Likelihood** may expose. More **num_bins** add outputs and, with few observations, favour overfitting. The code builds splines in a Julia loop over samples, where the other tabs use matrix passes.

## What to Compare a Neural Spline Flow With

Compare on **Held-Out Log-Likelihood** with **RealNVP**, which has the same coupling structure, and repeat each fit, since no seed is set. A gain worth keeping is larger than the spread across repeats. **Data vs Latent Space** can show whether the latent cloud is rounder than under the affine tab. Read the result against **vs Multivariate Gaussian** as well, since the spline's extra outputs raise the number of parameters.

## References

<a id="ref-DBMP2019a"></a>Durkan, C., Bekasov, A., Murray, I. and Papamakarios, G. (2019). Neural spline flows. arXiv:1906.04032. [doi:10.48550/arXiv.1906.04032](https://doi.org/10.48550/arXiv.1906.04032)

<a id="ref-GD1982a"></a>Gregory, J. A. and Delbourgo, R. (1982). Piecewise rational quadratic interpolation to monotonic data. *IMA Journal of Numerical Analysis* 2(2), 123–130. [doi:10.1093/imanum/2.2.123](https://doi.org/10.1093/imanum/2.2.123)

## See Also

- [Factsheet](factsheet.md) · [RealNVP](realnvp.md) · [MAF](maf.md) · [Decision Guide](decision-guide.md)
