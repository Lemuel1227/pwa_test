import { Router } from 'express';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
