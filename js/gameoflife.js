(function(window) {
    var world, engine, view;
    
    console.log('init');
    window._inspect = function(arg) {
	var s = '', a = [];
	for (var n in arg) {
	    var v;
	    try {
		v = arg[n];
	    } catch(err) {
		console.log("error:" + err);
	    }
	    a.push(n + ' = ' + v);
	}
	return a.sort();
    }

    window.test_translateXYtoBlocki = function() {
	var world = new World();
	var a = {};
	var rows = 1
	for (var y = -rows; y <= rows; y++) {
	    for (var x = -rows; x <= rows; x++) {
		a[x + ' ' + y] = 'bi:' + world.translateXYtoBlocki(x, y)
		    + ' q:' + world.calcQuadrant(x, y).quadrant ;
	    }
	}
	return a;
    }

    window.addEventListener("load", function() {
	world = new World();
	engine = new GameOfLife(world)
	view = new CanvasView(world);
    })

    // DONE yin: Translate from XY coordinates into block-index inside an
    //           array-indexed storage 
    // TODO yin: Translate from block-index into XY coordinates on the grid
    // TODO yin: Store actual blocks, iterate over them, make removable
    var World = function() {
	this.translateXYtoBlocki = function(x, y) {
	    // Decide into which quadrant XY coords fall into. Also rotate
	    //  the coords to match 1st quadrant positive half-axes.
	    //  3 3 2 2 2
	    //  3 3 2 2 2
	    //  3 3 0 1 1
	    //  4 4 4 1 1
	    //  4 4 4 1 1
	    var q = this.calcQuadrant(x, y);
	    if (!q.quadrant) return 0;
	    // Compute quadrant local block-index, this is incrementing
	    //  filling-in diagonal rows
	    // 0 1 2 4 7 B
	    //   3 5 8 C
	    //   6 9 D
	    //   A E
	    //   F
	    var row = q.x + q.y;
	    var start = this.calcStartBlocki(row);
	    var offset = q.y;
	    var localBlocki = start + offset;
	    // Now merge in the quadrant information by interleaving indexes of
	    //  all quadrants
	    var blocki = localBlocki * 4 - q.quadrant + 1;
	    return blocki;
	}

	/** returns quadrant (1-4) and XY rotated into position of quadrant 1 **/
	this.calcQuadrant = function(x, y) {
            var r = {};
	    if (x > 0 && y >=0) {
		return {
		    quadrant: 1,
		    x: x,
		    y: y
		}	
	    } else if (x >= 0 && y < 0) {
		return {
		    quadrant: 2,
		    x: -y,
		    y: x
		}
	    } else if (x < 0 && y <= 0) {
		return {
		    quadrant: 3,
		    x: -x,
		    y: -y
		}
	    } else if (x <= 0 && y > 0) {
		return {
		    quadrant: 4,
		    x: -y,
		    y: x
		}
	    } else return {
		quadrant: 0,
		x: 0,
		y: 0
	    }
	}

	/** 
	 * Returns starting block-index in a given row by DP. Not sure, if
	 * there's a direct method for computing start indexes.
	 **/
	this.calcStartBlocki = function(row) {
	    var dp = this.calcStartBlocki.dp;
	    if (row <= 1) {
		return dp[1] = 1; 
	    }
	    if (row >= dp.length) {
		dp[row] = this.calcStartBlocki(row-1) + row - 1;
	    }
	    return dp[row]
	}
	this.calcStartBlocki.dp = [];
    }

    /** Game of Life Engine - does computate next frame **/
    // TODO yin: Solve the block-boundary problem. "If evaluating a cell on
    //           block border, how to access cells in the neighbouring block?"
    var GameOfLife = function() {
	// 1. world needs to iterate over existing blocks
    }

    /** Renders GoL world onto a HTML5 canvas **/
    var CanvasView = function() {
	// 1. world needs to iterate over existing blocks
    }

})(window);
