
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
  pathname = "/../public" + pathname;

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
        return res.end("Error loading " + __dirname + pathname);
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


// #region - Socket IO

// Initialize server
const io = sock.listen(server);
io.sockets.on("connection", (socket) => {
    console.log("Client connected: " + socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected: " + socket.id);
    });
  }
);

// #endregion
