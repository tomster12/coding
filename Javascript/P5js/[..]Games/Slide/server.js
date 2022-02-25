
// #region - Requirements

// Variables
let http = require("http");
let path = require("path");
let fs = require("fs");

// #endregion


// #region - HTTP Server

// Setup HTTP server
let server = http.createServer(handleRequest).listen(3000);
console.log("Server started on port 3000");


// Handle http request
function handleRequest(req, res) {
  let pathname = req.url == "/" ? "/index.html" : req.url;
  let ext = path.extname(pathname);
  let contentType = {
    ".html": "text/html",
    ".js":   "text/javascript",
    ".css":  "text/css"
  }[ext] || "text/plain";
  console.log("Requested " + pathname + ": " + contentType);

  // Read the requested file
  fs.readFile(__dirname + pathname, (err, data) => {
      if (err) {
        res.writeHead(500, {"Content-Type": "text/Plain"});
        res.end("Error loading " + pathname);
      }
      res.writeHead(200, {"Content-Type": contentType});
      res.end(data);
    }
  );
}

// #endregion
