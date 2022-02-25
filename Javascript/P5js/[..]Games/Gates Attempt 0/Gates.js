let objects = [];
let gates = [];
let nodes = [];
let xoff = yoff = 0;
let selected = [null, null, false];
let wire = [null, false];
let moveSpeed = 4;
let sca = 1;
let sMouseX;
let sMouseY;


function setup() {
	createCanvas(screen.width * 0.7, screen.height * 0.7);

	objects.push(nodes);
	objects.push(gates);
}


function draw() {
	background(200);

	sMouseX = mouseX / sca;
	sMouseY = mouseY / sca;

	fill(60);
	textSize(25);
	text('mouse wheel - scale', 5, height - 205);
	text('shift - type up', 5, height - 180);
	text('control - type down', 5, height - 155);
	text('n - select', 5, height - 130);
	text('b - save', 5, height - 105);
	text('v - delete', 5, height - 80);
	text('c - cut wire', 5, height - 55);
	text('x - gate', 5, height - 30);
	text('z - node', 5, height - 5);

	if (selected[2]) {
		ellipse(20, 20, 20);
	} else if (selected[0] != null) {
		ellipse(20, 40, 20);
	}

	scale(sca);

	translate(xoff, yoff);

	for (let objType of objects) {
		for (let obj of objType) {
			obj.connections();
		}
	}

	for (let objType of objects) {
		for (let obj of objType) {
			obj.update();
			if (selected[1] == obj) {
				obj.pos.x = sMouseX - xoff;
				obj.pos.y = sMouseY - yoff;
			}
		}
	}

	if (wire[1]) {
		let tmpyoff = 0;

		if (wire[0].size.length == 2) {
			tmpyoff = wire[0].size[1] / 2;

		} else {
			tmpyoff = wire[0].size / 2;
		}

		line(wire[0].pos.x, wire[0].pos.y + tmpyoff, sMouseX - xoff, sMouseY - yoff);
	}

	checkKeys();
}


function mouseWheel(event) {
	sca -= event.delta / 1000;
}


function checkKeys() {
	if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
		xoff += moveSpeed;
	}
	if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
		xoff -= moveSpeed;
	}
	if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
		yoff += moveSpeed;
	}
	if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
		yoff -= moveSpeed;
	}
}

function fixConnections() {
	for (let objType of objects) {
		for (let obj of objType) {
			for (let connection of obj.connectedTo) {
				for (let tmpobjType of objects) {
					for (let i = 0; i < tmpobjType.length; i++) {
						if (tmpobjType[i] == connection[0]) {
							connection[2] = i;
						}
					}
				}
			}
		}
	}
}


function connect(a, b) {
	if (b.inTaken == false) {
		let ind;
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i] == b) {
				ind = i;
			}
		}
		a.connectedTo.push([b, null, ind]);
		b.inTaken = true;

	} else if (b.inTaken == true) {
		console.log('No inputs left', a, b);

	} else {
		let c = null;
		for (let i = 0; i < b.inTaken.length; i++) {
			if (!b.inTaken[i]) {
				c = i;
				i = b.inTaken.length;
			}
		}

		if (c == null) {
			console.log('No inputs left:', a, b);

		} else {
			let ind;
			for (let i = 0; i < gates.length; i++) {
				if (gates[i] == b) {
					ind = i;
				}
			}
			a.connectedTo.push([b, c, ind]);
			b.inTaken[c] = true;
		}
	}
}


function mousePressed() {
	if (wire[1] == true) { // If connecting with wire
		for (let objType of objects) {
			for (let obj of objType) {
				if (obj.ontop(sMouseX - xoff, sMouseY - yoff) != null) {
					connect(wire[0], obj);
					wire[0] = null;
					wire[1] = false;
				}
			}
		}

	} else if (selected[2]) { // Want to pick something up
		for (i = 0; i < objects.length; i++) {
			for (let obj of objects[i]) {
				if (obj.ontop(sMouseX - xoff, sMouseY - yoff) != null) {
					selected[0] = i;
					selected[1] = obj;
				}
			}
		}
		selected[2] = false;

	} else if (selected[0] != null) { // Has something selected
		selected[0] = null;
		selected[1] = null;

	} else if (selected[0] == null) { // Has nothing selected and doesnt want to select
		for (let node of nodes) {
			if (node.ontop(sMouseX - xoff, sMouseY - yoff) == 0 && node.type == 0) {
				node.io[0] = !node.io[0];
			}
		}
		for (let objType of objects) {
			for (let obj of objType) {
				if (obj.ontop(sMouseX - xoff, sMouseY - yoff) == 1) {
					wire[0] = obj;
					wire[1] = true;
				}
			}
		}
	}
}


function dataSave() {
	console.log('saving');
	let data = '';
	data += 'X';
	data += xoff;
	data += 'Y';
	data += yoff;

	for (let objType of objects) {
		for (let obj of objType) {
			data += 'O';
			if (objType == nodes) {
				data += '0';
			} else {
				data += '1';
			}
			data += 'x';
			data += floor(obj.pos.x);
			data += 'y';
			data += floor(obj.pos.y);
			data += 't';
			data += obj.type;
			data += 's';
			data += obj.size;
			data += 'c';
			for (i = 0; i < obj.connectedTo.length; i++) {
				data += '/';
				if (obj.connectedTo[i][1] == null) {
					data += '0';
				} else {
					data += '1';
				}
				data += obj.connectedTo[i][2];
			}
		}
	}
	console.log(data);
}


