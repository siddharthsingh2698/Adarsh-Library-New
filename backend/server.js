require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { startOvertimeChecker } = require('./jobs/overtimeChecker');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : (process.env.CLIENT_URL || 'http://localhost:3000'),
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to every request so routes can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use('/api/v1/auth',          require('./routes/authRoutes'));
app.use('/api/v1/students',      require('./routes/studentRoutes'));
app.use('/api/v1/slots',         require('./routes/slotRoutes'));
app.use('/api/v1/seats',         require('./routes/seatRoutes'));
app.use('/api/v1/checkins',      require('./routes/checkinRoutes'));
app.use('/api/v1/lockers',       require('./routes/lockerRoutes'));
app.use('/api/v1/fees',          require('./routes/feeRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/config',        require('./routes/configRoutes'));
app.use('/api/v1/dashboard',     require('./routes/dashboardRoutes'));
app.use('/api/v1/reports',       require('./routes/reportRoutes'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Adarsh Library API running', version: '2.0.0' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/v1`);
  startOvertimeChecker();
});
