
// #region - Setup

// Import modules
const http = require("http");
const socketio = require("socket.io");


// Initialize http server
const server = http.createServer().listen(3000);
console.log("Server hosting on port 3000");

// #endregion


// #region - Main

// Initialize socket server
const io = socketio.listen(server);
io.sockets.on("connection", function (socket) {
  io.emit("message", {id: "Server", text: "Client connected"});

    // Received a message
    socket.on("message", function(data) {
      io.emit("message", { id: socket.id, text: data });
    });

    // debug
    socket.on("serverDebug", function(data) {
      console.log(data);
    });

    // Socket disconnects
    socket.on("disconnect", function() {
      io.emit("message", { id: "Server", text: "Client disconnected" });
    });
  }
);

// #endregion
