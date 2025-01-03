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
        
        //query ke history
        await pool.query(
            'INSERT INTO history (product_id,product_name, action, stock_change, user_id, description) VALUES (?, ?, ?, ?, ?, ?)',
            [result.insertId,name, 'ADD', quantity, userId, 'New product added']
        );

        await pool.query(
            `UPDATE users
             SET total_stock_in = total_stock_in + ?, total_product = total_product + ?
             WHERE id = ?`,
            [quantity,quantity, userId]
        );

        res.status(201).json({
            message: 'Product added successfully',
            productId: result.insertId
        });
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
        //Stock lama sebelum update
        const [existingProduct] = await pool.query(
            'SELECT quantity FROM products WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (existingProduct.length === 0) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        const oldQuantity = existingProduct[0].quantity;
        const stockChange = quantity - oldQuantity;

        //edit tabel product
        const [result] = await pool.query(
            'UPDATE products SET name = ?, category_id = ?, quantity = ?, last_input_date = ? WHERE id = ? AND user_id = ?',
            [name, category_id, quantity, last_input_date, id, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        if (stockChange > 0) {
            await pool.query(
                `UPDATE users
                 SET total_stock_in = total_stock_in + ?, total_product = total_product + ?
                 WHERE id = ?`,
                [stockChange,stockChange, userId]
            );
        } else if (stockChange < 0) {
            await pool.query(
                `UPDATE users
                 SET total_stock_out = total_stock_out + ?, total_product = total_product - ?
                 WHERE id = ?`,
                [Math.abs(stockChange), Math.abs(stockChange),userId]
            );
        }


        // Catat perubahan di tabel 'history'
        await pool.query(
            'INSERT INTO history (product_id,product_name, action, stock_change, user_id, description) VALUES (?,?, ?, ?, ?, ?)',
            [id, name,'EDIT', stockChange, userId, `Stock ${stockChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(stockChange)}`]
        );

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

        // Dapatkan stok sebelum dihapus
        const [existingProduct] = await pool.query(
            'SELECT name, quantity FROM products WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (existingProduct.length === 0) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

        const oldQuantity = existingProduct[0].quantity;
        const name = existingProduct[0].name;

        //hapus products
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or not authorized' });
        }

         // Update statistik user setelah produk dihapus
         await pool.query(
            `UPDATE users
             SET total_stock_out = total_stock_out + ?, total_product = total_product - ?
             WHERE id = ?`,
            [oldQuantity,oldQuantity, userId]
        );

        await pool.query(
            'INSERT INTO history (product_id, product_name,action, stock_change, user_id, description) VALUES (?, ? ,?, ?, ?, ?)',
            [id,name ,'DELETE', -oldQuantity, userId, `Product deleted, stock decreased by ${oldQuantity}`]
        );

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.getProductsByCategory = async (req, res) => {
    const userId = req.user.id;
    const { category } = req.query;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [products] = await pool.query(
            `SELECT p.id, p.name, c.name AS category, p.quantity, p.last_input_date
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = ? AND c.name = ?`,
            [userId, category]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found for the given category' });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.getUserProductStatsIn = async (req, res) => {
    const userId = req.user.id; 
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [stats] = await pool.query(
            `SELECT
                total_stock_in
            FROM users
            WHERE id = ?`,
            [userId]
        );

        if (stats.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.getUserProductTotal = async (req, res) => {
    const userId = req.user.id; 
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [stats] = await pool.query(
            `SELECT
                total_product
            FROM users
            WHERE id = ?`,
            [userId]
        );

        if (stats.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.getUserProductStatsOut = async (req, res) => {
    const userId = req.user.id;
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [stats] = await pool.query(
            `SELECT
                total_stock_out
            FROM users
            WHERE id = ?`,
            [userId]
        );

        if (stats.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.searchProductByName = async (req, res) => {
    const { name } = req.query; // Mengambil nama produk dari parameter query
    const userId = req.user.id; // Mengambil userId dari autentikasi (misalnya JWT)
    const pool = createPool(req.app.locals.dbConfig);

    try {
        if (!name) {
            return res.status(400).json({ message: 'Product name is required for search' });
        }

        // Query pencarian produk berdasarkan nama (case-insensitive)
        const [products] = await pool.query(
            `SELECT p.id, p.name, c.name AS category, p.quantity, p.last_input_date
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.user_id = ? AND p.name LIKE ?`,
            [userId, `%${name}%`] // Menggunakan wildcard untuk pencarian
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found matching the search term' });
        }

        res.json(products); // Mengembalikan daftar produk yang cocok
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};






