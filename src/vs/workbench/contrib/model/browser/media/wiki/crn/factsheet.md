# Factsheet

**Interaction Network Models** builds chemical, genetic, ecological and epidemic systems as reaction networks, then simulates them and analyses their structure.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | State a system as reactions, simulate it, and read its structure |
| Julia stack | `Catalyst.jl` for networks, `DifferentialEquations.jl` for solving, `JumpProcesses.jl` for stochastic runs, `HomotopyContinuation.jl` for steady states, `Plots.jl` and `GLMakie.jl` for figures |
| Tabs | **Chemical**, **Genetic**, **Ecological**, **Epidemic** |
| Solver | `Tsit5` for differential equations, `SSAStepper` for jumps |
| Printed result | A plot of all species; **Epidemic** also prints R0 and the infectious period |

The solvers come from [Rackauckas and Nie (2017)](#ref-RN2017a).

## What the Inputs of the Panel Default To

| Input | Default | Chemical | Genetic | Ecological | Epidemic |
|---|---|---|---|---|---|
| **T (time)** | 100 | Span | Span | Span | Days |
| **k1 (forward rate)** | 1.0 | k1, binding | v, transcription | a, prey growth | beta, contact |
| **k2 (reverse/decay rate)** | 0.1 | k2, unbinding | d, degradation | c, predator death | gamma, recovery |
| **u0 (initial amount)** | 100 | S | Px | X | N |

## What Each Tab Fixes in Its Code

| Tab | Fixed values |
|---|---|
| **Chemical** | kcat = 0.5, E = 10, SE = P = 0 at the start |
| **Genetic** | K = 1, Hill coefficient 3, Py = Pz = 0 at the start |
| **Ecological** | b = 0.05, Y = 10 at the start |
| **Epidemic** | I = 1, R = 0 and S = N − 1 at the start |

## Which Actions Follow the Selected Tab

| Action | Network used |
|---|---|
| **Species Trajectories**, **Phase Portrait** | Selected tab, and they need its run first |
| **Stoichiometry Matrix**, **Network Summary** | Selected tab |
| **Steady States**, **Conservation Laws** | Always Michaelis-Menten |
| **Rate Sweep** | Always Lotka-Volterra, with a from 0.2 to 2.0 in steps of 0.2 |
| **Stochastic Simulation**, **ODE vs Gillespie** | Always SIR, the second with 200 runs |
| **Cross-Domain Comparison** | Lotka-Volterra and the repressilator |

## References

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

## See Also

- [Overview](overview.md) · [Chemical](chemical.md) · [Genetic](genetic.md) · [Ecological](ecological.md) · [Epidemic](epidemic.md)
