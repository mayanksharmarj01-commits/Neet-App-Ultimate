require('dotenv').config();
const http = require('http');
const app = require('./src/app');
require('./src/config/db'); // Initialize Firebase
const socketManager = require('./src/sockets/socketManager');

const server = http.createServer(app);

// Initialize Sockets and attach to app
const io = socketManager(server);
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 NEETo Server pulsing on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`🔗 Firebase Firestore: Ready`);
});

// Graceful error handling
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
