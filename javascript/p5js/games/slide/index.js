
// #region - Setup

// Big wall buttons
// Cut preventers
// Conveyor belts


// Global constants
const numLevels = 4;

// Declare variables
let assets;
let settings;
let directionVector;
let directionNames;
let game;


function preload() {
  assets = {};

  // Door open alpha: 80
  // Blob indicator alpha: 80
  // Button pressed alpha: 80
  // Title text alpha: 105, 170
  // "for (let i = 0; i < 3; i++) this.controlledBlob.attachAll()",

  // Floor Tile	      0, 0
  // F button down    0, 1
  // Door open        0, 1

  // Cutter           1, 0
  // F button up      1, 0
  // Top Tile 	      1, 1
  // Blob             1, 1
  // Blob Indicator   1, 2
  // Blob Edges       1, 2
  // Door closed      1, 3
  // Win platform     1, 3

  // Cutter Top       2, 0
  // Main Tile		    2, 1

  // Load images
  assets.images = {};

  // UI Sliders
  loadImage("assets/images/UI/sliders/sliderHandleIdle.png", img => { assets.images["SLIDER_HANDLE_IDLE"] = img });
  loadImage("assets/images/UI/sliders/sliderHandleGrabbed.png", img => { assets.images["SLIDER_HANDLE_GRABBED"] = img });

  // UI Small Buttons
  loadImage("assets/images/UI/buttons/buttonSmallIdle.png", img => { assets.images["BUTTON_SMALL_IDLE"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallHovered.png", img => { assets.images["BUTTON_SMALL_HOVERED"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallClicked.png", img => { assets.images["BUTTON_SMALL_CLICKED"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop1.png", img => { assets.images["BUTTON_TOP_SMALL_1"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop2.png", img => { assets.images["BUTTON_TOP_SMALL_2"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop3.png", img => { assets.images["BUTTON_TOP_SMALL_3"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop4.png", img => { assets.images["BUTTON_TOP_SMALL_4"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop5.png", img => { assets.images["BUTTON_TOP_SMALL_5"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop6.png", img => { assets.images["BUTTON_TOP_SMALL_6"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop7.png", img => { assets.images["BUTTON_TOP_SMALL_7"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop8.png", img => { assets.images["BUTTON_TOP_SMALL_8"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop9.png", img => { assets.images["BUTTON_TOP_SMALL_9"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTop10.png", img => { assets.images["BUTTON_TOP_SMALL_10"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTopMenu.png", img => { assets.images["BUTTON_TOP_SMALL_MENU"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTopRetry.png", img => { assets.images["BUTTON_TOP_SMALL_RETRY"] = img });
  loadImage("assets/images/UI/buttons/buttonSmallTopNext.png", img => { assets.images["BUTTON_TOP_SMALL_NEXT"] = img });

  // UI Buttons
  loadImage("assets/images/UI/buttons/buttonIdle.png", img => { assets.images["BUTTON_IDLE"] = img });
  loadImage("assets/images/UI/buttons/buttonHovered.png", img => { assets.images["BUTTON_HOVERED"] = img });
  loadImage("assets/images/UI/buttons/buttonClicked.png", img => { assets.images["BUTTON_CLICKED"] = img });
  loadImage("assets/images/UI/buttons/buttonTopPlay.png", img => { assets.images["BUTTON_TOP_PLAY"] = img });
  loadImage("assets/images/UI/buttons/buttonTopSettings.png", img => { assets.images["BUTTON_TOP_SETTINGS"] = img });
  loadImage("assets/images/UI/buttons/buttonTopHelp.png", img => { assets.images["BUTTON_TOP_HELP"] = img });
  loadImage("assets/images/UI/buttons/buttonTopMenu.png", img => { assets.images["BUTTON_TOP_MENU"] = img });

  // UI Text
  loadImage("assets/images/UI/other/menuTitleText.png", img => { assets.images["MENU_TITLE_TEXT"] = img });
  loadImage("assets/images/UI/other/settingsTitleText.png", img => { assets.images["SETTINGS_TITLE_TEXT"] = img });
  loadImage("assets/images/UI/other/helpTitleText.png", img => { assets.images["HELP_TITLE_TEXT"] = img });
  loadImage("assets/images/UI/other/maxVolumeSliderText.png", img => { assets.images["MAX_VOLUME_SLIDER_TEXT"] = img });
  loadImage("assets/images/UI/other/sfxVolumeSliderText.png", img => { assets.images["SFX_VOLUME_SLIDER_TEXT"] = img });
  loadImage("assets/images/UI/other/musicVolumeSliderText.png", img => { assets.images["MUSIC_VOLUME_SLIDER_TEXT"] = img });

  // Game Blob
  loadImage("assets/images/blob/blob.png", img => { assets.images["BLOB"] = img });
  loadImage("assets/images/blob/blobControlled.png", img => { assets.images["BLOB_CONTROLLED"] = img });
  loadImage("assets/images/blob/blobRequired.png", img => { assets.images["BLOB_REQUIRED"] = img });
  loadImage("assets/images/blob/edge.png", img => { assets.images["BLOB_EDGE"] = img });
  loadImage("assets/images/blob/corner.png", img => { assets.images["BLOB_CORNER"] = img });

  // Game Tiles
  loadImage("assets/images/tile/baseMain.png", img => { assets.images["TILE_BASE_MAIN"] = img });
  loadImage("assets/images/tile/baseTop.png", img => { assets.images["TILE_BASE_TOP"] = img });

  // Game Interactive
  loadImage("assets/images/interactable/cutterLeft.png", img => { assets.images["CUTTER_LEFT"] = img });
  loadImage("assets/images/interactable/cutterLeftTop.png", img => { assets.images["CUTTER_LEFT_TOP"] = img });
  loadImage("assets/images/interactable/cutterUp.png", img => { assets.images["CUTTER_UP"] = img });
  loadImage("assets/images/interactable/cutterUpTop.png", img => { assets.images["CUTTER_UP_TOP"] = img });
  loadImage("assets/images/interactable/floorButtonDown.png", img => { assets.images["FLOOR_BUTTON_DOWN"] = img });
  loadImage("assets/images/interactable/floorButtonUp.png", img => { assets.images["FLOOR_BUTTON_UP"] = img });
  loadImage("assets/images/interactable/doorOpenLeft.png", img => { assets.images["DOOR_OPEN_LEFT"] = img });
  loadImage("assets/images/interactable/doorOpenUp.png", img => { assets.images["DOOR_OPEN_UP"] = img });
  loadImage("assets/images/interactable/doorClosedLeft.png", img => { assets.images["DOOR_CLOSED_LEFT"] = img });
  loadImage("assets/images/interactable/doorClosedUp.png", img => { assets.images["DOOR_CLOSED_UP"] = img });
  loadImage("assets/images/interactable/winPlatform.png", img => { assets.images["WIN_PLATFORM"] = img });
  loadImage("assets/images/interactable/winPlatformTop.png", img => { assets.images["WIN_PLATFORM_TOP"] = img });

  // Load sounds
  assets.sounds = {};
  assets.sounds.music = {};
  assets.sounds.sfx = {};

  // Music
  loadSound("assets/sounds/music/mainMusic.mp3", snd => { assets.sounds.music["MAIN_MUSIC"] = snd });

  // UI SFX
  loadSound("assets/sounds/sfx/buttonHovered0.wav", snd => { assets.sounds.sfx["BUTTON_HOVERED_0"] = snd });
  loadSound("assets/sounds/sfx/buttonClicked0.wav", snd => { assets.sounds.sfx["BUTTON_CLICKED_0"] = snd });
  loadSound("assets/sounds/sfx/sliderGrab0.wav", snd => { assets.sounds.sfx["SLIDER_GRAB_0"] = snd });

  // Game SFX
  loadSound("assets/sounds/sfx/blobCut.wav", snd => { assets.sounds.sfx["BLOB_CUT"] = snd });
  loadSound("assets/sounds/sfx/floorButtonDown.wav", snd => { assets.sounds.sfx["FLOOR_BUTTON_DOWN"] = snd });
  loadSound("assets/sounds/sfx/floorButtonUp.wav", snd => { assets.sounds.sfx["FLOOR_BUTTON_UP"] = snd });
  loadSound("assets/sounds/sfx/doorDown.wav", snd => { assets.sounds.sfx["DOOR_DOWN"] = snd });
  loadSound("assets/sounds/sfx/doorUp.wav", snd => { assets.sounds.sfx["DOOR_UP"] = snd });
  loadSound("assets/sounds/sfx/levelWin.wav", snd => { assets.sounds.sfx["LEVEL_WIN"] = snd });
  loadSound("assets/sounds/sfx/levelProgress.wav", snd => { assets.sounds.sfx["LEVEL_PROGRESS"] = snd });
}


function setup() {
  // Initialize settings
  settings = {
    masterVolume: 0.3,
    musicVolume: 0.5,
    sfxVolume: 0.5
  };

  // Initialize variables
  directionVector = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 } ];
  directionNames = [ "LEFT", "UP", "RIGHT", "DOWN" ];

  // Initialize game
  game = new Game();
}

// #endregion


// #region - Main

function draw() {
  // Update game
  if (game != null)
    game.draw();
}


function keyPressed() {
  // Pass through to game
  if (game != null)
    game.keyPressed(keyCode);
}


function keyReleased() {
  // Pass through to game
  if (game != null)
    game.keyReleased(keyCode);
}


function mousePressed() {
  // Pass through to game
  if (game != null)
    game.mousePressed(mouseButton);
}


function mouseReleased() {
  // Pass through to game
  if (game != null)
    game.mouseReleased();
}

// #endregion


class Game {

  // #region - Setup

  constructor() {
    // Setup window
    createCanvas(1280, 720);
    noSmooth();
    pixelDensity(4);

    // Initialize variables
    this.stateStack = [];
    this.inputsDown = [];
    this.inputsClicked = [];
    this.mouseDown = null;
    this.mouseClicked = null;

    // Initialize states
    this.stateStack.push(new MenuState(this));

    // Star music
    assets.sounds.music["MAIN_MUSIC"].loop();
  }

  // #endregion


  // #region - Main

  draw() {
    // Update and render all
    this.update();
    this.render();
  }


  update() {
    // Update current state
    if (this.stateStack.length > 0) {
      this.stateStack[this.stateStack.length - 1].update();

      // Remove if ended
      if (this.stateStack[this.stateStack.length - 1].stateEnded)
        this.stateStack.pop();
    }

    // Unpress all keys and mouse
    this.inputsClicked = [];
    this.mouseClicked = null;

    // Update volume
    for (let msc in assets.sounds.music)
      assets.sounds.music[msc].setVolume(settings.musicVolume * settings.masterVolume);
    for (let sfx in assets.sounds.sfx)
      assets.sounds.sfx[sfx].setVolume(settings.sfxVolume * settings.masterVolume * 5);
  }


  render() {
    // Draw default background
    background(0);

    // Render the current state
    if (this.stateStack.length > 0)
      this.stateStack[this.stateStack.length - 1].render();
  }


  keyPressed(keyCode) {
    // Update input lists
    this.inputsDown[keyCode] = true;
    this.inputsClicked[keyCode] = true;
  }


  keyReleased(keyCode) {
    // Update input lists
    this.inputsDown[keyCode] = false;
  }


  mousePressed(mouseButton) {
    // Update input lists
    this.mouseDown = mouseButton;
    this.mouseClicked = mouseButton;
  }


  mouseReleased() {
    // Update input lists
    this.mouseDown = null;
  }


  editor() {
    // DEBUG Push EditorState
    this.stateStack.push(new EditorState(this));
  }

  // #endregion
}


class State {

  // #region - Setup

  constructor(game_) {
    // Validate parameters
    if (!game_) throw "State requires game_";

    // Initialize variables
    this.game = game_;
    this.statePaused = false;
    this.stateEnded = false;
    this.inputs = {};
  }

  // #endregion


  // #region - Main

  update() {
    // require implementation
    throw "State class requires implementation of update()";
  }


  render() {
    // require implementation
    throw "State class requires implementation of update()";
  }


  endState() {
    // End the state
    this.stateEnded = true;
  }

  // #endregion
}


class MenuState extends State {

  // #region - Setup

  constructor(game_) {
    // Validate parameters
    if (!game_) throw "MenuState requires game_";

    // Call parent constructor
    super(game_);

    // Run initialization
    this.initVariables();
    this.initUI();
  }


  initVariables() {
    // Initialize variables
    this.titleText = new Sprite(
      { x: width * 0.5 - 200, y: 40}, { x: 400, y: 100},
      assets.images["MENU_TITLE_TEXT"]);
  }


  initUI() {
    // Initialize buttons
    this.buttons = [
      new Button(
        { x: width * 0.5 - 150, y: 240 + 150 * 0 }, { x: 300, y: 100 }, () => { this.game.stateStack.push(new LevelSelectionState(this.game)) },
        assets.images["BUTTON_IDLE"], assets.images["BUTTON_HOVERED"], assets.images["BUTTON_CLICKED"],
        assets.images["BUTTON_TOP_PLAY"], { x: 200, y: 50 }),

      new Button(
        { x: width * 0.5 - 150, y: 240 + 150 * 1 }, { x: 300, y: 100 }, () => { this.game.stateStack.push(new SettingsState(this.game)) },
        assets.images["BUTTON_IDLE"], assets.images["BUTTON_HOVERED"], assets.images["BUTTON_CLICKED"],
        assets.images["BUTTON_TOP_SETTINGS"], { x: 200, y: 50 }),

      new Button(
        { x: width * 0.5 - 150, y: 240 + 150 * 2 }, { x: 300, y: 100 }, () => { this.game.stateStack.push(new HelpState(this.game)) },
        assets.images["BUTTON_IDLE"], assets.images["BUTTON_HOVERED"], assets.images["BUTTON_CLICKED"],
        assets.images["BUTTON_TOP_HELP"], { x: 200, y: 50 }),
    ];
  }

  // #endregion


  // #region - Main

  update() {
    // Update buttons
    for (let button of this.buttons)
      button.update(this.game.mouseDown);
  }


  render() {
    // Render background
    background(200, 100, 100);

    // Render title text
    this.titleText.render();

    // Update buttons
    for (let button of this.buttons)
      button.render();
  }

  // #endregion
}


class SettingsState extends State {

  // #region - Setup

  constructor(game_) {
    // Validate parameters
    if (!game_) throw "MenuState requires game_";

    // Call parent constructor
    super(game_);

    // Run initialization
    this.initVariables();
    this.initKeybindings();
    this.initUI();
  }


  initVariables() {
    // Initialize variables
    this.titleText = new Sprite(
      { x: width * 0.5 - 200, y: 40}, { x: 400, y: 100},
      assets.images["SETTINGS_TITLE_TEXT"]);
  }


  initKeybindings() {
    // Setup keybindings
    this.inputs["EXIT"] = 27;
  }


  initUI() {
    // Setup UI
    this.UI = [
      new Slider({ x: width * 0.5 - 200, y: 270 + 110 * 0 }, settings.masterVolume, p => { settings.masterVolume = p; },
        null, { x: 36, y: 42 }, null,
        assets.images["MAX_VOLUME_SLIDER_TEXT"], { x: 300, y: 45}),

      new Slider({ x: width * 0.5 - 200, y: 270 + 110 * 1 },  settings.musicVolume, p => { settings.musicVolume = p; },
        null, { x: 36, y: 42 }, null,
        assets.images["MUSIC_VOLUME_SLIDER_TEXT"], { x: 300, y: 45}),

      new Slider({ x: width * 0.5 - 200, y: 270 + 110 * 2 },  settings.sfxVolume, p => { settings.sfxVolume = p; },
        null, { x: 36, y: 42 }, null,
        assets.images["SFX_VOLUME_SLIDER_TEXT"], { x: 300, y: 45}),

      new Button(
        { x: width * 0.5 - 150, y: height - 140 }, { x: 300, y: 100 }, () => { this.endState(); },
        assets.images["BUTTON_IDLE"], assets.images["BUTTON_HOVERED"], assets.images["BUTTON_CLICKED"],
        assets.images["BUTTON_TOP_MENU"], { x: 200, y: 50 }),
    ];
  }

  // #endregion


  // #region - Main

  update() {
    // Update inputs
    if (this.game.inputsClicked[this.inputs["EXIT"]])
      this.endState();

    // Update sliders
    for (let intr of this.UI)
      intr.update(this.game.mouseDown);
  }


  render() {
    // Render background
    background(100, 200, 200);

    // Render sliders
    for (let intr of this.UI)
      intr.render();

    // Render title text
    this.titleText.render();
  }

  // #endregion
}


class HelpState extends State {

  // #region - Setup

  constructor(game_) {
    // Validate parameters
    if (!game_) throw "MenuState requires game_";

    // Call parent constructor
    super(game_);

    // Run initialization
    this.initVariables();
    this.initKeybindings();
    this.initUI();
  }


  initVariables() {
    // Initialize variables
    this.titleText = new Sprite(
      { x: width * 0.5 - 200, y: 40}, { x: 400, y: 100},
      assets.images["HELP_TITLE_TEXT"]);
  }


  initKeybindings() {
    // Setup keybindings
    this.inputs["EXIT"] = 27;
  }


  initUI() {
    // Initialize menu button
    this.menuButton = new Button(
      { x: width * 0.5 - 150, y: height - 140 }, { x: 300, y: 100 }, () => { this.endState(); },
      assets.images["BUTTON_IDLE"], assets.images["BUTTON_HOVERED"], assets.images["BUTTON_CLICKED"],
      assets.images["BUTTON_TOP_MENU"], { x: 200, y: 50 });
  }

  // #endregion


  // #region - Main

  update() {
    // Update inputs
    if (this.game.inputsClicked[this.inputs["EXIT"]])
      this.endState();

    // Update menu button
    this.menuButton.update(this.game.mouseDown);
  }


  render() {
    // Render background
    background(150, 100, 150);

    // Render title text
    this.titleText.render();

    // Render menu button
    this.menuButton.render();
  }

  // #endregion
}


class LevelSelectionState extends State {

  // #region - Setup

  constructor(game_) {
    // Validate parameters
    if (!game_) throw "MenuState requires game_";

    // Call parent constructor
    super(game_);

    // Run initialization
    this.initKeybindings();
    this.initUI();
  }


  initKeybindings() {
    // Setup keybindings
    this.inputs["EXIT"] = 27;
  }


  initUI() {
    let levelsPerRow = 8;

    // Initialize level select buttons
    this.levelSelectionButtons = [];
    for (let i = 0; i < numLevels; i++) {
      this.levelSelectionButtons.push(new Button(
        { x: 80 + ((width - 160) / (levelsPerRow - 1)) * (i % levelsPerRow) - 45,
          y: 100 + ((width - 160) / (levelsPerRow - 1)) * floor(i / levelsPerRow) - 50
        }, { x: 90, y: 100 }, () => { this.playLevel(i + 1); },
        assets.images["BUTTON_SMALL_IDLE"], assets.images["BUTTON_SMALL_HOVERED"], assets.images["BUTTON_SMALL_CLICKED"],
        assets.images["BUTTON_TOP_SMALL_" + (i + 1)], { x: 48, y: 48 }
      ));
    }

    // Initialize menu button
    this.menuButton = new Button(
      { x: width * 0.5 - 150, y: height - 140 }, { x: 300, y: 100 }, () => { this.endState(); },
      assets.images["BUTTON_IDLE"], assets.images["BUTTON_HOVERED"], assets.images["BUTTON_CLICKED"],
      assets.images["BUTTON_TOP_MENU"], { x: 200, y: 50 });
  }

  // #endregion


  // #region - Main

  update() {
    // Update inputs
    if (this.game.inputsClicked[this.inputs["EXIT"]])
      this.endState();

    // Update level selection buttons
    for (let button of this.levelSelectionButtons)
      button.update(this.game.mouseDown);

    // Update menu button
    this.menuButton.update(this.game.mouseDown);
  }


  render() {
    // Render background
    background(100, 200, 100);

    // Render level selection buttons
    for (let button of this.levelSelectionButtons)
      button.render();

    // Render menu button
    this.menuButton.render();
  }


  playLevel(levelNumber) {
    // Play a specific level
    this.game.stateStack.push(new GameState(this.game, levelNumber));
  }


  // #endregion
}


class GameState extends State {

  // #region - Setup

  constructor(game_, levelNumber_) {
    // Validate parameters
    if (!game_) throw "GameState requires game_";
    if (!levelNumber_) throw "GameState requires levelNumber_";

    // Call parent constructor
    super(game_);

    // Run initialization
    this.initVariables(levelNumber_);
    this.initKeybindings();
    this.initUI();

    // Load level
    this.loadLevel();
  }


  initVariables(levelNumber_) {
    // Initialize variables
    this.levelNumber = levelNumber_;
    this.gridSize = 60;
    this.isCompleted = false;
    this.objects = [];
    this.nextGroupID = 0;
    this.controlledBlob = null;
    this.requiredBlobs = [];
    this.loaded = false;
  }


  initKeybindings() {
    // Setup keybindings
    this.inputs["EXIT"] = 27;

    this.inputs["MOVE_LEFT"] = 65;
    this.inputs["MOVE_UP"] = 87;
    this.inputs["MOVE_RIGHT"] = 68;
    this.inputs["MOVE_DOWN"] = 83;

    this.inputs["ATTACH_ALL"] = 32;
  }


  initUI() {
    // Initialize buttons
    this.buttons = [
      new Button({ x: width - 70 * 0.9 - 10, y: 10 + 100 * 0 }, { x: 70 * 0.9, y: 70 }, () => { this.endState(); },
        assets.images["BUTTON_SMALL_IDLE"], assets.images["BUTTON_SMALL_HOVERED"], assets.images["BUTTON_SMALL_CLICKED"],
        assets.images["BUTTON_TOP_SMALL_MENU"], { x: 40, y: 40 }),
      new Button({ x: width - 70 * 0.9 - 10, y: 10 + 100 * 1 }, { x: 70 * 0.9, y: 70 }, () => { this.loadLevel(); },
        assets.images["BUTTON_SMALL_IDLE"], assets.images["BUTTON_SMALL_HOVERED"], assets.images["BUTTON_SMALL_CLICKED"],
        assets.images["BUTTON_TOP_SMALL_RETRY"], { x: 40, y: 40 })
    ];

    // Initialize victory button
    this.victoryButton = new Button({ x: width - 70 * 0.9 - 10, y: 10 + 100 * 2 }, { x: 70 * 0.9, y: 70 }, () => { this.loadLevel(this.levelNumber + 1); },
      assets.images["BUTTON_SMALL_IDLE"], assets.images["BUTTON_SMALL_HOVERED"], assets.images["BUTTON_SMALL_CLICKED"],
      assets.images["BUTTON_TOP_SMALL_NEXT"], { x: 40, y: 40 });
  }


  loadLevel(num_) {
    let num = (num_ ? num_ : this.levelNumber);
    num = num > numLevels ? numLevels : num;

    // Load file
    let levelJSON = fetch("assets/levels/" + num + ".json")
    .then(response => response.json())
    .then(data => {

      // Initialize variables
      this.levelNumber = num;
      this.gridSize = data.gridSize;
      this.isCompleted = false;
      this.objects = [];
      this.nextGroupID = 0;

      // Initialize objects
      for (let obj of data.objects) {
        let className = obj.splice(0, 1);
        let params = "this, ";
        for (let p of obj) params += JSON.stringify(p) + ", ";
        let toEval = "new " + className + "(" + params + ")";
        this.objects.push(eval(toEval));
      }

      // Initialize controlled blob and required blobs
      let blobs = this.getObjectsOfType(Blob);
      if (data.controlledBlob != -1)
        this.controlledBlob = blobs[data.controlledBlob];
      if (data.requiredBlobs.length != 0)
        this.requiredBlobs = data.requiredBlobs.map(i => blobs[i]);

      // Run setup function
      if (data.initFunc != "")
        eval(data.initFunc);
      this.loaded = true;
    });
  }

  // #endregion


  // #region - Main

  update() {
    if (!this.loaded)
      return;

    // Update inputs
    if (this.game.inputsClicked[this.inputs["EXIT"]])
      this.endState();

    // Movement
    if (!this.completed && this.controlledBlob != null) {
      let dx = (this.game.inputsClicked[this.inputs["MOVE_LEFT"]] ? -1 : 0)
        + (this.game.inputsClicked[this.inputs["MOVE_RIGHT"]] ? 1 : 0);
      let dy = dx ? 0 : ((this.game.inputsClicked[this.inputs["MOVE_UP"]] ? -1 : 0)
        + (this.game.inputsClicked[this.inputs["MOVE_DOWN"]] ? 1 : 0));
      this.controlledBlob.inputMovement({ x: dx, y: dy });

      // Attach
      if (this.game.inputsClicked[this.inputs["ATTACH_ALL"]]) {
        this.controlledBlob.attachAll();
      }
    }

    // Update objects
    this.controlledBlob.update();
    for (let obj of this.objects) {
      if (obj != this.controlledBlob) {
        obj.update();
      }
    }

    // Update all buttons
    for (let button of this.buttons)
      button.update(this.game.mouseDown);

    // Render victory button
    if (this.isCompleted)
      this.victoryButton.update(this.game.mouseDown);
  }


  render() {
    // Render background
    background(220, 220, 220);

    // Retrieve all sprites
    let sprites = [];
    for (let obj of this.objects)
      sprites.push(...obj.getSprites());

    // Sort sprites
    sprites.sort((a, b) => {
      return (a[1] > b[1]) ? 1
      : (a[1] == b[1] && a[2] > b[2]) ? 1
      : (a[1] == b[1] && a[2] == b[2] && a[3] > b[3]) ? 1
      : -1;
    });

    // Render sprites
    for (let sprite of sprites)
      sprite[0].render();

    // Render all buttons
    for (let button of this.buttons)
      button.render();

    // Render victory button
    if (this.isCompleted)
      this.victoryButton.render();
  }


  checkComplete() {
    // Complete if no more required
    if (this.requiredBlobs.length == 0) {
      this.isCompleted = true;
      return true;
    } return false;
  }


  getObjectsOfType(type) {
    // Returns a list of all blobs
    return this.objects.filter(a => (a instanceof type));
  }


  getObjectsAtPos(x_, y_, filter_ = (() => true)) {
    // Check objects
    let objs = [];
    for (let obj of this.objects) {
      if (obj.gridPos.x == x_
      && obj.gridPos.y == y_
      && filter_(obj))
        objs.push(obj);
    } return objs;
  }


  screenToGrid(x_, y_) {
    // Converts a screen position to screen
    let x = y_ == null ? x_.x : x_;
    let y = y_ == null ? x_.y : y_;
    return {
      x: floor(x / this.gridSize),
      y: floor(y / this.gridSize)
    };
  }


  gridToScreen(x_, y_) {
    // Converts a grid position to screen
    let x = y_ == null ? x_.x : x_;
    let y = y_ == null ? x_.y : y_;
    return {
      x: x * this.gridSize,
      y: y * this.gridSize
    };
  }

  // #endregion
}


class EditorState extends State {

  // #region - Setup

  constructor(game_) {
    // Validate parameters
    if (!game_) throw "MenuState requires game_";

    // Call parent constructor
    super(game_);

    // Run initialization
    this.initVariables();
    this.initKeybindings();
  }


  initVariables() {
    // Initialize variables
    this.gridSize = 60;
    this.objects = [];

    // Want to place blobs, tiles, wall buttons, ground buttons, blob links, doors
    this.placableTypes = [
      ["TILE_BASE_MAIN", "TILE_BASE_TOP"],
      ["BLOB"],
      ["CUTTER_LEFT", "CUTTER_UP"],
      ["FLOOR_BUTTON_UP"],
      ["DOOR_CLOSED_LEFT", "DOOR_CLOSED_UP"],
      ["WIN_PLATFORM"]];
    this.typeIndices = [0, 0];
  }


  initKeybindings() {
    // Setup keybindings
    this.inputs["EXIT"] = 27;

    this.inputs["PREV_TYPE"] = 81;
    this.inputs["NEXT_TYPE"] = 69;

    this.inputs["GRID_SIZE_DOWN"] = 90;
    this.inputs["GRID_SIZE_UP"] = 88;
  }


  loadLevel(num_) {
    let num = (num_ ? num_ : this.levelNumber);
    num = num > numLevels ? numLevels : num;

    // Load file
    let levelJSON = fetch("assets/levels/" + num + ".json")
    .then(response => response.json())
    .then(data => {

      // Initialize variables
      this.gridSize = data.gridSize;
      this.isCompleted = false;
      this.objects = [];
      this.nextGroupID = 0;

      // Initialize objects
      for (let obj of data.objects) {
        let className = obj.splice(0, 1);
        let params = "this, ";
        for (let p of obj) params += JSON.stringify(p) + ", ";
        let toEval = "new " + className + "(" + params + ")";
        this.objects.push(eval(toEval));
      }

      // Initialize controlled blob and required blobs
      let blobs = this.getObjectsOfType(Blob);
      if (data.controlledBlob != -1)
        this.controlledBlob = blobs[data.controlledBlob];
      if (data.requiredBlobs.length != 0)
        this.requiredBlobs = data.requiredBlobs.map(i => blobs[i]);

      // Run setup function
      if (data.initFunc != "")
        eval(data.initFunc);
    });
  }


  saveLevel() {
    let level = {};

    // Save variables
    level.gridSize = this.gridSize;
    level.controlledBlob = 0;
    level.requiredBlobs = [];
    level.initFunc = "";

    // Save objects
    level.objects = [];
    for (let obj of this.objects) {
      level.objects.push(
        obj instanceof Tile ? [
          "Tile",
          { "x": obj.gridPos.x, "y": obj.gridPos.y },
          obj.imageName

        ] : obj instanceof Blob ? [
          "Blob",
          { "x": obj.gridPos.x, "y": obj.gridPos.y }

        ] : obj instanceof Cutter ? [
          "Cutter",
          { "x": obj.gridPos.x, "y": obj.gridPos.y },
          obj.direction

        ] : obj instanceof FloorButton ? [
          "FloorButton",
          { "x": obj.gridPos.x, "y": obj.gridPos.y },

        ] : obj instanceof Door ? [
          "Door",
          { "x": obj.gridPos.x, "y": obj.gridPos.y },
          obj.direction

        ] : obj instanceof WinPlatform ? [
          "WinPlatform",
          { "x": obj.gridPos.x, "y": obj.gridPos.y }

        ] : null
      );
    }
    // Print level
    console.log(JSON.stringify(level));
  }

  // #endregion


  // #region - Main

  update() {
    // Quit state
    if (this.game.inputsClicked[this.inputs["EXIT"]])
      this.endState();

    // Decrement selected type
    if (this.game.inputsClicked[this.inputs["PREV_TYPE"]]) {
      this.typeIndices[1]--;
      if (this.typeIndices[1] < 0) {
        this.typeIndices[0] = (this.typeIndices[0] + this.placableTypes.length - 1) % this.placableTypes.length;
        this.typeIndices[1] = this.placableTypes[this.typeIndices[0]].length - 1;
      }

    // Increment selected type
    } else if (this.game.inputsClicked[this.inputs["NEXT_TYPE"]]) {
      this.typeIndices[1]++;
      if (this.typeIndices[1] == this.placableTypes[this.typeIndices[0]].length) {
        this.typeIndices[1] = 0;
        this.typeIndices[0] = (this.typeIndices[0] + this.placableTypes.length + 1) % this.placableTypes.length;
      }
    }

    // Zoom grid in / out
    if (this.game.inputsClicked[this.inputs["GRID_SIZE_DOWN"]])
      this.gridSize = this.gridSize > 0 ? this.gridSize - 5 : 0;
    else if (this.game.inputsClicked[this.inputs["GRID_SIZE_UP"]])
      this.gridSize += 5;

    // Update object sprite position and scaling
    for (let obj of this.objects)
      obj.updateSprites();

    // Remove object on mouse clicked
    if (this.game.mouseDown) {
      let gridPos = this.screenToGrid(mouseX, mouseY);
      let flooredPosition = this.gridToScreen(gridPos);
      let objsAtPos = this.getObjectsAtPos(gridPos.x, gridPos.y);
      if (objsAtPos.length > 0)
        this.objects.splice(this.objects.indexOf(objsAtPos[0]), 1);

      // Place object on LMB
      if (this.game.mouseDown == LEFT) {
        let imageName = this.placableTypes[this.typeIndices[0]][this.typeIndices[1]];

        // Place tile
        if (this.typeIndices[0] == 0) {
          this.objects.push(new Tile(this, gridPos, imageName));

        // Place blob
        } else if (this.typeIndices[0] == 1) {
          this.objects.push(new Blob(this, gridPos));

        } else if (this.typeIndices[0] == 2) {
          this.objects.push(new Cutter(this, gridPos, this.typeIndices[1]));

        } else if (this.typeIndices[0] == 3) {
          this.objects.push(new FloorButton(this, gridPos));

        } else if (this.typeIndices[0] == 4) {
          this.objects.push(new Door(this, gridPos, this.typeIndices[1]));

        } else if (this.typeIndices[0] == 5) {
          this.objects.push(new WinPlatform(this, gridPos));
        }
      }
    }

    // Reorder objects based on y position
    this.objects.sort((a, b) => (a.gridPos.y > b.gridPos.y) || (a.gridPos.y == b.gridPos.y && a.inLayerPriority > b.inLayerPriority) ? 1 : -1);
  }


  render() {
    // Render background
    background(180, 180, 180);

    // Render grid
    stroke(0);
    noFill();
    for (let x = 0; x < 30; x++) {
      for (let y = 0; y < 30; y++) {
        let screenPos = this.gridToScreen(x, y);
        rect(screenPos.x, screenPos.y, this.gridSize, this.gridSize);
      }
    }

    // Retrieve all sprites
    let sprites = [];
    for (let obj of this.objects)
      sprites.push(...obj.getSprites());

    // Sort sprites
    sprites.sort((a, b) => {
      return (a[1] > b[1]) ? 1
      : (a[1] == b[1] && a[2] > b[2]) ? 1
      : (a[1] == b[1] && a[2] == b[2] && a[3] > b[3]) ? 1
      : -1;
    });

    // Render sprites
    for (let sprite of sprites)
      sprite[0].render();

    // Show mouse position on the grid
    let flooredPosition = this.gridToScreen(this.screenToGrid(mouseX, mouseY));
    let currentImage = assets.images[this.placableTypes[this.typeIndices[0]][this.typeIndices[1]]];
    let heightOffset = currentImage.height / currentImage.width - 1;
    image(currentImage,
      flooredPosition.x,
      flooredPosition.y - this.gridSize * heightOffset,
      this.gridSize,
      this.gridSize * (1 + heightOffset)
    );
  }


  getObjectsAtPos(x_, y_, filter_ = (() => true)) {
    // Check objects
    let objs = [];
    for (let obj of this.objects) {
      if (obj.gridPos.x == x_
      && obj.gridPos.y == y_
      && filter_(obj))
        objs.push(obj);
    } return objs;
  }


  getObjectsOfType(type) {
    // Returns a list of all blobs
    return this.objects.filter(a => (a instanceof type));
  }


  screenToGrid(x_, y_) {
    // Converts a screen position to screen
    let x = y_ == null ? x_.x : x_;
    let y = y_ == null ? x_.y : y_;
    return {
      x: floor(x / this.gridSize),
      y: floor(y / this.gridSize)
    };
  }


  gridToScreen(x_, y_) {
    // Converts a grid position to screen
    let x = y_ == null ? x_.x : x_;
    let y = y_ == null ? x_.y : y_;
    return {
      x: x * this.gridSize,
      y: y * this.gridSize
    };
  }

  // #endregion
}


class Button {

  // #region - Setup

  constructor(pos_, size_, clickedFunc_,
    idleImg_, hoveredImg_, clickedImg_,
    topImg_, topImgSize_,
    hoveredSnd_, clickedSnd_,
    idleCol_, hoveredCol_, clickedCol_,
    text_, textSize_) {

    // Validate parameters
    if (!pos_) throw "Button requires pos_";
    if (!size_) throw "Button requires size_";

    // Run initialization
    this.initVariables(pos_, size_, clickedFunc_,
      idleImg_, hoveredImg_, clickedImg_,
      topImg_, topImgSize_,
      hoveredSnd_, clickedSnd_,
      idleCol_, hoveredCol_, clickedCol_,
      text_, textSize_);
  }


  initVariables(pos_, size_, clickedFunc_,
    idleImg_, hoveredImg_, clickedImg_,
    topImg_, topImgSize_,
    hoveredSnd_, clickedSnd_,
    idleCol_, hoveredCol_, clickedCol_,
    text_, textSize_) {

    // Initialize variables
    this.pos = pos_;
    this.size = size_;
    this.clickedFunc = clickedFunc_ || (() => {});

    this.idleImg = idleImg_;
    this.hoveredImg = hoveredImg_;
    this.clickedImg = clickedImg_;

    this.topImg = topImg_;
    this.topImgSize = topImgSize_;

    this.hoveredSnd = hoveredSnd_ || assets.sounds.sfx["BUTTON_HOVERED_0"];
    this.clickedSnd = clickedSnd_ || assets.sounds.sfx["BUTTON_CLICKED_0"];

    this.idleCol = idleCol_ || color(180);
    this.hoveredCol = hoveredCol_ || color(120);
    this.clickedCol = clickedCol_ || color(60);

    this.text = text_;
    this.textSize = textSize_;

    this.hasImages = this.idleImg != null
      && this.hoveredImg != null
      && this.clickedImg != null;
    this.isHovered = false;
    this.isClicked = false;
  }

  // #endregion


  // #region - Main

  update(mouseClicked) {
    // Check if hovered
    if (mouseX > this.pos.x
    && mouseX < this.pos.x + this.size.x
    && mouseY > this.pos.y
    && mouseY < this.pos.y + this.size.y) {

      // Hover if not clicked
      if (mouseClicked == null) {
        if (!this.isHovered)
          this.hoveredSnd.play();
        this.isHovered = true;
      }

      // Check if clicked on
      if (mouseClicked == LEFT
      && this.isHovered == true) {
        if (!this.isClicked)
          this.clickedSnd.play();
        this.isClicked = true;

      // Call function on mouse up
      } else if (this.isClicked)
        this.clickedFunc();

    // Unhover
    } else this.isHovered = false;

    // Unclick
    if (!mouseClicked)
        this.isClicked = false;
  }


  render() {
    // Render base as image
    if (this.hasImages) {
      let img = this.idleImg;
      if (this.isClicked) img = this.clickedImg;
      else if (this.isHovered) img = this.hoveredImg;
      image(
        img,
        this.pos.x, this.pos.y,
        this.size.x, this.size.y);

    // Render base as rect
    } else {
      noStroke();
      if (this.isClicked) fill(this.clickedCol);
      else if (this.isHovered) fill(this.hoveredCol);
      else fill(this.idleCol);
      rect(this.pos.x, this.pos.y,
        this.size.x, this.size.y);
    }

    // Render top as image
    if (this.topImg != null
    && this.topImgSize != null) {
      let offset = this.isClicked ? 3 : this.isHovered ? 1 : 0;
      offset *= this.topImgSize.y / this.topImg.height;
      image(this.topImg,
        this.pos.x + this.size.x * 0.5 - this.topImgSize.x * 0.5,
        this.pos.y + this.size.y * 0.5 - this.topImgSize.y * 0.5 + offset,
        this.topImgSize.x, this.topImgSize.y);

    // Render top as text
    } else if (this.text != null
    && this.textSize != null) {
      let offset = this.isClicked ? 3 : this.isHovered ? 1 : 0;
      offset *= this.hasImages ? (this.size.y / this.idleImg.height) : 0;
      fill(255);
      textAlign(CENTER);
      textSize(this.textSize);
      text(
        this.text,
        this.pos.x + this.size.x * 0.5,
        this.pos.y + this.size.y * 0.6 + offset);
    }
  }

  // #endregion
}


class Slider {

  // #region - Setup

  constructor(pos_, handleProgress_, changeFunc_,
    length_, handleSize_, barSize_,
    titleImg_, titleImgSize_,
    titleText_, titleTextSize_) {

    // Validate parameters
    if (!pos_) throw "Slider requires pos_";

    // Run initialization
    this.initVariables(pos_, handleProgress_, changeFunc_,
      length_, handleSize_, barSize_,
      titleImg_, titleImgSize_,
      titleText_, titleTextSize_);
  }


  initVariables(pos_, handleProgress_, changeFunc_,
    length_, handleSize_, barSize_,
    titleImg_, titleImgSize_,
    titleText_, titleTextSize_) {

    // Initialize variables
    this.pos = pos_;
    this.handleProgress = handleProgress_ || 0;
    this.changeFunc = changeFunc_ || (p => {});

    this.length = length_ || 400;
    this.handleSize = handleSize_ || { x: 36, y: 42 };
    this.barSize = barSize_ || 15;

    this.titleImg = titleImg_;
    this.titleImgSize = titleImgSize_;

    this.titleText = titleText_;
    this.titleTextSize = titleTextSize_;

    this.isGrabbed = false;
    this.prevMouseDown = null;
  }

  // #endregion


  // #region - Main

  update(mouseDown) {
    let pos = this.getHandlePos();

    // Clicked and ontop
    if (mouseDown == LEFT) {
      if (this.prevMouseDown == null
        && mouseX > pos.x
        && mouseX < pos.x + this.handleSize.x
        && mouseY > pos.y
        && mouseY < pos.y + this.handleSize.y) {
          this.isGrabbed = true;
          assets.sounds.sfx["SLIDER_GRAB_0"].play();
        }

    // Not clicked
  } else this.isGrabbed = false;

    // Update position if held
    if (this.isGrabbed) {
      let newProgress = map(mouseX, this.pos.x, this.pos.x + this.length, 0, 1);
      newProgress = constrain(newProgress, 0, 1);
      this.handleProgress = newProgress;
      this.changeFunc(this.handleProgress);
    }

    // Update previous mouse down
    this.prevMouseDown = mouseDown;
  }


  render() {
    // Draw bar
    noStroke();
    fill(50);
    ellipse(this.pos.x, this.pos.y, this.barSize, this.barSize);
    ellipse(this.pos.x + this.length, this.pos.y, this.barSize, this.barSize);
    rect(this.pos.x, this.pos.y - this.barSize * 0.5, this.length, this.barSize);

    // Draw handle as image
    let pos = this.getHandlePos();
    if (this.isGrabbed)
      image(assets.images["SLIDER_HANDLE_GRABBED"], pos.x, pos.y, this.handleSize.x, this.handleSize.y);

    else if (!this.isGrabbed)
      image(assets.images["SLIDER_HANDLE_IDLE"], pos.x, pos.y, this.handleSize.x, this.handleSize.y);

    // Draw handle as rect
    else {
      noStroke();
      fill(220, 180);
      rect(pos.x, pos.y, this.handleSize.x, this.handleSize.y);
    }

    // Draw title as image
    if (this.titleImg != null
    && this.titleImgSize != null) {
      image(this.titleImg,
        this.pos.x + this.length * 0.5 - this.titleImgSize.x * 0.5,
        this.pos.y - this.barSize * 0.5 - this.titleImgSize.y - 20,
        this.titleImgSize.x, this.titleImgSize.y);

    // Draw title as text
    } else if (this.titleText != null
    && this.titleTextSize != null) {
      noStroke();
      fill(0);
      textSize(this.titleTextSize);
      textAlign(CENTER);
      text(this.titleText,
        this.pos.x + this.length * 0.5,
        this.pos.y - this.barSize * 0.5 - 30);
    }
  }


  getHandlePos() {
    // Return the position of the handle
    return {
      x: this.pos.x + this.length * this.handleProgress - this.handleSize.x * 0.5,
      y: this.pos.y - this.handleSize.y * 0.5
    };
  }

  // #endregion
}


class Sprite {

  // #region - Setup

  constructor(pos_, size_,
    image_, origin_, rotation_) {

    // Require parameters
    if (!image_) throw "Sprite requires image_";

    // Run initialization
    this.initVariables(pos_, size_,
      image_, origin_, rotation_);
  }


  initVariables(pos_, size_,
    image_, origin_, rotation_) {

    // Initialize variables
    this.pos = pos_ || { x: 0, y: 0 };
    this.size = size_ || { x: 0, y: 0 };
    this.image = image_;
    this.origin = origin_ || { x: 0, y: 0 };
    this.rotation = rotation_ || 0;
    this.imageRatio = this.image.height / this.image.width;
  }

  // #endregion


  // #region - Main

  render() {
    // Render as image
    if (this.image != null) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.rotation);
      image(this.image, -this.origin.x, -this.origin.y, this.size.x, this.size.y);
      pop();
    }
  }


  getBounds() {
    // Returns the bounds of the sprite
    return {
      c0: { x: this.pos.x - this.origin.x, y: this.pos.y - this.origin.y },
      c1: { x: this.pos.x - this.origin.x + this.size.x, y: this.pos.y - this.origin.y + this.size.y },
    }
  }


  setPosition(x_, y_) {
    // Set position
    this.pos.x = x_ ? x_ : 0;
    this.pos.y = y_ ? y_ : 0;
  }


  setSize(x_, y_) {
    // Set size
    this.size.x = x_ ? x_ : (y_ ? (y_ / this.imageRatio): 0);
    this.size.y = y_ ? y_ : (x_ ? (x_ * this.imageRatio) : 0);
  }


  setOrigin(x_, y_, mode = 0) {
    // Set origin
    if (mode == 0) {
      this.origin.x = x_ ? x_ : 0;
      this.origin.y = y_ ? y_ : 0;
    } else if (mode == 1) {
      this.origin.x = x_ ? (x_ * this.size.x) : 0;
      this.origin.y = y_ ? (y_ * this.size.y) : 0;
    }
  }


  setRotation(rot_) {
    // Set rotation
    this.rotation = rot_ ? rot_ % TWO_PI : 0;
  }

  // #endregion
}


class Obj {

  // #region - Setup

  constructor(gameState_) {
    // Verify parameters
    if (!gameState_) throw "Cutter requires gameState_";

    // Initialize variables
    this.gameState = gameState_;
    this.physical = false;
  }

  // #endregion


  // #region - Main

  update() {
    // require implementation
    throw "Obj class requires implementation of update()";
  }


  getSprites() {
    // require implementation
    throw "Obj class requires implementation of getSprites()";
  }


  updateSprites() {
    // require implementation
    throw "Obj class requires implementation of updateSprites()";
  }


  canMoveFrom(blob, dir) {
    // require implementation
    throw "Obj class requires implementation of canMoveFrom()";
  }


  canMoveTo(blob, dir) {
    // require implementation
    throw "Obj class requires implementation of canMoveTo()";
  }

  // #endregion
}


class Tile extends Obj {

  // #region - Setup

  constructor(gameState_, gridPos_, imageName_) {
    super(gameState_);

    // Validate parameters
    if (!gridPos_) throw "Tile requires gridPos_";
    if (!imageName_) throw "Tile requires imageName_";

    // Run initialization
    this.initVariables(gridPos_, imageName_);
    this.initSprite(imageName_);
  }


  initVariables(gridPos_, imageName_, physical_, outLayerPriority_) {
    let tileSettings = {
      "TILE_BASE_MAIN": { physical: true, outLayerPriority: 2 },
      "TILE_BASE_TOP": { physical: true, outLayerPriority: 1 }
    };

    // Initialize variables
    this.gridPos = gridPos_;
    this.physical = tileSettings[imageName_].physical;
    this.outLayerPriority = tileSettings[imageName_].outLayerPriority;

    this.imageName = imageName_;
  }


  initSprite(imageName_) {
    // Create sprite then update
    this.sprite = new Sprite(null, null, assets.images[imageName_]);
    this.updateSprites();
  }

  // #endregion


  // #region - Main

  update() {}


  getSprites() {
    // Return sprites
    return [[this.sprite, this.outLayerPriority, this.gridPos.y, 1]];
  }


  lateRender() {}


  updateSprites() {
    // Update sprite position
    let screenPos = this.gameState.gridToScreen(this.gridPos);
    this.sprite.setPosition(screenPos.x, screenPos.y);
    this.sprite.setSize(this.gameState.gridSize, null);
    this.sprite.setOrigin(0, 1 - 1 / this.sprite.imageRatio, 1);
  }


  canMoveFrom(blob, dir) {
    // Return whether can be moved from
    return true;
  }


  canMoveTo(blob, dir) {
    // Return whether can be moved onto
    return !this.physical;
  }

  // #endregion
}


class Blob extends Obj {

  // #region - Setup

  constructor(gameState_, gridPos_) {
    super(gameState_);

    // Validate parameters
    if (!gridPos_) throw "Blob requires gridPos_";

    // Run initialization
    this.initVariables(gridPos_);
    this.initSprite();
  }


  initVariables(gridPos_) {
    // Initialize variables
    this.gridPos = { x: gridPos_.x, y: gridPos_.y };
    this.curGridPos = { x: gridPos_.x, y: gridPos_.y };
    this.physical = true;

    this.inputQueue = [];
    this.neighbourBlobs = [null, null, null, null];
    this.isControlled = false;
    this.isRequired = false;
    this.groupID = this.gameState.nextGroupID++;
  }


  initSprite() {
    // Create sprites then update
    this.bodySprite = new Sprite(null, null, assets.images["BLOB"]);
    this.controlledSprite = new Sprite(null, null, assets.images["BLOB_CONTROLLED"]);
    this.requiredSprite = new Sprite(null, null, assets.images["BLOB_REQUIRED"]);
    this.edgeSprites = [
      new Sprite(null, null, assets.images["BLOB_EDGE"], null, 0 * PI / 2),
      new Sprite(null, null, assets.images["BLOB_EDGE"], null, 1 * PI / 2),
      new Sprite(null, null, assets.images["BLOB_EDGE"], null, 2 * PI / 2),
      new Sprite(null, null, assets.images["BLOB_EDGE"], null, 3 * PI / 2) ];
    this.cornerSprites = [
      new Sprite(null, null, assets.images["BLOB_CORNER"], null, 0 * PI / 2),
      new Sprite(null, null, assets.images["BLOB_CORNER"], null, 1 * PI / 2),
      new Sprite(null, null, assets.images["BLOB_CORNER"], null, 2 * PI / 2),
      new Sprite(null, null, assets.images["BLOB_CORNER"], null, 3 * PI / 2) ];
    this.updateSprites();
  }

  // #endregion


  // #region - Main

  update() {
    let dx = (this.gridPos.x - this.curGridPos.x);
    let dy = (this.gridPos.y - this.curGridPos.y);

    // Lock to grid pos if nearby
    if (abs(dx * dx + dy * dy) < 0.001) {
      this.curGridPos.x = this.gridPos.x;
      this.curGridPos.y = this.gridPos.y;

      // Process next input
      if (this.inputQueue.length > 0) {
        if (this.groupCanMove(this.inputQueue[0])) {
          this.groupMove(this.inputQueue[0]);
          dx = (this.gridPos.x - this.curGridPos.x);
          dy = (this.gridPos.y - this.curGridPos.y);
        } this.inputQueue.splice(0, 1);
      }
    }

    // Move towards gridPos
    if (dx != 0 || dy != 0) {
      this.inLayerPriority = 0.9;
      this.curGridPos.x += dx * 0.4;
      this.curGridPos.y += dy * 0.4;
    } else this.inLayerPriority = 1;

    // Update sprite and state
    this.isControlled = this.gameState.controlledBlob == this;
    this.isRequired = this.gameState.requiredBlobs.indexOf(this) != -1;
    this.updateSprites();
  }


  getSprites() {
    // Return sprites
    let sprites = [];
    let yLevel = this.gridPos.y;
    sprites.push([this.bodySprite, 1, yLevel, 1]);
    if (this.isControlled) sprites.push([this.controlledSprite, 1, yLevel, 2]);
    if (this.isRequired) sprites.push([this.requiredSprite, 1, yLevel, 2]);

    // For each edge
    for (let i = 0; i < this.neighbourBlobs.length; i++) {

      // Show blocked edge
      if (this.neighbourBlobs[i] == null) {
        sprites.push([this.edgeSprites[i], 1, yLevel, 2]);

      // Show connecting corner
      } else if (this.neighbourBlobs[i] != null
      && this.neighbourBlobs[(i + 1) % 4] != null
      && (this.neighbourBlobs[i].neighbourBlobs[(i + 1) % 4] == null
      || this.neighbourBlobs[(i + 1) % 4].neighbourBlobs[(i + 3) % 4] == null)) {
        sprites.push([this.cornerSprites[i], 1, yLevel, 2]);
      }
    }

    // Return sprites
    return sprites;
  }


  debugRender() {
    let screenPos = this.gameState.gridToScreen(this.curGridPos);

    // Show group ID
    fill(0);
    textAlign(CENTER);
    textSize(25);
    text(this.groupID, screenPos.x + this.gameState.gridSize * 0.5, screenPos.y + this.gameState.gridSize - 20);

    // Show connections
    noStroke();
    fill(220, 80, 80);
    for (let i = 0; i < this.neighbourBlobs.length; i++) {
      if (this.neighbourBlobs[i] != null) {
        rect(
          screenPos.x + this.gameState.gridSize * 0.5 + directionVector[i].x * this.gameState.gridSize * 0.5 - 10,
          screenPos.y + this.gameState.gridSize * 0.5 + directionVector[i].y * this.gameState.gridSize * 0.5 - 10,
          20, 20
        );
      }
    }
  }


  updateSprites() {
    // Update body sprite
    let screenPos = this.gameState.gridToScreen(this.curGridPos);
    this.bodySprite.setPosition(screenPos.x, screenPos.y);
    this.bodySprite.setSize(this.gameState.gridSize, null);
    this.bodySprite.setOrigin(0, 1 - 1 / this.bodySprite.imageRatio, 1);
    let bodyBounds = this.bodySprite.getBounds();
    let topCentre = {
      x: bodyBounds.c0.x + this.gameState.gridSize * 0.5,
      y: bodyBounds.c0.y + this.gameState.gridSize * 0.5 };

    // Update controlled sprite
    if (this.isControlled) {
      if (!this.isRequired) this.controlledSprite.setPosition(topCentre.x, topCentre.y);
      else this.controlledSprite.setPosition(topCentre.x - this.gameState.gridSize * 0.2, topCentre.y);
      this.controlledSprite.setSize(this.gameState.gridSize * 0.2, this.gameState.gridSize * 0.2);
      this.controlledSprite.setOrigin(0.5, 0.5, 1);
    }

    // Update required sprite
    if (this.isRequired) {
      if (!this.isControlled) this.requiredSprite.setPosition(topCentre.x, topCentre.y);
      else this.requiredSprite.setPosition(topCentre.x + this.gameState.gridSize * 0.2, topCentre.y);
      this.requiredSprite.setSize(this.gameState.gridSize * 0.2, this.gameState.gridSize * 0.2);
      this.requiredSprite.setOrigin(0.5, 0.5, 1);
    }

    // Update edge and corner sprites
    for (let edgeSprite of this.edgeSprites) {
      edgeSprite.setPosition(topCentre.x, topCentre.y);
      edgeSprite.setSize(this.gameState.gridSize, this.gameState.gridSize);
      edgeSprite.setOrigin(0.5, 0.5, 1);
    }
    for (let cornerSprite of this.cornerSprites) {
      cornerSprite.setPosition(topCentre.x, topCentre.y);
      cornerSprite.setSize(this.gameState.gridSize, this.gameState.gridSize);
      cornerSprite.setOrigin(0.5, 0.5, 1);
    }
  }

  // #endregion


  // #region - Movement

  inputMovement(dir) {
    // Move all attached blobs
    if (dir.x != 0 || dir.y != 0) {
      this.inputQueue.push(dir);
    }
  }


  groupCanMove(dir) {
    // Check if the entire group can move
    let groupedBlobs = this.getGroupedBlobs();
    let pushing = [];
    for (let blob of groupedBlobs) {
      let output = blob.canMove(dir);

      // If blocked then return
      if (output == false) return false;

      // Check for pushing same group multiple times
      else if (output != true) {
        if (pushing.indexOf(output.groupID) != -1)
          blob.toPush = null;
        else pushing.push(output.groupID);
      }

    // Not blocked so move
    } return true;
  }


  canMove(dir) {
    // Check each obj at current pos
    let objsAtCurPos = this.gameState.getObjectsAtPos(
      this.gridPos.x, this.gridPos.y);
    for (let objAtCurPos of objsAtCurPos) {
      if (objAtCurPos != this) {
        let output = objAtCurPos.canMoveFrom(this, dir);
        if (output == false) return false;
      }
    }

    // Check each obj at goto pos
    let objsAtGotoPos = this.gameState.getObjectsAtPos(
      this.gridPos.x + dir.x, this.gridPos.y + dir.y);
    let toPush = null;
    for (let objAtGotoPos of objsAtGotoPos) {
      if (objAtGotoPos != this) {
        let output = objAtGotoPos.canMoveTo(this, dir);
        if (output == false) return false;

        // Handle pushing blobs
        else if (objAtGotoPos instanceof Blob && output != true)
          toPush = output;
      }
    }

    // Nothing blocking
    this.toPush = toPush;
    return this.toPush != null ? this.toPush : true;
  }


  groupMove(dir) {
    // Move all grouped blobs
    let groupedBlobs = this.getGroupedBlobs();
    for (let blob of groupedBlobs)
      blob.move(dir);
  }


  move(dir) {
    // Handle pushing
    if (this.toPush != null) {
      this.toPush.groupMove(dir);
      this.toPush = null;
    }

    // Move in a direction - assumes can move
    this.gridPos.x += dir.x;
    this.gridPos.y += dir.y;
  }


  canMoveFrom(blob, dir) {
    // Return whether can be moved from
    return true;
  }


  canMoveTo(blob, dir) {
    // Return whether can be moved onto
    if (this.groupID != blob.groupID)
      return this.groupCanMove(dir) ? this : false;
    else return true;
  }

  // #endregion


  // #region - Blobs

  attachAll() {
    // Try to attach to all blobs
    let groupedBlobs = this.getGroupedBlobs();
    let allBlobs = this.gameState.getObjectsOfType(Blob);
    for (let blob of allBlobs) {
      for (let gBlob of groupedBlobs) {
        gBlob.attachBlob(blob);
      }
    }
  }


  attachBlob(blob) {
    // Check each direction
    for (let i = 0; i < directionVector.length; i++) {
      let dir = directionVector[i];
      if (blob.gridPos.x == this.gridPos.x + dir.x
      && blob.gridPos.y == this.gridPos.y + dir.y) {

        // Update variables
        this.neighbourBlobs[i] = blob;
        blob.neighbourBlobs[(i + 2) % 4] = this;
        this.neighbourBlobs[i].updateGroupID(this.groupID);
        return;
      }
    }
  }


  detachAll() {
    // Detach from all blobs
    for (let i = 0; i < 4; i++)
      this.detachDirection(i);
  }


  detachBlob(blob) {
    // Detach a blob
    let dir = this.neighbourBlobs.indexOf(blob);
    if (dir != -1) return this.detachDirection(dir);
  }


  detachDirection(dir) {
    // Detach a specific direction
    if (this.neighbourBlobs[dir] != null) {
      this.neighbourBlobs[dir].neighbourBlobs[(dir + 2) % 4] = null;
      this.neighbourBlobs[dir] = null;

      // Update group ID
      let attachedBlobs = this.getAttachedBlobs().a;
      this.groupID = this.gameState.nextGroupID++;
      for (let blob of attachedBlobs) blob.groupID = this.groupID;
      return true;
    } return false;
  }


  getGroupedBlobs() {
    // Return a list of all blobs in the group
    return this.gameState.getObjectsOfType(Blob).filter(b => b.groupID == this.groupID);
  }


  getAttachedBlobs(allBlobs) {
    // This is first func called
    if (allBlobs == null)
      allBlobs = { a: [] };

    // Recursively call getAttachedBlobs
    for (let blob of this.neighbourBlobs) {
      if (blob != null && !allBlobs.a.includes(blob)) {
        allBlobs.a.push(blob);
        blob.getAttachedBlobs(allBlobs);
      }
    }

    // Return result
    return allBlobs;
  }


  updateGroupID(id) {
    if (id == null) id = this.groupID;

    // Update the id of all attached
    let groupedBlobs = this.getGroupedBlobs();
    for (let blob of groupedBlobs) blob.groupID = id;
  }

  // #endregion
}


class Cutter extends Obj {

  // #region - Setup

  constructor(gameState_, gridPos_, direction_) {
    super(gameState_);

    // Validate parameters
    if (!gridPos_) throw "Cutter requires gridPos_";

    // Run initialization
    this.initVariables(gridPos_, direction_);
    this.initSprite(direction_);
  }


  initVariables(gridPos_, direction_) {
    // Initialize variables
    this.gridPos = { x: gridPos_.x, y: gridPos_.y };

    this.direction = direction_ || 0;
  }


  initSprite(direction_) {
    // Create sprite then update
    this.bottomSprite = new Sprite(null, null, assets.images["CUTTER_" + directionNames[direction_]]);
    this.topSprite = new Sprite(null, null, assets.images["CUTTER_" + directionNames[direction_] + "_TOP"]);
    this.updateSprites();
  }

  // #endregion


  // #region - Main

  update() {
    // Attempt to cut blobs
    let blobsOntop = this.gameState.getObjectsAtPos(
      this.gridPos.x, this.gridPos.y, obj => (obj instanceof Blob));
    if (blobsOntop.length > 0 && blobsOntop[0].detachDirection(this.direction))
      assets.sounds.sfx["BLOB_CUT"].play();
  }


  getSprites() {
    // Return sprites
    return [
      [this.bottomSprite, 1, this.gridPos.y, 0],
      [this.topSprite, 2, this.gridPos.y, 0]
    ];
  }


  updateSprites() {
    // Update sprite position
    let screenPos = this.gameState.gridToScreen(this.gridPos);
    this.bottomSprite.setPosition(screenPos.x, screenPos.y);
    this.bottomSprite.setSize(this.gameState.gridSize, null);
    this.bottomSprite.setOrigin(0, 1 - 1 / this.bottomSprite.imageRatio, 1);
    this.topSprite.setPosition(screenPos.x, screenPos.y);
    this.topSprite.setSize(this.gameState.gridSize, null);
    this.topSprite.setOrigin(0, 1 - 1 / this.topSprite.imageRatio, 1);
  }


  canMoveFrom(blob, dir) {
    // Return whether can be moved from
    return !(this.direction == 0 && dir.x < 0
    || this.direction == 1 && dir.y < 0);
  }


  canMoveTo(blob, dir) {
    // Return whether can be moved onto
    return !(this.direction == 0 && dir.x > 0
    || this.direction == 1 && dir.y > 0);
  }

  // #endregion
}


class FloorButton extends Obj {

  // #region - Setup

  constructor(gameState_, gridPos_) {
    super(gameState_);

    // Validate parameters
    if (!gridPos_) throw "Cutter requires gridPos_";

    // Run initialization
    this.initVariables(gridPos_);
    this.initSprite();
  }


  initVariables(gridPos_) {
    // Initialize variables
    this.gridPos = { x: gridPos_.x, y: gridPos_.y };

    this.activated = false;
  }


  initSprite(direction_) {
    // Create sprite then update
    this.sprite = new Sprite(null, null, assets.images["FLOOR_BUTTON_UP"]);
    this.updateSprites();
  }

  // #endregion


  // #region - Main

  update() {
    // Attempt to cut blobs
    let blobsOntop = this.gameState.getObjectsAtPos(
      this.gridPos.x, this.gridPos.y, obj => (obj instanceof Blob));

    if (blobsOntop.length > 0) {
      if (!this.activated) assets.sounds.sfx["FLOOR_BUTTON_DOWN"].play();
      this.activated = true;
      this.outLayerPriority = -1;
      this.sprite.image = assets.images["FLOOR_BUTTON_DOWN"];

    } else {
      if (this.activated) assets.sounds.sfx["FLOOR_BUTTON_UP"].play();
      this.activated = false;
      this.outLayerPriority = 0;
      this.sprite.image = assets.images["FLOOR_BUTTON_UP"];
    }
  }


  getSprites() {
    // Return sprites
    if (this.activated) return [[this.sprite, 0, this.gridPos.y, 1]];
    return [[this.sprite, 1, this.gridPos.y, 0]];
  }


  updateSprites() {
    // Update sprite position
    let screenPos = this.gameState.gridToScreen(this.gridPos);
    this.sprite.setPosition(screenPos.x, screenPos.y);
    this.sprite.setSize(this.gameState.gridSize, null);
    this.sprite.setOrigin(0, 1 - 1 / this.sprite.imageRatio, 1);
  }


  canMoveFrom(blob, dir) {
    // Return whether can be moved from
    return true;
  }


  canMoveTo(blob, dir) {
    // Return whether can be moved onto
    return true;
  }

  // #endregion
}


class Door extends Obj {

  // #region - Setup

  constructor(gameState_, gridPos_, direction_) {
    super(gameState_);

    // Validate parameters
    if (!gridPos_) throw "Door requires gridPos_";

    // Run initialization
    this.initVariables(gridPos_, direction_);
    this.initSprite(direction_);
  }


  initVariables(gridPos_, direction_) {
    // Initialize variables
    this.gridPos = { x: gridPos_.x, y: gridPos_.y };
    this.physical = true;

    this.direction = direction_ || 0;
    this.inputObjects = [];
    this.calcMode = "AND";
    this.isOpen = false;
  }


  initSprite(direction_) {
    // Create sprite then update
    this.sprite = new Sprite(null, null, assets.images["DOOR_CLOSED_" + directionNames[direction_]]);
    this.updateSprites();
  }

  // #endregion


  // #region - Main

  update() {
    let toOpen = this.calculateIsOpen();

    // Door is open
    if (toOpen) {
      if (!this.isOpen) assets.sounds.sfx["DOOR_DOWN"].play();
      this.isOpen = true;
      this.physical = false;
      this.outLayerPriority = -1;
      this.sprite.image = assets.images["DOOR_OPEN_" + directionNames[this.direction]];

    // Door is closed
    } else {
      let blobsOntop = this.gameState.getObjectsAtPos(
        this.gridPos.x, this.gridPos.y, obj => (obj instanceof Blob));
      if (blobsOntop.length == 0) {
        if (this.isOpen) assets.sounds.sfx["DOOR_UP"].play();
        this.isOpen = false;
        this.physical = true;
        this.outLayerPriority = 0;
        this.sprite.image = assets.images["DOOR_CLOSED_" + directionNames[this.direction]];
      }
    }
  }


  getSprites() {
    // Return sprites
    if (this.isOpen) return [[this.sprite, 0, this.gridPos.y, 1]];
    else return [[this.sprite, 1, this.gridPos.y, 3]];
  }


  calculateIsOpen() {
    // Closed if no inputs
    if (this.inputObjects.length == 0)
      return false;

    // Open if all inputs on
    if (this.calcMode == "AND") {
      for (let input of this.inputObjects) {
        if (!input.activated) return false;
      } return true;

    // Open if any input on
    } else if (this.calcMode == "OR") {
      for (let input of this.inputObjects) {
        if (input.activated) return true;
      } return false;

    // Incorrect calc mode
    } else {
      return false;
    }
  }


  updateSprites() {
    // Update sprite position
    let screenPos = this.gameState.gridToScreen(this.gridPos);
    this.sprite.setPosition(screenPos.x, screenPos.y);
    this.sprite.setSize(this.gameState.gridSize, null);
    this.sprite.setOrigin(0, 1 - 1 / this.sprite.imageRatio, 1);
  }


  canMoveFrom(blob, dir) {
    // Return whether can be moved from
    return true;
  }


  canMoveTo(blob, dir) {
    // Return whether can be moved onto
    return this.isOpen;
  }

  // #endregion
}


class WinPlatform extends Obj {

  // #region - Setup

  constructor(gameState_, gridPos_) {
    super(gameState_);

    // Validate parameters
    if (!gridPos_) throw "WinPlatform requires gridPos_";

    // Run initialization
    this.initVariables(gridPos_);
    this.initSprite();
  }


  initVariables(gridPos_, direction_) {
    // Initialize variables
    this.gridPos = { x: gridPos_.x, y: gridPos_.y };
    this.physical = false;
  }


  initSprite(direction_) {
    // Create sprite then update
    this.bottomSprite = new Sprite(null, null, assets.images["WIN_PLATFORM"]);
    this.topSprite = new Sprite(null, null, assets.images["WIN_PLATFORM_TOP"]);
    this.updateSprites();
  }

  // #endregion


  // #region - Main

  update() {
    // Check whether blob ontop
    let blobsOntop = this.gameState.getObjectsAtPos(
      this.gridPos.x, this.gridPos.y, obj => (obj instanceof Blob));
    if (blobsOntop.length > 0
    && blobsOntop[0].isRequired) {
      let dx = (blobsOntop[0].gridPos.x - blobsOntop[0].curGridPos.x);
      let dy = (blobsOntop[0].gridPos.y - blobsOntop[0].curGridPos.y);
      if (abs(dx * dx + dy * dy) < 0.0002) {

        // Remove blob
        blobsOntop[0].detachAll();
        this.gameState.requiredBlobs.splice(this.gameState.requiredBlobs.indexOf(blobsOntop[0]), 1);
        this.gameState.objects.splice(this.gameState.objects.indexOf(blobsOntop[0]), 1);
        if (this.gameState.checkComplete())
          assets.sounds.sfx["LEVEL_WIN"].play();
        else assets.sounds.sfx["LEVEL_PROGRESS"].play();
      }
    }
  }


  getSprites() {
    // Return sprites
    return [
      [this.bottomSprite, 1, this.gridPos.y, 0],
      [this.topSprite, 2, this.gridPos.y, 0]
    ];
  }


  updateSprites() {
    // Update top sprite
    let screenPos = this.gameState.gridToScreen(this.gridPos);
    this.bottomSprite.setPosition(screenPos.x, screenPos.y);
    this.bottomSprite.setSize(this.gameState.gridSize, null);
    this.bottomSprite.setOrigin(0, 1 - 1 / this.bottomSprite.imageRatio, 1);

    // Update bottom sprite
    this.topSprite.setPosition(screenPos.x, screenPos.y);
    this.topSprite.setSize(this.gameState.gridSize, null);
    this.topSprite.setOrigin(0, 1 - 1 / this.topSprite.imageRatio, 1);
  }


  canMoveFrom(blob, dir) {
    // Return whether can be moved from
    return true;
  }


  canMoveTo(blob, dir) {
    // Return whether can be moved onto
    return blob.isRequired;
  }

  // #endregion
}
