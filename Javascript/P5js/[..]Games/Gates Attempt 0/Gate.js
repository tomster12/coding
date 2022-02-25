class gate {


	constructor(x, y, t, s) {
		this.pos = createVector(x, y);
		this.type = t;
		this.size = [s[0], s[1]];
		this.ioN = [2, 1];
		this.connectedTo = [];
		this.io = [
			[],
			[]
		];
		for (let j = 0; j < 2; j++) {
			for (let i = 0; i < this.ioN[j]; i++) {
				this.io[j].push(false);
			}
		}
		this.inTaken = [];
		for (let i = 0; i < this.ioN[0]; i++) {
			this.inTaken.push(false);
		}
	}


	update() {
		this.logic(this.io[0], this.type);
		this.show();
		this.output();
	}


	show() {
		let c = [140, 140, 140];
		if (this.type != 0) {
			c[this.type - 1] = 255;
		}
		fill(c[0], c[1], c[2]);

		rectMode(CENTER);
		rect(this.pos.x, this.pos.y, this.size[0], this.size[1]);

		for (let j = 0; j < 2; j++) {
			for (let i = 0; i < this.ioN[j]; i++) {
				if (this.io[j][i]) {
					fill(220, 220, 220);
				} else {
					fill(170, 170, 170);
				}
				ellipse(this.pos.x - this.size[0] / 2 + (this.size[0] / (this.ioN[j] + 1)) * (i + 1), this.pos.y + (this.size[1] / 8) * Math.pow(-1, j + 1), 5);
			}
		}

		ellipse(this.pos.x, this.pos.y + this.size[1] / 2, 8);
		ellipse(this.pos.x, this.pos.y - this.size[1] / 2, 4);
	}


	logic(io, type) {
		let out = false;

		if (this.type == 0) {
			out = true;
			for (let i = 0; i < io.length; i++) {
				if (!io[i]) {
					out = false;
				}
			}

		} else if (this.type == 1) {
			for (let i = 0; i < io.length; i++) {
				if (io[i]) {
					out = true;
				}
			}

		} else if (this.type == 2) {
			for (let i = 0; i < io.length; i++) {
				if (!io[i]) {
					out = true;
				}
			}

		} else if (this.type == 3) {
			for (let i = 0; i < io.length; i++) {
				if (io[i]) {
					out = !out;
				}
			}
		}

		this.io[1][0] = out;
	}


	ontop(x, y) {
		if (dist(x, y, this.pos.x, this.pos.y + this.size[1] / 2) < 4) {
			return 1;

		} else if (x > this.pos.x - this.size[0] / 2 && x < this.pos.x + this.size[0] / 2 && y > this.pos.y - this.size[1] / 2 && y < this.pos.y + this.size[1] / 2) {
			return 0;
		}
	}


	output() {
		for (let connection of this.connectedTo) {
			if (connection[1] != null) {
				connection[0].io[0][connection[1]] = this.io[1][0];

			} else {
				connection[0].io[0] = this.io[1][0];
			}
		}
	}

	connections() {
		for (let connection of this.connectedTo) {
			let tmpyoff = 0;

			if (connection[1] == null) {
				tmpyoff = connection[0].size / 2;

			} else {
				tmpyoff = connection[0].size[1] / 2;
			}

			line(this.pos.x, this.pos.y + this.size[1] / 2, connection[0].pos.x, connection[0].pos.y - tmpyoff);
		}
	}
}