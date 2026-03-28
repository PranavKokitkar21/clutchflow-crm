import { logService } from '../services/logService.js';

export const logController = {
  async getByCustomer(req, res) {
    try {
      const logs = await logService.getByCustomerId(req.params.customerId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { customer_id, message, type } = req.body;
      if (!customer_id || !message) {
        return res.status(400).json({ error: 'customer_id and message are required' });
      }
      const log = await logService.create({
        customer_id,
        message,
        type: type || 'note',
      });
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecent(req, res) {
    try {
      const logs = await logService.getRecent(20);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
