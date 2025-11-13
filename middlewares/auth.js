const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role, // Role added here
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access Denied: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach the decoded user data to the request
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role; // Assuming the user's role is stored in `req.user.role`
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access Denied: You do not have the required role' });
        }
        next();
    };
};


module.exports = {
    generateToken,
    authenticateToken,
    checkRole
}
