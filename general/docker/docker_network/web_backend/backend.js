// Import modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Setup express with parser middleware
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB database");
});

// Create SensorData schema and model
const sensorDataSchema = new mongoose.Schema({
    sensor_name: String,
    sensor_data: Number,
    timestamp: { type: Date, default: Date.now },
});
const SensorData = mongoose.model("SensorData", sensorDataSchema);

app.post("/sensor-data", (req, res) => {
    // Save data to database
    console.log(
        "Received data: " + req.body.sensor_name + " = " + req.body.sensor_data
    );
    const sensorData = new SensorData({
        sensor_name: req.body.sensor_name,
        sensor_data: req.body.sensor_data,
    });
    sensorData
        .save()
        .then(() => {
            res.sendStatus(200);
        })

        .catch((err) => {
            console.error(err);
            res.status(500).send("Error saving sensor data to database");
        });
});

app.get("/sensor-data", (req, res) => {
    // Group by sensor_name and get latest
    SensorData.aggregate([
        { $sort: { sensor_name: 1, timestamp: 1 } },
        { $group: { _id: "$sensor_name", docs: { $push: "$$ROOT" } } },
        { $project: { docs: { $lastN: { input: "$docs", n: 20 } } } },
        { $sort: { _id: 1 } },
    ])

        // Process data into nice format and return
        .then((groupedData) => {
            const data = groupedData.reduce((acc, group) => {
                acc[group._id] = group.docs;
                return acc;
            }, {});
            res.json(data);
        })

        .catch((err) => {
            console.error(err);
            res.status(500).send("Error getting sensor data from database");
        });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
