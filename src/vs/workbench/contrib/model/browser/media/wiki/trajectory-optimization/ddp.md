# Trajectory Optimisation — Differential Dynamic Programming

Differential dynamic programming improves a trajectory by repeatedly building a local model of the cost-to-go along it. The method goes back to [Mayne (1966)](#ref-May1966a). The **DDP** tab runs the common simplification known as iterative LQR ([Li and Todorov (2004)](#ref-LT2004a)).

## How the DDP Tab Differs from Full Differential Dynamic Programming

Full DDP uses second derivatives of the dynamics when it expands the cost-to-go. Iterative LQR keeps only the first derivatives of the dynamics and the second derivatives of the cost, which is much cheaper per iteration. The **DDP** tab does the latter: it obtains linear models of the dynamics by ForwardDiff.jl at each node. The price is that quadratic convergence, which full DDP can reach near a solution, is not to be expected from this tab.

## What the Backward Pass Computes

The backward pass begins at the final node, with the terminal cost as the cost-to-go, and steps towards the start. At each node, a local quadratic model of the cost-to-go gives a feedforward correction k and a feedback gain K, so that the new control is u + k + K (x_new − x). A small regularisation term mu, added to the second derivative with respect to the control, keeps the step well defined ([Tassa, Erez and Todorov (2012)](#ref-TET2012a)).

## What the Forward Pass and Line Search Do

The forward pass rolls the new controls through the RK4 model from **Initial State**, so that every iterate obeys the dynamics exactly. A line search scales the feedforward correction, from 1.0 down to 0.01, and keeps the first step that lowers the cost. When none does, mu rises tenfold and the backward pass is repeated, and the run gives up once mu passes 1e8. Otherwise the run stops when the relative fall in cost is below **Tolerance**, or at **Max Iterations**.

## Strengths and Limits of the DDP Tab

Each sweep costs time linear in the number of **Knot Points**, and is cubic only in the size of the state and control, so long horizons are cheap. The final gains K give a local feedback controller for free. The method cannot handle control limits or other constraints as it stands, and that is what the **ALTRO** tab adds. Starting from zero controls, it can also settle on a poor local solution, because the first rollout decides where the local models are built.

## References

<a id="ref-LT2004a"></a>Li, W. and Todorov, E. (2004). Iterative linear quadratic regulator design for nonlinear biological movement systems. *Proceedings of the First International Conference on Informatics in Control, Automation and Robotics*, 222–229. [doi:10.5220/0001143902220229](https://doi.org/10.5220/0001143902220229)

<a id="ref-May1966a"></a>Mayne, D. (1966). A second-order gradient method for determining optimal trajectories of non-linear discrete-time systems. *International Journal of Control* 3(1), 85–95. [doi:10.1080/00207176608921369](https://doi.org/10.1080/00207176608921369)

<a id="ref-TET2012a"></a>Tassa, Y., Erez, T. and Todorov, E. (2012). Synthesis and stabilization of complex behaviors through online trajectory optimization. *2012 IEEE/RSJ International Conference on Intelligent Robots and Systems*, 4906–4913. [doi:10.1109/IROS.2012.6386025](https://doi.org/10.1109/IROS.2012.6386025)

## See Also

- [ALTRO](altro.md) · [Indirect Methods](indirect.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
