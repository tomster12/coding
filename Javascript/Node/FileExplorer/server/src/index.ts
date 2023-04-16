
import { Server } from "socket.io";
const ioServer = new Server(3000);
console.log("Listening on *:3000");

ioServer.sockets.on("connection", (socket) => {
  console.log(`Connected ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Disconnected ${socket.id}`);
  });
});
