
import fs from "fs";
import blessed from "blessed";
import Client, { Socket } from "socket.io-client";
import {
  UserAuth,
  RegisterResponse,
  Realm,
  Location
} from "@backend/globalTypes";

type LayoutOptions = {

  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  width?: number | string;
  height?: number | string;
}

interface IFocusable {

  focus(): void;
}

class GameDirectoryViewerElement implements IFocusable {

  gameScreen: GameScreen;
  private el: blessed.Widgets.BoxElement;
  nextEl: blessed.Widgets.BlessedElement;
  realm: Realm;
  current: Location;

  constructor(
    gameScreen: GameScreen,
    parent: blessed.Widgets.Node,
    nextEl: blessed.Widgets.BlessedElement,
    layoutOptions: LayoutOptions
  ) {
    // Initialize variables
    this.gameScreen = gameScreen;
    this.nextEl = nextEl;

    // Initialize element
    this.el = blessed.box({
      parent: parent,
      ...layoutOptions,
      border: { type: "line" },
      style: {
        border: { fg: "white" },
        focus: {
          border: { fg: "blue" }
        }
      }
    });
    
    // | Focus next element
    this.el.key("tab", (ch, key) => this.nextEl.focus());

    // Reset content
    this.el.content = "No Realm loaded...";
  }

  focus() {
    this.el.focus();
  }
}

class UserInputElement implements IFocusable  {

  gameScreen: GameScreen;
  private el: blessed.Widgets.TextareaElement;
  nextEl: blessed.Widgets.BlessedElement;
  canInput: Boolean;
  isInputting: Boolean;
  toClear: Boolean;
  onSubmit: (command: string) => void;

  constructor(
    gameScreen: GameScreen,
    parent: blessed.Widgets.Node,
    nextEl: blessed.Widgets.BlessedElement,
    layoutOptions: LayoutOptions
  ) {
    // Initialize variables
    this.gameScreen = gameScreen;
    this.nextEl = nextEl;
    this.canInput = false;
    this.isInputting = false;
    this.toClear = false;
    this.onSubmit = null;

    // Initialize element
    this.el = blessed.textarea({
      parent: parent,
      ...layoutOptions,
      height: 1,
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
    });

    // | Stop typing and move to next
    this.el.key("tab", (ch, key) => {
      if (this.interruptInput()) {
        this.nextEl.focus();
        this.gameScreen.rerender();
      }
    });

    // | Submit input
    this.el.key("enter", (ch, key) => {
      if (this.submitInput()) this.gameScreen.rerender();
    });

    // | Stop typing and unfocus
    this.el.key("escape", (ch, key) => {
      if (this.interruptInput()) this.gameScreen.rerender();
    });

    // Set initial content
    this.el.setValue("Type 'help' for a list of commands...");
    this.toClear = true;
  }

  startInput(toClear?: boolean) {
    if (!this.canInput) return false;
    if (this.isInputting) return false;
    if (this.toClear || toClear) {
      this.el.clearValue();
      this.toClear = false;
    }
    this.el.readInput();
    this.gameScreen.rerender();
    this.isInputting = true;
    return true;
  }

  submitInput() {
    if (!this.isInputting) return false;
    const command = this.el.getValue();
    if (this.onSubmit != null) this.onSubmit(command);
    this.el.submit();
    this.isInputting = false;
    this.el.setValue("Type 'help' for a list of commands...");
    this.toClear = true;
    return true;
  }
  
  interruptInput() {
    if (!this.isInputting) return false;
    let stripped = this.el.getValue().trimEnd();
    this.el.setValue(stripped);
    this.el.cancel();
    this.isInputting = false;
    if (this.el.getValue() == "") {
      this.el.setValue("Type 'help' for a list of commands...");
      this.toClear = true;
    }
    return true;
  }

  focus() {
    this.el.focus();
  }
}

class GameStatus {

  private el: blessed.Widgets.BoxElement;
  gameScreen: GameScreen;
  isActive: boolean;

  constructor(
    gameScreen: GameScreen,
    parent: blessed.Widgets.Node,
    layoutOptions: LayoutOptions
  ) {
    this.el = blessed.box({
      parent: parent,
      ...layoutOptions,
      style: { bg: "red" }
    });
    this.isActive = false;
  }

  setActive(isActive: boolean) {
    const col = isActive ? "green" : "red";
    this.el.style.bg = col;
  }
}

class GameScreen {

  static PNLL_WIDTH = 35;
  static LOGIN_WIDTH = 15;

  isConstructed: Boolean;
  onDestroy: Function;

  el_screen: blessed.Widgets.Screen;
  el_user: blessed.Widgets.BoxElement;
  el_menu: blessed.Widgets.ListbarElement;
  el_pnll: blessed.Widgets.BoxElement;
  el_pnlr: blessed.Widgets.BoxElement;
  el_pnlb: blessed.Widgets.BoxElement;
  el_directory: GameDirectoryViewerElement;
  el_prompt: UserInputElement;
  el_statusConnect: GameStatus;
  el_statusLogin: GameStatus;

