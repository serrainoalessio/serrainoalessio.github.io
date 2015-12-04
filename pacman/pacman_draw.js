"use strict"

function draw(game, dots) {
    update(game, dots);
    displaybuffercommand(game, "inputbufferdisplay");
    
    var c = document.getElementById("pacman");
    var ctx = c.getContext("2d");
    var size = 10; // tile size
    var margin = {"up":10, "left":10, "right": 10, "down":10};
    ctx.fillStyle = "#000000"; // blakc bk
    ctx.fillRect(0, 0, game.width*size + margin.left + margin.right,
		       game.height*size + margin.up + margin.right );
    ctx.translate(margin.up, margin.left); // leave a little offset

    // draw the grid (bakcground)
    drawGame(c, ctx, game, size, "#3333FF", 3);
    
    // now draw white dots
    drawDots(c, ctx, dots, size, "#FFFFFF", game.phase);

    // draws the ghosts
    for (var i = 0; i < game.ghost.length; i++)
	drawGhost(c, ctx, size, game.ghost[i], game.phase);
    
    // and finally draws pacman
    if (game.pacman.anim1 == 0) {
	drawPacman(c, ctx, size, game);
    } else {
    var trans = {"x":(game.pacman.x + game.pacman.width/2)*size,
        	 "y":(game.pacman.y + game.pacman.height/2)*size }
	ctx.translate(trans.x, trans.y); // translates at x, y
	ctx.rotate(Math.PI/2);
	drawPacman2(c, ctx, size, game.pacman.anim1);
	ctx.rotate(-Math.PI/2);
	ctx.translate(-trans.x, -trans.y);
    }

    ctx.translate(-margin.up, -margin.left); // translates back the matrix
}

function displaybuffercommand(game, objid) {
    var obj = document.getElementById(objid);
    switch(game.combuffer) {
    case -1:
	obj.innerHTML = "None";
	break;
    case 0:
	obj.innerHTML = "Left";
	break;
    case 1:
	obj.innerHTML = "Up";
	break;
    case 2:
	obj.innerHTML = "Right";
	break;
    case 3:
	obj.innerHTML = "Down";
	break;
    default:
	obj.innerHTML = "ERROR, plese contact support";
    }
}

function getLineType(game, x, y) {
    var bitfield = 0; // integer
    if (x != 0) { // can check left
	if (y != 0) // can check up
	    bitfield |= (game.cell[x-1][y-1] == 1)?0x001:0;
	/* else
	    bitfield &= ~0x001; */
	bitfield |= (game.cell[x-1][y] == 1)?0x002:0;
	if (y != game.width - 1) // can check up
	    bitfield |= (game.cell[x-1][y+1] == 1)?0x004:0;
	/* else
	    bitfield &= ~0x004; */
    } /* else {
	bitfield &= ~(0x001 | 0x002 | 0x004);
    } */
    if (y != 0)
	bitfield |= (game.cell[x][y-1] == 1)?0x008:0;
    /* else
	bitfield &= ~0x008; */
    bitfield |= (game.cell[x][y] == 1)?0x010:0;
    if (y != game.width - 1) // can check up
	bitfield |= (game.cell[x][y+1] == 1)?0x020:0;
    /* else
	bitfield &= ~0x020; */
    if (x != game.height - 1) { // can check left
	if (y != 0) // can check up
	    bitfield |= (game.cell[x+1][y-1] == 1)?0x40:0;
	/* else
	    bitfield &= ~0x040; */
	bitfield |= (game.cell[x+1][y] == 1)?0x080:0;
	if (y != game.width - 1) // can check up
	    bitfield |= (game.cell[x+1][y+1] == 1)?0x100:0;
	/* else
	    bitfield &= ~0x100; */
    } /* else {
	bitfield &= ~(0x040 | 0x080 | 0x100);
    } */

    return bitfield
}

