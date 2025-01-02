const jwt = require('jsonwebtoken');

// Konfigurasi JWT
const JWT_SECRET = 'your_secret_key';

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user; // Simpan data user dari token
        next();
    });
};

module.exports = authenticateToken;
