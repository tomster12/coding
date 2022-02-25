class node {


	constructor(x, y, t, s) {
		this.pos = createVector(x, y);
		this.type = t;
		this.size = s;
		this.io = [false, false];
		this.connectedTo = [];
		this.inTaken = false;
	}


	update() {
		this.logic();
		this.show();
		this.output();
	}


	show() {
		let c = [];
		if (this.io[1]) {
			c = [200, 200, 200];
		} else {
			c = [170, 170, 170];
		}
		if (this.type != 0) {
			c[this.type - 1] = 255;
		}
		fill(c[0], c[1], c[2]);
		ellipse(this.pos.x, this.pos.y, this.size);

		ellipse(this.pos.x, this.pos.y + this.size / 2, 8);
		ellipse(this.pos.x, this.pos.y - this.size / 2, 4);
	}


	logic() {
		if (this.type != 2) {
			this.io[1] = this.io[0];
		} else {
			this.io[1] = !this.io[0];
		}
	}


	ontop(x, y) {
		if (dist(x, y, this.pos.x, this.pos.y + this.size / 2) < 4) {
			return 1;

		} else if (dist(x, y, this.pos.x, this.pos.y) < this.size / 2) {
			return 0;
		}
	}


	output() {
		for (let connection of this.connectedTo) {

			if (connection[1] != null) {
				connection[0].io[0][connection[1]] = this.io[1];

			} else {
				connection[0].io[0] = this.io[1];
			}
		}
	}


	connections() {
		for (let connection of this.connectedTo) {
			line(this.pos.x, this.pos.y + this.size / 2, connection[0].pos.x, connection[0].pos.y - this.size / 2);
		}
	}
}