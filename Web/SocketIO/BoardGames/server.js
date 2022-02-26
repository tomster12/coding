

// #region - Modules

let http = require("http");
let path = require("path");
let fs = require("fs");
let sock = require("socket.io");

// #endregion


// #region - HTTP Handle Request Function

function handleRequest(req, res) {
  let pathname = req.url;
  if (pathname == "/") {pathname = "/index.html";}


  let ext = path.extname(pathname);
  let typeExt = {
    ".html": "text/html",
    ".js":   "text/javascript",
    ".css":  "text/css"
  };
  let contentType = typeExt[ext] || "text/plain";


  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500, {"Content-Type": "text/Plain"});
        return res.end("Error loading " + pathname);
      }
      res.writeHead(200, {"Content-Type": contentType});
      res.end(data);
    }
  );
}

// #endregion


// #region - HTTP Setup Server

var server = http.createServer(handleRequest);
server.listen(3000);
console.log("Server started on port 3000");

// #endregion


// #region - Socket IO Functions

let io = sock.listen(server);
io.sockets.on("connection", function (socket) {
    console.log("Client connected: " + socket.id);

    socket.on("disconnect", function() {
      console.log("Client disconnected: " + socket.id);
    });
  }
);

// #endregion
