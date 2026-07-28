const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const deviceController = require("../controllers/deviceController");
const {
    addDevice,
    getDevices
} = require("../controllers/deviceController");

// Add Device
router.post("/", authMiddleware, addDevice);
router.post("/", authMiddleware, deviceController.addDevice);
// Get Logged-in User Devices
router.get("/", authMiddleware, getDevices);

module.exports = router;