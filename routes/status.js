const express = require("express");
const router = express.Router();

router.get("/:deviceId", async (req, res) => {

    const deviceId = req.params.deviceId;

    // Dummy values
    const status = {
        deviceId: deviceId,
        temperature: 28.4,
        humidity: 64,
        spo2: 98,
        heartRate: 74,
        battery: 87,
        lastUpdated: new Date(),
        online: true
    };

    res.json(status);

});

module.exports = router;