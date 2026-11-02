# RealNVP

The **RealNVP** tab stacks affine coupling layers, the design of [Dinh, Sohl-Dickstein and Bengio (2017)](#ref-DSB2017a), which adds a scale to the additive layers of [Dinh, Krueger and Bengio (2014)](#ref-DKB2014a). It has the simplest step of the three tabs.

## What an Affine Coupling Layer Computes

Each step splits a vector x into two halves, x_a of length div(D, 2) and x_b with the rest, and changes only one of them:

- y_a = x_a
- y_b = x_b · exp(s(x_a)) + t(x_a)
- log |det J| = sum over i of s_i(x_a)

Separate multilayer networks give s and t. The Jacobian is triangular, so the determinant needs no matrix computation, and neither network has to be inverted. Even-numbered steps swap the roles of the halves. The inverse exists in closed form, x_b = (y_b − t(y_a)) · exp(−s(y_a)), but the panel's code does not include it.

## Which Inputs the RealNVP Tab Takes

| Input | Role in the code | Default |
|---|---|---|
| **input_dim** | D; must equal the number of rows of **Input data** and be at least 2 | Set for the default **Input data** |
| **num_flows** | Coupling layers in the stack | 8 |
| **hidden_size** | Width of the networks s and t | 128 |
| **num_layers** | Hidden tanh layers in each network | 2 |
| **dropout** | Probability of the one dropout layer before each network's output | 0.0 |

**num_bins** does not apply to this tab. The output of s has no bound, so log-scales can grow large.

## How the RealNVP Tab Differs from the Published Model

The published RealNVP targets images, with checkerboard and channel masks, a multi-scale architecture, residual networks and batch normalisation. The tab has none of these. It splits by row position, uses plain feed-forward networks, and applies no normalisation between steps. With a fixed split, variables in one half affect each other only across several steps. Results reported for the published model therefore do not carry over directly to this tab.

## What Affine Coupling Does Well

One pass of each network gives the density for a whole batch, and the inverse also takes one pass, so both directions can run in parallel across dimensions. This symmetry is the reason to prefer coupling over autoregressive steps when sampling matters. The log-determinant is a plain sum of network outputs, which keeps **Per-Step Log-Determinant** easy to read. The tab vectorises over the batch, whereas **Neural Spline** loops over samples.

## Where the RealNVP Tab Misleads

An affine map given x_a only shifts and scales x_b, so each conditional within a step keeps its shape, and multimodal or sharply bounded densities take many steps. Unbounded log-scales can produce a non-finite loss on unscaled data, which ends training. Row order in **Input data** matters, so a reordering may change the fit. A **dropout** above 0 can leave later evaluations random, which `Flux.testmode!(model)` prevents, and a high training likelihood is easily reached with so many parameters.

## What to Compare RealNVP With

Set the tab against **vs Multivariate Gaussian** first, and then against the other tabs on held-out data. **MAF** changes every variable in each step, and **Neural Spline** keeps the coupling structure with more flexible maps. If a larger **num_flows** or **hidden_size** brings no held-out improvement, the sample may be the limit, in which case a more elaborate flow is unlikely to help.

## References

<a id="ref-DKB2014a"></a>Dinh, L., Krueger, D. and Bengio, Y. (2014). NICE: non-linear independent components estimation. arXiv:1410.8516. [doi:10.48550/arXiv.1410.8516](https://doi.org/10.48550/arXiv.1410.8516)

<a id="ref-DSB2017a"></a>Dinh, L., Sohl-Dickstein, J. and Bengio, S. (2017). Density estimation using real-valued non-volume preserving (Real NVP) transformations. arXiv:1605.08803. [doi:10.48550/arXiv.1605.08803](https://doi.org/10.48550/arXiv.1605.08803)

## See Also

- [Factsheet](factsheet.md) · [MAF](maf.md) · [Neural Spline Flows](nsf.md) · [Decision Guide](decision-guide.md)
