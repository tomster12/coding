
const http = require("http");

http.get("http://localhost:3000/", (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
}).end();
