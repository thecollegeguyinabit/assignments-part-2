import express from "express";
import {  
    signinHandler, 
    signinValidation, 
    signupHandler, 
    signupValidation, 
    signoutHandler 
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", (req, res) => res.redirect("/signin"));

router.route("/signin")
    .get((req, res) => res.render("signin", {error: null}))
    .post(signinValidation, signinHandler);

router.route("/signup")
    .get((req, res) => res.render("signup", {error: null}))
    .post(signupValidation, signupHandler);

router.get("/signout", signoutHandler);

export default router;