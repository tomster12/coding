// ---------------------------------------------------------------------------------------------------------------------------------


let difficulty = 0;
let gameTime = 0;
let money = 2000;
let workDone = 0;
let playing = false;
let playCheck = false;
let personSelected = null;
let regimePaint = null;
let people = [];
let regime = [];
let gameDate = [];
let gameButtons = [];
let names = [
	['Noah', 'Liam', 'Mason', 'Jacob', 'William', 'Ethan', 'James', 'Alexander', 'Michael', 'Benjamin', 'Elijah', 'Daniel', 'Aiden', 'Logan', 'Matthew', 'Lucas', 'Jackson', 'David', 'Oliver', 'Jayden', 'Joseph', 'Gabriel', 'Samuel', 'Carter', 'Anthony', 'John', 'Dylan', 'Luke', 'Henry', 'Andrew', 'Isaac', 'Christopher', 'Joshua', 'Wyatt', 'Sebastian', 'Owen', 'regeb', 'Nathan', 'Ryan', 'Jack', 'Hunter', 'Levi', 'Christian', 'Jaxon', 'Julian', 'Landon', 'Grayson', 'Jonathan', 'Isaiah', 'Charles', 'Thomas', 'Aaron', 'Eli', 'Connor', 'Jeremiah', 'Cameron', 'Josiah', 'Adrian', 'Colton', 'Jordan', 'Brayden', 'Nicholas', 'Robert', 'Angel', 'Hudson', 'Lincoln', 'Evan', 'Dominic', 'Austin', 'Gavin', 'Nolan', 'Parker', 'Adam', 'Chase', 'Jace', 'Ian', 'Cooper', 'Easton', 'Kevin', 'Jose', 'Tyler', 'Brandon', 'Asher', 'Jaxson', 'Mateo', 'Jason', 'Ayden', 'Zachary', 'Carson', 'Xavier', 'Leo', 'Ezra', 'Bentley', 'Sawyer', 'Kayden', 'Blake', 'Nathaniel', 'Ryder', 'Theodore', 'Elias', 'Tristan', 'Roman', 'Leonardo', 'Camden', 'Brody', 'Luis', 'Miles', 'Micah', 'Vincent', 'Justin', 'Greyson', 'Declan', 'Maxwell', 'Juan', 'Cole', 'Damian', 'Carlos', 'Max', 'Harrison', 'Weston', 'Brantley', 'Braxton', 'Axel', 'Diego', 'Abel', 'Wesley', 'Santiago', 'Jesus', 'Silas', 'Giovanni', 'Bryce', 'Jayce', 'Bryson', 'Alex', 'Everett', 'George', 'Eric', 'Ivan', 'Emmett', 'Kaiden', 'Ashton', 'Kingston', 'Jonah', 'Jameson', 'Kai', 'Maddox', 'Timothy', 'Ezekiel', 'Ryker', 'Emmanuel', 'Hayden', 'Antonio', 'Bennett', 'Steven', 'Richard', 'Jude', 'Luca', 'Edward', 'Joel', 'Victor', 'Miguel', 'Malachi', 'King', 'Patrick', 'Kaleb', 'Bryan', 'Alan', 'Marcus', 'Preston', 'Abraham', 'regvin', 'Colin', 'Bradley', 'Jeremy', 'Kyle', 'Graham', 'Grant', 'Jesse', 'Kaden', 'Alejandro', 'Oscar', 'Jase', 'Karter', 'Maverick', 'Aidan', 'Tucker', 'Avery', 'Amir', 'Brian', 'Iker', 'Matteo', 'Caden', 'Zayden', 'Riley', 'August', 'Mark', 'Maximus', 'Brady', 'Kenneth', 'Paul'],

	['Emma', 'Olivia', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Abigail', 'Emily', 'Charlotte', 'Harper', 'Madison', 'Amelia', 'Elizabeth', 'Sofia', 'Evelyn', 'Avery', 'Chloe', 'Ella', 'Grace', 'Victoria', 'Aubrey', 'Scarlett', 'Zoey', 'Addison', 'Lily', 'Lillian', 'Natalie', 'Hannah', 'Aria', 'Layla', 'Brooklyn', 'Alexa', 'Zoe', 'Penelope', 'Riley', 'Leah', 'Audrey', 'Savannah', 'Allison', 'Samantha', 'Nora', 'Skylar', 'Camila', 'Anna', 'Paisley', 'Ariana', 'Ellie', 'Aaliyah', 'Claire', 'Violet', 'Stella', 'Sadie', 'Mila', 'Gabriella', 'Lucy', 'Arianna', 'Kennedy', 'Sarah', 'Madelyn', 'Eleanor', 'Kaylee', 'Caroline', 'Hazel', 'Hailey', 'Genesis', 'Kylie', 'Autumn', 'Piper', 'Maya', 'Nevaeh', 'Serenity', 'Peyton', 'Mackenzie', 'Bella', 'Eva', 'Taylor', 'Naomi', 'Aubree', 'Aurora', 'Melanie', 'Lydia', 'Brianna', 'Ruby', 'Katherine', 'Ashley', 'Alexis', 'Alice', 'Cora', 'Julia', 'Madeline', 'Faith', 'Annabelle', 'Alyssa', 'Isabelle', 'Vivian', 'Gianna', 'Quinn', 'Clara', 'Reagan', 'Khloe', 'Alexandra', 'Hadley', 'Eliana', 'Sophie', 'London', 'Elena', 'Kimberly', 'Bailey', 'Maria', 'Luna', 'Willow', 'Jasmine', 'Kinsley', 'Valentina', 'Kayla', 'Delilah', 'Andrea', 'Natalia', 'Lauren', 'Morgan', 'Rylee', 'Sydney', 'Adalynn', 'Mary', 'Ximena', 'Jade', 'Liliana', 'Brielle', 'Ivy', 'Trinity', 'Josephine', 'Adalyn', 'Jocelyn', 'Emery', 'Adeline', 'Jordyn', 'Ariel', 'Everly', 'Lilly', 'Paige', 'Isla', 'Lyla', 'Makayla', 'Molly', 'Emilia', 'Mya', 'Kendall', 'Melody', 'Isabel', 'Brooke', 'Mckenzie', 'Nicole', 'Payton', 'Margaret', 'Mariah', 'Eden', 'Athena', 'Amy', 'Norah', 'Londyn', 'Valeria', 'Sara', 'Aliyah', 'Angelina', 'Gracie', 'Rose', 'Rachel', 'Juliana', 'Laila', 'Brooklynn', 'Valerie', 'Alina', 'Reese', 'Elise', 'Eliza', 'Alaina', 'Raelynn', 'Leilani', 'Catherine', 'Emerson', 'Cecilia', 'Genevieve', 'Daisy', 'Harmony', 'Vanessa', 'Adriana', 'Presley', 'Rebecca', 'Destiny', 'Hayden', 'Julianna', 'Michelle', 'Adelyn', 'Arabella', 'Summer', 'reglie', 'Kaitlyn', 'Ryleigh', 'Lila', 'Daniela'],

	['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson', 'Mcdonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford', 'Henry', 'Boyd', 'Mason', 'Morales', 'Kennedy', 'Warren', 'Dixon', 'Ramos', 'Reyes', 'Burns', 'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Hunt', 'Black', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Grant', 'Knight', 'Ferguson', 'Rose', 'Stone', 'Hawkins', 'Dunn', 'Perkins', 'Hudson', 'Spencer', 'Gardner', 'Stephens', 'Payne', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray', 'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews', 'Ruiz', 'Harper', 'Fox', 'Riley', 'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence', 'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson']
]


// ---------------------------------------------------------------------------------------------------------------------------------


function SGameButtons() {
	// constructor(x, y, s, t, n, sc)
	gameButtons.push(new button(-45, 180, 25, 0, 0, 0));
	gameButtons.push(new button(-10, 180, 25, 0, 1, 0));
	gameButtons.push(new button(-88, 180, 20, 0, 2, 0));
}


// ---------------------------------------------------------------------------------------------------------------------------------


function startGame() {
	playing = true;
	gameDate = [0, 5, 0];
	money = 2000;
	workDone = 0;
	people = [];
	for (i = 0; i < difficulty + 3; i++) {
		people.push(new person(25, i));
	}

	regime = [];
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 12; j++) {
			regime.push(new regimeHour(createVector(25, 25), createVector(i, j)));
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function DGame() {
	push();
	translate(1000, 200);


	if (playing) {
		gameTime++;

		workDone = rnd2(workDone);
		money = rnd2(money);

		if (personSelected != null) {
			arrows[6].lock = false;
		} else {
			arrows[6].lock = true;
		}

		let seconds = gameTime / 60;
		let minutes = seconds / 60;
		let hours = minutes / 60;
		let showTime = [seconds, minutes, hours];
		showTime[0] = floor(showTime[0] % 60);
		showTime[1] = floor(showTime[1] % 60);
		showTime[2] = floor(showTime[2]);
		for (let i = 0; i < showTime.length; i++) {
			showTime[i] = showTime[i].toString();
			if (showTime[i].length == 1) {
				showTime[i] = '0' + showTime[i];
			}
		}
		let time = showTime[2] + ':' + showTime[1] + ':' + showTime[0];
		textSize(20);
		fill(100);
		text(time, -160, -180);

		gameDate[0] = (minutes * 24);
		gameDate[1] = minutes;
		gameDate[2] = gameDate[1] / 7;
		showDate = [floor(gameDate[0] % 24), floor(gameDate[1] % 7) + 1, floor(gameDate[2])];
		fill(100);
		text('Week: ' + showDate[2], -160, -160);
		text('Day: ' + showDate[1], -160, -140);
		text('Hour: ' + showDate[0], -160, -120);

		textSize(18);
		text('Money: £' + money, 155, -180);
		text('Work Done: ' + workDone, 155, -160);

		if (floor(gameDate[2]) == gameDate[2]) { // Week
			for (let prsn1 of people) {
				prsn1.tickWeek();
				money += workDone;
				workDone = 0;
			}


		} else if (floor(gameDate[1]) == gameDate[1]) { // Day
			for (let prsn1 of people) {
				prsn1.tickDayRelations();
			}
			for (let prsn1 of people) {
				prsn1.tickDay();
			}


		} else if (floor(gameDate[0]) == gameDate[0]) { // Hour
			for (let prsn1 of people) {
				prsn1.tickHour();
			}

			if ((gameDate[0] % 24) > 7 && (gameDate[0] % 24) <= 19) {
				sfxs[5].play();

				let tr1 = createVector(-60 - 60 - 10, -137.5 + (constrain(gameDate[0] % 24, 7, 19) - 7) * 25 - 1); // Do Work
				let tr2 = createVector(-60 + (gameDate[1] % 7) * 25 - 1, -137.5 - 15 - 10);
				let overtop = createVector(tr2.x, tr1.y);
				for (let regG3 of regime) {
					if (regG3.ontop(overtop.x + 1000, overtop.y + 200)) {
						if (regime[regG3.regimePosition.y + regG3.regimePosition.x * 12].assigned != null) {

							regime[regG3.regimePosition.y + regG3.regimePosition.x * 12].assigned.doWork(regG3.regimePosition);
							workDone += regime[regG3.regimePosition.y + regG3.regimePosition.x * 12].assigned.workRate * 10;
							money -= regime[regG3.regimePosition.y + regG3.regimePosition.x * 12].assigned.wage;
						}
					}
				}
			}
		}


		for (let prsn of people) { // Show highlighted Person
			prsn.update();

			if (prsn.ontop(mouseX + offset.x, mouseY + offset.y)) {
				prsn.highlighted = true;

			} else {
				prsn.highlighted = false;
			}
		}

		for (let regG1 of regime) {
			regG1.update();
		}

		regimeLines();
		regimeText();

		if (personSelected != null) { // Show Selected PersonsInformations
			fill(100);

			let h = 0;
			if (personSelected.happinessTotal > 99) {
				h = '99+';
			} else if (personSelected.happinessTotal < -99) {
				h = '-99+';
			} else {
				h = personSelected.happinessTotal;
			}

			textSize(23);
			text(personSelected.name[0], 160, -120);
			text(personSelected.name[1], 160, -100);

			textSize(20);
			text(personSelected.wage + ' / Hour', 160, -80);
			textSize(16);
			text('Happiness: ' + h, 160, -65);
			text('Stress: ' + personSelected.stress, 160, -50);
			text('Mood: ' + personSelected.mood, 160, -35);
			let iln = 'None';
			if (personSelected.illness[0] > 0) {
				iln = personSelected.illness[2];
			}
			text('Illness: ' + iln, 160, -20);

			text('Work', 160, 30);
			text('Rate: ' + personSelected.workRate, 160, 45);
			text('Threshold: ' + personSelected.workThreshold, 160, 60);
			text('Amount: ' + personSelected.regimePositions.length, 160, 75);
			text('Weekly: ' + personSelected.weeklyWorkDone, 160, 90);
			text('Has worked: ' + personSelected.workToday[0], 160, 105);
		}

		for (let regG2 of regime) { // Show Selected regimes Name and Age
			if (regG2.selected) {
				if (regG2.assigned != null) {
					fill(100);
					textSize(25);
					text(regG2.assigned.name[0], -150, -50);
					text(regG2.assigned.name[1], -150, -30);
					textSize(15);
					text('Age: ' + regG2.assigned.age, -150, 45);
				}
			}
		}

		let ll = 0;
		if (notifications.length > 10) {
			ll = notifications.length - 10;
			fill(100);
			noStroke();
			ellipse(20, 180, 6);
		}

		for (let nt of notifications) {
			nt.update();
		}

		for (let i = notifications.length - 1, j = 0; i >= ll; i--, j++) {
			notifications[i].pos = createVector(170 - j * 15, 180);
			notifications[i].show();
			if (notifications[i].ontop(mouseX + offset.x, mouseY + offset.y)) {
				fill(100, notifications[i].opacity);
				textSize(12);
				text(notifications[i].text, 150, 170);
			}
		}
	}


	for (let gBtn of gameButtons) {
		gBtn.update();

		if (gBtn.ontop(mouseX + offset.x, mouseY + offset.y)) {
			gBtn.highlighted = true;

		} else {
			gBtn.highlighted = false;
		}
	}
	regimeDateArrows();
	pop();


	if (regimePaint != null) { // Show Current Paint
		stroke(100);
		strokeWeight(1);
		if (regimePaint == -1) {
			fill(200);
		} else {
			fill(personSelected.colour[0], personSelected.colour[1], personSelected.colour[2]);
		}

		ellipse(mouseX + offset.x, mouseY + offset.y, 10);
	}


	for (let regG2 of regime) { // Show Selected regimeHour
		if (regG2.selected) {
			stroke(100);
			strokeWeight(3);
			noFill();
			rectMode(CENTER);
			rect(regG2.fpos.x, regG2.fpos.y, regG2.size.x, regG2.size.y);
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function regimeLines() {
	stroke(100);
	strokeWeight(1);
	for (let i = 0; i < 6; i++) {
		line(-35 + i * 25, -137.5, -35 + i * 25, 161.5);
		for (let j = 0; j < 11; j++) {
			line(-60, -112.5 + j * 25, 114, -112.5 + j * 25);
		}
	}
}


function regimeText() {
	fill(100);
	noStroke();
	textSize(15);

	let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	for (let i = 0; i < 7; i++) {
		text(days[i], -47.5 + i * 25, -140);
	}

	for (let i = 0; i < 12; i++) {
		if (floor(gameDate[0] % 24) - 7 == i) {
			fill(20);
		} else {
			fill(100);
		}
		text(7 + i + ':00 - ' + (7 + 1 + i) + ':00', -87.5, -117.5 + i * 25);
	}
}


function regimeDateArrows() {
	fill(100);
	noStroke();
	let tr1 = createVector(-60 - 60 - 10, -137.5 + (constrain(gameDate[0] % 24, 7, 19) - 7) * 25 - 1);
	let tr2 = createVector(-60 + (gameDate[1] % 7) * 25 - 1, -137.5 - 15 - 10);
	triangle(tr1.x, tr1.y - 5, tr1.x, tr1.y + 5, tr1.x + 10, tr1.y);
	triangle(tr2.x - 5, tr2.y, tr2.x + 5, tr2.y, tr2.x, tr2.y + 10);
	let overtop = createVector(tr2.x, tr1.y);
	fill(0, 20);

	for (let regG3 of regime) { // Show current day
		if (regG3.ontop(overtop.x + 1000, overtop.y + 200)) {
			rect(regG3.pos.x, regG3.pos.y, regG3.size.x, regG3.size.y);

			if (regG3.assigned != null) { // Not working that day

				let hr = regG3.regimePosition.y + 7;
				let curConstraint = regG3.assigned.workConditions[0][regG3.regimePosition.x];
				if (!(hr >= curConstraint[0]) || !(hr + 1 <= curConstraint[1])) {
					regG3.assigned.stress += random(0.2, 0.4);
					getNotification(new notification(regG3.assigned, 1200, 'Not working'));
					regG3.unpaint();

				} else if (regG3.assigned.illness[0] != 0) {
					regG3.assigned.stress += random(0.05, 0.1);
					getNotification(new notification(regG3.assigned, 1200, 'Sick'));
					regG3.unpaint();
				}
			}
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function MPGame() {


	for (let gBtn2 of gameButtons) {
		if (gBtn2.ontop(mouseX + offset.x, mouseY + offset.y)) {
			if (!gameButtons[1].selected && personSelected != null && regimePaint == null && gBtn2.number == 0) { // Select Paint
				gBtn2.selected = true;
				regimePaint = personSelected;
				sfxs[4].play();
			}


			if (!gameButtons[0].selected && regimePaint == null && gBtn2.number == 1) { // Select Unpaint
				gBtn2.selected = true;
				regimePaint = -1;
				sfxs[4].play();
			}


			if (gBtn2.number == 2) { // Unpaint All Button
				sfxs[4].play();
				for (let regMP3 of regime) {
					if (regMP3.assigned != null) {
						regMP3.unpaint();
					}
				}
			}
		}
	}




	if (regimePaint != null) { // Paint regime
		regimeInteract();


	} else { // Select Person or select regimeHour

		for (let prsn of people) {
			if (prsn.ontop(mouseX + offset.x, mouseY + offset.y)) { // Select Person
				if (prsn == personSelected) {
					personSelected = null;
				} else {
					personSelected = prsn;
				}
				sfxs[4].play();
			}
		}

		for (let regMP1 of regime) {
			if (regMP1.ontop(mouseX + offset.x, mouseY + offset.y)) { // Select regimeHour
				if (!regMP1.selected) {
					regMP1.selected = true;
					keepOn = regMP1;
					sfxs[3].play();
				}
			}
		}
	}

	for (let regMP2 of regime) { // Deselect All regime apart from one if selected
		if (regMP2.selected && regMP2 != keepOn) {
			regMP2.selected = false;
		}
	}
	keepOn = null;
}


// ---------------------------------------------------------------------------------------------------------------------------------


function regimeInteract() {
	regimeOntop = false;
	for (let regMP4 of regime) {
		if (regMP4.ontop(mouseX + offset.x, mouseY + offset.y)) { // Check if ontop regimeHour
			regimeOntop = regMP4;
		}
	}


	if (!regimeOntop) {
		if (regimePaint != -1 && !gameButtons[0].ontop(mouseX + offset.x, mouseY + offset.y)) { // Deselect Paint
			gameButtons[0].selected = false;
			regimePaint = null;
			sfxs[4].play();

		} else if (regimePaint == -1 && !gameButtons[1].ontop(mouseX + offset.x, mouseY + offset.y)) { // Deselect Unpaint
			gameButtons[1].selected = false;
			regimePaint = null;
			sfxs[4].play();
		}


	} else {
		if (regimeOntop.assigned != regimePaint) { // Unpaint
			if (regimePaint == -1) {
				if (regimeOntop.assigned != null) {
					regimeOntop.unpaint();
					sfxs[3].play();
				}

			} else {
				regimeOntop.assigned = regimePaint; // Paint
				regimeOntop.assignedColProg = 1;
				sfxs[3].play();
				regimePaint.regimePositions.push(regimeOntop.regimePosition);
			}
		}
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------


function getNotification(n) {
	notifications.push(n);
	sfxs[6].play();
}
