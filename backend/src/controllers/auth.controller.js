const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    try {
        validate(req.body); 
        const { firstName, lastName, emailId, password, age, username } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            firstName,
            lastName,
            emailId,
            username,
            password: hashedPassword,
            age,
            role: 'user'
        });

        const token = user.getJwtToken();
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        
        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            token,
            user
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        // We need to explicitly select password because it's hidden by default in the model
        const user = await User.findOne({ emailId }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = user.getJwtToken();
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        
        res.status(200).json({
            success: true,
            message: "Logged In Successfully",
            token,
            user
        });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (token) {
            const payload = jwt.decode(token);
            if (payload && payload.exp) {
                // Add token to Redis blocklist until it expires
                await redisClient.set(`token:${token}`, 'Blocked');
                await redisClient.expireAt(`token:${token}`, payload.exp);
            }
        }

        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
        res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });
    } catch (err) {
        next(err);
    }
};

const adminRegister = async (req, res, next) => {
    try {
        validate(req.body); 
        const { firstName, lastName, emailId, password, age, username } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const adminUser = await User.create({
            firstName,
            lastName,
            emailId,
            username,
            password: hashedPassword,
            age,
            role: 'admin'
        });

        res.status(201).json({
            success: true,
            message: "Admin Registered Successfully"
        });
    } catch (err) {
        next(err);
    }
};

const deleteProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // This findByIdAndDelete triggers the findOneAndDelete middleware we added in user.js
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Clear their cookie as they are no longer a user
        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

        res.status(200).json({
            success: true,
            message: "Profile and all submissions deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

const getPublicProfile = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('username firstName lastName bio reputation problemSolved createdAt');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const publicData = {
            username: user.username,
            name: `${user.firstName} ${user.lastName}`,
            bio: user.bio,
            reputation: user.reputation,
            solvedCount: user.problemSolved.length,
            memberSince: user.createdAt
        };

        res.status(200).json({
            success: true,
            data: publicData
        });
    } catch (err) {
        next(err);
    }
};

const getLeaderboard = async (req, res, next) => {
    try {
        const topUsers = await User.find({ username: { $exists: true, $ne: null } })
            .sort({ reputation: -1 })
            .limit(50)
            .select('username firstName lastName bio reputation problemSolved');
        
        const leaderboard = topUsers.map(u => ({
            username: u.username,
            name: `${u.firstName} ${u.lastName}`,
            bio: u.bio,
            reputation: u.reputation,
            solvedCount: u.problemSolved.length
        }));

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (err) {
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile, getPublicProfile, getLeaderboard, getProfile };