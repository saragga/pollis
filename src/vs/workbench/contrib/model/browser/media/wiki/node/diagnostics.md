# Neural ODEs for System Identification: Diagnostics

How to judge a fit: the fitted against the observed trajectory, the convergence of the loss, the structure of the residuals, the error on a held-out horizon, and the sensitivity to the initial condition.

## Fit and phase portrait

**Predicted vs Observed** plots the fitted trajectory of every state against the observations, at **Time points**. A good fit passes through the observed points of every state, not only through those of the largest one.

**Phase Portrait** draws the fitted path of the first two states, integrated at 500 points up to **Time span end (T)**, with the observations and the starting point marked. Spirals, cycles and fixed points of the learned dynamics appear as shapes in this plane. A fitted path that crosses itself in the plane is possible only when the dynamics involve more than two states, as in **Augmented** or a system with n > 2, since trajectories of an ODE cannot cross, as [Dupont, Doucet and Teh (2019)](#ref-DDT2019a) show.

## The loss curve

**Loss Curve** plots the loss recorded at every iteration, on a logarithmic scale. A curve that is still falling at the last iteration points to more **Iterations**, as the tooltip of that input suggests; a curve that jumps or rises points to a smaller **Learning rate**, whose tooltip suggests reducing it if the loss diverges.

[Kingma and Ba (2015)](#ref-KB2015a) note that Adam's effective step is approximately bounded by the step size α, which makes **Learning rate** the main control over the size of each update.

## Residuals

**Residual Analysis** prints the root mean squared error of every state and plots the residuals, fitted minus observed, against time. Its description states the reading: structure left in the residuals means dynamics the model has missed.

The root mean squared errors are on the scale of each state, so they can be compared with the range of that state in the data. A plot in which every state's residuals stay close to the dashed zero line at all times marks a fit that follows the whole trajectory, early and late.

## Held-out horizon

**Held-Out Horizon** refits the model on the first 80% of the time points, with the same learning rate and number of iterations, and prints the squared error on the last 20%, which the refit never saw. The plot marks the end of the fit with a dashed line.

A small error on the held-out part means that the learned dynamics carry the trajectory forward beyond the data used to fit them. Comparing the held-out error with the error on the fitted part shows how far the fit generalises beyond its data; [Goodfellow, Bengio and Courville (2016)](#ref-GBC2016a) devote a chapter to regularisation for deep learning.

## Sensitivity to the initial condition

**Initial-Condition Sensitivity** integrates the fitted model from u0 and from u0 scaled by 1.01, at 200 points up to T, and plots the distance between the two trajectories over time.

A distance that stays near its starting value, or shrinks, marks dynamics that forget small differences in the initial state. A distance that grows marks dynamics that amplify them, and **Lyapunov Estimate** measures the rate of that growth. Since **Neural ODE** and **UDE** take the first observation as the initial condition without estimating it, the plot also shows how much an error in that observation affects the whole fit.

## References

<a id="ref-DDT2019a"></a>Dupont, E., Doucet, A., & Teh, Y. W. (2019). Augmented Neural ODEs. [doi:10.48550/arXiv.1904.01681](https://doi.org/10.48550/arXiv.1904.01681)

<a id="ref-GBC2016a"></a>Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press. [deeplearningbook.org](https://www.deeplearningbook.org/)

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Architecture](architecture.md) · [Training](training.md)
