const rateLimit = require('express-rate-limit');

const createLimiter = () =>{

    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW) *60 *1000;
    const max = parseInt(process.env.RATE_LIMIT_MAX)


    return rateLimit({
        windowMs: windowMs,
        max:max,
        message: {
            success:false,
            error: `Too many requests, please try later after ${process.env.RATE_LIMIT_WINDOW} hours`
        },
        standardHeaders: true,
        legacyHeaders:false,
    })
}

module.exports = createLimiter;