import { Router } from 'express';
import { logController } from '../controllers/logController.js';

const router = Router();

router.get('/recent', logController.getRecent);
router.get('/:customerId', logController.getByCustomer);
router.post('/', logController.create);

export default router;