function drawTile(c, ctx, type, size, x, y, color, thickness) {
    ctx.translate(size*x, size*y);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    // now distinguish so many cases
    switch (type) {
    case 0:
    case 0x1FF:
	break; // do not draw nothing
    case 63: // h segment low
	ctx.moveTo(0, size);
	ctx.lineTo(size, size);
	break;
    case 219: // v segment right
	ctx.moveTo(size, 0);
	ctx.lineTo(size, size);
	break;
    case 438: // v segment left
	ctx.moveTo(0, 0);
	ctx.lineTo(0, size);
	break;
    case 504: // h segment high
	ctx.moveTo(0, 0);
	ctx.lineTo(size, 0);
	break;
    case 27: // concave angle bottom-right
    case 484:
	ctx.arc(0, 0, size, 0, Math.PI/2, false);
	break;
    case 54: // conceve angle bottom-left
    case 457:
	ctx.arc(size, 0, size, Math.PI/2, Math.PI, false);
	break;
    case 216: // concave angle top-right
    case 295:
	ctx.arc(0, size, size, -Math.PI/2, 0, false);
	break;
    case 432: // concave angle top-left
    case 79:
	ctx.arc(size, size, size, -Math.PI/2, Math.PI, true);
	break;
    // other cases where have to draw nothing
    case 127: case 319:
    case 439: case 502:
    case 223: case 475:
    case 505: case 508:
    case 510: case 507: case 447: case 255: // one angle missing
    case 7: case 73: case 292: case 448: // single edge
    case 1: case 4: case 64: case 256: // single corner
    case 3: case 6: case 192: case 384: // little dash
    case 9: case 72: case 36: case 288: // little dash
	break;
	// now some special cases (game contour)
    case 146:
	ctx.moveTo(size, 0); // draws again parallel segment
	ctx.lineTo(size, size);
	ctx.moveTo(0, 0);
	ctx.lineTo(0, size);
	break;
    case 56:
	ctx.moveTo(0, 0); // draws two parallel segments
	ctx.lineTo(size, 0);
	ctx.moveTo(0, size);
	ctx.lineTo(size, size);
	break;
    // thin angle cases
    case 176:
	ctx.arc(size, size, size, -Math.PI/2, Math.PI, true);
	break;
    case 152:
	ctx.arc(0, size, size, -Math.PI/2, 0, false);
	break;
    case 26:
	ctx.arc(0, 0, size, 0, Math.PI/2, false);
	break;
    case 50:
	ctx.arc(size, 0, size, Math.PI/2, Math.PI, false);
	break;
    // L cases
    case 210: case 147:
	ctx.moveTo(size, 0);
	ctx.lineTo(size, size);
	break;
    case 402: case 150:
	ctx.moveTo(0, 0);
	ctx.lineTo(0, size);
	break;
    case 57: case 60:
	ctx.moveTo(0, size);
	ctx.lineTo(size, size);
	break;
    case 120: case 312:
	ctx.moveTo(0, 0);
	ctx.lineTo(size, 0);
	break;
     // P cases
    case 440: case 248: case 184:
	ctx.moveTo(0, 0);
	ctx.lineTo(size, 0);
	break;
    case 62: case 59: case 58:
	ctx.moveTo(0, size);
	ctx.lineTo(size, size);
	break;
    case 218: case 155: case 154:
	ctx.moveTo(size, 0);
	ctx.lineTo(size, size);
	break;
    case 182: case 434: case 178:
	ctx.moveTo(0, 0);
	ctx.lineTo(0, size);
	break;
    // T cases TODO!!!
    
    // S cases
    case 214: case 403: case 313: case 124: // do nothing!
	break;
    // single dash cases
    case 48: case 24:
	ctx.moveTo(0, 0);
	ctx.lineTo(size, 0);
	ctx.moveTo(0, size);
	ctx.lineTo(size, size);
	break;
    case 144: case 18: // draw a little dash (end of the line)
	ctx.moveTo(size, 0);
	ctx.lineTo(size, size);
	ctx.moveTo(0, 0);
	ctx.lineTo(0, size);
	break;
    // head cases
    case 2: case 8: case 32: case 128: // draw nothing!
	break;

    default: // all other cases are errors !!!
	console.log("-----> Error <------ " + type);
	throw "Game input error";
    }
    ctx.stroke();
    ctx.translate(-size*x, -size*y); // translate back the matrix
}

