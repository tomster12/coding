
class Input {

  // #region - Main

  constructor() {
    // Declare and initialize variables
    this.keys = { held: {}, clicked: {} };
    this.mouse = { held: {}, clicked: {} };
    this.mouseWheel = 0;

    // Bind input functions
    let prevKeyPressed = window.keyPressed || (() => {});
    let prevKeyReleased = window.keyReleased || (() => {});
    let prevMousePressed = window.mousePressed || (() => {});
    let prevMouseReleased = window.mouseReleased || (() => {});
    let prevMouseWheel = window.mouseWheel || (() => {});
    window.keyPressed = () => { this.keys.held[keyCode] = true; this.keys.clicked[keyCode] = true; prevKeyPressed(); }
    window.keyReleased = () => { delete this.keys.held[keyCode]; delete this.keys.clicked[keyCode]; prevKeyReleased();  }
    window.mousePressed = () => { this.mouse.held[mouseButton] = true; this.mouse.clicked[mouseButton] = true; prevMousePressed();  }
    window.mouseReleased = () => { delete this.mouse.held[mouseButton]; delete this.mouse.clicked[mouseButton]; prevMouseReleased();  }
    window.mouseWheel = (e) => { this.mouseWheel = e.delta; prevMouseWheel(e); }
  }


  draw() {
    // Update clicked
    this.keys.clicked = {};
    this.mouse.clicked = {};
    this.mouseWheel = 0;
  }

  // #endregion
};