import { orderService } from '../services/orderService.js';
import { customerService } from '../services/customerService.js';

export const orderController = {
  async getAll(req, res) {
    try {
      const orders = await orderService.getAll();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { customer_id, product, amount, status } = req.body;
      if (!customer_id || !product || !amount) {
        return res.status(400).json({ error: 'customer_id, product, and amount are required' });
      }
      const order = await orderService.create({ customer_id, product, amount, status: status || 'pending' });
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }
      const order = await orderService.updateStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async syncWooCommerce(req, res) {
    try {
      const customers = await customerService.getAll();
      if (!customers.length) {
        return res.status(400).json({ error: 'No customers found. Add customers first.' });
      }
      const customerIds = customers.map(c => c.id);
      const result = await orderService.syncFromWooCommerce(customerIds);
      res.json({ message: `Synced ${result.synced} orders from WooCommerce`, ...result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
