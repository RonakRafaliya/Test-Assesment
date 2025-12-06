import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

const router = Router();
const controller = new TaskController();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', authorize('admin', 'manager'), validateDto(CreateTaskDto), controller.create);
router.put('/:id', authorize('admin', 'manager'), validateDto(UpdateTaskDto), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

export default router;

