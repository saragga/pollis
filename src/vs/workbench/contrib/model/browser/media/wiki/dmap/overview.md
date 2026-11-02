# Overview

A discrete map turns the current state into the next one, step by step. The panel iterates the Hénon map, a two-variable rule whose orbit looks chaotic at its classic parameters.

## What a Discrete Map Is

A map sends a state u to f(u), so an orbit is the sequence u, f(u), f(f(u)) and so on. Time counts whole steps, with no differential equation to integrate and no step size to choose. Maps arise as models in their own right, such as yearly populations, and as samples of a continuous system at regular crossings. Even a one-variable rule can behave in very complicated ways, as [May (1976)](#ref-May1976a) showed for simple population models.

## Which Map the Panel Iterates

The rule has two variables and two parameters:

- x next = 1 − a x² + y
- y next = b x

[Hénon (1976)](#ref-Hen1976a) proposed it as a simple model that keeps the main properties of the Lorenz system, and the defaults a = 1.4, b = 0.3 are the values studied there. The first steps can be checked by hand: from (0, 0), the orbit goes to (1, 0), then (−0.4, 0.3), then (1.076, −0.12). To study another map, edit the `henon` function in the code.

## What the Panel Computes

| Result | Function in `DynamicalSystems.jl` | Action |
|---|---|---|
| Orbit | `trajectory` | **Orbit Plot**, **Time Series** |
| Fixed points and stability | `fixedpoints` | **Fixed Points of Map** |
| Largest exponent | `lyapunov` | **Lyapunov Exponent** |
| Change with a parameter | `trajectory` in a loop | **Bifurcation Diagram**, **Parameter Sweep** |

[Datseris (2018)](#ref-Dat2018a) describes the library.

## Which Long-Run Behaviours Can Appear

| Behaviour | What the orbit does | Sign in the panel |
|---|---|---|
| Fixed point | Settles on one state | One distinct value |
| Cycle | Repeats after p steps | p distinct values |
| Chaos | Stays bounded, never repeats, and separates from neighbours | Positive exponent |
| Escape | Runs off to infinity | Bounded is false |

Which one appears depends on the parameters, and for some parameters also on the starting state.

## A Common Workflow for a New Parameter Set

1. Run the panel, and read whether the orbit is bounded.
2. Look at **Orbit Plot** and **Time Series**.
3. Locate the equilibria with **Fixed Points of Map**.
4. Measure chaos with **Lyapunov Exponent** and **Sensitivity to ICs**.
5. Place the parameter in context with **Bifurcation Diagram**.
6. Test other starts with **Multiple Initial Conditions**.

Keep the first step even when only one number is wanted, as later figures mean nothing for an orbit that escaped.

## References

<a id="ref-Dat2018a"></a>Datseris, G. (2018). DynamicalSystems.jl: A Julia software library for chaos and nonlinear dynamics. *Journal of Open Source Software* 3(23), 598. [doi:10.21105/joss.00598](https://doi.org/10.21105/joss.00598)

<a id="ref-Hen1976a"></a>Hénon, M. (1976). A two-dimensional mapping with a strange attractor. *Communications in Mathematical Physics* 50(1), 69–77. [doi:10.1007/BF01608556](https://doi.org/10.1007/BF01608556)

<a id="ref-May1976a"></a>May, R. M. (1976). Simple mathematical models with very complicated dynamics. *Nature* 261(5560), 459–467. [doi:10.1038/261459a0](https://doi.org/10.1038/261459a0)

## See Also

- [Factsheet](factsheet.md) · [Fixed Points](fixed-points.md) · [Bifurcation](bifurcation.md) · [Assumptions](assumptions.md)
