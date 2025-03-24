import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket.io instance
let socket = null;

// Connect to WebSocket server
export const connectSocket = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token available');
    }

    // Create socket connection
    socket = io('http://localhost:3000', {
      auth: {
        token
      }
    });

    // Setup event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return true;
  } catch (error) {
    console.log('Error connecting socket:', error);
    return false;
  }
};

// Disconnect from WebSocket server
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Subscribe to an event
export const subscribeToEvent = (event, callback) => {
  if (!socket) {
    console.log('Socket not connected');
    return false;
  }

  socket.on(event, callback);
  return true;
};

// Unsubscribe from an event
export const unsubscribeFromEvent = (event, callback) => {
  if (!socket) {
    return;
  }

  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

// Emit an event
export const emitEvent = (event, data) => {
  if (!socket) {
    console.log('Socket not connected');
    return false;
  }

  socket.emit(event, data);
  return true;
};
