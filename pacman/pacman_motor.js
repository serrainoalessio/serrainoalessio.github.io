"use strict"

function getDots(dots, grid) {
    // a dot goes where are meet the following condition:
    // must be in the center of a 4x4 square of zeros
    // there must not be another dot in the same 4x4 square (on an edge is ok)
    // all the zeros on wich are placed dots must be connected (flood fill)
    
    // first may be placed at the first free position

    // 1. transform grid in a more "workable" grid.
    // deletes the first row, first column, last row and last column (game margins)
    // then divides by two each size (there should be only 2x2 tiles with all 1s or all 0s)

    var workablegrid = []; // it is an array of array
    var toadd;
    for (var i = 0, y = 1; y < (grid.height-1); y+=2, i++) {
	workablegrid.push([]); //push a void array
	for (var j = 0, x = 1; x < (grid.width - 1); x+=2, j++) {
	    toadd =  (grid.cell[y  ][x  ] || grid.cell[y  ][x+1] ||
		      grid.cell[y+1][x  ] || grid.cell[y+1][x+1])?0:1;
	    workablegrid[i].push(toadd);
	}
    }
    // now can remove the 8s from the grid
    for (var y = 0; y < grid.height; y++)
	for (var x = 0; x < grid.width; x++) {
	    if ((grid.cell[y][x] == 5) || (grid.cell[y][x] == 4))
		continue;
	    if ((grid.cell[y][x] != 1)) // only 1s remains 1s
		grid.cell[y][x] = 0; // reset to zero
	}

    var powerup;
    dots.num = 0;
    for (var y = 1; y < workablegrid.length; y++)
	for (var x = 1; x < workablegrid[y].length; x++)
	    if (((workablegrid[y  ][x  ] == 1) && (workablegrid[y-1][x  ] == 1) &&
		 (workablegrid[y  ][x-1] == 1) && (workablegrid[y-1][x-1] == 1)) ){
		if ((x == 1 && (y == 3 || y == 23)) || (x == 26 && (y == 3 || y == 23)))
		    powerup = true;
		else
		    powerup = false;
		// add a point at 2*x + 1, 2*y + 1
		dots.push({"x":2*x+1, "y":2*y+1, "powerup":powerup, "disp":true});
		dots.num++; // added a dot
		/*
		workablegrid[y  ][x  ] = workablegrid[y-1][x  ] =
	            workablegrid[y  ][x-1] = workablegrid[y-1][x-1] = 2;*/
	    }
}

function objectChDir(game, obj, newdir) {
    // first applies a correction (avoid half sized coordinates)
    var correction;
    
    if (obj.dir == 0) {
	if (newdir == 2) { // go backward
	    normalMoveRight(game, obj);
	    return;
	}
	correction = obj.x - Math.floor(obj.x);
	obj.x = Math.floor(obj.x);
    } else if (obj.dir == 1) {
	if (newdir == 3) { // go backward
	    normalMoveDown(game, obj);
	    return;
	}
	correction = obj.y - Math.floor(obj.y);
	obj.y = Math.floor(obj.y);
    } else if (obj.dir == 2) {
	if (newdir == 0) { // go backward
	    normalMoveLeft(game, obj);
	    return;
	}
	correction = Math.ceil(obj.x) - obj.x;
	obj.x = Math.ceil(obj.x);
    } else if (obj.dir == 3) {
	if (newdir == 1) { // go backward
	    normalMoveUp(game, obj);
	    return;
	}
	correction = Math.ceil(obj.y) - obj.y;
	obj.y = Math.ceil(obj.y);
    }
    if (newdir == -1)
	return;
    
    correction = obj.speed - correction;
    
    if (correction < 0) throw "ERROR!!! PLEASE CONTACT SUPPORT";
    
    if (newdir == 0) // move left
	obj.x -= correction;
    else if (newdir == 1) // move up
	obj.y -= correction;
    else if (newdir == 2) // move right
	obj.x += correction;
    else if (newdir == 3) // move down
	obj.y += correction;
}

