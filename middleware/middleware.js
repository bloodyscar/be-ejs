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
            console.log("AWALAN", req.session.user)
            if (req.session.user === null || req.session.user === undefined) {
                // check jwt
                console.log("null 1", req.session);
                var token = req.cookies.auth;

                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, token_data) {
                    if (err) {
                        console.log("null error jwt", req.session);
                        console.log(err);
                        return res.status(401).json({ statusCode: 401, message: 'Token tidak sama' })
                    } else {
                        console.log("else req session user", token_data.user);
                        req.session.user = {
                            user_id: token_data.user.user_id,
                            role_id: token_data.user.role_id,
                            member_id: token_data.user.member_id,
                            username: token_data.user.username,
                            name: token_data.user.name,
                        };
                        next();
                    }
                });
            } else {
                console.log("req session tidak null")
                next();
            }
        } catch (error) {
            console.log("CATCH MIDDLEWARE")
            next(error);
        }
    },


}