// ---------------------------------------------------------------------------------------------------------------------------------


// General
let fnt;
let loaded = false;
let mstVolume = 1;
let musicVolume = 1;
let sfxVolume = 1;
let sfxs = [];
let music = [];
let images = [];
let offset = 0;
let arrows = [];
let sliders = [];
let screenPosition = [0, 0];
let notifications = [];
let screens = [
	[1, -1],
	[0, 0],
	[1, 0],
	[2, 0],
	[3, 0]
];


function preload() { // #2
	loadImages();
	loadSounds();
	fnt = loadFont('other/font.ttf');
}


function loadImages() {
	images.push(loadImage('image/arrow1.png'));
	images.push(loadImage('image/arrow2.png'));
	images.push(loadImage('image/arrow3.png'));
	images.push(loadImage('image/brush.png'));
}


function loadSounds() {
	sfxs.push(loadSound('sound/sfx/click1.wav'));
	sfxs.push(loadSound('sound/sfx/click2.wav'));
	sfxs.push(loadSound('sound/sfx/click3.wav'));
	sfxs.push(loadSound('sound/sfx/click4.wav'));
	sfxs.push(loadSound('sound/sfx/click5.wav'));
	sfxs.push(loadSound('sound/sfx/click6.wav'));
	sfxs.push(loadSound('sound/sfx/tink1.wav'));
	music.push(loadSound('sound/music/music1.mp3', function play(s) {
		s.loop();
		loaded = true;
	}));
}


// ---------------------------------------------------------------------------------------------------------------------------------


function setup() { // #3
	createCanvas(400, 400);
	offset = createVector(0, 0);

	textFont(fnt);
	noSmooth();
	rectMode(CENTER);
	textAlign(CENTER);
	imageMode(CENTER);

	SArrows();
	SMenuButtons();
	SGameButtons();
	SSliders();
}


function SArrows() {
	arrows.push(new arrow(350, 200, 0, false, 30));
	arrows.push(new arrow(450, 200, 2, false, 30));
	arrows.push(new arrow(600, 50, 3, false, 30));
	arrows.push(new arrow(600, -50, 1, false, 30));
	arrows.push(new arrow(750, 200, 0, true, 30));
	arrows.push(new arrow(850, 200, 2, false, 30));
	arrows.push(new arrow(1160, 200, 0, false, 30));
	arrows.push(new arrow(1250, 200, 2, false, 30));
}


function SSliders() {
	// x, y, length, thickness, range, ceX
	sliders.push(new slider(550, -250, 100, 15, [0, 1], 0.5));
	sliders.push(new slider(550, -225, 100, 15, [0, 1], 0.5));
	sliders.push(new slider(550, -200, 100, 15, [0, 1], 1));
	sliders.push(new slider(1245, 50, 50, 15, [0, 1], 0));
}


// ---------------------------------------------------------------------------------------------------------------------------------


function draw() { // #4
	background(240);

	if (loaded) {
		translate(-offset.x, -offset.y);
		noStroke();

		DScreenChange();

		DArrows();
		DSliders();

		DIntro();
		DMenu();
		DSettings();
		DGame();
		DPersonInfo();

	} else {
		textSize(50);
		fill(100);
		text('Loading...', 200, 200);
	}
}


function DArrows() {
	for (let arw of arrows) {
		arw.show();

		if (arw.ontop(mouseX + offset.x, mouseY + offset.y) && !arw.lock) {
			arw.highlighted = true;
		} else {

			arw.highlighted = false;
		}
	}
}


function DSliders() {
	for (i = 0; i < sliders.length; i++) {
		sliders[i].show();
		sliders[i].ontop(mouseX + offset.x, mouseY + offset.y, 0);
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function keyPressed() {
	KPGlobal();
}


function KPGlobal() {
	let moving = false;
	let moveTo = screenPosition.slice();

	switch(keyCode) {
		case LEFT_ARROW:
			moveTo[0]--;
			moving = true;
			break;

		case UP_ARROW:
			moveTo[1]--;
			moving = true;
			break;

		case RIGHT_ARROW:
			moveTo[0]++;
			moving = true;
			break;

		case DOWN_ARROW:
			moveTo[1]++;
			moving = true;
			break;
	}

	if (moving) {
		gameButtons[0].selected = false;
		gameButtons[1].selected = false;
		regimePaint = null;
		screenChangePick(moveTo);
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function mousePressed() { // #10
	if (regimePaint != null) { // Click on regime
		regimeInteract();
	}
	MPArrows();
	MPMenuButtons();
	MPGame();
}


function MPArrows() {
	for (let arw of arrows) {
		if (arw.ontop(mouseX + offset.x, mouseY + offset.y)) {
			let moveTo = screenPosition.slice();

			if (arw.dir == 0) {
				moveTo[0]++;
			}
			if (arw.dir == 1) {
				moveTo[1]++;
			}
			if (arw.dir == 2) {
				moveTo[0]--;
			}
			if (arw.dir == 3) {
				moveTo[1]--;
			}

			screenChangePick(moveTo);
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function mouseReleased() { // #11
	MRSliders();
}


function MRSliders() {
	for (i = 0; i < sliders.length; i++) {
		sliders[i].selected = false;
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function mouseDragged() { // #12
	if (regimePaint != null) { // Click on regime
		regimeInteract();
	}
	MDSliders();
}


function MDSliders() {
	for (i = 0; i < sliders.length; i++) {
		sliders[i].ontop(mouseX + offset.x, mouseY + offset.y, 1);
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function rnd2(n) {
	return parseFloat(n.toFixed(2));
}


// ---------------------------------------------------------------------------------------------------------------------------------
