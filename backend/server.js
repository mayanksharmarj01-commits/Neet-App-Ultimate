require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const db = require('./src/config/db');
const socketManager = require('./src/sockets/socketManager');

const server = http.createServer(app);

// Initialize Sockets and attach to app
const io = socketManager(server);
app.set('io', io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Basic connectivity check
        await db.query('SELECT NOW()');
        server.listen(PORT, () => {
            console.log(`🚀 NEETo Server pulsing on port ${PORT} in ${process.env.NODE_ENV} mode`);
            console.log(`🔗 Database: Ready for Hierarchical Requests`);
        });
    } catch (error) {
        console.error('❌ Fatal: Could not connect to the Grand Hierarchy Database');
        console.error(error);
        process.exit(1);
    }
};

startServer();

// Graceful error handling
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