function drawGame(c, ctx, game, size, color, thickness) {
    var type;
    
    for (var i = 0; i < game.height; i++)
	for (var j = 0; j < game.width; j++) {
	    type = getLineType(game, i, j);
	    drawTile(c, ctx, type, size, j, i, color, thickness);
	}
    
    ctx.translate(game.ghostx*size, game.ghosty*size); // translate the matrix 
    // now draw ghost's room
    ctx.beginPath(); // door
    ctx.fillStyle = "#AABBCC";
    ctx.fillRect(size*5, size*0.25, size*4, size*0.5);

    ctx.lineWidth=thickness;
    ctx.strokeStyle = color; // walls
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size*8);
    ctx.lineTo(size*14, size*8);
    ctx.lineTo(size*14, 0);
    ctx.lineTo(size*9, 0);
    ctx.lineTo(size*9, size*0.7);
    ctx.lineTo(size*13.3, size*0.7);
    ctx.lineTo(size*13.3, size*7.3);
    ctx.lineTo(size*0.7, size*7.3);
    ctx.lineTo(size*0.7, size*0.7);
    ctx.lineTo(size*5, size*0.7);
    ctx.lineTo(size*5, 0);
    ctx.closePath();
    ctx.stroke();
    
    ctx.translate(-game.ghostx*size, -game.ghosty*size); // translate back the matrix 
}

function drawPacman1(c, ctx, size, pacphase) {
    ctx.beginPath();
    ctx.fillStyle = "#FFFF00";
    ctx.arc(0, 0, 1.5*size, -Math.PI + Math.pow(Math.sin(pacphase), 2)*0.7, Math.PI - Math.pow(Math.sin(pacphase), 2)*0.7);
    ctx.lineTo(0.5*size, 0); // draws the center
    ctx.closePath(); // and closes the path
    ctx.fill();
}

function drawPacman2(c, ctx, size, pacphase) {
    ctx.beginPath();
    ctx.fillStyle = "#FFFF00";
    ctx.arc(0, 0, 1.5*size, Math.PI*(16 - pacphase)/15, 2*Math.PI - Math.PI*(16-pacphase)/15, true);
    ctx.lineTo(0.5*size, 0); // draws the center
    ctx.closePath(); // and closes the path
    ctx.fill();
}

function drawPacman(c, ctx, size, game) {
    var trans = {"x":(game.pacman.x + game.pacman.width/2)*size,
        	 "y":(game.pacman.y + game.pacman.height/2)*size }

    ctx.translate(trans.x, trans.y); // translates at x, y
    ctx.rotate((game.pacman.dir)*Math.PI/2);
    
    drawPacman1(c, ctx, size, game.pacman.pphase);
    
    ctx.rotate(-(game.pacman.dir)*Math.PI/2);
    ctx.translate(-trans.x, -trans.y);
    
    if (game.pacman.x < 0) {
        trans = {"x":(game.pacman.x + game.width + game.pacman.width/2)*size,
        	 "y":(game.pacman.y + game.pacman.height/2)*size }
	ctx.translate(trans.x, trans.y);
	ctx.rotate((game.pacman.dir)*Math.PI/2);
	drawPacman1(c, ctx, size, game.pacman.pphase);
	
	ctx.rotate(-(game.pacman.dir)*Math.PI/2);
	ctx.translate(-trans.x, -trans.y);
	
	ctx.beginPath();
	ctx.fillStyle = "#000000"; // background
	ctx.rect(game.pacman.x*size, game.pacman.y*size, -game.pacman.x*size, size*4);
	ctx.rect(game.width*size, game.pacman.y*size, -game.pacman.x*size, size*4);
	ctx.fill();
	
	return; // draws two pacmans (but only one would be valid)
    }
    if (game.pacman.y < 0) {
        trans = {"x":(game.pacman.x + game.pacman.width/2)*size,
        	 "y":(game.pacman.y + game.height + game.pacman.height/2)*size }
	ctx.translate(trans.x, trans.y);
	ctx.rotate((game.pacman.dir)*Math.PI/2);
	drawPacman1(c, ctx, size, game.pacman.pphase);
	ctx.rotate(-(game.pacman.dir)*Math.PI/2);
	ctx.translate(-trans.x, -trans.y);
	
	ctx.beginPath();
	ctx.fillStyle = "#000000"; // background
	ctx.rect(game.pacman.x*size, game.pacman.y*size, size*4, -game.pacman.y*size);
	ctx.rect(game.pacman.x*size, game.height*size, size*4, -game.pacman.y*size);
	ctx.fill();
	
	return; // draws two pacmans (but only one would be valid)
    }
}

