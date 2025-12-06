import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation.middleware';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', validateDto(RegisterDto), controller.register);
router.post('/login', validateDto(LoginDto), controller.login);

export default router;

