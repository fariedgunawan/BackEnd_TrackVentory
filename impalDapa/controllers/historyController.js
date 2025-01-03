const createPool = require('../models/db');

// Controller untuk mendapatkan semua data history
exports.getHistory = async (req, res) => {
    const userId = req.user.id; // Mendapatkan user ID dari middleware autentikasi
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [history] = await pool.query(
            `SELECT h.product_name, h.stock_change, h.description, h.action_date
            FROM history h
            WHERE h.user_id = ?
            ORDER BY h.action_date DESC`,
            [userId]
        );

        if (history.length === 0) {
            return res.status(404).json({ message: 'No history found' });
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};
