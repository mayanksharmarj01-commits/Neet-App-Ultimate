const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // Join user's personal room for receiving messages
        socket.join(socket.userId);

        // Join challenge room
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.userId} joined room ${roomId}`);
        });

        // Handle typing indicator
        socket.on('typing', ({ receiverId }) => {
            io.to(receiverId).emit('user_typing', { userId: socket.userId });
        });

        socket.on('stop_typing', ({ receiverId }) => {
            io.to(receiverId).emit('user_stop_typing', { userId: socket.userId });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });

    return io;
};
