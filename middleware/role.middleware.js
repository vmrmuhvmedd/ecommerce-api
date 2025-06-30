const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Authentication required'
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 'fail',
                    message: 'Access denied: insufficient privileges'
                });
            }

            next();
        } catch (err) {
            console.error('Authorization error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    };
};

module.exports = authorize;