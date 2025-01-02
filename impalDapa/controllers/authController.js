const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createPool = require('../models/db');

// Konfigurasi JWT
const JWT_SECRET = 'your_secret_key';
const JWT_EXPIRES_IN = '1d';

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};
