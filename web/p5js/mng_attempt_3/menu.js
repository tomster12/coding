// ---------------------------------------------------------------------------------------------------------------------------------


let menuButtons = [];


function SMenuButtons() {
	menuButtons.push(new arrow(660, 200, 3, false, 15, 0));
	menuButtons.push(new arrow(680, 200, 1, false, 15, 0));
	menuButtons.push(new arrow(500, 270, 0, false, 50, 1));
}


// ---------------------------------------------------------------------------------------------------------------------------------


function DMenu() {
	push();
	translate(600, 200);


	if (playing) {
		arrows[4].lock = false;
		menuButtons[0].lock = true;
		menuButtons[1].lock = true;

	} else {
		arrows[4].lock = true;
		menuButtons[0].lock = false;
		menuButtons[1].lock = false;
	}


	fill(100);
	textSize(65);
	text('Menu', 0, -60);


	textSize(30);
	let ply = '';
	if (playing) {
		ply = 'Playing';
	} else {
		ply = 'Not Playing';
	}
	text(ply, 0, 82.5);

	fill(200, 100, 100);
	if (playCheck) {
		text('Are you sure you want to quit?', 0, 160);
		playCheckTime++;
		if (playCheckTime > 400) {
			playCheckTime = 0;
			playCheck = false;
		}
	}


	fill(100);
	text('Difficulty', -60, 5);
	let dif = '';
	if (difficulty == 0) {
		dif = 'easy';
		fill(100, 200, 100);

	} else if (difficulty == 1) {
		dif = 'normal';
		fill(200, 150, 100);

	} else if (difficulty == 2) {
		dif = 'hard';
		fill(200, 100, 100);
	}
	text(dif, 10, 5);
	pop();


	for (let mnBtn of menuButtons) {
		mnBtn.show();

		if (mnBtn.ontop(mouseX + offset.x, mouseY + offset.y) && !mnBtn.lock) {
			mnBtn.highlighted = true;

		} else {
			mnBtn.highlighted = false;
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function MPMenuButtons() {
	for (let mnBtn of menuButtons) {
		if (mnBtn.type == 0) {
			if (mnBtn.ontop(mouseX + offset.x, mouseY + offset.y) && !mnBtn.lock) { // Difficulty Buttons
				if (difficulty < 2 && mnBtn.dir == 3) {
					difficulty++;
				} else if (difficulty > 0 && mnBtn.dir == 1) {
					difficulty--;
				}
				sfxs[2].play();
			}

		} else if (mnBtn.type == 1) {
			if (mnBtn.ontop(mouseX + offset.x, mouseY + offset.y) && !mnBtn.lock) { // PLay Button
				if (playing) {
					if (playCheck) { // Exit game
						playing = false;
						personSelected = null;
						regimePaint = null;
						playCheck = false;
						gameTime = 0;
						people = [];
						sfxs[1].play();

					} else { // Check if they want to exit game
						playCheck = true;
						playCheckTime = 0;
						sfxs[0].play();
					}


				} else { // Start game
					startGame();
					arrows[4].lock = false;
					screenChangePick([2, 0], false);
					sfxs[1].play();
				}

			} else { // CLicking off of button
				playCheck = false;
			}
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------
