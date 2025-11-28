import 'dotenv/config';
import http from 'http';
import passport from 'passport';

import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import app from './app.js';
import { initSocket } from './utils/socket.js';

const PORT = process.env.PORT || 4000;

const defaultOrigins = ['http://localhost:5173', 'http://localhost:4173'];
const clientOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;
const allowedOrigins = clientOrigins.length > 0 ? clientOrigins : defaultOrigins;

const startServer = async () => {
  try {
    await connectDB();
    configurePassport();

    const httpServer = http.createServer(app);
    initSocket(httpServer, allowedOrigins);

    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
