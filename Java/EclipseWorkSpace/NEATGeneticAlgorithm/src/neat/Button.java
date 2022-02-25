package neat;

public class Button {

	// Config variables
	private Float2 pos;
	private Float2 size;
	int buttonType;
	
	
	// Default constructor
	public Button(float px, float py, float sx, float sy, int buttonType_) {
		pos = new Float2(px, py);
		size = new Float2(sx, sy);
		buttonType = buttonType_;
	}

	
	// Update the button
	public void callUpdate() {
		show();
	}
	
	
	// Show the button
	public void show() {
		Main.p.strokeWeight(2);
		Main.p.stroke(180);
		Main.p.fill(mouseOntop() ? 240 : 220);
		Main.p.rect(
			pos.x, 
			pos.y,
			size.x,
			size.y
		);
	}
	
	
	// Called whe mouse pressed
	public void mousePressed() {
		if (mouseOntop()) {
			press();
		}
	}
	
	
	// Check if the PApplet mouse is ontop
	public boolean mouseOntop() {
		return Main.p.mouseX > pos.x
			&& Main.p.mouseX < pos.x + size.x
			&& Main.p.mouseY > pos.y
			&& Main.p.mouseY < pos.y + size.y;
	}
	
	
	// Button has been pressed
	public void press() {
		switch(buttonType) {
			case (0): Main.genAl.createPopulation(); break;
		
			case (1): Main.genAl.toUpdate = !Main.genAl.toUpdate; break;
				
			case (2): Main.genAl.toFinish = !Main.genAl.toFinish; break;

			case (3): Main.genAl.toLoop = !Main.genAl.toLoop; break;

			case (4): Main.genAl.updateGeneration(); break;

			case (5): Main.genAl.finishGeneration(); break;
			
			case (6): Main.genAl.loopGeneration(); break;

			case (7): Main.genAl.updatesPerFrame--; break;
			
			case (8): Main.genAl.updatesPerFrame++; break;
		}
	}
}
