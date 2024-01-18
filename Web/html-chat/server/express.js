import express from "express";

export default function createApp() {
    const app = express();

    app.use(express.static("../client"));

    app.get("/api/hello", (req, res) => {
        res.send("Hello World!");
    });

    return app;
}
