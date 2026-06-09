# Interpretation

## Network
Read **connectivity first, position second** — proximity in a force-directed layout *suggests* relatedness but the absolute coordinates are arbitrary. Look for hubs (highly connected), bridges (connect otherwise separate groups), and communities (dense clusters). Node size/colour usually encodes a metric such as degree or centrality; the legend tells you which.

## Tree
A tree reads top-down: the **root** is the origin, **depth** is distance from it, and each node's **children** are its direct descendants. Use it to trace a path (root → leaf), compare subtree sizes, and spot where the hierarchy branches widely or runs deep.

## Choropleth
**Colour is the value** — consult the colour bar. The key cautions: large regions visually outweigh small ones regardless of value, and the **classification** (how values map to colours: equal-interval, quantile, etc.) changes the story, so state it. For counts, prefer a **rate** (per capita / per area) or the map mostly shows population, not the variable of interest.

## Caveat
All three encode *structure*, which the eye reads approximately. They are superb for revealing pattern and exception, weaker for exact values — annotate or pair with a table when precise numbers matter.
