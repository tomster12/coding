
import blessed from "blessed";

class GameScreen {

  constructor() {    
    this.lpWidth = 80

    // Setup screen and escape input
    this.screen = blessed.screen({
      title: "File Explorer",
      smartCSR: true,
      useBCE: true,
      dockBorders: true,
      ignoreDockContrast: true
    });

    // Setup each of the blessed objects
    this.pnlt = blessed.listbar({
      parent: this.screen,
      top: 1,
      width: "100%",

      style: {
        focus: {
          selected: {
            bg: "blue"
          },
        },
        item: {
          bg: "white"
        },
        selected: {
          bg: "white"
        }
      },

      commands: {
        "exit": {
          keys: ["q"],
          callback: () => { this.screen.destroy(); }
        },
        "two": () => { },
        "three": () => { },
        "four": () => { }
      }
    });

    this.pnll = blessed.box({
      parent: this.screen,
      left: 0, top: 2, bottom: 3,
      width: this.lpWidth,

      border: { type: "line" },
      style: {
        border: { fg: "white" },
        focus: {
          border: { fg: "blue" }
        }
      }
    });

    this.pnlr = blessed.box({
      parent: this.screen,
      right: 0, top: 2, bottom: 3,
      width: `100%-${this.lpWidth}`,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      
      scrollbar: {
        bg: "#eeb6ff",
        track: {
          bg: "#ffffff"
        }
      },
      border: { type: "line" },
      style: {
        border: { fg: "white" },
        focus: {
          border: { fg: "blue" }
        }
      }
    });

    this.pnlb = blessed.box({
      parent: this.screen,
      left: 0, right: 0, bottom: 0,
      width: "100%", height: 3,
      content: ">",

      border: { type: "line" },
      style: {
        border: { fg: "white" },
        focus: {
          border: { fg: "blue" }
        }
      }
    });

    this.text_input = blessed.textbox({
      parent: this.pnlb,
      left: 2,
      width: "100%-4",
      height: "100%-2",
      keys: true,
      tags: true,
      
      style: {
        bg: "null",
        focus: {
          bg: "blue"
        }
      }
    })

    // GLOBAL | Navigation input
    this.pnll.key("tab", (ch, key) => this.pnlr.focus());
    this.pnlr.key("tab", (ch, key) => this.pnlb.focus());
    this.pnlb.key("tab", (ch, key) => this.pnlt.focus());
    this.pnlt.key("tab", (ch, key) => this.pnll.focus());
    this.screen.key([ "escape", "q", "C-c" ], (ch, key) => { return process.exit(0); });

    // pnlr | Scroll to bottom
    this.pnlr.on("focus", () => {
      this.pnlr.setScroll(this.pnlr.getLines().length - 1);
      this.screen.render();
    })

    let isInputting = false;

    // text_input | Stop typing and move to next
    this.text_input.key("tab", (ch, key) => {
      let stripped = this.text_input.getValue().trimEnd();
      this.text_input.setValue(stripped);
      this.text_input.style.bg = "null";
      this.text_input.cancel();
      isInputting = false;
      this.pnlt.focus();
      this.screen.render();
    });

    // pnlb | Start typing into input
    this.pnlb.key("enter", (ch, key) => {
      if (!isInputting) {
        isInputting = true;
        this.text_input.clearValue();
        this.text_input.readInput();
        this.screen.render();
      }
    });

    // text_input | Submit input
    this.text_input.key("enter", (ch, key) => {
      if (isInputting) {
        isInputting = false;
        const val = this.text_input.getValue();
        this.pnlr.pushLine(val);
        this.pnlr.setScroll(this.pnlr.getLines().length - 1);
        this.text_input.submit();
        this.text_input.clearValue();
        this.screen.render();
      }
    });

    // text_input | Stop typing and unfocus
    this.text_input.key("escape", (ch, key) => {
      if (isInputting) {
        isInputting = false;
        this.text_input.cancel();
        this.text_input.clearValue();
        this.screen.render();
      }
    });

    // pnlt | Focus and input
    this.pnlt.on("blur", () => {
      this.pnlt.select(0);
      this.screen.render();
    });

    this.pnlt.on("keypress", (ch, key) => {
      if (key.name == "right") this.pnlt.moveRight(1);
      if (key.name == "left") this.pnlt.moveLeft(1);
      if (key.name == "enter") this.pnlt.selectTab(this.pnlt.index);
      this.screen.render();
    });

    this.pnlt.select(-1);

    // Populate log panel
    for (let i = 0; i < 50; i++) this.pnlr.setLine(i, `This is line ${i}`);

    // Set initial input to help
    this.text_input.setValue("Type 'help' for a list of commands...");

    // Focus specific window and render
    this.pnlb.focus();
    this.screen.render();
  }
}

export default GameScreen;
