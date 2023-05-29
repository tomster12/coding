
const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
    const query = url.parse(req.url, true).query;
    console.log(query);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<i>Hello</i>");
    res.end();
});

server.listen(3000);
