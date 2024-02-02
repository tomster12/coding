// https://trello.com/b/C570TXiC/roguelike
// Declare input variables
let inputs;
let inputsPressed;
let mouseInput;
let mouseInputPressed;
let mouseInputPressedLocked;
// Declare main variables
let groundWeapons;
let projectiles;
let player;
let dt;
function setup() {
    // Main setup
    createCanvas(800, 800);
    setupVariables();
}
function setupVariables() {
    // Initialize input variables
    inputs = {};
    inputsPressed = {};
    mouseInput = 0;
    mouseInputPressed = 0;
    mouseInputPressedLocked = false;
    // Initialize main variables
    groundWeapons = [];
    projectiles = [];
    player = new Player(new Vec2(width * 0.5, height * 0.5));
    dt = 0;
}
// #endregion
// #region - Main
function draw() {
    background("#ede6d8");
    // Update dt, groundWeapons and the player
    dt = 1 / (frameRate() == 0 ? 60 : frameRate());
    for (let weapon of groundWeapons)
        weapon.update();
    for (let projectile of projectiles)
        projectile.update();
    player.update();
    // Show before translation
    // Translate to player, show player, projectiles and groundWeapons
    player.translateTo();
    for (let projectile of projectiles)
        projectile.show();
    for (let weapon of groundWeapons)
        weapon.show();
    player.show();
    // Debug rects
    noStroke();
    fill("#2b2821");
    rect(0, 0, 1600, 50);
    rect(0, 750, 1600, 50);
    rect(0, 50, 50, 700);
    rect(1550, 50, 50, 700);
    rect(775, 50, 50, 100);
    rect(775, 650, 50, 100);
    // Show cursor
    let mousePos = getScreenMousePos();
    ellipse(mousePos.x, mousePos.y, 10, 10);
    // Update pressed variables
    Object.keys(inputsPressed).forEach(i => inputsPressed[i] = false);
    mouseInputPressed = 0;
}
function getScreenMousePos() {
    // Returns a vector representing the mouse position
    return new Vec2(mouseX - player.getTranslateX(), mouseY - player.getTranslateY());
}
// #endregion
// #region - Input
function keyPressed() {
    // Update inputs and inputsPressed
    inputs[keyCode] = true;
    inputsPressed[keyCode] = true;
}
function keyReleased() {
    // Update inputs
    inputs[keyCode] = false;
}
function mousePressed() {
    // Update mouseInput
    mouseInput = mouseButton;
    mouseInputPressed = mouseButton;
}
function mouseReleased() {
    // Update mouseInput and mouseUp
    mouseInput = 0;
    mouseInputPressedLocked = false;
}
// #endregion
