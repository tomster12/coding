import express from "express";

function createApp() {
    const app = express();

    app.use(express.static("../client"));

    app.get("/api/hello", (req, res) => {
        res.send("Hello World!");
    });

    return app;
}

export { createApp };
