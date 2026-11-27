# Training Corpora

The Training Corpora page, in Explore > Transcription > Browse Training Corpora..., lists corpora of manuscripts with their transcriptions made by hand, on which models of automatic transcription are trained and tested. Each corpus opens at its source, from which it is downloaded.

## What a Training Corpus for Automatic Transcription Holds

A training corpus for automatic transcription, its ground truth, holds page images with their layout and the text of each line, transcribed by hand. The layout gives each text line as a baseline and a boundary polygon, usually in ALTO or PAGE XML files beside the images. A recognition model learns from the line images cut out along those shapes and the text of each line; a layout model learns from the pages and their baselines and regions. A corpus is useful for training when all its lines are transcribed under the same guidelines, so that the same sign is always written down in the same way.

## The Corpora on the Training Corpora Page

| Corpus | Source | Transcription | Licence |
|---|---|---|---|
| **CATMuS Medieval** | Hugging Face | Graphematic, under the CATMuS guidelines | CC BY 4.0 |
| **ICDAR 2026 Competition Test Set** | Zenodo | Graphematic, under the CATMuS guidelines | CC BY 4.0 |
| **TRIDIS** | Hugging Face | Semi-diplomatic: abbreviations expanded | MIT |
| **PERO Layout Dataset** | Zenodo | Layout of the pages | CC BY 4.0 |

## The Test Set of the ICDAR 2026 Competition on Multilingual Medieval Handwriting Recognition

The ICDAR 2026 Competition on Multilingual Medieval Handwriting Recognition (CMMHWR26) tests how well models of automatic transcription read manuscripts in languages they were and were not trained on, in three tasks ([Clérice and Kiessling (2026)](#ref-CK2026a)). Task 1 tests manuscripts in eight Romance languages, the languages of the competition's training set: Castilian, Catalan, French, Galician, Italian, Latin, Navarrese and Venetian. Task 2 tests manuscripts in Occitan, a Romance language absent from the training set. Task 3 tests manuscripts in Czech, a language of another family, in hands like those of the training set. The test set was first published without its transcriptions, for the competition, and then with them, so that any model can be scored on it.

## The TRIDIS Corpus of Documentary Manuscripts

TRIDIS (Tria Digita Scribunt) gathers about 4,000 pages of documentary manuscripts, such as registers, charters, proceedings and accounts, mainly from Spain, France and Germany, from the 12th to the 17th century, in Latin, French, Spanish, German and Dutch ([Torres Aguilar (2025)](#ref-Tor2025a)). It joins several older corpora, each under an open licence, and transcribes them semi-diplomatically: abbreviations are expanded, and punctuation and letter forms are normalised. Its test sets are chosen to be unlike its training pages, so that they measure how a model reads documents it has not met.

## The PERO Layout Dataset for Layout Analysis

The PERO layout dataset holds pages of historical documents with their layout, for training and testing layout analysis: the finding of text lines and regions on a page, which comes before line recognition ([Kodym and Hradiš (2021)](#ref-KH2021b)). It was published with the PERO layout analysis system, which predicts with each baseline the height of its line and the boundaries of the text blocks.

## Which Transcription Guidelines a Model Learns from Its Corpus

A model writes text as its training corpus was transcribed. Trained on CATMuS Medieval, whose transcriptions are graphematic, it keeps abbreviations as written, each mark of abbreviation a character of its own ([Clérice and 17 coauthors (2024)](#ref-CPVCC...2024a)). Trained on TRIDIS, whose transcriptions are semi-diplomatic, it expands abbreviations and normalises letter forms. Corpora under different guidelines are therefore not simply added together: their transcriptions are first brought to the same guidelines, or the model is trained on them in stages, the corpus under the guidelines wanted coming last, as MEDUSA is trained ([Moins and 10 coauthors (2026)](#ref-MHCCC...2026a)). A model is compared with another only on a test set transcribed under the guidelines both follow.

## References

<a id="ref-CPVCC...2024a"></a>Clérice, T., Pinche, A., Vlachou-Efstathiou, M., Chagué, A., Camps, J.-B., Gille Levenson, M., Brisville-Fertin, O., Boschetti, F., Fischer, F., Gervers, M., Boutreux, A., Manton, A., Gabay, S., O'Connor, P., Haverals, W., Kestemont, M., Vandyck, C. and Kiessling, B. (2024). CATMuS Medieval: A Multilingual Large-Scale Cross-Century Dataset in Latin Script for Handwritten Text Recognition and Beyond. In *Document Analysis and Recognition - ICDAR 2024*, Lecture Notes in Computer Science, 174–194. Springer Nature Switzerland. [doi:10.1007/978-3-031-70543-4_11](https://doi.org/10.1007/978-3-031-70543-4_11)

<a id="ref-CK2026a"></a>Clérice, T. and Kiessling, B. (2026). ICDAR 2026 Competition on Multilingual Medieval Handwriting Recognition. Test set with its transcriptions, CC BY 4.0. Zenodo. [doi:10.5281/zenodo.19884972](https://doi.org/10.5281/zenodo.19884972)

<a id="ref-KH2021b"></a>Kodym, O. and Hradiš, M. (2021). PERO layout dataset. Dataset, CC BY 4.0. Zenodo. [doi:10.5281/zenodo.19184850](https://doi.org/10.5281/zenodo.19184850)

<a id="ref-MHCCC...2026a"></a>Moins, T., Hensley, B., Cafiero, F., Camps, J.-B., Conte, L., Guidi, É., Kapitan, K. A., Macedo, C., Peratello, P., Vermaas, C. and Vidal-Gorène, C. (2026). MEDUSA: A Curriculum-Based Vision-Language Framework for Multilingual Medieval Handwritten Text Recognition. In *8th International Workshop on Historical Document Imaging and Processing (HIP’26)*, Wien. [hal-05744493](https://enc.hal.science/hal-05744493)

<a id="ref-Tor2025a"></a>Torres Aguilar, S. (2025). TRIDIS: A Comprehensive Medieval and Early Modern Corpus for HTR and NER. arXiv:2503.22714. [doi:10.48550/arXiv.2503.22714](https://doi.org/10.48550/arXiv.2503.22714)

## See Also
- [Overview](overview.md)
- [Factsheet](factsheet.md)
