# Replications — Overview

## What Reproducing a Published Analysis Means
Terms differ between fields. The National Academies' report separates the two meanings: reproducibility is obtaining the same results from the same data and code, and replicability is reaching consistent results with new data ([National Academies of Sciences, Engineering, and Medicine (2019)](#ref-NASEM2019a)). [Goodman, Fanelli and Ioannidis (2016)](#ref-GFI2016a) take apart the same words further, into reproducing the methods, the results and the inferences. In these terms the notebooks listed under Replications are reproductions: same public data, a different language.

## Why Reproducing Published Economics Results Is Worth Doing
Attempts to reproduce published results have a long and sobering record in economics. The project of [Dewald, Thursby and Anderson (1986)](#ref-DTA1986a) found errors common in the empirical articles of one journal, and [McCullough, McGeary and Harrison (2006)](#ref-MMH2006a) returned to that journal's archive twenty years later and could reproduce few of the articles. [Chang and Li (2022)](#ref-CL2022a) managed under half of the papers they attempted, even with help from the authors. A well-known spreadsheet error came to light when [Herndon, Ash and Pollin (2014)](#ref-HAP2014a) reproduced a widely cited result on public debt and growth. [Vilhuber (2020)](#ref-Vil2020a) reviews how the field and its journals have responded, with requirements to deposit data and code.

## How to Read a Replication Notebook's Comparisons
Each replication prints the published value beside Julia's. A small difference may come only from rounding in the article, a different optimiser's stopping point or a different default in the software. A large difference deserves a closer look: the data may have been revised since publication, or the article may describe its method differently from what its authors ran. Differences a notebook cannot explain are left visible rather than adjusted away.

## How Often Published Results Replicate With New Data
Replication with new data sets a harder test than the reproductions listed under Replications. The [Open Science Collaboration (2015)](#ref-OSC2015a) repeated 100 studies in psychology: 97% of the originals had significant results and 36% of the replications, with effects half the size. [Camerer, Dreber, Forsell, Ho, Huber, Johannesson, Kirchler, Almenberg, Altmejd, Chan, Heikensten, Holzmeister, Imai, Isaksson, Nave, Pfeiffer, Razen and Wu (2016)](#ref-CDFHH...2016a) repeated 18 economics experiments from the American Economic Review and the Quarterly Journal of Economics of 2011 to 2014: 11 (61%) were significant in the same direction, with an effect size of 66% of the original on average. [Ioannidis (2005)](#ref-Ioa2005a) shows why this should be expected, as a finding is less likely to be true where studies are small, effects small and designs flexible.

## What Economists Propose for More Credible Research
[Hamermesh (2007)](#ref-Ham2007a) separates pure replication, checking published papers with their own data, from scientific replication, with data on different populations, and observes that most economists applaud the activity and few perform it. [Christensen and Miguel (2018)](#ref-CM2018a) survey publication bias and specification searching in economics, and the remedies now in use, among them pre-analysis plans and open data. A replication notebook serves the same end in a small way: the code, the data and the published values stand side by side for anyone to run.

## Why Statistical Software Can Disagree in a Replication Notebook
A difference from a published value is not always in the article or the data. [McCullough and Vinod (1999)](#ref-MV1999a) show serious flaws in some econometric packages and warn that users cannot safely assume their software is accurate. [McCullough and Vinod (2003)](#ref-MV2003a) open with a probit example in which five packages declared convergence to five solutions differing in the sixth coefficient, its estimates ranging from 4.4 to 8.1. Their remedy is to verify a solution from a nonlinear solver, not to trust the declaration of convergence, which applies to Julia's solvers as to any others.

## References

<a id="ref-CDFHH...2016a"></a>Camerer, C. F., Dreber, A., Forsell, E., Ho, T.-H., Huber, J., Johannesson, M., Kirchler, M., Almenberg, J., Altmejd, A., Chan, T., Heikensten, E., Holzmeister, F., Imai, T., Isaksson, S., Nave, G., Pfeiffer, T., Razen, M. and Wu, H. (2016). Evaluating replicability of laboratory experiments in economics. *Science* 351(6280), 1433–1436. [doi:10.1126/science.aaf0918](https://doi.org/10.1126/science.aaf0918)

<a id="ref-CL2022a"></a>Chang, A. C. and Li, P. (2022). Is economics research replicable? Sixty published papers from thirteen journals say “often not”. *Critical Finance Review* 11(1), 185–206. [doi:10.1561/104.00000053](https://doi.org/10.1561/104.00000053)

<a id="ref-CM2018a"></a>Christensen, G. and Miguel, E. (2018). Transparency, reproducibility, and the credibility of economics research. *Journal of Economic Literature* 56(3), 920–980. [doi:10.1257/jel.20171350](https://doi.org/10.1257/jel.20171350)

<a id="ref-DTA1986a"></a>Dewald, W. G., Thursby, J. G. and Anderson, R. G. (1986). Replication in empirical economics: the Journal of Money, Credit and Banking project. *American Economic Review* 76(4), 587–603. [ideas.repec.org/a/aea/aecrev/v76y1986i4p587-603.html](https://ideas.repec.org/a/aea/aecrev/v76y1986i4p587-603.html)

<a id="ref-GFI2016a"></a>Goodman, S. N., Fanelli, D. and Ioannidis, J. P. A. (2016). What does research reproducibility mean? *Science Translational Medicine* 8(341), 341ps12. [doi:10.1126/scitranslmed.aaf5027](https://doi.org/10.1126/scitranslmed.aaf5027)

<a id="ref-Ham2007a"></a>Hamermesh, D. S. (2007). Viewpoint: replication in economics. *Canadian Journal of Economics/Revue canadienne d'économique* 40(3), 715–733. [doi:10.1111/j.1365-2966.2007.00428.x](https://doi.org/10.1111/j.1365-2966.2007.00428.x)

<a id="ref-HAP2014a"></a>Herndon, T., Ash, M. and Pollin, R. (2014). Does high public debt consistently stifle economic growth? A critique of Reinhart and Rogoff. *Cambridge Journal of Economics* 38(2), 257–279. [doi:10.1093/cje/bet075](https://doi.org/10.1093/cje/bet075)

<a id="ref-Ioa2005a"></a>Ioannidis, J. P. A. (2005). Why most published research findings are false. *PLoS Medicine* 2(8), e124. [doi:10.1371/journal.pmed.0020124](https://doi.org/10.1371/journal.pmed.0020124)

<a id="ref-MV1999a"></a>McCullough, B. D. and Vinod, H. D. (1999). The numerical reliability of econometric software. *Journal of Economic Literature* 37(2), 633–665. [doi:10.1257/jel.37.2.633](https://doi.org/10.1257/jel.37.2.633)

<a id="ref-MV2003a"></a>McCullough, B. D. and Vinod, H. D. (2003). Verifying the solution from a nonlinear solver: a case study. *American Economic Review* 93(3), 873–892. [doi:10.1257/000282803322157133](https://doi.org/10.1257/000282803322157133)

<a id="ref-MMH2006a"></a>McCullough, B. D., McGeary, K. A. and Harrison, T. D. (2006). Lessons from the JMCB archive. *Journal of Money, Credit, and Banking* 38(4), 1093–1107. [doi:10.1353/mcb.2006.0061](https://doi.org/10.1353/mcb.2006.0061)

<a id="ref-NASEM2019a"></a>National Academies of Sciences, Engineering, and Medicine (2019). *Reproducibility and replicability in science*. National Academies Press. [doi:10.17226/25303](https://doi.org/10.17226/25303)

<a id="ref-OSC2015a"></a>Open Science Collaboration (2015). Estimating the reproducibility of psychological science. *Science* 349(6251), aac4716. [doi:10.1126/science.aac4716](https://doi.org/10.1126/science.aac4716)

<a id="ref-Vil2020a"></a>Vilhuber, L. (2020). Reproducibility and replicability in economics. *Harvard Data Science Review* 2(4). [doi:10.1162/99608f92.4f6b9e67](https://doi.org/10.1162/99608f92.4f6b9e67)

## See Also
- [Factsheet](factsheet.md) · [Copies and Updates](copies-and-updates.md)
