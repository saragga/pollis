# Factsheet

**Actor-Critic Methods** trains A2C, SAC and TD3 policies on a point-mass control task, with networks written in `Flux.jl`.

## What the Actor-Critic Methods Panel Does

| Item | Detail |
|---|---|
| Purpose | Train a continuous-control policy and compare it with a classical regulator |
| Julia stack | `Flux.jl` for networks and training, `Plots.jl` for figures; `ReinforcementLearning.jl` is named as a wider toolkit but not loaded |
| Tabs | **A2C**, **SAC**, **TD3** |
| Input shape | No data: the code simulates the task |
| State and action | Position and velocity; one force, clamped to the range from -1 to 1 |
| Output | `final_training_return`, `episodes` and `greedy_return_from` for four starts |
| Results object | `res`, with `policy`, `sample`, `value`, `hist` and `model` |

## What the Inputs of the Actor-Critic Methods Panel Default To

| Input | Default | Tabs |
|---|---|---|
| **Environment Steps** | 20000 | All, counted per environment in **A2C** |
| **Episode Length** | 100 | All |
| **Discount (gamma)** | 0.99 | All |
| **Hidden Units** | 64 | All |
| **Random Seed** | 1 | All |
| **Parallel Environments** | 16 | **A2C** |
| **Temperature (alpha)** | 0.05 | **SAC** |
| **Target Update (tau)** | 0.005 | **SAC**, **TD3** |
| **Policy Noise** | 0.2 | **TD3** |

## Which Settings Are Fixed in the Generated Actor-Critic Code

| Setting | **A2C** | **SAC** | **TD3** |
|---|---|---|---|
| Learning rate, with Adam | 0.001 | 0.001 | 0.001 |
| Hidden layers and activation | 1, tanh | 2, relu | 2, relu |
| Rollout length, `nstep` | 5 | Not used | Not used |
| Entropy weight, `ent` | 0.001 | Set by **Temperature (alpha)** | Not used |
| Batch size | Whole rollout | 64 | 64 |
| Random-action warm-up, `warmup` | Not used | 1000 steps | 1000 steps |
| Exploration noise, `explore` | Learned | Learned | 0.1 |
| Actor delay, `delay` | Not used | Not used | 2 |
| Clip on target noise | Not used | Not used | 0.5 |

Each setting is a keyword or a literal in the code, so it can be edited there.

## How Much Training the Defaults Mean

| Quantity | **A2C** | **SAC**, **TD3** |
|---|---|---|
| Transitions collected | Steps × environments, 320000 | Steps, 20000 |
| Critic updates | Steps / 5, 4000 | About one per step |
| Episodes per environment | Steps / length, 200 | Steps / length, 200 |

Figures assume **Parallel Environments** at 16 and **Episode Length** at 100.

## See Also

- [Overview](overview.md) · [A2C](a2c.md) · [SAC](sac.md) · [TD3](td3.md) · [Diagnostics](diagnostics.md)
