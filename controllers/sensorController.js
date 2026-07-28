const { query } = require("../config/db");

// ==========================
// Receive Sensor Data
// ==========================
const saveSensorData = async (req, res) => {

    try {

        const {
            device_id,
            temperature,
            spo2,
            heart_rate
        } = req.body;

        if (!device_id) {

            return res.status(400).json({
                message: "device_id required"
            });

        }

        const device = await query(
            "SELECT * FROM devices WHERE device_id=$1",
            [device_id]
        );

        if (device.rows.length === 0) {

            return res.status(404).json({
                message: "Device not found"
            });

        }

        await query(

            `INSERT INTO sensor_data
            (device_id,temperature,spo2,heart_rate)
            VALUES($1,$2,$3,$4)`,

            [
                device_id,
                temperature,
                spo2,
                heart_rate
            ]

        );

        res.status(201).json({

            message: "Sensor data saved"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ==========================
// Latest Sensor Data
// ==========================
const getLatestSensorData = async (req, res) => {

    try {

        const { device_id } = req.params;

        const result = await query(

            `SELECT *
             FROM sensor_data
             WHERE device_id=$1
             ORDER BY timestamp DESC
             LIMIT 1`,

            [device_id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "No data found"
            });

        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {

    saveSensorData,
    getLatestSensorData

};