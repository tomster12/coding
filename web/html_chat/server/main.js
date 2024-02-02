import { createServer } from "http";
import createApp from "./express.js";
import createIO from "./socket.js";

const app = createApp();
const server = createServer(app);
const io = createIO(server);

server.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
