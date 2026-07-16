const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

/**
 * Authentication and Authorization Middleware
 * @param {Array} roles - Array of allowed roles (e.g., ['admin'], ['user', 'admin'])
 * If no roles are provided, it simply authenticates any valid user.
 */
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            const { token } = req.cookies;
            
            if (!token) {
                return res.status(401).json({ success: false, message: "Token is not present" });
            }

            // Check if token is blacklisted in Redis
            const isBlocked = await redisClient.exists(`token:${token}`);
            if (isBlocked) {
                return res.status(401).json({ success: false, message: "Invalid or expired token" });
            }

            // Verify JWT
            const payload = jwt.verify(token, process.env.JWT_KEY);
            if (!payload._id) {
                return res.status(401).json({ success: false, message: "Invalid token structure" });
            }

            // Role based authorization
            if (roles.length > 0 && !roles.includes(payload.role)) {
                return res.status(403).json({ success: false, message: "Access Denied: Insufficient permissions" });
            }

            // Check if user exists in DB
            const user = await User.findById(payload._id);
            if (!user) {
                return res.status(404).json({ success: false, message: "User doesn't exist" });
            }

            // Attach user to request
            req.user = user;
            
            next();
        } catch (err) {
            return res.status(401).json({ success: false, message: "Authentication failed: " + err.message });
        }
    };
};

module.exports = authMiddleware;