function objectCanMove(game, obj, newdir) {
    var nxcell, testcell;

    if (obj.x < 0) {
	if (newdir == 0 || newdir == 2 || newdir == -1)
	    return true; // can execute this move
	else
	    return false;
    }
    
    if (obj.y < 0) {
	if (newdir == 1 || newdir == 3 || newdir == -1)
	    return true; // can execute this move
	else
	    return false;
    }
    
    // this function checks weter move is possible, I. E. pacman does not hit any wall
    if (newdir == 0) { // move left
	if (obj.dir == 1) { // pacman is going up
	    if ((Math.floor(obj.y) != Math.floor(obj.y - obj.speed)) || (obj.y == Math.floor(obj.y)))
		// obj.x - obj.speed <= Integer < obj.x. // execute calculus in the integer coordinate
		testcell = Math.floor(obj.y);
	    else
		return false; // do not pass throug an integer coordinate
	} else if (obj.dir == 3) { // pacman is going down
	    if ((Math.ceil(obj.y) != Math.ceil(obj.y + obj.speed)) || ((obj.y) == Math.ceil(obj.y)))
		// obj.x <= Integer < obj.x + obj.speed. // execute calculus in the integer coordinate
		testcell = Math.ceil(obj.y);
	    else
		return false;
	} else {
	    testcell = obj.y;
	}
	nxcell = obj.x - obj.speed;
	nxcell = Math.floor(nxcell);
	for (var i = 0; i < obj.height; i++)
	    if (game.cell[testcell+i][nxcell])
		return false; // pacman cannot move
    } else if (newdir == 1) { // move up
	if (obj.dir == 0) {
	    // checks weter pacman passes throug integer coordinates
	    if ((Math.floor(obj.x) != Math.floor(obj.x - obj.speed)) || (obj.x == Math.floor(obj.x)))
		// obj.x - obj.speed <= Integer < obj.x. // execute calculus in the integer coordinate
		testcell = Math.floor(obj.x);
	    else
		return false; // do not pass throug an integer coordinate
	} else if (obj.dir == 2) {
	    if ((Math.ceil(obj.x) != Math.ceil(obj.x + obj.speed)) || ((obj.x) == Math.ceil(obj.x)))
		// obj.x <= Integer < obj.x + obj.speed. // execute calculus in the integer coordinate
		testcell = Math.ceil(obj.x);
	    else
		return false;
	} else {
	    testcell = obj.x;
	}
	nxcell = obj.y - obj.speed;
	nxcell = Math.floor(nxcell);
	for (var i = 0; i < obj.width; i++)
	    if (game.cell[nxcell][testcell+i])
		return false; // pacman cannot move
    } else if (newdir == 2) { // move right
	if (obj.dir == 1) { // pacman is going up
	    if ((Math.floor(obj.y) != Math.floor(obj.y - obj.speed)) || (obj.y == Math.floor(obj.y)))
		// obj.x - obj.speed <= Integer < obj.x. // execute calculus in the integer coordinate
		testcell = Math.floor(obj.y);
	    else
		return false; // do not pass throug an integer coordinate
	} else if (obj.dir == 3) { // pacman is going down
	    if ((Math.ceil(obj.y) != Math.ceil(obj.y + obj.speed)) || ((obj.y) == Math.ceil(obj.y)))
		// obj.x <= Integer < obj.x + obj.speed. // execute calculus in the integer coordinate
		testcell = Math.ceil(obj.y);
	    else
		return false;
	} else {
	    testcell = obj.y;
	}
	nxcell = obj.x + obj.speed + obj.width - 1.0;
	nxcell = Math.ceil(nxcell);
	for (var i = 0; i < obj.height; i++)
	    if (game.cell[testcell+i][nxcell])
		return false; // pacman cannot move
    } else if (newdir == 3) { // move down
	if (obj.dir == 0) {
	    // checks weter pacman passes throug integer coordinates
	    if ((Math.floor(obj.x) != Math.floor(obj.x - obj.speed)) || (obj.x == Math.floor(obj.x)))
		// obj.x - obj.speed <= Integer < obj.x. // execute calculus in the integer coordinate
		testcell = Math.floor(obj.x);
	    else
		return false; // do not pass throug an integer coordinate
	} else if (obj.dir == 2) {
	    if ((Math.ceil(obj.x) != Math.ceil(obj.x + obj.speed)) || ((obj.x) == Math.ceil(obj.x)))
		// obj.x <= Integer < obj.x + obj.speed. // execute calculus in the integer coordinate
		testcell = Math.ceil(obj.x);
	    else
		return false;
	} else {
	    testcell = obj.x;
	}
	nxcell = obj.y + obj.speed + obj.height - 1.0;
	nxcell = Math.ceil(nxcell);
	for (var i = 0; i < obj.width; i++)
	    if (game.cell[nxcell][testcell+i])
		return false; // pacman cannot move
    }
    return true;
}

