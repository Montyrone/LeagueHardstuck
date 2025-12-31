import express from 'express';

// For now, single-user app doesn't need auth
// This is a placeholder for future expansion
const router = express.Router();

router.get('/check', (req, res) => {
  res.json({ authenticated: true, userId: 1 });
});

export default router;

