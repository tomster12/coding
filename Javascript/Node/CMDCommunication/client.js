
const sockio = require("socket.io-client");
const readline = require('readline');
const socket = sockio("http://localhost:3000");


// Initialize variables
let messages = [];
let rl = readline.createInterface(process.stdin, process.stdout);
updateOutput();


// Main terminal loop
rl.on("line", input => {
    if (input === "exit") rl.close();
    socket.emit("message", input);
    updateOutput();
}).on("close", _ => { process.exit(0); });


// Add a message to the list
socket.on("message", data => {
  messages.push(data);
  updateOutput();
});


function updateOutput() {
  // Setup variables
  let leftBorder = 4;
  let outerBorder = 1;
  let messagesWidth = 50;
  let wslb = " ".repeat(leftBorder);
  let wsob = "\n".repeat(outerBorder);
  let wsmw = "-".repeat(messagesWidth);
  let linesAmount = 30;
  let lines = [];
  let re = new RegExp(".{1," + messagesWidth + "}", "g");

  // Add message segments to lines
  for (let message of messages) {
    lines.push("\x1b[35m -" + message.id + "\x1b[0m");
    let messageLines = message.text.match(re);
    lines = lines.concat(messageLines);
    lines.push("");
  }

  // Limit / pad lines
  lines = lines.splice(Math.max(lines.length - linesAmount, 0));
  let toFillAmount = Math.max(linesAmount - lines.length, 0);
  for (let i = 0; i < toFillAmount; i++) lines.unshift("");

  // Update the output of the console using lines
  console.clear();
  console.log("\x1b[32m" + wsob + wslb + wsmw + "\x1b[0m");
  for (let i = 0; i < lines.length; i++)
    console.log(wslb + lines[i]);
  console.log("\x1b[32m" + wslb + wsmw + wsob + "\x1b[0m");
  rl.setPrompt(wslb + ":");
  rl.prompt();
}