function normalMoveUp(game, obj) {
    obj.y -= obj.speed;
    if (obj.y <= (-obj.height))
	obj.y += game.height;
}

function normalMoveDown(game, obj) {
    obj.y += obj.speed;
    if (obj.y >= (game.height - obj.height))
	obj.y -= game.height;
}

function normalMoveLeft(game, obj) {
    obj.x -= obj.speed;
    if (obj.x <= (-obj.width))
	obj.x += game.width;
}

function normalMoveRight(game, obj) {
    obj.x += obj.speed;
    if (obj.x >= (game.width - obj.width))
	obj.x -= game.width;
}

function normalMove(game, obj, newdir) {
    switch (newdir) {
    case 0:
	normalMoveLeft(game, obj);
	break;
    case 1:
	normalMoveUp(game, obj);
	break;
    case 2:
	normalMoveRight(game, obj);
	break;
    case 3:
	normalMoveDown(game, obj);
	break;
    }
}

function movePacman(game) {
    if (game.combuffer == game.pacman.dir) // this command does not change anything
	game.combuffer = -1;
    if ((game.combuffer != -1) && (objectCanMove(game, game.pacman, game.combuffer))) {
	// pacman can moves there, so must choose that direction
	objectChDir(game, game.pacman, game.combuffer);
	game.pacman.dir = game.combuffer; // copies the new move
	// now have to make sure the move can be executed
	game.combuffer = -1; // move is now executed
	game.pacman.stop = 0;
	game.pacman.pphase += Math.PI/4;
	return;
    } // else ignore pacbuffer and move pacman forward (if can)

    // verify pacman can move forward
    if (game.pacman.stop)
	return;
    if (!objectCanMove(game, game.pacman, game.pacman.dir)) {
	// first apply a small correction ...
	objectChDir(game, game.pacman, -1);
	game.pacman.stop = 1; // avoid too many computation
	game.pacman.pphase = Math.PI/2;
	return; // cannot move pacman
    }

    // and finally moves pacman
    normalMove(game, game.pacman, game.pacman.dir);
    game.pacman.pphase += Math.PI/4;
}

var lastdotate = -1;

function dotAte(game, dots, index) {
    //
    //  Dot eated! Add score & check if it is last
    //
    dots[index].disp = false;
    if (dots[index].powerup) { // slow down each ghost, reverse their direction, make they weak
	for (var i = 0; i < 4; i++) {
	    if (game.ghost[i].al >= 0 && game.ghost[i].al  != 3) {
		game.ghost[i].speed = game.ghost[i].slowspeed; // half speed
		game.ghost[i].dir = reverseDir(game.ghost[i].dir); // reverse dir
		game.ghost[i].w = 150; // 150 weakness
	    }
	}
    } else { // do not count powerups
	dots.num--;
    }
    if (dots.num <= 4) { // Win the game!
	// game is finished!
	console.log("You win!");
	game.state = 1; // stop the game
    }
}

