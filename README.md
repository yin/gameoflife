Game of Life
============

This is a JavaScript engine allowing for fast simulation of Conway's Game of Life
in an infinite grid.

Implementation
==============

To allow for the infinite number of cells, several possible
solutions are available. I choosed to divide the canvas into same-sized blocks
and index them in a pattern, so they can be referenced from a hashmap-like
storage structure.

The current pattern divides the grid along kinda diagonal lines starting from
the center of the grid. You can see the layout diagram in the JavaScript source.

Next steps
==========
1. Change current pattern, so it's easier to draw and compute with it.
2. Implement next frame generator (fun part)
3. Render to canvas. Here a strategy for generating the geometry outside of
   JavaScript should be found, as this is very slow. The vertex/index arrays
   need to be updated for every frame, possibly moving elements. We should
   be able to go around with just updating the index array every frame.
