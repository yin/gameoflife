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

    window.eval_translateXYtoBlocki = function() {
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

    window.eval_translateBlockiToXY = function() {
	var world = new World();
	var a = {};
	var maxi = 20;
	for (var i = 0; i <= maxi; i++) {
	    var xy = world.translateBlockiToXY(i);
	    a[i] = 'x:' + xy.x + ',y:' + xy.y
		+ ' q:' + world.calcBlockQuadrant(i) ;
	}
	return a;
    }

    window.test_translateBlockiToXY = function() {
	var world = new World();
	var data = [
	    {'in': [0], out: {x:0, y:0}},
	    {'in': [1], out: {x:0, y:1}},
	    {'in': [2], out: {x:-1, y:0}},
	    {'in': [3], out: {x:0, y:-1}},
	    {'in': [4], out: {x:1, y:0}},
	    {'in': [9], out: {x:-1, y:1}},
	    {'in': [10], out: {x:-1, y:-1}},
	    {'in': [11], out: {x:1, y:-1}},
	    {'in': [12], out: {x:1, y:1}}
	];
	for (var i = 0, l = data.length; i < l; i++) {
	    var input = data[i].in;
	    var output = data[i].out;
	    var result = world.translateBlockiToXY(i);
	    if (result.x == output.x && result.y == output.y) {
		console.log("PASS", input, output, result)
	    } else {
		console.log("FAIL", input, output, result)
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
	    //       7
	    //     A 3 B
	    //   6 2 0 4 8
	    //     9 1 C
	    //       5
	    var blocki = localBlocki * 4 - q.quadrant + 1;
	    return blocki;
	}

	this.translateBlockiToXY = function(index) {
	    // Decide which quadrant this is
	    var quadrant = this.calcBlockQuadrant(index);
	    // Compute quadrant-local block-index
	    var localBlocki = (index + quadrant - 1) / 4;
	    // Now the tricky part, I avoided to solve yet - compute XY coords
	    // from block-index. I've done the opposite computation by DP, so
	    // I will mess now with that :D. There is an arithmetic way of
	    // computing both ways, I am witholding for latter (or am I
	    // lazy to go ahead and derive the formulas, you decide)
	    var row = 0, si = 0
	    for (; index > si; row++)
		si = this.calcStartBlocki(row + 1) ;
	    // Difference of index and row start-index is the Y coordinate (q.)
	    // Difference of row number and Y coordinate is the X coordinate
	    var y = index - si, x = row - y;
	    return {x: x, y: y};
	}

	/** returns quadrant (1-4) and XY rotated into position of quadrant 1 **/
	this.calcQuadrant = function(x, y) {
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

	this.calcBlockQuadrant = function(index) {
	    return index % 4 + 1;
	}

	this.calcXYFromQuadrantXY = function(x, y, quadrant) {
	    if (quadrant == 1) {
		return {
		    x: x,
		    y: y
		}	
	    } else if (quadrant == 2) {
		return {
		    x: -y,
		    y: x
		}
	    } else if (quadrant == 3) {
		return {
		    x: -x,
		    y: -y
		}
	    } else if (quadrant == 4) {
		return {
		    x: -y,
		    y: x
		}
	    } else return {
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
