const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const redisClient = require('./config/redis');

const authRouter = require("./routes/auth.routes");
const problemRouter = require("./routes/problem.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const initializeConnection = async () => {
    try {
        await Promise.all([
            connectDB(),
            redisClient.connect()
        ]);
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });

    } catch (err) {
        console.error("Initialization Error:", err);
        process.exit(1);
    }
};

initializeConnection();