function pacmanEat(game, dots) { // deletes if pacman ate something
    // search for a dot in the center of pacman
    // search algorithm goes as follows: from the last eated dot searches forward and backward up to one end is reached
    // then search in the remaining part sequentially
    var condition;
    switch(game.pacman.dir) {
    case 0: // pacman moves left
	condition = function(dots, game, i) { return (dots[i].x >= game.pacman.x + game.pacman.width/2 &&
					              dots[i].x <= game.pacman.x + 4*game.pacman.width/5 ) &&
	                                             (dots[i].y >= game.pacman.y + game.pacman.height/4 &&
					              dots[i].y <= game.pacman.y + 3*game.pacman.height/4 );
					    };
	break;
    case 1: // pacman moves up
	condition = function(dots, game, i) { return (dots[i].x >= game.pacman.x + game.pacman.width/4 &&
						      dots[i].x <= game.pacman.x + 3*game.pacman.width/4 ) &&
					             (dots[i].y >= game.pacman.y + game.pacman.height/2 &&
					              dots[i].y <= game.pacman.y + 4*game.pacman.height/5);
					    };
	break;
    case 2: // pacman moves right
	condition = function(dots, game, i) { return (dots[i].x >= game.pacman.x + game.pacman.width/5 &&
						      dots[i].x <= game.pacman.x + game.pacman.width/2) &&
					             (dots[i].y >= game.pacman.y + game.pacman.height/4 &&
					              dots[i].y <= game.pacman.y + 3*game.pacman.height/4);
					    };
    case 3: // pacman moves down
	condition = function(dots, game, i) { return (dots[i].x >  game.pacman.x + game.pacman.width/4 &&
						      dots[i].x <  game.pacman.x + 3*game.pacman.width/4) &&
					             (dots[i].y >= game.pacman.y + game.pacman.height/5 &&
					              dots[i].y <= game.pacman.y + game.pacman.height/2);
					    };
	break;
    }

    var i = lastdotate, cnt = 1;
    while (true) {
	if (cnt == -1)     i++;
	else if (cnt == -2) i--;
	else if (cnt % 2)  i += cnt++;
	else               i -= cnt++;
	if (i < 0) {
	    i += cnt;
	    cnt = -1;
	} else if (i >= dots.length) {
	    i -= cnt;
	    cnt = -2;
	}
	if ((i < 0) || (i >= dots.length))
	    break;
	if (dots[i].disp == false)
	    continue;
	if (condition(dots, game, i)) {
	    dotAte(game, dots, i);
	    lastdotate = i; // useful avoiding unuseful computations
	    break; // have to find only one
	}
    }
}

function reverseDir(dir) {
    switch(dir) {
    case 0: return 2;
    case 1: return 3;
    case 2: return 0;
    case 3: return 1;
    }
}

function pacmanGhostColide(game, ghost) {
    // there are two cases:
    // 1. ghost is not scared. Pacman looses a life
    // 2. ghost is scared. Add a certian score & change ghost algorithm
    if (ghost.w) {
	ghost.al = 3; // go back home
	ghost.e = true; // do not display body
	ghost.w = 0; // ghost is no more scared
	ghost.speed = ghost.espeed;
    } else {
	console.log("GAME OVER!");
	game.state = 2;
    }
}

function present(array, item) { // looks for a certian move in the array
    // N. B: TODO: implement a better search, bsearch, array is already ordered
    // well, in the majority of cases array has two elements (max 3)
    for (var i = 0; i < array.length; i++)
	if (array[i] == item)
	    return true; // found;
    return false; // not found
}

