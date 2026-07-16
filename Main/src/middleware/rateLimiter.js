const redisClient = require('../config/redis');

/**
 * Creates a rate limiting middleware using Redis.
 * Prevents users from spamming endpoints (like code execution) to protect external APIs.
 * 
 * @param {number} waitTimeInSeconds - How long the user must wait between requests.
 * @param {string} prefix - Prefix for the Redis key (e.g., 'submit', 'run').
 */
const createRateLimiter = (waitTimeInSeconds, prefix) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id.toString();
            const key = `ratelimit:${prefix}:${userId}`;

            // Try to set the key if it doesn't exist (NX) with an expiration (EX)
            // SET key value EX seconds NX returns 'OK' if successful, or null if key exists
            const result = await redisClient.set(key, '1', {
                EX: waitTimeInSeconds,
                NX: true
            });

            if (!result) {
                // Key already exists, user must wait
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitTimeInSeconds} seconds before submitting again.`
                });
            }

            next();
        } catch (error) {
            console.error("Rate Limiter Error:", error);
            // If Redis fails, we should probably still allow the request to go through
            // so we don't break the entire app if the cache goes down.
            next();
        }
    };
};

module.exports = { createRateLimiter };
