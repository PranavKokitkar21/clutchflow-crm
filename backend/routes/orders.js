import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';

const router = Router();

router.get('/', orderController.getAll);
router.post('/', orderController.create);
router.patch('/:id/status', orderController.updateStatus);
router.get('/woocommerce/sync', orderController.syncWooCommerce);

export default router;