function whichDirection(delta, allowedDirs) { // returns the id of the move to follow
    if (delta.x == 0 && delta.y == 0)
	return -1; // target is reached

    if (delta.x == 0) {
	if (delta.y > 0) {
	    // verify if up is in the allowed directions, if it is returns left
	    if (present(allowedDirs, 1))
		return 1; // up is possible, and it is the best
	    if (present(allowedDirs, 0)) //
		return 0;                //  This two may be exhanfed
	    if (present(allowedDirs, 2)) //
		return 2;                //
	    return 3; // move down
	} else { // dy < 0, it is the only case
	    // verify if down is in the allowed directions, if it is returns left
	    if (present(allowedDirs, 3))
		return 3; // up is possible, and it is the best
	    if (present(allowedDirs, 0)) //
		return 0;                //  This two may be exhanfed
	    if (present(allowedDirs, 2)) //
		return 2;                //
	    return 1; // move up
	}
    } else if (delta.y == 0) {
	if (delta.x > 0) {
	    // verify if left is in the allowed directions, if it is returns left
	    if (present(allowedDirs, 0))
		return 0; // up is possible, and it is the best
	    if (present(allowedDirs, 1)) //
		return 1;                //  This two may be exhanfed
	    if (present(allowedDirs, 3)) //
		return 3;                //
	    return 2; // move right
	} else { // dx < 0, only case
	    // verify if right is in the allowed directions, if it is returns left
	    if (present(allowedDirs, 2))
		return 2; // up is possible, and it is the best
	    if (present(allowedDirs, 1)) //
		return 1;                //  This two may be exhanfed
	    if (present(allowedDirs, 3)) //
		return 3;                //
	    return 0; // move left
	}
    }

    // zero cases has been excluded
    if (delta.x > 0 && delta.y > 0) {
	if (delta.x > delta.y) {
	    if (present(allowedDirs, 0)) return 0;
	    if (present(allowedDirs, 1)) return 1;
	    if (present(allowedDirs, 3)) return 3;
	    return 2;
	} else { // if (delta.y > delta.x) {
	    if (present(allowedDirs, 1)) return 1;
	    if (present(allowedDirs, 0)) return 0;
	    if (present(allowedDirs, 2)) return 2;
	    return 3;
	}
    } else if (delta.x > 0 && delta.y < 0) {
	if (delta.x > -delta.y) {
	    if (present(allowedDirs, 0)) return 0;
	    if (present(allowedDirs, 3)) return 3;
	    if (present(allowedDirs, 1)) return 1;
	    return 2;
	} else { // if (-delta.y > delta.x) {
	    if (present(allowedDirs, 3)) return 3;
	    if (present(allowedDirs, 0)) return 0;
	    if (present(allowedDirs, 2)) return 2;
	    return 1;
	}
    } else if (delta.x < 0 && delta.y > 0) {
	if (-delta.x > delta.y) {
	    if (present(allowedDirs, 2)) return 2;
	    if (present(allowedDirs, 1)) return 1;
	    if (present(allowedDirs, 3)) return 3;
	    return 0;
	} else { // if (delta.y > -delta.x) {
	    if (present(allowedDirs, 1)) return 1;
	    if (present(allowedDirs, 2)) return 2;
	    if (present(allowedDirs, 0)) return 0;
	    return 3;
	}
    } else if (delta.x < 0 && delta.y < 0) {
	if (delta.x < delta.y) {
	    if (present(allowedDirs, 2)) return 2;
	    if (present(allowedDirs, 3)) return 3;
	    if (present(allowedDirs, 1)) return 1;
	    return 0;
	} else { // if (delta.y < delta.x) {
	    if (present(allowedDirs, 3)) return 3;
	    if (present(allowedDirs, 2)) return 2;
	    if (present(allowedDirs, 0)) return 0;
	    return 1;
	}
    }
}

function moveNormalGhosts(game, ghost) {
    // which direction can the ghost move?
    var allowedDirs = [];
    var opp = reverseDir(ghost.dir);
    
    for (var i = 0; i < 4; i++)
	if ((i != opp) && objectCanMove(game, ghost, i))
	    allowedDirs.push(i);
    var chosenmove;
    if (allowedDirs.length == 0) { // This should happen only in a few peculiar cases
	// forced move
	if (objectCanMove(game, ghost, opp)) { // go back
	    normalMove(game, ghost, opp);
	    ghost.dir = opp;
	} else {
	    throw "ERROR: Ghost cannot move. Please contact support to fix that";
	}
	return;
    } else if (allowedDirs.length == 1) {
	// another forced move
	chosenmove = allowedDirs[0]; // choose the only solution
    } else { // have to choose between two or three direction (ghost cannot go backward unless forced to do)
	// now there are so many ways to choose the direction.
	if (ghost.al == 0) { // This algorithm chooses randomly
	    chosenmove = allowedDirs[Math.floor(Math.random()*allowedDirs.length)];
	    if (Math.random() < 0.3) // in 30% of cases goes back to the other algorithm (at next step)
		ghost.al = 1;
	} else if (ghost.al == 1) { // chose the move that goes near pacman
	    var diff = {"x":ghost.x - game.pacman.x,"y":ghost.y - game.pacman.y};
	    if (ghost.w) {
		diff.x = -diff.x; // invert direction if ghost is scared (get away from pacman)
		diff.y = -diff.y;
	    }
	    chosenmove = whichDirection(diff, allowedDirs);
	    if (chosenmove == -1)
		throw "ERROR, please contact support";
	    if (Math.random() < 0.1)
		ghost.al = 0;
	} else if (ghost.al == 2) { // TODO: if enough close to pacman choose him, otherwise do not
	    var diff = {"x":ghost.x - game.pacman.x,"y":ghost.y - game.pacman.y};
	    if (ghost.w) {
		diff.x = -diff.x; // invert direction if ghost is scared (get away from pacman)
		diff.y = -diff.y;
	    }
	    if (Math.pow(diff.x, 2) + Math.pow(diff.y, 2) > 100) // well, can choose any value
		chosenmove = whichDirection(diff, allowedDirs); // try to get close to pacman
	    else
		chosenmove = allowedDirs[Math.floor(Math.random()*allowedDirs.length)]; // chose randomly
	    if (chosenmove == -1)
		throw "ERROR, please contact support";
	} else if (ghost.al == 3) { // Go back home
	    var diff = {"x":ghost.x - game.ghosthome.x, "y":ghost.y - game.ghosthome.y};
	    chosenmove = whichDirection(diff, allowedDirs); // try to get close to pacman
	    /* if (chosenmove == -1) reached home. should already been processed
	       throw "ERROR, please contact support"; */
	}
    }

    // move chosen, now execute!
    if (chosenmove == ghost.dir) {
	normalMove(game, ghost, chosenmove);
    } else {
	objectChDir(game, ghost, chosenmove);
	ghost.dir = chosenmove;
    }

    if (ghost.al == 3) { // verify if reached home
	var diff = {"x":ghost.x - game.ghosthome.x,"y":ghost.y - game.ghosthome.y};
	if (Math.pow(diff.x, 2) + Math.pow(diff.y, 2) < ghost.speed) { // reahced home
	    // make integer coordinates
	    ghost.x = game.ghosthome.x;
	    ghost.y = game.ghosthome.y;
	    ghost.dir = 3;
	    ghost.al = -4;
	    ghost.speed = ghost.defaultspeed;
	}
    } else { // normal case
	// now check if pacman hits a ghost (or the opposite!)
	var diff = {"x":ghost.x - game.pacman.x,"y":ghost.y - game.pacman.y};
	if (Math.pow(diff.x, 2) + Math.pow(diff.y, 2) <= 4.0)
	    pacmanGhostColide(game, ghost);
    }
}

