require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { initializeDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const deviceRoutes = require("./routes/device");
const sensorRoutes = require("./routes/sensor");
const statusRoutes = require("./routes/status");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use("/api/devices", deviceRoutes);
app.use("/api/sensors", sensorRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/status", statusRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running', port });
});

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user,
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed; continuing without database access:', error.message);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
