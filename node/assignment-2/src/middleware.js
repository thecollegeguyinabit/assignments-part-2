import jwt  from "jsonwebtoken";
import User from "./models/User.js";

export default async (req, res, next) => {
    try {
        // check if token exist in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.redirect("signin");
        }

        // get decoded token info
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // get info from database exclude password and check if user exist
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            res.clearCookie("token");
            return res.redirect("dashboard");
        }

        req.user = user;
        res.locals.user = user;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError" || error.message === "JWTError") {
            res.clearCookie("token");
            return res.redirect("signin");
        }
    }
}