function moveGhosts(game, ghost) {
    // when a ghost reaches a cross may choose the direction randomly between all the possile directions
    if (ghost.w) {
	ghost.w--;
	if (ghost.w == 0) // restore speed
	    ghost.speed = ghost.defaultspeed;
    }
    if (ghost.al >= 0) { // normal algorithm
	moveNormalGhosts(game, ghost); // Normal move algorithm
	return;
    } else if (ghost.al == -4) {
	// move down the ghost up to he reaches the home
	normalMove(game, ghost, 3); // move down, well, it may be different if change game orientation
	// check if reached the end
	var diff = {"x":ghost.x - game.ghosthome.xx,"y":ghost.y - game.ghosthome.yy};
	if (Math.pow(diff.x, 2) + Math.pow(diff.y, 2) < Math.pow(ghost.speed, 2)) { // reahced home
	    // make integer coordinates
	    ghost.x = game.ghosthome.xx;
	    ghost.y = game.ghosthome.yy;
	    ghost.al = -1;
	    ghost.e = false;
	}
    } else if (ghost.al == -1) {
	// go up and down some time, then exit (with a probability of 30% at each up-down)
	if (ghost.dir == 3) {
	    if (!objectCanMove(game, ghost, 3)) {
		// go up to the next integer coordinate
		ghost.y = Math.ceil(ghost.y);
		ghost.dir = 1;
	    } else {
		normalMove(game, ghost, 3);
	    }
	} else { // ghost.dir == 1
	    if (!objectCanMove(game, ghost, 1)) {
		// go up to the prior integer coordinate
		if (Math.random() > 0.3) { // 30% probability
		    ghost.y = Math.floor(ghost.y);
		    ghost.dir = 3;
		} else {
		    ghost.al = -5;
		}
	    } else {
		normalMove(game, ghost, 1);
	    }
	}
    } else if (ghost.al == -5) {
	// Exiting from the gost's room
	// move down the ghost up to he reaches the home
	normalMove(game, ghost, 1); // move down, well, it may be different if change game orientation
	// check if reached the end
	var diff = ghost.y - game.ghosthome.y;
	if (diff < ghost.speed) { // reahced home
	    // make integer coordinates
	    ghost.x = game.ghosthome.x;
	    ghost.y = game.ghosthome.y;
	    ghost.al = 1; // now the ghost has only to follow pacman
	}
    }
    // NOW SOME ONE-TIME EXECUTION ALGORITHMS
    else if (ghost.al == -2) { // it works like -1
	if (ghost.dir == 3) {
	    if (!objectCanMove(game, ghost, 3)) {
		// go up to the next integer coordinate
		ghost.y = Math.ceil(ghost.y);
		ghost.dir = 1;
	    } else {
		normalMove(game, ghost, 3);
	    }
	} else { // ghost.dir == 1
	    if (!objectCanMove(game, ghost, 1)) {
		// go up to the prior integer coordinate
		if ((game.ghost[1].al < 0) || (Math.random() < 0.3)) { // 30% probability
		    ghost.y = Math.floor(ghost.y);
		    ghost.dir = 3;
		} else {
		    ghost.al = -6;
		}
	    } else {
		normalMove(game, ghost, 1);
	    }
	}
    } else if (ghost.al == -3) {
	if (ghost.dir == 3) {
	    if (!objectCanMove(game, ghost, 3)) {
		// go up to the next integer coordinate
		ghost.y = Math.ceil(ghost.y);
		ghost.dir = 1;
	    } else {
		normalMove(game, ghost, 3);
	    }
	} else { // ghost.dir == 1
	    if (!objectCanMove(game, ghost, 1)) {
		// go up to the prior integer coordinate
		if ((game.ghost[2].al < 0) || (Math.random() > 0.3)) { // 30% probability
		    ghost.y = Math.floor(ghost.y);
		    ghost.dir = 3;
		} else {
		    ghost.al = -7;
		}
	    } else {
		normalMove(game, ghost, 1);
	    }
	}
    } else if (ghost.al == -6) {
	// Exiting from the gost's room
	// move down the ghost up to he reaches the home
	normalMove(game, ghost, 2); // move down, well, it may be different if change game orientation
	// check if reached the end
	var diff = game.ghosthome.xx - ghost.x;
	if (diff < ghost.speed) { // reahced home
	    // make integer coordinates
	    ghost.x = game.ghosthome.xx;
	    ghost.al = -5; // now have to exit the room
	}
    } else if (ghost.al == -7) {
	// Exiting from the gost's room
	// move down the ghost up to he reaches the home
	normalMove(game, ghost, 0); // move down, well, it may be different if change game orientation
	// check if reached the end
	var diff = ghost.x - game.ghosthome.xx;
	if (diff < ghost.speed) { // reahced home
	    // make integer coordinates
	    ghost.x = game.ghosthome.xx;
	    ghost.al = -5; // now have to exit the room
	}
    }
}