  constructor() {
    // Initialize variables
    this.isConstructed = true;
    this.onDestroy = null;

    // Run main intializations
    this.initElements();

    // Focus and render
    this.el_pnlb.focus();
    this.rerender();
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
      width: `100%-${GameScreen.LOGIN_WIDTH}`,
      height: 3,
      keys: true,
      autoCommandKeys: false,
      border: { type: "line" },
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
          border: { fg: "blue" },
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

    this.el_user = blessed.box({
      parent: this.el_screen,
      width: GameScreen.LOGIN_WIDTH,
      height: 3,
      top: 0, right: 0,
      tags: true,
      content: "{center}{green-fg}r{/}:Register{/}",

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
      tags: true,
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
    this.el_pnlr.pushLine(" ");

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

    this.el_directory = new GameDirectoryViewerElement(this, this.el_screen, this.el_pnlr, {
      left: 0, top: 3, bottom: 3,
      width: GameScreen.PNLL_WIDTH
    });

    this.el_prompt = new UserInputElement(this, this.el_pnlb, this.el_menu, {
      left: 4, right: 2,
      width: "100%-7", height: 3
    });

    this.el_statusConnect = new GameStatus(this, this.el_menu, {
      top: 0, right: 4,
      width: 2, height: 1,
    });
    
    this.el_statusLogin = new GameStatus(this, this.el_menu, {
      top: 0, right: 1,
      width: 2, height: 1,
    });

    // GLOBAL | Navigation input
    this.el_pnlr.key("tab", (ch, key) => this.el_pnlb.focus());
    this.el_pnlb.key("tab", (ch, key) => this.el_menu.focus());
    this.el_menu.key("tab", (ch, key) => this.el_user.focus());
    this.el_user.key("tab", (ch, key) => this.el_directory.focus());

    this.el_screen.key("q", (ch, key) => { this.el_menu.focus(); this.el_menu.selectTab(0); });
    this.el_screen.key("o", (ch, key) => { this.el_menu.focus(); this.el_menu.selectTab(1); });
    this.el_screen.key("h", (ch, key) => { this.el_menu.focus(); this.el_menu.selectTab(2); });
    this.el_screen.key("i", (ch, key) => { this.el_prompt.startInput(); });

    // pnlr | Scroll to bottom
    this.el_pnlr.on("focus", () => {
      this.el_pnlr.setScroll(this.el_pnlr.getLines().length - 1);
      this.rerender();
    })

    // pnlb | Start typing into input
    this.el_pnlb.key("enter", (ch, key) => {
      if (this.el_prompt.startInput()) this.rerender();
    });

    // pnlb | Clear then start typing into input
    this.el_pnlb.key("backspace", (ch, key) => {
      if (this.el_prompt.startInput(true)) this.rerender();
    });
    
    // menu | Focus and input
    this.el_menu.on("blur", () => {
      this.el_menu.select(0);
      this.rerender();
    });
  }

  log(line: string, bg?: string, fixedWidth?: number) {
    let formattedLine = " " + line;
    if (fixedWidth != undefined) formattedLine = formattedLine.padEnd(fixedWidth, " ");
    if (bg != undefined) formattedLine = `{${bg}-bg}${formattedLine}{/}`;
    this.el_pnlr.pushLine(formattedLine);
    this.el_pnlr.setScroll(this.el_pnlr.getLines().length - 1);
    this.rerender();
  }

  logLine(length:number = 45) {
    this.el_pnlr.pushLine("─".repeat(length));
    this.el_pnlr.setScroll(this.el_pnlr.getLines().length - 1);
    this.rerender();
  }

  rerender() {
    this.el_screen.render();
  }

  destroy() {
    if (this.isConstructed) {
      this.isConstructed = false;
      this.el_screen.destroy();
      if (this.onDestroy != null) this.onDestroy();
    }
  }

  setUser(userID: string) {
    this.el_user.setContent(`{center}${userID}{/}`);
  }
}

class Game {

  static CNCT_LOG_COLOR: string = "blue";
  static CNCT_LOG_WIDTH: number = 75;

  screen: GameScreen;
  socket: Socket;
  validAuth: UserAuth;

  constructor() {
    this.initScreen();
    this.initConnection();
  }

  initScreen() {
    this.screen = new GameScreen();
    this.screen.onDestroy = () => this.socket.disconnect();
    this.screen.el_prompt.onSubmit = (command: string) => this.runCommand(command);
    this.screen.el_screen.key("r", (ch, key) => {
      if (this.validAuth != null) return;
      this.screen.el_user.focus();
      this.initSession(true);
    });
    this.screen.el_user.key("enter", (ch, key) => {
      if (this.validAuth != null) return;
      this.screen.el_user.focus();
      this.initSession(true);
    });
  }

  initConnection() {
    this.screen.log("--- Attempting connection and login ---");
    this.screen.log(" ");
    this.screen.logLine(Game.CNCT_LOG_WIDTH);
    this.logConnectionInfo(" ");
    const url = "http://localhost:3000";
    this.socket = Client(url);
    this.logConnectionInfo(`Connecting to ${url}...`);
    
    this.socket.on("connect", () => {
        this.screen.el_statusConnect.setActive(true);
        this.logConnectionInfo("Successfully connected!");
        this.logConnectionInfo(" ");
        this.initSession();
    });
    
    this.socket.on("disconnect", () => {
      if (this.screen.isConstructed) {
        this.validAuth = null;
        this.screen.el_prompt.canInput = false;
        this.screen.el_statusConnect.setActive(false);
        this.screen.el_statusLogin.setActive(false);
        this.screen.log("Disconnected!\n");

        this.screen.log("--- Attempting connection and login ---");
        this.screen.logLine(Game.CNCT_LOG_WIDTH);
        this.logConnectionInfo(" ");
        this.logConnectionInfo(`Reconnecting to ${url}...`);
      } else {
        console.log("File Explorer exited.");
      }
    });
  }

  initSession(toPrintOpening: boolean = false) {
    if (toPrintOpening) {
      this.screen.log("--- Attempting login ---");
      this.screen.log(" ");
      this.screen.logLine(Game.CNCT_LOG_WIDTH);
      this.logConnectionGap();
    }
    this.logConnectionInfo(`Searching for .user file...`);
    fs.readFile(".user", "utf8", (err, data) => { 
      if (err) {
        this.logConnectionInfo("No .user detected! prompting...");
        this.logConnectionGap();
        this.promptNewUser();
      }
      else {
        const localAuth: UserAuth = JSON.parse(data);
        this.logConnectionInfo(`Found .user for ( ${localAuth.userID} : ${localAuth.token} )`);
        this.logConnectionInfo("Requesting login...");
        this.logConnectionGap();
        this.sendLoginRequest(localAuth);
      }
    });
  }
  
  promptNewUser() {
    let el_registerprompt = blessed.prompt({
      parent: this.screen.el_screen,
      width: "half", height: "shrink",
      top: "center", left: "center",
      label: " {blue-fg}Register{/blue-fg} ",
      tags: true,
      border: "line"
    });

    el_registerprompt.input("Username:", "", (err, value) => {
      if (err || value == undefined || value == null || value == "") {
        this.logConnectionInfo("No userID inputted!");
        this.logConnectionGap();
        this.screen.logLine(Game.CNCT_LOG_WIDTH);
      } else {
        this.logConnectionInfo(`Registering user '${value}'...`);
        this.logConnectionGap();
        this.sendRegisterRequest(value);
      }
    });
  }

  sendRegisterRequest(userID: string) {
    this.socket.emit("requestRegister", userID, (response?: RegisterResponse) => {
      if (!response.accepted) {
        this.logConnectionInfo(`Could not register userID '${userID}'.`);
        this.logConnectionInfo(`Reason: ${response.reason}.`);
        this.logConnectionGap();
        this.screen.logLine(Game.CNCT_LOG_WIDTH);
        this.screen.log(" ");
      } else {
        this.validAuth = response.userAuth;
        this.logConnectionInfo(`Successfully registered account for '${response.userAuth.userID}'!`);
        this.logConnectionInfo(`Overwriting .user with new user details.`);
        this.logConnectionGap();
        fs.writeFile(".user", JSON.stringify(response.userAuth), (err) => {
          if (err) {
            this.logConnectionInfo("Failed to write .user! You may have issues on next login.");
            this.logConnectionGap();
          }
        });
        this.screen.logLine(Game.CNCT_LOG_WIDTH);
        this.screen.log(" ");
        this.onLoggedIn();
      }
    });
  }

  sendLoginRequest(localAuth: UserAuth) {
    this.socket.emit("requestLogin", localAuth, (res: boolean) => {
      if (!res) {
        this.logConnectionInfo(`Could not login with userID '${localAuth.userID}'.`);
        this.logConnectionInfo(`invalid .user, deleting...`);
          this.logConnectionGap();
          fs.unlink(".user", (err) => { });
          this.screen.logLine(Game.CNCT_LOG_WIDTH);
          this.screen.log(" ");
      } else {
        this.screen.log(`Successful login, Welcome ${localAuth.userID}!`, Game.CNCT_LOG_COLOR, Game.CNCT_LOG_WIDTH)
        this.logConnectionGap();
        this.screen.logLine(Game.CNCT_LOG_WIDTH);
        this.screen.log(" ");
        this.validAuth = localAuth;
        this.onLoggedIn();
      }
    });
  }

  onLoggedIn() {
    this.screen.el_statusLogin.setActive(true);
    this.screen.setUser(this.validAuth.userID);
    this.screen.log("Welcome to File Explorer! Type 'help' into the prompt to get started.\n");
    this.screen.el_prompt.canInput = true;

    this.socket.emit("getRealm", this.validAuth, (data: Realm) => {
      this.screen.log(JSON.stringify(data));
    });
  }

  logConnectionInfo(message: string) { this.screen.log(message, Game.CNCT_LOG_COLOR, Game.CNCT_LOG_WIDTH); }

  logConnectionGap() { this.screen.log(" ", Game.CNCT_LOG_COLOR, Game.CNCT_LOG_WIDTH); }

  runCommand(command: string) {
    command = command.trimEnd();
    if (command == "") return;
    this.screen.log("> " + command + "\n");
  }
}

export default Game;
