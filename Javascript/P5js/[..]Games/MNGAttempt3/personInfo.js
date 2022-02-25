// ---------------------------------------------------------------------------------------------------------------------------------


function DPersonInfo() {
	translate(1400, 200);
	if (playing && personSelected != null) {
		personSelected.colourF();
		ellipse(130, -170, 40);

		fill(100);
		textSize(35);
		text(personSelected.name[0] + ' ' + personSelected.name[1], 0, -165);

		let g = '';
		if (personSelected.selected == 0) {
			g = 'Boy';
		} else {
			g = 'Girl';
		}

		textSize(20);
		noStroke();
		fill(100);
		text('Age: ' + personSelected.age, 0, -140);
		text('Gender: ' + g, 0, -115);
		text('Happiness: ' + personSelected.happinessTotal, 0, -90);
		text('Mood: ' + personSelected.mood, 0, -65);
		text('Work Rate: ' + personSelected.workRate, 0, -40);
		text('Weekly Work Done: ' + personSelected.weeklyWorkDone, 0, -15);
		text('Wage: ' + personSelected.wage + ' / Hour', 0, 10);
		text('Work Threshold: ' + personSelected.workThreshold, 0, 35);
		let iln = 'None';
		if (personSelected.illness[0] > 0) {
			iln = personSelected.illness[2];
		}
		text('Illness: ' + iln, 0, 60);
		text('Illness Time: ' + personSelected.illness[0], 0, 85);

		textSize(23);
		text('Relations', -130, 60);
		textSize(20);
		for (let i = 0; i < personSelected.relations.length; i++) {
			text(personSelected.relations[i][0].name[0] + ' ' + personSelected.relations[i][0].name[1] + ': ' + personSelected.relations[i][1], -130, 85 + i * 25);
		}

		textSize(23);
		text('Work Hours', 130, -115);
		textSize(20);
		for (let i = 0; i < personSelected.workConditions[0].length; i++) {
			text(personSelected.workConditions[0][i][0] + ':00 - ' + personSelected.workConditions[0][i][1] + ':00', 130, -90 + i * 25);
		}

		textSize(23);
		text('Work Conditions', 130, 60);
		textSize(20);
		if (personSelected.workConditions[1].length == 0 && !personSelected.illness[0]) {
			text('None!', 130, 85);
		} else {
			for (let i = 0; i < personSelected.workConditions[1].length; i++) {
				text(personSelected.workConditions[1][i][0], 130, 85 + i * 25);
			}
			if (personSelected.illness[0]) {
				text(personSelected.illness[2], 130, 85 + (personSelected.workConditions[1].length) * 25);
			}
		}

		textSize(23);
		if (personSelected.happiness.length > 3) {
			sliders[3].range[1] = personSelected.happiness.length - 3;
		} else {
			sliders[3].range[1] = 0;
		}

		text('Happiness (' + personSelected.happiness.length + ')', -130, -115);
		textSize(20);

		let hl = 0;
		let ll = 0;
		hl = personSelected.happiness.length - 1 - floor(sliders[3].value);
		if (personSelected.happiness.length > 3) {
			ll = personSelected.happiness.length - 3 - floor(sliders[3].value);
		}

		for (let i = hl, j = 0; i >= ll; i--, j++) {
			text(personSelected.happiness[i][0] + ': ' + personSelected.happiness[i][1], -130, -90 + j * 25);
		}

		if (personSelected.happiness.length >= 4) {
			stroke(100);
			noFill();
			ellipse(-145, -25, 10);
			ellipse(-130, -25, 10);
			ellipse(-115, -25, 10);
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------
