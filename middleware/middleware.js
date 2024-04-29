const jwt = require('jsonwebtoken')


module.exports = {
    authenticateToken: function (req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) {
            return res.status(401).json({ statusCode: 401, message: 'Unauthorized' })
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(401).json({ statusCode: 401, message: 'Unauthorized' })
            req.user = user
            next()
        })

    },
    jwtToSession: async (req, res, next) => {
        try {
            if (!req.session.user) {
                // Extract token from the Authorization header
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({ error: 'Authentication token is missing or invalid' });
                }
                const token = authHeader.split(' ')[1];

                // Verify the token
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
                    if (err) {
                        return res.status(403).json({ error: 'Failed to authenticate token' });
                    } else {
                        // Token is valid, set user data in the session
                        req.session.user = decodedToken.user; // Assuming your token payload has a 'user' property
                        next(); // Proceed to the next middleware
                    }
                });
            } else {
                // If session user already exists, proceed to the next middleware
                next();
            }
        } catch (error) {
            console.error('Error occurred in middleware:', error);
            next(error);
        }
    },


}