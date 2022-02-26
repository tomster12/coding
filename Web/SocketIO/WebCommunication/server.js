
// #region - Modules

// Import modules
let http = require("http");
let path = require("path");
let fs = require("fs");
let sock = require("socket.io");

// #endregion


// #region - HTTP Server

// Handler function
function handleRequest(req, res) {
  let pathname = req.url == "/" ? "/index.html" : req.url;

  let ext = path.extname(pathname);
  let typeExt = {
    ".html": "text/html",
    ".js":   "text/javascript",
    ".css":  "text/css"
  }[ext] || "text/plain";

  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/Plain" });
        return res.end("Error loading " + pathname);
      }
      res.writeHead(200, { "Content-Type": typeExt });
      res.end(data);
    }
  );
}


// Initialize HTTP Server
const server = http.createServer(handleRequest).listen(3000);
console.log("Server started at http://localhost:3000/");

// #endregion


// #region - Socket IO Functions

// Initialize socket server
let io = sock.listen(server);
io.sockets.on("connection", function (socket) {
    console.log("Client connected: " + socket.id);

    socket.on("message", function (data) {
      console.log("Received Message from " + data.user + ": " + data.message);
      io.emit('message', data);
    });

    socket.on("enter", function (data) {
      io.emit("enter", data);
    });

    socket.on("disconnect", function() {
      console.log("Client disconnected: " + socket.id);
    });
  }
);

// #endregion
