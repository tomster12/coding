
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import GameScreen from "./gameScreen.js";
import Client from "socket.io-client";

const game  = new GameScreen();
// const ioClient = Client("http: //localhost: 3000");

// ioClient.on("connect", () => {
//     console.log("Connected.");
// });

// ioClient.on("disconnect", function() {
//     console.log("Disconnected.");
// });
