import express from 'express';

import dashboard from '../controllers/userController.js';
import auth from '../middleware.js';

const router = express.Router();

router.get('/', auth, dashboard);

export default router;