# Recurrent Layers — Cell Catalogue

**Recurrent Cell** offers 37 cells, grouped here by how they keep memory. Each description follows the equations in the package source, and h(t) is the state, x(t) the input, and a gate a sigmoid output between 0 and 1.

## How the Recurrent Cell Catalogue Is Organised

Every cell in the catalogue is built with `Name(input_size => hidden_size)`, and in **Lux** with `NameCell(input_size => hidden_size)` inside `Recurrence`. **IntersectionRNN**, **RHN**, **MiRU1** and **MiRU2** run only in **Flux**. Groups are a reading aid and not a taxonomy from the literature. A short comment in the panel's generated code also describes each cell, but for several cells the package equations say otherwise, and the tables follow the equations. Sources are cited where a record could be checked. The standard LSTM and GRU are not in the list, as they come from Flux and Lux themselves, through **Compare with LSTM** and **Compare with GRU**.

## Which Recurrent Cells Are LSTM Variants

| Cell | What changes from the standard LSTM | Source |
|---|---|---|
| **OriginalLSTM** | No forget gate: the cell state only adds, c(t) = c(t-1) + i(t) z(t) | [Hochreiter and Schmidhuber (1997)](#ref-HS1997a) |
| **PeepholeLSTM** | Gates also read the cell state through diagonal weights | Listed by the package |
| **MultiplicativeLSTM** | A product of projected input and state feeds the gates | [Krause, Lu, Murray and Renals (2016)](#ref-KLMR2016a) |
| **WMCLSTM** | Gates read `tanh` of a learned projection of the cell state | [Landi, Baraldi, Cornia and Cucchiara (2021)](#ref-LBCC2021a) |
| **TLSTM** | Gates read x(t) and x(t-1), not the state | [Balduzzi and Ghifary (2016)](#ref-BG2016a) |
| **JANET** | Only a forget gate, with a fixed offset beta of 1.0 | [van der Westhuizen and Lasenby (2018)](#ref-WL2018a) |

## Which Recurrent Cells Use a Single Gate

| Cell | Update rule | Source |
|---|---|---|
| **MGU** | One gate f mixes the state with a candidate that reads f times the state | [Zhou, Wu, Zhang and Zhou (2016)](#ref-ZWZZ2016a) |
| **LiGRU** | No reset gate and a ReLU candidate, without the batch normalisation of the source paper | [Ravanelli, Brakel, Omologo and Bengio (2018)](#ref-RBOB2018a) |
| **LightRU** | Candidate reads the input only, so the gate alone sees the state | [Ye, Zhang, Liu, Li, Chang and Zheng (2024)](#ref-YZLLC...2024a) |
| **UGRNN** | One update gate between the state and a candidate | [Collins, Sohl-Dickstein and Sussillo (2016)](#ref-CSS2016a) |
| **MinimalRNN** | Encodes the input with `tanh`, then one gate mixes it with the state | [Chen (2017)](#ref-Che2017a) |
| **SGRN** | One gate f and its complement 1 - f, inside a `tanh` | [Zu and Wei (2020)](#ref-ZW2020a) |

## Which Recurrent Cells Use Typed or Additive Updates

**TRNN** and **TGRU** come from the strongly typed networks of [Balduzzi and Ghifary (2016)](#ref-BG2016a). In **TRNN**, gate and candidate depend on x(t) alone, giving h(t) = f h(t-1) + (1 - f) z(t). **TGRU** uses more terms and a time-lagged input in its gates.

**RAN**, from [Lee, Levy and Zettlemoyer (2017)](#ref-LLZ2017a), builds its memory as a gated sum of a linear content term and the old memory, then passes that memory through `tanh` to give h(t).

**ATR**, from [Zhang, Xiong, Su, Lin and Zhang (2018)](#ref-ZXSLZ2018a), computes p from the input and q from the state. Its gates are sigmoids of p + q and p - q, which saves the weights of separate gates.

## Which Recurrent Cells Have Fixed Coefficients

**MiRU1** and **MiRU2** come from the Minion gated recurrent unit of [Zyarah and Kudithipudi (2025)](#ref-ZK2025a), written for continual learning.

| Cell | Learned gate | Fixed values |
|---|---|---|
| **MiRU1** | A reset gate r on the state inside the candidate | Update coefficient of 0.5 |
| **MiRU2** | None | Reset coefficient of 0.5 and update coefficient of 0.5 |

In both cells, the fixed update coefficient sets how fast the state moves towards the candidate, so that memory fades at a rate that training cannot change. The panel leaves those values at the defaults and offers the cells only in **Flux**.

## Which Recurrent Cells Came from an Architecture Search

**NAS** comes from the reinforcement-learning search of [Zoph and Le (2016)](#ref-ZL2016a), and has six intermediate terms that combine sigmoid, ReLU and `tanh` activations, including one product of input and state projections. Because a search chooses wiring for its own benchmark, nothing guarantees that the wiring suits other data.

**MUT1**, **MUT2** and **MUT3** are mutated gated cells from an evolutionary search over architectures. Each has an update gate z and a reset gate r, and they differ in which of the input and the state feed those gates. Their source is listed by the package.

## Which Recurrent Cells Target Depth

| Cell | Design | Source |
|---|---|---|
| **IntersectionRNN** | Separate gates for the state and the output path; needs **input_size** equal to **hidden_size** | [Collins, Sohl-Dickstein and Sussillo (2016)](#ref-CSS2016a) |
| **RHN** | Several highway layers within one time step, by default 3 | [Zilly, Srivastava, Koutnik and Schmidhuber (2016)](#ref-ZSKS2016a) |
| **IndRNN** | Each unit recurs only on itself, with weights element by element | [Li, Li, Cook, Zhu and Gao (2018)](#ref-LLCZG2018a) |
| **STAR** | State is `tanh` of a gated sum, for very deep stacks | [Turkoglu, D'Aronco, Wegner and Schindler (2019)](#ref-TDWS2019a) |

The panel trains a single layer, so depth-oriented benefits of **IndRNN** and **STAR** are not tested by it.

## Which Recurrent Cells Follow Stable Dynamics

| Cell | Dynamics | Source |
|---|---|---|
| **coRNN** | A network of second-order oscillators with step dt, damping and frequency | [Rusch and Mishra (2020)](#ref-RM2020a) |
| **UnICORNN** | Independent undamped oscillators | [Rusch and Mishra (2021)](#ref-RM2021a) |
| **LEM** | Two learned time scales acting on two states | [Rusch, Mishra, Erichson and Mahoney (2021)](#ref-RMEM2021a) |
| **AntisymmetricRNN** | Euler step with a recurrent matrix W minus its transpose, minus gamma times the identity | [Chang, Chen, Haber and Chi (2019)](#ref-CCHC2019a) |
| **GatedAntisymmetricRNN** | The same step, with a gate on the update | Same source |

These cells rely on constants such as dt, and the source papers often tune them. **coRNN** and **UnICORNN** have different dt defaults in the two tabs.

## Which Recurrent Cells Have Slow or Bistable Memory

| Cell | Mechanism | Source |
|---|---|---|
| **SCRN** | A context s(t) = (1 - alpha) W x(t) + alpha s(t-1), with alpha starting at 0.0 | [Mikolov, Joulin, Chopra, Mathieu and Ranzato (2014)](#ref-MJCMR2014a) |
| **CFN** | h(t) = theta tanh(h(t-1)) + eta tanh(W x(t)), with two gates | [Laurent and von Brecht (2016)](#ref-LB2016a) |
| **FastRNN** | h(t) = sigmoid(alpha) times candidate + sigmoid(beta) times h(t-1), with two learned scalars | [Kusupati, Singh, Bhatia, Kumar, Jain and Varma (2019)](#ref-KSBKJ...2019a) |
| **FastGRNN** | **FastRNN** with a gate; the package has no low-rank or quantised weights | Same source |
| **BR** | Each neuron can hold two stable values, through its own feedback | [Vecoven, Ernst and Drion (2021)](#ref-VED2021a) |
| **NBR** | **BR** with full recurrent matrices that alter the neuron's behaviour | Same source |

## What the Recurrent Cell Catalogue Leaves Out

The RecurrentLayers.jl package has more than the panel lists. Five further cell types, **DSGU**, **MCLSTM**, **ResLSTM**, **SGU** and **TauGRU**, have no entry in **Recurrent Cell**. Its wrappers `StackedRNN`, `Multiplicative` and `FastSlow` are not used either, so the panel cannot stack layers. Keywords such as `independent_recurrence` and `integration_mode` are also left at their defaults. To use any of these, edit the generated code by hand, keeping to the constructor of the package. Stacking is available directly through the **num_layers** input of the Recurrent Neural Networks panel, for its standard cells.

## References

<a id="ref-BG2016a"></a>Balduzzi, D. and Ghifary, M. (2016). Strongly-typed recurrent neural networks. arXiv:1602.02218. [doi:10.48550/arXiv.1602.02218](https://doi.org/10.48550/arXiv.1602.02218)

<a id="ref-CCHC2019a"></a>Chang, B., Chen, M., Haber, E. and Chi, E. H. (2019). AntisymmetricRNN: a dynamical system view on recurrent neural networks. arXiv:1902.09689. [doi:10.48550/arXiv.1902.09689](https://doi.org/10.48550/arXiv.1902.09689)

<a id="ref-Che2017a"></a>Chen, M. (2017). MinimalRNN: toward more interpretable and trainable recurrent neural networks. arXiv:1711.06788. [doi:10.48550/arXiv.1711.06788](https://doi.org/10.48550/arXiv.1711.06788)

<a id="ref-CSS2016a"></a>Collins, J., Sohl-Dickstein, J. and Sussillo, D. (2016). Capacity and trainability in recurrent neural networks. arXiv:1611.09913. [doi:10.48550/arXiv.1611.09913](https://doi.org/10.48550/arXiv.1611.09913)

<a id="ref-HS1997a"></a>Hochreiter, S. and Schmidhuber, J. (1997). Long short-term memory. *Neural Computation* 9(8), 1735–1780. [doi:10.1162/neco.1997.9.8.1735](https://doi.org/10.1162/neco.1997.9.8.1735)

<a id="ref-KLMR2016a"></a>Krause, B., Lu, L., Murray, I. and Renals, S. (2016). Multiplicative LSTM for sequence modelling. arXiv:1609.07959. [doi:10.48550/arXiv.1609.07959](https://doi.org/10.48550/arXiv.1609.07959)

<a id="ref-KSBKJ...2019a"></a>Kusupati, A., Singh, M., Bhatia, K., Kumar, A., Jain, P. and Varma, M. (2019). FastGRNN: a fast, accurate, stable and tiny kilobyte sized gated recurrent neural network. arXiv:1901.02358. [doi:10.48550/arXiv.1901.02358](https://doi.org/10.48550/arXiv.1901.02358)

<a id="ref-LBCC2021a"></a>Landi, F., Baraldi, L., Cornia, M. and Cucchiara, R. (2021). Working memory connections for LSTM. *Neural Networks* 144, 334–341. [doi:10.1016/j.neunet.2021.08.030](https://doi.org/10.1016/j.neunet.2021.08.030)

<a id="ref-LB2016a"></a>Laurent, T. and von Brecht, J. (2016). A recurrent neural network without chaos. arXiv:1612.06212. [doi:10.48550/arXiv.1612.06212](https://doi.org/10.48550/arXiv.1612.06212)

<a id="ref-LLZ2017a"></a>Lee, K., Levy, O. and Zettlemoyer, L. (2017). Recurrent additive networks. arXiv:1705.07393. [doi:10.48550/arXiv.1705.07393](https://doi.org/10.48550/arXiv.1705.07393)

<a id="ref-LLCZG2018a"></a>Li, S., Li, W., Cook, C., Zhu, C. and Gao, Y. (2018). Independently recurrent neural network (IndRNN): building a longer and deeper RNN. arXiv:1803.04831. [doi:10.48550/arXiv.1803.04831](https://doi.org/10.48550/arXiv.1803.04831)

<a id="ref-MJCMR2014a"></a>Mikolov, T., Joulin, A., Chopra, S., Mathieu, M. and Ranzato, M. (2014). Learning longer memory in recurrent neural networks. arXiv:1412.7753. [doi:10.48550/arXiv.1412.7753](https://doi.org/10.48550/arXiv.1412.7753)

<a id="ref-RBOB2018a"></a>Ravanelli, M., Brakel, P., Omologo, M. and Bengio, Y. (2018). Light gated recurrent units for speech recognition. *IEEE Transactions on Emerging Topics in Computational Intelligence* 2(2), 92–102. [doi:10.1109/TETCI.2017.2762739](https://doi.org/10.1109/TETCI.2017.2762739)

<a id="ref-RM2020a"></a>Rusch, T. K. and Mishra, S. (2020). Coupled oscillatory recurrent neural network (coRNN): an accurate and (gradient) stable architecture for learning long time dependencies. arXiv:2010.00951. [doi:10.48550/arXiv.2010.00951](https://doi.org/10.48550/arXiv.2010.00951)

<a id="ref-RM2021a"></a>Rusch, T. K. and Mishra, S. (2021). UnICORNN: a recurrent model for learning very long time dependencies. arXiv:2103.05487. [doi:10.48550/arXiv.2103.05487](https://doi.org/10.48550/arXiv.2103.05487)

<a id="ref-RMEM2021a"></a>Rusch, T. K., Mishra, S., Erichson, N. B. and Mahoney, M. W. (2021). Long expressive memory for sequence modeling. arXiv:2110.04744. [doi:10.48550/arXiv.2110.04744](https://doi.org/10.48550/arXiv.2110.04744)

<a id="ref-TDWS2019a"></a>Turkoglu, M. O., D'Aronco, S., Wegner, J. D. and Schindler, K. (2019). Gating revisited: deep multi-layer RNNs that can be trained. arXiv:1911.11033. [doi:10.48550/arXiv.1911.11033](https://doi.org/10.48550/arXiv.1911.11033)

<a id="ref-WL2018a"></a>van der Westhuizen, J. and Lasenby, J. (2018). The unreasonable effectiveness of the forget gate. arXiv:1804.04849. [doi:10.48550/arXiv.1804.04849](https://doi.org/10.48550/arXiv.1804.04849)

<a id="ref-VED2021a"></a>Vecoven, N., Ernst, D. and Drion, G. (2021). A bio-inspired bistable recurrent cell allows for long-lasting memory. *PLOS ONE* 16(6), e0252676. [doi:10.1371/journal.pone.0252676](https://doi.org/10.1371/journal.pone.0252676)

<a id="ref-YZLLC...2024a"></a>Ye, H., Zhang, Y., Liu, H., Li, X., Chang, J. and Zheng, H. (2024). Light recurrent unit: towards an interpretable recurrent neural network for modeling long-range dependency. *Electronics* 13(16), 3204. [doi:10.3390/electronics13163204](https://doi.org/10.3390/electronics13163204)

<a id="ref-ZXSLZ2018a"></a>Zhang, B., Xiong, D., Su, J., Lin, Q. and Zhang, H. (2018). Simplifying neural machine translation with addition-subtraction twin-gated recurrent networks. arXiv:1810.12546. [doi:10.48550/arXiv.1810.12546](https://doi.org/10.48550/arXiv.1810.12546)

<a id="ref-ZWZZ2016a"></a>Zhou, G.-B., Wu, J., Zhang, C.-L. and Zhou, Z.-H. (2016). Minimal gated unit for recurrent neural networks. arXiv:1603.09420. [doi:10.48550/arXiv.1603.09420](https://doi.org/10.48550/arXiv.1603.09420)

<a id="ref-ZSKS2016a"></a>Zilly, J. G., Srivastava, R. K., Koutnik, J. and Schmidhuber, J. (2016). Recurrent highway networks. arXiv:1607.03474. [doi:10.48550/arXiv.1607.03474](https://doi.org/10.48550/arXiv.1607.03474)

<a id="ref-ZL2016a"></a>Zoph, B. and Le, Q. V. (2016). Neural architecture search with reinforcement learning. arXiv:1611.01578. [doi:10.48550/arXiv.1611.01578](https://doi.org/10.48550/arXiv.1611.01578)

<a id="ref-ZW2020a"></a>Zu, X. and Wei, K. (2020). A simple gated recurrent network for detection of power quality disturbances. *IET Generation, Transmission & Distribution* 15(4), 751–761. [doi:10.1049/gtd2.12056](https://doi.org/10.1049/gtd2.12056)

<a id="ref-ZK2025a"></a>Zyarah, A. M. and Kudithipudi, D. (2025). Minion gated recurrent unit for continual learning. arXiv:2503.06175. [doi:10.48550/arXiv.2503.06175](https://doi.org/10.48550/arXiv.2503.06175)

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Flux vs Lux](flux-vs-lux.md)
