# Factsheet

The Transcription page reads manuscript pages with MedievalATR.jl, a Julia package for automatic text recognition that reads the recognition models of Kraken.

## The Recognition Model CATMuS Medieval 1.6.2

| Item | CATMuS Medieval 1.6.2 |
|---|---|
| **Authors** | Pinche, Clérice and 12 coauthors ([2026](#ref-PCVCC...2026a)) |
| **Published on** | Zenodo, [doi:10.5281/zenodo.21488839](https://doi.org/10.5281/zenodo.21488839) |
| **Licence** | Creative Commons Attribution 4.0 (CC BY 4.0) |
| **Kind of model** | Kraken recognition model, a file of 16 MB (`catmus-medieval-1.6.0.mlmodel`) |
| **Languages of its training data** | Old and Middle French, Latin, Spanish and other languages of Spain, Italian |
| **Transcription** | Graphematic: abbreviations not expanded, each diacritic a character of its own (NFD) |
| **Input** | A line image in grey, scaled to 120 pixels high |
| **Network** | Four convolutions, three bidirectional LSTM layers of 200 units, 252 outputs |
| **Downloaded to** | MedievalATR.jl's scratch space in the Julia depot, once, checked by its SHA-256 checksum |

## The CATMuS Medieval Dataset

The CATMuS Medieval model is trained on the CATMuS Medieval dataset, described by Clérice and 17 coauthors ([2024](#ref-CPVCC...2024a)). The dataset brings together the transcriptions of more than 200 manuscripts and incunabula in 10 languages, from the 8th to the 16th century, more than 160,000 lines of text and 5 million characters. Every transcription follows the same guidelines, so that the dataset can serve as a benchmark of automatic text recognition across centuries, languages, genres and scripts, and for other tasks such as the classification of scripts and the dating of manuscripts.

## The Files the Transcription Page Reads and Writes

| File | Read or Written | Content |
|---|---|---|
| **Page file** (`.xml`) | Read | ALTO or PAGE XML: the image file name and the text lines, each with its baseline and boundary polygon |
| **Page image** | Read | JPEG, PNG or TIFF, at the path the page file gives, relative to its folder, or next to it |
| **Model file** (`.mlmodel`) | Read | A Kraken recognition model, CATMuS Medieval 1.6.2 or a model of the user's own |
| **Results file** (`.transcription.json`) | Written | Next to the page file: the image and, for each line, its id, baseline, polygon, the text read and the page file's own transcription |

## Key Functions of MedievalATR.jl

| Function | Task |
|---|---|
| `load_model(:catmus_medieval)` | The CATMuS Medieval model, downloaded the first time |
| `load_model(path)` | A Kraken recognition model from its `.mlmodel` file |
| `read_page(path)` | The image and text lines of an ALTO or PAGE file |
| `recognize(model, page)` | The text of each line, read on Julia's threads |
| `write_predictions(path, page, predictions)` | The results file of the Text step |
| `cut_line(image, baseline, boundary)` | The image of one line, straightened along its baseline |

## References

<a id="ref-CPVCC...2024a"></a>Clérice, T., Pinche, A., Vlachou-Efstathiou, M., Chagué, A., Camps, J.-B., Gille Levenson, M., Brisville-Fertin, O., Boschetti, F., Fischer, F., Gervers, M., Boutreux, A., Manton, A., Gabay, S., O'Connor, P., Haverals, W., Kestemont, M., Vandyck, C. and Kiessling, B. (2024). CATMuS Medieval: A Multilingual Large-Scale Cross-Century Dataset in Latin Script for Handwritten Text Recognition and Beyond. In *Document Analysis and Recognition - ICDAR 2024*, Lecture Notes in Computer Science, 174–194. Springer Nature Switzerland. [doi:10.1007/978-3-031-70543-4_11](https://doi.org/10.1007/978-3-031-70543-4_11)

<a id="ref-PCVCC...2026a"></a>Pinche, A., Clérice, T., Vlachou-Efstathiou, M., Chagué, A., Camps, J.-B., Gille Levenson, M., Brisville-Fertin, O., Boschetti, F., Fischer, F., Gervers, M., Boutreux, A., Manton, A., Gabay, S. and Ferrante, G. (2026). CATMuS Medieval 1.6.2. Kraken recognition model, CC BY 4.0. Zenodo. [doi:10.5281/zenodo.21488839](https://doi.org/10.5281/zenodo.21488839)

## See Also
- [Overview](overview.md)
- [Training Corpora](training-corpora.md)
