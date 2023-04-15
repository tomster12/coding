
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import Client from "socket.io-client";
// import PromptSync from "prompt-sync";

// const prompt = PromptSync({ sigint:  true });
// const ioClient = Client("http: //localhost: 3000");

// ioClient.on("connect", () => {
//     console.log("Connected.");
// });

// ioClient.on("disconnect", function() {
//     console.log("Disconnected.");
// });

import blessed from "blessed";

const LP_WIDTH = 50

// Setup screen and escape input
const screen = blessed.screen({
  title: "File Explorer",
  smartCSR: true,
  useBCE: true,
  dockBorders: true,
  ignoreDockContrast: true
});
screen.key([ "escape", "q", "C-c" ], (ch, key) => { return process.exit(0); });

// Setup each of the blessed objects
const pnl_l = blessed.box({
  parent: screen,
  left: 0, top: 0, bottom: 3,
  width: LP_WIDTH,

  border: { type: "line" },
  style: {
    border: { fg: "white" },
    focus: {
      border: { fg: "blue" }
    }
  }
});

const pnl_r = blessed.box({
  parent: screen,
  right: 0, top: 0, bottom: 3,
  width: `100%-${LP_WIDTH}`,
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

const pnl_input = blessed.box({
  parent: screen,
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

const pnl_input_input = blessed.textbox({
  parent: pnl_input,
  left: 2,
  width: "100%-4",
  height: "100%-2",
  keys: true,
  tags: true,
  
  bg: "red",
  style: {
    bg: "null"
  }
})

// GLOBAL: Navigation input
pnl_l.key("tab", (ch, key) => pnl_r.focus());
pnl_r.key("tab", (ch, key) => pnl_input.focus());
pnl_input.key("tab", (ch, key) => pnl_l.focus());

// pnl_r: Scroll to bottom
pnl_r.on("focus", () => {
  pnl_r.setScroll(pnl_r.getLines().length - 1);
  screen.render();
})

let isInputting = false;

// pnl_input_input: Navigate and handle
pnl_input_input.key("tab", (ch, key) => {
  let stripped = pnl_input_input.getValue().trimEnd();
  pnl_input_input.setValue(stripped);
  pnl_input_input.style.bg = "null";
  pnl_input_input.cancel();
  isInputting = false;
  pnl_l.focus();
  screen.render();
});

// pnl_input: Start typing and handle
pnl_input.key("enter", (ch, key) => {
  if (!isInputting) {
    isInputting = true;
    pnl_input_input.style.bg = "blue";
    pnl_input_input.clearValue();
    pnl_input_input.readInput();
    screen.render();
  }
});

// pnl_input_input: Stop typing and handle
pnl_input_input.key("enter", (ch, key) => {
  if (isInputting) {
    isInputting = false;
    const val = pnl_input_input.getValue();
    pnl_r.pushLine(val);
    pnl_r.setScroll(pnl_r.getLines().length - 1);
    pnl_input_input.submit();
    pnl_input_input.style.bg = "null";
    pnl_input_input.clearValue();
    // pnl_input.focus();
    screen.render();
  }
});

// Populate log panel
for (let i = 0; i < 50; i++) pnl_r.setLine(i, `This is line ${i}`);

// Set initial input to help
pnl_input_input.setValue("{blink}Type 'help' for a list of commands...{/blink}");

// Focus specific window and render
pnl_input.focus();
screen.render();
