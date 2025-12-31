import express from 'express';
import {
  getMistakes,
  getMistakeStats
} from '../controllers/mistakeController.js';

const router = express.Router();

router.get('/stats', getMistakeStats);
router.get('/', getMistakes);

export default router;

