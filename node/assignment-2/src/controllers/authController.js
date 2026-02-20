import { validationResult, body} from "express-validator";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import {sendTestEmail} from "../utils/nodemailer.js";


// set jwt token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

// validation rules for signin and signup
export const signinValidation = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Please enter valid email format"),
    body("password").isLength({min: 8}).notEmpty().withMessage("Password must be at least 8 characters long")
] 

export const signupValidation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Please enter valid email format"),
    body("password").isLength({min: 8}).notEmpty().withMessage("Password must be at least 8 characters long")
]

export async function signinHandler(req, res) {

    try {
        // check for any vaqlidation errors from form
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        /**
         * check if user exists with given email
         * if user exists, redirect to dashboard
         * if user does not exist, redirect to signup page
         */
        const {email, password} = req.body;

        // check if user exists with given email
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // check password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Password don\'t match' });
        }

        // if everything is ok, redirect to dashboard
        const token = generateToken(user._id);
        res.cookie("token", token, { 
            httpOnly: true,
            maxAge: 5 * 60 * 60 * 1000, // 5 hours
            sameSite: "lax",
        });
        
        res.json({
            success: true,
            redirectUrl: '/dashboard',
            message: 'Logged in successfully!'
        });
    } catch (error) {
        console.error("Error during sign in:", error);
        res.status(500).json({ error: 'An error occurred during sign in. Please try again.' });
    }
}

export async function signupHandler(req, res) {
    try{
        // check for any vaqlidation errors from form
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const {name, email, password} = req.body;
        // check if user already exists with given email
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        user = new User({name, email, password});
        await user.save();

        // send welcome email to user
        sendTestEmail(email, name);

        // set cookie with jwt token
        const token = generateToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 5 * 60 * 60 * 1000, // 5 hours
            sameSite: "lax",
        });

        // if everything is ok,return json with redirectUrl to dashbaord
        res.json({
            success: true,
            redirectUrl: '/dashboard',
            message: 'Account created successfully! Welcome to Expense Manager.'
        });
    } catch (error) {
        if( error.name === 'ValidationError'){
            res.status(500).json({ error: error.message });
        }
        console.error("Error during signup:", error);
        res.status(500).json({ error: 'An error occurred during signup..' });
    }
}

export function signoutHandler(req, res) {
    res.clearCookie("token");
    return res.redirect("/signin");
}