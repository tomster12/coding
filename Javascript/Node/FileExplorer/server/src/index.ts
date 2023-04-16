
import { Server } from "socket.io";
import { Location } from "./types/gameTypes";


const server = new Server(3000);
console.log("Listening on *:3000");


server.sockets.on("connection", (socket) => {
  console.log(`Connected ${socket.id}`);

  socket.on("getLocation", (data, callback) => {
    const a: Location = {
      name: "Wilderness"
    };
    callback("Hello client");
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected ${socket.id}`);
  });
});
