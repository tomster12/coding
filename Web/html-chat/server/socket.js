import { Server } from "socket.io";

export default function createIO(server) {
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });

        socket.on("chat message", (msg) => {
            console.log("Message: " + msg);
            io.emit("chat message", msg);
        });
    });

    return io;
}
