# Subgradient

The **subgradient method** (Shor, 1960s) generalises gradient descent to nonsmooth convex functions. At a kink, F has no gradient but a set of **subgradients**, the slopes of the lines that touch F from below: for |x| at 0, every slope between -1 and 1. The method steps along the negative of any one subgradient: x_new = x - t_k s_k.

## Not a Descent Method
A negative subgradient need not be a descent direction: near a kink, a step can increase F. The method therefore **tracks the best iterate**, and the panel reports it. The **Descent Check** counts the increases.

## Step Sizes
Constant steps do not converge: the iterates oscillate across the kink. Convergence needs **diminishing** steps whose sum is infinite, such as step / sqrt(k), the panel's rule. The best value then approaches F* at rate **O(1 / sqrt(k))**: one more digit of accuracy costs a hundred times more iterations. This rate is optimal for methods that see only subgradients of a general Lipschitz convex function, and it is why the other methods exist.

## The Subgradients Here
The panel uses grad loss(x) + lambda s(x), with s the sign vector for L1, x / ||x|| for L2 (0 at the origin), and a signed unit vector at the largest coordinate for the max norm.

## No Exact Zeros
The method rarely lands exactly on a kink, so with the L1 penalty its coefficients are small but **not exactly zero**: the **Sparsity Pattern** may show false positives at the 1e-6 threshold that the proximal methods do not have.

## When to Use It
As a baseline; when only a subgradient oracle exists and accuracy is not critical; or in very large problems where each step must be as cheap as possible.

## See Also
- [Bundle Methods](bundle.md) · [Proximal Point](proximal-point.md) · [Decision Guide](decision-guide.md)
