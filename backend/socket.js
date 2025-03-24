const jwt = require('jsonwebtoken');
const User = require('./models/User');

module.exports = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user to their own room
    socket.join(`user-${socket.user.id}`);

    // If user is restaurant admin, join restaurant room
    if (socket.user.restaurantId) {
      socket.join(`restaurant-${socket.user.restaurantId}`);
    }

    // Handle joining order room
    socket.on('joinOrder', (orderId) => {
      socket.join(`order-${orderId}`);
    });

    // Handle leaving order room
    socket.on('leaveOrder', (orderId) => {
      socket.leave(`order-${orderId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
