import express from 'express';
import auth from '../middleware.js';
import {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
} from '../controllers/transactionController.js';
import { get } from 'mongoose';

const router = express.Router();

router.post('/', auth, createTransaction);
router.get("/:accountId", auth, getTransactions);
router.put("/:id", auth, updateTransaction);
router.delete("/:id", auth, deleteTransaction);

export default router;