function load(data) {
	console.log('loading');
	objects = [];
	gates = [];
	nodes = [];
	xoff = 0;
	yoff = 0;
	toConnect = [];
	objects.push(nodes);
	objects.push(gates);

	if (data.length < 1) {
		console.log('Please enter some data');

	} else {
		let tmpobj = [];
		for (let i = 0; i < data.length; i++) {
			if (data[i] == 'X') {

				let tmpxoff = '';
				i++;
				while (data[i] != 'Y') {
					tmpxoff += data[i];
					i++;
				}
				xoff = parseInt(tmpxoff, 10);

				let tmpyoff = '';
				i++;
				while (data[i] != 'O') {
					tmpyoff += data[i];
					i++;
				}
				yoff = parseInt(tmpyoff, 10);
			}

			if (data[i] == 'O') {
				tmpobj = [];
				i++;
				tmpobj.push(parseInt(data[i], 10));
				i++;

				let x = '';
				i++;
				while (data[i] != 'y') {
					x += data[i];
					i++;
				}
				x = parseInt(x, 10);
				tmpobj.push(x);

				let y = '';
				i++;
				while (data[i] != 't') {
					y += data[i];
					i++;
				}
				y = parseInt(y, 10);
				tmpobj.push(y);

				i++;
				tmpobj.push(parseInt(data[i], 10));

				i++;
				let tmpsize = [''];
				i++;
				let si = 0;
				while (data[i] != 'c') {
					if (data[i] == ',') {
						tmpsize[1] = '';
						si = 1;
						i++;
					}
					tmpsize[si] += data[i];
					i++;
				}
				for (let j = 0; j < tmpsize.length; j++) {
					tmpsize[j] = parseInt(tmpsize[j], 10);
				}
				tmpobj.push(tmpsize);

				let tmpc = [];
				let numc = -1;
				while (data[i + 1] != 'O' && data[i + 1] != null) {
					i++;
					if (data[i] == '/') {
						i++;
						tmpc.push([]);
						numc++;
						tmpc[numc].push(parseInt(data[i], 10));
						let tmpind = '';
						while (data[i + 1] != '/' && data[i + 1] != 'O' && data[i + 1] != null) {
							i++;
							tmpind += data[i];
						}
						tmpc[numc].push(parseInt(tmpind, 10));
					}
				}
				tmpobj.push(tmpc);

				if (tmpobj[0] == 0) {
					nodes.push(new node(tmpobj[1], tmpobj[2], tmpobj[3], tmpobj[4][0]));
					for (j = 0; j < tmpobj[5].length; j++) {
						toConnect.push([nodes[nodes.length - 1], tmpobj[5][j][1], tmpobj[5][j][0]]);
					}

				} else {
					gates.push(new gate(tmpobj[1], tmpobj[2], tmpobj[3], tmpobj[4]));
					for (j = 0; j < tmpobj[5].length; j++) {
						toConnect.push([gates[gates.length - 1], tmpobj[5][j][1], tmpobj[5][j][0]]);
					}
				}
			}
		}
		for (let connection of toConnect) {
			connect(connection[0], objects[connection[2]][connection[1]]);
		}
	}
}


function keyPressed() {
	if (selected[0] != null) {
		if (keyCode === 67 || keyCode === 86) {

			for (let connection of selected[1].connectedTo) {

				if (connection[1] == null) {
					connection[0].inTaken = false;

				} else {
					connection[0].inTaken[connection[1]] = false;
				}
			}
			selected[1].connectedTo = [];

		}

		if (keyCode === 86) {
			for (let objType of objects) {
				for (let i = 0; i < objType.length; i++) {
					if (objType[i] == selected[1]) {
						objType.splice(i, 1);
						selected[0] = null;
						selected[1] = null;
						fixConnections();
					}
				}
			}
		}

		let lim;
		if (selected[0] == 0) {
			lim = 2;
		} else if (selected[0] == 1) {
			lim = 3;
		}

		if (keyCode === SHIFT && selected[1].type < lim) {
			selected[1].type++;
		}

		if (keyCode === CONTROL && selected[1].type > 0) {
			selected[1].type--;
		}

	} else {
		if (keyCode == 66) {
			dataSave();
		}

		if (keyCode === 67 && wire[1] == true) {
			wire[1] = false;
			wire[0] = null;
		}

		if (keyCode === 78) {
			selected[2] = !selected[2];

		}

		if (keyCode === 90) {
			nodes.push(new node(sMouseX - xoff, sMouseY - yoff, 0, 20));
			selected[0] = 0;
			selected[1] = nodes[nodes.length - 1];
			selected[2] = false;

		} else if (keyCode === 88) {
			gates.push(new gate(sMouseX - xoff, sMouseY - yoff, 0, [35, 20]));
			selected[0] = 1;
			selected[1] = gates[gates.length - 1];
			selected[2] = false;
		}
	}
}