function update(game, dots) {
    if (game.state == 1) {
	clearInterval(myInt); // TODO: better winner move
	return;
    }
    if (game.state == 2) { // pacman is captured. TODO: add lives
	if (game.pacman.anim1 == 16)
	    return;
	game.pacman.anim1++;
	return
    }
    if (game.state == 3) { // game is paused
	// wayting for a keypress
	if (keypressed == -1)
	    return; // no key pressed, do nothing
	game.state = 0; // game is now running
    }
    game.combuffer = keypressed; // updates the command
    game.phase++;
    game.phase &= 0x07;
    
    // 1. Pacman moves in its direction (if can)
    movePacman(game);
    // 2. pacman eats
    pacmanEat(game, dots);
    // 3. ghost move
    moveGhosts(game, game.ghost[0]);
    moveGhosts(game, game.ghost[1]);
    moveGhosts(game, game.ghost[2]);
    moveGhosts(game, game.ghost[3]);
    // optional: search for near ghosts, and change the algoritm (from follow to random)
    for (var i = 0; i < 4; i++) {
	if (game.ghost[i].al < 0 && game.ghost[i].al != 3)
	    continue;
	for (var j = i + 1; j < 4; j++) {
	    if (game.ghost[j].al < 0 && game.ghost[j].al != 3)
		continue;
	    if (game.ghost[i].dir != game.ghost[j].dir)
		continue;
	    if (Math.pow(game.ghost[i].x - game.ghost[j].x, 2) +
		Math.pow(game.ghost[i].y - game.ghost[j].y, 2) <= 4)
		game.ghost[j].al = 0; // random moves
	}
    }
}
