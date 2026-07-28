const express = require("express");

const router = express.Router();

const {
    saveSensorData,
    getLatestSensorData
} = require("../controllers/sensorController");

// ESP8266 sends sensor values
router.post("/", saveSensorData);

// Flutter gets latest reading
router.get("/:device_id", getLatestSensorData);

module.exports = router;