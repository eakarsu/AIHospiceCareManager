const express = require('express');
const auth = require('../middleware/auth');
const models = require('../models');

// Generic CRUD route factory
function createCrudRouter(Model, modelName, includeOptions = {}) {
  const router = express.Router();

  // Get all
  router.get('/', auth, async (req, res) => {
    try {
      const items = await Model.findAll({
        order: [['createdAt', 'DESC']],
        ...includeOptions
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get by ID
  router.get('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id, includeOptions);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create
  router.post('/', auth, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update
  router.put('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      await item.update(req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete
  router.delete('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      await item.destroy();
      res.json({ message: `${modelName} deleted successfully` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get by patient ID (for patient-related models)
  if (Model.rawAttributes.patientId) {
    router.get('/patient/:patientId', auth, async (req, res) => {
      try {
        const items = await Model.findAll({
          where: { patientId: req.params.patientId },
          order: [['createdAt', 'DESC']]
        });
        res.json(items);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }

  return router;
}

module.exports = createCrudRouter;
