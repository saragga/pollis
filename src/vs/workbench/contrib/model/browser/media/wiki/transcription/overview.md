# Overview

**Transcription** reads the text of a manuscript page with an automatic text recognition model. The page image comes with its layout, an ALTO or PAGE file that gives the baseline and outline of each line of text, and the model reads each line, in the Julia REPL, with MedievalATR.jl.

## What the Transcription Page Does

The Transcription page, in Explore > Transcription, reads a manuscript page in four steps. **Page** chooses the ALTO or PAGE file of the page, which names the page image and gives its text lines. **Model** chooses the recognition model: CATMuS Medieval 1.6.2, downloaded once, or a model file of the user's own. **Transcribe** shows the Julia code that reads every line and sends it to the Julia REPL, which writes the text read to a results file next to the page file. **Text** shows the page image with the outline of each line drawn on it, and the text read on each line beside it. A transcription already in the page file is shown under the text read, so the two can be compared line by line.

## Which Files the Transcription Page Needs

The Transcription page needs two files for each page: the page image, as JPEG, PNG or TIFF, and its layout, as an ALTO or PAGE XML file. The layout file names the image and gives, for each text line, a baseline (the line the letters stand on, as points on the image) and a boundary polygon (the outline of the line). Such files come from transcription platforms such as eScriptorium and Transkribus, from the segmenter of Kraken, and from datasets of manuscripts with their ground truth. A line without a baseline is left out, as Kraken leaves it out, and a line without a boundary polygon is read as empty.

## How a Line Is Read from Its Image

Each line is cut out of the page along its boundary polygon, straightened along its baseline, scaled to the height the model expects and turned into a sequence of columns. The recognition model is a neural network of convolutions and bidirectional long short-term memory layers ([Hochreiter and Schmidhuber (1997)](#ref-HS1997a)) that gives, for each column, the probability of each character and of no character. The text is the most probable character of each column, with repeated characters merged and the empty ones dropped: the greedy decoding of connectionist temporal classification ([Graves, Fernández, Gomez and Schmidhuber (2006)](#ref-GFGS2006a)), the loss such models are trained with.

## How MedievalATR.jl Relates to Kraken

Kraken is an automatic text recognition engine for historical and non-Latin documents, written in Python ([Kiessling (2019)](#ref-Kie2019a), [Kiessling (2025)](#ref-Kie2025a)). MedievalATR.jl reads the model files that Kraken saves and reads each line as Kraken 7.2 reads it, in Julia: the same lines from ALTO and PAGE files, the same line images, cut pixel for pixel as Kraken cuts them, the same network and the same decoding. It needs neither Python nor PyTorch. The text it reads on a line is the text Kraken reads with the same model.

## What a Diplomatic Transcription Is

The text that CATMuS Medieval reads is graphematic, close to a diplomatic transcription: it keeps the letters and signs of the manuscript as they are written, abbreviations unexpanded, rather than an edition's normalised text. An abbreviation mark, such as a tilde or a superscript letter, is a character of its own, written after the letter it stands on (Unicode normalisation form NFD). The guidelines of the CATMuS project say how each sign is transcribed, so that transcriptions of different manuscripts and projects agree ([Clérice and 17 coauthors (2024)](#ref-CPVCC...2024a)).

## References

<a id="ref-CPVCC...2024a"></a>Clérice, T., Pinche, A., Vlachou-Efstathiou, M., Chagué, A., Camps, J.-B., Gille Levenson, M., Brisville-Fertin, O., Boschetti, F., Fischer, F., Gervers, M., Boutreux, A., Manton, A., Gabay, S., O'Connor, P., Haverals, W., Kestemont, M., Vandyck, C. and Kiessling, B. (2024). CATMuS Medieval: A Multilingual Large-Scale Cross-Century Dataset in Latin Script for Handwritten Text Recognition and Beyond. In *Document Analysis and Recognition - ICDAR 2024*, Lecture Notes in Computer Science, 174–194. Springer Nature Switzerland. [doi:10.1007/978-3-031-70543-4_11](https://doi.org/10.1007/978-3-031-70543-4_11)

<a id="ref-GFGS2006a"></a>Graves, A., Fernández, S., Gomez, F. and Schmidhuber, J. (2006). Connectionist Temporal Classification: Labelling Unsegmented Sequence Data with Recurrent Neural Networks. In *Proceedings of the 23rd International Conference on Machine Learning*, 369–376. ACM Press. [doi:10.1145/1143844.1143891](https://doi.org/10.1145/1143844.1143891)

<a id="ref-HS1997a"></a>Hochreiter, S. and Schmidhuber, J. (1997). Long Short-Term Memory. *Neural Computation* 9(8), 1735–1780. [doi:10.1162/neco.1997.9.8.1735](https://doi.org/10.1162/neco.1997.9.8.1735)

<a id="ref-Kie2019a"></a>Kiessling, B. (2019). Kraken - a Universal Text Recognizer for the Humanities. In *Digital Humanities 2019 (DH2019)*, Utrecht. DataverseNL. [doi:10.34894/z9g2ex](https://doi.org/10.34894/z9g2ex)

<a id="ref-Kie2025a"></a>Kiessling, B. (2025). Version 5 of the Kraken ATR Engine for the Humanities. In *Document Analysis and Recognition – ICDAR 2025*, Lecture Notes in Computer Science, 443–458. Springer Nature Switzerland. [doi:10.1007/978-3-032-04624-6_26](https://doi.org/10.1007/978-3-032-04624-6_26)

## See Also
- [Factsheet](factsheet.md)
- [Training Corpora](training-corpora.md)
