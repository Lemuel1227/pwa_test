import { Server } from 'socket.io';

let ioInstance;

export const initSocket = (httpServer, origin) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin,
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
      }
    });

    socket.on('disconnect', () => {
      socket.rooms.clear?.();
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized');
  }
  return ioInstance;
};

export const emitTaskEvent = (userId, eventName, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(userId).emit(eventName, payload);
};
