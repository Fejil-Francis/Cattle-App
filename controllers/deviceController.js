const { query } = require("../config/db");

// ==========================
// Add Device
// ==========================
const addDevice = async (req, res) => {
    try {

        const { device_id, device_name } = req.body;

        const user_id = req.user.id;

        if (!device_id || !device_name) {
            return res.status(400).json({
                message: "device_id and device_name are required"
            });
        }

        const existing = await query(
            "SELECT * FROM devices WHERE device_id=$1",
            [device_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "Device already exists"
            });
        }

        await query(
            `INSERT INTO devices(device_id, device_name, user_id)
             VALUES($1,$2,$3)`,
            [device_id, device_name, user_id]
        );

        res.status(201).json({
            message: "Device added successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// ==========================
// Get Logged-in User Devices
// ==========================
const getDevices = async (req, res) => {

    try {

        const user_id = req.user.id;

        const result = await query(
            "SELECT * FROM devices WHERE user_id=$1 ORDER BY id",
            [user_id]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    addDevice,
    getDevices
};
exports.addDevice = async (req, res) => {

    try {

        const { device_id, device_name } = req.body;

        const user_id = req.user.id;

        if (!device_id || !device_name) {

            return res.status(400).json({
                message: "Device ID and Device Name are required"
            });

        }

        const result = await pool.query(

            `
            INSERT INTO devices
            (user_id, device_id, device_name)

            VALUES
            ($1,$2,$3)

            RETURNING *
            `,

            [user_id, device_id, device_name]

        );

        res.status(201).json(result.rows[0]);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};