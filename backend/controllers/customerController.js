import { customerService } from '../services/customerService.js';

export const customerController = {
  async getAll(req, res) {
    try {
      const customers = await customerService.getAll();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const customer = await customerService.getDetailById(req.params.id);
      res.json(customer);
    } catch (error) {
      res.status(404).json({ error: 'Customer not found' });
    }
  },

  async create(req, res) {
    try {
      const { name, email, phone, company } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      const customer = await customerService.create({ name, email, phone, company });
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await customerService.delete(req.params.id);
      res.json({ message: 'Customer deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
