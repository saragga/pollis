# HMC

**Hamiltonian Monte Carlo** uses the gradient of the log density to make long moves that are still accepted with high probability.

## The Physics
Treat the parameters x as the position of a particle on a surface whose height is the potential energy U(x) = -log p(x). Give the particle a random **momentum** r, drawn from a normal distribution with covariance M, the **mass matrix**. The total energy H(x, r) = U(x) + r' M^-1 r / 2 is conserved as the particle moves: it slides down into regions of high probability and climbs out of them again, travelling far from where it started.

## The Leapfrog Integrator
The motion is simulated with the **leapfrog** integrator, L steps of size epsilon:

    r <- r + (epsilon / 2) grad log p(x)
    x <- x + epsilon M^-1 r
    r <- r + (epsilon / 2) grad log p(x)

The end point is the proposal. Because the integrator conserves energy only approximately, the proposal is accepted with probability min(1, exp(H_old - H_new)), which keeps the target exact. The leapfrog is reversible and preserves volume, which this acceptance rule needs.

## The Settings
- **Step size epsilon**: too large, and the energy error grows, proposals are rejected, and trajectories diverge; too small, and each trajectory needs many gradient evaluations. The panel starts from find_good_stepsize and adapts it to a target acceptance of 0.65.
- **Number of leapfrog steps L**: the trajectory length is L epsilon. Too short gives random-walk behaviour; too long wastes work or brings the particle back. This is the setting NUTS removes.
- **Mass matrix M**: a diagonal M, adapted during warm-up, rescales each parameter so that one step size suits all.

## In AdvancedHMC.jl
The panel builds the sampler from its parts: a DiagEuclideanMetric, a Hamiltonian from the log density with ForwardDiff gradients, a Leapfrog integrator, an HMCKernel with a fixed number of steps, and a StanHMCAdaptor for the step size and the mass matrix, over 500 warm-up steps that are then dropped.

## See Also
- [NUTS](nuts.md) · [Metropolis-Hastings](metropolis-hastings.md) · [Assumptions](assumptions.md)
