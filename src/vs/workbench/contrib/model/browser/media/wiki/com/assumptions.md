# Assumptions

Counting has no fitted model, yet every result relies on assumptions about language and about the text. Most of them fail to some degree, and the question is how much that matters for the use in hand.

## What the Distributional Assumption Claims

Similar contexts are taken to mean similar words. [Harris (1954)](#ref-Har1954a) put this as a claim about language structure. Used that way, the method measures use, and that is only partly meaning. Antonyms such as "hot" and "cold" share contexts, and so look similar. Words from one topic look related, whether or not they mean the same thing. Word vectors therefore reflect how a word is used in this text, including any social bias in the text.

## What the Bag of Contexts Ignores

A window treats context as an unordered bag. Word order, syntax and negation are all lost, so "the dog chased the cat" and "the cat chased the dog" give the same counts. Distance is ignored too, unless **Distance Weighting** is on. Sentence-level meaning cannot be recovered from these counts. A method with order or syntax in its contexts can capture more, at a higher cost. For many similarity tasks, the simple form is good enough.

## What One Vector per Word Assumes

Each word string gets one row, so that different senses share it. The corpus has "bank" in a financial and a river sense, and the row blends both, in proportion to how often each occurs. Case folding merges further: a name and a common noun become one. Neighbours of a word with several senses therefore reflect the most common one. Splitting senses requires another method, and treating each row as a single meaning is the assumption being made.

## What PMI Estimates Assume

PMI uses plain observed frequencies as probabilities. That works when counts are large, and fails when they are small. A pair seen twice in a tiny corpus has a value with wide uncertainty, and the code reports no error bar. Repeated co-occurrences within a document are also treated as independent, although a topic makes them cluster. [Turney and Pantel (2010)](#ref-TP2010a) review weightings and their limits. A significance test of an association would need a test designed for rare events.

## What the Built-In Corpus Assumes

The 26 sentences were written to make the method work: "coffee" and "tea" sit in matched sentences, and so do "cat" and "dog". Good neighbours on that corpus show the machinery working, and they say little about performance on natural text. The tooltip for **Minimum Count** warns about small corpora. Real results typically require millions of tokens. Tests on real text should start with a corpus much larger than this one, and judge results on a word list with known answers.

## What Preprocessing Assumes

Removing stopwords assumes that function words say little about meaning. In many tasks that is reasonable, although a study of style or grammar relies on those very words. Stripping numbers removes years and quantities, and stripping punctuation removes sentence structure inside a document. No stemming means that inflected forms stay separate, which spreads evidence thinly on a small corpus. English-based stopwords do not suit other languages. Any of these choices can change a result, and all should be stated.

## References

<a id="ref-Har1954a"></a>Harris, Z. S. (1954). Distributional structure. *Word* 10(2–3), 146–162. [doi:10.1080/00437956.1954.11659520](https://doi.org/10.1080/00437956.1954.11659520)

<a id="ref-TP2010a"></a>Turney, P. D. and Pantel, P. (2010). From frequency to meaning: vector space models of semantics. *Journal of Artificial Intelligence Research* 37, 141–188. [doi:10.1613/jair.2934](https://doi.org/10.1613/jair.2934)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
