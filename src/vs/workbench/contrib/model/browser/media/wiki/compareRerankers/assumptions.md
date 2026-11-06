# Assumptions

## One Right Passage for Each Question of a Reranking Run
Evaluate Reranking Models counts a reranking as right when the passage the question was made from is among those Ask Pollis gives. A reranker may put first another passage that answers the question just as well, and that counts as a miss. **Found** therefore understates how often the passages given can answer, and it can penalise a reranker that prefers a good passage the test set does not name. Reading the passages of the questions where the rerankers disagree shows whether that happened.

## A Reranker Works Only on the Passages Found
The rerankers all reorder the same passages, found once for each question by words and meaning. A passage the search did not find cannot be given by any reranker, and the line above **Results** says for how many questions the passage was found at all: that share is the ceiling of every reranker's Found. When it is low, the embedding model or the questions are the limit, and Evaluate Embedding Models is the page to use.

## Questions Made From a Passage Favour the Search
A question written from a passage tends to repeat its words, so the search by words often puts that passage near the top already. **No Reranker** then does well, and the gain of a reranker looks small. Questions of your own, asked as a reader would ask them, give a reranker more to do and are a fairer test of it. The Panel FAQ test set, whose answers come from the wikis rather than single passages, is another check.

## Pollis' Documents Stand In for Your Collections
A run reorders passages of the index of Ask Pollis: the documents, wikis and vignettes of this Pollis. A reranker that does well there may do less well on a collection of another kind in Retrieval-Augmented Generation, whose passages are longer, shorter or in another language. A reranker's reputation elsewhere is a reason to try it here, not a result for your documents.

## Speed and Memory of a Reranker Depend on the Computer
**Reranking, ms** and **Memory** hold for this computer at the time of the run. A reranker scores every passage found for a question, so its time grows with their number and length. **Memory** is the memory free before the reranker's server started, less the memory free when it was done, and another program starting or stopping during the run changes it. The rerankers are compared fairly only when the computer is doing about the same during each.

## See Also
- [Interpretation](interpretation.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
