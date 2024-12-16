import express from 'express';
import categoriesService from '../services/category.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const categories = await categoriesService.findAll();
      res.json(categories);  // Hoặc render lên một trang tùy theo yêu cầu
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Internal Server Error');
    }
  });

export default router;