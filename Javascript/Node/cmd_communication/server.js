import { createServer } from "http";
import { listen } from "socket.io";

const server = createServer().listen(3000);
console.log("Server hosting on port 3000");

// Initialize socket server
const io = listen(server);
io.sockets.on("connection", function (socket) {
    io.emit("message", { id: "Server", text: "Client connected" });

    // Received a message
    socket.on("message", (data) => {
        io.emit("message", { id: socket.id, text: data });
    });

    // Debug log message
    socket.on("serverDebug", (data) => {
        console.log(data);
    });

    // Socket disconnects
    socket.on("disconnect", () => {
        io.emit("message", { id: "Server", text: "Client disconnected" });
    });
});
