
import blessed from "blessed";
import Client, { Socket } from "socket.io-client";
import { Location } from "@backend/gameTypes";


class GameScreen {

  static PNLL_WIDTH = 55;

  isConstructed: Boolean;
  promptCanInput: Boolean;
  promptIsInputting: Boolean;
  promptToClear: Boolean;
  onDestroy: Function;

  el_screen: blessed.Widgets.Screen;
  el_menu: blessed.Widgets.ListbarElement;
  el_statusicon: blessed.Widgets.BoxElement;
  el_pnll: blessed.Widgets.BoxElement;
  el_pnlr: blessed.Widgets.BoxElement;
  el_pnlb: blessed.Widgets.BoxElement;
  el_prompt: blessed.Widgets.TextboxElement;


  constructor() {
    // Initialize variables
    this.isConstructed = true;
    this.promptCanInput = false;
    this.promptIsInputting = false;
    this.promptToClear = false;
    this.onDestroy = null;

    // Run main intializations
    this.initElements();

    // Focus and render
    this.el_pnlb.focus();
    this.el_screen.render();
  }

  initElements() {
    // Setup screen and escape input
    this.el_screen = blessed.screen({
      title: "File Explorer",
      smartCSR: true,
      useBCE: true,
      ignoreDockContrast: true
    });

    // Setup each of the blessed objects
    this.el_menu = blessed.listbar({
      parent: this.el_screen,
      height: 3,
      keys: true,
      autoCommandKeys: false,

      border: {
        type: "line"
      },
      style: {
        prefix: {
          fg: "green"
        },
        item: {
          fg: "white"
        },
        focus: {
          selected: {
            bg: "blue"
          },
          border: {
            fg: "blue"
          },
        },
      },

      commands: [
        {
          prefix: "q",
          text: "exit",
          callback: () => { this.destroy(); }
        },
        {
          prefix: "o",
          text: "options",
          callback: () => { this.log("[Options]\n"); }
        },
        {
          prefix: "h",
          text: "help",
          callback: () => { this.log("[Help]\n"); }
        },
      ]
    });

    this.el_statusicon = blessed.box({
      parent: this.el_menu,
      top: 0, right: 1,
      width: 2, height: 1,

      style: {
        bg: "red"
      }
    });

    this.el_pnll = blessed.box({
      parent: this.el_screen,
      left: 0, top: 3, bottom: 3,
      width: GameScreen.PNLL_WIDTH,

      border: { type: "line" },
      style: {
        border: { fg: "white" },
        focus: {
          border: { fg: "blue" }
        }
      }
    });

    this.el_pnlr = blessed.box({
      parent: this.el_screen,
      right: 0, top: 3, bottom: 3,
      width: `100%-${GameScreen.PNLL_WIDTH}`,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      
      scrollbar: {
        style: {
          bg: "green",
        },
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

    this.el_pnlb = blessed.box({
      parent: this.el_screen,
      left: 0, right: 0, bottom: 0,
      width: "100%", height: 3,
      tags: true,
      content: "{green-fg}i{/}:>",

      border: { type: "line" },
      style: {
        border: { fg: "white" },
        focus: {
          border: { fg: "blue" }
        }
      }
    });

    this.el_prompt = blessed.textbox({
      parent: this.el_pnlb,
      left: 4, right: 2,
      keys: true,
      tags: true,
      
      style: {
        bg: "null",
        fg: "white",
        focus: {
          bg: "blue",
          fg: "white"
        }
      }
    })

    // Set initial text input state
    this.el_prompt.setValue("Type 'help' for a list of commands...");
    this.promptIsInputting = false;
    this.promptToClear = true;

    // GLOBAL | Navigation input
    this.el_pnll.key("tab", (ch, key) => this.el_pnlr.focus());
    this.el_pnlr.key("tab", (ch, key) => this.el_pnlb.focus());
    this.el_pnlb.key("tab", (ch, key) => this.el_menu.focus());
    this.el_menu.key("tab", (ch, key) => this.el_pnll.focus());
    this.el_screen.key("q", (ch, key) => { this.el_menu.focus(); this.el_menu.selectTab(0); });
    this.el_screen.key("o", (ch, key) => { this.el_menu.focus(); this.el_menu.selectTab(1); });
    this.el_screen.key("h", (ch, key) => { this.el_menu.focus(); this.el_menu.selectTab(2); });
    this.el_screen.key("i", (ch, key) => { this.promptStart(); });

    // pnlr | Scroll to bottom
    this.el_pnlr.on("focus", () => {
      this.el_pnlr.setScroll(this.el_pnlr.getLines().length - 1);
      this.el_screen.render();
    })

    // prompt | Stop typing and move to next
    this.el_prompt.key("tab", (ch, key) => {
      if (this.promptInterrupt()) {
        this.el_menu.focus();
        this.el_screen.render();
      }
    });

    // pnlb | Start typing into input
    this.el_pnlb.key("enter", (ch, key) => {
      if (this.promptStart()) this.el_screen.render();
    });

    // pnlb | Clear then start typing into input
    this.el_pnlb.key("backspace", (ch, key) => {
      this.promptToClear = true;
      if (this.promptStart()) this.el_screen.render();
    });

    // prompt | Submit input
    this.el_prompt.key("enter", (ch, key) => {
      if (this.promptSubmit()) this.el_screen.render();
    });

    // prompt | Stop typing and unfocus
    this.el_prompt.key("escape", (ch, key) => {
      if (this.promptInterrupt()) this.el_screen.render();
    });
    
    // menu | Focus and input
    this.el_menu.on("blur", () => {
      this.el_menu.select(0);
      this.el_screen.render();
    });
  }


  promptStart() {
    if (!this.promptCanInput) return false;
    if (this.promptIsInputting) return false;
    if (this.promptToClear) {
      this.el_prompt.clearValue();
      this.promptToClear = false;
    }
    this.el_prompt.readInput();
    this.el_screen.render();
    this.promptIsInputting = true;
    return true;
  }

  promptSubmit() {
    if (!this.promptIsInputting) return false;
    const command = this.el_prompt.getValue();
    this.submitCommand(command);
    this.el_prompt.submit();
    this.promptIsInputting = false;
    this.el_prompt.setValue("Type 'help' for a list of commands...");
    this.promptToClear = true;
    return true;
  }
  
  promptInterrupt() {
    if (!this.promptIsInputting) return false;
    let stripped = this.el_prompt.getValue().trimEnd();
    this.el_prompt.setValue(stripped);
    this.el_prompt.cancel();
    this.promptIsInputting = false;
    if (this.el_prompt.getValue() == "") {
      this.el_prompt.setValue("Type 'help' for a list of commands...");
      this.promptToClear = true;
    }
    return true;
  }


  submitCommand(command: string) {
    command = command.trimEnd();
    if (command == "") return;
    this.log("> " + command + "\n");
  }

  log(line: string) {
    this.el_pnlr.pushLine(line);
    this.el_pnlr.setScroll(this.el_pnlr.getLines().length - 1);
    this.el_screen.render();
  }

  destroy() {
    if (this.isConstructed) {
      this.isConstructed = false;
      this.el_screen.destroy();
      if (this.onDestroy != null) this.onDestroy();
    }
  }


  setStatusIcon(active: boolean) {
    // Set status icon color
    const col = active ? "green" : "red";
    this.el_statusicon.style.bg = col;
  }
}


class Game {

  screen: GameScreen;
  socket: Socket;
  

  constructor() {
    this.initScreen();
    this.initConnection();
  }


  initScreen() {
    this.screen = new GameScreen();
    this.screen.onDestroy = () => this.onScreenDestroy();
  }

  initConnection() {
    this.socket = Client("http://localhost:3000");
    this.screen.log("Connecting...");
    
    this.socket.on("connect", () => {
        this.onConnected();
    });
    
    this.socket.on("disconnect", () => {
      this.onDisconnected();
    });
  }


  logWelcome() {
    this.screen.log("Welcome to File Explorer! Type 'help' into the prompt to get started.\n");
  }


  onScreenDestroy() {
    this.socket.disconnect();
  }

  onConnected() {
    this.screen.promptCanInput = true;
    this.screen.setStatusIcon(true);
    this.screen.log("Connected.\n");
    this.logWelcome();

    this.socket.emit("getLocation", (data: Location) => {
      this.screen.log("Received: " + data);
    });
  }

  onDisconnected() {
    if (this.screen.isConstructed) {
      this.screen.promptCanInput = false;
      this.screen.setStatusIcon(false);
      this.screen.log("Disconnected.");
      this.screen.log("Reconnecting...\n");
    } else {
      console.log("File Explorer exited.");
    }
  }
}


export default Game;