function drawGhost(c, ctx, size, ghost, phase) {
    var trans = {"x":(ghost.x + ghost.width/2)*size,
		 "y":(ghost.y + ghost.height/2)*size};
    ctx.translate(trans.x, trans.y);

    if (ghost.e == false) { // draw body
	ctx.beginPath();
	if (ghost.w == 0)
	    ctx.fillStyle = ghost.color;
	else if (ghost.w > 48 || (ghost.w % 8 < 4))
	    ctx.fillStyle = ghost.bcolor;
	else
	    ctx.fillStyle = ghost.wcolor;
	ctx.arc(0, 0, size*1.75, 0, Math.PI, true);
	ctx.lineTo(-size*1.75, size*1.75);
	ctx.lineTo(-size*1.17, size*1.4);
	ctx.lineTo(-size*0.58, size*1.75);
	ctx.lineTo(0, size*1.4);
	ctx.lineTo(size*0.58, size*1.75);
	ctx.lineTo(size*1.17, size*1.4);
	ctx.lineTo(size*1.75, size*1.75);
	ctx.closePath();
	ctx.fill();
    }
    
    // draw eyes
    if (ghost.w == 0) {
	ctx.beginPath();
	ctx.fillStyle = "#FFFFFF";
	var position;
	switch (ghost.dir) {
	case 0:
	    position = {"x":-size*1, "y":-size*0.2};
	    break;
	case 1:
	    position = {"x":-size*0.6, "y":-size*0.6};
	    break;
	case 2:
	    position = {"x":-size*0.2, "y":-size*0.2};
	    break;
	case 3:
	    position = {"x":-size*0.6, "y":size*0.2};
	    break;
	}
	ctx.arc(position.x, position.y, size*0.55, 0, 2*Math.PI);
	ctx.arc(position.x + size*1.2, position.y, size*0.55, 0, 2*Math.PI);
	ctx.fill();
    }

    // now draws iris
    var isize;
    ctx.beginPath();
    if (ghost.w == 0) {
	ctx.fillStyle = ghost.eyecolor;
	isize = size*0.2;
	switch (ghost.dir) {
	case 0:
	    position = {"x":-size*1.3, "y":-size*0.2};
	    break;
	case 1:
	    position = {"x":-size*0.6, "y":-size*0.8};
	    break;
	case 2:
	    position = {"x":size*0.1, "y":-size*0.2};
	    break;
	case 3:
	    position = {"x":-size*0.6, "y":size*0.4};
	    break;
	}
    } else {
	if (ghost.w > 48 || (ghost.w % 8 < 4)) {
	    ctx.fillStyle = ghost.ecolor;
	    ctx.strokeStyle = ghost.ecolor;
	} else {
	    ctx.fillStyle = ghost.rcolor;
	    ctx.strokeStyle = ghost.rcolor;
	}
	isize = size*0.3;
	position = {"x":-size*0.6, "y":-size*0.4};
	ctx.lineWidth=2;
    }
    
    ctx.arc(position.x, position.y, isize, 0, 2*Math.PI);
    ctx.arc(position.x + size*1.2, position.y, isize, 0, 2*Math.PI);

    ctx.fill();

    if (ghost.w) { // if scared draw mouth
	ctx.beginPath();
	ctx.moveTo(-size*1.5, size*0.8);
	ctx.lineTo(-size*1.0, size*0.4);
	ctx.lineTo(-size*0.5, size*0.8);
	ctx.lineTo( 0       , size*0.4);
	ctx.lineTo( size*0.5, size*0.8);
	ctx.lineTo( size*1.0, size*0.4);
	ctx.lineTo( size*1.5, size*0.8);
	ctx.stroke();
    }
    
    ctx.translate(-trans.x, -trans.y);
}

function drawDots(c, ctx, dots, size, color, phase) { // draws all dots
    ctx.fillStyle = color;
    for (var i = 0; i < dots.length; i++) {
	if (dots[i].disp) { // draws only if not ate
	    if (dots[i].powerup) {
		ctx.beginPath();
		if (phase < 4)
		    ctx.arc(dots[i].x*size - 1, dots[i].y*size - 1, size*(phase+4)/10, 0, 2*Math.PI);
		else
		    ctx.arc(dots[i].x*size - 1, dots[i].y*size - 1, size*(12 - phase)/10, 0, 2*Math.PI);
		ctx.fill();
	    } else {
		ctx.beginPath();
		ctx.rect(dots[i].x*size - 1, dots[i].y*size - 1, 3, 3);
		ctx.fill();
	    }
	}
    }	
}
