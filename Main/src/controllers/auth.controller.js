const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    try {
        validate(req.body); 
        const { firstName, lastName, emailId, password, age } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            role: 'user'
        });

        const token = user.getJwtToken();
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        
        res.status(201).json({
            success: true,
            message: "User Registered Successfully"
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
            message: "Logged In Successfully"
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
        const { firstName, lastName, emailId, password, age } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            role: 'admin'
        });

        const token = user.getJwtToken();
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        
        res.status(201).json({
            success: true,
            message: "Admin Registered Successfully"
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, logout, adminRegister };