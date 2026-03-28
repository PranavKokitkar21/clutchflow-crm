import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';

const router = Router();

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

export default router;
