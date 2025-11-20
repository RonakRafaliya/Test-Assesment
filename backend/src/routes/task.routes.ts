import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();
const controller = new TaskController();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', authorize('admin', 'manager'), controller.create);
router.put('/:id', authorize('admin', 'manager'), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

export default router;

