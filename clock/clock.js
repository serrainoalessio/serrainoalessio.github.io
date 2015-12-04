"use strict"
function draw() {
    var c = document.getElementById("mycanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height); // clear the canvas

    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    // h is in range 0-24
    // m is in range 0-60
    // s is in range 0-60
    // h : 24 = x * 2*Pi  x = 2*Pi*h/24

    var qsize = Math.min(c.width, c.height)/2 - 12;
    drawQuadrant(c, ctx, qsize, "rgb(255, 255, 200)", "rgb(0, 0, 0)", 18);
    // finally draw the hands
    // add a small correction for minutes and hours
    m += s/60;
    h += m/60;
    drawHand(c, ctx, 2*Math.PI*h/12, 0.50*qsize, "rgb(75, 75, 75)",
             "rgb(0, 0, 0)", 1);
    drawHand(c, ctx, 2*Math.PI*m/60, 0.84*qsize, "rgb(75, 75, 75)",
             "rgb(0, 0, 0)", 1);
    drawHand(c, ctx, 2*Math.PI*s/60, 0.90*qsize, "rgb(255, 75, 75)",
             "rgb(255, 0, 0)", 1);

    writeTime(today);
    var t = setTimeout(draw, 500);
}

function drawSegments(c, ctx, size, size1, size2, width1, width2) {
    ctx.save(); // save settings
    ctx.translate(c.width/2, c.height/2);
    for (var i = 0; i < 60; i++) {
	ctx.beginPath();
	if (i % 5 == 0) {
	    ctx.lineWidth = width1;
	    ctx.moveTo(0, size);
	    ctx.lineTo(0, size1*size);
	} else {
	    ctx.lineWidth = width2;
	    ctx.moveTo(0, size);
	    ctx.lineTo(0, size2*size);
	}
	ctx.stroke();
	ctx.rotate(2*Math.PI/60); // rotate a little bit
    }
    ctx.restore(); // restore settings
}

function drawNumbers(c, ctx, size, spawn, font, color) {
    var m; // measure of the text
    var x, y;

    ctx.translate(c.width/2, c.height/2);
    ctx.lineWidth = 1;
    for (var i = 1; i <= 12; i++) {
	x =   Math.sin(2*Math.PI*i/12)*size*spawn;
	y = - Math.cos(2*Math.PI*i/12)*size*spawn;
	ctx.beginPath();
	ctx.fillStyle = color;
        ctx.font = font;
	m = ctx.measureText(+i);
	ctx.textBaseline="middle";
	ctx.fillText(+i, x - m.width/2, y);
    }
    ctx.translate(-c.width/2, -c.height/2); // translate back
}

function drawQuadrant(c, ctx, size, fillcolor, bordercolor, thickness) {
    ctx.fillStyle = fillcolor;
    ctx.strokeStyle = bordercolor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.arc(c.width/2, c.height/2, size, 0, 2*Math.PI);
    ctx.stroke();
    ctx.fill();
    // Draw segments
    drawSegments(c, ctx, size, 0.9, 0.95, 3, 2);
    // Now draw numbers
    drawNumbers(c, ctx, size, 0.8, "42px Calibri", "#000000");
}

function drawHand(c, ctx, angle, size, fillcolor, bordercolor, thickness) {
    ctx.save();
    ctx.beginPath();
    
    ctx.translate(c.width/2, c.height/2); // move to the center
    ctx.rotate(angle);
    
    ctx.strokeStyle = bordercolor;
    ctx.fillStyle = fillcolor;
    ctx.lineWidth = thickness;
    ctx.moveTo(0.0, 0.2*size);
    ctx.lineTo(0.04*Math.cos( 1)*size, 0.04*Math.sin( 1)*size);
    ctx.arc(0, 0, 0.04*size, 1, -1, true);
    ctx.lineTo(0.04*Math.cos(-1)*size, 0.04*Math.sin(-1)*size);
    ctx.lineTo(0.0, -1.0*size);
    ctx.lineTo(-0.04*Math.cos(-1)*size, 0.04*Math.sin(-1)*size);
    ctx.arc(0, 0, 0.04*size, 1 + Math.PI, -1 + Math.PI, true);
    ctx.lineTo(-0.04*Math.cos( 1)*size, 0.04*Math.sin( 1)*size);
    ctx.closePath(); // close the line
    ctx.fill(); // fill the hand
    ctx.stroke(); // stroke the hand outline
    ctx.beginPath();
    ctx.fillStyle = "#333333";
    ctx.arc(0, 0, 0.02*size, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
}

function writeTime(displaytime) {
    var months = ["January", "February", "March", "April",
		  "May", "June", "July", "August",
		  "September", "October", "November", "December" ];
    var displayText = "Today is ";

    var day = displaytime.getDate();
    
    if (day == 1 || day == 21)
	displayText += +day + "st";
    else if (day == 2 || day == 22)
	displayText += +day + "nd";
    else if (day == 3 || day == 23)
	displayText += +day + "rd";
    else
	displayText += +day + "th";

    displayText += " of " + months[displaytime.getMonth()] +
	" "    + displaytime.getFullYear();

    var h = displaytime.getHours();
    if (h >= 10)
	displayText += " " + h;
    else
	displayText += " 0" + h;

    var m = displaytime.getMinutes();
    if (m >= 10)
	displayText += ":" + m;
    else
	displayText += ":0" + m;

    var s = displaytime.getSeconds();
    if (s >= 10)
	displayText += ":" + s;
    else
	displayText += ":0" + s;

    document.getElementById("time").innerHTML = displayText;
}

