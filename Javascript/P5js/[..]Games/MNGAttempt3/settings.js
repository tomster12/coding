// ---------------------------------------------------------------------------------------------------------------------------------


function DSettings() {
	push();
	translate(600, -200);

	fill(100);
	textSize(65);
	text('Settings', 0, -135);

	textSize(25);
	text('Total', -80, -35);
	text('Music', -80, -10);
	text('SFX', -80, 15);
	pop();

	DSettingsVolume()
}


function DSettingsVolume() {
	mstVolume = sliders[0].value;
	musicVolume = sliders[1].value;
	sfxVolume = sliders[2].value;
	masterVolume(mstVolume);
	for (let sfx of sfxs) {
		sfx.setVolume(sfxVolume);
	}
	for (let msc of music) {
		msc.setVolume(musicVolume);
	}
}


// ---------------------------------------------------------------------------------------------------------------------------------
