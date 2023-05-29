

let socket = io.connect();
let ready = false;
let nick = "";

socket.on("message", function(data) {
  if (ready) {
    addMessage(data.user + ": " + data.message);
  }
});

socket.on("enter", function(data) {
  addMessage("Welcome " + data.name + "!");
});


function form1Complete(e) {
  e.preventDefault();
  let inp = document.getElementById("form1Input");

  if (ready) {
    let data = {user : nick, message : inp.value};
    socket.emit("message", data);

  } else {
    nick = inp.value;
    let data = {name : nick};
    socket.emit("enter", data);
    ready = true;
  }
  inp.value = "";
}

function addMessage(text) {
  let li = document.createElement("LI");
  let txt = document.createTextNode(text);
  li.appendChild(txt);
  document.getElementById("messages").appendChild(li);
}
