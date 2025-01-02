const createPool = require('../models/db');

exports.getProducts = async (req, res) => {
    const userId = req.user.id;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [products] = await pool.query(
            `SELECT p.id, p.name, c.name AS category, p.quantity, p.last_input_date
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = ?`,
            [userId]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.addProduct = async (req, res) => {
    const { name, category_id, quantity, last_input_date } = req.body;
    const userId = req.user.id;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, category_id, quantity, last_input_date, user_id) VALUES (?, ?, ?, ?, ?)',
            [name, category_id, quantity, last_input_date, userId]
        );
        res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.editProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category_id, quantity, last_input_date } = req.body;
    const userId = req.user.id;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [result] = await pool.query(
            'UPDATE products SET name = ?, category_id = ?, quantity = ?, last_input_date = ? WHERE id = ? AND user_id = ?',
            [name, category_id, quantity, last_input_date, id, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};
