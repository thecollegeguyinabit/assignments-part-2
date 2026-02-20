import express from 'express';
import auth from "../middleware.js";
import {
    getAccounts,
    createAccount,
    shareAccount,
    updateAccount,
    deleteAccount
} from "../controllers/accountController.js";

const router = express.Router();

router.route("/")
    .get(auth, getAccounts)
    .post(auth, createAccount);

router.route("/:id")
    .put(auth, updateAccount)
    .delete(auth, deleteAccount);

router.post("/:id/share", auth, shareAccount);

export default router;