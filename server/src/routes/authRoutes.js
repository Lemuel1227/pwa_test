import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  googleAuth,
  googleCallback,
} from '../controllers/authController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', ensureAuthenticated, logout);
router.get('/me', ensureAuthenticated, getCurrentUser);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
