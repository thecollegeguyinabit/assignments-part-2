import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const PORT = process.env.PORT;

const app = express();

// set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

// setup MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


// serve static files from the "public" directory
app.use(express.static(path.join(import.meta.dirname, "public")));

// set middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/accounts", accountRoutes);
app.use("/dashboard", userRoutes);

// // 404 handler
// app.use((req, res) => {
//     res.status(404).redirect('/signin');
// });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});